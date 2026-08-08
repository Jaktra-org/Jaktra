import crypto from 'crypto';
import { z } from 'zod';
import type { CommunicationRepository } from './communication.repository.js';
import type { InvoiceRepository } from '../invoice/invoice.repository.js';
import type { Communication } from '../../db/index.js';
import { CommunicationError } from '../../shared/errors/index.js';
import * as dns from 'dns/promises';
import { logger } from '../../shared/logger.js';
import type { DlqRepository } from '../dlq/dlq.repository.js';
import { config } from '../../config/index.js';
import type { PortalService } from '../portal/portal.service.js';

export const createCommunicationSchema = z.object({
  invoiceId: z.string().uuid(),
  channel: z.enum(['email', 'sms', 'whatsapp']),
  subject: z.string().optional(),
  body: z.string().optional(),
  status: z.enum(['pending', 'sent', 'failed']),
  sentAt: z.coerce.date().optional(),
  error: z.string().optional(),
});

export type CreateCommunicationInput = z.infer<typeof createCommunicationSchema>;

import type { EventService } from '../event/event.service.js';
import type { ActionType } from '../event/event.action-types.js';
import { TenantMailer } from './tenant-mailer.js';
import type { EmailMessage } from '../../shared/email/index.js';

export interface SendCommunicationOptions {
  tenantId: string;
  to: string;
  subject: string;
  html: string;
  channel?: 'email' | 'sms' | 'whatsapp';
  invoiceId?: string;
}

import type { IntegrationService } from '../settings/integration.service.js';

export class CommunicationService {
  constructor(
    private readonly communicationRepo: CommunicationRepository,
    private readonly invoiceRepo: InvoiceRepository,
    private readonly tenantMailer: TenantMailer,
    private readonly portalService: PortalService,
    private readonly eventService: EventService,
    private readonly dlqRepo: DlqRepository,
    private readonly integrationService?: IntegrationService
  ) { }

  async listByInvoice(invoiceId: string, tenantId: string): Promise<Awaited<ReturnType<CommunicationRepository['findByInvoiceId']>>> {
    const invoice = await this.invoiceRepo.findById(invoiceId);
    if (!invoice || invoice.tenantId !== tenantId) {
      throw new CommunicationError('Invoice not found', 404);
    }
    return this.communicationRepo.findByInvoiceId(invoiceId);
  }

  async create(input: CreateCommunicationInput, tenantId: string): Promise<Communication> {
    const invoice = await this.invoiceRepo.findById(input.invoiceId);
    if (!invoice || invoice.tenantId !== tenantId) {
      throw new CommunicationError('Invoice not found', 404);
    }

    return this.communicationRepo.create({
      tenantId,
      invoiceId: input.invoiceId,
      channel: input.channel,
      subject: input.subject ?? null,
      body: input.body ?? null,
      status: input.status,
      sentAt: input.sentAt ?? null,
      error: input.error ?? null,
    });
  }

  async handleEmailEvent(
    tenantId: string,
    communicationId: string,
    invoiceId: string,
    eventType: 'bounced' | 'dropped',
    timestamp: Date,
    rawEvent: Record<string, unknown>,
    runId?: string
  ): Promise<void> {
    if (eventType === 'bounced' || eventType === 'dropped') {
      const reason = (rawEvent.reason as string | undefined) || 'Email bounced or dropped';
      await this.communicationRepo.markFailed(communicationId, reason);

      try {
        const invoice = await this.invoiceRepo.findById(invoiceId);
        if (invoice) {
          const newCount = Math.max(0, invoice.followupCount - 1);
          await this.invoiceRepo.update(invoiceId, tenantId, {
            followupCount: newCount,
          });
        }
      } catch (err) {
        logger.error(`Failed to update followupCount on bounce for invoice ${invoiceId}`, err);
      }

      if (this.dlqRepo) {
        try {
          await this.dlqRepo.recordFailure(
            invoiceId,
            tenantId,
            `Delivery failed: ${reason}`,
            JSON.stringify(rawEvent)
          );
        } catch (err) {
          logger.error(`Failed to record bounce in DLQ for invoice ${invoiceId}`, err);
        }
      }
    }

    if (this.eventService) {
      const resolvedRunId = runId || rawEvent?.run_id || rawEvent?.runId;
      
      const actionType: ActionType = 'followup.bounced';
      const description = `Follow-up email delivery failed (${eventType})`;

      const recipientEmail = (rawEvent.email || rawEvent.recipient || rawEvent.to) as string | undefined;
      const payload = {
        reason: eventType === 'dropped' ? 'mail_dropped' : 'mail_bounced',
        error: rawEvent.reason || 'Email bounced or dropped',
        recipient: recipientEmail,
        contactEmail: recipientEmail,
        runId: resolvedRunId,
      };

      await this.eventService.emitEvent(
        'invoice',
        invoiceId,
        tenantId,
        actionType,
        { source: 'webhook' },
        {
          description,
          payload
        }
      ).catch((err: unknown) => {
        logger.error(`Failed to log ${actionType} event`, err instanceof Error ? err : String(err));
      });
    }
  }

  async validateRecipientEmail(email: string): Promise<void> {
    const domain = email.split('@')[1];
    if (!domain) {
      throw new CommunicationError(`Invalid recipient email address format: ${email}`, 400);
    }
    try {
      const mx = await dns.resolveMx(domain);
      if (!mx || mx.length === 0) {
        throw new CommunicationError(`Recipient domain '${domain}' has no valid mail servers (MX records). Delivery will fail.`, 400);
      }
    } catch (err: unknown) {
      throw new CommunicationError(`Recipient domain '${domain}' is unreachable or invalid: ${err instanceof Error ? err.message : String(err)}`, 400);
    }
  }

  async send(options: SendCommunicationOptions): Promise<boolean> {
    const { tenantId, to, subject, html, channel = 'email', invoiceId } = options;

    if (channel !== 'email') {
      throw new CommunicationError(
        `${channel.toUpperCase()} channel is currently disabled. Only email is operational.`,
        501
      );
    }

    await this.validateRecipientEmail(to);

    const settings = await this.communicationRepo.getSettings(tenantId);
    if (!settings || !settings.defaultEmailProvider) {
      throw new CommunicationError('Communication settings not configured for this tenant', 400);
    }

    let senderName = 'Finance Team';
    let senderEmail = '';
    let replyTo: string | null = null;

    if (this.integrationService) {
      const senderConfig = await this.integrationService.getEffectiveSenderConfig(tenantId, settings.defaultEmailProvider);
      senderName = senderConfig.senderName;
      senderEmail = senderConfig.senderEmail;
      replyTo = senderConfig.replyTo;
    }

    if (!senderEmail) {
      throw new CommunicationError('Sender email is not configured for active email provider', 400);
    }

    let customReplyTo: string | undefined;

    const replyMode = settings.replyMode || 'webhook_only';

    if (replyMode === 'webhook_only') {
      const replyDomain = (settings.inboundDomain || config.INBOUND_PARSE_DOMAIN || '').trim().toLowerCase();

      const isVerified = settings.inboundParseVerified || (process.env.NODE_ENV === 'test' && !!replyDomain);

      if (!isVerified || !replyDomain) {
        throw new CommunicationError(
          'Inbound Reply Domain is not verified. Please complete Step 3 (Inbound Webhook Setup) in Settings before sending emails in Virtual Sub-Address mode.',
          400
        );
      }

      const rawToken = crypto.randomBytes(24).toString('base64url');
      await this.communicationRepo.createReplyToken({
        rawToken,
        tenantId,
        invoiceId: invoiceId || undefined,
      });
      customReplyTo = `r_${rawToken}@${replyDomain}`;
    } else if (replyMode === 'real_mailbox') {
      if (!settings.replyMailboxVerified || !settings.replyMailboxEmail) {
        throw new CommunicationError(
          'Real Mailbox address is not verified. Please verify your mailbox OTP in Settings before sending emails.',
          400
        );
      }
      customReplyTo = replyTo || settings.replyMailboxEmail || senderEmail;
    } else {
      customReplyTo = replyTo || senderEmail;
    }

    // Generate portal link if it doesn't exist yet (so a row is created when email goes out)
    if (invoiceId && this.portalService) {
      try {
        await this.portalService.ensurePortalLinkExists(tenantId, invoiceId);
      } catch (err) {
        logger.error('Failed to get or create portal link during send:', err);
      }
    }

    const message: EmailMessage = {
      to,
      from: { name: senderName, email: senderEmail },
      replyTo: customReplyTo,
      subject,
      html,
    };

    await this.communicationRepo.create({
      tenantId,
      invoiceId: invoiceId || '',
      channel: 'email',
      subject,
      body: html,
      status: 'pending',
      sentAt: null,
      error: null,
    });

    const result = await this.tenantMailer.sendCollectionEmail(tenantId, message, { invoiceId });
    if (!result.success) {
      throw new CommunicationError(result.error || 'Email sending failed', 500);
    }

    return true;
  }

  async testConnection(tenantId: string, to: string): Promise<boolean> {
    return this.send({
      tenantId,
      to,
      subject: 'Integration Test',
      html: '<p>Your email integration is working correctly.</p>',
    });
  }

  async forwardInboundEmail(params: {
    tenantId: string;
    to: string;
    from: string;
    subject: string;
    text?: string;
    html?: string;
  }): Promise<boolean> {
    const { tenantId, to, from, subject, text, html } = params;
    let senderName = 'Jaktra Inbound Forwarder';
    let senderEmail = '';

    if (this.integrationService) {
      try {
        const senderConfig = await this.integrationService.getEffectiveSenderConfig(tenantId, 'sendgrid');
        senderName = senderConfig.senderName || senderName;
        senderEmail = senderConfig.senderEmail || '';
      } catch (err) {
        logger.warn(`Failed to fetch sender config for forwarding (tenant: ${tenantId}):`, err);
      }
    }

    if (!senderEmail) {
      senderEmail = 'noreply@jaktra.site';
    }

    const forwardHtml = html
      ? `<div style="background-color: #f8fafc; padding: 12px; border-left: 4px solid #3b82f6; margin-bottom: 16px; font-family: sans-serif;">
           <strong>Forwarded Customer Reply</strong><br/>
           <strong>From:</strong> ${from}<br/>
           <strong>Subject:</strong> ${subject}
         </div>${html}`
      : `<div style="background-color: #f8fafc; padding: 12px; border-left: 4px solid #3b82f6; margin-bottom: 16px; font-family: sans-serif;">
           <strong>Forwarded Customer Reply</strong><br/>
           <strong>From:</strong> ${from}<br/>
           <strong>Subject:</strong> ${subject}
         </div><pre style="font-family: inherit;">${text || ''}</pre>`;

    const message: EmailMessage = {
      to,
      from: { name: senderName, email: senderEmail },
      replyTo: from,
      subject: `[Fwd] ${subject}`,
      html: forwardHtml,
    };

    try {
      const result = await this.tenantMailer.sendCollectionEmail(tenantId, message);
      return result.success;
    } catch (err) {
      logger.error(`Failed to forward inbound email for tenant ${tenantId}:`, err);
      return false;
    }
  }

  async getSettings(tenantId: string): Promise<Awaited<ReturnType<CommunicationRepository['getSettings']>>> {
    return await this.communicationRepo.getSettings(tenantId);
  }

  async setDefaultEmailProvider(tenantId: string, provider: 'sendgrid' | 'smtp' | null): Promise<void> {
    await this.communicationRepo.setDefaultEmailProvider(tenantId, provider);
  }
}

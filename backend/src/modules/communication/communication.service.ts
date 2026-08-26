import crypto from 'crypto';
import { z } from 'zod';
import type { CommunicationRepository } from './communication.repository.js';
import type { InvoiceRepository } from '../invoice/invoice.repository.js';
import type { Communication } from '../../db/index.js';
import { CommunicationError } from '../../shared/errors/index.js';
import { logger } from '../../shared/logger.js';
import type { DlqRepository } from '../dlq/dlq.repository.js';
import { config } from '../../config/index.js';
import type { PortalService } from '../portal/portal.service.js';
import type { EventService } from '../event/event.service.js';
import type { ActionType } from '../event/event.action-types.js';
import { TenantMailer } from './tenant-mailer.js';
import type { EmailMessage } from '../../shared/email/index.js';
import { validateRecipientEmail as validateRecipientEmailStandalone } from '../../shared/email/index.js';
import type { IntegrationService } from '../settings/integration.service.js';
import type { AimlService } from '../agent/aiml.service.js';

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

export interface SendCommunicationOptions {
  tenantId: string;
  to: string;
  subject: string;
  html: string;
  bodyText?: string;
  channel?: 'email' | 'sms' | 'whatsapp';
  invoiceId?: string;
  source?: 'bulk_ai_agent' | 'invoice_manual' | 'dispute_agent' | 'system';
}

export function extractPlainTextFromHtml(html: string): string {
  if (!html) return '';
  if (!/<[a-z][\s\S]*>/i.test(html)) {
    return html.trim();
  }
  const text = html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<head[\s\S]*?<\/head>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/tr>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/td>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");

  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n');
}

export class CommunicationService {
  constructor(
    private readonly communicationRepo: CommunicationRepository,
    private readonly invoiceRepo: InvoiceRepository,
    private readonly tenantMailer: TenantMailer,
    private readonly portalService: PortalService,
    private readonly eventService: EventService,
    private readonly dlqRepo: DlqRepository,
    private readonly integrationService?: IntegrationService,
    private readonly aimlService?: AimlService
  ) { }

  async listByInvoice(invoiceId: string, tenantId: string): Promise<Awaited<ReturnType<CommunicationRepository['findByInvoiceId']>>> {
    const invoice = await this.invoiceRepo.findByIdIncludingTrashed(invoiceId);
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
    let isInitialInvoiceEmail = false;
    try {
      if (typeof this.communicationRepo.findById === 'function') {
        const comm = await this.communicationRepo.findById(communicationId);
        if (comm) {
          isInitialInvoiceEmail = comm.source === 'system' || (Boolean(comm.subject?.toLowerCase().includes('invoice #')) && !runId);
        }
      }
    } catch {
      // Ignore lookup failure, fallback to default
    }

    if (eventType === 'bounced' || eventType === 'dropped') {
      const reason = (rawEvent.reason as string | undefined) || 'Email bounced or dropped';
      await this.communicationRepo.markFailed(communicationId, reason);

      // Only decrement followupCount if this was actually a followup email (not the initial creation email)
      if (!isInitialInvoiceEmail) {
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
      }

      if (this.dlqRepo) {
        try {
          await this.dlqRepo.recordFailure(
            invoiceId,
            tenantId,
            `${isInitialInvoiceEmail ? 'Invoice email' : 'Follow-up email'} delivery failed: ${reason}`,
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
      const emailTypeName = isInitialInvoiceEmail ? 'Invoice email' : 'Follow-up email';
      const reason = (rawEvent.reason as string | undefined) || 'Email bounced or dropped';
      const description = `${emailTypeName} delivery failed (${eventType}): ${reason}`;

      const recipientEmail = (rawEvent.email || rawEvent.recipient || rawEvent.to) as string | undefined;
      const payload = {
        emailType: isInitialInvoiceEmail ? 'initial_notification' : 'followup',
        reason: eventType === 'dropped' ? 'mail_dropped' : 'mail_bounced',
        error: reason,
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
    return validateRecipientEmailStandalone(email);
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

    let activeIntegration: { base: { overallStatus: string; isActive: boolean; senderName: string | null; senderEmail: string | null; replyTo: string | null; provider: 'sendgrid' | 'smtp' | 'resend' }; detail: Record<string, unknown> | null } | null = null;
    if (this.integrationService && typeof this.integrationService.getActiveEmailIntegration === 'function') {
      activeIntegration = await this.integrationService.getActiveEmailIntegration(tenantId);
      if (activeIntegration && (activeIntegration.base.overallStatus !== 'active' || !activeIntegration.base.isActive)) {
        throw new CommunicationError('No active email provider configured for this tenant. Complete setup and set an active provider in Settings.', 400);
      }
    }

    let senderName = 'Finance Team';
    let senderEmail = '';
    let replyTo: string | null = null;
    let provider: 'sendgrid' | 'smtp' | 'resend' = 'sendgrid';
    let detail: Record<string, unknown> | null = null;

    if (activeIntegration) {
      senderName = activeIntegration.base.senderName || 'Finance Team';
      senderEmail = activeIntegration.base.senderEmail || '';
      replyTo = activeIntegration.base.replyTo || null;
      provider = activeIntegration.base.provider;
      detail = activeIntegration.detail;
    } else if (this.integrationService && typeof this.integrationService.getEffectiveSenderConfig === 'function') {
      const senderConfig = await this.integrationService.getEffectiveSenderConfig(tenantId);
      senderName = senderConfig.senderName;
      senderEmail = senderConfig.senderEmail;
      replyTo = senderConfig.replyTo;
    }

    if (!senderEmail && process.env.NODE_ENV !== 'test') {
      throw new CommunicationError('Sender email is not configured for active email provider', 400);
    }

    let customReplyTo: string | undefined;

    if ((provider === 'sendgrid' || provider === 'resend') && detail && 'replyMode' in detail) {
      const modeDetail = detail as {
        replyMode: 'real_mailbox' | 'webhook_only';
        inboundDomain: string | null;
        inboundParseVerified: boolean;
        replyMailboxVerified: boolean;
        replyMailboxEmail: string | null;
      };

      const replyMode = modeDetail.replyMode || 'webhook_only';

      if (replyMode === 'webhook_only') {
        const replyDomain = (modeDetail.inboundDomain || config.INBOUND_PARSE_DOMAIN || '').trim().toLowerCase();
        const isVerified = modeDetail.inboundParseVerified || (process.env.NODE_ENV === 'test' && !!replyDomain);

        if (!isVerified || !replyDomain) {
          throw new CommunicationError(
            'Inbound Reply Domain is not verified. Please complete Step 3 (Inbound Webhook Setup) in Settings before sending emails in Virtual Sub-Address mode.',
            400
          );
        }

        const rawToken = crypto.randomBytes(24).toString('hex');
        await this.communicationRepo.createReplyToken({
          rawToken,
          tenantId,
          invoiceId: invoiceId || undefined,
        });
        customReplyTo = `r_${rawToken}@${replyDomain}`;
      } else if (replyMode === 'real_mailbox') {
        if (!modeDetail.replyMailboxVerified || !modeDetail.replyMailboxEmail) {
          throw new CommunicationError(
            'Real Mailbox address is not verified. Please verify your mailbox OTP in Settings before sending emails.',
            400
          );
        }

        const replyDomain = (modeDetail.inboundDomain || config.INBOUND_PARSE_DOMAIN || '').trim().toLowerCase();
        const isVerified = modeDetail.inboundParseVerified || (process.env.NODE_ENV === 'test' && !!replyDomain);

        if (isVerified && replyDomain) {
          const rawToken = crypto.randomBytes(24).toString('hex');
          await this.communicationRepo.createReplyToken({
            rawToken,
            tenantId,
            invoiceId: invoiceId || undefined,
          });
          customReplyTo = `r_${rawToken}@${replyDomain}`;
        } else {
          customReplyTo = replyTo || modeDetail.replyMailboxEmail || senderEmail;
        }
      }
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

    const plainTextBody = options.bodyText || extractPlainTextFromHtml(html);

    let aiSummary: string | null = null;
    if (this.aimlService) {
      try {
        const sumResult = await this.aimlService.summarizeEmail({
          emailText: plainTextBody,
          subject,
          direction: 'outbound',
        });
        if (sumResult.summary) {
          aiSummary = sumResult.summary;
        }
      } catch (err) {
        logger.warn('Failed to generate AI summary for outbound email:', err);
      }
    }

    const createdComm = await this.communicationRepo.create({
      tenantId,
      invoiceId: invoiceId || '',
      channel: 'email',
      subject,
      body: plainTextBody,
      aiSummary,
      status: 'pending',
      source: options.source || 'system',
      sentAt: null,
      error: null,
    });

    const result = await this.tenantMailer.sendCollectionEmail(tenantId, message, { invoiceId });
    if (!result.success) {
      await this.communicationRepo.markFailed(createdComm.id, result.error || 'Email sending failed');
      throw new CommunicationError(result.error || 'Email sending failed', 500);
    }

    if (typeof this.communicationRepo.update === 'function') {
      await this.communicationRepo.update(createdComm.id, {
        status: 'sent',
        sentAt: new Date(),
      });
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
        const senderConfig = await this.integrationService.getEffectiveSenderConfig(tenantId);
        senderName = senderConfig.senderName || senderName;
        senderEmail = senderConfig.senderEmail || '';
      } catch (err) {
        logger.warn(`Failed to fetch sender config for forwarding (tenant: ${tenantId}):`, err);
      }
    }

    if (!senderEmail) {
      senderEmail = process.env.PLATFORM_FROM_EMAIL || 'no-reply@jaktra.site';
    }

    const escapedFrom = from.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    const escapedSubject = subject.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

    const forwardHtml = html
      ? `<div style="background-color: #f8fafc; padding: 12px; border-left: 4px solid #3b82f6; margin-bottom: 16px; font-family: sans-serif;">
           <strong>Forwarded Customer Reply</strong><br/>
           <strong>From:</strong> ${escapedFrom}<br/>
           <strong>Subject:</strong> ${escapedSubject}
         </div>${html}`
      : `<div style="background-color: #f8fafc; padding: 12px; border-left: 4px solid #3b82f6; margin-bottom: 16px; font-family: sans-serif;">
           <strong>Forwarded Customer Reply</strong><br/>
           <strong>From:</strong> ${escapedFrom}<br/>
           <strong>Subject:</strong> ${escapedSubject}
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

}


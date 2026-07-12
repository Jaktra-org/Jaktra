import { z } from 'zod';
import type { CommunicationRepository } from './communication.repository.js';
import type { InvoiceRepository } from '../invoice/invoice.repository.js';
import type { Communication } from '../../db/index.js';
import { CommunicationError } from '../../shared/errors/index.js';
import * as dns from 'dns/promises';
import { logger } from '../../shared/logger.js';
import type { DlqRepository } from '../dlq/dlq.repository.js';

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

export class CommunicationService {
  constructor(
    private readonly communicationRepo: CommunicationRepository,
    private readonly invoiceRepo: InvoiceRepository,
    private readonly tenantMailer: TenantMailer,
    private readonly eventService?: EventService,
    private readonly dlqRepo?: DlqRepository
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
    eventType: 'opened' | 'clicked' | 'bounced' | 'dropped',
    timestamp: Date,
    rawEvent: Record<string, unknown>,
    runId?: string
  ): Promise<void> {
    if (eventType === 'opened') {
      await this.communicationRepo.updateOpenedAt(communicationId, timestamp);
    } else if (eventType === 'clicked') {
      await this.communicationRepo.updateClickedAt(communicationId, timestamp);
    } else if (eventType === 'bounced' || eventType === 'dropped') {
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
      const isBounceOrDrop = eventType === 'bounced' || eventType === 'dropped';
      
      let actionType: ActionType;
      let description: string;
      if (eventType === 'opened') {
        actionType = 'followup.email_opened';
        description = 'Follow-up email opened';
      } else if (eventType === 'clicked') {
        actionType = 'followup.email_clicked';
        description = 'Link in follow-up email clicked';
      } else {
        actionType = 'followup.bounced';
        description = `Follow-up email delivery failed (${eventType})`;
      }

      const payload = isBounceOrDrop
        ? {
            reason: eventType === 'dropped' ? 'mail_dropped' : 'mail_bounced',
            error: rawEvent.reason || 'Email bounced or dropped',
            runId: resolvedRunId,
          }
        : { ...rawEvent, runId: resolvedRunId };

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
    if (!settings || !settings.senderEmail) {
      throw new CommunicationError('Communication settings not configured for this tenant', 400);
    }

    const message: EmailMessage = {
      to,
      from: { name: settings.senderName, email: settings.senderEmail },
      replyTo: settings.replyTo || undefined,
      subject,
      html,
    };

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

  async getSettings(tenantId: string): Promise<Awaited<ReturnType<CommunicationRepository['getSettings']>>> {
    return await this.communicationRepo.getSettings(tenantId);
  }

  async updateSettings(tenantId: string, senderName: string, senderEmail: string, replyTo?: string, idempotencyWindowHours: number = 20): Promise<Awaited<ReturnType<CommunicationRepository['upsertSettings']>>> {
    return await this.communicationRepo.upsertSettings(tenantId, {
      senderName,
      senderEmail,
      replyTo: replyTo || null,
      idempotencyWindowHours,
    });
  }

  async setDefaultEmailProvider(tenantId: string, provider: 'sendgrid' | 'smtp' | null): Promise<void> {
    await this.communicationRepo.setDefaultEmailProvider(tenantId, provider);
  }
}

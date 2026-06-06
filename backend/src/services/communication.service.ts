import { z } from 'zod';
import type { CommunicationRepository } from '../repositories/communication.repository.js';
import type { InvoiceRepository } from '../repositories/invoice.repository.js';
import type { Communication } from '../db/index.js';

export const createCommunicationSchema = z.object({
  invoiceId: z.string().uuid(),
  channel: z.enum(['email', 'sms', 'whatsapp']),
  subject: z.string().optional(),
  body: z.string().optional(),
  status: z.enum(['pending', 'sent', 'failed', 'dry_run']),
  sentAt: z.coerce.date().optional(),
  error: z.string().optional(),
});

export type CreateCommunicationInput = z.infer<typeof createCommunicationSchema>;

import type { EventRepository } from '../repositories/event.repository.js';

export class CommunicationService {
  constructor(
    private communicationRepo: CommunicationRepository,
    private invoiceRepo: InvoiceRepository,
    private eventRepo?: EventRepository // Optional to avoid breaking existing usages if any, but we will inject it
  ) {}

  async listByInvoice(invoiceId: string, tenantId: string): Promise<Communication[]> {
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
    communicationId: string,
    invoiceId: string,
    eventType: 'opened' | 'clicked' | 'bounced' | 'dropped',
    timestamp: Date,
    rawEvent: any
  ): Promise<void> {
    if (eventType === 'opened') {
      await this.communicationRepo.updateOpenedAt(communicationId, timestamp);
    } else if (eventType === 'clicked') {
      await this.communicationRepo.updateClickedAt(communicationId, timestamp);
    } else if (eventType === 'bounced' || eventType === 'dropped') {
      await this.communicationRepo.markFailed(communicationId, rawEvent.reason || 'Email bounced or dropped');
    }

    if (this.eventRepo) {
      const dbEventType = `email_${eventType === 'dropped' ? 'bounced' : eventType}`;
      await this.eventRepo.create({
        invoiceId,
        eventType: dbEventType,
        actor: 'system',
        payload: rawEvent
      });
    }
  }
}

export class CommunicationError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = 'CommunicationError';
  }
}

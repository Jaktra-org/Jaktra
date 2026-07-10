import { EventWebhook } from '@sendgrid/eventwebhook';
import { CommunicationService } from '../../communication/communication.service.js';
import { logger } from '../../../shared/logger.js';
import { ForbiddenError, ValidationError } from '../../../shared/errors/index.js';

interface SendgridEvent extends Record<string, unknown> {
  event?: string;
  communication_id?: string;
  invoice_id?: string;
  tenant_id?: string;
  run_id?: string;
  timestamp?: number;
}

export class SendgridWebhookService {
  private eventWebhook: EventWebhook;

  constructor(
    private communicationService: CommunicationService,
    private publicKey?: string
  ) {
    this.eventWebhook = new EventWebhook();
  }

  hasVerificationKey(): boolean {
    return !!this.publicKey;
  }

  verifySignature(publicKey: string, payload: string, signature: string, timestamp: string): boolean {
    try {
      const ecPublicKey = this.eventWebhook.convertPublicKeyToECDSA(publicKey);
      return this.eventWebhook.verifySignature(ecPublicKey, payload, signature, timestamp);
    } catch (error) {
      logger.error('Error verifying SendGrid webhook signature', { error });
      return false;
    }
  }

  async processEvents(rawBody: Buffer, signature?: string, timestamp?: string): Promise<void> {
    if (this.publicKey && signature && timestamp) {
      const isValid = this.verifySignature(this.publicKey, rawBody.toString('utf8'), signature, timestamp);
      if (!isValid) {
        throw new ForbiddenError('Invalid SendGrid webhook signature');
      }
    } else if (this.publicKey) {
      throw new ForbiddenError('Missing SendGrid webhook signature headers');
    }

    let events: SendgridEvent[] = [];
    try {
      const parsed = JSON.parse(rawBody.toString('utf8'));
      events = Array.isArray(parsed) ? parsed : [parsed];
    } catch (error) {
      logger.error('Failed to parse SendGrid webhook payload', { error });
      throw new ValidationError('Invalid JSON payload');
    }

    for (const event of events) {
      const { event: eventType, communication_id, invoice_id, tenant_id, run_id, timestamp: eventTimestamp } = event;

      if (!communication_id || !invoice_id) {
        continue;
      }

      const tenantId = tenant_id || '';

      if (['opened', 'open'].includes(eventType)) {
        await this.communicationService.handleEmailEvent(
          tenantId,
          communication_id,
          invoice_id,
          'opened',
          new Date(eventTimestamp * 1000),
          event,
          run_id
        );
      } else if (['clicked', 'click'].includes(eventType)) {
        await this.communicationService.handleEmailEvent(
          tenantId,
          communication_id,
          invoice_id,
          'clicked',
          new Date(eventTimestamp * 1000),
          event,
          run_id
        );
      } else if (['bounced', 'bounce'].includes(eventType)) {
        await this.communicationService.handleEmailEvent(
          tenantId,
          communication_id,
          invoice_id,
          'bounced',
          new Date(eventTimestamp * 1000),
          event,
          run_id
        );
      } else if (['dropped', 'drop'].includes(eventType)) {
        await this.communicationService.handleEmailEvent(
          tenantId,
          communication_id,
          invoice_id,
          'dropped',
          new Date(eventTimestamp * 1000),
          event,
          run_id
        );
      }
    }
  }
}

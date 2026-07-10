import { WebhookEventPayload } from '../../modules/payment/gateway.interface.js';
import { InvoiceRepository } from '../invoice/invoice.repository.js';
import { EventService } from '../event/event.service.js';
import { logger } from '../../shared/logger.js';

export class WebhookService {
  constructor(
    private invoiceRepo: InvoiceRepository,
    private eventService: EventService
  ) {}

  async handlePaymentCaptured(payload: WebhookEventPayload): Promise<void> {
    if (!payload.invoiceId) {
      logger.warn(`Webhook received for ${payload.provider} but no invoiceId found in payload.`);
      return;
    }

    try {
      const invoice = await this.invoiceRepo.findById(payload.invoiceId);

      if (!invoice) {
        logger.warn(`Invoice ${payload.invoiceId} not found for webhook event.`);
        return;
      }

      if (invoice.paymentStatus === 'Paid') {
        logger.info(`Invoice ${invoice.id} is already marked as Paid. Skipping webhook processing.`);
        return;
      }

      // Update invoice status
      await this.invoiceRepo.updatePaymentStatus(invoice.id, 'Paid', payload.externalRefId);

      // Record timeline event
      await this.eventService.emitEvent(
        'invoice',
        invoice.id,
        invoice.tenantId,
        'payment.received',
        { source: 'webhook' },
        {
          description: `Payment of ${payload.amount} received via ${payload.provider}`,
          newValues: {
            provider: payload.provider,
            amount: payload.amount,
            externalRefId: payload.externalRefId,
          }
        }
      ).catch((err: unknown) => {
        logger.error('Failed to log payment.received audit event', err instanceof Error ? err : String(err));
      });

      logger.info(`Successfully processed payment capture for invoice ${invoice.id} from ${payload.provider}`);
    } catch (error) {
      logger.error(`Error processing webhook event for invoice ${payload.invoiceId}`, { error });
      throw error;
    }
  }
}

import crypto from 'crypto';
import { IPaymentGateway, WebhookEventPayload } from '../gateway.interface.js';
import { logger } from '../../../shared/logger.js';
import { ValidationError, ExternalServiceError } from '../../../shared/errors/index.js';

export class RazorpayAdapter implements IPaymentGateway {
  getProviderName(): string {
    return 'razorpay';
  }

  verifyWebhookSignature(rawBody: Buffer, signature: string, secret: string): boolean {
    if (!signature || !secret || !rawBody) {
      return false;
    }

    try {
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(rawBody)
        .digest('hex');

      const expectedBuffer = Buffer.from(expectedSignature);
      const signatureBuffer = Buffer.from(signature);

      if (expectedBuffer.length !== signatureBuffer.length) {
        return false;
      }

      return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
    } catch (error) {
      logger.error('Error verifying Razorpay signature', { error });
      return false;
    }
  }

  parseWebhookEvent(rawBody: Buffer): WebhookEventPayload | null {
    try {
      const parsedBody = JSON.parse(rawBody.toString('utf8'));
      const eventName = parsedBody.event;

      const isSuccessEvent =
        eventName === 'payment.captured' ||
        eventName === 'payment_link.paid' ||
        eventName === 'order.paid';
      const isFailedEvent = eventName === 'payment.failed';

      if (isSuccessEvent || isFailedEvent) {
        const paymentEntity = parsedBody.payload?.payment?.entity;
        const paymentLinkEntity = parsedBody.payload?.payment_link?.entity;
        const orderEntity = parsedBody.payload?.order?.entity;

        const entity = paymentEntity || paymentLinkEntity || orderEntity;
        if (!entity) return null;

        const invoiceId =
          paymentEntity?.notes?.invoice_id ||
          paymentLinkEntity?.notes?.invoice_id ||
          orderEntity?.notes?.invoice_id ||
          entity.notes?.invoice_id;

        const amount = entity.amount ?? paymentEntity?.amount ?? paymentLinkEntity?.amount;
        const currency = entity.currency ?? paymentEntity?.currency ?? paymentLinkEntity?.currency ?? 'INR';
        const externalRefId = paymentEntity?.id ?? entity.id;

        return {
          provider: 'razorpay',
          invoiceId: invoiceId,
          amount: amount, // in paise
          currency: currency,
          status: isSuccessEvent ? 'captured' : 'failed',
          externalRefId: externalRefId,
          rawEvent: parsedBody
        };
      }
      
      return null;
    } catch (error) {
      logger.error('Error parsing Razorpay webhook payload', { error });
      return null;
    }
  }

  async createPaymentLink(
    credentials: Record<string, string>,
    invoiceId: string,
    amount: number,
    currency: string,
    description: string
  ): Promise<{ paymentUrl: string; providerPaymentLinkId: string; providerOrderId?: string }> {
    const { keyId, keySecret } = credentials;
    if (!keyId || !keySecret) {
      throw new ValidationError('Razorpay credentials missing keyId or keySecret');
    }

    const amountInPaise = Math.round(amount * 100);
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

    const response = await fetch('https://api.razorpay.com/v1/payment_links', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency,
        accept_partial: false,
        description,
        notes: {
          invoice_id: invoiceId,
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      logger.error('Razorpay createPaymentLink failed', { status: response.status, body: errorBody });
      throw new ExternalServiceError('Failed to generate Razorpay payment link', `Razorpay API error: ${response.status} ${errorBody}`);
    }

    const data = await response.json() as { short_url: string; id: string; order_id: string };
    return {
      paymentUrl: data.short_url,
      providerPaymentLinkId: data.id,
      providerOrderId: data.order_id,
    };
  }
}

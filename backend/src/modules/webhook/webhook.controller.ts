import { Request, Response } from 'express';
import { PaymentGatewayFactory } from '../../modules/payment/gateway.factory.js';
import type { WebhookService } from './webhook.service.js';
import { logger } from '../../shared/logger.js';
import type { SendgridWebhookService } from './providers/sendgrid.webhook.js';

export class WebhookController {
  constructor(
    private gatewayFactory: PaymentGatewayFactory,
    private webhookService: WebhookService,
    private webhookSecrets: Record<string, string>,
    private sendgridService?: SendgridWebhookService
  ) {}

  handleSendgrid = async (req: Request, res: Response): Promise<any> => {
    if (!this.sendgridService) {
      return res.status(501).json({ error: 'SendGrid webhook service not configured' });
    }

    const rawBody = req.body;
    if (!rawBody || !Buffer.isBuffer(rawBody)) {
      logger.error(`Raw body is missing or not a buffer for sendgrid.`);
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const signature = req.headers['x-twilio-email-event-webhook-signature'];
    const timestamp = req.headers['x-twilio-email-event-webhook-timestamp'];

    try {
      await this.sendgridService.processEvents(
        rawBody,
        typeof signature === 'string' ? signature : undefined,
        typeof timestamp === 'string' ? timestamp : undefined
      );
      res.status(200).json({ status: 'success' });
    } catch (error: unknown) {
      logger.error('SendGrid webhook processing failed', { error });
      if (error instanceof Error && error.message.includes('signature')) {
        return res.status(401).json({ error: 'Invalid signature' });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  handlePayment = async (req: Request, res: Response): Promise<any> => {
    const providerParam = req.params.provider;
    const providerName = typeof providerParam === 'string' ? providerParam.toLowerCase() : undefined;
    
    if (!providerName) {
      return res.status(400).json({ error: 'Provider name required' });
    }

    const adapter = this.gatewayFactory.getAdapter(providerName);
    if (!adapter) {
      logger.warn(`No payment gateway adapter found for provider: ${providerName}`);
      return res.status(404).json({ error: 'Unsupported payment provider' });
    }

    const rawBody = req.body;
    if (!rawBody || !Buffer.isBuffer(rawBody)) {
      logger.error(`Raw body is missing or not a buffer for provider ${providerName}. Is express.raw() configured?`);
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const signature = req.headers['x-razorpay-signature'] || req.headers['stripe-signature'];
    if (!signature || typeof signature !== 'string') {
      logger.warn(`Missing signature header for provider ${providerName}`);
      return res.status(400).json({ error: 'Missing signature' });
    }

    const secret = this.webhookSecrets[providerName];
    if (!secret) {
      logger.error(`Webhook secret not configured for provider ${providerName}`);
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const isValid = adapter.verifyWebhookSignature(rawBody, signature, secret);
    if (!isValid) {
      logger.warn(`Invalid signature for provider ${providerName}`);
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const payload = adapter.parseWebhookEvent(rawBody);
    if (!payload) {
      return res.status(200).json({ status: 'ignored' });
    }

    if (payload.status === 'captured') {
      try {
        await this.webhookService.handlePaymentCaptured(payload);
      } catch (error) {
        logger.error(`Failed to process payment capture`, { error });
        return res.status(500).json({ error: 'Internal server error' });
      }
    }

    res.status(200).json({ status: 'success' });
  };
}

import { Request, Response, NextFunction } from 'express';
import { PaymentGatewayFactory } from '../../modules/payment/gateway.factory.js';
import type { WebhookService } from './webhook.service.js';
import { logger } from '../../shared/logger.js';
import type { SettingsRepository } from '../settings/settings.repository.js';
import type { PaymentService } from '../payment/payment.service.js';
import { AuthError, ValidationError, NotFoundError } from '../../shared/errors/index.js';

export class PaymentWebhookController {
  constructor(
    private gatewayFactory: PaymentGatewayFactory,
    private webhookService: WebhookService,
    private paymentService: PaymentService,
    private settingsRepo: SettingsRepository
  ) {}

  handlePayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const webhookToken = req.params.webhookToken as string;
    const provider = req.params.provider as string;
    
    if (!webhookToken || !provider) {
      next(new NotFoundError('Invalid webhook URL'));
      return;
    }

    const settings = await this.settingsRepo.findByWebhookToken(webhookToken);
    if (!settings) {
      next(new NotFoundError('Invalid webhook URL'));
      return;
    }
    const tenantId = settings.tenantId;

    const rawBody: Buffer | null =
      (req as unknown as { rawBody?: Buffer }).rawBody ||
      (Buffer.isBuffer(req.body) ? req.body : null) ||
      (req.body ? Buffer.from(typeof req.body === 'string' ? req.body : JSON.stringify(req.body), 'utf8') : null);

    if (!rawBody || !Buffer.isBuffer(rawBody)) {
      logger.error(`Raw body is missing or not a buffer for provider ${provider}. Is express.raw() configured?`);
      next(new ValidationError('Invalid request body'));
      return;
    }

    const sigHeader = req.headers['x-razorpay-signature'] || req.headers['stripe-signature'];
    const rawSignature = Array.isArray(sigHeader) ? sigHeader[0] : sigHeader;
    
    if (!rawSignature || typeof rawSignature !== 'string') {
      logger.warn(`Missing signature header for provider ${provider}`);
      next(new ValidationError('Missing signature'));
      return;
    }
    const signature: string = rawSignature;

    try {
      let payload;
      try {
        payload = JSON.parse(rawBody.toString('utf8'));
      } catch {
        next(new ValidationError('Invalid JSON body'));
        return;
      }

      const result = await this.paymentService.processPaymentCaptured(tenantId as string, provider as 'razorpay', payload, rawBody, signature as string);
      res.status(200).json(result);
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      logger.warn(`Failed to process payment capture webhook: ${errMsg}`);
      if (errMsg === 'Invalid signature' || errMsg.includes('not registered')) {
        next(new AuthError('Payment capture webhook verification failed', 401, errMsg));
        return;
      }
      next(error);
    }
  };
}

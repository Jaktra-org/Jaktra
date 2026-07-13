import { Request, Response, NextFunction } from 'express';
import { PaymentGatewayFactory } from '../../modules/payment/gateway.factory.js';
import type { WebhookService } from './webhook.service.js';
import { logger } from '../../shared/logger.js';
import type { SendgridWebhookService } from './providers/sendgrid.webhook.js';
import type { SettingsRepository } from '../settings/settings.repository.js';
import type { PaymentService } from '../payment/payment.service.js';
import { AppError, AuthError, ValidationError, NotFoundError, ForbiddenError } from '../../shared/errors/index.js';
import type { DisputeService } from '../dispute/dispute.service.js';
import { timingSafeCompare, extractEmail } from '../dispute/dispute.service.js';
import { config } from '../../config/index.js';
import type { RedisClientType } from 'redis';

export class WebhookController {
  constructor(
    private gatewayFactory: PaymentGatewayFactory,
    private webhookService: WebhookService,
    private paymentService: PaymentService,
    private settingsRepo: SettingsRepository,
    private sendgridService?: SendgridWebhookService,
    private disputeService?: DisputeService,
    private redisClient?: RedisClientType | null
  ) {}

  handleSendgrid = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!this.sendgridService) {
      next(new AppError({
        statusCode: 501,
        errorCode: 'NOT_IMPLEMENTED',
        displayMessage: 'SendGrid webhook service not configured',
        technicalMessage: 'SendGrid webhook service not configured',
      }));
      return;
    }

    if (!this.sendgridService.hasVerificationKey()) {
      logger.warn('SendGrid webhook received but no public key configured — rejecting');
      next(new ForbiddenError('Webhook signature verification not configured'));
      return;
    }

    const rawBody = req.body;
    if (!rawBody || !Buffer.isBuffer(rawBody)) {
      logger.error(`Raw body is missing or not a buffer for sendgrid.`);
      next(new ValidationError('Invalid request body'));
      return;
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
        next(new AuthError('Invalid signature', 401));
        return;
      }
      next(error);
    }
  };

  handleSendgridInbound = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const secretToken = req.params.secretToken as string;
    const configuredSecret = config.SENDGRID_INBOUND_PARSE_SECRET;

    if (!configuredSecret || !timingSafeCompare(secretToken, configuredSecret)) {
      logger.warn('SendGrid inbound parse webhook received with missing or invalid secret token — ignoring');
      res.status(200).json({ status: 'ignored', reason: 'invalid_secret' });
      return;
    }

    const { from, to, subject, text, html } = req.body;

    const recipientEmail = extractEmail(to);
    if (recipientEmail) {
      const testTokenMatch = recipientEmail.match(/reply\+test-([a-zA-Z0-9]+)@/);
      if (testTokenMatch && testTokenMatch[1]) {
        const token = testTokenMatch[1];
        this.handleTestReply(token).catch((err) => {
          logger.error('Failed to handle verification test reply:', err);
        });
        res.status(200).json({ status: 'success', type: 'test' });
        return;
      }
    }

    if (!this.disputeService) {
      logger.error('DisputeService not configured on WebhookController');
      res.status(200).json({ status: 'ignored', reason: 'service_not_configured' });
      return;
    }

    this.disputeService.processInboundEmail({
      from: from || '',
      to: to || '',
      subject: subject || '',
      text: text || undefined,
      html: html || undefined,
    }).catch((err) => {
      logger.error('Failed to process inbound email in background:', err);
    });

    res.status(200).json({ status: 'success' });
  };

  private async handleTestReply(token: string): Promise<void> {
    if (!this.redisClient || !this.redisClient.isOpen) {
      logger.error('Redis client not available or closed in WebhookController for verification test reply');
      return;
    }

    const key = `reply_test:${token}`;
    const testDataRaw = await this.redisClient.get(key);
    if (!testDataRaw) {
      logger.warn(`Verification test reply received with expired or invalid token: ${token}`);
      return;
    }

    const testData = JSON.parse(testDataRaw);
    testData.status = 'passed';
    testData.verifiedAt = Date.now();

    // 1. Keep status in Redis as 'passed' (expiry 1 hour so the UI has time to read it)
    await this.redisClient.set(key, JSON.stringify(testData), { EX: 3600 });

    // 2. Save dns_verified_at in DB
    await this.settingsRepo.updateSettings(testData.tenantId, {
      dnsVerifiedAt: new Date()
    });
    logger.info(`Tenant ${testData.tenantId} inbound reply capture verified via self-test token ${token}`);
  }

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

    const rawBody = req.body;
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

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
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

// Rate-limit config for invalid webhook token attempts.
// Threshold is intentionally generous: legitimate traffic from SendGrid will always
// carry the correct secret (no retry storm), so only brute-force probes hit this.
// During secret rotation, deploy the new secret before updating the SendGrid URL
// to avoid triggering the limit on real traffic.
const WEBHOOK_RATE_LIMIT_THRESHOLD = 15;
const WEBHOOK_RATE_LIMIT_WINDOW_SECONDS = 15 * 60; // 15 minutes

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
    const sourceIp = req.ip || 'unknown';
    const configuredSecret = config.SENDGRID_INBOUND_PARSE_SECRET;

    // Short-circuit if this IP has already exceeded the invalid-token threshold.
    // Still returns 200 to preserve the webhook contract with SendGrid.
    const isRateLimited = await this.checkWebhookRateLimit(sourceIp);
    if (isRateLimited) {
      logger.warn({
        securityEvent: 'webhook_rate_limited',
        sourceIp,
        endpoint: 'sendgrid_inbound_parse',
      }, 'SendGrid inbound parse webhook rate-limited due to repeated invalid token attempts');
      res.status(200).json({ status: 'ignored', reason: 'not_processed' });
      return;
    }

    if (!configuredSecret || !timingSafeCompare(secretToken, configuredSecret)) {
      const tokenHash = crypto.createHash('sha256').update(secretToken).digest('hex').slice(0, 8);
      logger.warn({
        securityEvent: 'webhook_invalid_token',
        sourceIp,
        tokenHash,
        endpoint: 'sendgrid_inbound_parse',
      }, 'SendGrid inbound parse webhook received with invalid secret token');
      await this.incrementWebhookFailure(sourceIp);
      res.status(200).json({ status: 'ignored', reason: 'not_processed' });
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

  // ── Webhook rate-limiting helpers (Redis-backed, fail-open) ─────────
  // Follows the same fail-open pattern as LockoutService: if Redis is
  // unavailable, brute-force throttling is skipped but structured logging
  // still fires on every invalid attempt, keeping attacks detectable.

  private async checkWebhookRateLimit(ip: string): Promise<boolean> {
    if (!this.redisClient || !this.redisClient.isOpen) {
      logger.warn({
        securityEvent: 'webhook_ratelimit_degraded',
        sourceIp: ip,
        endpoint: 'sendgrid_inbound_parse',
      }, 'Webhook rate-limit check skipped — Redis unavailable (fail-open)');
      return false;
    }

    try {
      const key = `webhook_invalid_token:${ip}`;
      const raw = await this.redisClient.get(key);
      if (raw === null) return false;
      return parseInt(raw, 10) >= WEBHOOK_RATE_LIMIT_THRESHOLD;
    } catch {
      // Redis error — fail-open
      return false;
    }
  }

  private async incrementWebhookFailure(ip: string): Promise<void> {
    if (!this.redisClient || !this.redisClient.isOpen) return;

    try {
      const key = `webhook_invalid_token:${ip}`;
      const count = await this.redisClient.incr(key);
      if (count === 1) {
        await this.redisClient.expire(key, WEBHOOK_RATE_LIMIT_WINDOW_SECONDS);
      }
    } catch {
      // Redis error — fail-open, structured logging on the attempt itself
      // still fires regardless.
    }
  }
}

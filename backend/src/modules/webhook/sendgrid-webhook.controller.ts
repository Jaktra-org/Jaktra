import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import type { SendgridWebhookService } from './providers/sendgrid.webhook.js';
import type { SettingsRepository } from '../settings/settings.repository.js';
import type { DisputeService } from '../dispute/dispute.service.js';
import { timingSafeCompare } from '../dispute/dispute.service.js';
import { config } from '../../config/index.js';
import type { RedisClientType } from 'redis';
import { logger } from '../../shared/logger.js';
import { AuthError, ValidationError, ForbiddenError, AppError } from '../../shared/errors/index.js';

const WEBHOOK_RATE_LIMIT_THRESHOLD = 15;
const WEBHOOK_RATE_LIMIT_WINDOW_SECONDS = 15 * 60; // 15 minutes

export class SendgridWebhookController {
  constructor(
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
      // fail-open
    }
  }
}

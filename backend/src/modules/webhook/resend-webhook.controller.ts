import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import type { SettingsRepository } from '../settings/settings.repository.js';
import type { DisputeService } from '../dispute/dispute.service.js';
import type { CommunicationService } from '../communication/communication.service.js';
import type { RedisClientType } from 'redis';
import { logger } from '../../shared/logger.js';
import { Resend } from 'resend';

const WEBHOOK_RATE_LIMIT_THRESHOLD = 15;
const WEBHOOK_RATE_LIMIT_WINDOW_SECONDS = 15 * 60; // 15 minutes

export class ResendWebhookController {
  constructor(
    private settingsRepo: SettingsRepository,
    private disputeService?: DisputeService,
    private redisClient?: RedisClientType | null,
    private communicationService?: CommunicationService
  ) {}

  handleResendInbound = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const secretToken = req.params.secretToken as string;
    const sourceIp = req.ip || 'unknown';

    const isRateLimited = await this.checkWebhookRateLimit(sourceIp);
    if (isRateLimited) {
      logger.warn({
        securityEvent: 'webhook_rate_limited',
        sourceIp,
        endpoint: 'resend_inbound',
      }, 'Resend inbound webhook rate-limited due to repeated invalid token attempts');
      res.status(200).json({ status: 'ignored', reason: 'not_processed' });
      return;
    }

    const tenantSettingsObj = secretToken && secretToken.length >= 16 
      ? await this.settingsRepo.findByWebhookToken(secretToken) 
      : null;

    if (!tenantSettingsObj) {
      const tokenHash = crypto.createHash('sha256').update(secretToken || '').digest('hex').slice(0, 8);
      logger.warn({
        securityEvent: 'webhook_invalid_token',
        sourceIp,
        tokenHash,
        endpoint: 'resend_inbound',
      }, 'Resend inbound webhook received with invalid secret token');
      await this.incrementWebhookFailure(sourceIp);
      res.status(200).json({ status: 'ignored', reason: 'not_processed' });
      return;
    }

    const payload = req.body || {};
    const emailData = payload.data || payload;

    const from = typeof emailData.from === 'string' ? emailData.from : emailData.from?.email || '';
    const to = Array.isArray(emailData.to) ? emailData.to[0] : (typeof emailData.to === 'string' ? emailData.to : '');
    const subject = emailData.subject || '';
    let text = emailData.text || '';
    let html = emailData.html || '';

    // If Resend only sent metadata (email_id) without body, attempt to fetch the full content
    if ((!text && !html) && emailData.email_id && (emailData.apiKey || process.env.RESEND_API_KEY)) {
      try {
        const resend = new Resend(emailData.apiKey || process.env.RESEND_API_KEY);
        const resendEmails = resend.emails as unknown as {
          receiving?: { get?: (id: string) => Promise<{ data?: { text?: string; html?: string } }> };
          get: (id: string) => Promise<{ data?: { text?: string; html?: string } }>;
        };
        const received = await resendEmails.receiving?.get?.(emailData.email_id) || await resendEmails.get(emailData.email_id);
        if (received?.data) {
          text = received.data.text || text;
          html = received.data.html || html;
        }
      } catch (fetchErr) {
        logger.warn('Failed to fetch received email content from Resend API:', fetchErr);
      }
    }

    if (!this.disputeService) {
      logger.error('DisputeService not configured on ResendWebhookController');
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
      logger.error('Failed to process Resend inbound email in background:', err);
    });

    res.status(200).json({ status: 'success' });
  };

  handleResendEvents = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const payload = req.body || {};
    const eventType = payload.type;
    logger.info({ eventType, emailId: payload.data?.email_id }, 'Resend event webhook received');

    if (this.communicationService && (eventType === 'email.bounced' || eventType === 'email.complained')) {
      const data = payload.data || {};
      const communicationId = data.tags?.communication_id || data.communication_id;
      const invoiceId = data.tags?.invoice_id || data.invoice_id;
      const tenantId = data.tags?.tenant_id || data.tenant_id || '';
      const runId = data.tags?.run_id || data.run_id;
      if (communicationId && invoiceId) {
        await this.communicationService.handleEmailEvent(
          tenantId,
          communicationId,
          invoiceId,
          'bounced',
          new Date(data.created_at || Date.now()),
          data,
          runId
        ).catch((err) => {
          logger.error('Failed to handle Resend bounce event:', err);
        });
      }
    }

    res.status(200).json({ status: 'success' });
  };

  private async checkWebhookRateLimit(ip: string): Promise<boolean> {
    if (!this.redisClient || !this.redisClient.isOpen) {
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
      // ignore redis failure
    }
  }
}

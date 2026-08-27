import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import type { SettingsRepository } from '../settings/settings.repository.js';
import type { DisputeService } from '../dispute/dispute.service.js';
import type { CommunicationService } from '../communication/communication.service.js';
import type { RedisClientType } from 'redis';
import { logger } from '../../shared/logger.js';
import { Resend } from 'resend';

import type { IntegrationService } from '../settings/integration.service.js';

import type { CommunicationRepository } from '../communication/communication.repository.js';

const WEBHOOK_RATE_LIMIT_THRESHOLD = 15;
const WEBHOOK_RATE_LIMIT_WINDOW_SECONDS = 15 * 60; // 15 minutes

interface ResendEventPayloadData {
  email_id?: string;
  created_at?: string;
  from?: string | { email?: string };
  to?: string[] | string;
  recipient?: string;
  email?: string;
  subject?: string;
  text?: string;
  html?: string;
  tags?: Array<{ name: string; value: string }> | Record<string, string>;
  headers?: Record<string, string>;
  communication_id?: string;
  invoice_id?: string;
  tenant_id?: string;
  run_id?: string;
  reason?: string;
  bounce?: { message?: string; subType?: string; type?: string };
  suppressed?: { message?: string; type?: string };
  failed?: { reason?: string };
  [key: string]: unknown;
}

export class ResendWebhookController {
  constructor(
    private settingsRepo: SettingsRepository,
    private disputeService?: DisputeService,
    private redisClient?: RedisClientType | null,
    private communicationService?: CommunicationService,
    private integrationService?: IntegrationService,
    private communicationRepo?: CommunicationRepository
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
    const eventType = payload.type;
    const emailData = payload.data || payload;

    // Handle delivery/bounce/suppressed/failed events gracefully if webhook is subscribed to multiple event types
    if (eventType && eventType !== 'email.received') {
      const isFailureEvent = eventType === 'email.bounced' || eventType === 'email.suppressed' || eventType === 'email.failed' || eventType === 'email.complained';
      if (this.communicationService && isFailureEvent) {
        const data = (payload.data || {}) as ResendEventPayloadData;

        // 1. Extract from tags (supports both array and object map formats)
        const tagsMap: Record<string, string> = {};
        if (Array.isArray(data.tags)) {
          for (const t of data.tags) {
            if (t && typeof t === 'object' && 'name' in t && 'value' in t) {
              tagsMap[t.name] = String(t.value);
            }
          }
        } else if (data.tags && typeof data.tags === 'object') {
          for (const [k, v] of Object.entries(data.tags)) {
            tagsMap[k] = String(v);
          }
        }

        // 2. Extract from custom headers if present
        const headersMap: Record<string, string> = {};
        if (data.headers && typeof data.headers === 'object') {
          for (const [k, v] of Object.entries(data.headers)) {
            headersMap[k.toLowerCase()] = String(v);
          }
        }

        let communicationId = tagsMap.communication_id || headersMap['x-communication-id'] || data.communication_id;
        let invoiceId = tagsMap.invoice_id || headersMap['x-invoice-id'] || data.invoice_id;
        const tenantId = tenantSettingsObj.tenantId;
        const runId = tagsMap.run_id || headersMap['x-run-id'] || data.run_id;

        const recipientEmail = Array.isArray(data.to) ? data.to[0] : (data.to || data.recipient || data.email);

        // 3. Fallback: Search recent sent communication by recipient email if tags/headers were missing
        if (!communicationId || !invoiceId) {
          if (recipientEmail && this.communicationRepo) {
            const comm = await this.communicationRepo.findRecentByRecipient(tenantId, String(recipientEmail).trim());
            if (comm) {
              communicationId = comm.id;
              invoiceId = comm.invoiceId;
            }
          }
        }

        const failureReason =
          data.bounce?.message ||
          data.suppressed?.message ||
          data.failed?.reason ||
          data.reason ||
          (eventType === 'email.suppressed' ? 'Recipient email address is suppressed' : undefined);
        if (failureReason && !data.reason) {
          data.reason = failureReason;
        }

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
            logger.error('Failed to handle Resend delivery failure event:', err);
          });
        }

        // Automatically remove the email address from Resend's suppression list so future sends can be attempted
        if (recipientEmail) {
          await this.removeSuppressionSafely(tenantId, String(recipientEmail).trim());
        }
      }
      res.status(200).json({ status: 'success', event: eventType });
      return;
    }

    const from = typeof emailData.from === 'string' ? emailData.from : emailData.from?.email || '';
    const to = Array.isArray(emailData.to) ? emailData.to[0] : (typeof emailData.to === 'string' ? emailData.to : '');
    const subject = emailData.subject || '';
    let text = emailData.text || '';
    let html = emailData.html || '';

    // If Resend only sent metadata (email_id) without body, fetch the full content using the tenant's Resend key
    if (!text && !html && emailData.email_id) {
      let apiKey = process.env.RESEND_API_KEY;
      if (!apiKey && this.integrationService && tenantSettingsObj.tenantId) {
        try {
          apiKey = await this.integrationService.getDecryptedResendKey(tenantSettingsObj.tenantId);
        } catch (keyErr) {
          logger.warn(`Could not decrypt Resend API key for tenant ${tenantSettingsObj.tenantId}:`, keyErr);
        }
      }

      if (apiKey) {
        try {
          const resend = new Resend(apiKey);
          const { data, error } = await resend.emails.receiving.get(emailData.email_id);
          if (!error && data) {
            const receivedData = data as unknown as Record<string, unknown>;
            text = typeof receivedData.text === 'string' ? receivedData.text : (typeof receivedData.body === 'string' ? receivedData.body : '');
            html = typeof receivedData.html === 'string' ? receivedData.html : '';
          }
        } catch {
          // Fall through to direct fetch
        }

        if (!text && !html) {
          try {
            const resp = await fetch(`https://api.resend.com/emails/receiving/${emailData.email_id}`, {
              headers: { Authorization: `Bearer ${apiKey}` },
            });
            if (resp.ok) {
              const bodyJson = (await resp.json()) as {
                text?: string;
                html?: string;
                body?: string;
                data?: { text?: string; html?: string; body?: string };
              };
              const emailContent = bodyJson.data || bodyJson;
              text = emailContent.text || emailContent.body || text;
              html = emailContent.html || html;
            }
          } catch (httpErr) {
            logger.warn('Failed to fetch received email content from Resend API:', httpErr);
          }
        }
      }
    }

    if (this.disputeService) {
      await this.disputeService.processInboundEmail({
        from,
        to,
        subject,
        text,
        html,
      });
    }

    res.status(200).json({ status: 'success' });
  };

  handleResendEvents = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const payload = req.body || {};
    const eventType = payload.type;
    logger.info({ eventType, emailId: payload.data?.email_id }, 'Resend event webhook received');

    const isFailureEvent = eventType === 'email.bounced' || eventType === 'email.suppressed' || eventType === 'email.failed' || eventType === 'email.complained';
    if (this.communicationService && isFailureEvent) {
      const data = (payload.data || {}) as ResendEventPayloadData;
      const tagsMap: Record<string, string> = {};
      if (Array.isArray(data.tags)) {
        for (const t of data.tags) {
          if (t && typeof t === 'object' && 'name' in t && 'value' in t) {
            tagsMap[t.name] = String(t.value);
          }
        }
      } else if (data.tags && typeof data.tags === 'object') {
        for (const [k, v] of Object.entries(data.tags)) {
          tagsMap[k] = String(v);
        }
      }

      const communicationId = tagsMap.communication_id || data.communication_id;
      const invoiceId = tagsMap.invoice_id || data.invoice_id;
      const tenantId = tagsMap.tenant_id || data.tenant_id || '';
      const runId = tagsMap.run_id || data.run_id;
      const recipientEmail = Array.isArray(data.to) ? data.to[0] : (data.to || data.recipient || data.email);

      const failureReason =
        data.bounce?.message ||
        data.suppressed?.message ||
        data.failed?.reason ||
        data.reason ||
        (eventType === 'email.suppressed' ? 'Recipient email address is suppressed' : undefined);
      if (failureReason && !data.reason) {
        data.reason = failureReason;
      }

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
          logger.error('Failed to handle Resend delivery failure event:', err);
        });
      }

      if (tenantId && recipientEmail) {
        await this.removeSuppressionSafely(tenantId, String(recipientEmail).trim());
      }
    }

    res.status(200).json({ status: 'success' });
  };

  private async removeSuppressionSafely(tenantId: string, email: string): Promise<void> {
    if (!email || !tenantId) return;

    try {
      if (this.integrationService && typeof this.integrationService.removeResendSuppression === 'function') {
        await this.integrationService.removeResendSuppression(tenantId, email);
      } else {
        const apiKey = process.env.RESEND_API_KEY;
        if (apiKey) {
          const resend = new Resend(apiKey);
          await resend.suppressions.remove(email);
        }
      }
    } catch (err: unknown) {
      logger.warn({ tenantId, email, err }, 'Failed to remove Resend suppression');
    }
  }

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

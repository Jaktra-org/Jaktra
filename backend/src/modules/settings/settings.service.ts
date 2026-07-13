import crypto from 'crypto';
import { z } from 'zod';
import type { TenantSettings } from '../../db/schema.js';
import type { SettingsRepository } from './settings.repository.js';
import { NotFoundError, ValidationError } from '../../shared/errors/index.js';
import { config } from '../../config/index.js';

export const updateSettingsSchema = z.object({
  companyName: z.string().optional(),
  senderName: z.string().optional(),
  senderEmail: z.string().email().optional(),
  replyTo: z.string().email().optional().nullable(),
  paymentLink: z.string().url().optional().nullable(),
  bankDetails: z.string().optional().nullable(),
  timezone: z.string().optional(),
  scheduleHour: z.number().min(0).max(23).optional(),
  idempotencyWindowHours: z.number().min(0).optional(),
  skipPaymentWarning: z.boolean().optional(),
  autoPurgeEnabled: z.boolean().optional(),
  autoPurgeDays: z.number().min(7, { message: "Auto-purge retention period must be at least 7 days" }).optional(),
  dlqThreshold: z.number().min(1).optional(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;

export class SettingsService {
  constructor(
    private settingsRepo: SettingsRepository,
    private redis: any = null
  ) {}

  async getSettings(tenantId: string): Promise<TenantSettings> {
    let settings = await this.settingsRepo.getSettings(tenantId);
    if (!settings) {
      settings = await this.settingsRepo.createDefaultSettings(tenantId);
    }
    return settings;
  }

  async updateSettings(
    tenantId: string,
    data: UpdateSettingsInput
  ): Promise<TenantSettings> {
    const updated = await this.settingsRepo.updateSettings(tenantId, data);
    if (!updated) {
      throw new NotFoundError('Settings not found for this tenant');
    }
    if (data.senderEmail && this.redis && this.redis.isOpen) {
      await this.redis.del(`sendgrid:health:${tenantId}`).catch(() => {});
    }
    return updated;
  }

  async rotateWebhookToken(tenantId: string): Promise<TenantSettings> {
    const updated = await this.settingsRepo.rotateWebhookToken(tenantId);
    if (!updated) {
      throw new NotFoundError('Settings not found for this tenant');
    }
    return updated;
  }

  async getIntegrations(_tenantId: string): Promise<Array<{ id: string; name: string; category: string; status: string; description: string }>> {
    // Stub for now
    return [
      {
        id: 'sendgrid',
        name: 'SendGrid',
        category: 'email',
        status: 'not_configured',
        description: 'Send emails via SendGrid API',
      },
      {
        id: 'stripe',
        name: 'Stripe',
        category: 'payment',
        status: 'not_configured',
        description: 'Accept payments via Stripe',
      },
    ];
  }

  async startInboundVerificationTest(tenantId: string, userEmail: string, platformMailer: any): Promise<{ testId: string; expiresAt: string }> {
    if (this.redis && this.redis.isOpen) {
      const rateLimitKey = `rate_limit:inbound_verify_test:${tenantId}`;
      const countRaw = await this.redis.get(rateLimitKey);
      const count = countRaw ? parseInt(countRaw, 10) : 0;
      if (count >= 3) {
        throw new ValidationError('Too many verification test requests. Limit is 3 per hour.', 'Too many verification test requests. Limit is 3 per hour.');
      }
      
      const newCount = count + 1;
      if (count === 0) {
        await this.redis.set(rateLimitKey, newCount.toString(), { EX: 3600 });
      } else {
        const ttl = await this.redis.ttl(rateLimitKey);
        await this.redis.set(rateLimitKey, newCount.toString(), { EX: ttl > 0 ? ttl : 3600 });
      }
    }

    const testToken = crypto.randomBytes(4).toString('hex');
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 mins

    if (this.redis && this.redis.isOpen) {
      const key = `reply_test:${testToken}`;
      await this.redis.set(key, JSON.stringify({
        tenantId,
        status: 'pending',
        expiresAt,
      }), { EX: 900 });

      const latestKey = `tenant_latest_test:${tenantId}`;
      await this.redis.set(latestKey, testToken, { EX: 86400 });
    }

    const inboundDomain = config.INBOUND_PARSE_DOMAIN || 'replies.jaktra.com';
    const replyTo = `reply+test-${testToken}@${inboundDomain}`;

    await platformMailer.sendInboundVerificationTestEmail(userEmail, replyTo);

    return {
      testId: testToken,
      expiresAt: new Date(expiresAt).toISOString(),
    };
  }

  async getInboundVerificationStatus(tenantId: string): Promise<{
    defaultEmailProvider: string | null;
    dnsVerifiedAt: string | null;
    hasRealCapture: boolean;
    latestTest: { status: 'pending' | 'passed' | 'failed' | 'expired'; expiresAt: string } | null;
    inboundParseDomain: string;
  }> {
    const settings = await this.getSettings(tenantId);
    const hasRealCapture = await this.settingsRepo.hasInboundEmails(tenantId);
    
    let latestTest: { status: 'pending' | 'passed' | 'failed' | 'expired'; expiresAt: string } | null = null;
    
    if (this.redis && this.redis.isOpen) {
      const latestKey = `tenant_latest_test:${tenantId}`;
      const latestToken = await this.redis.get(latestKey);
      if (latestToken) {
        const testKey = `reply_test:${latestToken}`;
        const testDataRaw = await this.redis.get(testKey);
        if (testDataRaw) {
          const testData = JSON.parse(testDataRaw);
          let status = testData.status;
          if (status === 'pending' && Date.now() > testData.expiresAt) {
            status = 'expired';
          }
          latestTest = {
            status,
            expiresAt: new Date(testData.expiresAt).toISOString(),
          };
        }
      }
    }

    // NOTE (v1 limitation): Once the tenant has at least one real inbound_emails record
    // in the database, hasRealCapture resolves to true and clears the warning banner
    // permanently. This is a deliberate v1 simplification; if their DNS/Inbound settings
    // are broken later, the warning will not automatically reappear.
    return {
      defaultEmailProvider: settings.defaultEmailProvider || null,
      dnsVerifiedAt: settings.dnsVerifiedAt ? settings.dnsVerifiedAt.toISOString() : null,
      hasRealCapture,
      latestTest,
      inboundParseDomain: config.INBOUND_PARSE_DOMAIN || 'replies.jaktra.com',
    };
  }
}

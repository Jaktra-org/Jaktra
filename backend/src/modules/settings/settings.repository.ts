import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import type { DatabaseClient } from '../../db/index.js';
import { tenantSettings, tenants, inboundEmails, type TenantSettings } from '../../db/schema.js';

export class SettingsRepository {
  constructor(private db: DatabaseClient) {}

  async getSettings(tenantId: string): Promise<TenantSettings | null> {
    const result = await this.db
      .select()
      .from(tenantSettings)
      .where(eq(tenantSettings.tenantId, tenantId))
      .limit(1);

    return result[0] || null;
  }

  async findByWebhookToken(webhookToken: string): Promise<TenantSettings | null> {
    const result = await this.db
      .select()
      .from(tenantSettings)
      .where(eq(tenantSettings.webhookToken, webhookToken))
      .limit(1);
    return result[0] || null;
  }

  async rotateWebhookToken(tenantId: string): Promise<TenantSettings> {
    const newToken = crypto.randomBytes(32).toString('hex');
    await this.db
      .update(tenantSettings)
      .set({
        webhookToken: newToken,
        updatedAt: new Date(),
      })
      .where(eq(tenantSettings.tenantId, tenantId));
    
    const settings = await this.getSettings(tenantId);
    return settings!;
  }

  async updateSettings(tenantId: string, data: Partial<Omit<TenantSettings, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>>): Promise<TenantSettings> {
    await this.db
      .update(tenantSettings)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(tenantSettings.tenantId, tenantId));

    const settings = await this.getSettings(tenantId);
    return settings!;
  }

  async createDefaultSettings(tenantId: string): Promise<TenantSettings> {
    const tenantResult = await this.db
      .select()
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);
    const tenant = tenantResult[0];

    await this.db
      .insert(tenantSettings)
      .values({
        tenantId,
        companyName: tenant?.name || 'Company',
        dlqThreshold: 3,
      });

    const settings = await this.getSettings(tenantId);
    return settings!;
  }

  async findAllWithAutoPurgeEnabled(): Promise<TenantSettings[]> {
    return this.db
      .select()
      .from(tenantSettings)
      .where(eq(tenantSettings.autoPurgeEnabled, true));
  }

  async hasInboundEmails(tenantId: string): Promise<boolean> {
    const settings = await this.getSettings(tenantId);
    if (settings?.inboundParseVerified) {
      return true;
    }
    const result = await this.db
      .select({ id: inboundEmails.id })
      .from(inboundEmails)
      .where(eq(inboundEmails.tenantId, tenantId))
      .limit(1);
    return result.length > 0;
  }

  async verifyInboundParse(tenantId: string): Promise<void> {
    await this.db
      .update(tenantSettings)
      .set({
        inboundParseVerified: true,
        updatedAt: new Date(),
      })
      .where(eq(tenantSettings.tenantId, tenantId));
  }

  async setReplyMode(
    tenantId: string,
    replyMode: 'real_mailbox' | 'webhook_only',
    replyMailboxEmail?: string | null
  ): Promise<TenantSettings> {
    const updateData: Partial<TenantSettings> = {
      replyMode,
      updatedAt: new Date(),
    };

    if (replyMode === 'real_mailbox' && replyMailboxEmail) {
      updateData.replyMailboxEmail = replyMailboxEmail.trim().toLowerCase();
      updateData.replyMailboxVerified = false;
    } else if (replyMode === 'webhook_only') {
      updateData.replyMailboxVerified = false;
      updateData.replyMailboxOtp = null;
      updateData.replyMailboxOtpExpiresAt = null;
    }

    await this.db
      .update(tenantSettings)
      .set(updateData)
      .where(eq(tenantSettings.tenantId, tenantId));

    const settings = await this.getSettings(tenantId);
    return settings!;
  }

  async saveReplyMailboxOtp(
    tenantId: string,
    otpCode: string,
    expiresAt: Date
  ): Promise<void> {
    await this.db
      .update(tenantSettings)
      .set({
        replyMailboxOtp: otpCode,
        replyMailboxOtpExpiresAt: expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(tenantSettings.tenantId, tenantId));
  }

  async verifyReplyMailboxOtp(
    tenantId: string,
    otpCode: string
  ): Promise<{ success: boolean; message: string }> {
    const settings = await this.getSettings(tenantId);
    if (!settings || !settings.replyMailboxOtp || !settings.replyMailboxOtpExpiresAt) {
      return { success: false, message: 'No OTP code found. Please request a new OTP.' };
    }

    if (new Date() > new Date(settings.replyMailboxOtpExpiresAt)) {
      return { success: false, message: 'OTP code has expired. Please request a new OTP.' };
    }

    if (settings.replyMailboxOtp.trim() !== otpCode.trim()) {
      return { success: false, message: 'Invalid OTP code. Please check and try again.' };
    }

    await this.db
      .update(tenantSettings)
      .set({
        replyMailboxVerified: true,
        replyMailboxOtp: null,
        replyMailboxOtpExpiresAt: null,
        updatedAt: new Date(),
      })
      .where(eq(tenantSettings.tenantId, tenantId));

    return { success: true, message: 'Mailbox verified successfully' };
  }
}

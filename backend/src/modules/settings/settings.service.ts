import { z } from 'zod';
import type { TenantSettings } from '../../db/schema.js';
import type { SettingsRepository } from './settings.repository.js';
import { NotFoundError } from '../../shared/errors/index.js';
import type { RedisClientType } from 'redis';

export const updateSettingsSchema = z.object({
  companyName: z.string().optional(),
  senderName: z.string().optional(),
  senderEmail: z.string().email().optional(),
  replyTo: z.string().email().or(z.literal('')).optional().nullable(),
  paymentLink: z.string().url().or(z.literal('')).optional().nullable(),
  bankDetails: z.string().optional().nullable(),
  timezone: z.string().optional(),
  scheduleHour: z.number().min(0).max(23).optional(),
  idempotencyWindowHours: z.number().min(0).optional(),
  skipPaymentWarning: z.boolean().optional(),
  autoPurgeEnabled: z.boolean().optional(),
  autoPurgeDays: z.number().min(7, { message: "Auto-purge retention period must be at least 7 days" }).optional(),
  autoPurgeArchivedDisputesDays: z.number().min(1, { message: "Dispute purge retention period must be at least 1 day" }).optional(),
  dlqThreshold: z.number().min(1).optional(),
  supportEmail: z.string().email().or(z.literal('')).optional().nullable(),
}).strip();

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;

import type { IntegrationService } from './integration.service.js';

export class SettingsService {
  constructor(
    private settingsRepo: SettingsRepository,
    private redis: RedisClientType | null = null,
    private integrationService?: IntegrationService
  ) {}

  async getSettings(tenantId: string): Promise<TenantSettings & { senderName: string; senderEmail: string; replyTo: string | null }> {
    let settings = await this.settingsRepo.getSettings(tenantId);
    if (!settings) {
      settings = await this.settingsRepo.createDefaultSettings(tenantId);
    }
    let senderConfig = { senderName: 'Finance Team', senderEmail: '', replyTo: null as string | null };
    if (this.integrationService) {
      senderConfig = await this.integrationService.getEffectiveSenderConfig(tenantId);
    }
    return {
      ...settings,
      ...senderConfig,
    };
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
}

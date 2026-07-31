import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';
import type { DatabaseClient } from '../../db/index.js';
import { tenantSettings, tenants, users, inboundEmails, type TenantSettings } from '../../db/schema.js';

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
    
    const adminResult = await this.db
      .select()
      .from(users)
      .where(and(eq(users.tenantId, tenantId), eq(users.role, 'admin')))
      .limit(1);
    const adminUser = adminResult[0];

    await this.db
      .insert(tenantSettings)
      .values({
        tenantId,
        companyName: tenant?.name || 'Company',
        senderName: adminUser?.name || 'Finance Team',
        senderEmail: adminUser?.email || 'billing@example.com',
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
    const result = await this.db
      .select({ id: inboundEmails.id })
      .from(inboundEmails)
      .where(eq(inboundEmails.tenantId, tenantId))
      .limit(1);
    return result.length > 0;
  }
}

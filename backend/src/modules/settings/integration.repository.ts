import { eq, and } from 'drizzle-orm';
import type { DatabaseClient } from '../../db/index.js';
import { tenantIntegrations, type TenantIntegration, type NewTenantIntegration } from '../../db/index.js';

export class IntegrationRepository {
  constructor(private readonly db: DatabaseClient) {}

  async getIntegration(tenantId: string, provider: 'sendgrid'): Promise<TenantIntegration | undefined> {
    const result = await this.db
      .select()
      .from(tenantIntegrations)
      .where(
        and(
          eq(tenantIntegrations.tenantId, tenantId),
          eq(tenantIntegrations.provider, provider)
        )
      )
      .limit(1);

    return result[0];
  }

  async upsertIntegration(data: NewTenantIntegration): Promise<TenantIntegration> {
    const [result] = await this.db
      .insert(tenantIntegrations)
      .values(data)
      .onConflictDoUpdate({
        target: [tenantIntegrations.tenantId, tenantIntegrations.provider],
        set: {
          ciphertext: data.ciphertext,
          iv: data.iv,
          authTag: data.authTag,
          keyVersion: data.keyVersion,
          lastValidatedAt: data.lastValidatedAt,
          lastValidationResult: data.lastValidationResult,
          lastOperationalErrorCode: data.lastOperationalErrorCode,
          updatedAt: new Date(),
        },
      })
      .returning();

    return result;
  }

  async deleteIntegration(tenantId: string, provider: 'sendgrid'): Promise<void> {
    await this.db
      .delete(tenantIntegrations)
      .where(
        and(
          eq(tenantIntegrations.tenantId, tenantId),
          eq(tenantIntegrations.provider, provider)
        )
      );
  }

  async updateValidationStatus(
    tenantId: string,
    provider: 'sendgrid',
    status: TenantIntegration['lastValidationResult'],
    errorCode?: string | null
  ): Promise<void> {
    await this.db
      .update(tenantIntegrations)
      .set({
        lastValidationResult: status,
        lastOperationalErrorCode: errorCode,
        lastValidatedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(tenantIntegrations.tenantId, tenantId),
          eq(tenantIntegrations.provider, provider)
        )
      );
  }
}

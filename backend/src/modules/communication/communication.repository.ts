import { eq, desc, and, count } from 'drizzle-orm';
import crypto from 'crypto';
import { communications, invoices } from '../../db/index.js';
import type { DatabaseClient } from '../../db/index.js';
import type { Communication, NewCommunication } from '../../db/index.js';
import { tenantSettings, type TenantSettings, type NewTenantSettings } from '../../db/schema.js';

export class CommunicationRepository {
  constructor(private db: DatabaseClient) {}

  async findByInvoiceId(invoiceId: string): Promise<any[]> {
    const rows = await this.db
      .select({
        id: communications.id,
        invoiceId: communications.invoiceId,
        tenantId: communications.tenantId,
        channel: communications.channel,
        subject: communications.subject,
        body: communications.body,
        status: communications.status,
        sentAt: communications.sentAt,
        openedAt: communications.openedAt,
        clickedAt: communications.clickedAt,
        error: communications.error,
        createdAt: communications.createdAt,
        recipient: invoices.contactEmail,
      })
      .from(communications)
      .innerJoin(invoices, eq(communications.invoiceId, invoices.id))
      .where(eq(communications.invoiceId, invoiceId))
      .orderBy(desc(communications.createdAt));

    return rows.map((r) => ({
      ...r,
      errorMsg: r.error,
    }));
  }

  async findLastSuccessfulByInvoiceId(invoiceId: string): Promise<Communication | undefined> {
    const [lastSent] = await this.db
      .select()
      .from(communications)
      .where(
        and(
          eq(communications.invoiceId, invoiceId),
          eq(communications.status, 'sent')
        )
      )
      .orderBy(desc(communications.createdAt))
      .limit(1);
    return lastSent;
  }

  async countSuccessfulByInvoiceId(invoiceId: string): Promise<number> {
    const [result] = await this.db
      .select({ count: count() })
      .from(communications)
      .where(
        and(
          eq(communications.invoiceId, invoiceId),
          eq(communications.status, 'sent')
        )
      );
    return Number(result?.count ?? 0);
  }

  async create(data: NewCommunication): Promise<Communication> {
    const rows = await this.db
      .insert(communications)
      .values(data)
      .returning();
    return rows[0]!;
  }

  async updateOpenedAt(id: string, openedAt: Date): Promise<void> {
    await this.db
      .update(communications)
      .set({ openedAt })
      .where(eq(communications.id, id));
  }

  async updateClickedAt(id: string, clickedAt: Date): Promise<void> {
    await this.db
      .update(communications)
      .set({ clickedAt })
      .where(eq(communications.id, id));
  }

  async markFailed(id: string, error: string): Promise<void> {
    await this.db
      .update(communications)
      .set({ status: 'failed', error })
      .where(eq(communications.id, id));
  }

  async update(id: string, updates: Partial<Omit<Communication, 'id' | 'createdAt'>>): Promise<void> {
    await this.db
      .update(communications)
      .set(updates)
      .where(eq(communications.id, id));
  }

  // Provider Settings Management (e.g. Email Settings)
  async getSettings(tenantId: string): Promise<TenantSettings | undefined> {
    const [settings] = await this.db
      .select()
      .from(tenantSettings)
      .where(eq(tenantSettings.tenantId, tenantId));
    return settings;
  }

  async upsertSettings(tenantId: string, settings: Omit<NewTenantSettings, 'tenantId' | 'updatedAt'>): Promise<TenantSettings> {
    const [upserted] = await this.db
      .insert(tenantSettings)
      .values({
        tenantId,
        ...settings,
        webhookToken: crypto.randomBytes(32).toString('hex'),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: tenantSettings.tenantId,
        set: {
          ...settings,
          updatedAt: new Date(),
        },
      })
      .returning();
    return upserted;
  }

  async setDefaultEmailProvider(tenantId: string, provider: 'sendgrid' | 'smtp' | null): Promise<void> {
    await this.db
      .update(tenantSettings)
      .set({ defaultEmailProvider: provider, updatedAt: new Date() })
      .where(eq(tenantSettings.tenantId, tenantId));
  }
}

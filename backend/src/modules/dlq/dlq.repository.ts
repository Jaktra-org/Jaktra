import { eq, and, desc, sql } from 'drizzle-orm';
import { dlqEntries, invoices, type DlqEntry } from '../../db/schema.js';
import type { DatabaseClient } from '../../db/index.js';
import { mapErrorToDisplayMessage } from '../../shared/utils/error-mapper.js';
import { NotFoundError } from '../../shared/errors/index.js';

export class DlqRepository {
  constructor(private readonly db: DatabaseClient) { }

  async recordFailure(invoiceId: string, tenantId: string, errorMsg: string, technicalMsg?: string): Promise<DlqEntry[]> {
    const invoice = await this.db
      .select({ id: invoices.id })
      .from(invoices)
      .where(and(eq(invoices.id, invoiceId), eq(invoices.tenantId, tenantId)))
      .limit(1);

    if (invoice.length === 0) {
      throw new NotFoundError('Invoice not found or does not belong to this tenant');
    }

    const displayError = mapErrorToDisplayMessage(errorMsg);

    await this.db
      .insert(dlqEntries)
      .values({
        invoiceId,
        tenantId,
        consecutiveFailures: 1,
        lastError: errorMsg,
        lastErrorDisplay: displayError,
        lastErrorTechnical: technicalMsg || errorMsg,
        firstFailure: new Date(),
        lastFailure: new Date(),
      })
      .onDuplicateKeyUpdate({
        set: {
          consecutiveFailures: sql`${dlqEntries.consecutiveFailures} + 1`,
          lastError: errorMsg,
          lastErrorDisplay: displayError,
          lastErrorTechnical: technicalMsg || errorMsg,
          lastFailure: new Date(),
        },
      });

    return await this.db
      .select()
      .from(dlqEntries)
      .where(eq(dlqEntries.invoiceId, invoiceId));
  }

  async clearFailure(invoiceId: string, tenantId: string): Promise<DlqEntry[]> {
    const invoice = await this.db
      .select({ id: invoices.id })
      .from(invoices)
      .where(and(eq(invoices.id, invoiceId), eq(invoices.tenantId, tenantId)))
      .limit(1);

    if (invoice.length === 0) {
      throw new NotFoundError('Invoice not found or does not belong to this tenant');
    }

    const existing = await this.db
      .select()
      .from(dlqEntries)
      .where(eq(dlqEntries.invoiceId, invoiceId));

    await this.db
      .delete(dlqEntries)
      .where(eq(dlqEntries.invoiceId, invoiceId));

    return existing;
  }

  async getAllEntries(tenantId: string): Promise<Array<{
    invoiceId: string;
    consecutiveFailures: number;
    lastError: string | null;
    lastErrorDisplay: string | null;
    lastErrorTechnical: string | null;
    firstFailure: Date;
    lastFailure: Date;
    clientName: string;
    invoiceNo: string;
  }>> {
    return await this.db
      .select({
        invoiceId: dlqEntries.invoiceId,
        consecutiveFailures: dlqEntries.consecutiveFailures,
        lastError: dlqEntries.lastError,
        lastErrorDisplay: dlqEntries.lastErrorDisplay,
        lastErrorTechnical: dlqEntries.lastErrorTechnical,
        firstFailure: dlqEntries.firstFailure,
        lastFailure: dlqEntries.lastFailure,
        clientName: invoices.clientName,
        invoiceNo: invoices.invoiceNo,
      })
      .from(dlqEntries)
      .innerJoin(invoices, eq(dlqEntries.invoiceId, invoices.id))
      .where(eq(dlqEntries.tenantId, tenantId))
      .orderBy(desc(dlqEntries.consecutiveFailures), desc(dlqEntries.lastFailure));
  }

  async getStats(tenantId: string): Promise<{ total: number; critical: number }> {
    const result = await this.db
      .select({
        total: sql<number>`cast(count(*) as integer)`,
        critical: sql<number>`cast(sum(case when ${dlqEntries.consecutiveFailures} >= 3 then 1 else 0 end) as integer)`,
      })
      .from(dlqEntries)
      .innerJoin(invoices, eq(dlqEntries.invoiceId, invoices.id))
      .where(eq(dlqEntries.tenantId, tenantId));
      
    return {
      total: Number(result[0]?.total || 0),
      critical: Number(result[0]?.critical || 0),
    };
  }

  async clearAllEntries(tenantId: string): Promise<DlqEntry[]> {
    const existing = await this.db
      .select()
      .from(dlqEntries)
      .where(eq(dlqEntries.tenantId, tenantId));

    await this.db
      .delete(dlqEntries)
      .where(eq(dlqEntries.tenantId, tenantId));

    return existing;
  }
}

import { eq, and, isNull, isNotNull, desc, asc, ilike, inArray, count, lte, gte } from 'drizzle-orm';
import { invoices } from '../../db/index.js';
import type { DatabaseClient } from '../../db/index.js';
import type { Invoice, NewInvoice } from '../../db/index.js';

export class InvoiceRepository {
  constructor(public readonly db: DatabaseClient) {}

  async findByTenant(tenantId: string): Promise<Invoice[]> {
    return this.db
      .select()
      .from(invoices)
      .where(and(eq(invoices.tenantId, tenantId), isNull(invoices.deletedAt)));
  }

  async countByTenant(tenantId: string): Promise<number> {
    const [row] = await this.db
      .select({ count: count() })
      .from(invoices)
      .where(and(eq(invoices.tenantId, tenantId), isNull(invoices.deletedAt)));
    return Number(row?.count || 0);
  }

  async findById(invoiceId: string): Promise<Invoice | undefined> {
    const rows = await this.db
      .select()
      .from(invoices)
      .where(and(eq(invoices.id, invoiceId), isNull(invoices.deletedAt)))
      .limit(1);
    return rows[0];
  }


  async updateFollowupCount(invoiceId: string, count: number): Promise<void> {
    await this.db
      .update(invoices)
      .set({ followupCount: count, updatedAt: new Date() })
      .where(eq(invoices.id, invoiceId));
  }

  async updatePaymentStatus(invoiceId: string, status: 'Pending' | 'Paid' | 'Overdue' | 'Written Off', externalRefId?: string, tx?: DatabaseClient): Promise<void> {
    const dbClient = tx || this.db;
    const updateData: Record<string, unknown> = { paymentStatus: status, updatedAt: new Date() };
    if (externalRefId) {
      updateData.externalRefId = externalRefId;
    }
    
    await dbClient
      .update(invoices)
      .set(updateData)
      .where(eq(invoices.id, invoiceId));
  }

  async findByInvoiceNo(invoiceNo: string, tenantId: string): Promise<Invoice | undefined> {
    const rows = await this.db
      .select()
      .from(invoices)
      .where(
        and(
          eq(invoices.invoiceNo, invoiceNo),
          eq(invoices.tenantId, tenantId),
          isNull(invoices.deletedAt),
        ),
      )
      .limit(1);

    return rows[0];
  }

  async findTrashed(params: {
    tenantId: string;
    page: number;
    limit: number;
    sortBy: 'dueDate' | 'invoiceAmount' | 'createdAt' | 'clientName' | 'invoiceNo';
    sortOrder: 'asc' | 'desc';
    clientName?: string;
  }): Promise<{ data: Invoice[]; total: number }> {
    const conditions = [
      eq(invoices.tenantId, params.tenantId),
      isNotNull(invoices.deletedAt),
    ];

    if (params.clientName) {
      conditions.push(ilike(invoices.clientName, `%${params.clientName}%`));
    }

    const whereClause = and(...conditions);

    const [totalRow] = await this.db
      .select({ count: count() })
      .from(invoices)
      .where(whereClause);

    const data = await this.db
      .select()
      .from(invoices)
      .where(whereClause)
      .orderBy(
        params.sortOrder === 'asc'
          ? asc(invoices[params.sortBy])
          : desc(invoices[params.sortBy])
      )
      .limit(params.limit)
      .offset((params.page - 1) * params.limit);

    return {
      data,
      total: Number(totalRow?.count || 0),
    };
  }

  async create(data: NewInvoice, tx?: DatabaseClient): Promise<Invoice> {
    const dbClient = tx || this.db;
    const rows = await dbClient.insert(invoices).values(data).returning();
    return rows[0]!;
  }

  async createMany(data: NewInvoice[], tx?: DatabaseClient): Promise<Invoice[]> {
    if (data.length === 0) return [];
    const dbClient = tx || this.db;
    return dbClient.insert(invoices).values(data).returning();
  }

  async findMany(params: {
    tenantId: string;
    page: number;
    limit: number;
    sortBy: 'dueDate' | 'invoiceAmount' | 'createdAt' | 'clientName' | 'invoiceNo';
    sortOrder: 'asc' | 'desc';
    status?: string[];
    clientName?: string;
    daysOverdueMin?: number;
    daysOverdueMax?: number;
  }): Promise<{ data: Invoice[]; total: number }> {
    const conditions = [
      eq(invoices.tenantId, params.tenantId),
      isNull(invoices.deletedAt),
    ];

    if (params.status && params.status.length > 0) {
      conditions.push(inArray(invoices.paymentStatus, params.status as ('Pending' | 'Paid' | 'Overdue' | 'Written Off')[]));
    }
    if (params.clientName) {
      conditions.push(ilike(invoices.clientName, `%${params.clientName}%`));
    }
    
    // days_overdue = today - due_date
    // so due_date <= today - daysOverdueMin
    // due_date >= today - daysOverdueMax
    if (params.daysOverdueMin !== undefined) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - params.daysOverdueMin);
      conditions.push(lte(invoices.dueDate, targetDate.toISOString().split('T')[0] as string));
    }
    if (params.daysOverdueMax !== undefined) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - params.daysOverdueMax);
      conditions.push(gte(invoices.dueDate, targetDate.toISOString().split('T')[0] as string));
    }

    const whereClause = and(...conditions);

    const [totalRow] = await this.db
      .select({ count: count() })
      .from(invoices)
      .where(whereClause);

    const data = await this.db
      .select()
      .from(invoices)
      .where(whereClause)
      .orderBy(
        params.sortOrder === 'asc'
          ? asc(invoices[params.sortBy])
          : desc(invoices[params.sortBy])
      )
      .limit(params.limit)
      .offset((params.page - 1) * params.limit);

    return {
      data,
      total: Number(totalRow?.count || 0),
    };
  }

  async update(invoiceId: string, tenantId: string, data: Partial<NewInvoice>, tx?: DatabaseClient): Promise<Invoice | undefined> {
    const dbClient = tx || this.db;
    const rows = await dbClient
      .update(invoices)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(invoices.id, invoiceId), eq(invoices.tenantId, tenantId)))
      .returning();
    return rows[0];
  }

  async softDelete(invoiceId: string, tenantId: string, tx?: DatabaseClient): Promise<boolean> {
    const dbClient = tx || this.db;
    const rows = await dbClient
      .update(invoices)
      .set({ deletedAt: new Date() })
      .where(and(eq(invoices.id, invoiceId), eq(invoices.tenantId, tenantId)))
      .returning();
    return rows.length > 0;
  }

  async findByIdIncludingTrashed(invoiceId: string): Promise<Invoice | undefined> {
    const rows = await this.db
      .select()
      .from(invoices)
      .where(eq(invoices.id, invoiceId))
      .limit(1);
    return rows[0];
  }

  async hardDelete(invoiceId: string, tenantId: string, tx?: DatabaseClient): Promise<boolean> {
    const dbClient = tx || this.db;
    const rows = await dbClient
      .delete(invoices)
      .where(and(
        eq(invoices.id, invoiceId),
        eq(invoices.tenantId, tenantId),
        isNotNull(invoices.deletedAt)
      ))
      .returning();
    return rows.length > 0;
  }

  async restore(invoiceId: string, tenantId: string, tx?: DatabaseClient): Promise<Invoice | undefined> {
    const dbClient = tx || this.db;
    const rows = await dbClient
      .update(invoices)
      .set({ deletedAt: null, updatedAt: new Date() })
      .where(and(
        eq(invoices.id, invoiceId),
        eq(invoices.tenantId, tenantId),
        isNotNull(invoices.deletedAt)
      ))
      .returning();
    return rows[0];
  }

  async upsertByInvoiceNo(data: NewInvoice, tx?: DatabaseClient): Promise<{ invoice: Invoice; wasUpdated: boolean }> {
    const dbClient = tx || this.db;
    // Find using the same client/transaction
    const rowsFound = await dbClient
      .select()
      .from(invoices)
      .where(
        and(
          eq(invoices.invoiceNo, data.invoiceNo),
          eq(invoices.tenantId, data.tenantId),
          isNull(invoices.deletedAt),
        ),
      )
      .limit(1);
    const existing = rowsFound[0];

    if (existing) {
      const rows = await dbClient
        .update(invoices)
        .set({
          clientName: data.clientName,
          invoiceAmount: data.invoiceAmount,
          dueDate: data.dueDate,
          contactEmail: data.contactEmail,
          subject: data.subject ?? null,
          paymentStatus: data.paymentStatus,
          followupCount: data.followupCount,
          lastFollowupDate: data.lastFollowupDate,
          updatedAt: new Date(),
        })
        .where(eq(invoices.id, existing.id))
        .returning();

      return { invoice: rows[0]!, wasUpdated: true };
    }

    const invoice = await this.create(data, dbClient);
    return { invoice, wasUpdated: false };
  }

  async findExpiredTrashed(tenantId: string, cutoffDate: Date, limit: number): Promise<Invoice[]> {
    return this.db
      .select()
      .from(invoices)
      .where(
        and(
          eq(invoices.tenantId, tenantId),
          isNotNull(invoices.deletedAt),
          lte(invoices.deletedAt, cutoffDate)
        )
      )
      .limit(limit);
  }
}

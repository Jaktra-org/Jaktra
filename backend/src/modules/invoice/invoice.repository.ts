import { eq, and, isNull, isNotNull, desc, asc, ilike, inArray, count, lte, gte, sql } from 'drizzle-orm';
import { invoices, paymentPlanRequests } from '../../db/index.js';
import type { DatabaseClient, DatabaseOrTransaction } from '../../db/index.js';
import type { Invoice, NewInvoice } from '../../db/index.js';
import { EventService } from '../event/event.service.js';
import { logger } from '../../shared/logger.js';
import crypto from 'crypto';

export class InvoiceRepository {
  constructor(
    public readonly db: DatabaseClient,
    private readonly eventService: EventService,
  ) {}

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

  async findByIds(ids: string[], tenantId: string): Promise<Invoice[]> {
    if (!ids || ids.length === 0) return [];
    return this.db
      .select()
      .from(invoices)
      .where(and(eq(invoices.tenantId, tenantId), inArray(invoices.id, ids)));
  }

  async updateFollowupCount(invoiceId: string, count: number): Promise<void> {
    await this.db
      .update(invoices)
      .set({ followupCount: count, updatedAt: new Date() })
      .where(eq(invoices.id, invoiceId));
  }

  async updatePaymentStatus(invoiceId: string, status: 'Pending' | 'Paid' | 'Overdue' | 'Written Off', externalRefId?: string, tx?: DatabaseOrTransaction): Promise<void> {
    const dbClient = tx || this.db;
    
    // Check if the status is actually changing
    const [existing] = await dbClient
      .select({ paymentStatus: invoices.paymentStatus })
      .from(invoices)
      .where(eq(invoices.id, invoiceId))
      .limit(1);
    const statusChanged = !existing || existing.paymentStatus !== status;

    const updateData: Record<string, unknown> = { paymentStatus: status, updatedAt: new Date() };
    if (statusChanged) {
      updateData.paymentStatusChangedAt = new Date();
    }
    if (externalRefId) {
      updateData.externalRefId = externalRefId;
    }
    
    await dbClient
      .update(invoices)
      .set(updateData)
      .where(eq(invoices.id, invoiceId));

    await this.autoCancelPendingPaymentPlans(invoiceId, status, dbClient);
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

  async create(data: NewInvoice, tx?: DatabaseOrTransaction): Promise<Invoice> {
    const dbClient = tx || this.db;
    const id = data.id || crypto.randomUUID();
    const insertData = {
      ...data,
      id,
      paymentStatusChangedAt: data.paymentStatusChangedAt || new Date(),
    };
    await dbClient.insert(invoices).values(insertData);
    const [row] = await dbClient.select().from(invoices).where(eq(invoices.id, id)).limit(1);
    return row!;
  }

  async createMany(data: NewInvoice[], tx?: DatabaseOrTransaction): Promise<Invoice[]> {
    if (data.length === 0) return [];
    const dbClient = tx || this.db;
    const formattedData = data.map((item) => ({
      ...item,
      id: item.id || crypto.randomUUID(),
      paymentStatusChangedAt: item.paymentStatusChangedAt || new Date(),
    }));
    const ids = formattedData.map((item) => item.id);
    await dbClient.insert(invoices).values(formattedData);
    return await dbClient.select().from(invoices).where(inArray(invoices.id, ids));
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
    urgencyTier?: string;
    hasPaymentPlan?: boolean;
    followupStatus?: 'none' | 'has_followups';
    minAmount?: number;
    maxAmount?: number;
  }): Promise<{ data: Invoice[]; total: number }> {
    const conditions = [
      eq(invoices.tenantId, params.tenantId),
      isNull(invoices.deletedAt),
    ];

    if (params.status && params.status.length > 0) {
      const hasOverdue = params.status.includes('Overdue');
      const hasPending = params.status.includes('Pending') || params.status.includes('Unpaid');
      const hasPaid = params.status.includes('Paid');

      if (hasPending && hasOverdue && !hasPaid) {
        conditions.push(sql`${invoices.paymentStatus} != 'Paid'`);
      } else if (hasOverdue && !hasPending && !hasPaid) {
        conditions.push(sql`(${invoices.paymentStatus} = 'Overdue' OR (${invoices.paymentStatus} != 'Paid' AND ${invoices.dueDate} < NOW()))`);
      } else {
        conditions.push(inArray(invoices.paymentStatus, params.status as ('Pending' | 'Paid' | 'Overdue' | 'Written Off')[]));
      }
    }
    if (params.clientName) {
      conditions.push(ilike(invoices.clientName, `%${params.clientName}%`));
    }

    if (params.hasPaymentPlan !== undefined) {
      conditions.push(eq(invoices.hasActivePaymentPlan, params.hasPaymentPlan));
    }

    if (params.followupStatus === 'none') {
      conditions.push(eq(invoices.followupCount, 0));
    } else if (params.followupStatus === 'has_followups') {
      conditions.push(gte(invoices.followupCount, 1));
    }



    const effectiveDueDateSql = sql`COALESCE((
      SELECT MIN(ppi.due_date)
      FROM payment_plan_installments ppi
      JOIN payment_plan_requests ppr ON ppi.plan_request_id = ppr.id
      WHERE ppi.invoice_id = ${invoices.id}
        AND ppr.status = 'approved'
        AND ppi.status IN ('pending', 'overdue')
    ), ${invoices.dueDate})`;

    const effectiveDaysOverdueSql = sql`GREATEST(0, (CURRENT_DATE - (${effectiveDueDateSql})::date))`;

    if (params.daysOverdueMin !== undefined) {
      conditions.push(sql`${effectiveDaysOverdueSql} >= ${params.daysOverdueMin}`);
    }
    if (params.daysOverdueMax !== undefined) {
      conditions.push(sql`${effectiveDaysOverdueSql} <= ${params.daysOverdueMax}`);
    }
    if (params.urgencyTier === 'legal_escalation') {
      conditions.push(sql`${effectiveDaysOverdueSql} >= 31`);
    } else if (params.urgencyTier === 'stage_4_stern') {
      conditions.push(sql`${effectiveDaysOverdueSql} BETWEEN 22 AND 30`);
    } else if (params.urgencyTier === 'stage_3_serious') {
      conditions.push(sql`${effectiveDaysOverdueSql} BETWEEN 15 AND 21`);
    } else if (params.urgencyTier === 'stage_2_firm') {
      conditions.push(sql`${effectiveDaysOverdueSql} BETWEEN 8 AND 14`);
    } else if (params.urgencyTier === 'stage_1_warm') {
      conditions.push(sql`${effectiveDaysOverdueSql} BETWEEN 1 AND 7`);
    }
    if (params.minAmount !== undefined) {
      conditions.push(gte(invoices.invoiceAmount, String(params.minAmount)));
    }
    if (params.maxAmount !== undefined) {
      conditions.push(lte(invoices.invoiceAmount, String(params.maxAmount)));
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

  async update(invoiceId: string, tenantId: string, data: Partial<NewInvoice>, tx?: DatabaseOrTransaction): Promise<Invoice | undefined> {
    const dbClient = tx || this.db;
    const updateData: Record<string, unknown> = { ...data, updatedAt: new Date() };

    if (data.paymentStatus !== undefined) {
      const [existing] = await dbClient
        .select({ paymentStatus: invoices.paymentStatus })
        .from(invoices)
        .where(eq(invoices.id, invoiceId))
        .limit(1);
      if (!existing || existing.paymentStatus !== data.paymentStatus) {
        updateData.paymentStatusChangedAt = new Date();
      }
    }

    await dbClient
      .update(invoices)
      .set(updateData)
      .where(and(eq(invoices.id, invoiceId), eq(invoices.tenantId, tenantId)));

    if (data.paymentStatus) {
      await this.autoCancelPendingPaymentPlans(invoiceId, data.paymentStatus as 'Pending' | 'Paid' | 'Overdue' | 'Written Off', dbClient);
    }

    const [row] = await dbClient.select().from(invoices).where(and(eq(invoices.id, invoiceId), eq(invoices.tenantId, tenantId))).limit(1);
    return row;
  }

  async softDelete(invoiceId: string, tenantId: string, tx?: DatabaseOrTransaction): Promise<boolean> {
    const dbClient = tx || this.db;
    await dbClient
      .update(invoices)
      .set({ deletedAt: new Date() })
      .where(and(eq(invoices.id, invoiceId), eq(invoices.tenantId, tenantId)));
    return true;
  }

  async findByIdIncludingTrashed(invoiceId: string): Promise<Invoice | undefined> {
    const rows = await this.db
      .select()
      .from(invoices)
      .where(eq(invoices.id, invoiceId))
      .limit(1);
    return rows[0];
  }

  async hardDelete(invoiceId: string, tenantId: string, tx?: DatabaseOrTransaction): Promise<boolean> {
    const dbClient = tx || this.db;
    await dbClient
      .delete(invoices)
      .where(and(
        eq(invoices.id, invoiceId),
        eq(invoices.tenantId, tenantId),
        isNotNull(invoices.deletedAt)
      ));
    return true;
  }

  async restore(invoiceId: string, tenantId: string, tx?: DatabaseOrTransaction): Promise<Invoice | undefined> {
    const dbClient = tx || this.db;
    await dbClient
      .update(invoices)
      .set({ deletedAt: null, updatedAt: new Date() })
      .where(and(
        eq(invoices.id, invoiceId),
        eq(invoices.tenantId, tenantId),
        isNotNull(invoices.deletedAt)
      ));
    const [row] = await dbClient.select().from(invoices).where(and(eq(invoices.id, invoiceId), eq(invoices.tenantId, tenantId))).limit(1);
    return row;
  }

  async upsertByInvoiceNo(data: NewInvoice, tx?: DatabaseOrTransaction): Promise<{ invoice: Invoice; wasUpdated: boolean }> {
    const dbClient = tx || this.db;
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
      const statusChanged = existing.paymentStatus !== data.paymentStatus;
      const updateData: Record<string, unknown> = {
        clientName: data.clientName,
        invoiceAmount: data.invoiceAmount,
        dueDate: data.dueDate,
        contactEmail: data.contactEmail,
        subject: data.subject ?? null,
        paymentStatus: data.paymentStatus,
        followupCount: data.followupCount,
        lastFollowupDate: data.lastFollowupDate,
        updatedAt: new Date(),
      };
      if (statusChanged) {
        updateData.paymentStatusChangedAt = new Date();
      }

      await dbClient
        .update(invoices)
        .set(updateData)
        .where(eq(invoices.id, existing.id));

      if (statusChanged) {
        await this.autoCancelPendingPaymentPlans(existing.id, data.paymentStatus!, dbClient);
      }

      const [updated] = await dbClient.select().from(invoices).where(eq(invoices.id, existing.id)).limit(1);
      return { invoice: updated!, wasUpdated: true };
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

  private async autoCancelPendingPaymentPlans(
    invoiceId: string,
    status: 'Pending' | 'Paid' | 'Overdue' | 'Written Off',
    dbClient: DatabaseOrTransaction
  ): Promise<void> {
    if (status === 'Paid' || status === 'Written Off') {
      const pendingPlans = await dbClient
        .select()
        .from(paymentPlanRequests)
        .where(and(
          eq(paymentPlanRequests.invoiceId, invoiceId),
          eq(paymentPlanRequests.status, 'pending')
        ));

      if (pendingPlans.length > 0) {
        await dbClient
          .update(paymentPlanRequests)
          .set({ status: 'cancelled', reviewedAt: new Date() })
          .where(and(
            eq(paymentPlanRequests.invoiceId, invoiceId),
            eq(paymentPlanRequests.status, 'pending')
          ));

        const [inv] = await dbClient
          .select({ tenantId: invoices.tenantId })
          .from(invoices)
          .where(eq(invoices.id, invoiceId))
          .limit(1);

        const tenantId = inv?.tenantId;
        if (tenantId) {
          for (const row of pendingPlans) {
            await this.eventService.emitEvent(
              'invoice',
              invoiceId,
              tenantId,
              'invoice.payment_plan_cancelled',
              { source: 'system', name: 'System Auto-Cancel' },
              {
                description: `Payment plan request auto-cancelled because invoice was marked ${status}.`,
                payload: { requestId: row.id },
                tx: dbClient,
              }
            ).catch((err) => {
              logger.error('Failed to emit auto-cancelled event', err);
            });
          }
        }
      }
    }
  }
}

import { eq, ne, and, desc, count, asc } from 'drizzle-orm';
import { paymentPlanRequests, paymentPlanInstallments, invoices } from '../../db/index.js';
import type {
  DatabaseClient,
  DatabaseOrTransaction,
  PaymentPlanRequest,
  NewPaymentPlanRequest,
  PaymentPlanInstallment,
  NewPaymentPlanInstallment,
} from '../../db/index.js';
import crypto from 'crypto';

export class PaymentPlanRepository {
  constructor(private readonly db: DatabaseClient) {}

  async create(data: NewPaymentPlanRequest, tx?: DatabaseOrTransaction): Promise<PaymentPlanRequest> {
    const dbClient = tx || this.db;
    const id = data.id || crypto.randomUUID();
    const insertData = { ...data, id };
    await dbClient.insert(paymentPlanRequests).values(insertData);
    const [row] = await dbClient.select().from(paymentPlanRequests).where(eq(paymentPlanRequests.id, id)).limit(1);
    return row!;
  }

  async findById(id: string, tx?: DatabaseOrTransaction): Promise<PaymentPlanRequest | undefined> {
    const dbClient = tx || this.db;
    const rows = await dbClient
      .select()
      .from(paymentPlanRequests)
      .where(eq(paymentPlanRequests.id, id))
      .limit(1);
    return rows[0];
  }

  async findPendingByInvoiceId(invoiceId: string, tx?: DatabaseOrTransaction): Promise<PaymentPlanRequest | undefined> {
    const dbClient = tx || this.db;
    const rows = await dbClient
      .select()
      .from(paymentPlanRequests)
      .where(and(
        eq(paymentPlanRequests.invoiceId, invoiceId),
        eq(paymentPlanRequests.status, 'pending')
      ))
      .limit(1);
    return rows[0];
  }

  async findActiveApprovedByInvoiceId(invoiceId: string, tx?: DatabaseOrTransaction): Promise<PaymentPlanRequest | undefined> {
    const dbClient = tx || this.db;
    const rows = await dbClient
      .select()
      .from(paymentPlanRequests)
      .where(and(
        eq(paymentPlanRequests.invoiceId, invoiceId),
        eq(paymentPlanRequests.status, 'approved')
      ))
      .limit(1);
    return rows[0];
  }

  async listPlans(
    tenantId: string,
    params: { page: number; limit: number; status?: string }
  ): Promise<{ data: unknown[]; total: number }> {
    const filterStatus = params.status && params.status !== 'all' ? params.status : null;
    
    const conditions = filterStatus
      ? and(
          eq(paymentPlanRequests.tenantId, tenantId),
          eq(paymentPlanRequests.status, filterStatus as 'pending' | 'approved' | 'denied' | 'cancelled')
        )
      : eq(paymentPlanRequests.tenantId, tenantId);

    const [totalRow] = await this.db
      .select({ count: count() })
      .from(paymentPlanRequests)
      .where(conditions);

    const data = await this.db
      .select({
        id: paymentPlanRequests.id,
        tenantId: paymentPlanRequests.tenantId,
        invoiceId: paymentPlanRequests.invoiceId,
        installments: paymentPlanRequests.installments,
        proposedAmountPerMonth: paymentPlanRequests.proposedAmountPerMonth,
        reason: paymentPlanRequests.reason,
        status: paymentPlanRequests.status,
        reviewedBy: paymentPlanRequests.reviewedBy,
        reviewedAt: paymentPlanRequests.reviewedAt,
        createdAt: paymentPlanRequests.createdAt,
        invoiceNo: invoices.invoiceNo,
        clientName: invoices.clientName,
        invoiceAmount: invoices.invoiceAmount,
        currency: invoices.currency,
      })
      .from(paymentPlanRequests)
      .innerJoin(invoices, eq(paymentPlanRequests.invoiceId, invoices.id))
      .where(conditions)
      .orderBy(desc(paymentPlanRequests.createdAt))
      .limit(params.limit)
      .offset((params.page - 1) * params.limit);

    return {
      data,
      total: Number(totalRow?.count || 0),
    };
  }

  async listPending(
    tenantId: string,
    params: { page: number; limit: number }
  ): Promise<{ data: unknown[]; total: number }> {
    return this.listPlans(tenantId, { ...params, status: 'pending' });
  }

  async update(
    id: string,
    data: Partial<NewPaymentPlanRequest>,
    tx?: DatabaseOrTransaction
  ): Promise<PaymentPlanRequest> {
    const dbClient = tx || this.db;
    await dbClient
      .update(paymentPlanRequests)
      .set(data)
      .where(eq(paymentPlanRequests.id, id));
    
    const [row] = await dbClient
      .select()
      .from(paymentPlanRequests)
      .where(eq(paymentPlanRequests.id, id))
      .limit(1);

    return row!;
  }

  // --- Installments Management ---

  async createInstallmentsBatch(
    items: NewPaymentPlanInstallment[],
    tx?: DatabaseOrTransaction
  ): Promise<PaymentPlanInstallment[]> {
    if (items.length === 0) return [];
    const dbClient = tx || this.db;
    const records = items.map((item) => ({
      ...item,
      id: item.id || crypto.randomUUID(),
    }));
    await dbClient.insert(paymentPlanInstallments).values(records);
    return records as PaymentPlanInstallment[];
  }

  async findInstallmentsByInvoiceId(
    invoiceId: string,
    tx?: DatabaseOrTransaction
  ): Promise<PaymentPlanInstallment[]> {
    const dbClient = tx || this.db;
    return dbClient
      .select()
      .from(paymentPlanInstallments)
      .where(eq(paymentPlanInstallments.invoiceId, invoiceId))
      .orderBy(asc(paymentPlanInstallments.installmentNumber));
  }

  async findInstallmentById(
    id: string,
    tx?: DatabaseOrTransaction
  ): Promise<PaymentPlanInstallment | undefined> {
    const dbClient = tx || this.db;
    const rows = await dbClient
      .select()
      .from(paymentPlanInstallments)
      .where(eq(paymentPlanInstallments.id, id))
      .limit(1);
    return rows[0];
  }

  async findNextDueInstallment(
    invoiceId: string,
    tx?: DatabaseOrTransaction
  ): Promise<PaymentPlanInstallment | undefined> {
    const dbClient = tx || this.db;
    const rows = await dbClient
      .select()
      .from(paymentPlanInstallments)
      .where(and(
        eq(paymentPlanInstallments.invoiceId, invoiceId),
        ne(paymentPlanInstallments.status, 'paid')
      ))
      .orderBy(asc(paymentPlanInstallments.installmentNumber))
      .limit(1);
    return rows[0];
  }

  async countInstallmentsByInvoiceId(
    invoiceId: string,
    tx?: DatabaseOrTransaction
  ): Promise<number> {
    const dbClient = tx || this.db;
    const rows = await dbClient
      .select({ count: count() })
      .from(paymentPlanInstallments)
      .where(eq(paymentPlanInstallments.invoiceId, invoiceId));
    return Number(rows[0]?.count || 0);
  }

  async updateInstallment(
    id: string,
    data: Partial<NewPaymentPlanInstallment>,
    tx?: DatabaseOrTransaction
  ): Promise<PaymentPlanInstallment> {
    const dbClient = tx || this.db;
    await dbClient
      .update(paymentPlanInstallments)
      .set(data)
      .where(eq(paymentPlanInstallments.id, id));

    const [row] = await dbClient
      .select()
      .from(paymentPlanInstallments)
      .where(eq(paymentPlanInstallments.id, id))
      .limit(1);

    return row!;
  }
}

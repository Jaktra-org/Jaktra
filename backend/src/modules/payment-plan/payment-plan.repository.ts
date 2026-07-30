import { eq, and, desc, count } from 'drizzle-orm';
import { paymentPlanRequests, invoices } from '../../db/index.js';
import type { DatabaseClient, DatabaseOrTransaction, PaymentPlanRequest, NewPaymentPlanRequest } from '../../db/index.js';
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

  async listPending(
    tenantId: string,
    params: { page: number; limit: number }
  ): Promise<{ data: unknown[]; total: number }> {
    const conditions = and(
      eq(paymentPlanRequests.tenantId, tenantId),
      eq(paymentPlanRequests.status, 'pending')
    );

    const [totalRow] = await this.db
      .select({ count: count() })
      .from(paymentPlanRequests)
      .where(conditions);

    // Join with invoices to fetch context (invoiceNo, clientName, etc.)
    const data = await this.db
      .select({
        id: paymentPlanRequests.id,
        tenantId: paymentPlanRequests.tenantId,
        invoiceId: paymentPlanRequests.invoiceId,
        installments: paymentPlanRequests.installments,
        proposedAmountPerMonth: paymentPlanRequests.proposedAmountPerMonth,
        reason: paymentPlanRequests.reason,
        status: paymentPlanRequests.status,
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
}

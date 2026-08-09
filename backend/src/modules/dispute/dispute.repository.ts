import { eq, and, asc, count, inArray } from 'drizzle-orm';
import { inboundEmails, invoices, communications } from '../../db/index.js';
import type { DatabaseClient } from '../../db/index.js';
import type { InboundEmail, NewInboundEmail } from '../../db/index.js';
import crypto from 'crypto';

export interface ThreadItem {
  id: string;
  direction: 'inbound' | 'outbound';
  sender: string;
  subject: string | null;
  body: string | null;
  sourceTag?: 'bulk_ai_agent' | 'invoice_manual' | 'dispute_agent' | 'system';
  createdAt: Date;
}

export interface PendingDisputeItem {
  id: string;
  tenantId: string;
  invoiceId: string | null;
  sender: string;
  subject: string | null;
  body: string | null;
  classification: string | null;
  confidence: string | null;
  reasoning: string | null;
  status: 'pending' | 'resolved' | 'archived';
  createdAt: Date;
  invoiceNo: string | null;
  clientName: string | null;
  thread: ThreadItem[];
}

export interface DisputeListParams {
  status: 'pending' | 'resolved' | 'archived';
  classification?: string;
  page: number;
  limit: number;
}

export class DisputeRepository {
  constructor(private db: DatabaseClient) { }

  async listDisputes(tenantId: string, params: DisputeListParams): Promise<{
    data: PendingDisputeItem[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
    statusCounts: { pending: number; resolved: number; archived: number };
    categoryCounts: { all: number; dispute: number; question: number; payment_promise: number; unclear: number };
  }> {
    const offset = (params.page - 1) * params.limit;

    // 1. Get status counts for top-level status navigation
    const allTenantItems = await this.db
      .select({
        status: inboundEmails.status,
        classification: inboundEmails.classification,
      })
      .from(inboundEmails)
      .where(eq(inboundEmails.tenantId, tenantId));

    const statusCounts = {
      pending: allTenantItems.filter((i) => i.status === 'pending').length,
      resolved: allTenantItems.filter((i) => i.status === 'resolved').length,
      archived: allTenantItems.filter((i) => i.status === 'archived').length,
    };

    // 2. Filter items belonging to selected status
    const statusItems = allTenantItems.filter((i) => i.status === params.status);

    const categoryCounts = {
      all: statusItems.length,
      dispute: statusItems.filter((i) => i.classification === 'dispute').length,
      question: statusItems.filter((i) => i.classification === 'question').length,
      payment_promise: statusItems.filter((i) => i.classification === 'payment_promise').length,
      unclear: statusItems.filter((i) => i.classification === 'unclear').length,
    };

    // 3. Build query filters for requested status and classification
    const conditions = [
      eq(inboundEmails.tenantId, tenantId),
      eq(inboundEmails.status, params.status),
    ];

    if (params.classification && params.classification !== 'all') {
      conditions.push(eq(inboundEmails.classification, params.classification));
    }

    const [countResult] = await this.db
      .select({ count: count() })
      .from(inboundEmails)
      .where(and(...conditions));

    const total = Number(countResult?.count || 0);
    const totalPages = Math.ceil(total / params.limit);

    const data = await this.db
      .select({
        id: inboundEmails.id,
        tenantId: inboundEmails.tenantId,
        invoiceId: inboundEmails.invoiceId,
        sender: inboundEmails.sender,
        subject: inboundEmails.subject,
        body: inboundEmails.body,
        classification: inboundEmails.classification,
        confidence: inboundEmails.confidence,
        reasoning: inboundEmails.reasoning,
        status: inboundEmails.status,
        createdAt: inboundEmails.createdAt,
        invoiceNo: invoices.invoiceNo,
        clientName: invoices.clientName,
      })
      .from(inboundEmails)
      .leftJoin(invoices, eq(inboundEmails.invoiceId, invoices.id))
      .where(and(...conditions))
      .orderBy(asc(inboundEmails.createdAt))
      .limit(params.limit)
      .offset(offset);

    const invoiceIds = Array.from(new Set(data.map((d) => d.invoiceId).filter((id): id is string => Boolean(id))));

    let allInboundForInvoices: Array<{ id: string; invoiceId: string | null; sender: string; subject: string | null; body: string | null; createdAt: Date }> = [];
    let allOutboundForInvoices: Array<{ id: string; invoiceId: string; subject: string | null; body: string | null; source: 'bulk_ai_agent' | 'invoice_manual' | 'dispute_agent' | 'system'; sentAt: Date | null; createdAt: Date }> = [];

    if (invoiceIds.length > 0) {
      allInboundForInvoices = await this.db
        .select({
          id: inboundEmails.id,
          invoiceId: inboundEmails.invoiceId,
          sender: inboundEmails.sender,
          subject: inboundEmails.subject,
          body: inboundEmails.body,
          createdAt: inboundEmails.createdAt,
        })
        .from(inboundEmails)
        .where(
          and(
            eq(inboundEmails.tenantId, tenantId),
            inArray(inboundEmails.invoiceId, invoiceIds)
          )
        );

      allOutboundForInvoices = await this.db
        .select({
          id: communications.id,
          invoiceId: communications.invoiceId,
          subject: communications.subject,
          body: communications.body,
          source: communications.source,
          sentAt: communications.sentAt,
          createdAt: communications.createdAt,
        })
        .from(communications)
        .where(
          and(
            eq(communications.tenantId, tenantId),
            inArray(communications.invoiceId, invoiceIds),
            eq(communications.source, 'dispute_agent')
          )
        );
    }

    const dataWithThreads: PendingDisputeItem[] = data.map((item) => {
      const thread: ThreadItem[] = [];

      if (item.invoiceId) {
        const itemInbounds = allInboundForInvoices.filter((inb) => inb.invoiceId === item.invoiceId);
        for (const inb of itemInbounds) {
          thread.push({
            id: inb.id,
            direction: 'inbound',
            sender: inb.sender,
            subject: inb.subject,
            body: inb.body,
            createdAt: inb.createdAt,
          });
        }

        const itemOutbounds = allOutboundForInvoices.filter((outb) => outb.invoiceId === item.invoiceId);
        for (const outb of itemOutbounds) {
          thread.push({
            id: outb.id,
            direction: 'outbound',
            sender: 'Finance Team',
            subject: outb.subject,
            body: outb.body,
            sourceTag: outb.source,
            createdAt: outb.sentAt || outb.createdAt,
          });
        }
      }

      if (thread.length === 0) {
        thread.push({
          id: item.id,
          direction: 'inbound',
          sender: item.sender,
          subject: item.subject,
          body: item.body,
          createdAt: item.createdAt,
        });
      }

      thread.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      return {
        ...item,
        thread,
      };
    });

    return {
      data: dataWithThreads,
      pagination: {
        total,
        page: params.page,
        limit: params.limit,
        totalPages,
      },
      statusCounts,
      categoryCounts,
    };
  }

  async listPending(tenantId: string, params: { page: number; limit: number }): Promise<ReturnType<DisputeRepository['listDisputes']>> {
    return this.listDisputes(tenantId, {
      status: 'pending',
      classification: 'all',
      page: params.page,
      limit: params.limit,
    });
  }

  async findById(id: string): Promise<InboundEmail | undefined> {
    const [row] = await this.db
      .select()
      .from(inboundEmails)
      .where(eq(inboundEmails.id, id));
    return row;
  }

  async create(data: NewInboundEmail): Promise<InboundEmail> {
    const id = data.id || crypto.randomUUID();
    const insertData = { ...data, id };
    await this.db.insert(inboundEmails).values(insertData);
    const [row] = await this.db.select().from(inboundEmails).where(eq(inboundEmails.id, id)).limit(1);
    return row!;
  }

  async update(id: string, updates: Partial<Omit<InboundEmail, 'id' | 'createdAt'>>): Promise<void> {
    await this.db
      .update(inboundEmails)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(inboundEmails.id, id));
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(inboundEmails).where(eq(inboundEmails.id, id));
  }
}

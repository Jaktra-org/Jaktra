import { eq, and, asc, count } from 'drizzle-orm';
import { inboundEmails, invoices } from '../../db/index.js';
import type { DatabaseClient } from '../../db/index.js';
import type { InboundEmail, NewInboundEmail } from '../../db/index.js';

export interface PendingDisputeItem {
  id: string;
  tenantId: string;
  invoiceId: string | null;
  sender: string;
  subject: string | null;
  body: string | null;
  classification: string | null;
  confidence: string | null;
  suggestedResponse: string | null;
  reasoning: string | null;
  status: 'pending_review' | 'approved' | 'discarded';
  createdAt: Date;
  invoiceNo: string | null;
  clientName: string | null;
}

export class DisputeRepository {
  constructor(private db: DatabaseClient) { }

  async listPending(tenantId: string, params: { page: number; limit: number }): Promise<{
    data: PendingDisputeItem[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const offset = (params.page - 1) * params.limit;

    const [countResult] = await this.db
      .select({ count: count() })
      .from(inboundEmails)
      .where(
        and(
          eq(inboundEmails.tenantId, tenantId),
          eq(inboundEmails.status, 'pending_review')
        )
      );

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
        suggestedResponse: inboundEmails.suggestedResponse,
        reasoning: inboundEmails.reasoning,
        status: inboundEmails.status,
        createdAt: inboundEmails.createdAt,
        invoiceNo: invoices.invoiceNo,
        clientName: invoices.clientName,
      })
      .from(inboundEmails)
      .leftJoin(invoices, eq(inboundEmails.invoiceId, invoices.id))
      .where(
        and(
          eq(inboundEmails.tenantId, tenantId),
          eq(inboundEmails.status, 'pending_review')
        )
      )
      .orderBy(asc(inboundEmails.createdAt))
      .limit(params.limit)
      .offset(offset);

    return {
      data,
      pagination: {
        total,
        page: params.page,
        limit: params.limit,
        totalPages,
      },
    };
  }

  async findById(id: string): Promise<InboundEmail | undefined> {
    const [row] = await this.db
      .select()
      .from(inboundEmails)
      .where(eq(inboundEmails.id, id));
    return row;
  }

  async create(data: NewInboundEmail): Promise<InboundEmail> {
    const [row] = await this.db
      .insert(inboundEmails)
      .values(data)
      .returning();
    return row!;
  }

  async update(id: string, updates: Partial<Omit<InboundEmail, 'id' | 'createdAt'>>): Promise<void> {
    await this.db
      .update(inboundEmails)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(inboundEmails.id, id));
  }
}

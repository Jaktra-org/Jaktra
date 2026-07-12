import { eq, and, desc } from 'drizzle-orm';
import { inboundEmails, invoices } from '../../db/index.js';
import type { DatabaseClient } from '../../db/index.js';
import type { InboundEmail, NewInboundEmail } from '../../db/index.js';

export class DisputeRepository {
  constructor(private db: DatabaseClient) {}

  async listPending(tenantId: string): Promise<any[]> {
    return this.db
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
      .orderBy(desc(inboundEmails.createdAt));
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

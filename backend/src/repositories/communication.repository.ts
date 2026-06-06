import { eq, desc, and } from 'drizzle-orm';
import { communications } from '../db/index.js';
import type { DatabaseClient } from '../db/index.js';
import type { Communication, NewCommunication } from '../db/index.js';

export class CommunicationRepository {
  constructor(private db: DatabaseClient) {}

  async findByInvoiceId(invoiceId: string): Promise<Communication[]> {
    return this.db
      .select()
      .from(communications)
      .where(eq(communications.invoiceId, invoiceId))
      .orderBy(desc(communications.createdAt));
  }

  async countSuccessfulByInvoiceId(invoiceId: string): Promise<number> {
    const comms = await this.db
      .select()
      .from(communications)
      .where(
        and(
          eq(communications.invoiceId, invoiceId),
          eq(communications.status, 'sent')
        )
      );
    return comms.length;
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
}

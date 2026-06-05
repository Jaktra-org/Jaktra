import { eq, desc } from 'drizzle-orm';
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

  async create(data: NewCommunication): Promise<Communication> {
    const rows = await this.db
      .insert(communications)
      .values(data)
      .returning();
    return rows[0]!;
  }
}

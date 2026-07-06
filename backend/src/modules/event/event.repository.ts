import { eq, asc, desc, sql, and } from 'drizzle-orm';
import { events, invoices } from '../../db/index.js';
import type { DatabaseClient } from '../../db/index.js';
import type { Event, NewEvent } from '../../db/index.js';

export class EventRepository {
  constructor(private db: DatabaseClient) {}

  async findByInvoiceId(invoiceId: string): Promise<Event[]> {
    return this.db
      .select()
      .from(events)
      .where(eq(events.entityId, invoiceId))
      .orderBy(asc(events.createdAt));
  }

  async findLatestEmailSent(invoiceId: string): Promise<Event | undefined> {
    const [row] = await this.db
      .select()
      .from(events)
      .where(
        and(
          eq(events.entityId, invoiceId),
          eq(events.eventType, 'email_sent')
        )
      )
      .orderBy(desc(events.createdAt))
      .limit(1);
    return row;
  }

  async findByRunId(runId: string): Promise<Event[]> {
    return this.db
      .select()
      .from(events)
      .where(sql`${events.payload}->>'runId' = ${runId}`)
      .orderBy(asc(events.createdAt));
  }

  async getTenantFeed(tenantId: string, limit: number = 50) {
    const rows = await this.db
      .select({
        event: events,
        invoiceNo: invoices.invoiceNo,
      })
      .from(events)
      .innerJoin(invoices, eq(events.entityId, invoices.id))
      .where(eq(events.tenantId, tenantId))
      .orderBy(desc(events.createdAt))
      .limit(limit);

    return rows.map((row) => ({
      ...row.event,
      invoiceNo: row.invoiceNo,
    }));
  }

  async create(data: NewEvent, tx?: any): Promise<Event> {
    const dbClient = tx || this.db;
    const rows = await dbClient.insert(events).values(data).returning();
    return rows[0]!;
  }

  async createMany(data: NewEvent[], tx?: any): Promise<Event[]> {
    if (data.length === 0) return [];
    const dbClient = tx || this.db;
    return await dbClient.insert(events).values(data).returning();
  }
}

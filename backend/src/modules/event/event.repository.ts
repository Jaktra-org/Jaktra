import { eq, asc, desc, sql, and, inArray, gte, lte } from 'drizzle-orm';
import { events, invoices } from '../../db/index.js';
import type { DatabaseClient, DatabaseOrTransaction } from '../../db/index.js';
import type { Event, NewEvent } from '../../db/index.js';
import { ACTIVITY_LOG_VISIBLE_ACTIONS, type ActionType } from './event.action-types.js';
import crypto from 'crypto';

export class EventRepository {
  constructor(public readonly db: DatabaseClient) {}

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
      .where(sql`JSON_UNQUOTE(JSON_EXTRACT(${events.payload}, '$.runId')) = ${runId}`)
      .orderBy(asc(events.createdAt));
  }

  async getTenantFeed(tenantId: string, limit: number = 50): Promise<Array<Event & { invoiceId: string; invoiceNo: string }>> {
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
      invoiceId: row.event.entityId,
      invoiceNo: row.invoiceNo,
    }));
  }

  async create(data: NewEvent, tx?: DatabaseOrTransaction): Promise<Event> {
    const dbClient = tx || this.db;
    const id = data.id || crypto.randomUUID();
    const insertData = { ...data, id };
    await dbClient.insert(events).values(insertData);
    const [row] = await dbClient.select().from(events).where(eq(events.id, id)).limit(1);
    return row!;
  }

  async createMany(data: NewEvent[], tx?: DatabaseOrTransaction): Promise<Event[]> {
    if (data.length === 0) return [];
    const dbClient = tx || this.db;
    const items = data.map((item) => ({
      ...item,
      id: item.id || crypto.randomUUID(),
    }));
    const ids = items.map((item) => item.id);
    await dbClient.insert(events).values(items);
    return await dbClient.select().from(events).where(inArray(events.id, ids));
  }

  async findByEntityPaginated(
    tenantId: string,
    entityType: string,
    entityId: string,
    filters: {
      actionTypes?: ActionType[];
      sources?: string[];
      actorId?: string;
      from?: Date;
      to?: Date;
    },
    page: number,
    limit: number,
  ): Promise<{ data: Event[]; total: number }> {
    const conditions = [
      eq(events.tenantId, tenantId),
      eq(events.entityType, entityType),
      eq(events.entityId, entityId),
    ];

    if (filters.actionTypes && filters.actionTypes.length > 0) {
      conditions.push(inArray(events.actionType, filters.actionTypes));
    }
    if (filters.sources && filters.sources.length > 0) {
      conditions.push(inArray(events.source, filters.sources));
    }
    if (filters.actorId) {
      conditions.push(eq(events.actorId, filters.actorId));
    }
    if (filters.from) {
      conditions.push(gte(events.createdAt, filters.from));
    }
    if (filters.to) {
      conditions.push(lte(events.createdAt, filters.to));
    }

    const whereClause = and(...conditions);
    const offset = (page - 1) * limit;

    const [countResult] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(events)
      .where(whereClause);

    const total = Number(countResult?.count ?? 0);

    const data = await this.db
      .select()
      .from(events)
      .where(whereClause)
      .orderBy(desc(events.createdAt))
      .limit(limit)
      .offset(offset);

    return { data, total };
  }

  async findTenantEventsPaginated(
    tenantId: string,
    filters: {
      actionTypes?: ActionType[];
      sources?: string[];
      actorId?: string;
      from?: Date;
      to?: Date;
    },
    page: number,
    limit: number,
  ): Promise<{ data: (typeof import('../../db/schema.js').events.$inferSelect & { invoiceNo: string | null; invoiceDeletedAt: Date | null })[]; total: number }> {
    const conditions = [
      eq(events.tenantId, tenantId),
    ];

    const allowedActions = filters.actionTypes && filters.actionTypes.length > 0
      ? filters.actionTypes.filter(type => ACTIVITY_LOG_VISIBLE_ACTIONS.includes(type))
      : ACTIVITY_LOG_VISIBLE_ACTIONS;

    if (allowedActions.length > 0) {
      conditions.push(inArray(events.actionType, allowedActions));
    } else {
      conditions.push(sql`1 = 0`);
    }
    if (filters.sources && filters.sources.length > 0) {
      conditions.push(inArray(events.source, filters.sources));
    }
    if (filters.actorId) {
      conditions.push(eq(events.actorId, filters.actorId));
    }
    if (filters.from) {
      conditions.push(gte(events.createdAt, filters.from));
    }
    if (filters.to) {
      conditions.push(lte(events.createdAt, filters.to));
    }

    const whereClause = and(...conditions);
    const offset = (page - 1) * limit;

    const [countResult] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(events)
      .where(whereClause);

    const total = Number(countResult?.count ?? 0);

    const data = await this.db
      .select({
        id: events.id,
        tenantId: events.tenantId,
        entityType: events.entityType,
        entityId: events.entityId,
        actorId: events.actorId,
        actorName: events.actorName,
        actorEmail: events.actorEmail,
        actorRole: events.actorRole,
        actionType: events.actionType,
        description: events.description,
        source: events.source,
        oldValues: events.oldValues,
        newValues: events.newValues,
        eventType: events.eventType,
        payload: events.payload,
        createdAt: events.createdAt,
        invoiceNo: invoices.invoiceNo,
        invoiceDeletedAt: invoices.deletedAt,
      })
      .from(events)
      .leftJoin(invoices, and(eq(events.entityType, 'invoice'), eq(events.entityId, invoices.id)))
      .where(whereClause)
      .orderBy(desc(events.createdAt))
      .limit(limit)
      .offset(offset);

    return { data, total };
  }
}

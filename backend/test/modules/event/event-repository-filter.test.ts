import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest';
import { createDatabaseClient } from '../../../src/db/index.js';
import { config } from '../../../src/config/env.js';
import { inArray } from 'drizzle-orm';
import { tenants, events } from '../../../src/db/schema.js';
import { EventRepository } from '../../../src/modules/event/event.repository.js';
import crypto from 'crypto';

describe('EventRepository - Filtering and Pagination', () => {
  let eventRepo: EventRepository;
  let db: any;
  
  let tenantId1: string;
  let tenantId2: string;
  let entityId1: string;

  let testTenantIds: string[] = [];
  let testEventIds: string[] = [];

  beforeAll(async () => {
    db = createDatabaseClient({ connectionString: config.DATABASE_URL });
    eventRepo = new EventRepository(db);
  });

  beforeEach(async () => {
    testTenantIds = [];
    testEventIds = [];

    const uniqueSuffix = crypto.randomUUID().substring(0, 8);
    const [t1] = await db.insert(tenants).values({ name: 'Tenant A', slug: `ta-${uniqueSuffix}` }).returning();
    const [t2] = await db.insert(tenants).values({ name: 'Tenant B', slug: `tb-${uniqueSuffix}` }).returning();
    
    tenantId1 = t1.id;
    tenantId2 = t2.id;
    testTenantIds.push(t1.id, t2.id);

    entityId1 = crypto.randomUUID();

    // Insert mock events for tenant 1
    const mockEvents = [
      {
        tenantId: tenantId1,
        entityType: 'invoice',
        entityId: entityId1,
        actionType: 'invoice.created',
        source: 'ui',
        eventType: 'invoice.created',
        createdAt: new Date('2026-06-22T01:00:00Z'),
      },
      {
        tenantId: tenantId1,
        entityType: 'invoice',
        entityId: entityId1,
        actionType: 'invoice.status_changed',
        source: 'ui',
        eventType: 'status_changed',
        createdAt: new Date('2026-06-22T02:00:00Z'),
      },
      {
        tenantId: tenantId1,
        entityType: 'invoice',
        entityId: entityId1,
        actionType: 'followup.sent',
        source: 'agent',
        eventType: 'email_sent',
        createdAt: new Date('2026-06-22T03:00:00Z'),
      },
      {
        tenantId: tenantId1,
        entityType: 'invoice',
        entityId: entityId1,
        actionType: 'payment.received',
        source: 'webhook',
        eventType: 'payment_received',
        createdAt: new Date('2026-06-22T04:00:00Z'),
      },
    ];

    // Insert events one by one or in batch
    const createdEvents = await db.insert(events).values(mockEvents).returning();
    testEventIds.push(...createdEvents.map((e: any) => e.id));

    // Insert mock event for tenant 2 to test isolation
    const [t2Event] = await db.insert(events).values({
      tenantId: tenantId2,
      entityType: 'invoice',
      entityId: entityId1, // same entity id, different tenant
      actionType: 'invoice.created',
      source: 'ui',
      eventType: 'invoice.created',
    }).returning();
    testEventIds.push(t2Event.id);
  });

  afterEach(async () => {
    if (testEventIds.length > 0) {
      await db.delete(events).where(inArray(events.id, testEventIds));
    }
    if (testTenantIds.length > 0) {
      await db.delete(tenants).where(inArray(tenants.id, testTenantIds));
    }
  });

  it('should respect actionTypes filter', async () => {
    const result = await eventRepo.findByEntityPaginated(
      tenantId1,
      'invoice',
      entityId1,
      { actionTypes: ['invoice.status_changed', 'payment.received'] },
      1,
      10
    );

    expect(result.total).toBe(2);
    expect(result.data.length).toBe(2);
    expect(result.data.map(e => e.actionType)).toContain('invoice.status_changed');
    expect(result.data.map(e => e.actionType)).toContain('payment.received');
  });

  it('should respect sources filter', async () => {
    const result = await eventRepo.findByEntityPaginated(
      tenantId1,
      'invoice',
      entityId1,
      { sources: ['agent'] },
      1,
      10
    );

    expect(result.total).toBe(1);
    expect(result.data[0].actionType).toBe('followup.sent');
    expect(result.data[0].source).toBe('agent');
  });

  it('should respect date range filter (from/to)', async () => {
    const result = await eventRepo.findByEntityPaginated(
      tenantId1,
      'invoice',
      entityId1,
      {
        from: new Date('2026-06-22T01:30:00Z'),
        to: new Date('2026-06-22T03:30:00Z'),
      },
      1,
      10
    );

    expect(result.total).toBe(2);
    expect(result.data.map(e => e.actionType)).toContain('invoice.status_changed');
    expect(result.data.map(e => e.actionType)).toContain('followup.sent');
  });

  it('should support pagination (limit/offset)', async () => {
    // Sort is DESC, so:
    // 04:00 (received)
    // 03:00 (sent)
    // 02:00 (status_changed)
    // 01:00 (created)
    // Limit = 2, Page = 2: should return status_changed and created
    const result = await eventRepo.findByEntityPaginated(
      tenantId1,
      'invoice',
      entityId1,
      {},
      2,
      2
    );

    expect(result.total).toBe(4);
    expect(result.data.length).toBe(2);
    expect(result.data[0].actionType).toBe('invoice.status_changed');
    expect(result.data[1].actionType).toBe('invoice.created');
  });

  it('should isolate events strictly by tenantId', async () => {
    const resultTenant1 = await eventRepo.findByEntityPaginated(
      tenantId1,
      'invoice',
      entityId1,
      {},
      1,
      10
    );
    expect(resultTenant1.total).toBe(4);

    const resultTenant2 = await eventRepo.findByEntityPaginated(
      tenantId2,
      'invoice',
      entityId1,
      {},
      1,
      10
    );
    expect(resultTenant2.total).toBe(1);
    expect(resultTenant2.data[0].tenantId).toBe(tenantId2);
  });
});

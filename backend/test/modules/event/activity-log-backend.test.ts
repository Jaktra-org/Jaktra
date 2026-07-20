/**
 * Unit & Integration tests for Phase 11: Backend Read API
 *
 * Covers:
 *  - GET /api/events route authorization (admin/manager allowed, viewer forbidden with 403)
 *  - Controller query parameter parsing and delegation to EventService
 *  - Tenant Isolation Smoke Test on EventRepository.findTenantEventsPaginated
 */

import { describe, it, expect, beforeAll, beforeEach, afterEach, afterAll, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import { createEventRouter } from '../../../src/modules/event/event.routes.js';
import { EventController } from '../../../src/modules/event/event.controller.js';
import { createDatabaseClient } from '../../../src/db/index.js';
import { config } from '../../../src/config/env.js';
import { inArray } from 'drizzle-orm';
import { tenants, events } from '../../../src/db/schema.js';
import { EventRepository } from '../../../src/modules/event/event.repository.js';
import crypto from 'crypto';

describe('GET /api/events Routing & Role Restrictions', () => {
  let app: express.Application;
  let mockEventService: any;
  let currentUser: { role: string; tenantId: string };

  beforeEach(() => {
    // Reset mock user context for each test
    currentUser = { role: 'admin', tenantId: 'tenant-123' };

    mockEventService = {
      listAll: vi.fn().mockResolvedValue({
        data: [{ id: 'evt-1', actionType: 'settings.updated' }],
        pagination: { total: 1, page: 1, limit: 25, totalPages: 1 },
      }),
      emitEvent: vi.fn(),
      getFeed: vi.fn(),
      listByEntity: vi.fn(),
    };

    const controller = new EventController(mockEventService);

    // Mock middlewares to simulate authentication and tenant injection
    const authMiddleware = (req: any, res: any, next: any): void => {
      req.user = {
        userId: 'user-999',
        name: 'Test User',
        email: 'test@example.com',
        role: currentUser.role,
        tenantId: currentUser.tenantId,
      };
      next();
    };

    const tenantScoped = (req: any, res: any, next: any): void => {
      res.locals.tenantId = currentUser.tenantId;
      next();
    };

    app = express();
    app.use(express.json());
    app.use('/api', createEventRouter(controller, authMiddleware as any, tenantScoped as any));

    // Error handler for ForbiddenError, etc.
    app.use((err: any, req: any, res: any, _next: any) => {
      res.status(err.statusCode || 500).json({ error: err.message });
    });
  });

  it('allows admin users to read the activity log', async () => {
    currentUser.role = 'admin';
    const res = await request(app).get('/api/events');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].actionType).toBe('settings.updated');
  });

  it('allows manager users to read the activity log', async () => {
    currentUser.role = 'manager';
    const res = await request(app).get('/api/events');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('denies viewer users to read the activity log with 403 Forbidden', async () => {
    currentUser.role = 'viewer';
    const res = await request(app).get('/api/events');
    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('error', 'Insufficient permissions');
  });

  it('correctly parses and forwards query parameters to event service', async () => {
    currentUser.role = 'admin';
    const res = await request(app)
      .get('/api/events')
      .query({
        page: '2',
        limit: '15',
        action_types: 'user.invited,user.joined',
        sources: 'ui,agent',
        actor_id: 'user-000',
        from: '2026-06-01T00:00:00.000Z',
        to: '2026-06-30T23:59:59.000Z',
      });

    expect(res.status).toBe(200);
    expect(mockEventService.listAll).toHaveBeenCalledOnce();
    const args = mockEventService.listAll.mock.calls[0];
    
    expect(args[0]).toBe('tenant-123'); // tenantId
    expect(args[1]).toEqual({
      actionTypes: ['user.invited', 'user.joined'],
      sources: ['ui', 'agent'],
      actorId: 'user-000',
      from: new Date('2026-06-01T00:00:00.000Z'),
      to: new Date('2026-06-30T23:59:59.000Z'),
    }); // filters
    expect(args[2]).toBe(2); // page
    expect(args[3]).toBe(15); // limit
  });
});

describe('EventRepository.findTenantEventsPaginated (Tenant Isolation Smoke Test)', () => {
  let db: any;
  let eventRepo: EventRepository;
  
  let tenantAId: string;
  let tenantBId: string;
  
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
    const [tA] = await db.insert(tenants).values({ name: 'Tenant A', slug: `ta-${uniqueSuffix}` }).returning();
    const [tB] = await db.insert(tenants).values({ name: 'Tenant B', slug: `tb-${uniqueSuffix}` }).returning();
    
    tenantAId = tA.id;
    tenantBId = tB.id;
    testTenantIds.push(tA.id, tB.id);

    // Insert events for Tenant A
    const evtsA = await db.insert(events).values([
      {
        tenantId: tenantAId,
        entityType: 'settings',
        entityId: tenantAId,
        actionType: 'settings.updated',
        source: 'ui',
        eventType: 'settings.updated',
      },
      {
        tenantId: tenantAId,
        entityType: 'user',
        entityId: crypto.randomUUID(),
        actionType: 'user.invited',
        source: 'ui',
        eventType: 'user.invited',
      }
    ]).returning();
    testEventIds.push(...evtsA.map((e: any) => e.id));

    // Insert event for Tenant B
    const [evtB] = await db.insert(events).values({
      tenantId: tenantBId,
      entityType: 'settings',
      entityId: tenantBId,
      actionType: 'settings.webhook_token_rotated',
      source: 'ui',
      eventType: 'settings.webhook_token_rotated',
    }).returning();
    testEventIds.push(evtB.id);
  });

  afterEach(async () => {
    if (testEventIds.length > 0) {
      await db.delete(events).where(inArray(events.id, testEventIds));
    }
    if (testTenantIds.length > 0) {
      await db.delete(tenants).where(inArray(tenants.id, testTenantIds));
    }
  });

  afterAll(async () => {
    if (db && db.$pool) {
      await db.$pool.end();
    }
  });

  it('strictly isolates queries by tenantId (smoke test)', async () => {
    // Query for Tenant A
    const resA = await eventRepo.findTenantEventsPaginated(tenantAId, {}, 1, 10);
    expect(resA.total).toBe(2);
    expect(resA.data).toHaveLength(2);
    expect(resA.data.every(e => e.tenantId === tenantAId)).toBe(true);

    // Query for Tenant B
    const resB = await eventRepo.findTenantEventsPaginated(tenantBId, {}, 1, 10);
    expect(resB.total).toBe(1);
    expect(resB.data).toHaveLength(1);
    expect(resB.data[0].tenantId).toBe(tenantBId);
    expect(resB.data[0].actionType).toBe('settings.webhook_token_rotated');
  });
});

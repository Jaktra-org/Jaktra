import { describe, it, expect, beforeEach, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import { createDlqRouter } from '../../../src/modules/dlq/dlq.routes.js';

describe('DLQ Routes - Role Restrictions', () => {
  let app: express.Application;
  let mockController: any;
  let currentUser: { role: string; tenantId: string };

  beforeEach(() => {
    currentUser = { role: 'admin', tenantId: 'tenant-123' };

    mockController = {
      getEntries: vi.fn().mockImplementation((req: any, res: any) => {
        res.status(200).json([
          { invoiceId: 'inv-1', consecutiveFailures: 2, lastError: 'Bounced' },
        ]);
      }),
      getStats: vi.fn().mockImplementation((req: any, res: any) => {
        res.status(200).json({ total: 5, critical: 1 });
      }),
      deleteEntry: vi.fn().mockImplementation((req: any, res: any) => {
        res.status(200).json({ success: true });
      }),
    };

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
    app.use('/api/dlq', createDlqRouter(mockController, authMiddleware, tenantScoped));

    app.use((err: any, req: any, res: any, _next: any) => {
      res.status(err.statusCode || 500).json({ error: err.message });
    });
  });

  // --- GET / (list DLQ entries) ---

  it('allows admin to list DLQ entries', async () => {
    currentUser.role = 'admin';
    const res = await request(app).get('/api/dlq/');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      { invoiceId: 'inv-1', consecutiveFailures: 2, lastError: 'Bounced' },
    ]);
  });

  it('allows manager to list DLQ entries', async () => {
    currentUser.role = 'manager';
    const res = await request(app).get('/api/dlq/');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it('denies viewer from listing DLQ entries with 403', async () => {
    currentUser.role = 'viewer';
    const res = await request(app).get('/api/dlq/');
    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('error', 'Insufficient permissions');
  });

  // --- GET /stats ---

  it('allows admin to view DLQ stats', async () => {
    currentUser.role = 'admin';
    const res = await request(app).get('/api/dlq/stats');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ total: 5, critical: 1 });
  });

  it('allows manager to view DLQ stats', async () => {
    currentUser.role = 'manager';
    const res = await request(app).get('/api/dlq/stats');
    expect(res.status).toBe(200);
  });

  it('denies viewer from viewing DLQ stats with 403', async () => {
    currentUser.role = 'viewer';
    const res = await request(app).get('/api/dlq/stats');
    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('error', 'Insufficient permissions');
  });

  // --- DELETE /:invoice_id (existing restriction, regression check) ---

  it('allows admin to delete a DLQ entry', async () => {
    currentUser.role = 'admin';
    const res = await request(app).delete('/api/dlq/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });
  });

  it('allows manager to delete a DLQ entry', async () => {
    currentUser.role = 'manager';
    const res = await request(app).delete('/api/dlq/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
    expect(res.status).toBe(200);
  });

  it('denies viewer from deleting a DLQ entry with 403', async () => {
    currentUser.role = 'viewer';
    const res = await request(app).delete('/api/dlq/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('error', 'Insufficient permissions');
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import { createIntegrationRouter } from '../../../src/modules/settings/integration.routes.js';

describe('GET /api/settings/integrations/ Routing & Role Restrictions', () => {
  let app: express.Application;
  let mockController: any;
  let currentUser: { role: string; tenantId: string };

  beforeEach(() => {
    currentUser = { role: 'admin', tenantId: 'tenant-123' };

    const dummyHandler = vi.fn().mockImplementation((req: any, res: any) => res.status(200).send());
    mockController = {
      getStatus: vi.fn().mockImplementation((req: any, res: any) => {
        res.status(200).json({ sendgrid: {}, smtp: {}, razorpay: {} });
      }),
      getSendgridHealth: dummyHandler,
      saveSendgridKey: dummyHandler,
      testSendgridKey: dummyHandler,
      disconnectSendgrid: dummyHandler,
      saveSmtpConfig: dummyHandler,
      testSmtpConfig: dummyHandler,
      disconnectSmtp: dummyHandler,
      setDefaultProvider: dummyHandler,
      saveRazorpayKey: dummyHandler,
      disconnectRazorpay: dummyHandler,
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
    
    // Wire up authMiddleware and tenantScoped first, mimicking app.ts:
    app.use('/api/settings/integrations', authMiddleware, tenantScoped, createIntegrationRouter(mockController));

    app.use((err: any, req: any, res: any, _next: any) => {
      res.status(err.statusCode || 500).json({ error: err.message });
    });
  });

  it('allows admin users to read integrations status', async () => {
    currentUser.role = 'admin';
    const res = await request(app).get('/api/settings/integrations');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('sendgrid');
  });

  it('allows manager users to read integrations status', async () => {
    currentUser.role = 'manager';
    const res = await request(app).get('/api/settings/integrations');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('sendgrid');
  });

  it('denies viewer users to read integrations status with 403 Forbidden', async () => {
    currentUser.role = 'viewer';
    const res = await request(app).get('/api/settings/integrations');
    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('error', 'Insufficient permissions');
  });
});

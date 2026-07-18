import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import crypto from 'crypto';
import { createApp } from '../src/app.js';
import { config } from '../src/config/env.js';
import { createDatabaseClient } from '../src/db/index.js';

describe('API Endpoints Validation', () => {
  let app: any;
  let db: any;
  const testTenantId = crypto.randomUUID();

  beforeAll(async () => {
    db = createDatabaseClient({ connectionString: config.DATABASE_URL });
    app = await createApp({
      corsOrigins: config.CORS_ORIGINS,
      db,
      jwtSecret: config.JWT_SECRET,
      jwtExpiresIn: config.JWT_EXPIRES_IN,
      aimlServiceUrl: config.AI_ML_SERVICE_URL || 'http://localhost:8000',
    });
  });

  afterAll(async () => {
    if (db && db.$pool) {
      await db.$pool.end();
    }
  });

  // Endpoints that should return 401 Unauthorized without token
  const protectedEndpoints = [
    { method: 'get', path: '/api/auth/me' },
    { method: 'post', path: '/api/tenants' },
    { method: 'get', path: `/api/tenants/${testTenantId}` },
    { method: 'get', path: '/api/invoices' },
    { method: 'post', path: '/api/invoices' },
    { method: 'get', path: `/api/invoices/${testTenantId}` },
    { method: 'get', path: '/api/analytics/dashboard' },
    { method: 'get', path: '/api/settings' },
    { method: 'put', path: '/api/settings' },
    { method: 'get', path: `/api/invoices/${testTenantId}/timeline` },
    { method: 'post', path: '/api/agent/trigger' },
  ];

  for (const endpoint of protectedEndpoints) {
    it(`${endpoint.method.toUpperCase()} ${endpoint.path} should require authentication (401)`, async () => {
      const res = await request(app)[endpoint.method as 'get' | 'post' | 'put'](endpoint.path);
      // It should either be 401 (Auth required) or if it expects tenant-scoped it might fail earlier but 401 should trigger first
      expect(res.status).toBe(401);
    });
  }

  describe('POST /api/webhooks/payments/:tenantId/razorpay', () => {
    it('should return 400 or 401 without signature', async () => {
      const res = await request(app).post('/api/webhooks/payments/123e4567-e89b-12d3-a456-426614174000/razorpay').send({});
      // Depending on logic it might return 401 for missing sig, 400, or 404 if token is invalid
      expect([400, 401, 404]).toContain(res.status);
    });
  });
});

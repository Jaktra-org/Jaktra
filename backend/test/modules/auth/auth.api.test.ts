import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../../src/app.js';
import { config } from '../../../src/config/env.js';
import { createDatabaseClient } from '../../../src/db/index.js';

describe('Auth API', () => {
  let app: any;
  let db: any;
  const testEmail = `testuser-${Date.now()}@example.com`;
  const testPassword = 'SecurePassword123!';

  beforeAll(async () => {
    db = createDatabaseClient({ connectionString: config.DATABASE_URL });
    app = await createApp({
      corsOrigins: config.CORS_ORIGINS,
      db,
      jwtSecret: config.JWT_SECRET,
      jwtExpiresIn: config.JWT_EXPIRES_IN,
    });
  });

  afterAll(async () => {
    if (db && db.$pool) {
      await db.$pool.end();
    }
  });

  it('POST /api/auth/onboard should fail without companyName', async () => {
    const res = await request(app)
      .post('/api/auth/onboard')
      .send({
        name: 'Jane',
        email: testEmail,
        password: testPassword
      });
    expect(res.status).toBe(400); // Bad Request (Zod validation)
  });

  // Since we are running against the real DB, we can't easily guarantee test isolation 
  // unless we insert a tenant first, but we don't want to create junk data if we can avoid it.
  // Instead we'll just verify the endpoints correctly parse inputs and return valid errors.
  
  it('POST /api/auth/login should fail with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nobody@nowhere.com',
        password: 'wrongpassword'
      });
    expect(res.status).toBe(401);
  });

  it('POST /api/auth/login should fail input validation if email missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        password: 'wrongpassword'
      });
    expect(res.status).toBe(400); // Bad Request
  });
});

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { config } from '../src/config/env.js';
import { createDatabaseClient } from '../src/db/index.js';

describe('Health API', () => {
  let app: any;
  let db: any;

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

  it('GET /api/health should return ok status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('environment');
  });
});

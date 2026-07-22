import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { WebhookController } from '../../../src/modules/webhook/webhook.controller.js';

// ── Mocks ────────────────────────────────────────────────────────────

vi.mock('../../../src/shared/logger.js', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    child: vi.fn(),
  },
}));

vi.mock('../../../src/config/index.js', () => ({
  config: {
    SENDGRID_INBOUND_PARSE_SECRET: 'correct-secret-token-abc123',
  },
}));

// timingSafeCompare and extractEmail are real crypto ops — mock at module
// level so we control the comparison result without needing real crypto.
vi.mock('../../../src/modules/dispute/dispute.service.js', () => ({
  timingSafeCompare: (a: string, b: string) => a === b,
  extractEmail: (raw: string | undefined) => {
    if (!raw) return null;
    const m = raw.match(/<([^>]+)>/);
    return m?.[1]?.trim().toLowerCase() ?? raw.trim().toLowerCase();
  },
}));

import { logger } from '../../../src/shared/logger.js';

// ── Helpers ──────────────────────────────────────────────────────────

function makeRedis(overrides: Record<string, unknown> = {}): any {
  const store: Record<string, { value: string; ttl?: number }> = {};

  return {
    isOpen: true,
    get: vi.fn(async (key: string) => store[key]?.value ?? null),
    set: vi.fn(async (key: string, value: string, opts?: { EX?: number }) => {
      store[key] = { value, ttl: opts?.EX };
    }),
    incr: vi.fn(async (key: string) => {
      const current = parseInt(store[key]?.value ?? '0', 10);
      const next = current + 1;
      store[key] = { value: String(next), ttl: store[key]?.ttl };
      return next;
    }),
    expire: vi.fn(async (key: string, seconds: number) => {
      if (store[key]) store[key].ttl = seconds;
      return 1;
    }),
    del: vi.fn(async (key: string) => {
      const existed = key in store;
      delete store[key];
      return existed ? 1 : 0;
    }),
    exists: vi.fn(async (key: string) => (key in store ? 1 : 0)),
    _store: store,
    ...overrides,
  };
}

function mockRes(): Response {
  const res: Partial<Response> = {
    status: vi.fn().mockReturnThis() as any,
    json: vi.fn().mockReturnThis() as any,
  };
  return res as Response;
}

function makeReq(
  secretToken: string,
  ip = '1.2.3.4',
  body: Record<string, unknown> = {},
): Request {
  return {
    params: { secretToken },
    ip,
    body,
    headers: {},
  } as unknown as Request;
}

const VALID_SECRET = 'correct-secret-token-abc123';
const INVALID_SECRET = 'wrong-token-xyz';

function makeController(redisClient: any = null): WebhookController {
  // Provide minimal stubs for required constructor deps; inbound handler
  // doesn't touch most of them.
  return new WebhookController(
    {} as any,      // gatewayFactory
    {} as any,      // webhookService
    {} as any,      // paymentService
    {} as any,      // settingsRepo
    undefined,      // sendgridService
    undefined,      // disputeService
    redisClient,    // redisClient
  );
}

// ── Tests ────────────────────────────────────────────────────────────

describe('WebhookController.handleSendgridInbound — security hardening', () => {
  const next: NextFunction = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── Test 1: Structured security log on invalid token ──────────────

  it('logs a structured securityEvent warning on invalid token', async () => {
    const redis = makeRedis();
    const controller = makeController(redis);
    const req = makeReq(INVALID_SECRET, '10.0.0.1');
    const res = mockRes();

    await controller.handleSendgridInbound(req, res, next);

    expect(logger.warn).toHaveBeenCalledWith(
      expect.objectContaining({
        securityEvent: 'webhook_invalid_token',
        sourceIp: '10.0.0.1',
        endpoint: 'sendgrid_inbound_parse',
        tokenHash: expect.stringMatching(/^[a-f0-9]{8}$/),
      }),
      expect.stringContaining('invalid secret token'),
    );
  });

  // ─── Test 2: Valid token proceeds normally ─────────────────────────

  it('does not log a security warning for a valid token', async () => {
    const redis = makeRedis();
    const controller = makeController(redis);
    const req = makeReq(VALID_SECRET, '10.0.0.1', {
      from: 'a@b.com',
      to: 'c@d.com',
      subject: 'test',
    });
    const res = mockRes();

    await controller.handleSendgridInbound(req, res, next);

    // No security event should have been logged
    const warnCalls = (logger.warn as any).mock.calls;
    const securityWarns = warnCalls.filter(
      (call: any[]) =>
        typeof call[0] === 'object' &&
        (call[0].securityEvent === 'webhook_invalid_token' ||
         call[0].securityEvent === 'webhook_rate_limited'),
    );
    expect(securityWarns).toHaveLength(0);

    // Should have returned 200 success
    expect(res.status).toHaveBeenCalledWith(200);
  });

  // ─── Test 3: Rate limiter blocks after threshold ───────────────────

  it('rate-limits after 15 invalid-token attempts from the same IP', async () => {
    const redis = makeRedis();
    const controller = makeController(redis);
    const attackerIp = '192.168.1.100';

    // Send 15 invalid-token requests to fill the counter
    for (let i = 0; i < 15; i++) {
      const req = makeReq(INVALID_SECRET, attackerIp);
      const res = mockRes();
      await controller.handleSendgridInbound(req, res, next);
    }

    // The 16th request should be short-circuited by rate limiter
    vi.clearAllMocks();
    const req = makeReq(INVALID_SECRET, attackerIp);
    const res = mockRes();
    await controller.handleSendgridInbound(req, res, next);

    // Should have logged rate_limited event, not invalid_token
    expect(logger.warn).toHaveBeenCalledWith(
      expect.objectContaining({
        securityEvent: 'webhook_rate_limited',
        sourceIp: attackerIp,
      }),
      expect.stringContaining('rate-limited'),
    );

    // Should still return 200
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'ignored', reason: 'not_processed' }),
    );
  });

  // ─── Test 4: Rate limiter is per-IP ────────────────────────────────

  it('rate-limits each IP independently', async () => {
    const redis = makeRedis();
    const controller = makeController(redis);
    const ipA = '10.0.0.1';
    const ipB = '10.0.0.2';

    // Fill the counter for IP-A
    for (let i = 0; i < 15; i++) {
      await controller.handleSendgridInbound(
        makeReq(INVALID_SECRET, ipA),
        mockRes(),
        next,
      );
    }

    // IP-A is now rate-limited
    vi.clearAllMocks();
    const resA = mockRes();
    await controller.handleSendgridInbound(makeReq(INVALID_SECRET, ipA), resA, next);
    expect(logger.warn).toHaveBeenCalledWith(
      expect.objectContaining({ securityEvent: 'webhook_rate_limited', sourceIp: ipA }),
      expect.any(String),
    );

    // IP-B should NOT be rate-limited — still gets the normal invalid_token flow
    vi.clearAllMocks();
    const resB = mockRes();
    await controller.handleSendgridInbound(makeReq(INVALID_SECRET, ipB), resB, next);
    expect(logger.warn).toHaveBeenCalledWith(
      expect.objectContaining({ securityEvent: 'webhook_invalid_token', sourceIp: ipB }),
      expect.any(String),
    );
  });

  // ─── Test 5: Response doesn't leak 'invalid_secret' ────────────────

  it('response body uses generic reason, never leaks invalid_secret', async () => {
    const redis = makeRedis();
    const controller = makeController(redis);
    const req = makeReq(INVALID_SECRET);
    const res = mockRes();

    await controller.handleSendgridInbound(req, res, next);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ reason: 'not_processed' }),
    );
    expect(res.json).not.toHaveBeenCalledWith(
      expect.objectContaining({ reason: 'invalid_secret' }),
    );
  });

  // ─── Test 6: Window expiry recovery ────────────────────────────────

  it('allows valid requests after the rate-limit window expires', async () => {
    const redis = makeRedis();
    const controller = makeController(redis);
    const ip = '10.0.0.50';

    // Fill the rate-limit counter
    for (let i = 0; i < 15; i++) {
      await controller.handleSendgridInbound(
        makeReq(INVALID_SECRET, ip),
        mockRes(),
        next,
      );
    }

    // Simulate window expiry by clearing the Redis key
    delete redis._store[`webhook_invalid_token:${ip}`];

    // A valid-token request from the same IP should now succeed
    vi.clearAllMocks();
    const req = makeReq(VALID_SECRET, ip, {
      from: 'a@b.com',
      to: 'c@d.com',
      subject: 'test',
    });
    const res = mockRes();
    await controller.handleSendgridInbound(req, res, next);

    // No security event should fire
    const warnCalls = (logger.warn as any).mock.calls;
    const securityWarns = warnCalls.filter(
      (call: any[]) =>
        typeof call[0] === 'object' &&
        (call[0].securityEvent === 'webhook_rate_limited' ||
         call[0].securityEvent === 'webhook_invalid_token'),
    );
    expect(securityWarns).toHaveLength(0);

    // Should return 200 success
    expect(res.status).toHaveBeenCalledWith(200);
  });

  // ─── Test 7: Redis unavailable — fail-open ─────────────────────────

  it('fails open when Redis is unavailable (no throttling, but logs degraded event)', async () => {
    const controller = makeController(null); // no Redis

    // Send more than the threshold — should never be blocked
    for (let i = 0; i < 20; i++) {
      vi.clearAllMocks();
      const req = makeReq(INVALID_SECRET, '10.0.0.99');
      const res = mockRes();
      await controller.handleSendgridInbound(req, res, next);

      // Should always return 200 (never blocked)
      expect(res.status).toHaveBeenCalledWith(200);

      // Should log degraded event on each attempt
      expect(logger.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          securityEvent: 'webhook_ratelimit_degraded',
        }),
        expect.stringContaining('Redis unavailable'),
      );

      // Should ALSO log the invalid_token event (detection still works)
      expect(logger.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          securityEvent: 'webhook_invalid_token',
          sourceIp: '10.0.0.99',
        }),
        expect.any(String),
      );
    }
  });
});

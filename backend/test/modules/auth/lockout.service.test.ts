import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LockoutService } from '../../../src/modules/auth/lockout.service.js';
import { AuthError } from '../../../src/shared/errors/index.js';

// Minimal mock of the Redis client subset used by LockoutService
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
      store[key] = { value: String(next) };
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
    _store: store, // expose for assertions
    ...overrides,
  };
}

function makeMockEventRepo(): any {
  return { create: vi.fn().mockResolvedValue({}) };
}

const EMAIL = 'cfo@acme.com';
const TENANT_ID = 'tenant-1';
const USER_ID = 'user-abc';

// Override config defaults for tests
vi.mock('../../../src/config/index.js', () => ({
  config: {
    AUTH_LOCKOUT_THRESHOLD: 5,
    AUTH_LOCKOUT_BASE_MINUTES: 15,
    AUTH_LOCKOUT_MAX_MINUTES: 1440,
    AUTH_MFA_MAX_ATTEMPTS: 5,
  },
}));

describe('LockoutService — login lockout', () => {
  let redis: ReturnType<typeof makeRedis>;
  let eventRepo: any;
  let svc: LockoutService;

  beforeEach(() => {
    redis = makeRedis();
    eventRepo = makeMockEventRepo();
    svc = new LockoutService(redis, eventRepo);
  });

  it('allows login when no failures recorded', async () => {
    await expect(svc.checkLockout(EMAIL)).resolves.toBeUndefined();
  });

  it('increments the failure counter on recordFailure', async () => {
    await svc.recordFailure(EMAIL);
    expect(redis.incr).toHaveBeenCalledWith(`login_fail:${EMAIL}`);
  });

  it('does not lock out before threshold is reached', async () => {
    // Record 4 failures (threshold is 5)
    for (let i = 0; i < 4; i++) {
      await svc.recordFailure(EMAIL);
    }
    // Manually set counter to 4 so checkLockout reads it
    redis._store[`login_fail:${EMAIL}`] = { value: '4' };
    await expect(svc.checkLockout(EMAIL)).resolves.toBeUndefined();
  });

  it('locks out after threshold failures', async () => {
    // Record 5 failures
    for (let i = 0; i < 5; i++) {
      await svc.recordFailure(EMAIL);
    }
    // Simulate the counter being set at threshold
    redis._store[`login_fail:${EMAIL}`] = { value: '5' };
    await expect(svc.checkLockout(EMAIL)).rejects.toBeInstanceOf(AuthError);
  });

  it('lockout blocks login even with correct password (counter still present)', async () => {
    redis._store[`login_fail:${EMAIL}`] = { value: '5' };
    await expect(svc.checkLockout(EMAIL)).rejects.toBeInstanceOf(AuthError);
  });

  it('clearFailures removes the counter so login succeeds', async () => {
    redis._store[`login_fail:${EMAIL}`] = { value: '5' };
    await svc.clearFailures(EMAIL);
    expect(redis._store[`login_fail:${EMAIL}`]).toBeUndefined();
    await expect(svc.checkLockout(EMAIL)).resolves.toBeUndefined();
  });

  it('emits an audit event when lockout is triggered (tenantId provided)', async () => {
    // Trigger lockout by reaching threshold
    for (let i = 0; i < 5; i++) {
      await svc.recordFailure(EMAIL, TENANT_ID, USER_ID);
    }
    // Give the best-effort async event a tick to fire
    await new Promise((r) => setTimeout(r, 10));
    expect(eventRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: TENANT_ID,
        actionType: 'auth.account_locked',
        source: 'system',
      }),
    );
  });

  it('does NOT emit audit event when tenantId is unknown (user not found path)', async () => {
    for (let i = 0; i < 5; i++) {
      await svc.recordFailure(EMAIL); // no tenantId
    }
    await new Promise((r) => setTimeout(r, 10));
    expect(eventRepo.create).not.toHaveBeenCalled();
  });

  it('applies exponential backoff on second lockout (doubled TTL)', async () => {
    // Simulate a prior lockout count of 1
    redis._store[`login_lockout_count:${EMAIL}`] = { value: '1' };

    // Reach threshold again
    for (let i = 0; i < 5; i++) {
      await svc.recordFailure(EMAIL, TENANT_ID, USER_ID);
    }

    // Base is 15 min * 2^1 = 30 min = 1800s
    const calls = redis.expire.mock.calls;
    const lockoutExpireCall = calls.find((c: any[]) =>
      c[0] === `login_fail:${EMAIL}` && c[1] === 1800,
    );
    expect(lockoutExpireCall).toBeDefined();
  });

  it('caps exponential backoff at maxMinutes', async () => {
    // Simulate 100 prior lockouts — result should still be capped at 1440 min
    redis._store[`login_lockout_count:${EMAIL}`] = { value: '100' };

    for (let i = 0; i < 5; i++) {
      await svc.recordFailure(EMAIL, TENANT_ID, USER_ID);
    }

    const calls = redis.expire.mock.calls;
    const allTtls = calls
      .filter((c: any[]) => c[0] === `login_fail:${EMAIL}`)
      .map((c: any[]) => c[1]);
    const maxTtl = Math.max(...allTtls);
    expect(maxTtl).toBeLessThanOrEqual(1440 * 60);
  });

  it('fails open when Redis is unavailable — login is not blocked', async () => {
    const brokenRedis = makeRedis({
      isOpen: false, // simulates Redis not connected
    });
    const svcFailing = new LockoutService(brokenRedis, eventRepo);

    await expect(svcFailing.checkLockout(EMAIL)).resolves.toBeUndefined();
    await expect(svcFailing.recordFailure(EMAIL)).resolves.toBeUndefined();
    await expect(svcFailing.clearFailures(EMAIL)).resolves.toBeUndefined();
  });

  it('fails open when Redis throws on get', async () => {
    redis.get = vi.fn().mockRejectedValue(new Error('Redis timeout'));
    await expect(svc.checkLockout(EMAIL)).resolves.toBeUndefined();
  });
});

describe('LockoutService — MFA lockout', () => {
  let redis: ReturnType<typeof makeRedis>;
  let eventRepo: any;
  let svc: LockoutService;

  beforeEach(() => {
    redis = makeRedis();
    eventRepo = makeMockEventRepo();
    svc = new LockoutService(redis, eventRepo);
  });

  it('allows MFA attempt when no failures recorded', async () => {
    await expect(svc.checkMfaLockout(USER_ID)).resolves.toBeUndefined();
  });

  it('does not invalidate before threshold', async () => {
    for (let i = 0; i < 4; i++) {
      await svc.recordMfaFailure(USER_ID);
    }
    // invalidated key should NOT exist
    expect(redis._store[`mfa_invalidated:${USER_ID}`]).toBeUndefined();
    await expect(svc.checkMfaLockout(USER_ID)).resolves.toBeUndefined();
  });

  it('invalidates pending token after threshold MFA failures', async () => {
    for (let i = 0; i < 5; i++) {
      await svc.recordMfaFailure(USER_ID);
    }
    expect(redis._store[`mfa_invalidated:${USER_ID}`]).toBeDefined();
  });

  it('rejects even correct code after pending token is invalidated', async () => {
    // Write the invalidation key directly
    redis._store[`mfa_invalidated:${USER_ID}`] = { value: '1' };
    await expect(svc.checkMfaLockout(USER_ID)).rejects.toBeInstanceOf(AuthError);
  });

  it('clearMfaFailures removes the failure counter', async () => {
    for (let i = 0; i < 3; i++) {
      await svc.recordMfaFailure(USER_ID);
    }
    await svc.clearMfaFailures(USER_ID);
    expect(redis._store[`mfa_fail:${USER_ID}`]).toBeUndefined();
  });

  it('fails open when Redis is unavailable', async () => {
    const svcFailing = new LockoutService(makeRedis({ isOpen: false }), eventRepo);
    await expect(svcFailing.checkMfaLockout(USER_ID)).resolves.toBeUndefined();
    await expect(svcFailing.recordMfaFailure(USER_ID)).resolves.toBeUndefined();
  });
});

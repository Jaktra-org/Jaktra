import type { RedisClientType } from 'redis';
import { config } from '../../config/index.js';
import { AuthError } from '../../shared/errors/index.js';
import type { EventRepository } from '../event/event.repository.js';

// SECURITY NOTE: If Redis is unavailable, lockout tracking is skipped (fail-open).
// Brute-force protection degrades to IP-rate-limiting only during Redis outages.
// Alert on Redis connectivity loss and consider a compensating alert on login-failure
// spike rate (e.g. via Sentry or your APM tool) to catch active attacks during outages.

// CROSS-TENANT SIDE EFFECT (accepted, documented):
// Lockout is keyed by normalised email only — no tenantId — because tenantId is unknown
// before the DB lookup, and splitting the key would re-create the brute-force gap we
// explicitly fixed. As a consequence, if the same email address exists in two different
// tenants (schema allows it, but it is rare), a deliberate attacker failing logins on
// Tenant-A's account will also lock Tenant-B's account with that email.
// This is the correct trade-off: we accept the edge-case side effect in exchange for
// actual brute-force protection on real accounts. No fix planned for v1.

const GENERIC_AUTH_ERROR = 'Invalid email or password';

interface LockoutConfig {
  threshold: number;      // failures before lockout
  baseMinutes: number;    // base lockout duration (exponential backoff multiplier)
  maxMinutes: number;     // hard cap on lockout duration
  mfaMaxAttempts: number; // wrong MFA codes before pending token is invalidated
}

function getLockoutConfig(): LockoutConfig {
  return {
    threshold: config.AUTH_LOCKOUT_THRESHOLD,
    baseMinutes: config.AUTH_LOCKOUT_BASE_MINUTES,
    maxMinutes: config.AUTH_LOCKOUT_MAX_MINUTES,
    mfaMaxAttempts: config.AUTH_MFA_MAX_ATTEMPTS,
  };
}

export class LockoutService {
  constructor(
    private redis: RedisClientType | null,
    private eventRepo: EventRepository,
  ) {}



  private loginFailKey(email: string): string {
    return `login_fail:${email}`;
  }

  private lockoutCountKey(email: string): string {
 
    return `login_lockout_count:${email}`;
  }


  async checkLockout(email: string): Promise<void> {
    if (!this.redis || !this.redis.isOpen) return; // fail-open

    try {
      const raw = await this.redis.get(this.loginFailKey(email));
      if (raw === null) return; // no counter at all

      const cfg = getLockoutConfig();
      const count = parseInt(raw, 10);
      if (count >= cfg.threshold) {
        throw new AuthError(GENERIC_AUTH_ERROR, 401);
      }
    } catch (err) {
      if (err instanceof AuthError) throw err;
    }
  }


  async recordFailure(email: string, tenantId?: string, userId?: string): Promise<void> {
    if (!this.redis || !this.redis.isOpen) return; // fail-open

    try {
      const cfg = getLockoutConfig();
      const key = this.loginFailKey(email);


      const count = await this.redis.incr(key);

      if (count === 1) {
        await this.redis.expire(key, cfg.baseMinutes * 60);
      }

      if (count >= cfg.threshold) {
        const priorLockouts = await this.getPriorLockoutCount(email);
        const lockoutSeconds = Math.min(
          cfg.baseMinutes * Math.pow(2, priorLockouts) * 60,
          cfg.maxMinutes * 60,
        );

        await this.redis.expire(key, lockoutSeconds);

        const lcKey = this.lockoutCountKey(email);
        await this.redis.incr(lcKey);
        await this.redis.expire(lcKey, 24 * 60 * 60);

        this.emitLockoutEvent(email, tenantId, userId, lockoutSeconds).catch(() => {/* swallow */});
      }
    } catch {
    }
  }


  async clearFailures(email: string): Promise<void> {
    if (!this.redis || !this.redis.isOpen) return;

    try {
      await this.redis.del(this.loginFailKey(email));
    } catch {
    }
  }

  private async getPriorLockoutCount(email: string): Promise<number> {
    try {
      const raw = await this.redis!.get(this.lockoutCountKey(email));
      return raw ? parseInt(raw, 10) : 0;
    } catch {
      return 0;
    }
  }

  private async emitLockoutEvent(
    email: string,
    tenantId?: string,
    userId?: string,
    lockoutSeconds?: number,
  ): Promise<void> {
    if (!tenantId) return; // can't write an event without a tenantId

    await this.eventRepo.create({
      tenantId,
      entityType: 'user',
      entityId: userId ?? 'unknown',
      actorId: null,
      actorName: null,
      actorEmail: email,
      actorRole: null,
      actionType: 'auth.account_locked',
      description: `Account temporarily locked after repeated failed login attempts${lockoutSeconds ? ` (${Math.round(lockoutSeconds / 60)} min)` : ''}.`,
      source: 'system',
      oldValues: null,
      newValues: null,
      eventType: 'auth.account_locked',
      payload: { email, lockoutSeconds },
    });
  }

 
  private mfaFailKey(userId: string): string {
    return `mfa_fail:${userId}`;
  }

  private mfaInvalidatedKey(userId: string): string {
    return `mfa_invalidated:${userId}`;
  }

  async checkMfaLockout(userId: string): Promise<void> {
    if (!this.redis || !this.redis.isOpen) return; // fail-open

    try {
      const exists = await this.redis.exists(this.mfaInvalidatedKey(userId));
      if (exists) {
        throw new AuthError(GENERIC_AUTH_ERROR, 401);
      }
    } catch (err) {
      if (err instanceof AuthError) throw err;
    }
  }

  
  async recordMfaFailure(userId: string): Promise<void> {
    if (!this.redis || !this.redis.isOpen) return; // fail-open

    try {
      const cfg = getLockoutConfig();
      const key = this.mfaFailKey(userId);

      const count = await this.redis.incr(key);
      await this.redis.expire(key, 5 * 60);

      if (count >= cfg.mfaMaxAttempts) {
        await this.redis.set(this.mfaInvalidatedKey(userId), '1', { EX: 5 * 60 });
      }
    } catch {
    }
  }


  async clearMfaFailures(userId: string): Promise<void> {
    if (!this.redis || !this.redis.isOpen) return;

    try {
      await this.redis.del(this.mfaFailKey(userId));
    } catch {
    }
  }
}

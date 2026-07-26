import rateLimit, { MemoryStore, type Store, type Options, type IncrementResponse } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { createClient } from 'redis';
import { config } from '../config/index.js';

const redisClient = config.REDIS_URL && process.env['NODE_ENV'] !== 'test'
  ? createClient({ url: config.REDIS_URL })
  : null;

let isRedisConnected = false;

if (redisClient) {
  redisClient.connect()
    .then(() => {
      isRedisConnected = true;
    })
    .catch((err: Error) => {
      console.error('Failed to connect to Redis for Rate Limiting, falling back to in-memory:', err.message);
      isRedisConnected = false;
    });

  redisClient.on('connect', () => {
    isRedisConnected = true;
  });
  redisClient.on('ready', () => {
    isRedisConnected = true;
  });
  redisClient.on('error', (_err: Error) => {
    isRedisConnected = false;
  });
  redisClient.on('end', () => {
    isRedisConnected = false;
  });
}

interface RedisStoreWithOptionalMethods extends RedisStore {
  resetAll?: () => Promise<void>;
  shutdown?: () => Promise<void>;
}

class FallbackStore implements Store {
  private redisStore: RedisStoreWithOptionalMethods;
  private memoryStore: MemoryStore;

  constructor(prefix: string) {
    this.redisStore = new RedisStore({
      sendCommand: (...args: string[]) => {
        if (!redisClient || !redisClient.isOpen) {
          throw new Error('Redis not connected');
        }
        return redisClient.sendCommand(args);
      },
      prefix,
    });
    this.memoryStore = new MemoryStore();
  }

  async init(options: Options): Promise<void> {
    if (!this.redisStore.init) {
      this.memoryStore.init(options);
      return;
    }

    let timeoutId: NodeJS.Timeout | undefined;
    try {
      // Race the Redis initialization with a 2-second timeout to prevent blocking startup
      await Promise.race([
        this.redisStore.init(options),
        new Promise<void>((_, reject) => {
          timeoutId = setTimeout(() => reject(new Error('Connection timeout')), 2000);
        }),
      ]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn(`Redis rate limit store initialization deferred: ${message}. Rate limiting will fall back to memory until Redis is available.`);
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
    this.memoryStore.init(options);
  }

  async increment(key: string): Promise<IncrementResponse> {
    if (redisClient && isRedisConnected) {
      try {
        return await this.redisStore.increment(key);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('Redis rate limit increment failed, falling back to memory store:', message);
      }
    }
    return this.memoryStore.increment(key);
  }

  async decrement(key: string): Promise<void> {
    if (redisClient && isRedisConnected) {
      try {
        return await this.redisStore.decrement(key);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('Redis rate limit decrement failed, falling back to memory store:', message);
      }
    }
    return this.memoryStore.decrement(key);
  }

  async resetKey(key: string): Promise<void> {
    if (redisClient && isRedisConnected) {
      try {
        return await this.redisStore.resetKey(key);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('Redis rate limit resetKey failed, falling back to memory store:', message);
      }
    }
    return this.memoryStore.resetKey(key);
  }

  async resetAll(): Promise<void> {
    if (redisClient && isRedisConnected && typeof this.redisStore.resetAll === 'function') {
      try {
        return await this.redisStore.resetAll();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('Redis rate limit resetAll failed, falling back to memory store:', message);
      }
    }
    return this.memoryStore.resetAll();
  }

  async shutdown(): Promise<void> {
    if (typeof this.redisStore.shutdown === 'function') {
      await this.redisStore.shutdown();
    }
    this.memoryStore.shutdown();
  }
}

export const standardLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 100, 
  standardHeaders: true,
  legacyHeaders: false, 
  message: { error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests, please try again later.' } },
  store: new FallbackStore('rl:standard:'),
  passOnStoreError: true,
  validate: { singleCount: false },
});

export const authLimiter = rateLimit({
  windowMs: 60 * 1000, 
  limit: 10, 
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many authentication attempts, please try again later.' } },
  store: new FallbackStore('rl:auth:'),
  passOnStoreError: true,
  validate: { singleCount: false },
});

export const portalViewIpLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests from this IP, please try again later.' } },
  store: new FallbackStore('rl:portal_view_ip:'),
  passOnStoreError: true,
  validate: { singleCount: false },
});

export const portalViewTokenLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  keyGenerator: (req) => (typeof req.params?.['token'] === 'string' && req.params['token']) ? req.params['token'] : 'unknown',
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests for this link, please try again later.' } },
  store: new FallbackStore('rl:portal_view_token:'),
  passOnStoreError: true,
  validate: { singleCount: false },
});

export const portalPayIpLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many payment requests from this IP, please try again later.' } },
  store: new FallbackStore('rl:portal_pay_ip:'),
  passOnStoreError: true,
  validate: { singleCount: false },
});

export const portalPayTokenLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  keyGenerator: (req) => (typeof req.params?.['token'] === 'string' && req.params['token']) ? req.params['token'] : 'unknown',
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many payment attempts for this link, please try again later.' } },
  store: new FallbackStore('rl:portal_pay_token:'),
  passOnStoreError: true,
  validate: { singleCount: false },
});

export const portalPlanIpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: process.env['NODE_ENV'] === 'test' ? 100 : 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many payment plan requests from this IP, please try again later.' } },
  store: new FallbackStore('rl:portal_plan_ip:'),
  passOnStoreError: true,
  validate: { singleCount: false },
});

export const portalPlanTokenLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 3,
  keyGenerator: (req) => (typeof req.params?.['token'] === 'string' && req.params['token']) ? req.params['token'] : 'unknown',
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many payment plan requests for this link, please try again later.' } },
  store: new FallbackStore('rl:portal_plan_token:'),
  passOnStoreError: true,
  validate: { singleCount: false },
});

export const portalDisputeIpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: process.env['NODE_ENV'] === 'test' ? 100 : 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many dispute submissions from this IP, please try again later.' } },
  store: new FallbackStore('rl:portal_dispute_ip:'),
  passOnStoreError: true,
  validate: { singleCount: false },
});

export const portalDisputeTokenLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 3,
  keyGenerator: (req) => (typeof req.params?.['token'] === 'string' && req.params['token']) ? req.params['token'] : 'unknown',
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many dispute submissions for this link, please try again later.' } },
  store: new FallbackStore('rl:portal_dispute_token:'),
  passOnStoreError: true,
  validate: { singleCount: false },
});



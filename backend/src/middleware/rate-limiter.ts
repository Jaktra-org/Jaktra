import rateLimit, { MemoryStore, type Store, type Options, type IncrementResponse } from 'express-rate-limit';
import { RedisStore, type RedisReply } from 'rate-limit-redis';
import { createClient } from 'redis';
import { config } from '../config/index.js';

const redisClient = config.REDIS_URL && process.env['NODE_ENV'] !== 'test'
  ? createClient({
      url: config.REDIS_URL,
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 1000),
        connectTimeout: 5000,
      },
    })
  : null;

let isRedisConnected = false;

const redisConnectPromise: Promise<void> | null = redisClient
  ? redisClient.connect()
      .then(() => {
        isRedisConnected = true;
      })
      .catch((err: Error) => {
        console.error('Failed to connect to Redis for Rate Limiting, falling back to in-memory:', err.message);
        isRedisConnected = false;
      })
  : null;

if (redisClient) {
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

let hasLoggedInitWarning = false;

interface RedisStoreWithOptionalMethods extends RedisStore {
  resetAll?: () => Promise<void>;
  shutdown?: () => Promise<void>;
}

class FallbackStore implements Store {
  private redisStore: RedisStoreWithOptionalMethods;
  private memoryStore: MemoryStore;

  constructor(prefix: string) {
    this.redisStore = new RedisStore({
      sendCommand: async (...args: (string | number | boolean | Buffer)[]) => {
        if (!redisClient || !redisClient.isOpen) {
          throw new Error('Redis not connected');
        }
        const sanitizedArgs = args.map((arg) => (arg !== undefined && arg !== null ? String(arg) : ''));
        const reply = await redisClient.sendCommand(sanitizedArgs);
        return (reply !== null && reply !== undefined ? reply : 0) as unknown as RedisReply;
      },
      prefix,
    });
    this.memoryStore = new MemoryStore();
  }

  async init(options: Options): Promise<void> {
    this.redisStore.windowMs = options.windowMs;
    this.memoryStore.init(options);

    if (redisClient) {
      // Wait for initial connection attempt to complete (up to 2000ms) before initializing Redis store
      if (redisConnectPromise && !isRedisConnected) {
        await Promise.race([
          redisConnectPromise,
          new Promise<void>((resolve) => setTimeout(resolve, 2000)),
        ]);
      }

      if (isRedisConnected && redisClient.isOpen) {
        try {
          let timeoutId: NodeJS.Timeout | undefined;
          await Promise.race([
            this.redisStore.init(options),
            new Promise<void>((_, reject) => {
              timeoutId = setTimeout(() => reject(new Error('Connection timeout')), 2000);
            }),
          ]);
          if (timeoutId) clearTimeout(timeoutId);
        } catch (err: unknown) {
          if (!hasLoggedInitWarning) {
            hasLoggedInitWarning = true;
            const message = err instanceof Error ? err.message : String(err);
            console.warn(`Redis rate limit store initialization deferred: ${message}. Rate limiting will fall back to memory until Redis is available.`);
          }
        }
      } else if (!hasLoggedInitWarning) {
        hasLoggedInitWarning = true;
        console.warn('Redis rate limit store initialization deferred: Redis is not connected. Rate limiting will fall back to memory until Redis is available.');
      }
    }
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



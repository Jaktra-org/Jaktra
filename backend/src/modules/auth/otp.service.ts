import crypto from 'crypto';
import type { RedisClientType } from 'redis';
import { AuthError } from '../../shared/errors/index.js';
import { logger } from '../../shared/logger.js';

export interface OtpData {
  hashedCode: string;
  attempts: number;
  userId?: string;
  [key: string]: unknown;
}

export class OtpService {
  private static readonly memoryOtpStore = new Map<string, { data: string; expiresAt: number }>();
  private static readonly memoryCooldownStore = new Map<string, number>();
  private static readonly memoryCountStore = new Map<string, { count: number; expiresAt: number }>();

  constructor(private readonly redis: RedisClientType | null) {}

  private get isRedisReady(): boolean {
    return !!(this.redis && this.redis.isOpen);
  }

  generateOtp(): string {
    const bytes = crypto.randomBytes(3);
    const num = (bytes.readUIntBE(0, 3) % 1000000).toString();
    return num.padStart(6, '0');
  }

  hashOtp(code: string): string {
    return crypto.createHash('sha256').update(code).digest('hex');
  }

  private getOtpKey(email: string, prefix: string): string {
    const normalizedEmail = email.toLowerCase().trim();
    return `${prefix}:${normalizedEmail}`;
  }

  private getCooldownKey(email: string, prefix: string): string {
    const normalizedEmail = email.toLowerCase().trim();
    return `${prefix}_cooldown:${normalizedEmail}`;
  }

  private getCountKey(email: string, prefix: string): string {
    const normalizedEmail = email.toLowerCase().trim();
    return `${prefix}_count:${normalizedEmail}`;
  }

  async storeOtp(
    email: string,
    prefix: string,
    extraFields: Record<string, unknown> = {},
    expirySeconds: number = 600
  ): Promise<string> {
    const key = this.getOtpKey(email, prefix);
    const code = this.generateOtp();
    const hashedCode = this.hashOtp(code);

    const otpData: OtpData = {
      hashedCode,
      attempts: 0,
      ...extraFields,
    };

    if (this.isRedisReady) {
      await this.redis!.set(key, JSON.stringify(otpData), { EX: expirySeconds });
    } else {
      logger.info(`[OtpService] Storing OTP in-memory fallback for ${email}`);
      OtpService.memoryOtpStore.set(key, {
        data: JSON.stringify(otpData),
        expiresAt: Date.now() + expirySeconds * 1000,
      });
    }
    return code;
  }

  async verifyOtp(
    email: string,
    prefix: string,
    code: string,
    maxAttempts: number = 5
  ): Promise<OtpData> {
    const key = this.getOtpKey(email, prefix);
    let otpDataRaw: string | null = null;
    let inMemoryEntry: { data: string; expiresAt: number } | undefined;

    if (this.isRedisReady) {
      otpDataRaw = await this.redis!.get(key);
    } else {
      inMemoryEntry = OtpService.memoryOtpStore.get(key);
      if (inMemoryEntry && inMemoryEntry.expiresAt > Date.now()) {
        otpDataRaw = inMemoryEntry.data;
      }
    }

    if (!otpDataRaw) {
      throw new AuthError('Invalid or expired code, request a new one', 400);
    }

    const otpData = JSON.parse(otpDataRaw) as OtpData;
    const hashedInput = this.hashOtp(code);

    const bufA = Buffer.from(hashedInput, 'hex');
    const bufB = Buffer.from(otpData.hashedCode, 'hex');

    if (bufA.length !== bufB.length) {
      throw new AuthError('Invalid or expired code, request a new one', 400);
    }

    const isMatch = crypto.timingSafeEqual(bufA, bufB);

    if (!isMatch) {
      otpData.attempts += 1;
      if (otpData.attempts >= maxAttempts) {
        if (this.isRedisReady) {
          await this.redis!.del(key);
        } else {
          OtpService.memoryOtpStore.delete(key);
        }
        logger.warn(`OTP brute force blocked. Deleted OTP key for prefix: ${prefix}`);
      } else {
        if (this.isRedisReady) {
          const ttl = await this.redis!.ttl(key);
          if (ttl > 0) {
            await this.redis!.set(key, JSON.stringify(otpData), { EX: ttl });
          }
        } else if (inMemoryEntry) {
          inMemoryEntry.data = JSON.stringify(otpData);
        }
      }
      throw new AuthError('Invalid or expired code, request a new one', 400);
    }

    if (this.isRedisReady) {
      await this.redis!.del(key);
    } else {
      OtpService.memoryOtpStore.delete(key);
    }
    return otpData;
  }

  async checkRateLimit(
    email: string,
    prefix: string,
    _cooldownSeconds: number = 60,
    maxPerHour: number = 5
  ): Promise<void> {
    const cooldownKey = this.getCooldownKey(email, prefix);
    const countKey = this.getCountKey(email, prefix);

    let cooldownExists = false;
    let count = 0;

    if (this.isRedisReady) {
      const cooldownVal = await this.redis!.get(cooldownKey);
      cooldownExists = !!cooldownVal;

      const countRaw = await this.redis!.get(countKey);
      count = countRaw ? parseInt(countRaw, 10) : 0;
    } else {
      const cooldownExpiresAt = OtpService.memoryCooldownStore.get(cooldownKey);
      cooldownExists = !!(cooldownExpiresAt && cooldownExpiresAt > Date.now());

      const countEntry = OtpService.memoryCountStore.get(countKey);
      if (countEntry && countEntry.expiresAt > Date.now()) {
        count = countEntry.count;
      }
    }

    if (cooldownExists) {
      throw new AuthError('Please wait 60 seconds before requesting another code', 429);
    }

    if (count >= maxPerHour) {
      throw new AuthError('Too many code requests. Please try again in an hour', 429);
    }
  }

  async incrementRateLimit(
    email: string,
    prefix: string,
    cooldownSeconds: number = 60,
    countExpirySeconds: number = 3600
  ): Promise<void> {
    const cooldownKey = this.getCooldownKey(email, prefix);
    const countKey = this.getCountKey(email, prefix);

    if (this.isRedisReady) {
      await this.redis!.set(cooldownKey, '1', { EX: cooldownSeconds });

      const countRaw = await this.redis!.get(countKey);
      const count = countRaw ? parseInt(countRaw, 10) : 0;
      const newCount = count + 1;

      if (count === 0) {
        await this.redis!.set(countKey, newCount.toString(), { EX: countExpirySeconds });
      } else {
        const ttl = await this.redis!.ttl(countKey);
        if (ttl > 0) {
          await this.redis!.set(countKey, newCount.toString(), { EX: ttl });
        } else {
          await this.redis!.set(countKey, newCount.toString(), { EX: countExpirySeconds });
        }
      }
    } else {
      OtpService.memoryCooldownStore.set(cooldownKey, Date.now() + cooldownSeconds * 1000);

      const countEntry = OtpService.memoryCountStore.get(countKey);
      if (countEntry && countEntry.expiresAt > Date.now()) {
        countEntry.count += 1;
      } else {
        OtpService.memoryCountStore.set(countKey, {
          count: 1,
          expiresAt: Date.now() + countExpirySeconds * 1000,
        });
      }
    }
  }
}

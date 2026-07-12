import crypto from 'crypto';
import type { RedisClientType } from 'redis';
import { AuthError } from '../../shared/errors/index.js';
import { logger } from '../../shared/logger.js';

export interface OtpData {
  hashedCode: string;
  attempts: number;
  [key: string]: any;
}

export class OtpService {
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
    extraFields: Record<string, any> = {},
    expirySeconds: number = 600
  ): Promise<string> {
    if (!this.isRedisReady) {
      throw new AuthError('Authentication service temporarily unavailable', 503);
    }

    const key = this.getOtpKey(email, prefix);
    const code = this.generateOtp();
    const hashedCode = this.hashOtp(code);

    const otpData: OtpData = {
      hashedCode,
      attempts: 0,
      ...extraFields,
    };

    await this.redis!.set(key, JSON.stringify(otpData), { EX: expirySeconds });
    return code;
  }

  async verifyOtp(
    email: string,
    prefix: string,
    code: string,
    maxAttempts: number = 5
  ): Promise<OtpData> {
    if (!this.isRedisReady) {
      throw new AuthError('Authentication service temporarily unavailable', 503);
    }

    const key = this.getOtpKey(email, prefix);
    const otpDataRaw = await this.redis!.get(key);
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
        await this.redis!.del(key);
        logger.warn(`OTP brute force blocked. Deleted OTP key for prefix: ${prefix}`);
      } else {
        const ttl = await this.redis!.ttl(key);
        if (ttl > 0) {
          await this.redis!.set(key, JSON.stringify(otpData), { EX: ttl });
        }
      }
      throw new AuthError('Invalid or expired code, request a new one', 400);
    }

    // Success — delete key immediately
    await this.redis!.del(key);
    return otpData;
  }

  async checkRateLimit(
    email: string,
    prefix: string,
    cooldownSeconds: number = 60,
    maxPerHour: number = 5
  ): Promise<void> {
    if (!this.isRedisReady) {
      throw new AuthError('Authentication service temporarily unavailable', 503);
    }

    const cooldownKey = this.getCooldownKey(email, prefix);
    const countKey = this.getCountKey(email, prefix);

    // 1. Cooldown limit
    const cooldownExists = await this.redis!.get(cooldownKey);
    if (cooldownExists) {
      throw new AuthError('Please wait 60 seconds before requesting another code', 429);
    }

    // 2. Max hourly requests limit
    const countRaw = await this.redis!.get(countKey);
    const count = countRaw ? parseInt(countRaw, 10) : 0;
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
    if (!this.isRedisReady) return;

    const cooldownKey = this.getCooldownKey(email, prefix);
    const countKey = this.getCountKey(email, prefix);

    // Set cooldown
    await this.redis!.set(cooldownKey, '1', { EX: cooldownSeconds });

    // Update hourly request count
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
  }
}

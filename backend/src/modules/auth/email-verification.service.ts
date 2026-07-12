import crypto from 'crypto';
import type { RedisClientType } from 'redis';
import { AuthError } from '../../shared/errors/index.js';
import { logger } from '../../shared/logger.js';

export interface PendingRegistration {
  name: string;
  email: string;
  passwordHash: string;
  companyName: string;
  createdAt: Date;
}

export class EmailVerificationService {
  constructor(private readonly redis: RedisClientType | null) {}

  private get isRedisReady(): boolean {
    return !!(this.redis && this.redis.isOpen);
  }

  generateOtp(): string {
    // secure 6-digit numeric OTP generator using crypto
    const bytes = crypto.randomBytes(3);
    const num = (bytes.readUIntBE(0, 3) % 1000000).toString();
    return num.padStart(6, '0');
  }

  async storePendingRegistration(email: string, payload: Omit<PendingRegistration, 'createdAt'>): Promise<string> {
    if (!this.isRedisReady) {
      throw new AuthError('Registration service temporarily unavailable', 503);
    }

    const normalizedEmail = email.toLowerCase().trim();
    const pendingKey = `pending_registration:${normalizedEmail}`;
    const otpKey = `email_otp:${normalizedEmail}`;

    const pendingData: PendingRegistration = {
      ...payload,
      createdAt: new Date(),
    };

    const code = this.generateOtp();
    const hashedCode = crypto.createHash('sha256').update(code).digest('hex');

    await this.redis!.set(pendingKey, JSON.stringify(pendingData), { EX: 900 }); // 15 mins
    await this.redis!.set(otpKey, JSON.stringify({ hashedCode, attempts: 0 }), { EX: 600 }); // 10 mins

    return code;
  }

  async verifyOtp(email: string, code: string): Promise<PendingRegistration> {
    if (!this.isRedisReady) {
      throw new AuthError('Registration service temporarily unavailable', 503);
    }

    const normalizedEmail = email.toLowerCase().trim();
    const otpKey = `email_otp:${normalizedEmail}`;
    const pendingKey = `pending_registration:${normalizedEmail}`;

    const otpDataRaw = await this.redis!.get(otpKey);
    if (!otpDataRaw) {
      throw new AuthError('Invalid or expired code, request a new one', 400);
    }

    const otpData = JSON.parse(otpDataRaw) as { hashedCode: string; attempts: number };
    const hashedInput = crypto.createHash('sha256').update(code).digest('hex');

    const bufA = Buffer.from(hashedInput, 'hex');
    const bufB = Buffer.from(otpData.hashedCode, 'hex');

    if (bufA.length !== bufB.length) {
      throw new AuthError('Invalid or expired code, request a new one', 400);
    }

    const isMatch = crypto.timingSafeEqual(bufA, bufB);

    if (!isMatch) {
      otpData.attempts += 1;
      if (otpData.attempts >= 5) {
        await this.redis!.del(otpKey);
        logger.warn(`OTP brute force blocked. Deleted OTP key for email: ${normalizedEmail}`);
      } else {
        const ttl = await this.redis!.ttl(otpKey);
        if (ttl > 0) {
          await this.redis!.set(otpKey, JSON.stringify(otpData), { EX: ttl });
        }
      }
      throw new AuthError('Invalid or expired code, request a new one', 400);
    }

    // Code is correct — retrieve pending registration
    const pendingRaw = await this.redis!.get(pendingKey);
    if (!pendingRaw) {
      throw new AuthError('Registration expired, please start again', 400);
    }

    const pending = JSON.parse(pendingRaw) as PendingRegistration;

    // Delete keys
    await this.redis!.del(otpKey);
    await this.redis!.del(pendingKey);

    return pending;
  }

  async resendOtp(email: string): Promise<string> {
    if (!this.isRedisReady) {
      throw new AuthError('Registration service temporarily unavailable', 503);
    }

    const normalizedEmail = email.toLowerCase().trim();
    const pendingKey = `pending_registration:${normalizedEmail}`;
    const cooldownKey = `resend_cooldown:${normalizedEmail}`;
    const countKey = `resend_count:${normalizedEmail}`;
    const otpKey = `email_otp:${normalizedEmail}`;

    // Verify registration exists
    const pendingRaw = await this.redis!.get(pendingKey);
    if (!pendingRaw) {
      throw new AuthError('Please restart registration', 400);
    }

    // 1. Cooldown limit (60s)
    const cooldownExists = await this.redis!.get(cooldownKey);
    if (cooldownExists) {
      throw new AuthError('Please wait 60 seconds before requesting another code', 429);
    }

    // 2. Max 5 resends per hour limit
    const countRaw = await this.redis!.get(countKey);
    const count = countRaw ? parseInt(countRaw, 10) : 0;
    if (count >= 5) {
      throw new AuthError('Too many code requests. Please try again in an hour', 429);
    }

    const code = this.generateOtp();
    const hashedCode = crypto.createHash('sha256').update(code).digest('hex');

    // Replace the old email_otp key and reset attempts to 0
    await this.redis!.set(otpKey, JSON.stringify({ hashedCode, attempts: 0 }), { EX: 600 });
    
    // Set 60s cooldown
    await this.redis!.set(cooldownKey, '1', { EX: 60 });

    // Update hourly resend count
    const newCount = count + 1;
    if (count === 0) {
      await this.redis!.set(countKey, newCount.toString(), { EX: 3600 });
    } else {
      const ttl = await this.redis!.ttl(countKey);
      if (ttl > 0) {
        await this.redis!.set(countKey, newCount.toString(), { EX: ttl });
      } else {
        await this.redis!.set(countKey, newCount.toString(), { EX: 3600 });
      }
    }

    return code;
  }
}

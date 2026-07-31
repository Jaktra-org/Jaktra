import type { RedisClientType } from 'redis';
import { AuthError } from '../../shared/errors/index.js';
import { OtpService } from './otp.service.js';
import { logger } from '../../shared/logger.js';

export interface PendingRegistration {
  name: string;
  email: string;
  passwordHash: string;
  companyName: string;
  createdAt: Date;
}

export class EmailVerificationService {
  private readonly otpService: OtpService;
  private static readonly memoryPendingStore = new Map<string, { data: string; expiresAt: number }>();

  constructor(
    private readonly redis: RedisClientType | null,
    otpService?: OtpService
  ) {
    this.otpService = otpService || new OtpService(redis);
  }

  private get isRedisReady(): boolean {
    return !!(this.redis && this.redis.isOpen);
  }

  generateOtp(): string {
    return this.otpService.generateOtp();
  }

  async storePendingRegistration(email: string, payload: Omit<PendingRegistration, 'createdAt'>): Promise<string> {
    const normalizedEmail = email.toLowerCase().trim();
    const pendingKey = `pending_registration:${normalizedEmail}`;

    const pendingData: PendingRegistration = {
      ...payload,
      createdAt: new Date(),
    };

    const code = await this.otpService.storeOtp(normalizedEmail, 'email_otp', {}, 600);

    if (this.isRedisReady) {
      await this.redis!.set(pendingKey, JSON.stringify(pendingData), { EX: 900 }); // 15 mins
    } else {
      logger.info(`[EmailVerificationService] Storing pending registration in-memory fallback for ${normalizedEmail}`);
      EmailVerificationService.memoryPendingStore.set(pendingKey, {
        data: JSON.stringify(pendingData),
        expiresAt: Date.now() + 900 * 1000,
      });
    }

    return code;
  }

  async verifyOtp(email: string, code: string): Promise<PendingRegistration> {
    const normalizedEmail = email.toLowerCase().trim();
    const pendingKey = `pending_registration:${normalizedEmail}`;

    await this.otpService.verifyOtp(normalizedEmail, 'email_otp', code);

    let pendingRaw: string | null = null;
    if (this.isRedisReady) {
      pendingRaw = await this.redis!.get(pendingKey);
    } else {
      const entry = EmailVerificationService.memoryPendingStore.get(pendingKey);
      if (entry && entry.expiresAt > Date.now()) {
        pendingRaw = entry.data;
      }
    }

    if (!pendingRaw) {
      throw new AuthError('Registration expired, please start again', 400);
    }

    const pending = JSON.parse(pendingRaw) as PendingRegistration;

    if (this.isRedisReady) {
      await this.redis!.del(pendingKey);
    } else {
      EmailVerificationService.memoryPendingStore.delete(pendingKey);
    }

    return pending;
  }

  async resendOtp(email: string): Promise<string> {
    const normalizedEmail = email.toLowerCase().trim();
    const pendingKey = `pending_registration:${normalizedEmail}`;

    let pendingRaw: string | null = null;
    if (this.isRedisReady) {
      pendingRaw = await this.redis!.get(pendingKey);
    } else {
      const entry = EmailVerificationService.memoryPendingStore.get(pendingKey);
      if (entry && entry.expiresAt > Date.now()) {
        pendingRaw = entry.data;
      }
    }

    if (!pendingRaw) {
      throw new AuthError('Please restart registration', 400);
    }

    await this.otpService.checkRateLimit(normalizedEmail, 'resend');

    const code = await this.otpService.storeOtp(normalizedEmail, 'email_otp', {}, 600);

    await this.otpService.incrementRateLimit(normalizedEmail, 'resend');

    return code;
  }
}

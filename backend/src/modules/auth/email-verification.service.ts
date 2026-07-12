import type { RedisClientType } from 'redis';
import { AuthError } from '../../shared/errors/index.js';
import { OtpService } from './otp.service.js';

export interface PendingRegistration {
  name: string;
  email: string;
  passwordHash: string;
  companyName: string;
  createdAt: Date;
}

export class EmailVerificationService {
  private readonly otpService: OtpService;

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
    if (!this.isRedisReady) {
      throw new AuthError('Registration service temporarily unavailable', 503);
    }

    const normalizedEmail = email.toLowerCase().trim();
    const pendingKey = `pending_registration:${normalizedEmail}`;

    const pendingData: PendingRegistration = {
      ...payload,
      createdAt: new Date(),
    };

    // Store OTP using shared OtpService
    const code = await this.otpService.storeOtp(normalizedEmail, 'email_otp', {}, 600);

    // Store pending registration data
    await this.redis!.set(pendingKey, JSON.stringify(pendingData), { EX: 900 }); // 15 mins

    return code;
  }

  async verifyOtp(email: string, code: string): Promise<PendingRegistration> {
    if (!this.isRedisReady) {
      throw new AuthError('Registration service temporarily unavailable', 503);
    }

    const normalizedEmail = email.toLowerCase().trim();
    const pendingKey = `pending_registration:${normalizedEmail}`;

    // Verify OTP using shared OtpService
    await this.otpService.verifyOtp(normalizedEmail, 'email_otp', code);

    // Code is correct — retrieve pending registration
    const pendingRaw = await this.redis!.get(pendingKey);
    if (!pendingRaw) {
      throw new AuthError('Registration expired, please start again', 400);
    }

    const pending = JSON.parse(pendingRaw) as PendingRegistration;

    // Delete pending registration key
    await this.redis!.del(pendingKey);

    return pending;
  }

  async resendOtp(email: string): Promise<string> {
    if (!this.isRedisReady) {
      throw new AuthError('Registration service temporarily unavailable', 503);
    }

    const normalizedEmail = email.toLowerCase().trim();
    const pendingKey = `pending_registration:${normalizedEmail}`;

    // Verify registration exists
    const pendingRaw = await this.redis!.get(pendingKey);
    if (!pendingRaw) {
      throw new AuthError('Please restart registration', 400);
    }

    // Rate limiting using shared OtpService
    await this.otpService.checkRateLimit(normalizedEmail, 'resend');

    // Store OTP using shared OtpService
    const code = await this.otpService.storeOtp(normalizedEmail, 'email_otp', {}, 600);

    // Update hourly count & cooldown using shared OtpService
    await this.otpService.incrementRateLimit(normalizedEmail, 'resend');

    return code;
  }
}


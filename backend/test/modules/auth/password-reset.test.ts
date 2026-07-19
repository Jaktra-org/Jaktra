import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { OtpService } from '../../../src/modules/auth/otp.service.js';
import { AuthService } from '../../../src/modules/auth/auth.service.js';

describe('Password Reset Flow (OTP & Reset Token)', () => {
  let redisStore: Record<string, string> = {};
  let redisTtls: Record<string, number> = {};
  let mockRedis: any;
  let mockUserRepo: any;
  let mockLockoutService: any;
  let mockEventRepo: any;
  let mockPlatformMailer: any;
  let otpService: OtpService;
  let authService: AuthService;

  const jwtSecret = 'my-jwt-secret';

  beforeEach(() => {
    redisStore = {};
    redisTtls = {};
    vi.clearAllMocks();

    mockRedis = {
      isOpen: true,
      get: vi.fn(async (key: string) => redisStore[key] || null),
      set: vi.fn(async (key: string, val: string, options?: { EX: number }) => {
        redisStore[key] = val;
        if (options?.EX) {
          redisTtls[key] = options.EX;
        }
        return 'OK';
      }),
      del: vi.fn(async (key: string) => {
        delete redisStore[key];
        delete redisTtls[key];
        return 1;
      }),
      ttl: vi.fn(async (key: string) => {
        return redisTtls[key] !== undefined ? redisTtls[key] : -2;
      }),
    };

    mockUserRepo = {
      findFirstByEmail: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
    };

    mockLockoutService = {
      clearFailures: vi.fn(),
    };

    mockEventRepo = {
      create: vi.fn(),
    };

    mockPlatformMailer = {
      sendPasswordResetOtpEmail: vi.fn().mockResolvedValue({ success: true }),
    };

    otpService = new OtpService(mockRedis);
    // Instantiate EmailVerificationService too if needed, but we don't call it here
    const mockEmailVerificationService: any = {};

    authService = new AuthService(
      mockUserRepo,
      jwtSecret,
      '7d',
      mockLockoutService,
      mockEventRepo,
      mockEmailVerificationService,
      mockPlatformMailer,
      mockRedis,
      otpService
    );
  });

  describe('1. Request Reset (forgotPassword)', () => {
    it('should generate OTP, store in Redis, send email, and record rate limit for an existing user', async () => {
      const email = 'user@example.com';
      mockUserRepo.findFirstByEmail.mockResolvedValue({
        id: 'user-id-123',
        email,
        tenantId: 'tenant-id-456',
        name: 'Jane Doe',
      });

      await authService.forgotPassword(email);

      // Verify OTP is generated and stored in Redis
      const otpKey = `password_reset_otp:${email}`;
      expect(redisStore[otpKey]).toBeDefined();
      const storedData = JSON.parse(redisStore[otpKey]);
      expect(storedData.userId).toBe('user-id-123');
      expect(storedData.attempts).toBe(0);
      expect(storedData.hashedCode).toBeDefined();

      // Verify PlatformMailer.sendPasswordResetOtpEmail is called with a 6-digit numeric OTP
      expect(mockPlatformMailer.sendPasswordResetOtpEmail).toHaveBeenCalledWith(
        email,
        expect.stringMatching(/^\d{6}$/)
      );

      // Verify rate limit keys are created
      expect(redisStore[`password_reset_resend_cooldown:${email}`]).toBe('1');
      expect(redisStore[`password_reset_resend_count:${email}`]).toBe('1');
    });

    it('should NOT store OTP or send email for non-existent email, but should return without throwing (enumeration safe)', async () => {
      const email = 'nonexistent@example.com';
      mockUserRepo.findFirstByEmail.mockResolvedValue(null);

      const startTime = Date.now();
      await authService.forgotPassword(email);
      const duration = Date.now() - startTime;

      // Verify no OTP stored and no email sent
      expect(redisStore[`password_reset_otp:${email}`]).toBeUndefined();
      expect(mockPlatformMailer.sendPasswordResetOtpEmail).not.toHaveBeenCalled();

      // Verify a slight delay occurred (at least 200ms)
      expect(duration).toBeGreaterThanOrEqual(190); // 190ms to tolerate event loop timer rounding
    });
  });

  describe('2. Verify OTP (verifyForgotPasswordOtp)', () => {
    it('should throw error for wrong OTP, increment attempts, and delete OTP key at 5 attempts', async () => {
      const email = 'verify@example.com';
      const realCode = '123456';
      const hashedCode = crypto.createHash('sha256').update(realCode).digest('hex');

      redisStore[`password_reset_otp:${email}`] = JSON.stringify({
        hashedCode,
        attempts: 0,
        userId: 'user-123',
      });
      redisTtls[`password_reset_otp:${email}`] = 600;

      // 1. Submit incorrect code
      await expect(
        authService.verifyForgotPasswordOtp(email, 'wrong1')
      ).rejects.toThrow('Invalid or expired code, request a new one');

      const currentData = JSON.parse(redisStore[`password_reset_otp:${email}`]);
      expect(currentData.attempts).toBe(1);

      // 2. Submit wrong codes up to 5 times
      for (let i = 1; i < 5; i++) {
        await expect(
          authService.verifyForgotPasswordOtp(email, `wrong${i + 1}`)
        ).rejects.toThrow('Invalid or expired code, request a new one');
      }

      // Verify that the OTP key is deleted after 5 failed attempts
      expect(redisStore[`password_reset_otp:${email}`]).toBeUndefined();
    });

    it('should successfully verify a correct code, issue a 10-minute JWT, and delete the OTP key (one-time OTP verification)', async () => {
      const email = 'verify@example.com';
      const realCode = '123456';
      const hashedCode = crypto.createHash('sha256').update(realCode).digest('hex');

      redisStore[`password_reset_otp:${email}`] = JSON.stringify({
        hashedCode,
        attempts: 0,
        userId: 'user-123',
      });
      redisTtls[`password_reset_otp:${email}`] = 600;

      const { resetToken } = await authService.verifyForgotPasswordOtp(email, realCode);

      expect(resetToken).toBeDefined();
      const payload: any = jwt.verify(resetToken, jwtSecret);
      expect(payload.purpose).toBe('password_reset');
      expect(payload.userId).toBe('user-123');
      expect(payload.jti).toBeDefined();

      // Verify OTP key was deleted
      expect(redisStore[`password_reset_otp:${email}`]).toBeUndefined();
    });

    it('should fail if the same correct code is verified twice (double verification check)', async () => {
      const email = 'verify@example.com';
      const realCode = '123456';
      const hashedCode = crypto.createHash('sha256').update(realCode).digest('hex');

      redisStore[`password_reset_otp:${email}`] = JSON.stringify({
        hashedCode,
        attempts: 0,
        userId: 'user-123',
      });
      redisTtls[`password_reset_otp:${email}`] = 600;

      // First verify succeeds
      const { resetToken } = await authService.verifyForgotPasswordOtp(email, realCode);
      expect(resetToken).toBeDefined();

      // Second verify fails immediately (since key is deleted)
      await expect(
        authService.verifyForgotPasswordOtp(email, realCode)
      ).rejects.toThrow('Invalid or expired code, request a new one');
    });
  });

  describe('3. Confirm Reset (confirmForgotPassword)', () => {
    it('should reset the password, clear lockout failures, emit an audit event, invalidate the token, and return auth result', async () => {
      const resetToken = jwt.sign(
        {
          purpose: 'password_reset',
          userId: 'user-123',
          jti: 'unique-jti-uuid',
        },
        jwtSecret,
        { expiresIn: '10m' }
      );

      mockUserRepo.findById.mockResolvedValue({
        id: 'user-123',
        email: 'user@example.com',
        tenantId: 'tenant-456',
        name: 'Jane Doe',
        role: 'manager',
      });
      mockUserRepo.update.mockResolvedValue(true);

      const result = await authService.confirmForgotPassword(resetToken, 'newSecurePassword123');

      // Verify database password updated
      expect(mockUserRepo.update).toHaveBeenCalledWith('user-123', {
        passwordHash: expect.any(String),
      });
      const storedHash = mockUserRepo.update.mock.calls[0][1].passwordHash;
      expect(await bcrypt.compare('newSecurePassword123', storedHash)).toBe(true);

      // Verify lockout cleared
      expect(mockLockoutService.clearFailures).toHaveBeenCalledWith('user@example.com');

      // Verify audit event logged
      expect(mockEventRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: 'tenant-456',
          entityType: 'user',
          entityId: 'user-123',
          actionType: 'auth.password_reset',
          eventType: 'auth.password_reset',
        })
      );

      // Verify reset token is marked as used in Redis
      expect(redisStore['password_reset_token_used:unique-jti-uuid']).toBe('1');
      expect(redisTtls['password_reset_token_used:unique-jti-uuid']).toBe(600);

      // Verify auth result is returned (auto-login)
      expect(result.token).toBeDefined();
      expect(result.user.id).toBe('user-123');
      expect(result.user.email).toBe('user@example.com');
    });

    it('should reject already used reset tokens (replay check)', async () => {
      const resetToken = jwt.sign(
        {
          purpose: 'password_reset',
          userId: 'user-123',
          jti: 'used-jti-uuid',
        },
        jwtSecret,
        { expiresIn: '10m' }
      );

      // Mark token as used in Redis
      redisStore['password_reset_token_used:used-jti-uuid'] = '1';

      await expect(
        authService.confirmForgotPassword(resetToken, 'newSecurePassword123')
      ).rejects.toThrow('Reset token has already been used');

      expect(mockUserRepo.update).not.toHaveBeenCalled();
    });

    it('should reject invalid or expired reset tokens', async () => {
      // 1. Expired token
      const expiredToken = jwt.sign(
        { purpose: 'password_reset', userId: 'user-123', jti: 'jti-1' },
        jwtSecret,
        { expiresIn: '-1s' }
      );
      await expect(
        authService.confirmForgotPassword(expiredToken, 'newSecurePassword123')
      ).rejects.toThrow('Invalid or expired reset token, please request a new one');

      // 2. Token with wrong purpose
      const wrongPurposeToken = jwt.sign(
        { purpose: 'registration_verify', userId: 'user-123', jti: 'jti-2' },
        jwtSecret
      );
      await expect(
        authService.confirmForgotPassword(wrongPurposeToken, 'newSecurePassword123')
      ).rejects.toThrow('Invalid or expired reset token, please request a new one');
    });

    it('should reject reset attempt with 503 if Redis client is null', async () => {
      const resetToken = jwt.sign(
        { purpose: 'password_reset', userId: 'user-123', jti: 'jti-null-redis' },
        jwtSecret,
        { expiresIn: '10m' }
      );

      const testService = new AuthService(
        mockUserRepo,
        jwtSecret,
        '7d',
        mockLockoutService,
        mockEventRepo,
        {} as any,
        mockPlatformMailer,
        null,
        otpService
      );

      await expect(
        testService.confirmForgotPassword(resetToken, 'newSecurePassword123')
      ).rejects.toThrow('Service temporarily unavailable, please try again');

      try {
        await testService.confirmForgotPassword(resetToken, 'newSecurePassword123');
      } catch (err: any) {
        expect(err.statusCode).toBe(503);
      }

      expect(mockUserRepo.update).not.toHaveBeenCalled();
    });

    it('should reject reset attempt with 503 if Redis client is not open', async () => {
      const resetToken = jwt.sign(
        { purpose: 'password_reset', userId: 'user-123', jti: 'jti-closed-redis' },
        jwtSecret,
        { expiresIn: '10m' }
      );

      const closedRedis = {
        ...mockRedis,
        isOpen: false,
      };

      const testService = new AuthService(
        mockUserRepo,
        jwtSecret,
        '7d',
        mockLockoutService,
        mockEventRepo,
        {} as any,
        mockPlatformMailer,
        closedRedis,
        otpService
      );

      await expect(
        testService.confirmForgotPassword(resetToken, 'newSecurePassword123')
      ).rejects.toThrow('Service temporarily unavailable, please try again');

      try {
        await testService.confirmForgotPassword(resetToken, 'newSecurePassword123');
      } catch (err: any) {
        expect(err.statusCode).toBe(503);
      }

      expect(mockUserRepo.update).not.toHaveBeenCalled();
    });

    it('should reject reset attempt with 503 if Redis client throws on get', async () => {
      const resetToken = jwt.sign(
        { purpose: 'password_reset', userId: 'user-123', jti: 'jti-get-throws' },
        jwtSecret,
        { expiresIn: '10m' }
      );

      const throwingRedis = {
        ...mockRedis,
        get: vi.fn().mockRejectedValue(new Error('Redis connection lost')),
      };

      const testService = new AuthService(
        mockUserRepo,
        jwtSecret,
        '7d',
        mockLockoutService,
        mockEventRepo,
        {} as any,
        mockPlatformMailer,
        throwingRedis,
        otpService
      );

      await expect(
        testService.confirmForgotPassword(resetToken, 'newSecurePassword123')
      ).rejects.toThrow('Service temporarily unavailable, please try again');

      try {
        await testService.confirmForgotPassword(resetToken, 'newSecurePassword123');
      } catch (err: any) {
        expect(err.statusCode).toBe(503);
      }

      expect(mockUserRepo.update).not.toHaveBeenCalled();
    });

    it('should reject reset attempt with 503 if Redis client throws on set', async () => {
      const resetToken = jwt.sign(
        { purpose: 'password_reset', userId: 'user-123', jti: 'jti-set-throws' },
        jwtSecret,
        { expiresIn: '10m' }
      );

      const throwingRedis = {
        ...mockRedis,
        set: vi.fn().mockRejectedValue(new Error('Redis write error')),
      };

      const testService = new AuthService(
        mockUserRepo,
        jwtSecret,
        '7d',
        mockLockoutService,
        mockEventRepo,
        {} as any,
        mockPlatformMailer,
        throwingRedis,
        otpService
      );

      await expect(
        testService.confirmForgotPassword(resetToken, 'newSecurePassword123')
      ).rejects.toThrow('Service temporarily unavailable, please try again');

      try {
        await testService.confirmForgotPassword(resetToken, 'newSecurePassword123');
      } catch (err: any) {
        expect(err.statusCode).toBe(503);
      }

      expect(mockUserRepo.update).not.toHaveBeenCalled();
    });
  });

  describe('4. Rate Limiting (resend Rate Limits)', () => {
    it('should enforce 60s cooldown limit and hourly request cap', async () => {
      const email = 'rate@example.com';
      mockUserRepo.findFirstByEmail.mockResolvedValue({
        id: 'user-id-123',
        email,
        tenantId: 'tenant-id-456',
        name: 'Jane Doe',
      });

      // 1. First request is fine
      await authService.forgotPassword(email);

      // 2. Immediate second request hits 60s cooldown
      await expect(
        authService.forgotPassword(email)
      ).rejects.toThrow('Please wait 60 seconds before requesting another code');

      // Clear cooldown manually to test hourly cap
      delete redisStore[`password_reset_resend_cooldown:${email}`];

      // Simulate 4 more requests (total 5)
      for (let i = 0; i < 4; i++) {
        await authService.forgotPassword(email);
        delete redisStore[`password_reset_resend_cooldown:${email}`];
      }

      // 6th request should hit hourly cap
      await expect(
        authService.forgotPassword(email)
      ).rejects.toThrow('Too many code requests. Please try again in an hour');
    });
  });
});

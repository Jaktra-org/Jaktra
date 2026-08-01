import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { EmailVerificationService } from '../../../src/modules/auth/email-verification.service.js';
import { AuthService } from '../../../src/modules/auth/auth.service.js';
import { OtpService } from '../../../src/modules/auth/otp.service.js';

describe('EmailVerificationService & AuthService Registration Integration', () => {
  let redisStore: Record<string, string> = {};
  let redisTtls: Record<string, number> = {};
  let mockRedis: any;
  let mockUserRepo: any;
  let mockLockoutService: any;
  let mockEventRepo: any;
  let mockPlatformMailer: any;
  let verificationService: EmailVerificationService;
  let authService: AuthService;

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
      createTenantWithAdmin: vi.fn(),
      findByIdWithTenantSettings: vi.fn(),
    };

    mockLockoutService = {
      checkLockout: vi.fn(),
      recordFailure: vi.fn(),
      clearFailures: vi.fn(),
    };

    mockEventRepo = {
      create: vi.fn(),
    };

    mockPlatformMailer = {
      sendOtpEmail: vi.fn().mockResolvedValue({ success: true }),
    };

    verificationService = new EmailVerificationService(mockRedis);
    authService = new AuthService(
      mockUserRepo,
      'my-jwt-secret',
      '7d',
      mockLockoutService,
      mockEventRepo,
      verificationService,
      mockPlatformMailer,
      mockRedis,
      new OtpService(mockRedis)
    );
  });

  describe('Registration Phase 1 (onboard)', () => {
    it('should normalize email, hash password, store details and OTP in Redis, and send OTP email', async () => {
      mockUserRepo.findFirstByEmail.mockResolvedValue(undefined);

      const result = await authService.onboard({
        name: 'John Doe',
        companyName: 'Acme LLC',
        email: '  John.Doe@Example.Com  ',
        password: 'securePassword123',
      });

      expect(result).toEqual({ pendingVerification: true });
      expect(mockUserRepo.findFirstByEmail).toHaveBeenCalledWith('john.doe@example.com');
      expect(mockUserRepo.createTenantWithAdmin).not.toHaveBeenCalled();

      // Check Redis keys
      expect(redisStore['pending_registration:john.doe@example.com']).toBeDefined();
      expect(redisStore['email_otp:john.doe@example.com']).toBeDefined();
      expect(redisTtls['pending_registration:john.doe@example.com']).toBe(900);
      expect(redisTtls['email_otp:john.doe@example.com']).toBe(600);

      const pending = JSON.parse(redisStore['pending_registration:john.doe@example.com']);
      expect(pending.name).toBe('John Doe');
      expect(pending.companyName).toBe('Acme LLC');
      expect(pending.email).toBe('john.doe@example.com');
      expect(await bcrypt.compare('securePassword123', pending.passwordHash)).toBe(true);

      expect(mockPlatformMailer.sendOtpEmail).toHaveBeenCalledWith(
        'john.doe@example.com',
        expect.stringMatching(/^\d{6}$/)
      );
    });

    it('should throw safe generic error if email is already taken in Database', async () => {
      mockUserRepo.findFirstByEmail.mockResolvedValue({ id: 'existing-user' });

      await expect(
        authService.onboard({
          name: 'Jane Doe',
          companyName: 'Duplicate Inc',
          email: 'jane@duplicate.com',
          password: 'securePassword123',
        })
      ).rejects.toThrow('an account with this email may already exist — try logging in or resetting your password');

      expect(redisStore['pending_registration:jane@duplicate.com']).toBeUndefined();
    });
  });

  describe('Registration Phase 2 (verifyEmail)', () => {
    it('should successfully verify, create Database tenant and admin user, delete Redis keys, and return JWT', async () => {
      const email = 'verify@example.com';
      const plainCode = '123456';
      const hashedCode = crypto.createHash('sha256').update(plainCode).digest('hex');

      // Populate Redis
      redisStore[`pending_registration:${email}`] = JSON.stringify({
        name: 'Verify Admin',
        email,
        passwordHash: 'dummyHash',
        companyName: 'Verify Co',
      });
      redisStore[`email_otp:${email}`] = JSON.stringify({ hashedCode, attempts: 0 });

      mockUserRepo.createTenantWithAdmin.mockResolvedValue({
        tenant: { id: 'tenant-1' },
        user: { id: 'user-1', name: 'Verify Admin', email, role: 'admin', emailVerified: true },
      });

      const result = await authService.verifyEmail(email, plainCode);

      expect(result.token).toBeDefined();
      expect(result.user.name).toBe('Verify Admin');
      expect(mockUserRepo.createTenantWithAdmin).toHaveBeenCalledWith(
        { name: 'Verify Co', slug: 'verify-co' },
        { name: 'Verify Admin', email, passwordHash: 'dummyHash', role: 'admin', emailVerified: true }
      );

      // Keys should be cleared
      expect(redisStore[`pending_registration:${email}`]).toBeUndefined();
      expect(redisStore[`email_otp:${email}`]).toBeUndefined();
    });

    it('should increment attempts and throw error on incorrect code, deleting key after 5 wrong attempts', async () => {
      const email = 'wrong-otp@example.com';
      const realCode = '123456';
      const hashedCode = crypto.createHash('sha256').update(realCode).digest('hex');

      redisStore[`pending_registration:${email}`] = JSON.stringify({
        name: 'Wrong OTP User',
        email,
        passwordHash: 'dummyHash',
        companyName: 'Wrong OTP Co',
      });
      redisStore[`email_otp:${email}`] = JSON.stringify({ hashedCode, attempts: 0 });
      redisTtls[`email_otp:${email}`] = 600;

      // 1st wrong attempt
      await expect(authService.verifyEmail(email, '000000')).rejects.toThrow('Invalid or expired code, request a new one');
      const otpData = JSON.parse(redisStore[`email_otp:${email}`]);
      expect(otpData.attempts).toBe(1);

      // Force to 4 attempts and test 5th wrong attempt
      otpData.attempts = 4;
      redisStore[`email_otp:${email}`] = JSON.stringify(otpData);
      
      await expect(authService.verifyEmail(email, '000000')).rejects.toThrow('Invalid or expired code, request a new one');
      expect(redisStore[`email_otp:${email}`]).toBeUndefined(); // Deleted!
    });
  });

  describe('Resend Verification & Limits', () => {
    it('should enforce 60s cooldown and max 5 per hour limits', async () => {
      const email = 'resend@example.com';
      redisStore[`pending_registration:${email}`] = JSON.stringify({
        name: 'Resend User',
        email,
        passwordHash: 'dummyHash',
        companyName: 'Resend Co',
      });

      // 1. Initial resend succeeds
      await authService.resendVerification(email);
      expect(redisStore[`resend_cooldown:${email}`]).toBe('1');
      expect(redisStore[`resend_count:${email}`]).toBe('1');

      // 2. Immediate resend fails due to cooldown
      await expect(authService.resendVerification(email)).rejects.toThrow(
        'Please wait 60 seconds before requesting another code'
      );

      // 3. Clear cooldown, resend up to hourly limit
      delete redisStore[`resend_cooldown:${email}`];
      redisStore[`resend_count:${email}`] = '5';

      await expect(authService.resendVerification(email)).rejects.toThrow(
        'Too many code requests. Please try again in an hour'
      );
    });

    it('should return a clean error if resend is triggered with NO pending registration', async () => {
      const email = 'nonexistent-resend@example.com';

      await expect(authService.resendVerification(email)).rejects.toThrow(
        'Please restart registration'
      );
    });
  });

  describe('No Stuck Emails / TTL Expiry Reset', () => {
    it('should allow starting a fresh registration with the same email after TTL expires', async () => {
      const email = 'stuck@example.com';

      // 1. Start registration
      mockUserRepo.findFirstByEmail.mockResolvedValue(undefined);
      await authService.onboard({
        name: 'Stuck User',
        companyName: 'Stuck Co',
        email,
        password: 'password123',
      });

      expect(redisStore[`pending_registration:${email}`]).toBeDefined();

      // 2. Simulate TTL expiry by deleting keys from store
      delete redisStore[`pending_registration:${email}`];
      delete redisStore[`email_otp:${email}`];

      // 3. Start registration again with the same email
      const result = await authService.onboard({
        name: 'Stuck User',
        companyName: 'Stuck Co',
        email,
        password: 'password123',
      });

      expect(result.pendingVerification).toBe(true);
      expect(redisStore[`pending_registration:${email}`]).toBeDefined();
    });
  });

  describe('Login Verification Check', () => {
    it('should block login with a 403 error for unverified users (emailVerified = false)', async () => {
      const email = 'unverified-login@example.com';
      const password = 'myPassword';
      const passwordHash = await bcrypt.hash(password, 1);

      mockUserRepo.findFirstByEmail.mockResolvedValue({
        id: 'user-123',
        tenantId: 'tenant-123',
        email,
        passwordHash,
        role: 'admin',
        emailVerified: false,
      });

      await expect(authService.login({ email, password })).rejects.toThrow(
        'please verify your email before logging in'
      );
    });

    it('should allow login for verified users', async () => {
      const email = 'verified-login@example.com';
      const password = 'myPassword';
      const passwordHash = await bcrypt.hash(password, 1);

      mockUserRepo.findFirstByEmail.mockResolvedValue({
        id: 'user-123',
        tenantId: 'tenant-123',
        email,
        passwordHash,
        role: 'viewer',
        emailVerified: true,
        mfaEnabled: false,
      });

      const result = await authService.login({ email, password });
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
    });
  });
});

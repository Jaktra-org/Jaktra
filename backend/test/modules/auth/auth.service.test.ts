import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthService } from '../../../src/modules/auth/auth.service.js';
import { AuthError } from '../../../src/shared/errors/index.js';
import { OtpService } from '../../../src/modules/auth/otp.service.js';

vi.mock('bcryptjs');
vi.mock('jsonwebtoken');

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepo: any;
  let mockLockout: any;
  let mockEventRepo: any;
  let mockEmailVerificationService: any;
  let mockPlatformMailer: any;

  beforeEach(() => {
    mockUserRepo = {
      tenantExists: vi.fn(),
      findByEmail: vi.fn(),
      findFirstByEmail: vi.fn(),
      create: vi.fn(),
      createTenantWithAdmin: vi.fn(),
      findById: vi.fn(),
      findByIdWithTenantSettings: vi.fn().mockResolvedValue({ user: null, mfaRequired: false }),
      update: vi.fn(),
      updateMfaFields: vi.fn(),
    };
    mockLockout = {
      checkLockout: vi.fn().mockResolvedValue(undefined),
      recordFailure: vi.fn().mockResolvedValue(undefined),
      clearFailures: vi.fn().mockResolvedValue(undefined),
      checkMfaLockout: vi.fn().mockResolvedValue(undefined),
      recordMfaFailure: vi.fn().mockResolvedValue(undefined),
      clearMfaFailures: vi.fn().mockResolvedValue(undefined),
    };
    mockEventRepo = { create: vi.fn().mockResolvedValue({}) };
    mockEmailVerificationService = {
      storePendingRegistration: vi.fn().mockResolvedValue('123456'),
      verifyOtp: vi.fn(),
      resendOtp: vi.fn(),
    };
    mockPlatformMailer = {
      sendOtpEmail: vi.fn().mockResolvedValue({ success: true }),
    };

    authService = new AuthService(
      mockUserRepo,
      'secret',
      '1h',
      mockLockout,
      mockEventRepo,
      mockEmailVerificationService,
      mockPlatformMailer,
      null,
      new OtpService(null)
    );
    vi.resetAllMocks();
  });

  describe('onboard', () => {
    it('should throw AuthError if email already exists', async () => {
      mockUserRepo.findFirstByEmail.mockResolvedValue({ id: 'u1' });

      await expect(
        authService.onboard({ name: 'John Doe', email: 'test@example.com', password: 'pass', companyName: 'Acme' })
      ).rejects.toThrow(AuthError);
    });

    it('should register a new user successfully', async () => {
      mockUserRepo.findFirstByEmail.mockResolvedValue(null);
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed_pass' as never);
      mockEmailVerificationService.storePendingRegistration.mockResolvedValue('123456');
      mockPlatformMailer.sendOtpEmail.mockResolvedValue({ success: true });

      const result = await authService.onboard({ name: 'John Doe', email: 'test@example.com', password: 'pass', companyName: 'Acme' });
      
      expect(result).toEqual({ pendingVerification: true });
      expect(mockEmailVerificationService.storePendingRegistration).toHaveBeenCalledWith(
        'test@example.com',
        {
          name: 'John Doe',
          email: 'test@example.com',
          passwordHash: 'hashed_pass',
          companyName: 'Acme',
        }
      );
      expect(mockPlatformMailer.sendOtpEmail).toHaveBeenCalledWith('test@example.com', '123456');
    });
  });

  describe('login', () => {
    beforeEach(() => {
      // Re-apply lockout mocks after vi.resetAllMocks() clears them
      mockLockout.checkLockout.mockResolvedValue(undefined);
      mockLockout.recordFailure.mockResolvedValue(undefined);
      mockLockout.clearFailures.mockResolvedValue(undefined);
    });

    it('should throw if user not found', async () => {
      mockUserRepo.findFirstByEmail.mockResolvedValue(null);

      await expect(
        authService.login({ email: 'test@example.com', password: 'pass' })
      ).rejects.toThrow(AuthError);
    });

    it('should throw if password invalid', async () => {
      mockUserRepo.findFirstByEmail.mockResolvedValue({ id: 'u1', passwordHash: 'hash', mfaEnabled: false, emailVerified: true });
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(
        authService.login({ email: 'test@example.com', password: 'pass' })
      ).rejects.toThrow(AuthError);
    });

    it('should return token on success', async () => {
      mockUserRepo.findFirstByEmail.mockResolvedValue({ id: 'u1', passwordHash: 'hash', tenantId: 't1', mfaEnabled: false, role: 'viewer', emailVerified: true });
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      vi.mocked(jwt.sign).mockReturnValue('valid_token' as never);

      const result = await authService.login({ email: 'test@example.com', password: 'pass' });

      // Result is AuthResult | MfaPendingResult — cast since mfaEnabled=false
      expect((result as any).token).toBe('valid_token');
    });

    it('should normalize email to lowercase during login', async () => {
      mockUserRepo.findFirstByEmail.mockResolvedValue({ id: 'u1', passwordHash: 'hash', tenantId: 't1', mfaEnabled: false, role: 'viewer', emailVerified: true });
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      vi.mocked(jwt.sign).mockReturnValue('valid_token' as never);

      await authService.login({ email: '  TEST@example.com ', password: 'pass' });

      expect(mockUserRepo.findFirstByEmail).toHaveBeenCalledWith('test@example.com');
    });
  });

  describe('updateProfile', () => {
    it('should throw AuthError if user not found during update', async () => {
      mockUserRepo.update.mockResolvedValue(null);

      await expect(
        authService.updateProfile('u1', { name: 'New Name' })
      ).rejects.toThrow(AuthError);
    });

    it('should successfully update and return stripped user details', async () => {
      mockUserRepo.update.mockResolvedValue({
        id: 'u1',
        name: 'New Name',
        email: 'test@example.com',
        role: 'admin',
        passwordHash: 'hash',
        tenantId: 't1'
      });

      const result = await authService.updateProfile('u1', { name: 'New Name' });
      
      expect(result).not.toHaveProperty('passwordHash');
      expect(result.name).toBe('New Name');
      expect(mockUserRepo.update).toHaveBeenCalledWith('u1', { name: 'New Name' });
    });
  });

  describe('refreshToken', () => {
    it('successfully refreshes token', async () => {
      vi.mocked(jwt.verify).mockReturnValue({ userId: 'u1' } as any);
      mockUserRepo.findById.mockResolvedValue({ id: 'u1', name: 'John', email: 'j@example.com', role: 'viewer', tenantId: 't1' });
      vi.mocked(jwt.sign).mockReturnValue('new_token' as never);

      const result = await authService.refreshToken('old_token');
      expect(result.token).toBe('new_token');
    });

    it('rejects refresh if token is mfaPending', async () => {
      vi.mocked(jwt.verify).mockReturnValue({ userId: 'u1', mfaPending: true } as any);
      mockUserRepo.findById.mockResolvedValue({ id: 'u1', name: 'John', email: 'j@example.com', role: 'viewer', tenantId: 't1' });

      await expect(authService.refreshToken('mfa_pending_token')).rejects.toThrow('MFA verification required');
    });
  });
});


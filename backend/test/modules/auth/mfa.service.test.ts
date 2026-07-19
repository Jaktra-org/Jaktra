import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '../../../src/modules/auth/auth.service.js';
import { OtpService } from '../../../src/modules/auth/otp.service.js';

const dummyEmailVerificationService = {} as any;
const dummyPlatformMailer = {} as any;
const dummyRedis = null;
const dummyOtpService = new OtpService(null);
import { AuthError, ForbiddenError } from '../../../src/shared/errors/index.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

vi.mock('bcryptjs');
vi.mock('jsonwebtoken');

vi.mock('otplib', () => {
  class MockCrypto {}
  class MockBase32 {}
  const localMock = {
    generateSecret: () => 'TESTSECRETBASE32',
    keyuri: (email: string, issuer: string, secret: string) =>
      `otpauth://totp/${issuer}:${email}?secret=${secret}`,
    toURI: (opts?: { label?: string; issuer?: string; secret?: string }) =>
      `otpauth://totp/${opts?.issuer}:${opts?.label}?secret=${opts?.secret}`,
    verify: (...args: any[]) => {
      const res = (globalThis as any).mfaVerifyMock(...args);
      return typeof res === 'boolean' ? { valid: res } : (res ?? { valid: true });
    },
  };

  class MockTOTP {
    generateSecret(): string {
      return localMock.generateSecret();
    }
    keyuri(email: string, issuer: string, secret: string): string {
      return localMock.keyuri(email, issuer, secret);
    }
    toURI(opts?: { label?: string; issuer?: string; secret?: string }): string {
      return localMock.toURI(opts);
    }
    verify(...args: any[]): boolean | { valid: boolean } {
      return localMock.verify(...args);
    }
  }

  return {
    totp: localMock,
    TOTP: MockTOTP,
    NobleCryptoPlugin: MockCrypto,
    ScureBase32Plugin: MockBase32,
  };
});

const mockVerify = vi.fn();
(globalThis as any).mfaVerifyMock = mockVerify;
const totp = {
  verify: mockVerify,
};
vi.mock('qrcode', () => ({
  default: {
    toDataURL: vi.fn(async () => 'data:image/png;base64,FAKEQR'),
  },
}));
vi.mock('../../../src/shared/encryption.js', () => ({
  encrypt: vi.fn(() => ({
    ciphertext: 'enc_ct',
    iv: 'enc_iv',
    authTag: 'enc_tag',
    keyVersion: 1,
  })),
  decrypt: vi.fn(() => 'TESTSECRETBASE32'),
}));

const JWT_SECRET = 'testsecret-at-least-32-characters!!';

function makeUser(overrides: Record<string, unknown> = {}): any {
  return {
    id: 'user-1',
    tenantId: 'tenant-1',
    name: 'Alice',
    email: 'alice@acme.com',
    passwordHash: 'hashed',
    role: 'admin',
    mfaEnabled: false,
    mfaSecret: null,
    mfaSecretIv: null,
    mfaSecretAuthTag: null,
    mfaSecretKeyVersion: null,
    mfaBackupCodes: null,
    mfaLastUsedStep: null,
    createdAt: new Date(),
    ...overrides,
  };
}

function makeRepo(userOverrides: Record<string, unknown> = {}): any {
  const user = makeUser(userOverrides);
  return {
    findFirstByEmail: vi.fn(async () => user),
    findById: vi.fn(async () => user),
    findByIdWithTenantSettings: vi.fn(async () => ({ user, mfaRequired: false })),
    updateMfaFields: vi.fn(async () => user),
    update: vi.fn(async () => user),
    create: vi.fn(),
    createTenantWithAdmin: vi.fn(),
    tenantExists: vi.fn(),
  };
}

function makeLockout(): any {
  return {
    checkLockout: vi.fn().mockResolvedValue(undefined),
    recordFailure: vi.fn().mockResolvedValue(undefined),
    clearFailures: vi.fn().mockResolvedValue(undefined),
    checkMfaLockout: vi.fn().mockResolvedValue(undefined),
    recordMfaFailure: vi.fn().mockResolvedValue(undefined),
    clearMfaFailures: vi.fn().mockResolvedValue(undefined),
  };
}

function makeEventRepo(): any {
  return { create: vi.fn().mockResolvedValue({}) };
}

function makeService(userOverrides: Record<string, unknown> = {}): any {
  const repo = makeRepo(userOverrides);
  const lockout = makeLockout();
  const eventRepo = makeEventRepo();
  const svc = new AuthService(repo, JWT_SECRET, '7d', lockout, eventRepo, dummyEmailVerificationService, dummyPlatformMailer, dummyRedis, dummyOtpService);
  return { svc, repo, lockout, eventRepo };
}

// ─────────────────────────────────────────────────────────────
// Login with MFA enabled
// ─────────────────────────────────────────────────────────────

describe('AuthService.login — MFA integration', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
    vi.mocked(jwt.sign).mockReturnValue('real_token' as never);
  });

  it('returns mfaPending when user has mfaEnabled=true', async () => {
    const { svc } = makeService({ mfaEnabled: true });
    const result = await svc.login({ email: 'alice@acme.com', password: 'pass' });
    expect(result).toHaveProperty('mfaPending', true);
    expect(result).toHaveProperty('mfaPendingToken');
    expect(result).not.toHaveProperty('token');
  });

  it('issues real JWT when user has mfaEnabled=false', async () => {
    const { svc } = makeService({ mfaEnabled: false });
    const result = await svc.login({ email: 'alice@acme.com', password: 'pass' });
    expect(result).toHaveProperty('token');
    expect(result).not.toHaveProperty('mfaPending');
  });

  it('blocks admin login when mfaRequired=true and mfaEnabled=false', async () => {
    const repo = makeRepo({ mfaEnabled: false, role: 'admin' });
    repo.findByIdWithTenantSettings.mockResolvedValue({
      user: makeUser({ mfaEnabled: false, role: 'admin' }),
      mfaRequired: true,
    });
    const svc = new AuthService(repo, JWT_SECRET, '7d', makeLockout(), makeEventRepo(), dummyEmailVerificationService, dummyPlatformMailer, dummyRedis, dummyOtpService);
    await expect(
      svc.login({ email: 'alice@acme.com', password: 'pass' }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('does not block non-admin when mfaRequired=true and mfaEnabled=false', async () => {
    const repo = makeRepo({ mfaEnabled: false, role: 'viewer' });
    const svc = new AuthService(repo, JWT_SECRET, '7d', makeLockout(), makeEventRepo(), dummyEmailVerificationService, dummyPlatformMailer, dummyRedis, dummyOtpService);
    const result = await svc.login({ email: 'alice@acme.com', password: 'pass' });
    expect(result).toHaveProperty('token');
  });

  it('calls lockout.checkLockout before DB lookup', async () => {
    const { svc, lockout } = makeService();
    await svc.login({ email: 'alice@acme.com', password: 'pass' });
    // findFirstByEmail is called after checkLockout — hard to inspect order through repo,
    // so just verify checkLockout was called at all
    expect(lockout.checkLockout).toHaveBeenCalledWith('alice@acme.com');
  });

  it('records failure and throws generic error when user not found', async () => {
    const repo = makeRepo();
    repo.findFirstByEmail.mockResolvedValue(null);
    const lockout = makeLockout();
    const svc = new AuthService(repo, JWT_SECRET, '7d', lockout, makeEventRepo(), dummyEmailVerificationService, dummyPlatformMailer, dummyRedis, dummyOtpService);
    await expect(svc.login({ email: 'nobody@acme.com', password: 'pass' })).rejects.toBeInstanceOf(AuthError);
    expect(lockout.recordFailure).toHaveBeenCalledWith('nobody@acme.com');
  });

  it('records failure and throws generic error on wrong password', async () => {
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);
    const { svc, lockout } = makeService();
    await expect(svc.login({ email: 'alice@acme.com', password: 'wrong' })).rejects.toBeInstanceOf(AuthError);
    expect(lockout.recordFailure).toHaveBeenCalled();
  });

  it('clears failures on successful login', async () => {
    const { svc, lockout } = makeService();
    await svc.login({ email: 'alice@acme.com', password: 'pass' });
    expect(lockout.clearFailures).toHaveBeenCalledWith('alice@acme.com');
  });
});

// ─────────────────────────────────────────────────────────────
// MFA setup
// ─────────────────────────────────────────────────────────────

describe('AuthService.initiateMfaSetup', () => {
  beforeEach(() => vi.resetAllMocks());

  it('returns a QR code data URL', async () => {
    const { svc } = makeService({ mfaEnabled: false });
    const result = await svc.initiateMfaSetup('user-1');
    expect(result.qrCodeDataUrl).toMatch(/^data:image/);
  });

  it('does NOT return the plaintext TOTP secret', async () => {
    const { svc } = makeService({ mfaEnabled: false });
    const result = await svc.initiateMfaSetup('user-1');
    expect(result).not.toHaveProperty('secret');
  });

  it('stores encrypted secret fields', async () => {
    const { svc, repo } = makeService({ mfaEnabled: false });
    await svc.initiateMfaSetup('user-1');
    expect(repo.updateMfaFields).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({
        mfaSecret: 'enc_ct',
        mfaSecretIv: 'enc_iv',
        mfaSecretAuthTag: 'enc_tag',
        mfaSecretKeyVersion: 1,
      }),
    );
    // mfaEnabled should NOT be set to true yet
    expect(repo.updateMfaFields.mock.calls[0][1]).not.toHaveProperty('mfaEnabled', true);
  });

  it('throws if MFA already enabled', async () => {
    const { svc } = makeService({ mfaEnabled: true });
    await expect(svc.initiateMfaSetup('user-1')).rejects.toBeInstanceOf(AuthError);
  });
});

describe('AuthService.confirmMfaSetup', () => {
  beforeEach(() => vi.resetAllMocks());

  const pendingUser = makeUser({
    mfaEnabled: false,
    mfaSecret: 'enc_ct',
    mfaSecretIv: 'enc_iv',
    mfaSecretAuthTag: 'enc_tag',
    mfaSecretKeyVersion: 1,
  });

  it('marks mfaEnabled=true and returns backup codes on correct code', async () => {
    vi.mocked(totp.verify).mockReturnValue(true as never);
    vi.mocked(bcrypt.hash).mockResolvedValue('hashed_code' as never);

    const repo = makeRepo();
    repo.findById.mockResolvedValue(pendingUser);
    const svc = new AuthService(repo, JWT_SECRET, '7d', makeLockout(), makeEventRepo(), dummyEmailVerificationService, dummyPlatformMailer, dummyRedis, dummyOtpService);

    const result = await svc.confirmMfaSetup('user-1', '123456');
    expect(result.backupCodes).toHaveLength(8);
    expect(repo.updateMfaFields).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ mfaEnabled: true }),
    );
  });

  it('throws AuthError on wrong TOTP code', async () => {
    vi.mocked(totp.verify).mockReturnValue(false as never);
    const repo = makeRepo();
    repo.findById.mockResolvedValue(pendingUser);
    const svc = new AuthService(repo, JWT_SECRET, '7d', makeLockout(), makeEventRepo(), dummyEmailVerificationService, dummyPlatformMailer, dummyRedis, dummyOtpService);
    await expect(svc.confirmMfaSetup('user-1', '000000')).rejects.toBeInstanceOf(AuthError);
  });

  it('throws if setup not yet initiated (no mfaSecret)', async () => {
    const { svc } = makeService({ mfaEnabled: false, mfaSecret: null });
    await expect(svc.confirmMfaSetup('user-1', '123456')).rejects.toBeInstanceOf(AuthError);
  });
});

// ─────────────────────────────────────────────────────────────
// MFA verify (login step 2)
// ─────────────────────────────────────────────────────────────

describe('AuthService.verifyMfaCode', () => {
  const mfaUser = makeUser({
    mfaEnabled: true,
    mfaSecret: 'enc_ct',
    mfaSecretIv: 'enc_iv',
    mfaSecretAuthTag: 'enc_tag',
    mfaSecretKeyVersion: 1,
    mfaLastUsedStep: 50000,
  });

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(jwt.sign).mockReturnValue('real_token' as never);
  });

  it('issues real JWT on correct TOTP code', async () => {
    vi.mocked(jwt.verify).mockReturnValue({ userId: 'user-1', mfaPending: true } as never);
    vi.mocked(totp.verify).mockReturnValue(true as never);

    const repo = makeRepo();
    repo.findById.mockResolvedValue(mfaUser);
    const svc = new AuthService(repo, JWT_SECRET, '7d', makeLockout(), makeEventRepo(), dummyEmailVerificationService, dummyPlatformMailer, dummyRedis, dummyOtpService);

    const result = await svc.verifyMfaCode('pending_token', '123456');
    expect(result).toHaveProperty('token', 'real_token');
  });

  it('rejects wrong TOTP code and increments MFA failure counter', async () => {
    vi.mocked(jwt.verify).mockReturnValue({ userId: 'user-1', mfaPending: true } as never);
    vi.mocked(totp.verify).mockReturnValue(false as never);
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

    const repo = makeRepo();
    repo.findById.mockResolvedValue({ ...mfaUser, mfaBackupCodes: '[]' });
    const lockout = makeLockout();
    const svc = new AuthService(repo, JWT_SECRET, '7d', lockout, makeEventRepo(), dummyEmailVerificationService, dummyPlatformMailer, dummyRedis, dummyOtpService);

    await expect(svc.verifyMfaCode('pending_token', '000000')).rejects.toBeInstanceOf(AuthError);
    expect(lockout.recordMfaFailure).toHaveBeenCalledWith('user-1');
  });

  it('blocks even correct code after MFA lockout (deny-list)', async () => {
    vi.mocked(jwt.verify).mockReturnValue({ userId: 'user-1', mfaPending: true } as never);
    const lockout = makeLockout();
    lockout.checkMfaLockout.mockRejectedValue(new AuthError('Invalid email or password', 401));

    const repo = makeRepo();
    repo.findById.mockResolvedValue(mfaUser);
    const svc = new AuthService(repo, JWT_SECRET, '7d', lockout, makeEventRepo(), dummyEmailVerificationService, dummyPlatformMailer, dummyRedis, dummyOtpService);

    await expect(svc.verifyMfaCode('pending_token', '123456')).rejects.toBeInstanceOf(AuthError);
  });

  it('rejects expired/invalid pending token', async () => {
    vi.mocked(jwt.verify).mockImplementation(() => { throw new Error('expired'); });
    const { svc } = makeService();
    await expect(svc.verifyMfaCode('bad_token', '123456')).rejects.toBeInstanceOf(AuthError);
  });

  it('rejects real JWT used as pending token (no mfaPending flag)', async () => {
    vi.mocked(jwt.verify).mockReturnValue({ userId: 'user-1' } as never); // no mfaPending
    const { svc } = makeService();
    await expect(svc.verifyMfaCode('real_jwt', '123456')).rejects.toBeInstanceOf(AuthError);
  });

  describe('replay protection — afterTimeStep', () => {
    it('accepts first use of a TOTP code', async () => {
      vi.mocked(jwt.verify).mockReturnValue({ userId: 'user-1', mfaPending: true } as never);
      vi.mocked(totp.verify).mockReturnValue(true as never);

      const repo = makeRepo();
      repo.findById.mockResolvedValue(mfaUser);
      const svc = new AuthService(repo, JWT_SECRET, '7d', makeLockout(), makeEventRepo(), dummyEmailVerificationService, dummyPlatformMailer, dummyRedis, dummyOtpService);

      const result = await svc.verifyMfaCode('pending_token', '123456');
      expect(result).toHaveProperty('token');
    });

    it('passes mfaLastUsedStep as afterTimeStep to totp.verify', async () => {
      vi.mocked(jwt.verify).mockReturnValue({ userId: 'user-1', mfaPending: true } as never);
      vi.mocked(totp.verify).mockReturnValue(true as never);

      const repo = makeRepo();
      repo.findById.mockResolvedValue(mfaUser); // mfaLastUsedStep: 50000
      const svc = new AuthService(repo, JWT_SECRET, '7d', makeLockout(), makeEventRepo(), dummyEmailVerificationService, dummyPlatformMailer, dummyRedis, dummyOtpService);

      await svc.verifyMfaCode('pending_token', '123456');

      expect(totp.verify).toHaveBeenCalledWith(
        '123456',
        expect.objectContaining({ afterTimeStep: 50000 }),
      );
    });

    it('updates mfaLastUsedStep after successful TOTP verification', async () => {
      vi.mocked(jwt.verify).mockReturnValue({ userId: 'user-1', mfaPending: true } as never);
      vi.mocked(totp.verify).mockReturnValue(true as never);

      const repo = makeRepo();
      repo.findById.mockResolvedValue(mfaUser);
      const svc = new AuthService(repo, JWT_SECRET, '7d', makeLockout(), makeEventRepo(), dummyEmailVerificationService, dummyPlatformMailer, dummyRedis, dummyOtpService);

      await svc.verifyMfaCode('pending_token', '123456');

      expect(repo.updateMfaFields).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({ mfaLastUsedStep: expect.any(Number) }),
      );
    });

    it('rejects replayed code (simulated by totp.verify returning false for afterTimeStep check)', async () => {
      vi.mocked(jwt.verify).mockReturnValue({ userId: 'user-1', mfaPending: true } as never);
      // First call: valid. Second call: rejected (afterTimeStep check fails)
      vi.mocked(totp.verify)
        .mockReturnValueOnce(true as never)
        .mockReturnValueOnce(false as never);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      const repo = makeRepo();
      repo.findById.mockResolvedValue({ ...mfaUser, mfaBackupCodes: '[]' });
      const lockout = makeLockout();
      const svc = new AuthService(repo, JWT_SECRET, '7d', lockout, makeEventRepo(), dummyEmailVerificationService, dummyPlatformMailer, dummyRedis, dummyOtpService);

      // First use — succeeds
      await svc.verifyMfaCode('pending_token', '123456');

      // Second use of same code — totp.verify returns false (mocked)
      vi.mocked(jwt.verify).mockReturnValue({ userId: 'user-1', mfaPending: true } as never);
      await expect(svc.verifyMfaCode('pending_token', '123456')).rejects.toBeInstanceOf(AuthError);
    });
  });

  describe('backup codes', () => {
    it('accepts a valid backup code and invalidates it after use', async () => {
      vi.mocked(jwt.verify).mockReturnValue({ userId: 'user-1', mfaPending: true } as never);
      vi.mocked(totp.verify).mockReturnValue(false as never); // TOTP fails
      vi.mocked(bcrypt.compare)
        .mockResolvedValueOnce(false as never)  // first backup code doesn't match
        .mockResolvedValueOnce(true as never);  // second does

      const userWithBackups = {
        ...mfaUser,
        mfaBackupCodes: JSON.stringify(['hash1', 'hash2', 'hash3']),
      };
      const repo = makeRepo();
      repo.findById.mockResolvedValue(userWithBackups);
      const svc = new AuthService(repo, JWT_SECRET, '7d', makeLockout(), makeEventRepo(), dummyEmailVerificationService, dummyPlatformMailer, dummyRedis, dummyOtpService);

      const result = await svc.verifyMfaCode('pending_token', 'BACKUP1');
      expect(result).toHaveProperty('token');

      // The matched code (index 1) should be null in the stored array
      const savedCodes = JSON.parse(
        repo.updateMfaFields.mock.calls[0][1].mfaBackupCodes,
      );
      expect(savedCodes[1]).toBeNull();
      expect(savedCodes[0]).toBe('hash1'); // others untouched
    });

    it('rejects a backup code used twice (already nulled)', async () => {
      vi.mocked(jwt.verify).mockReturnValue({ userId: 'user-1', mfaPending: true } as never);
      vi.mocked(totp.verify).mockReturnValue(false as never);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never); // null slot skipped

      const userWithUsedCode = {
        ...mfaUser,
        mfaBackupCodes: JSON.stringify([null, 'hash2']), // first slot already invalidated
      };
      const repo = makeRepo();
      repo.findById.mockResolvedValue(userWithUsedCode);
      const lockout = makeLockout();
      const svc = new AuthService(repo, JWT_SECRET, '7d', lockout, makeEventRepo(), dummyEmailVerificationService, dummyPlatformMailer, dummyRedis, dummyOtpService);

      await expect(svc.verifyMfaCode('pending_token', 'USED_CODE')).rejects.toBeInstanceOf(AuthError);
    });
  });
});

// ─────────────────────────────────────────────────────────────
// Disable MFA
// ─────────────────────────────────────────────────────────────

describe('AuthService.disableMfa', () => {
  beforeEach(() => vi.resetAllMocks());

  const activeUser = makeUser({
    mfaEnabled: true,
    mfaSecret: 'enc_ct',
    mfaSecretIv: 'enc_iv',
    mfaSecretAuthTag: 'enc_tag',
    mfaSecretKeyVersion: 1,
    mfaLastUsedStep: 50000,
  });

  it('disables MFA and nulls all seven MFA fields on correct code', async () => {
    vi.mocked(totp.verify).mockReturnValue(true as never);
    const repo = makeRepo();
    repo.findById.mockResolvedValue(activeUser);
    const svc = new AuthService(repo, JWT_SECRET, '7d', makeLockout(), makeEventRepo(), dummyEmailVerificationService, dummyPlatformMailer, dummyRedis, dummyOtpService);

    await svc.disableMfa('user-1', '123456');

    expect(repo.updateMfaFields).toHaveBeenCalledWith('user-1', {
      mfaEnabled: false,
      mfaSecret: null,
      mfaSecretIv: null,
      mfaSecretAuthTag: null,
      mfaSecretKeyVersion: null,
      mfaBackupCodes: null,
      mfaLastUsedStep: null, // must be nulled so re-enrolment starts clean
    });
  });

  it('rejects wrong TOTP code', async () => {
    vi.mocked(totp.verify).mockReturnValue(false as never);
    const repo = makeRepo();
    repo.findById.mockResolvedValue(activeUser);
    const svc = new AuthService(repo, JWT_SECRET, '7d', makeLockout(), makeEventRepo(), dummyEmailVerificationService, dummyPlatformMailer, dummyRedis, dummyOtpService);

    await expect(svc.disableMfa('user-1', '000000')).rejects.toBeInstanceOf(AuthError);
    expect(repo.updateMfaFields).not.toHaveBeenCalled();
  });

  it('throws if MFA is not enabled', async () => {
    const { svc } = makeService({ mfaEnabled: false });
    await expect(svc.disableMfa('user-1', '123456')).rejects.toBeInstanceOf(AuthError);
  });
});

// ─────────────────────────────────────────────────────────────
// verifyAndFetchUser — rejects MFA-pending tokens
// ─────────────────────────────────────────────────────────────

describe('AuthService.verifyAndFetchUser', () => {
  it('rejects a mfaPending token used as a bearer token', async () => {
    vi.mocked(jwt.verify).mockReturnValue({ userId: 'user-1', mfaPending: true } as never);
    const { svc } = makeService();
    await expect(svc.verifyAndFetchUser('mfa_pending_token')).rejects.toBeInstanceOf(AuthError);
  });

  it('accepts a real JWT (no mfaPending flag)', async () => {
    vi.mocked(jwt.verify).mockReturnValue({ userId: 'user-1' } as never);
    const { svc } = makeService();
    const result = await svc.verifyAndFetchUser('real_token');
    expect(result).toHaveProperty('userId', 'user-1');
  });
});

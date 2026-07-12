import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { TOTP, NobleCryptoPlugin, ScureBase32Plugin } from 'otplib';
const totp = new TOTP({ crypto: new NobleCryptoPlugin(), base32: new ScureBase32Plugin() });
import QRCode from 'qrcode';
import type { StringValue } from 'ms';
import type { UserRepository } from './user.repository.js';
import type { LockoutService } from './lockout.service.js';
import type { EventRepository } from '../event/event.repository.js';
import type { JwtPayload } from '../../shared/types/auth.js';
import type { User } from '../../db/index.js';
import { AuthError, ForbiddenError } from '../../shared/errors/index.js';
import { encrypt, decrypt } from '../../shared/encryption.js';
import { EmailVerificationService } from './email-verification.service.js';
import { PlatformMailer } from '../platform-mail/platform-mailer.js';

// V1 LIMITATION: No self-service MFA recovery flow exists.
// If a user loses both their authenticator device AND all backup codes, an admin
// must manually clear MFA fields in the database via Drizzle Studio or direct SQL:
//   UPDATE users SET mfa_enabled=false, mfa_secret=NULL, mfa_secret_iv=NULL,
//     mfa_secret_auth_tag=NULL, mfa_secret_key_version=NULL,
//     mfa_backup_codes=NULL, mfa_last_used_step=NULL WHERE id = '<userId>';
// A future v2 should add an admin API endpoint: DELETE /api/team/:userId/mfa

const SALT_ROUNDS = 12;
const MFA_BACKUP_CODE_COUNT = 8;
const MFA_PENDING_EXPIRES = '5m';
const mfaAad = (userId: string) => `user:${userId}`;

export interface OnboardInput {
  name: string;
  email: string;
  password: string;
  companyName: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export type SafeUser = Omit<User, 'passwordHash' | 'mfaSecret' | 'mfaSecretIv' | 'mfaSecretAuthTag' | 'mfaSecretKeyVersion' | 'mfaBackupCodes'>;

export interface AuthResult {
  user: SafeUser;
  token: string;
}

export interface MfaPendingResult {
  mfaPending: true;
  mfaPendingToken: string;
}

export interface MfaSetupInitiateResult {
  qrCodeDataUrl: string;

}

export interface MfaSetupConfirmResult {
  backupCodes: string[];
}

export class AuthService {
  constructor(
    private userRepo: UserRepository,
    private jwtSecret: string,
    private jwtExpiresIn: string,
    private lockoutService: LockoutService,
    private eventRepo: EventRepository,
    private emailVerificationService: EmailVerificationService,
    private platformMailer: PlatformMailer,
  ) {}

  async onboard(input: OnboardInput): Promise<{ pendingVerification: true }> {
    const normalizedEmail = input.email.toLowerCase().trim();
    const existing = await this.userRepo.findFirstByEmail(normalizedEmail);
    if (existing) {
      throw new AuthError('an account with this email may already exist — try logging in or resetting your password', 409);
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

    const code = await this.emailVerificationService.storePendingRegistration(
      normalizedEmail,
      {
        name: input.name,
        email: normalizedEmail,
        passwordHash,
        companyName: input.companyName,
      }
    );

    const emailResult = await this.platformMailer.sendOtpEmail(normalizedEmail, code);
    if (!emailResult.success) {
      if (process.env.NODE_ENV !== 'production' && emailResult.error === 'Platform SMTP not configured') {
        // Log skipped warning in non-production environments
      } else {
        throw new AuthError(`Failed to send verification email: ${emailResult.error}`, 500);
      }
    }

    return { pendingVerification: true };
  }

  async verifyEmail(email: string, code: string): Promise<AuthResult> {
    const normalizedEmail = email.toLowerCase().trim();
    const pending = await this.emailVerificationService.verifyOtp(normalizedEmail, code);

    const slug = pending.companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const { user } = await this.userRepo.createTenantWithAdmin(
      { name: pending.companyName, slug },
      { name: pending.name, email: normalizedEmail, passwordHash: pending.passwordHash, role: 'admin', emailVerified: true }
    );

    const token = this.signToken(user);
    return { user: this.stripSensitive(user), token };
  }

  async resendVerification(email: string): Promise<void> {
    const normalizedEmail = email.toLowerCase().trim();
    const code = await this.emailVerificationService.resendOtp(normalizedEmail);
    const emailResult = await this.platformMailer.sendOtpEmail(normalizedEmail, code);
    if (!emailResult.success) {
      if (process.env.NODE_ENV !== 'production' && emailResult.error === 'Platform SMTP not configured') {
        // Log skipped warning in non-production environments
      } else {
        throw new AuthError(`Failed to send verification email: ${emailResult.error}`, 500);
      }
    }
  }


  async login(input: LoginInput): Promise<AuthResult | MfaPendingResult> {
    const normalizedEmail = input.email.toLowerCase().trim();

    await this.lockoutService.checkLockout(normalizedEmail);

    const user = await this.userRepo.findFirstByEmail(normalizedEmail);
    if (!user) {
      await this.lockoutService.recordFailure(normalizedEmail);
      throw new AuthError('Invalid email or password', 401);
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      await this.lockoutService.recordFailure(normalizedEmail, user.tenantId, user.id);
      throw new AuthError('Invalid email or password', 401);
    }
    await this.lockoutService.clearFailures(normalizedEmail);

    if (user.emailVerified === false) {
      throw new AuthError('please verify your email before logging in', 403);
    }

    if (user.role === 'admin' && !user.mfaEnabled) {
      const withSettings = await this.userRepo.findByIdWithTenantSettings(user.id);
      if (withSettings?.mfaRequired) {
        throw new ForbiddenError(
          'Multi-factor authentication is required for admin accounts. ' +
          'Please enable MFA in Settings before logging in.',
        );
      }
    }

    if (user.mfaEnabled) {
      const mfaPendingToken = this.signMfaPendingToken(user);
      return { mfaPending: true, mfaPendingToken };
    }

    const token = this.signToken(user);
    return { user: this.stripSensitive(user), token };
  }


  async initiateMfaSetup(userId: string): Promise<MfaSetupInitiateResult> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new AuthError('User not found', 404);
    if (user.mfaEnabled) throw new AuthError('MFA is already enabled', 409);

    const secret = totp.generateSecret();

    const encrypted = encrypt(secret, mfaAad(userId));

    await this.userRepo.updateMfaFields(userId, {
      mfaSecret: encrypted.ciphertext,
      mfaSecretIv: encrypted.iv,
      mfaSecretAuthTag: encrypted.authTag,
      mfaSecretKeyVersion: encrypted.keyVersion,
    });

    const otpauthUrl = totp.toURI({ label: user.email, issuer: 'Jaktra', secret });
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

    return { qrCodeDataUrl };
  }


  async confirmMfaSetup(userId: string, totpCode: string): Promise<MfaSetupConfirmResult> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new AuthError('User not found', 404);
    if (user.mfaEnabled) throw new AuthError('MFA is already enabled', 409);
    if (!user.mfaSecret || !user.mfaSecretIv || !user.mfaSecretAuthTag || user.mfaSecretKeyVersion == null) {
      throw new AuthError('MFA setup not initiated', 400);
    }

    const secret = decrypt(
      {
        ciphertext: user.mfaSecret,
        iv: user.mfaSecretIv,
        authTag: user.mfaSecretAuthTag,
        keyVersion: user.mfaSecretKeyVersion,
      },
      mfaAad(userId),
    );

    const currentStep = Math.floor(Date.now() / 1000 / 30);
    const verifyResult = await totp.verify(totpCode, {
      secret,
      ...(user.mfaLastUsedStep !== null && user.mfaLastUsedStep !== undefined
        ? { afterTimeStep: user.mfaLastUsedStep }
        : {}),
    });
    const isValid = verifyResult.valid;

    if (!isValid) {
      throw new AuthError('Invalid verification code', 401);
    }

    const plainCodes = Array.from({ length: MFA_BACKUP_CODE_COUNT }, () =>
      crypto.randomBytes(5).toString('hex').toUpperCase(), // e.g. "A3F2C1B4D9"
    );
    const hashedCodes = await Promise.all(
      plainCodes.map((c) => bcrypt.hash(c, SALT_ROUNDS)),
    );

    await this.userRepo.updateMfaFields(userId, {
      mfaEnabled: true,
      mfaBackupCodes: JSON.stringify(hashedCodes),
      mfaLastUsedStep: currentStep,
    });

    this.emitMfaEvent(user.tenantId, userId, user.email, 'auth.mfa_enabled', 'MFA enabled by user.').catch(() => {/* swallow */});

    return { backupCodes: plainCodes };
  }

 
  async verifyMfaCode(mfaPendingToken: string, code: string): Promise<AuthResult> {
    let pendingPayload: JwtPayload & { mfaPending?: boolean };
    try {
      pendingPayload = jwt.verify(mfaPendingToken, this.jwtSecret) as JwtPayload & { mfaPending?: boolean };
    } catch {
      throw new AuthError('Invalid or expired authentication session', 401);
    }

    if (!pendingPayload.mfaPending) {
      throw new AuthError('Invalid authentication session', 401);
    }

    const userId = pendingPayload.userId;

    await this.lockoutService.checkMfaLockout(userId);

    const user = await this.userRepo.findById(userId);
    if (!user || !user.mfaEnabled) {
      throw new AuthError('Invalid email or password', 401);
    }

    if (!user.mfaSecret || !user.mfaSecretIv || !user.mfaSecretAuthTag || user.mfaSecretKeyVersion == null) {
      throw new AuthError('Invalid email or password', 401);
    }

    const secret = decrypt(
      {
        ciphertext: user.mfaSecret,
        iv: user.mfaSecretIv,
        authTag: user.mfaSecretAuthTag,
        keyVersion: user.mfaSecretKeyVersion,
      },
      mfaAad(userId),
    );

    const currentStep = Math.floor(Date.now() / 1000 / 30);

    const verifyResult = await totp.verify(code, {
      secret,
      ...(user.mfaLastUsedStep !== null && user.mfaLastUsedStep !== undefined
        ? { afterTimeStep: user.mfaLastUsedStep }
        : {}),
    });
    const totpValid = verifyResult.valid;

    if (totpValid) {
      await this.lockoutService.clearMfaFailures(userId);
      await this.userRepo.updateMfaFields(userId, { mfaLastUsedStep: currentStep });
      const token = this.signToken(user);
      return { user: this.stripSensitive(user), token };
    }

    const backedCodes: string[] = user.mfaBackupCodes
      ? (JSON.parse(user.mfaBackupCodes) as string[])
      : [];

    for (let i = 0; i < backedCodes.length; i++) {
      const hash = backedCodes[i];
      if (!hash) continue; 

      const matches = await bcrypt.compare(code, hash);
      if (matches) {
        const updatedCodes = [...backedCodes];
        updatedCodes[i] = null as unknown as string;
        await this.lockoutService.clearMfaFailures(userId);
        await this.userRepo.updateMfaFields(userId, {
          mfaBackupCodes: JSON.stringify(updatedCodes),
        });
        const token = this.signToken(user);
        return { user: this.stripSensitive(user), token };
      }
    }

    await this.lockoutService.recordMfaFailure(userId);
    throw new AuthError('Invalid verification code', 401);
  }

  async disableMfa(userId: string, totpCode: string): Promise<void> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new AuthError('User not found', 404);
    if (!user.mfaEnabled) throw new AuthError('MFA is not enabled', 400);

    if (!user.mfaSecret || !user.mfaSecretIv || !user.mfaSecretAuthTag || user.mfaSecretKeyVersion == null) {
      throw new AuthError('MFA configuration is invalid', 500);
    }

    const secret = decrypt(
      {
        ciphertext: user.mfaSecret,
        iv: user.mfaSecretIv,
        authTag: user.mfaSecretAuthTag,
        keyVersion: user.mfaSecretKeyVersion,
      },
      mfaAad(userId),
    );

    const verifyResult = await totp.verify(totpCode, {
      secret,
      ...(user.mfaLastUsedStep !== null && user.mfaLastUsedStep !== undefined
        ? { afterTimeStep: user.mfaLastUsedStep }
        : {}),
    });
    const isValid = verifyResult.valid;

    if (!isValid) {
      throw new AuthError('Invalid verification code', 401);
    }


    await this.userRepo.updateMfaFields(userId, {
      mfaEnabled: false,
      mfaSecret: null,
      mfaSecretIv: null,
      mfaSecretAuthTag: null,
      mfaSecretKeyVersion: null,
      mfaBackupCodes: null,
      mfaLastUsedStep: null,
    });

    this.emitMfaEvent(user.tenantId, userId, user.email, 'auth.mfa_disabled', 'MFA disabled by user.').catch(() => {/* swallow */});
  }


  verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.jwtSecret) as JwtPayload;
    } catch {
      throw new AuthError('Invalid or expired token', 401);
    }
  }

  async verifyAndFetchUser(token: string): Promise<JwtPayload> {
    let payload: JwtPayload & { mfaPending?: boolean };
    try {
      payload = jwt.verify(token, this.jwtSecret) as JwtPayload & { mfaPending?: boolean };
    } catch {
      throw new AuthError('Invalid or expired token', 401);
    }

    if (payload.mfaPending) {
      throw new AuthError('MFA verification required', 401);
    }

    const user = await this.userRepo.findById(payload.userId);
    if (!user) {
      throw new AuthError('User no longer exists', 401);
    }
    return {
      userId: user.id,
      tenantId: user.tenantId,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  async refreshToken(token: string): Promise<AuthResult> {
    const payload = this.verifyToken(token);

    const user = await this.userRepo.findById(payload.userId);
    if (!user) {
      throw new AuthError('User no longer exists', 401);
    }

    const newToken = this.signToken(user);
    return { user: this.stripSensitive(user), token: newToken };
  }

  async getProfile(userId: string): Promise<SafeUser> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new AuthError('User not found', 404);
    }

    return this.stripSensitive(user);
  }

  async updateProfile(userId: string, data: { name: string }): Promise<SafeUser> {
    const updated = await this.userRepo.update(userId, { name: data.name });
    if (!updated) {
      throw new AuthError('User not found', 404);
    }
    return this.stripSensitive(updated);
  }

  private signToken(user: User): string {
    const payload: JwtPayload = {
      userId: user.id,
      tenantId: user.tenantId,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    return jwt.sign(payload, this.jwtSecret, { expiresIn: this.jwtExpiresIn as StringValue });
  }

  private signMfaPendingToken(user: User): string {
    const payload: JwtPayload & { mfaPending: true } = {
      userId: user.id,
      tenantId: user.tenantId,
      name: user.name,
      email: user.email,
      role: user.role,
      mfaPending: true,
    };
    return jwt.sign(payload, this.jwtSecret, { expiresIn: MFA_PENDING_EXPIRES as StringValue });
  }

  private stripSensitive(user: User): SafeUser {
    const safe = { ...user } as Partial<User>;
    delete safe.passwordHash;
    delete safe.mfaSecret;
    delete safe.mfaSecretIv;
    delete safe.mfaSecretAuthTag;
    delete safe.mfaSecretKeyVersion;
    delete safe.mfaBackupCodes;
    return safe as SafeUser;
  }

  private async emitMfaEvent(
    tenantId: string,
    userId: string,
    email: string,
    actionType: 'auth.mfa_enabled' | 'auth.mfa_disabled',
    description: string,
  ): Promise<void> {
    await this.eventRepo.create({
      tenantId,
      entityType: 'user',
      entityId: userId,
      actorId: userId,
      actorName: null,
      actorEmail: email,
      actorRole: null,
      actionType,
      description,
      source: 'ui',
      oldValues: null,
      newValues: null,
      eventType: actionType,
      payload: null,
    });
  }
}

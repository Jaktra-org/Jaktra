import type { RedisClientType } from 'redis';
import sgClient from '@sendgrid/client';
import type { IntegrationRepository } from './integration.repository.js';
import { encrypt, decrypt } from '../../shared/encryption.js';
import { IntegrationErrors, IntegrationError } from './integration.errors.js';
import { logger } from '../../shared/logger.js';
import type { TenantIntegration } from '../../db/index.js';
import { SmtpConnectionFactory, SmtpConfig } from '../../shared/email/providers/smtp-email.provider.js';

export interface IntegrationStatus {
  provider: 'sendgrid' | 'smtp';
  isConfigured: boolean;
  lastValidatedAt: Date | null;
  lastValidationResult: TenantIntegration['lastValidationResult'];
  displayHost?: string;
  maskedUsername?: string;
  port?: number;
  securityMode?: string;
}

export interface RazorpayIntegrationStatus {
  provider: 'razorpay';
  isConfigured: boolean;
  lastValidatedAt: Date | null;
  lastValidationResult: TenantIntegration['lastValidationResult'];
  maskedKeyId?: string;
}

export class IntegrationService {
  constructor(
    private readonly repo: IntegrationRepository,
    private readonly redis: RedisClientType | null = null
  ) {}

  private getAadContext(tenantId: string, provider: string, version: number): string {
    return `${tenantId}:${provider}:v${version}`;
  }

  async getIntegrationStatus(tenantId: string, provider: 'sendgrid' | 'smtp'): Promise<IntegrationStatus> {
    const integration = await this.repo.getIntegration(tenantId, provider);
    
    if (!integration) {
      return {
        provider,
        isConfigured: false,
        lastValidatedAt: null,
        lastValidationResult: 'unknown',
      };
    }

    let extraConfig = {};
    if (provider === 'smtp') {
      try {
        const config = await this.getDecryptedSmtpConfig(tenantId);
        extraConfig = {
          displayHost: config.host,
          maskedUsername: '*'.repeat(Math.max(config.username.length - 4, 0)) + config.username.slice(-4),
          port: config.port,
          securityMode: config.securityMode,
        };
      } catch (e) {
        logger.error(`Failed to decrypt SMTP config for status check (tenant: ${tenantId}):`, e);
      }
    }

    return {
      provider,
      isConfigured: true,
      lastValidatedAt: integration.lastValidatedAt,
      lastValidationResult: integration.lastValidationResult,
      ...extraConfig,
    };
  }

  async getIntegrationStatusRazorpay(tenantId: string): Promise<RazorpayIntegrationStatus> {
    const integration = await this.repo.getIntegration(tenantId, 'razorpay');
    if (!integration) {
      return {
        provider: 'razorpay',
        isConfigured: false,
        lastValidatedAt: null,
        lastValidationResult: 'unknown',
      };
    }

    let maskedKeyId = '';
    try {
      const config = await this.getDecryptedRazorpayConfig(tenantId);
      maskedKeyId = config.keyId.substring(0, 8) + '...';
    } catch (e) {
      logger.error(`Failed to decrypt Razorpay config for status check (tenant: ${tenantId}):`, e);
    }

    return {
      provider: 'razorpay',
      isConfigured: true,
      lastValidatedAt: integration.lastValidatedAt,
      lastValidationResult: integration.lastValidationResult,
      maskedKeyId,
    };
  }

  async validateAndSaveSendgridKey(tenantId: string, apiKey: string): Promise<void> {
    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
      throw IntegrationErrors.CREDENTIAL_INVALID();
    }

    sgClient.setApiKey(apiKey);
    const request = {
      method: 'GET' as const,
      url: '/v3/scopes',
    };

    let validationResult: TenantIntegration['lastValidationResult'] = 'unknown';
    let errorCode: string | undefined;

    try {
      await sgClient.request(request);
      validationResult = 'valid';
    } catch (error: unknown) {
      const errObj = error as { code?: string | number; response?: { statusCode?: number } } | null;
      const status = errObj?.code || errObj?.response?.statusCode;
      errorCode = String(status);

      logger.warn(`SendGrid validation failed for tenant ${tenantId}. Status: ${status}`);

      if (status === 400 || status === 401 || status === 403) {
        throw IntegrationErrors.CREDENTIAL_INVALID();
      } else if (status === 429) {
        throw IntegrationErrors.RATE_LIMITED();
      } else {
        throw IntegrationErrors.PROVIDER_UNAVAILABLE();
      }
    }

    const version = 1;
    const encrypted = encrypt(apiKey, this.getAadContext(tenantId, 'sendgrid', version));

    await this.repo.upsertIntegration({
      tenantId,
      provider: 'sendgrid',
      ciphertext: encrypted.ciphertext,
      iv: encrypted.iv,
      authTag: encrypted.authTag,
      keyVersion: version,
      lastValidatedAt: new Date(),
      lastValidationResult: validationResult,
      lastOperationalErrorCode: errorCode,
    });
  }

  async deleteSendgridIntegration(tenantId: string): Promise<void> {
    await this.repo.deleteIntegration(tenantId, 'sendgrid');
  }

  async getDecryptedSendgridKey(tenantId: string): Promise<string> {
    const integration = await this.repo.getIntegration(tenantId, 'sendgrid');
    if (!integration) {
      throw IntegrationErrors.NOT_CONFIGURED();
    }

    try {
      const aadContext = this.getAadContext(tenantId, 'sendgrid', integration.keyVersion);
      return decrypt({
        ciphertext: integration.ciphertext,
        iv: integration.iv,
        authTag: integration.authTag,
        keyVersion: integration.keyVersion,
      }, aadContext);
    } catch {
      logger.error(`Decryption failed for tenant ${tenantId} SendGrid integration.`);
      throw IntegrationErrors.CREDENTIAL_INVALID();
    }
  }

  async getDecryptedSmtpConfig(tenantId: string): Promise<SmtpConfig> {
    const integration = await this.repo.getIntegration(tenantId, 'smtp');
    if (!integration) {
      throw IntegrationErrors.NOT_CONFIGURED();
    }

    try {
      const aadContext = this.getAadContext(tenantId, 'smtp', integration.keyVersion);
      const decryptedString = decrypt({
        ciphertext: integration.ciphertext,
        iv: integration.iv,
        authTag: integration.authTag,
        keyVersion: integration.keyVersion,
      }, aadContext);
      
      const payload = JSON.parse(decryptedString);
      return await SmtpConnectionFactory.validatePayload(payload);
    } catch {
      logger.error(`Decryption failed for tenant ${tenantId} SMTP integration.`);
      throw IntegrationErrors.CREDENTIAL_INVALID();
    }
  }

  async validateAndSaveSmtpConfig(tenantId: string, updateData: Partial<SmtpConfig>): Promise<void> {
    const existingIntegration = await this.repo.getIntegration(tenantId, 'smtp');
    let candidateConfig: Partial<SmtpConfig> & { payloadVersion: number } = { payloadVersion: 1, ...updateData };

    if (!existingIntegration) {
      if (!updateData.password) {
        throw new IntegrationError('Password is required for initial SMTP setup', 'INTEGRATION_BAD_REQUEST', 400);
      }
    } else {
      // Merge with existing
      try {
        const existingConfig = await this.getDecryptedSmtpConfig(tenantId);
        candidateConfig = { ...existingConfig, ...updateData };
      } catch {
        if (!updateData.password) {
          throw new IntegrationError('Existing configuration could not be read, password must be provided', 'INTEGRATION_BAD_REQUEST', 400);
        }
      }
    }

    const validatedConfig = await SmtpConnectionFactory.validatePayload(candidateConfig);

    let transporter;
    try {
      transporter = await SmtpConnectionFactory.createTransporter(validatedConfig);
      await SmtpConnectionFactory.executeWithTimeout(transporter, () => transporter!.verify(), 15000);
    } catch (error: unknown) {
      logger.warn(`SMTP validation failed for tenant ${tenantId}: ${error instanceof Error ? error.message : String(error)}`);
      throw new IntegrationError('SMTP validation failed. Please check your host, port, and credentials.', 'INTEGRATION_VALIDATION_FAILED', 400);
    } finally {
      if (transporter) transporter.close();
    }

    // Save
    const version = 1;
    const encrypted = encrypt(JSON.stringify(validatedConfig), this.getAadContext(tenantId, 'smtp', version));
    
    if (existingIntegration) {
      const updated = await this.repo.optimisticUpdateIntegration(tenantId, 'smtp', {
        ciphertext: encrypted.ciphertext,
        iv: encrypted.iv,
        authTag: encrypted.authTag,
        keyVersion: version,
        lastValidatedAt: new Date(),
        lastValidationResult: 'valid',
        lastOperationalErrorCode: null,
      }, existingIntegration.updatedAt);
      
      if (!updated) {
        throw new IntegrationError('SMTP settings were changed by another administrator. Current values have been reloaded.', 'INTEGRATION_CONFLICT', 409);
      }
    } else {
      try {
        await this.repo.insertIntegration({
          tenantId,
          provider: 'smtp',
          ciphertext: encrypted.ciphertext,
          iv: encrypted.iv,
          authTag: encrypted.authTag,
          keyVersion: version,
          lastValidatedAt: new Date(),
          lastValidationResult: 'valid',
          lastOperationalErrorCode: null,
        });
      } catch (e: unknown) {
        // Unique constraint violation map to 409
        if (e && typeof e === 'object' && 'code' in e && e.code === '23505') {
          throw new IntegrationError('SMTP settings were changed by another administrator. Current values have been reloaded.', 'INTEGRATION_CONFLICT', 409);
        }
        throw e;
      }
    }
  }

  async deleteSmtpIntegration(tenantId: string): Promise<void> {
    await this.repo.deleteIntegration(tenantId, 'smtp');
  }

  async handleDeliveryError(tenantId: string, provider: 'sendgrid' | 'smtp', error: unknown): Promise<void> {
    const err = error as {
      response?: { statusCode?: number; body?: unknown };
      responseCode?: number;
      code?: string | number;
    };
    if (provider === 'sendgrid') {
      const status = err.response?.statusCode;
      if (status === 401) {
        await this.repo.updateValidationStatus(tenantId, provider, 'revoked', String(status));
      } else if (status === 403) {
        const bodyStr = JSON.stringify(err.response?.body || {});
        if (bodyStr.includes('sender') || bodyStr.includes('identity')) {
          await this.repo.updateValidationStatus(tenantId, provider, 'unverified_sender', String(status));
        } else {
          await this.repo.updateValidationStatus(tenantId, provider, 'insufficient_scope', String(status));
        }
      }
    } else if (provider === 'smtp') {
      const status = err.responseCode || err.code;
      if (status === 535) {
         await this.repo.updateValidationStatus(tenantId, provider, 'revoked', 'auth_failed');
      } else {
         await this.repo.updateOperationalErrorCode(tenantId, provider, String(status));
      }
    }
  }


  async validateAndSaveRazorpayKey(tenantId: string, payload: { keyId: string, keySecret: string, webhookSecret: string }): Promise<void> {
    if (!payload.keyId || !payload.keySecret || !payload.webhookSecret) {
      throw IntegrationErrors.CREDENTIAL_INVALID();
    }

    let validationResult: TenantIntegration['lastValidationResult'] = 'unknown';
    let errorCode: string | undefined;

    try {
      const auth = Buffer.from(`${payload.keyId}:${payload.keySecret}`).toString('base64');
      const response = await fetch('https://api.razorpay.com/v1/payments', {
        headers: { Authorization: `Basic ${auth}` },
        signal: (typeof AbortSignal !== 'undefined' && AbortSignal.timeout) ? AbortSignal.timeout(5000) : undefined
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw IntegrationErrors.CREDENTIAL_INVALID();
        }
        throw IntegrationErrors.PROVIDER_UNAVAILABLE();
      }
      validationResult = 'valid';
    } catch (error: unknown) {
      if (error instanceof IntegrationError) {
        throw error;
      }
      logger.error('validateAndSaveRazorpayKey error:', error);
      logger.warn(`Razorpay validation failed for tenant ${tenantId}. Error: ${error instanceof Error ? error.message : String(error)}`);
      throw IntegrationErrors.CREDENTIAL_INVALID();
    }

    const version = 1;
    const encrypted = encrypt(JSON.stringify(payload), this.getAadContext(tenantId, 'razorpay', version));

    await this.repo.upsertIntegration({
      tenantId,
      provider: 'razorpay',
      ciphertext: encrypted.ciphertext,
      iv: encrypted.iv,
      authTag: encrypted.authTag,
      keyVersion: version,
      lastValidatedAt: new Date(),
      lastValidationResult: validationResult,
      lastOperationalErrorCode: errorCode,
    });
  }

  async deleteRazorpayIntegration(tenantId: string): Promise<void> {
    await this.repo.deleteIntegration(tenantId, 'razorpay');
  }

  async getDecryptedRazorpayConfig(tenantId: string): Promise<{ keyId: string, keySecret: string, webhookSecret: string }> {
    const integration = await this.repo.getIntegration(tenantId, 'razorpay');
    if (!integration) {
      throw IntegrationErrors.NOT_CONFIGURED();
    }

    try {
      const aadContext = this.getAadContext(tenantId, 'razorpay', integration.keyVersion);
      const decryptedString = decrypt({
        ciphertext: integration.ciphertext,
        iv: integration.iv,
        authTag: integration.authTag,
        keyVersion: integration.keyVersion,
      }, aadContext);
      
      return JSON.parse(decryptedString);
    } catch {
      logger.error(`Decryption failed for tenant ${tenantId} Razorpay integration.`);
      throw IntegrationErrors.CREDENTIAL_INVALID();
    }
  }

  async getConfigurationHealth(tenantId: string, senderEmail: string): Promise<{
    senderVerified: boolean | 'insufficient_permissions' | 'check_failed';
    domainAuthenticated: boolean | 'insufficient_permissions' | 'check_failed';
    checkedAt: Date;
    reasons: string[];
  }> {
    const cacheKey = `sendgrid:health:${tenantId}`;
    if (this.redis && this.redis.isOpen) {
      try {
        const cached = await this.redis.get(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          return {
            ...parsed,
            checkedAt: new Date(parsed.checkedAt),
          };
        }
      } catch (err) {
        logger.error(`Failed to read SendGrid health cache for tenant ${tenantId}:`, err);
      }
    }

    let apiKey: string;
    try {
      apiKey = await this.getDecryptedSendgridKey(tenantId);
    } catch {
      return {
        senderVerified: 'check_failed',
        domainAuthenticated: 'check_failed',
        checkedAt: new Date(),
        reasons: ['No SendGrid API Key configured or key is invalid.'],
      };
    }

    let senderVerified: boolean | 'insufficient_permissions' | 'check_failed' = 'check_failed';
    let domainAuthenticated: boolean | 'insufficient_permissions' | 'check_failed' = 'check_failed';
    const reasons: string[] = [];

    sgClient.setApiKey(apiKey);

    const makeRequest = async (url: string): Promise<{ success: boolean; body?: unknown; status: number; error?: unknown }> => {
      try {
        const [response] = await sgClient.request({
          method: 'GET',
          url,
        });
        return { success: true, body: response.body, status: response.statusCode };
      } catch (err: unknown) {
        const errObj = err as { code?: string | number; response?: { statusCode?: number } } | null;
        const status = Number(errObj?.code || errObj?.response?.statusCode || 500);
        return { success: false, status, error: err };
      }
    };

    // Check Sender Identity
    const senderRes = await makeRequest('/v3/verified_senders');
    if (senderRes.success) {
      const results = (senderRes.body as { results?: Array<{ from_email?: string; verified?: boolean }> })?.results || [];
      const foundSender = results.find((s: { from_email?: string; verified?: boolean }) => s.from_email === senderEmail);
      if (foundSender) {
        senderVerified = foundSender.verified === true;
        if (!senderVerified) {
          reasons.push('Sender email is pending verification in SendGrid.');
        }
      } else {
        senderVerified = false;
        reasons.push(`Sender email "${senderEmail}" is not configured as a Sender Identity in SendGrid.`);
      }
    } else if (senderRes.status === 403) {
      senderVerified = 'insufficient_permissions';
      reasons.push('Insufficient API key permissions to check sender verification status.');
    } else {
      senderVerified = 'check_failed';
      reasons.push(`Failed to query SendGrid sender verification API (Status: ${senderRes.status}).`);
    }

    // Check Domain Authentication
    const domainRes = await makeRequest('/v3/whitelabel/domains');
    if (domainRes.success) {
      const domains = Array.isArray(domainRes.body) ? (domainRes.body as Array<{ domain?: string; valid?: boolean }>) : [];
      const emailDomain = senderEmail.split('@')[1]?.toLowerCase();
      if (emailDomain) {
        const foundDomain = domains.find((d: { domain?: string; valid?: boolean }) => d.domain?.toLowerCase() === emailDomain);
        if (foundDomain) {
          domainAuthenticated = foundDomain.valid === true;
          if (!domainAuthenticated) {
            reasons.push(`Domain "${emailDomain}" is configured but authentication (SPF/DKIM) is invalid or pending DNS update.`);
          }
        } else {
          domainAuthenticated = false;
          reasons.push(`Domain "${emailDomain}" has not been authenticated in SendGrid.`);
        }
      } else {
        domainAuthenticated = false;
        reasons.push('Invalid sender email format.');
      }
    } else if (domainRes.status === 403) {
      domainAuthenticated = 'insufficient_permissions';
      reasons.push('Insufficient API key permissions to check domain authentication status.');
    } else {
      domainAuthenticated = 'check_failed';
      reasons.push(`Failed to query SendGrid domain authentication API (Status: ${domainRes.status}).`);
    }

    const healthResult = {
      senderVerified,
      domainAuthenticated,
      checkedAt: new Date(),
      reasons,
    };

    // Cache ONLY if no checks failed transiently
    if (
      senderVerified !== 'check_failed' &&
      domainAuthenticated !== 'check_failed' &&
      this.redis &&
      this.redis.isOpen
    ) {
      try {
        await this.redis.set(cacheKey, JSON.stringify(healthResult), { EX: 300 });
      } catch (err) {
        logger.error(`Failed to write SendGrid health cache for tenant ${tenantId}:`, err);
      }
    }

    return healthResult;
  }
}

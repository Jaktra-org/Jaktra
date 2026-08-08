import type { RedisClientType } from 'redis';
import sgClient from '@sendgrid/client';
import type { IntegrationRepository } from './integration.repository.js';
import { encrypt, decrypt } from '../../shared/encryption.js';
import { IntegrationErrors, IntegrationError } from './integration.errors.js';
import { logger } from '../../shared/logger.js';
import type { TenantIntegration } from '../../db/index.js';
import { SmtpConnectionFactory, SmtpConfig } from '../../shared/email/providers/smtp-email.provider.js';
import { verifyEmailDomainMx } from '../../shared/email/mx-verifier.js';
import { ValidationError } from '../../shared/errors/index.js';
import type { PlatformMailer } from '../platform-mail/platform-mailer.js';


export interface IntegrationStatus {
  provider: 'sendgrid' | 'smtp';
  isConfigured: boolean;
  lastValidatedAt: Date | null;
  lastValidationResult: TenantIntegration['lastValidationResult'];
  displayHost?: string;
  maskedUsername?: string;
  port?: number;
  securityMode?: string;
  senderName?: string | null;
  senderEmail?: string | null;
  replyTo?: string | null;
}

export interface RazorpayIntegrationStatus {
  provider: 'razorpay';
  isConfigured: boolean;
  lastValidatedAt: Date | null;
  lastValidationResult: TenantIntegration['lastValidationResult'];
  maskedKeyId?: string;
}

export interface SendgridConfigPayload {
  apiKey: string;
  senderName?: string;
  senderEmail?: string;
  replyTo?: string | null;
  isSenderConfigured?: boolean;
}

export interface EffectiveSenderConfig {
  senderName: string;
  senderEmail: string;
  replyTo: string | null;
}

export class IntegrationService {
  constructor(
    private readonly repo: IntegrationRepository,
    private readonly redis: RedisClientType | null = null,
    private readonly platformMailer: PlatformMailer | null = null
  ) {}

  private getAadContext(tenantId: string, provider: string, version: number): string {
    return `${tenantId}:${provider}:v${version}`;
  }

  async hasInboundEmails(tenantId: string): Promise<boolean> {
    return this.repo.hasInboundEmails(tenantId);
  }

  async verifyInboundParse(tenantId: string): Promise<{ success: boolean; message: string }> {
    // 1. If an actual inbound email has already arrived for this tenant, verify immediately
    const hasInbound = await this.repo.hasInboundEmails(tenantId);
    if (hasInbound) {
      await this.repo.verifyInboundParse(tenantId);
      return { success: true, message: 'Inbound Webhook verified successfully!' };
    }

    // 2. Fetch decrypted SendGrid API key for this tenant
    let apiKey: string;
    try {
      apiKey = await this.getDecryptedSendgridKey(tenantId);
    } catch {
      throw new ValidationError('SendGrid API Key is not configured. Please save your SendGrid API key first.');
    }

    // 3. Retrieve tenant webhook token
    const webhookToken = (await this.repo.getWebhookToken(tenantId)) || tenantId;

    // 4. Query SendGrid REST API for Inbound Parse settings
    try {
      const response = await fetch('https://api.sendgrid.com/v3/user/webhooks/parse/settings', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new ValidationError(
            'Your SendGrid API Key lacks permission to read Inbound Parse settings. Please ensure your SendGrid key has "Inbound Parse" permissions.'
          );
        }
        const errorText = await response.text();
        logger.warn(`SendGrid parse settings check failed (${response.status}): ${errorText}`);
        throw new ValidationError(`SendGrid API error (${response.status}). Could not verify parse settings.`);
      }

      const data = (await response.json()) as { result?: Array<{ url?: string; hostname?: string }> };
      const parseSettings = Array.isArray(data.result) ? data.result : [];

      if (parseSettings.length === 0) {
        throw new ValidationError(
          'No Inbound Parse settings found in your SendGrid account. Please click "Open SendGrid Parse Settings", click "Add Host & URL", paste your copied Webhook URL, and then click Verify Webhook again.'
        );
      }

      // 5. Look for a parse setting matching this tenant's webhook Token or URL path
      let matchingSetting = parseSettings.find(
        (setting) => setting.url && setting.url.includes(webhookToken)
      );

      if (!matchingSetting) {
        // Fallback check: match by path /api/webhooks/sendgrid/inbound/ or hostname
        matchingSetting = parseSettings.find(
          (setting) =>
            setting.url &&
            (setting.url.includes('/api/webhooks/sendgrid/inbound/') ||
             (setting.hostname && setting.hostname.includes('jaktra')))
        );

        if (matchingSetting && matchingSetting.url) {
          // Sync the token configured in SendGrid back to DB if different
          const parts = matchingSetting.url.split('/api/webhooks/sendgrid/inbound/');
          if (parts[1]) {
            const tokenInSendgrid = parts[1].split('?')[0].split('#')[0].trim();
            if (tokenInSendgrid && tokenInSendgrid.length >= 10) {
              await this.repo.updateWebhookToken(tenantId, tokenInSendgrid);
            }
          }
        }
      }

      if (!matchingSetting) {
        throw new ValidationError(
          'Inbound Webhook URL not found in SendGrid. Please open SendGrid, add Host & URL with your copied Webhook URL, then click Verify Webhook again.'
        );
      }

      // Match found! Save verification state in database
      await this.repo.verifyInboundParse(tenantId);
      const hostMsg = matchingSetting.hostname ? ` (Host: ${matchingSetting.hostname})` : '';
      return { success: true, message: `SendGrid Inbound Parse configuration verified successfully!${hostMsg}` };
    } catch (err: unknown) {
      if (err instanceof ValidationError) {
        throw err;
      }
      logger.error(`Error verifying SendGrid inbound parse for tenant ${tenantId}:`, err);
      throw new ValidationError(
        `Failed to verify with SendGrid: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  getPlatformMailer(): PlatformMailer | null {
    return this.platformMailer;
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
    if (provider === 'sendgrid') {
      try {
        const config = await this.getDecryptedSendgridConfig(tenantId);
        extraConfig = {
          senderName: config.senderName || null,
          senderEmail: config.senderEmail || null,
          replyTo: config.replyTo || null,
          isSenderConfigured: !!config.isSenderConfigured,
        };
      } catch (e) {
        logger.error(`Failed to decrypt SendGrid config for status check (tenant: ${tenantId}):`, e);
      }
    } else if (provider === 'smtp') {
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

  async getEffectiveSenderConfig(
    tenantId: string,
    defaultProvider: 'sendgrid' | 'smtp' | null | undefined
  ): Promise<EffectiveSenderConfig> {
    const defaultFrom = process.env.PLATFORM_FROM_EMAIL || 'billing@example.com';
    if (defaultProvider === 'sendgrid') {
      try {
        const sgConfig = await this.getDecryptedSendgridConfig(tenantId);
        return {
          senderName: sgConfig.senderName || 'Finance Team',
          senderEmail: sgConfig.senderEmail || defaultFrom,
          replyTo: sgConfig.replyTo || null,
        };
      } catch {
        return { senderName: 'Finance Team', senderEmail: defaultFrom, replyTo: null };
      }
    } else if (defaultProvider === 'smtp') {
      try {
        const smtpConfig = await this.getDecryptedSmtpConfig(tenantId);
        return {
          senderName: (smtpConfig as { senderName?: string }).senderName || 'Finance Team',
          senderEmail: smtpConfig.username || defaultFrom,
          replyTo: null,
        };
      } catch {
        return { senderName: 'Finance Team', senderEmail: defaultFrom, replyTo: null };
      }
    }

    return { senderName: 'Finance Team', senderEmail: defaultFrom, replyTo: null };
  }

  async validateAndSaveSendgridKey(
    tenantId: string,
    data: { apiKey: string; senderName?: string; senderEmail?: string; replyTo?: string | null; otpCode?: string }
  ): Promise<{ requiresOtp?: boolean; targetEmail?: string; message: string }> {
    let apiKeyToSave = data.apiKey;
    const existingIntegration = await this.repo.getIntegration(tenantId, 'sendgrid');

    if (existingIntegration && (!apiKeyToSave || apiKeyToSave === 'SG.placeholder')) {
      const existingConfig = await this.getDecryptedSendgridConfig(tenantId);
      apiKeyToSave = existingConfig.apiKey;
    }

    if (!apiKeyToSave || typeof apiKeyToSave !== 'string' || apiKeyToSave.trim() === '') {
      throw IntegrationErrors.CREDENTIAL_INVALID();
    }

    sgClient.setApiKey(apiKeyToSave.trim());
    const request = {
      method: 'GET' as const,
      url: '/v3/scopes',
    };

    let validationResult: TenantIntegration['lastValidationResult'] = 'unknown';

    try {
      await sgClient.request(request);
      validationResult = 'valid';
    } catch (error: unknown) {
      const errObj = error as { code?: string | number; response?: { statusCode?: number } } | null;
      const status = errObj?.code || errObj?.response?.statusCode;

      logger.warn(`SendGrid validation failed for tenant ${tenantId}. Status: ${status}`);

      if (status === 400 || status === 401 || status === 403) {
        throw IntegrationErrors.CREDENTIAL_INVALID();
      } else if (status === 429) {
        throw IntegrationErrors.RATE_LIMITED();
      } else {
        throw IntegrationErrors.PROVIDER_UNAVAILABLE();
      }
    }

    let existingPayload: SendgridConfigPayload = { apiKey: apiKeyToSave.trim() };
    if (existingIntegration) {
      try {
        existingPayload = await this.getDecryptedSendgridConfig(tenantId);
      } catch {
        // ignore
      }
    }

    const isExplicitSenderSave = data.senderEmail !== undefined && data.senderEmail.trim() !== '';

    const payloadToSave: SendgridConfigPayload = {
      apiKey: apiKeyToSave.trim(),
      senderName: data.senderName ?? existingPayload.senderName,
      senderEmail: data.senderEmail ?? existingPayload.senderEmail,
      replyTo: data.replyTo !== undefined ? data.replyTo : existingPayload.replyTo,
      isSenderConfigured: isExplicitSenderSave ? true : (data.apiKey && !data.senderEmail ? false : existingPayload.isSenderConfigured ?? false),
    };

    // Only perform sender email & SendGrid identity verification if data.senderEmail was EXPLICITLY passed in this request!
    if (data.senderEmail !== undefined && data.senderEmail.trim() !== '') {
      const senderEmail = data.senderEmail.trim();
      const replyTo = data.replyTo !== undefined && data.replyTo ? data.replyTo.trim() : '';

      await verifyEmailDomainMx(senderEmail);

      if (replyTo && replyTo.includes('@')) {
        await verifyEmailDomainMx(replyTo);
      }

      const health = await this.performSendgridIdentityCheck(apiKeyToSave.trim(), senderEmail);
      if (health.senderVerified === false) {
        throw new ValidationError(`Sender email "${senderEmail}" is not configured as a verified Sender Identity in your SendGrid account. Please create and verify this sender identity in SendGrid: https://app.sendgrid.com/settings/sender_auth/senders`);
      }
    }

    const version = 1;
    const encrypted = encrypt(JSON.stringify(payloadToSave), this.getAadContext(tenantId, 'sendgrid', version));

    await this.repo.upsertIntegration({
      tenantId,
      provider: 'sendgrid',
      ciphertext: encrypted.ciphertext,
      iv: encrypted.iv,
      authTag: encrypted.authTag,
      keyVersion: version,
      lastValidatedAt: new Date(),
      lastValidationResult: validationResult,
    });

    return {
      requiresOtp: false,
      message: 'SendGrid email integration configured successfully.',
    };
  }

  async deleteSendgridIntegration(tenantId: string): Promise<void> {
    await this.repo.deleteIntegration(tenantId, 'sendgrid');
  }

  async getDecryptedSendgridConfig(tenantId: string): Promise<SendgridConfigPayload> {
    const integration = await this.repo.getIntegration(tenantId, 'sendgrid');
    if (!integration) {
      throw IntegrationErrors.NOT_CONFIGURED();
    }

    try {
      const aadContext = this.getAadContext(tenantId, 'sendgrid', integration.keyVersion);
      const decrypted = decrypt({
        ciphertext: integration.ciphertext,
        iv: integration.iv,
        authTag: integration.authTag,
        keyVersion: integration.keyVersion,
      }, aadContext);

      if (decrypted.startsWith('{')) {
        return JSON.parse(decrypted);
      }
      return { apiKey: decrypted };
    } catch {
      logger.error(`Decryption failed for tenant ${tenantId} SendGrid integration.`);
      throw IntegrationErrors.CREDENTIAL_INVALID();
    }
  }

  async getDecryptedSendgridKey(tenantId: string): Promise<string> {
    const config = await this.getDecryptedSendgridConfig(tenantId);
    return config.apiKey;
  }

  async getDecryptedSmtpConfig(tenantId: string): Promise<SmtpConfig & { senderName?: string }> {
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
      const validated = await SmtpConnectionFactory.validatePayload(payload);
      if (payload.senderName) {
        (validated as { senderName?: string }).senderName = payload.senderName;
      }
      return validated;
    } catch {
      logger.error(`Decryption failed for tenant ${tenantId} SMTP integration.`);
      throw IntegrationErrors.CREDENTIAL_INVALID();
    }
  }

  async validateAndSaveSmtpConfig(tenantId: string, updateData: Partial<SmtpConfig> & { senderName?: string }): Promise<void> {
    const existingIntegration = await this.repo.getIntegration(tenantId, 'smtp');
    let candidateConfig: Partial<SmtpConfig> & { senderName?: string; payloadVersion: number } = { payloadVersion: 1, ...updateData };

    if (!existingIntegration) {
      if (!updateData.password) {
        throw new IntegrationError('Password is required for initial SMTP setup', 'INTEGRATION_BAD_REQUEST', 400);
      }
    } else {
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
    if (candidateConfig.senderName) {
      (validatedConfig as { senderName?: string }).senderName = candidateConfig.senderName;
    }

    if (validatedConfig.username && validatedConfig.username.includes('@')) {
      await verifyEmailDomainMx(validatedConfig.username.trim());
    }

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

    const healthResult = await this.performSendgridIdentityCheck(apiKey, senderEmail);

    if (this.redis && this.redis.isOpen) {
      if (healthResult.senderVerified !== 'check_failed' && healthResult.domainAuthenticated !== 'check_failed') {
        try {
          await this.redis.set(cacheKey, JSON.stringify(healthResult), { EX: 600 });
        } catch (err) {
          logger.error(`Failed to cache SendGrid health status for tenant ${tenantId}:`, err);
        }
      }
    }

    return healthResult;
  }

  private async performSendgridIdentityCheck(apiKey: string, senderEmail: string): Promise<{
    senderVerified: boolean | 'insufficient_permissions' | 'check_failed';
    domainAuthenticated: boolean | 'insufficient_permissions' | 'check_failed';
    checkedAt: Date;
    reasons: string[];
  }> {
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
      const foundSender = results.find((s: { from_email?: string; verified?: boolean }) => s.from_email?.toLowerCase() === senderEmail.toLowerCase());
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

    return {
      senderVerified,
      domainAuthenticated,
      checkedAt: new Date(),
      reasons,
    };
  }
}

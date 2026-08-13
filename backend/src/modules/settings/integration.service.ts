import crypto from 'crypto';
import type { RedisClientType } from 'redis';
import sgClient from '@sendgrid/client';
import { Resend } from 'resend';
import type { IntegrationRepository, SendgridSetupProgress, SmtpSetupProgress, ResendSetupProgress } from './integration.repository.js';
import { encrypt, decrypt } from '../../shared/encryption.js';
import { IntegrationErrors, IntegrationError } from './integration.errors.js';
import { logger } from '../../shared/logger.js';
import type { TenantIntegration } from '../../db/index.js';
import { SmtpConnectionFactory, SmtpConfig } from '../../shared/email/providers/smtp-email.provider.js';
import { verifyEmailDomainMx, validateInboundDomainFormat } from '../../shared/email/mx-verifier.js';
import { ValidationError } from '../../shared/errors/index.js';
import type { PlatformMailer } from '../platform-mail/platform-mailer.js';
import { config } from '../../config/index.js';


export interface IntegrationStatus {
  provider: 'sendgrid' | 'smtp' | 'resend';
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
  isSenderConfigured?: boolean;
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

  async getSendgridSetupProgress(tenantId: string): Promise<SendgridSetupProgress> {
    const integration = await this.repo.getSendgridIntegration(tenantId);
    const base = integration?.base;
    const detail = integration?.detail;

    const step1Done = !!detail?.ciphertext && !!detail?.iv && !!detail?.authTag;

    const senderName = base?.senderName || null;
    const senderEmail = base?.senderEmail || null;
    const replyTo = base?.replyTo || null;
    const replyMode = detail?.replyMode || 'webhook_only';
    const replyMailboxEmail = detail?.replyMailboxEmail || null;
    const replyMailboxVerified = detail?.replyMailboxVerified ?? false;

    let step2Status: 'not_started' | 'awaiting_sender_info' | 'awaiting_otp' | 'completed' = 'not_started';
    if (!senderName && !senderEmail) {
      step2Status = 'not_started';
    } else if (!senderName || !senderEmail) {
      step2Status = 'awaiting_sender_info';
    } else if (replyMode === 'real_mailbox' && !replyMailboxVerified) {
      step2Status = 'awaiting_otp';
    } else {
      step2Status = 'completed';
    }

    const step2Done = step2Status === 'completed';

    const inboundDomain = detail?.inboundDomain || null;
    const isVerified = (detail?.inboundParseVerified === true) && !!inboundDomain;

    let step3Status: 'not_started' | 'awaiting_inbound_domain' | 'awaiting_mx_verification' | 'verified' = 'not_started';
    if (!inboundDomain) {
      step3Status = 'not_started';
    } else if (!isVerified) {
      step3Status = 'awaiting_mx_verification';
    } else {
      step3Status = 'verified';
    }

    const step3Done = isVerified;

    const overallStatus = base?.overallStatus || 'not_configured';
    const isActive = base?.isActive ?? false;

    const publicBaseUrl = config.PUBLIC_BASE_URL || process.env.PUBLIC_BASE_URL || 'https://www.jaktra.site';
    const token = (await this.repo.getWebhookToken(tenantId)) || tenantId;
    const webhookUrl = `${publicBaseUrl}/api/webhooks/sendgrid/inbound/${token}`;

    return {
      provider: 'sendgrid' as const,
      step1ApiKey: {
        isDone: step1Done,
        isConfigured: step1Done,
      },
      step2SenderAndMode: {
        isDone: step2Done,
        status: step2Status,
        senderName,
        senderEmail,
        replyTo,
        replyMode,
        replyMailboxEmail,
        replyMailboxVerified,
        requiresOtp: replyMode === 'real_mailbox',
      },
      step3InboundWebhook: {
        isDone: step3Done,
        status: step3Status,
        inboundDomain,
        webhookUrl,
        sendgridSettingsUrl: 'https://app.sendgrid.com/settings/parse',
        isVerified,
      },
      overallStatus,
      isActive,
    };
  }

  async getSmtpSetupProgress(tenantId: string): Promise<SmtpSetupProgress> {
    const integration = await this.repo.getSmtpIntegration(tenantId);
    const base = integration?.base;
    const detail = integration?.detail;

    const host = detail?.host || null;
    const port = detail?.port || 587;
    const username = detail?.username || null;
    const hasPassword = !!detail?.ciphertext && !!detail?.iv && !!detail?.authTag;

    const step1Done = !!host && !!port && hasPassword;

    const senderName = base?.senderName || null;
    const senderEmail = base?.senderEmail || null;
    const replyTo = base?.replyTo || null;

    const step2Done = !!senderName && !!senderEmail;

    const overallStatus = base?.overallStatus || 'not_configured';
    const isActive = base?.isActive ?? false;

    return {
      provider: 'smtp' as const,
      step1ConnectionDetails: {
        isDone: step1Done,
        host,
        port,
        username,
        hasPassword,
        encryptionType: detail?.encryptionType || 'tls',
        allowSelfSigned: detail?.allowSelfSigned || false,
      },
      step2SenderIdentity: {
        isDone: step2Done,
        senderName,
        senderEmail,
        replyTo,
      },
      overallStatus,
      isActive,
    };
  }

  async getResendSetupProgress(tenantId: string): Promise<ResendSetupProgress> {
    const integration = await this.repo.getResendIntegration(tenantId);
    const base = integration?.base;
    const detail = integration?.detail;

    const step1Done = !!detail?.ciphertext && !!detail?.iv && !!detail?.authTag;

    const senderName = base?.senderName || null;
    const senderEmail = base?.senderEmail || null;
    const replyTo = base?.replyTo || null;
    const replyMode = detail?.replyMode || 'webhook_only';
    const replyMailboxEmail = detail?.replyMailboxEmail || null;
    const replyMailboxVerified = detail?.replyMailboxVerified ?? false;

    let step2Status: 'not_started' | 'awaiting_sender_info' | 'awaiting_otp' | 'completed' = 'not_started';
    if (!senderName && !senderEmail) {
      step2Status = 'not_started';
    } else if (!senderName || !senderEmail) {
      step2Status = 'awaiting_sender_info';
    } else if (replyMode === 'real_mailbox' && !replyMailboxVerified) {
      step2Status = 'awaiting_otp';
    } else {
      step2Status = 'completed';
    }

    const step2Done = step2Status === 'completed';

    const inboundDomain = detail?.inboundDomain || null;
    const isVerified = (detail?.inboundParseVerified === true) && !!inboundDomain;

    let step3Status: 'not_started' | 'awaiting_inbound_domain' | 'awaiting_mx_verification' | 'verified' = 'not_started';
    if (!inboundDomain) {
      step3Status = 'not_started';
    } else if (!isVerified) {
      step3Status = 'awaiting_mx_verification';
    } else {
      step3Status = 'verified';
    }

    const step3Done = isVerified;

    const overallStatus = base?.overallStatus || 'not_configured';
    const isActive = base?.isActive ?? false;

    const publicBaseUrl = config.PUBLIC_BASE_URL || process.env.PUBLIC_BASE_URL || 'https://www.jaktra.site';
    const token = (await this.repo.getWebhookToken(tenantId)) || tenantId;
    const webhookUrl = `${publicBaseUrl}/api/webhooks/resend/inbound/${token}`;

    return {
      provider: 'resend' as const,
      step1ApiKey: {
        isDone: step1Done,
        hasApiKey: step1Done,
        lastValidationResult: (detail?.lastValidationResult as 'valid' | 'invalid' | 'untested') || 'untested',
      },
      step2SenderAndMode: {
        isDone: step2Done,
        status: step2Status,
        senderName,
        senderEmail,
        replyTo,
        replyMode,
        replyMailboxEmail,
        replyMailboxVerified,
        requiresOtp: replyMode === 'real_mailbox',
      },
      step3InboundWebhook: {
        isDone: step3Done,
        status: step3Status,
        inboundDomain,
        webhookUrl,
        resendSettingsUrl: 'https://resend.com/webhooks',
        isVerified,
      },
      overallStatus,
      isActive,
    };
  }

  async setActiveProvider(tenantId: string, provider: 'sendgrid' | 'smtp' | 'resend'): Promise<void> {
    await this.repo.setActiveProvider(tenantId, provider);
  }

  async deleteEmailIntegration(tenantId: string, provider: 'sendgrid' | 'smtp' | 'resend'): Promise<void> {
    await this.repo.deleteEmailIntegration(tenantId, provider);
  }

  async getActiveEmailIntegration(tenantId: string): Promise<ReturnType<IntegrationRepository['getActiveEmailIntegration']>> {
    return this.repo.getActiveEmailIntegration(tenantId);
  }

  async getEffectiveSenderConfig(
    tenantId: string,
    provider?: 'sendgrid' | 'smtp' | 'resend' | null
  ): Promise<{ senderName: string; senderEmail: string; replyTo: string | null }> {
    let integration;
    if (provider) {
      if (provider === 'sendgrid') {
        integration = await this.repo.getSendgridIntegration(tenantId);
      } else if (provider === 'smtp') {
        integration = await this.repo.getSmtpIntegration(tenantId);
      } else {
        integration = await this.repo.getResendIntegration(tenantId);
      }
    } else {
      integration = await this.repo.getActiveEmailIntegration(tenantId);
    }
    const base = integration?.base;
    return {
      senderName: base?.senderName || 'Finance Team',
      senderEmail: base?.senderEmail || '',
      replyTo: base?.replyTo || null,
    };
  }

  async setReplyMode(
    tenantId: string,
    replyMode: 'real_mailbox' | 'webhook_only',
    replyMailboxEmail?: string
  ): Promise<SendgridSetupProgress> {
    const existing = await this.repo.getSendgridIntegration(tenantId);
    const existingMailbox = existing?.detail?.replyMailboxEmail?.trim().toLowerCase();
    const newMailbox = replyMailboxEmail?.trim().toLowerCase();

    const keepVerified = existingMailbox && newMailbox && existingMailbox === newMailbox ? existing?.detail?.replyMailboxVerified : false;

    await this.repo.saveSendgridIntegrationTransaction(
      tenantId,
      {},
      {
        replyMode,
        replyMailboxEmail: replyMode === 'real_mailbox' ? replyMailboxEmail : null,
        replyMailboxVerified: keepVerified ?? false,
        clearStep3: true,
      }
    );
    return this.getSendgridSetupProgress(tenantId);
  }

  async sendReplyMailboxOtp(
    tenantId: string,
    replyMailboxEmail: string
  ): Promise<{ targetEmail: string; otpCode: string; setupProgress: SendgridSetupProgress }> {
    const sg = await this.repo.getSendgridIntegration(tenantId);
    if (sg?.detail?.replyMailboxOtpExpiresAt) {
      const timeSinceLastOtp = 10 * 60 * 1000 - (new Date(sg.detail.replyMailboxOtpExpiresAt).getTime() - Date.now());
      if (timeSinceLastOtp >= 0 && timeSinceLastOtp < 60 * 1000) {
        const secondsLeft = Math.ceil((60 * 1000 - timeSinceLastOtp) / 1000);
        throw new ValidationError(`Please wait ${secondsLeft} seconds before requesting another OTP code.`);
      }
    }

    const otpCode = crypto.randomInt(100000, 1000000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.repo.saveSendgridIntegrationTransaction(
      tenantId,
      {},
      {
        replyMode: 'real_mailbox',
        replyMailboxEmail,
        replyMailboxVerified: false,
        replyMailboxOtpCode: otpCode,
        replyMailboxOtpExpiresAt: expiresAt,
        clearStep3: true,
      }
    );

    const setupProgress = await this.getSendgridSetupProgress(tenantId);
    return { targetEmail: replyMailboxEmail, otpCode, setupProgress };
  }

  async verifyReplyMailboxOtp(
    tenantId: string,
    otpCode: string
  ): Promise<{ success: boolean; message: string; setupProgress: SendgridSetupProgress }> {
    const sg = await this.repo.getSendgridIntegration(tenantId);
    const detail = sg?.detail;

    if (!detail || !detail.replyMailboxOtpCode || !detail.replyMailboxOtpExpiresAt) {
      throw new ValidationError('No OTP code found. Please request a new OTP.');
    }

    if (new Date() > new Date(detail.replyMailboxOtpExpiresAt)) {
      throw new ValidationError('OTP code has expired. Please request a new OTP.');
    }

    if (detail.replyMailboxOtpCode.trim() !== otpCode.trim()) {
      throw new ValidationError('Invalid OTP code. Please check and try again.');
    }

    await this.repo.saveSendgridIntegrationTransaction(
      tenantId,
      {},
      {
        replyMailboxVerified: true,
        replyMailboxOtpCode: null,
        replyMailboxOtpExpiresAt: null,
      }
    );

    const setupProgress = await this.getSendgridSetupProgress(tenantId);
    return { success: true, message: 'Mailbox verified successfully!', setupProgress };
  }

  private getAadContext(tenantId: string, provider: string, version: number): string {
    return `${tenantId}:${provider}:v${version}`;
  }

  async hasInboundEmails(tenantId: string): Promise<boolean> {
    return this.repo.hasInboundEmails(tenantId);
  }

  async verifyInboundParse(tenantId: string, inboundDomainInput?: string): Promise<{ success: boolean; message: string }> {
    // Stage 1: Domain Format Validation
    let domainToVerify: string | undefined;
    if (inboundDomainInput && inboundDomainInput.trim()) {
      domainToVerify = validateInboundDomainFormat(inboundDomainInput);
    }

    // Stage 2: MX Routing Verification
    if (domainToVerify) {
      await verifyEmailDomainMx(domainToVerify);
    }

    // Stage 3 & 4: Fetch decrypted SendGrid API key & check parse settings
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
          'No Inbound Parse settings found in your SendGrid account. Please click "Open SendGrid Parse Settings", click "Add Host & URL", paste your copied Webhook URL, and then click Re-check DNS & Webhook again.'
        );
      }

      // 5. Look for a parse setting matching this tenant's webhook Token or URL path
      const matchingSetting = parseSettings.find(
        (setting) => setting.url && setting.url.includes(webhookToken)
      );

      if (!matchingSetting) {
        throw new ValidationError(
          'Inbound Webhook URL not found or does not match your active token in SendGrid. Please open SendGrid Parse Settings, update the URL field with your new Webhook URL above, then click Re-check DNS & Webhook again.'
        );
      }

      // Stage 5: Save verification state in database
      await this.repo.saveSendgridIntegrationTransaction(tenantId, {}, {
        inboundDomain: domainToVerify,
        inboundParseVerified: true,
      });
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

  async getIntegrationStatus(tenantId: string, provider: 'sendgrid' | 'smtp' | 'resend'): Promise<IntegrationStatus> {
    if (provider === 'sendgrid') {
      const progress = await this.getSendgridSetupProgress(tenantId);
      return {
        provider: 'sendgrid',
        isConfigured: progress.step1ApiKey.isDone,
        lastValidatedAt: null,
        lastValidationResult: progress.step1ApiKey.isDone ? 'valid' : 'unknown',
        senderName: progress.step2SenderAndMode.senderName || null,
        senderEmail: progress.step2SenderAndMode.senderEmail || null,
        replyTo: progress.step2SenderAndMode.replyTo || null,
        isSenderConfigured: progress.step2SenderAndMode.isDone,
      };
    } else if (provider === 'smtp') {
      const progress = await this.getSmtpSetupProgress(tenantId);
      const smtpIntegration = await this.repo.getSmtpIntegration(tenantId);
      const username = progress.step1ConnectionDetails.username;
      const maskedUsername = username ? '*'.repeat(Math.max(username.length - 4, 0)) + username.slice(-4) : '';
      return {
        provider: 'smtp',
        isConfigured: progress.step1ConnectionDetails.isDone,
        lastValidatedAt: smtpIntegration?.detail?.lastValidatedAt || null,
        lastValidationResult: (smtpIntegration?.detail?.lastValidationResult as 'valid' | 'invalid' | 'unknown' | null) || (progress.step1ConnectionDetails.isDone ? 'valid' : 'unknown'),
        displayHost: progress.step1ConnectionDetails.host || undefined,
        port: progress.step1ConnectionDetails.port,
        maskedUsername,
        securityMode: progress.step1ConnectionDetails.encryptionType,
      };
    } else {
      const progress = await this.getResendSetupProgress(tenantId);
      const resendIntegration = await this.repo.getResendIntegration(tenantId);
      return {
        provider: 'resend',
        isConfigured: progress.step1ApiKey.isDone,
        lastValidatedAt: resendIntegration?.detail?.lastValidatedAt || null,
        lastValidationResult: (resendIntegration?.detail?.lastValidationResult as 'valid' | 'invalid' | 'unknown' | null) || (progress.step1ApiKey.isDone ? 'valid' : 'unknown'),
        senderName: progress.step2SenderAndMode.senderName || null,
        senderEmail: progress.step2SenderAndMode.senderEmail || null,
        replyTo: progress.step2SenderAndMode.replyTo || null,
        isSenderConfigured: progress.step2SenderAndMode.isDone,
      };
    }
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

  async validateAndSaveSendgridKey(
    tenantId: string,
    data: {
      apiKey: string;
      senderName?: string;
      senderEmail?: string;
      replyTo?: string | null;
      replyMode?: 'real_mailbox' | 'webhook_only';
      replyMailboxEmail?: string;
      otpCode?: string;
    }
  ): Promise<{ requiresOtp?: boolean; targetEmail?: string; message: string }> {
    let apiKeyToSave = data.apiKey;
    const existingIntegration = await this.repo.getSendgridIntegration(tenantId);

    if (existingIntegration?.detail?.ciphertext && (!apiKeyToSave || apiKeyToSave === 'SG.placeholder')) {
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

    try {
      await sgClient.request(request);
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

    if (data.senderEmail !== undefined && data.senderEmail.trim() !== '') {
      const senderEmail = data.senderEmail.trim();

      const health = await this.performSendgridIdentityCheck(apiKeyToSave.trim(), senderEmail);
      if (health.senderVerified === false) {
        throw new ValidationError(`Sender email "${senderEmail}" is not configured as a verified Sender Identity in your SendGrid account. Please create and verify this sender identity in SendGrid: https://app.sendgrid.com/settings/sender_auth/senders`);
      }
    }

    const version = 1;
    const encrypted = encrypt(apiKeyToSave.trim(), this.getAadContext(tenantId, 'sendgrid', version));

    const targetMailbox = (data.replyTo && data.replyTo.trim()) ? data.replyTo.trim() : (data.senderEmail ? data.senderEmail.trim() : null);

    const isStep1Change = data.apiKey !== 'SG.placeholder';
    const isStep2Change = !isStep1Change && (data.senderName !== undefined || data.senderEmail !== undefined || data.replyMode !== undefined);

    await this.repo.saveSendgridIntegrationTransaction(
      tenantId,
      isStep1Change
        ? { senderName: null, senderEmail: null, replyTo: null }
        : { senderName: data.senderName, senderEmail: data.senderEmail, replyTo: data.replyTo },
      {
        ciphertext: encrypted.ciphertext,
        iv: encrypted.iv,
        authTag: encrypted.authTag,
        keyVersion: version,
        ...(isStep1Change
          ? {
              clearStep2: true,
              clearStep3: true,
            }
          : isStep2Change
          ? {
              clearStep3: true,
              ...(data.replyMode ? { replyMode: data.replyMode as 'real_mailbox' | 'webhook_only' } : {}),
              ...(data.replyMailboxEmail ? { replyMailboxEmail: data.replyMailboxEmail } : (targetMailbox ? { replyMailboxEmail: targetMailbox } : {})),
            }
          : {
              ...(data.replyMode ? { replyMode: data.replyMode as 'real_mailbox' | 'webhook_only' } : {}),
              ...(data.replyMailboxEmail ? { replyMailboxEmail: data.replyMailboxEmail } : (targetMailbox ? { replyMailboxEmail: targetMailbox } : {})),
            }),
      }
    );

    return {
      requiresOtp: false,
      message: 'SendGrid email integration configured successfully.',
    };
  }

  async deleteSendgridIntegration(tenantId: string): Promise<void> {
    await this.repo.deleteEmailIntegration(tenantId, 'sendgrid');
  }

  async getDecryptedSendgridConfig(tenantId: string): Promise<SendgridConfigPayload> {
    const integration = await this.repo.getSendgridIntegration(tenantId);
    if (!integration || !integration.detail?.ciphertext || !integration.detail?.iv || !integration.detail?.authTag) {
      throw IntegrationErrors.NOT_CONFIGURED();
    }

    try {
      const aadContext = this.getAadContext(tenantId, 'sendgrid', integration.detail.keyVersion);
      const decrypted = decrypt({
        ciphertext: integration.detail.ciphertext,
        iv: integration.detail.iv,
        authTag: integration.detail.authTag,
        keyVersion: integration.detail.keyVersion,
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
    const integration = await this.repo.getSmtpIntegration(tenantId);
    if (!integration || !integration.detail?.ciphertext || !integration.detail?.iv || !integration.detail?.authTag) {
      throw IntegrationErrors.NOT_CONFIGURED();
    }

    try {
      const aadContext = this.getAadContext(tenantId, 'smtp', integration.detail.keyVersion);
      const decryptedString = decrypt({
        ciphertext: integration.detail.ciphertext,
        iv: integration.detail.iv,
        authTag: integration.detail.authTag,
        keyVersion: integration.detail.keyVersion,
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
    const existingIntegration = await this.repo.getSmtpIntegration(tenantId);
    let candidateConfig: Partial<SmtpConfig> & { senderName?: string; payloadVersion: number } = { payloadVersion: 1, ...updateData };

    if (!existingIntegration?.detail?.ciphertext) {
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
    
    await this.repo.saveSmtpIntegrationTransaction(
      tenantId,
      { senderName: updateData.senderName },
      {
        host: validatedConfig.host,
        port: validatedConfig.port,
        username: validatedConfig.username,
        ciphertext: encrypted.ciphertext,
        iv: encrypted.iv,
        authTag: encrypted.authTag,
        keyVersion: version,
        encryptionType: (validatedConfig.securityMode === 'implicit_tls' ? 'ssl' : 'tls'),
        lastValidationResult: 'valid',
        lastValidatedAt: new Date(),
      }
    );
  }

  async deleteSmtpIntegration(tenantId: string): Promise<void> {
    await this.repo.deleteEmailIntegration(tenantId, 'smtp');
  }

  async validateAndSaveResendKey(
    tenantId: string,
    data: {
      apiKey?: string;
      senderName?: string;
      senderEmail?: string;
      replyTo?: string | null;
      replyMode?: 'real_mailbox' | 'webhook_only';
      replyMailboxEmail?: string | null;
    }
  ): Promise<{ message: string }> {
    let encryptedData: Record<string, unknown> = {};

    if (data.apiKey && data.apiKey !== 're_placeholder') {
      const trimmedKey = data.apiKey.trim();
      if (!trimmedKey.startsWith('re_')) {
        throw new ValidationError('Resend API keys must start with "re_".');
      }

      // Validate key against Resend API
      try {
        const resend = new Resend(trimmedKey);
        const { error } = await resend.domains.list();
        if (error) {
          logger.warn(`Resend validation failed for tenant ${tenantId}: ${error.message}`);
          const errName = (error.name || '').toLowerCase();
          const errLower = (error.message || '').toLowerCase();
          if (
            errName.includes('invalid_api_key') ||
            errName.includes('missing_api_key') ||
            errLower.includes('api key') ||
            errLower.includes('unauthorized')
          ) {
            throw IntegrationErrors.CREDENTIAL_INVALID();
          } else if (errName.includes('rate_limit_exceeded') || errLower.includes('rate limit')) {
            throw IntegrationErrors.RATE_LIMITED();
          } else {
            throw IntegrationErrors.PROVIDER_UNAVAILABLE();
          }
        }
      } catch (err: unknown) {
        if (err instanceof IntegrationError || err instanceof ValidationError) {
          throw err;
        }
        logger.warn(`Resend validation request failed for tenant ${tenantId}:`, err);
        throw IntegrationErrors.CREDENTIAL_INVALID();
      }

      const version = 1;
      const encrypted = encrypt(trimmedKey, this.getAadContext(tenantId, 'resend', version));
      encryptedData = {
        ciphertext: encrypted.ciphertext,
        iv: encrypted.iv,
        authTag: encrypted.authTag,
        keyVersion: version,
        lastValidationResult: 'valid',
        lastValidatedAt: new Date(),
      };
    }

    const baseData: { senderName?: string | null; senderEmail?: string | null; replyTo?: string | null } = {};
    if (data.senderName !== undefined) baseData.senderName = data.senderName;
    if (data.senderEmail !== undefined) baseData.senderEmail = data.senderEmail;
    if (data.replyTo !== undefined) baseData.replyTo = data.replyTo;

    const resendData: Record<string, unknown> = { ...encryptedData };
    if (data.replyMode !== undefined) resendData.replyMode = data.replyMode;
    if (data.replyMailboxEmail !== undefined) resendData.replyMailboxEmail = data.replyMailboxEmail;

    await this.repo.saveResendIntegrationTransaction(tenantId, baseData, resendData);

    return {
      message: 'Resend email integration configured successfully.',
    };
  }

  async setResendReplyMode(
    tenantId: string,
    replyMode: 'real_mailbox' | 'webhook_only',
    replyMailboxEmail?: string
  ): Promise<ResendSetupProgress> {
    const existing = await this.repo.getResendIntegration(tenantId);
    const existingMailbox = existing?.detail?.replyMailboxEmail?.trim().toLowerCase();
    const newMailbox = replyMailboxEmail?.trim().toLowerCase();

    const keepVerified = existingMailbox && newMailbox && existingMailbox === newMailbox ? existing?.detail?.replyMailboxVerified : false;

    await this.repo.saveResendIntegrationTransaction(
      tenantId,
      {},
      {
        replyMode,
        replyMailboxEmail: replyMode === 'real_mailbox' ? replyMailboxEmail : null,
        replyMailboxVerified: keepVerified ?? false,
        clearStep3: true,
      }
    );
    return this.getResendSetupProgress(tenantId);
  }

  async sendResendReplyMailboxOtp(
    tenantId: string,
    replyMailboxEmail: string
  ): Promise<{ targetEmail: string; otpCode: string; setupProgress: ResendSetupProgress }> {
    const resendIntegration = await this.repo.getResendIntegration(tenantId);
    if (resendIntegration?.detail?.replyMailboxOtpExpiresAt) {
      const timeSinceLastOtp = 10 * 60 * 1000 - (new Date(resendIntegration.detail.replyMailboxOtpExpiresAt).getTime() - Date.now());
      if (timeSinceLastOtp >= 0 && timeSinceLastOtp < 60 * 1000) {
        const secondsLeft = Math.ceil((60 * 1000 - timeSinceLastOtp) / 1000);
        throw new ValidationError(`Please wait ${secondsLeft} seconds before requesting another OTP code.`);
      }
    }

    const otpCode = crypto.randomInt(100000, 1000000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.repo.saveResendIntegrationTransaction(
      tenantId,
      {},
      {
        replyMode: 'real_mailbox',
        replyMailboxEmail,
        replyMailboxVerified: false,
        replyMailboxOtpCode: otpCode,
        replyMailboxOtpExpiresAt: expiresAt,
        clearStep3: true,
      }
    );

    const setupProgress = await this.getResendSetupProgress(tenantId);
    return { targetEmail: replyMailboxEmail, otpCode, setupProgress };
  }

  async verifyResendReplyMailboxOtp(
    tenantId: string,
    otpCode: string
  ): Promise<{ success: boolean; message: string; setupProgress: ResendSetupProgress }> {
    const resendIntegration = await this.repo.getResendIntegration(tenantId);
    const detail = resendIntegration?.detail;

    if (!detail || !detail.replyMailboxOtpCode || !detail.replyMailboxOtpExpiresAt) {
      throw new ValidationError('No OTP code found. Please request a new OTP.');
    }

    if (new Date() > new Date(detail.replyMailboxOtpExpiresAt)) {
      throw new ValidationError('OTP code has expired. Please request a new OTP.');
    }

    if (detail.replyMailboxOtpCode.trim() !== otpCode.trim()) {
      throw new ValidationError('Invalid OTP code. Please check and try again.');
    }

    await this.repo.saveResendIntegrationTransaction(
      tenantId,
      {},
      {
        replyMailboxVerified: true,
        replyMailboxOtpCode: null,
        replyMailboxOtpExpiresAt: null,
      }
    );

    const setupProgress = await this.getResendSetupProgress(tenantId);
    return { success: true, message: 'Mailbox verified successfully!', setupProgress };
  }

  async verifyResendInboundParse(tenantId: string, inboundDomainInput?: string): Promise<{ success: boolean; message: string }> {
    let domainToVerify: string | undefined;
    if (inboundDomainInput && inboundDomainInput.trim()) {
      domainToVerify = validateInboundDomainFormat(inboundDomainInput);
    }

    if (domainToVerify) {
      await verifyEmailDomainMx(domainToVerify);
    }

    try {
      await this.getDecryptedResendKey(tenantId);
    } catch {
      throw new ValidationError('Resend API Key is not configured. Please save your Resend API key first.');
    }

    await this.repo.saveResendIntegrationTransaction(
      tenantId,
      {},
      {
        inboundDomain: domainToVerify,
        inboundParseVerified: true,
      }
    );

    return {
      success: true,
      message: `Inbound receiving domain "${domainToVerify}" verified successfully!`,
    };
  }

  async getResendConfigurationHealth(tenantId: string, senderEmail?: string): Promise<{
    status: 'healthy' | 'warning' | 'error';
    apiKeyValid: boolean;
    senderVerified: boolean;
    domainVerified: boolean;
    inboundParseReady: boolean;
    message?: string;
  }> {
    let apiKey: string;
    try {
      apiKey = await this.getDecryptedResendKey(tenantId);
    } catch {
      return {
        status: 'error',
        apiKeyValid: false,
        senderVerified: false,
        domainVerified: false,
        inboundParseReady: false,
        message: 'Resend API Key is not configured.',
      };
    }

    try {
      const resend = new Resend(apiKey);
      const { data: domains, error } = await resend.domains.list();
      if (error) {
        return {
          status: 'error',
          apiKeyValid: false,
          senderVerified: false,
          domainVerified: false,
          inboundParseReady: false,
          message: error.message,
        };
      }

      const progress = await this.getResendSetupProgress(tenantId);
      const emailDomain = (senderEmail || progress.step2SenderAndMode.senderEmail || '').split('@')[1]?.toLowerCase();
      type ResendDomainItem = { name?: string; status?: string };
      const domainList: ResendDomainItem[] = (domains as { data?: ResendDomainItem[] })?.data || (Array.isArray(domains) ? (domains as ResendDomainItem[]) : []);
      const domainMatch = domainList.find((d: ResendDomainItem) => d.name?.toLowerCase() === emailDomain);
      const isDomainVerified = domainMatch ? domainMatch.status === 'verified' : false;

      const isHealthy = isDomainVerified && progress.step3InboundWebhook.isVerified;

      return {
        status: isHealthy ? 'healthy' : isDomainVerified ? 'warning' : 'error',
        apiKeyValid: true,
        senderVerified: isDomainVerified,
        domainVerified: isDomainVerified,
        inboundParseReady: progress.step3InboundWebhook.isVerified,
        message: isHealthy ? 'Resend integration is fully operational.' : 'Domain or inbound setup requires attention.',
      };
    } catch (err: unknown) {
      logger.warn(`Resend health check error for tenant ${tenantId}:`, err);
      return {
        status: 'error',
        apiKeyValid: false,
        senderVerified: false,
        domainVerified: false,
        inboundParseReady: false,
        message: 'Could not connect to Resend API.',
      };
    }
  }

  async getDecryptedResendKey(tenantId: string): Promise<string> {
    const integration = await this.repo.getResendIntegration(tenantId);
    if (!integration || !integration.detail?.ciphertext || !integration.detail?.iv || !integration.detail?.authTag) {
      throw IntegrationErrors.NOT_CONFIGURED();
    }

    try {
      const aadContext = this.getAadContext(tenantId, 'resend', integration.detail.keyVersion);
      const decrypted = decrypt({
        ciphertext: integration.detail.ciphertext,
        iv: integration.detail.iv,
        authTag: integration.detail.authTag,
        keyVersion: integration.detail.keyVersion,
      }, aadContext);

      return decrypted;
    } catch {
      logger.error(`Decryption failed for tenant ${tenantId} Resend integration.`);
      throw IntegrationErrors.CREDENTIAL_INVALID();
    }
  }

  async deleteResendIntegration(tenantId: string): Promise<void> {
    await this.repo.deleteEmailIntegration(tenantId, 'resend');
  }

  async testResendKey(tenantId: string, toEmail: string): Promise<{ success: boolean; message: string }> {
    const apiKey = await this.getDecryptedResendKey(tenantId);
    const sender = await this.getEffectiveSenderConfig(tenantId, 'resend');

    if (!sender.senderEmail) {
      throw new ValidationError('Sender email must be configured before sending a test email.');
    }

    const resend = new Resend(apiKey);
    const fromAddress = sender.senderName ? `${sender.senderName} <${sender.senderEmail}>` : sender.senderEmail;

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [toEmail],
      subject: 'Jaktra Test Email (Resend)',
      html: '<p>This is a test email confirming that your Resend integration with Jaktra is functioning properly.</p>',
      replyTo: sender.replyTo || undefined,
    });

    if (error) {
      throw new IntegrationError(`Test email failed: ${error.message}`, 'INTEGRATION_TEST_FAILED', 400);
    }

    return {
      success: true,
      message: `Test email sent successfully (ID: ${data?.id})`,
    };
  }

  async handleDeliveryError(tenantId: string, provider: 'sendgrid' | 'smtp' | 'resend', error: unknown): Promise<void> {
    logger.warn(`Delivery error encountered for tenant ${tenantId} on provider ${provider}:`, error);
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

  async testRazorpayIntegration(tenantId: string): Promise<{ success: boolean; message: string }> {
    const creds = await this.getDecryptedRazorpayConfig(tenantId);
    try {
      const auth = Buffer.from(`${creds.keyId}:${creds.keySecret}`).toString('base64');
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

      return { success: true, message: 'Razorpay API credentials are valid and live.' };
    } catch (error: unknown) {
      if (error instanceof IntegrationError) {
        throw error;
      }
      logger.error('testRazorpayIntegration error:', error);
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

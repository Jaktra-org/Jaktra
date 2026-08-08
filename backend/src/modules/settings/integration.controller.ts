import { Request, Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../shared/types/auth.js';
import { IntegrationService } from './integration.service.js';
import { CommunicationService } from '../communication/communication.service.js';
import { DlqService } from '../dlq/dlq.service.js';
import { z } from 'zod';
import { ValidationError } from '../../shared/errors/index.js';
import { verifyEmailDomainMx } from '../../shared/email/mx-verifier.js';
import type { EventService, ActorContext } from '../event/event.service.js';

import { config } from '../../config/index.js';
import { logger } from '../../shared/logger.js';
import type { SettingsRepository } from './settings.repository.js';

const razorpayCredsSchema = z.object({
  keyId: z.string().min(5).max(50).regex(/^rzp_/, 'Key ID must start with rzp_'),
  keySecret: z.string().min(5).max(100),
  webhookSecret: z.string().min(5).max(100),
});

function getPublicBaseUrl(req: Request): string {
  if (config.INBOUND_PARSE_DOMAIN) {
    return config.INBOUND_PARSE_DOMAIN.startsWith('http')
      ? config.INBOUND_PARSE_DOMAIN.replace(/\/$/, '')
      : `https://${config.INBOUND_PARSE_DOMAIN.replace(/\/$/, '')}`;
  }

  if (config.FRONTEND_URL && config.FRONTEND_URL.includes('jaktra.site')) {
    return config.FRONTEND_URL.replace(/\/$/, '');
  }

  const reqHost = req.get('x-forwarded-host') || req.get('host') || '';
  if (reqHost.includes('alb') || reqHost.includes('amazonaws.com') || reqHost.includes('cloudfront.net') || process.env.NODE_ENV === 'production') {
    return 'https://www.jaktra.site';
  }

  const protocol = req.protocol || 'http';
  return `${protocol}://${reqHost || 'localhost:3001'}`;
}

export class IntegrationController {
  constructor(
    private readonly integrationService: IntegrationService,
    private readonly communicationService: CommunicationService,
    private readonly eventService?: EventService,
    private readonly dlqService?: DlqService,
    private readonly settingsRepo?: SettingsRepository
  ) {}

  private getActorContext(req: Request): ActorContext {
    const user = (req as AuthenticatedRequest).user;
    return {
      source: 'ui',
      userId: user.userId,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  getStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = (req as AuthenticatedRequest).user.tenantId;
      const [sendgridStatus, smtpStatus, razorpayStatus, hasInbound] = await Promise.all([
        this.integrationService.getIntegrationStatus(tenantId, 'sendgrid'),
        this.integrationService.getIntegrationStatus(tenantId, 'smtp'),
        this.integrationService.getIntegrationStatusRazorpay(tenantId),
        this.integrationService.hasInboundEmails(tenantId),
      ]);

      let webhookToken = tenantId;
      let settings = null;
      if (this.settingsRepo) {
        settings = await this.settingsRepo.getSettings(tenantId);
        if (!settings?.webhookToken) {
          settings = await this.settingsRepo.rotateWebhookToken(tenantId);
        }
        if (settings?.webhookToken) {
          webhookToken = settings.webhookToken;
        }
      }

      const baseUrl = getPublicBaseUrl(req);
      const inboundWebhookUrl = `${baseUrl}/api/webhooks/sendgrid/inbound/${webhookToken}`;

      res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      res.json({
        sendgrid: sendgridStatus,
        smtp: smtpStatus,
        razorpay: razorpayStatus,
        inboundParse: {
          webhookUrl: inboundWebhookUrl,
          sendgridSettingsUrl: 'https://app.sendgrid.com/settings/parse',
          isVerified: !!settings?.inboundParseVerified || hasInbound,
          inboundDomain: settings?.inboundDomain || null,
          replyMode: settings?.replyMode || 'webhook_only',
          replyMailboxEmail: settings?.replyMailboxEmail || null,
          replyMailboxVerified: settings?.replyMailboxVerified || false,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  setReplyMode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = (req as AuthenticatedRequest).user.tenantId;
      const { replyMode, replyMailboxEmail } = req.body;

      if (!['real_mailbox', 'webhook_only'].includes(replyMode)) {
        throw new ValidationError('Invalid reply mode. Must be real_mailbox or webhook_only.');
      }

      if (replyMode === 'real_mailbox' && !replyMailboxEmail) {
        throw new ValidationError('Reply mailbox email is required for real_mailbox mode.');
      }

      if (!this.settingsRepo) {
        res.status(500).json({ error: { message: 'Settings repository not configured' } });
        return;
      }

      const updated = await this.settingsRepo.setReplyMode(tenantId, replyMode, replyMailboxEmail);

      res.json({
        message: 'Reply mode updated successfully',
        replyMode: updated.replyMode,
        replyMailboxEmail: updated.replyMailboxEmail,
        replyMailboxVerified: updated.replyMailboxVerified,
      });
    } catch (error) {
      next(error);
    }
  };

  sendReplyMailboxOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = (req as AuthenticatedRequest).user.tenantId;
      if (!this.settingsRepo) {
        res.status(500).json({ error: { message: 'Settings repository not configured' } });
        return;
      }

      const settings = await this.settingsRepo.getSettings(tenantId);
      if (!settings || settings.replyMode !== 'real_mailbox' || !settings.replyMailboxEmail) {
        throw new ValidationError('Tenant is not configured for real mailbox reply mode.');
      }

      // Check 60-second rate limit cooldown between OTP requests
      if (settings.replyMailboxOtpExpiresAt) {
        const timeSinceLastOtp = 10 * 60 * 1000 - (settings.replyMailboxOtpExpiresAt.getTime() - Date.now());
        if (timeSinceLastOtp >= 0 && timeSinceLastOtp < 60 * 1000) {
          const secondsLeft = Math.ceil((60 * 1000 - timeSinceLastOtp) / 1000);
          throw new ValidationError(`Please wait ${secondsLeft} seconds before requesting another OTP code.`);
        }
      }

      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await this.settingsRepo.saveReplyMailboxOtp(tenantId, otpCode, expiresAt);

      // Send OTP via platform mailer or fallback safely
      let emailSent = false;
      const platformMailer = this.integrationService.getPlatformMailer();
      if (platformMailer) {
        try {
          const res = await platformMailer.sendMailboxVerificationOtpEmail(settings.replyMailboxEmail, otpCode);
          if (res?.success) {
            emailSent = true;
          }
        } catch (err) {
          logger.warn(`Platform mailer OTP send failed:`, err);
        }
      }

      if (!emailSent && this.communicationService) {
        try {
          await this.communicationService.send({
            tenantId,
            to: settings.replyMailboxEmail,
            subject: 'Jaktra Mailbox Verification Code',
            html: `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; max-width: 500px;">
              <h2 style="color: #1e293b; margin-top: 0;">Verify Your Reply Mailbox</h2>
              <p style="color: #475569;">Enter the following 6-digit OTP code in Jaktra Settings to verify ownership of <strong>${settings.replyMailboxEmail}</strong>:</p>
              <div style="background-color: #f1f5f9; padding: 16px; text-align: center; border-radius: 6px; font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #2563eb; margin: 20px 0;">
                ${otpCode}
              </div>
              <p style="color: #64748b; font-size: 13px;">This verification code expires in 10 minutes.</p>
            </div>`,
          });
          emailSent = true;
        } catch (err) {
          logger.warn(`Communication service OTP send failed:`, err);
        }
      }

      if (!emailSent) {
        throw new ValidationError('Could not send verification OTP. Please configure and save your SendGrid API key first in Section 1.');
      }

      res.json({ message: `Verification OTP sent to ${settings.replyMailboxEmail}` });
    } catch (error) {
      next(error);
    }
  };

  verifyReplyMailboxOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = (req as AuthenticatedRequest).user.tenantId;
      const { otp } = req.body;

      if (!otp || typeof otp !== 'string' || otp.trim().length !== 6) {
        throw new ValidationError('6-digit OTP code is required.');
      }

      if (!this.settingsRepo) {
        res.status(500).json({ error: { message: 'Settings repository not configured' } });
        return;
      }

      const result = await this.settingsRepo.verifyReplyMailboxOtp(tenantId, otp);
      if (!result.success) {
        res.status(400).json({ error: { message: result.message } });
        return;
      }

      res.json({ message: 'Reply mailbox verified successfully!', replyMailboxVerified: true });
    } catch (error) {
      next(error);
    }
  };

  verifyInboundParse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = (req as AuthenticatedRequest).user.tenantId;
      const { inboundDomain } = req.body || {};
      const result = await this.integrationService.verifyInboundParse(tenantId, inboundDomain);
      res.json({ message: result.message, isVerified: true });
    } catch (error) {
      next(error);
    }
  };

  saveSendgridKey = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = (req as AuthenticatedRequest).user.tenantId;
      const { apiKey, senderName, senderEmail, replyTo, replyMode, replyMailboxEmail, otpCode } = req.body;

      if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim().startsWith('SG.')) {
        next(new ValidationError('Invalid SendGrid API Key format. Must start with SG.'));
        return;
      }

      if (senderName !== undefined || senderEmail !== undefined) {
        if (!senderName || typeof senderName !== 'string' || !senderName.trim()) {
          next(new ValidationError('Sender Name is required'));
          return;
        }
        if (!senderEmail || typeof senderEmail !== 'string' || !senderEmail.trim() || !senderEmail.includes('@')) {
          next(new ValidationError('Valid Sender Email is required'));
          return;
        }
      }

      if (replyMode && ['real_mailbox', 'webhook_only'].includes(replyMode) && this.settingsRepo) {
        await this.settingsRepo.setReplyMode(tenantId, replyMode, replyMailboxEmail);
      }

      const result = await this.integrationService.validateAndSaveSendgridKey(tenantId, {
        apiKey: apiKey.trim(),
        senderName: senderName ? senderName.trim() : undefined,
        senderEmail: senderEmail ? senderEmail.trim() : undefined,
        replyTo: replyTo && typeof replyTo === 'string' && replyTo.trim() !== '' ? replyTo.trim() : undefined,
        otpCode: otpCode && typeof otpCode === 'string' ? otpCode.trim() : undefined,
      });

      if (result.requiresOtp) {
        res.json({
          requiresOtp: true,
          targetEmail: result.targetEmail,
          message: result.message,
        });
        return;
      }

      // Clear DLQ entries on recovery / credentials update
      if (this.dlqService) {
        await this.dlqService.clearAllFailures(tenantId).catch(() => {});
      }

      // Auto-select as default if no provider is currently set
      const settings = await this.communicationService.getSettings(tenantId);
      if (!settings?.defaultEmailProvider) {
        await this.communicationService.setDefaultEmailProvider(tenantId, 'sendgrid');
      }

      this.eventService?.logEvent({
        tenantId,
        eventType: 'integration.connected',
        actor: this.getActorContext(req),
        metadata: { integration: 'sendgrid' },
      });

      res.json({ requiresOtp: false, message: result.message || 'SendGrid integration saved successfully' });
    } catch (error) {
      next(error);
    }
  };

  testSendgridKey = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = (req as AuthenticatedRequest).user.tenantId;
      const { to } = req.body;

      if (!to || typeof to !== 'string') {
        next(new ValidationError('Valid recipient email required'));
        return;
      }

      await this.communicationService.testConnection(tenantId, to);

      res.json({ message: 'Test email accepted for delivery' });
    } catch (error) {
      next(error);
    }
  };

  disconnectSendgrid = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = (req as AuthenticatedRequest).user.tenantId;
      await this.integrationService.deleteSendgridIntegration(tenantId);

      const settings = await this.communicationService.getSettings(tenantId);
      if (settings && (settings as { defaultEmailProvider?: string }).defaultEmailProvider === 'sendgrid') {
        // If SMTP is configured and valid, auto-switch to it
        const smtpStatus = await this.integrationService.getIntegrationStatus(tenantId, 'smtp');
        if (smtpStatus.isConfigured && smtpStatus.lastValidationResult === 'valid') {
          await this.communicationService.setDefaultEmailProvider(tenantId, 'smtp');
        } else {
          await this.communicationService.setDefaultEmailProvider(tenantId, null);
        }
      }

      this.eventService?.logEvent({
        tenantId,
        eventType: 'integration.disconnected',
        actor: this.getActorContext(req),
        metadata: { integration: 'sendgrid' },
      });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  saveSmtpConfig = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = (req as AuthenticatedRequest).user.tenantId;

      const bodyStr = JSON.stringify(req.body);
      if (bodyStr.length > 5000) {
        next(new ValidationError('Request body too large'));
        return;
      }

      const { senderName, username } = req.body;
      if (senderName !== undefined || username !== undefined) {
        if (!senderName || typeof senderName !== 'string' || !senderName.trim()) {
          next(new ValidationError('Sender Name is required'));
          return;
        }
        if (!username || typeof username !== 'string' || !username.trim() || !username.includes('@')) {
          next(new ValidationError('Valid Username (email) is required'));
          return;
        }

        await verifyEmailDomainMx(username.trim());
      }

      await this.integrationService.validateAndSaveSmtpConfig(tenantId, req.body);

      // Clear DLQ entries on recovery / credentials update
      if (this.dlqService) {
        await this.dlqService.clearAllFailures(tenantId).catch(() => {});
      }

      // Auto-select as default if no provider is currently set
      const settings = await this.communicationService.getSettings(tenantId);
      if (!settings?.defaultEmailProvider) {
        await this.communicationService.setDefaultEmailProvider(tenantId, 'smtp');
      }

      this.eventService?.logEvent({
        tenantId,
        eventType: 'integration.connected',
        actor: this.getActorContext(req),
        metadata: { integration: 'smtp', host: req.body?.host ?? null },
      });

      res.json({ message: 'SMTP connection verified and saved successfully' });
    } catch (error) {
      next(error);
    }
  };

  testSmtpConfig = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = (req as AuthenticatedRequest).user.tenantId;
      const { to } = req.body;

      if (!to || typeof to !== 'string') {
        next(new ValidationError('Valid recipient email required'));
        return;
      }


      const config = await this.integrationService.getDecryptedSmtpConfig(tenantId);
      const { createEmailProvider } = await import('../../shared/email/email-provider.factory.js');
      const provider = createEmailProvider({
        kind: 'smtp',
        host: config.host,
        port: config.port,
        user: config.username,
        password: config.password,
        secure: config.securityMode === 'implicit_tls'
      });
      const senderConfig = await this.integrationService.getEffectiveSenderConfig(tenantId, 'smtp');
      if (!senderConfig.senderEmail) {
        next(new ValidationError('SMTP Sender Email is not configured'));
        return;
      }

      const from = { name: senderConfig.senderName, email: senderConfig.senderEmail };
      const replyTo = senderConfig.replyTo || undefined;

      const result = await provider.send({
        to,
        from,
        replyTo,
        subject: 'Integration Test',
        html: '<p>Your SMTP integration is working correctly.</p>'
      });

      if (!result.success) {
        throw new ValidationError(result.error || 'SMTP validation failed');
      }

      res.json({ message: 'Test email accepted by SMTP server' });
    } catch (error) {
      next(error);
    }
  };

  disconnectSmtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = (req as AuthenticatedRequest).user.tenantId;
      await this.integrationService.deleteSmtpIntegration(tenantId);

      const settings = await this.communicationService.getSettings(tenantId);
      if (settings && (settings as { defaultEmailProvider?: string }).defaultEmailProvider === 'smtp') {
        // If SendGrid is configured and valid, auto-switch to it
        const sendgridStatus = await this.integrationService.getIntegrationStatus(tenantId, 'sendgrid');
        if (sendgridStatus.isConfigured && sendgridStatus.lastValidationResult === 'valid') {
          await this.communicationService.setDefaultEmailProvider(tenantId, 'sendgrid');
        } else {
          await this.communicationService.setDefaultEmailProvider(tenantId, null);
        }
      }

      this.eventService?.logEvent({
        tenantId,
        eventType: 'integration.disconnected',
        actor: this.getActorContext(req),
        metadata: { integration: 'smtp' },
      });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  saveRazorpayKey = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = (req as AuthenticatedRequest).user.tenantId;
      
      const validationResult = razorpayCredsSchema.safeParse(req.body);
      if (!validationResult.success) {
        next(new ValidationError('Invalid Razorpay credentials format', JSON.stringify(validationResult.error.issues)));
        return;
      }

      const { keyId, keySecret, webhookSecret } = validationResult.data;

      await this.integrationService.validateAndSaveRazorpayKey(tenantId, { keyId, keySecret, webhookSecret });

      // Only log the keyId prefix — never the secret or webhook secret
      this.eventService?.logEvent({
        tenantId,
        eventType: 'integration.connected',
        actor: this.getActorContext(req),
        metadata: { integration: 'razorpay', keyIdPrefix: keyId.slice(0, 10) },
      });

      res.json({ message: 'Razorpay integration saved successfully' });
    } catch (error) {
      next(error);
    }
  };

  disconnectRazorpay = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = (req as AuthenticatedRequest).user.tenantId;
      await this.integrationService.deleteRazorpayIntegration(tenantId);

      this.eventService?.logEvent({
        tenantId,
        eventType: 'integration.disconnected',
        actor: this.getActorContext(req),
        metadata: { integration: 'razorpay' },
      });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  setDefaultProvider = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = (req as AuthenticatedRequest).user.tenantId;
      const { provider } = req.body;

      if (provider !== 'sendgrid' && provider !== 'smtp' && provider !== null) {
         next(new ValidationError('Invalid provider'));
         return;
      }

      if (provider) {
        const status = await this.integrationService.getIntegrationStatus(tenantId, provider);
        if (!status || !status.isConfigured || status.lastValidationResult !== 'valid') {
           next(new ValidationError('Cannot select an absent or invalid provider'));
           return;
        }
      }

      // Capture previous default before changing it
      const prevSettings = await this.communicationService.getSettings(tenantId);
      const previousProvider = (prevSettings as { defaultEmailProvider?: string | null } | undefined)?.defaultEmailProvider ?? null;

      await this.communicationService.setDefaultEmailProvider(tenantId, provider);

      this.eventService?.logEvent({
        tenantId,
        eventType: 'integration.default_provider_changed',
        actor: this.getActorContext(req),
        metadata: { from: previousProvider, to: provider ?? null },
      });

      res.json({ message: 'Default provider updated' });
    } catch (error) {
      next(error);
    }
  };

  getSendgridHealth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = (req as AuthenticatedRequest).user.tenantId;
      const senderConfig = await this.integrationService.getEffectiveSenderConfig(tenantId, 'sendgrid');
      if (!senderConfig.senderEmail) {
        res.json({
          senderVerified: 'check_failed',
          domainAuthenticated: 'check_failed',
          checkedAt: new Date().toISOString(),
          reasons: ['Sender Email is not configured under SendGrid configuration.'],
        });
        return;
      }

      const health = await this.integrationService.getConfigurationHealth(tenantId, senderConfig.senderEmail);
      res.json(health);
    } catch (error) {
      next(error);
    }
  };
}

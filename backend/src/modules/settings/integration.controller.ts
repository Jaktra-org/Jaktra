import { Request, Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../shared/types/auth.js';
import { IntegrationService } from './integration.service.js';
import { CommunicationService } from '../communication/communication.service.js';
import { DlqService } from '../dlq/dlq.service.js';
import { z } from 'zod';
import { ValidationError } from '../../shared/errors/index.js';
import { verifyEmailDomainMx } from '../../shared/email/mx-verifier.js';
import type { EventService, ActorContext } from '../event/event.service.js';

import { logger } from '../../shared/logger.js';
import type { SettingsRepository } from './settings.repository.js';

const razorpayCredsSchema = z.object({
  keyId: z.string().min(5).max(50).regex(/^rzp_/, 'Key ID must start with rzp_'),
  keySecret: z.string().min(5).max(100),
  webhookSecret: z.string().min(5).max(100),
});



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
      const [sendgridProgress, smtpProgress, resendProgress, razorpayStatus, sendgridStatus, smtpStatus, resendStatus] = await Promise.all([
        this.integrationService.getSendgridSetupProgress(tenantId),
        this.integrationService.getSmtpSetupProgress(tenantId),
        this.integrationService.getResendSetupProgress(tenantId),
        this.integrationService.getIntegrationStatusRazorpay(tenantId),
        this.integrationService.getIntegrationStatus(tenantId, 'sendgrid'),
        this.integrationService.getIntegrationStatus(tenantId, 'smtp'),
        this.integrationService.getIntegrationStatus(tenantId, 'resend'),
      ]);

      res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      res.json({
        sendgridProgress,
        smtpProgress,
        resendProgress,
        sendgrid: sendgridStatus,
        smtp: smtpStatus,
        resend: resendStatus,
        razorpay: razorpayStatus,
        inboundParse: {
          webhookUrl: sendgridProgress.step3InboundWebhook.webhookUrl,
          sendgridSettingsUrl: sendgridProgress.step3InboundWebhook.sendgridSettingsUrl,
          isVerified: sendgridProgress.step3InboundWebhook.isVerified,
          inboundDomain: sendgridProgress.step3InboundWebhook.inboundDomain,
          replyMode: sendgridProgress.step2SenderAndMode.replyMode,
          replyMailboxEmail: sendgridProgress.step2SenderAndMode.replyMailboxEmail,
          replyMailboxVerified: sendgridProgress.step2SenderAndMode.replyMailboxVerified,
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

      const setupProgress = await this.integrationService.setReplyMode(tenantId, replyMode, replyMailboxEmail);

      res.json({
        message: 'Reply mode updated successfully',
        setupProgress,
        replyMode: setupProgress.step2SenderAndMode.replyMode,
        replyMailboxEmail: setupProgress.step2SenderAndMode.replyMailboxEmail,
        replyMailboxVerified: setupProgress.step2SenderAndMode.replyMailboxVerified,
      });
    } catch (error) {
      next(error);
    }
  };

  sendReplyMailboxOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = (req as AuthenticatedRequest).user.tenantId;
      const inputEmail = (req.body?.replyMailboxEmail || req.body?.email || '').trim();

      if (!inputEmail || !inputEmail.includes('@')) {
        throw new ValidationError('A valid real mailbox email address is required to send verification OTP.');
      }

      const { targetEmail, otpCode, setupProgress } = await this.integrationService.sendReplyMailboxOtp(tenantId, inputEmail);

      let emailSent = false;
      const platformMailer = this.integrationService.getPlatformMailer();
      if (platformMailer) {
        try {
          const res = await platformMailer.sendMailboxVerificationOtpEmail(targetEmail, otpCode);
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
            to: targetEmail,
            subject: 'Jaktra Mailbox Verification Code',
            html: `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; max-width: 500px;">
              <h2 style="color: #1e293b; margin-top: 0;">Verify Your Reply Mailbox</h2>
              <p style="color: #475569;">Enter the following 6-digit OTP code in Jaktra Settings to verify ownership of <strong>${targetEmail}</strong>:</p>
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
        throw new ValidationError('Could not send verification OTP. Please configure and save your SendGrid API key or platform email settings.');
      }

      res.json({ message: `Verification OTP sent to ${targetEmail}`, setupProgress });
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

      const result = await this.integrationService.verifyReplyMailboxOtp(tenantId, otp);
      res.json({ message: result.message, setupProgress: result.setupProgress, replyMailboxVerified: true });
    } catch (error) {
      next(error);
    }
  };

  verifyInboundParse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = (req as AuthenticatedRequest).user.tenantId;
      const { inboundDomain } = req.body || {};
      const result = await this.integrationService.verifyInboundParse(tenantId, inboundDomain);
      const setupProgress = await this.integrationService.getSendgridSetupProgress(tenantId);
      res.json({ message: result.message, isVerified: true, setupProgress });
    } catch (error) {
      next(error);
    }
  };

  saveSendgridKey = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = (req as AuthenticatedRequest).user.tenantId;
      const { apiKey, senderName, senderEmail, replyTo, replyMode, replyMailboxEmail, otpCode } = req.body;

      const effectiveApiKey = (typeof apiKey === 'string' && apiKey.trim() !== '') ? apiKey.trim() : 'SG.placeholder';

      if (!effectiveApiKey.startsWith('SG.')) {
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

      const result = await this.integrationService.validateAndSaveSendgridKey(tenantId, {
        apiKey: effectiveApiKey,
        senderName: senderName ? senderName.trim() : undefined,
        senderEmail: senderEmail ? senderEmail.trim() : undefined,
        replyTo: replyTo && typeof replyTo === 'string' && replyTo.trim() !== '' ? replyTo.trim() : undefined,
        replyMode: replyMode && ['real_mailbox', 'webhook_only'].includes(replyMode) ? replyMode : undefined,
        replyMailboxEmail: replyMailboxEmail && typeof replyMailboxEmail === 'string' && replyMailboxEmail.trim() !== '' ? replyMailboxEmail.trim() : undefined,
        otpCode: otpCode && typeof otpCode === 'string' ? otpCode.trim() : undefined,
      });

      const setupProgress = await this.integrationService.getSendgridSetupProgress(tenantId);

      // Clear DLQ entries on recovery / credentials update
      if (this.dlqService) {
        await this.dlqService.clearAllFailures(tenantId).catch(() => {});
      }

      this.eventService?.logEvent({
        tenantId,
        eventType: 'integration.connected',
        actor: this.getActorContext(req),
        metadata: { integration: 'sendgrid' },
      });

      res.json({ requiresOtp: false, message: result.message || 'SendGrid integration saved successfully', setupProgress });
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
      const setupProgress = await this.integrationService.getSendgridSetupProgress(tenantId);

      this.eventService?.logEvent({
        tenantId,
        eventType: 'integration.disconnected',
        actor: this.getActorContext(req),
        metadata: { integration: 'sendgrid' },
      });

      res.json({ message: 'SendGrid integration disconnected successfully', setupProgress });
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
      const setupProgress = await this.integrationService.getSmtpSetupProgress(tenantId);

      // Clear DLQ entries on recovery / credentials update
      if (this.dlqService) {
        await this.dlqService.clearAllFailures(tenantId).catch(() => {});
      }

      this.eventService?.logEvent({
        tenantId,
        eventType: 'integration.connected',
        actor: this.getActorContext(req),
        metadata: { integration: 'smtp', host: req.body?.host ?? null },
      });

      res.json({ message: 'SMTP connection verified and saved successfully', setupProgress });
    } catch (error) {
      next(error);
    }
  };

  disconnectSmtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = (req as AuthenticatedRequest).user.tenantId;
      await this.integrationService.deleteSmtpIntegration(tenantId);
      const setupProgress = await this.integrationService.getSmtpSetupProgress(tenantId);

      this.eventService?.logEvent({
        tenantId,
        eventType: 'integration.disconnected',
        actor: this.getActorContext(req),
        metadata: { integration: 'smtp' },
      });

      res.json({ message: 'SMTP integration disconnected successfully', setupProgress });
    } catch (error) {
      next(error);
    }
  };

  setActiveProvider = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = (req as AuthenticatedRequest).user.tenantId;
      const { provider } = req.params;

      if (provider !== 'sendgrid' && provider !== 'smtp' && provider !== 'resend') {
        throw new ValidationError('Invalid provider. Must be sendgrid, smtp, or resend.');
      }

      await this.integrationService.setActiveProvider(tenantId, provider);
      const setupProgress = provider === 'sendgrid'
        ? await this.integrationService.getSendgridSetupProgress(tenantId)
        : provider === 'smtp'
        ? await this.integrationService.getSmtpSetupProgress(tenantId)
        : await this.integrationService.getResendSetupProgress(tenantId);

      res.json({ message: `${provider} activated as active email provider`, setupProgress });
    } catch (error) {
      next(error);
    }
  };

  saveResendKey = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = (req as AuthenticatedRequest).user.tenantId;
      const { apiKey, senderName, senderEmail, replyTo, replyMode, replyMailboxEmail } = req.body;

      if (!apiKey || (typeof apiKey === 'string' && apiKey.trim() === '')) {
        const existing = await this.integrationService.getResendSetupProgress(tenantId);
        if (!existing.step1ApiKey.isDone && !existing.step1ApiKey.hasApiKey) {
          throw new ValidationError('API key is required.');
        }
      }

      if (senderEmail && typeof senderEmail === 'string' && senderEmail.trim() !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(senderEmail.trim())) {
          throw new ValidationError('Sender email is invalid.');
        }
      }

      if (replyTo && typeof replyTo === 'string' && replyTo.trim() !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(replyTo.trim())) {
          throw new ValidationError('Reply-To email is invalid.');
        }
      }

      const result = await this.integrationService.validateAndSaveResendKey(tenantId, {
        apiKey: apiKey && typeof apiKey === 'string' && apiKey.trim() !== '' ? apiKey.trim() : undefined,
        senderName: senderName !== undefined ? String(senderName).trim() : undefined,
        senderEmail: senderEmail !== undefined ? String(senderEmail).trim() : undefined,
        replyTo: replyTo !== undefined ? (replyTo ? String(replyTo).trim() : null) : undefined,
        replyMode: replyMode && ['real_mailbox', 'webhook_only'].includes(replyMode) ? replyMode : undefined,
        replyMailboxEmail: replyMailboxEmail !== undefined ? (replyMailboxEmail ? String(replyMailboxEmail).trim() : null) : undefined,
      });

      const setupProgress = await this.integrationService.getResendSetupProgress(tenantId);

      // Clear DLQ entries on recovery / credentials update
      if (this.dlqService) {
        await this.dlqService.clearAllFailures(tenantId).catch(() => {});
      }

      this.eventService?.logEvent({
        tenantId,
        eventType: 'integration.connected',
        actor: this.getActorContext(req),
        metadata: { integration: 'resend' },
      });

      res.json({ message: result.message, setupProgress });
    } catch (error) {
      next(error);
    }
  };

  testResendKey = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = (req as AuthenticatedRequest).user.tenantId;
      const { to } = req.body;

      if (!to || typeof to !== 'string' || !to.includes('@')) {
        throw new ValidationError('Valid recipient email required');
      }

      const result = await this.integrationService.testResendKey(tenantId, to.trim());
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  setResendReplyMode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = (req as AuthenticatedRequest).user.tenantId;
      const { replyMode, replyMailboxEmail } = req.body;

      if (!['real_mailbox', 'webhook_only'].includes(replyMode)) {
        throw new ValidationError('Invalid reply mode. Must be real_mailbox or webhook_only.');
      }

      if (replyMode === 'real_mailbox' && !replyMailboxEmail) {
        throw new ValidationError('Reply mailbox email is required for real_mailbox mode.');
      }

      const setupProgress = await this.integrationService.setResendReplyMode(tenantId, replyMode, replyMailboxEmail);

      res.json({
        message: 'Resend reply mode updated successfully',
        setupProgress,
        replyMode: setupProgress.step2SenderAndMode.replyMode,
        replyMailboxEmail: setupProgress.step2SenderAndMode.replyMailboxEmail,
        replyMailboxVerified: setupProgress.step2SenderAndMode.replyMailboxVerified,
      });
    } catch (error) {
      next(error);
    }
  };

  sendResendReplyMailboxOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = (req as AuthenticatedRequest).user.tenantId;
      const inputEmail = (req.body?.replyMailboxEmail || req.body?.email || '').trim();

      if (!inputEmail || !inputEmail.includes('@')) {
        throw new ValidationError('A valid real mailbox email address is required to send verification OTP.');
      }

      const { targetEmail, otpCode, setupProgress } = await this.integrationService.sendResendReplyMailboxOtp(tenantId, inputEmail);

      let emailSent = false;
      const platformMailer = this.integrationService.getPlatformMailer();
      if (platformMailer) {
        try {
          const res = await platformMailer.sendMailboxVerificationOtpEmail(targetEmail, otpCode);
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
            to: targetEmail,
            subject: 'Verify your reply forwarding mailbox (Resend)',
            html: `<p>Your 6-digit mailbox verification OTP is: <strong>${otpCode}</strong>. This code expires in 10 minutes.</p>`,
            bodyText: `Your 6-digit mailbox verification OTP is: ${otpCode}. This code expires in 10 minutes.`,
            source: 'system',
          });
          emailSent = true;
        } catch (commErr) {
          logger.warn(`Communication service OTP fallback failed:`, commErr);
        }
      }

      res.json({
        message: `Verification code sent to ${targetEmail}`,
        emailSent,
        setupProgress,
      });
    } catch (error) {
      next(error);
    }
  };

  verifyResendReplyMailboxOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = (req as AuthenticatedRequest).user.tenantId;
      const otpCode = (req.body?.otp || req.body?.otpCode || '').trim();

      if (!otpCode || otpCode.length !== 6) {
        throw new ValidationError('A 6-digit numeric OTP code is required.');
      }

      const result = await this.integrationService.verifyResendReplyMailboxOtp(tenantId, otpCode);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  verifyResendInboundParse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = (req as AuthenticatedRequest).user.tenantId;
      const { inboundDomain } = req.body || {};

      const result = await this.integrationService.verifyResendInboundParse(tenantId, inboundDomain);
      const setupProgress = await this.integrationService.getResendSetupProgress(tenantId);

      res.json({
        ...result,
        setupProgress,
      });
    } catch (error) {
      next(error);
    }
  };

  getResendHealth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = (req as AuthenticatedRequest).user.tenantId;
      const senderConfig = await this.integrationService.getEffectiveSenderConfig(tenantId, 'resend');
      const health = await this.integrationService.getResendConfigurationHealth(tenantId, senderConfig.senderEmail);
      res.json(health);
    } catch (error) {
      next(error);
    }
  };

  disconnectResend = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = (req as AuthenticatedRequest).user.tenantId;
      await this.integrationService.deleteResendIntegration(tenantId);
      const setupProgress = await this.integrationService.getResendSetupProgress(tenantId);

      this.eventService?.logEvent({
        tenantId,
        eventType: 'integration.disconnected',
        actor: this.getActorContext(req),
        metadata: { integration: 'resend' },
      });

      res.json({ message: 'Resend integration disconnected successfully', setupProgress });
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

  testRazorpayKey = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = (req as AuthenticatedRequest).user.tenantId;
      const result = await this.integrationService.testRazorpayIntegration(tenantId);
      res.json(result);
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

      if (provider !== 'sendgrid' && provider !== 'smtp' && provider !== 'resend' && provider !== null) {
         next(new ValidationError('Invalid provider'));
         return;
      }

      if (provider) {
        const status = await this.integrationService.getIntegrationStatus(tenantId, provider).catch(() => null);
        let isValid = status?.isConfigured && status?.lastValidationResult === 'valid';
        if (!isValid) {
          const progress = provider === 'sendgrid'
            ? await this.integrationService.getSendgridSetupProgress(tenantId).catch(() => null)
            : provider === 'smtp'
            ? await this.integrationService.getSmtpSetupProgress(tenantId).catch(() => null)
            : await this.integrationService.getResendSetupProgress(tenantId).catch(() => null);
          isValid = progress?.overallStatus === 'active';
        }

        if (!isValid) {
           next(new ValidationError('Cannot select an absent or invalid provider'));
           return;
        }
      }

      // Capture previous active provider for audit logging
      const previousActive = await this.integrationService.getActiveEmailIntegration(tenantId);
      const previousProvider: string | null = previousActive?.base.isActive ? previousActive.base.provider : null;

      if (provider) {
        await this.integrationService.setActiveProvider(tenantId, provider);
      }

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

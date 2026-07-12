import { ValidationError } from '../../shared/errors/index.js';
import { logger } from '../../shared/logger.js';
import type { EmailProvider, ResolvedEmailConfig, EmailSendResult, EmailMessage } from '../../shared/email/index.js';
import { createEmailProvider } from '../../shared/email/email-provider.factory.js';

export interface PlatformEmailConfigResolver {
  resolve(): Promise<ResolvedEmailConfig>;
}

export class EnvPlatformEmailConfigResolver implements PlatformEmailConfigResolver {
  async resolve(): Promise<ResolvedEmailConfig> {
    const provider = process.env.PLATFORM_EMAIL_PROVIDER || 'smtp';

    if (provider === 'smtp') {
      const smtpUrl = process.env.PLATFORM_SMTP_URL;
      if (!smtpUrl) {
        if (process.env.NODE_ENV === 'production') {
          throw new ValidationError('PLATFORM_SMTP_URL must be configured in production');
        }
        throw new ValidationError('Platform SMTP not configured');
      }

      try {
        const url = new URL(smtpUrl);
        const host = url.hostname;
        const port = Number(url.port) || 587;
        const user = decodeURIComponent(url.username);
        const password = decodeURIComponent(url.password);
        const secure = url.protocol === 'smtps:' || port === 465;

        return {
          kind: 'smtp',
          host,
          port,
          user,
          password,
          secure,
        };
      } catch (err: unknown) {
        throw new ValidationError(`Invalid PLATFORM_SMTP_URL: ${err instanceof Error ? err.message : String(err)}`);
      }
    } else if (provider === 'sendgrid') {
      const apiKey = process.env.PLATFORM_SENDGRID_API_KEY;
      if (!apiKey) {
        throw new ValidationError('PLATFORM_SENDGRID_API_KEY must be configured');
      }
      return {
        kind: 'sendgrid',
        apiKey,
      };
    } else {
      throw new ValidationError(`Unsupported platform email provider: ${provider}`);
    }
  }
}

export class PlatformMailer {
  constructor(private readonly configResolver: PlatformEmailConfigResolver) {}

  private async getProvider(): Promise<EmailProvider | null> {
    try {
      const config = await this.configResolver.resolve();
      return createEmailProvider(config);
    } catch (error: unknown) {
      if (process.env.NODE_ENV !== 'production' && error instanceof ValidationError) {
        logger.warn(`Platform email config resolution failed: ${error.message}. Emails will be skipped.`);
        return null;
      }
      throw error;
    }
  }

  async sendTeamInviteEmail(to: string, inviteLink: string): Promise<EmailSendResult> {
    try {
      const provider = await this.getProvider();
      if (!provider) {
        return { success: false, error: 'Platform SMTP not configured' };
      }
      
      const message: EmailMessage = {
        to,
        from: { name: 'Jaktra', email: 'noreply@jaktra.com' },
        subject: 'You have been invited to join Jaktra',
        html: `
          <p>You have been invited to join a workspace on Jaktra.</p>
          <p>Click the link below to accept the invitation and set up your account:</p>
          <p><a href="${inviteLink}">Accept Invitation</a></p>
          <p>This invitation expires in 7 days.</p>
        `,
      };

      return await provider.send(message);
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async sendOtpEmail(to: string, code: string): Promise<EmailSendResult> {
    try {
      const provider = await this.getProvider();
      if (!provider) {
        return { success: false, error: 'Platform SMTP not configured' };
      }
      
      const message: EmailMessage = {
        to,
        from: { name: 'Jaktra', email: 'noreply@jaktra.com' },
        subject: 'Verify your email address',
        html: `
          <p>Thank you for registering on Jaktra.</p>
          <p>Please enter the following 6-digit code to verify your email address:</p>
          <h2>${code}</h2>
          <p>This verification code expires in 10 minutes.</p>
        `,
      };

      return await provider.send(message);
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async sendPasswordResetOtpEmail(to: string, code: string): Promise<EmailSendResult> {
    try {
      const provider = await this.getProvider();
      if (!provider) {
        return { success: false, error: 'Platform SMTP not configured' };
      }
      
      const message: EmailMessage = {
        to,
        from: { name: 'Jaktra', email: 'noreply@jaktra.com' },
        subject: 'Reset your Jaktra password',
        html: `
          <p>You have requested to reset your password on Jaktra.</p>
          <p>Please enter the following 6-digit code to reset your password:</p>
          <h2>${code}</h2>
          <p>This password reset code expires in 10 minutes.</p>
          <p>If you did not request a password reset, you can safely ignore this email.</p>
        `,
      };

      return await provider.send(message);
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}


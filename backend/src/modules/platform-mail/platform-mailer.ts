import { ValidationError } from '../../shared/errors/index.js';
import type { EmailProvider, ResolvedEmailConfig, EmailSendResult, EmailMessage } from '../../shared/email/index.js';
import { createEmailProvider } from '../../shared/email/email-provider.factory.js';

export interface PlatformEmailConfigResolver {
  resolve(): Promise<ResolvedEmailConfig>;
  resolveSender(): Promise<{ fromEmail: string; fromName: string }>;
}

export class EnvPlatformEmailConfigResolver implements PlatformEmailConfigResolver {
  async resolveSender(): Promise<{ fromEmail: string; fromName: string }> {
    return {
      fromEmail: process.env.PLATFORM_FROM_EMAIL || 'no-reply@jaktra.site',
      fromName: process.env.PLATFORM_FROM_NAME || 'Jaktra',
    };
  }

  async resolve(): Promise<ResolvedEmailConfig> {
    const provider = process.env.PLATFORM_EMAIL_PROVIDER || 'smtp';

    if (provider === 'smtp') {
      const smtpUrl = process.env.PLATFORM_SMTP_URL;
      if (!smtpUrl) {
        throw new ValidationError('PLATFORM_SMTP_URL must be configured');
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
      throw error;
    }
  }

  private async getSender(): Promise<{ fromEmail: string; fromName: string }> {
    return this.configResolver.resolveSender();
  }

  async sendTeamInviteEmail(to: string, inviteLink: string): Promise<EmailSendResult> {
    try {
      const provider = await this.getProvider();
      if (!provider) {
        return { success: false, error: 'Platform SMTP not configured' };
      }
      
      const sender = await this.getSender();
      const message: EmailMessage = {
        to,
        from: { name: sender.fromName, email: sender.fromEmail },
        subject: `You have been invited to join ${sender.fromName}`,
        html: `
          <p>You have been invited to join a workspace on ${sender.fromName}.</p>
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
      
      const sender = await this.getSender();
      const message: EmailMessage = {
        to,
        from: { name: sender.fromName, email: sender.fromEmail },
        subject: 'Verify your email address',
        html: `
          <p>Thank you for registering on ${sender.fromName}.</p>
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

  async sendMailboxVerificationOtpEmail(to: string, code: string): Promise<EmailSendResult> {
    try {
      const provider = await this.getProvider();
      if (!provider) {
        return { success: false, error: 'Platform SMTP not configured' };
      }
      
      const sender = await this.getSender();
      const message: EmailMessage = {
        to,
        from: { name: `${sender.fromName} Support`, email: sender.fromEmail },
        subject: `Verify Your Mailbox (${to}) — Code: ${code}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #334155;">
            <h2 style="color: #0f172a; margin-bottom: 16px;">Mailbox Ownership Verification</h2>
            <p style="font-size: 14px; line-height: 1.6;">You are configuring <strong>${to}</strong> as your receiving email address on ${sender.fromName}.</p>
            <p style="font-size: 14px; line-height: 1.6;">Please enter the following 6-digit verification code in Jaktra to confirm that this inbox is active and able to receive customer replies:</p>
            <div style="background-color: #f1f5f9; border: 1px solid #cbd5e1; padding: 16px 28px; border-radius: 8px; display: inline-block; font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #0f172a; margin: 16px 0;">
              ${code}
            </div>
            <p style="color: #64748b; font-size: 12px; margin-top: 20px;">This verification code will expire in 10 minutes. If you did not request this configuration, you can safely ignore this email.</p>
          </div>
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
      
      const sender = await this.getSender();
      const message: EmailMessage = {
        to,
        from: { name: sender.fromName, email: sender.fromEmail },
        subject: `Reset your ${sender.fromName} password`,
        html: `
          <p>You have requested to reset your password on ${sender.fromName}.</p>
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

  async sendInboundVerificationTestEmail(to: string, replyTo: string): Promise<EmailSendResult> {
    try {
      const provider = await this.getProvider();
      if (!provider) {
        return { success: false, error: 'Platform SMTP not configured' };
      }
      
      const sender = await this.getSender();
      const message: EmailMessage = {
        to,
        from: { name: `${sender.fromName} Support`, email: sender.fromEmail },
        replyTo,
        subject: `[${sender.fromName}] Verify Inbound Reply Capture`,
        html: `
          <p>Please reply to this email to complete your ${sender.fromName} inbound reply capture verification test.</p>
          <p>Once you reply, the system will verify your setup and display active status on the Disputes tab.</p>
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


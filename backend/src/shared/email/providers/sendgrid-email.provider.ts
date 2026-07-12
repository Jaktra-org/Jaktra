import sgMail from '@sendgrid/mail';
import { logger } from '../../logger.js';
import type { EmailProvider, EmailMessage, EmailSendResult } from '../index.js';

export class SendGridEmailProvider implements EmailProvider {
  readonly name = 'sendgrid';

  constructor(
    private readonly config: {
      apiKey: string;
    }
  ) {
    sgMail.setApiKey(this.config.apiKey);
  }

  async send(message: EmailMessage): Promise<EmailSendResult> {
    const msg = {
      to: message.to,
      from: message.from,
      replyTo: message.replyTo ? { email: message.replyTo } : undefined,
      subject: message.subject,
      html: message.html,
      text: message.text,
      trackingSettings: message.trackingSettings ? {
        clickTracking: {
          enable: message.trackingSettings.clickTracking ?? false,
          enableText: message.trackingSettings.clickTracking ?? false,
        },
        openTracking: {
          enable: message.trackingSettings.openTracking ?? false,
        },
      } : undefined,
    };

    try {
      const [response] = await sgMail.send(msg);
      logger.info(`[LIVE] Email sent successfully to ${message.to} from ${message.from.email} via SendGrid`);
      
      const providerMessageId = response?.headers?.['x-message-id'];
      return {
        success: true,
        providerMessageId,
      };
    } catch (error: unknown) {
      logger.error(`[LIVE] Failed to send email to ${message.to} via SendGrid: ${(error as Error).message}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

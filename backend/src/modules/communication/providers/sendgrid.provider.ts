import sgMail from '@sendgrid/mail';
import { logger } from '../../../shared/logger.js';

export class SendgridProvider {
  constructor(private readonly sendgridApiKey?: string) {
    if (sendgridApiKey) {
      sgMail.setApiKey(sendgridApiKey);
    }
  }

  async sendEmail(
    to: string,
    from: { name: string; email: string },
    replyTo: { email: string } | undefined,
    subject: string,
    html: string,
    mode: 'live' | 'dry_run' = 'dry_run'
  ): Promise<boolean> {
    const msg = {
      to,
      from,
      replyTo,
      subject,
      html,
    };

    if (mode === 'dry_run') {
      logger.info(
        `[DRY RUN] Email to ${to} from ${from.email} (ReplyTo: ${
          replyTo?.email || 'N/A'
        }) - Subject: ${subject}`
      );
      return true;
    }

    if (!this.sendgridApiKey) {
      logger.warn(`[LIVE] Cannot send email to ${to} - SendGrid API Key is missing. Check .env config.`);
      throw new Error('SendGrid API key not configured globally');
    }

    try {
      await sgMail.send(msg);
      logger.info(`[LIVE] Email sent successfully to ${to} from ${from.email}`);
      return true;
    } catch (error: unknown) {
      logger.error(`[LIVE] Failed to send email to ${to}: ${(error as Error).message}`);
      throw new Error(`Email sending failed: ${(error as Error).message}`);
    }
  }
}

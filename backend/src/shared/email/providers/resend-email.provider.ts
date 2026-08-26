import { Resend } from 'resend';
import { ValidationError } from '../../errors/index.js';
import { logger } from '../../logger.js';
import type { EmailProvider, EmailMessage, EmailSendResult } from '../index.js';

export class ResendEmailProvider implements EmailProvider {
  readonly name = 'resend';
  private readonly resend: Resend;

  constructor(
    private readonly config: {
      apiKey: string;
    }
  ) {
    this.resend = new Resend(this.config.apiKey);
  }

  private checkHeaderInjection(value: string | undefined): void {
    if (!value) return;
    if (value.includes('\r') || value.includes('\n')) {
      throw new ValidationError('Header injection detected. CR/LF characters are not allowed.');
    }
  }

  async send(message: EmailMessage): Promise<EmailSendResult> {
    this.checkHeaderInjection(message.to);
    this.checkHeaderInjection(message.from.name);
    this.checkHeaderInjection(message.from.email);
    if (message.replyTo) this.checkHeaderInjection(message.replyTo);
    this.checkHeaderInjection(message.subject);

    const fromAddress = message.from.name
      ? `${message.from.name} <${message.from.email}>`
      : message.from.email;

    let resendTags: Array<{ name: string; value: string }> | undefined;
    if (Array.isArray(message.tags)) {
      resendTags = message.tags;
    } else if (message.tags && typeof message.tags === 'object') {
      resendTags = Object.entries(message.tags).map(([name, value]) => ({ name, value: String(value) }));
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: fromAddress,
        to: [message.to],
        subject: message.subject,
        html: message.html,
        text: message.text,
        replyTo: message.replyTo || undefined,
        tags: resendTags,
        headers: message.headers,
      });

      if (error) {
        const detailMsg = error.message || 'Unknown Resend error';
        const errName = (error.name || '').toLowerCase();
        const lower = detailMsg.toLowerCase();
        let formattedError = detailMsg;

        if (
          errName.includes('invalid_api_key') ||
          errName.includes('missing_api_key') ||
          lower.includes('api key') ||
          lower.includes('unauthorized')
        ) {
          formattedError = 'Resend API Key is invalid or unauthorized. Please verify your Resend API key in settings.';
        } else if (errName.includes('restricted_api_key')) {
          formattedError = 'Resend API Key has restricted permissions and cannot send emails.';
        } else if (errName.includes('rate_limit_exceeded') || lower.includes('rate limit')) {
          formattedError = 'Resend rate limit exceeded. Please retry shortly.';
        } else if (
          errName.includes('daily_quota_exceeded') ||
          errName.includes('monthly_quota_exceeded') ||
          lower.includes('quota')
        ) {
          formattedError = 'Resend email quota exceeded.';
        } else if (
          lower.includes('domain') ||
          lower.includes('not verified') ||
          lower.includes('from address') ||
          errName.includes('validation_error') && lower.includes('verify')
        ) {
          formattedError = 'Sender email address domain is not verified in your Resend account.';
        }

        logger.error(`[LIVE] Failed to send email to ${message.to} via Resend: ${detailMsg}`);
        return {
          success: false,
          error: formattedError,
        };
      }

      logger.info(`[LIVE] Email sent successfully to ${message.to} from ${message.from.email} via Resend`);
      return {
        success: true,
        providerMessageId: data?.id,
      };
    } catch (error: unknown) {
      const detailMsg = error instanceof Error ? error.message : String(error);
      logger.error(`[LIVE] Unexpected error sending email via Resend to ${message.to}: ${detailMsg}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

import sgMail from '@sendgrid/mail';
import { ValidationError } from '../../errors/index.js';
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

    let customArgs: Record<string, string> | undefined;
    if (Array.isArray(message.tags)) {
      customArgs = {};
      for (const t of message.tags) {
        customArgs[t.name] = t.value;
      }
    } else if (message.tags && typeof message.tags === 'object') {
      customArgs = message.tags as Record<string, string>;
    }

    const msg = {
      to: message.to,
      from: message.from,
      replyTo: message.replyTo ? { email: message.replyTo } : undefined,
      subject: message.subject,
      html: message.html,
      text: message.text,
      customArgs,
      headers: message.headers,
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
      let detailMsg = error instanceof Error ? error.message : String(error);
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const resp = (error as { response?: { body?: { errors?: Array<{ message?: string }> } } }).response;
        if (resp?.body?.errors?.[0]?.message) {
          detailMsg = resp.body.errors[0].message;
        }
      }

      const lower = detailMsg.toLowerCase();
      let formattedError = detailMsg;
      if (lower.includes('authorization grant') || lower.includes('unauthorized') || lower.includes('invalid api key')) {
        formattedError = 'SendGrid API Key is invalid or unauthorized. Please verify your SendGrid API key in settings.';
      } else if (lower.includes('sender identity') || lower.includes('from address')) {
        formattedError = 'Sender email address is not verified in your SendGrid account.';
      }

      logger.error(`[LIVE] Failed to send email to ${message.to} via SendGrid: ${detailMsg}`);
      return {
        success: false,
        error: formattedError,
      };
    }
  }
}

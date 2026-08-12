import type { EmailProvider, ResolvedEmailConfig } from './index.js';
import { SmtpEmailProvider } from './providers/smtp-email.provider.js';
import { SendGridEmailProvider } from './providers/sendgrid-email.provider.js';
import { ResendEmailProvider } from './providers/resend-email.provider.js';

export function createEmailProvider(config: ResolvedEmailConfig): EmailProvider {
  switch (config.kind) {
    case 'smtp':
      return new SmtpEmailProvider(config);
    case 'sendgrid':
      return new SendGridEmailProvider(config);
    case 'resend':
      return new ResendEmailProvider(config);
    default:
      throw new Error(`Unsupported email config kind: ${(config as ResolvedEmailConfig).kind}`);
  }
}

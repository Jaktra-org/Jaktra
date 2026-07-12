import type { EmailProvider, ResolvedEmailConfig } from './index.js';
import { SmtpEmailProvider } from './providers/smtp-email.provider.js';
import { SendGridEmailProvider } from './providers/sendgrid-email.provider.js';

export function createEmailProvider(config: ResolvedEmailConfig): EmailProvider {
  switch (config.kind) {
    case 'smtp':
      return new SmtpEmailProvider(config);
    case 'sendgrid':
      return new SendGridEmailProvider(config);
    default:
      throw new Error(`Unsupported email config kind: ${(config as any).kind}`);
  }
}

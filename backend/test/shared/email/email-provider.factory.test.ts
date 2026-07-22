import { describe, it, expect } from 'vitest';
import { createEmailProvider } from '../../../src/shared/email/email-provider.factory.js';
import { SmtpEmailProvider } from '../../../src/shared/email/providers/smtp-email.provider.js';
import { SendGridEmailProvider } from '../../../src/shared/email/providers/sendgrid-email.provider.js';

describe('createEmailProvider Factory', () => {
  it('should instantiate and return SmtpEmailProvider for smtp config kind', () => {
    const provider = createEmailProvider({
      kind: 'smtp',
      host: 'smtp.mail.com',
      port: 587,
      user: 'user',
      password: 'password',
      secure: false,
    });

    expect(provider).toBeInstanceOf(SmtpEmailProvider);
    expect(provider.name).toBe('smtp');
  });

  it('should instantiate and return SendGridEmailProvider for sendgrid config kind', () => {
    const provider = createEmailProvider({
      kind: 'sendgrid',
      apiKey: 'SG.test_key',
    });

    expect(provider).toBeInstanceOf(SendGridEmailProvider);
    expect(provider.name).toBe('sendgrid');
  });

  it('should throw an error for unsupported kinds', () => {
    expect(() => {
      createEmailProvider({
        kind: 'unsupported',
      } as any);
    }).toThrow('Unsupported email config kind');
  });
});

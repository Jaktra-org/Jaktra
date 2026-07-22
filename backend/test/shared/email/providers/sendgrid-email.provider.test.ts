import { describe, it, expect, vi, beforeEach } from 'vitest';
import sgMail from '@sendgrid/mail';
import { SendGridEmailProvider } from '../../../../src/shared/email/providers/sendgrid-email.provider.js';

vi.mock('@sendgrid/mail', () => {
  return {
    default: {
      setApiKey: vi.fn(),
      send: vi.fn().mockResolvedValue([{ headers: { 'x-message-id': 'sg-msg-999' } }]),
    },
  };
});

describe('SendGridEmailProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should set API key in constructor', () => {
    new SendGridEmailProvider({ apiKey: 'sg-test-api-key' });
    expect(sgMail.setApiKey).toHaveBeenCalledWith('sg-test-api-key');
  });

  it('should map and send email correctly without tracking settings', async () => {
    const provider = new SendGridEmailProvider({ apiKey: 'sg-test-api-key' });
    const result = await provider.send({
      to: 'recipient@sendgrid.com',
      from: { name: 'Jaktra SG', email: 'sg@jaktra.com' },
      subject: 'SendGrid Test',
      html: '<h1>Hi</h1>',
      replyTo: 'reply@jaktra.com',
    });

    expect(result.success).toBe(true);
    expect(result.providerMessageId).toBe('sg-msg-999');
    expect(sgMail.send).toHaveBeenCalledWith({
      to: 'recipient@sendgrid.com',
      from: { name: 'Jaktra SG', email: 'sg@jaktra.com' },
      replyTo: { email: 'reply@jaktra.com' },
      subject: 'SendGrid Test',
      html: '<h1>Hi</h1>',
      text: undefined,
      trackingSettings: undefined,
    });
  });

  it('should map and send email correctly with tracking settings enabled', async () => {
    const provider = new SendGridEmailProvider({ apiKey: 'sg-test-api-key' });
    const result = await provider.send({
      to: 'recipient@sendgrid.com',
      from: { name: 'Jaktra SG', email: 'sg@jaktra.com' },
      subject: 'SendGrid Test',
      html: '<h1>Hi</h1>',
      trackingSettings: {
        openTracking: true,
        clickTracking: true,
      },
    });

    expect(result.success).toBe(true);
    expect(sgMail.send).toHaveBeenCalledWith({
      to: 'recipient@sendgrid.com',
      from: { name: 'Jaktra SG', email: 'sg@jaktra.com' },
      replyTo: undefined,
      subject: 'SendGrid Test',
      html: '<h1>Hi</h1>',
      text: undefined,
      trackingSettings: {
        clickTracking: {
          enable: true,
          enableText: true,
        },
        openTracking: {
          enable: true,
        },
      },
    });
  });
});

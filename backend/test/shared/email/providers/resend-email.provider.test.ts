import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ResendEmailProvider } from '../../../../src/shared/email/providers/resend-email.provider.js';

const mockSend = vi.fn();
vi.mock('resend', () => {
  class MockResend {
    emails = {
      send: mockSend,
    };
  }
  return {
    Resend: MockResend,
  };
});

describe('ResendEmailProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have name "resend"', () => {
    const provider = new ResendEmailProvider({ apiKey: 're_test_key' });
    expect(provider.name).toBe('resend');
  });

  it('should map and send email successfully with sender name', async () => {
    mockSend.mockResolvedValueOnce({
      data: { id: 'resend_msg_123' },
      error: null,
    });

    const provider = new ResendEmailProvider({ apiKey: 're_test_key' });
    const result = await provider.send({
      to: 'customer@example.com',
      from: { name: 'Acme Billing', email: 'billing@acme.com' },
      subject: 'Invoice #1001 Overdue',
      html: '<p>Please pay your invoice.</p>',
      text: 'Please pay your invoice.',
      replyTo: 'support@acme.com',
    });

    expect(result.success).toBe(true);
    expect(result.providerMessageId).toBe('resend_msg_123');
    expect(mockSend).toHaveBeenCalledWith({
      from: 'Acme Billing <billing@acme.com>',
      to: ['customer@example.com'],
      subject: 'Invoice #1001 Overdue',
      html: '<p>Please pay your invoice.</p>',
      text: 'Please pay your invoice.',
      replyTo: 'support@acme.com',
      headers: undefined,
    });
  });

  it('should send email successfully with plain email from address', async () => {
    mockSend.mockResolvedValueOnce({
      data: { id: 'resend_msg_456' },
      error: null,
    });

    const provider = new ResendEmailProvider({ apiKey: 're_test_key' });
    const result = await provider.send({
      to: 'customer@example.com',
      from: { email: 'billing@acme.com' },
      subject: 'Statement of Account',
      html: '<p>Your statement.</p>',
    });

    expect(result.success).toBe(true);
    expect(result.providerMessageId).toBe('resend_msg_456');
    expect(mockSend).toHaveBeenCalledWith({
      from: 'billing@acme.com',
      to: ['customer@example.com'],
      subject: 'Statement of Account',
      html: '<p>Your statement.</p>',
      text: undefined,
      replyTo: undefined,
      headers: undefined,
    });
  });

  it('should reject subject with header injection', async () => {
    const provider = new ResendEmailProvider({ apiKey: 're_test_key' });
    await expect(
      provider.send({
        to: 'customer@example.com',
        from: { email: 'billing@acme.com' },
        subject: 'Invoice #1001\r\nBcc: hacker@evil.com',
        html: '<p>Hacked</p>',
      })
    ).rejects.toThrow('Header injection detected');
  });

  it('should reject sender name with header injection', async () => {
    const provider = new ResendEmailProvider({ apiKey: 're_test_key' });
    await expect(
      provider.send({
        to: 'customer@example.com',
        from: { name: 'Acme\nEvil', email: 'billing@acme.com' },
        subject: 'Invoice',
        html: '<p>Hacked</p>',
      })
    ).rejects.toThrow('Header injection detected');
  });

  it('should handle Resend API error responses', async () => {
    mockSend.mockResolvedValueOnce({
      data: null,
      error: {
        name: 'invalid_api_key',
        message: 'The API key is invalid',
      },
    });

    const provider = new ResendEmailProvider({ apiKey: 're_test_key' });
    const result = await provider.send({
      to: 'customer@example.com',
      from: { email: 'billing@acme.com' },
      subject: 'Invoice',
      html: '<p>Test</p>',
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('Resend API Key is invalid');
  });
});

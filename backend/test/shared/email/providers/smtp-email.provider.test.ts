import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import nodemailer from 'nodemailer';
import { SmtpEmailProvider } from '../../../../src/shared/email/providers/smtp-email.provider.js';
import { ValidationError } from '../../../../src/shared/errors/index.js';

vi.mock('nodemailer', () => {
  const mockTransporter = {
    sendMail: vi.fn().mockResolvedValue({ messageId: 'msg-123' }),
    close: vi.fn(),
  };
  return {
    default: {
      createTransport: vi.fn().mockReturnValue(mockTransporter),
    },
  };
});

vi.mock('dns/promises', () => {
  return {
    resolve4: vi.fn((host) => {
      if (host === 'localhost' || host === '127.0.0.1.nip.io') {
        return Promise.resolve(['127.0.0.1']);
      }
      if (host === 'private.local') {
        return Promise.resolve(['10.0.0.1']);
      }
      if (host === 'link-local.local') {
        return Promise.resolve(['169.254.169.254']);
      }
      if (host === 'safe.mail.com') {
        return Promise.resolve(['1.1.1.1']);
      }
      return Promise.reject(new Error('ENOTFOUND'));
    }),
    resolve6: vi.fn(() => Promise.resolve([])),
  };
});

describe('SmtpEmailProvider', () => {
  let mockTransporter: any;

  beforeEach(() => {
    mockTransporter = nodemailer.createTransport({} as any);
    mockTransporter.sendMail.mockClear();
    mockTransporter.close.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully send email using nodemailer when config is safe', async () => {
    const provider = new SmtpEmailProvider({
      host: 'safe.mail.com',
      port: 587,
      user: 'test-user',
      password: 'test-password',
      secure: false,
    });

    const result = await provider.send({
      to: 'recipient@example.com',
      from: { name: 'Jaktra Sender', email: 'sender@example.com' },
      subject: 'Hello test',
      html: '<p>Test html</p>',
      replyTo: 'reply@example.com',
    });

    expect(result.success).toBe(true);
    expect(result.providerMessageId).toBe('msg-123');
    expect(mockTransporter.sendMail).toHaveBeenCalledWith({
      to: 'recipient@example.com',
      from: '"Jaktra Sender" <sender@example.com>',
      replyTo: 'reply@example.com',
      subject: 'Hello test',
      html: '<p>Test html</p>',
      text: undefined,
    });
  });

  it('should prevent sending and throw ValidationError when host resolves to localhost (SSRF check)', async () => {
    const provider = new SmtpEmailProvider({
      host: 'localhost',
      port: 587,
      user: 'test-user',
      password: 'test-password',
      secure: false,
    });

    const result = await provider.send({
      to: 'recipient@example.com',
      from: { name: 'Jaktra', email: 'sender@example.com' },
      subject: 'Hello',
      html: '<p>Test</p>',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('resolved to a prohibited IP address');
    expect(mockTransporter.sendMail).not.toHaveBeenCalled();
  });

  it('should prevent sending and throw ValidationError when host resolves to private IP range (SSRF check)', async () => {
    const provider = new SmtpEmailProvider({
      host: 'private.local',
      port: 587,
      user: 'test-user',
      password: 'test-password',
      secure: false,
    });

    const result = await provider.send({
      to: 'recipient@example.com',
      from: { name: 'Jaktra', email: 'sender@example.com' },
      subject: 'Hello',
      html: '<p>Test</p>',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('resolved to a prohibited IP address');
    expect(mockTransporter.sendMail).not.toHaveBeenCalled();
  });

  it('should prevent sending and throw ValidationError when host resolves to link-local IP range (SSRF check)', async () => {
    const provider = new SmtpEmailProvider({
      host: 'link-local.local',
      port: 587,
      user: 'test-user',
      password: 'test-password',
      secure: false,
    });

    const result = await provider.send({
      to: 'recipient@example.com',
      from: { name: 'Jaktra', email: 'sender@example.com' },
      subject: 'Hello',
      html: '<p>Test</p>',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('resolved to a prohibited IP address');
    expect(mockTransporter.sendMail).not.toHaveBeenCalled();
  });

  it('should throw ValidationError on header injection attempt', async () => {
    const provider = new SmtpEmailProvider({
      host: 'safe.mail.com',
      port: 587,
      user: 'test-user',
      password: 'test-password',
      secure: false,
    });

    await expect(provider.send({
      to: 'recipient@example.com\r\nBcc: spy@example.com',
      from: { name: 'Jaktra', email: 'sender@example.com' },
      subject: 'Hello',
      html: '<p>Test</p>',
    })).rejects.toThrow(ValidationError);

    expect(mockTransporter.sendMail).not.toHaveBeenCalled();
  });
});

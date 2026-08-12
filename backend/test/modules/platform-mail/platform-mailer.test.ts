import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PlatformMailer } from '../../../src/modules/platform-mail/platform-mailer.js';
import type { PlatformEmailConfigResolver } from '../../../src/modules/platform-mail/platform-mailer.js';
import { createEmailProvider } from '../../../src/shared/email/email-provider.factory.js';

vi.mock('../../../src/shared/email/email-provider.factory.js', () => {
  const mockProvider = {
    name: 'smtp',
    send: vi.fn().mockResolvedValue({ success: true, providerMessageId: 'p-111' }),
  };
  return {
    createEmailProvider: vi.fn().mockReturnValue(mockProvider),
  };
});

describe('PlatformMailer', () => {
  let mockResolver: PlatformEmailConfigResolver;
  let mockProviderInstance: any;

  beforeEach(() => {
    mockProviderInstance = createEmailProvider({} as any);
    mockProviderInstance.send.mockClear();
    vi.clearAllMocks();

    mockResolver = {
      resolve: vi.fn().mockResolvedValue({
        kind: 'smtp',
        host: 'smtp.gmail.com',
        port: 465,
        user: 'user',
        password: 'password',
        secure: true,
      }),
      resolveSender: vi.fn().mockResolvedValue({
        fromEmail: 'no-reply@jaktra.site',
        fromName: 'Jaktra',
      }),
    };
  });

  it('should resolve config and send team invitation email successfully', async () => {
    const platformMailer = new PlatformMailer(mockResolver);
    const result = await platformMailer.sendTeamInviteEmail('invited@example.com', 'https://jaktra.site/invite#token=abc');

    expect(mockResolver.resolve).toHaveBeenCalled();
    expect(createEmailProvider).toHaveBeenCalledWith({
      kind: 'smtp',
      host: 'smtp.gmail.com',
      port: 465,
      user: 'user',
      password: 'password',
      secure: true,
    });
    
    expect(mockProviderInstance.send).toHaveBeenCalledWith({
      to: 'invited@example.com',
      from: { name: 'Jaktra', email: 'no-reply@jaktra.site' },
      subject: 'You have been invited to join Jaktra',
      html: expect.stringContaining('https://jaktra.site/invite#token=abc'),
    });

    expect(result.success).toBe(true);
    expect(result.providerMessageId).toBe('p-111');
  });

  it('should return error output on resolution or transport failure', async () => {
    mockResolver.resolve = vi.fn().mockRejectedValue(new Error('Connection failure'));
    
    const platformMailer = new PlatformMailer(mockResolver);
    const result = await platformMailer.sendTeamInviteEmail('invited@example.com', 'https://jaktra.site/invite#token=abc');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Connection failure');
  });

  it('should resolve config and send OTP email successfully', async () => {
    const platformMailer = new PlatformMailer(mockResolver);
    const result = await platformMailer.sendOtpEmail('test@example.com', '123456');

    expect(mockResolver.resolve).toHaveBeenCalled();
    expect(mockProviderInstance.send).toHaveBeenCalledWith({
      to: 'test@example.com',
      from: { name: 'Jaktra', email: 'no-reply@jaktra.site' },
      subject: 'Verify your email address',
      html: expect.stringContaining('123456'),
    });

    expect(result.success).toBe(true);
    expect(result.providerMessageId).toBe('p-111');
  });

  describe('EnvPlatformEmailConfigResolver', () => {
    const originalEnv = { ...process.env };

    beforeEach(() => {
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = { ...originalEnv };
    });

    it('resolves Resend platform email config from env without requiring webhooks', async () => {
      const { EnvPlatformEmailConfigResolver } = await import('../../../src/modules/platform-mail/platform-mailer.js');
      process.env.PLATFORM_EMAIL_PROVIDER = 'resend';
      process.env.PLATFORM_RESEND_API_KEY = 're_system_api_key_123';
      process.env.PLATFORM_FROM_EMAIL = 'auth@jaktra.site';
      process.env.PLATFORM_FROM_NAME = 'Jaktra System';

      const resolver = new EnvPlatformEmailConfigResolver();
      const config = await resolver.resolve();
      const sender = await resolver.resolveSender();

      expect(config).toEqual({
        kind: 'resend',
        apiKey: 're_system_api_key_123',
      });
      expect(sender).toEqual({
        fromEmail: 'auth@jaktra.site',
        fromName: 'Jaktra System',
      });
    });

    it('throws ValidationError if PLATFORM_RESEND_API_KEY is missing when provider is resend', async () => {
      const { EnvPlatformEmailConfigResolver } = await import('../../../src/modules/platform-mail/platform-mailer.js');
      process.env.PLATFORM_EMAIL_PROVIDER = 'resend';
      delete process.env.PLATFORM_RESEND_API_KEY;

      const resolver = new EnvPlatformEmailConfigResolver();
      await expect(resolver.resolve()).rejects.toThrow('PLATFORM_RESEND_API_KEY must be configured');
    });

    it('resolves SendGrid platform email config from env', async () => {
      const { EnvPlatformEmailConfigResolver } = await import('../../../src/modules/platform-mail/platform-mailer.js');
      process.env.PLATFORM_EMAIL_PROVIDER = 'sendgrid';
      process.env.PLATFORM_SENDGRID_API_KEY = 'SG.system_sendgrid_key';

      const resolver = new EnvPlatformEmailConfigResolver();
      const config = await resolver.resolve();

      expect(config).toEqual({
        kind: 'sendgrid',
        apiKey: 'SG.system_sendgrid_key',
      });
    });
  });
});

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EnvPlatformEmailConfigResolver } from '../../../src/modules/platform-mail/platform-mailer.js';
import { ValidationError } from '../../../src/shared/errors/index.js';

describe('EnvPlatformEmailConfigResolver', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should resolve SMTP config correctly from env', async () => {
    process.env.PLATFORM_EMAIL_PROVIDER = 'smtp';
    process.env.PLATFORM_SMTP_URL = 'smtps://username%40gmail.com:password123@smtp.gmail.com:465';

    const resolver = new EnvPlatformEmailConfigResolver();
    const config = await resolver.resolve();

    expect(config).toEqual({
      kind: 'smtp',
      host: 'smtp.gmail.com',
      port: 465,
      user: 'username@gmail.com',
      password: 'password123',
      secure: true,
    });
  });

  it('should resolve SendGrid config correctly from env', async () => {
    process.env.PLATFORM_EMAIL_PROVIDER = 'sendgrid';
    process.env.PLATFORM_SENDGRID_API_KEY = 'SG.platform_sendgrid_key';

    const resolver = new EnvPlatformEmailConfigResolver();
    const config = await resolver.resolve();

    expect(config).toEqual({
      kind: 'sendgrid',
      apiKey: 'SG.platform_sendgrid_key',
    });
  });

  it('should default to SMTP if provider is omitted', async () => {
    delete process.env.PLATFORM_EMAIL_PROVIDER;
    process.env.PLATFORM_SMTP_URL = 'smtp://username:password@smtp.gmail.com:587';

    const resolver = new EnvPlatformEmailConfigResolver();
    const config = await resolver.resolve();

    expect(config.kind).toBe('smtp');
  });

  it('should throw ValidationError if PLATFORM_SMTP_URL is missing for smtp provider', async () => {
    process.env.PLATFORM_EMAIL_PROVIDER = 'smtp';
    delete process.env.PLATFORM_SMTP_URL;

    const resolver = new EnvPlatformEmailConfigResolver();
    await expect(resolver.resolve()).rejects.toThrow(ValidationError);
  });

  it('should throw ValidationError if PLATFORM_SENDGRID_API_KEY is missing for sendgrid provider', async () => {
    process.env.PLATFORM_EMAIL_PROVIDER = 'sendgrid';
    delete process.env.PLATFORM_SENDGRID_API_KEY;

    const resolver = new EnvPlatformEmailConfigResolver();
    await expect(resolver.resolve()).rejects.toThrow(ValidationError);
  });

  it('should throw ValidationError if provider is unsupported', async () => {
    process.env.PLATFORM_EMAIL_PROVIDER = 'ses';

    const resolver = new EnvPlatformEmailConfigResolver();
    await expect(resolver.resolve()).rejects.toThrow(ValidationError);
  });
});

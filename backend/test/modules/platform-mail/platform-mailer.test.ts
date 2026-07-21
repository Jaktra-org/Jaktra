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
    };
  });

  it('should resolve config and send team invitation email successfully', async () => {
    const platformMailer = new PlatformMailer(mockResolver);
    const result = await platformMailer.sendTeamInviteEmail('invited@example.com', 'https://jaktra.com/invite#token=abc');

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
      from: { name: 'Jaktra', email: 'noreply@jaktra.com' },
      subject: 'You have been invited to join Jaktra',
      html: expect.stringContaining('https://jaktra.com/invite#token=abc'),
    });

    expect(result.success).toBe(true);
    expect(result.providerMessageId).toBe('p-111');
  });

  it('should return error output on resolution or transport failure', async () => {
    mockResolver.resolve = vi.fn().mockRejectedValue(new Error('Connection failure'));
    
    const platformMailer = new PlatformMailer(mockResolver);
    const result = await platformMailer.sendTeamInviteEmail('invited@example.com', 'https://jaktra.com/invite#token=abc');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Connection failure');
  });

  it('should resolve config and send OTP email successfully', async () => {
    const platformMailer = new PlatformMailer(mockResolver);
    const result = await platformMailer.sendOtpEmail('test@example.com', '123456');

    expect(mockResolver.resolve).toHaveBeenCalled();
    expect(mockProviderInstance.send).toHaveBeenCalledWith({
      to: 'test@example.com',
      from: { name: 'Jaktra', email: 'noreply@jaktra.com' },
      subject: 'Verify your email address',
      html: expect.stringContaining('123456'),
    });

    expect(result.success).toBe(true);
    expect(result.providerMessageId).toBe('p-111');
  });
});

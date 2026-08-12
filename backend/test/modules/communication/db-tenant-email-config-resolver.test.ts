import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DbTenantEmailConfigResolver } from '../../../src/modules/communication/tenant-mailer.js';
import { CommunicationError } from '../../../src/shared/errors/index.js';

// ---------------------------------------------------------------------------
// DbTenantEmailConfigResolver
//
// After removing the dead defaultEmailProvider fallback, this class has a
// single source of truth: getActiveEmailIntegration() on integrationService.
// communicationRepo is no longer a constructor parameter on this class.
// ---------------------------------------------------------------------------

describe('DbTenantEmailConfigResolver', () => {
  let mockIntegrationService: any;
  let resolver: DbTenantEmailConfigResolver;

  function makeActiveIntegration(provider: 'sendgrid' | 'smtp' | 'resend') {
    return {
      base: { overallStatus: 'active', isActive: true, provider },
      detail: null,
      provider,
    };
  }

  beforeEach(() => {
    mockIntegrationService = {
      getActiveEmailIntegration: vi.fn(),
      getDecryptedSendgridKey: vi.fn(),
      getDecryptedSmtpConfig: vi.fn(),
      getDecryptedResendKey: vi.fn(),
      handleDeliveryError: vi.fn(),
    };
    // Note: no communicationRepo parameter — it was removed from this class
    resolver = new DbTenantEmailConfigResolver(mockIntegrationService);
  });

  it('resolves to sendgrid config when sendgrid integration is active', async () => {
    mockIntegrationService.getActiveEmailIntegration.mockResolvedValue(makeActiveIntegration('sendgrid'));
    mockIntegrationService.getDecryptedSendgridKey.mockResolvedValue('SG.decrypted_key');

    const result = await resolver.resolve('tenant-1');

    expect(mockIntegrationService.getDecryptedSendgridKey).toHaveBeenCalledWith('tenant-1');
    expect(result).toEqual({ kind: 'sendgrid', apiKey: 'SG.decrypted_key' });
  });

  it('resolves to resend config when resend integration is active', async () => {
    mockIntegrationService.getActiveEmailIntegration.mockResolvedValue(makeActiveIntegration('resend'));
    mockIntegrationService.getDecryptedResendKey.mockResolvedValue('re_decrypted_key');

    const result = await resolver.resolve('tenant-1');

    expect(mockIntegrationService.getDecryptedResendKey).toHaveBeenCalledWith('tenant-1');
    expect(result).toEqual({ kind: 'resend', apiKey: 're_decrypted_key' });
  });

  it('resolves to smtp config when smtp integration is active', async () => {
    mockIntegrationService.getActiveEmailIntegration.mockResolvedValue(makeActiveIntegration('smtp'));
    mockIntegrationService.getDecryptedSmtpConfig.mockResolvedValue({
      host: 'smtp.example.com',
      port: 465,
      username: 'user@example.com',
      password: 'secret',
      securityMode: 'implicit_tls',
    });

    const result = await resolver.resolve('tenant-1');

    expect(mockIntegrationService.getDecryptedSmtpConfig).toHaveBeenCalledWith('tenant-1');
    expect(result).toEqual({
      kind: 'smtp',
      host: 'smtp.example.com',
      port: 465,
      user: 'user@example.com',
      password: 'secret',
      secure: true,
    });
  });

  it('throws EMAIL_PROVIDER_NOT_CONFIGURED when no integration is active (returns null)', async () => {
    mockIntegrationService.getActiveEmailIntegration.mockResolvedValue(null);

    await expect(resolver.resolve('tenant-1')).rejects.toThrow(
      new CommunicationError('EMAIL_PROVIDER_NOT_CONFIGURED', 400)
    );
    // No fallback to settings — getDecryptedSendgridKey must not be called
    expect(mockIntegrationService.getDecryptedSendgridKey).not.toHaveBeenCalled();
    expect(mockIntegrationService.getDecryptedSmtpConfig).not.toHaveBeenCalled();
  });

  it('throws EMAIL_PROVIDER_NOT_CONFIGURED when integration exists but overallStatus is not active', async () => {
    mockIntegrationService.getActiveEmailIntegration.mockResolvedValue({
      base: { overallStatus: 'partially_configured', isActive: false, provider: 'sendgrid' },
      detail: null,
      provider: 'sendgrid',
    });

    await expect(resolver.resolve('tenant-1')).rejects.toThrow(
      new CommunicationError('EMAIL_PROVIDER_NOT_CONFIGURED', 400)
    );
  });

  it('calls getActiveEmailIntegration exactly once per resolve call (no settings fallback)', async () => {
    mockIntegrationService.getActiveEmailIntegration.mockResolvedValue(makeActiveIntegration('sendgrid'));
    mockIntegrationService.getDecryptedSendgridKey.mockResolvedValue('SG.key');

    await resolver.resolve('tenant-1');

    expect(mockIntegrationService.getActiveEmailIntegration).toHaveBeenCalledTimes(1);
    expect(mockIntegrationService.getActiveEmailIntegration).toHaveBeenCalledWith('tenant-1');
  });

  it('handleDeliveryError delegates to integrationService', async () => {
    const error = new Error('Send failed');
    await resolver.handleDeliveryError('tenant-1', 'sendgrid', error);

    expect(mockIntegrationService.handleDeliveryError).toHaveBeenCalledWith('tenant-1', 'sendgrid', error);
  });
});


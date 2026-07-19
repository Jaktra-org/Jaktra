import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DbTenantEmailConfigResolver } from '../../../src/modules/communication/tenant-mailer.js';
import { CommunicationError } from '../../../src/shared/errors/index.js';

describe('DbTenantEmailConfigResolver', () => {
  let mockIntegrationService: any;
  let mockCommunicationRepo: any;
  let resolver: DbTenantEmailConfigResolver;

  beforeEach(() => {
    mockIntegrationService = {
      getDecryptedSendgridKey: vi.fn(),
      getDecryptedSmtpConfig: vi.fn(),
    };
    mockCommunicationRepo = {
      getSettings: vi.fn(),
    };
    resolver = new DbTenantEmailConfigResolver(mockIntegrationService, mockCommunicationRepo);
  });

  it('should throw CommunicationError when settings are not configured', async () => {
    mockCommunicationRepo.getSettings.mockResolvedValue(null);

    await expect(resolver.resolve('tenant-1')).rejects.toThrow(
      new CommunicationError('Communication settings not configured for this tenant', 400)
    );
  });

  it('should throw CommunicationError when senderEmail is missing in settings', async () => {
    mockCommunicationRepo.getSettings.mockResolvedValue({ senderEmail: '' });

    await expect(resolver.resolve('tenant-1')).rejects.toThrow(
      new CommunicationError('Communication settings not configured for this tenant', 400)
    );
  });

  it('should throw CommunicationError when defaultEmailProvider is missing in settings', async () => {
    mockCommunicationRepo.getSettings.mockResolvedValue({ senderEmail: 'test@example.com' });

    await expect(resolver.resolve('tenant-1')).rejects.toThrow(
      new CommunicationError('EMAIL_PROVIDER_NOT_CONFIGURED', 400)
    );
  });

  it('should resolve SMTP config using decrypted settings from IntegrationService', async () => {
    mockCommunicationRepo.getSettings.mockResolvedValue({
      senderEmail: 'sender@example.com',
      defaultEmailProvider: 'smtp',
    });
    mockIntegrationService.getDecryptedSmtpConfig.mockResolvedValue({
      host: 'smtp.gmail.com',
      port: 465,
      username: 'username',
      password: 'password',
      securityMode: 'implicit_tls',
    });

    const result = await resolver.resolve('tenant-1');
    expect(mockIntegrationService.getDecryptedSmtpConfig).toHaveBeenCalledWith('tenant-1');
    expect(result).toEqual({
      kind: 'smtp',
      host: 'smtp.gmail.com',
      port: 465,
      user: 'username',
      password: 'password',
      secure: true,
    });
  });

  it('should resolve SendGrid config using decrypted settings from IntegrationService', async () => {
    mockCommunicationRepo.getSettings.mockResolvedValue({
      senderEmail: 'sender@example.com',
      defaultEmailProvider: 'sendgrid',
    });
    mockIntegrationService.getDecryptedSendgridKey.mockResolvedValue('SG.decrypted_key');

    const result = await resolver.resolve('tenant-1');
    expect(mockIntegrationService.getDecryptedSendgridKey).toHaveBeenCalledWith('tenant-1');
    expect(result).toEqual({
      kind: 'sendgrid',
      apiKey: 'SG.decrypted_key',
    });
  });
});

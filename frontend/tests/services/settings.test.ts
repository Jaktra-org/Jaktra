import { settingsService } from '../../src/services/settings';
import { api } from '../../src/services/api';

vi.mock('../../src/services/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('settingsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls correct API endpoints for settings operations', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: {} });
    vi.mocked(api.post).mockResolvedValue({ data: {} });
    vi.mocked(api.patch).mockResolvedValue({ data: {} });
    vi.mocked(api.delete).mockResolvedValue({ data: {} });

    await settingsService.getSettings();
    expect(api.get).toHaveBeenCalledWith('/settings');

    await settingsService.updateSettings({ skipPaymentWarning: true });
    expect(api.patch).toHaveBeenCalledWith('/settings', { skipPaymentWarning: true });

    await settingsService.getIntegrations();
    expect(api.get).toHaveBeenCalledWith('/settings/integrations');

    await settingsService.saveSendgridKey('apiKey');
    expect(api.post).toHaveBeenCalledWith('/settings/integrations/sendgrid', { apiKey: 'apiKey' });

    await settingsService.disconnectSendgrid();
    expect(api.delete).toHaveBeenCalledWith('/settings/integrations/sendgrid');

    await settingsService.testEmail('to@ex.com');
    expect(api.post).toHaveBeenCalledWith('/settings/integrations/sendgrid/test', { to: 'to@ex.com' });

    const smtpConfig = { host: 'smtp.mail.com', port: 587 } as any;
    await settingsService.saveSmtpConfig(smtpConfig);
    expect(api.post).toHaveBeenCalledWith('/settings/integrations/smtp', smtpConfig);

    await settingsService.disconnectSmtp();
    expect(api.delete).toHaveBeenCalledWith('/settings/integrations/smtp');

    await settingsService.testSmtpEmail('to@ex.com');
    expect(api.post).toHaveBeenCalledWith('/settings/integrations/smtp/test', { to: 'to@ex.com' });

    await settingsService.setDefaultProvider('sendgrid');
    expect(api.patch).toHaveBeenCalledWith('/settings/integrations/default-provider', { provider: 'sendgrid' });

    await settingsService.getInboundVerificationStatus();
    expect(api.get).toHaveBeenCalledWith('/settings/inbound-verification/status');

    await settingsService.startInboundVerificationTest();
    expect(api.post).toHaveBeenCalledWith('/settings/inbound-verification/test');

    const razorpayData = { keyId: 'id', keySecret: 'secret', webhookSecret: 'webhook' };
    await settingsService.saveRazorpayKey(razorpayData);
    expect(api.post).toHaveBeenCalledWith('/settings/integrations/razorpay', razorpayData);

    await settingsService.disconnectRazorpay();
    expect(api.delete).toHaveBeenCalledWith('/settings/integrations/razorpay');

    await settingsService.getSendgridHealth();
    expect(api.get).toHaveBeenCalledWith('/settings/integrations/sendgrid/health');
  });
});

import React from 'react';
import { screen, act, waitFor } from '../../test-utils';
import { renderWithProviders, userEvent } from '../../test-utils';
import { IntegrationsTab } from '../../../src/pages/Settings/IntegrationsTab';
import { settingsService } from '../../../src/services/settings';

// Mock settingsService
vi.mock('../../../src/services/settings', () => ({
  settingsService: {
    getIntegrations: vi.fn(),
    saveRazorpayKey: vi.fn(),
    disconnectRazorpay: vi.fn(),
  },
}));

describe('IntegrationsTab component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockIntegrations = {
    razorpay: {
      isConfigured: true,
      lastValidationResult: 'valid',
      maskedKeyId: 'rzp_test_xxxxxx1234',
    },
  };

  it('renders configured details and triggers disconnect mutates', async () => {
    vi.mocked(settingsService.getIntegrations).mockResolvedValue(mockIntegrations as any);
    vi.mocked(settingsService.disconnectRazorpay).mockResolvedValue({} as any);

    renderWithProviders(<IntegrationsTab />);

    await waitFor(() => {
      expect(screen.getByText(/Key ID: •••••••••••1234/i)).toBeInTheDocument();
      expect(screen.getByText('Disconnect')).toBeInTheDocument();
    });

    const disconnectBtn = screen.getByText('Disconnect');
    await act(async () => {
      disconnectBtn.click();
    });

    expect(settingsService.disconnectRazorpay).toHaveBeenCalled();
  });

  it('renders input forms and triggers saveRazorpayKey on submit', async () => {
    vi.mocked(settingsService.getIntegrations).mockResolvedValue({ razorpay: { isConfigured: false } } as any);
    vi.mocked(settingsService.saveRazorpayKey).mockResolvedValue({ message: 'Saved' });

    renderWithProviders(<IntegrationsTab />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Connect Razorpay/i })).toBeInTheDocument();
    });

    // Enter details using placeholders and submit
    await userEvent.type(screen.getByPlaceholderText('rzp_live_xxxxxxxxxxxx'), 'new-id');
    await userEvent.type(screen.getByPlaceholderText('••••••••••••••••••••'), 'new-secret');
    await userEvent.type(screen.getByPlaceholderText('Your webhook secret'), 'new-webhook');

    const saveBtn = screen.getByRole('button', { name: /Connect Razorpay/i });
    await act(async () => {
      saveBtn.click();
    });

    expect(settingsService.saveRazorpayKey).toHaveBeenCalledWith({
      keyId: 'new-id',
      keySecret: 'new-secret',
      webhookSecret: 'new-webhook',
    });
  });
});

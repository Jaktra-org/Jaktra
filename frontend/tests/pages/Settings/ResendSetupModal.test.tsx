import React from 'react';
import { screen, act, waitFor } from '../../test-utils';
import { renderWithProviders, userEvent } from '../../test-utils';
import { ResendSetupModal } from '../../../src/pages/Settings/ResendSetupModal';
import { settingsService } from '../../../src/services/settings';
import type { ResendSetupProgress } from '../../../src/types/api';

vi.mock('../../../src/services/settings', () => ({
  settingsService: {
    saveResendKey: vi.fn(),
    testResendEmail: vi.fn(),
    setResendReplyMode: vi.fn(),
    sendResendReplyMailboxOtp: vi.fn(),
    verifyResendReplyMailboxOtp: vi.fn(),
    verifyResendInbound: vi.fn(),
    getResendHealth: vi.fn(),
  },
}));

describe('ResendSetupModal component', () => {
  const onCloseMock = vi.fn();
  const refetchMock = vi.fn().mockResolvedValue({});

  const unconfiguredProgress: ResendSetupProgress = {
    provider: 'resend',
    step1ApiKey: { isDone: false, hasApiKey: false, lastValidationResult: 'untested' },
    step2SenderAndMode: {
      isDone: false,
      status: 'not_started',
      senderName: null,
      senderEmail: null,
      replyTo: null,
      replyMode: 'webhook_only',
      replyMailboxEmail: null,
      replyMailboxVerified: false,
      requiresOtp: false,
    },
    step3InboundWebhook: {
      isDone: false,
      status: 'not_started',
      inboundDomain: null,
      webhookUrl: 'https://jaktra.com/api/webhooks/resend/inbound/token-123',
      resendSettingsUrl: 'https://resend.com/webhooks',
      isVerified: false,
    },
    overallStatus: 'not_configured',
    isActive: false,
  };

  const configuredProgress: ResendSetupProgress = {
    provider: 'resend',
    step1ApiKey: { isDone: true, hasApiKey: true, lastValidationResult: 'valid' },
    step2SenderAndMode: {
      isDone: true,
      status: 'completed',
      senderName: 'Acme Billing',
      senderEmail: 'billing@acme.com',
      replyTo: null,
      replyMode: 'webhook_only',
      replyMailboxEmail: null,
      replyMailboxVerified: false,
      requiresOtp: false,
    },
    step3InboundWebhook: {
      isDone: true,
      status: 'verified',
      inboundDomain: 'reply.acme.com',
      webhookUrl: 'https://jaktra.com/api/webhooks/resend/inbound/token-123',
      resendSettingsUrl: 'https://resend.com/webhooks',
      isVerified: true,
    },
    overallStatus: 'active',
    isActive: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Step 1 API key input when unconfigured', () => {
    renderWithProviders(
      <ResendSetupModal
        isOpen={true}
        onClose={onCloseMock}
        resendProgress={unconfiguredProgress}
        refetch={refetchMock}
      />
    );

    expect(screen.getByText('Resend Setup')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('re_123456789_abcdefg')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save & Next/i })).toBeInTheDocument();
  });

  it('validates API key prefix requiring "re_"', async () => {
    renderWithProviders(
      <ResendSetupModal
        isOpen={true}
        onClose={onCloseMock}
        resendProgress={unconfiguredProgress}
        refetch={refetchMock}
      />
    );

    const keyInput = screen.getByPlaceholderText('re_123456789_abcdefg');
    await userEvent.type(keyInput, 'invalid_key');

    const submitBtn = screen.getByRole('button', { name: /Save & Next/i });
    await act(async () => {
      submitBtn.click();
    });

    expect(screen.getByText(/Resend API keys must start with "re_"/i)).toBeInTheDocument();
    expect(settingsService.saveResendKey).not.toHaveBeenCalled();
  });

  it('submits valid API key and triggers refetch and advance', async () => {
    vi.mocked(settingsService.saveResendKey).mockResolvedValue({ message: 'Saved successfully' });

    renderWithProviders(
      <ResendSetupModal
        isOpen={true}
        onClose={onCloseMock}
        resendProgress={unconfiguredProgress}
        refetch={refetchMock}
      />
    );

    const keyInput = screen.getByPlaceholderText('re_123456789_abcdefg');
    await userEvent.type(keyInput, 're_123456789_abcdefg');

    const submitBtn = screen.getByRole('button', { name: /Save & Next/i });
    await act(async () => {
      submitBtn.click();
    });

    await waitFor(() => {
      expect(settingsService.saveResendKey).toHaveBeenCalledWith({ apiKey: 're_123456789_abcdefg' });
      expect(refetchMock).toHaveBeenCalled();
    });
  });

  it('displays insufficient access error when API key lacks full access', async () => {
    vi.mocked(settingsService.saveResendKey).mockRejectedValueOnce(
      new Error('The Resend API key lacks full access permissions. Please create and provide an API key with "Full access".')
    );

    renderWithProviders(
      <ResendSetupModal
        isOpen={true}
        onClose={onCloseMock}
        resendProgress={unconfiguredProgress}
        refetch={refetchMock}
      />
    );

    const keyInput = screen.getByPlaceholderText('re_123456789_abcdefg');
    await userEvent.type(keyInput, 're_restricted_key_123');

    const submitBtn = screen.getByRole('button', { name: /Save & Next/i });
    await act(async () => {
      submitBtn.click();
    });

    await waitFor(() => {
      expect(screen.getByText(/lacks full access permissions/i)).toBeInTheDocument();
    });
  });

  it('renders Step 3 Inbound Webhook verification when configured and on Step 3', () => {
    renderWithProviders(
      <ResendSetupModal
        isOpen={true}
        onClose={onCloseMock}
        resendProgress={configuredProgress}
        refetch={refetchMock}
      />
    );

    expect(screen.getByText('Inbound Domain & Webhook')).toBeInTheDocument();
    expect(screen.getByText('reply.acme.com')).toBeInTheDocument();
    expect(screen.getByText('DNS MX record verified and inbound webhook active.')).toBeInTheDocument();
  });
});

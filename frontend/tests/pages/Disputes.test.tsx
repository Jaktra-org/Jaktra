import React from 'react';
import { screen, act, waitFor } from '../test-utils';
import { renderWithProviders } from '../test-utils';
import { Disputes } from '../../src/pages/Disputes';
import { disputeService } from '../../src/services/dispute';
import { settingsService } from '../../src/services/settings';

// Mock services
vi.mock('../../src/services/dispute', () => ({
  disputeService: {
    getPendingDisputes: vi.fn(),
    approveDispute: vi.fn(),
    discardDispute: vi.fn(),
  },
}));

vi.mock('../../src/services/settings', () => ({
  settingsService: {
    getInboundVerificationStatus: vi.fn(),
    startInboundVerificationTest: vi.fn(),
  },
}));

describe('Disputes page reviews and actions', () => {
  const mockDisputes = {
    data: [
      {
        id: 'disp-1',
        tenantId: 't1',
        invoiceId: 'inv-1',
        sender: 'client@company.com',
        subject: 'Invoice dispute',
        body: 'I disagree with this charge.',
        classification: 'dispute' as const,
        confidence: 0.95,
        suggestedResponse: 'We will investigate the charge.',
        reasoning: 'AI generated response',
        status: 'pending_review' as const,
        createdAt: '2026-07-12T00:00:00.000Z',
        invoiceNo: 'INV-101',
        clientName: 'Client Alpha',
      },
    ],
    pagination: {
      total: 1,
      page: 1,
      limit: 25,
      totalPages: 1,
    },
  };

  const mockInboundStatus = {
    defaultEmailProvider: 'smtp',
    dnsVerifiedAt: '2026-07-01T00:00:00.000Z',
    hasRealCapture: true,
    latestTest: null,
    inboundParseDomain: 'parse.jaktra.com',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders pending review list and expands details', async () => {
    vi.mocked(disputeService.getPendingDisputes).mockResolvedValue(mockDisputes);
    vi.mocked(settingsService.getInboundVerificationStatus).mockResolvedValue(mockInboundStatus);

    renderWithProviders(<Disputes />);

    await waitFor(() => {
      const emailEl = screen.getByText(/client@company.com/i);
      const container = emailEl.closest('.bg-white');
      const link = container?.querySelector('a');
      expect(link).toBeInTheDocument();
      expect(link?.textContent).toContain('INV-101');
      expect(screen.getByText('Dispute')).toBeInTheDocument();
    });

    // Body text initially collapsed
    expect(screen.queryByText('I disagree with this charge.')).not.toBeInTheDocument();

    // Click sender email to expand card (invoice number stops propagation)
    const clientEmail = screen.getByText(/client@company.com/i);
    await act(async () => {
      clientEmail.click();
    });

    // Details visible
    expect(screen.getByText('I disagree with this charge.')).toBeInTheDocument();
    expect(screen.getByText('AI generated response')).toBeInTheDocument();
  });

  it('triggers approve and discard actions successfully', async () => {
    vi.mocked(disputeService.getPendingDisputes).mockResolvedValue(mockDisputes);
    vi.mocked(settingsService.getInboundVerificationStatus).mockResolvedValue(mockInboundStatus);
    vi.mocked(disputeService.approveDispute).mockResolvedValue(undefined);
    vi.mocked(disputeService.discardDispute).mockResolvedValue(undefined);

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    renderWithProviders(<Disputes />);

    // Expand
    await waitFor(() => {
      const emailEl = screen.getByText(/client@company.com/i);
      const container = emailEl.closest('.bg-white');
      const link = container?.querySelector('a');
      expect(link).toBeInTheDocument();
      expect(link?.textContent).toContain('INV-101');
    });
    const clientEmail = screen.getByText(/client@company.com/i);
    await act(async () => {
      clientEmail.click();
    });

    // Click Direct Approve
    const approveBtn = screen.getByRole('button', { name: /Approve & Send/i });
    await act(async () => {
      approveBtn.click();
    });

    expect(disputeService.approveDispute).toHaveBeenCalledWith('disp-1', 'We will investigate the charge.');

    // Re-expand card to make Discard button available again
    await act(async () => {
      clientEmail.click();
    });

    // Click Discard
    const discardBtn = screen.getByRole('button', { name: /Discard/i });
    await act(async () => {
      discardBtn.click();
    });

    expect(confirmSpy).toHaveBeenCalled();
    expect(disputeService.discardDispute).toHaveBeenCalledWith('disp-1', expect.anything());

    confirmSpy.mockRestore();
  });
});

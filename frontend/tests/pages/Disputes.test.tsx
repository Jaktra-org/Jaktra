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
    inboundParseDomain: 'parse.jaktra.site',
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

    // 1-line summary is visible in header preview, AI reasoning initially collapsed
    expect(screen.getByText('I disagree with this charge.')).toBeInTheDocument();
    expect(screen.queryByText('AI generated response')).not.toBeInTheDocument();

    // Click sender email to expand card (invoice number stops propagation)
    const clientEmail = screen.getByText(/client@company.com/i);
    await act(async () => {
      clientEmail.click();
    });

    // Suggested reply visible when expanded
    expect(screen.getByText('We will investigate the charge.')).toBeInTheDocument();
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

    // Click Discard
    const discardBtn = screen.getByRole('button', { name: /Discard/i });
    await act(async () => {
      discardBtn.click();
    });

    expect(confirmSpy).toHaveBeenCalled();
    expect(disputeService.discardDispute).toHaveBeenCalledWith('disp-1', expect.anything());

    confirmSpy.mockRestore();
  });

  it('filters by category tags and groups multiple replies for same invoice in single box', async () => {
    const multiDisputes = {
      data: [
        {
          id: 'disp-1',
          tenantId: 't1',
          invoiceId: 'inv-108',
          sender: 'suresh@company.com',
          subject: 'Dispute invoice 108',
          body: 'Wrong total amount',
          classification: 'dispute' as const,
          confidence: 0.9,
          suggestedResponse: 'Checking total.',
          reasoning: 'Dispute',
          status: 'pending_review' as const,
          createdAt: '2026-07-28T10:00:00.000Z',
          invoiceNo: 'INV-108',
          clientName: 'Quantum Analytics',
        },
        {
          id: 'disp-2',
          tenantId: 't1',
          invoiceId: 'inv-108',
          sender: 'suresh@company.com',
          subject: 'Question on invoice 108',
          body: 'Send payment link',
          classification: 'question' as const,
          confidence: 0.8,
          suggestedResponse: 'Here is your link.',
          reasoning: 'Question',
          status: 'pending_review' as const,
          createdAt: '2026-07-30T11:00:00.000Z',
          invoiceNo: 'INV-108',
          clientName: 'Quantum Analytics',
        },
      ],
      pagination: { total: 2, page: 1, limit: 25, totalPages: 1 },
    };

    vi.mocked(disputeService.getPendingDisputes).mockResolvedValue(multiDisputes);
    vi.mocked(settingsService.getInboundVerificationStatus).mockResolvedValue(mockInboundStatus);

    renderWithProviders(<Disputes />);

    await waitFor(() => {
      // Conf badge should NOT be rendered
      expect(screen.queryByText(/Conf:/i)).not.toBeInTheDocument();
      // Both Dispute and Question badges rendered on the grouped box header
      expect(screen.getByText('Dispute')).toBeInTheDocument();
      expect(screen.getByText('Question')).toBeInTheDocument();
      expect(screen.getByText('2 Replies')).toBeInTheDocument();
    });

    // Expand group
    const sender = screen.getByText(/suresh@company.com/i);
    await act(async () => {
      sender.click();
    });

    // Both bodies rendered inside single expanded box
    expect(screen.getAllByText('Wrong total amount').length).toBeGreaterThan(0);
    expect(screen.getByText('Send payment link')).toBeInTheDocument();

    // Click Questions tag filter
    const questionTab = screen.getByRole('button', { name: /Questions/i });
    await act(async () => {
      questionTab.click();
    });

    // Only 1 item shown under Questions
    expect(screen.getByText('Pending Items (1)')).toBeInTheDocument();
  });
});


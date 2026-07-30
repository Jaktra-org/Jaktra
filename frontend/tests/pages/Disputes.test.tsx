import React from 'react';
import { screen, act, waitFor } from '../test-utils';
import { renderWithProviders } from '../test-utils';
import { Disputes } from '../../src/pages/Disputes';
import { disputeService } from '../../src/services/dispute';

// Mock services
vi.mock('../../src/services/dispute', () => ({
  disputeService: {
    getDisputes: vi.fn(),
    getPendingDisputes: vi.fn(),
    sendReply: vi.fn(),
    updateStatus: vi.fn(),
    approveDispute: vi.fn(),
    discardDispute: vi.fn(),
    generateDraft: vi.fn(),
  },
}));

describe('Disputes page status tabs, navigation, and actions', () => {
  const mockDisputesResponse = {
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
        reasoning: 'Customer disputes invoice amount.',
        aiSummary: 'Customer disagrees with invoice charge.',
        status: 'pending' as const,
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
    statusCounts: {
      pending: 1,
      resolved: 0,
      archived: 0,
    },
    categoryCounts: {
      all: 1,
      dispute: 1,
      question: 0,
      payment_promise: 0,
      unclear: 0,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders status navigation tabs and expands details', async () => {
    vi.mocked(disputeService.getDisputes).mockResolvedValue(mockDisputesResponse);

    renderWithProviders(<Disputes />);

    await waitFor(() => {
      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getByText('Resolved')).toBeInTheDocument();
      expect(screen.getByText('Archived')).toBeInTheDocument();
      expect(screen.getByText(/client@company.com/i)).toBeInTheDocument();
    });

    expect(screen.getByText('Customer disagrees with invoice charge.')).toBeInTheDocument();

    const clientEmail = screen.getByText(/client@company.com/i);
    await act(async () => {
      clientEmail.click();
    });

    expect(screen.getByText('We will investigate the charge.')).toBeInTheDocument();
  });

  it('triggers sendReply and updateStatus actions successfully', async () => {
    vi.mocked(disputeService.getDisputes).mockResolvedValue(mockDisputesResponse);
    vi.mocked(disputeService.sendReply).mockResolvedValue(undefined);
    vi.mocked(disputeService.updateStatus).mockResolvedValue(undefined);

    renderWithProviders(<Disputes />);

    await waitFor(() => {
      expect(screen.getByText(/client@company.com/i)).toBeInTheDocument();
    });

    const clientEmail = screen.getByText(/client@company.com/i);
    await act(async () => {
      clientEmail.click();
    });

    // Click Send Reply
    const sendBtn = screen.getByRole('button', { name: /Send Reply/i });
    await act(async () => {
      sendBtn.click();
    });

    expect(disputeService.sendReply).toHaveBeenCalledWith('disp-1', 'We will investigate the charge.');

    // Click Mark Resolved
    const resolveBtn = screen.getByRole('button', { name: /Mark Resolved/i });
    await act(async () => {
      resolveBtn.click();
    });

    expect(disputeService.updateStatus).toHaveBeenCalledWith('disp-1', 'resolved');

    // Click Archive
    const archiveBtn = screen.getByRole('button', { name: /^Archive$/i });
    await act(async () => {
      archiveBtn.click();
    });

    expect(disputeService.updateStatus).toHaveBeenCalledWith('disp-1', 'archived');
  });

  it('autofills instruction on chip click and triggers generateDraft', async () => {
    const unResponseDispute = {
      ...mockDisputesResponse,
      data: [
        {
          id: 'disp-99',
          tenantId: 't1',
          invoiceId: 'inv-99',
          sender: 'customer@acme.com',
          subject: 'Need invoice details',
          body: 'Is the invoice amount correct?',
          classification: 'question' as const,
          confidence: 0.9,
          suggestedResponse: '',
          reasoning: 'Question',
          status: 'pending' as const,
          createdAt: '2026-07-30T10:00:00.000Z',
          invoiceNo: 'INV-99',
          clientName: 'Acme',
        },
      ],
    };

    vi.mocked(disputeService.getDisputes).mockResolvedValue(unResponseDispute);
    vi.mocked(disputeService.generateDraft).mockResolvedValue({ suggestedResponse: 'Dear Customer, Amount is correct.' });

    renderWithProviders(<Disputes />);

    await waitFor(() => {
      expect(screen.getByText(/customer@acme.com/i)).toBeInTheDocument();
    });

    const sender = screen.getByText(/customer@acme.com/i);
    await act(async () => {
      sender.click();
    });

    const chipBtn = screen.getByText('Send online payment portal link');
    await act(async () => {
      chipBtn.click();
    });

    const input = screen.getByPlaceholderText(/e\.g\., You can pay online via portal link/i) as HTMLInputElement;
    expect(input.value).toBe('Send online payment portal link');

    const genBtn = screen.getByRole('button', { name: /Generate Draft Response/i });
    await act(async () => {
      genBtn.click();
    });

    expect(disputeService.generateDraft).toHaveBeenCalledWith('disp-99', 'Send online payment portal link');
  });

  it('suggests dispute-specific chips when classification is dispute', async () => {
    const disputeItem = {
      ...mockDisputesResponse,
      data: [
        {
          id: 'disp-100',
          tenantId: 't1',
          invoiceId: 'inv-100',
          sender: 'disputer@client.com',
          subject: 'Wrong invoice total',
          body: 'The price is wrong.',
          classification: 'dispute' as const,
          confidence: 0.9,
          suggestedResponse: '',
          reasoning: 'Dispute',
          status: 'pending' as const,
          createdAt: '2026-07-30T10:00:00.000Z',
          invoiceNo: 'INV-100',
          clientName: 'Dispute Client',
        },
      ],
    };

    vi.mocked(disputeService.getDisputes).mockResolvedValue(disputeItem);

    renderWithProviders(<Disputes />);

    await waitFor(() => {
      expect(screen.getByText(/disputer@client.com/i)).toBeInTheDocument();
    });

    const sender = screen.getByText(/disputer@client.com/i);
    await act(async () => {
      sender.click();
    });

    expect(screen.getByText('Amount is correct')).toBeInTheDocument();
    expect(screen.getByText('Service delivered in full')).toBeInTheDocument();
    expect(screen.getByText('Offer 5% discount if paid today')).toBeInTheDocument();
  });
});

import React from 'react';
import { screen, act } from '../../test-utils';
import { renderWithProviders } from '../../test-utils';
import { TriggerFollowupModal } from '../../../src/components/invoices/TriggerFollowupModal';

describe('TriggerFollowupModal component', () => {
  const mockInvoice = {
    id: 'inv-1',
    invoiceNo: 'INV-1',
    clientName: 'Client 1',
    invoiceAmount: 1000,
    dueDate: '2026-08-10T00:00:00.000Z',
    paymentStatus: 'Pending' as const,
    followupCount: 0,
    createdAt: '2026-07-01T00:00:00.000Z',
    updatedAt: '2026-07-01T00:00:00.000Z',
    paymentLink: null,
    urgencyTier: 'stage_1_warm' as const,
    daysOverdue: 0,
  };

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    invoice: mockInvoice,
    isPending: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders recommendation status when urgencyTier is set and valid', () => {
    renderWithProviders(<TriggerFollowupModal {...defaultProps} />);

    expect(screen.getByText('Triage Engine Recommendation')).toBeInTheDocument();
    expect(screen.getAllByText('Warm (Stage 1)').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /Send Follow-up/i })).toBeEnabled();
  });

  it('displays reason text when no recommended tone exists', () => {
    const noRecInvoice = {
      ...mockInvoice,
      urgencyTier: undefined,
      paymentStatus: 'Paid' as const,
    };

    renderWithProviders(<TriggerFollowupModal {...defaultProps} invoice={noRecInvoice} />);

    expect(screen.getByText('No Recommended Tone')).toBeInTheDocument();
    expect(screen.getByText('(Invoice is already paid).')).toBeInTheDocument();
    // Since no recommended tone, confirmation button is disabled initially
    expect(screen.getByRole('button', { name: /Send Follow-up/i })).toBeDisabled();
  });

  it('calls onConfirm callback on form submission with selected tone', async () => {
    renderWithProviders(<TriggerFollowupModal {...defaultProps} />);

    const submitBtn = screen.getByRole('button', { name: /Send Follow-up/i });
    await act(async () => {
      submitBtn.click();
    });

    expect(defaultProps.onConfirm).toHaveBeenCalledWith('stage_1_warm');
  });
});

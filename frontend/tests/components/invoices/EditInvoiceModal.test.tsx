import React from 'react';
import { screen, act } from '../../test-utils';
import { renderWithProviders, userEvent } from '../../test-utils';
import { EditInvoiceModal } from '../../../src/components/invoices/EditInvoiceModal';
import { invoiceService } from '../../../src/services/invoice';

// Mock invoiceService
vi.mock('../../../src/services/invoice', () => ({
  invoiceService: {
    updateInvoice: vi.fn(),
  },
}));

describe('EditInvoiceModal component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockInvoice = {
    id: 'inv-123',
    invoiceNo: 'INV-101',
    clientName: 'Original Client',
    invoiceAmount: 2500,
    dueDate: '2026-08-10T00:00:00.000Z',
    contactEmail: 'client@example.com',
    subject: 'Original Subject',
    paymentStatus: 'Pending' as const,
    followupCount: 0,
    createdAt: '2026-07-01T00:00:00.000Z',
    updatedAt: '2026-07-01T00:00:00.000Z',
    paymentLink: null,
  };

  it('renders with pre-filled inputs from the invoice prop', () => {
    renderWithProviders(<EditInvoiceModal isOpen={true} onClose={() => {}} invoice={mockInvoice} />);

    expect(screen.getByLabelText(/Client Name/i)).toHaveValue('Original Client');
    expect(screen.getByLabelText(/Amount/i)).toHaveValue(2500);
    expect(screen.getByLabelText(/Due Date/i)).toHaveValue('2026-08-10');
    expect(screen.getByLabelText(/Contact Email/i)).toHaveValue('client@example.com');
    expect(screen.getByLabelText(/Invoice Description/i)).toHaveValue('Original Subject');
  });

  it('submits correctly structured patch payload on form submit', async () => {
    vi.mocked(invoiceService.updateInvoice).mockResolvedValue({} as any);

    renderWithProviders(<EditInvoiceModal isOpen={true} onClose={() => {}} invoice={mockInvoice} />);

    // Modify client name and amount
    const clientNameInput = screen.getByLabelText(/Client Name/i);
    await userEvent.clear(clientNameInput);
    await userEvent.type(clientNameInput, 'Updated Client Name');

    const amountInput = screen.getByLabelText(/Amount/i);
    await userEvent.clear(amountInput);
    await userEvent.type(amountInput, '3200.50');

    const saveBtn = screen.getByRole('button', { name: /Save Changes/i });
    await act(async () => {
      saveBtn.click();
    });

    expect(invoiceService.updateInvoice).toHaveBeenCalledWith('inv-123', {
      clientName: 'Updated Client Name',
      invoiceAmount: 3200.50,
      dueDate: '2026-08-10',
      contactEmail: 'client@example.com',
      subject: 'Original Subject',
    });
  });

  it('resets form state when input invoice prop changes', () => {
    const { rerender } = renderWithProviders(
      <EditInvoiceModal isOpen={true} onClose={() => {}} invoice={mockInvoice} />
    );

    expect(screen.getByLabelText(/Client Name/i)).toHaveValue('Original Client');

    const nextInvoice = {
      ...mockInvoice,
      id: 'inv-123',
      clientName: 'Next Client Name',
      updatedAt: '2026-07-02T00:00:00.000Z',
    };

    rerender(
      <EditInvoiceModal isOpen={true} onClose={() => {}} invoice={nextInvoice} />
    );

    expect(screen.getByLabelText(/Client Name/i)).toHaveValue('Next Client Name');
  });
});

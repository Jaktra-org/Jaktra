import React from 'react';
import { screen, act, waitFor, fireEvent } from '../../test-utils';
import { renderWithProviders, userEvent } from '../../test-utils';
import { CreateInvoiceModal } from '../../../src/components/invoices/CreateInvoiceModal';
import { invoiceService } from '../../../src/services/invoice';

// Mock invoiceService
vi.mock('../../../src/services/invoice', () => ({
  invoiceService: {
    createInvoice: vi.fn(),
  },
}));

describe('CreateInvoiceModal component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('validates required fields before form submission', async () => {
    renderWithProviders(<CreateInvoiceModal isOpen={true} onClose={() => {}} />);

    const form = screen.getByRole('button', { name: /Save Invoice/i }).closest('form')!;
    
    // Attempt form submit without entering data
    await act(async () => {
      fireEvent.submit(form);
    });

    // Check validation error message
    expect(screen.getByText('Please fill out all fields.')).toBeInTheDocument();
    expect(invoiceService.createInvoice).not.toHaveBeenCalled();
  });

  it('submits correctly structured payload on valid form data entry', async () => {
    vi.mocked(invoiceService.createInvoice).mockResolvedValue({} as any);

    renderWithProviders(<CreateInvoiceModal isOpen={true} onClose={() => {}} />);

    // Fill form fields
    await userEvent.type(screen.getByLabelText(/Invoice Number/i), 'INV-999');
    await userEvent.type(screen.getByLabelText(/Client Name/i), 'Acme Client');
    await userEvent.type(screen.getByLabelText(/Amount/i), '4500.75');
    await userEvent.type(screen.getByLabelText(/Due Date/i), '2026-08-15');
    await userEvent.type(screen.getByLabelText(/Contact Email/i), 'acme@example.com');
    await userEvent.type(screen.getByLabelText(/Invoice Description/i), '   Invoice Followup   ');

    const form = screen.getByRole('button', { name: /Save Invoice/i }).closest('form')!;
    await act(async () => {
      fireEvent.submit(form);
    });

    expect(invoiceService.createInvoice).toHaveBeenCalledWith({
      invoiceNo: 'INV-999',
      clientName: 'Acme Client',
      invoiceAmount: 4500.75, // float parsed amount!
      dueDate: '2026-08-15',
      contactEmail: 'acme@example.com',
      subject: 'Invoice Followup', // trimmed subject string!
    });
  });

  it('renders server-side error messages from mutate responses', async () => {
    vi.mocked(invoiceService.createInvoice).mockRejectedValue({
      isAxiosError: true,
      response: { data: { error: { message: 'Invoice number already exists' } } },
    });

    renderWithProviders(<CreateInvoiceModal isOpen={true} onClose={() => {}} />);

    // Fill minimum fields
    await userEvent.type(screen.getByLabelText(/Invoice Number/i), 'INV-999');
    await userEvent.type(screen.getByLabelText(/Client Name/i), 'Acme Client');
    await userEvent.type(screen.getByLabelText(/Amount/i), '4500');
    await userEvent.type(screen.getByLabelText(/Due Date/i), '2026-08-15');
    await userEvent.type(screen.getByLabelText(/Contact Email/i), 'acme@example.com');

    const form = screen.getByRole('button', { name: /Save Invoice/i }).closest('form')!;
    await act(async () => {
      fireEvent.submit(form);
    });

    await waitFor(() => {
      expect(screen.getByText('Record already exists')).toBeInTheDocument();
    });
  });
});

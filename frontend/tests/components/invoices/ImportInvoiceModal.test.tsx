import React from 'react';
import { screen, act, waitFor } from '../../test-utils';
import { renderWithProviders } from '../../test-utils';
import { ImportInvoiceModal } from '../../../src/components/invoices/ImportInvoiceModal';
import { invoiceService } from '../../../src/services/invoice';
import Papa from 'papaparse';

// Mock invoiceService
vi.mock('../../../src/services/invoice', () => ({
  invoiceService: {
    importInvoices: vi.fn(),
  },
}));

// Mock PapaParse
vi.mock('papaparse', () => ({
  default: {
    parse: vi.fn(),
  },
}));

describe('ImportInvoiceModal component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal description when open and file is not selected', () => {
    renderWithProviders(<ImportInvoiceModal isOpen={true} onClose={() => {}} />);
    expect(screen.getByText('Upload a CSV or Excel file containing your invoices.')).toBeInTheDocument();
  });

  it('displays validation error if files other than CSV/Excel are dragged or selected', async () => {
    const { container } = renderWithProviders(<ImportInvoiceModal isOpen={true} onClose={() => {}} />);

    const fileInput = container.querySelector('#csv-upload') as HTMLInputElement;
    const file = new File(['dummy content'], 'document.pdf', { type: 'application/pdf' });

    await act(async () => {
      Object.defineProperty(fileInput, 'files', {
        value: [file],
      });
      const changeEvent = new Event('change', { bubbles: true });
      fileInput.dispatchEvent(changeEvent);
    });

    expect(screen.getByText('Only CSV and Excel (.xlsx, .xls) files are supported.')).toBeInTheDocument();
  });

  it('previews parsed CSV rows using mocked PapaParse', async () => {
    const file = new File(['invoice_no,client_name\nINV-01,Test Client'], 'invoices.csv', { type: 'text/csv' });

    vi.mocked(Papa.parse).mockImplementation((fileObj, config: any) => {
      config.complete({
        meta: { fields: ['invoice_no', 'client_name', 'invoice_amount', 'due_date', 'contact_email'] },
        data: [
          { invoice_no: 'INV-1', client_name: 'Client One', invoice_amount: '120.00', due_date: '2026-08-10', contact_email: 'c1@ex.com' },
          { invoice_no: 'INV-2', client_name: 'Client Two', invoice_amount: '450.00', due_date: '2026-08-15', contact_email: 'c2@ex.com' },
        ],
      });
    });

    const { container } = renderWithProviders(<ImportInvoiceModal isOpen={true} onClose={() => {}} />);

    const fileInput = container.querySelector('#csv-upload') as HTMLInputElement;

    await act(async () => {
      Object.defineProperty(fileInput, 'files', {
        value: [file],
      });
      fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    });

    // Check preview data shows up in render tables
    expect(screen.getByText('Client One')).toBeInTheDocument();
    expect(screen.getByText('Client Two')).toBeInTheDocument();
  });

  it('submits import payload with correct conflict strategies and files', async () => {
    const file = new File(['dummy csv content'], 'invoices.csv', { type: 'text/csv' });
    vi.mocked(Papa.parse).mockImplementation((fileObj, config: any) => {
      config.complete({
        meta: { fields: ['invoice_no'] },
        data: [{ invoice_no: 'INV-1' }],
      });
    });

    // Resolve successfully with mock import stats
    vi.mocked(invoiceService.importInvoices).mockResolvedValue({
      imported: 3,
      updated: 1,
      skipped: 0,
      errors: [],
    });

    const { container } = renderWithProviders(<ImportInvoiceModal isOpen={true} onClose={() => {}} />);

    const fileInput = container.querySelector('#csv-upload') as HTMLInputElement;

    await act(async () => {
      Object.defineProperty(fileInput, 'files', {
        value: [file],
      });
      fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    });

    // Toggle strategy and submit
    const strategyRadio = screen.getByLabelText(/Update existing records/i);
    await act(async () => {
      strategyRadio.click();
    });

    const submitBtn = screen.getByRole('button', { name: /Upload and Process/i });
    await act(async () => {
      submitBtn.click();
    });

    expect(invoiceService.importInvoices).toHaveBeenCalledWith(file, 'update');
    
    // Shows final complete layout
    await waitFor(() => {
      expect(screen.getByText('Import Complete')).toBeInTheDocument();
      expect(screen.getByText('Imported')).toBeInTheDocument();
    });
  });

  it('renders partial failure/error reports from backend response correctly', async () => {
    const file = new File(['dummy csv content'], 'invoices.csv', { type: 'text/csv' });
    vi.mocked(Papa.parse).mockImplementation((fileObj, config: any) => {
      config.complete({
        meta: { fields: ['invoice_no'] },
        data: [{ invoice_no: 'INV-1' }],
      });
    });

    vi.mocked(invoiceService.importInvoices).mockResolvedValue({
      imported: 0,
      updated: 0,
      skipped: 0,
      errors: [{ row: 2, error: 'Database Conflict error' }],
    });

    const { container } = renderWithProviders(<ImportInvoiceModal isOpen={true} onClose={() => {}} />);

    const fileInput = container.querySelector('#csv-upload') as HTMLInputElement;

    await act(async () => {
      Object.defineProperty(fileInput, 'files', {
        value: [file],
      });
      fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    });

    const submitBtn = screen.getByRole('button', { name: /Upload and Process/i });
    await act(async () => {
      submitBtn.click();
    });

    await waitFor(() => {
      expect(screen.getByText('Errors (1)')).toBeInTheDocument();
      expect(screen.getByText('Database Conflict error')).toBeInTheDocument();
    });
  });
});

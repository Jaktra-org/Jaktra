import { invoiceService } from '../../src/services/invoice';
import { api } from '../../src/services/api';

vi.mock('../../src/services/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('invoiceService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls correct API endpoints for invoice operations', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: {} });
    vi.mocked(api.post).mockResolvedValue({ data: {} });
    vi.mocked(api.patch).mockResolvedValue({ data: {} });
    vi.mocked(api.delete).mockResolvedValue({ data: {} });

    await invoiceService.getInvoices({ status: ['Pending', 'Paid'], page: 1 });
    expect(api.get).toHaveBeenCalledWith('/invoices', {
      params: { status: 'Pending,Paid', page: 1 },
    });

    await invoiceService.createInvoice({ invoiceNo: 'INV-1' } as any);
    expect(api.post).toHaveBeenCalledWith('/invoices', { invoiceNo: 'INV-1' });

    await invoiceService.getInvoice('inv-id');
    expect(api.get).toHaveBeenCalledWith('/invoices/inv-id');

    await invoiceService.updateInvoice('inv-id', { clientName: 'New name' });
    expect(api.patch).toHaveBeenCalledWith('/invoices/inv-id', { clientName: 'New name' });

    await invoiceService.updateInvoiceStatus('inv-id', 'Paid');
    expect(api.patch).toHaveBeenCalledWith('/invoices/inv-id/status', { paymentStatus: 'Paid' });

    const file = new File(['csv'], 'file.csv');
    await invoiceService.importInvoices(file, 'skip');
    expect(api.post).toHaveBeenCalledWith('/invoices/import?on_duplicate=skip', expect.any(FormData), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    await invoiceService.generatePaymentLink('inv-id');
    expect(api.post).toHaveBeenCalledWith('/invoices/inv-id/payment-link');

    await invoiceService.deleteInvoice('inv-id');
    expect(api.delete).toHaveBeenCalledWith('/invoices/inv-id');

    await invoiceService.getTrashedInvoices();
    expect(api.get).toHaveBeenCalledWith('/invoices/trash', { params: {} });

    await invoiceService.hardDeleteInvoice('inv-id');
    expect(api.delete).toHaveBeenCalledWith('/invoices/inv-id/permanent');

    await invoiceService.restoreInvoice('inv-id');
    expect(api.post).toHaveBeenCalledWith('/invoices/inv-id/restore');

    await invoiceService.getTrashedInvoice('inv-id');
    expect(api.get).toHaveBeenCalledWith('/invoices/inv-id/trashed');
  });
});

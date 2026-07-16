import { screen, act, waitFor, fireEvent } from '../test-utils';
import { renderWithProviders } from '../test-utils';
import { Invoices } from '../../src/pages/Invoices';
import { invoiceService } from '../../src/services/invoice';

// Mock invoiceService
vi.mock('../../src/services/invoice', () => ({
  invoiceService: {
    getInvoices: vi.fn(),
    getTrashedInvoices: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const original = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...original,
    useNavigate: () => mockNavigate,
  };
});

describe('Invoices list page', () => {
  const mockInvoicesRes = {
    invoices: [
      {
        id: 'inv-1',
        invoiceNo: 'INV-101',
        clientName: 'Client Alpha',
        invoiceAmount: 2000,
        dueDate: '2026-08-10T00:00:00.000Z',
        paymentStatus: 'Pending' as const,
        contactEmail: 'a@c.com',
        followupCount: 0,
        createdAt: '2026-07-01T00:00:00.000Z',
      },
    ],
    pagination: {
      total: 1,
      page: 1,
      limit: 50,
      totalPages: 1,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('performs debounced query requests when the user types in the search input box', async () => {
    vi.useFakeTimers();

    vi.mocked(invoiceService.getInvoices).mockResolvedValue(mockInvoicesRes);

    renderWithProviders(<Invoices />);

    // Initially fetches with empty search query
    expect(invoiceService.getInvoices).toHaveBeenLastCalledWith({
      page: 1,
      limit: 50,
      sort_by: 'createdAt',
      order: 'desc',
    });

    const searchInput = screen.getByPlaceholderText(/Search clients.../i);
    
    // Trigger input change
    act(() => {
      fireEvent.change(searchInput, { target: { value: 'Client Alpha' } });
    });

    // Immediate check -> search query should NOT have been updated in request parameters yet
    expect(invoiceService.getInvoices).not.toHaveBeenLastCalledWith(
      expect.objectContaining({ client_name: 'Client Alpha' })
    );

    // Fast-forward 500ms debounce timer
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Request parameters should now be synced with input query
    expect(invoiceService.getInvoices).toHaveBeenLastCalledWith(
      expect.objectContaining({ client_name: 'Client Alpha' })
    );

    vi.useRealTimers();
  });

  it('updates query params when page buttons or sort headers are clicked', async () => {
    vi.mocked(invoiceService.getInvoices).mockResolvedValue({
      invoices: [],
      pagination: {
        total: 100,
        page: 1,
        limit: 50,
        totalPages: 2,
      },
    });

    renderWithProviders(<Invoices />);

    // Click next page
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Next page/i })).toBeEnabled();
    });

    const nextPageBtn = screen.getByRole('button', { name: /Next page/i });
    await act(async () => {
      nextPageBtn.click();
    });

    // Verifies requested page updates to 2
    expect(invoiceService.getInvoices).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 2 })
    );
  });
});

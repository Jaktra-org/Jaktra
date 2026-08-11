import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { screen, act, waitFor } from '../test-utils';
import { renderWithProviders } from '../test-utils';
import { InvoiceDetail } from '../../src/pages/InvoiceDetail';
import { invoiceService } from '../../src/services/invoice';
import { eventService } from '../../src/services/event';
import { communicationService } from '../../src/services/communication';

// Mock services
vi.mock('../../src/services/invoice', () => ({
  invoiceService: {
    getInvoice: vi.fn(),
    restoreInvoice: vi.fn(),
    hardDeleteInvoice: vi.fn(),
  },
}));

vi.mock('../../src/services/event', () => ({
  eventService: {
    getInvoiceTimeline: vi.fn(),
  },
}));

vi.mock('../../src/services/communication', () => ({
  communicationService: {
    getInvoiceCommunications: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const original = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...original,
    useParams: () => ({ id: 'inv-456' }),
    useNavigate: () => mockNavigate,
    Link: ({ children, to }: any) => <a href={to}>{children}</a>,
  };
});

describe('Trashed Invoice rendering in InvoiceDetail', () => {
  const mockInvoice = {
    id: 'inv-456',
    invoiceNo: 'INV-TRASH',
    clientName: 'Trashed Client',
    invoiceAmount: 500,
    dueDate: '2026-08-10T00:00:00.000Z',
    paymentStatus: 'Pending' as const,
    contactEmail: 't@c.com',
    followupCount: 0,
    createdAt: '2026-07-01T00:00:00.000Z',
    updatedAt: '2026-07-01T00:00:00.000Z',
    paymentLink: null,
    deletedAt: '2026-07-12T00:00:00.000Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders trashed invoice details and triggers restore request', async () => {
    vi.mocked(invoiceService.getInvoice).mockResolvedValue(mockInvoice);
    vi.mocked(eventService.getInvoiceTimeline).mockResolvedValue({ data: [], pagination: { total: 0 } } as any);
    vi.mocked(communicationService.getInvoiceCommunications).mockResolvedValue([]);
    vi.mocked(invoiceService.restoreInvoice).mockResolvedValue({} as any);

    renderWithProviders(
      <Routes>
        <Route path="/invoices/:id" element={<InvoiceDetail />} />
      </Routes>,
      { route: '/invoices/inv-456' }
    );

    await waitFor(() => {
      expect(screen.getByText('Trashed Client')).toBeInTheDocument();
      expect(screen.getByText('INV-TRASH')).toBeInTheDocument();
      expect(screen.getByText('This invoice is in Trash')).toBeInTheDocument();
    });

    const restoreBtn = screen.getAllByRole('button', { name: /Restore Invoice/i })[0];
    await act(async () => {
      restoreBtn.click();
    });

    expect(invoiceService.restoreInvoice).toHaveBeenCalledWith('inv-456');
  });

  it('hides active controls like Trigger Follow-up, Generate Payment Link, and 3-dots menu on trashed invoices', async () => {
    vi.mocked(invoiceService.getInvoice).mockResolvedValue(mockInvoice);
    vi.mocked(eventService.getInvoiceTimeline).mockResolvedValue({ data: [], pagination: { total: 0 } } as any);
    vi.mocked(communicationService.getInvoiceCommunications).mockResolvedValue([]);

    renderWithProviders(
      <Routes>
        <Route path="/invoices/:id" element={<InvoiceDetail />} />
      </Routes>,
      { route: '/invoices/inv-456' }
    );

    await waitFor(() => {
      expect(screen.getByText('This invoice is in Trash')).toBeInTheDocument();
    });

    expect(screen.queryByRole('button', { name: /Trigger Follow-up/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Generate Payment Link/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /More options/i })).not.toBeInTheDocument();
  });
});

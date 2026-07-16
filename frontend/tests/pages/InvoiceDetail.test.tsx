import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { screen, act, waitFor } from '../test-utils';
import { renderWithProviders } from '../test-utils';
import { InvoiceDetail } from '../../src/pages/InvoiceDetail';
import { invoiceService } from '../../src/services/invoice';
import { eventService } from '../../src/services/event';
import { communicationService } from '../../src/services/communication';
import { settingsService } from '../../src/services/settings';

// Mock services
vi.mock('../../src/services/invoice', () => ({
  invoiceService: {
    getInvoice: vi.fn(),
    deleteInvoice: vi.fn(),
    generatePaymentLink: vi.fn(),
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

vi.mock('../../src/services/settings', () => ({
  settingsService: {
    getSettings: vi.fn(),
    getIntegrations: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const original = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...original,
    useParams: () => ({ id: 'inv-123' }),
    useNavigate: () => mockNavigate,
    Link: ({ children, to }: any) => <a href={to}>{children}</a>,
  };
});

describe('InvoiceDetail page details and timeline tabs', () => {
  const mockInvoice = {
    id: 'inv-123',
    invoiceNo: 'INV-101',
    clientName: 'Client Alpha',
    invoiceAmount: 2500,
    dueDate: '2026-08-10T00:00:00.000Z',
    paymentStatus: 'Pending' as const,
    contactEmail: 'a@c.com',
    followupCount: 1,
    createdAt: '2026-07-01T00:00:00.000Z',
    updatedAt: '2026-07-01T00:00:00.000Z',
    paymentLink: null,
  };

  const mockTimeline = {
    data: [
      {
        id: 'ev-1',
        invoiceId: 'inv-123',
        eventType: 'invoice.created',
        actorName: 'System',
        createdAt: '2026-07-01T00:00:00.000Z',
      },
    ],
    pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches and renders detail data using route parameters ID', async () => {
    vi.mocked(invoiceService.getInvoice).mockResolvedValue(mockInvoice);
    vi.mocked(eventService.getInvoiceTimeline).mockResolvedValue(mockTimeline);
    vi.mocked(communicationService.getInvoiceCommunications).mockResolvedValue([]);
    vi.mocked(settingsService.getSettings).mockResolvedValue({} as any);
    vi.mocked(settingsService.getIntegrations).mockResolvedValue({} as any);

    renderWithProviders(
      <Routes>
        <Route path="/invoices/:id" element={<InvoiceDetail />} />
      </Routes>,
      { route: '/invoices/inv-123' }
    );

    // Verify it fetches for id: 'inv-123'
    expect(invoiceService.getInvoice).toHaveBeenCalledWith('inv-123');

    await waitFor(() => {
      expect(screen.getByText('Client Alpha')).toBeInTheDocument();
      expect(screen.getByText('INV-101')).toBeInTheDocument();
      expect(screen.getByText(/created this invoice/i)).toBeInTheDocument();
    });
  });

  it('allows switching tabs and deletes invoice navigating back to index', async () => {
    vi.mocked(invoiceService.getInvoice).mockResolvedValue(mockInvoice);
    vi.mocked(eventService.getInvoiceTimeline).mockResolvedValue(mockTimeline);
    vi.mocked(communicationService.getInvoiceCommunications).mockResolvedValue([
      { id: 'c1', channel: 'email', status: 'sent', sentAt: '2026-07-02T00:00:00.000Z', subject: 'Subject' } as any,
    ]);
    vi.mocked(settingsService.getSettings).mockResolvedValue({} as any);
    vi.mocked(settingsService.getIntegrations).mockResolvedValue({} as any);
    vi.mocked(invoiceService.deleteInvoice).mockResolvedValue({} as any);

    renderWithProviders(
      <Routes>
        <Route path="/invoices/:id" element={<InvoiceDetail />} />
      </Routes>,
      { route: '/invoices/inv-123' }
    );

    // Click Emails/Comms Tab
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Emails/i })).toBeInTheDocument();
    });
    const emailTabBtn = screen.getByRole('button', { name: /Emails/i });
    await act(async () => {
      emailTabBtn.click();
    });

    // Check emails list rendered
    await waitFor(() => {
      expect(screen.getByText('Subject')).toBeInTheDocument();
    });

    // Click Delete Button
    const deleteBtn = screen.getByRole('button', { name: /^Delete$/i });
    await act(async () => {
      deleteBtn.click();
    });

    // Click Delete Invoice in confirmation modal
    const confirmDeleteBtn = screen.getByRole('button', { name: /Delete Invoice/i });
    await act(async () => {
      confirmDeleteBtn.click();
    });

    expect(invoiceService.deleteInvoice).toHaveBeenCalledWith('inv-123');
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/invoices');
    });
  });
});

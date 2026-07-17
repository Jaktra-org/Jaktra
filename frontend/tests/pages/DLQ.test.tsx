import { screen, act, waitFor } from '../test-utils';
import { renderWithProviders } from '../test-utils';
import { DLQ } from '../../src/pages/DLQ';
import { dlqService } from '../../src/services/dlq';
import { agentService } from '../../src/services/agent';

// Mock services
vi.mock('../../src/services/dlq', () => ({
  dlqService: {
    getEntries: vi.fn(),
    deleteEntry: vi.fn(),
  },
}));

vi.mock('../../src/services/agent', () => ({
  agentService: {
    runAgentForInvoice: vi.fn(),
  },
}));

describe('DLQ page', () => {
  const mockDlqEntries = [
    {
      invoiceId: 'inv-1',
      invoiceNo: 'INV-001',
      clientName: 'Client Alpha',
      consecutiveFailures: 1,
      lastError: 'Bounced',
      lastErrorDisplay: 'Email bounced',
      lastFailure: '2026-07-12T00:00:00.000Z',
    },
    {
      invoiceId: 'inv-2',
      invoiceNo: 'INV-002',
      clientName: 'Client Beta',
      consecutiveFailures: 3, // Critical failure count!
      lastError: 'SMTP Error',
      lastErrorDisplay: 'SMTP connection timed out',
      lastFailure: '2026-07-12T01:00:00.000Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders critical failure banners when entries have >= 3 failures', async () => {
    vi.mocked(dlqService.getEntries).mockResolvedValue(mockDlqEntries);

    renderWithProviders(<DLQ />);

    await waitFor(() => {
      // Check critical banner renders
      expect(screen.getByText('Critical Delivery Failures')).toBeInTheDocument();
      expect(screen.getByText(/You have 1 invoice\(s\) that have failed delivery 3 or more times/i)).toBeInTheDocument();
    });

    expect(screen.getByText('Client Alpha')).toBeInTheDocument();
    expect(screen.getByText('Client Beta')).toBeInTheDocument();
  });

  // Viewer access is now blocked at the router level via ProtectedRoute allowedRoles.
  // See ProtectedRoute.test.tsx for that coverage.

  it('triggers individual retry and opens dismiss dialog confirmations', async () => {
    vi.mocked(dlqService.getEntries).mockResolvedValue(mockDlqEntries);
    vi.mocked(agentService.runAgentForInvoice).mockResolvedValue({} as any);
    vi.mocked(dlqService.deleteEntry).mockResolvedValue({ success: true });

    renderWithProviders(<DLQ />, {
      authState: {
        user: { id: 'u2', name: 'Admin', email: 'a@a.com', role: 'admin', tenantId: 't1' },
        isLoading: false,
        isAuthenticated: true,
      },
    });

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /Retry Processing/i })).toHaveLength(2);
    });

    // 1. Test Retry Action (Client Beta has 3 failures -> index 0)
    const retryButtons = screen.getAllByRole('button', { name: /Retry Processing/i });
    await act(async () => {
      retryButtons[0].click(); // Retry Client Beta (inv-2)
    });

    expect(agentService.runAgentForInvoice).toHaveBeenCalledWith('inv-2');

    // 2. Test Dismiss Action Dialog (Client Alpha has 1 failure -> index 1)
    const dismissButtons = screen.getAllByRole('button', { name: /Dismiss/i });
    await act(async () => {
      dismissButtons[1].click(); // Dismiss Client Alpha (inv-1)
    });

    // Confirm dialog is open
    expect(screen.getByText('Dismiss DLQ Entry?')).toBeInTheDocument();

    // Click confirm dismiss (the bg-red-600 button inside the confirmation overlay)
    const confirmBtn = screen.getAllByRole('button', { name: /^Dismiss$/i }).find(btn => btn.classList.contains('bg-red-600'))!;
    await act(async () => {
      confirmBtn.click();
    });

    expect(dlqService.deleteEntry).toHaveBeenCalledWith('inv-1');
  });
});

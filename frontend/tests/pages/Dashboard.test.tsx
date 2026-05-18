import React from 'react';
import { screen, waitFor } from '../test-utils';
import { renderWithProviders } from '../test-utils';
import { Dashboard } from '../../src/pages/Dashboard';
import { analyticsService } from '../../src/services/analytics';
import { agentService } from '../../src/services/agent';
import { eventService } from '../../src/services/event';

// Mock services
vi.mock('../../src/services/analytics', () => ({
  analyticsService: {
    getSummary: vi.fn(),
    getAging: vi.fn(),
  },
}));

vi.mock('../../src/services/agent', () => ({
  agentService: {
    getRuns: vi.fn(),
  },
}));

vi.mock('../../src/services/event', () => ({
  eventService: {
    getFeed: vi.fn(),
  },
}));

describe('Dashboard page math aggregations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders aggregated balance calculations and recovery rates from mock API summary data', async () => {
    const mockSummary = {
      invoiceCount: 15,
      totalReceivable: 50000,
      totalCollected: 150000,
      totalOverdue: 20000,
    };
    const mockAging = [
      { tier: 'stage_1_warm', totalAmount: 30000, count: 10 },
      { tier: 'stage_2_firm', totalAmount: 20000, count: 5 },
    ];
    const mockRuns = {
      runs: [
        {
          id: 'run-1',
          startTime: '2026-07-13T00:00:00.000Z',
          endTime: '2026-07-13T00:05:00.000Z',
          status: 'completed',
          invoicesProcessed: 10,
          emailsSent: 8,
          errors: 0,
        },
      ],
    };

    vi.mocked(analyticsService.getSummary).mockResolvedValue(mockSummary);
    vi.mocked(analyticsService.getAging).mockResolvedValue(mockAging);
    vi.mocked(agentService.getRuns).mockResolvedValue(mockRuns);
    vi.mocked(eventService.getFeed).mockResolvedValue([]);

    renderWithProviders(<Dashboard />);

    // Wait for queries to resolve and page to display calculations
    await waitFor(() => {
      // 1. Actionable Queue count
      expect(screen.getByText('15')).toBeInTheDocument();
      // 2. Total Exposure (Total Receivable)
      expect(screen.getByText('$50,000')).toBeInTheDocument();
      // 3. Critical Overdue Flags
      expect(screen.getByText('$20,000')).toBeInTheDocument();
      // 4. Automation yield: 8 emails sent out of 10 processed = 80.0%
      expect(screen.getByText('80.0%')).toBeInTheDocument();
    });
  });

  it('renders loading states initially', () => {
    vi.mocked(analyticsService.getSummary).mockReturnValue(new Promise(() => {}));
    vi.mocked(analyticsService.getAging).mockReturnValue(new Promise(() => {}));
    vi.mocked(agentService.getRuns).mockReturnValue(new Promise(() => {}));
    vi.mocked(eventService.getFeed).mockReturnValue(new Promise(() => {}));

    renderWithProviders(<Dashboard />);

    expect(screen.getByText('Actionable Queue')).toBeInTheDocument();
  });
});

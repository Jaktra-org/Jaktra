import React from 'react';
import { screen, act, waitFor } from '../test-utils';
import { renderWithProviders } from '../test-utils';
import { Analytics } from '../../src/pages/Analytics';
import { analyticsService } from '../../src/services/analytics';
import { settingsService } from '../../src/services/settings';

// Mock services
vi.mock('../../src/services/analytics', () => ({
  analyticsService: {
    getSummary: vi.fn(),
    getAging: vi.fn(),
    getAgentPerformance: vi.fn(),
    getEmailVolume: vi.fn(),
    getChannelBreakdown: vi.fn(),
    getTierEffectiveness: vi.fn(),
    getCommunicationStats: vi.fn(),
  },
}));

vi.mock('../../src/services/settings', () => ({
  settingsService: {
    getSettings: vi.fn(),
  },
}));

// Mock Recharts ResponsiveContainer to bypass JSDOM limitations
vi.mock('recharts', async (importOriginal) => {
  const original = await importOriginal<typeof import('recharts')>();
  return {
    ...original,
    ResponsiveContainer: ({ children }: any) => <div data-testid="recharts-container">{children}</div>,
  };
});

describe('Analytics page tabs and metric queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockSummary = {
    invoiceCount: 20,
    totalReceivable: 60000,
    totalCollected: 120000,
    totalOverdue: 15000,
  };

  const mockCommStats = {
    totalSent: 100,
    totalOpened: 80,
    totalClicked: 40,
    openRate: 80.0,
    clickRate: 40.0,
  };

  it('toggles tabs and renders metric aggregations', async () => {
    vi.mocked(settingsService.getSettings).mockResolvedValue({} as any);
    vi.mocked(analyticsService.getSummary).mockResolvedValue(mockSummary);
    vi.mocked(analyticsService.getAging).mockResolvedValue([]);
    vi.mocked(analyticsService.getCommunicationStats).mockResolvedValue(mockCommStats);
    vi.mocked(analyticsService.getAgentPerformance).mockResolvedValue({
      totalRuns: 10,
      invoicesProcessed: 50,
      emailsSent: 45,
      errorRate: 2,
    });
    vi.mocked(analyticsService.getEmailVolume).mockResolvedValue([
      { date: '2026-07-12', sent: 10, opened: 8, clicked: 4 },
    ]);
    vi.mocked(analyticsService.getChannelBreakdown).mockResolvedValue([]);
    vi.mocked(analyticsService.getTierEffectiveness).mockResolvedValue([]);

    renderWithProviders(<Analytics />);

    // By default, renders the Agent Performance tab
    await waitFor(() => {
      expect(screen.getByText('Emails Sent Per Day')).toBeInTheDocument();
      expect(screen.getByText('Total Runs')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument(); // totalRuns
    });

    // Toggle Financial Metrics tab
    const financialTabBtn = screen.getByRole('button', { name: /Financial Metrics/i });
    await act(async () => {
      financialTabBtn.click();
    });

    await waitFor(() => {
      expect(screen.getByText('Aging Pyramid')).toBeInTheDocument();
      expect(screen.getByText('$60,000')).toBeInTheDocument(); // totalReceivable
    });
  });
});

import React from 'react';
import { screen, waitFor } from '../test-utils';
import { renderWithProviders } from '../test-utils';
import { Analytics } from '../../src/pages/Analytics';
import { analyticsService } from '../../src/services/analytics';
import { settingsService } from '../../src/services/settings';
import { invoiceService } from '../../src/services/invoice';

// Mock services
vi.mock('../../src/services/analytics', () => ({
  analyticsService: {
    getSummary: vi.fn(),
    getAging: vi.fn(),
    getAgentPerformance: vi.fn(),
    getEmailVolume: vi.fn(),
    getChannelBreakdown: vi.fn(),
    getTierEffectiveness: vi.fn(),
  },
}));

vi.mock('../../src/services/settings', () => ({
  settingsService: {
    getSettings: vi.fn(),
  },
}));

vi.mock('../../src/services/invoice', () => ({
  invoiceService: {
    getInvoices: vi.fn(),
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

describe('Analytics page metric queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockSummary = {
    invoiceCount: 20,
    totalReceivable: 60000,
    totalCollected: 120000,
    totalOverdue: 15000,
  };

  it('renders financial metric aggregations and aging breakdown', async () => {
    vi.mocked(settingsService.getSettings).mockResolvedValue({} as any);
    vi.mocked(invoiceService.getInvoices).mockResolvedValue({ data: [], pagination: { total: 0, page: 1, limit: 100, totalPages: 1 } });
    vi.mocked(analyticsService.getSummary).mockResolvedValue(mockSummary);
    vi.mocked(analyticsService.getAging).mockResolvedValue([]);

    renderWithProviders(<Analytics />);

    await waitFor(() => {
      expect(screen.getByText('Aging Pyramid')).toBeInTheDocument();
      expect(screen.getAllByText('$60,000')[0]).toBeInTheDocument(); // totalReceivable
      expect(screen.getAllByText('$120,000')[0]).toBeInTheDocument(); // totalCollected
    });
  });
});

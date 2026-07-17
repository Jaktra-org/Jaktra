import { analyticsService } from '../../src/services/analytics';
import { api } from '../../src/services/api';

vi.mock('../../src/services/api', () => ({
  api: {
    get: vi.fn(),
  },
}));

describe('analyticsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls correct API endpoints for analytics queries', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: {} });

    await analyticsService.getSummary();
    expect(api.get).toHaveBeenCalledWith('/analytics/summary');

    await analyticsService.getAging();
    expect(api.get).toHaveBeenCalledWith('/analytics/aging');

    await analyticsService.getAgentPerformance();
    expect(api.get).toHaveBeenCalledWith('/analytics/agent/performance');

    await analyticsService.getEmailVolume();
    expect(api.get).toHaveBeenCalledWith('/analytics/agent/email-volume');

    await analyticsService.getChannelBreakdown();
    expect(api.get).toHaveBeenCalledWith('/analytics/agent/channel-breakdown');

    await analyticsService.getTierEffectiveness();
    expect(api.get).toHaveBeenCalledWith('/analytics/agent/tier-effectiveness');

    await analyticsService.getCommunicationStats();
    expect(api.get).toHaveBeenCalledWith('/analytics/agent/communication-stats');
  });
});

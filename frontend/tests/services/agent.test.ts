import { agentService } from '../../src/services/agent';
import { api } from '../../src/services/api';

vi.mock('../../src/services/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('agentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getRuns calls /agent/runs', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { runs: [] } });
    await agentService.getRuns();
    expect(api.get).toHaveBeenCalledWith('/agent/runs');
  });

  it('getRunDetails calls /agent/runs/:id', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: {} });
    await agentService.getRunDetails('r1');
    expect(api.get).toHaveBeenCalledWith('/agent/runs/r1');
  });

  it('runAgent calls /agent/run with body parameters', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: {} });
    await agentService.runAgent('stage_1_warm');
    expect(api.post).toHaveBeenCalledWith('/agent/run', { tone: 'stage_1_warm' });
  });

  it('runAgentForInvoice calls /agent/run/invoice/:id with body parameters', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: {} });
    await agentService.runAgentForInvoice('i123', 'stage_2_firm');
    expect(api.post).toHaveBeenCalledWith('/agent/run/invoice/i123', { tone: 'stage_2_firm' });
  });
});

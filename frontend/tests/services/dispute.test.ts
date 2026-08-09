import { disputeService } from '../../src/services/dispute';
import { api } from '../../src/services/api';

vi.mock('../../src/services/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('disputeService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls correct API endpoints for getDisputes, sendReply, updateStatus, generateDraft', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: {} });
    vi.mocked(api.post).mockResolvedValue({ data: {} });

    await disputeService.getDisputes({ status: 'pending', classification: 'all', page: 2, limit: 10 });
    expect(api.get).toHaveBeenCalledWith('/disputes/list', {
      params: { status: 'pending', classification: 'all', page: 2, limit: 10 },
    });

    await disputeService.sendReply('d-1', 'reply response text');
    expect(api.post).toHaveBeenCalledWith('/disputes/d-1/send-reply', { responseBody: 'reply response text' });

    await disputeService.updateStatus('d-2', 'resolved');
    expect(api.post).toHaveBeenCalledWith('/disputes/d-2/status', { status: 'resolved' });

    await disputeService.generateDraft('d-3', 'The amount is correct');
    expect(api.post).toHaveBeenCalledWith('/disputes/d-3/generate-draft', { tenantInstruction: 'The amount is correct' });
  });
});

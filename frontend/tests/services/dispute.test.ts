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

  it('calls correct API endpoints for getPendingDisputes, approveDispute, discardDispute', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: {} });
    vi.mocked(api.post).mockResolvedValue({ data: {} });

    await disputeService.getPendingDisputes({ page: 2, limit: 10 });
    expect(api.get).toHaveBeenCalledWith('/disputes/pending', { params: { page: 2, limit: 10 } });

    await disputeService.approveDispute('d-1', 'suggested response text');
    expect(api.post).toHaveBeenCalledWith('/disputes/d-1/approve', { suggestedResponse: 'suggested response text' });

    await disputeService.discardDispute('d-2');
    expect(api.post).toHaveBeenCalledWith('/disputes/d-2/discard');
  });
});

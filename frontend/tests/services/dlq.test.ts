import { dlqService } from '../../src/services/dlq';
import { api } from '../../src/services/api';

vi.mock('../../src/services/api', () => ({
  api: {
    get: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('dlqService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls correct API endpoints for getEntries, deleteEntry', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] });
    vi.mocked(api.delete).mockResolvedValue({ data: { success: true } });

    const entries = await dlqService.getEntries();
    expect(api.get).toHaveBeenCalledWith('/dlq');
    expect(entries).toEqual([]);

    const res = await dlqService.deleteEntry('inv-12');
    expect(api.delete).toHaveBeenCalledWith('/dlq/inv-12');
    expect(res).toEqual({ success: true });
  });
});

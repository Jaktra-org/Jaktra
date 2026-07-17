import { eventService } from '../../src/services/event';
import { api } from '../../src/services/api';

vi.mock('../../src/services/api', () => ({
  api: {
    get: vi.fn(),
  },
}));

describe('eventService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getInvoiceTimeline formats query parameters correctly', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: {} });

    await eventService.getInvoiceTimeline('inv-123', {
      page: 2,
      limit: 10,
      actionTypes: ['a', 'b'],
    });

    expect(api.get).toHaveBeenCalledWith('/invoices/inv-123/timeline?page=2&limit=10&action_types=a%2Cb');
  });

  it('getFeed formats query parameters correctly', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] });

    await eventService.getFeed(20);
    expect(api.get).toHaveBeenCalledWith('/events/feed?limit=20');
  });

  it('getAllEvents formats query parameters correctly', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: {} });

    await eventService.getAllEvents({
      page: 1,
      limit: 5,
      sources: ['system', 'user'],
    });

    expect(api.get).toHaveBeenCalledWith('/events?page=1&limit=5&sources=system%2Cuser');
  });
});

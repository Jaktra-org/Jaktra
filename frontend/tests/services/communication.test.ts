import { communicationService } from '../../src/services/communication';
import { api } from '../../src/services/api';

vi.mock('../../src/services/api', () => ({
  api: {
    get: vi.fn(),
  },
}));

describe('communicationService', () => {
  it('calls the correct endpoint for getInvoiceCommunications', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: ['comm1'] });
    const res = await communicationService.getInvoiceCommunications('123');
    expect(api.get).toHaveBeenCalledWith('/settings/communication/invoices/123/communications');
    expect(res).toEqual(['comm1']);
  });
});

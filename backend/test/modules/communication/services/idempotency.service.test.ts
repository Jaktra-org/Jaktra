import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IdempotencyService } from '../../../../src/modules/communication/services/idempotency.service.js';

describe('IdempotencyService', () => {
  let idempotencyService: IdempotencyService;
  let mockCommunicationRepo: any;

  beforeEach(() => {
    mockCommunicationRepo = {
      getSettings: vi.fn(),
      findLastSuccessfulByInvoiceId: vi.fn(),
    };
    idempotencyService = new IdempotencyService(mockCommunicationRepo);
  });

  it('should not skip if no previous communication exists', async () => {
    mockCommunicationRepo.getSettings.mockResolvedValue({ idempotencyWindowHours: 20 });
    mockCommunicationRepo.findLastSuccessfulByInvoiceId.mockResolvedValue(null);

    const result = await idempotencyService.checkInvoice('tenant-1', 'invoice-1');
    expect(result.skipped).toBe(false);
  });

  it('should skip if last successful communication was sent within window', async () => {
    mockCommunicationRepo.getSettings.mockResolvedValue({ idempotencyWindowHours: 20 });
    
    const sentAt = new Date();
    // 5 hours ago
    sentAt.setHours(sentAt.getHours() - 5);

    mockCommunicationRepo.findLastSuccessfulByInvoiceId.mockResolvedValue({
      id: 'comm-1',
      status: 'sent',
      sentAt: sentAt,
      createdAt: sentAt,
    });

    const result = await idempotencyService.checkInvoice('tenant-1', 'invoice-1');
    expect(result.skipped).toBe(true);
    expect(result.reason).toContain('sent 5h ago');
  });

  it('should not skip if last successful communication was sent outside window', async () => {
    mockCommunicationRepo.getSettings.mockResolvedValue({ idempotencyWindowHours: 20 });
    
    const sentAt = new Date();
    // 25 hours ago
    sentAt.setHours(sentAt.getHours() - 25);

    mockCommunicationRepo.findLastSuccessfulByInvoiceId.mockResolvedValue({
      id: 'comm-1',
      status: 'sent',
      sentAt: sentAt,
      createdAt: sentAt,
    });

    const result = await idempotencyService.checkInvoice('tenant-1', 'invoice-1');
    expect(result.skipped).toBe(false);
  });
});

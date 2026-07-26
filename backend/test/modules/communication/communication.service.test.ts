import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CommunicationService } from '../../../src/modules/communication/communication.service.js';

describe('CommunicationService', () => {
  let communicationService: CommunicationService;
  let mockCommRepo: any;
  let mockInvoiceRepo: any;
  let mockEventService: any;
  let mockDlqRepo: any;

  beforeEach(() => {
    mockCommRepo = {
      updateOpenedAt: vi.fn(),
      updateClickedAt: vi.fn(),
      markFailed: vi.fn(),
    };
    mockInvoiceRepo = {
      findById: vi.fn(),
      update: vi.fn(),
    };
    mockEventService = {
      emitEvent: vi.fn().mockResolvedValue({}),
    };
    mockDlqRepo = {
      recordFailure: vi.fn(),
    };
    const mockTenantMailer = {
      sendCollectionEmail: vi.fn().mockResolvedValue({ success: true, providerMessageId: 'test-msg-id' }),
    } as any;

    const mockPortalService = {
      getOrCreatePortalLink: vi.fn().mockResolvedValue('test-token'),
    } as any;

    communicationService = new CommunicationService(
      mockCommRepo as any,
      mockInvoiceRepo as any,
      mockTenantMailer as any,
      mockPortalService as any,
      mockEventService as any,
      mockDlqRepo as any
    );
  });

  it('should handle opened email events', async () => {
    const timestamp = new Date('2026-06-22T01:00:00Z');
    const rawEvent = { run_id: 'run-123' };

    await communicationService.handleEmailEvent(
      'tenant-1',
      'comm-1',
      'invoice-1',
      'opened',
      timestamp,
      rawEvent
    );

    expect(mockCommRepo.updateOpenedAt).toHaveBeenCalledWith('comm-1', timestamp);
    expect(mockEventService.emitEvent).toHaveBeenCalledWith(
      'invoice',
      'invoice-1',
      'tenant-1',
      'followup.email_opened',
      { source: 'webhook' },
      {
        description: 'Follow-up email opened',
        payload: { ...rawEvent, runId: 'run-123' },
      }
    );
  });

  it('should handle clicked email events', async () => {
    const timestamp = new Date('2026-06-22T01:00:00Z');
    const rawEvent = { runId: 'run-123' };

    await communicationService.handleEmailEvent(
      'tenant-1',
      'comm-1',
      'invoice-1',
      'clicked',
      timestamp,
      rawEvent
    );

    expect(mockCommRepo.updateClickedAt).toHaveBeenCalledWith('comm-1', timestamp);
    expect(mockEventService.emitEvent).toHaveBeenCalledWith(
      'invoice',
      'invoice-1',
      'tenant-1',
      'followup.email_clicked',
      { source: 'webhook' },
      {
        description: 'Link in follow-up email clicked',
        payload: { ...rawEvent, runId: 'run-123' },
      }
    );
  });

  it('should map bounced email events to type halted and reason mail_bounced', async () => {
    const timestamp = new Date('2026-06-22T01:00:00Z');
    const rawEvent = { reason: 'Mailbox not found', run_id: 'run-123' };

    mockInvoiceRepo.findById.mockResolvedValue({ id: 'invoice-1', followupCount: 2 });

    await communicationService.handleEmailEvent(
      'tenant-1',
      'comm-1',
      'invoice-1',
      'bounced',
      timestamp,
      rawEvent
    );

    // Should mark the communication as failed
    expect(mockCommRepo.markFailed).toHaveBeenCalledWith('comm-1', 'Mailbox not found');

    // Should decrement followupCount
    expect(mockInvoiceRepo.findById).toHaveBeenCalledWith('invoice-1');
    expect(mockInvoiceRepo.update).toHaveBeenCalledWith('invoice-1', 'tenant-1', {
      followupCount: 1,
    });

    // Should record failure in DLQ
    expect(mockDlqRepo.recordFailure).toHaveBeenCalledWith(
      'invoice-1',
      'tenant-1',
      'Delivery failed: Mailbox not found',
      JSON.stringify(rawEvent)
    );

    // Should emit event of type 'followup.bounced'
    expect(mockEventService.emitEvent).toHaveBeenCalledWith(
      'invoice',
      'invoice-1',
      'tenant-1',
      'followup.bounced',
      { source: 'webhook' },
      {
        description: 'Follow-up email delivery failed (bounced)',
        payload: {
          reason: 'mail_bounced',
          error: 'Mailbox not found',
          runId: 'run-123',
        },
      }
    );
  });

  it('should map dropped email events to type halted and reason mail_dropped', async () => {
    const timestamp = new Date('2026-06-22T01:00:00Z');
    const rawEvent = { reason: 'Unsubscribed recipient', run_id: 'run-123' };

    mockInvoiceRepo.findById.mockResolvedValue({ id: 'invoice-1', followupCount: 1 });

    await communicationService.handleEmailEvent(
      'tenant-1',
      'comm-1',
      'invoice-1',
      'dropped',
      timestamp,
      rawEvent
    );

    // Should mark the communication as failed
    expect(mockCommRepo.markFailed).toHaveBeenCalledWith('comm-1', 'Unsubscribed recipient');

    // Should decrement followupCount
    expect(mockInvoiceRepo.findById).toHaveBeenCalledWith('invoice-1');
    expect(mockInvoiceRepo.update).toHaveBeenCalledWith('invoice-1', 'tenant-1', {
      followupCount: 0,
    });

    // Should record failure in DLQ
    expect(mockDlqRepo.recordFailure).toHaveBeenCalledWith(
      'invoice-1',
      'tenant-1',
      'Delivery failed: Unsubscribed recipient',
      JSON.stringify(rawEvent)
    );

    // Should emit event of type 'followup.bounced'
    expect(mockEventService.emitEvent).toHaveBeenCalledWith(
      'invoice',
      'invoice-1',
      'tenant-1',
      'followup.bounced',
      { source: 'webhook' },
      {
        description: 'Follow-up email delivery failed (dropped)',
        payload: {
          reason: 'mail_dropped',
          error: 'Unsubscribed recipient',
          runId: 'run-123',
        },
      }
    );
  });
});

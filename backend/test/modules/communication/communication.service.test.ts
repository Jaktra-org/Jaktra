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
      markFailed: vi.fn(),
      findById: vi.fn().mockResolvedValue({ id: 'comm-1', source: 'agent', subject: 'Payment Reminder' }),
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

  it('should map bounced followup email events to followup bounce description and decrement count', async () => {
    const timestamp = new Date('2026-06-22T01:00:00Z');
    const rawEvent = { reason: 'Mailbox not found', run_id: 'run-123' };

    mockInvoiceRepo.findById.mockResolvedValue({ id: 'invoice-1', followupCount: 2 });
    mockCommRepo.findById.mockResolvedValue({ id: 'comm-1', source: 'agent', subject: 'Payment Reminder' });

    await communicationService.handleEmailEvent(
      'tenant-1',
      'comm-1',
      'invoice-1',
      'bounced',
      timestamp,
      rawEvent,
      'run-123'
    );

    // Should mark the communication as failed
    expect(mockCommRepo.markFailed).toHaveBeenCalledWith('comm-1', 'Mailbox not found');

    // Should decrement followupCount for followup emails
    expect(mockInvoiceRepo.findById).toHaveBeenCalledWith('invoice-1');
    expect(mockInvoiceRepo.update).toHaveBeenCalledWith('invoice-1', 'tenant-1', {
      followupCount: 1,
    });

    // Should record failure in DLQ
    expect(mockDlqRepo.recordFailure).toHaveBeenCalledWith(
      'invoice-1',
      'tenant-1',
      'Follow-up email delivery failed: Mailbox not found',
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
        description: 'Follow-up email delivery failed (bounced): Mailbox not found',
        payload: {
          emailType: 'followup',
          reason: 'mail_bounced',
          error: 'Mailbox not found',
          runId: 'run-123',
        },
      }
    );
  });

  it('should distinguish initial invoice email bounce (source: system) without decrementing followup count', async () => {
    const timestamp = new Date('2026-06-22T01:00:00Z');
    const rawEvent = { reason: 'Recipient address rejected', email: 'client@example.com' };

    mockCommRepo.findById.mockResolvedValue({ id: 'comm-init-1', source: 'system', subject: 'Invoice #INV-414 from Acme' });

    await communicationService.handleEmailEvent(
      'tenant-1',
      'comm-init-1',
      'invoice-1',
      'bounced',
      timestamp,
      rawEvent
    );

    // Should mark the communication as failed
    expect(mockCommRepo.markFailed).toHaveBeenCalledWith('comm-init-1', 'Recipient address rejected');

    // Should NOT decrement followupCount for initial invoice emails
    expect(mockInvoiceRepo.update).not.toHaveBeenCalled();

    // Should record failure in DLQ
    expect(mockDlqRepo.recordFailure).toHaveBeenCalledWith(
      'invoice-1',
      'tenant-1',
      'Invoice email delivery failed: Recipient address rejected',
      JSON.stringify(rawEvent)
    );

    // Should emit event with emailType: 'initial_notification' and accurate description
    expect(mockEventService.emitEvent).toHaveBeenCalledWith(
      'invoice',
      'invoice-1',
      'tenant-1',
      'followup.bounced',
      { source: 'webhook' },
      {
        description: 'Invoice email delivery failed (bounced): Recipient address rejected',
        payload: {
          emailType: 'initial_notification',
          reason: 'mail_bounced',
          error: 'Recipient address rejected',
          recipient: 'client@example.com',
          contactEmail: 'client@example.com',
          runId: undefined,
        },
      }
    );
  });

  it('should map dropped email events to type dropped and reason mail_dropped', async () => {
    const timestamp = new Date('2026-06-22T01:00:00Z');
    const rawEvent = { reason: 'Unsubscribed recipient', run_id: 'run-123' };

    mockInvoiceRepo.findById.mockResolvedValue({ id: 'invoice-1', followupCount: 1 });
    mockCommRepo.findById.mockResolvedValue({ id: 'comm-1', source: 'agent', subject: 'Followup #1' });

    await communicationService.handleEmailEvent(
      'tenant-1',
      'comm-1',
      'invoice-1',
      'dropped',
      timestamp,
      rawEvent,
      'run-123'
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
      'Follow-up email delivery failed: Unsubscribed recipient',
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
        description: 'Follow-up email delivery failed (dropped): Unsubscribed recipient',
        payload: {
          emailType: 'followup',
          reason: 'mail_dropped',
          error: 'Unsubscribed recipient',
          runId: 'run-123',
        },
      }
    );
  });
});

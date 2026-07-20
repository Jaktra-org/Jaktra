import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AgentService } from '../../../src/modules/agent/agent.service.js';

describe('AgentService - DLQ Flow and Configurable Thresholds', () => {
  let agentService: AgentService;
  let mockAgentRepo: any;
  let mockAimlService: any;
  let mockInvoiceRepo: any;
  let mockTriageService: any;
  let mockEventService: any;
  let mockDlqService: any;
  let mockIdempotencyService: any;
  let mockPaymentService: any;
  let mockCommunicationService: any;
  let mockCommunicationRepo: any;

  beforeEach(() => {
    mockAgentRepo = {
      createRun: vi.fn().mockResolvedValue({ id: 'run-123' }),
      updateRun: vi.fn(),
    };
    mockAimlService = {};
    mockInvoiceRepo = {
      findByTenant: vi.fn().mockResolvedValue([]),
    };
    mockTriageService = {
      triageInvoices: vi.fn().mockImplementation((invoices, blockedIds) => {
        return {
          invoices: invoices.filter((i: any) => !blockedIds.has(i.id)),
          needsManualReview: invoices.filter((i: any) => blockedIds.has(i.id)),
          total: invoices.length - blockedIds.size,
          tierCounts: {},
        };
      }),
    };
    mockEventService = {
      emitEvent: vi.fn().mockResolvedValue(undefined),
    };
    mockDlqService = {
      getDlqEntries: vi.fn().mockResolvedValue([]),
      clearFailure: vi.fn().mockResolvedValue(undefined),
      recordFailure: vi.fn().mockResolvedValue(undefined),
    };
    mockIdempotencyService = {};
    mockPaymentService = {};
    mockCommunicationService = {};
    mockCommunicationRepo = {
      getSettings: vi.fn().mockResolvedValue({
        defaultEmailProvider: 'smtp',
        senderEmail: 'billing@example.com',
        dlqThreshold: 3,
      }),
    };

    agentService = new AgentService(
      mockAgentRepo,
      mockAimlService,
      mockInvoiceRepo,
      mockTriageService,
      mockEventService,
      mockDlqService,
      mockIdempotencyService,
      mockPaymentService,
      mockCommunicationService,
      mockCommunicationRepo
    );
  });

  it('should exclude invoices above the failure threshold in an automated run', async () => {
    // 1. Set up invoices
    const invoices = [
      { id: 'inv-1', tenantId: 'tenant-1', paymentStatus: 'Pending', dueDate: '2026-07-01' },
      { id: 'inv-2', tenantId: 'tenant-1', paymentStatus: 'Pending', dueDate: '2026-07-01' },
    ];
    mockInvoiceRepo.findByTenant.mockResolvedValue(invoices);

    // 2. Set up DLQ entries (inv-1 has 3 failures, threshold is 3)
    mockDlqService.getDlqEntries.mockResolvedValue([
      { invoiceId: 'inv-1', consecutiveFailures: 3 },
      { invoiceId: 'inv-2', consecutiveFailures: 2 },
    ]);

    // 3. Trigger run
    await agentService.triggerRun('tenant-1');

    // 4. Verify triage was called with blocked ID of inv-1
    expect(mockTriageService.triageInvoices).toHaveBeenCalledWith(
      invoices,
      new Set(['inv-1'])
    );
  });

  it('should respect custom dlqThreshold settings from tenant settings', async () => {
    const invoices = [
      { id: 'inv-1', tenantId: 'tenant-1', paymentStatus: 'Pending', dueDate: '2026-07-01' },
    ];
    mockInvoiceRepo.findByTenant.mockResolvedValue(invoices);

    // Custom threshold is 5
    mockCommunicationRepo.getSettings.mockResolvedValue({
      defaultEmailProvider: 'smtp',
      senderEmail: 'billing@example.com',
      dlqThreshold: 5,
    });

    // inv-1 has 4 failures (less than 5, so not blocked)
    mockDlqService.getDlqEntries.mockResolvedValue([
      { invoiceId: 'inv-1', consecutiveFailures: 4 },
    ]);

    await agentService.triggerRun('tenant-1');

    // Should not block inv-1
    expect(mockTriageService.triageInvoices).toHaveBeenCalledWith(
      invoices,
      new Set()
    );
  });

  it('should fallback to process.env.DLQ_THRESHOLD if settings do not specify it', async () => {
    const invoices = [
      { id: 'inv-1', tenantId: 'tenant-1', paymentStatus: 'Pending', dueDate: '2026-07-01' },
    ];
    mockInvoiceRepo.findByTenant.mockResolvedValue(invoices);

    // Settings do not have dlqThreshold
    mockCommunicationRepo.getSettings.mockResolvedValue({
      defaultEmailProvider: 'smtp',
      senderEmail: 'billing@example.com',
    });

    process.env.DLQ_THRESHOLD = '2';

    // inv-1 has 2 failures (equal to env threshold 2, so blocked)
    mockDlqService.getDlqEntries.mockResolvedValue([
      { invoiceId: 'inv-1', consecutiveFailures: 2 },
    ]);

    await agentService.triggerRun('tenant-1');

    expect(mockTriageService.triageInvoices).toHaveBeenCalledWith(
      invoices,
      new Set(['inv-1'])
    );

    // Clean up
    delete process.env.DLQ_THRESHOLD;
  });

  it('should bypass DLQ block and clear failure on successful single invoice processing (manual retry)', async () => {
    mockInvoiceRepo.findById = vi.fn().mockResolvedValue({
      id: 'inv-1',
      tenantId: 'tenant-1',
      invoiceNo: 'INV-001',
      clientName: 'Client 1',
      invoiceAmount: 1000.00,
      dueDate: '2026-07-01',
      contactEmail: 'client@example.com',
      followupCount: 0,
    });
    mockTriageService.computeDaysOverdue = vi.fn().mockReturnValue(5);
    mockTriageService.assignTier = vi.fn().mockReturnValue('stage_1_warm');
    mockIdempotencyService.checkInvoice = vi.fn().mockResolvedValue({ skipped: false });
    mockPaymentService.getOrGeneratePaymentLink = vi.fn().mockResolvedValue(undefined);
    mockCommunicationService.validateRecipientEmail = vi.fn().mockResolvedValue(undefined);
    mockCommunicationService.send = vi.fn().mockResolvedValue(undefined);
    mockCommunicationRepo.create = vi.fn().mockResolvedValue({});
    mockInvoiceRepo.update = vi.fn().mockResolvedValue({});
    mockAimlService.triggerFollowup = vi.fn().mockResolvedValue({
      emailGenerated: true,
      subject: 'Test Subject',
      bodyPreview: 'Test Body',
      htmlBody: 'Test Body',
    });

    await agentService.triggerSingleInvoice('inv-1', 'tenant-1', undefined, { source: 'ui', name: 'User' } as any);

    expect(mockDlqService.clearFailure).toHaveBeenCalledWith('inv-1', 'tenant-1');
  });

  it('should record failure in DLQ when single invoice processing fails', async () => {
    mockInvoiceRepo.findById = vi.fn().mockResolvedValue({
      id: 'inv-1',
      tenantId: 'tenant-1',
      invoiceNo: 'INV-001',
      clientName: 'Client 1',
      invoiceAmount: 1000.00,
      dueDate: '2026-07-01',
      contactEmail: 'client@example.com',
      followupCount: 0,
    });
    mockTriageService.computeDaysOverdue = vi.fn().mockReturnValue(5);
    mockTriageService.assignTier = vi.fn().mockReturnValue('stage_1_warm');
    mockIdempotencyService.checkInvoice = vi.fn().mockResolvedValue({ skipped: false });
    mockPaymentService.getOrGeneratePaymentLink = vi.fn().mockResolvedValue(undefined);
    mockCommunicationService.validateRecipientEmail = vi.fn().mockResolvedValue(undefined);
    mockCommunicationService.send = vi.fn().mockRejectedValue(new Error('SMTP Error'));
    mockCommunicationRepo.create = vi.fn().mockResolvedValue({});
    mockInvoiceRepo.update = vi.fn().mockResolvedValue({});
    mockAimlService.triggerFollowup = vi.fn().mockResolvedValue({
      emailGenerated: true,
      subject: 'Test Subject',
      bodyPreview: 'Test Body',
      htmlBody: 'Test Body',
    });

    const result: any = await agentService.triggerSingleInvoice('inv-1', 'tenant-1', undefined, { source: 'ui', name: 'User' } as any);
    expect(result.emailSent).toBe(false);

    expect(mockDlqService.recordFailure).toHaveBeenCalledWith('inv-1', 'tenant-1', 'SMTP Error');
  });
});

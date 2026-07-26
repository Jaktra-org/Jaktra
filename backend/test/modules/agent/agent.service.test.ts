import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AgentService } from '../../../src/modules/agent/agent.service.js';

describe('AgentService - getRunDetails', () => {
  let agentService: AgentService;
  let mockAgentRepo: any;
  let mockEventService: any;
  let mockPortalService: any;

  beforeEach(() => {
    mockAgentRepo = {
      getRunById: vi.fn(),
    };
    mockEventService = {
      findByRunId: vi.fn(),
    };

    mockPortalService = {
      getOrCreatePortalLink: vi.fn().mockResolvedValue('mock-token'),
      ensurePortalLinkExists: vi.fn().mockResolvedValue(undefined)
    };

    agentService = new AgentService(
      mockAgentRepo as any,
      {} as any, // aimlService
      {} as any, // invoiceRepo
      {} as any, // triageService
      mockEventService as any,
      {} as any, // dlqService
      {} as any, // idempotencyService
      {} as any, // paymentService
      {} as any, // communicationService
      {} as any, // communicationRepo
      mockPortalService as any
    );
  });

  it('should return null if run is not found', async () => {
    mockAgentRepo.getRunById.mockResolvedValue(null);

    const result = await agentService.getRunDetails('run-1', 'tenant-1');
    expect(result).toBeNull();
    expect(mockAgentRepo.getRunById).toHaveBeenCalledWith('run-1', 'tenant-1');
  });

  it('should group, de-duplicate and sort events correctly', async () => {
    const mockRun = {
      id: 'run-1',
      tenantId: 'tenant-1',
      status: 'completed',
    };

    const mockEvents = [
      // Invoice 1 - older event (email_sent)
      {
        id: 'event-1',
        entityId: 'invoice-1',
        eventType: 'email_sent',
        createdAt: new Date('2026-06-22T01:00:00Z'),
      },
      // Run-level event 1 (no entityId)
      {
        id: 'event-2',
        entityId: null,
        eventType: 'run_started',
        createdAt: new Date('2026-06-22T00:50:00Z'),
      },
      // Invoice 1 - newer event (halted due to bounce)
      {
        id: 'event-3',
        entityId: 'invoice-1',
        eventType: 'halted',
        createdAt: new Date('2026-06-22T01:05:00Z'),
      },
      // Invoice 2 - single event (email_sent)
      {
        id: 'event-4',
        entityId: 'invoice-2',
        eventType: 'email_sent',
        createdAt: new Date('2026-06-22T01:02:00Z'),
      },
      // Run-level event 2 (no entityId)
      {
        id: 'event-5',
        entityId: null,
        eventType: 'run_completed',
        createdAt: new Date('2026-06-22T01:10:00Z'),
      },
    ];

    mockAgentRepo.getRunById.mockResolvedValue(mockRun);
    mockEventService.findByRunId.mockResolvedValue(mockEvents);

    const result = await agentService.getRunDetails('run-1', 'tenant-1');

    expect(result).toBeDefined();
    expect(result?.id).toBe('run-1');
    expect(result?.events).toBeDefined();

    // Verify lengths:
    // - invoice-1 collapsed from 2 events to 1 (event-3, the newer one)
    // - invoice-2 has 1 event (event-4)
    // - run-level events are both kept (event-2 and event-5)
    // Total should be 4 events
    expect(result?.events.length).toBe(4);

    // Verify chronological order:
    // event-2 (00:50:00Z)
    // event-4 (01:02:00Z)
    // event-3 (01:05:00Z)
    // event-5 (01:10:00Z)
    const eventIds = result?.events.map((e: any) => e.id);
    expect(eventIds).toEqual(['event-2', 'event-4', 'event-3', 'event-5']);
    
    // Verify invoice-1 has the latest state ('halted') and not the old one
    const invoice1Event = result?.events.find((e: any) => e.entityId === 'invoice-1');
    expect(invoice1Event?.id).toBe('event-3');
    expect(invoice1Event?.eventType).toBe('halted');
  });
});

describe('AgentService - triggerRun', () => {
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
  let mockPortalService: any;

  beforeEach(() => {
    mockAgentRepo = {
      createRun: vi.fn().mockResolvedValue({ id: 'run-123' }),
      updateRun: vi.fn().mockResolvedValue({ id: 'run-123', status: 'completed' }),
    };
    mockAimlService = {};
    mockInvoiceRepo = {
      findByTenant: vi.fn().mockResolvedValue([]),
    };
    mockTriageService = {
      triageInvoices: vi.fn().mockReturnValue({ invoices: [], needsManualReview: [], total: 0 }),
    };
    mockEventService = {
      emitEvent: vi.fn(),
    };
    mockDlqService = {
      getDlqEntries: vi.fn().mockResolvedValue([]),
    };
    mockIdempotencyService = {};
    mockPaymentService = {};
    mockCommunicationService = {};
    mockCommunicationRepo = {
      getSettings: vi.fn(),
    };

    mockPortalService = {
      getOrCreatePortalLink: vi.fn().mockResolvedValue('mock-token'),
      ensurePortalLinkExists: vi.fn().mockResolvedValue(undefined)
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
      mockCommunicationRepo,
      mockPortalService
    );
  });

  it('throws CommunicationError if email provider is not configured', async () => {
    mockCommunicationRepo.getSettings.mockResolvedValue(null);

    await expect(agentService.triggerRun('tenant-1')).rejects.toThrow(
      'Email is not set up. Please configure a sender email'
    );
  });

  it('triggers run and completes immediately if no invoices are triaged', async () => {
    mockCommunicationRepo.getSettings.mockResolvedValue({
      defaultEmailProvider: 'smtp',
      senderEmail: 'test@example.com',
    });

    const run = await agentService.triggerRun('tenant-1');
    expect(run?.status).toBe('completed');
    expect(mockAgentRepo.createRun).toHaveBeenCalled();
    expect(mockAgentRepo.updateRun).toHaveBeenCalledWith('run-123', 'tenant-1', expect.objectContaining({
      status: 'completed',
    }));
  });
});


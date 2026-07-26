import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DisputeService, timingSafeCompare, extractEmail } from '../../../src/modules/dispute/dispute.service.js';
import { DisputeController } from '../../../src/modules/dispute/dispute.controller.js';
import { WebhookController } from '../../../src/modules/webhook/webhook.controller.js';
import { CommunicationService } from '../../../src/modules/communication/communication.service.js';
import type { ActorContext } from '../../../src/modules/event/event.service.js';
import type { PlatformMailer } from '../../../src/modules/platform-mail/platform-mailer.js';
import { config } from '../../../src/config/index.js';
import { logger } from '../../../src/shared/logger.js';

// Mock dns/promises so that CommunicationService MX domain checks pass instantly
vi.mock('dns/promises', () => ({
  resolveMx: vi.fn().mockResolvedValue([{ exchange: 'mail.test.com', priority: 10 }]),
}));

vi.mock('../../../src/shared/logger.js', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('Dispute Timing Safe Compare & Email Extract Helpers', () => {
  it('should timingSafeCompare correctly', () => {
    expect(timingSafeCompare('secret', 'secret')).toBe(true);
    expect(timingSafeCompare('secret', 'mismatch')).toBe(false);
    expect(timingSafeCompare('secret', '')).toBe(false);
    expect(timingSafeCompare('', '')).toBe(true);
  });

  it('should extractEmail clean email addresses from raw headers', () => {
    expect(extractEmail('"Customer" <cust@test.com>')).toBe('cust@test.com');
    expect(extractEmail('cust@test.com')).toBe('cust@test.com');
    expect(extractEmail(undefined)).toBeNull();
  });
});

describe('CommunicationService Outbound replyTo Injection', () => {
  let commService: CommunicationService;
  let mockCommRepo: any;
  let mockInvoiceRepo: any;
  let mockTenantMailer: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockCommRepo = {
      getSettings: vi.fn().mockResolvedValue({
        senderName: 'Test Sender',
        senderEmail: 'sender@test.com',
        replyTo: 'custom-reply@test.com',
        defaultEmailProvider: 'sendgrid',
      }),
      create: vi.fn().mockResolvedValue({ id: 'comm-123' }),
    };
    mockInvoiceRepo = {
      findById: vi.fn(),
    };
    mockTenantMailer = {
      sendCollectionEmail: vi.fn().mockResolvedValue({ success: true }),
    };

    const mockPortalService = {
      getOrCreatePortalLink: vi.fn().mockResolvedValue('test-token'),
    } as any;

    const mockEventService = {
      emitEvent: vi.fn().mockResolvedValue({}),
    } as any;

    const mockDlqRepo = {
      recordFailure: vi.fn(),
    } as any;

    commService = new CommunicationService(
      mockCommRepo,
      mockInvoiceRepo,
      mockTenantMailer,
      mockPortalService,
      mockEventService,
      mockDlqRepo
    );
  });

  it('should override replyTo with sub-address when INBOUND_PARSE_DOMAIN is configured', async () => {
    config.INBOUND_PARSE_DOMAIN = 'replies.jaktra.com';
    const invoiceId = '123e4567-e89b-12d3-a456-426614174000';

    await commService.send({
      tenantId: 'tenant-123',
      to: 'client@test.com',
      subject: 'Urgent Pay',
      html: '<p>Pay now</p>',
      invoiceId,
    });

    expect(mockTenantMailer.sendCollectionEmail).toHaveBeenCalledWith(
      'tenant-123',
      expect.objectContaining({
        replyTo: `reply+${invoiceId}@replies.jaktra.com`,
      }),
      { invoiceId }
    );
  });

  it('should use settings replyTo if INBOUND_PARSE_DOMAIN is not configured', async () => {
    config.INBOUND_PARSE_DOMAIN = undefined;
    const invoiceId = '123e4567-e89b-12d3-a456-426614174000';

    await commService.send({
      tenantId: 'tenant-123',
      to: 'client@test.com',
      subject: 'Urgent Pay',
      html: '<p>Pay now</p>',
      invoiceId,
    });

    expect(mockTenantMailer.sendCollectionEmail).toHaveBeenCalledWith(
      'tenant-123',
      expect.objectContaining({
        replyTo: 'custom-reply@test.com',
      }),
      { invoiceId }
    );
  });
});

function makeRedis(overrides: Record<string, unknown> = {}): any {
  const store: Record<string, { value: string; ttl?: number }> = {};

  return {
    isOpen: true,
    get: vi.fn(async (key: string) => store[key]?.value ?? null),
    set: vi.fn(async (key: string, value: string, opts?: { EX?: number }) => {
      store[key] = { value, ttl: opts?.EX };
    }),
    incr: vi.fn(async (key: string) => {
      const current = parseInt(store[key]?.value ?? '0', 10);
      const next = current + 1;
      store[key] = { value: String(next), ttl: store[key]?.ttl };
      return next;
    }),
    expire: vi.fn(async (key: string, seconds: number) => {
      if (store[key]) store[key].ttl = seconds;
      return 1;
    }),
    del: vi.fn(async (key: string) => {
      const existed = key in store;
      delete store[key];
      return existed ? 1 : 0;
    }),
    exists: vi.fn(async (key: string) => (key in store ? 1 : 0)),
    _store: store,
    ...overrides,
  };
}

describe('DisputeService Inbound Processing & Ingestion', () => {
  let disputeService: DisputeService;
  let mockDisputeRepo: any;
  let mockAimlService: any;
  let mockCommRepo: any;
  let mockCommService: any;
  let mockEventService: any;

  // Thenable sequential db mock setup
  let mockDbResults: any[] = [];
  const mockDbQueryChain: any = {
    select: () => mockDbQueryChain,
    from: () => mockDbQueryChain,
    where: () => mockDbQueryChain,
    limit: () => mockDbQueryChain,
    orderBy: () => mockDbQueryChain,
    leftJoin: () => mockDbQueryChain,
    insert: () => mockDbQueryChain,
    values: () => mockDbQueryChain,
    returning: () => mockDbQueryChain,
    update: () => mockDbQueryChain,
    set: () => mockDbQueryChain,
    then: (resolve: any) => {
      const next = mockDbResults.shift();
      resolve(next !== undefined ? next : []);
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockDbResults = [];

    mockDisputeRepo = {
      create: vi.fn().mockResolvedValue({ id: 'dispute-123' }),
      findById: vi.fn(),
      update: vi.fn(),
    };
    mockAimlService = {
      analyzeDispute: vi.fn().mockResolvedValue({
        classification: 'dispute',
        confidence: 0.95,
        suggestedResponse: 'Sorry about the issue. We will resolve it.',
        reasoning: 'Customer disputes billing amount.',
      }),
    };
    mockCommRepo = {
      findByInvoiceId: vi.fn().mockResolvedValue([]),
    };
    mockCommService = {
      send: vi.fn().mockResolvedValue(true),
    };
    mockEventService = {
      emitEvent: vi.fn().mockResolvedValue({ id: 'event-123' }),
    };

    disputeService = new DisputeService(
      mockDisputeRepo,
      mockAimlService,
      mockDbQueryChain,
      mockCommRepo,
      mockCommService,
      mockEventService,
      null
    );
  });

  it('should match inbound reply to invoice via sub-addressing UUID', async () => {
    const invoiceId = '123e4567-e89b-12d3-a456-426614174000';
    mockDbResults = [
      [{ id: invoiceId, tenantId: 'tenant-123', clientName: 'Client Acme', invoiceAmount: 100, invoiceNo: 'INV-001', dueDate: '2026-07-30', contactEmail: 'client@test.com' }], // 1. invoice lookup
      [{ inboundBlockedByAdmin: false }], // 2. tenant settings lookup
    ];

    await disputeService.processInboundEmail({
      from: 'client@test.com',
      to: `reply+${invoiceId}@replies.jaktra.com`,
      subject: 'Re: Collection Mail',
      text: 'I already paid this amount.',
    });

    expect(mockDisputeRepo.create).toHaveBeenCalledWith(expect.objectContaining({
      invoiceId,
      classification: 'dispute',
      confidence: '0.950',
      status: 'pending_review',
    }));
    expect(mockEventService.emitEvent).toHaveBeenCalledWith(
      'invoice',
      invoiceId,
      'tenant-123',
      'dispute.received',
      expect.any(Object),
      expect.any(Object)
    );
  });

  it('should drop email if the recipient does not match tracking sub-address pattern', async () => {
    mockDbResults = [];

    await disputeService.processInboundEmail({
      from: 'client@test.com',
      to: 'billing@company.com',
      subject: 'Re: Unpaid Bills',
      text: 'Here is my reply.',
    });

    expect(mockDisputeRepo.create).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('did not match tracking sub-address pattern'));
  });

  it('should drop email if sub-address matches pattern but invoice ID is not found in database', async () => {
    const invalidInvoiceId = '123e4567-e89b-12d3-a456-426614174000';
    mockDbResults = [
      [], // sub-address invoice lookup returns nothing (not found)
    ];

    await disputeService.processInboundEmail({
      from: 'client@test.com',
      to: `reply+${invalidInvoiceId}@replies.jaktra.com`,
      subject: 'Re: Collection Mail',
      text: 'I already paid this amount.',
    });

    expect(mockDisputeRepo.create).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('was not found — dropping'));
  });

  it('should drop email if tenant settings has inboundBlockedByAdmin = true even with a valid invoice match', async () => {
    const invoiceId = '123e4567-e89b-12d3-a456-426614174000';
    mockDbResults = [
      [{ id: invoiceId, tenantId: 'tenant-123', clientName: 'Client Acme', invoiceAmount: 100, invoiceNo: 'INV-001', dueDate: '2026-07-30', contactEmail: 'client@test.com' }], // 1. invoice lookup
      [{ inboundBlockedByAdmin: true }], // 2. tenant settings lookup (blocked!)
    ];

    await disputeService.processInboundEmail({
      from: 'client@test.com',
      to: `reply+${invoiceId}@replies.jaktra.com`,
      subject: 'Re: Collection Mail',
      text: 'I already paid this amount.',
    });

    expect(mockDisputeRepo.create).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('is blocked by admin — dropping'));
  });

  it('should drop email if sender email does not match contact email and log security warning', async () => {
    const invoiceId = '123e4567-e89b-12d3-a456-426614174000';
    mockDbResults = [
      [{ id: invoiceId, tenantId: 'tenant-123', clientName: 'Client Acme', invoiceAmount: 100, invoiceNo: 'INV-001', dueDate: '2026-07-30', contactEmail: 'client@test.com' }], // 1. invoice lookup
    ];

    await disputeService.processInboundEmail({
      from: 'attacker@evil.com',
      to: `reply+${invoiceId}@replies.jaktra.com`,
      subject: 'Fake dispute',
      text: 'I will dispute this invoice',
    });

    expect(mockDisputeRepo.create).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Security Warning: Inbound email sender domain'));
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('evil.com'));
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('test.com'));
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining(invoiceId));
  });

  it('should match inbound reply if sender email matches contact email with casing and whitespace differences', async () => {
    const invoiceId = '123e4567-e89b-12d3-a456-426614174000';
    mockDbResults = [
      [{ id: invoiceId, tenantId: 'tenant-123', clientName: 'Client Acme', invoiceAmount: 100, invoiceNo: 'INV-001', dueDate: '2026-07-30', contactEmail: 'Client@Test.com  ' }], // 1. invoice lookup
      [{ inboundBlockedByAdmin: false }], // 2. tenant settings lookup
    ];

    await disputeService.processInboundEmail({
      from: '  client@test.com',
      to: `reply+${invoiceId}@replies.jaktra.com`,
      subject: 'Re: Collection Mail',
      text: 'I already paid this amount.',
    });

    expect(mockDisputeRepo.create).toHaveBeenCalledWith(expect.objectContaining({
      invoiceId,
      classification: 'dispute',
      confidence: '0.950',
      status: 'pending_review',
    }));
  });

  it('should match inbound reply if sender email is a different address on the same domain', async () => {
    const invoiceId = '123e4567-e89b-12d3-a456-426614174000';
    mockDbResults = [
      [{ id: invoiceId, tenantId: 'tenant-123', clientName: 'Client Acme', invoiceAmount: 100, invoiceNo: 'INV-001', dueDate: '2026-07-30', contactEmail: 'billing@test.com' }], // 1. invoice lookup
      [{ inboundBlockedByAdmin: false }], // 2. tenant settings lookup
    ];

    await disputeService.processInboundEmail({
      from: 'ap-dept@test.com',
      to: `reply+${invoiceId}@replies.jaktra.com`,
      subject: 'Re: Collection Mail',
      text: 'Disputing this amount.',
    });

    expect(mockDisputeRepo.create).toHaveBeenCalledWith(expect.objectContaining({
      invoiceId,
      classification: 'dispute',
      confidence: '0.950',
      status: 'pending_review',
    }));
  });


  describe('Dispute Inbound Email Rate Limiting', () => {
    let testRedis: any;
    let localDisputeService: DisputeService;

    beforeEach(() => {
      testRedis = makeRedis();
      localDisputeService = new DisputeService(
        mockDisputeRepo,
        mockAimlService,
        mockDbQueryChain,
        mockCommRepo,
        mockCommService,
        mockEventService,
        testRedis
      );
    });

    it('should process normally (happy path) when counts are below threshold', async () => {
      const invoiceId = '123e4567-e89b-12d3-a456-426614174000';
      mockDbResults = [
        [{ id: invoiceId, tenantId: 'tenant-123', clientName: 'Client Acme', invoiceAmount: 100, invoiceNo: 'INV-001', dueDate: '2026-07-30', contactEmail: 'client@test.com' }], // 1. invoice lookup
        [{ inboundBlockedByAdmin: false }], // 2. tenant settings lookup
      ];

      await localDisputeService.processInboundEmail({
        from: 'client@test.com',
        to: `reply+${invoiceId}@replies.jaktra.com`,
        subject: 'Re: Collection Mail',
        text: 'I already paid this amount.',
      });

      expect(mockDisputeRepo.create).toHaveBeenCalled();
      expect(testRedis.incr).toHaveBeenCalledWith(`dispute_rate_limit:tenant:tenant-123`);
      expect(testRedis.incr).toHaveBeenCalledWith(`dispute_rate_limit:tenant:tenant-123:sender:client@test.com`);
      
      // Verify TTL of 3600 was set
      expect(testRedis.expire).toHaveBeenCalledWith(`dispute_rate_limit:tenant:tenant-123`, 3600);
      expect(testRedis.expire).toHaveBeenCalledWith(`dispute_rate_limit:tenant:tenant-123:sender:client@test.com`, 3600);
    });

    it('should drop email if tenant rate limit is exceeded', async () => {
      const invoiceId = '123e4567-e89b-12d3-a456-426614174000';
      mockDbResults = [
        [{ id: invoiceId, tenantId: 'tenant-123', clientName: 'Client Acme', invoiceAmount: 100, invoiceNo: 'INV-001', dueDate: '2026-07-30', contactEmail: 'client@test.com' }], // 1. invoice lookup
      ];

      // Seed the tenant count to threshold (100)
      testRedis._store[`dispute_rate_limit:tenant:tenant-123`] = { value: '100' };

      await localDisputeService.processInboundEmail({
        from: 'client@test.com',
        to: `reply+${invoiceId}@replies.jaktra.com`,
        subject: 'Re: Collection Mail',
        text: 'I already paid this amount.',
      });

      expect(mockDisputeRepo.create).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Inbound email rate-limited for tenant tenant-123 and sender domain test.com: count 100 exceeded threshold 100')
      );
    });

    it('should drop email if sender rate limit is exceeded', async () => {
      const invoiceId = '123e4567-e89b-12d3-a456-426614174000';
      mockDbResults = [
        [{ id: invoiceId, tenantId: 'tenant-123', clientName: 'Client Acme', invoiceAmount: 100, invoiceNo: 'INV-001', dueDate: '2026-07-30', contactEmail: 'client@test.com' }], // 1. invoice lookup
      ];

      // Seed the sender count to threshold (15)
      testRedis._store[`dispute_rate_limit:tenant:tenant-123:sender:client@test.com`] = { value: '15' };

      await localDisputeService.processInboundEmail({
        from: 'client@test.com',
        to: `reply+${invoiceId}@replies.jaktra.com`,
        subject: 'Re: Collection Mail',
        text: 'I already paid this amount.',
      });

      expect(mockDisputeRepo.create).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Inbound email rate-limited for tenant tenant-123 and sender domain test.com: count 15 exceeded threshold 15')
      );
    });

    it('should fail open when Redis client is unavailable (isOpen === false)', async () => {
      const invoiceId = '123e4567-e89b-12d3-a456-426614174000';
      mockDbResults = [
        [{ id: invoiceId, tenantId: 'tenant-123', clientName: 'Client Acme', invoiceAmount: 100, invoiceNo: 'INV-001', dueDate: '2026-07-30', contactEmail: 'client@test.com' }], // 1. invoice lookup
        [{ inboundBlockedByAdmin: false }], // 2. tenant settings lookup
      ];

      testRedis.isOpen = false;

      await localDisputeService.processInboundEmail({
        from: 'client@test.com',
        to: `reply+${invoiceId}@replies.jaktra.com`,
        subject: 'Re: Collection Mail',
        text: 'I already paid this amount.',
      });

      expect(mockDisputeRepo.create).toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledWith(
        expect.objectContaining({ tenantId: 'tenant-123' }),
        expect.stringContaining('Redis unavailable for dispute rate limiting — failing open')
      );
    });

    it('should fail open when Redis throws an unexpected error during get', async () => {
      const invoiceId = '123e4567-e89b-12d3-a456-426614174000';
      mockDbResults = [
        [{ id: invoiceId, tenantId: 'tenant-123', clientName: 'Client Acme', invoiceAmount: 100, invoiceNo: 'INV-001', dueDate: '2026-07-30', contactEmail: 'client@test.com' }], // 1. invoice lookup
        [{ inboundBlockedByAdmin: false }], // 2. tenant settings lookup
      ];

      testRedis.get.mockRejectedValue(new Error('Redis connection lost'));

      await localDisputeService.processInboundEmail({
        from: 'client@test.com',
        to: `reply+${invoiceId}@replies.jaktra.com`,
        subject: 'Re: Collection Mail',
        text: 'I already paid this amount.',
      });

      expect(mockDisputeRepo.create).toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          err: 'Redis connection lost',
          tenantId: 'tenant-123',
        }),
        expect.stringContaining('Redis error during dispute rate limiting — failing open')
      );
    });
  });
});

describe('DisputeService Approve & Discard Actions', () => {
  let disputeService: DisputeService;
  let mockDisputeRepo: any;
  let mockCommService: any;
  let mockEventService: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDisputeRepo = {
      findById: vi.fn().mockResolvedValue({
        id: 'dispute-123',
        tenantId: 'tenant-123',
        invoiceId: 'inv-123',
        sender: 'client@test.com',
        subject: 'Invoice amount wrong',
        suggestedResponse: 'Original AI response draft',
        status: 'pending_review',
      }),
      update: vi.fn().mockResolvedValue(true),
    };
    mockCommService = {
      send: vi.fn().mockResolvedValue(true),
    };
    mockEventService = {
      emitEvent: vi.fn().mockResolvedValue(true),
    };

    disputeService = new DisputeService(
      mockDisputeRepo,
      {} as any,
      {} as any,
      {} as any,
      mockCommService,
      mockEventService,
      null
    );
  });

  it('should approve, update state, send approved email, and log audit event', async () => {
    await disputeService.approveDispute(
      'dispute-123',
      'tenant-123',
      'Approved suggested text',
      { userId: 'user-manager', role: 'manager' } as unknown as ActorContext
    );

    expect(mockCommService.send).toHaveBeenCalledWith(expect.objectContaining({
      to: 'client@test.com',
      html: 'Approved suggested text',
      invoiceId: 'inv-123',
    }));
    expect(mockDisputeRepo.update).toHaveBeenCalledWith('dispute-123', expect.objectContaining({
      status: 'approved',
      suggestedResponse: 'Approved suggested text',
      reviewedBy: 'user-manager',
    }));
    expect(mockEventService.emitEvent).toHaveBeenCalledWith(
      'invoice',
      'inv-123',
      'tenant-123',
      'dispute.approved',
      { userId: 'user-manager', role: 'manager' },
      expect.any(Object)
    );
  });

  it('should discard dispute without sending mail and emit audit log', async () => {
    await disputeService.discardDispute(
      'dispute-123',
      'tenant-123',
      { userId: 'user-manager', role: 'manager' } as unknown as ActorContext
    );

    expect(mockCommService.send).not.toHaveBeenCalled();
    expect(mockDisputeRepo.update).toHaveBeenCalledWith('dispute-123', expect.objectContaining({
      status: 'discarded',
      reviewedBy: 'user-manager',
    }));
    expect(mockEventService.emitEvent).toHaveBeenCalledWith(
      'invoice',
      'inv-123',
      'tenant-123',
      'dispute.discarded',
      { userId: 'user-manager', role: 'manager' },
      expect.any(Object)
    );
  });
});

describe('WebhookController Inbound Parse Authentication Checks', () => {
  let controller: WebhookController;
  let mockDisputeService: any;
  let mockReq: any;
  let mockRes: any;

  beforeEach(() => {
    vi.clearAllMocks();
    config.SENDGRID_INBOUND_PARSE_SECRET = 'correct-secret-123';
    mockDisputeService = {
      processInboundEmail: vi.fn().mockResolvedValue(true),
    };
    controller = new WebhookController(
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      mockDisputeService
    );
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
  });

  it('should reject inbound request with invalid secret token by logging a warning and returning 200 OK ignored', async () => {
    mockReq = {
      params: { secretToken: 'bad-secret' },
      body: { from: 'client@test.com', to: 'reply@domain.com', subject: 'Hi' },
      ip: '10.0.0.1',
    };

    await controller.handleSendgridInbound(mockReq, mockRes, () => {});

    expect(logger.warn).toHaveBeenCalledWith(
      expect.objectContaining({ securityEvent: 'webhook_invalid_token' }),
      expect.stringContaining('invalid secret token'),
    );
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({ status: 'ignored', reason: 'not_processed' });
    expect(mockDisputeService.processInboundEmail).not.toHaveBeenCalled();
  });

  it('should accept inbound request with valid secret token and return 200 OK success', async () => {
    mockReq = {
      params: { secretToken: 'correct-secret-123' },
      body: { from: 'client@test.com', to: 'reply@domain.com', subject: 'Hi', text: 'body message' },
      ip: '10.0.0.1',
    };

    await controller.handleSendgridInbound(mockReq, mockRes, () => {});

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({ status: 'success' });
    expect(mockDisputeService.processInboundEmail).toHaveBeenCalledWith(expect.objectContaining({
      from: 'client@test.com',
      to: 'reply@domain.com',
      subject: 'Hi',
      text: 'body message',
    }));
  });

  it('should intercept test-token replies and update Redis status and never call processInboundEmail', async () => {
    const mockRedis = {
      isOpen: true,
      get: vi.fn().mockResolvedValue(JSON.stringify({
        tenantId: 'tenant-123',
        status: 'pending',
        expiresAt: Date.now() + 100000
      })),
      set: vi.fn().mockResolvedValue(true),
    };
    const mockSettingsRepo = {
      updateSettings: vi.fn().mockResolvedValue({}),
    };
    
    const testController = new WebhookController(
      {} as any,
      {} as any,
      {} as any,
      mockSettingsRepo as any,
      {} as any,
      mockDisputeService,
      mockRedis as any
    );

    mockReq = {
      params: { secretToken: 'correct-secret-123' },
      body: { from: 'admin@company.com', to: 'reply+test-abcdef12@replies.jaktra.com', subject: 'Re: Test' },
      ip: '10.0.0.1',
    };

    await testController.handleSendgridInbound(mockReq, mockRes, () => {});

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({ status: 'success', type: 'test' });
    expect(mockDisputeService.processInboundEmail).not.toHaveBeenCalled();
    
    await vi.waitFor(() => {
      expect(mockRedis.get).toHaveBeenCalledWith('reply_test:abcdef12');
      expect(mockRedis.set).toHaveBeenCalled();
      expect(mockSettingsRepo.updateSettings).toHaveBeenCalledWith('tenant-123', expect.objectContaining({
        dnsVerifiedAt: expect.any(Date),
      }));
    });
  });
});

describe('Dispute listPending Pagination Tests', () => {
  it('should call repository with limit and page params in DisputeService', async () => {
    const mockRepo = {
      listPending: vi.fn().mockResolvedValue({
        data: [],
        pagination: { total: 0, page: 1, limit: 25, totalPages: 0 }
      })
    };
    const service = new DisputeService(mockRepo as any, {} as any, {} as any, {} as any, {} as any, {} as any, null);
    const params = { page: 2, limit: 10 };
    await service.listPending('tenant-123', params);

    expect(mockRepo.listPending).toHaveBeenCalledWith('tenant-123', params);
  });

  it('should validate query params and apply defaults in DisputeController', async () => {
    const mockService = {
      listPending: vi.fn().mockResolvedValue({
        data: [{ id: 'dispute-1' }],
        pagination: { total: 1, page: 1, limit: 25, totalPages: 1 }
      })
    };
    const controller = new DisputeController(mockService as any);

    const req = {
      user: { tenantId: 'tenant-abc', userId: 'user-1' },
      query: {} // empty query to trigger defaults
    } as any;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    } as any;

    await controller.listPending(req, res, () => {});

    expect(mockService.listPending).toHaveBeenCalledWith('tenant-abc', { page: 1, limit: 25 });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      pagination: expect.objectContaining({ limit: 25, page: 1 })
    }));
  });

  it('should restrict limit parameter up to max 100 in DisputeController', async () => {
    const mockService = {
      listPending: vi.fn().mockResolvedValue({
        data: [],
        pagination: { total: 0, page: 1, limit: 100, totalPages: 0 }
      })
    };
    const controller = new DisputeController(mockService as any);

    const req = {
      user: { tenantId: 'tenant-abc', userId: 'user-1' },
      query: { limit: '999' } // tries to request high page size
    } as any;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    } as any;

    const next = vi.fn();

    await controller.listPending(req, res, next);

    // Zod will fail safeParse/parse because 999 exceeds max(100), passing to next(ValidationError)
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(mockService.listPending).not.toHaveBeenCalled();
  });
});

describe('SettingsService Inbound Verification Tests', () => {
  it('should verify test rate-limiting and token storage', async () => {
    const mockSettingsRepo = {
      getSettings: vi.fn().mockResolvedValue({ defaultEmailProvider: 'sendgrid' }),
      updateSettings: vi.fn(),
    };
    
    let count = 0;
    const mockRedis = {
      isOpen: true,
      get: vi.fn().mockImplementation(async (key: string) => {
        if (key.includes('rate_limit')) return count.toString();
        return null;
      }),
      set: vi.fn().mockResolvedValue(true),
      ttl: vi.fn().mockResolvedValue(3600),
    };

    const mockPlatformMailer = {
      sendInboundVerificationTestEmail: vi.fn().mockResolvedValue({ success: true }),
    } as unknown as PlatformMailer;

    const { SettingsService } = await import('../../../src/modules/settings/settings.service.js');
    const service = new SettingsService(mockSettingsRepo as any, mockRedis as any);
    
    // First 3 calls should succeed
    const res1 = await service.startInboundVerificationTest('tenant-123', 'admin@test.com', mockPlatformMailer);
    expect(res1.testId).toBeDefined();
    count++;

    const res2 = await service.startInboundVerificationTest('tenant-123', 'admin@test.com', mockPlatformMailer);
    expect(res2.testId).toBeDefined();
    count++;

    const res3 = await service.startInboundVerificationTest('tenant-123', 'admin@test.com', mockPlatformMailer);
    expect(res3.testId).toBeDefined();
    count++;

    // 4th call should throw rate limit error
    await expect(service.startInboundVerificationTest('tenant-123', 'admin@test.com', mockPlatformMailer))
      .rejects.toThrow('Too many verification test requests. Limit is 3 per hour.');
  });

  it('should compute status showing hasRealCapture takes precedence', async () => {
    const mockSettingsRepo = {
      getSettings: vi.fn().mockResolvedValue({ defaultEmailProvider: 'sendgrid', dnsVerifiedAt: null }),
      hasInboundEmails: vi.fn().mockResolvedValue(true),
    };
    
    const { SettingsService } = await import('../../../src/modules/settings/settings.service.js');
    const service = new SettingsService(mockSettingsRepo as any, null);
    const status = await service.getInboundVerificationStatus('tenant-123');
    expect(status.hasRealCapture).toBe(true);
    expect(status.dnsVerifiedAt).toBeNull();
  });
});


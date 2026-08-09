import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DisputeService, timingSafeCompare, extractEmail } from '../../../src/modules/dispute/dispute.service.js';
import { DisputeController } from '../../../src/modules/dispute/dispute.controller.js';
import { SendgridWebhookController } from '../../../src/modules/webhook/sendgrid-webhook.controller.js';
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
        replyMode: 'webhook_only',
        inboundDomain: 'test.com',
        inboundParseVerified: true,
      }),
      create: vi.fn().mockResolvedValue({ id: 'comm-123' }),
      createReplyToken: vi.fn().mockResolvedValue({ tokenHash: 'mock-hash' }),
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

    const mockIntegrationService = {
      getActiveEmailIntegration: vi.fn().mockResolvedValue({
        base: {
          id: 'integ-1',
          tenantId: 'tenant-123',
          provider: 'sendgrid',
          senderName: 'Test Sender',
          senderEmail: 'sender@test.com',
          replyTo: 'custom-reply@test.com',
          overallStatus: 'active',
          isActive: true,
        },
        detail: {
          replyMode: 'webhook_only',
          inboundDomain: 'test.com',
          inboundParseVerified: true,
        },
      }),
      getEffectiveSenderConfig: vi.fn().mockResolvedValue({
        senderName: 'Test Sender',
        senderEmail: 'sender@test.com',
        replyTo: 'custom-reply@test.com',
      }),
    } as any;

    commService = new CommunicationService(
      mockCommRepo,
      mockInvoiceRepo,
      mockTenantMailer,
      mockPortalService,
      mockEventService,
      mockDlqRepo,
      mockIntegrationService
    );
  });

  it('should sub-address replyTo using tenant replyTo domain when invoiceId is present', async () => {
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
        replyTo: expect.stringMatching(/^r_[a-zA-Z0-9_-]+@test\.com$/),
      }),
      { invoiceId }
    );
  });

  it('should fallback to INBOUND_PARSE_DOMAIN if sender email domain is not available', async () => {
    config.INBOUND_PARSE_DOMAIN = 'replies.jaktra.site';
    mockCommRepo.getSettings.mockResolvedValueOnce({
      senderName: 'Test Sender',
      senderEmail: 'invalid-no-domain',
      replyTo: null,
      defaultEmailProvider: 'sendgrid',
      replyMode: 'webhook_only',
      inboundDomain: null,
      inboundParseVerified: true,
    });
    (commService as any).integrationService.getActiveEmailIntegration = vi.fn().mockResolvedValue({
      base: {
        id: 'integ-1',
        tenantId: 'tenant-123',
        provider: 'sendgrid',
        senderName: 'Test Sender',
        senderEmail: 'invalid-no-domain',
        replyTo: null,
        overallStatus: 'active',
        isActive: true,
      },
      detail: {
        replyMode: 'webhook_only',
        inboundDomain: null,
        inboundParseVerified: true,
      },
    });
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
        replyTo: expect.stringMatching(/^r_[a-zA-Z0-9_-]+@replies\.jaktra\.site$/),
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
        reasoning: 'Customer disputes billing amount.',
      }),
      generateDisputeDraft: vi.fn().mockResolvedValue({
        suggestedResponse: 'Drafted response from instruction',
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
      to: `reply+${invoiceId}@replies.jaktra.site`,
      subject: 'Re: Collection Mail',
      text: 'I already paid this amount.',
    });

    expect(mockDisputeRepo.create).toHaveBeenCalledWith(expect.objectContaining({
      invoiceId,
      classification: 'dispute',
      confidence: '0.950',
      status: 'pending',
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
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('did not match tracking sub-address or token pattern'));
  });

  it('should drop email if sub-address matches pattern but invoice ID is not found in database', async () => {
    const invalidInvoiceId = '123e4567-e89b-12d3-a456-426614174000';
    mockDbResults = [
      [], // sub-address invoice lookup returns nothing (not found)
    ];

    await disputeService.processInboundEmail({
      from: 'client@test.com',
      to: `reply+${invalidInvoiceId}@replies.jaktra.site`,
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
      to: `reply+${invoiceId}@replies.jaktra.site`,
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
      to: `reply+${invoiceId}@replies.jaktra.site`,
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
      to: `reply+${invoiceId}@replies.jaktra.site`,
      subject: 'Re: Collection Mail',
      text: 'I already paid this amount.',
    });

    expect(mockDisputeRepo.create).toHaveBeenCalledWith(expect.objectContaining({
      invoiceId,
      classification: 'dispute',
      confidence: '0.950',
      status: 'pending',
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
      to: `reply+${invoiceId}@replies.jaktra.site`,
      subject: 'Re: Collection Mail',
      text: 'Disputing this amount.',
    });

    expect(mockDisputeRepo.create).toHaveBeenCalledWith(expect.objectContaining({
      invoiceId,
      classification: 'dispute',
      confidence: '0.950',
      status: 'pending',
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
        to: `reply+${invoiceId}@replies.jaktra.site`,
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
        to: `reply+${invoiceId}@replies.jaktra.site`,
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
        to: `reply+${invoiceId}@replies.jaktra.site`,
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
        to: `reply+${invoiceId}@replies.jaktra.site`,
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
        to: `reply+${invoiceId}@replies.jaktra.site`,
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
      status: 'resolved',
      reviewedBy: 'user-manager',
    }));
    expect(mockEventService.emitEvent).toHaveBeenCalledWith(
      'invoice',
      'inv-123',
      'tenant-123',
      'dispute.resolved',
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
      status: 'archived',
      reviewedBy: 'user-manager',
    }));
    expect(mockEventService.emitEvent).toHaveBeenCalledWith(
      'invoice',
      'inv-123',
      'tenant-123',
      'dispute.archived',
      { userId: 'user-manager', role: 'manager' },
      expect.any(Object)
    );
  });
});

describe('SendgridWebhookController Inbound Parse Authentication Checks', () => {
  let controller: SendgridWebhookController;
  let mockDisputeService: any;
  let mockReq: any;
  let mockRes: any;

  const mockSettingsRepo = {
    findByWebhookToken: vi.fn(async (token: string) => {
      if (token === 'correct-secret-123') {
        return { tenantId: 'tenant-1', webhookToken: 'correct-secret-123' };
      }
      return null;
    }),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockDisputeService = {
      processInboundEmail: vi.fn().mockResolvedValue(true),
    };
    controller = new SendgridWebhookController(
      mockSettingsRepo as any,
      undefined,
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
      listDisputes: vi.fn().mockResolvedValue({
        data: [],
        pagination: { total: 0, page: 1, limit: 25, totalPages: 0 }
      }),
      listPending: vi.fn().mockResolvedValue({
        data: [],
        pagination: { total: 0, page: 1, limit: 25, totalPages: 0 }
      })
    };
    const controller = new DisputeController(mockService as any);

    const req = {
      user: { tenantId: 'tenant-abc' },
      query: {} // empty query to trigger defaults
    } as any;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    } as any;

    await controller.listPending(req, res, () => {});

    expect(mockService.listDisputes).toHaveBeenCalledWith('tenant-abc', { status: 'pending', page: 1, limit: 25 });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      pagination: expect.objectContaining({ limit: 25, page: 1 })
    }));
  });

  it('should restrict limit parameter up to max 100 in DisputeController', async () => {
    const mockService = {
      listDisputes: vi.fn().mockResolvedValue({
        data: [],
        pagination: { total: 0, page: 1, limit: 100, totalPages: 0 }
      }),
      listPending: vi.fn().mockResolvedValue({
        data: [],
        pagination: { total: 0, page: 1, limit: 100, totalPages: 0 }
      })
    };
    const controller = new DisputeController(mockService as any);

    const req = {
      user: { tenantId: 'tenant-abc' },
      query: { limit: '999' }
    } as any;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    } as any;

    const next = vi.fn();

    await controller.listPending(req, res, next);

    // Zod will fail parse because 999 exceeds max(100), passing to next(ValidationError)
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(mockService.listDisputes).not.toHaveBeenCalled();
    expect(mockService.listPending).not.toHaveBeenCalled();
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import { ResendWebhookController } from '../../../src/modules/webhook/resend-webhook.controller.js';

vi.mock('../../../src/shared/logger.js', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    child: vi.fn(),
  },
}));

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

function mockRes(): Response {
  const res: Partial<Response> = {
    status: vi.fn().mockReturnThis() as any,
    json: vi.fn().mockReturnThis() as any,
  };
  return res as Response;
}

function makeReq(
  secretToken: string,
  ip = '1.2.3.4',
  body: Record<string, unknown> = {},
): Request {
  return {
    params: { secretToken },
    ip,
    body,
    headers: {},
  } as unknown as Request;
}

const VALID_SECRET = 'valid-resend-webhook-token-123456';
const INVALID_SECRET = 'invalid-token-xyz';

const mockSettingsRepo = {
  findByWebhookToken: vi.fn(async (token: string) => {
    if (token === VALID_SECRET) {
      return { tenantId: 'tenant-resend-1', webhookToken: VALID_SECRET };
    }
    return null;
  }),
};

const mockDisputeService = {
  processInboundEmail: vi.fn().mockResolvedValue({ processed: true }),
};

describe('ResendWebhookController', () => {
  let controller: ResendWebhookController;
  let redis: any;

  beforeEach(() => {
    vi.clearAllMocks();
    redis = makeRedis();
    controller = new ResendWebhookController(
      mockSettingsRepo as any,
      mockDisputeService as any,
      redis,
    );
  });

  describe('handleResendInbound', () => {
    it('returns 200 ignored when secret token is invalid', async () => {
      const req = makeReq(INVALID_SECRET, '1.2.3.4', {
        type: 'email.received',
        data: { from: 'debtor@customer.com', to: ['r_abc@reply.acme.com'], subject: 'Dispute' },
      });
      const res = mockRes();

      await controller.handleResendInbound(req, res, vi.fn());

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: 'ignored', reason: 'not_processed' });
      expect(mockDisputeService.processInboundEmail).not.toHaveBeenCalled();
    });

    it('processes inbound email and forwards to disputeService when valid token is provided', async () => {
      const req = makeReq(VALID_SECRET, '1.2.3.4', {
        type: 'email.received',
        data: {
          from: 'debtor@customer.com',
          to: ['r_abc12345@reply.acme.com'],
          subject: 'Payment already made',
          text: 'Here is the receipt.',
          html: '<p>Here is the receipt.</p>',
        },
      });
      const res = mockRes();

      await controller.handleResendInbound(req, res, vi.fn());

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: 'success' });
      expect(mockDisputeService.processInboundEmail).toHaveBeenCalledWith({
        from: 'debtor@customer.com',
        to: 'r_abc12345@reply.acme.com',
        subject: 'Payment already made',
        text: 'Here is the receipt.',
        html: '<p>Here is the receipt.</p>',
      });
    });

    it('fetches email content using integrationService when payload contains email_id without body', async () => {
      const mockIntegrationService = {
        getDecryptedResendKey: vi.fn().mockResolvedValue('re_test_key_123'),
      };
      const controllerWithIntegration = new ResendWebhookController(
        mockSettingsRepo as any,
        mockDisputeService as any,
        redis,
        undefined,
        mockIntegrationService as any
      );

      // Mock global fetch for Resend Receiving API
      const originalFetch = global.fetch;
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ text: 'Fetched body from Resend API', html: '<p>Fetched body</p>' }),
      } as any);

      const req = makeReq(VALID_SECRET, '1.2.3.4', {
        type: 'email.received',
        data: {
          email_id: 're_received_msg_789',
          from: 'debtor@customer.com',
          to: ['r_abc12345@reply.acme.com'],
          subject: 'Payment dispute',
        },
      });
      const res = mockRes();

      await controllerWithIntegration.handleResendInbound(req, res, vi.fn());

      expect(res.status).toHaveBeenCalledWith(200);
      expect(mockDisputeService.processInboundEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'debtor@customer.com',
          to: 'r_abc12345@reply.acme.com',
          subject: 'Payment dispute',
          text: 'Fetched body from Resend API',
        })
      );

      global.fetch = originalFetch;
    });

    it('handles email.bounced with array tags in handleResendInbound', async () => {
      const mockCommService = {
        handleEmailEvent: vi.fn().mockResolvedValue(undefined),
      };
      const controllerWithComm = new ResendWebhookController(
        mockSettingsRepo as any,
        mockDisputeService as any,
        redis,
        mockCommService as any
      );

      const req = makeReq(VALID_SECRET, '1.2.3.4', {
        type: 'email.bounced',
        data: {
          email_id: 'msg_3ITJXkZiholG1IZAB7AY5FpOzTr',
          to: ['xstudfdfaud@gmail.com'],
          subject: 'Invoice #3933 from Test Company',
          tags: [
            { name: 'communication_id', value: 'comm-100' },
            { name: 'invoice_id', value: 'inv-3933' },
          ],
        },
      });
      const res = mockRes();

      await controllerWithComm.handleResendInbound(req, res, vi.fn());

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: 'success', event: 'email.bounced' });
      expect(mockCommService.handleEmailEvent).toHaveBeenCalledWith(
        'tenant-resend-1',
        'comm-100',
        'inv-3933',
        'bounced',
        expect.any(Date),
        expect.objectContaining({ email_id: 'msg_3ITJXkZiholG1IZAB7AY5FpOzTr' }),
        undefined
      );
    });

    it('handles email.bounced fallback to recipient lookup when tags are missing', async () => {
      const mockCommService = {
        handleEmailEvent: vi.fn().mockResolvedValue(undefined),
      };
      const mockCommRepo = {
        findRecentByRecipient: vi.fn().mockResolvedValue({
          id: 'comm-fallback-200',
          invoiceId: 'inv-fallback-3933',
        }),
      };
      const controllerWithFallback = new ResendWebhookController(
        mockSettingsRepo as any,
        mockDisputeService as any,
        redis,
        mockCommService as any,
        undefined,
        mockCommRepo as any
      );

      const req = makeReq(VALID_SECRET, '1.2.3.4', {
        type: 'email.bounced',
        data: {
          email_id: 'msg_3ITJXkZiholG1IZAB7AY5FpOzTr',
          to: ['xstudfdfaud@gmail.com'],
          subject: 'Invoice #3933 from Test Company',
        },
      });
      const res = mockRes();

      await controllerWithFallback.handleResendInbound(req, res, vi.fn());

      expect(mockCommRepo.findRecentByRecipient).toHaveBeenCalledWith(
        'tenant-resend-1',
        'xstudfdfaud@gmail.com'
      );
      expect(mockCommService.handleEmailEvent).toHaveBeenCalledWith(
        'tenant-resend-1',
        'comm-fallback-200',
        'inv-fallback-3933',
        'bounced',
        expect.any(Date),
        expect.objectContaining({ email_id: 'msg_3ITJXkZiholG1IZAB7AY5FpOzTr' }),
        undefined
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('rate limits after 15 invalid token attempts', async () => {
      redis = makeRedis({
        get: vi.fn(async () => '15'),
      });
      controller = new ResendWebhookController(
        mockSettingsRepo as any,
        mockDisputeService as any,
        redis,
      );

      const req = makeReq(INVALID_SECRET, '1.2.3.4', {});
      const res = mockRes();

      await controller.handleResendInbound(req, res, vi.fn());

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: 'ignored', reason: 'not_processed' });
      expect(mockSettingsRepo.findByWebhookToken).not.toHaveBeenCalled();
    });
  });

  describe('handleResendEvents', () => {
    it('returns 200 success for delivery events', async () => {
      const req = makeReq('', '1.2.3.4', {
        type: 'email.delivered',
        data: { email_id: 're_msg_123' },
      });
      const res = mockRes();

      await controller.handleResendEvents(req, res, vi.fn());

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: 'success' });
    });

    it('dispatches bounce event to communicationService when email.bounced received', async () => {
      const mockCommService = {
        handleEmailEvent: vi.fn().mockResolvedValue(undefined),
      };
      const controllerWithComm = new ResendWebhookController(
        mockSettingsRepo as any,
        mockDisputeService as any,
        redis,
        mockCommService as any
      );

      const req = makeReq('', '1.2.3.4', {
        type: 'email.bounced',
        data: {
          email_id: 're_msg_bounced',
          created_at: '2026-08-15T00:00:00.000Z',
          communication_id: 'comm-123',
          invoice_id: 'inv-456',
          tenant_id: 'tenant-resend-1',
          run_id: 'run-789',
        },
      });
      const res = mockRes();

      await controllerWithComm.handleResendEvents(req, res, vi.fn());

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: 'success' });
      expect(mockCommService.handleEmailEvent).toHaveBeenCalledWith(
        'tenant-resend-1',
        'comm-123',
        'inv-456',
        'bounced',
        expect.any(Date),
        expect.objectContaining({ email_id: 're_msg_bounced' }),
        'run-789'
      );
    });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PaymentService } from '../../../src/modules/payment/payment.service.js';
import { logger } from '../../../src/shared/logger.js';

vi.mock('../../../src/shared/logger.js', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn()
  }
}));

describe('PaymentService', () => {
  let paymentService: PaymentService;
  let mockRepo: any;
  let mockInvoiceRepo: any;
  let mockIntegration: any;
  let mockFactory: any;
  let mockAdapter: any;
  let mockSettingsRepo: any;
  let mockEventRepo: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockRepo = {
      getActivePaymentLink: vi.fn(),
      insertPaymentLink: vi.fn(),
      insertPaymentLinkFallback: vi.fn(),
      cancelActiveLinks: vi.fn(),
      updateWebhookEventStatus: vi.fn(),
      insertWebhookEvent: vi.fn(),
      updatePaymentLinkStatus: vi.fn(),
      resolveSuccessfulPayment: vi.fn(),
    };

    mockInvoiceRepo = {
      findById: vi.fn(),
      updatePaymentStatus: vi.fn(),
    };

    mockIntegration = {
      getDecryptedRazorpayConfig: vi.fn().mockResolvedValue({
        keyId: 'test_key',
        keySecret: 'test_secret',
        webhookSecret: 'test_webhook_secret'
      })
    };

    mockAdapter = {
      createPaymentLink: vi.fn(),
      verifyWebhookSignature: vi.fn().mockReturnValue(true),
      parseWebhookEvent: vi.fn()
    };

    mockSettingsRepo = {
      getSettings: vi.fn(),
    };

    mockEventRepo = {
      create: vi.fn()
    };

    mockFactory = {
      getAdapter: vi.fn().mockReturnValue(mockAdapter)
    };

    paymentService = new PaymentService(
      mockRepo as any,
      mockInvoiceRepo as any,
      mockIntegration as any,
      mockFactory as any,
      mockSettingsRepo as any,
      mockEventRepo as any
    );
  });

  describe('Webhook Idempotency', () => {
    it('returns status: ignored if duplicate webhook event id throws 23505', async () => {
      mockAdapter.parseWebhookEvent.mockReturnValue({
        invoiceId: 'inv_123',
        amount: 10000,
        currency: 'INR',
        externalRefId: 'pay_xyz',
        status: 'captured'
      });

      mockRepo.insertWebhookEvent.mockRejectedValue({ code: '23505' });

      const result = await paymentService.processPaymentCaptured(
        'tenant_1',
        'razorpay',
        { event_id: 'evt_123' },
        Buffer.from(''),
        'sig'
      );

      expect(result).toEqual({ status: 'ignored' });
      expect(mockRepo.insertWebhookEvent).toHaveBeenCalled();
    });
  });

  describe('Concurrent Generation', () => {
    it('handles duplicate key error 23505 and re-fetches active link', async () => {
      // simulate db returning an invoice
      mockInvoiceRepo.findById.mockResolvedValueOnce({
        id: 'inv_123',
        tenantId: 'tenant_1',
        invoiceAmount: '100.00',
        currency: 'INR',
        invoiceNo: 'INV-1'
      });

      mockRepo.getActivePaymentLink
        .mockResolvedValueOnce(null) // first try: not found
        .mockResolvedValueOnce({ paymentUrl: 'https://pay.link/concurrent' }); // second try: found

      mockAdapter.createPaymentLink.mockResolvedValue({
        providerPaymentLinkId: 'plink_123',
        providerOrderId: null,
        paymentUrl: 'https://pay.link/new'
      });

      mockRepo.insertPaymentLink.mockRejectedValue({ code: '23505' });

      const url = await paymentService.getOrGeneratePaymentLink('tenant_1', 'inv_123', 'razorpay');

      expect(url).toBe('https://pay.link/concurrent');
      expect(mockRepo.insertPaymentLink).toHaveBeenCalled();
      expect(mockRepo.getActivePaymentLink).toHaveBeenCalledWith('tenant_1', 'inv_123', 'razorpay');
    });

    it('saves a fallback payment link if provider throws error', async () => {
      mockRepo.getActivePaymentLink.mockResolvedValueOnce(null);
      mockInvoiceRepo.findById.mockResolvedValueOnce({
        id: 'inv_123',
        tenantId: 'tenant_1',
        invoiceAmount: '100.00',
        currency: 'INR',
        invoiceNo: 'INV-1'
      });
      mockAdapter.createPaymentLink.mockRejectedValue(new Error('Provider down'));
      mockSettingsRepo.getSettings.mockResolvedValueOnce({ paymentLink: 'https://fallback.link' });

      const url = await paymentService.getOrGeneratePaymentLink('tenant_1', 'inv_123', 'razorpay');

      expect(url).toBe('https://fallback.link');
      // Must use the fallback-safe method, not the strict insert
      expect(mockRepo.insertPaymentLinkFallback).toHaveBeenCalledWith(expect.objectContaining({
        paymentUrl: 'https://fallback.link',
        providerPaymentLinkId: expect.stringMatching(/^fallback-/)
      }));
      expect(mockRepo.insertPaymentLink).not.toHaveBeenCalled();
    });
  });

  describe('Tenant Isolation', () => {
    it('returns error if invoice belongs to a different tenant', async () => {
      mockAdapter.parseWebhookEvent.mockReturnValue({
        invoiceId: 'inv_123',
        amount: 10000,
        currency: 'INR',
        externalRefId: 'pay_xyz',
        status: 'captured'
      });

      // simulate db returning an invoice for tenant_2
      mockInvoiceRepo.findById.mockResolvedValueOnce({
        id: 'inv_123',
        tenantId: 'tenant_2', // mismatch
        invoiceAmount: '100.00',
        currency: 'INR',
        paymentStatus: 'Pending'
      });

      const result = await paymentService.processPaymentCaptured(
        'tenant_1',
        'razorpay',
        { event_id: 'evt_123' },
        Buffer.from(''),
        'sig'
      );

      expect(result).toEqual({ status: 'error', message: 'Tenant mismatch' });
    });
  });

  describe('Amount Mismatch', () => {
    it('returns error if webhook amount does not match invoice amount', async () => {
      mockAdapter.parseWebhookEvent.mockReturnValue({
        invoiceId: 'inv_123',
        amount: 5000, // Partial payment
        currency: 'INR',
        externalRefId: 'pay_xyz',
        status: 'captured'
      });

      mockInvoiceRepo.findById.mockResolvedValueOnce({
        id: 'inv_123',
        tenantId: 'tenant_1',
        invoiceAmount: '100.00', // expecting 10000 cents
        currency: 'INR',
        paymentStatus: 'Pending'
      });

      const result = await paymentService.processPaymentCaptured(
        'tenant_1',
        'razorpay',
        { event_id: 'evt_123' },
        Buffer.from(''),
        'sig'
      );

      expect(result).toEqual({ status: 'error', message: 'Amount mismatch' });
      expect(mockEventRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        eventType: 'payment_webhook_failed'
      }));
    });

    it('processes zero-decimal currency (JPY) correctly without multiplying by 100', async () => {
      mockAdapter.parseWebhookEvent.mockReturnValue({
        invoiceId: 'inv_jpy',
        amount: 1500, // 1500 JPY
        currency: 'JPY',
        externalRefId: 'pay_xyz',
        status: 'captured'
      });

      mockInvoiceRepo.findById.mockResolvedValueOnce({
        id: 'inv_jpy',
        tenantId: 'tenant_1',
        invoiceAmount: '1500.00', // expecting 1500
        currency: 'JPY',
        paymentStatus: 'Pending'
      });

      mockRepo.resolveSuccessfulPayment.mockResolvedValueOnce({ status: 'processed' });

      const result = await paymentService.processPaymentCaptured(
        'tenant_1',
        'razorpay',
        { event_id: 'evt_123' },
        Buffer.from(''),
        'sig'
      );

      expect(result).toEqual({ status: 'processed' });
    });
  });

  describe('Unsupported Events', () => {
    it('inserts unsupported webhook event with status ignored and returns ignored', async () => {
      mockAdapter.parseWebhookEvent.mockReturnValue(null); // unsupported

      const result = await paymentService.processPaymentCaptured(
        'tenant_1',
        'razorpay',
        { event_id: 'evt_unsupported' },
        Buffer.from(''),
        'sig'
      );

      expect(result).toEqual({ status: 'ignored' });
      expect(mockRepo.insertWebhookEvent).toHaveBeenCalledWith(expect.objectContaining({
        status: 'ignored',
        externalEventId: 'evt_unsupported'
      }));
    });
  });

  describe('Manual Mark-as-Paid Behavior', () => {
    it('calls repository to cancel active links', async () => {
      await paymentService.cancelActivePaymentLinks('tenant_1', 'inv_1');
      expect(mockRepo.cancelActiveLinks).toHaveBeenCalledWith('tenant_1', 'inv_1');
    });
  });

  describe('Fallback Link Transaction Safety', () => {
    const baseInvoice = {
      id: 'inv_123',
      tenantId: 'tenant_1',
      invoiceAmount: '100.00',
      currency: 'INR',
      invoiceNo: 'INV-1',
    };

    beforeEach(() => {
      mockRepo.getActivePaymentLink.mockResolvedValue(null);
      mockInvoiceRepo.findById.mockResolvedValue(baseInvoice);
      mockAdapter.createPaymentLink.mockRejectedValue(new Error('Provider down'));
      mockSettingsRepo.getSettings.mockResolvedValue({ paymentLink: 'https://fallback.link' });
    });

    it('returns the fallback URL even when a conflict already exists (no-op insert)', async () => {
      // Simulates .onConflictDoNothing() behaviour: no exception is thrown
      // and no row is returned — the existing active link wins silently.
      // The parent transaction (if any) is never aborted.
      mockRepo.insertPaymentLinkFallback.mockResolvedValue(undefined);

      const url = await paymentService.getOrGeneratePaymentLink('tenant_1', 'inv_123', 'razorpay');

      expect(url).toBe('https://fallback.link');
      expect(mockRepo.insertPaymentLinkFallback).toHaveBeenCalledTimes(1);
    });

    it('logs but does not re-throw a genuine (non-conflict) error from the fallback insert', async () => {
      const dbError = new Error('DB connection lost');
      mockRepo.insertPaymentLinkFallback.mockRejectedValue(dbError);

      // Must still resolve — fallback failure is non-fatal
      const url = await paymentService.getOrGeneratePaymentLink('tenant_1', 'inv_123', 'razorpay');

      expect(url).toBe('https://fallback.link');
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to save fallback payment link',
        expect.objectContaining({ error: dbError, tenantId: 'tenant_1', invoiceId: 'inv_123' })
      );
    });

    it('never calls the strict insertPaymentLink on the fallback path', async () => {
      mockRepo.insertPaymentLinkFallback.mockResolvedValue(undefined);

      await paymentService.getOrGeneratePaymentLink('tenant_1', 'inv_123', 'razorpay');

      // The strict insert (which throws on conflict and could abort a parent tx)
      // must never be invoked during the fallback path.
      expect(mockRepo.insertPaymentLink).not.toHaveBeenCalled();
    });
  });
});

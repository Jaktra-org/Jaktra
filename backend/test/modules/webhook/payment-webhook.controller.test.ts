import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WebhookController } from '../../../src/src/modules/webhook/webhook.controller.js';
import type { Request, Response } from 'express';
import { NotFoundError, ValidationError, AuthError } from '../../../src/src/shared/errors/index.js';

describe('WebhookController', () => {
  let controller: WebhookController;
  let mockPaymentService: any;
  let mockSettingsRepo: any;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: any;

  beforeEach(() => {
    mockPaymentService = {
      processPaymentCaptured: vi.fn(),
    };
    mockSettingsRepo = {
      findByWebhookToken: vi.fn(),
    };
    controller = new WebhookController(
      {} as any,
      {} as any,
      mockPaymentService as any,
      mockSettingsRepo as any
    );

    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    mockNext = vi.fn();
  });

  describe('handlePayment', () => {
    it('returns 404 if webhookToken or provider missing', async () => {
      mockReq = { params: {} };
      await controller.handlePayment(mockReq as Request, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
      expect(mockNext.mock.calls[0][0].message).toBe('Invalid webhook URL');
    });

    it('returns 404 if webhookToken is invalid', async () => {
      mockReq = { params: { webhookToken: 'invalid', provider: 'razorpay' } };
      mockSettingsRepo.findByWebhookToken.mockResolvedValue(null);
      await controller.handlePayment(mockReq as Request, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
      expect(mockNext.mock.calls[0][0].message).toBe('Invalid webhook URL');
    });

    it('returns 400 if missing body', async () => {
      mockReq = { params: { webhookToken: 'valid-token', provider: 'razorpay' }, body: undefined };
      mockSettingsRepo.findByWebhookToken.mockResolvedValue({ tenantId: '123e4567-e89b-12d3-a456-426614174000' });
      await controller.handlePayment(mockReq as Request, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
      expect(mockNext.mock.calls[0][0].message).toBe('Invalid request body');
    });

    it('returns 400 if signature missing', async () => {
      mockReq = {
        params: { webhookToken: 'valid-token', provider: 'razorpay' },
        body: Buffer.from('{}'),
        headers: {},
      };
      mockSettingsRepo.findByWebhookToken.mockResolvedValue({ tenantId: '123e4567-e89b-12d3-a456-426614174000' });
      await controller.handlePayment(mockReq as Request, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
      expect(mockNext.mock.calls[0][0].message).toBe('Missing signature');
    });

    it('returns 401 if signature validation fails', async () => {
      mockReq = {
        params: { webhookToken: 'valid-token', provider: 'razorpay' },
        body: Buffer.from('{}'),
        headers: { 'x-razorpay-signature': 'invalid-sig' },
      };
      mockSettingsRepo.findByWebhookToken.mockResolvedValue({ tenantId: '123e4567-e89b-12d3-a456-426614174000' });
      mockPaymentService.processPaymentCaptured.mockRejectedValue(new Error('Invalid signature'));

      await controller.handlePayment(mockReq as Request, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.any(AuthError));
      expect(mockNext.mock.calls[0][0].message).toBe('Invalid signature');
    });

    it('returns 200 { status: "ignored" } for duplicate/unsupported events', async () => {
      mockReq = {
        params: { webhookToken: 'valid-token', provider: 'razorpay' },
        body: Buffer.from('{}'),
        headers: { 'x-razorpay-signature': 'valid-sig' },
      };
      mockSettingsRepo.findByWebhookToken.mockResolvedValue({ tenantId: '123e4567-e89b-12d3-a456-426614174000' });
      mockPaymentService.processPaymentCaptured.mockResolvedValue({ status: 'ignored' });

      await controller.handlePayment(mockReq as Request, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ status: 'ignored' });
    });

    it('returns 200 on successful payment capture', async () => {
      mockReq = {
        params: { webhookToken: 'valid-token', provider: 'razorpay' },
        body: Buffer.from('{}'),
        headers: { 'x-razorpay-signature': 'valid-sig' },
      };
      mockSettingsRepo.findByWebhookToken.mockResolvedValue({ tenantId: '123e4567-e89b-12d3-a456-426614174000' });
      mockPaymentService.processPaymentCaptured.mockResolvedValue({ status: 'success' });

      await controller.handlePayment(mockReq as Request, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ status: 'success' });
    });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import { InvoiceController } from '../../../src/modules/invoice/invoice.controller.js';
import type { InvoiceImportService } from '../../../src/modules/invoice/invoice.service.js';
import type { InvoiceRepository } from '../../../src/modules/invoice/invoice.repository.js';
import type { PaymentService } from '../../../src/modules/payment/payment.service.js';
import type { EventService } from '../../../src/modules/event/event.service.js';
import type { DlqService } from '../../../src/modules/dlq/dlq.service.js';
import type { CommunicationRepository } from '../../../src/modules/communication/communication.repository.js';
import type { PortalService } from '../../../src/modules/portal/portal.service.js';
import { ValidationError, NotFoundError } from '../../../src/shared/errors/index.js';

function mockRes(tenantId = 'tenant-123'): Response {
  const res: Partial<Response> = {
    status: vi.fn().mockReturnThis() as any,
    json: vi.fn().mockReturnThis() as any,
    locals: { tenantId },
  };
  return res as Response;
}

function authReq(
  body: any = {},
  query: any = {},
  params: any = {},
  user: any = { userId: 'u1', tenantId: 'tenant-123', name: 'User', email: 'u@example.com', role: 'manager' }
): Request {
  return { body, query, params, user } as unknown as Request;
}

describe('InvoiceController', () => {
  let importService: InvoiceImportService;
  let invoiceRepo: InvoiceRepository;
  let paymentService: PaymentService;
  let eventService: EventService;
  let dlqService: DlqService;
  let communicationRepo: CommunicationRepository;
  let controller: InvoiceController;

  beforeEach(() => {
    importService = {
      importFromFile: vi.fn(),
    } as unknown as InvoiceImportService;

    invoiceRepo = {
      db: {
        transaction: vi.fn((cb) => cb(null)),
      },
      upsertByInvoiceNo: vi.fn(),
      createMany: vi.fn(),
      findMany: vi.fn(),
      findTrashed: vi.fn(),
      findById: vi.fn(),
      findByIdIncludingTrashed: vi.fn(),
      update: vi.fn(),
      updatePaymentStatus: vi.fn(),
      softDelete: vi.fn(),
      hardDelete: vi.fn(),
      restore: vi.fn(),
    } as unknown as InvoiceRepository;

    paymentService = {
      getLatestPaymentLink: vi.fn(),
      cancelActivePaymentLinks: vi.fn(),
      getOrGeneratePaymentLink: vi.fn(),
    } as unknown as PaymentService;

    eventService = {
      emitEvent: vi.fn(),
      logEvent: vi.fn(),
    } as unknown as EventService;

    dlqService = {
      getDlqEntries: vi.fn().mockResolvedValue([]),
    } as unknown as DlqService;

    communicationRepo = {
      getSettings: vi.fn().mockResolvedValue({ dlqThreshold: 3 }),
    } as unknown as CommunicationRepository;

    const portalService = {
      getOrCreatePortalLink: vi.fn(),
      resolveAndValidateToken: vi.fn(),
      recordViewIfNeeded: vi.fn(),
    } as unknown as PortalService;

    controller = new InvoiceController(
      importService,
      invoiceRepo,
      paymentService,
      eventService,
      dlqService,
      communicationRepo,
      portalService
    );
  });

  describe('importFromCsv', () => {
    it('throws ValidationError if no file is provided', async () => {
      const req = authReq();
      const res = mockRes();
      const next = vi.fn();

      await controller.importFromCsv(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    });

    it('processes file and returns result on success', async () => {
      const req = authReq() as any;
      req.file = {
        buffer: Buffer.from('csv content'),
        originalname: 'invoices.csv',
        size: 100,
      };
      const res = mockRes();
      const next = vi.fn();

      const mockResult = { imported: 5, updated: 2, skipped: 0, errors: [] };
      vi.mocked(importService.importFromFile).mockResolvedValue(mockResult);

      await controller.importFromCsv(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResult);
      expect(eventService.logEvent).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('creates or upserts a new invoice successfully', async () => {
      const payload = {
        invoiceNo: 'INV-001',
        clientName: 'Client 1',
        invoiceAmount: 100,
        dueDate: '2026-08-01',
        contactEmail: 'client@example.com',
        paymentStatus: 'Pending',
      };
      const req = authReq(payload);
      const res = mockRes();
      const next = vi.fn();

      const mockInvoice = { id: 'inv-123', ...payload, invoiceAmount: '100' };
      vi.mocked(invoiceRepo.upsertByInvoiceNo).mockResolvedValue({
        wasUpdated: false,
        invoice: mockInvoice,
      } as any);

      await controller.create(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockInvoice);
      expect(eventService.emitEvent).toHaveBeenCalledWith(
        'invoice',
        'inv-123',
        'tenant-123',
        'invoice.created',
        expect.any(Object),
        expect.any(Object)
      );
    });
  });

  describe('getById', () => {
    it('returns invoice if it belongs to requesting tenant', async () => {
      const mockInvoice = { id: 'inv-123', tenantId: 'tenant-123', dueDate: new Date(), paymentStatus: 'Pending', contactEmail: 'c@example.com' };
      vi.mocked(invoiceRepo.findById).mockResolvedValue(mockInvoice as any);
      vi.mocked(paymentService.getLatestPaymentLink).mockResolvedValue({ paymentUrl: 'http://pay.me', status: 'active' } as any);

      const req = authReq({}, {}, { id: 'inv-123' });
      const res = mockRes('tenant-123');
      const next = vi.fn();

      await controller.getById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        id: 'inv-123',
        tenantId: 'tenant-123',
      }));
    });

    it('returns NotFoundError (404) if invoice belongs to a different tenant', async () => {
      const mockInvoice = { id: 'inv-123', tenantId: 'tenant-other', dueDate: new Date(), paymentStatus: 'Pending', contactEmail: 'c@example.com' };
      vi.mocked(invoiceRepo.findById).mockResolvedValue(mockInvoice as any);

      const req = authReq({}, {}, { id: 'inv-123' });
      const res = mockRes('tenant-123');
      const next = vi.fn();

      await controller.getById(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('cancels active payment links if invoiceAmount is updated', async () => {
      const mockInvoice = { id: 'inv-123', tenantId: 'tenant-123', invoiceAmount: '100' };
      vi.mocked(invoiceRepo.findById).mockResolvedValue(mockInvoice as any);
      vi.mocked(invoiceRepo.update).mockResolvedValue({ ...mockInvoice, invoiceAmount: '200' } as any);

      const req = authReq({ invoiceAmount: 200 }, {}, { id: 'inv-123' });
      const res = mockRes('tenant-123');
      const next = vi.fn();

      await controller.update(req, res, next);

      expect(paymentService.cancelActivePaymentLinks).toHaveBeenCalledWith('tenant-123', 'inv-123');
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('permanentDelete', () => {
    it('requires the invoice to be in trash first', async () => {
      const mockInvoice = { id: 'inv-123', tenantId: 'tenant-123', deletedAt: null };
      vi.mocked(invoiceRepo.findByIdIncludingTrashed).mockResolvedValue(mockInvoice as any);

      const req = authReq({}, {}, { id: 'inv-123' });
      const res = mockRes('tenant-123');
      const next = vi.fn();

      await controller.permanentDelete(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
      expect(invoiceRepo.hardDelete).not.toHaveBeenCalled();
    });

    it('performs hard delete if invoice is already in trash', async () => {
      const mockInvoice = { id: 'inv-123', tenantId: 'tenant-123', deletedAt: new Date() };
      vi.mocked(invoiceRepo.findByIdIncludingTrashed).mockResolvedValue(mockInvoice as any);

      const req = authReq({}, {}, { id: 'inv-123' });
      const res = mockRes('tenant-123');
      const next = vi.fn();

      await controller.permanentDelete(req, res, next);

      expect(invoiceRepo.hardDelete).toHaveBeenCalledWith('inv-123', 'tenant-123', null);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});

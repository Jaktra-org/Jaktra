import { Request, Response, NextFunction } from 'express';
import { PortalService } from './portal.service.js';
import { PaymentService } from '../payment/payment.service.js';
import { PaymentPlanService } from '../payment-plan/payment-plan.service.js';
import { DisputeService } from '../dispute/dispute.service.js';
import { ValidationError } from '../../shared/errors/index.js';

export class PortalController {
  constructor(
    private readonly service: PortalService,
    private readonly paymentService: PaymentService,
    private readonly paymentPlanService: PaymentPlanService,
    private readonly disputeService: DisputeService
  ) {}

  getInvoiceDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { invoice, tenant, settings, link } = res.locals.portalContext;

      // Update viewedAt on first load
      await this.service.recordViewIfNeeded(link.id, link.viewedAt);

      const hasPendingPaymentPlan = await this.paymentPlanService.hasPendingRequest(invoice.id);

      res.status(200).json({
        invoice: {
          id: invoice.id,
          invoiceNo: invoice.invoiceNo,
          clientName: invoice.clientName,
          invoiceAmount: invoice.invoiceAmount,
          currency: invoice.currency,
          dueDate: invoice.dueDate,
          paymentStatus: invoice.paymentStatus,
          paymentStatusChangedAt: invoice.paymentStatusChangedAt,
          hasActivePaymentPlan: invoice.hasActivePaymentPlan,
          hasPendingPaymentPlan,
        },
        tenant: {
          name: tenant.name,
          companyName: settings?.companyName || tenant.name,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  payInvoice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { invoice, tenant } = res.locals.portalContext;

      // Server-side check to prevent initiating payments on resolved invoices
      if (invoice.paymentStatus === 'Paid' || invoice.paymentStatus === 'Written Off') {
        throw new ValidationError('This invoice has already been paid or settled.');
      }

      // Narrow theoretical race: webhook could mark paid between this status check and link generation (accepted low-severity v1 edge case)
      const paymentUrl = await this.paymentService.getOrGeneratePaymentLink(tenant.id, invoice.id, 'razorpay');

      res.status(200).json({ paymentUrl });
    } catch (error) {
      next(error);
    }
  };

  submitPaymentPlan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { invoice, tenant } = res.locals.portalContext;
      const { installments, reason } = req.body;

      if (installments === undefined) {
        throw new ValidationError('Installments count is required.');
      }

      const result = await this.paymentPlanService.submitRequest(
        tenant.id,
        invoice.id,
        installments,
        reason
      );

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  submitDispute = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { invoice, tenant } = res.locals.portalContext;
      const { body } = req.body;

      if (!body || typeof body !== 'string' || !body.trim()) {
        throw new ValidationError('Dispute reason body is required.');
      }

      await this.disputeService.createDisputeRecord({
        tenantId: tenant.id,
        invoiceId: invoice.id,
        sender: invoice.contactEmail,
        subject: `Dispute submitted via Portal for ${invoice.invoiceNo}`,
        body: body.trim(),
        source: 'portal',
      });

      res.status(201).json({ message: 'Dispute submitted successfully.' });
    } catch (err) {
      next(err);
    }
  };
}

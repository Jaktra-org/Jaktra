import { eq } from 'drizzle-orm';
import { invoices } from '../../db/index.js';
import type { DatabaseClient, PaymentPlanRequest } from '../../db/index.js';
import type { PaymentPlanRepository } from './payment-plan.repository.js';
import type { InvoiceRepository } from '../invoice/invoice.repository.js';
import type { EventService, ActorContext } from '../event/event.service.js';
import type { PortalService } from '../portal/portal.service.js';
import type { TenantMailer } from '../communication/tenant-mailer.js';
import type { SettingsRepository } from '../settings/settings.repository.js';
import { ValidationError } from '../../shared/errors/index.js';
import { logger } from '../../shared/logger.js';

export class PaymentPlanService {
  constructor(
    private readonly repo: PaymentPlanRepository,
    private readonly invoiceRepo: InvoiceRepository,
    private readonly eventService: EventService,
    private readonly db: DatabaseClient,
    private readonly portalService?: PortalService,
    private readonly tenantMailer?: TenantMailer,
    private readonly settingsRepo?: SettingsRepository
  ) {}

  async hasPendingRequest(invoiceId: string): Promise<boolean> {
    const pending = await this.repo.findPendingByInvoiceId(invoiceId);
    return !!pending;
  }

  async submitRequest(
    tenantId: string,
    invoiceId: string,
    installments: number,
    reason?: string
  ): Promise<PaymentPlanRequest> {
    // 1. Check installments range
    if (!Number.isInteger(installments) || installments < 2 || installments > 24) {
      throw new ValidationError('Installments must be an integer between 2 and 24.');
    }

    // 2. Fetch invoice and ensure it belongs to the tenant
    const invoice = await this.invoiceRepo.findById(invoiceId);
    if (!invoice || invoice.tenantId !== tenantId) {
      throw new ValidationError('Invoice not found.');
    }

    // 3. Reject if invoice is already resolved (Paid / Written Off)
    if (invoice.paymentStatus === 'Paid' || invoice.paymentStatus === 'Written Off') {
      throw new ValidationError('Cannot request a payment plan for a paid or written off invoice.');
    }

    // 4. Duplicate safeguard: check if a pending request already exists
    const existingPending = await this.repo.findPendingByInvoiceId(invoiceId);
    if (existingPending) {
      throw new ValidationError('A payment plan request is already pending for this invoice.');
    }

    // 5. Calculate proposed amount dynamically (outstanding balance / installments)
    const totalAmount = parseFloat(invoice.invoiceAmount);
    const proposedAmountPerMonth = parseFloat((totalAmount / installments).toFixed(2));

    // 6. Insert request and emit event
    return this.db.transaction(async (tx) => {
      const newPlan = await this.repo.create({
        tenantId,
        invoiceId,
        installments,
        proposedAmountPerMonth: proposedAmountPerMonth.toString(),
        reason: reason || null,
        status: 'pending',
      }, tx);

      await this.eventService.emitEvent(
        'invoice',
        invoiceId,
        tenantId,
        'invoice.payment_plan_requested',
        { source: 'system', name: 'Customer Portal' },
        {
          description: `Customer proposed a payment plan of ${installments} monthly installments of ${invoice.currency} ${proposedAmountPerMonth}.`,
          payload: { installments, proposedAmountPerMonth },
          tx,
        }
      );

      return newPlan;
    });
  }

  async listPending(
    tenantId: string,
    params: { page: number; limit: number }
  ): Promise<{ data: unknown[]; pagination: { total: number; page: number; limit: number; totalPages: number } }> {
    const { data, total } = await this.repo.listPending(tenantId, params);
    const totalPages = Math.ceil(total / params.limit);
    return {
      data,
      pagination: {
        total,
        page: params.page,
        limit: params.limit,
        totalPages,
      },
    };
  }

  async approve(id: string, tenantId: string, actor: ActorContext): Promise<void> {
    const plan = await this.repo.findById(id);
    if (!plan || plan.tenantId !== tenantId) {
      throw new ValidationError('Payment plan request not found.');
    }

    if (plan.status !== 'pending') {
      throw new ValidationError('Payment plan request is no longer pending.');
    }

    const reviewerId = ('userId' in actor && actor.userId) || null;

    await this.db.transaction(async (tx) => {
      // Set status to approved
      await this.repo.update(id, {
        status: 'approved',
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
      }, tx);

      // Set hasActivePaymentPlan on invoice to true
      await tx
        .update(invoices)
        .set({ hasActivePaymentPlan: true, updatedAt: new Date() })
        .where(eq(invoices.id, plan.invoiceId));

      // Emit approved event
      await this.eventService.emitEvent(
        'invoice',
        plan.invoiceId,
        tenantId,
        'invoice.payment_plan_approved',
        actor,
        {
          description: 'Manager approved the payment plan request.',
          tx,
        }
      );
    });

    await this.sendNotificationEmail(tenantId, plan.invoiceId, plan.installments, plan.proposedAmountPerMonth, 'approved');
  }

  async deny(id: string, tenantId: string, actor: ActorContext): Promise<void> {
    const plan = await this.repo.findById(id);
    if (!plan || plan.tenantId !== tenantId) {
      throw new ValidationError('Payment plan request not found.');
    }

    if (plan.status !== 'pending') {
      throw new ValidationError('Payment plan request is no longer pending.');
    }

    const reviewerId = ('userId' in actor && actor.userId) || null;

    await this.db.transaction(async (tx) => {
      // Set status to denied
      await this.repo.update(id, {
        status: 'denied',
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
      }, tx);

      // Emit denied event
      await this.eventService.emitEvent(
        'invoice',
        plan.invoiceId,
        tenantId,
        'invoice.payment_plan_denied',
        actor,
        {
          description: 'Manager denied the payment plan request.',
          tx,
        }
      );
    });

    await this.sendNotificationEmail(tenantId, plan.invoiceId, plan.installments, plan.proposedAmountPerMonth, 'denied');
  }

  private async sendNotificationEmail(
    tenantId: string,
    invoiceId: string,
    installments: number,
    proposedAmountPerMonth: string,
    status: 'approved' | 'denied'
  ): Promise<void> {
    try {
      if (!this.tenantMailer || !this.portalService) return;

      const invoice = await this.invoiceRepo.findById(invoiceId);
      if (!invoice || !invoice.contactEmail) return;

      let companyName = 'Billing Team';
      if (this.settingsRepo) {
        const settings = await this.settingsRepo.getSettings(tenantId);
        if (settings?.companyName) {
          companyName = settings.companyName;
        }
      }

      const token = await this.portalService.getOrCreatePortalLink(tenantId, invoiceId);
      const portalUrl = `https://www.jaktra.site/i/${token}`;

      const currency = invoice.currency || 'INR';
      const formattedBalance = `${currency} ${parseFloat(invoice.invoiceAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
      const formattedMonthly = `${currency} ${parseFloat(proposedAmountPerMonth).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

      let subject = '';
      let html = '';

      if (status === 'approved') {
        subject = `Payment Plan Approved for Invoice #${invoice.invoiceNo}`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; padding: 20px;">
            <h2 style="color: #0f172a; margin-bottom: 16px;">Payment Plan Approved</h2>
            <p>Dear ${invoice.clientName || 'Customer'},</p>
            <p>Your requested payment plan for <strong>Invoice #${invoice.invoiceNo}</strong> (Total: ${formattedBalance}) has been <strong>APPROVED</strong>.</p>
            
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Installment Schedule:</strong> ${installments} Months</p>
              <p style="margin: 0; font-size: 14px; color: #4f46e5;"><strong>Monthly Amount:</strong> ${formattedMonthly} / month</p>
            </div>

            <p>Please pay your installments as per the agreed schedule using your payment portal:</p>
            <p style="margin-top: 24px;">
              <a href="${portalUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">View Invoice & Pay Installments</a>
            </p>
            <p style="color: #64748b; font-size: 12px; margin-top: 32px;">Regards,<br/>${companyName}</p>
          </div>
        `;
      } else {
        subject = `Payment Plan Update for Invoice #${invoice.invoiceNo}`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; padding: 20px;">
            <h2 style="color: #0f172a; margin-bottom: 16px;">Payment Plan Request Update</h2>
            <p>Dear ${invoice.clientName || 'Customer'},</p>
            <p>Your recent payment plan proposal for <strong>Invoice #${invoice.invoiceNo}</strong> (Total: ${formattedBalance}) was <strong>NOT APPROVED</strong>.</p>
            <p>Please arrange to settle the outstanding balance as per the original invoice terms or reach out to our billing department.</p>
            <p style="margin-top: 24px;">
              <a href="${portalUrl}" style="background-color: #0f172a; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">View Invoice & Settle Balance</a>
            </p>
            <p style="color: #64748b; font-size: 12px; margin-top: 32px;">Regards,<br/>${companyName}</p>
          </div>
        `;
      }

      await this.tenantMailer.sendCollectionEmail(tenantId, {
        to: invoice.contactEmail,
        from: { name: companyName, email: 'no-reply@jaktra.site' },
        subject,
        html,
      }, { invoiceId });
    } catch (err) {
      logger.error(`Failed to send payment plan ${status} notification email:`, err);
    }
  }

  async cancelActivePlan(invoiceId: string, tenantId: string, actor: ActorContext): Promise<void> {
    // 1. Fetch active approved plan for the invoice
    const approvedPlan = await this.repo.findActiveApprovedByInvoiceId(invoiceId);
    if (!approvedPlan || approvedPlan.tenantId !== tenantId) {
      throw new ValidationError('No active, approved payment plan was found for this invoice.');
    }

    // 2. Fetch invoice and ensure it is currently marked as having an active payment plan
    const invoice = await this.invoiceRepo.findById(invoiceId);
    if (!invoice || !invoice.hasActivePaymentPlan) {
      throw new ValidationError('Invoice does not currently have an active payment plan.');
    }

    const reviewerId = ('userId' in actor && actor.userId) || null;

    await this.db.transaction(async (tx) => {
      // Revert invoice flag to false
      await tx
        .update(invoices)
        .set({ hasActivePaymentPlan: false, updatedAt: new Date() })
        .where(eq(invoices.id, invoiceId));

      // Revert plan request status to cancelled
      await this.repo.update(approvedPlan.id, {
        status: 'cancelled',
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
      }, tx);

      // Emit cancelled event
      await this.eventService.emitEvent(
        'invoice',
        invoiceId,
        tenantId,
        'invoice.payment_plan_cancelled',
        actor,
        {
          description: 'Manager cancelled the active payment plan.',
          tx,
        }
      );
    });
  }
}

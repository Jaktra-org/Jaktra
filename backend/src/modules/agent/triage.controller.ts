import { Request, Response } from 'express';
import type { TriageService, ActiveInstallmentContext } from './triage.service.js';
import type { InvoiceRepository } from '../invoice/invoice.repository.js';
import type { DlqService } from '../dlq/dlq.service.js';
import type { CommunicationRepository } from '../communication/communication.repository.js';
import type { PaymentPlanRepository } from '../payment-plan/payment-plan.repository.js';

export class TriageController {
  constructor(
    private triageService: TriageService,
    private invoiceRepo: InvoiceRepository,
    private dlqService: DlqService,
    private communicationRepo: CommunicationRepository,
    private paymentPlanRepo?: PaymentPlanRepository
  ) {}

  getTriaged = async (req: Request, res: Response): Promise<void> => {
    const tenantId = res.locals.tenantId as string;
    
    const settings = await this.communicationRepo.getSettings(tenantId);
    const threshold = settings?.dlqThreshold ?? (process.env.DLQ_THRESHOLD ? parseInt(process.env.DLQ_THRESHOLD, 10) : 3);
    const dlqEntries = await this.dlqService.getDlqEntries(tenantId);
    const dlqBlockedIds = new Set(
      dlqEntries
        .filter((e) => e.consecutiveFailures >= threshold)
        .map((e) => e.invoiceId)
    );

    const allInvoices = await this.invoiceRepo.findByTenant(tenantId);

    const activeInstallmentsMap = new Map<string, ActiveInstallmentContext>();
    if (this.paymentPlanRepo) {
      for (const inv of allInvoices) {
        if (inv.hasActivePaymentPlan) {
          const nextInst = await this.paymentPlanRepo.findNextDueInstallment(inv.id);
          if (nextInst) {
            const totalInst = await this.paymentPlanRepo.countInstallmentsByInvoiceId(inv.id);
            activeInstallmentsMap.set(inv.id, {
              id: nextInst.id,
              installmentNumber: nextInst.installmentNumber,
              totalInstallments: totalInst,
              amount: nextInst.amount,
              dueDate: nextInst.dueDate,
              currency: nextInst.currency || inv.currency || 'INR',
              status: nextInst.status,
            });
          }
        }
      }
    }

    const result = this.triageService.triageInvoices(allInvoices, dlqBlockedIds, activeInstallmentsMap);
    res.status(200).json(result);
  };
}

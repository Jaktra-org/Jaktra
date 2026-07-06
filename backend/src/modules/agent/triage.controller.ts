import { Request, Response } from 'express';
import type { TriageService } from './triage.service.js';
import type { InvoiceRepository } from '../invoice/invoice.repository.js';

export class TriageController {
  constructor(
    private triageService: TriageService,
    private invoiceRepo: InvoiceRepository,
  ) {}

  getTriaged = async (req: Request, res: Response): Promise<void> => {
    const tenantId = res.locals.tenantId as string;
    const allInvoices = await this.invoiceRepo.findByTenant(tenantId);
    const result = this.triageService.triageInvoices(allInvoices);
    res.status(200).json(result);
  };
}

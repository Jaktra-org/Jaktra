import { Request, Response } from 'express';
import type { TriageService } from './triage.service.js';
import type { InvoiceRepository } from '../invoice/invoice.repository.js';
import type { DlqService } from '../dlq/dlq.service.js';
import type { CommunicationRepository } from '../communication/communication.repository.js';

export class TriageController {
  constructor(
    private triageService: TriageService,
    private invoiceRepo: InvoiceRepository,
    private dlqService: DlqService,
    private communicationRepo: CommunicationRepository
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
    const result = this.triageService.triageInvoices(allInvoices, dlqBlockedIds);
    res.status(200).json(result);
  };
}

import type { InvoiceRepository } from '../repositories/invoice.repository.js';
import type { CommunicationRepository } from '../repositories/communication.repository.js';

export interface ReconcilerResult {
  checked: number;
  mismatches: number;
  corrections: Array<{
    invoiceId: string;
    invoiceNo: string;
    oldFollowupCount: number;
    newFollowupCount: number;
  }>;
}

export class ReconcilerService {
  constructor(
    private readonly invoiceRepo: InvoiceRepository,
    private readonly communicationRepo: CommunicationRepository
  ) {}

  async reconcile(tenantId: string): Promise<ReconcilerResult> {
    const invoices = await this.invoiceRepo.findByTenant(tenantId);
    
    let checked = 0;
    let mismatches = 0;
    const corrections: ReconcilerResult['corrections'] = [];

    for (const invoice of invoices) {
      checked++;
      const successfulCount = await this.communicationRepo.countSuccessfulByInvoiceId(invoice.id);

      if (invoice.followupCount !== successfulCount) {
        mismatches++;
        corrections.push({
          invoiceId: invoice.id,
          invoiceNo: invoice.invoiceNo,
          oldFollowupCount: invoice.followupCount,
          newFollowupCount: successfulCount,
        });

        // Auto-correct mismatch
        await this.invoiceRepo.updateFollowupCount(invoice.id, successfulCount);
      }
    }

    return {
      checked,
      mismatches,
      corrections,
    };
  }
}

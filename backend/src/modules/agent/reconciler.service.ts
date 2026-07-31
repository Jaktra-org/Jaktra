import type { InvoiceRepository } from '../invoice/invoice.repository.js';
import type { CommunicationRepository } from '../communication/communication.repository.js';
import { sql } from 'drizzle-orm';
import type { DatabaseClient } from '../../db/index.js';

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
    private readonly communicationRepo: CommunicationRepository,
    private readonly db: DatabaseClient
  ) {}

  async reconcile(tenantId: string): Promise<ReconcilerResult> {
    const [rows] = await this.db.execute(sql`
        SELECT
            i.id as invoice_id,
            i.invoice_no,
            i.followup_count as old_followup_count,
            COALESCE(c.sent_count, 0) as new_followup_count
        FROM invoices i
        LEFT JOIN (
            SELECT invoice_id, COUNT(*) as sent_count
            FROM communications
            WHERE status = 'sent'
            GROUP BY invoice_id
        ) c ON i.id = c.invoice_id
        WHERE i.tenant_id = ${tenantId}
        AND i.deleted_at IS NULL
        AND i.followup_count != COALESCE(c.sent_count, 0)
    `) as unknown as [Record<string, unknown>[]];

    for (const m of rows) {
      await this.invoiceRepo.updateFollowupCount(m.invoice_id as string, Number(m.new_followup_count));
    }

    return {
      checked: await this.invoiceRepo.countByTenant(tenantId),
      mismatches: rows.length,
      corrections: rows.map((m: Record<string, unknown>) => ({
        invoiceId: m.invoice_id as string,
        invoiceNo: m.invoice_no as string,
        oldFollowupCount: Number(m.old_followup_count),
        newFollowupCount: Number(m.new_followup_count),
      })),
    };
  }
}

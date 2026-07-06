import type { InvoiceRepository } from '../invoice/invoice.repository.js';
import type { ParsedRow, RowError, CsvParseResult } from './csv-parser.service.js';
import { parseFileBuffer } from './csv-parser.service.js';
import type { ActorContext } from '../event/event.service.js';
import type { EventRepository } from '../event/event.repository.js';
import type { NewEvent } from '../../db/index.js';
import { logger } from '../../shared/logger.js';

export type DuplicateStrategy = 'skip' | 'update';

export interface ImportResult {
  imported: number;
  updated: number;
  skipped: number;
  errors: RowError[];
}

export class InvoiceImportService {
  constructor(
    private invoiceRepo: InvoiceRepository,
    private eventRepo?: EventRepository
  ) {}

  async importFromFile(
    buffer: Buffer,
    originalname: string,
    tenantId: string,
    duplicateStrategy: DuplicateStrategy = 'skip',
    actor?: ActorContext
  ): Promise<ImportResult> {
    const { valid, errors }: CsvParseResult = parseFileBuffer(buffer, originalname);

    let imported = 0;
    let updated = 0;
    let skipped = 0;

    const eventsToInsert: NewEvent[] = [];

    for (const row of valid) {
      try {
        const result = await this.processRow(row, tenantId, duplicateStrategy);

        if (result.outcome === 'created') {
          imported++;
        } else if (result.outcome === 'updated') {
          updated++;
        } else {
          skipped++;
        }

        if (result.outcome !== 'skipped' && actor && this.eventRepo) {
          const actorId = actor.source === 'ui' || actor.source === 'api' ? actor.userId : null;
          const actorName = actor.source === 'ui' || actor.source === 'api' ? actor.name : null;
          const actorEmail = actor.source === 'ui' || actor.source === 'api' ? actor.email : null;
          const actorRole = actor.source === 'ui' || actor.source === 'api' ? actor.role : null;

          eventsToInsert.push({
            tenantId,
            entityType: 'invoice',
            entityId: result.id,
            actorId,
            actorName,
            actorEmail,
            actorRole,
            actionType: 'invoice.imported',
            description: `Invoice #${row.invoiceNo} imported via CSV`,
            source: actor.source,
            eventType: 'invoice.imported',
            newValues: {
              invoiceNo: row.invoiceNo,
              clientName: row.clientName,
              invoiceAmount: row.invoiceAmount,
              dueDate: row.dueDate,
              contactEmail: row.contactEmail,
              paymentStatus: row.paymentStatus,
              importOutcome: result.outcome,
            },
          });
        }
      } catch (err: unknown) {
        errors.push({
          row: 0,
          invoiceNo: row.invoiceNo,
          errors: [err instanceof Error ? err.message : 'Unknown insertion error'],
        });
      }
    }

    if (eventsToInsert.length > 0 && this.eventRepo) {
      await this.eventRepo.createMany(eventsToInsert).catch(err => {
        logger.error('Failed to batch insert invoice.imported events', err);
      });
    }

    return { imported, updated, skipped, errors };
  }

  private async processRow(
    row: ParsedRow,
    tenantId: string,
    duplicateStrategy: DuplicateStrategy,
  ): Promise<{ id: string; outcome: 'created' | 'updated' } | { outcome: 'skipped' }> {
    const existing = await this.invoiceRepo.findByInvoiceNo(row.invoiceNo, tenantId);

    if (existing && duplicateStrategy === 'skip') {
      return { outcome: 'skipped' };
    }

    if (existing && duplicateStrategy === 'update') {
      const updated = await this.invoiceRepo.upsertByInvoiceNo({
        tenantId,
        invoiceNo: row.invoiceNo,
        clientName: row.clientName,
        invoiceAmount: row.invoiceAmount,
        dueDate: row.dueDate,
        contactEmail: row.contactEmail,
        subject: row.subject ?? null,
        followupCount: row.followupCount,
        paymentStatus: row.paymentStatus,
        lastFollowupDate: row.lastFollowupDate ?? null,
      });
      return { id: updated.invoice.id, outcome: 'updated' };
    }

    const created = await this.invoiceRepo.create({
      tenantId,
      invoiceNo: row.invoiceNo,
      clientName: row.clientName,
      invoiceAmount: row.invoiceAmount,
      dueDate: row.dueDate,
      contactEmail: row.contactEmail,
      subject: row.subject ?? null,
      followupCount: row.followupCount,
      paymentStatus: row.paymentStatus,
      lastFollowupDate: row.lastFollowupDate ?? null,
    });
    return { id: created.id, outcome: 'created' };
  }
}

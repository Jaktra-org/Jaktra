import { logger } from '../../shared/logger.js';
import type { InvoiceRepository } from './invoice.repository.js';
import type { SettingsRepository } from '../settings/settings.repository.js';
import type { EventService } from '../event/event.service.js';

export class InvoicePurgeService {
  constructor(
    private invoiceRepo: InvoiceRepository,
    private settingsRepo: SettingsRepository,
    private eventService: EventService
  ) {}

  async runPurge(): Promise<void> {
    logger.info('[InvoicePurgeService] Starting daily auto-purge background task');
    try {
      const activePurgeSettings = await this.settingsRepo.findAllWithAutoPurgeEnabled();
      logger.info(`[InvoicePurgeService] Found ${activePurgeSettings.length} tenants with auto-purge enabled`);

      for (const settings of activePurgeSettings) {
        const tenantId = settings.tenantId;
        const autoPurgeDays = settings.autoPurgeDays;
        
        // Raising minimum floor safety check
        if (autoPurgeDays < 7) {
          logger.warn(`[InvoicePurgeService] Tenant ${tenantId} autoPurgeDays is ${autoPurgeDays}, which is below minimum floor of 7. Skipping.`);
          continue;
        }

        const cutoffDate = new Date(Date.now() - autoPurgeDays * 24 * 60 * 60 * 1000);
        
        // Safety ceiling of 100 per tenant run
        const MAX_PURGE_PER_TENANT = 100;
        const expiredInvoices = await this.invoiceRepo.findExpiredTrashed(tenantId, cutoffDate, MAX_PURGE_PER_TENANT + 1);

        if (expiredInvoices.length === 0) {
          continue;
        }

        const actualPurgeList = expiredInvoices.slice(0, MAX_PURGE_PER_TENANT);
        if (expiredInvoices.length > MAX_PURGE_PER_TENANT) {
          logger.warn(`[InvoicePurgeService] Tenant ${tenantId} hit safety ceiling. Capping purge batch to 100.`);
        }

        logger.info(`[InvoicePurgeService] Purging ${actualPurgeList.length} expired trashed invoices for tenant ${tenantId}`);

        for (const invoice of actualPurgeList) {
          try {
            await this.invoiceRepo.db.transaction(async (tx) => {
              // Log permanently deleted audit event before deleting row
              await this.eventService.emitEvent('invoice', invoice.id, tenantId, 'invoice.permanently_deleted', {
                source: 'system',
                name: 'Auto-Purge',
                email: 'system@jaktra.com',
                role: 'admin'
              }, {
                description: `Invoice #${invoice.invoiceNo} permanently deleted via automated auto-purge policy`,
                oldValues: {
                  invoiceNo: invoice.invoiceNo,
                  clientName: invoice.clientName,
                  invoiceAmount: invoice.invoiceAmount,
                  dueDate: invoice.dueDate,
                  contactEmail: invoice.contactEmail,
                  paymentStatus: invoice.paymentStatus
                },
                payload: { reason: 'auto_purge' },
                tx
              });

              await this.invoiceRepo.hardDelete(invoice.id, tenantId, tx);
            });
          } catch (err: unknown) {
            logger.error(err instanceof Error ? err : new Error(String(err)), `[InvoicePurgeService] Failed to auto-purge invoice ${invoice.id} for tenant ${tenantId}`);
          }
        }
      }
      logger.info('[InvoicePurgeService] Completed daily auto-purge background task');
    } catch (err: unknown) {
      logger.error(err instanceof Error ? err : new Error(String(err)), '[InvoicePurgeService] Auto-purge task failed');
    }
  }
}

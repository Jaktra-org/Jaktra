import { eq, and, lt } from 'drizzle-orm';
import { inboundEmails, tenantSettings } from '../../db/index.js';
import type { DatabaseClient } from '../../db/index.js';
import { logger } from '../../shared/logger.js';

export class DisputePurgeService {
  private timer: NodeJS.Timeout | null = null;

  constructor(private db: DatabaseClient) {}

  startDailyPurgeTask(intervalMs = 24 * 60 * 60 * 1000): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.timer = setInterval(() => {
      this.purgeArchivedDisputes().catch((err) => {
        logger.error('[DisputePurgeService] Error during background purge task', err);
      });
    }, intervalMs);

    // Initial run on startup
    this.purgeArchivedDisputes().catch((err) => {
      logger.error('[DisputePurgeService] Error during initial purge task', err);
    });
  }

  stopDailyPurgeTask(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  async purgeArchivedDisputes(): Promise<void> {
    logger.info('[DisputePurgeService] Starting archived dispute auto-purge task');
    const settingsList = await this.db.select().from(tenantSettings);

    for (const settings of settingsList) {
      const purgeDays = settings.autoPurgeArchivedDisputesDays ?? 30;
      if (purgeDays <= 0) continue; // Purging disabled

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - purgeDays);

      const expiredDisputes = await this.db
        .select({ id: inboundEmails.id })
        .from(inboundEmails)
        .where(
          and(
            eq(inboundEmails.tenantId, settings.tenantId),
            eq(inboundEmails.status, 'archived'),
            lt(inboundEmails.updatedAt, cutoffDate)
          )
        );

      if (expiredDisputes.length > 0) {
        logger.info(
          `[DisputePurgeService] Purging ${expiredDisputes.length} archived disputes for tenant ${settings.tenantId} older than ${purgeDays} days`
        );
        for (const dispute of expiredDisputes) {
          await this.db.delete(inboundEmails).where(eq(inboundEmails.id, dispute.id));
        }
      }
    }
    logger.info('[DisputePurgeService] Completed archived dispute auto-purge task');
  }
}

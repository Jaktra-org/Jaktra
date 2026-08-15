import { or, lt, and, isNotNull } from 'drizzle-orm';
import { replyTokens } from '../../db/index.js';
import type { DatabaseClient } from '../../db/index.js';
import { logger } from '../../shared/logger.js';

export class ReplyTokenCleanupService {
  constructor(private readonly db: DatabaseClient) {}

  async cleanupExpiredTokens(retentionDays = 30): Promise<number> {
    logger.info('[ReplyTokenCleanupService] Starting token retention cleanup task');
    try {
      const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
      const result = await this.db
        .delete(replyTokens)
        .where(
          or(
            and(isNotNull(replyTokens.expiresAt), lt(replyTokens.expiresAt, cutoff)),
            and(isNotNull(replyTokens.revokedAt), lt(replyTokens.revokedAt, cutoff))
          )
        );

      const count = (result as unknown as { rowCount?: number; affectedRows?: number })?.rowCount
        ?? (result as unknown as { rowCount?: number; affectedRows?: number })?.affectedRows
        ?? 0;
      return Number(count);
    } catch (err: unknown) {
      logger.error(err instanceof Error ? err : new Error(String(err)), '[ReplyTokenCleanupService] Token cleanup task failed');
      return 0;
    }
  }
}

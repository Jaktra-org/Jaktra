import { Request, Response, NextFunction } from 'express';
import type { DlqService } from './dlq.service.js';
import type { EventService, ActorContext } from '../event/event.service.js';
import type { AuthenticatedRequest } from '../../shared/types/auth.js';
import { logger } from '../../shared/logger.js';

export class DlqController {
  constructor(
    private dlqService: DlqService,
    private eventService?: EventService
  ) {}

  getEntries = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = res.locals.tenantId as string;
      const entries = await this.dlqService.getDlqEntries(tenantId);
      res.json(entries);
    } catch (err: unknown) {
      next(err);
    }
  };

  getStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = res.locals.tenantId as string;
      const stats = await this.dlqService.getDlqStats(tenantId);
      res.json(stats);
    } catch (err: unknown) {
      next(err);
    }
  };

  deleteEntry = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = res.locals.tenantId as string;
      const invoice_id = req.params.invoice_id as string;
      const authReq = req as AuthenticatedRequest;
      const actor: ActorContext = {
        source: 'ui',
        userId: authReq.user.userId,
        name: authReq.user.name,
        email: authReq.user.email,
        role: authReq.user.role,
      };

      await this.dlqService.clearFailure(invoice_id, tenantId);

      if (this.eventService) {
        await this.eventService.emitEvent('invoice', invoice_id, tenantId, 'dlq.cleared', actor, {
          description: `Dead Letter Queue entry cleared manually`,
        }).catch((err: unknown) => {
          logger.error('Failed to log dlq.cleared event', err instanceof Error ? err : String(err));
        });
      }

      res.json({ success: true });
    } catch (err: unknown) {
      next(err);
    }
  };
}

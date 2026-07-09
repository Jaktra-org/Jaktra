import { Request, Response, NextFunction } from 'express';
import type { ReconcilerService } from './reconciler.service.js';
import type { AuthenticatedRequest } from '../../shared/types/auth.js';
import type { ActorContext, EventService } from '../event/event.service.js';

export class ReconcilerController {
  constructor(
    private reconcilerService: ReconcilerService,
    private eventService?: EventService
  ) {}

  private getActorContext(req: Request): ActorContext {
    const authReq = req as AuthenticatedRequest;
    return {
      source: 'ui',
      userId: authReq.user.userId,
      name: authReq.user.name,
      email: authReq.user.email,
      role: authReq.user.role,
    };
  }

  reconcile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const tenantId = authReq.user.tenantId;
      
      const result = await this.reconcilerService.reconcile(tenantId);

      this.eventService?.logEvent({
        tenantId,
        eventType: 'reconciler.run_triggered',
        actor: this.getActorContext(req),
        metadata: {
          triggeredBy: 'manual',
          checked: result.checked,
          mismatches: result.mismatches,
        },
      });

      res.status(200).json(result);
    } catch (err: unknown) {
      next(err);
    }
  };
}

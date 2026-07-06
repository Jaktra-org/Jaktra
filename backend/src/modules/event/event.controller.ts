import { Request, Response, NextFunction } from 'express';
import { EventService } from './event.service.js';

export class EventController {
  constructor(private eventService: EventService) {}

  getTimeline = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = res.locals.tenantId as string;
      const entityId = req.params.id as string;
      const entityType = (req.query.entity_type as string) ?? 'invoice';
      
      const page = req.query.page ? Math.max(1, parseInt(req.query.page as string, 10)) : 1;
      const limit = req.query.limit ? Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10))) : 25;
      
      const actionTypes = req.query.action_types
        ? (req.query.action_types as string).split(',').filter(Boolean) as any[]
        : undefined;
        
      const sources = req.query.sources
        ? (req.query.sources as string).split(',').filter(Boolean)
        : undefined;
        
      const actorId = req.query.actor_id as string | undefined;
      const from = req.query.from ? new Date(req.query.from as string) : undefined;
      const to = req.query.to ? new Date(req.query.to as string) : undefined;

      const result = await this.eventService.listByEntity(
        tenantId,
        entityType,
        entityId,
        { actionTypes, sources, actorId, from, to },
        page,
        limit
      );
      
      res.status(200).json(result);
    } catch (err: unknown) {
      next(err);
    }
  };

  getFeed = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = res.locals.tenantId as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const feed = await this.eventService.getFeed(tenantId, limit);
      res.status(200).json(feed);
    } catch (err: unknown) {
      next(err);
    }
  };
}

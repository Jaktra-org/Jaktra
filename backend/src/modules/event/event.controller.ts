import { Request, Response } from 'express';
import { EventService, EventError } from './event.service.js';

export class EventController {
  constructor(private eventService: EventService) {}

  getTimeline = async (req: Request, res: Response): Promise<void> => {
    try {
      const tenantId = res.locals.tenantId as string;
      const invoiceId = req.params.id as string;
      const timeline = await this.eventService.listByInvoice(invoiceId, tenantId);
      res.status(200).json(timeline);
    } catch (err: unknown) {
      if (err instanceof EventError) {
        res.status(err.statusCode).json({ error: err.message });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}

import { Router, RequestHandler } from 'express';
import { EventController } from './event.controller.js';

export function createEventRouter(
  eventController: EventController,
  authMiddleware: RequestHandler,
  tenantScoped: RequestHandler,
): Router {
  const router = Router();

  router.get(
    '/invoices/:id/timeline',
    authMiddleware,
    tenantScoped,
    eventController.getTimeline,
  );

  return router;
}

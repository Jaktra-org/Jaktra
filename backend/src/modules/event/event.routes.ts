import { Router, RequestHandler } from 'express';
import { EventController } from './event.controller.js';
import { requireRole } from '../../middleware/require-role.js';

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

  router.get(
    '/events/feed',
    authMiddleware,
    tenantScoped,
    eventController.getFeed,
  );

  router.get(
    '/events',
    authMiddleware,
    tenantScoped,
    requireRole('admin', 'manager'),
    eventController.listAll,
  );

  return router;
}

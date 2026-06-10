import { Router, RequestHandler } from 'express';
import { AnalyticsController } from './analytics.controller.js';

export function createAnalyticsRouter(
  analyticsController: AnalyticsController,
  authMiddleware: RequestHandler,
  tenantScoped: RequestHandler
): Router {
  const router = Router();

  router.use(authMiddleware, tenantScoped);

  router.get('/summary', analyticsController.getSummary);

  return router;
}

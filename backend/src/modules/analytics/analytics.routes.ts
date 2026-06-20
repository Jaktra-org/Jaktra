import { Router, RequestHandler } from 'express';
import { AnalyticsController } from './analytics.controller.js';
import { validateQuery } from '../../middleware/validate.js';
import { DateRangeSchema } from './analytics.service.js';

export function createAnalyticsRouter(
  analyticsController: AnalyticsController,
  authMiddleware: RequestHandler,
  tenantScoped: RequestHandler
): Router {
  const router = Router();

  router.use(authMiddleware, tenantScoped);

  router.get('/summary', validateQuery(DateRangeSchema), analyticsController.getSummary);
  router.get('/aging', validateQuery(DateRangeSchema), analyticsController.getAging);
  
  router.get('/agent/performance', validateQuery(DateRangeSchema), analyticsController.getAgentPerformance);
  router.get('/agent/email-volume', validateQuery(DateRangeSchema), analyticsController.getEmailVolume);
  router.get('/agent/channel-breakdown', validateQuery(DateRangeSchema), analyticsController.getChannelBreakdown);
  router.get('/agent/tier-effectiveness', validateQuery(DateRangeSchema), analyticsController.getTierEffectiveness);
  router.get('/agent/communication-stats', validateQuery(DateRangeSchema), analyticsController.getCommunicationStats);

  return router;
}

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
  router.get('/aging', analyticsController.getAging);
  
  router.get('/agent/performance', analyticsController.getAgentPerformance);
  router.get('/agent/email-volume', analyticsController.getEmailVolume);
  router.get('/agent/channel-breakdown', analyticsController.getChannelBreakdown);
  router.get('/agent/tier-effectiveness', analyticsController.getTierEffectiveness);
  router.get('/agent/communication-stats', analyticsController.getCommunicationStats);

  return router;
}

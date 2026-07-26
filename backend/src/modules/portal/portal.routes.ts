import { Router, RequestHandler } from 'express';
import { PortalController } from './portal.controller.js';
import {
  portalViewIpLimiter,
  portalViewTokenLimiter,
  portalPayIpLimiter,
  portalPayTokenLimiter,
  portalPlanIpLimiter,
  portalPlanTokenLimiter,
  portalDisputeIpLimiter,
  portalDisputeTokenLimiter,
} from '../../middleware/rate-limiter.js';

export function createPortalRouter(
  portalController: PortalController,
  portalTokenAuth: RequestHandler
): Router {
  const router = Router();

  router.get(
    '/:token',
    portalViewIpLimiter,
    portalViewTokenLimiter,
    portalTokenAuth,
    portalController.getInvoiceDetails
  );

  router.post(
    '/:token/pay',
    portalPayIpLimiter,
    portalPayTokenLimiter,
    portalTokenAuth,
    portalController.payInvoice
  );

  router.post(
    '/:token/plan',
    portalPlanIpLimiter,
    portalPlanTokenLimiter,
    portalTokenAuth,
    portalController.submitPaymentPlan
  );

  router.post(
    '/:token/dispute',
    portalDisputeIpLimiter,
    portalDisputeTokenLimiter,
    portalTokenAuth,
    portalController.submitDispute
  );

  return router;
}

import { Router, type RequestHandler } from 'express';
import { DisputeController } from './dispute.controller.js';
import { requireRole } from '../../middleware/require-role.js';
import { validateParam } from '../../middleware/validate-param.js';

export function createDisputeRouter(
  disputeController: DisputeController,
  authRequired: RequestHandler,
  tenantScoped: RequestHandler
): Router {
  const router = Router();

  router.use(authRequired, tenantScoped);

  router.get('/pending', requireRole('admin', 'manager'), disputeController.listPending);
  router.post('/:id/approve', validateParam('id'), requireRole('admin', 'manager'), disputeController.approve);
  router.post('/:id/discard', validateParam('id'), requireRole('admin', 'manager'), disputeController.discard);

  return router;
}

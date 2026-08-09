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

  router.get('/list', requireRole('admin', 'manager'), disputeController.listDisputes);
  router.get('/pending', requireRole('admin', 'manager'), disputeController.listPending);
  router.post('/:id/send-reply', validateParam('id'), requireRole('admin', 'manager'), disputeController.sendReply);
  router.post('/:id/status', validateParam('id'), requireRole('admin', 'manager'), disputeController.changeStatus);
  router.post('/:id/approve', validateParam('id'), requireRole('admin', 'manager'), disputeController.approve);
  router.post('/:id/discard', validateParam('id'), requireRole('admin', 'manager'), disputeController.discard);
  router.post('/:id/generate-draft', validateParam('id'), requireRole('admin', 'manager'), disputeController.generateDraft);

  return router;
}

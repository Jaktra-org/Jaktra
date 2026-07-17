import { Router, type RequestHandler } from 'express';
import { DlqController } from './dlq.controller.js';
import { requireRole } from '../../middleware/require-role.js';
import { validateParam } from '../../middleware/validate-param.js';

export function createDlqRouter(
  dlqController: DlqController,
  authRequired: RequestHandler,
  tenantScoped: RequestHandler
): Router {
  const router = Router();

  router.use(authRequired, tenantScoped);

  router.get('/', requireRole('admin', 'manager'), dlqController.getEntries);
  router.get('/stats', requireRole('admin', 'manager'), dlqController.getStats);
  router.delete('/:invoice_id', validateParam('invoice_id'), requireRole('admin', 'manager'), dlqController.deleteEntry);

  return router;
}


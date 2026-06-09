import { Router } from 'express';
import { DlqController } from './dlq.controller.js';

export function createDlqRouter(
  dlqController: DlqController,
  authRequired: any,
  tenantScoped: any
): Router {
  const router = Router();

  router.use(authRequired, tenantScoped);

  router.get('/', dlqController.getEntries);
  router.get('/stats', dlqController.getStats);
  router.delete('/:invoice_id', dlqController.deleteEntry);

  return router;
}


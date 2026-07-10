import { Router, type RequestHandler } from 'express';
import { ReconcilerController } from './reconciler.controller.js';
import { requireRole } from '../../middleware/require-role.js';

export function createReconcilerRouter(
  reconcilerController: ReconcilerController,
  authRequired: RequestHandler,
  tenantScoped: RequestHandler
): Router {
  const router = Router();

  router.use(authRequired, tenantScoped);

  // POST /api/invoices/reconcile
  router.post('/reconcile', requireRole('admin', 'manager'), reconcilerController.reconcile);

  return router;
}


import { Router } from 'express';
import { ReconcilerController } from './reconciler.controller.js';

export function createReconcilerRouter(
  reconcilerController: ReconcilerController,
  authRequired: any,
  tenantScoped: any
): Router {
  const router = Router();

  router.use(authRequired, tenantScoped);

  // POST /api/invoices/reconcile
  router.post('/reconcile', reconcilerController.reconcile);

  return router;
}


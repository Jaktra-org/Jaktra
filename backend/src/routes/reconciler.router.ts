import { Router, type Request, type Response } from 'express';
import type { ReconcilerService } from '../services/reconciler.service.js';
import type { AuthenticatedRequest } from '../types/auth.js';

export function createReconcilerRouter(
  reconcilerService: ReconcilerService,
  authRequired: any,
  tenantScoped: any
): Router {
  const router = Router();

  router.use(authRequired, tenantScoped);

  // POST /api/invoices/reconcile
  router.post('/reconcile', async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const tenantId = authReq.user.tenantId;
      
      const result = await reconcilerService.reconcile(tenantId);
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ error: { message: 'Failed to reconcile invoices' } });
    }
  });

  return router;
}

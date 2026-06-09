import { Router, RequestHandler } from 'express';
import { requireRole } from '../../middleware/require-role.js';
import { TenantController } from './tenant.controller.js';

export function createTenantRouter(
  tenantController: TenantController,
  authMiddleware: RequestHandler,
): Router {
  const router = Router();

  // POST /api/tenants — admin only
  router.post(
    '/',
    authMiddleware,
    requireRole('admin'),
    tenantController.create,
  );

  // GET /api/tenants/:id — authenticated users can view their own tenant
  router.get(
    '/:id',
    authMiddleware,
    tenantController.getById,
  );

  return router;
}

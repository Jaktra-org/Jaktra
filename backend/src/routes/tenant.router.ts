import { Router, Request, Response, RequestHandler } from 'express';
import { z } from 'zod';
import type { TenantService } from '../services/tenant.service.js';
import { TenantError } from '../services/tenant.service.js';
import { requireRole } from '../middleware/require-role.js';
import type { AuthenticatedRequest } from '../types/auth.js';

const createTenantSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be lowercase alphanumeric with hyphens only',
  }),
});

export function createTenantRouter(
  tenantService: TenantService,
  authMiddleware: RequestHandler,
): Router {
  const router = Router();

  // POST /api/tenants — admin only
  router.post(
    '/',
    authMiddleware,
    requireRole('admin'),
    async (req: Request, res: Response) => {
      const parsed = createTenantSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
        return;
      }

      try {
        const tenant = await tenantService.create(parsed.data);
        res.status(201).json(tenant);
      } catch (err) {
        if (err instanceof TenantError) {
          res.status(err.statusCode).json({ error: err.message });
          return;
        }
        throw err;
      }
    },
  );

  // GET /api/tenants/:id — authenticated users can view their own tenant
  router.get(
    '/:id',
    authMiddleware,
    async (req: Request, res: Response) => {
      const id = req.params.id as string;
      const { tenantId } = (req as AuthenticatedRequest).user;

      if (id !== tenantId && (req as AuthenticatedRequest).user.role !== 'admin') {
        res.status(403).json({ error: 'Cannot view another tenant' });
        return;
      }

      try {
        const tenant = await tenantService.getById(id);
        res.status(200).json(tenant);
      } catch (err) {
        if (err instanceof TenantError) {
          res.status(err.statusCode).json({ error: err.message });
          return;
        }
        throw err;
      }
    },
  );

  return router;
}

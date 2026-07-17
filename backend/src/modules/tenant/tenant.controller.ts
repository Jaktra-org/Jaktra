import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import type { TenantService } from './tenant.service.js';
import type { AuthenticatedRequest } from '../../shared/types/auth.js';
import { ValidationError, NotFoundError } from '../../shared/errors/index.js';

const createTenantSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be lowercase alphanumeric with hyphens only',
  }),
});

export class TenantController {
  constructor(private tenantService: TenantService) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const parsed = createTenantSchema.safeParse(req.body);
    if (!parsed.success) {
      next(new ValidationError('Validation failed', JSON.stringify(parsed.error.issues)));
      return;
    }

    try {
      const tenant = await this.tenantService.create(parsed.data);
      res.status(201).json(tenant);
    } catch (err: unknown) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const id = req.params.id as string;
    const { tenantId } = (req as AuthenticatedRequest).user;

    // Strict tenant scoping: users can ONLY view their own tenant's data.
    // Role is never used to bypass tenant ownership — it only governs
    // intra-tenant permissions. Return 404 (not 403) to prevent tenant
    // ID enumeration.
    if (id !== tenantId) {
      next(new NotFoundError('Tenant not found'));
      return;
    }

    try {
      const tenant = await this.tenantService.getById(id);
      res.status(200).json(tenant);
    } catch (err: unknown) {
      next(err);
    }
  };
}

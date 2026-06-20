import { Request, Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../shared/types/auth.js';
import { ForbiddenError } from '../shared/errors/index.js';

export function tenantScoped(req: Request, res: Response, next: NextFunction): void {
  const { tenantId } = (req as AuthenticatedRequest).user;

  if (!tenantId) {
    next(new ForbiddenError('No tenant context in token'));
    return;
  }

  res.locals.tenantId = tenantId;
  next();
}

import { Request, Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../shared/types/auth.js';

export function tenantScoped(req: Request, res: Response, next: NextFunction): void {
  const { tenantId } = (req as AuthenticatedRequest).user;

  if (!tenantId) {
    res.status(403).json({ error: 'No tenant context in token' });
    return;
  }

  res.locals.tenantId = tenantId;
  next();
}

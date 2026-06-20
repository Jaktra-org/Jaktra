import { Request, Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../shared/types/auth.js';
import { ForbiddenError } from '../shared/errors/index.js';

export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { role } = (req as AuthenticatedRequest).user;
    if (!allowedRoles.includes(role)) {
      next(new ForbiddenError('Insufficient permissions'));
      return;
    }
    next();
  };
}
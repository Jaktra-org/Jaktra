import { Request, Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../shared/types/auth.js';
export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { role } = (req as AuthenticatedRequest).user;
    if (!allowedRoles.includes(role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }
    next();
  };
}
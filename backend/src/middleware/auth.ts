import { Request, Response, NextFunction } from 'express';
import type { AuthService } from '../modules/auth/auth.service.js';
import type { AuthenticatedRequest } from '../shared/types/auth.js';
import { AuthError } from '../shared/errors/index.js';

export function createAuthMiddleware(authService: AuthService) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      next(new AuthError('Missing or malformed Authorization header', 401));
      return;
    }

    const token = header.slice(7);

    try {
      (req as AuthenticatedRequest).user = await authService.verifyAndFetchUser(token);
      next();
    } catch (err) {
      next(err);
    }
  };
}


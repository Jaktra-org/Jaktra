import { Request, Response, NextFunction, RequestHandler } from 'express';
import { PortalService } from '../modules/portal/portal.service.js';

export function createPortalTokenAuthMiddleware(portalService: PortalService): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.params['token'];
      if (!token || typeof token !== 'string') {
        res.status(404).json({ error: { code: 'NOT_FOUND', message: 'This link is no longer valid or does not exist.' } });
        return;
      }

      const context = await portalService.resolveAndValidateToken(token);
      res.locals.portalContext = context;
      next();
    } catch (error: unknown) {
      // Translate dynamic verification errors to consistent client responses
      // 404 and 410 return the exact same user-facing display message to prevent token scanning
      const err = error as { statusCode?: number; errorCode?: string };
      const statusCode = err.statusCode || 500;
      if (statusCode === 404 || statusCode === 410) {
        res.status(statusCode).json({
          error: {
            code: err.errorCode || 'NOT_FOUND',
            message: 'This link is no longer valid or does not exist.',
          },
        });
        return;
      }
      next(error);
    }
  };
}

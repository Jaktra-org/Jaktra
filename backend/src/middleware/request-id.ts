import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export function requestId(req: Request, res: Response, next: NextFunction): void {
  const reqId = req.headers['x-request-id'] || crypto.randomUUID();
  res.setHeader('X-Request-ID', reqId);
  res.locals.requestId = reqId;
  next();
}

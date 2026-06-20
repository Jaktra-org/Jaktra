import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ValidationError } from '../shared/errors/index.js';

export function validateParam(paramName: string, schema: z.ZodSchema = z.string().uuid()) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params[paramName]);
    if (!result.success) {
      next(new ValidationError(`Invalid ${paramName} format`, JSON.stringify(result.error.issues)));
      return;
    }
    next();
  };
}

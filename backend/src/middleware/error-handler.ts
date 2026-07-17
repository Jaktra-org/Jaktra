import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import * as Sentry from '@sentry/node';
import { AppError } from '../shared/errors/index.js';
import { logger } from '../shared/logger.js';
import { mapErrorToDisplayMessage } from '../shared/utils/error-mapper.js';

export function sanitizeTechnicalMessage(message: string): string {
  let sanitized = message;

  // 1. Redact environment variable assignments (run first to avoid matching spaces in other redacted placeholders)
  sanitized = sanitized.replace(/[A-Z0-9_]*(?:KEY|SECRET|PASSWORD|TOKEN|URL)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'`<>]+)/gi, '[env redacted]');

  // 2. Redact connection strings
  sanitized = sanitized.replace(/(?:postgresql|postgres|redis|mongodb|mysql|amqp):\/\/[^\s"'`<>]+/gi, '[connection-string redacted]');

  // 3. Redact absolute file paths (Unix and Windows)
  sanitized = sanitized.replace(/(?:[a-z]:\\|\/(?:home|app|var|usr|opt|etc|node_modules|dist|src)\/)[^\s"'`<>:]+/gi, '[path redacted]');

  // 4. Redact common secrets and keys
  sanitized = sanitized.replace(/(?:sk|pk|rzp|whsec)_[a-zA-Z0-9_]+/gi, '[secret redacted]');
  sanitized = sanitized.replace(/Bearer\s+[a-zA-Z0-9_\-\.\+/=]+/gi, '[secret redacted]');
  sanitized = sanitized.replace(/AKIA[A-Z0-9]{16}/g, '[secret redacted]');
  sanitized = sanitized.replace(/SG\.[a-zA-Z0-9_\-\.]{20,}/gi, '[secret redacted]');
  sanitized = sanitized.replace(/\b[a-fA-F0-9]{48,}\b/g, '[secret redacted]');
  sanitized = sanitized.replace(/\b[a-zA-Z0-9_\-\+/=]{48,}\b/g, '[secret redacted]');

  // 5. Redact internal hostnames and URLs
  sanitized = sanitized.replace(/(?:localhost|127\.0\.0\.1|0\.0\.0\.0|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}|[a-zA-Z0-9\-]+\.(?:internal|local))(?::\d+)?/gi, '[host redacted]');

  // 6. Redact database query patterns
  const lower = sanitized.toLowerCase();
  if (
    lower.includes('select ') ||
    lower.includes('insert ') ||
    lower.includes('update ') ||
    lower.includes('delete ') ||
    lower.includes('failed query') ||
    lower.includes('postgres') ||
    lower.includes('postgresql') ||
    lower.includes('relation "') ||
    lower.includes('table "') ||
    lower.includes('column "') ||
    lower.includes('drizzle')
  ) {
    return 'Database Error';
  }

  return sanitized;
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const requestId = res.locals.requestId || 'unknown';

  let statusCode = 500;
  let errorCode = 'INTERNAL_SERVER_ERROR';
  let displayMessage = 'An unexpected error occurred';
  let technicalMessage = err.message || 'An unexpected error occurred';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    errorCode = err.errorCode;
    displayMessage = err.displayMessage;
    technicalMessage = err.technicalMessage;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    displayMessage = 'Invalid request data';
    technicalMessage = JSON.stringify(err.issues);
  } else {
    // Check if it's database, network, axios, etc.
    const errString = String(err);
    const errMsg = err.message || errString;
    displayMessage = mapErrorToDisplayMessage(err);

    if (errMsg.includes('unique constraint') || errMsg.includes('23505') || errMsg.includes('unique violation') || errMsg.includes('already exists')) {
      statusCode = 409;
      errorCode = 'CONFLICT';
    } else if (errMsg.includes('not found') || errMsg.includes('NotFoundError')) {
      statusCode = 404;
      errorCode = 'NOT_FOUND';
    } else if (
      errMsg.includes('ECONNREFUSED') || 
      errMsg.includes('fetch failed') || 
      errMsg.includes('ETIMEDOUT') || 
      errMsg.includes('AxiosError')
    ) {
      statusCode = 502;
      errorCode = 'EXTERNAL_SERVICE_ERROR';
    }
  }

  // Developer logging (server logs)
  logger.error(`[Error] Request ID: ${requestId} | Code: ${errorCode} | Technical Message: ${technicalMessage} | Path: ${req.method} ${req.path}`, {
    stackTrace: err.stack,
  });

  if (process.env.SENTRY_DSN) {
    Sentry.captureException(err, {
      tags: { requestId, errorCode }
    });
  }

  const errorResponse: {
    error: {
      code: string;
      message: string;
      requestId: string;
      details?: string;
      stack?: string;
    };
  } = {
    error: {
      code: errorCode,
      message: displayMessage,
      requestId,
    }
  };

  // Dev only — never in production/staging/test
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.details = sanitizeTechnicalMessage(technicalMessage);
    if (err.stack) {
      errorResponse.error.stack = sanitizeTechnicalMessage(err.stack);
    }
  }

  res.status(statusCode).json(errorResponse);
}


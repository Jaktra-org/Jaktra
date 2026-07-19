import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { createAuthMiddleware } from '../../src/middleware/auth.js';
import { requireRole } from '../../src/middleware/require-role.js';
import { tenantScoped } from '../../src/middleware/tenant-scoped.js';
import { errorHandler, sanitizeTechnicalMessage } from '../../src/middleware/error-handler.js';
import { validateBody, validateQuery } from '../../src/middleware/validate.js';
import { validateParam } from '../../src/middleware/validate-param.js';
import { requestId } from '../../src/middleware/request-id.js';
import { z } from 'zod';
import { AuthError, ForbiddenError, ValidationError } from '../../src/shared/errors/index.js';
import type { AuthService } from '../../src/modules/auth/auth.service.js';

describe('Middleware Unit Tests', () => {
  describe('createAuthMiddleware', () => {
    let authService: AuthService;

    beforeEach(() => {
      authService = {
        verifyAndFetchUser: vi.fn(),
      } as unknown as AuthService;
    });

    it('should call next with AuthError if authorization header is missing', async () => {
      const middleware = createAuthMiddleware(authService);
      const req = { headers: {} } as Request;
      const res = {} as Response;
      const next = vi.fn() as unknown as NextFunction;

      await middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AuthError));
      expect((next as any).mock.calls[0][0].statusCode).toBe(401);
    });

    it('should call next with AuthError if authorization header is not Bearer', async () => {
      const middleware = createAuthMiddleware(authService);
      const req = { headers: { authorization: 'Basic 12345' } } as Request;
      const res = {} as Response;
      const next = vi.fn() as unknown as NextFunction;

      await middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AuthError));
    });

    it('should verify token and attach user to request', async () => {
      const middleware = createAuthMiddleware(authService);
      const req = { headers: { authorization: 'Bearer token123' } } as Request;
      const res = {} as Response;
      const next = vi.fn() as unknown as NextFunction;
      const mockUser = { userId: '1', email: 'test@example.com' };

      vi.mocked(authService.verifyAndFetchUser).mockResolvedValue(mockUser as any);

      await middleware(req, res, next);

      expect(authService.verifyAndFetchUser).toHaveBeenCalledWith('token123');
      expect((req as any).user).toBe(mockUser);
      expect(next).toHaveBeenCalledWith();
    });

    it('should forward service error to next', async () => {
      const middleware = createAuthMiddleware(authService);
      const req = { headers: { authorization: 'Bearer token123' } } as Request;
      const res = {} as Response;
      const next = vi.fn() as unknown as NextFunction;

      const testError = new Error('JWT expired');
      vi.mocked(authService.verifyAndFetchUser).mockRejectedValue(testError);

      await middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(testError);
    });
  });

  describe('requireRole', () => {
    it('should pass if user role is in allowedRoles list', () => {
      const middleware = requireRole('admin', 'manager');
      const req = { user: { role: 'manager' } } as any;
      const res = {} as Response;
      const next = vi.fn() as unknown as NextFunction;

      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should call next with ForbiddenError if user role is not in allowedRoles', () => {
      const middleware = requireRole('admin');
      const req = { user: { role: 'viewer' } } as any;
      const res = {} as Response;
      const next = vi.fn() as unknown as NextFunction;

      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });
  });

  describe('tenantScoped', () => {
    it('should set res.locals.tenantId if present in user object', () => {
      const req = { user: { tenantId: 'tenant-123' } } as any;
      const res = { locals: {} } as any;
      const next = vi.fn() as unknown as NextFunction;

      tenantScoped(req, res, next);

      expect(res.locals.tenantId).toBe('tenant-123');
      expect(next).toHaveBeenCalledWith();
    });

    it('should call next with ForbiddenError if tenantId is missing', () => {
      const req = { user: {} } as any;
      const res = { locals: {} } as Response;
      const next = vi.fn() as unknown as NextFunction;

      tenantScoped(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });
  });

  describe('requestId', () => {
    it('should generate a new request ID if header is missing', () => {
      const req = { headers: {} } as Request;
      const res = { setHeader: vi.fn(), locals: {} } as any;
      const next = vi.fn() as unknown as NextFunction;

      requestId(req, res, next);

      expect(res.setHeader).toHaveBeenCalledWith('X-Request-ID', expect.any(String));
      expect(res.locals.requestId).toBeDefined();
      expect(next).toHaveBeenCalled();
    });

    it('should reuse request ID from header if present', () => {
      const req = { headers: { 'x-request-id': 'custom-id' } } as any;
      const res = { setHeader: vi.fn(), locals: {} } as any;
      const next = vi.fn() as unknown as NextFunction;

      requestId(req, res, next);

      expect(res.setHeader).toHaveBeenCalledWith('X-Request-ID', 'custom-id');
      expect(res.locals.requestId).toBe('custom-id');
      expect(next).toHaveBeenCalled();
    });
  });

  describe('validateBody', () => {
    const schema = z.object({
      name: z.string(),
      count: z.number().default(5),
    });

    it('should pass and apply defaults/strip unknown fields', () => {
      const middleware = validateBody(schema);
      const req = { body: { name: 'test', extra: 'field' } } as Request;
      const res = {} as Response;
      const next = vi.fn() as unknown as NextFunction;

      middleware(req, res, next);

      expect(req.body).toEqual({ name: 'test', count: 5 });
      expect(next).toHaveBeenCalledWith();
    });

    it('should fail validation and call next with error', () => {
      const middleware = validateBody(schema);
      const req = { body: { count: 10 } } as Request;
      const res = {} as Response;
      const next = vi.fn() as unknown as NextFunction;

      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(z.ZodError));
    });
  });

  describe('validateQuery', () => {
    const schema = z.object({
      page: z.coerce.number().default(1),
    });

    it('should parse and assign to query', () => {
      const middleware = validateQuery(schema);
      const req = { query: { page: '2', extra: 'ignore' } } as any;
      const res = {} as Response;
      const next = vi.fn() as unknown as NextFunction;

      middleware(req, res, next);

      expect(req.query).toEqual({ page: 2 });
      expect(next).toHaveBeenCalledWith();
    });
  });

  describe('validateParam', () => {
    it('should validate string param by default as UUID', () => {
      const middleware = validateParam('id');
      const req = { params: { id: 'invalid-uuid' } } as any;
      const res = {} as Response;
      const next = vi.fn() as unknown as NextFunction;

      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    });

    it('should pass on valid UUID', () => {
      const middleware = validateParam('id');
      const req = { params: { id: '123e4567-e89b-12d3-a456-426614174000' } } as any;
      const res = {} as Response;
      const next = vi.fn() as unknown as NextFunction;

      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });
  });

  describe('errorHandler', () => {
    let mockRes: any;
    let mockReq: any;

    beforeEach(() => {
      mockRes = {
        locals: { requestId: 'test-req-id' },
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };
      mockReq = { method: 'GET', path: '/' };
    });

    it('should handle AppError correctly', () => {
      const err = new ValidationError('Bad data', 'tech message');
      errorHandler(err, mockReq, mockRes, vi.fn());

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Bad data',
          requestId: 'test-req-id',
        },
      });
    });

    it('should handle generic error and map it', () => {
      const err = new Error('fetch failed');
      errorHandler(err, mockReq, mockRes, vi.fn());

      expect(mockRes.status).toHaveBeenCalledWith(502); // mapped from network error / external service
    });
  });

  describe('sanitizeTechnicalMessage', () => {
    it('should redact key and secrets', () => {
      const msg = 'Failed with api key SG.123456789012345678901234567890 and Bearer token123';
      const sanitized = sanitizeTechnicalMessage(msg);
      expect(sanitized).not.toContain('SG.123456789012345678901234567890');
      expect(sanitized).not.toContain('token123');
    });

    it('should turn DB queries and drizzle errors to Database Error', () => {
      const msg = 'select * from users where id = 1';
      const sanitized = sanitizeTechnicalMessage(msg);
      expect(sanitized).toBe('Database Error');
    });
  });
});

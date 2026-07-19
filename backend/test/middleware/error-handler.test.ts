import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { errorHandler, sanitizeTechnicalMessage } from '../../src/middleware/error-handler.js';

// Mock logger to avoid spamming the console during tests
vi.mock('../../src/shared/logger.js', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock Sentry to avoid setup dependencies
vi.mock('@sentry/node', () => ({
  captureException: vi.fn(),
}));

describe('Global Error Handler', () => {
  let originalEnv: string | undefined;

  beforeEach(() => {
    originalEnv = process.env.NODE_ENV;
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  const mockResponse = (): any => {
    const res: any = {};
    res.locals = { requestId: 'test-req-id' };
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
  };

  const mockRequest = (): any => {
    return {
      method: 'GET',
      path: '/api/test-error',
    } as any;
  };

  describe('NODE_ENV allowance and block checks', () => {
    it('should include details and stack when NODE_ENV === "development"', () => {
      process.env.NODE_ENV = 'development';
      const req = mockRequest();
      const res = mockResponse();
      const err = new Error('Test technical message');
      err.stack = 'Test stack trace';

      errorHandler(err, req, res, () => {});

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred',
          requestId: 'test-req-id',
          details: 'Test technical message',
          stack: 'Test stack trace',
        },
      });
    });

    it('should NOT include details and stack when NODE_ENV === "production"', () => {
      process.env.NODE_ENV = 'production';
      const req = mockRequest();
      const res = mockResponse();
      const err = new Error('Test technical message');
      err.stack = 'Test stack trace';

      errorHandler(err, req, res, () => {});

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred',
          requestId: 'test-req-id',
        },
      });
    });

    it('should NOT include details and stack when NODE_ENV === "staging"', () => {
      // Staging is a defensive/hypothetical case since Zod blocks it on startup,
      // but testing ensures safety at runtime if env checks are bypassable.
      process.env.NODE_ENV = 'staging';
      const req = mockRequest();
      const res = mockResponse();
      const err = new Error('Test technical message');
      err.stack = 'Test stack trace';

      errorHandler(err, req, res, () => {});

      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred',
          requestId: 'test-req-id',
        },
      });
    });

    it('should NOT include details and stack when NODE_ENV === "test"', () => {
      process.env.NODE_ENV = 'test';
      const req = mockRequest();
      const res = mockResponse();
      const err = new Error('Test technical message');

      errorHandler(err, req, res, () => {});

      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred',
          requestId: 'test-req-id',
        },
      });
    });

    it('should NOT include details and stack when NODE_ENV is undefined', () => {
      delete process.env.NODE_ENV;
      const req = mockRequest();
      const res = mockResponse();
      const err = new Error('Test technical message');

      errorHandler(err, req, res, () => {});

      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred',
          requestId: 'test-req-id',
        },
      });
    });
  });

  describe('sanitizeTechnicalMessage pattern coverage', () => {
    it('should pass-through safe, non-sensitive messages', () => {
      const msg = 'User email is already verified';
      expect(sanitizeTechnicalMessage(msg)).toBe(msg);
    });

    it('should redact database query patterns', () => {
      expect(sanitizeTechnicalMessage('select * from users')).toBe('Database Error');
      expect(sanitizeTechnicalMessage('Failed query: INSERT INTO tenants')).toBe('Database Error');
      expect(sanitizeTechnicalMessage('column "name" of relation "users" does not exist')).toBe('Database Error');
      expect(sanitizeTechnicalMessage('Drizzle error: table "invoices" not found')).toBe('Database Error');
    });

    it('should redact connection strings', () => {
      expect(sanitizeTechnicalMessage('Cannot connect to postgresql://admin:password123@localhost:5432/jaktra')).toBe(
        'Cannot connect to [connection-string redacted]'
      );
      expect(sanitizeTechnicalMessage('redis://:secret_pass@127.0.0.1:6379/0 failed')).toBe(
        '[connection-string redacted] failed'
      );
    });

    it('should redact absolute file paths (Unix and Windows)', () => {
      expect(sanitizeTechnicalMessage('Error at /home/user/app/src/index.ts:25')).toBe('Error at [path redacted]:25');
      expect(sanitizeTechnicalMessage('Failed to load module /app/node_modules/express/index.js')).toBe(
        'Failed to load module [path redacted]'
      );
      expect(sanitizeTechnicalMessage('Exception in C:\\Users\\sures\\Desktop\\Jaktra\\backend\\src\\index.ts')).toBe(
        'Exception in [path redacted]'
      );
    });

    it('should redact secret keys and bearer tokens', () => {
      expect(sanitizeTechnicalMessage('API call failed for sk_live_51NvC123456abcdef')).toBe(
        'API call failed for [secret redacted]'
      );
      expect(sanitizeTechnicalMessage('Using key pk_test_abc123')).toBe('Using key [secret redacted]');
      expect(sanitizeTechnicalMessage('Authorization Header: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c')).toBe(
        'Authorization Header: [secret redacted]'
      );
      expect(sanitizeTechnicalMessage('AWS client error: AKIAIOSFODNN7EXAMPLE')).toBe(
        'AWS client error: [secret redacted]'
      );
      expect(sanitizeTechnicalMessage('SendGrid error: SG.p-d1234567890abcdefghijklmnopqrstuvwxyz1234567890')).toBe(
        'SendGrid error: [secret redacted]'
      );
    });

    it('should redact long hex and base64 strings (>=48 chars)', () => {
      // 48 character hex string
      const longHex = 'a'.repeat(48);
      expect(sanitizeTechnicalMessage(`Token: ${longHex}`)).toBe('Token: [secret redacted]');

      // 47 character hex string should not be redacted
      const shorterHex = 'b'.repeat(47);
      expect(sanitizeTechnicalMessage(`Token: ${shorterHex}`)).toBe(`Token: ${shorterHex}`);

      // 36 character UUID should not be redacted
      const uuid = '123e4567-e89b-12d3-a456-426614174000';
      expect(sanitizeTechnicalMessage(`ID: ${uuid}`)).toBe(`ID: ${uuid}`);
    });

    it('should redact internal hostnames and URLs', () => {
      expect(sanitizeTechnicalMessage('Failed connecting to http://localhost:3000/api/v1')).toBe(
        'Failed connecting to http://[host redacted]/api/v1'
      );
      expect(sanitizeTechnicalMessage('IP 192.168.1.15 is unreachable')).toBe('IP [host redacted] is unreachable');
      expect(sanitizeTechnicalMessage('Host jaktra.internal cannot be resolved')).toBe(
        'Host [host redacted] cannot be resolved'
      );
      expect(sanitizeTechnicalMessage('Server dev-db.local timed out')).toBe('Server [host redacted] timed out');
    });

    it('should redact environment variable assignments', () => {
      expect(sanitizeTechnicalMessage('Missing variable PLATFORM_SENDGRID_API_KEY=SG.some_key')).toBe(
        'Missing variable [env redacted]'
      );
      expect(sanitizeTechnicalMessage('Failed parsing DATABASE_URL=postgres://user:pass@host/db')).toBe(
        'Failed parsing [env redacted]'
      );
    });
  });
});

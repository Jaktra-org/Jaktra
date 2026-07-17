import { getErrorMessage } from '../../src/utils/error-utils';

// Mock axios.isAxiosError
vi.mock('axios', async (importOriginal) => {
  const original = await importOriginal<typeof import('axios')>();
  return {
    ...original,
    default: {
      ...original.default,
      isAxiosError: (err: any) => !!err?.isAxiosError,
    },
  };
});

describe('error-utils getErrorMessage', () => {
  it('handles standard Javascript Error instances', () => {
    const error = new Error('Database connection failed');
    expect(getErrorMessage(error)).toBe('Database connection failed');
  });

  it('handles string errors directly', () => {
    expect(getErrorMessage('Custom server error message')).toBe('Custom server error message');
  });

  it('returns generic fallback for unknown types', () => {
    expect(getErrorMessage({})).toBe('An unexpected error occurred');
    expect(getErrorMessage(null)).toBe('An unexpected error occurred');
    expect(getErrorMessage(1234)).toBe('An unexpected error occurred');
  });

  it('extracts nested messages from Axios response errors', () => {
    const axiosError = {
      isAxiosError: true,
      message: 'Network Error',
      response: {
        data: {
          error: {
            message: 'Incorrect verification code',
          },
        },
      },
    };
    expect(getErrorMessage(axiosError)).toBe('Incorrect verification code');
  });

  it('extracts flat messages from Axios response errors', () => {
    const axiosError = {
      isAxiosError: true,
      message: 'Network Error',
      response: {
        data: {
          message: 'Simple flat error message',
        },
      },
    };
    expect(getErrorMessage(axiosError)).toBe('Simple flat error message');
  });

  it('falls back to Axios error.message if no response data exists', () => {
    const axiosError = {
      isAxiosError: true,
      message: 'Axios timeout error',
    };
    expect(getErrorMessage(axiosError)).toBe('Request timed out'); // due to lowerMsg.includes('timeout') normalizer!
  });

  describe('technical error normalization', () => {
    it('normalizes SMTP and SendGrid email errors', () => {
      expect(getErrorMessage('SMTP connection failure')).toBe('Email service unavailable');
      expect(getErrorMessage('SendGrid API call failed')).toBe('Email service unavailable');
    });

    it('normalizes circuit breaker open state errors', () => {
      expect(getErrorMessage('The circuit breaker is open right now')).toBe('AI service temporarily unavailable');
    });

    it('normalizes connection refusions and fetch failures', () => {
      expect(getErrorMessage('TypeError: fetch failed')).toBe('Unable to connect to service');
      expect(getErrorMessage('ECONNREFUSED 127.0.0.1:5432')).toBe('Connection failed');
    });

    it('normalizes authentication, token and authorization failures', () => {
      expect(getErrorMessage('unauthorized role level')).toBe('Authentication failed');
      expect(getErrorMessage('invalid jwt token')).toBe('Authentication failed');
    });

    it('normalizes database unique constraint conflicts', () => {
      expect(getErrorMessage('duplicate key value violates unique constraint')).toBe('Record already exists');
    });

    it('sanitizes asynchronously detected/bounced annotations', () => {
      expect(getErrorMessage('Email bounce (asynchronously bounced)')).toBe('Email bounce');
    });
  });
});

export class AppError extends Error {
  public statusCode: number;
  public errorCode: string;
  public displayMessage: string;
  public technicalMessage: string;

  constructor(params: {
    statusCode: number;
    errorCode: string;
    displayMessage: string;
    technicalMessage: string;
  }) {
    super(params.technicalMessage);
    this.statusCode = params.statusCode;
    this.errorCode = params.errorCode;
    this.displayMessage = params.displayMessage;
    this.technicalMessage = params.technicalMessage;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(displayMessage = 'Invalid request data', technicalMessage?: string) {
    super({
      statusCode: 400,
      errorCode: 'VALIDATION_ERROR',
      displayMessage,
      technicalMessage: technicalMessage || displayMessage,
    });
  }
}

export class AuthError extends AppError {
  constructor(displayMessage = 'Invalid email or password', statusCode = 401, technicalMessage?: string) {
    let errorCode = 'AUTH_INVALID_CREDENTIALS';
    if (statusCode === 409) errorCode = 'CONFLICT';
    if (statusCode === 404) errorCode = 'NOT_FOUND';
    if (statusCode === 400) errorCode = 'VALIDATION_ERROR';
    super({
      statusCode,
      errorCode,
      displayMessage,
      technicalMessage: technicalMessage || displayMessage,
    });
  }
}

export class NotFoundError extends AppError {
  constructor(displayMessage = 'Resource not found', technicalMessage?: string) {
    super({
      statusCode: 404,
      errorCode: 'NOT_FOUND',
      displayMessage,
      technicalMessage: technicalMessage || displayMessage,
    });
  }
}

export class ConflictError extends AppError {
  constructor(displayMessage = 'Record already exists', technicalMessage?: string) {
    super({
      statusCode: 409,
      errorCode: 'CONFLICT',
      displayMessage,
      technicalMessage: technicalMessage || displayMessage,
    });
  }
}

export class ExternalServiceError extends AppError {
  constructor(displayMessage = 'Service unavailable', technicalMessage?: string) {
    super({
      statusCode: 502,
      errorCode: 'EXTERNAL_SERVICE_ERROR',
      displayMessage,
      technicalMessage: technicalMessage || displayMessage,
    });
  }
}

export class DatabaseError extends AppError {
  constructor(displayMessage = 'An unexpected error occurred', technicalMessage?: string) {
    super({
      statusCode: 500,
      errorCode: 'DATABASE_ERROR',
      displayMessage,
      technicalMessage: technicalMessage || displayMessage,
    });
  }
}

export class RateLimitError extends AppError {
  constructor(displayMessage = 'Rate limit exceeded', technicalMessage?: string) {
    super({
      statusCode: 429,
      errorCode: 'RATE_LIMIT_EXCEEDED',
      displayMessage,
      technicalMessage: technicalMessage || displayMessage,
    });
  }
}

export class ForbiddenError extends AppError {
  constructor(displayMessage = 'Insufficient permissions', technicalMessage?: string) {
    super({
      statusCode: 403,
      errorCode: 'FORBIDDEN',
      displayMessage,
      technicalMessage: technicalMessage || displayMessage,
    });
  }
}

export class TenantError extends AppError {
  constructor(message: string, statusCode: number) {
    let errorCode = 'TENANT_ERROR';
    if (statusCode === 409) errorCode = 'CONFLICT';
    if (statusCode === 404) errorCode = 'NOT_FOUND';
    super({
      statusCode,
      errorCode,
      displayMessage: message,
      technicalMessage: message,
    });
    this.name = 'TenantError';
  }
}

export class CommunicationError extends AppError {
  constructor(message: string, statusCode: number) {
    super({
      statusCode,
      errorCode: 'COMMUNICATION_ERROR',
      displayMessage: message,
      technicalMessage: message,
    });
    this.name = 'CommunicationError';
  }
}

export class AimlServiceError extends AppError {
  constructor(message: string, statusCode: number) {
    super({
      statusCode,
      errorCode: 'EXTERNAL_SERVICE_ERROR',
      displayMessage: 'AI service temporarily unavailable',
      technicalMessage: message,
    });
    this.name = 'AimlServiceError';
  }
}

export class IntegrationError extends AppError {
  constructor(message: string, code: string, statusCode: number = 400) {
    super({
      statusCode,
      errorCode: code,
      displayMessage: message,
      technicalMessage: message,
    });
    this.name = 'IntegrationError';
  }
}

export const IntegrationErrors = {
  NOT_CONFIGURED: () => new IntegrationError('Integration is not configured', 'INTEGRATION_NOT_CONFIGURED', 400),
  CREDENTIAL_INVALID: () => new IntegrationError('Integration credentials are invalid or unauthorized', 'INTEGRATION_CREDENTIAL_INVALID', 422),
  INSUFFICIENT_SCOPE: () => new IntegrationError('Integration key lacks required scopes', 'INTEGRATION_INSUFFICIENT_SCOPE', 403),
  SENDER_UNVERIFIED: () => new IntegrationError('Sender identity is unverified in SendGrid', 'INTEGRATION_SENDER_UNVERIFIED', 403),
  PROVIDER_UNAVAILABLE: () => new IntegrationError('Integration provider is temporarily unavailable', 'INTEGRATION_PROVIDER_UNAVAILABLE', 502),
  RATE_LIMITED: () => new IntegrationError('Too many requests. Please try again later.', 'INTEGRATION_RATE_LIMITED', 429),
};

export class GoneError extends AppError {
  constructor(displayMessage = 'This link is no longer valid', technicalMessage?: string) {
    super({
      statusCode: 410,
      errorCode: 'GONE',
      displayMessage,
      technicalMessage: technicalMessage || displayMessage,
    });
  }
}




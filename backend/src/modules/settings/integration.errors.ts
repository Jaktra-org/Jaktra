import { AppError } from '../../shared/errors/index.js';

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
  NOT_CONFIGURED: new IntegrationError('Integration is not configured', 'INTEGRATION_NOT_CONFIGURED', 400),
  CREDENTIAL_INVALID: new IntegrationError('Integration credentials are invalid or unauthorized', 'INTEGRATION_CREDENTIAL_INVALID', 422),
  INSUFFICIENT_SCOPE: new IntegrationError('Integration key lacks required scopes', 'INTEGRATION_INSUFFICIENT_SCOPE', 403),
  SENDER_UNVERIFIED: new IntegrationError('Sender identity is unverified in SendGrid', 'INTEGRATION_SENDER_UNVERIFIED', 403),
  PROVIDER_UNAVAILABLE: new IntegrationError('Integration provider is temporarily unavailable', 'INTEGRATION_PROVIDER_UNAVAILABLE', 502),
  RATE_LIMITED: new IntegrationError('Too many requests. Please try again later.', 'INTEGRATION_RATE_LIMITED', 429),
};

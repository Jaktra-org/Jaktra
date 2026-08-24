import { ZodError } from 'zod';
import { AimlServiceError, ValidationError } from '../errors/index.js';

export function mapErrorToDisplayMessage(error: unknown): string {
  if (!error) return 'An unexpected error occurred';

  const errString = String(error);
  const errMsg = error instanceof Error ? error.message : errString;

  // Explicit ValidationErrors and setup diagnostic messages — safe to return directly
  if (
    error instanceof ValidationError ||
    (typeof error === 'object' && error !== null && (error as { name?: string }).name === 'ValidationError') ||
    errMsg.includes('Inbound Webhook') ||
    errMsg.includes('Inbound Parse') ||
    errMsg.includes('SendGrid API') ||
    errMsg.includes('SendGrid Key') ||
    errMsg.includes('SendGrid') ||
    errMsg.includes('configured')
  ) {
    return errMsg;
  }

  // AimlServiceError — use its display message directly
  if (error instanceof AimlServiceError) {
    return error.displayMessage;
  }

  // AI-ML Circuit breaker
  if (errMsg.includes('circuit breaker is open') || errMsg.includes('circuit breaker open') || errMsg.includes('CircuitBreakerOpen')) {
    return 'AI service temporarily unavailable';
  }

  // Email validation, sender identity, recipient validation, and delivery bounces (safe to show directly)
  if (
    errMsg.includes('Sender email') ||
    errMsg.includes('Sender Identity') ||
    errMsg.includes('Sender identity') ||
    errMsg.includes('Reply-To Email') ||
    errMsg.includes('verified') ||
    errMsg.includes('Verified') ||
    errMsg.includes('Recipient domain') ||
    errMsg.includes('recipient email') ||
    errMsg.includes('mailbox') ||
    errMsg.includes('Mailbox') ||
    errMsg.includes('bounced') ||
    errMsg.includes('bounce') ||
    errMsg.includes('does not exist') ||
    errMsg.includes('Delivery failed') ||
    errMsg.includes('MX records') ||
    errMsg.includes('MX record')
  ) {
    return errMsg;
  }

  // SMTP connection / sendgrid provider failures
  if (
    errMsg.includes('SMTP') || 
    errMsg.includes('smtp') || 
    (errMsg.includes('mail') && !errMsg.toLowerCase().includes('email') && !errMsg.toLowerCase().includes('gmail')) || 
    errMsg.includes('Email sending failed') || 
    errMsg.includes('SendGrid')
  ) {
    return 'Email service unavailable';
  }

  // Network / Connection
  if (errMsg.includes('fetch failed') || errMsg.includes('TypeError: fetch failed')) {
    return 'Unable to connect to service';
  }
  if (errMsg.includes('ECONNREFUSED')) {
    return 'Connection failed';
  }
  if (errMsg.includes('ETIMEDOUT') || errMsg.includes('timeout') || errMsg.includes('TIMEOUT')) {
    return 'Request timed out';
  }

  // Axios
  if (errMsg.includes('AxiosError') || (typeof error === 'object' && error !== null && 'isAxiosError' in error)) {
    return 'Service unavailable';
  }

  // JWT / Auth
  if (
    errMsg.includes('jwt') || 
    errMsg.includes('JWT') || 
    errMsg.includes('token') || 
    errMsg.includes('Token') || 
    errMsg.includes('unauthorized') || 
    errMsg.includes('Unauthorized')
  ) {
    return 'Authentication failed';
  }

  // AI generation / LLM failures
  if (
    errMsg.includes('GENERATION_VALIDATION_FAILED') ||
    errMsg.includes('LLM') ||
    errMsg.includes('Groq') ||
    errMsg.includes('Gemini') ||
    errMsg.includes('rate_limit') ||
    errMsg.includes('Rate limit')
  ) {
    if (errMsg.includes('GENERATION_VALIDATION_FAILED')) {
      return 'AI output format validation failed';
    }
    return 'AI generation service error or rate limit reached';
  }

  // Zod / validation
  if (error instanceof ZodError || errMsg.includes('ZodError') || errMsg.includes('validation') || errMsg.includes('Validation') || errMsg.includes('422')) {
    if (errMsg && !errMsg.includes('ZodError') && errMsg.length > 5) {
      return errMsg;
    }
    return 'Invalid request data';
  }

  // Database unique violation (PostgreSQL 23505 / duplicate key)
  if (
    errMsg.includes('unique constraint') || 
    errMsg.includes('23505') || 
    errMsg.includes('unique violation') || 
    errMsg.includes('already exists') ||
    errMsg.includes('duplicate key value') ||
    (error as Record<string, unknown>)?.code === '23505' ||
    ((error as Record<string, unknown>)?.cause as Record<string, unknown>)?.code === '23505'
  ) {
    return 'Record already exists';
  }

  // Invoices
  if (errMsg.includes('Invoice not found') || errMsg.includes('invoice not found') || errMsg.includes('invoice_no_tenant_id_uniq')) {
    return 'Invoice not found';
  }

  return 'An unexpected error occurred';
}

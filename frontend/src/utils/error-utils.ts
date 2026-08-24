import axios from 'axios';

export function getErrorMessage(error: unknown): string {
  let message: string;
  
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 429) {
      return 'Too many requests. Please wait a minute before trying again.';
    }

    const data = error.response?.data;
    if (data?.error?.message) {
      message = data.error.message;
      if (data.error.details && (message === 'An unexpected error occurred' || message === 'Internal Server Error')) {
        if (import.meta.env.DEV) {
          console.error('[Dev Error Details]:', data.error.details);
          if (data.error.stack) {
            console.error('[Dev Error Stack]:', data.error.stack);
          }
        }
      }
    } else if (data?.error?.details) {
      if (import.meta.env.DEV) {
        console.error('[Dev Error Details]:', data.error.details);
        if (data.error.stack) {
          console.error('[Dev Error Stack]:', data.error.stack);
        }
      }
      message = 'Service unavailable';
    } else if (data?.message) {
      message = data.message;
    } else {
      message = error.message || 'Service unavailable';
    }
  } else if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  } else {
    return 'An unexpected error occurred';
  }

  // Normalize/sanitize raw technical messages
  let sanitizedMessage = message;
  if (message.toLowerCase().includes('asynchronously detected')) {
    sanitizedMessage = message.replace(/\s*\(asynchronously detected\)/gi, '');
  }
  if (message.toLowerCase().includes('asynchronously bounced')) {
    sanitizedMessage = message.replace(/\s*\(asynchronously bounced\)/gi, '');
  }

  const lowerMsg = sanitizedMessage.toLowerCase();
  if (lowerMsg.includes('too many requests') || lowerMsg.includes('rate limit') || lowerMsg.includes('429')) {
    return 'Too many requests. Please wait a minute before trying again.';
  }
  if (lowerMsg.includes('invalid credentials') || lowerMsg.includes('invalid email or password')) {
    return 'Invalid email or password';
  }
  if (
    lowerMsg.includes('sender email') ||
    lowerMsg.includes('sender identity') ||
    lowerMsg.includes('reply-to') ||
    lowerMsg.includes('unverified') ||
    lowerMsg.includes('verified') ||
    lowerMsg.includes('mx record') ||
    lowerMsg.includes('mx records') ||
    lowerMsg.includes('mailbox') ||
    lowerMsg.includes('inbound') ||
    lowerMsg.includes('webhook') ||
    lowerMsg.includes('sendgrid') ||
    lowerMsg.includes('parse') ||
    lowerMsg.includes('api key') ||
    lowerMsg.includes('configured')
  ) {
    return sanitizedMessage;
  }
  if (lowerMsg.includes('querymx') || lowerMsg.includes('unreachable or invalid') || lowerMsg.includes('does not have valid mail servers')) {
    return 'Recipient email domain is invalid or does not exist';
  }
  if (lowerMsg.includes('circuit breaker is open') || lowerMsg.includes('circuit breaker open') || lowerMsg.includes('circuitbreaker')) {
    return 'AI service temporarily unavailable';
  }
  if (lowerMsg.includes('validation failed') || lowerMsg.includes('bad request')) {
    return sanitizedMessage;
  }
  if (lowerMsg.includes('smtp') || lowerMsg.includes('email sending failed')) {
    return 'Email service unavailable';
  }
  if (lowerMsg.includes('fetch failed') || lowerMsg.includes('typeerror: fetch failed')) {
    return 'Unable to connect to service';
  }
  if (lowerMsg.includes('econnrefused')) {
    return 'Connection failed';
  }
  if (lowerMsg.includes('etimedout') || lowerMsg.includes('timeout')) {
    return 'Request timed out';
  }
  if (lowerMsg.includes('jwt') || lowerMsg.includes('token') || lowerMsg.includes('unauthorized')) {
    return 'Authentication failed';
  }
  if (
    lowerMsg.includes('ai-ml') ||
    lowerMsg.includes('generation') ||
    lowerMsg.includes('llm') ||
    lowerMsg.includes('groq') ||
    lowerMsg.includes('gemini')
  ) {
    if (lowerMsg.includes('rate_limit') || lowerMsg.includes('rate limit') || lowerMsg.includes('429')) {
      return 'AI generation failed due to LLM provider rate limit';
    }
    if (lowerMsg.includes('validation')) {
      return 'AI generation output format validation failed';
    }
    return sanitizedMessage;
  }
  if (lowerMsg.includes('validation') || lowerMsg.includes('zod')) {
    return 'Invalid request data';
  }
  if (lowerMsg.includes('unique constraint') || lowerMsg.includes('unique violation') || lowerMsg.includes('already exists')) {
    return 'Record already exists';
  }
  if (lowerMsg.includes('invoice not found')) {
    return 'Invoice not found';
  }

  return sanitizedMessage;
}

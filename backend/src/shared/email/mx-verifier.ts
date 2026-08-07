import dns from 'dns/promises';
import { ValidationError } from '../errors/index.js';
import { logger } from '../logger.js';

/**
 * Validates that an email address has a domain with active MX records capable of receiving email.
 * If MX lookup fails or returns empty, throws a ValidationError.
 */
export async function verifyEmailDomainMx(email: string): Promise<string> {
  const parts = email.trim().split('@');
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new ValidationError('Invalid email format');
  }

  const domain = parts[1].toLowerCase();

  try {
    const mxRecords = await dns.resolveMx(domain);
    if (!mxRecords || mxRecords.length === 0) {
      throw new ValidationError(`The domain "${domain}" does not have valid MX records and cannot receive incoming emails.`);
    }
    return domain;
  } catch (err: unknown) {
    if (err instanceof ValidationError) throw err;
    logger.warn(`MX lookup failed for domain "${domain}":`, err);
    throw new ValidationError(`The domain "${domain}" does not have valid MX records to receive emails.`);
  }
}

import dns from 'dns/promises';
import { ValidationError } from '../errors/index.js';
import { logger } from '../logger.js';

/**
 * Validates that an inbound reply domain string is a valid domain name (not an email address).
 */
export function validateInboundDomainFormat(domainInput: string): string {
  const trimmed = domainInput.trim().toLowerCase();
  if (!trimmed) {
    throw new ValidationError('Inbound reply domain is required.');
  }
  if (trimmed.includes('@')) {
    throw new ValidationError('Inbound reply domain cannot be an email address. Enter a full domain name such as reply.acme.com.');
  }
  if (trimmed.includes('/') || trimmed.includes(':') || trimmed.includes(' ')) {
    throw new ValidationError('Inbound reply domain must be a valid domain name (e.g., reply.acme.com).');
  }
  if (!trimmed.includes('.')) {
    throw new ValidationError(`"${trimmed}" is not a full domain name. Enter the full domain name (e.g., ${trimmed}.jaktra.site or reply.yourdomain.com).`);
  }
  return trimmed;
}

/**
 * Validates that an email address or domain name has active MX records capable of receiving email.
 * If MX lookup fails or returns empty, throws a ValidationError.
 */
export async function verifyEmailDomainMx(emailOrDomain: string): Promise<string> {
  const trimmed = emailOrDomain.trim().toLowerCase();
  let domain = trimmed;
  if (trimmed.includes('@')) {
    const parts = trimmed.split('@');
    if (parts.length !== 2 || !parts[1]) {
      throw new ValidationError('Invalid email format');
    }
    domain = parts[1];
  }

  if (!domain) {
    throw new ValidationError('Domain name cannot be empty');
  }

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

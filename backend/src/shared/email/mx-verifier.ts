import type { MxRecord } from 'dns';
import dns from 'dns/promises';
import { ValidationError } from '../errors/index.js';
import { logger } from '../logger.js';

/**
 * Validates that an inbound reply domain string is a valid subdomain name (not a root domain or email address).
 */
export function validateInboundDomainFormat(domainInput: string): string {
  const trimmed = domainInput.trim().toLowerCase();
  if (!trimmed) {
    throw new ValidationError('Inbound reply subdomain is required.');
  }
  if (trimmed.includes('@')) {
    throw new ValidationError('Inbound reply subdomain cannot be an email address. Enter a dedicated subdomain (e.g., reply.yourdomain.com).');
  }
  if (trimmed.includes('/') || trimmed.includes(':') || trimmed.includes(' ')) {
    throw new ValidationError('Inbound reply subdomain must be a valid subdomain format (e.g., reply.yourdomain.com).');
  }
  const parts = trimmed.split('.');
  if (parts.length < 3) {
    throw new ValidationError(
      `"${trimmed}" is a root domain. Please use a dedicated subdomain (e.g. reply.${trimmed}) to prevent overriding your root email inboxes.`
    );
  }
  return trimmed;
}

async function resolveMxFresh(domain: string): Promise<MxRecord[]> {
  try {
    const resolver = new dns.Resolver();
    resolver.setServers(['1.1.1.1', '8.8.8.8', '1.0.0.1', '8.8.4.4']);
    return await resolver.resolveMx(domain);
  } catch {
    return await dns.resolveMx(domain);
  }
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
    const mxRecords = await resolveMxFresh(domain);
    if (!mxRecords || mxRecords.length === 0) {
      throw new ValidationError(`No DNS MX records found for "${domain}".`);
    }
    return domain;
  } catch (err: unknown) {
    if (err instanceof ValidationError) throw err;
    logger.warn(`MX lookup failed for domain "${domain}":`, err);
    throw new ValidationError(`No DNS MX records found for "${domain}".`);
  }
}

/**
 * Validates that an inbound reply domain has active MX records specifically pointing to the target provider.
 */
export async function verifyInboundMxForProvider(
  domain: string,
  provider: 'sendgrid' | 'resend'
): Promise<string> {
  const normalizedDomain = validateInboundDomainFormat(domain);

  try {
    const mxRecords = await resolveMxFresh(normalizedDomain);
    if (!mxRecords || mxRecords.length === 0) {
      throw new ValidationError(
        `No DNS MX records found for "${normalizedDomain}". Please add the MX record in your DNS provider.`
      );
    }

    const exchanges = mxRecords.map((r) => (r.exchange || '').toLowerCase().trim());

    if (provider === 'sendgrid') {
      const isSendgrid = exchanges.some((ex) => ex.includes('sendgrid.net'));
      if (!isSendgrid) {
        throw new ValidationError(
          `The MX records for "${normalizedDomain}" do not point to SendGrid. Please update your DNS MX record to "mx.sendgrid.net" with priority 10.`
        );
      }
    } else if (provider === 'resend') {
      const isResend = exchanges.some(
        (ex) =>
          ex.includes('inbound-smtp') ||
          ex.includes('inbound.resend') ||
          ex.includes('resend.com') ||
          ex.includes('resend.dev') ||
          ex.includes('resend.app') ||
          (ex.includes('amazonaws.com') && ex.includes('inbound'))
      );
      if (!isResend) {
        throw new ValidationError(
          `The MX records for "${normalizedDomain}" do not point to Resend. Please update your DNS MX record with priority 10.`
        );
      }
    }

    return normalizedDomain;
  } catch (err: unknown) {
    if (err instanceof ValidationError) throw err;
    logger.warn(`MX lookup failed for provider ${provider} on domain "${normalizedDomain}":`, err);
    throw new ValidationError(
      `No DNS MX records found for "${normalizedDomain}". Please add the MX record in your DNS provider.`
    );
  }
}


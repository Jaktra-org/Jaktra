import type { MxRecord } from 'dns';
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
      throw new ValidationError(`The domain "${domain}" does not have valid MX records and cannot receive incoming emails.`);
    }
    return domain;
  } catch (err: unknown) {
    if (err instanceof ValidationError) throw err;
    logger.warn(`MX lookup failed for domain "${domain}":`, err);
    throw new ValidationError(`The domain "${domain}" does not have valid MX records to receive emails.`);
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
        `The domain "${normalizedDomain}" has no active DNS MX records. Please add an MX record pointing to your ${provider === 'sendgrid' ? 'SendGrid (mx.sendgrid.net)' : 'Resend'} inbound mail server.`
      );
    }

    const exchanges = mxRecords.map((r) => (r.exchange || '').toLowerCase().trim());

    if (provider === 'sendgrid') {
      const isSendgrid = exchanges.some((ex) => ex.includes('sendgrid.net'));
      if (!isSendgrid) {
        const found = exchanges.join(', ') || 'none';
        throw new ValidationError(
          `The MX records for "${normalizedDomain}" do not point to SendGrid. Found: [${found}]. Please update your DNS MX record to point to "mx.sendgrid.net" with priority 10.`
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
        const found = exchanges.join(', ') || 'none';
        throw new ValidationError(
          `The MX records for "${normalizedDomain}" do not point to Resend. Found: [${found}]. Please configure your DNS MX record to point to your Resend inbound receiving server (as shown in your Resend Domains dashboard) with priority 10.`
        );
      }
    }

    return normalizedDomain;
  } catch (err: unknown) {
    if (err instanceof ValidationError) throw err;
    logger.warn(`MX lookup failed for provider ${provider} on domain "${normalizedDomain}":`, err);
    throw new ValidationError(
      `Failed to verify DNS MX records for "${normalizedDomain}": ${err instanceof Error ? err.message : String(err)}`
    );
  }
}


import type { MxRecord } from 'dns';
import * as dnsPromises from 'dns/promises';
import { CommunicationError } from '../errors/index.js';

interface DnsWithResolveMx {
  resolveMx?: (domain: string) => Promise<MxRecord[]>;
  default?: {
    resolveMx?: (domain: string) => Promise<MxRecord[]>;
  };
}

/**
 * Helper to call resolveMx supporting both ESM default and named exports/mocks.
 */
async function resolveDomainMx(domain: string): Promise<MxRecord[]> {
  const dnsModule = dnsPromises as unknown as DnsWithResolveMx;
  if (typeof dnsModule.resolveMx === 'function') {
    return await dnsModule.resolveMx(domain);
  }
  if (dnsModule.default && typeof dnsModule.default.resolveMx === 'function') {
    return await dnsModule.default.resolveMx(domain);
  }
  throw new Error('dns.resolveMx is not available');
}

/**
 * Independent recipient email validator.
 * Validates email format and verifies that the destination domain has active DNS MX records.
 * Throws CommunicationError (HTTP 400) if format is invalid, no MX records exist, or domain is unreachable.
 */
export async function validateRecipientEmail(email: string): Promise<void> {
  if (!email || typeof email !== 'string' || !email.trim()) {
    throw new CommunicationError('Recipient email address is missing or empty.', 400);
  }
  const trimmed = email.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    throw new CommunicationError(`Invalid recipient email address format: '${email}'`, 400);
  }
  const domain = trimmed.split('@')[1];
  try {
    const mx = await resolveDomainMx(domain);
    if (!mx || mx.length === 0) {
      throw new CommunicationError(`Recipient domain '${domain}' has no valid mail servers (MX records). Delivery will fail.`, 400);
    }
  } catch (err: unknown) {
    if (err instanceof CommunicationError) throw err;
    throw new CommunicationError(`Recipient domain '${domain}' is unreachable or invalid: ${err instanceof Error ? err.message : String(err)}`, 400);
  }
}

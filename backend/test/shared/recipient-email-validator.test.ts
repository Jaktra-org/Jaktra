import { describe, it, expect, vi, beforeEach } from 'vitest';
import dns from 'dns/promises';
import { validateRecipientEmail } from '../../src/shared/email/recipient-email-validator.js';
import { CommunicationError } from '../../src/shared/errors/index.js';

const { mockResolveMx } = vi.hoisted(() => ({
  mockResolveMx: vi.fn(),
}));

vi.mock('dns/promises', () => {
  class MockResolver {
    setServers = vi.fn();
    resolveMx = mockResolveMx;
  }
  return {
    default: {
      resolveMx: mockResolveMx,
      Resolver: MockResolver,
    },
    resolveMx: mockResolveMx,
    Resolver: MockResolver,
  };
});

describe('RecipientEmailValidator (Independent Email Checker)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('passes when email format is valid and domain has valid MX records', async () => {
    mockResolveMx.mockResolvedValueOnce([
      { exchange: 'mail.example.com', priority: 10 },
    ]);

    await expect(validateRecipientEmail('customer@valid-domain.com')).resolves.toBeUndefined();
    expect(mockResolveMx).toHaveBeenCalledWith('valid-domain.com');
  });

  it('throws CommunicationError when email is missing or empty', async () => {
    await expect(validateRecipientEmail('')).rejects.toThrow(
      new CommunicationError('Recipient email address is missing or empty.', 400)
    );
    await expect(validateRecipientEmail('   ')).rejects.toThrow(
      new CommunicationError('Recipient email address is missing or empty.', 400)
    );
  });

  it('throws CommunicationError when email format is invalid', async () => {
    await expect(validateRecipientEmail('invalid-email-string')).rejects.toThrow(
      new CommunicationError("Invalid recipient email address format: 'invalid-email-string'", 400)
    );
    await expect(validateRecipientEmail('user@')).rejects.toThrow(
      new CommunicationError("Invalid recipient email address format: 'user@'", 400)
    );
    await expect(validateRecipientEmail('@domain.com')).rejects.toThrow(
      new CommunicationError("Invalid recipient email address format: '@domain.com'", 400)
    );
  });

  it('throws CommunicationError when domain has no MX records (empty array)', async () => {
    mockResolveMx.mockResolvedValueOnce([]);

    await expect(validateRecipientEmail('customer@no-mx-domain.com')).rejects.toThrow(
      new CommunicationError(
        "Recipient domain 'no-mx-domain.com' has no valid mail servers (MX records). Delivery will fail.",
        400
      )
    );
  });

  it('throws CommunicationError when domain is unreachable or DNS lookup fails', async () => {
    mockResolveMx.mockRejectedValueOnce(new Error('queryMx ENOTFOUND non-existent-domain.xyz'));

    await expect(validateRecipientEmail('customer@non-existent-domain.xyz')).rejects.toThrow(
      /Recipient domain 'non-existent-domain.xyz' is unreachable or invalid/
    );
  });
});

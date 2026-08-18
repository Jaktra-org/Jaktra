import { describe, it, expect, vi, beforeEach } from 'vitest';
import dns from 'dns/promises';
import {
  validateInboundDomainFormat,
  verifyEmailDomainMx,
  verifyInboundMxForProvider,
} from '../../src/shared/email/mx-verifier.js';
import { ValidationError } from '../../src/shared/errors/index.js';

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
    Resolver: MockResolver,
  };
});

describe('MX Verifier Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateInboundDomainFormat', () => {
    it('accepts valid full domain names', () => {
      expect(validateInboundDomainFormat('reply.jaktra.site')).toBe('reply.jaktra.site');
      expect(validateInboundDomainFormat('  inbound.company.com  ')).toBe('inbound.company.com');
    });

    it('rejects empty or whitespace domains', () => {
      expect(() => validateInboundDomainFormat('')).toThrow(ValidationError);
      expect(() => validateInboundDomainFormat('   ')).toThrow(ValidationError);
    });

    it('rejects email addresses containing @', () => {
      expect(() => validateInboundDomainFormat('user@example.com')).toThrow(
        'cannot be an email address'
      );
    });

    it('rejects root domains without dedicated subdomain', () => {
      expect(() => validateInboundDomainFormat('jaktra.site')).toThrow(
        'is a root domain'
      );
      expect(() => validateInboundDomainFormat('localhost')).toThrow(
        'is a root domain'
      );
    });
  });

  describe('verifyEmailDomainMx', () => {
    it('passes when valid MX records exist', async () => {
      vi.mocked(dns.resolveMx).mockResolvedValueOnce([
        { exchange: 'mail.google.com', priority: 10 },
      ]);
      const res = await verifyEmailDomainMx('hello@company.com');
      expect(res).toBe('company.com');
    });

    it('throws when no MX records found', async () => {
      vi.mocked(dns.resolveMx).mockResolvedValueOnce([]);
      await expect(verifyEmailDomainMx('company.com')).rejects.toThrow(
        'No DNS MX records found for "company.com"'
      );
    });
  });

  describe('verifyInboundMxForProvider', () => {
    describe('SendGrid Provider', () => {
      it('accepts domains with SendGrid MX records', async () => {
        vi.mocked(dns.resolveMx).mockResolvedValueOnce([
          { exchange: 'mx.sendgrid.net', priority: 10 },
        ]);
        const domain = await verifyInboundMxForProvider('reply.jaktra.site', 'sendgrid');
        expect(domain).toBe('reply.jaktra.site');
      });

      it('rejects domains with non-SendGrid MX records', async () => {
        vi.mocked(dns.resolveMx).mockResolvedValueOnce([
          { exchange: 'aspmx.l.google.com', priority: 1 },
          { exchange: 'alt1.aspmx.l.google.com', priority: 5 },
        ]);
        await expect(
          verifyInboundMxForProvider('reply.jaktra.site', 'sendgrid')
        ).rejects.toThrow(
          'The MX records for "reply.jaktra.site" do not point to SendGrid'
        );
      });
    });

    describe('Resend Provider', () => {
      it('accepts domains with Resend MX records (inbound.resend.com)', async () => {
        vi.mocked(dns.resolveMx).mockResolvedValueOnce([
          { exchange: 'inbound.resend.com', priority: 10 },
        ]);
        const domain = await verifyInboundMxForProvider('reply.jaktra.site', 'resend');
        expect(domain).toBe('reply.jaktra.site');
      });

      it('accepts domains with Resend AWS Inbound SMTP records (inbound-smtp.us-east-1.amazonaws.com)', async () => {
        vi.mocked(dns.resolveMx).mockResolvedValueOnce([
          { exchange: 'inbound-smtp.us-east-1.amazonaws.com', priority: 10 },
        ]);
        const domain = await verifyInboundMxForProvider('reply.jaktra.site', 'resend');
        expect(domain).toBe('reply.jaktra.site');
      });

      it('rejects feedback-smtp bounce-only records because they cannot receive incoming debtor replies', async () => {
        vi.mocked(dns.resolveMx).mockResolvedValueOnce([
          { exchange: 'feedback-smtp.us-east-1.amazonses.com', priority: 10 },
        ]);
        await expect(
          verifyInboundMxForProvider('reply.jaktra.site', 'resend')
        ).rejects.toThrow(
          'The MX records for "reply.jaktra.site" do not point to Resend'
        );
      });

      it('rejects domains pointing to SendGrid or standard mail servers when configuring Resend', async () => {
        vi.mocked(dns.resolveMx).mockResolvedValueOnce([
          { exchange: 'mx.sendgrid.net', priority: 10 },
        ]);
        await expect(
          verifyInboundMxForProvider('reply.jaktra.site', 'resend')
        ).rejects.toThrow(
          'The MX records for "reply.jaktra.site" do not point to Resend'
        );
      });

      it('throws clear error when no MX records exist at all', async () => {
        vi.mocked(dns.resolveMx).mockResolvedValueOnce([]);
        await expect(
          verifyInboundMxForProvider('reply.jaktra.site', 'resend')
        ).rejects.toThrow(
          'No DNS MX records found for "reply.jaktra.site"'
        );
      });
    });
  });
});

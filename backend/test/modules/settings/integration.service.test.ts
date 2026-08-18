import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IntegrationService } from '../../../src/modules/settings/integration.service.js';
import { encrypt } from '../../../src/shared/encryption.js';

import sgClient from '@sendgrid/client';

const mockResendDomainsList = vi.fn();
const mockResendDomainsGet = vi.fn();
const mockResendEmailsSend = vi.fn();
vi.mock('resend', () => {
  class MockResend {
    domains = { list: mockResendDomainsList, get: mockResendDomainsGet };
    emails = { send: mockResendEmailsSend };
  }
  return {
    Resend: MockResend,
  };
});

vi.mock('@sendgrid/client', () => {
  return {
    default: {
      setApiKey: vi.fn(),
      request: vi.fn(),
    },
  };
});

vi.mock('../../../src/shared/email/mx-verifier.js', () => ({
  verifyEmailDomainMx: vi.fn().mockResolvedValue(undefined),
  verifyInboundMxForProvider: vi.fn().mockResolvedValue(undefined),
  validateInboundDomainFormat: (d: string) => d,
}));

vi.mock('../../../src/shared/encryption.js', () => ({
  encrypt: vi.fn().mockReturnValue({
    ciphertext: 'encrypted_secret',
    iv: 'mock_iv',
    authTag: 'mock_authTag'
  }),
  decrypt: vi.fn((config, context) => {
    if (context && context.includes('sendgrid')) {
      return 'SG.mock_sendgrid_key';
    }
    if (context && context.includes('resend')) {
      return 're_mock_resend_key';
    }
    return JSON.stringify({
      keyId: 'rzp_test_123',
      keySecret: 'secret_456',
      webhookSecret: 'whsec_789'
    });
  })
}));

describe('IntegrationService', () => {
  let service: IntegrationService;
  let mockRepo: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRepo = {
      getIntegration: vi.fn(),
      getSendgridIntegration: vi.fn().mockResolvedValue({
        base: { provider: 'sendgrid', overallStatus: 'active' },
        detail: { keyVersion: 1, ciphertext: 'encrypted_secret', iv: 'mock_iv', authTag: 'mock_authTag' }
      }),
      getSmtpIntegration: vi.fn(),
      getResendIntegration: vi.fn().mockResolvedValue(null),
      getWebhookToken: vi.fn().mockResolvedValue('mock-webhook-token'),
      upsertIntegration: vi.fn(),
      deleteIntegration: vi.fn(),
    };
    service = new IntegrationService(mockRepo as any);
  });

  describe('getSafeIntegrations', () => {
    it('strips secrets before returning to frontend', async () => {
      mockRepo.getIntegration.mockResolvedValueOnce({
        provider: 'razorpay',
        lastValidationResult: 'valid',
        credentials: { keyId: 'enc_key', keySecret: 'enc_secret', webhookSecret: 'enc_webhook' },
      });

      const result = await service.getIntegrationStatusRazorpay('tenant_1');
      
      expect(result).toBeDefined();
      expect(result.isConfigured).toBe(true);
      expect((result as any).lastValidationResult).toBe('valid');
      
      // Crucial: full secrets must not be returned
      expect((result as any).credentials).toBeUndefined();
      expect((result as any).keySecret).toBeUndefined();
      expect((result as any).webhookSecret).toBeUndefined();
    });
  });

  describe('validateAndSaveRazorpayKey', () => {
    it('encrypts secrets before saving', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({})
      }) as any;

      await service.validateAndSaveRazorpayKey('tenant_1', {
        keyId: 'rzp_test_123',
        keySecret: 'secret_456',
        webhookSecret: 'whsec_789'
      });

      expect(encrypt).toHaveBeenCalledWith(
        JSON.stringify({
          keyId: 'rzp_test_123',
          keySecret: 'secret_456',
          webhookSecret: 'whsec_789'
        }),
        expect.any(String)
      );

      expect(mockRepo.upsertIntegration).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: 'tenant_1',
          provider: 'razorpay',
          ciphertext: 'encrypted_secret',
          iv: 'mock_iv',
          authTag: 'mock_authTag'
        })
      );
    });
  });

  describe('getConfigurationHealth', () => {
    it('returns true for both checks when sender and domain are verified/authenticated', async () => {
      mockRepo.getIntegration.mockResolvedValueOnce({
        provider: 'sendgrid',
        keyVersion: 1,
        ciphertext: 'encrypted_secret',
        iv: 'mock_iv',
        authTag: 'mock_authTag',
      });

      vi.mocked(sgClient.request).mockResolvedValueOnce([
        { statusCode: 200, body: { results: [{ from_email: 'billing@acme.com', verified: true }] } },
      ] as any);
      vi.mocked(sgClient.request).mockResolvedValueOnce([
        { statusCode: 200, body: [{ domain: 'acme.com', valid: true }] },
      ] as any);

      const result = await service.getConfigurationHealth('tenant_1', 'billing@acme.com');

      expect(result.senderVerified).toBe(true);
      expect(result.domainAuthenticated).toBe(true);
      expect(result.reasons).toHaveLength(0);
    });

    it('returns false for sender check when sender is unverified', async () => {
      mockRepo.getIntegration.mockResolvedValueOnce({
        provider: 'sendgrid',
        keyVersion: 1,
        ciphertext: 'encrypted_secret',
        iv: 'mock_iv',
        authTag: 'mock_authTag',
      });

      vi.mocked(sgClient.request).mockResolvedValueOnce([
        { statusCode: 200, body: { results: [{ from_email: 'billing@acme.com', verified: false }] } },
      ] as any);
      vi.mocked(sgClient.request).mockResolvedValueOnce([
        { statusCode: 200, body: [{ domain: 'acme.com', valid: true }] },
      ] as any);

      const result = await service.getConfigurationHealth('tenant_1', 'billing@acme.com');

      expect(result.senderVerified).toBe(false);
      expect(result.domainAuthenticated).toBe(true);
      expect(result.reasons).toContain('Sender email is pending verification in SendGrid.');
    });

    it('returns false for domain check when domain authentication is invalid', async () => {
      mockRepo.getIntegration.mockResolvedValueOnce({
        provider: 'sendgrid',
        keyVersion: 1,
        ciphertext: 'encrypted_secret',
        iv: 'mock_iv',
        authTag: 'mock_authTag',
      });

      vi.mocked(sgClient.request).mockResolvedValueOnce([
        { statusCode: 200, body: { results: [{ from_email: 'billing@acme.com', verified: true }] } },
      ] as any);
      vi.mocked(sgClient.request).mockResolvedValueOnce([
        { statusCode: 200, body: [{ domain: 'acme.com', valid: false }] },
      ] as any);

      const result = await service.getConfigurationHealth('tenant_1', 'billing@acme.com');

      expect(result.senderVerified).toBe(true);
      expect(result.domainAuthenticated).toBe(false);
      expect(result.reasons).toContain('Domain "acme.com" is configured but authentication (SPF/DKIM) is invalid or pending DNS update.');
    });

    it('returns insufficient_permissions when SendGrid returns 403', async () => {
      mockRepo.getIntegration.mockResolvedValueOnce({
        provider: 'sendgrid',
        keyVersion: 1,
        ciphertext: 'encrypted_secret',
        iv: 'mock_iv',
        authTag: 'mock_authTag',
      });

      const error403 = { code: 403, response: { statusCode: 403 } };
      vi.mocked(sgClient.request).mockRejectedValue(error403);

      const result = await service.getConfigurationHealth('tenant_1', 'billing@acme.com');

      expect(result.senderVerified).toBe('insufficient_permissions');
      expect(result.domainAuthenticated).toBe('insufficient_permissions');
      expect(result.reasons).toContain('Insufficient API key permissions to check sender verification status.');
      expect(result.reasons).toContain('Insufficient API key permissions to check domain authentication status.');
    });

    it('returns check_failed when SendGrid returns other error codes', async () => {
      mockRepo.getIntegration.mockResolvedValueOnce({
        provider: 'sendgrid',
        keyVersion: 1,
        ciphertext: 'encrypted_secret',
        iv: 'mock_iv',
        authTag: 'mock_authTag',
      });

      const error500 = { code: 500, response: { statusCode: 500 } };
      vi.mocked(sgClient.request).mockRejectedValue(error500);

      const result = await service.getConfigurationHealth('tenant_1', 'billing@acme.com');

      expect(result.senderVerified).toBe('check_failed');
      expect(result.domainAuthenticated).toBe('check_failed');
    });

    it('reports results independently in partial-failure scenarios (e.g. sender succeeds, domain fails)', async () => {
      mockRepo.getIntegration.mockResolvedValueOnce({
        provider: 'sendgrid',
        keyVersion: 1,
        ciphertext: 'encrypted_secret',
        iv: 'mock_iv',
        authTag: 'mock_authTag',
      });

      // Mock first call (verified senders) to succeed
      vi.mocked(sgClient.request).mockResolvedValueOnce([
        { statusCode: 200, body: { results: [{ from_email: 'billing@acme.com', verified: true }] } },
      ] as any);
      // Mock second call (whitelabel domains) to fail transiently
      vi.mocked(sgClient.request).mockRejectedValueOnce({ code: 500 });

      const result = await service.getConfigurationHealth('tenant_1', 'billing@acme.com');

      expect(result.senderVerified).toBe(true);
      expect(result.domainAuthenticated).toBe('check_failed');
      expect(result.reasons).toContain('Failed to query SendGrid domain authentication API (Status: 500).');
    });

    it('caches successful/decisive results but does not cache check_failed results', async () => {
      let cache: Record<string, string> = {};
      const mockRedis = {
        isOpen: true,
        get: vi.fn((key) => Promise.resolve(cache[key] || null)),
        set: vi.fn((key, val) => { cache[key] = val; return Promise.resolve(); }),
      };

      const customService = new IntegrationService(mockRepo as any, mockRedis as any);

      // 1. Decisive health check (should be cached)
      mockRepo.getIntegration.mockResolvedValueOnce({
        provider: 'sendgrid',
        keyVersion: 1,
        ciphertext: 'encrypted_secret',
        iv: 'mock_iv',
        authTag: 'mock_authTag',
      });
      vi.mocked(sgClient.request).mockResolvedValueOnce([
        { statusCode: 200, body: { results: [{ from_email: 'billing@acme.com', verified: true }] } },
      ] as any);
      vi.mocked(sgClient.request).mockResolvedValueOnce([
        { statusCode: 200, body: [{ domain: 'acme.com', valid: true }] },
      ] as any);

      const result1 = await customService.getConfigurationHealth('tenant_cache', 'billing@acme.com');
      expect(result1.senderVerified).toBe(true);
      expect(mockRedis.set).toHaveBeenCalledTimes(1);

      // 2. Call again - should retrieve from cache, and sgClient should not be hit
      vi.mocked(sgClient.request).mockClear();
      const result2 = await customService.getConfigurationHealth('tenant_cache', 'billing@acme.com');
      expect(result2.senderVerified).toBe(true);
      expect(vi.mocked(sgClient.request)).not.toHaveBeenCalled();

      // 3. Check failed result (should not be cached)
      cache = {};
      mockRedis.set.mockClear();
      mockRepo.getIntegration.mockResolvedValueOnce({
        provider: 'sendgrid',
        keyVersion: 1,
        ciphertext: 'encrypted_secret',
        iv: 'mock_iv',
        authTag: 'mock_authTag',
      });
      vi.mocked(sgClient.request).mockRejectedValue({ code: 500 });

      const result3 = await customService.getConfigurationHealth('tenant_failed', 'billing@acme.com');
      expect(result3.senderVerified).toBe('check_failed');
      expect(mockRedis.set).not.toHaveBeenCalled();
    });
  });

  describe('SendGrid Step Reset Behavior', () => {
    it('clears step 2 and step 3 saved data when step 1 API key is updated', async () => {
      mockRepo.saveSendgridIntegrationTransaction = vi.fn().mockResolvedValue(undefined);
      vi.mocked(sgClient.request).mockResolvedValueOnce([{ statusCode: 200, body: {} }] as any);

      await service.validateAndSaveSendgridKey('tenant_1', {
        apiKey: 'SG.brand_new_key_123',
      });

      expect(mockRepo.saveSendgridIntegrationTransaction).toHaveBeenCalledWith(
        'tenant_1',
        { senderName: null, senderEmail: null, replyTo: null },
        expect.objectContaining({
          clearStep2: true,
          clearStep3: true,
        })
      );
    });

    it('clears step 3 saved data when step 2 sender details are updated', async () => {
      mockRepo.saveSendgridIntegrationTransaction = vi.fn().mockResolvedValue(undefined);
      vi.mocked(sgClient.request).mockResolvedValueOnce([{ statusCode: 200, body: {} }] as any);
      service.performSendgridIdentityCheck = vi.fn().mockResolvedValue({ senderVerified: true, domainAuthenticated: true });

      await service.validateAndSaveSendgridKey('tenant_1', {
        apiKey: 'SG.placeholder',
        senderName: 'New Sender Name',
        senderEmail: 'new@company.com',
      });

      expect(mockRepo.saveSendgridIntegrationTransaction).toHaveBeenCalledWith(
        'tenant_1',
        { senderName: 'New Sender Name', senderEmail: 'new@company.com', replyTo: undefined },
        expect.objectContaining({
          clearStep3: true,
        })
      );
    });
  });

  describe('Resend Integration Operations', () => {
    it('validates, encrypts, and saves Resend integration', async () => {
      mockResendDomainsList.mockResolvedValueOnce({ data: [{ name: 'acme.com', status: 'verified' }], error: null });
      mockRepo.saveResendIntegrationTransaction = vi.fn().mockResolvedValue(undefined);
      mockRepo.getResendIntegration = vi.fn().mockResolvedValue(null);

      const result = await service.validateAndSaveResendKey('tenant_1', {
        apiKey: 're_valid_api_key_123',
        senderName: 'Acme Billing',
        senderEmail: 'billing@acme.com',
        replyTo: 'support@acme.com',
      });

      expect(result.message).toContain('configured successfully');
      expect(encrypt).toHaveBeenCalledWith('re_valid_api_key_123', 'tenant_1:resend:v1');
      expect(mockRepo.saveResendIntegrationTransaction).toHaveBeenCalledWith(
        'tenant_1',
        {
          senderName: 'Acme Billing',
          senderEmail: 'billing@acme.com',
          replyTo: 'support@acme.com',
        },
        expect.objectContaining({
          ciphertext: 'encrypted_secret',
          iv: 'mock_iv',
          authTag: 'mock_authTag',
          keyVersion: 1,
          lastValidationResult: 'valid',
        })
      );
    });

    it('rejects sender email when domain is not registered in Resend account', async () => {
      mockResendDomainsList.mockResolvedValueOnce({ data: [{ name: 'acme.com', status: 'verified' }], error: null });
      mockRepo.saveResendIntegrationTransaction = vi.fn().mockResolvedValue(undefined);
      mockRepo.getResendIntegration = vi.fn().mockResolvedValue(null);

      await expect(
        service.validateAndSaveResendKey('tenant_1', {
          apiKey: 're_valid_api_key_123',
          senderName: 'Test Company',
          senderEmail: 'invoice@jakhar.xyz',
        })
      ).rejects.toThrow('The domain "jakhar.xyz" is not registered in your Resend account');
    });

    it('rejects API key without "re_" prefix', async () => {
      await expect(
        service.validateAndSaveResendKey('tenant_1', {
          apiKey: 'invalid_key_prefix',
        })
      ).rejects.toThrow('Resend API keys must start with "re_"');
    });

    it('throws "Invalid Resend API Key." when Resend API key validation fails', async () => {
      mockResendDomainsList.mockResolvedValueOnce({
        data: null,
        error: { name: 'invalid_api_key', message: 'API key is invalid' },
      });

      await expect(
        service.validateAndSaveResendKey('tenant_1', {
          apiKey: 're_invalid_secret_key',
        })
      ).rejects.toThrow('Invalid Resend API Key.');
    });

    it('throws insufficient access error when Resend API key is restricted and lacks full access', async () => {
      mockResendDomainsList.mockResolvedValueOnce({
        data: null,
        error: { name: 'restricted_api_key', message: 'This API key is restricted and does not have permission to access domains.' },
      });

      await expect(
        service.validateAndSaveResendKey('tenant_1', {
          apiKey: 're_restricted_secret_key',
        })
      ).rejects.toThrow('The Resend API key lacks full access permissions. Please create and provide an API key with "Full access".');
    });

    it('decrypts Resend API key from email_integration_resend', async () => {
      mockRepo.getResendIntegration = vi.fn().mockResolvedValue({
        base: { provider: 'resend', overallStatus: 'active' },
        detail: {
          keyVersion: 1,
          ciphertext: 'encrypted_secret',
          iv: 'mock_iv',
          authTag: 'mock_authTag',
        },
      });

      const key = await service.getDecryptedResendKey('tenant_1');
      expect(key).toBe('re_mock_resend_key');
    });

    it('throws NOT_CONFIGURED when decrypting unconfigured Resend integration', async () => {
      mockRepo.getResendIntegration = vi.fn().mockResolvedValue(null);

      await expect(service.getDecryptedResendKey('tenant_1')).rejects.toThrow();
    });

    it('deletes Resend email integration', async () => {
      mockRepo.deleteEmailIntegration = vi.fn().mockResolvedValue(undefined);

      await service.deleteResendIntegration('tenant_1');
      expect(mockRepo.deleteEmailIntegration).toHaveBeenCalledWith('tenant_1', 'resend');
    });

    it('sends test email using Resend and returns success response', async () => {
      mockRepo.getResendIntegration = vi.fn().mockResolvedValue({
        base: { provider: 'resend', overallStatus: 'active', senderName: 'Finance', senderEmail: 'finance@acme.com', replyTo: 'reply@acme.com' },
        detail: {
          keyVersion: 1,
          ciphertext: 'encrypted_secret',
          iv: 'mock_iv',
          authTag: 'mock_authTag',
        },
      });
      mockResendEmailsSend.mockResolvedValueOnce({
        data: { id: 're_test_email_id_999' },
        error: null,
      });

      const result = await service.testResendKey('tenant_1', 'test@recipient.com');
      expect(result.success).toBe(true);
      expect(result.message).toContain('re_test_email_id_999');
      expect(mockResendEmailsSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'Finance <finance@acme.com>',
          to: ['test@recipient.com'],
          replyTo: 'reply@acme.com',
        })
      );
    });

    it('sets Resend reply mode and resets verification if mailbox changes', async () => {
      mockRepo.getResendIntegration = vi.fn().mockResolvedValue({
        base: { provider: 'resend', overallStatus: 'partially_configured' },
        detail: { replyMailboxEmail: 'old@acme.com', replyMailboxVerified: true },
      });
      mockRepo.saveResendIntegrationTransaction = vi.fn().mockResolvedValue(undefined);
      mockRepo.getResendSetupProgress = vi.fn().mockResolvedValue({
        step2SenderAndMode: { replyMode: 'real_mailbox', replyMailboxEmail: 'new@acme.com', replyMailboxVerified: false },
      });

      await service.setResendReplyMode('tenant_1', 'real_mailbox', 'new@acme.com');

      expect(mockRepo.saveResendIntegrationTransaction).toHaveBeenCalledWith(
        'tenant_1',
        {},
        expect.objectContaining({
          replyMode: 'real_mailbox',
          replyMailboxEmail: 'new@acme.com',
          replyMailboxVerified: false,
        })
      );
    });

    it('generates and saves OTP for Resend reply mailbox verification', async () => {
      mockRepo.getResendIntegration = vi.fn().mockResolvedValue({
        base: { provider: 'resend' },
        detail: {},
      });
      mockRepo.saveResendIntegrationTransaction = vi.fn().mockResolvedValue(undefined);
      mockRepo.getResendSetupProgress = vi.fn().mockResolvedValue({});

      const { targetEmail, otpCode } = await service.sendResendReplyMailboxOtp('tenant_1', 'support@acme.com');

      expect(targetEmail).toBe('support@acme.com');
      expect(otpCode).toMatch(/^\d{6}$/);
      expect(mockRepo.saveResendIntegrationTransaction).toHaveBeenCalledWith(
        'tenant_1',
        {},
        expect.objectContaining({
          replyMode: 'real_mailbox',
          replyMailboxEmail: 'support@acme.com',
          replyMailboxVerified: false,
          replyMailboxOtpCode: otpCode,
        })
      );
    });

    it('verifies valid OTP for Resend reply mailbox', async () => {
      mockRepo.getResendIntegration = vi.fn().mockResolvedValue({
        base: { provider: 'resend' },
        detail: {
          replyMailboxOtpCode: '123456',
          replyMailboxOtpExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
        },
      });
      mockRepo.saveResendIntegrationTransaction = vi.fn().mockResolvedValue(undefined);
      mockRepo.getResendSetupProgress = vi.fn().mockResolvedValue({});

      const result = await service.verifyResendReplyMailboxOtp('tenant_1', '123456');

      expect(result.success).toBe(true);
      expect(mockRepo.saveResendIntegrationTransaction).toHaveBeenCalledWith(
        'tenant_1',
        {},
        expect.objectContaining({
          replyMailboxVerified: true,
          replyMailboxOtpCode: null,
        })
      );
    });

    it('verifies Resend inbound receiving domain when subdomain is registered', async () => {
      mockRepo.getResendIntegration = vi.fn().mockResolvedValue({
        base: { provider: 'resend' },
        detail: { ciphertext: 'encrypted_secret', iv: 'mock_iv', authTag: 'mock_authTag', keyVersion: 1 },
      });
      mockRepo.saveResendIntegrationTransaction = vi.fn().mockResolvedValue(undefined);
      mockResendDomainsList.mockResolvedValueOnce({
        data: [{ name: 'reply.acme.com', status: 'verified' }],
      });

      const result = await service.verifyResendInboundParse('tenant_1', 'reply.acme.com');

      expect(result.success).toBe(true);
      expect(mockRepo.saveResendIntegrationTransaction).toHaveBeenCalledWith(
        'tenant_1',
        {},
        expect.objectContaining({
          inboundDomain: 'reply.acme.com',
          inboundParseVerified: true,
        })
      );
    });

    it('rejects Resend inbound receiving domain when subdomain is missing from Resend account', async () => {
      mockRepo.getResendIntegration = vi.fn().mockResolvedValue({
        base: { provider: 'resend' },
        detail: { ciphertext: 'encrypted_secret', iv: 'mock_iv', authTag: 'mock_authTag', keyVersion: 1 },
      });
      mockResendDomainsList.mockResolvedValueOnce({
        data: [{ name: 'acme.com', status: 'verified' }],
      });

      await expect(
        service.verifyResendInboundParse('tenant_1', 'reply.acme.com')
      ).rejects.toThrow('The subdomain "reply.acme.com" is not registered in your Resend account');
    });

    it('rejects Resend inbound receiving domain when receiving capability is disabled', async () => {
      mockRepo.getResendIntegration = vi.fn().mockResolvedValue({
        base: { provider: 'resend' },
        detail: { ciphertext: 'encrypted_secret', iv: 'mock_iv', authTag: 'mock_authTag', keyVersion: 1 },
      });
      mockResendDomainsList.mockResolvedValueOnce({
        data: [{ id: 'dom_123', name: 'reply.acme.com', status: 'verified' }],
      });
      mockResendDomainsGet.mockResolvedValueOnce({
        data: { id: 'dom_123', name: 'reply.acme.com', capabilities: { receiving: 'disabled' } },
      });

      await expect(
        service.verifyResendInboundParse('tenant_1', 'reply.acme.com')
      ).rejects.toThrow('Receiving is disabled for "reply.acme.com" in Resend');
    });

    it('rejects Resend inbound verification when webhook is missing and auto-creation fails', async () => {
      mockRepo.getResendIntegration = vi.fn().mockResolvedValue({
        base: { provider: 'resend' },
        detail: { ciphertext: 'encrypted_secret', iv: 'mock_iv', authTag: 'mock_authTag', keyVersion: 1 },
      });
      mockResendDomainsList.mockResolvedValueOnce({
        data: [{ id: 'dom_123', name: 'reply.acme.com', status: 'verified' }],
      });
      mockResendDomainsGet.mockResolvedValueOnce({
        data: { id: 'dom_123', name: 'reply.acme.com', capabilities: { receiving: 'enabled' } },
      });

      const originalFetch = globalThis.fetch;
      globalThis.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [] }), // No webhooks configured
        } as any)
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ error: { message: 'Forbidden' } }), // Auto-create failed
        } as any);

      try {
        await expect(
          service.verifyResendInboundParse('tenant_1', 'reply.acme.com')
        ).rejects.toThrow('Webhook is not configured in Resend.');
      } finally {
        globalThis.fetch = originalFetch;
      }
    });
  });
});

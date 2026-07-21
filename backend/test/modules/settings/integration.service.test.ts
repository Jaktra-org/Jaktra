import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IntegrationService } from '../../../src/modules/settings/integration.service.js';
import { encrypt } from '../../../src/shared/encryption.js';

import sgClient from '@sendgrid/client';

vi.mock('@sendgrid/client', () => {
  return {
    default: {
      setApiKey: vi.fn(),
      request: vi.fn(),
    },
  };
});

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
});

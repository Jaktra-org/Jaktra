import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SettingsService } from '../../../src/modules/settings/settings.service.js';
import type { SettingsRepository } from '../../../src/modules/settings/settings.repository.js';
import type { PlatformMailer } from '../../../src/modules/platform-mail/platform-mailer.js';
import { NotFoundError, ValidationError } from '../../../src/shared/errors/index.js';

describe('SettingsService', () => {
  let settingsRepo: SettingsRepository;
  let redis: any;
  let platformMailer: PlatformMailer;
  let service: SettingsService;

  beforeEach(() => {
    settingsRepo = {
      getSettings: vi.fn(),
      createDefaultSettings: vi.fn(),
      updateSettings: vi.fn(),
      rotateWebhookToken: vi.fn(),
      hasInboundEmails: vi.fn(),
    } as unknown as SettingsRepository;

    redis = {
      isOpen: true,
      get: vi.fn(),
      set: vi.fn(),
      del: vi.fn().mockResolvedValue(undefined),
      ttl: vi.fn(),
    };


    platformMailer = {
      sendInboundVerificationTestEmail: vi.fn(),
    } as unknown as PlatformMailer;

    service = new SettingsService(settingsRepo, redis);
  });

  describe('getSettings', () => {
    it('returns existing settings', async () => {
      const mockSettings = { tenantId: 't1', timezone: 'UTC' };
      vi.mocked(settingsRepo.getSettings).mockResolvedValue(mockSettings as any);

      const res = await service.getSettings('t1');
      expect(res).toBe(mockSettings);
    });

    it('creates default settings if settings not found', async () => {
      vi.mocked(settingsRepo.getSettings).mockResolvedValue(null);
      const mockSettings = { tenantId: 't1', timezone: 'UTC' };
      vi.mocked(settingsRepo.createDefaultSettings).mockResolvedValue(mockSettings as any);

      const res = await service.getSettings('t1');
      expect(settingsRepo.createDefaultSettings).toHaveBeenCalledWith('t1');
      expect(res).toBe(mockSettings);
    });
  });

  describe('updateSettings', () => {
    it('updates settings and deletes sendgrid health cache if senderEmail updated', async () => {
      const mockSettings = { tenantId: 't1', senderEmail: 'new@email.com' };
      vi.mocked(settingsRepo.updateSettings).mockResolvedValue(mockSettings as any);

      const res = await service.updateSettings('t1', { senderEmail: 'new@email.com' });

      expect(settingsRepo.updateSettings).toHaveBeenCalledWith('t1', { senderEmail: 'new@email.com' });
      expect(redis.del).toHaveBeenCalledWith('sendgrid:health:t1');
      expect(res).toBe(mockSettings);
    });

    it('throws NotFoundError if update fails', async () => {
      vi.mocked(settingsRepo.updateSettings).mockResolvedValue(null as any);

      await expect(service.updateSettings('t1', {})).rejects.toThrow(NotFoundError);
    });
  });

  describe('startInboundVerificationTest', () => {
    it('rate limits to 3 per hour', async () => {
      vi.mocked(redis.get).mockResolvedValue('3');

      await expect(
        service.startInboundVerificationTest('t1', 'user@test.com', platformMailer)
      ).rejects.toThrow(ValidationError);
    });

    it('creates test and sends email if within limit', async () => {
      vi.mocked(redis.get).mockResolvedValue('1');
      vi.mocked(redis.ttl).mockResolvedValue(3000);

      const res = await service.startInboundVerificationTest('t1', 'user@test.com', platformMailer);

      expect(res.testId).toBeDefined();
      expect(redis.set).toHaveBeenCalled();
      expect(platformMailer.sendInboundVerificationTestEmail).toHaveBeenCalledWith(
        'user@test.com',
        expect.stringContaining(res.testId)
      );
    });
  });

  describe('getInboundVerificationStatus', () => {
    it('returns verification status with latest test state', async () => {
      const mockSettings = { tenantId: 't1', defaultEmailProvider: 'sendgrid', dnsVerifiedAt: new Date('2026-07-01') };
      vi.mocked(settingsRepo.getSettings).mockResolvedValue(mockSettings as any);
      vi.mocked(settingsRepo.hasInboundEmails).mockResolvedValue(true);

      vi.mocked(redis.get).mockImplementation(async (key: string) => {
        if (key.includes('tenant_latest_test')) return 'token-123';
        if (key.includes('reply_test:token-123')) {
          return JSON.stringify({
            status: 'pending',
            expiresAt: Date.now() + 600000,
          });
        }
        return null;
      });

      const res = await service.getInboundVerificationStatus('t1');

      expect(res.defaultEmailProvider).toBe('sendgrid');
      expect(res.hasRealCapture).toBe(true);
      expect(res.latestTest?.status).toBe('pending');
    });

    it('returns expired status if test expiresAt in the past', async () => {
      const mockSettings = { tenantId: 't1' };
      vi.mocked(settingsRepo.getSettings).mockResolvedValue(mockSettings as any);
      vi.mocked(redis.get).mockImplementation(async (key: string) => {
        if (key.includes('tenant_latest_test')) return 'token-123';
        if (key.includes('reply_test:token-123')) {
          return JSON.stringify({
            status: 'pending',
            expiresAt: Date.now() - 1000,
          });
        }
        return null;
      });

      const res = await service.getInboundVerificationStatus('t1');
      expect(res.latestTest?.status).toBe('expired');
    });
  });
});

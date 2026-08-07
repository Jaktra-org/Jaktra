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
      expect(res).toEqual(expect.objectContaining(mockSettings));
    });

    it('creates default settings if settings not found', async () => {
      vi.mocked(settingsRepo.getSettings).mockResolvedValue(null);
      const mockSettings = { tenantId: 't1', timezone: 'UTC' };
      vi.mocked(settingsRepo.createDefaultSettings).mockResolvedValue(mockSettings as any);

      const res = await service.getSettings('t1');
      expect(settingsRepo.createDefaultSettings).toHaveBeenCalledWith('t1');
      expect(res).toEqual(expect.objectContaining(mockSettings));
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
});

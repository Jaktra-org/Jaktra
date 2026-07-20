import { describe, it, expect, vi } from 'vitest';
import { SettingsController } from '../../../src/modules/settings/settings.controller.js';

describe('SettingsController Audit Logging (Phase 6)', () => {
  it('should emit settings.updated with diff of changed keys when updateSettings is successful', async () => {
    const mockOldSettings = {
      companyName: 'Old Corp',
      senderName: 'Old Sender',
      senderEmail: 'old@example.com',
      replyTo: 'reply@example.com',
      paymentLink: 'https://old.link',
      bankDetails: 'Bank A',
      timezone: 'UTC',
      scheduleHour: 10,
      idempotencyWindowHours: 24,
      skipPaymentWarning: false,
    };

    const mockUpdatedSettings = {
      companyName: 'New Corp',
      senderName: 'Old Sender', // unchanged
      senderEmail: 'new@example.com',
      replyTo: 'reply@example.com', // unchanged
      paymentLink: 'https://new.link',
      bankDetails: 'Bank A', // unchanged
      timezone: 'UTC', // unchanged
      scheduleHour: 12,
      idempotencyWindowHours: 24, // unchanged
      skipPaymentWarning: true,
    };

    const mockSettingsService = {
      getSettings: vi.fn().mockResolvedValue(mockOldSettings),
      updateSettings: vi.fn().mockResolvedValue(mockUpdatedSettings)
    } as any;

    const emittedEvents: any[] = [];
    const mockEventService = {
      emitEvent: vi.fn().mockImplementation(async (entityType, entityId, tenantId, actionType, actor, opts) => {
        emittedEvents.push({ entityType, entityId, tenantId, actionType, actor, opts });
        return {} as any;
      })
    } as any;

    const controller = new SettingsController(mockSettingsService, mockEventService);

    const req = {
      body: {
        companyName: 'New Corp',
        senderName: 'Old Sender',
        senderEmail: 'new@example.com',
        replyTo: 'reply@example.com',
        paymentLink: 'https://new.link',
        bankDetails: 'Bank A',
        timezone: 'UTC',
        scheduleHour: 12,
        idempotencyWindowHours: 24,
        skipPaymentWarning: true,
      },
      user: {
        tenantId: 'tenant-123',
        userId: 'user-456',
        name: 'Settings Manager',
        email: 'manager@example.com',
        role: 'manager'
      }
    } as any;

    const res = {
      locals: {
        tenantId: 'tenant-123'
      },
      json: vi.fn()
    } as any;

    const next = vi.fn();

    await controller.updateSettings(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(mockUpdatedSettings);

    expect(emittedEvents.length).toBe(1);
    expect(emittedEvents[0]).toEqual({
      entityType: 'settings',
      entityId: 'tenant-123',
      tenantId: 'tenant-123',
      actionType: 'settings.updated',
      actor: {
        source: 'ui',
        userId: 'user-456',
        name: 'Settings Manager',
        email: 'manager@example.com',
        role: 'manager'
      },
      opts: {
        description: 'Tenant settings updated',
        oldValues: {
          companyName: 'Old Corp',
          senderEmail: 'old@example.com',
          paymentLink: 'https://old.link',
          scheduleHour: 10,
          skipPaymentWarning: false,
        },
        newValues: {
          companyName: 'New Corp',
          senderEmail: 'new@example.com',
          paymentLink: 'https://new.link',
          scheduleHour: 12,
          skipPaymentWarning: true,
        }
      }
    });
  });

  it('should NOT emit settings.updated if no fields actually changed', async () => {
    const mockOldSettings = {
      companyName: 'Old Corp',
      senderName: 'Old Sender',
    };

    const mockUpdatedSettings = {
      companyName: 'Old Corp',
      senderName: 'Old Sender',
    };

    const mockSettingsService = {
      getSettings: vi.fn().mockResolvedValue(mockOldSettings),
      updateSettings: vi.fn().mockResolvedValue(mockUpdatedSettings)
    } as any;

    const mockEventService = {
      emitEvent: vi.fn()
    } as any;

    const controller = new SettingsController(mockSettingsService, mockEventService);

    const req = {
      body: {
        companyName: 'Old Corp',
        senderName: 'Old Sender',
      },
      user: {
        tenantId: 'tenant-123',
        userId: 'user-456',
        name: 'Settings Manager',
        email: 'manager@example.com',
        role: 'manager'
      }
    } as any;

    const res = {
      locals: {
        tenantId: 'tenant-123'
      },
      json: vi.fn()
    } as any;

    const next = vi.fn();

    await controller.updateSettings(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(mockEventService.emitEvent).not.toHaveBeenCalled();
  });

  it('should emit settings.webhook_token_rotated without logging token secret value', async () => {
    const mockUpdatedSettings = {
      webhookToken: 'super-secret-new-token-999'
    };

    const mockSettingsService = {
      rotateWebhookToken: vi.fn().mockResolvedValue(mockUpdatedSettings)
    } as any;

    const emittedEvents: any[] = [];
    const mockEventService = {
      emitEvent: vi.fn().mockImplementation(async (entityType, entityId, tenantId, actionType, actor, opts) => {
        emittedEvents.push({ entityType, entityId, tenantId, actionType, actor, opts });
        return {} as any;
      })
    } as any;

    const controller = new SettingsController(mockSettingsService, mockEventService);

    const req = {
      user: {
        tenantId: 'tenant-123',
        userId: 'user-456',
        name: 'Settings Manager',
        email: 'manager@example.com',
        role: 'manager'
      }
    } as any;

    const res = {
      locals: {
        tenantId: 'tenant-123'
      },
      json: vi.fn()
    } as any;

    const next = vi.fn();

    await controller.rotateWebhookToken(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ webhookToken: 'super-secret-new-token-999' });

    expect(emittedEvents.length).toBe(1);
    expect(emittedEvents[0]).toEqual({
      entityType: 'settings',
      entityId: 'tenant-123',
      tenantId: 'tenant-123',
      actionType: 'settings.webhook_token_rotated',
      actor: {
        source: 'ui',
        userId: 'user-456',
        name: 'Settings Manager',
        email: 'manager@example.com',
        role: 'manager'
      },
      opts: {
        description: 'Webhook verification token rotated'
      }
    });

    const optsStr = JSON.stringify(emittedEvents[0].opts);
    expect(optsStr).not.toContain('super-secret-new-token-999');
  });
});

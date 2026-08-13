import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IntegrationRepository } from '../../../src/modules/settings/integration.repository.js';
import { emailIntegrations, emailIntegrationSendgrid, emailIntegrationSmtp, emailIntegrationResend } from '../../../src/db/schema.js';
import { logger } from '../../../src/shared/logger.js';

describe('Clean Schema Email Integrations Pipeline', () => {
  let repository: IntegrationRepository;
  let mockDb: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDb = {
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      transaction: vi.fn((cb) => cb(mockDb)),
    };
    repository = new IntegrationRepository(mockDb as any);
  });

  describe('1. Auto-Activation Logic', () => {
    it('auto-activates the first integration that reaches overallStatus = active when no other integration is active', async () => {
      const mockBase = {
        id: 'integ-sg-1',
        tenantId: 'tenant-1',
        provider: 'sendgrid',
        senderName: 'Finance Team',
        senderEmail: 'billing@example.com',
        overallStatus: 'not_configured',
        isActive: false,
      };

      const mockDetail = {
        ciphertext: 'cipher',
        iv: 'iv',
        authTag: 'tag',
        inboundDomain: 'reply.example.com',
        inboundParseVerified: true,
        replyMode: 'webhook_only',
        replyMailboxVerified: false,
      };

      // Select base row
      mockDb.select.mockImplementationOnce(() => ({
        from: () => ({
          where: () => ({
            limit: () => Promise.resolve([mockBase]),
          }),
        }),
      }));

      // Select detail row
      mockDb.select.mockImplementationOnce(() => ({
        from: () => ({
          where: () => ({
            limit: () => Promise.resolve([mockDetail]),
          }),
        }),
      }));

      // Query existingActive integration (returns none)
      mockDb.select.mockImplementationOnce(() => ({
        from: () => ({
          where: () => ({
            limit: () => Promise.resolve([]),
          }),
        }),
      }));

      const setMock = vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) });
      mockDb.update.mockReturnValue({ set: setMock });

      await repository.syncOverallStatusAndActivation(mockDb, 'integ-sg-1');

      expect(setMock).toHaveBeenCalledWith(
        expect.objectContaining({
          overallStatus: 'active',
          isActive: true,
        })
      );
    });

    it('auto-activates Resend when it is configured as the first provider with no existing active provider', async () => {
      const mockBase = {
        id: 'integ-resend-1',
        tenantId: 'tenant-1',
        provider: 'resend',
        senderName: 'Finance Team',
        senderEmail: 'billing@example.com',
        overallStatus: 'not_configured',
        isActive: false,
      };

      const mockDetail = {
        ciphertext: 'cipher',
        iv: 'iv',
        authTag: 'tag',
        lastValidationResult: 'valid',
        inboundDomain: 'reply.example.com',
        inboundParseVerified: true,
        replyMode: 'webhook_only',
        replyMailboxVerified: false,
      };

      // Select base row
      mockDb.select.mockImplementationOnce(() => ({
        from: () => ({
          where: () => ({
            limit: () => Promise.resolve([mockBase]),
          }),
        }),
      }));

      // Select detail row
      mockDb.select.mockImplementationOnce(() => ({
        from: () => ({
          where: () => ({
            limit: () => Promise.resolve([mockDetail]),
          }),
        }),
      }));

      // Query existingActive integration (returns none)
      mockDb.select.mockImplementationOnce(() => ({
        from: () => ({
          where: () => ({
            limit: () => Promise.resolve([]),
          }),
        }),
      }));

      const setMock = vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) });
      mockDb.update.mockReturnValue({ set: setMock });

      await repository.syncOverallStatusAndActivation(mockDb, 'integ-resend-1');

      expect(setMock).toHaveBeenCalledWith(
        expect.objectContaining({
          overallStatus: 'active',
          isActive: true,
        })
      );
    });

    it('preserves existing active provider (SendGrid) when Resend is configured for the first time', async () => {
      const mockResendBase = {
        id: 'integ-resend-2',
        tenantId: 'tenant-1',
        provider: 'resend',
        senderName: 'Finance Team',
        senderEmail: 'billing@example.com',
        overallStatus: 'not_configured',
        isActive: false,
      };

      const mockResendDetail = {
        ciphertext: 'cipher',
        iv: 'iv',
        authTag: 'tag',
        lastValidationResult: 'valid',
        inboundDomain: 'reply.example.com',
        inboundParseVerified: true,
        replyMode: 'webhook_only',
      };

      const existingActiveSendgrid = {
        id: 'integ-sg-active',
        tenantId: 'tenant-1',
        provider: 'sendgrid',
        overallStatus: 'active',
        isActive: true,
      };

      // Select base row
      mockDb.select.mockImplementationOnce(() => ({
        from: () => ({
          where: () => ({
            limit: () => Promise.resolve([mockResendBase]),
          }),
        }),
      }));

      // Select detail row
      mockDb.select.mockImplementationOnce(() => ({
        from: () => ({
          where: () => ({
            limit: () => Promise.resolve([mockResendDetail]),
          }),
        }),
      }));

      // Query existingActive integration (returns active SendGrid)
      mockDb.select.mockImplementationOnce(() => ({
        from: () => ({
          where: () => ({
            limit: () => Promise.resolve([existingActiveSendgrid]),
          }),
        }),
      }));

      const setMock = vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) });
      mockDb.update.mockReturnValue({ set: setMock });

      await repository.syncOverallStatusAndActivation(mockDb, 'integ-resend-2');

      // Resend is marked as active overallStatus, but isActive remains false!
      expect(setMock).toHaveBeenCalledWith(
        expect.objectContaining({
          overallStatus: 'active',
          isActive: false,
        })
      );
    });
  });

  describe('2. Auto-Deactivation / Degradation Logic', () => {
    it('deactivates an active integration when its overallStatus drops below active', async () => {
      const mockBase = {
        id: 'integ-sg-1',
        tenantId: 'tenant-1',
        provider: 'sendgrid',
        overallStatus: 'active',
        isActive: true,
      };

      const mockDetail = {
        ciphertext: 'cipher',
        iv: 'iv',
        authTag: 'tag',
        inboundDomain: null, // domain cleared, causing degradation
        inboundParseVerified: false,
        replyMode: 'webhook_only',
      };

      // Select base row
      mockDb.select.mockImplementationOnce(() => ({
        from: () => ({
          where: () => ({
            limit: () => Promise.resolve([mockBase]),
          }),
        }),
      }));

      // Select detail row
      mockDb.select.mockImplementationOnce(() => ({
        from: () => ({
          where: () => ({
            limit: () => Promise.resolve([mockDetail]),
          }),
        }),
      }));

      const setMock = vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) });
      mockDb.update.mockReturnValue({ set: setMock });

      await repository.syncOverallStatusAndActivation(mockDb, 'integ-sg-1');

      expect(setMock).toHaveBeenCalledWith(
        expect.objectContaining({
          overallStatus: 'partially_configured',
          isActive: false,
        })
      );
    });
  });

  describe('3. Best-Effort Concurrency Race Handling', () => {
    it('swallows ER_DUP_ENTRY constraint race condition without failing parent transaction', async () => {
      const mockBase = {
        id: 'integ-sg-2',
        tenantId: 'tenant-1',
        provider: 'sendgrid',
        senderName: 'Finance Team',
        senderEmail: 'billing@example.com',
        overallStatus: 'not_configured',
        isActive: false,
      };

      const mockDetail = {
        ciphertext: 'cipher',
        iv: 'iv',
        authTag: 'tag',
        inboundDomain: 'reply.example.com',
        inboundParseVerified: true,
        replyMode: 'webhook_only',
      };

      // Select base row
      mockDb.select.mockImplementationOnce(() => ({
        from: () => ({
          where: () => ({
            limit: () => Promise.resolve([mockBase]),
          }),
        }),
      }));

      // Select detail row
      mockDb.select.mockImplementationOnce(() => ({
        from: () => ({
          where: () => ({
            limit: () => Promise.resolve([mockDetail]),
          }),
        }),
      }));

      // Query existingActive (returns none in race condition)
      mockDb.select.mockImplementationOnce(() => ({
        from: () => ({
          where: () => ({
            limit: () => Promise.resolve([]),
          }),
        }),
      }));

      const warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => {});

      // Mock update to throw ER_DUP_ENTRY on first attempt
      let updateAttempt = 0;
      mockDb.update.mockImplementation(() => ({
        set: (setVal: any) => ({
          where: () => {
            updateAttempt++;
            if (updateAttempt === 1 && setVal.isActive) {
              const err = new Error('Duplicate entry for key unq_single_active_provider');
              (err as any).code = 'ER_DUP_ENTRY';
              throw err;
            }
            return Promise.resolve();
          },
        }),
      }));

      await repository.syncOverallStatusAndActivation(mockDb, 'integ-sg-2');

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Auto-activation race lost for integration integ-sg-2')
      );
      expect(updateAttempt).toBe(2);
    });
  });

  describe('4. Column-Naming Parity Check', () => {
    it('verifies Drizzle schema column definitions match snake_case DB column convention', () => {
      // Base table columns
      expect(emailIntegrations.tenantId.name).toBe('tenant_id');
      expect(emailIntegrations.senderName.name).toBe('sender_name');
      expect(emailIntegrations.senderEmail.name).toBe('sender_email');
      expect(emailIntegrations.replyTo.name).toBe('reply_to');
      expect(emailIntegrations.overallStatus.name).toBe('overall_status');
      expect(emailIntegrations.isActive.name).toBe('is_active');
      expect(emailIntegrations.activeTenantId.name).toBe('active_tenant_id');

      // SendGrid detail columns
      expect(emailIntegrationSendgrid.integrationId.name).toBe('integration_id');
      expect(emailIntegrationSendgrid.authTag.name).toBe('auth_tag');
      expect(emailIntegrationSendgrid.keyVersion.name).toBe('key_version');
      expect(emailIntegrationSendgrid.inboundDomain.name).toBe('inbound_domain');
      expect(emailIntegrationSendgrid.inboundParseVerified.name).toBe('inbound_parse_verified');
      expect(emailIntegrationSendgrid.webhookUrl.name).toBe('webhook_url');
      expect(emailIntegrationSendgrid.replyMode.name).toBe('reply_mode');
      expect(emailIntegrationSendgrid.replyMailboxEmail.name).toBe('reply_mailbox_email');
      expect(emailIntegrationSendgrid.replyMailboxVerified.name).toBe('reply_mailbox_verified');

      // SMTP detail columns
      expect(emailIntegrationSmtp.integrationId.name).toBe('integration_id');
      expect(emailIntegrationSmtp.authTag.name).toBe('auth_tag');
      expect(emailIntegrationSmtp.allowSelfSigned.name).toBe('allow_self_signed');
      expect(emailIntegrationSmtp.lastValidationResult.name).toBe('last_validation_result');
      expect(emailIntegrationSmtp.lastValidatedAt.name).toBe('last_validated_at');

      // Resend detail columns
      expect(emailIntegrationResend.integrationId.name).toBe('integration_id');
      expect(emailIntegrationResend.authTag.name).toBe('auth_tag');
      expect(emailIntegrationResend.keyVersion.name).toBe('key_version');
      expect(emailIntegrationResend.lastValidationResult.name).toBe('last_validation_result');
      expect(emailIntegrationResend.lastValidatedAt.name).toBe('last_validated_at');
    });
  });

  describe('5. Data-Consistency Guard (replyMailboxVerified / replyMailboxEmail)', () => {
    it('forces replyMailboxVerified = false if replyMailboxEmail is cleared or empty', async () => {
      // Mock base integration lookup
      mockDb.select.mockImplementation(() => ({
        from: () => ({
          where: () => ({
            limit: () => Promise.resolve([{ id: 'integ-1', tenantId: 't-1' }]),
          }),
        }),
      }));

      const setMock = vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) });
      mockDb.update.mockReturnValue({ set: setMock });
      mockDb.insert.mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) });

      await repository.saveSendgridIntegrationTransaction(
        't-1',
        {},
        {
          replyMailboxEmail: '',
          replyMailboxVerified: true, // Attempting to set verified = true with empty email
        }
      );

      // Detail update set payload should have replyMailboxVerified = false
      expect(setMock).toHaveBeenCalledWith(
        expect.objectContaining({
          replyMailboxVerified: false,
        })
      );
    });
  });

  describe('6. Deletion / Re-onboarding Idempotency', () => {
    it('deletes integration cleanly and is idempotent when called multiple times or when no integration exists', async () => {
      const deleteMock = vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue({ affectedRows: 0 }) });
      mockDb.delete.mockReturnValue(deleteMock());

      // First call when row doesn't exist
      await expect(repository.deleteEmailIntegration('t-1', 'sendgrid')).resolves.not.toThrow();

      // Second call (idempotent repeat)
      await expect(repository.deleteEmailIntegration('t-1', 'sendgrid')).resolves.not.toThrow();
    });
  });

  describe('7. Explicit Activation & Feature Workflows', () => {
    it('throws ValidationError when attempting to activate a non-existent or inactive provider', async () => {
      mockDb.transaction.mockImplementation(async (cb) => {
        const tx = {
          select: vi.fn().mockReturnValue({
            from: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue([]),
              }),
            }),
          }),
        };
        return cb(tx);
      });

      await expect(repository.setActiveProvider('t-1', 'sendgrid')).rejects.toThrow(
        'Provider must be fully configured and active before it can be activated for email dispatch.'
      );
    });
  });
});

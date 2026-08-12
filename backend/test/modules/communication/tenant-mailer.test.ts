import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TenantMailer } from '../../../src/modules/communication/tenant-mailer.js';
import type { TenantEmailConfigResolver } from '../../../src/modules/communication/tenant-mailer.js';
import { createEmailProvider } from '../../../src/shared/email/email-provider.factory.js';

vi.mock('../../../src/shared/email/email-provider.factory.js', () => {
  const mockProvider = {
    name: 'smtp',
    send: vi.fn(),
  };
  return {
    createEmailProvider: vi.fn().mockReturnValue(mockProvider),
  };
});

describe('TenantMailer', () => {
  let mockResolver: TenantEmailConfigResolver;
  let mockCommRepo: any;
  let mockInvoiceRepo: any;
  let mockEventService: any;
  let mockDlqRepo: any;
  let mockIntegrationService: any;
  let mockProviderInstance: any;

  const smtpResolvedConfig = {
    kind: 'smtp' as const,
    host: 'smtp.tenant.com',
    port: 587,
    user: 'tenant-user',
    password: 'password',
    secure: false,
  };

  function makeActiveIntegration(provider: 'sendgrid' | 'smtp') {
    return {
      base: { overallStatus: 'active', isActive: true, provider },
      detail: null,
      provider,
    };
  }

  beforeEach(() => {
    mockProviderInstance = createEmailProvider({} as any);
    mockProviderInstance.send.mockReset();
    mockProviderInstance.send.mockResolvedValue({ success: true, providerMessageId: 'p-999' });

    vi.clearAllMocks();

    mockResolver = {
      resolve: vi.fn().mockResolvedValue(smtpResolvedConfig),
      handleDeliveryError: vi.fn(),
    };

    // communicationRepo no longer needs to supply defaultEmailProvider —
    // that column never existed. Provider is determined via integrationService.
    mockCommRepo = {
      getSettings: vi.fn().mockResolvedValue({
        senderName: 'Tenant Sender',
        senderEmail: 'tenant@sender.com',
      }),
      findByInvoiceId: vi.fn().mockResolvedValue([]),
      markFailed: vi.fn(),
    };

    mockInvoiceRepo = {
      findById: vi.fn(),
      update: vi.fn(),
    };

    mockEventService = {
      emitEvent: vi.fn().mockResolvedValue({}),
    };

    mockDlqRepo = {
      recordFailure: vi.fn(),
    };

    mockIntegrationService = {
      getActiveEmailIntegration: vi.fn().mockResolvedValue(makeActiveIntegration('smtp')),
    };
  });

  it('resolves config and sends collection email successfully', async () => {
    const tenantMailer = new TenantMailer(
      mockResolver,
      mockCommRepo,
      mockInvoiceRepo,
      mockEventService,
      mockDlqRepo,
      mockIntegrationService
    );

    const message = {
      to: 'client@example.com',
      from: { name: 'Tenant Sender', email: 'tenant@sender.com' },
      subject: 'Invoice follow-up',
      html: '<p>Pay me</p>',
    };

    const result = await tenantMailer.sendCollectionEmail('tenant-123', message);

    expect(mockResolver.resolve).toHaveBeenCalledWith('tenant-123');
    expect(mockProviderInstance.send).toHaveBeenCalledWith(message);
    expect(result.success).toBe(true);
    expect(result.providerMessageId).toBe('p-999');
  });

  it('calls handleDeliveryError on provider send failure', async () => {
    mockProviderInstance.send.mockResolvedValue({
      success: false,
      error: 'SMTP Authentication failed',
    });

    const tenantMailer = new TenantMailer(
      mockResolver,
      mockCommRepo,
      mockInvoiceRepo,
      mockEventService,
      mockDlqRepo,
      mockIntegrationService
    );

    const message = {
      to: 'client@example.com',
      from: { name: 'Tenant Sender', email: 'tenant@sender.com' },
      subject: 'Invoice follow-up',
      html: '<p>Pay me</p>',
    };

    const result = await tenantMailer.sendCollectionEmail('tenant-123', message);

    expect(result.success).toBe(false);
    expect(mockResolver.handleDeliveryError).toHaveBeenCalledWith(
      'tenant-123',
      'smtp',
      expect.any(Error)
    );
  });

  // ------------------------------------------------------------------
  // New tests: SMTP bounce polling is gated on the active provider
  // ------------------------------------------------------------------

  it('triggers SMTP bounce polling when active provider is smtp and invoiceId is provided', async () => {
    // active provider is 'smtp' (default mockIntegrationService)
    const tenantMailer = new TenantMailer(
      mockResolver,
      mockCommRepo,
      mockInvoiceRepo,
      mockEventService,
      mockDlqRepo,
      mockIntegrationService
    );

    const startBouncePolling = vi.spyOn(tenantMailer as any, 'startSmtpBouncePolling')
      .mockResolvedValue(undefined);

    await tenantMailer.sendCollectionEmail('tenant-123', {
      to: 'client@example.com',
      from: { name: 'Sender', email: 'sender@example.com' },
      subject: 'Test',
      html: '<p>Test</p>',
    }, { invoiceId: 'invoice-abc' });

    expect(startBouncePolling).toHaveBeenCalledTimes(1);
  });

  it('does NOT trigger SMTP bounce polling when active provider is sendgrid', async () => {
    // Override: active provider is sendgrid
    mockIntegrationService.getActiveEmailIntegration.mockResolvedValue(makeActiveIntegration('sendgrid'));
    (mockResolver.resolve as any).mockResolvedValue({ kind: 'sendgrid', apiKey: 'SG.key' });

    const tenantMailer = new TenantMailer(
      mockResolver,
      mockCommRepo,
      mockInvoiceRepo,
      mockEventService,
      mockDlqRepo,
      mockIntegrationService
    );

    const startBouncePolling = vi.spyOn(tenantMailer as any, 'startSmtpBouncePolling')
      .mockResolvedValue(undefined);

    await tenantMailer.sendCollectionEmail('tenant-123', {
      to: 'client@example.com',
      from: { name: 'Sender', email: 'sender@example.com' },
      subject: 'Test',
      html: '<p>Test</p>',
    }, { invoiceId: 'invoice-abc' });

    expect(startBouncePolling).not.toHaveBeenCalled();
  });

  it('does NOT call handleDeliveryError with fabricated provider when no active integration exists', async () => {
    // No active integration — defaultProvider will be undefined
    mockIntegrationService.getActiveEmailIntegration.mockResolvedValue(null);
    mockProviderInstance.send.mockResolvedValue({ success: false, error: 'Send failed' });

    const tenantMailer = new TenantMailer(
      mockResolver,
      mockCommRepo,
      mockInvoiceRepo,
      mockEventService,
      mockDlqRepo,
      mockIntegrationService
    );

    await tenantMailer.sendCollectionEmail('tenant-123', {
      to: 'client@example.com',
      from: { name: 'Sender', email: 'sender@example.com' },
      subject: 'Test',
      html: '<p>Test</p>',
    });

    // handleDeliveryError must NOT be called with a fabricated 'sendgrid' default
    expect(mockResolver.handleDeliveryError).not.toHaveBeenCalled();
  });

  it('does NOT call communicationRepo.getSettings to determine the provider', async () => {
    const tenantMailer = new TenantMailer(
      mockResolver,
      mockCommRepo,
      mockInvoiceRepo,
      mockEventService,
      mockDlqRepo,
      mockIntegrationService
    );

    await tenantMailer.sendCollectionEmail('tenant-123', {
      to: 'client@example.com',
      from: { name: 'Sender', email: 'sender@example.com' },
      subject: 'Test',
      html: '<p>Test</p>',
    });

    // communicationRepo.getSettings must not be called for provider determination
    expect(mockCommRepo.getSettings).not.toHaveBeenCalled();
    // integrationService.getActiveEmailIntegration is the sole provider source
    expect(mockIntegrationService.getActiveEmailIntegration).toHaveBeenCalledWith('tenant-123');
  });
});


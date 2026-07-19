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
  let mockProviderInstance: any;

  beforeEach(() => {
    mockProviderInstance = createEmailProvider({} as any);
    mockProviderInstance.send.mockReset();
    mockProviderInstance.send.mockResolvedValue({ success: true, providerMessageId: 'p-999' });

    vi.clearAllMocks();

    mockResolver = {
      resolve: vi.fn().mockResolvedValue({
        kind: 'smtp',
        host: 'smtp.tenant.com',
        port: 587,
        user: 'tenant-user',
        password: 'password',
        secure: false,
      }),
      handleDeliveryError: vi.fn(),
    };

    mockCommRepo = {
      getSettings: vi.fn().mockResolvedValue({
        defaultEmailProvider: 'smtp',
        senderName: 'Tenant Sender',
        senderEmail: 'tenant@sender.com',
      }),
      findByInvoiceId: vi.fn(),
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
  });

  it('should resolve config and send collection email successfully', async () => {
    const tenantMailer = new TenantMailer(
      mockResolver,
      mockCommRepo,
      mockInvoiceRepo,
      mockEventService,
      mockDlqRepo
    );

    const message = {
      to: 'client@example.com',
      from: { name: 'Tenant Sender', email: 'tenant@sender.com' },
      subject: 'Invoice follow-up',
      html: '<p>Pay me</p>',
    };

    const result = await tenantMailer.sendCollectionEmail('tenant-123', message);

    expect(mockCommRepo.getSettings).toHaveBeenCalledWith('tenant-123');
    expect(mockResolver.resolve).toHaveBeenCalledWith('tenant-123');
    expect(mockProviderInstance.send).toHaveBeenCalledWith(message);
    expect(result.success).toBe(true);
    expect(result.providerMessageId).toBe('p-999');
  });

  it('should call handleDeliveryError on provider send failure', async () => {
    mockProviderInstance.send.mockResolvedValue({
      success: false,
      error: 'SMTP Authentication failed',
    });

    const tenantMailer = new TenantMailer(
      mockResolver,
      mockCommRepo,
      mockInvoiceRepo,
      mockEventService,
      mockDlqRepo
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
});

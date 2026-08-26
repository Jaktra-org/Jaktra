import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  InvoiceNotificationService,
  renderInitialInvoiceEmailHtml,
  formatCurrencyAmount,
  formatDate,
} from '../../../src/modules/invoice/invoice-notification.service.js';
import type { CommunicationService } from '../../../src/modules/communication/communication.service.js';
import type { PortalService } from '../../../src/modules/portal/portal.service.js';
import type { SettingsRepository } from '../../../src/modules/settings/settings.repository.js';
import type { Invoice } from '../../../src/db/schema.js';

describe('InvoiceNotificationService & Email Template', () => {
  describe('formatCurrencyAmount', () => {
    it('formats USD amount correctly', () => {
      expect(formatCurrencyAmount('1500.50', 'USD')).toBe('$1,500.50');
    });

    it('formats EUR amount correctly', () => {
      expect(formatCurrencyAmount(2000, 'EUR')).toBe('€2,000.00');
    });

    it('formats INR amount correctly', () => {
      expect(formatCurrencyAmount('50000.00', 'INR')).toBe('₹50,000.00');
    });

    it('handles NaN gracefully', () => {
      expect(formatCurrencyAmount('invalid', 'USD')).toBe('USD invalid');
    });
  });

  describe('formatDate', () => {
    it('formats date string correctly', () => {
      const formatted = formatDate('2026-08-30');
      expect(formatted).toContain('2026');
      expect(formatted).toContain('Aug');
    });

    it('returns empty string for null or undefined', () => {
      expect(formatDate(null)).toBe('');
      expect(formatDate(undefined)).toBe('');
    });
  });

  describe('renderInitialInvoiceEmailHtml', () => {
    it('renders complete email template matching layout with dynamic description and no company logo', () => {
      const html = renderInitialInvoiceEmailHtml({
        companyName: 'Acme Invoicing',
        clientName: 'Alice Smith',
        invoiceNo: 'INV-2026-001',
        amount: '1250.00',
        currency: 'USD',
        dueDate: '2026-09-15',
        createdAt: new Date('2026-08-26'),
        description: 'Web development consulting services',
        portalUrl: 'https://app.jaktra.site/i/secure-token-123',
        supportEmail: 'support@acme.com',
      });

      // Recipient name
      expect(html).toContain('Hi Alice Smith,');

      // Company name (as text, no logo icon)
      expect(html).toContain('Acme Invoicing');
      expect(html).not.toContain('transform: rotate(45deg)'); // No logo icon

      // Generic greeting wording (no "purchase")
      expect(html).toContain('Thanks for using Acme Invoicing. Please find the details of your invoice below.');
      expect(html).not.toContain('purchase');

      // Invoice ID & date
      expect(html).toContain('INV-2026-001');
      expect(html).toContain('Aug 26, 2026');

      // Amount & Due date
      expect(html).toContain('Amount');
      expect(html).toContain('$1,250.00');
      expect(html).toContain('Due By:');
      expect(html).toContain('Sep 15, 2026');

      // Dynamic Description
      expect(html).toContain('Description');
      expect(html).toContain('Web development consulting services');

      // Payment portal button
      expect(html).toContain('Payment Portal');
      expect(html).toContain('href="https://app.jaktra.site/i/secure-token-123"');

      // Support email link
      expect(html).toContain('href="mailto:support@acme.com"');
      expect(html).toContain('support team');

      // Sign-off
      expect(html).toContain('The Acme Invoicing Team');

      // Fallback action url
      expect(html).toContain("If you're having trouble with the button above");
      expect(html).toContain('https://app.jaktra.site/i/secure-token-123');
    });

    it('does NOT render description row when description is absent or empty', () => {
      const html = renderInitialInvoiceEmailHtml({
        companyName: 'Beta Corp',
        clientName: 'Bob Jones',
        invoiceNo: 'INV-100',
        amount: '500.00',
        dueDate: '2026-09-01',
        createdAt: '2026-08-26',
        description: '',
        portalUrl: 'https://app.jaktra.site/i/tok-abc',
        supportEmail: null,
      });

      expect(html).not.toContain('Description');
      expect(html).toContain('Amount');
      expect(html).toContain('Due By:');
    });

    it('renders fallback support text when supportEmail is not configured', () => {
      const html = renderInitialInvoiceEmailHtml({
        companyName: 'Beta Corp',
        clientName: 'Bob Jones',
        invoiceNo: 'INV-100',
        amount: '500.00',
        dueDate: '2026-09-01',
        createdAt: '2026-08-26',
        portalUrl: 'https://app.jaktra.site/i/tok-abc',
        supportEmail: null,
      });

      expect(html).toContain('If you have any questions about this invoice, simply reply to this email for help.');
      expect(html).not.toContain('mailto:');
    });
  });

  describe('InvoiceNotificationService.sendInitialInvoiceEmail', () => {
    let commService: CommunicationService;
    let portalService: PortalService;
    let settingsRepo: SettingsRepository;
    let notificationService: InvoiceNotificationService;

    const mockInvoice: Invoice = {
      id: 'inv-uuid-1',
      tenantId: 'tenant-123',
      invoiceNo: 'INV-999',
      clientName: 'Charlie Brown',
      invoiceAmount: '750.00',
      currency: 'USD',
      dueDate: '2026-09-20',
      contactEmail: 'charlie@example.com',
      subject: 'Marketing monthly retainer',
      paymentStatus: 'Pending',
      followupCount: 0,
      lastFollowupDate: null,
      externalRefId: null,
      createdAt: new Date('2026-08-26'),
      updatedAt: new Date('2026-08-26'),
      deletedAt: null,
      hasActivePaymentPlan: false,
      paymentStatusChangedAt: null,
    };

    beforeEach(() => {
      commService = {
        send: vi.fn().mockResolvedValue(true),
      } as unknown as CommunicationService;

      portalService = {
        getOrCreatePortalLink: vi.fn().mockResolvedValue('test-portal-token-999'),
      } as unknown as PortalService;

      settingsRepo = {
        getSettings: vi.fn().mockResolvedValue({
          tenantId: 'tenant-123',
          companyName: 'Charlie Enterprise',
          supportEmail: 'help@charlie.com',
        }),
        createDefaultSettings: vi.fn(),
      } as unknown as SettingsRepository;

      notificationService = new InvoiceNotificationService(commService, portalService, settingsRepo);
    });

    it('generates portal link and sends email via CommunicationService', async () => {
      const result = await notificationService.sendInitialInvoiceEmail('tenant-123', mockInvoice);

      expect(result).toBe(true);
      expect(portalService.getOrCreatePortalLink).toHaveBeenCalledWith('tenant-123', 'inv-uuid-1');
      expect(settingsRepo.getSettings).toHaveBeenCalledWith('tenant-123');
      expect(commService.send).toHaveBeenCalledTimes(1);

      const sendCallArgs = (commService.send as any).mock.calls[0][0];
      expect(sendCallArgs.tenantId).toBe('tenant-123');
      expect(sendCallArgs.to).toBe('charlie@example.com');
      expect(sendCallArgs.subject).toBe('Invoice #INV-999 from Charlie Enterprise');
      expect(sendCallArgs.invoiceId).toBe('inv-uuid-1');
      expect(sendCallArgs.source).toBe('system');
      expect(sendCallArgs.html).toContain('Payment Portal');
      expect(sendCallArgs.html).toContain('Charlie Brown');
      expect(sendCallArgs.html).toContain('help@charlie.com');
    });

    it('skips email when contactEmail is empty', async () => {
      const invoiceNoEmail = { ...mockInvoice, contactEmail: '' };
      const result = await notificationService.sendInitialInvoiceEmail('tenant-123', invoiceNoEmail);

      expect(result).toBe(false);
      expect(commService.send).not.toHaveBeenCalled();
    });

    it('gracefully handles error if CommunicationService.send throws', async () => {
      (commService.send as any).mockRejectedValueOnce(new Error('Email provider not configured'));

      const result = await notificationService.sendInitialInvoiceEmail('tenant-123', mockInvoice);

      expect(result).toBe(false);
    });

    it('batches email sends across multiple invoices', async () => {
      const inv1 = { ...mockInvoice, id: 'inv-1', invoiceNo: 'INV-1' };
      const inv2 = { ...mockInvoice, id: 'inv-2', invoiceNo: 'INV-2' };

      await notificationService.sendInitialInvoiceEmailsBatch('tenant-123', [inv1, inv2]);

      expect(commService.send).toHaveBeenCalledTimes(2);
    });
  });
});

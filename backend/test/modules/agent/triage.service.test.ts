import { describe, it, expect } from 'vitest';
import { TriageService } from '../../../src/modules/agent/triage.service.js';
import type { Invoice } from '../../../src/db/index.js';

describe('TriageService - DLQ Block Exclusion', () => {
  const triageService = new TriageService();

  const mockInvoices: Invoice[] = [
    {
      id: 'invoice-1',
      tenantId: 'tenant-1',
      invoiceNo: 'INV-001',
      clientName: 'Client 1',
      invoiceAmount: '1000.00',
      currency: 'INR',
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days overdue (Stage 1)
      contactEmail: 'client1@example.com',
      subject: null,
      paymentStatus: 'Pending',
      followupCount: 0,
      lastFollowupDate: null,
      externalRefId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      hasActivePaymentPlan: false,
      paymentStatusChangedAt: null,
    },
    {
      id: 'invoice-2',
      tenantId: 'tenant-1',
      invoiceNo: 'INV-002',
      clientName: 'Client 2',
      invoiceAmount: '2000.00',
      currency: 'INR',
      dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 10 days overdue (Stage 2)
      contactEmail: 'client2@example.com',
      subject: null,
      paymentStatus: 'Pending',
      followupCount: 1,
      lastFollowupDate: null,
      externalRefId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      hasActivePaymentPlan: false,
      paymentStatusChangedAt: null,
    },
  ];

  it('should include all actionable invoices when no blocklist is passed', () => {
    const result = triageService.triageInvoices(mockInvoices);
    expect(result.invoices.length).toBe(2);
    expect(result.needsManualReview.length).toBe(0);
    expect(result.total).toBe(2);
  });

  it('should exclude blocked invoices and place them in needsManualReview', () => {
    const blockedIds = new Set(['invoice-2']);
    const result = triageService.triageInvoices(mockInvoices, blockedIds);

    // Active actionable invoices should exclude invoice-2
    expect(result.invoices.length).toBe(1);
    expect(result.invoices[0]?.id).toBe('invoice-1');
    expect(result.invoices[0]?.needsManualReview).toBe(false);

    // Blocked invoice should go to needsManualReview
    expect(result.needsManualReview.length).toBe(1);
    expect(result.needsManualReview[0]?.id).toBe('invoice-2');
    expect(result.needsManualReview[0]?.needsManualReview).toBe(true);

    // Total counts in Urgency Tier should only count active ones
    expect(result.tierCounts.stage_1_warm).toBe(1);
    expect(result.tierCounts.stage_2_firm).toBe(0); // invoice-2 is active-excluded
    expect(result.total).toBe(1); // total represents actionable + active
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnalyticsService } from '../../../src/modules/analytics/analytics.service.js';
import type { AnalyticsRepository } from '../../../src/modules/analytics/analytics.repository.js';

describe('AnalyticsService', () => {
  let analyticsRepo: AnalyticsRepository;
  let service: AnalyticsService;

  beforeEach(() => {
    analyticsRepo = {
      getSummary: vi.fn(),
      getAgingBreakdown: vi.fn(),
      getDsoMetrics: vi.fn(),
      getCollectionRate: vi.fn(),
      getAgentPerformance: vi.fn(),
      getChannelBreakdown: vi.fn(),
      getTierEffectiveness: vi.fn(),
      getEmailVolume: vi.fn(),
      getCommunicationStats: vi.fn(),
    } as unknown as AnalyticsRepository;

    service = new AnalyticsService(analyticsRepo);
  });

  describe('getSummary', () => {
    it('queries summary for tenant with parsed date range', async () => {
      const mockSummary = { totalReceivable: 500, totalCollected: 1000, totalOverdue: 200, invoiceCount: 10 };
      vi.mocked(analyticsRepo.getSummary).mockResolvedValue(mockSummary);

      const query = { from: '2026-07-01T00:00:00Z', to: '2026-07-10T00:00:00Z' };
      const res = await service.getSummary('tenant-1', query);

      expect(analyticsRepo.getSummary).toHaveBeenCalledWith(
        'tenant-1',
        new Date('2026-07-01T00:00:00Z'),
        new Date('2026-07-10T00:00:00Z')
      );
      expect(res).toBe(mockSummary);
    });
  });

  describe('getAging', () => {
    it('returns all 5 urgency tiers even if some have 0 amount/count', async () => {
      const dbBreakdown = [
        { tier: 'stage_1_warm', totalAmount: 100, count: 1 },
        { tier: 'stage_3_serious', totalAmount: 200, count: 2 },
      ];
      vi.mocked(analyticsRepo.getAgingBreakdown).mockResolvedValue(dbBreakdown);

      const res = await service.getAging('tenant-1', {});

      expect(res).toHaveLength(5);
      expect(res.find(r => r.tier === 'stage_1_warm')).toEqual({ tier: 'stage_1_warm', totalAmount: 100, count: 1 });
      expect(res.find(r => r.tier === 'stage_2_firm')).toEqual({ tier: 'stage_2_firm', totalAmount: 0, count: 0 });
      expect(res.find(r => r.tier === 'stage_3_serious')).toEqual({ tier: 'stage_3_serious', totalAmount: 200, count: 2 });
    });
  });

  describe('getDso', () => {
    it('calculates DSO correctly using formula (receivable / sales) * days', async () => {
      vi.mocked(analyticsRepo.getDsoMetrics).mockResolvedValue({
        totalCreditSales: 10000,
        totalReceivable: 5000,
      });

      const res = await service.getDso('tenant-1', {
        from: '2026-07-01T00:00:00Z',
        to: '2026-07-31T00:00:00Z',
      });

      expect(res.daysInPeriod).toBe(30);
      expect(res.dso).toBe(15); // (5000 / 10000) * 30 = 15
    });

    it('returns 0 dso if total credit sales is 0', async () => {
      vi.mocked(analyticsRepo.getDsoMetrics).mockResolvedValue({
        totalCreditSales: 0,
        totalReceivable: 5000,
      });

      const res = await service.getDso('tenant-1', {});
      expect(res.dso).toBe(0);
    });
  });

  describe('getCollectionRate', () => {
    it('calculates rates correctly', async () => {
      vi.mocked(analyticsRepo.getCollectionRate).mockResolvedValue({
        totalInvoices: 10,
        paidInvoices: 8,
        totalAmount: 1000,
        paidAmount: 750,
      });

      const res = await service.getCollectionRate('tenant-1', {});

      expect(res.collectionRateByCount).toBe(80);
      expect(res.collectionRateByAmount).toBe(75);
    });
  });

  describe('getAgentPerformance', () => {
    it('calculates rates correctly and handles 0 run count without division by zero', async () => {
      vi.mocked(analyticsRepo.getAgentPerformance).mockResolvedValue({
        runData: { totalRuns: 0, invoicesProcessed: 0, emailsSent: 0, errors: 0 },
        successData: { totalFollowedUp: 0, paidAfterFollowUp: 0, avgDaysToPayment: null },
      });

      const res = await service.getAgentPerformance('tenant-1', {});

      expect(res.errorRate).toBe(0);
      expect(res.successRate).toBe(0);
      expect(res.automationYield).toBe(0);
    });
  });
});

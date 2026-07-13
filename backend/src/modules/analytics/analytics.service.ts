import { AnalyticsRepository } from './analytics.repository.js';
import { z } from 'zod';

export const DateRangeSchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

export type DateRange = z.infer<typeof DateRangeSchema>;

export class AnalyticsService {
  constructor(private analyticsRepo: AnalyticsRepository) {}

  private parseDateRange(query: DateRange): { fromDate: Date | undefined; toDate: Date | undefined } {
    const fromDate = query.from ? new Date(query.from) : undefined;
    const toDate = query.to ? new Date(query.to) : undefined;
    return { fromDate, toDate };
  }

  async getSummary(tenantId: string, query: DateRange): Promise<{ totalReceivable: number; totalCollected: number; totalOverdue: number; invoiceCount: number } | undefined> {
    const { fromDate, toDate } = this.parseDateRange(query);
    return this.analyticsRepo.getSummary(tenantId, fromDate, toDate);
  }

  async getAging(tenantId: string, query: DateRange): Promise<Array<{ tier: string; totalAmount: number; count: number }>> {
    const { fromDate, toDate } = this.parseDateRange(query);
    const breakdown = await this.analyticsRepo.getAgingBreakdown(tenantId, fromDate, toDate);
    
    // Ensure all tiers are represented, even if 0
    const allTiers = [
      'stage_1_warm',
      'stage_2_firm',
      'stage_3_serious',
      'stage_4_stern',
      'legal_escalation'
    ];

    const result = allTiers.map(tier => {
      const found = breakdown.find(b => b.tier === tier);
      return {
        tier,
        totalAmount: found ? found.totalAmount : 0,
        count: found ? found.count : 0
      };
    });

    return result;
  }

  async getDso(tenantId: string, query: DateRange): Promise<{ dso: number; daysInPeriod: number; metrics: { totalCreditSales: number; totalReceivable: number } }> {
    const { fromDate, toDate } = this.parseDateRange(query);
    const metrics = await this.analyticsRepo.getDsoMetrics(tenantId, fromDate, toDate) || { totalCreditSales: 0, totalReceivable: 0 };
    
    let days = 30; // Default to 30 days if no range provided
    if (fromDate && toDate) {
      days = Math.max(1, Math.round((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)));
    } else if (fromDate) {
      days = Math.max(1, Math.round((new Date().getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)));
    } else if (toDate) {
      days = Math.max(1, Math.round((toDate.getTime() - new Date(toDate.getTime() - 30 * 24 * 60 * 60 * 1000).getTime()) / (1000 * 60 * 60 * 24))); // Default fallback
    }

    // Standard DSO formula approximation: (Receivable / Total Sales) * Days
    let dso = 0;
    if (metrics.totalCreditSales > 0) {
      dso = (metrics.totalReceivable / metrics.totalCreditSales) * days;
    }

    return {
      dso: Math.round(dso * 10) / 10, // Round to 1 decimal place
      daysInPeriod: days,
      metrics
    };
  }

  async getCollectionRate(tenantId: string, query: DateRange): Promise<{ totalInvoices: number; paidInvoices: number; totalAmount: number; paidAmount: number; collectionRateByCount: number; collectionRateByAmount: number }> {
    const { fromDate, toDate } = this.parseDateRange(query);
    const data = await this.analyticsRepo.getCollectionRate(tenantId, fromDate, toDate) || { totalInvoices: 0, paidInvoices: 0, totalAmount: 0, paidAmount: 0 };
    
    let collectionRateByCount = 0;
    let collectionRateByAmount = 0;

    if (data.totalInvoices > 0) {
      collectionRateByCount = (data.paidInvoices / data.totalInvoices) * 100;
    }
    if (data.totalAmount > 0) {
      collectionRateByAmount = (data.paidAmount / data.totalAmount) * 100;
    }

    return {
      ...data,
      collectionRateByCount: Math.round(collectionRateByCount * 10) / 10,
      collectionRateByAmount: Math.round(collectionRateByAmount * 10) / 10,
    };
  }

  async getAgentPerformance(tenantId: string, query: DateRange): Promise<{ totalRuns: number; invoicesProcessed: number; emailsSent: number; automationYield: number; errorRate: number; successRate: number; avgDaysToPayment: number }> {
    const { fromDate, toDate } = this.parseDateRange(query);
    const data = await this.analyticsRepo.getAgentPerformance(tenantId, fromDate, toDate);
    
    let successRate = 0;
    if (data.successData.totalFollowedUp > 0) {
      successRate = (data.successData.paidAfterFollowUp / data.successData.totalFollowedUp) * 100;
    }

    let automationYield = 0;
    if (data.runData.invoicesProcessed > 0) {
      automationYield = (data.runData.emailsSent / data.runData.invoicesProcessed) * 100;
    }

    let errorRate = 0;
    if (data.runData.totalRuns > 0) {
      errorRate = (data.runData.errors / data.runData.totalRuns) * 100;
    }

    return {
      totalRuns: data.runData.totalRuns,
      invoicesProcessed: data.runData.invoicesProcessed,
      emailsSent: data.runData.emailsSent,
      automationYield: Math.round(automationYield * 10) / 10,
      errorRate: Math.round(errorRate * 10) / 10,
      successRate: Math.round(successRate * 10) / 10,
      avgDaysToPayment: data.successData.avgDaysToPayment ? Math.round(data.successData.avgDaysToPayment * 10) / 10 : 0
    };
  }

  async getChannelBreakdown(tenantId: string, query: DateRange): Promise<Array<{ channel: string; count: number }>> {
    const { fromDate, toDate } = this.parseDateRange(query);
    const data = await this.analyticsRepo.getChannelBreakdown(tenantId, fromDate, toDate);
    
    const channels = ['email', 'sms', 'whatsapp'];
    const result = channels.map(channel => {
      const found = data.find(d => d.channel === channel);
      return {
        channel,
        count: found ? found.count : 0
      };
    });

    return result;
  }

  async getTierEffectiveness(tenantId: string, query: DateRange): Promise<Array<{ tier: string; avgDaysToPayment: number; successRate: number }>> {
    const { fromDate, toDate } = this.parseDateRange(query);
    const data = await this.analyticsRepo.getTierEffectiveness(tenantId, fromDate, toDate);
    
    const allTiers = [
      'stage_1_warm',
      'stage_2_firm',
      'stage_3_serious',
      'stage_4_stern',
      'legal_escalation'
    ];

    const result = allTiers.map(tier => {
      const found = data.find(d => d.tier === tier);
      let successRate = 0;
      if (found && found.totalFollowedUp > 0) {
        successRate = (found.paidAfterFollowUp / found.totalFollowedUp) * 100;
      }
      return {
        tier,
        avgDaysToPayment: found && found.avgDaysToPayment ? Math.round(found.avgDaysToPayment * 10) / 10 : 0,
        successRate: Math.round(successRate * 10) / 10
      };
    });

    return result;
  }

  async getEmailVolume(tenantId: string, query: DateRange): Promise<Array<{ date: string; emailsSent: number }>> {
    const { fromDate, toDate } = this.parseDateRange(query);
    return this.analyticsRepo.getEmailVolume(tenantId, fromDate, toDate);
  }

  async getCommunicationStats(tenantId: string, query: DateRange): Promise<{ totalSent: number; totalOpened: number; totalClicked: number; openRate: number; clickRate: number }> {
    const { fromDate, toDate } = this.parseDateRange(query);
    const data = await this.analyticsRepo.getCommunicationStats(tenantId, fromDate, toDate);
    
    let openRate = 0;
    let clickRate = 0;
    if (data.totalSent > 0) {
      openRate = (data.totalOpened / data.totalSent) * 100;
      clickRate = (data.totalClicked / data.totalSent) * 100;
    }

    return {
      totalSent: data.totalSent,
      totalOpened: data.totalOpened,
      totalClicked: data.totalClicked,
      openRate: Math.round(openRate * 10) / 10,
      clickRate: Math.round(clickRate * 10) / 10
    };
  }
}

import { eq, and, isNull, gte, lte, sql, type SQL } from 'drizzle-orm';
import { invoices, agentRuns, communications } from '../../db/index.js';
import type { DatabaseClient } from '../../db/index.js';

export class AnalyticsRepository {
  constructor(private db: DatabaseClient) {}

  async getSummary(tenantId: string, fromDate?: Date, toDate?: Date): Promise<{ totalReceivable: number; totalCollected: number; totalOverdue: number; invoiceCount: number } | undefined> {
    let baseConditions = and(
      eq(invoices.tenantId, tenantId),
      isNull(invoices.deletedAt)
    );

    if (fromDate) {
      baseConditions = and(baseConditions, gte(invoices.createdAt, fromDate));
    }
    if (toDate) {
      baseConditions = and(baseConditions, lte(invoices.createdAt, toDate));
    }

    const result = await this.db
      .select({
        totalReceivable: sql<number>`COALESCE(SUM(CASE WHEN ${invoices.paymentStatus} IN ('Pending', 'Overdue') THEN ${invoices.invoiceAmount} ELSE 0 END), 0)`,
        totalCollected: sql<number>`COALESCE(SUM(CASE WHEN ${invoices.paymentStatus} = 'Paid' THEN ${invoices.invoiceAmount} ELSE 0 END), 0)`,
        totalOverdue: sql<number>`COALESCE(SUM(CASE WHEN ${invoices.paymentStatus} = 'Overdue' THEN ${invoices.invoiceAmount} ELSE 0 END), 0)`,
        invoiceCount: sql<number>`COUNT(*)`,
      })
      .from(invoices)
      .where(baseConditions);

    const row = result[0];
    if (!row) return undefined;

    return {
      totalReceivable: Number(row.totalReceivable || 0),
      totalCollected: Number(row.totalCollected || 0),
      totalOverdue: Number(row.totalOverdue || 0),
      invoiceCount: Number(row.invoiceCount || 0),
    };
  }

  async getAgingBreakdown(tenantId: string, fromDate?: Date, toDate?: Date): Promise<Array<{ tier: string; totalAmount: number; count: number }>> {
    let baseConditions = and(
      eq(invoices.tenantId, tenantId),
      isNull(invoices.deletedAt),
      eq(invoices.paymentStatus, 'Overdue')
    );

    if (fromDate) {
      baseConditions = and(baseConditions, gte(invoices.createdAt, fromDate));
    }
    if (toDate) {
      baseConditions = and(baseConditions, lte(invoices.createdAt, toDate));
    }

    const computedTierSql = sql<string>`
      CASE 
        WHEN DATEDIFF(CURRENT_DATE(), ${invoices.dueDate}) >= 31 THEN 'legal_escalation'
        WHEN DATEDIFF(CURRENT_DATE(), ${invoices.dueDate}) BETWEEN 22 AND 30 THEN 'stage_4_stern'
        WHEN DATEDIFF(CURRENT_DATE(), ${invoices.dueDate}) BETWEEN 15 AND 21 THEN 'stage_3_serious'
        WHEN DATEDIFF(CURRENT_DATE(), ${invoices.dueDate}) BETWEEN 8 AND 14 THEN 'stage_2_firm'
        ELSE 'stage_1_warm'
      END
    `;

    const result = await this.db
      .select({
        tier: computedTierSql,
        totalAmount: sql<number>`COALESCE(SUM(${invoices.invoiceAmount}), 0)`,
        count: sql<number>`COUNT(*)`,
      })
      .from(invoices)
      .where(baseConditions)
      .groupBy(computedTierSql);

    return result.map(row => ({
      tier: row.tier,
      totalAmount: Number(row.totalAmount || 0),
      count: Number(row.count || 0),
    }));
  }

  async getDsoMetrics(tenantId: string, fromDate?: Date, toDate?: Date): Promise<{ totalCreditSales: number; totalReceivable: number } | undefined> {
    let baseConditions = and(
      eq(invoices.tenantId, tenantId),
      isNull(invoices.deletedAt)
    );

    if (fromDate) {
      baseConditions = and(baseConditions, gte(invoices.createdAt, fromDate));
    }
    if (toDate) {
      baseConditions = and(baseConditions, lte(invoices.createdAt, toDate));
    }

    const result = await this.db
      .select({
        totalCreditSales: sql<number>`COALESCE(SUM(${invoices.invoiceAmount}), 0)`,
        totalReceivable: sql<number>`COALESCE(SUM(CASE WHEN ${invoices.paymentStatus} IN ('Pending', 'Overdue') THEN ${invoices.invoiceAmount} ELSE 0 END), 0)`,
      })
      .from(invoices)
      .where(baseConditions);

    const row = result[0];
    if (!row) return undefined;

    return {
      totalCreditSales: Number(row.totalCreditSales || 0),
      totalReceivable: Number(row.totalReceivable || 0),
    };
  }

  async getCollectionRate(tenantId: string, fromDate?: Date, toDate?: Date): Promise<{ totalInvoices: number; paidInvoices: number; totalAmount: number; paidAmount: number } | undefined> {
    let baseConditions = and(
      eq(invoices.tenantId, tenantId),
      isNull(invoices.deletedAt)
    );

    if (fromDate) {
      baseConditions = and(baseConditions, gte(invoices.createdAt, fromDate));
    }
    if (toDate) {
      baseConditions = and(baseConditions, lte(invoices.createdAt, toDate));
    }

    const result = await this.db
      .select({
        totalInvoices: sql<number>`COUNT(*)`,
        paidInvoices: sql<number>`COALESCE(SUM(CASE WHEN ${invoices.paymentStatus} = 'Paid' THEN 1 ELSE 0 END), 0)`,
        totalAmount: sql<number>`COALESCE(SUM(${invoices.invoiceAmount}), 0)`,
        paidAmount: sql<number>`COALESCE(SUM(CASE WHEN ${invoices.paymentStatus} = 'Paid' THEN ${invoices.invoiceAmount} ELSE 0 END), 0)`,
      })
      .from(invoices)
      .where(baseConditions);

    const row = result[0];
    if (!row) return undefined;

    return {
      totalInvoices: Number(row.totalInvoices || 0),
      paidInvoices: Number(row.paidInvoices || 0),
      totalAmount: Number(row.totalAmount || 0),
      paidAmount: Number(row.paidAmount || 0),
    };
  }

  async getAgentPerformance(tenantId: string, fromDate?: Date, toDate?: Date): Promise<{
    successData: { totalFollowedUp: number; paidAfterFollowUp: number; avgDaysToPayment: number | null };
    runData: { totalRuns: number; invoicesProcessed: number; emailsSent: number; errors: number };
  }> {
    let baseConditions = and(
      eq(invoices.tenantId, tenantId),
      isNull(invoices.deletedAt),
      gte(invoices.followupCount, 1)
    );

    if (fromDate) {
      baseConditions = and(baseConditions, gte(invoices.createdAt, fromDate));
    }
    if (toDate) {
      baseConditions = and(baseConditions, lte(invoices.createdAt, toDate));
    }

    const successData = await this.db
      .select({
        totalFollowedUp: sql<number>`COUNT(*)`,
        paidAfterFollowUp: sql<number>`COALESCE(SUM(CASE WHEN ${invoices.paymentStatus} = 'Paid' THEN 1 ELSE 0 END), 0)`,
        avgDaysToPayment: sql<number | null>`AVG(CASE WHEN ${invoices.paymentStatus} = 'Paid' THEN TIMESTAMPDIFF(SECOND, ${invoices.createdAt}, ${invoices.updatedAt}) / 86400 ELSE NULL END)`
      })
      .from(invoices)
      .where(baseConditions);

    let runConditions: SQL | undefined = eq(agentRuns.tenantId, tenantId);
    if (fromDate) {
      runConditions = and(runConditions, gte(agentRuns.startTime, fromDate));
    }
    if (toDate) {
      runConditions = and(runConditions, lte(agentRuns.startTime, toDate));
    }
    
    const runData = await this.db
      .select({
        totalRuns: sql<number>`COUNT(*)`,
        invoicesProcessed: sql<number>`COALESCE(SUM(${agentRuns.invoicesProcessed}), 0)`,
        emailsSent: sql<number>`COALESCE(SUM(${agentRuns.emailsSent}), 0)`,
        errors: sql<number>`COALESCE(SUM(${agentRuns.errors}), 0)`,
      })
      .from(agentRuns)
      .where(runConditions);

    return {
      successData: {
        totalFollowedUp: Number(successData[0]?.totalFollowedUp || 0),
        paidAfterFollowUp: Number(successData[0]?.paidAfterFollowUp || 0),
        avgDaysToPayment: successData[0]?.avgDaysToPayment !== null && successData[0]?.avgDaysToPayment !== undefined ? Number(successData[0]?.avgDaysToPayment) : null,
      },
      runData: {
        totalRuns: Number(runData[0]?.totalRuns || 0),
        invoicesProcessed: Number(runData[0]?.invoicesProcessed || 0),
        emailsSent: Number(runData[0]?.emailsSent || 0),
        errors: Number(runData[0]?.errors || 0),
      },
    };
  }

  async getChannelBreakdown(tenantId: string, fromDate?: Date, toDate?: Date): Promise<Array<{ channel: string | null; count: number }>> {
    let baseConditions = and(
      eq(invoices.tenantId, tenantId),
      isNull(invoices.deletedAt)
    );
    if (fromDate) {
      baseConditions = and(baseConditions, gte(communications.sentAt, fromDate));
    }
    if (toDate) {
      baseConditions = and(baseConditions, lte(communications.sentAt, toDate));
    }

    const result = await this.db
      .select({
        channel: communications.channel,
        count: sql<number>`COUNT(*)`,
      })
      .from(communications)
      .innerJoin(invoices, eq(communications.invoiceId, invoices.id))
      .where(and(baseConditions, eq(communications.status, 'sent')))
      .groupBy(communications.channel);

    return result.map(row => ({
      channel: row.channel,
      count: Number(row.count || 0),
    }));
  }

  async getTierEffectiveness(tenantId: string, fromDate?: Date, toDate?: Date): Promise<Array<{ tier: string; totalFollowedUp: number; paidAfterFollowUp: number; avgDaysToPayment: number | null }>> {
    let baseConditions = and(
      eq(invoices.tenantId, tenantId),
      isNull(invoices.deletedAt),
      gte(invoices.followupCount, 1)
    );
    if (fromDate) {
      baseConditions = and(baseConditions, gte(invoices.createdAt, fromDate));
    }
    if (toDate) {
      baseConditions = and(baseConditions, lte(invoices.createdAt, toDate));
    }

    const computedTierSql = sql<string>`
      CASE 
        WHEN DATEDIFF(CURRENT_DATE(), ${invoices.dueDate}) >= 31 THEN 'legal_escalation'
        WHEN DATEDIFF(CURRENT_DATE(), ${invoices.dueDate}) BETWEEN 22 AND 30 THEN 'stage_4_stern'
        WHEN DATEDIFF(CURRENT_DATE(), ${invoices.dueDate}) BETWEEN 15 AND 21 THEN 'stage_3_serious'
        WHEN DATEDIFF(CURRENT_DATE(), ${invoices.dueDate}) BETWEEN 8 AND 14 THEN 'stage_2_firm'
        ELSE 'stage_1_warm'
      END
    `;

    const result = await this.db
      .select({
        tier: computedTierSql,
        totalFollowedUp: sql<number>`COUNT(*)`,
        paidAfterFollowUp: sql<number>`COALESCE(SUM(CASE WHEN ${invoices.paymentStatus} = 'Paid' THEN 1 ELSE 0 END), 0)`,
        avgDaysToPayment: sql<number | null>`AVG(CASE WHEN ${invoices.paymentStatus} = 'Paid' THEN TIMESTAMPDIFF(SECOND, ${invoices.createdAt}, ${invoices.updatedAt}) / 86400 ELSE NULL END)`,
      })
      .from(invoices)
      .where(baseConditions)
      .groupBy(computedTierSql);

    return result.map(row => ({
      tier: row.tier,
      totalFollowedUp: Number(row.totalFollowedUp || 0),
      paidAfterFollowUp: Number(row.paidAfterFollowUp || 0),
      avgDaysToPayment: row.avgDaysToPayment !== null && row.avgDaysToPayment !== undefined ? Number(row.avgDaysToPayment) : null,
    }));
  }

  async getEmailVolume(tenantId: string, fromDate?: Date, toDate?: Date): Promise<Array<{ date: string; emailsSent: number }>> {
    let runConditions: SQL | undefined = eq(agentRuns.tenantId, tenantId);
    if (fromDate) {
      runConditions = and(runConditions, gte(agentRuns.startTime, fromDate));
    }
    if (toDate) {
      runConditions = and(runConditions, lte(agentRuns.startTime, toDate));
    }

    const result = await this.db
      .select({
        date: sql<string>`DATE_FORMAT(${agentRuns.startTime}, '%Y-%m-%d')`,
        emailsSent: sql<number>`COALESCE(SUM(${agentRuns.emailsSent}), 0)`,
      })
      .from(agentRuns)
      .where(runConditions)
      .groupBy(sql`DATE_FORMAT(${agentRuns.startTime}, '%Y-%m-%d')`)
      .orderBy(sql`DATE_FORMAT(${agentRuns.startTime}, '%Y-%m-%d') ASC`);

    return result.map(row => ({
      date: row.date,
      emailsSent: Number(row.emailsSent || 0),
    }));
  }

  async getCommunicationStats(tenantId: string, fromDate?: Date, toDate?: Date): Promise<{ totalSent: number; totalOpened: number; totalClicked: number }> {
    let baseConditions = and(
      eq(invoices.tenantId, tenantId),
      isNull(invoices.deletedAt)
    );
    if (fromDate) {
      baseConditions = and(baseConditions, gte(communications.sentAt, fromDate));
    }
    if (toDate) {
      baseConditions = and(baseConditions, lte(communications.sentAt, toDate));
    }

    const result = await this.db
      .select({
        totalSent: sql<number>`COUNT(*)`,
        totalOpened: sql<number>`COALESCE(SUM(CASE WHEN ${communications.openedAt} IS NOT NULL THEN 1 ELSE 0 END), 0)`,
        totalClicked: sql<number>`COALESCE(SUM(CASE WHEN ${communications.clickedAt} IS NOT NULL THEN 1 ELSE 0 END), 0)`,
      })
      .from(communications)
      .innerJoin(invoices, eq(communications.invoiceId, invoices.id))
      .where(and(baseConditions, eq(communications.status, 'sent')));

    const row = result[0];
    return {
      totalSent: Number(row?.totalSent || 0),
      totalOpened: Number(row?.totalOpened || 0),
      totalClicked: Number(row?.totalClicked || 0),
    };
  }
}

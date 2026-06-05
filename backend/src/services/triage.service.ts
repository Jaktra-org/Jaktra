import type { Invoice } from '../db/index.js';

export const URGENCY_TIERS = [
  'stage_1_warm',
  'stage_2_firm',
  'stage_3_serious',
  'stage_4_stern',
  'legal_escalation',
] as const;

export type UrgencyTier = (typeof URGENCY_TIERS)[number];

interface TierBracket {
  readonly tier: UrgencyTier;
  readonly minDays: number;
  readonly maxDays: number;
}

// Ordered descending so the first match wins during iteration
const TIER_BRACKETS: readonly TierBracket[] = [
  { tier: 'legal_escalation', minDays: 31, maxDays: Infinity },
  { tier: 'stage_4_stern', minDays: 22, maxDays: 30 },
  { tier: 'stage_3_serious', minDays: 15, maxDays: 21 },
  { tier: 'stage_2_firm', minDays: 8, maxDays: 14 },
  { tier: 'stage_1_warm', minDays: 0, maxDays: 7 },
] as const;

const NON_ACTIONABLE_STATUSES = new Set(['Paid', 'Written Off']);
const NOT_YET_DUE_THRESHOLD_DAYS = 7;

export interface TriagedInvoice extends Invoice {
  daysOverdue: number;
  computedTier: UrgencyTier;
}

export interface TriageResult {
  invoices: TriagedInvoice[];
  total: number;
  tierCounts: Record<UrgencyTier, number>;
}

export class TriageService {
  assignTier(daysOverdue: number): UrgencyTier {
    for (const bracket of TIER_BRACKETS) {
      if (daysOverdue >= bracket.minDays && daysOverdue <= bracket.maxDays) {
        return bracket.tier;
      }
    }
    return 'stage_1_warm';
  }

  computeDaysOverdue(dueDate: string | Date): number {
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);

    const diffMs = today.getTime() - due.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  isActionable(invoice: Invoice): boolean {
    if (NON_ACTIONABLE_STATUSES.has(invoice.paymentStatus)) return false;

    const daysOverdue = this.computeDaysOverdue(invoice.dueDate);
    if (daysOverdue > 0) return true;

    // Not yet overdue — only actionable if due within threshold
    const due = new Date(invoice.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    const daysUntilDue = Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilDue <= NOT_YET_DUE_THRESHOLD_DAYS;
  }

  triageInvoices(invoices: Invoice[]): TriageResult {
    const tierCounts: Record<UrgencyTier, number> = {
      stage_1_warm: 0,
      stage_2_firm: 0,
      stage_3_serious: 0,
      stage_4_stern: 0,
      legal_escalation: 0,
    };

    const triaged: TriagedInvoice[] = invoices
      .filter((inv) => this.isActionable(inv))
      .map((inv) => {
        const daysOverdue = this.computeDaysOverdue(inv.dueDate);
        const computedTier = this.assignTier(daysOverdue);
        tierCounts[computedTier]++;
        return { ...inv, daysOverdue, computedTier };
      })
      .sort((a, b) => b.daysOverdue - a.daysOverdue || Number(b.invoiceAmount) - Number(a.invoiceAmount));

    return { invoices: triaged, total: triaged.length, tierCounts };
  }
}

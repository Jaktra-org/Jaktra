import type { Invoice } from '../../db/index.js';

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

export interface ActiveInstallmentContext {
  id: string;
  installmentNumber: number;
  totalInstallments: number;
  amount: string;
  dueDate: string;
  currency: string;
  status: string;
}

export interface TriagedInvoice extends Invoice {
  daysOverdue: number;
  computedTier: UrgencyTier;
  needsManualReview?: boolean;
  activeInstallment?: ActiveInstallmentContext;
}

export interface TriageResult {
  invoices: TriagedInvoice[];
  total: number;
  tierCounts: Record<UrgencyTier, number>;
  needsManualReview: TriagedInvoice[];
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

  isActionable(invoice: Invoice, activeInstallmentsMap?: Map<string, ActiveInstallmentContext>): boolean {
    if (NON_ACTIONABLE_STATUSES.has(invoice.paymentStatus)) return false;

    let targetDueDate = invoice.dueDate;
    if (invoice.hasActivePaymentPlan) {
      const activeInstallment = activeInstallmentsMap?.get(invoice.id);
      if (!activeInstallment) return false; // No pending installment due
      targetDueDate = activeInstallment.dueDate;
    }

    const daysOverdue = this.computeDaysOverdue(targetDueDate);
    // Autopilot runs ONLY for overdue invoices (daysOverdue > 0)
    return daysOverdue > 0;
  }

  triageInvoices(
    invoices: Invoice[],
    dlqBlockedIds: Set<string> = new Set(),
    activeInstallmentsMap?: Map<string, ActiveInstallmentContext>
  ): TriageResult {
    const tierCounts: Record<UrgencyTier, number> = {
      stage_1_warm: 0,
      stage_2_firm: 0,
      stage_3_serious: 0,
      stage_4_stern: 0,
      legal_escalation: 0,
    };

    const actionable = invoices.filter((inv) => this.isActionable(inv, activeInstallmentsMap));
    const active: TriagedInvoice[] = [];
    const blocked: TriagedInvoice[] = [];

    for (const inv of actionable) {
      const activeInstallment = activeInstallmentsMap?.get(inv.id);
      const targetDueDate = activeInstallment ? activeInstallment.dueDate : inv.dueDate;

      const daysOverdue = this.computeDaysOverdue(targetDueDate);
      const computedTier = this.assignTier(daysOverdue);
      const isBlocked = dlqBlockedIds.has(inv.id);

      const triagedInvoice: TriagedInvoice = {
        ...inv,
        daysOverdue,
        computedTier,
        needsManualReview: isBlocked,
        activeInstallment,
      };

      if (isBlocked) {
        blocked.push(triagedInvoice);
      } else {
        tierCounts[computedTier]++;
        active.push(triagedInvoice);
      }
    }

    return {
      invoices: active,
      total: active.length,
      tierCounts,
      needsManualReview: blocked,
    };
  }
}

import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Sparkles,
  ShieldCheck,
  PauseCircle,
  FileCheck,
  RotateCcw,
} from "lucide-react";
import { SEOHead } from "@/seo/components/SEOHead";
import { installmentPlansSchema, breadcrumbSchema } from "@/seo/schemas";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { GlobalNav } from "@/components/common/GlobalNav";

interface InstallmentMilestone {
  number: number;
  label: string;
  amount: string;
  dueDate: string;
  status: "paid" | "active" | "scheduled";
  statusText: string;
}

interface InstallmentScenario {
  id: string;
  tabLabel: string;
  company: string;
  invoiceNo: string;
  totalAmount: string;
  originalDue: string;
  planType: string;
  requestSource: string;
  requestNote: string;
  milestones: InstallmentMilestone[];
  whatJaktraDoes: string;
  howAiAdapts: string;
  reconciliationInfo: string;
}

const SCENARIOS: InstallmentScenario[] = [
  {
    id: "2x-split",
    tabLabel: "2x Split Plan (Bi-Weekly)",
    company: "Vanguard Logistics Ltd",
    invoiceNo: "INV-2841",
    totalAmount: "$12,000.00",
    originalDue: "Oct 01, 2026",
    planType: "2-Part Milestone Split",
    requestSource: "Debtor self-selected via portal link (/i/:token)",
    requestNote: "Client selected pre-authorized 2-part schedule: 50% upfront, 50% in 14 days to align with corporate payroll run.",
    milestones: [
      {
        number: 1,
        label: "Installment 1 of 2",
        amount: "$6,000.00",
        dueDate: "Oct 15, 2026",
        status: "paid",
        statusText: "Paid via ACH Transfer",
      },
      {
        number: 2,
        label: "Installment 2 of 2",
        amount: "$6,000.00",
        dueDate: "Oct 29, 2026",
        status: "active",
        statusText: "Active Tracking (Due in 14 days)",
      },
    ],
    whatJaktraDoes:
      "Full lump-sum demands halt immediately. The invoice updates to hasActivePaymentPlan: true, generates 2 milestone records in the database, and schedules reminder tracking specifically for Tranche #2.",
    howAiAdapts:
      "Instead of demanding $12,000, Jaktra's AI agent references only Milestone #2 ($6,000.00) due on Oct 29. Communications remain polite and appreciative of the initial milestone settlement.",
    reconciliationInfo:
      "Razorpay webhook reconciled Tranche #1 instantly. Remainder tracks automatically with zero manual accounting work.",
  },
  {
    id: "3x-monthly",
    tabLabel: "3x Milestone Schedule (Monthly)",
    company: "Apex Design Systems",
    invoiceNo: "INV-3190",
    totalAmount: "$18,000.00",
    originalDue: "Sep 20, 2026",
    planType: "3-Part Monthly Tranches",
    requestSource: "Debtor portal request approved by finance manager",
    requestNote: "Client requested 3 equal monthly installments of $6,000.00 due to short-term seasonal inventory commitments.",
    milestones: [
      {
        number: 1,
        label: "Installment 1 of 3",
        amount: "$6,000.00",
        dueDate: "Oct 05, 2026",
        status: "paid",
        statusText: "Paid via Corporate Card",
      },
      {
        number: 2,
        label: "Installment 2 of 3",
        amount: "$6,000.00",
        dueDate: "Nov 05, 2026",
        status: "active",
        statusText: "Active Tracking (Upcoming)",
      },
      {
        number: 3,
        label: "Installment 3 of 3",
        amount: "$6,000.00",
        dueDate: "Dec 05, 2026",
        status: "scheduled",
        statusText: "Scheduled",
      },
    ],
    whatJaktraDoes:
      "Finance approved the request in 1 click in Jaktra's pending plans queue (/payment-plans/pending). The engine calculates exact penny-rounding splits and sends a formal confirmation email with payment portal links.",
    howAiAdapts:
      "Cadence switches exclusively into ActiveInstallmentContext. Overdue pressure is replaced with scheduled milestone reminders focused solely on Milestone #2, preserving key client goodwill.",
    reconciliationInfo:
      "Sub-second ledger synchronization: each payment reduces outstanding balance and automatically unlocks the next milestone.",
  },
  {
    id: "4x-tranche",
    tabLabel: "4x Tranche Recovery (High-Value)",
    company: "Beacon BioTech Corp",
    invoiceNo: "INV-4412",
    totalAmount: "$48,000.00",
    originalDue: "Aug 15, 2026",
    planType: "4-Part Structured Terms",
    requestSource: "Inbound email triage routed to payment plan offer",
    requestNote: "Enterprise buyer requested extended terms to span quarterly capital allocations following a delayed funding tranche.",
    milestones: [
      {
        number: 1,
        label: "Installment 1 of 4",
        amount: "$12,000.00",
        dueDate: "Sep 01, 2026",
        status: "paid",
        statusText: "Paid via Wire Transfer",
      },
      {
        number: 2,
        label: "Installment 2 of 4",
        amount: "$12,000.00",
        dueDate: "Oct 01, 2026",
        status: "paid",
        statusText: "Paid via Virtual Account",
      },
      {
        number: 3,
        label: "Installment 3 of 4",
        amount: "$12,000.00",
        dueDate: "Nov 01, 2026",
        status: "active",
        statusText: "Active Tracking (Due in 6 days)",
      },
      {
        number: 4,
        label: "Installment 4 of 4",
        amount: "$12,000.00",
        dueDate: "Dec 01, 2026",
        status: "scheduled",
        statusText: "Scheduled",
      },
    ],
    whatJaktraDoes:
      "Eliminates bad-debt write-offs and avoid expensive third-party collection agencies. The engine establishes a legally acknowledged digital schedule while keeping the buyer active and engaged.",
    howAiAdapts:
      "Jaktra sends an informative courtesy alert 5 days prior to Tranche #3 due date with a 1-click tokenized payment portal link. Zero awkward collections phone calls are required.",
    reconciliationInfo:
      "If a milestone is missed, Jaktra automatically alerts the finance team and resumes focused tranche follow-ups.",
  },
  {
    id: "custom-request",
    tabLabel: "Custom Plan Request (Debtor Initiated)",
    company: "Orion Media Labs",
    invoiceNo: "INV-3904",
    totalAmount: "$9,500.00",
    originalDue: "Sep 28, 2026",
    planType: "Custom Proposed Tranches",
    requestSource: "Debtor submitted custom proposal via portal (/i/:token)",
    requestNote: "Debtor proposed: $3,500 upfront settlement today + two subsequent monthly milestones of $3,000 each.",
    milestones: [
      {
        number: 1,
        label: "Installment 1 of 3",
        amount: "$3,500.00",
        dueDate: "Today",
        status: "active",
        statusText: "Ready for Initial Settle",
      },
      {
        number: 2,
        label: "Installment 2 of 3",
        amount: "$3,000.00",
        dueDate: "In 30 Days",
        status: "scheduled",
        statusText: "Approved Milestone",
      },
      {
        number: 3,
        label: "Installment 3 of 3",
        amount: "$3,000.00",
        dueDate: "In 60 Days",
        status: "scheduled",
        statusText: "Approved Milestone",
      },
    ],
    whatJaktraDoes:
      "Routes proposal directly to the finance dashboard with debtor notes. The finance team can approve, modify amounts, or decline with a single click. Reminders stay paused while under review.",
    howAiAdapts:
      "Upon approval, Jaktra sends a confirmation email containing the updated installment breakdown and a direct payment button for the initial $3,500 deposit.",
    reconciliationInfo:
      "Full administrative oversight: managers retain complete control over terms and can cancel an active plan if milestones are breached.",
  },
];

export function InstallmentPlans() {
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  const activeScenario = SCENARIOS[selectedScenarioIndex];

  const handleScenarioSelect = (index: number) => {
    setSelectedScenarioIndex(index);
  };

  const faqs = [
    {
      q: "Why are structured installment plans better than demanding immediate full payment?",
      a: "When B2B debtors encounter temporary cash crunches, rigid demands for immediate 100% settlement often force them to ghost communications, dispute the invoice, or push the balance into severe delinquency. Offering structured installment plans gives debtors a dignified, manageable off-ramp while securing steady cash flow and eliminating default write-offs.",
    },
    {
      q: "How does Jaktra's automated tone adapt when an installment plan is active?",
      a: "In Jaktra's triage engine (triage.service.ts and agent.service.ts), active payment plans switch the invoice context into ActiveInstallmentContext. Instead of demanding the full lump sum, our AI agent automatically adjusts copy to reference only the upcoming installment milestone, its due date, and the remaining balance.",
    },
    {
      q: "How do debtors request and approve installment plans?",
      a: "Every collection reminder contains a secure, zero-login tokenized link (/i/:token). In their portal, debtors can split the balance across pre-authorized schedules (such as 2, 3, or 4 monthly installments). Finance managers can pre-approve these rules or review custom debtor proposals with a single click in the Jaktra dashboard.",
    },
    {
      q: "How does payment reconciliation work across installments?",
      a: "As debtors clear each installment milestone via UPI, NetBanking, Virtual Accounts, or Corporate Cards, Razorpay and Stripe webhooks reconcile the ledger in real time. The milestone is marked Paid, the outstanding balance updates, and the next installment automatically queues for tracking.",
    },
    {
      q: "What happens if a debtor misses an installment payment milestone?",
      a: "If an installment becomes past due, Jaktra immediately resumes focused follow-up cadences tailored specifically to that delinquent tranche amount. If necessary, finance managers can cancel the active plan with one click (/invoices/:id/cancel-payment-plan) and revert to standard full-balance recovery.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#010102] text-[#f7f8f8] font-sans antialiased selection:bg-[#5e6ad2]/30 selection:text-white">
      <SEOHead
        title="B2B Payment Plans & Installment Recovery | Jaktra"
        description="Learn how Jaktra helps finance teams offer structured installment plans, adapt automated reminder tone, and reconcile milestone payments in real time."
        canonicalPath="/features/installment-plans"
        jsonLd={[
          installmentPlansSchema,
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Features", path: "/features" },
            { name: "Payment Plans & Installments", path: "/features/installment-plans" },
          ]),
        ]}
      />

      <GlobalNav />

      <main className="pt-24 pb-20 max-w-6xl mx-auto px-4 sm:px-6 relative">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(183,210,248,0.07),transparent)] pointer-events-none" />

        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6 text-xs text-zinc-400 font-sans relative z-10">
          <ol className="flex items-center gap-1.5">
            <li>
              <Link to="/" className="hover:text-zinc-200 transition-colors">
                Home
              </Link>
            </li>
            <li className="text-zinc-600">/</li>
            <li>
              <Link to="/features" className="hover:text-zinc-200 transition-colors">
                Features
              </Link>
            </li>
            <li className="text-zinc-600">/</li>
            <li className="text-zinc-200 font-medium" aria-current="page">
              Payment Plans &amp; Installments
            </li>
          </ol>
        </nav>

        {/* CLEAN HERO HEADER */}
        <header className="mb-10 relative z-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] xl:text-[44px] font-extrabold tracking-tight text-white mb-3.5 leading-tight lg:leading-none whitespace-normal md:whitespace-nowrap">
            B2B Payment Plans &amp; Installment Recovery
          </h1>

          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-3xl">
            When overdue debtors face short-term cash crunches, demanding immediate 100% lump sums triggers ghosting and defaults. Jaktra lets debtors self-select structured milestone plans, pauses full-balance outreach, and tracks installments automatically through webhook reconciliation.
          </p>
        </header>

        {/* SIMPLE, UNCLUTTERED SCENARIO EXPLORER */}
        <section className="mb-16 relative z-10">
          {/* Clean Scenario Tabs */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {SCENARIOS.map((sc, idx) => {
              const isSelected = selectedScenarioIndex === idx;
              return (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => handleScenarioSelect(idx)}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    isSelected
                      ? "bg-white text-zinc-950 font-semibold shadow-sm"
                      : "bg-white/[0.03] text-zinc-400 hover:text-white hover:bg-white/[0.06] border border-white/[0.06]"
                  }`}
                >
                  {sc.tabLabel}
                </button>
              );
            })}
          </div>

          {/* Single Focused Card */}
          <div className="rounded-2xl bg-[#0c0d10] border border-white/[0.08] p-6 sm:p-8 space-y-6 shadow-2xl">
            {/* Header: Invoice & Status */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-white/[0.06]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base font-bold text-white">{activeScenario.company}</span>
                  <span className="text-xs font-mono text-zinc-400">({activeScenario.invoiceNo})</span>
                </div>
                <div className="text-xs text-zinc-400">
                  Total Balance: <strong className="text-white">{activeScenario.totalAmount}</strong> &bull; Original Due: {activeScenario.originalDue}
                </div>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#b7d2f8]/10 border border-[#b7d2f8]/20 text-xs font-medium text-[#b7d2f8]">
                <Calendar className="w-4 h-4 shrink-0" />
                <span>{activeScenario.planType}</span>
              </div>
            </div>

            {/* 1. Request Details */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400 font-medium">Agreement Origin</span>
                <span className="font-mono text-zinc-500 text-[11px]">{activeScenario.requestSource}</span>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs sm:text-sm text-zinc-200 leading-relaxed italic">
                &ldquo;{activeScenario.requestNote}&rdquo;
              </div>
            </div>

            {/* 2. Scheduled Installment Tranches */}
            <div className="space-y-3">
              <div className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#b7d2f8]" />
                <span>Structured Milestone Schedule</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {activeScenario.milestones.map((m) => (
                  <div
                    key={m.number}
                    className={`p-3.5 rounded-xl border text-xs flex flex-col justify-between gap-2 ${
                      m.status === "paid"
                        ? "bg-emerald-500/5 border-emerald-500/20"
                        : m.status === "active"
                        ? "bg-[#b7d2f8]/5 border-[#b7d2f8]/25 shadow-sm"
                        : "bg-white/[0.02] border-white/[0.06] text-zinc-400"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] text-zinc-400">Tranche #{m.number}</span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                          m.status === "paid"
                            ? "bg-emerald-500/10 text-emerald-400 font-semibold"
                            : m.status === "active"
                            ? "bg-[#b7d2f8]/15 text-[#b7d2f8] font-bold"
                            : "bg-white/[0.04] text-zinc-500"
                        }`}
                      >
                        {m.status.toUpperCase()}
                      </span>
                    </div>

                    <div>
                      <div className="text-base font-bold font-mono text-white mb-0.5">{m.amount}</div>
                      <div className="text-[11px] text-zinc-400">Due {m.dueDate}</div>
                    </div>

                    <div className="text-[11px] pt-1.5 border-t border-white/[0.05] text-zinc-300 truncate">
                      {m.statusText}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Feature Explanation: What Jaktra Does & How Outreach Adapts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <PauseCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>What Jaktra Does Immediately</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {activeScenario.whatJaktraDoes}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <Sparkles className="w-4 h-4 text-[#b7d2f8] shrink-0" />
                  <span>How AI Follow-Ups Adapt</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {activeScenario.howAiAdapts}
                </p>
              </div>
            </div>

            {/* Safeguard & Reconciliation Note */}
            <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
              <div className="flex items-center gap-2 text-zinc-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{activeScenario.reconciliationInfo}</span>
              </div>
              <span className="text-[11px] text-zinc-500 font-mono shrink-0">
                Zero manual spreadsheet bookkeeping
              </span>
            </div>
          </div>
        </section>

        {/* 4-PHASE LIFECYCLE: HOW THE COMPLETE INSTALLMENT ENGINE WORKS */}
        <section className="mb-16 border-t border-white/[0.08] pt-12">
          <div className="max-w-2xl mb-8">
            <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold block mb-1">
              End-to-End Recovery Flow
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              How Jaktra Structures and Recovers Installment Plans
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#0c0d10] border border-white/[0.08] space-y-3 relative">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Phase 1
              </span>
              <h3 className="text-sm font-semibold text-white">Debtor Self-Selection</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Reminders embed zero-login tokenized links (<code className="text-[#b7d2f8] font-mono">/i/:token</code>). Debtors can review terms and select 2x, 3x, or 4x milestone splits without login hurdles or awkward phone calls.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0c0d10] border border-white/[0.08] space-y-3 relative">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Phase 2
              </span>
              <h3 className="text-sm font-semibold text-white">One-Click Manager Review</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Plan requests land in your finance review queue (<code className="text-[#b7d2f8] font-mono">/payment-plans/pending</code>). Managers approve, customize terms, or decline proposals with a single click.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0c0d10] border border-white/[0.08] space-y-3 relative">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                Phase 3
              </span>
              <h3 className="text-sm font-semibold text-white">Cadence Pivot &amp; Tone Calming</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Aggressive lump-sum demands stop instantly. The AI agent switches context to track only the upcoming milestone tranche due date and amount, keeping debtor relations productive.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0c0d10] border border-white/[0.08] space-y-3 relative">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Phase 4
              </span>
              <h3 className="text-sm font-semibold text-white">Real-Time Webhook Reconciliation</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                As milestones clear via UPI, NetBanking, or card, Razorpay webhooks mark each tranche Paid, adjust ledger balances, and automatically queue the next installment until completion.
              </p>
            </div>
          </div>
        </section>

        {/* COMPARISON TABLE: JAKTRA VS RIGID COLLECTION DEMANDS */}
        <section className="mb-16 rounded-2xl bg-[#0c0d10] border border-white/[0.08] p-5 sm:p-7 shadow-xl">
          <div className="mb-5">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-1">
              Operational Comparison
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Structured Milestone Recovery vs. Rigid Lump-Sum Demands
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[620px]">
              <thead>
                <tr className="border-b border-white/[0.08] text-[11px] font-mono uppercase text-zinc-400">
                  <th className="py-3 px-4">Debtor Scenario</th>
                  <th className="py-3 px-4 text-zinc-400">Rigid Lump-Sum Demands</th>
                  <th className="py-3 px-4 text-[#b7d2f8] font-bold">Jaktra Milestone Engine</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Client facing temporary cash crunch</td>
                  <td className="py-3 px-4 text-zinc-400">Ghosts emails, ignores calls, or pushes invoice to 90+ days</td>
                  <td className="py-3 px-4 text-white font-medium bg-[#b7d2f8]/5">Selects a manageable 2x–4x tranche schedule inside portal</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Automated reminder behavior</td>
                  <td className="py-3 px-4 text-zinc-400">Continues sending rigid overdue notices for the entire balance</td>
                  <td className="py-3 px-4 text-white font-medium bg-[#b7d2f8]/5">Halts full balance demands; tracks only the active milestone</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Debtor portal experience</td>
                  <td className="py-3 px-4 text-zinc-400">High-friction password logins that 70%+ of clients abandon</td>
                  <td className="py-3 px-4 text-white font-medium bg-[#b7d2f8]/5">1-click zero-login tokenized link with instant tranche breakdown</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Ledger &amp; payment tracking</td>
                  <td className="py-3 px-4 text-zinc-400">Manual spreadsheets and manual bank statement reconciliation</td>
                  <td className="py-3 px-4 text-white font-medium bg-[#b7d2f8]/5">Instant webhook ledger sync; sub-second tranche status updates</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Customer relationship impact</td>
                  <td className="py-3 px-4 text-zinc-400">Damaged vendor goodwill and potential churn</td>
                  <td className="py-3 px-4 text-white font-medium bg-[#b7d2f8]/5">Dignified off-ramp that recovers 100% cash while preserving trust</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 6 CORE CAPABILITIES GRID */}
        <section className="mb-16">
          <div className="max-w-2xl mb-8">
            <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold block mb-1">
              Built-In Architecture
            </span>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Real Features Powering Autonomous Installment Recovery
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-[#0c0d10] border border-white/[0.08] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">Zero-Login Debtor Portal</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Debtors access their schedule securely via cryptographically signed tokens (<code className="text-[#b7d2f8] font-mono text-[11px]">/i/:token</code>) without passwords or account setup friction.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0c0d10] border border-white/[0.08] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">Dynamic Tone Modulation</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                The agent detects active installment status and automatically recalibrates copy, ensuring debtors receive polite milestone updates rather than aggressive demands.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0c0d10] border border-white/[0.08] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <FileCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">Penny-Perfect Schedule Math</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                The backend divides invoices across 2 to 24 tranches, cleanly handling rounding remainder cents on the final milestone so ledgers always match down to the exact penny.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0c0d10] border border-white/[0.08] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <CreditCard className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">Commercial Payment Rails</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Accept individual milestone payments via UPI, NetBanking, NEFT/RTGS virtual bank accounts, and corporate credit cards with automated receipt delivery.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0c0d10] border border-white/[0.08] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <RotateCcw className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">Sub-Second Webhook Sync</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Razorpay and Stripe webhooks update installment status to Paid in real time, adjust remaining balances, and trigger confirmation receipts without human intervention.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0c0d10] border border-white/[0.08] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">Delinquency Safeguard Fallback</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                If an installment milestone is missed, Jaktra immediately alerts your credit controller and resumes focused tranche follow-ups or allows 1-click plan cancellation.
              </p>
            </div>
          </div>
        </section>

        {/* FREQUENTLY ASKED QUESTIONS */}
        <section className="mb-16">
          <div className="max-w-2xl mb-8">
            <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold block mb-1">
              Common Questions
            </span>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="rounded-2xl bg-[#0c0d10] border border-white/[0.08] p-6 sm:p-8">
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="border-b border-white/[0.06] last:border-0 pb-4 last:pb-0"
                >
                  <AccordionTrigger className="text-sm font-medium text-white hover:text-[#b7d2f8] text-left">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-xs sm:text-sm text-zinc-400 leading-relaxed pt-2">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CLEAN HIGH-CONVERTING BOTTOM CTA */}
        <section className="rounded-2xl bg-[#0c0d10] border border-white/[0.08] p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
          <div className="max-w-xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Recover Overdue Cash Faster with Structured Payment Plans
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Eliminate bad-debt write-offs and preserve client goodwill with automated milestone schedules and real-time webhook reconciliation.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                to="/register"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-white text-zinc-950 font-semibold text-xs sm:text-sm hover:bg-zinc-200 transition-colors shadow-sm inline-flex items-center justify-center gap-2"
              >
                <span>Get started free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/features"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-white/[0.04] text-zinc-300 hover:text-white hover:bg-white/[0.08] border border-white/[0.08] text-xs sm:text-sm font-medium transition-colors"
              >
                Explore all features
              </Link>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}

export default InstallmentPlans;

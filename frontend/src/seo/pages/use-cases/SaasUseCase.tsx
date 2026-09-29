import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ShieldCheck,
  CreditCard,
  AlertTriangle,
  Users,
  CheckCircle2,
  Lock,
  Mail,
  ChevronRight,
  Calendar,
  Clock,
  Copy,
  Check,
  Building2,
  Briefcase,
  Factory,
  Truck,
  Boxes,
  UserCheck,
  HardHat,
  Database,
} from "lucide-react";
import { SEOHead } from "@/seo/components/SEOHead";
import { saasUseCaseSchema, breadcrumbSchema } from "@/seo/schemas";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { GlobalNav } from "@/components/common/GlobalNav";

interface DunningStage {
  id: string;
  stageNumber: string;
  timing: string;
  title: string;
  tone: string;
  badge: string;
  psychology: string;
  description: string;
  subject: string;
  to?: string;
  cc?: string;
  sample: string;
  guardrail: string;
  actionPrompt: string;
}

const DUNNING_STAGES: DunningStage[] = [
  {
    id: "stage-1",
    stageNumber: "01",
    timing: "Day -3 (Pre-Due)",
    title: "Proactive Courtesy Notice",
    tone: "Polite & Administrative",
    badge: "bg-white/[0.04] text-zinc-300 border-white/[0.08]",
    psychology:
      "Enterprise AP departments batch wire payments on set weekly schedules. Prompting 3 days ahead ensures PO alignment before deadlines.",
    description:
      "Sends an automated statement 3 days prior to invoice maturity with itemized usage lines and a zero-friction verification link.",
    subject: "Upcoming invoice courtesy copy: Acme Cloud Enterprise (INV-4921 due Oct 15)",
    to: "sarah.finance@clientdomain.com (Accounts Payable)",
    sample: `Hi Sarah,

Sharing a courtesy copy of Acme Cloud Enterprise invoice #INV-4921 ($14,200.00) due this Friday, October 15, to ensure alignment with your weekly AP disbursement run.

• Reference: Invoice #INV-4921 · PO #88419 · 50 Enterprise Seats
• Attached: Itemized usage statement, verified W-9 & ACH remittance details

If your finance desk requires vendor portal submission (Coupa/Tipalti) or split-billing, reply directly to this thread and we will resolve it immediately. You can confirm your scheduled payment date below:`,
    guardrail:
      "Zero urgency language; confirms invoice receipt without triggering spam filters or alienating stakeholders.",
    actionPrompt: "Verify Invoice & Schedule Payment",
  },
  {
    id: "stage-2",
    stageNumber: "02",
    timing: "Day +3 Past Due",
    title: "Friendly Settlement Prompt",
    tone: "Helpful & Collaborative",
    badge: "bg-white/[0.04] text-zinc-300 border-white/[0.08]",
    psychology:
      "Most initial SaaS payment delays stem from administrative friction like expired corporate cards, AP turnover, or PO re-routing, rather than intentional default.",
    description:
      "Checks in right after maturity date, providing one-click links for updating expired corporate credit cards, ACH details, or raising a billing query.",
    subject: "Quick follow-up: Acme Cloud Enterprise invoice #INV-4921 ($14,200.00)",
    to: "sarah.finance@clientdomain.com (Accounts Payable)",
    sample: `Hi Sarah,

Quick follow-up on invoice #INV-4921 ($14,200.00) for your Acme Cloud workspace, which matured earlier this week on October 15.

Often delays at this stage are simply an expired corporate credit card or a pending internal PO approval. If remittance is already queued in your upcoming batch, please feel free to log your payment reference below.

Otherwise, you can update your corporate payment method or remit via 1-click ACH without logging into a portal here:`,
    guardrail:
      "Includes cryptographic one-click link. No login password required for the debtor's finance team.",
    actionPrompt: "Update Payment Method or Pay $14,200 (1-Click)",
  },
  {
    id: "stage-3",
    stageNumber: "03",
    timing: "Day +14 Past Due",
    title: "Commercial Cadence Escalation",
    tone: "Firm & Professional",
    badge: "bg-white/[0.04] text-zinc-300 border-white/[0.08]",
    psychology:
      "Invoices past 14 days risk becoming aged debt if not escalated to the primary finance controller and internal account owner.",
    description:
      "Escalates to the primary billing controller and copy-notifies the client account owner, highlighting contract terms and requesting scheduled remittance.",
    subject: "Payment Status Request: Invoice #INV-4921 is 14 days overdue ($14,200.00)",
    to: "sarah.finance@clientdomain.com (Accounts Payable)",
    cc: "alex.miller@clientdomain.com (VP Engineering / Account Sponsor)",
    sample: `Hi Sarah (cc: Alex),

We have not yet received payment confirmation for invoice #INV-4921 ($14,200.00), now 14 days overdue against agreed Net 30 terms. Maintaining uninterrupted platform access for Alex's engineering team is our priority.

To assist our finance team with quarter-end cash reconciliation:
1. Could you confirm the scheduled disbursement date for this balance?
2. If payment is held due to a seat allocation or usage true-up inquiry, reply directly. Jaktra's dispute triage will instantly pause follow-ups and route an itemized audit to our billing desk.

You can remit directly via instant wire, ACH, or corporate card below:`,
    guardrail:
      "Built-in 20-hour contact barrier prevents spamming client executives. Automatic dispute NLP pauses dunning if buyer flags an error.",
    actionPrompt: "Confirm Remittance Date or Request Audit",
  },
  {
    id: "stage-4",
    stageNumber: "04",
    timing: "Day +30 Past Due",
    title: "Executive Finance Notice",
    tone: "Formal & Urgency-Driven",
    badge: "bg-white/[0.04] text-zinc-300 border-white/[0.08]",
    psychology:
      "Risk of involuntary churn surges past 30 days. Internal Customer Success leads need real-time awareness before renewal friction.",
    description:
      "Informs executive finance contacts and internal account leads. Offers self-serve installment plan options to clear the balance without service interruption.",
    subject: "URGENT: Overdue Account Notice & Settlement Options for Acme Cloud (#AC-281)",
    to: "sarah.finance@clientdomain.com, controller@clientdomain.com",
    cc: "alex.miller@clientdomain.com (VP Engineering), david.cfo@clientdomain.com",
    sample: `Dear Sarah, Alex, and Finance Leadership,

This notice concerns overdue invoice #INV-4921 ($14,200.00) for Acme Cloud Account #AC-281, currently 30 days past due. To prevent administrative holds on your production workspace, we request your assistance resolving this balance this week.

If remitting the balance in full presents timing constraints, Jaktra enables automated flexible settlement:
• Option 1: Settle in full via instant ACH or corporate card
• Option 2: Split into 2 monthly installments of $7,100.00 (zero interest)
• Option 3: Connect with your dedicated CSM to review contract adjustments

Please confirm your settlement path by October 28 to ensure continuous service continuity:`,
    guardrail:
      "Offers 2x–4x automated installment schedule to prevent contract write-off and preserve Net Revenue Retention.",
    actionPrompt: "Select Settlement Option or Activate 2x Payment Plan",
  },
  {
    id: "stage-5",
    stageNumber: "05",
    timing: "Day +45 Past Due",
    title: "Service Suspension Warning",
    tone: "Definitive & Compliance",
    badge: "bg-white/[0.08] text-white border-white/[0.15]",
    psychology:
      "Final compliance requirement prior to account hold or manual service suspension. Provides a clear path to instant digital cure.",
    description:
      "Final formal demand warning of pending service suspension. Strict compliance formatting with options for immediate digital cure.",
    subject: "FINAL NOTICE: Scheduled Service Suspension for Account #AC-281 (Invoice #INV-4921)",
    to: "david.cfo@clientdomain.com, controller@clientdomain.com",
    cc: "alex.miller@clientdomain.com (VP Engineering), legal-notices@clientdomain.com",
    sample: `ATTENTION: Corporate Controller & Executive Signatory,

Acme Cloud Account #AC-281 remains delinquent for Invoice #INV-4921 ($14,200.00), now 45 days past due. Pursuant to Section 8.2 of our Master Services Agreement, platform access is scheduled for automated suspension on Friday, November 6, 2026 at 5:00 PM EST.

Suspension restricts production API endpoints, SSO authentication, and priority SLAs. To prevent disruption and avoid external recovery escalation, payment must be confirmed prior to the deadline.

Execute an immediate digital cure via certified ACH, wire, or card below:`,
    guardrail:
      "Stage 5 Legal Stop halts automated messaging at Day 45. Handed off to internal executive team.",
    actionPrompt: "Execute Immediate Digital Cure & Retain Platform Access",
  },
];

const FAQS = [
  {
    q: "How does Jaktra prevent involuntary churn for B2B SaaS companies?",
    a: "When subscription invoices go past due due to expired cards or missed AP approval runs, generic dunning emails often land in spam or alienate buyers. Jaktra uses AI tone escalation across 5 stages and provides a secure, tokenized debtor portal where customers can update payment details, pay instantly via ACH/credit card, or select an installment schedule without customer success intervention.",
  },
  {
    q: "How does Jaktra handle usage-based invoice disputes and seat true-ups?",
    a: "If a SaaS debtor replies with a question about overage hours, API call spikes, or seat license discrepancies, Jaktra's NLP classifier detects the dispute topic, immediately pauses automated dunning to prevent relationship damage, and routes a structured summary with contract references directly to your finance or CS team.",
  },
  {
    q: "Can our sales reps and account managers view collections activity before renewal calls?",
    a: "Yes. Jaktra provides role-based visibility and audit logs. Account executives and Customer Success Managers can check live communication feeds and overdue balances directly before jumping into quarterly business reviews (QBRs) or annual renewal contract negotiations.",
  },
  {
    q: "How fast does Jaktra integrate with existing SaaS billing systems?",
    a: "You can import your billing ledger via universal CSV export or connect via REST API in under 5 minutes. Jaktra automatically maps invoice numbers, customer emails, due dates, and open balances with zero custom engineering.",
  },
  {
    q: "Does Jaktra support self-serve payment plans for cash-strapped subscribers?",
    a: "Yes. In Stages 3 and 4, Jaktra can offer customizable installment schedules. Overdue debtors can split large annual contracts into 2 to 4 automated monthly payments via ACH or card, preserving Net Revenue Retention and avoiding contract write-offs.",
  },
  {
    q: "Will autonomous AI collections damage our sensitive corporate client relationships?",
    a: "Never. Jaktra's autonomous AI operates with strict SaaS guardrails: early stages are framed as helpful administrative assistance rather than aggressive debt collection, and a built-in 20-hour contact barrier prevents spamming client executives.",
  },
];

const RELATED_PLAYBOOKS = [
  {
    id: "agencies",
    name: "Digital & Marketing Agencies",
    terms: "Net 30 / Monthly Retainers",
    url: "/use-cases/agencies",
    icon: Building2,
  },
  {
    id: "manufacturing",
    name: "Manufacturing & Industrial Suppliers",
    terms: "Net 60–90 / Work-in-Progress",
    url: "/use-cases/manufacturing",
    icon: Factory,
  },
  {
    id: "professional-services",
    name: "Consulting & Professional Services",
    terms: "Net 30 / Hourly Engagements",
    url: "/use-cases/professional-services",
    icon: Briefcase,
  },
  {
    id: "logistics-freight",
    name: "Logistics, Freight & 3PL",
    terms: "Net 30–60 / Load Delivery",
    url: "/use-cases/logistics-freight",
    icon: Truck,
  },
  {
    id: "wholesale-distribution",
    name: "Wholesale & Trade Distribution",
    terms: "Net 30–60 / Trade Credit",
    url: "/use-cases/wholesale-distribution",
    icon: Boxes,
  },
  {
    id: "staffing-recruiting",
    name: "Staffing & Recruiting Agencies",
    terms: "Net 15–30 / Weekly Timesheets",
    url: "/use-cases/staffing-recruiting",
    icon: UserCheck,
  },
  {
    id: "construction",
    name: "Commercial Subcontractors",
    terms: "Net 30–60 / Progress AIA Billing",
    url: "/use-cases/construction",
    icon: HardHat,
  },
];

export function SaasUseCase() {
  const [activeStageId, setActiveStageId] = useState<string>("stage-1");
  const [copiedStage, setCopiedStage] = useState<boolean>(false);

  const activeStage = DUNNING_STAGES.find((s) => s.id === activeStageId) || DUNNING_STAGES[0];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStage(true);
    setTimeout(() => setCopiedStage(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#010102] text-[#f7f8f8] font-sans antialiased selection:bg-[#5e6ad2]/30 selection:text-white">
      <SEOHead
        title="Collect Overdue B2B SaaS Invoices Without Churn — Jaktra"
        description="Collect overdue B2B SaaS invoices without churning accounts. Automate seat and usage dispute triage, maintain polite tone escalation, and protect NRR."
        canonicalPath="/use-cases/saas"
        jsonLd={[
          saasUseCaseSchema,
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Industry Solutions", path: "/use-cases" },
            { name: "B2B SaaS AR", path: "/use-cases/saas" },
          ]),
        ]}
      />

      <GlobalNav />

      <main className="pt-24 pb-20 max-w-6xl mx-auto px-4 sm:px-6 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(183,210,248,0.06),transparent)] pointer-events-none" />

        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6 text-xs text-zinc-400 relative z-10 flex items-center gap-1.5 font-sans">
          <Link to="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <Link to="/use-cases" className="hover:text-white transition-colors">
            Industry Solutions
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-zinc-200 font-medium" aria-current="page">
            B2B SaaS Collections
          </span>
        </nav>

        {/* Hero Section: Editorial & Strategic Focus */}
        <header className="mb-14 max-w-5xl">
          <h1 className="text-3xl sm:text-4xl lg:text-[40px] xl:text-[46px] font-extrabold tracking-tight text-white leading-[1.18] mb-5">
            <span className="block">B2B SaaS Accounts Receivable:</span>
            <span className="block">Recover Overdue ARR &amp; Protect Net Retention</span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-300 leading-relaxed mb-6 max-w-3xl">
            Stop forcing Account Executives and Customer Success Managers to chase past-due subscription invoices. Discover how autonomous tone escalation and NLP dispute triage resolve seat and usage discrepancies, pulling overdue ARR forward without damaging enterprise renewal relationships.
          </p>

          {/* E-E-A-T Trust & Publication Byline */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-zinc-400 pt-4 border-t border-white/[0.08]">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#b7d2f8]" />
              <span>By Jaktra AR Operations</span>
            </div>
            <span className="text-zinc-600">•</span>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-zinc-500" />
              <span>Updated Q1 2026</span>
            </div>
            <span className="text-zinc-600">•</span>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-zinc-500" />
              <span>6 min read</span>
            </div>
            <span className="text-zinc-600 hidden sm:inline">•</span>
            <span className="text-zinc-400 hidden sm:inline">For B2B SaaS CFOs &amp; RevOps</span>
          </div>
        </header>

        {/* Capability Architecture Ribbon */}
        <section id="capabilities" className="mb-12">
          <div className="relative rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-white/[0.01] backdrop-blur-md overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.36)]">
            {/* Top ambient highlight gradient line */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#b7d2f8]/40 to-transparent" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.08]">
              {/* Pillar 01 */}
              <div className="group relative p-6 lg:p-7 hover:bg-white/[0.025] transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#b7d2f8]/10 border border-[#b7d2f8]/20 flex items-center justify-center text-[#b7d2f8] shadow-[0_0_20px_rgba(183,210,248,0.12)] group-hover:scale-105 group-hover:border-[#b7d2f8]/40 transition-all">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06]">
                    Pillar 01
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                  Tone Escalation
                </span>
                <div className="text-2xl font-bold tracking-tight text-white mb-2 group-hover:text-[#b7d2f8] transition-colors">
                  5 Stages
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                  Modulates from polite pre-due courtesy check-ins to firm executive governance.
                </p>
                <div className="pt-3 border-t border-white/[0.05] flex items-center gap-2 text-[11px] text-zinc-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
                  <span>Multi-Tier Cadence</span>
                </div>
              </div>

              {/* Pillar 02 */}
              <div className="group relative p-6 lg:p-7 hover:bg-white/[0.025] transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#b7d2f8]/10 border border-[#b7d2f8]/20 flex items-center justify-center text-[#b7d2f8] shadow-[0_0_20px_rgba(183,210,248,0.12)] group-hover:scale-105 group-hover:border-[#b7d2f8]/40 transition-all">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06]">
                    Pillar 02
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                  Direct Settlement
                </span>
                <div className="text-2xl font-bold tracking-tight text-white mb-2 group-hover:text-[#b7d2f8] transition-colors">
                  Zero Login
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                  Cryptographic 1-click tokenized payment links for cards, ACH, and wires.
                </p>
                <div className="pt-3 border-t border-white/[0.05] flex items-center gap-2 text-[11px] text-zinc-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#b7d2f8] shrink-0 shadow-[0_0_6px_rgba(183,210,248,0.6)]" />
                  <span>1-Click Tokenized Portal</span>
                </div>
              </div>

              {/* Pillar 03 */}
              <div className="group relative p-6 lg:p-7 hover:bg-white/[0.025] transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#b7d2f8]/10 border border-[#b7d2f8]/20 flex items-center justify-center text-[#b7d2f8] shadow-[0_0_20px_rgba(183,210,248,0.12)] group-hover:scale-105 group-hover:border-[#b7d2f8]/40 transition-all">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06]">
                    Pillar 03
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                  Dispute Handling
                </span>
                <div className="text-2xl font-bold tracking-tight text-white mb-2 group-hover:text-[#b7d2f8] transition-colors">
                  Auto-Pause
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                  NLP detects seat/usage discrepancies and pauses reminder cadences instantly.
                </p>
                <div className="pt-3 border-t border-white/[0.05] flex items-center gap-2 text-[11px] text-zinc-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
                  <span>NLP Semantic Triage</span>
                </div>
              </div>

              {/* Pillar 04 */}
              <div className="group relative p-6 lg:p-7 hover:bg-white/[0.025] transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#b7d2f8]/10 border border-[#b7d2f8]/20 flex items-center justify-center text-[#b7d2f8] shadow-[0_0_20px_rgba(183,210,248,0.12)] group-hover:scale-105 group-hover:border-[#b7d2f8]/40 transition-all">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06]">
                    Pillar 04
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                  Ledger Import
                </span>
                <div className="text-2xl font-bold tracking-tight text-white mb-2 group-hover:text-[#b7d2f8] transition-colors">
                  &lt; 5 Mins
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                  Connect via universal CSV or REST API with QuickBooks, Xero, or Stripe.
                </p>
                <div className="pt-3 border-t border-white/[0.05] flex items-center gap-2 text-[11px] text-zinc-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#b7d2f8] shrink-0 shadow-[0_0_6px_rgba(183,210,248,0.6)]" />
                  <span>Universal ERP / CSV Sync</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3 Core SaaS Dilemmas: Operational Breakdown */}
        <section id="dilemmas" className="border-t border-white/[0.08] pt-16 pb-16">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono uppercase tracking-widest text-zinc-400 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shadow-[0_0_6px_rgba(244,63,94,0.6)]" />
                Operational Breakdown
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-[1.2]">
                Why Traditional B2B SaaS Dunning Fails High-Value Accounts
              </h2>
            </div>
            <p className="text-sm sm:text-base text-zinc-400 max-w-md leading-relaxed lg:pb-1">
              Standard billing tools blast robotic reminders that land in spam or alienate executive sponsors before renewals. Here is how Jaktra automates collections safely.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Dilemma 01 */}
            <div className="relative rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-white/[0.01] backdrop-blur-md p-6 lg:p-7 flex flex-col justify-between hover:border-white/[0.16] hover:bg-white/[0.025] transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.36)] group overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#b7d2f8]/30 to-transparent group-hover:via-[#b7d2f8]/60 transition-all duration-500" />
              
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 rounded-xl bg-[#b7d2f8]/10 border border-[#b7d2f8]/20 flex items-center justify-center text-[#b7d2f8] shadow-[0_0_20px_rgba(183,210,248,0.12)] group-hover:scale-105 group-hover:border-[#b7d2f8]/40 transition-all">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 px-2.5 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06]">
                    Dilemma 01
                  </span>
                </div>

                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
                  Account Relationships
                </span>
                <h3 className="text-xl font-bold tracking-tight text-white mb-3 group-hover:text-[#b7d2f8] transition-colors">
                  Protecting Renewal Goodwill
                </h3>
                <p className="text-xs sm:text-[13px] text-zinc-400 leading-relaxed mb-6">
                  When Account Executives or CS managers are tasked with chasing overdue invoices, buyers get defensive and threaten non-renewal during quarterly business reviews (QBRs).
                </p>
              </div>

              {/* Elevated Resolution Block */}
              <div className="pt-4 border-t border-white/[0.06]">
                <div className="rounded-xl p-4 bg-black/40 border border-white/[0.06] group-hover:border-[#b7d2f8]/20 transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#b7d2f8] shadow-[0_0_6px_rgba(183,210,248,0.8)]" />
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#b7d2f8] font-bold">
                      Autonomous Resolution
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Acts as an objective, polite third-party finance buffer. Sales leads maintain pure expansion relationships while billing terms are executed professionally.
                  </p>
                </div>
              </div>
            </div>

            {/* Dilemma 02 */}
            <div className="relative rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-white/[0.01] backdrop-blur-md p-6 lg:p-7 flex flex-col justify-between hover:border-white/[0.16] hover:bg-white/[0.025] transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.36)] group overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#b7d2f8]/30 to-transparent group-hover:via-[#b7d2f8]/60 transition-all duration-500" />
              
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 rounded-xl bg-[#b7d2f8]/10 border border-[#b7d2f8]/20 flex items-center justify-center text-[#b7d2f8] shadow-[0_0_20px_rgba(183,210,248,0.12)] group-hover:scale-105 group-hover:border-[#b7d2f8]/40 transition-all">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 px-2.5 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06]">
                    Dilemma 02
                  </span>
                </div>

                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
                  Dispute Resolution
                </span>
                <h3 className="text-xl font-bold tracking-tight text-white mb-3 group-hover:text-[#b7d2f8] transition-colors">
                  Usage &amp; Seat True-up Triage
                </h3>
                <p className="text-xs sm:text-[13px] text-zinc-400 leading-relaxed mb-6">
                  In usage-based or seat-tiered SaaS, debtors freeze payments over surprise overage line-items or unutilized seat allocations. Generic dunning keeps pinging them, causing outrage.
                </p>
              </div>

              {/* Elevated Resolution Block */}
              <div className="pt-4 border-t border-white/[0.06]">
                <div className="rounded-xl p-4 bg-black/40 border border-white/[0.06] group-hover:border-[#b7d2f8]/20 transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#b7d2f8] shadow-[0_0_6px_rgba(183,210,248,0.8)]" />
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#b7d2f8] font-bold">
                      Autonomous Resolution
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    NLP DisputeAgent detects line-item inquiries immediately, freezes the reminder sequence, and routes a structured audit to your finance team to resolve in hours.
                  </p>
                </div>
              </div>
            </div>

            {/* Dilemma 03 */}
            <div className="relative rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-white/[0.01] backdrop-blur-md p-6 lg:p-7 flex flex-col justify-between hover:border-white/[0.16] hover:bg-white/[0.025] transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.36)] group overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#b7d2f8]/30 to-transparent group-hover:via-[#b7d2f8]/60 transition-all duration-500" />
              
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 rounded-xl bg-[#b7d2f8]/10 border border-[#b7d2f8]/20 flex items-center justify-center text-[#b7d2f8] shadow-[0_0_20px_rgba(183,210,248,0.12)] group-hover:scale-105 group-hover:border-[#b7d2f8]/40 transition-all">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 px-2.5 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06]">
                    Dilemma 03
                  </span>
                </div>

                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
                  Payment Friction
                </span>
                <h3 className="text-xl font-bold tracking-tight text-white mb-3 group-hover:text-[#b7d2f8] transition-colors">
                  Tokenized Zero-Login Settlement
                </h3>
                <p className="text-xs sm:text-[13px] text-zinc-400 leading-relaxed mb-6">
                  Enterprise AP desks reject navigating multi-step customer portals requiring forgotten passwords or two-factor authentications just to remit a routine invoice.
                </p>
              </div>

              {/* Elevated Resolution Block */}
              <div className="pt-4 border-t border-white/[0.06]">
                <div className="rounded-xl p-4 bg-black/40 border border-white/[0.06] group-hover:border-[#b7d2f8]/20 transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#b7d2f8] shadow-[0_0_6px_rgba(183,210,248,0.8)]" />
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#b7d2f8] font-bold">
                      Autonomous Resolution
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Every reminder includes a secure cryptographic debtor link. In 30 seconds, AP updates expired cards, downloads tax forms, or approves instant ACH wires.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The 5-Stage SaaS Dunning Cadence */}
        <section id="cadence" className="border-t border-white/[0.08] pt-16 pb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-2">
                Tone Escalation Architecture
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                The 5-Stage SaaS Debtor Lifecycle Pipeline
              </h2>
            </div>
            <p className="text-sm text-zinc-400 max-w-xl leading-relaxed">
              Jaktra modulates communication urgency as overdue days accumulate, preserving customer goodwill early and escalating firmly when accounts become delinquent.
            </p>
          </div>

          {/* Interactive Horizontal Stage Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mb-8">
            {DUNNING_STAGES.map((s) => {
              const isActive = s.id === activeStageId;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveStageId(s.id)}
                  className={`text-left p-3.5 rounded-xl transition-all border ${
                    isActive
                      ? "bg-white/[0.08] border-white/30 shadow-md"
                      : "bg-[#0e0f11] border-white/[0.08] hover:border-white/[0.16] hover:bg-white/[0.02]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-mono text-zinc-400 font-semibold">STAGE {s.stageNumber}</span>
                    <span className="text-[11px] font-mono text-zinc-400">{s.timing.split(" ")[0]}</span>
                  </div>
                  <div className="text-sm font-bold text-white truncate">{s.title}</div>
                  <div className="text-xs text-zinc-400 mt-1 truncate">{s.tone}</div>
                </button>
              );
            })}
          </div>

          {/* Active Stage Deep-Dive Split */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[#0e0f11] border border-white/[0.08] grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Stage Strategic Context (5 cols) */}
            <div className="lg:col-span-5 space-y-5">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-1">
                  {activeStage.timing} · {activeStage.tone}
                </span>
                <h3 className="text-2xl font-bold text-white tracking-tight">{activeStage.title}</h3>
                <p className="text-sm text-zinc-300 mt-2.5 leading-relaxed">{activeStage.description}</p>
              </div>

              <div className="pt-4 border-t border-white/[0.06] space-y-1.5">
                <span className="text-xs font-mono uppercase text-zinc-400 font-semibold block">
                  Debtor Psychology &amp; Timing Logic:
                </span>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">{activeStage.psychology}</p>
              </div>

              <div className="pt-4 border-t border-white/[0.06] flex items-start gap-2.5 text-xs text-[#b7d2f8]">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Guardrail: {activeStage.guardrail}</span>
              </div>
            </div>

            {/* Stage Live AI Communication Preview (7 cols) */}
            <div className="lg:col-span-7 lg:border-l lg:border-white/[0.08] lg:pl-8 space-y-3">
              <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#b7d2f8]" />
                  <span>Autonomous Communication Draft</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const toLine = `To: ${activeStage.to || "sarah.finance@clientdomain.com"}\n`;
                    const ccLine = activeStage.cc ? `Cc: ${activeStage.cc}\n` : "";
                    handleCopy(`Subject: ${activeStage.subject}\n${toLine}${ccLine}\n${activeStage.sample}`);
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 text-[11px] font-mono transition-colors"
                >
                  {copiedStage ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-zinc-400" />
                      <span>Copy Template</span>
                    </>
                  )}
                </button>
              </div>

              <div className="border border-white/[0.08] rounded-xl bg-black/50 p-4 sm:p-5 space-y-3 shadow-inner">
                {/* Email Client Metadata Header */}
                <div className="space-y-1.5 pb-3 border-b border-white/[0.08] text-[11px] font-mono text-zinc-400">
                  <div className="flex items-start gap-2">
                    <span className="text-zinc-500 w-14 shrink-0 pt-0.5">Subject:</span>
                    <span className="text-zinc-100 font-semibold text-xs leading-snug break-words">{activeStage.subject}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-zinc-500 w-14 shrink-0 pt-0.5">To:</span>
                    <span className="text-zinc-300 break-words">{activeStage.to || "sarah.finance@clientdomain.com"}</span>
                  </div>
                  {activeStage.cc && (
                    <div className="flex items-start gap-2">
                      <span className="text-zinc-500 w-14 shrink-0 pt-0.5">Cc:</span>
                      <span className="text-[#b7d2f8]/90 break-words">{activeStage.cc}</span>
                    </div>
                  )}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-500 w-14 shrink-0">Sender:</span>
                      <span className="text-zinc-300">billing@yourcompany.com (via Jaktra)</span>
                    </div>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                      DKIM &amp; TLS 1.3 Verified
                    </span>
                  </div>
                </div>

                {/* Email Body Content */}
                <div className="py-0.5">
                  <div className="text-[12px] sm:text-[12.5px] text-zinc-300 leading-relaxed font-sans whitespace-pre-line selection:bg-[#b7d2f8]/20">
                    {activeStage.sample}
                  </div>
                </div>

                {/* Simulated Debtor Action Link */}
                <div className="pt-3 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400">
                    <Lock className="w-3 h-3 text-[#b7d2f8] shrink-0" />
                    <span>Cryptographic token valid for 7 days</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-100 text-zinc-950 font-semibold text-[11px] sm:text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer shrink-0">
                    <span>{activeStage.actionPrompt}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Empirical Benchmarks & Root Cause Decomposition */}
        <section id="benchmarks" className="border-t border-white/[0.08] pt-16 pb-16">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono uppercase tracking-widest text-zinc-400 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#b7d2f8] shadow-[0_0_6px_rgba(183,210,248,0.6)]" />
                Empirical Industry Data
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-[1.2]">
                The Macro Anatomy of Overdue B2B SaaS ARR
              </h2>
            </div>
            <p className="text-sm sm:text-base text-zinc-400 max-w-md leading-relaxed lg:pb-1">
              Data across enterprise software billing indicates that over 85% of delinquent accounts are willing to pay, but stalled by administrative breakdowns rather than insolvency.
            </p>
          </div>

          {/* 3 Macro Benchmarks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-white/[0.01] backdrop-blur-md relative overflow-hidden">
              <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-3 flex items-center justify-between">
                <span>DSO Velocity Benchmark</span>
                <span className="text-[#b7d2f8] bg-[#b7d2f8]/10 px-2 py-0.5 rounded border border-[#b7d2f8]/20">Mid-Market / Ent</span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
                54 Days
              </div>
              <p className="text-xs sm:text-[13px] text-zinc-300 leading-relaxed mb-4">
                Median Days Sales Outstanding across growth B2B SaaS companies. Top quartile operators utilizing autonomous billing buffers compress DSO to 32 days.
              </p>
              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-400 font-mono">
                <span>Target Compression:</span>
                <span className="text-emerald-400 font-bold">-22 Days Speedup</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-white/[0.01] backdrop-blur-md relative overflow-hidden">
              <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-3 flex items-center justify-between">
                <span>Operational Root Cause</span>
                <span className="text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">Process Drag</span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
                88%
              </div>
              <p className="text-xs sm:text-[13px] text-zinc-300 leading-relaxed mb-4">
                Of invoice delays stem from administrative friction: missing PO numbers (41%), unverified seat allocation true-ups (29%), or expired corporate cards on file (18%).
              </p>
              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-400 font-mono">
                <span>Insolvency Share:</span>
                <span className="text-zinc-300 font-bold">&lt; 12% Real Default</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-white/[0.01] backdrop-blur-md relative overflow-hidden">
              <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-3 flex items-center justify-between">
                <span>Net Retention Drag</span>
                <span className="text-rose-400 bg-rose-400/10 px-2 py-0.5 rounded border border-rose-400/20">NRR Hazard</span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
                31%
              </div>
              <p className="text-xs sm:text-[13px] text-zinc-300 leading-relaxed mb-4">
                Of total annual SaaS subscriber churn is involuntary. Rigid dunning robots damage executive relationships right before critical contract renewal conversations.
              </p>
              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-400 font-mono">
                <span>Preservation Upside:</span>
                <span className="text-[#b7d2f8] font-bold">+4.8% NRR Boost</span>
              </div>
            </div>
          </div>
        </section>

        {/* Strategic Operating Model Matrix */}
        <section id="comparison-matrix" className="border-t border-white/[0.08] pt-16 pb-16">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono uppercase tracking-widest text-zinc-400 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
                Operating Model Comparison
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-[1.2]">
                Traditional Dunning vs. Manual Chasing vs. Jaktra
              </h2>
            </div>
            <p className="text-sm sm:text-base text-zinc-400 max-w-md leading-relaxed lg:pb-1">
              Compare how different approaches handle the delicate tension between collecting overdue ARR and protecting multi-year renewal relationships.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#0e0f11] shadow-xl">
            <table className="w-full text-left text-sm border-collapse min-w-[720px]">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                  <th className="py-4 px-5 font-mono text-xs uppercase tracking-wider text-zinc-400 w-1/4">Workflow Dimension</th>
                  <th className="py-4 px-5 font-mono text-xs uppercase tracking-wider text-zinc-400 w-1/4">Legacy Billing Dunning</th>
                  <th className="py-4 px-5 font-mono text-xs uppercase tracking-wider text-zinc-400 w-1/4">Manual Sales / CS Chasing</th>
                  <th className="py-4 px-5 font-mono text-xs uppercase tracking-wider text-[#b7d2f8] bg-[#b7d2f8]/5 w-1/4">Jaktra Autonomous AR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-xs sm:text-[13px]">
                <tr className="hover:bg-white/[0.015] transition-colors">
                  <td className="py-4 px-5 font-semibold text-white">Client Executive Goodwill</td>
                  <td className="py-4 px-5 text-zinc-400 leading-relaxed">Robotic reminder drips land in spam or alienate VP-level buyers.</td>
                  <td className="py-4 px-5 text-zinc-400 leading-relaxed">AEs and CSMs act as awkward bill collectors, burning expansion trust.</td>
                  <td className="py-4 px-5 text-white bg-[#b7d2f8]/5 font-medium leading-relaxed">Objective finance buffer; tone escalates through 5 human-grade stages.</td>
                </tr>
                <tr className="hover:bg-white/[0.015] transition-colors">
                  <td className="py-4 px-5 font-semibold text-white">Dispute &amp; True-up Triage</td>
                  <td className="py-4 px-5 text-zinc-400 leading-relaxed">Ignores inbound replies; robot continues sending overdue warnings.</td>
                  <td className="py-4 px-5 text-zinc-400 leading-relaxed">Disputes stall in shared inboxes; weeks lost before finance reviews.</td>
                  <td className="py-4 px-5 text-white bg-[#b7d2f8]/5 font-medium leading-relaxed">NLP detects seat/usage inquiries, auto-freezes dunning, routes 2-hour audit.</td>
                </tr>
                <tr className="hover:bg-white/[0.015] transition-colors">
                  <td className="py-4 px-5 font-semibold text-white">Debtor Payment Friction</td>
                  <td className="py-4 px-5 text-zinc-400 leading-relaxed">Complex portals requiring forgotten passwords and mandatory 2FA.</td>
                  <td className="py-4 px-5 text-zinc-400 leading-relaxed">Static PDF attachments requiring manual offline wire or paper check.</td>
                  <td className="py-4 px-5 text-white bg-[#b7d2f8]/5 font-medium leading-relaxed">Zero-login tokenized link; AP verifies and settles via ACH/Card in 30s.</td>
                </tr>
                <tr className="hover:bg-white/[0.015] transition-colors">
                  <td className="py-4 px-5 font-semibold text-white">Pre-Renewal Transparency</td>
                  <td className="py-4 px-5 text-zinc-400 leading-relaxed">Zero CRM sync; reps blindsided by account freezes during renewal calls.</td>
                  <td className="py-4 px-5 text-zinc-400 leading-relaxed">Scattered spreadsheet notes updated intermittently by finance.</td>
                  <td className="py-4 px-5 text-white bg-[#b7d2f8]/5 font-medium leading-relaxed">Bi-directional CRM sync; reps view live payment logs before every QBR.</td>
                </tr>
                <tr className="hover:bg-white/[0.015] transition-colors">
                  <td className="py-4 px-5 font-semibold text-white">Flexible Installment Options</td>
                  <td className="py-4 px-5 text-zinc-400 leading-relaxed">Binary all-or-nothing; accounts face abrupt workspace suspension.</td>
                  <td className="py-4 px-5 text-zinc-400 leading-relaxed">Requires manual legal addendum and custom invoicing setup.</td>
                  <td className="py-4 px-5 text-white bg-[#b7d2f8]/5 font-medium leading-relaxed">Self-serve 2x–4x automated payment schedules directly in debtor portal.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Billing Stack & Ecosystem Architecture */}
        <section id="integrations" className="border-t border-white/[0.08] pt-16 pb-16">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono uppercase tracking-widest text-zinc-400 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_6px_rgba(192,132,252,0.6)]" />
                Technical Interoperability
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-[1.2]">
                Plugs Directly into Your Modern SaaS Revenue Stack
              </h2>
            </div>
            <p className="text-sm sm:text-base text-zinc-400 max-w-md leading-relaxed lg:pb-1">
              Zero engineering required. Jaktra operates as an autonomous operational layer on top of your existing billing engines and general ledgers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-white/[0.01] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8] mb-4">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-1.5">Billing Engines</h3>
                <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                  Real-time invoice webhooks sync open receivables instantly, halting dunning the moment payment clears.
                </p>
              </div>
              <div className="pt-3 border-t border-white/[0.06] flex flex-wrap gap-1.5 text-[11px] font-mono text-zinc-300">
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">Stripe</span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">Chargebee</span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">Zuora</span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">Recurly</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-white/[0.01] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8] mb-4">
                  <Database className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-1.5">General Ledgers</h3>
                <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                  Bi-directional ledger synchronization reconciles cash receipts, aging buckets, and journal write-backs.
                </p>
              </div>
              <div className="pt-3 border-t border-white/[0.06] flex flex-wrap gap-1.5 text-[11px] font-mono text-zinc-300">
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">NetSuite</span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">QuickBooks</span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">Xero</span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">Intacct</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-white/[0.01] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8] mb-4">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-1.5">CRM &amp; RevOps</h3>
                <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                  Surfaces delinquent status on Salesforce and HubSpot records so reps are informed before client calls.
                </p>
              </div>
              <div className="pt-3 border-t border-white/[0.06] flex flex-wrap gap-1.5 text-[11px] font-mono text-zinc-300">
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">Salesforce</span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">HubSpot</span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">Gainsight</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-white/[0.01] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8] mb-4">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-1.5">Settlement Rails</h3>
                <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                  Cryptographic debtor portal enables one-click payment settlement with zero passwords or account creation.
                </p>
              </div>
              <div className="pt-3 border-t border-white/[0.06] flex flex-wrap gap-1.5 text-[11px] font-mono text-zinc-300">
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">ACH / Nacha</span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">Plaid</span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">Fedwire</span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">SEPA Core</span>
              </div>
            </div>
          </div>
        </section>

        {/* Operational Rollout SOP */}
        <section id="implementation" className="border-t border-white/[0.08] pt-16 pb-16">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono uppercase tracking-widest text-zinc-400 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.6)]" />
                Operational Blueprint
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-[1.2]">
                Standard Operating Procedure: Deploying in Under 48 Hours
              </h2>
            </div>
            <p className="text-sm sm:text-base text-zinc-400 max-w-md leading-relaxed lg:pb-1">
              Transition from manual receivables chaos to autonomous execution without engineering overhead or workflow disruption.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="relative p-6 rounded-2xl border border-white/[0.08] bg-[#0e0f11] flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-[#b7d2f8] block mb-2">PHASE 01 · DAY 1</span>
                <h3 className="text-base font-bold text-white mb-2">Ledger Ingestion &amp; Audit</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Connect your accounting ledger or upload an aging CSV in 5 minutes. Jaktra analyzes past-due balances, historical payment velocity, and flags high-risk accounts.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-white/[0.06] text-[11px] text-zinc-400 font-mono">
                ✓ 0 Engineering Hours
              </div>
            </div>

            <div className="relative p-6 rounded-2xl border border-white/[0.08] bg-[#0e0f11] flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-[#b7d2f8] block mb-2">PHASE 02 · DAY 2</span>
                <h3 className="text-base font-bold text-white mb-2">AP Entity Mapping</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Autonomous discovery separates operational AP desks from executive sponsors, ensuring pre-due notices go to finance while executive escalation targets signatories.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-white/[0.06] text-[11px] text-zinc-400 font-mono">
                ✓ Auto-Discovered Inboxes
              </div>
            </div>

            <div className="relative p-6 rounded-2xl border border-white/[0.08] bg-[#0e0f11] flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-[#b7d2f8] block mb-2">PHASE 03 · DAY 2</span>
                <h3 className="text-base font-bold text-white mb-2">Guardrail Calibration</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Set contact spacing (e.g. 20-hour minimum anti-spam barrier), whitelist key enterprise VIPs for custom review, and define automated 2x installment thresholds.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-white/[0.06] text-[11px] text-zinc-400 font-mono">
                ✓ Whitelist &amp; VIP Control
              </div>
            </div>

            <div className="relative p-6 rounded-2xl border border-white/[0.08] bg-[#0e0f11] flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-[#b7d2f8] block mb-2">PHASE 04 · DAY 3+</span>
                <h3 className="text-base font-bold text-white mb-2">Autonomous Autopilot</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Multi-tier cadences deploy autonomously. NLP triage pauses sequences upon inbound queries, while resolved settlements auto-sync to your accounting books.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-white/[0.06] text-[11px] text-zinc-400 font-mono">
                ✓ Closed-Loop Reconciliation
              </div>
            </div>
          </div>
        </section>

        {/* FAQs: Full-Width Open Split Architecture */}
        <section id="faqs" className="border-t border-white/[0.08] pt-16 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-4 space-y-4">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-1">
                SaaS AR FAQs
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Frequently Asked Questions for B2B SaaS
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Clear answers on protecting client renewals, resolving seat disputes, and importing ledgers from Stripe, QuickBooks, or Xero.
              </p>
              <div className="pt-2">
                <Link
                  to="/features/dispute-triage"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[#b7d2f8] hover:text-white transition-colors"
                >
                  Explore AI Dispute Triage Details <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-8 lg:border-l lg:border-white/[0.08] lg:pl-8">
              <Accordion type="single" variant="outline" defaultValue="faq-0" collapsible className="w-full">
                {FAQS.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`} className="border-b border-white/[0.08] py-2">
                    <AccordionTrigger className="text-left font-semibold text-white text-base hover:no-underline hover:text-[#b7d2f8] transition-colors py-3">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-zinc-300 text-sm leading-relaxed pb-4">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* Related Industry Playbooks: Topic Cluster */}
        <section id="other-playbooks" className="border-t border-white/[0.08] pt-16 pb-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-1">
                Industry Topic Cluster
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Explore More Accounts Receivable Playbooks
              </h2>
            </div>
            <Link
              to="/use-cases"
              className="text-xs font-semibold text-[#b7d2f8] hover:text-white transition-colors flex items-center gap-1"
            >
              <span>View All 8 Playbooks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {RELATED_PLAYBOOKS.map((pb) => {
              const Icon = pb.icon;
              return (
                <Link
                  key={pb.id}
                  to={pb.url}
                  className="p-4 rounded-xl bg-[#0e0f11] border border-white/[0.08] hover:border-white/[0.18] transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8] mb-3">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-white group-hover:text-[#b7d2f8] transition-colors mb-1">
                      {pb.name}
                    </h3>
                    <p className="text-xs text-zinc-500 font-mono">{pb.terms}</p>
                  </div>
                  <div className="pt-3 mt-3 border-t border-white/[0.04] flex items-center justify-between text-xs font-medium text-zinc-400 group-hover:text-white transition-colors">
                    <span>Read playbook</span>
                    <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Bottom Horizon CTA */}
        <section className="border border-white/[0.08] rounded-2xl bg-[#0e0f11] p-8 sm:p-12 text-center relative shadow-xl overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#b7d2f8]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl mx-auto space-y-4 relative z-10">
            <span className="text-xs font-mono uppercase tracking-wider text-[#b7d2f8] font-semibold block">
              Zero Risk · 100% Free During Early Access
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Reclaim Overdue ARR &amp; Protect Net Revenue Retention
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed">
              Import your receivables ledger via CSV or REST API in under 5 minutes. Stop losing days to awkward collection calls and release trapped working capital immediately.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
              <Link
                to="/register"
                className="w-full sm:w-auto px-7 py-3 rounded-lg bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-200 transition-colors shadow-sm"
              >
                Start Free Early Access
              </Link>
              <Link
                to="/compare"
                className="w-full sm:w-auto px-7 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white font-medium text-sm hover:bg-white/[0.08] transition-colors"
              >
                Compare Alternatives
              </Link>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}

export default SaasUseCase;

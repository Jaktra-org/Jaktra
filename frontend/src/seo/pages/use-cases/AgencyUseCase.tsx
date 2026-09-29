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
  Laptop,
  Briefcase,
  Factory,
  Truck,
  Boxes,
  UserCheck,
  HardHat,
  Database,
  Layers,
} from "lucide-react";
import { SEOHead } from "@/seo/components/SEOHead";
import { agencyUseCaseSchema, breadcrumbSchema } from "@/seo/schemas";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { GlobalNav } from "@/components/common/GlobalNav";

interface AgencyStageItem {
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

const AGENCY_STAGES: AgencyStageItem[] = [
  {
    id: "stage-1",
    stageNumber: "01",
    timing: "Day -3 Pre-Due",
    title: "Retainer Courtesy Check-in",
    tone: "Warm & Administrative",
    badge: "bg-white/[0.04] text-zinc-300 border-white/[0.08]",
    psychology:
      "Client marketing directors are busy planning campaigns, while their finance departments process invoices on fixed weekly check/ACH runs. Prompting 3 days ahead ensures the retainer is scheduled before the 1st of the month.",
    description:
      "Sends a courtesy verification 3 days before month-end with itemized retainer hours, approved deliverables summary, and zero-login ACH/card link.",
    subject: "Upcoming Retainer Courtesy: Apex Digital · Monthly Retainer #AG-8192 (Due Nov 1)",
    to: "alex.marketing@clientbrand.com (VP Marketing / Client Sponsor)",
    cc: "ap@clientbrand.com (Accounts Payable)",
    sample: `Hi Alex (cc: Accounts Payable),

Sharing a courtesy copy of invoice #AG-8192 ($12,500.00) for next month's creative retainer and ongoing campaign management, due this Friday, November 1.

• Statement Summary: SOW-2024-Q4 · 80 Dedicated Creative Hours + Ad Ops
• Attached: Approved deliverables log, itemized statement & verified ACH remittance details

If your accounts payable team requires a signed PO or internal approval confirmation before the weekly disbursement run, please reply directly to this thread and our operations desk will furnish it immediately. You can view the itemized invoice and verify scheduled remittance below:`,
    guardrail:
      "Polite, non-intrusive language; assumes oversight and guarantees clean delivery into client finance inboxes without spam triggers.",
    actionPrompt: "Verify Retainer & Confirm Remittance",
  },
  {
    id: "stage-2",
    stageNumber: "02",
    timing: "Day +3 Past Due",
    title: "Friendly Milestone Prompt",
    tone: "Collaborative & Service-Minded",
    badge: "bg-white/[0.04] text-zinc-300 border-white/[0.08]",
    psychology:
      "Most agency retainer delays at Day 3 stem from an expired corporate credit card on file, an AP person out on PTO, or a pending internal PO re-routing, not intentional default.",
    description:
      "Politely follows up after due date, offering a zero-login cryptographic payment portal link for corporate cards, ACH, or instant wire transfers.",
    subject: "Quick follow-up: Monthly Retainer #AG-8192 ($12,500.00)",
    to: "alex.marketing@clientbrand.com (VP Marketing)",
    cc: "ap@clientbrand.com (Accounts Payable)",
    sample: `Hi Alex,

Quick check-in regarding retainer invoice #AG-8192 ($12,500.00) for your creative workspace, which matured earlier this week on November 1.

We understand AP cycles can occasionally be delayed by card expiration or end-of-month batch scheduling. To ensure our design and performance teams remain fully allocated to your upcoming sprint deliverables without delay, could you confirm if this is queued for payment?

If you prefer to remit directly via corporate card or 1-click ACH without logging into a vendor portal, you can complete settlement here:`,
    guardrail:
      "Cryptographic debtor token link requires zero passwords. Protects agency account leads from having awkward money conversations.",
    actionPrompt: "Settle Retainer Invoice (1-Click)",
  },
  {
    id: "stage-3",
    stageNumber: "03",
    timing: "Day +14 Past Due",
    title: "Commercial AP Escalation",
    tone: "Objective & Commercial",
    badge: "bg-white/[0.04] text-zinc-300 border-white/[0.08]",
    psychology:
      "Invoices at 14 days overdue risk slipping into 60-day aging buckets unless escalated directly to the client's finance controller and procurement department.",
    description:
      "Escalates to the client's finance controller and AP team, referencing Master Services Agreement terms and requesting a firm disbursement date.",
    subject: "Payment Status Request: Retainer #AG-8192 is 14 days overdue ($12,500.00)",
    to: "ap@clientbrand.com (Accounts Payable), controller@clientbrand.com",
    cc: "alex.marketing@clientbrand.com (VP Marketing)",
    sample: `Attention Accounts Payable (cc: Alex),

We have not received remittance confirmation for creative retainer invoice #AG-8192 ($12,500.00), now 14 days overdue against agreed Net 15 terms under our Master Services Agreement.

To keep project velocity on track and avoid deliverable scheduling bottlenecks:
1. Could you confirm the scheduled payment date in your upcoming disbursement cycle?
2. If this payment is paused due to a deliverable or hours reconciliation inquiry, reply directly. Jaktra's dispute triage will automatically route the query to our client services director for instant review.

You can view the full ledger statement and authorize payment via corporate card or wire below:`,
    guardrail:
      "NLP DisputeSentinel automatically halts reminders if the client raises an out-of-scope question or hours discrepancy.",
    actionPrompt: "Confirm Remittance Date or Request Deliverable Audit",
  },
  {
    id: "stage-4",
    stageNumber: "04",
    timing: "Day +30 Past Due",
    title: "Executive Account Notice",
    tone: "Formal & Urgency-Driven",
    badge: "bg-white/[0.04] text-zinc-300 border-white/[0.08]",
    psychology:
      "At 30 days overdue, creative momentum and team allocation are at risk. Executive sponsors need transparent warning with structured installment flexibility to resolve the impasse.",
    description:
      "Informs executive sponsors (CMO/VP Marketing) and client CFO. Offers structured installment options for project milestone balances.",
    subject: "URGENT: Delinquent Retainer Notice & Milestone Options (#AG-8192)",
    to: "alex.marketing@clientbrand.com (VP Marketing), cfo@clientbrand.com",
    cc: "ap@clientbrand.com, leadership@apexagency.com",
    sample: `Dear Alex and Finance Leadership,

Retainer invoice #AG-8192 ($12,500.00) is now 30 days past due. Our design and media teams have continued campaign execution in good faith, but our credit governance policy requires immediate resolution of aged balances.

We want to preserve our creative partnership without disrupting active campaign performance. If your team is navigating short-term cash flow constraints, you can activate a structured 2-part milestone payment plan directly in our billing portal (50% today, 50% in 14 days).

Please select a settlement option below to keep your dedicated creative team active:`,
    guardrail:
      "Provides structured 2-tranche payment relief to avoid relationship friction while securing enforceable cash commitments.",
    actionPrompt: "Choose Settle Full or Activate 2-Part Installment Plan",
  },
  {
    id: "stage-5",
    stageNumber: "05",
    timing: "Day +45 Critical",
    title: "Deliverable & Media Pause Notice",
    tone: "Contractual Enforcement",
    badge: "bg-white/[0.04] text-zinc-300 border-white/[0.08]",
    psychology:
      "Agencies cannot finance client ad spend or payroll indefinitely. When an account hits 45 days past due, formal contract pause clauses must be invoked to protect agency solvency.",
    description:
      "Final formal compliance demand notifying executive sponsors of pending project work and live ad campaign freeze in 48 hours unless cured.",
    subject: "FINAL NOTICE: Creative Deliverables & Media Management Pause in 48 Hours (#AG-8192)",
    to: "alex.marketing@clientbrand.com, cfo@clientbrand.com, legal@clientbrand.com",
    cc: "managing-partner@apexagency.com",
    sample: `Dear Alex and Executive Leadership,

Despite multiple courtesy follow-ups, retainer balance #AG-8192 ($12,500.00) remains delinquent at 45 days past due.

In accordance with Section 4.2 of our Master Services Agreement, active creative production, sprint deliverables, and ad campaign management will be paused effective Thursday at 5:00 PM EST unless payment or a formal payment schedule is established.

To prevent service disruption and retain your dedicated creative staffing, please execute settlement immediately via the secure link below:`,
    guardrail:
      "Mandatory human-in-the-loop signoff required before triggering ad pauses or legal collections placement.",
    actionPrompt: "Remit Delinquent Balance to Maintain Active Service",
  },
];

const FAQS = [
  {
    q: "How does Jaktra prevent awkward payment conversations for creative and account directors?",
    a: "Agency founders and account leads should never have to chase overdue retainers—it destroys creative collaboration and weakens leverage during contract expansions. Jaktra acts as an autonomous, objective finance department: early communications are polite, administrative, and assume oversight, allowing your client leads to focus 100% on strategy and campaign delivery.",
  },
  {
    q: "What happens when an agency client disputes out-of-scope billable hours or revisions?",
    a: "If a client replies stating that certain hours were out of scope or revisions exceeded the project quote, Jaktra's NLP DisputeSentinel immediately flags the email, halts all automated collection messages, and generates a pre-drafted briefing citing approved SOWs, PO numbers, and milestone deliverables for your operations director to review.",
  },
  {
    q: "How does Jaktra protect agencies from financing client media and ad spend out of pocket?",
    a: "Many performance marketing agencies float Google and Meta ad spend on corporate credit cards. If a client delays paying their media invoice, the agency faces crippling cash crunches. Jaktra prioritizes media pass-through invoices with automated pre-due verification and rapid escalation cadences so you never bankroll client ad budgets.",
  },
  {
    q: "How quickly can a digital agency integrate Jaktra with its accounting software?",
    a: "In under 5 minutes. You can import your open invoice ledger via universal CSV export or sync via REST API from QuickBooks Online, Xero, Stripe, FreshBooks, or Harvest. Jaktra automatically extracts retainer balances, client billing emails, and due dates with zero manual re-entry.",
  },
  {
    q: "Can client AP departments pay via ACH, Wire, or Credit Card without creating an account?",
    a: "Yes. Every reminder includes a cryptographic, zero-login link (/i/:token). Your client views the itemized statement and completes payment via corporate card, ACH, or instant wire in 30 seconds with no password required.",
  },
  {
    q: "Can we offer split installments for large brand identity or website redesign projects?",
    a: "Yes. For milestone-based project deliverables ($25k–$100k+), Jaktra allows clients to activate 2x or 3x milestone installment schedules directly inside their secure debtor portal. Once activated, automated cadences transition to monitoring the agreed installment dates.",
  },
];

const RELATED_PLAYBOOKS = [
  {
    id: "saas",
    name: "B2B SaaS & Subscriptions",
    terms: "Net 30 / Annual Contracts",
    url: "/use-cases/saas",
    icon: Laptop,
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

export function AgencyUseCase() {
  const [activeStageId, setActiveStageId] = useState<string>("stage-1");
  const [copiedStage, setCopiedStage] = useState<boolean>(false);

  const activeStage = AGENCY_STAGES.find((s) => s.id === activeStageId) || AGENCY_STAGES[0];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStage(true);
    setTimeout(() => setCopiedStage(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#010102] text-[#f7f8f8] font-sans antialiased selection:bg-[#5e6ad2]/30 selection:text-white">
      <SEOHead
        title="How Agencies Collect Client Retainers on Time — Jaktra"
        description="Stop awkward client chasing and protect ad spend. Discover how creative and digital agencies automate retainer collections and milestone payments on time."
        canonicalPath="/use-cases/agencies"
        jsonLd={[
          agencyUseCaseSchema,
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Industry Solutions", path: "/use-cases" },
            { name: "Agency Cash Flow Playbook", path: "/use-cases/agencies" },
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
            Agency Cash Flow Playbook
          </span>
        </nav>

        {/* Hero Section: Editorial & Strategic Focus */}
        <header className="mb-14 max-w-5xl">
          <h1 className="text-3xl sm:text-4xl lg:text-[40px] xl:text-[46px] font-extrabold tracking-tight text-white leading-[1.18] mb-5">
            <span className="block">The Agency Cash Flow Playbook:</span>
            <span className="block">Eliminate Retainer Chasing &amp; Protect Ad Spend</span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-300 leading-relaxed mb-6 max-w-3xl">
            Stop forcing account directors and creative leads to make awkward payment calls while pitching project expansions. Discover how an autonomous, objective finance buffer recovers overdue retainers, eliminates pass-through media float, and preserves client rapport.
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
            <span className="text-zinc-400 hidden sm:inline">For Agency Owners, MDs &amp; Finance Directors</span>
          </div>
        </header>

        {/* Capability Architecture Ribbon */}
        <section id="capabilities" className="mb-12">
          <div className="relative rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-white/[0.01] backdrop-blur-md overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.36)]">
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
                  Modulates from friendly retainer check-in to formal deliverable pause notices.
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
                  Cryptographic 1-click tokenized payment portal for corporate cards and ACH wires.
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
                  NLP identifies out-of-scope complaints and alerts account leads instantly.
                </p>
                <div className="pt-3 border-t border-white/[0.05] flex items-center gap-2 text-[11px] text-zinc-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
                  <span>Scope Dispute Triage</span>
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
                  Universal CSV or direct API sync with QuickBooks, Xero, Stripe, or Harvest.
                </p>
                <div className="pt-3 border-t border-white/[0.05] flex items-center gap-2 text-[11px] text-zinc-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#b7d2f8] shrink-0 shadow-[0_0_6px_rgba(183,210,248,0.6)]" />
                  <span>Universal Ledger Sync</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3 Core Agency Dilemmas: Operational Breakdown */}
        <section id="dilemmas" className="border-t border-white/[0.08] pt-16 pb-16">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono uppercase tracking-widest text-zinc-400 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shadow-[0_0_6px_rgba(244,63,94,0.6)]" />
                Operational Breakdown
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-[1.2]">
                Why Agency Cash Flow Breaches Happen
              </h2>
            </div>
            <p className="text-sm sm:text-base text-zinc-400 max-w-md leading-relaxed lg:pb-1">
              Creative teams hate having awkward collection calls with clients. Here is how Jaktra eliminates collection friction without damaging client rapport.
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
                  Relationship Friction
                </span>
                <h3 className="text-xl font-bold tracking-tight text-white mb-3 group-hover:text-[#b7d2f8] transition-colors">
                  Insulating Account Leads
                </h3>
                <p className="text-xs sm:text-[13px] text-zinc-400 leading-relaxed mb-6">
                  When account leads and creative directors are forced to chase overdue retainer checks, it destroys collaborative rapport and weakens leverage during contract renewals.
                </p>
              </div>

              <div className="pt-4 border-t border-white/[0.06]">
                <div className="rounded-xl p-4 bg-black/40 border border-white/[0.06] group-hover:border-[#b7d2f8]/20 transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#b7d2f8] shadow-[0_0_6px_rgba(183,210,248,0.8)]" />
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#b7d2f8] font-bold">
                      Autonomous Resolution
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Acts as an objective, polite third-party billing buffer, allowing account directors to focus 100% on creative execution and relationship expansion.
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
                  Cash Drag
                </span>
                <h3 className="text-xl font-bold tracking-tight text-white mb-3 group-hover:text-[#b7d2f8] transition-colors">
                  Out-of-Pocket Ad Spend Float
                </h3>
                <p className="text-xs sm:text-[13px] text-zinc-400 leading-relaxed mb-6">
                  Floating client Google and Meta ad spend on corporate credit cards places intense strain on agency cash flow if client reimbursement lags by even a single week.
                </p>
              </div>

              <div className="pt-4 border-t border-white/[0.06]">
                <div className="rounded-xl p-4 bg-black/40 border border-white/[0.06] group-hover:border-[#b7d2f8]/20 transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#b7d2f8] shadow-[0_0_6px_rgba(183,210,248,0.8)]" />
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#b7d2f8] font-bold">
                      Autonomous Resolution
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Prioritizes media pass-through invoices with automated pre-due verification notices so you never bankroll client ad budgets out of pocket.
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
                  Scope Creep
                </span>
                <h3 className="text-xl font-bold tracking-tight text-white mb-3 group-hover:text-[#b7d2f8] transition-colors">
                  Unapproved Scope Disputes
                </h3>
                <p className="text-xs sm:text-[13px] text-zinc-400 leading-relaxed mb-6">
                  Clients frequently stall entire retainer payments because of minor questions regarding additional revision rounds or out-of-scope deliverable hours.
                </p>
              </div>

              <div className="pt-4 border-t border-white/[0.06]">
                <div className="rounded-xl p-4 bg-black/40 border border-white/[0.06] group-hover:border-[#b7d2f8]/20 transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#b7d2f8] shadow-[0_0_6px_rgba(183,210,248,0.8)]" />
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#b7d2f8] font-bold">
                      Autonomous Resolution
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Detects scope pushback via NLP, pauses automated dunning immediately, and routes a pre-drafted SOW audit to your operations lead.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5-Stage Agency Retainer Cadence */}
        <section id="cadence" className="border-t border-white/[0.08] pt-16 pb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-2">
                Escalation Blueprint
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                The 5-Stage Agency Retainer Cadence
              </h2>
            </div>
            <p className="text-sm text-zinc-400 max-w-xl leading-relaxed">
              Progressive communication that protects client rapport during early stages and escalates firmly when invoices approach default.
            </p>
          </div>

          {/* Interactive Horizontal Stage Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mb-8">
            {AGENCY_STAGES.map((s) => {
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
            {/* Strategic Context (5 cols) */}
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

            {/* AI Communication Preview (7 cols) */}
            <div className="lg:col-span-7 lg:border-l lg:border-white/[0.08] lg:pl-8 space-y-3">
              <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#b7d2f8]" />
                  <span>Autonomous Communication Draft</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const toLine = `To: ${activeStage.to || "alex.marketing@clientbrand.com"}\n`;
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
                    <span className="text-zinc-300 break-words">{activeStage.to || "alex.marketing@clientbrand.com"}</span>
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
                      <span className="text-zinc-300">finance@apexdigital.com (via Jaktra)</span>
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
                The Macro Anatomy of Agency Cash Flow Delays
              </h2>
            </div>
            <p className="text-sm sm:text-base text-zinc-400 max-w-md leading-relaxed lg:pb-1">
              Data across creative, performance marketing, and branding firms shows that over 80% of overdue balances stem from client AP bureaucracy rather than client insolvency.
            </p>
          </div>

          {/* 3 Macro Benchmarks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-white/[0.01] backdrop-blur-md relative overflow-hidden">
              <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-3 flex items-center justify-between">
                <span>DSO Velocity Benchmark</span>
                <span className="text-[#b7d2f8] bg-[#b7d2f8]/10 px-2 py-0.5 rounded border border-[#b7d2f8]/20">Agency Sector</span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
                62 Days
              </div>
              <p className="text-xs sm:text-[13px] text-zinc-300 leading-relaxed mb-4">
                Median Days Sales Outstanding across independent digital agencies. Firms with autonomous billing buffers compress DSO to 28 days.
              </p>
              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-400 font-mono">
                <span>Target Compression:</span>
                <span className="text-emerald-400 font-bold">-34 Days Speedup</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-white/[0.01] backdrop-blur-md relative overflow-hidden">
              <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-3 flex items-center justify-between">
                <span>Operational Root Cause</span>
                <span className="text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">Clerical Friction</span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
                84%
              </div>
              <p className="text-xs sm:text-[13px] text-zinc-300 leading-relaxed mb-4">
                Of payment stalls are clerical: client AP missing PO match (42%), internal approvals delayed (26%), or out-of-scope revision questions (16%).
              </p>
              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-400 font-mono">
                <span>Insolvency Share:</span>
                <span className="text-zinc-300 font-bold">&lt; 8% True Default</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-white/[0.01] backdrop-blur-md relative overflow-hidden">
              <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-3 flex items-center justify-between">
                <span>Ad Spend Float Hazard</span>
                <span className="text-rose-400 bg-rose-400/10 px-2 py-0.5 rounded border border-rose-400/20">Working Capital Drain</span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
                26%
              </div>
              <p className="text-xs sm:text-[13px] text-zinc-300 leading-relaxed mb-4">
                Of total agency working capital is locked in floating Google and Meta ad spend on agency cards, triggering recurring monthly payroll anxiety.
              </p>
              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-400 font-mono">
                <span>Protection Upside:</span>
                <span className="text-[#b7d2f8] font-bold">100% Pre-funded Media</span>
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
                Manual Partner Chasing vs. Fragmented Invoicing vs. Jaktra
              </h2>
            </div>
            <p className="text-sm sm:text-base text-zinc-400 max-w-md leading-relaxed lg:pb-1">
              Compare how each operating model handles the delicate tension between collecting overdue retainers and protecting long-term creative collaboration.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#0e0f11] shadow-xl">
            <table className="w-full text-left text-sm border-collapse min-w-[720px]">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                  <th className="py-4 px-5 font-mono text-xs uppercase tracking-wider text-zinc-400 w-1/4">Workflow Dimension</th>
                  <th className="py-4 px-5 font-mono text-xs uppercase tracking-wider text-zinc-400 w-1/4">Legacy Invoicing Emails</th>
                  <th className="py-4 px-5 font-mono text-xs uppercase tracking-wider text-zinc-400 w-1/4">Account Director Chasing</th>
                  <th className="py-4 px-5 font-mono text-xs uppercase tracking-wider text-[#b7d2f8] bg-[#b7d2f8]/5 w-1/4">Jaktra Autonomous AR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-xs sm:text-[13px]">
                <tr className="hover:bg-white/[0.015] transition-colors">
                  <td className="py-4 px-5 font-semibold text-white">Creative Director Goodwill</td>
                  <td className="py-4 px-5 text-zinc-400 leading-relaxed">Generic billing emails get ignored by client executives.</td>
                  <td className="py-4 px-5 text-zinc-400 leading-relaxed">Account leads act as awkward bill collectors, losing creative leverage.</td>
                  <td className="py-4 px-5 text-white bg-[#b7d2f8]/5 font-medium leading-relaxed">Objective finance buffer; tone escalates through 5 human-grade stages.</td>
                </tr>
                <tr className="hover:bg-white/[0.015] transition-colors">
                  <td className="py-4 px-5 font-semibold text-white">Ad Spend Float Protection</td>
                  <td className="py-4 px-5 text-zinc-400 leading-relaxed">Treats media spend identically to regular Net 30 fees.</td>
                  <td className="py-4 px-5 text-zinc-400 leading-relaxed">Agency credit cards maxed out while waiting for reimbursement.</td>
                  <td className="py-4 px-5 text-white bg-[#b7d2f8]/5 font-medium leading-relaxed">Auto-prioritizes media invoices with rapid 3-day verification loops.</td>
                </tr>
                <tr className="hover:bg-white/[0.015] transition-colors">
                  <td className="py-4 px-5 font-semibold text-white">Scope &amp; Revision Triage</td>
                  <td className="py-4 px-5 text-zinc-400 leading-relaxed">Ignores inbound replies; robot continues sending overdue warnings.</td>
                  <td className="py-4 px-5 text-zinc-400 leading-relaxed">Disputes sit unresolved in client inboxes for weeks without escalation.</td>
                  <td className="py-4 px-5 text-white bg-[#b7d2f8]/5 font-medium leading-relaxed">NLP detects revision pushback, pauses cadence, routes SOW review.</td>
                </tr>
                <tr className="hover:bg-white/[0.015] transition-colors">
                  <td className="py-4 px-5 font-semibold text-white">Debtor Payment Friction</td>
                  <td className="py-4 px-5 text-zinc-400 leading-relaxed">Requires client to login with passwords to complex accounting portals.</td>
                  <td className="py-4 px-5 text-zinc-400 leading-relaxed">Static PDF attachments requiring manual wire setup or paper check.</td>
                  <td className="py-4 px-5 text-white bg-[#b7d2f8]/5 font-medium leading-relaxed">Zero-login tokenized link; AP settles via Card or ACH in 30 seconds.</td>
                </tr>
                <tr className="hover:bg-white/[0.015] transition-colors">
                  <td className="py-4 px-5 font-semibold text-white">Installment Plan Flexibility</td>
                  <td className="py-4 px-5 text-zinc-400 leading-relaxed">Binary all-or-nothing; accounts face abrupt creative halts.</td>
                  <td className="py-4 px-5 text-zinc-400 leading-relaxed">Requires custom contract amendments and manual invoice re-creation.</td>
                  <td className="py-4 px-5 text-white bg-[#b7d2f8]/5 font-medium leading-relaxed">Self-serve 2x milestone split options built directly into the debtor portal.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Agency Stack & Ecosystem Architecture */}
        <section id="integrations" className="border-t border-white/[0.08] pt-16 pb-16">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono uppercase tracking-widest text-zinc-400 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_6px_rgba(192,132,252,0.6)]" />
                Technical Interoperability
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-[1.2]">
                Plugs Directly into Your Agency Operating Stack
              </h2>
            </div>
            <p className="text-sm sm:text-base text-zinc-400 max-w-md leading-relaxed lg:pb-1">
              Zero engineering required. Jaktra operates seamlessly alongside your time tracking tools, accounting ledgers, and payment gateways.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-white/[0.01] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8] mb-4">
                  <Database className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-1.5">Accounting Ledgers</h3>
                <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                  Real-time invoice synchronization reconciles monthly retainers, ad spend billings, and cash payments.
                </p>
              </div>
              <div className="pt-3 border-t border-white/[0.06] flex flex-wrap gap-1.5 text-[11px] font-mono text-zinc-300">
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">QuickBooks Online</span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">Xero</span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">FreshBooks</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-white/[0.01] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8] mb-4">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-1.5">Time &amp; Project Ops</h3>
                <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                  Syncs approved SOW hours and milestone deliverables directly to debtor communication records.
                </p>
              </div>
              <div className="pt-3 border-t border-white/[0.06] flex flex-wrap gap-1.5 text-[11px] font-mono text-zinc-300">
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">Harvest</span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">Toggl</span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">Monday.com</span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">ClickUp</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-white/[0.01] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8] mb-4">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-1.5">Card &amp; Bank Rails</h3>
                <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                  Empowers clients to settle instantly via ACH transfer, corporate credit cards, or direct bank wires.
                </p>
              </div>
              <div className="pt-3 border-t border-white/[0.06] flex flex-wrap gap-1.5 text-[11px] font-mono text-zinc-300">
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">Stripe</span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">Brex</span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">Ramp</span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">Plaid</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-white/[0.01] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8] mb-4">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-1.5">Client CRM</h3>
                <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                  Surfaces delinquent status on client records so account leads are briefed prior to renewal pitches.
                </p>
              </div>
              <div className="pt-3 border-t border-white/[0.06] flex flex-wrap gap-1.5 text-[11px] font-mono text-zinc-300">
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">HubSpot CRM</span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">Salesforce</span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">Pipedrive</span>
              </div>
            </div>
          </div>
        </section>

        {/* 4-Step Standard Operating Procedure */}
        <section id="implementation" className="border-t border-white/[0.08] pt-16 pb-16">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono uppercase tracking-widest text-zinc-400 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#b7d2f8] shadow-[0_0_6px_rgba(183,210,248,0.6)]" />
                Implementation Architecture
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-[1.2]">
                48-Hour Agency Deployment Playbook
              </h2>
            </div>
            <p className="text-sm sm:text-base text-zinc-400 max-w-md leading-relaxed lg:pb-1">
              Roll out autonomous retainer management without changing your existing creative workflow or re-training account managers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0e0f11] relative">
              <span className="text-xs font-mono text-zinc-500 uppercase block mb-3">Step 01 · 5 Mins</span>
              <h3 className="text-base font-bold text-white mb-2">Ingest Open Retainers</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Connect your accounting ledger (QuickBooks, Xero, Harvest) or drop a universal CSV export to import all active client retainer schedules.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0e0f11] relative">
              <span className="text-xs font-mono text-zinc-500 uppercase block mb-3">Step 02 · 15 Mins</span>
              <h3 className="text-base font-bold text-white mb-2">Verify Agency Branding</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Configure your custom sending domain (billing@youragency.com) with automated DKIM, SPF, and DMARC alignment for high inbox delivery.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0e0f11] relative">
              <span className="text-xs font-mono text-zinc-500 uppercase block mb-3">Step 03 · 10 Mins</span>
              <h3 className="text-base font-bold text-white mb-2">Activate Scope Sentinel</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Establish automated dispute handling rules for hours variances and ad spend pass-throughs, ensuring client inquiries pause dunning instantly.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0e0f11] relative">
              <span className="text-xs font-mono text-zinc-500 uppercase block mb-3">Step 04 · Continuous</span>
              <h3 className="text-base font-bold text-white mb-2">Autonomously Reconcile</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Invoices match cash payments automatically as clients settle via 1-click tokenized links, pushing real-time journal entries back to your ledger.
              </p>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section id="faqs" className="border-t border-white/[0.08] pt-16 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-4 space-y-4">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-1">
                Agency AR FAQs
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Frequently Asked Questions for Agency Leaders
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                How Jaktra protects creative relationships, speeds up retainer payments, and handles client scope disputes.
              </p>
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
              Accelerate Retainer Cash Flow &amp; Protect Client Trust
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed">
              Import open invoices via CSV or API in 5 minutes. Stop losing days to awkward collection calls and release trapped working capital immediately.
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

export default AgencyUseCase;

import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ShieldCheck,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Mail,
  ChevronRight,
  Calendar,
  Clock,
  Copy,
  Check,
  Laptop,
  Building2,
  Briefcase,
  Truck,
  Boxes,
  UserCheck,
  HardHat,
  Database,
  Layers,
  FileCheck,
  Factory,
} from "lucide-react";
import { SEOHead } from "@/seo/components/SEOHead";
import { manufacturingUseCaseSchema, breadcrumbSchema } from "@/seo/schemas";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { GlobalNav } from "@/components/common/GlobalNav";

interface ManufacturingStageItem {
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

const MANUFACTURING_STAGES: ManufacturingStageItem[] = [
  {
    id: "stage-1",
    stageNumber: "01",
    timing: "Day -15 Pre-Due",
    title: "Pre-Due ERP Matching & GRN Audit",
    tone: "Courteous & Administrative",
    badge: "bg-white/[0.04] text-zinc-300 border-white/[0.08]",
    psychology:
      "Enterprise manufacturing AP departments execute scheduled bi-weekly disbursement batches. Catching missing PO numbers or receiving dock line mismatches 15 days ahead ensures payments aren't bumped into next month's queue.",
    description:
      "Proactively contacts client AP desks 15 days before Net 60/90 terms mature. Confirms that goods receipt notes (GRN), purchase orders, and delivery manifests match their ERP batch queue.",
    subject: "Pre-due ERP Matching: Apex Industrial Invoice #MFG-9102 (PO #450012) due in 15 days",
    to: "ap.disbursements@cliententerprise.com (Accounts Payable Desk)",
    cc: "procurement@cliententerprise.com (Purchasing Agent)",
    sample: `Attention Accounts Payable (cc: Purchasing),

Sharing a proactive verification copy of invoice #MFG-9102 ($48,500.00) for custom precision machining and tooling under PO #450012, due in 15 days on November 30 under Net 60 terms.

• Order Reference: PO #450012 · Line Items 01–08 (Heat-Treated Castings)
• Attached: Bill of Lading (BOL-88219), receiving dock packing list & certified material test reports (MTR)

To ensure uninterrupted inclusion in your upcoming bi-weekly disbursement run, please confirm that receiving dock Goods Receipt Notes (GRN) match your ERP 3-way matching queue. You can verify PO alignment and confirm scheduled payment date below:`,
    guardrail:
      "Attaches verified packing list, BOL receipt, and zero-login digital settlement link. Zero aggressive collection language.",
    actionPrompt: "Verify PO Matching & Confirm Scheduled Date",
  },
  {
    id: "stage-2",
    stageNumber: "02",
    timing: "Days 1–7 Overdue",
    title: "Dock Receiving & PO Variance Triage",
    tone: "Friendly & Solution-Oriented",
    badge: "bg-white/[0.04] text-zinc-300 border-white/[0.08]",
    psychology:
      "Over 60% of manufacturing invoice delays are clerical. Buyers delay payment not out of ill intent, but because AP cannot process an invoice with an unmatched receiving dock variance.",
    description:
      "When an industrial buyer states 'dock receiving pending sign-off' or 'line item unit variance', Jaktra's NLP DisputeSentinel classifies the ticket, freezes dunning, and isolates undisputed sums for immediate remittance.",
    subject: "Receiving Status & PO Line Verification: Invoice #MFG-9102 ($48,500.00)",
    to: "ap.disbursements@cliententerprise.com, receiving.dock@cliententerprise.com",
    cc: "procurement@cliententerprise.com",
    sample: `Hello Accounts Payable and Procurement Desk,

Checking in on invoice #MFG-9102 ($48,500.00) which matured earlier this week on November 30.

In industrial supply chains, invoice delays are frequently clerical—often a receiving dock log pending sign-off or an unmatched freight line item. If there is a dock variance or price discrepancy on specific lines, please submit the inquiry directly below. Jaktra's dispute triage will instantly isolate disputed lines, alert our shipping supervisor, and allow your AP team to remit the undisputed balance without delay:

Otherwise, you can confirm remittance via corporate ACH or instant wire here:`,
    guardrail:
      "Prompts buyer to remit undisputed line items while the variance is investigated. Automatically alerts shipping desk.",
    actionPrompt: "Isolate Discrepancy or Settle Undisputed Sum",
  },
  {
    id: "stage-3",
    stageNumber: "03",
    timing: "Days 8–20 Overdue",
    title: "Structured Multi-Tranche Installment Engine",
    tone: "Professional & Commercial",
    badge: "bg-white/[0.04] text-zinc-300 border-white/[0.08]",
    psychology:
      "Large industrial buyers often face temporary working capital lockup while capital machinery or raw materials are converted into finished goods. Offering structured installments turns default risk into guaranteed cash flow.",
    description:
      "For large capital machinery or bulk raw material orders ($50,000+), Jaktra enables structured milestone installment contracts directly inside the debtor portal without requiring custom legal addenda.",
    subject: "Commercial Status & Structured Remittance Options for Invoice #MFG-9102",
    to: "controller@cliententerprise.com, procurement.director@cliententerprise.com",
    cc: "ap.disbursements@cliententerprise.com",
    sample: `Dear Plant Controller and Procurement Leadership,

Invoice #MFG-9102 ($48,500.00) is now 20 days overdue against agreed Net 60 commercial terms.

We understand that fluctuating inventory cycles and work-in-progress capital can create short-term liquidity constraints. To prevent production bottlenecks and maintain uninterrupted component delivery for your manufacturing lines, our finance committee has authorized an automated 2-part or 3-part installment schedule (e.g., 50% upon execution, 50% in 15 days).

Please review and activate an approved payment schedule via the secure link below:`,
    guardrail:
      "Cadences switch exclusively to tracking upcoming installment due dates once agreed, preserving business continuity.",
    actionPrompt: "Review Structured 2x-3x Installment Schedule",
  },
  {
    id: "stage-4",
    stageNumber: "04",
    timing: "Days 21–30 Critical",
    title: "Procurement Credit Suspension Warning",
    tone: "Formal & High-Stakes",
    badge: "bg-white/[0.04] text-zinc-300 border-white/[0.08]",
    psychology:
      "When supplier credit is about to freeze manufacturing plant operations and stall OEM assembly lines, executive leadership takes immediate action to authorize disbursements.",
    description:
      "Escalates to senior procurement directors and the Chief Financial Officer. Formally outlines that future supply chain runs and raw material shipments will be placed on credit hold unless the past-due balance is cleared.",
    subject: "CREDIT NOTICE: Pending Production & Raw Material Hold for Account #MFG-204",
    to: "procurement.vp@cliententerprise.com, cfo@cliententerprise.com",
    cc: "plant.controller@cliententerprise.com, sales-director@apexindustrial.com",
    sample: `Formal Credit Notice: Account #MFG-204 is 30 days past due ($48,500.00).

Despite multiple collaborative check-ins, payment confirmation has not been received. In accordance with our master supply agreement, outstanding balances exceeding 30 days overdue trigger an automated credit limit freeze.

Please be advised that future fabrication runs, raw material allocations, and scheduled dock shipments will be placed on credit hold in 5 business days unless payment or an active installment plan is confirmed.

To clear the past-due balance and retain uninterrupted production priority, remit directly below:`,
    guardrail:
      "CCs designated enterprise sales and account directors to preserve commercial relationships and prevent sudden production shocks.",
    actionPrompt: "Clear Past-Due Balance to Retain Credit Terms",
  },
  {
    id: "stage-5",
    stageNumber: "05",
    timing: "Day 31+ Legal Halt",
    title: "Stage 5 Legal Stop & Executive Ledger Freeze",
    tone: "Final Demand / Certified Audit File Halt",
    badge: "bg-white/[0.04] text-zinc-300 border-white/[0.08]",
    psychology:
      "Prevents repetitive automated harassment that could prejudice legal enforcement or destroy multi-year corporate supplier agreements.",
    description:
      "Autonomous dunning halts completely. Compiles a certified audit trail—including stamped bills of lading, receiving dock signatures, PO receipts, and transcripts—ready for human credit committee or legal review.",
    subject: "FINAL NOTICE: Supply Agreement Credit Halt & Legal Review (#MFG-204)",
    to: "cfo@cliententerprise.com, legal-counsel@cliententerprise.com",
    cc: "executive-committee@apexindustrial.com",
    sample: `FINAL NOTICE: Account #MFG-204 has exceeded all commercial credit boundaries with an unresolved past-due balance of $48,500.00 at 45 days past due.

All autonomous communications have ceased. A certified digital audit trail—including stamped bills of lading, receiving dock signatures, purchase order acknowledgments, and communication logs—has been compiled for executive credit committee and legal counsel review.

To prevent formal third-party collection placement or legal supply agreement enforcement, execute an immediate digital cure via our verified corporate portal:`,
    guardrail:
      "100% human-in-the-loop signoff required before third-party placement or formal legal enforcement.",
    actionPrompt: "Immediate Digital Cure via Certified Portal",
  },
];

const FAQS = [
  {
    q: "How does Jaktra handle extended Net 60 and Net 90 payment terms?",
    a: "In long credit cycles, waiting until Day 61 to contact accounts payable creates massive working capital lag. Jaktra automates proactive, collaborative pre-due milestones (e.g., at Day 45 of a Net 60 term) to confirm invoice receipt, purchase order matching, and scheduled payment runs before the due date passes.",
  },
  {
    q: "What happens when a manufacturing buyer claims a missing PO or dock receiving delay?",
    a: "Over 60% of manufacturing invoice delays are clerical. Jaktra's NLP DisputeSentinel classifies incoming emails referencing 'missing PO', 'line item variance', or 'dock receipt pending'. It automatically halts collection cadences, isolates undisputed balances, and alerts your shipping team with an AI-drafted resolution response.",
  },
  {
    q: "Can manufacturing suppliers split large batch invoices into milestone installment plans?",
    a: "Yes. For capital machinery or bulk raw material orders, demanding full lump-sum payment when a buyer faces temporary liquidity constraints causes default. Jaktra enables structured installment schedules via zero-login tokenized debtor portals (/i/:token), monitoring upcoming installments through ActiveInstallmentContext.",
  },
  {
    q: "Does Jaktra replace enterprise ERPs like SAP, Oracle, or NetSuite?",
    a: "No. Jaktra does not replace back-office ERP ledgers, warehouse inventory EDI, or physical paper check lockboxes. Instead, Jaktra serves as an agile, autonomous execution agent: reading your receivables ledger, running 5-stage generative tone escalation, triaging disputes, and reconciling payments back to your records.",
  },
  {
    q: "How are high-value B2B transactions settled securely?",
    a: "Jaktra generates authenticated, tokenized debtor links where corporate buyers can pay via instant bank transfers (Fedwire, ACH, B2B wires) or corporate cards powered by live payment rails, with real-time webhook confirmation.",
  },
  {
    q: "How does Jaktra prevent annoying enterprise procurement buyers with spam?",
    a: "Industrial relationships rely on multi-year trust. Jaktra enforces a strict 20-hour rolling contact barrier preventing multi-contact spam, while Stage 5 Legal Stop automatically freezes automated messaging at 31+ days overdue, ensuring all communication remains measured, professional, and compliant.",
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
    id: "agencies",
    name: "Digital & Marketing Agencies",
    terms: "Net 30 / Monthly Retainers",
    url: "/use-cases/agencies",
    icon: Building2,
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

export function ManufacturingUseCase() {
  const [activeStageId, setActiveStageId] = useState<string>("stage-1");
  const [copiedStage, setCopiedStage] = useState<boolean>(false);

  const activeStage = MANUFACTURING_STAGES.find((s) => s.id === activeStageId) || MANUFACTURING_STAGES[0];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStage(true);
    setTimeout(() => setCopiedStage(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#010102] text-[#f7f8f8] font-sans antialiased selection:bg-[#5e6ad2]/30 selection:text-white">
      <SEOHead
        title="AI Accounts Receivable for Manufacturing — Jaktra"
        description="Accelerate industrial supply chain cash flow. Resolve PO matching disputes, manage Net 60/90 terms, and cut receivables drag with Jaktra's AI AR agent."
        canonicalPath="/use-cases/manufacturing"
        jsonLd={[
          manufacturingUseCaseSchema,
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Industry Solutions", path: "/use-cases" },
            { name: "Manufacturing & Industrial", path: "/use-cases/manufacturing" },
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
            Manufacturing &amp; Industrial
          </span>
        </nav>

        {/* Hero Section: Editorial & Strategic Focus */}
        <header className="mb-14 max-w-5xl">
          <h1 className="text-3xl sm:text-4xl lg:text-[40px] xl:text-[46px] font-extrabold tracking-tight text-white leading-[1.18] mb-5">
            <span className="block">Stop PO Disputes &amp; Net 90 Terms</span>
            <span className="block">from Trapping Industrial Cash Flow</span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-300 leading-relaxed mb-6 max-w-3xl">
            Capital-intensive manufacturers face high raw material costs and 60-to-90-day buyer payment windows. Jaktra automates pre-due ERP matching check-ins, triages goods receipt disputes via NLP, and accelerates working capital recovery without alienating OEM procurement buyers.
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
            <span className="text-zinc-400 hidden sm:inline">For Industrial CFOs &amp; Plant Controllers</span>
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
                  Modulates from pre-due ERP matching to formal procurement credit freeze warnings.
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
                  Secure tokenized portal for high-value ACH, bank wires, and corporate card approvals.
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
                  NLP identifies dock receiving delays and isolates disputed lines while securing undisputed sums.
                </p>
                <div className="pt-3 border-t border-white/[0.05] flex items-center gap-2 text-[11px] text-zinc-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
                  <span>Dock &amp; PO Line Triage</span>
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
                  Direct REST API or universal CSV ingestion for SAP, NetSuite, Epicor, or QuickBooks.
                </p>
                <div className="pt-3 border-t border-white/[0.05] flex items-center gap-2 text-[11px] text-zinc-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#b7d2f8] shrink-0 shadow-[0_0_6px_rgba(183,210,248,0.6)]" />
                  <span>Enterprise ERP Sync</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3 Core Industrial Dilemmas */}
        <section id="dilemmas" className="border-t border-white/[0.08] pt-16 pb-16">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono uppercase tracking-widest text-zinc-400 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shadow-[0_0_6px_rgba(244,63,94,0.6)]" />
                Operational Breakdown
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-[1.2]">
                Why Industrial Working Capital Stalls
              </h2>
            </div>
            <p className="text-sm sm:text-base text-zinc-400 max-w-md leading-relaxed lg:pb-1">
              Industrial cash flow is choked not by insolvent customers, but by clerical mismatch between procurement orders and warehouse receiving logs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Dilemma 01 */}
            <div className="relative rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-white/[0.01] backdrop-blur-md p-6 lg:p-7 flex flex-col justify-between hover:border-white/[0.16] hover:bg-white/[0.025] transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.36)] group overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#b7d2f8]/30 to-transparent group-hover:via-[#b7d2f8]/60 transition-all duration-500" />
              
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 rounded-xl bg-[#b7d2f8]/10 border border-[#b7d2f8]/20 flex items-center justify-center text-[#b7d2f8] shadow-[0_0_20px_rgba(183,210,248,0.12)] group-hover:scale-105 group-hover:border-[#b7d2f8]/40 transition-all">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 px-2.5 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06]">
                    Dilemma 01
                  </span>
                </div>

                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
                  Clerical Bottleneck
                </span>
                <h3 className="text-xl font-bold tracking-tight text-white mb-3 group-hover:text-[#b7d2f8] transition-colors">
                  Receiving Dock &amp; PO Mismatches
                </h3>
                <p className="text-xs sm:text-[13px] text-zinc-400 leading-relaxed mb-6">
                  Corporate AP desks halt entire multi-million dollar supplier invoices if a single receiving dock variance or missing line item causes a 3-way match failure.
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
                    Identifies line variances automatically, pauses aggressive cadences, and prompts the buyer to remit undisputed lines while verifying dock logs.
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
                    <Clock className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 px-2.5 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06]">
                    Dilemma 02
                  </span>
                </div>

                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
                  Term Lag
                </span>
                <h3 className="text-xl font-bold tracking-tight text-white mb-3 group-hover:text-[#b7d2f8] transition-colors">
                  Extended Net 60/90 Terms Drag
                </h3>
                <p className="text-xs sm:text-[13px] text-zinc-400 leading-relaxed mb-6">
                  Waiting until Day 61 to contact enterprise procurement means any clerical glitch pushes payment past Day 90, creating severe supplier liquidity stress.
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
                    Automates collaborative pre-due milestones at Day 45 of a Net 60 term, ensuring invoice inclusion in scheduled AP disbursement runs before maturity.
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
                    <Factory className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 px-2.5 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06]">
                    Dilemma 03
                  </span>
                </div>

                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
                  Capital Lockup
                </span>
                <h3 className="text-xl font-bold tracking-tight text-white mb-3 group-hover:text-[#b7d2f8] transition-colors">
                  WIP &amp; Raw Material Float
                </h3>
                <p className="text-xs sm:text-[13px] text-zinc-400 leading-relaxed mb-6">
                  Fabricators fund expensive raw materials upfront; demanding binary lump-sum settlement when an OEM faces inventory cycles can trigger severe credit standoffs.
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
                    Offers self-serve 2x or 3x milestone installment plans inside the debtor portal, protecting supplier liquidity while keeping production active.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5-Stage Cadence */}
        <section id="cadence" className="border-t border-white/[0.08] pt-16 pb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-2">
                Escalation Architecture
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                The 5-Stage Industrial Receivables Cadence
              </h2>
            </div>
            <p className="text-sm text-zinc-400 max-w-xl leading-relaxed">
              Progressive communication that protects commercial procurement goodwill early and halts gracefully before legal action.
            </p>
          </div>

          {/* Interactive Horizontal Stage Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mb-8">
            {MANUFACTURING_STAGES.map((s) => {
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
                    const toLine = `To: ${activeStage.to || "ap.disbursements@cliententerprise.com"}\n`;
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
                    <span className="text-zinc-300 break-words">{activeStage.to || "ap.disbursements@cliententerprise.com"}</span>
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
                      <span className="text-zinc-300">ar-operations@apexindustrial.com (via Jaktra)</span>
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
                The Macro Anatomy of Industrial Receivables Drag
              </h2>
            </div>
            <p className="text-sm sm:text-base text-zinc-400 max-w-md leading-relaxed lg:pb-1">
              Data across North American industrial fabrication and manufacturing shows that over 85% of past-due balances stem from 3-way matching discrepancies rather than corporate insolvency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-white/[0.01] backdrop-blur-md relative overflow-hidden">
              <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-3 flex items-center justify-between">
                <span>DSO Velocity Benchmark</span>
                <span className="text-[#b7d2f8] bg-[#b7d2f8]/10 px-2 py-0.5 rounded border border-[#b7d2f8]/20">Manufacturing</span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
                68 Days
              </div>
              <p className="text-xs sm:text-[13px] text-zinc-300 leading-relaxed mb-4">
                Median Days Sales Outstanding across mid-market industrial suppliers. Top quartile fabricators using autonomous PO verification compress DSO to 38 days.
              </p>
              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-400 font-mono">
                <span>Target Compression:</span>
                <span className="text-emerald-400 font-bold">-30 Days Speedup</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-white/[0.01] backdrop-blur-md relative overflow-hidden">
              <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-3 flex items-center justify-between">
                <span>Operational Root Cause</span>
                <span className="text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">3-Way Match Friction</span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
                64%
              </div>
              <p className="text-xs sm:text-[13px] text-zinc-300 leading-relaxed mb-4">
                Of payment holds result from 3-way match failures: receiving dock count variance (36%), PO line price variance (18%), or unverified freight accessorials (10%).
              </p>
              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-400 font-mono">
                <span>Insolvency Share:</span>
                <span className="text-zinc-300 font-bold">&lt; 6% Real Default</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-white/[0.01] backdrop-blur-md relative overflow-hidden">
              <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-3 flex items-center justify-between">
                <span>Working Capital Lockup</span>
                <span className="text-rose-400 bg-rose-400/10 px-2 py-0.5 rounded border border-rose-400/20">WIP Float Drag</span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
                18%
              </div>
              <p className="text-xs sm:text-[13px] text-zinc-300 leading-relaxed mb-4">
                Of supplier revenue is locked in raw material work-in-progress float while waiting for extended Net 60/90 buyer payment runs to clear.
              </p>
              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-400 font-mono">
                <span>Preservation Upside:</span>
                <span className="text-[#b7d2f8] font-bold">+24% Free Cash Flow</span>
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
                Legacy ERP Reminders vs. Manual Sales Chasing vs. Jaktra
              </h2>
            </div>
            <p className="text-sm sm:text-base text-zinc-400 max-w-md leading-relaxed lg:pb-1">
              Compare how each approach handles extended Net 60/90 industrial credit terms and complex receiving dock discrepancies.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#0e0f11] shadow-xl">
            <table className="w-full text-left text-sm border-collapse min-w-[720px]">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                  <th className="py-4 px-5 font-mono text-xs uppercase tracking-wider text-zinc-400 w-1/4">Workflow Dimension</th>
                  <th className="py-4 px-5 font-mono text-xs uppercase tracking-wider text-zinc-400 w-1/4">Legacy ERP Automated Emails</th>
                  <th className="py-4 px-5 font-mono text-xs uppercase tracking-wider text-zinc-400 w-1/4">Manual Sales Rep Chasing</th>
                  <th className="py-4 px-5 font-mono text-xs uppercase tracking-wider text-[#b7d2f8] bg-[#b7d2f8]/5 w-1/4">Jaktra Autonomous AR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-xs sm:text-[13px]">
                <tr className="hover:bg-white/[0.015] transition-colors">
                  <td className="py-4 px-5 font-semibold text-white">Dock &amp; PO Dispute Triage</td>
                  <td className="py-4 px-5 text-zinc-400 leading-relaxed">Ignores inbound replies; robot continues sending overdue notices.</td>
                  <td className="py-4 px-5 text-zinc-400 leading-relaxed">Disputes sit in sales inboxes for weeks; dock tickets lost.</td>
                  <td className="py-4 px-5 text-white bg-[#b7d2f8]/5 font-medium leading-relaxed">NLP classifies dock variances, isolates undisputed sums, alerts shipping.</td>
                </tr>
                <tr className="hover:bg-white/[0.015] transition-colors">
                  <td className="py-4 px-5 font-semibold text-white">Net 60/90 Pre-Due Audits</td>
                  <td className="py-4 px-5 text-zinc-400 leading-relaxed">Silent until Day 61; invoice misses scheduled bi-weekly AP batch.</td>
                  <td className="py-4 px-5 text-zinc-400 leading-relaxed">Sales reps forget to check in until payments are weeks past due.</td>
                  <td className="py-4 px-5 text-white bg-[#b7d2f8]/5 font-medium leading-relaxed">Proactive 15-day pre-due GRN audit aligns invoice with client ERP run.</td>
                </tr>
                <tr className="hover:bg-white/[0.015] transition-colors">
                  <td className="py-4 px-5 font-semibold text-white">Credit Hold Governance</td>
                  <td className="py-4 px-5 text-zinc-400 leading-relaxed">Abruptly halts shipments without notifying enterprise procurement.</td>
                  <td className="py-4 px-5 text-zinc-400 leading-relaxed">Sales reps hide delinquency until credit insurance is compromised.</td>
                  <td className="py-4 px-5 text-white bg-[#b7d2f8]/5 font-medium leading-relaxed">Measured, transparent 30-day escalation warning before production freeze.</td>
                </tr>
                <tr className="hover:bg-white/[0.015] transition-colors">
                  <td className="py-4 px-5 font-semibold text-white">Installment Flexibility</td>
                  <td className="py-4 px-5 text-zinc-400 leading-relaxed">Binary full payment only; risks pushing troubled buyers into bankruptcy.</td>
                  <td className="py-4 px-5 text-zinc-400 leading-relaxed">Manual paperwork requiring legal counsel and CFO signoff.</td>
                  <td className="py-4 px-5 text-white bg-[#b7d2f8]/5 font-medium leading-relaxed">Pre-approved 2x–3x milestone installment schedules in debtor portal.</td>
                </tr>
                <tr className="hover:bg-white/[0.015] transition-colors">
                  <td className="py-4 px-5 font-semibold text-white">High-Value Settlement Rails</td>
                  <td className="py-4 px-5 text-zinc-400 leading-relaxed">Requires paper checks by mail or manual phone wire verifications.</td>
                  <td className="py-4 px-5 text-zinc-400 leading-relaxed">Static PDF attachments with unsecured routing numbers.</td>
                  <td className="py-4 px-5 text-white bg-[#b7d2f8]/5 font-medium leading-relaxed">Cryptographic tokenized portal with direct Fedwire and corporate ACH.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Industrial Stack & Ecosystem Architecture */}
        <section id="integrations" className="border-t border-white/[0.08] pt-16 pb-16">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono uppercase tracking-widest text-zinc-400 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_6px_rgba(192,132,252,0.6)]" />
                Technical Interoperability
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-[1.2]">
                Interoperates with Your Manufacturing ERP Ecosystem
              </h2>
            </div>
            <p className="text-sm sm:text-base text-zinc-400 max-w-md leading-relaxed lg:pb-1">
              Zero code required. Jaktra acts as an autonomous execution layer on top of your existing industrial ERP and inventory databases.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-white/[0.01] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8] mb-4">
                  <Database className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-1.5">Enterprise ERPs</h3>
                <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                  Real-time synchronization pulls open receivables and reconciles cleared bank wire deposits.
                </p>
              </div>
              <div className="pt-3 border-t border-white/[0.06] flex flex-wrap gap-1.5 text-[11px] font-mono text-zinc-300">
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">SAP Business One</span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">NetSuite</span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">Epicor</span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">Dynamics 365</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-white/[0.01] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8] mb-4">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-1.5">Mid-Market Ledgers</h3>
                <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                  Universal CSV or API sync for established fabrication accounting systems.
                </p>
              </div>
              <div className="pt-3 border-t border-white/[0.06] flex flex-wrap gap-1.5 text-[11px] font-mono text-zinc-300">
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">QuickBooks Enterprise</span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">Sage 100/300</span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">Xero</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-white/[0.01] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8] mb-4">
                  <FileCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-1.5">Supply Chain &amp; EDI</h3>
                <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                  Attaches verified bills of lading, packing slips, and material test reports to debtor records.
                </p>
              </div>
              <div className="pt-3 border-t border-white/[0.06] flex flex-wrap gap-1.5 text-[11px] font-mono text-zinc-300">
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">SPS Commerce</span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">Coupa</span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">Tipalti</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-white/[0.01] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8] mb-4">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-1.5">High-Value Settlement</h3>
                <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                  Cryptographic settlement links allow buyers to authorize corporate wires and bank debits.
                </p>
              </div>
              <div className="pt-3 border-t border-white/[0.06] flex flex-wrap gap-1.5 text-[11px] font-mono text-zinc-300">
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">Fedwire Rails</span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">ACH Direct</span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">Corporate Card</span>
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
                Industrial Supplier Deployment Roadmap
              </h2>
            </div>
            <p className="text-sm sm:text-base text-zinc-400 max-w-md leading-relaxed lg:pb-1">
              Roll out autonomous receivables governance without disrupting your plant operations, ERP ledger, or sales distributor relationships.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0e0f11] relative">
              <span className="text-xs font-mono text-zinc-500 uppercase block mb-3">Step 01 · 10 Mins</span>
              <h3 className="text-base font-bold text-white mb-2">Ingest ERP Open AR</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Connect your ERP (NetSuite, SAP, Epicor) or upload an open invoice CSV report with PO numbers and buyer AP email records.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0e0f11] relative">
              <span className="text-xs font-mono text-zinc-500 uppercase block mb-3">Step 02 · 15 Mins</span>
              <h3 className="text-base font-bold text-white mb-2">Configure 3-Way Match Rules</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Activate automatic shipping manifest attachments (BOLs, packing slips) and set up pre-due Day -15 verification milestones.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0e0f11] relative">
              <span className="text-xs font-mono text-zinc-500 uppercase block mb-3">Step 03 · 10 Mins</span>
              <h3 className="text-base font-bold text-white mb-2">Enable Credit Hold Guardrails</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Set 30-day production credit freeze thresholds and multi-tranche installment terms for high-value orders ($50,000+).
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0e0f11] relative">
              <span className="text-xs font-mono text-zinc-500 uppercase block mb-3">Step 04 · Continuous</span>
              <h3 className="text-base font-bold text-white mb-2">Reconcile Bank Wires</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Incoming ACH and wire payments match invoices automatically, pushing real-time journal entries back to your ERP.
              </p>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section id="faqs" className="border-t border-white/[0.08] pt-16 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-4 space-y-4">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-1">
                Industrial AR FAQs
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Frequently Asked Questions for Industrial Suppliers
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Everything you need to know about resolving PO matching disputes and managing extended credit terms.
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
              Unlock Trapped Working Capital in Your Supply Chain
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed">
              Eliminate dunning delays and accelerate Net 60/90 recoveries without damaging buyer relationships. Deploy in under 15 minutes.
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

export default ManufacturingUseCase;

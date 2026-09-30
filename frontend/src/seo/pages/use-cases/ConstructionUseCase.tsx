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
  Factory,
  Briefcase,
  Truck,
  Boxes,
  UserCheck,
  HardHat,
  Database,
  FileCheck2,
} from "lucide-react";
import { SEOHead } from "@/seo/components/SEOHead";
import { constructionUseCaseSchema, breadcrumbSchema } from "@/seo/schemas";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { GlobalNav } from "@/components/common/GlobalNav";

interface ConstructionStageItem {
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

const CONSTRUCTION_STAGES: ConstructionStageItem[] = [
  {
    id: "stage-1",
    stageNumber: "01",
    timing: "Day -5 Pre-Due",
    title: "Pay App & Lien Waiver Pre-Due Confirmation",
    tone: "Courteous & Administrative",
    badge: "bg-white/[0.04] text-zinc-300 border-white/[0.08]",
    psychology:
      "Eliminates the classic general contractor excuse: 'We never received your monthly waiver paperwork or notarized pay application.'",
    description:
      "Verifies that AIA G702/G703 payment applications, conditional lien waivers, and certified payroll records were logged before the general contractor's monthly billing window closes.",
    subject: "AIA Pay App #04 & Conditional Lien Waiver: Project #BLD-880 (Metropolitan Tower) due in 5 days",
    to: "gc.accounting@turnerconstructioncorp.com (Project Accounting)",
    cc: "project.manager@turnerconstructioncorp.com (GC Project Manager), billing@apexmechanical.com",
    sample: `Attention General Contractor Project Accounting (cc: Project Manager),

Sharing a proactive verification summary of progress payment application #04 ($68,000.00) covering commercial HVAC and mechanical rough-in on Project #BLD-880 (Metropolitan Tower), due on the 10th under Net 30 subcontract terms.

• Contract Reference: Subcontract #SC-4491 · Pay App #04 (Schedule of Values Line Items 01–14)
• Attached: Notarized AIA G702/G703 pay application, signed Progress Conditional Lien Waiver ($68,000.00) & certified payroll records

To ensure uninterrupted inclusion in your upcoming monthly owner draw disbursement, please confirm that all waiver documentation matches your project file. You can verify paperwork alignment and confirm draw funding status below:`,
    guardrail:
      "Attaches certified payroll, conditional lien waiver, and zero-login settlement link. Assumes administrative oversight.",
    actionPrompt: "Verify Paperwork & Confirm Draw Status",
  },
  {
    id: "stage-2",
    stageNumber: "02",
    timing: "Days 1–14 Overdue",
    title: "Owner Funding & Disbursement Check-in",
    tone: "Friendly & Inquiring",
    badge: "bg-white/[0.04] text-zinc-300 border-white/[0.08]",
    psychology:
      "Maintains commercial collaboration while confirming whether the project owner has funded the master progress draw.",
    description:
      "Polite inquiry regarding project owner funding releases and the GC's scheduled payment batch date. Accommodates pay-when-paid realities without creating unnecessary adversarial tension.",
    subject: "Draw Status Check-in: Subcontractor Pay App #04 ($68,000.00) — Project #BLD-880",
    to: "gc.accounting@turnerconstructioncorp.com, project.manager@turnerconstructioncorp.com",
    sample: `Hello Project Accounting Team,

Checking in regarding progress payment application #04 ($68,000.00) for completed mechanical installations on Project #BLD-880, which matured earlier this week.

We understand that general contractor disbursements are coordinated around owner draw release cycles. To assist our project team with upcoming trade staffing and equipment mobilization schedules, could you confirm whether project owner funding has been released for this billing period?

If you prefer to remit directly via corporate ACH or instant wire without logging into a vendor portal, you can authorize payment here:`,
    guardrail:
      "Embeds zero-login cryptographic payment portal link (/i/:token) for job-site approval without password friction.",
    actionPrompt: "Review Draw & Release Subcontractor Funds",
  },
  {
    id: "stage-3",
    stageNumber: "03",
    timing: "Days 15–25 Overdue",
    title: "Change Order Isolation & Base Draw Release",
    tone: "Professional & Commercial",
    badge: "bg-white/[0.04] text-zinc-300 border-white/[0.08]",
    psychology:
      "If the GC cites owner non-payment or architect punch lists, Jaktra isolates disputed items and collects undisputed progress funds.",
    description:
      "Direct communication with the GC's chief accounting officer. If change orders or punch-list items are queried, Jaktra isolates the discrepancy and prompts immediate release of the undisputed base draw.",
    subject: "Commercial Review: Requesting Base Draw Release on Pay App #04 ($68,000.00)",
    to: "controller@turnerconstructioncorp.com, senior.pm@turnerconstructioncorp.com",
    cc: "project-executive@apexmechanical.com",
    sample: `Attention GC Controller and Senior Project Management,

We noted your inquiry regarding the $4,200 pending field change order (PCO #07 - Duct Reroute) on Schedule of Values Line 12. Our field superintendent is reviewing the signed RFI directive with your site team.

While we finalize this specific change order adjustment, we request the immediate release of the undisputed base draw balance of $63,800.00. Freezing full progress billing over a minor field directive strains on-site trade payroll and equipment leases.

You can authorize the undisputed $63,800.00 draw in one click below while our project managers complete the change order sign-off:`,
    guardrail:
      "Offers structured milestone releases to maintain jobsite crew staffing during change order reviews.",
    actionPrompt: "Release Undisputed Base Draw ($63,800)",
  },
  {
    id: "stage-4",
    stageNumber: "04",
    timing: "Days 26–30 Critical",
    title: "Project Executive Warning & Jobsite Staffing Hold",
    tone: "Formal & Leadership-Level",
    badge: "bg-white/[0.04] text-zinc-300 border-white/[0.08]",
    psychology:
      "General contractor project executives prioritize trade payment when project schedule critical path is threatened.",
    description:
      "Authoritative executive communication warning that prolonged receivables lag directly threatens upcoming trade staffing, material procurement, and jobsite mobilization.",
    subject: "PROJECT NOTICE: Trade Staffing & Mobilization Alert for Project #BLD-880",
    to: "project.executive@turnerconstructioncorp.com, vp.operations@turnerconstructioncorp.com",
    cc: "cfo@turnerconstructioncorp.com, leadership@apexmechanical.com",
    sample: `Dear Project Executive and Operations Leadership,

Progress draw billing for Subcontract #SC-4491 remains delinquent with an overdue balance of $68,000.00 at 28 days past due.

Our mechanical crews have continued on-site installation in good faith to protect your master schedule critical path. However, under our commercial trade credit policy, progress draws past 28 days overdue trigger an automated jobsite mobilization freeze.

Please be advised that on-site trade staffing, equipment rentals, and specialized chiller deliveries will be placed on hold in 5 business days unless past-due draw funds are disbursed.

To clear delinquent draws and maintain on-site installation momentum, remit directly below:`,
    guardrail:
      "Pre-notifies your lead project executive and commercial estimator before sending.",
    actionPrompt: "Disburse Past-Due Draw to Maintain On-Site Crews",
  },
  {
    id: "stage-5",
    stageNumber: "05",
    timing: "Day 31+ Legal Halt",
    title: "Statutory Mechanics Lien Rights Protection Freeze",
    tone: "Final Demand / Statutory Preservation",
    badge: "Day 31+ (Legal Halt)",
    description:
      "Autonomous dunning strictly halts. Preserves an audit trail of invoice histories and communication transcripts for legal counsel ahead of statutory preliminary notice or mechanics lien deadlines.",
    psychology:
      "100% human credit committee review required before filing formal mechanics lien or bond claims.",
    subject: "CONFIDENTIAL: Statutory Lien Rights Preservation & Legal Audit (#BLD-880)",
    to: "cfo@turnerconstructioncorp.com, general.counsel@turnerconstructioncorp.com",
    cc: "owner.rep@metropolitantower.com, legal@apexmechanical.com",
    sample: `CONFIDENTIAL LEGAL NOTICE: Subcontract Account #GC-502 has exceeded all commercial credit boundaries with an unresolved delinquent draw balance of $68,000.00 at 45 days past due.

All automated communications have concluded. In accordance with statutory mechanics lien deadlines (60-day preliminary notice requirements) and payment bond regulations, complete project records—including certified payroll, notarized pay applications, delivery tickets, and communication logs—have been compiled for legal counsel and credit committee review regarding formal mechanics lien filing.

To avoid formal lien filings on property title or bond surety claims, execute an immediate digital settlement via our verified contractor portal:`,
    guardrail:
      "Autonomous messaging halted. Certified audit package delivered for mechanics lien review.",
    actionPrompt: "Immediate Digital Cure via Certified Portal",
  },
];

const FAQS = [
  {
    q: "How does Jaktra accommodate pay-when-paid clauses and owner billing cycles?",
    a: "Commercial trade contractors often deal with general contractors waiting on project owner disbursements. Rather than blasting aggressive overdue demands that antagonize the GC, Jaktra initiates courteous administrative check-ins (Stage 1 & 2) that verify whether pay application paperwork, lien waivers, and certified payroll records are approved. If the GC indicates the owner hasn't released funds, our NLP agent tags the status, adjusts the follow-up cadence, and alerts your project executive.",
  },
  {
    q: "What happens when a general contractor disputes a change order or punch-list item?",
    a: "In construction, billing disputes over unapproved change orders or disputed punch-list items can freeze an entire monthly application. Jaktra's DisputeSentinel parses inbound emails from project managers and GCs. If an email mentions disputed change orders, defective work, or retainage withholdings, Jaktra immediately tags the invoice as 'disputed', halts automated dunning cadences on that item, isolates the undisputed base draw, and drafts a resolution briefing for your billing manager.",
  },
  {
    q: "Can Jaktra track and accelerate retainage releases?",
    a: "Yes. Retainage (often 5%–10% withheld until project substantial completion) is one of the biggest drains on subcontractor balance sheets. You can record retainage as scheduled milestone invoices or structured installment plans with future due dates. When the project reaches completion milestones, Jaktra deploys tailored, professional follow-up cadences so final retainage holdbacks are paid promptly by the GC's accounting department.",
  },
  {
    q: "How does the Stage 5 Legal Stop protect preliminary notice and mechanics lien rights?",
    a: "Statutory deadlines for mechanics liens and Miller Act bond claims typically range from 60 to 90 days from the last date labor or materials were furnished. Jaktra's Stage 5 Legal Stop strictly halts automated communications at 31+ days overdue, locking the audit log and escalating the delinquent account to your legal/credit team well in advance of statutory lien notice deadlines.",
  },
  {
    q: "Can GC project managers pay or approve milestone invoices from mobile devices?",
    a: "Yes. General contractors and project executives are frequently on job sites without access to desktop computers. Jaktra sends cryptographic, zero-login payment links (/i/:token) that allow GC personnel to inspect the invoice statement and approve payment directly from their mobile phone via bank transfer or card without logging into an account.",
  },
  {
    q: "Does Jaktra integrate with construction software like Procore, Foundation, or Textura?",
    a: "Yes. Jaktra connects directly via API and universal CSV with construction-specific accounting and project management platforms like Procore, Foundation Software, ComputerEase, and QuickBooks Contractor, synchronizing pay applications, schedules of values, and conditional lien waiver receipts.",
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
];

export function ConstructionUseCase() {
  const [activeStageId, setActiveStageId] = useState<string>("stage-1");
  const [copiedStage, setCopiedStage] = useState<boolean>(false);

  const activeStage = CONSTRUCTION_STAGES.find((s) => s.id === activeStageId) || CONSTRUCTION_STAGES[0];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStage(true);
    setTimeout(() => setCopiedStage(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#010102] text-[#f7f8f8] font-sans antialiased selection:bg-[#5e6ad2]/30 selection:text-white">
      <SEOHead
        title="AI Accounts Receivable for Construction Subcontractors — Jaktra"
        description="Accelerate AIA progress billing collections, release retainage, and protect lien rights with Jaktra's AI accounts receivable agent for trade contractors."
        canonicalPath="/use-cases/construction"
        jsonLd={[
          constructionUseCaseSchema,
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Industry Solutions", path: "/use-cases" },
            { name: "Commercial Subcontractors", path: "/use-cases/construction" },
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
            Commercial Subcontractors
          </span>
        </nav>

        {/* Hero Section: Editorial & Strategic Focus */}
        <header className="mb-14 max-w-5xl">
          <h1 className="text-3xl sm:text-4xl lg:text-[40px] xl:text-[46px] font-extrabold tracking-tight text-white leading-[1.18] mb-5">
            <span className="block">Stop Pay App Paperwork Delays</span>
            <span className="block">&amp; Trapped Retainage from Choking Trade Cash Flow</span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-300 leading-relaxed mb-6 max-w-3xl">
            Commercial subcontractors fund labor and materials upfront, while general contractors stall progress draws citing paperwork technicalities and owner funding lags. Jaktra automates pre-due conditional lien waiver exchanges, isolates change order disputes, and accelerates progress draws.
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
            <span className="text-zinc-400 hidden sm:inline">For Specialty Trade Contractors &amp; Project Controllers</span>
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
                  Modulates from pre-due waiver confirmation to statutory mechanics lien protection stops.
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
                  Tokenized links let GC project managers inspect pay apps and approve ACH or wires on mobile.
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
                  NLP isolates unapproved change order lines while prompting immediate release of base progress draws.
                </p>
                <div className="pt-3 border-t border-white/[0.05] flex items-center gap-2 text-[11px] text-zinc-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
                  <span>Change Order Triage</span>
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
                  Direct REST API or CSV sync with Procore, Foundation Software, ComputerEase, or QuickBooks.
                </p>
                <div className="pt-3 border-t border-white/[0.05] flex items-center gap-2 text-[11px] text-zinc-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#b7d2f8] shrink-0 shadow-[0_0_6px_rgba(183,210,248,0.6)]" />
                  <span>Construction ERP Sync</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3 Core Construction Dilemmas */}
        <section id="dilemmas" className="border-t border-white/[0.08] pt-16 pb-16">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono uppercase tracking-widest text-zinc-400 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shadow-[0_0_6px_rgba(244,63,94,0.6)]" />
                Operational Breakdown
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-[1.2]">
                Why Subcontractor Progress Billing Stalls
              </h2>
            </div>
            <p className="text-sm sm:text-base text-zinc-400 max-w-md leading-relaxed lg:pb-1">
              Trade contractors face cash crunches when general contractors leverage paperwork formalities and pay-when-paid clauses to delay draw funding.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Dilemma 01 */}
            <div className="relative rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-white/[0.01] backdrop-blur-md p-6 lg:p-7 flex flex-col justify-between hover:border-white/[0.16] hover:bg-white/[0.025] transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.36)] group overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#b7d2f8]/30 to-transparent group-hover:via-[#b7d2f8]/60 transition-all duration-500" />
              
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 rounded-xl bg-[#b7d2f8]/10 border border-[#b7d2f8]/20 flex items-center justify-center text-[#b7d2f8] shadow-[0_0_20px_rgba(183,210,248,0.12)] group-hover:scale-105 group-hover:border-[#b7d2f8]/40 transition-all">
                    <FileCheck2 className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 px-2.5 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06]">
                    Dilemma 01
                  </span>
                </div>

                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
                  Paperwork Rejections
                </span>
                <h3 className="text-xl font-bold tracking-tight text-white mb-3 group-hover:text-[#b7d2f8] transition-colors">
                  Lien Waiver &amp; Pay App Clerical Rejections
                </h3>
                <p className="text-xs sm:text-[13px] text-zinc-400 leading-relaxed mb-6">
                  GCs reject entire $100,000+ monthly pay applications over minor clerical errors on conditional lien waivers, certified payroll, or notary stamps.
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
                    Automates Day -5 pre-due checks to confirm verified lien waivers and AIA documents are approved before the GC closes the owner draw window.
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
                    <Lock className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 px-2.5 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06]">
                    Dilemma 02
                  </span>
                </div>

                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
                  Profit Trap
                </span>
                <h3 className="text-xl font-bold tracking-tight text-white mb-3 group-hover:text-[#b7d2f8] transition-colors">
                  10% Retainage Trapped Indefinitely
                </h3>
                <p className="text-xs sm:text-[13px] text-zinc-400 leading-relaxed mb-6">
                  Retainage holdbacks represent the subcontractor's entire net profit margin, trapped indefinitely until project substantial completion.
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
                    Tracks retainage milestones separately and deploys targeted closeout cadences upon punch list signoff to release final holdbacks.
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
                    <HardHat className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 px-2.5 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06]">
                    Dilemma 03
                  </span>
                </div>

                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
                  Critical Path Conflict
                </span>
                <h3 className="text-xl font-bold tracking-tight text-white mb-3 group-hover:text-[#b7d2f8] transition-colors">
                  Jobsite PMs Straining Client Rapport
                </h3>
                <p className="text-xs sm:text-[13px] text-zinc-400 leading-relaxed mb-6">
                  Forcing trade project managers to argue over billing in the job trailer destroys operational coordination on the active jobsite.
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
                    Acts as an institutional corporate credit desk, keeping field PMs insulated so they can maintain positive jobsite coordination.
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
                The 5-Stage Construction Receivables Cadence
              </h2>
            </div>
            <p className="text-sm text-zinc-400 max-w-xl leading-relaxed">
              Progressive communication that accommodates pay-when-paid realities early and halts gracefully before statutory mechanics lien deadlines.
            </p>
          </div>

          {/* Interactive Horizontal Stage Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mb-8">
            {CONSTRUCTION_STAGES.map((s) => {
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
                    const toLine = `To: ${activeStage.to || "gc.accounting@turnerconstructioncorp.com"}\n`;
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
                    <span className="text-zinc-300 break-words">{activeStage.to || "gc.accounting@turnerconstructioncorp.com"}</span>
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
                      <span className="text-zinc-300">billing@apexmechanical.com (via Jaktra)</span>
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
                The Macro Anatomy of Subcontractor Cash Flow Drag
              </h2>
            </div>
            <p className="text-sm sm:text-base text-zinc-400 max-w-md leading-relaxed lg:pb-1">
              Data across commercial mechanical, electrical, and concrete subcontractors demonstrates that over 80% of draw payment delays stem from paperwork rejections rather than GC bankruptcy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-white/[0.01] backdrop-blur-md relative overflow-hidden">
              <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-3 flex items-center justify-between">
                <span>DSO Velocity Benchmark</span>
                <span className="text-[#b7d2f8] bg-[#b7d2f8]/10 px-2 py-0.5 rounded border border-[#b7d2f8]/20">Construction</span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
                74 Days
              </div>
              <p className="text-xs sm:text-[13px] text-zinc-300 leading-relaxed mb-4">
                Median Days Sales Outstanding across commercial trade subcontractors. Operators using automated lien waiver exchanges compress DSO to 36 days.
              </p>
              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-400 font-mono">
                <span>Target Compression:</span>
                <span className="text-emerald-400 font-bold">-38 Days Speedup</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-white/[0.01] backdrop-blur-md relative overflow-hidden">
              <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-3 flex items-center justify-between">
                <span>Paperwork Root Cause</span>
                <span className="text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">Waivers &amp; Pay Apps</span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
                81%
              </div>
              <p className="text-xs sm:text-[13px] text-zinc-300 leading-relaxed mb-4">
                Of payment holds result from paperwork claims: missing conditional lien waivers (44%), unapproved change orders (24%), or notary date errors (13%).
              </p>
              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-400 font-mono">
                <span>Insolvency Share:</span>
                <span className="text-zinc-300 font-bold">&lt; 5% Real Default</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-white/[0.01] backdrop-blur-md relative overflow-hidden">
              <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-3 flex items-center justify-between">
                <span>Retainage Lockup</span>
                <span className="text-rose-400 bg-rose-400/10 px-2 py-0.5 rounded border border-rose-400/20">Trapped Profit</span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
                10%
              </div>
              <p className="text-xs sm:text-[13px] text-zinc-300 leading-relaxed mb-4">
                Of total subcontract contract value is locked in 10% retainage holdbacks for 12+ months until final building certificate of occupancy.
              </p>
              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-400 font-mono">
                <span>Preservation Upside:</span>
                <span className="text-[#b7d2f8] font-bold">100% Retainage Recapture</span>
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
                Subcontractor PM Chasing vs. Generic ERP Invoicing vs. Jaktra
              </h2>
            </div>
            <p className="text-sm sm:text-base text-zinc-400 max-w-md leading-relaxed lg:pb-1">
              Compare how each approach handles AIA progress billing, pay-when-paid clauses, and statutory mechanics lien deadlines.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#0e0f11] shadow-xl">
            <table className="w-full text-left text-sm border-collapse min-w-[720px]">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                  <th className="py-4 px-5 font-mono text-xs uppercase tracking-wider text-zinc-400 w-1/4">Workflow Dimension</th>
                  <th className="py-4 px-5 font-mono text-xs uppercase tracking-wider text-zinc-400 w-1/4">Legacy ERP Auto-Statements</th>
                  <th className="py-4 px-5 font-mono text-xs uppercase tracking-wider text-zinc-400 w-1/4">Field PM Chasing GCs</th>
                  <th className="py-4 px-5 font-mono text-xs uppercase tracking-wider text-[#b7d2f8] bg-[#b7d2f8]/5 w-1/4">Jaktra Autonomous AR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-xs sm:text-[13px]">
                <tr className="hover:bg-white/[0.015] transition-colors">
                  <td className="py-4 px-5 font-semibold text-white">Critical Path Protection</td>
                  <td className="py-4 px-5 text-zinc-400 leading-relaxed">Sends cold form letters that antagonize general contractor leadership.</td>
                  <td className="py-4 px-5 text-zinc-400 leading-relaxed">Field PMs argue over money in job trailers, damaging site coordination.</td>
                  <td className="py-4 px-5 text-white bg-[#b7d2f8]/5 font-medium leading-relaxed">Objective corporate credit buffer; field PMs focus on installation.</td>
                </tr>
                <tr className="hover:bg-white/[0.015] transition-colors">
                  <td className="py-4 px-5 font-semibold text-white">Change Order Dispute Triage</td>
                  <td className="py-4 px-5 text-zinc-400 leading-relaxed">Ignores change order notes; robot continues demanding full sum.</td>
                  <td className="py-4 px-5 text-zinc-400 leading-relaxed">Disputes sit unresolved while entire progress draw is frozen for months.</td>
                  <td className="py-4 px-5 text-white bg-[#b7d2f8]/5 font-medium leading-relaxed">NLP isolates disputed change order, secures base progress draw instantly.</td>
                </tr>
                <tr className="hover:bg-white/[0.015] transition-colors">
                  <td className="py-4 px-5 font-semibold text-white">Pre-Due Lien Waiver Verification</td>
                  <td className="py-4 px-5 text-zinc-400 leading-relaxed">Silent until maturity; misses GC monthly owner draw cutoffs.</td>
                  <td className="py-4 px-5 text-zinc-400 leading-relaxed">PMs only realize waivers were rejected weeks after draw closes.</td>
                  <td className="py-4 px-5 text-white bg-[#b7d2f8]/5 font-medium leading-relaxed">Proactive Day -5 check confirms notarized waivers and pay apps.</td>
                </tr>
                <tr className="hover:bg-white/[0.015] transition-colors">
                  <td className="py-4 px-5 font-semibold text-white">Retainage Release Acceleration</td>
                  <td className="py-4 px-5 text-zinc-400 leading-relaxed">No tracking for retainage; holdbacks sit indefinitely on balance sheet.</td>
                  <td className="py-4 px-5 text-zinc-400 leading-relaxed">PMs forget to follow up on retainage after crews demobilize from site.</td>
                  <td className="py-4 px-5 text-white bg-[#b7d2f8]/5 font-medium leading-relaxed">Automated milestone cadences follow up on final punch list release.</td>
                </tr>
                <tr className="hover:bg-white/[0.015] transition-colors">
                  <td className="py-4 px-5 font-semibold text-white">Draw Settlement Rails</td>
                  <td className="py-4 px-5 text-zinc-400 leading-relaxed">Paper checks mailed or joint check agreements requiring branch visits.</td>
                  <td className="py-4 px-5 text-zinc-400 leading-relaxed">Manual phone follow-ups to track check delivery dates.</td>
                  <td className="py-4 px-5 text-white bg-[#b7d2f8]/5 font-medium leading-relaxed">Zero-login tokenized link; GC approves mobile ACH or wire in 30 seconds.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Construction Stack & Ecosystem Architecture */}
        <section id="integrations" className="border-t border-white/[0.08] pt-16 pb-16">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono uppercase tracking-widest text-zinc-400 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_6px_rgba(192,132,252,0.6)]" />
                Technical Interoperability
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-[1.2]">
                Plugs Directly into Your Construction ERP &amp; Pay App Stack
              </h2>
            </div>
            <p className="text-sm sm:text-base text-zinc-400 max-w-md leading-relaxed lg:pb-1">
              Zero code required. Jaktra operates seamlessly alongside your construction project management software, accounting ledgers, and pay app systems.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-white/[0.01] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8] mb-4">
                  <HardHat className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-1.5">Project Management</h3>
                <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                  Real-time synchronization pulls committed contracts, schedule of values, and change orders.
                </p>
              </div>
              <div className="pt-3 border-t border-white/[0.06] flex flex-wrap gap-1.5 text-[11px] font-mono text-zinc-300">
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">Procore</span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">Autodesk Build</span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">PlanGrid</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-white/[0.01] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8] mb-4">
                  <Database className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-1.5">Contractor ERPs</h3>
                <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                  Bi-directional ledger synchronization reconciles progress draws and retainage aging buckets.
                </p>
              </div>
              <div className="pt-3 border-t border-white/[0.06] flex flex-wrap gap-1.5 text-[11px] font-mono text-zinc-300">
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">Foundation</span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">ComputerEase</span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">Spectrum</span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">QuickBooks Contractor</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-white/[0.01] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8] mb-4">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-1.5">Pay App Platforms</h3>
                <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                  Attaches verified notarized AIA G702/G703 forms, conditional lien waivers, and certified payroll.
                </p>
              </div>
              <div className="pt-3 border-t border-white/[0.06] flex flex-wrap gap-1.5 text-[11px] font-mono text-zinc-300">
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">Textura</span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">GCPay</span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">Flashtract</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-white/[0.01] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8] mb-4">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-1.5">Draw Settlement Rails</h3>
                <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                  Cryptographic portal allows GCs to authorize bank wires and ACH directly from mobile devices.
                </p>
              </div>
              <div className="pt-3 border-t border-white/[0.06] flex flex-wrap gap-1.5 text-[11px] font-mono text-zinc-300">
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">ACH Direct</span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">Fedwire</span>
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
                48-Hour Subcontractor Deployment Playbook
              </h2>
            </div>
            <p className="text-sm sm:text-base text-zinc-400 max-w-md leading-relaxed lg:pb-1">
              Roll out autonomous progress billing governance without disrupting field superintendent operations or GC job trailer coordination.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0e0f11] relative">
              <span className="text-xs font-mono text-zinc-500 uppercase block mb-3">Step 01 · 10 Mins</span>
              <h3 className="text-base font-bold text-white mb-2">Ingest Schedule of Values</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Connect your construction software (Procore, Foundation, ComputerEase) or upload an active pay application report CSV with GC AP contacts.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0e0f11] relative">
              <span className="text-xs font-mono text-zinc-500 uppercase block mb-3">Step 02 · 15 Mins</span>
              <h3 className="text-base font-bold text-white mb-2">Configure Lien Waiver Rules</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Set up automated Day -5 pre-due courtesy check-ins with attached notarized AIA G702/G703 forms and conditional progress lien waivers.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0e0f11] relative">
              <span className="text-xs font-mono text-zinc-500 uppercase block mb-3">Step 03 · 10 Mins</span>
              <h3 className="text-base font-bold text-white mb-2">Activate Change Order Sentinel</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Establish rules to isolate unapproved change orders while automatically securing disbursement of undisputed base progress draws.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0e0f11] relative">
              <span className="text-xs font-mono text-zinc-500 uppercase block mb-3">Step 04 · Continuous</span>
              <h3 className="text-base font-bold text-white mb-2">Autonomously Reconcile</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Progress draws and retainage reconcile automatically as funds clear via 1-click links, pushing ledger entries to your construction ERP.
              </p>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section id="faqs" className="border-t border-white/[0.08] pt-16 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-4 space-y-4">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-1">
                Subcontractor AR FAQs
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Frequently Asked Questions for Commercial Subcontractors
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                How Jaktra handles pay-when-paid clauses, releases retainage holdbacks, and protects statutory mechanics lien rights.
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
              Accelerate Pay App Cash Flow &amp; Release Trapped Retainage
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed">
              Import open pay applications via CSV or construction ERP in 5 minutes. Stop losing days to paperwork rejections and recover working capital immediately.
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

export default ConstructionUseCase;

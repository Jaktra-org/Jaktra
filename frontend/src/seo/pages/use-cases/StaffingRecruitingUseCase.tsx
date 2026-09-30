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
  Building2,
  Factory,
  Briefcase,
  Truck,
  Boxes,
  HardHat,
  UserCheck,
  Database,
  Layers,
  FileCheck,
} from "lucide-react";
import { SEOHead } from "@/seo/components/SEOHead";
import { staffingUseCaseSchema, breadcrumbSchema } from "@/seo/schemas";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { GlobalNav } from "@/components/common/GlobalNav";

interface StaffingStageItem {
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

const STAFFING_STAGES: StaffingStageItem[] = [
  {
    id: "stage-1",
    stageNumber: "01",
    timing: "Day -3 Pre-Due",
    title: "VMS Timesheet Confirmation & Pre-Due Audit",
    tone: "Courteous & Administrative",
    badge: "bg-white/[0.04] text-zinc-300 border-white/[0.08]",
    psychology:
      "Eliminates delayed payments caused by unapproved timesheets sitting in manager inboxes past weekly billing cutoffs.",
    description:
      "Verifies that contractor hours, bill rates, and client hiring manager signoffs are logged and approved in Fieldglass, Beeline, or Coupa before the client's bi-weekly AP check run locks.",
    subject: "Timesheet & VMS approval verification for Staffing Invoice #STF-7012 (PO #88419) due in 3 days",
    to: "staffing.ap@enterpriseclient.com (Accounts Payable)",
    cc: "engineering.hiring@enterpriseclient.com (Hiring Manager), billing@apexstaffing.com",
    sample: `Attention Accounts Payable (cc: Engineering Hiring Desk),

Sharing a proactive verification summary of staffing invoice #STF-7012 ($18,400.00) covering contract engineering placements for the October 1–15 billing cycle, due this Friday under Net 30 terms.

• Requisition Reference: Work Order #WO-4491 · PO #88419 · 4 Senior Software Engineers
• Attached: Approved supervisor timesheets, Fieldglass VMS export receipts & ACH remittance details

To ensure uninterrupted inclusion in your upcoming weekly disbursement run, please confirm that hiring manager timesheet approvals are fully logged in your VMS portal. You can verify timecards and confirm scheduled payment date below:`,
    guardrail:
      "Attaches verified timesheets, VMS work order IDs, and zero-login settlement link. Assumes administrative oversight.",
    actionPrompt: "Verify Timesheets & Confirm Remittance",
  },
  {
    id: "stage-2",
    stageNumber: "02",
    timing: "Days 1–7 Overdue",
    title: "AP Disbursement Check-in & Voucher Status",
    tone: "Friendly & Inquiring",
    badge: "bg-white/[0.04] text-zinc-300 border-white/[0.08]",
    psychology:
      "Most staffing payment delays in the first week stem from clerical voucher approval lag rather than intentional default.",
    description:
      "Polite administrative inquiry asking if the staffing invoice is scheduled for the upcoming weekly payment batch. Confirms voucher numbers and ACH remittance details.",
    subject: "Status Request: Staffing Invoice #STF-7012 ($18,400.00) scheduled disbursement",
    to: "staffing.ap@enterpriseclient.com, controller@enterpriseclient.com",
    sample: `Hello Accounts Payable and Finance Team,

Following up on staffing invoice #STF-7012 ($18,400.00) for placed engineering contractors, which matured earlier this week.

In contingent workforce management, initial payment delays are typically internal approval routing lags. Because our agency disburses contractor payroll every Friday, could you confirm whether voucher #STF-7012 is approved for this week's ACH disbursement run?

If you prefer to remit directly via corporate card or 1-click ACH without logging into a vendor portal, you can authorize payment here:`,
    guardrail:
      "Zero-login cryptographic settlement portal (/i/:token) for ACH, card, and wire payments.",
    actionPrompt: "Pay $18,400 via Secure Client Portal",
  },
  {
    id: "stage-3",
    stageNumber: "03",
    timing: "Days 8–14 Overdue",
    title: "Overtime Dispute Isolation & Base Hours Release",
    tone: "Commercial & Collaborative",
    badge: "bg-white/[0.04] text-zinc-300 border-white/[0.08]",
    psychology:
      "If overtime rates are queried, Jaktra freezes dunning on that item and collects undisputed base hours immediately.",
    description:
      "Direct outreach to the client's corporate controller. If overtime hours are queried, Jaktra isolates the discrepancy and prompts immediate release of undisputed base contractor hours.",
    subject: "Commercial Review: Invoice #STF-7012 is 12 days overdue ($18,400.00)",
    to: "staffing.ap@enterpriseclient.com, controller@enterpriseclient.com",
    cc: "engineering.hiring@enterpriseclient.com, account-director@apexstaffing.com",
    sample: `Attention Corporate Controller (cc: Hiring Leadership),

We noted your inquiry regarding the 6 hours of weekend overtime ($540.00) on Work Order #WO-4491. Our account director is verifying the emergency sprint sign-off with your engineering team.

While we audit this specific overtime line, we request the immediate release of the undisputed base hours balance of $17,860.00. Holding up full contractor billing over an unapproved overtime line creates severe weekly payroll float strain for our staffing practice.

You can authorize the undisputed $17,860.00 balance in one click below while we complete the overtime audit:`,
    guardrail:
      "Overtime queries trigger automatic dispute hold on collections for that line item.",
    actionPrompt: "Release Undisputed Base Balance ($17,860)",
  },
  {
    id: "stage-4",
    stageNumber: "04",
    timing: "Days 15–30 Critical",
    title: "Contractor Deployment Pause Warning",
    tone: "Formal & Leadership-Level",
    badge: "bg-white/[0.04] text-zinc-300 border-white/[0.08]",
    psychology:
      "Hiring managers take immediate internal action when project staffing and contractor continuity are at risk.",
    description:
      "Authoritative notice stating that ongoing contractor placement renewals, active shift staffing, or upcoming interview slates will be placed on credit hold until past-due balances are cleared.",
    subject: "STAFFING NOTICE: Placement renewal & shift hold alert for Account #ENT-809",
    to: "vp.hr@enterpriseclient.com, engineering.vp@enterpriseclient.com",
    cc: "cfo@enterpriseclient.com, executive-director@apexstaffing.com",
    sample: `Dear Enterprise Talent & Engineering Leadership,

Contingent staffing invoices for Account #ENT-809 remain past due with an aggregate delinquent balance of $36,800.00 across 2 placement cycles.

Our agency has continued funding weekly payroll and benefits for your 4 dedicated engineers in good faith. However, under our commercial credit policy, accounts past 25 days overdue trigger an automated contractor contract extension hold.

Please be advised that upcoming contractor contract renewals, active shift staffing, and candidate interview submittals will be placed on credit hold in 3 business days unless past-due balances are reconciled.

To clear delinquent balances and protect team continuity on active engineering sprints, remit directly below:`,
    guardrail:
      "CCs designated enterprise recruitment directors to safeguard the commercial account relationship.",
    actionPrompt: "Confirm Remittance & Maintain Shift Staffing",
  },
  {
    id: "stage-5",
    stageNumber: "05",
    timing: "Day 31+ Legal Halt",
    title: "Stage 5 Legal Stop & Agency Leadership Review",
    tone: "Final Demand / Certified Audit Review",
    badge: "bg-white/[0.04] text-zinc-300 border-white/[0.08]",
    psychology:
      "100% human-in-the-loop review required before any legal demand or collections handoff.",
    description:
      "Autonomous messaging strictly halts. Compiles complete invoice billing records, debtor reply transcripts, and communications history for agency leadership or legal counsel.",
    subject: "FINAL DEMAND: Master Staffing Agreement Enforcement Review (#ENT-809)",
    to: "cfo@enterpriseclient.com, legal@enterpriseclient.com",
    cc: "managing-partner@apexstaffing.com, general-counsel@apexstaffing.com",
    sample: `FINAL NOTICE: Account #ENT-809 has exceeded all commercial credit boundaries with an unresolved past-due balance of $36,800.00 at 45 days past due under Master Staffing Agreement #MSA-992.

All automated communications have concluded. A certified staffing audit package—including countersigned work orders, badge-swipe timesheet logs, VMS transmittals, and payroll disbursement records—has been submitted to agency leadership and general counsel for formal collections placement and statutory labor lien review.

To prevent formal third-party enforcement or commercial credit reporting, execute an immediate digital settlement via our verified client portal:`,
    guardrail:
      "100% human-in-the-loop review required before legal transfer or collections placement.",
    actionPrompt: "Immediate Digital Cure via Portal",
  },
];

const FAQS = [
  {
    q: "How does Jaktra help staffing firms eliminate expensive payroll factoring?",
    a: "Staffing agencies must disburse payroll to placed contractors every Friday, but corporate clients often take 50 to 75 days to pay invoices. This forces agencies into payroll factoring facilities that charge 2.0% to 4.0% of gross invoice volume. Jaktra closes this cash conversion gap by accelerating client collections using automated 5-stage tone escalation, pre-due VMS verification, and zero-login digital payment links, allowing firms to fund payroll from operating cash flow and cancel factoring lines.",
  },
  {
    q: "What happens when a client disputes a timesheet or overtime calculation?",
    a: "A missing timesheet approval or disputed overtime rate is the #1 reason client AP departments delay paying staffing bills. When a client replies stating 'timesheet not approved by manager' or 'overtime rate discrepancy', Jaktra's DisputeSentinel parses the email, tags the dispute type, freezes all automated follow-ups immediately on that item, isolates the undisputed base hours, and alerts your staffing account manager with an AI-generated briefing.",
  },
  {
    q: "How does Jaktra handle Vendor Management Systems (VMS) like Fieldglass, Beeline, and Coupa?",
    a: "In VMS environments, payment timing hinges on whether timesheets are released into the system before the client's billing cutoff. Jaktra coordinates collaborative Stage 1 check-ins 3 days prior to due date, reminding client hiring managers and AP contacts to verify VMS approval so payments are not pushed to the next bi-weekly cycle.",
  },
  {
    q: "Can enterprise clients settle invoices via ACH, Wire, or corporate cards?",
    a: "Yes. Jaktra embeds cryptographic, zero-login payment links (/i/:token) in communications. Corporate AP teams can view full invoice statements, backup timesheets, and remit payments via bank transfer (ACH, Wire, NetBanking) or corporate cards in 30 seconds without creating an account.",
  },
  {
    q: "How does Jaktra preserve client relationships during collection escalation?",
    a: "Enterprise clients are high-value commercial accounts that provide recurring staffing placements. Jaktra's tone modulation maintains a collaborative, administrative tone in early stages, framing outreach as helpful verification of hours worked rather than aggressive debt collection, while strictly adhering to a 20-hour contact barrier.",
  },
  {
    q: "Does Jaktra integrate with staffing ATS platforms like Bullhorn or Avionté?",
    a: "Yes. Jaktra connects directly with Bullhorn, Avionté, JobDiva, and TargetRecruit via API and universal CSV, pulling contractor placement records, billing rates, and client contacts automatically.",
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
    id: "construction",
    name: "Commercial Subcontractors",
    terms: "Net 30–60 / Progress AIA Billing",
    url: "/use-cases/construction",
    icon: HardHat,
  },
];

export function StaffingRecruitingUseCase() {
  const [activeStageId, setActiveStageId] = useState<string>("stage-1");
  const [copiedStage, setCopiedStage] = useState<boolean>(false);

  const activeStage = STAFFING_STAGES.find((s) => s.id === activeStageId) || STAFFING_STAGES[0];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStage(true);
    setTimeout(() => setCopiedStage(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#010102] text-[#f7f8f8] font-sans antialiased selection:bg-[#5e6ad2]/30 selection:text-white">
      <SEOHead
        title="AI Accounts Receivable for Staffing & Recruiting — Jaktra"
        description="Escape payroll factoring, resolve timesheet disputes, and accelerate enterprise client collections with Jaktra's AI accounts receivable agent for staffing."
        canonicalPath="/use-cases/staffing-recruiting"
        jsonLd={[
          staffingUseCaseSchema,
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Industry Solutions", path: "/use-cases" },
            { name: "Staffing & Recruiting AR", path: "/use-cases/staffing-recruiting" },
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
            Staffing &amp; Recruiting AR
          </span>
        </nav>

        {/* Hero Section: Editorial & Strategic Focus */}
        <header className="mb-14 max-w-5xl">
          <h1 className="text-3xl sm:text-4xl lg:text-[40px] xl:text-[46px] font-extrabold tracking-tight text-white leading-[1.18] mb-5">
            <span className="block">Stop Weekly Payroll Deficit Float</span>
            <span className="block">&amp; VMS Timesheet Delays from Straining Cash</span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-300 leading-relaxed mb-6 max-w-3xl">
            Staffing agencies disburse contractor payroll every Friday, but corporate clients take 50 to 75 days to pay. Jaktra automates pre-due VMS timesheet verifications, isolates overtime disputes, and accelerates collections to cancel expensive payroll factoring lines.
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
            <span className="text-zinc-400 hidden sm:inline">For Staffing Founders, Managing Directors &amp; Controllers</span>
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
                  Modulates from pre-due timesheet audits to formal contractor deployment hold notices.
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
                  Tokenized settlement links let enterprise AP authorize ACH or wires without login friction.
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
                  NLP isolates unapproved overtime while prompting immediate payment of base contractor hours.
                </p>
                <div className="pt-3 border-t border-white/[0.05] flex items-center gap-2 text-[11px] text-zinc-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
                  <span>Timesheet Dispute Sentinel</span>
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
                  Direct REST API or CSV sync with Bullhorn, Avionté, JobDiva, or QuickBooks.
                </p>
                <div className="pt-3 border-t border-white/[0.05] flex items-center gap-2 text-[11px] text-zinc-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#b7d2f8] shrink-0 shadow-[0_0_6px_rgba(183,210,248,0.6)]" />
                  <span>Staffing ATS &amp; ERP Sync</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3 Core Staffing Dilemmas */}
        <section id="dilemmas" className="border-t border-white/[0.08] pt-16 pb-16">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono uppercase tracking-widest text-zinc-400 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shadow-[0_0_6px_rgba(244,63,94,0.6)]" />
                Operational Breakdown
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-[1.2]">
                Why Staffing Receivables Suffer Chronic Delays
              </h2>
            </div>
            <p className="text-sm sm:text-base text-zinc-400 max-w-md leading-relaxed lg:pb-1">
              Contingent workforce cash flow breaks down when unapproved client timesheets collide with legally mandated Friday contractor payrolls.
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
                  VMS Delays
                </span>
                <h3 className="text-xl font-bold tracking-tight text-white mb-3 group-hover:text-[#b7d2f8] transition-colors">
                  Unapproved Supervisor Timesheets
                </h3>
                <p className="text-xs sm:text-[13px] text-zinc-400 leading-relaxed mb-6">
                  Timesheets sit unapproved in client hiring manager inboxes past weekly cutoffs, bumping payments into subsequent bi-weekly cycles.
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
                    Automates proactive Day -3 checks to confirm VMS approval receipt before payment runs lock, eliminating last-minute invoice holds.
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
                  Payroll Float
                </span>
                <h3 className="text-xl font-bold tracking-tight text-white mb-3 group-hover:text-[#b7d2f8] transition-colors">
                  Friday Contractor Payroll Deficits
                </h3>
                <p className="text-xs sm:text-[13px] text-zinc-400 leading-relaxed mb-6">
                  Agencies must disburse wages weekly, but clients take 60 days to pay, creating severe cash deficits that force firms onto expensive factoring lines.
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
                    Accelerates enterprise collections to 22 days, allowing staffing agencies to fund payroll from operating cash and cancel factoring fees.
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
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 px-2.5 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06]">
                    Dilemma 03
                  </span>
                </div>

                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
                  Recruiter Conflict
                </span>
                <h3 className="text-xl font-bold tracking-tight text-white mb-3 group-hover:text-[#b7d2f8] transition-colors">
                  Recruiters Acting as Debt Collectors
                </h3>
                <p className="text-xs sm:text-[13px] text-zinc-400 leading-relaxed mb-6">
                  Forcing recruitment directors to chase client hiring managers for invoice signoffs destroys placement relationships and submittal momentum.
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
                    Acts as an institutional finance desk, keeping recruiters completely insulated so they can focus on candidate sourcing and headcount delivery.
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
                The 5-Stage Staffing Receivables Cadence
              </h2>
            </div>
            <p className="text-sm text-zinc-400 max-w-xl leading-relaxed">
              Progressive communication that protects client hiring goodwill early and halts gracefully before legal action.
            </p>
          </div>

          {/* Interactive Horizontal Stage Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mb-8">
            {STAFFING_STAGES.map((s) => {
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
                    const toLine = `To: ${activeStage.to || "staffing.ap@enterpriseclient.com"}\n`;
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
                    <span className="text-zinc-300 break-words">{activeStage.to || "staffing.ap@enterpriseclient.com"}</span>
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
                      <span className="text-zinc-300">finance@apexstaffing.com (via Jaktra)</span>
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
                The Macro Anatomy of Staffing Payroll Float Deficits
              </h2>
            </div>
            <p className="text-sm sm:text-base text-zinc-400 max-w-md leading-relaxed lg:pb-1">
              Data across commercial, healthcare, and IT staffing agencies indicates that over 80% of overdue balances stem from supervisor timesheet approval lag rather than corporate default.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-white/[0.01] backdrop-blur-md relative overflow-hidden">
              <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-3 flex items-center justify-between">
                <span>DSO Velocity Benchmark</span>
                <span className="text-[#b7d2f8] bg-[#b7d2f8]/10 px-2 py-0.5 rounded border border-[#b7d2f8]/20">Staffing Sector</span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
                51 Days
              </div>
              <p className="text-xs sm:text-[13px] text-zinc-300 leading-relaxed mb-4">
                Median Days Sales Outstanding across commercial staffing firms. Agencies utilizing automated pre-due VMS matching compress DSO to 22 days.
              </p>
              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-400 font-mono">
                <span>Target Compression:</span>
                <span className="text-emerald-400 font-bold">-29 Days Speedup</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-white/[0.01] backdrop-blur-md relative overflow-hidden">
              <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-3 flex items-center justify-between">
                <span>Timesheet Root Cause</span>
                <span className="text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">VMS Approval Lag</span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
                67%
              </div>
              <p className="text-xs sm:text-[13px] text-zinc-300 leading-relaxed mb-4">
                Of payment holds result from timesheet friction: unapproved manager signoffs (41%), overtime authorization disputes (16%), or VMS work order mapping errors (10%).
              </p>
              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-400 font-mono">
                <span>Insolvency Share:</span>
                <span className="text-zinc-300 font-bold">&lt; 4% Real Default</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-white/[0.01] backdrop-blur-md relative overflow-hidden">
              <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-3 flex items-center justify-between">
                <span>Factoring Fee Drain</span>
                <span className="text-rose-400 bg-rose-400/10 px-2 py-0.5 rounded border border-rose-400/20">Margin Siphon</span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
                28%
              </div>
              <p className="text-xs sm:text-[13px] text-zinc-300 leading-relaxed mb-4">
                Of total agency net profit margin is surrendered to payroll factoring facilities simply to fund weekly contractor wage distributions.
              </p>
              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-400 font-mono">
                <span>Preservation Upside:</span>
                <span className="text-[#b7d2f8] font-bold">100% Recaptured Fees</span>
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
                Payroll Factoring vs. Recruiter Manual Chasing vs. Jaktra
              </h2>
            </div>
            <p className="text-sm sm:text-base text-zinc-400 max-w-md leading-relaxed lg:pb-1">
              Compare how each approach handles Friday payroll liquidity, timesheet disputes, and client hiring manager goodwill.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#0e0f11] shadow-xl">
            <table className="w-full text-left text-sm border-collapse min-w-[720px]">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                  <th className="py-4 px-5 font-mono text-xs uppercase tracking-wider text-zinc-400 w-1/4">Workflow Dimension</th>
                  <th className="py-4 px-5 font-mono text-xs uppercase tracking-wider text-zinc-400 w-1/4">Payroll Factoring Companies</th>
                  <th className="py-4 px-5 font-mono text-xs uppercase tracking-wider text-zinc-400 w-1/4">Recruiter Manual Chasing</th>
                  <th className="py-4 px-5 font-mono text-xs uppercase tracking-wider text-[#b7d2f8] bg-[#b7d2f8]/5 w-1/4">Jaktra Autonomous AR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-xs sm:text-[13px]">
                <tr className="hover:bg-white/[0.015] transition-colors">
                  <td className="py-4 px-5 font-semibold text-white">Net Margin Protection</td>
                  <td className="py-4 px-5 text-zinc-400 leading-relaxed">Charges 2% to 4% fee on all gross billing, wiping out net profit.</td>
                  <td className="py-4 px-5 text-zinc-400 leading-relaxed">Zero fee, but weekly payroll float causes crippling bank overdrafts.</td>
                  <td className="py-4 px-5 text-white bg-[#b7d2f8]/5 font-medium leading-relaxed">Keeps 100% of staffing margin; accelerates cash recovery to 22 days.</td>
                </tr>
                <tr className="hover:bg-white/[0.015] transition-colors">
                  <td className="py-4 px-5 font-semibold text-white">Timesheet &amp; Overtime Triage</td>
                  <td className="py-4 px-5 text-zinc-400 leading-relaxed">Recourses invoice back to agency if client questions 4 overtime hours.</td>
                  <td className="py-4 px-5 text-zinc-400 leading-relaxed">Recruiters spend days tracking down client managers for approvals.</td>
                  <td className="py-4 px-5 text-white bg-[#b7d2f8]/5 font-medium leading-relaxed">NLP isolates disputed overtime, secures base contractor hours instantly.</td>
                </tr>
                <tr className="hover:bg-white/[0.015] transition-colors">
                  <td className="py-4 px-5 font-semibold text-white">Pre-Due VMS Verification</td>
                  <td className="py-4 px-5 text-zinc-400 leading-relaxed">Waits until maturity; hits client AP with aggressive form letters.</td>
                  <td className="py-4 px-5 text-zinc-400 leading-relaxed">Inconsistent; recruiters forget to verify VMS status until past due.</td>
                  <td className="py-4 px-5 text-white bg-[#b7d2f8]/5 font-medium leading-relaxed">Proactive Day -3 check verifies VMS signoffs before payment runs lock.</td>
                </tr>
                <tr className="hover:bg-white/[0.015] transition-colors">
                  <td className="py-4 px-5 font-semibold text-white">Client Hiring Goodwill</td>
                  <td className="py-4 px-5 text-zinc-400 leading-relaxed">Factors send aggressive assignment notices that upset HR buyers.</td>
                  <td className="py-4 px-5 text-zinc-400 leading-relaxed">Recruiters acting as bill collectors damages submittal trust.</td>
                  <td className="py-4 px-5 text-white bg-[#b7d2f8]/5 font-medium leading-relaxed">Institutional billing buffer protects recruitment submittal momentum.</td>
                </tr>
                <tr className="hover:bg-white/[0.015] transition-colors">
                  <td className="py-4 px-5 font-semibold text-white">Settlement Rails Friction</td>
                  <td className="py-4 px-5 text-zinc-400 leading-relaxed">Paper check lockboxes or complex factor assignment notices.</td>
                  <td className="py-4 px-5 text-zinc-400 leading-relaxed">Static PDF attachments requiring manual batch wire setup.</td>
                  <td className="py-4 px-5 text-white bg-[#b7d2f8]/5 font-medium leading-relaxed">Zero-login tokenized link; AP authorizes ACH or wire in 30 seconds.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Staffing Stack & Ecosystem Architecture */}
        <section id="integrations" className="border-t border-white/[0.08] pt-16 pb-16">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono uppercase tracking-widest text-zinc-400 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_6px_rgba(192,132,252,0.6)]" />
                Technical Interoperability
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-[1.2]">
                Plugs Directly into Your Staffing ATS &amp; Payroll Stack
              </h2>
            </div>
            <p className="text-sm sm:text-base text-zinc-400 max-w-md leading-relaxed lg:pb-1">
              Zero code required. Jaktra operates seamlessly alongside your applicant tracking systems, VMS portals, and payroll ledgers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-white/[0.01] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8] mb-4">
                  <UserCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-1.5">Staffing ATS</h3>
                <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                  Real-time synchronization pulls placed contractor hours, bill rates, and client hiring contacts.
                </p>
              </div>
              <div className="pt-3 border-t border-white/[0.06] flex flex-wrap gap-1.5 text-[11px] font-mono text-zinc-300">
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">Bullhorn</span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">Avionté</span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">JobDiva</span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">TargetRecruit</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-white/[0.01] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8] mb-4">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-1.5">VMS Environments</h3>
                <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                  Attaches verified supervisor timesheets and VMS work order IDs to billing records.
                </p>
              </div>
              <div className="pt-3 border-t border-white/[0.06] flex flex-wrap gap-1.5 text-[11px] font-mono text-zinc-300">
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">SAP Fieldglass</span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">Beeline</span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">Coupa VMS</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-white/[0.01] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8] mb-4">
                  <Database className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-1.5">Payroll &amp; Accounting</h3>
                <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                  Reconciles cash receipts, updates contractor billing aging, and pushes write-backs.
                </p>
              </div>
              <div className="pt-3 border-t border-white/[0.06] flex flex-wrap gap-1.5 text-[11px] font-mono text-zinc-300">
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">QuickBooks Online</span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">ADP Workforce</span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">NetSuite</span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">Gusto</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-white/[0.01] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8] mb-4">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-1.5">B2B Settlement Rails</h3>
                <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                  Cryptographic portal enables corporate clients to authorize ACH and wires in 30 seconds.
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
                48-Hour Staffing Agency Deployment
              </h2>
            </div>
            <p className="text-sm sm:text-base text-zinc-400 max-w-md leading-relaxed lg:pb-1">
              Roll out autonomous staffing receivables governance without disrupting recruiter workflows or Friday contractor payroll runs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0e0f11] relative">
              <span className="text-xs font-mono text-zinc-500 uppercase block mb-3">Step 01 · 5 Mins</span>
              <h3 className="text-base font-bold text-white mb-2">Ingest ATS Open Placements</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Connect your staffing ATS (Bullhorn, Avionté, JobDiva) or upload an open invoice CSV file with client AP email records.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0e0f11] relative">
              <span className="text-xs font-mono text-zinc-500 uppercase block mb-3">Step 02 · 15 Mins</span>
              <h3 className="text-base font-bold text-white mb-2">Configure VMS Verification</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Set up automated Day -3 pre-due courtesy check-ins with attached supervisor timesheets and requisition numbers.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0e0f11] relative">
              <span className="text-xs font-mono text-zinc-500 uppercase block mb-3">Step 03 · 10 Mins</span>
              <h3 className="text-base font-bold text-white mb-2">Activate Overtime Sentinel</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Establish rules to isolate disputed overtime hours while automatically securing remittance of undisputed base contractor wages.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0e0f11] relative">
              <span className="text-xs font-mono text-zinc-500 uppercase block mb-3">Step 04 · Continuous</span>
              <h3 className="text-base font-bold text-white mb-2">Autonomously Reconcile</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Client payments reconcile automatically as deposits clear via 1-click links, pushing ledger entries to your ATS and accounting software.
              </p>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section id="faqs" className="border-t border-white/[0.08] pt-16 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-4 space-y-4">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-1">
                Staffing AR FAQs
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Frequently Asked Questions for Staffing Leaders
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                How Jaktra eliminates payroll factoring fees, speeds up client collections, and isolates timesheet disputes.
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
              Recapture Staffing Margins &amp; Fund Payroll from Cash
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed">
              Import open invoices via CSV or ATS in 5 minutes. Stop losing thousands to payroll factoring fees and recover working capital immediately.
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

export default StaffingRecruitingUseCase;

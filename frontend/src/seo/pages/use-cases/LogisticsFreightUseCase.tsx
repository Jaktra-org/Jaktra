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
  Boxes,
  UserCheck,
  HardHat,
  Truck,
  Database,
  Layers,
  FileText,
} from "lucide-react";
import { SEOHead } from "@/seo/components/SEOHead";
import { logisticsUseCaseSchema, breadcrumbSchema } from "@/seo/schemas";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { GlobalNav } from "@/components/common/GlobalNav";

interface LogisticsStageItem {
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

const LOGISTICS_STAGES: LogisticsStageItem[] = [
  {
    id: "stage-1",
    stageNumber: "01",
    timing: "Day -3 Pre-Due",
    title: "POD & Rate Con Verification Cadence",
    tone: "Polite & Administrative",
    badge: "bg-white/[0.04] text-zinc-300 border-white/[0.08]",
    psychology:
      "Stops shippers from waiting 45 days before casually claiming they are missing a delivery receipt, signed Bill of Lading, or lumper ticket.",
    description:
      "Proactively confirms with shipper accounts payable that signed Bills of Lading (BOL), rate confirmations, and lumper receipts are attached and approved for the upcoming weekly payment run.",
    subject: "Delivery documentation confirmation: Freight Invoice #FRT-5109 (Load #88214 Chicago-Dallas) due in 3 days",
    to: "freight.ap@shipperlogistics.com (Transportation Accounts Payable)",
    cc: "logistics.coordinator@shipperlogistics.com",
    sample: `Attention Transportation Accounts Payable,

Sharing a proactive documentation verification copy of freight bill #FRT-5109 ($4,850.00) covering dry van truckload delivery from Chicago, IL to Dallas, TX (Load #88214), due this Thursday under Net 30 terms.

• Load Reference: Load #88214 · Rate Con #RC-99120 · Delivered On-Time Nov 12
• Attached: Clear signed Bill of Lading (BOL), certified delivery timestamp & stamped lumper receipt ($150.00)

To ensure this freight bill is approved for your upcoming weekly payment run, please confirm that all delivery documentation matches your TMS receiving records. You can verify docs and confirm scheduled payment date below:`,
    guardrail:
      "Attaches verified rate confirmation, signed BOL, and zero-login settlement link. Zero aggressive language.",
    actionPrompt: "Verify Delivery Docs & Confirm Remittance",
  },
  {
    id: "stage-2",
    stageNumber: "02",
    timing: "Days 1–7 Overdue",
    title: "AP Batch Status & Scheduled Run Check",
    tone: "Friendly & Solution-Oriented",
    badge: "bg-white/[0.04] text-zinc-300 border-white/[0.08]",
    psychology:
      "Most shipper payment delays in the first week are administrative batch timing lags rather than refusal to pay.",
    description:
      "Polite administrative check-in asking if the freight bill is queued in the upcoming weekly disbursement cycle. Confirms voucher numbers and direct deposit dates.",
    subject: "Status Request: Freight Bill #FRT-5109 ($4,850.00) scheduled disbursement",
    to: "freight.ap@shipperlogistics.com, controller@shipperlogistics.com",
    sample: `Hello Transportation Billing Desk,

Checking in regarding freight bill #FRT-5109 ($4,850.00) for completed truckload delivery on Load #88214, which matured earlier this week.

In freight operations, delays are frequently administrative batch timing lags rather than dispute issues. To keep our carrier capacity aligned with your upcoming lane tenders, could you confirm whether this voucher is queued for this week's ACH run?

If you prefer to remit directly via corporate card or 1-click ACH without logging into a carrier portal, you can authorize payment here:`,
    guardrail:
      "Embeds zero-login cryptographic payment link (/i/:token) for instant settlement with zero passwords required.",
    actionPrompt: "Pay $4,850 via Secure Shipper Portal",
  },
  {
    id: "stage-3",
    stageNumber: "03",
    timing: "Days 8–14 Overdue",
    title: "Accessorial Dispute Isolation & Linehaul Release",
    tone: "Commercial & Collaborative",
    badge: "bg-white/[0.04] text-zinc-300 border-white/[0.08]",
    psychology:
      "Prevents a minor $150 detention dispute from freezing a $4,500 linehaul freight invoice for 60+ days.",
    description:
      "When a shipper disputes detention hours, pallet charges, or fuel variances, Jaktra's NLP DisputeSentinel isolates the contested fee, halts dunning on that portion, and prompts immediate disbursement of undisputed base linehaul funds.",
    subject: "Accessorial Isolation: Requesting base linehaul release on Freight Bill #FRT-5109",
    to: "freight.ap@shipperlogistics.com, logistics.manager@shipperlogistics.com",
    cc: "director.transportation@shipperlogistics.com",
    sample: `Attention Transportation Controller (cc: Logistics Management),

We noted your inquiry regarding the 2-hour detention charge ($150.00) on Load #88214. Our tracking desk is auditing receiver facility GPS geofence in-and-out logs with the motor carrier.

While we resolve this specific accessorial item, we request the immediate release of the undisputed base linehaul balance of $4,700.00. Freezing full truckload payment over a minor accessorial line strains carrier cash flow and jeopardizes dedicated lane capacity.

You can authorize the undisputed $4,700.00 payment in one click below while our audit team finishes the detention review:`,
    guardrail:
      "NLP isolates contested accessory lines and secures undisputed base linehaul payment immediately.",
    actionPrompt: "Release Undisputed Linehaul Balance ($4,700)",
  },
  {
    id: "stage-4",
    stageNumber: "04",
    timing: "Days 15–30 Critical",
    title: "Carrier Capacity Hold & Dedicated Lane Warning",
    tone: "Formal & Leadership-Level",
    badge: "bg-white/[0.04] text-zinc-300 border-white/[0.08]",
    psychology:
      "Shipper supply chain directors prioritize carrier payment when dedicated freight capacity and load coverage are threatened.",
    description:
      "Executive notice warning the shipper's transportation director that prolonged payment delays place future truckload tender acceptance and contract lane pricing on credit hold.",
    subject: "CAPACITY ALERT: Dedicated Lane Tender Hold Notice for Account #SHP-902",
    to: "vp.supplychain@shipperlogistics.com, director.transportation@shipperlogistics.com",
    cc: "brokerage-vp@apexfreight.com",
    sample: `Dear Supply Chain Leadership,

Freight invoices for Account #SHP-902 remain past due with an aggregate delinquent balance of $18,200.00 across 4 completed loads.

We have continued providing contracted truckload capacity and honoring contract lane rates in good faith. However, under our transportation credit policy, accounts past 25 days overdue are subject to a tender acceptance freeze.

Please be advised that future dedicated lane tenders, drop-trailer programs, and spot rate locks will be placed on credit hold in 3 business days unless past-due balances are reconciled.

To clear the delinquent balance and preserve uninterrupted carrier capacity, remit directly below:`,
    guardrail:
      "Pre-notifies your brokerage VP and designated enterprise logistics account executive before sending.",
    actionPrompt: "Clear Past-Due Balance to Protect Lane Capacity",
  },
  {
    id: "stage-5",
    stageNumber: "05",
    timing: "Day 31+ Legal Halt",
    title: "Brokerage Credit Committee File Freeze & Bond Audit",
    tone: "Final Demand / Human Review",
    badge: "bg-white/[0.04] text-zinc-300 border-white/[0.08]",
    psychology:
      "Zero automated spam. Complete transparency and human approval required before formal broker bond filings.",
    description:
      "Autonomous messaging strictly halts. Compiles complete freight billing records, delivery confirmation notices, and communications transcripts for human credit leadership, collection placement, or formal bond filings.",
    subject: "FINAL DEMAND: Transportation Broker Agreement Credit Halt & Bond Filing Review (#SHP-902)",
    to: "cfo@shipperlogistics.com, legal@shipperlogistics.com",
    cc: "managing-broker@apexfreight.com, legal@apexfreight.com",
    sample: `FINAL NOTICE: Account #SHP-902 has exceeded all commercial credit parameters with an unresolved delinquent balance of $18,200.00 at 45 days past due.

All autonomous communications have concluded. A certified transportation audit package—including signed bills of lading, rate confirmations, EDI 214 delivery timestamps, and communication transcripts—has been compiled for brokerage credit committee and legal counsel review regarding formal collections placement and shipper bond filings.

To prevent formal third-party enforcement or commercial credit bureau reporting, execute an immediate digital settlement via our verified shipper portal:`,
    guardrail:
      "100% human-in-the-loop review required before legal transfer, bond claims, or collections placement.",
    actionPrompt: "Immediate Digital Cure via Certified Portal",
  },
];

const FAQS = [
  {
    q: "How does Jaktra help freight brokers escape high-cost invoice factoring?",
    a: "Freight factoring companies charge 2.5% to 5.0% of gross invoice volume simply to advance cash because shippers take 50–75 days to pay. On a $500,000 monthly freight book, factoring siphons $15,000/month in fees—often exceeding total net profits. Jaktra accelerates shipper collection cycles through automated tone escalation, instant zero-login digital payment links, and automated dispute triage, enabling brokers to self-fund carrier payouts and eliminate factoring fees.",
  },
  {
    q: "How does Jaktra handle detention, lumper, and accessorial billing disputes?",
    a: "Accessorial charges (detention hours, lumper receipts, layovers) are the #1 cause of shipper invoice payment delays. When a shipper replies stating 'detention not pre-approved' or 'missing signed lumper slip', Jaktra's DisputeSentinel parses the reply using NLP, immediately freezes automated collection cadences, tags the dispute type, and isolates the undisputed base linehaul for immediate payment.",
  },
  {
    q: "What happens if a shipper is missing a signed Bill of Lading (BOL) or POD?",
    a: "Shipper AP departments routinely sit on invoices for 30+ days before casually notifying you that they lack a signed POD. Jaktra solves this by initiating collaborative Stage 1 check-ins 3 days prior to due date that explicitly confirm receipt of the rate confirmation and delivery paperwork, preventing last-minute payment halts.",
  },
  {
    q: "Can enterprise shippers pay via ACH, Wire, or corporate credit cards?",
    a: "Yes. Jaktra embeds cryptographic, zero-login payment links (/i/:token) in every communication. Shippers can review their full freight invoice statement and remit payment in 30 seconds via bank transfer (ACH, Wire, NetBanking) or corporate cards with zero account creation required.",
  },
  {
    q: "How does the contact barrier protect shipper relationships?",
    a: "Freight brokerages rely heavily on shipper goodwill to secure tender volume. In Jaktra, idempotency rules enforce a strict 20-hour contact barrier, preventing multiple automated emails from hitting the same shipper in a single day and protecting your sender domain reputation.",
  },
  {
    q: "Does Jaktra integrate with modern Transportation Management Systems (TMS)?",
    a: "Yes. Jaktra integrates directly with industry-leading TMS platforms like McLeod Software, AscendTMS, Rose Rocket, and Turvo via REST API and universal CSV load reports, pulling rate cons and POD attachments automatically.",
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

export function LogisticsFreightUseCase() {
  const [activeStageId, setActiveStageId] = useState<string>("stage-1");
  const [copiedStage, setCopiedStage] = useState<boolean>(false);

  const activeStage = LOGISTICS_STAGES.find((s) => s.id === activeStageId) || LOGISTICS_STAGES[0];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStage(true);
    setTimeout(() => setCopiedStage(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#010102] text-[#f7f8f8] font-sans antialiased selection:bg-[#5e6ad2]/30 selection:text-white">
      <SEOHead
        title="AI Accounts Receivable for Logistics & Freight — Jaktra"
        description="Escape freight invoice factoring, resolve detention disputes, and accelerate shipper payments with Jaktra's AI accounts receivable agent for 3PL brokers."
        canonicalPath="/use-cases/logistics-freight"
        jsonLd={[
          logisticsUseCaseSchema,
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Industry Solutions", path: "/use-cases" },
            { name: "Logistics & Freight AR", path: "/use-cases/logistics-freight" },
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
            Logistics &amp; Freight AR
          </span>
        </nav>

        {/* Hero Section: Editorial & Strategic Focus */}
        <header className="mb-14 max-w-5xl">
          <h1 className="text-3xl sm:text-4xl lg:text-[40px] xl:text-[46px] font-extrabold tracking-tight text-white leading-[1.18] mb-5">
            <span className="block">Stop Factoring Fees &amp; POD Disputes</span>
            <span className="block">from Siphoning Freight Brokerage Margins</span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-300 leading-relaxed mb-6 max-w-3xl">
            Freight factoring companies siphon 3% to 5% of your gross billing simply because shippers pay on 50-to-75 day cycles. Jaktra automates pre-due POD verification, isolates detention disputes, and accelerates shipper cash flow so brokers can self-fund carrier payouts.
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
            <span className="text-zinc-400 hidden sm:inline">For 3PL Founders, Freight Broker CFOs &amp; Dispatch Leads</span>
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
                  Modulates from pre-due POD verification to formal dedicated lane tender capacity warnings.
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
                  Tokenized settlement links let shippers authorize bank wires or ACH in 30 seconds.
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
                  NLP isolates contested detention fees while securing release of undisputed base linehaul funds.
                </p>
                <div className="pt-3 border-t border-white/[0.05] flex items-center gap-2 text-[11px] text-zinc-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
                  <span>Accessorial Triage Sentinel</span>
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
                  Direct REST API or CSV sync with McLeod, AscendTMS, Samsara, or QuickBooks.
                </p>
                <div className="pt-3 border-t border-white/[0.05] flex items-center gap-2 text-[11px] text-zinc-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#b7d2f8] shrink-0 shadow-[0_0_6px_rgba(183,210,248,0.6)]" />
                  <span>TMS &amp; Ledger Integration</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3 Core Freight Dilemmas */}
        <section id="dilemmas" className="border-t border-white/[0.08] pt-16 pb-16">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono uppercase tracking-widest text-zinc-400 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shadow-[0_0_6px_rgba(244,63,94,0.6)]" />
                Operational Breakdown
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-[1.2]">
                Why Freight Receivables Break Down
              </h2>
            </div>
            <p className="text-sm sm:text-base text-zinc-400 max-w-md leading-relaxed lg:pb-1">
              Shipper AP desks use paperwork technicalities and unapproved accessorials to stall payments, forcing brokers into predatory factoring agreements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Dilemma 01 */}
            <div className="relative rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-white/[0.01] backdrop-blur-md p-6 lg:p-7 flex flex-col justify-between hover:border-white/[0.16] hover:bg-white/[0.025] transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.36)] group overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#b7d2f8]/30 to-transparent group-hover:via-[#b7d2f8]/60 transition-all duration-500" />
              
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 rounded-xl bg-[#b7d2f8]/10 border border-[#b7d2f8]/20 flex items-center justify-center text-[#b7d2f8] shadow-[0_0_20px_rgba(183,210,248,0.12)] group-hover:scale-105 group-hover:border-[#b7d2f8]/40 transition-all">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 px-2.5 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06]">
                    Dilemma 01
                  </span>
                </div>

                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
                  Paperwork Stalls
                </span>
                <h3 className="text-xl font-bold tracking-tight text-white mb-3 group-hover:text-[#b7d2f8] transition-colors">
                  Delayed PODs &amp; Missing Lumper Tickets
                </h3>
                <p className="text-xs sm:text-[13px] text-zinc-400 leading-relaxed mb-6">
                  Shippers routinely sit on delivery invoices for 45+ days before casually notifying dispatch that they are missing a signed POD or receipt.
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
                    Initiates automated Day -3 pre-due check-ins confirming delivery paperwork receipt before scheduled payment runs, preventing last-minute holds.
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
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 px-2.5 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06]">
                    Dilemma 02
                  </span>
                </div>

                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
                  Margin Drain
                </span>
                <h3 className="text-xl font-bold tracking-tight text-white mb-3 group-hover:text-[#b7d2f8] transition-colors">
                  Predatory Factoring Fees
                </h3>
                <p className="text-xs sm:text-[13px] text-zinc-400 leading-relaxed mb-6">
                  Brokers give away 3% to 5% of gross invoice volume to factoring companies just to pay carriers on time while shippers take 60+ days to remit.
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
                    Accelerates direct shipper collections to 24 days, allowing freight brokers to self-fund carrier payouts and eliminate factoring costs.
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
                    <Truck className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 px-2.5 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06]">
                    Dilemma 03
                  </span>
                </div>

                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
                  Accessorial Disputes
                </span>
                <h3 className="text-xl font-bold tracking-tight text-white mb-3 group-hover:text-[#b7d2f8] transition-colors">
                  Detention &amp; Accessorial Freezes
                </h3>
                <p className="text-xs sm:text-[13px] text-zinc-400 leading-relaxed mb-6">
                  A contested $150 detention fee frequently freezes an entire $5,000 linehaul freight bill for months while clerks argue over gate logs.
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
                    NLP isolates the disputed accessorial amount, pauses dunning on that item, and prompts the shipper to release base linehaul immediately.
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
                The 5-Stage Freight Receivables Cadence
              </h2>
            </div>
            <p className="text-sm text-zinc-400 max-w-xl leading-relaxed">
              Progressive communication that protects shipper tender goodwill early and halts gracefully before legal bond enforcement.
            </p>
          </div>

          {/* Interactive Horizontal Stage Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mb-8">
            {LOGISTICS_STAGES.map((s) => {
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
                    const toLine = `To: ${activeStage.to || "freight.ap@shipperlogistics.com"}\n`;
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
                    <span className="text-zinc-300 break-words">{activeStage.to || "freight.ap@shipperlogistics.com"}</span>
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
                      <span className="text-zinc-300">freight-billing@apexfreight.com (via Jaktra)</span>
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
                The Macro Anatomy of Freight Receivables Drag
              </h2>
            </div>
            <p className="text-sm sm:text-base text-zinc-400 max-w-md leading-relaxed lg:pb-1">
              Data across North American freight brokerages and 3PLs shows that over 80% of overdue balances stem from paperwork disputes and batch timing rather than shipper default.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-white/[0.01] backdrop-blur-md relative overflow-hidden">
              <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-3 flex items-center justify-between">
                <span>DSO Velocity Benchmark</span>
                <span className="text-[#b7d2f8] bg-[#b7d2f8]/10 px-2 py-0.5 rounded border border-[#b7d2f8]/20">Freight / 3PL</span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
                53 Days
              </div>
              <p className="text-xs sm:text-[13px] text-zinc-300 leading-relaxed mb-4">
                Median Days Sales Outstanding across non-asset freight brokerages. Brokers utilizing automated POD verification compress DSO to 24 days.
              </p>
              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-400 font-mono">
                <span>Target Compression:</span>
                <span className="text-emerald-400 font-bold">-29 Days Speedup</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-white/[0.01] backdrop-blur-md relative overflow-hidden">
              <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-3 flex items-center justify-between">
                <span>Paperwork Root Cause</span>
                <span className="text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">POD &amp; Accessorials</span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
                72%
              </div>
              <p className="text-xs sm:text-[13px] text-zinc-300 leading-relaxed mb-4">
                Of payment holds result from paperwork claims: missing signed POD (38%), unapproved detention charges (22%), or missing lumper tickets (12%).
              </p>
              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-400 font-mono">
                <span>Insolvency Share:</span>
                <span className="text-zinc-300 font-bold">&lt; 4% Real Default</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-white/[0.01] backdrop-blur-md relative overflow-hidden">
              <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-3 flex items-center justify-between">
                <span>Factoring Fee Drain</span>
                <span className="text-rose-400 bg-rose-400/10 px-2 py-0.5 rounded border border-rose-400/20">Profit Erosion</span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
                15%
              </div>
              <p className="text-xs sm:text-[13px] text-zinc-300 leading-relaxed mb-4">
                Of total brokerage net margin is surrendered to invoice factoring companies simply to advance cash for carrier QuickPay disbursements.
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
                Freight Factoring vs. Dispatch Manual Chasing vs. Jaktra
              </h2>
            </div>
            <p className="text-sm sm:text-base text-zinc-400 max-w-md leading-relaxed lg:pb-1">
              Compare how each operating model impacts gross margin retention, shipper relationships, and carrier QuickPay funding.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#0e0f11] shadow-xl">
            <table className="w-full text-left text-sm border-collapse min-w-[720px]">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                  <th className="py-4 px-5 font-mono text-xs uppercase tracking-wider text-zinc-400 w-1/4">Workflow Dimension</th>
                  <th className="py-4 px-5 font-mono text-xs uppercase tracking-wider text-zinc-400 w-1/4">Freight Factoring Companies</th>
                  <th className="py-4 px-5 font-mono text-xs uppercase tracking-wider text-zinc-400 w-1/4">Manual Dispatch Chasing</th>
                  <th className="py-4 px-5 font-mono text-xs uppercase tracking-wider text-[#b7d2f8] bg-[#b7d2f8]/5 w-1/4">Jaktra Autonomous AR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-xs sm:text-[13px]">
                <tr className="hover:bg-white/[0.015] transition-colors">
                  <td className="py-4 px-5 font-semibold text-white">Gross Margin Retention</td>
                  <td className="py-4 px-5 text-zinc-400 leading-relaxed">Charges 2.5% to 5.0% fee on every load, destroying brokerage margins.</td>
                  <td className="py-4 px-5 text-zinc-400 leading-relaxed">Zero fee, but cash stays locked for 60+ days, starving carrier payouts.</td>
                  <td className="py-4 px-5 text-white bg-[#b7d2f8]/5 font-medium leading-relaxed">Keeps 100% of freight margin; accelerates cash recovery to 24 days.</td>
                </tr>
                <tr className="hover:bg-white/[0.015] transition-colors">
                  <td className="py-4 px-5 font-semibold text-white">Detention &amp; Accessorial Triage</td>
                  <td className="py-4 px-5 text-zinc-400 leading-relaxed">Recourses entire invoice back to broker if shipper disputes $150.</td>
                  <td className="py-4 px-5 text-zinc-400 leading-relaxed">Brokers lose hours arguing over GPS logs while linehaul stalls.</td>
                  <td className="py-4 px-5 text-white bg-[#b7d2f8]/5 font-medium leading-relaxed">NLP isolates disputed fee, secures undisputed base linehaul immediately.</td>
                </tr>
                <tr className="hover:bg-white/[0.015] transition-colors">
                  <td className="py-4 px-5 font-semibold text-white">Pre-Due POD Verification</td>
                  <td className="py-4 px-5 text-zinc-400 leading-relaxed">Waits until default; hits shipper with cold automated collection letters.</td>
                  <td className="py-4 px-5 text-zinc-400 leading-relaxed">Brokers only discover missing PODs 30+ days after load delivery.</td>
                  <td className="py-4 px-5 text-white bg-[#b7d2f8]/5 font-medium leading-relaxed">Proactive Day -3 check-in verifies POD receipt before payment runs.</td>
                </tr>
                <tr className="hover:bg-white/[0.015] transition-colors">
                  <td className="py-4 px-5 font-semibold text-white">Shipper Lane Goodwill</td>
                  <td className="py-4 px-5 text-zinc-400 leading-relaxed">Aggressive factor collections alienate Fortune 500 transportation leads.</td>
                  <td className="py-4 px-5 text-zinc-400 leading-relaxed">Inconsistent chasing damages broker professionalism and tender access.</td>
                  <td className="py-4 px-5 text-white bg-[#b7d2f8]/5 font-medium leading-relaxed">Polite, human-grade tone escalation protects multi-year contract lanes.</td>
                </tr>
                <tr className="hover:bg-white/[0.015] transition-colors">
                  <td className="py-4 px-5 font-semibold text-white">Settlement Rails Friction</td>
                  <td className="py-4 px-5 text-zinc-400 leading-relaxed">Paper check lockboxes or complex factor assignment notices.</td>
                  <td className="py-4 px-5 text-zinc-400 leading-relaxed">Static PDF attachments requiring manual batch wire setup.</td>
                  <td className="py-4 px-5 text-white bg-[#b7d2f8]/5 font-medium leading-relaxed">Zero-login cryptographic link; AP authorizes ACH or wire in 30 seconds.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Transportation Stack & Ecosystem Architecture */}
        <section id="integrations" className="border-t border-white/[0.08] pt-16 pb-16">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono uppercase tracking-widest text-zinc-400 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_6px_rgba(192,132,252,0.6)]" />
                Technical Interoperability
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-[1.2]">
                Plugs Directly into Your Freight &amp; TMS Ecosystem
              </h2>
            </div>
            <p className="text-sm sm:text-base text-zinc-400 max-w-md leading-relaxed lg:pb-1">
              Zero code required. Jaktra operates seamlessly alongside your existing transportation management systems and accounting software.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-white/[0.01] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8] mb-4">
                  <Truck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-1.5">Transportation TMS</h3>
                <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                  Real-time synchronization pulls delivered load records, rate confirmations, and billing emails.
                </p>
              </div>
              <div className="pt-3 border-t border-white/[0.06] flex flex-wrap gap-1.5 text-[11px] font-mono text-zinc-300">
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">McLeod Software</span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">AscendTMS</span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">Rose Rocket</span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">Turvo</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-white/[0.01] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8] mb-4">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-1.5">Telematics &amp; Visibility</h3>
                <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                  Verifies geofence timestamps and delivery milestones to resolve detention claims.
                </p>
              </div>
              <div className="pt-3 border-t border-white/[0.06] flex flex-wrap gap-1.5 text-[11px] font-mono text-zinc-300">
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">Samsara</span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">Motive</span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">Project44</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-white/[0.01] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8] mb-4">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-1.5">Freight Payment Rails</h3>
                <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                  Tokenized portal enables shippers to authorize corporate ACH and direct wire transfers.
                </p>
              </div>
              <div className="pt-3 border-t border-white/[0.06] flex flex-wrap gap-1.5 text-[11px] font-mono text-zinc-300">
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">TriumphPay</span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">ACH Direct</span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">Fedwire</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-white/[0.01] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8] mb-4">
                  <Database className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-1.5">Accounting Ledgers</h3>
                <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                  Automatically writes back reconciled payments and updates shipper aging buckets.
                </p>
              </div>
              <div className="pt-3 border-t border-white/[0.06] flex flex-wrap gap-1.5 text-[11px] font-mono text-zinc-300">
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">QuickBooks Online</span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">NetSuite</span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">Xero</span>
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
                48-Hour Brokerage Deployment Playbook
              </h2>
            </div>
            <p className="text-sm sm:text-base text-zinc-400 max-w-md leading-relaxed lg:pb-1">
              Roll out autonomous freight collections without changing your dispatch software or adding back-office head count.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0e0f11] relative">
              <span className="text-xs font-mono text-zinc-500 uppercase block mb-3">Step 01 · 5 Mins</span>
              <h3 className="text-base font-bold text-white mb-2">Ingest TMS Open Receivables</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Connect your TMS (McLeod, AscendTMS, Rose Rocket) or upload an open load report CSV with shipper AP email records.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0e0f11] relative">
              <span className="text-xs font-mono text-zinc-500 uppercase block mb-3">Step 02 · 15 Mins</span>
              <h3 className="text-base font-bold text-white mb-2">Configure POD Verification</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Set up automated Day -3 pre-due courtesy check-ins with attached delivery receipts and signed bills of lading.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0e0f11] relative">
              <span className="text-xs font-mono text-zinc-500 uppercase block mb-3">Step 03 · 10 Mins</span>
              <h3 className="text-base font-bold text-white mb-2">Activate Accessorial Sentinel</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Establish rules to isolate contested detention fees while automatically securing release of undisputed base linehaul funds.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0e0f11] relative">
              <span className="text-xs font-mono text-zinc-500 uppercase block mb-3">Step 04 · Continuous</span>
              <h3 className="text-base font-bold text-white mb-2">Autonomously Reconcile</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Shipper payments reconcile automatically as deposits clear via 1-click links, pushing ledger entries to your TMS and accounting system.
              </p>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section id="faqs" className="border-t border-white/[0.08] pt-16 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-4 space-y-4">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-1">
                Freight AR FAQs
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Frequently Asked Questions for Freight Brokers &amp; 3PLs
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                How Jaktra eliminates factoring fees, accelerates shipper payments, and isolates detention disputes.
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
              Recapture Freight Margins &amp; Accelerate Shipper Cash Flow
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed">
              Import open loads via CSV or TMS in 5 minutes. Stop losing thousands to factoring fees and recover working capital immediately.
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

export default LogisticsFreightUseCase;

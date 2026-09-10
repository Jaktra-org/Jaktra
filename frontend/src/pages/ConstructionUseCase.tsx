import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ShieldCheck,
  Clock,
  Hammer,
  Calculator,
  FileCheck2,
  AlertCircle,
  Shield,
  Calendar,
} from "lucide-react";
import jaktraLogo from "../assets/jaktra_svg.svg";
import { SEOHead } from "../components/common/SEOHead";
import { constructionUseCaseSchema, breadcrumbSchema } from "../components/common/seo-schemas";
import { LandingFooter } from "../components/landing/LandingFooter";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

function HeaderNav() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-[#0a0a0b]/90 backdrop-blur-md border-b border-white/[0.08]">
      <div className="max-w-6xl mx-auto h-full px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 text-decoration-none">
          <img src={jaktraLogo} alt="Jaktra" width={24} height={24} className="h-6 w-6 block" />
          <span className="font-semibold text-white text-lg tracking-tight font-sans">Jaktra</span>
        </Link>
        <div className="flex items-center gap-4 sm:gap-6">
          <Link to="/pricing" className="text-sm text-zinc-400 hover:text-white transition-colors hidden sm:block">
            Pricing
          </Link>
          <Link to="/features" className="text-sm text-zinc-400 hover:text-white transition-colors hidden sm:block">
            Features
          </Link>
          <Link to="/use-cases" className="text-sm text-zinc-400 hover:text-white transition-colors hidden sm:block">
            Use Cases
          </Link>
          <Link to="/compare" className="text-sm text-zinc-400 hover:text-white transition-colors hidden sm:block">
            Compare
          </Link>
          <Link to="/resources" className="text-sm text-zinc-400 hover:text-white transition-colors hidden sm:block">
            Resources
          </Link>
          <Link to="/login" className="text-sm text-zinc-300 hover:text-white transition-colors">
            Sign in
          </Link>
          <Link
            to="/register"
            className="text-xs sm:text-sm font-medium bg-white text-zinc-950 px-3.5 py-1.5 rounded-lg hover:bg-zinc-200 transition-colors shadow-sm"
          >
            Get started free
          </Link>
        </div>
      </div>
    </header>
  );
}

interface ConstructionStageItem {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  timing: string;
  tone: string;
  badge: string;
  description: string;
  safeguardTitle: string;
  safeguardDesc: string;
}

const CONSTRUCTION_STAGES: ConstructionStageItem[] = [
  {
    id: "stage-1",
    number: "01",
    title: "Pay App & Lien Waiver Pre-Due Confirmation",
    subtitle: "Verifies AIA G702/G703 paperwork before the monthly billing cycle closes",
    timing: "Day -5 to Due Date",
    tone: "Courteous, Administrative",
    badge: "Day -5 Pre-Due",
    description: "Verifies that AIA G702/G703 payment applications, conditional lien waivers, and certified payroll records were logged before the general contractor's monthly billing window closes.",
    safeguardTitle: "Clerical Safeguard",
    safeguardDesc: "Eliminates the classic GC excuse: \"We never received your monthly waiver paperwork.\"",
  },
  {
    id: "stage-2",
    number: "02",
    title: "Owner Funding & Disbursement Check-in",
    subtitle: "Respectful inquiry regarding project owner funding releases and payment batch dates",
    timing: "Days 1–14 Overdue",
    tone: "Friendly, Inquiring, Respectful",
    badge: "Days 1–14 Overdue",
    description: "Polite inquiry regarding project owner funding releases and the GC's scheduled payment batch date. Accommodates pay-when-paid realities without creating unnecessary adversarial tension.",
    safeguardTitle: "Dispute Agent",
    safeguardDesc: "If the GC cites owner non-payment or architect punch lists, Jaktra tags status and pauses aggressive steps.",
  },
  {
    id: "stage-3",
    number: "03",
    title: "Direct GC Controller & Installment Resolution",
    subtitle: "Commercial coordination offering structured milestone installments for stalled disbursements",
    timing: "Days 15–25 Overdue",
    tone: "Professional, Firm, Commercial",
    badge: "Days 15–25 Overdue",
    description: "Direct communication with the GC's chief accounting officer. If project disbursements are stalled, Jaktra offers milestone installment options to maintain cash flow while protecting project staffing.",
    safeguardTitle: "Zero-Login Portal",
    safeguardDesc: "Allows instant settlement via Razorpay (NEFT, corporate NetBanking, cards) from job-site mobile devices.",
  },
  {
    id: "stage-4",
    number: "04",
    title: "Project Executive & Jobsite Staffing Warning",
    subtitle: "Direct notice that prolonged receivables lag threatens trade staffing and jobsite mobilization",
    timing: "Days 26–30 Overdue",
    tone: "Formal, Direct, High-Stakes",
    badge: "Days 26–30 Critical",
    description: "Authoritative executive communication warning that prolonged receivables lag directly threatens upcoming trade staffing, material procurement, and jobsite mobilization.",
    safeguardTitle: "Commercial Coordination",
    safeguardDesc: "Automatically loops in your project executive and lead estimator before sending.",
  },
  {
    id: "stage-5",
    number: "05",
    title: "Lien Rights Protection & Legal Stop",
    subtitle: "Dunning halts; compiles documentation for statutory mechanics lien deadlines",
    timing: "Day 31+ Overdue",
    tone: "Final Demand / Statutory Preservation",
    badge: "Day 31+ (Legal Halt)",
    description: "Autonomous dunning strictly halts. Locks all communication logs and prepares certified documentation for legal counsel ahead of statutory preliminary notice or mechanics lien deadlines (Miller Act / state lien laws).",
    safeguardTitle: "Compliance Guardrail",
    safeguardDesc: "100% human credit committee review required before filing formal mechanics lien claims.",
  },
];

export default function ConstructionUseCase() {
  // Calculator State
  const [contractVolume, setContractVolume] = useState<number>(6000000);
  const [baselineDso, setBaselineDso] = useState<number>(82);
  const [retainagePercent, setRetainagePercent] = useState<number>(10);
  const [targetDsoReduction, setTargetDsoReduction] = useState<number>(15);
  const interestRate = 0.095; // 9.5% commercial line of credit / payroll factoring rate

  const totalCapitalTrapped = (contractVolume / 365) * baselineDso;
  const retainageTrapped = contractVolume * (retainagePercent / 100);
  const annualFinancingCost = totalCapitalTrapped * interestRate;

  // Transparent treasury formula based on simulated reduction goal
  const freedCapital = (contractVolume / 365) * targetDsoReduction;
  const annualInterestSaved = freedCapital * interestRate;

  const faqs = [
    {
      q: "How does Jaktra accommodate pay-when-paid clauses and owner billing cycles?",
      a: "Commercial trade contractors often deal with general contractors waiting on project owner disbursements. Rather than blasting aggressive overdue demands that antagonize the GC, Jaktra initiates courteous administrative check-ins (Stage 1 & 2) that verify whether pay application paperwork, lien waivers, and certified payroll records are approved. If the GC indicates the owner hasn't released funds, our NLP agent tags the status, adjusts the follow-up cadence, and alerts your project executive.",
    },
    {
      q: "What happens when a general contractor disputes a change order or punch-list item?",
      a: "In construction, billing disputes over unapproved change orders or disputed punch-list items can freeze an entire monthly application. Jaktra's DisputeAgent parses inbound emails from project managers and GCs. If an email mentions disputed change orders, defective work, or retainage withholdings, Jaktra immediately tags the invoice as 'disputed', halts automated dunning cadences, and drafts a resolution briefing for your billing manager.",
    },
    {
      q: "Can Jaktra track and accelerate retainage releases?",
      a: "Yes. Retainage (often 5%–10% withheld until project substantial completion) is one of the biggest drains on subcontractor balance sheets. Jaktra supports distinct retainage milestone tracking, deploying tailored, cordial inquiry sequences once certificates of occupancy or substantial completion are issued to ensure retainage is not forgotten by the GC’s accounting department.",
    },
    {
      q: "How does the Stage 5 Legal Stop protect preliminary notice and mechanics lien rights?",
      a: "Statutory deadlines for mechanics liens and Miller Act bond claims typically range from 60 to 90 days from the last date labor or materials were furnished. Jaktra’s Stage 5 Legal Stop strictly halts automated communications at 31+ days overdue, locking the audit log and escalating the delinquent account to your legal/credit team well in advance of statutory lien notice deadlines.",
    },
    {
      q: "Can GC project managers pay or approve milestone invoices from mobile devices?",
      a: "Yes. General contractors and project executives are frequently on job sites without access to desktop computers. Jaktra sends cryptographic, zero-login payment links (/i/:token) that allow GC personnel to inspect the invoice statement and approve payment directly from their mobile phone via Razorpay rails without logging into an account.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#f5f5f5] font-sans selection:bg-[#b7d2f8]/20 selection:text-white antialiased">
      <SEOHead
        title="AI Accounts Receivable Automation for Construction & Subcontractors | Jaktra"
        description="Accelerate cash flow for commercial contractors and specialty trades. Automate progress billing reminders, triage change-order disputes, track retainage releases, and cut construction DSO with Jaktra."
        canonicalPath="/use-cases/construction"
        jsonLd={[
          constructionUseCaseSchema,
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Use Cases", path: "/use-cases" },
            { name: "Construction & Subcontractors", path: "/use-cases/construction" },
          ]),
        ]}
      />

      <HeaderNav />

      <main className="pt-28 sm:pt-32 pb-24 px-4 sm:px-6 max-w-5xl mx-auto relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(183,210,248,0.06),transparent)] pointer-events-none" />
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6 text-xs text-zinc-500 relative z-10">
          <ol className="flex items-center gap-2">
            <li>
              <Link to="/" className="hover:text-zinc-300 transition-colors">
                Home
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link to="/use-cases" className="hover:text-zinc-300 transition-colors">
                Use Cases
              </Link>
            </li>
            <li>/</li>
            <li className="text-zinc-300 font-medium" aria-current="page">
              Construction &amp; Subcontractors
            </li>
          </ol>
        </nav>

        {/* Hero Section */}
        <section className="text-center max-w-4xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-4">
            Commercial Contractors &amp; Specialty Trades
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-6 leading-tight">
            Eliminate the Construction Cash Crunch: Cut 80+ Day DSO and Recover Retainage
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 max-w-3xl mx-auto leading-relaxed mb-8">
            Trade contractors fund weekly payroll and materials while waiting 60 to 90+ days for pay applications. Jaktra automates progress billing check-ins, triages change-order disputes via AI, and accelerates cash flow without damaging GC relationships.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-200 transition-all shadow-md"
            >
              Get started free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/pricing"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white/5 border border-white/10 text-white font-medium text-sm hover:bg-white/10 transition-all"
            >
              Calculate your DSO ROI
            </Link>
          </div>
        </section>

        {/* The Construction Reality Callout */}
        <section className="mb-16 p-6 sm:p-8 rounded-2xl bg-[#111113] border border-white/[0.08]">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-[#b7d2f8] text-sm font-semibold mb-2">
                <AlertCircle className="w-4 h-4" />
                <span>The Longest Days Sales Outstanding (DSO) in the Economy</span>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Across commercial construction, the average DSO hovers between <strong className="text-white">75 and 85 days</strong>. With 10% retainage withholdings, pay-when-paid clauses, and unapproved change-order delays, subcontractors are forced into costly payroll line-of-credit financing.
              </p>
            </div>
            <Link
              to="/resources/how-to-reduce-dso"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 text-sm text-white font-medium transition-colors shrink-0"
            >
              <span>Read DSO Playbook</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Contractor Cash Flow Calculator */}
        <section className="mb-20 p-8 sm:p-10 rounded-2xl bg-[#111113] border border-white/[0.08]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-lg bg-[#b7d2f8]/10 border border-[#b7d2f8]/20 flex items-center justify-center">
              <Calculator className="w-5 h-5 text-[#b7d2f8]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Contractor Cash Flow &amp; Retainage Calculator</h2>
              <p className="text-xs sm:text-sm text-zinc-400">
                See how shortening your collection cycle unlocks working capital and slashes LOC interest fees.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Inputs */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <div className="flex justify-between text-xs text-zinc-400 mb-2">
                  <span>Annual Billing Volume:</span>
                  <span className="text-white font-mono font-semibold">${contractVolume.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="1000000"
                  max="25000000"
                  step="500000"
                  value={contractVolume}
                  onChange={(e) => setContractVolume(Number(e.target.value))}
                  className="w-full accent-[#b7d2f8] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-zinc-400 mb-2">
                  <span>Current Baseline DSO:</span>
                  <span className="text-white font-mono font-semibold">{baselineDso} days</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="120"
                  step="1"
                  value={baselineDso}
                  onChange={(e) => setBaselineDso(Number(e.target.value))}
                  className="w-full accent-[#b7d2f8] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-zinc-400 mb-2">
                  <span>Standard Retainage Withholding:</span>
                  <span className="text-white font-mono font-semibold">{retainagePercent}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  step="1"
                  value={retainagePercent}
                  onChange={(e) => setRetainagePercent(Number(e.target.value))}
                  className="w-full accent-[#b7d2f8] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-zinc-400 mb-2">
                  <span>Simulated DSO Compression Goal:</span>
                  <span className="text-white font-mono font-semibold">-{targetDsoReduction} days</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="35"
                  step="1"
                  value={targetDsoReduction}
                  onChange={(e) => setTargetDsoReduction(Number(e.target.value))}
                  className="w-full accent-[#b7d2f8] cursor-pointer"
                />
              </div>
            </div>

            {/* Right Metrics Box */}
            <div className="lg:col-span-6 p-6 rounded-xl bg-black/40 border border-white/[0.08] space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-zinc-900 border border-white/[0.05]">
                  <div className="text-xs text-zinc-500 mb-1">Total Trapped Working Capital</div>
                  <div className="text-2xl font-bold text-white font-mono">
                    ${Math.round(totalCapitalTrapped).toLocaleString()}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1">Locked in outstanding pay apps</div>
                </div>

                <div className="p-4 rounded-lg bg-zinc-900 border border-white/[0.05]">
                  <div className="text-xs text-zinc-500 mb-1">Retainage Trapped on Jobs</div>
                  <div className="text-2xl font-bold text-white font-mono">
                    ${Math.round(retainageTrapped).toLocaleString()}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1">Withheld until final signoff</div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-white/[0.04] border border-white/[0.08]">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-300">Modeled Capital Released (-{targetDsoReduction} Days DSO):</span>
                  <span className="text-lg font-bold text-white font-mono">
                    +${Math.round(freedCapital).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/[0.08]">
                  <span className="text-[11px] text-zinc-400">Current Financing Cost (9.5%):</span>
                  <span className="text-xs text-zinc-400 font-mono">
                    ${Math.round(annualFinancingCost).toLocaleString()} / yr
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1 pt-1 border-t border-white/5">
                  <span className="text-[11px] text-zinc-300 font-medium">Modeled Annual LOC Interest Saved:</span>
                  <span className="text-sm font-semibold text-[#b7d2f8] font-mono">
                    ${Math.round(annualInterestSaved).toLocaleString()} / year
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5-STAGE TONE ESCALATION - Open Cadence Architecture */}
        <section className="mb-20 sm:mb-24">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-2">
              Construction AR Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              5-Stage Tone Escalation Workflow for Contractors
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
              How Jaktra balances respectful progress billing follow-ups with statutory mechanics lien protections.
            </p>
          </div>

          {/* Quick-Glance Cadence Table */}
          <div className="mb-10 overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#111113]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                  <th className="py-3.5 px-4 font-semibold text-zinc-300">Stage &amp; Timing</th>
                  <th className="py-3.5 px-4 font-semibold text-zinc-300">Tone Classification</th>
                  <th className="py-3.5 px-4 font-semibold text-zinc-300">Key Safeguard</th>
                  <th className="py-3.5 px-4 font-semibold text-zinc-300">Operational Objective</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {CONSTRUCTION_STAGES.map((s) => (
                  <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[#b7d2f8] font-bold">{s.number}</span>
                        <span className="font-medium text-white">{s.title}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-white/[0.04] text-zinc-300 border border-white/[0.06]">
                        {s.tone}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-300 font-medium">
                      <span className="text-[#b7d2f8] font-mono text-[11px] mr-1">[{s.safeguardTitle}]</span>
                      <span className="text-xs text-zinc-400">{s.safeguardDesc}</span>
                    </td>
                    <td className="py-3 px-4 text-zinc-400 font-mono text-[11px]">{s.timing}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Unrolled 5 Stage Cards */}
          <div className="space-y-5">
            {CONSTRUCTION_STAGES.map((stage) => (
              <div
                key={stage.id}
                className="rounded-2xl border border-white/[0.08] bg-[#111113] p-6 sm:p-7 hover:border-white/20 transition-all duration-300"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  <div className="lg:col-span-7 space-y-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-[#b7d2f8] bg-[#b7d2f8]/10 px-2.5 py-0.5 rounded-full border border-[#b7d2f8]/20">
                        Stage {stage.number}
                      </span>
                      <span className="text-xs font-mono text-zinc-400 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06]">
                        {stage.badge}
                      </span>
                      <span className="text-xs text-zinc-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-zinc-400" />
                        {stage.timing}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white tracking-tight">
                      {stage.title}
                    </h3>
                    <p className="text-xs text-[#b7d2f8] font-medium">
                      {stage.subtitle}
                    </p>
                    <p className="text-sm text-zinc-400 leading-relaxed pt-1">
                      {stage.description}
                    </p>
                  </div>

                  <div className="lg:col-span-5 rounded-xl bg-[#0a0a0b]/80 border border-white/[0.06] p-4 sm:p-5 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-white">
                      <Shield className="w-4 h-4 text-[#b7d2f8] shrink-0" />
                      <span>{stage.safeguardTitle}</span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {stage.safeguardDesc}
                    </p>
                    <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                      <span>Tone Profile:</span>
                      <span className="text-zinc-300">{stage.tone}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4 CORE PILLARS */}
        <section className="mb-20 sm:mb-24 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-[#111113] border border-white/[0.08] space-y-3">
            <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8]">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Pay App &amp; Lien Waiver Sync</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Jaktra coordinates gentle, administrative check-ins aligned with monthly application cutoff dates. Verifies whether AIA G702/G703 applications, conditional lien waivers, and backup documentation have been received by the GC before the billing window closes.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#111113] border border-white/[0.08] space-y-3">
            <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Change-Order &amp; Punch-List Triage</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              When a GC replies stating that a change order was not approved or that a punch-list inspection is pending, Jaktra’s NLP DisputeAgent automatically categorizes the inquiry, freezes automated cadences, and alerts your project executive.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#111113] border border-white/[0.08] space-y-3">
            <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8]">
              <Hammer className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Retainage Release Tracking</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Retainage accounts for the entire contractor profit margin on many jobs. Jaktra features dedicated retainage escalation workflows that trigger when substantial completion is logged, systematically ensuring retainage draws are processed.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#111113] border border-white/[0.08] space-y-3">
            <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8]">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Zero-Login Mobile Settlement</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Project superintendents and GC finance managers are rarely in front of a desk. Jaktra’s tokenized <code className="text-xs">/i/:token</code> portal allows GCs to view payment statements and authorize instant payment via Razorpay directly from mobile devices.
            </p>
          </div>
        </section>

        {/* COMPARISON TABLE */}
        <section className="mb-20 sm:mb-24">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Traditional Construction AR vs. Jaktra
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base">
              Eliminate the manual chasing cycles that lead to cash crunches and missed lien notice windows.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#111113] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse min-w-[680px]">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-white/[0.03] text-xs font-mono uppercase tracking-wider text-zinc-300">
                    <th className="py-4 px-6 font-semibold">Workflow</th>
                    <th className="py-4 px-6 font-semibold text-[#b7d2f8]">Jaktra Autonomous AR</th>
                    <th className="py-4 px-6 font-semibold text-zinc-400">Manual Subcontractor Chasing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05] text-xs sm:text-sm">
                  <tr className="hover:bg-white/[0.015] transition-colors">
                    <td className="py-4 px-6 font-medium text-white">Pay App Submission Check</td>
                    <td className="py-4 px-6 text-zinc-100 font-medium bg-white/[0.02]">
                      Automated pre-due waiver &amp; certified payroll verification
                    </td>
                    <td className="py-4 px-6 text-zinc-400">Discovered missing on cutoff day after GC rejects pay app</td>
                  </tr>
                  <tr className="hover:bg-white/[0.015] transition-colors">
                    <td className="py-4 px-6 font-medium text-white">Change-Order Disputes</td>
                    <td className="py-4 px-6 text-zinc-100 font-medium bg-white/[0.02]">
                      NLP halts dunning, routes dispute to PM immediately
                    </td>
                    <td className="py-4 px-6 text-zinc-400">Endless email threads; GC sits on entire pay app</td>
                  </tr>
                  <tr className="hover:bg-white/[0.015] transition-colors">
                    <td className="py-4 px-6 font-medium text-white">Retainage Recovery</td>
                    <td className="py-4 px-6 text-zinc-100 font-medium bg-white/[0.02]">
                      Dedicated substantial completion retainage cadence
                    </td>
                    <td className="py-4 px-6 text-zinc-400">Forgotten for 6+ months until final closeout audit</td>
                  </tr>
                  <tr className="hover:bg-white/[0.015] transition-colors">
                    <td className="py-4 px-6 font-medium text-white">Lien Deadline Safety</td>
                    <td className="py-4 px-6 text-zinc-100 font-medium bg-white/[0.02]">
                      Stage 5 Legal Stop halts at Day 31+ for attorney review
                    </td>
                    <td className="py-4 px-6 text-zinc-400">Lien rights expire silently at 60/90 days past last work</td>
                  </tr>
                  <tr className="hover:bg-white/[0.015] transition-colors">
                    <td className="py-4 px-6 font-medium text-white">Mobile Jobsite Payment</td>
                    <td className="py-4 px-6 text-zinc-100 font-medium bg-white/[0.02]">
                      Zero-login tokenized link (<code className="text-xs font-mono text-[#b7d2f8] bg-white/[0.05] px-1.5 py-0.5 rounded">/i/:token</code>)
                    </td>
                    <td className="py-4 px-6 text-zinc-400">Requires GC accounting desktop login and paper checks</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="max-w-4xl mx-auto px-2 py-12 mb-16 border-t border-white/[0.08]">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Frequently Asked Questions: Construction AR
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base">
              Common questions about automating progress billings, managing lien deadlines, and preserving contractor relationships.
            </p>
          </div>

          <Accordion type="single" variant="outline" defaultValue="faq-0" collapsible className="w-full">
            {faqs.map((faq, idx) => (
              <AccordionItem key={idx} value={`faq-${idx}`}>
                <AccordionTrigger>{faq.q}</AccordionTrigger>
                <AccordionContent>{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* BOTTOM CTA */}
        <section className="max-w-4xl mx-auto text-center border-t border-white/[0.08] pt-16">
          <div className="p-8 sm:p-12 rounded-2xl bg-gradient-to-b from-white/[0.04] to-transparent border border-white/[0.08]">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 font-display">
              Accelerate Construction Cash Flow with AI in 15 Minutes
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto text-sm sm:text-base mb-8">
              Connect your accounting system to Jaktra today. Free during Early Access with zero credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-200 transition-all shadow-lg"
              >
                Get started free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/pricing"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-white/5 border border-white/10 text-white font-medium text-sm hover:bg-white/10 transition-all"
              >
                Calculate your DSO ROI
              </Link>
            </div>
            <p className="text-xs text-zinc-500 mt-4">
              No credit card required • Deploy in 15 minutes • AES-256 encrypted
            </p>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}

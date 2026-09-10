import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ShieldCheck,
  Calculator,
  DollarSign,
  FileSpreadsheet,
  CheckCircle2,
  Shield,
  Calendar,
} from "lucide-react";
import jaktraLogo from "../assets/jaktra_svg.svg";
import { SEOHead } from "../components/common/SEOHead";
import { manufacturingUseCaseSchema, breadcrumbSchema } from "../components/common/seo-schemas";
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

interface ManufacturingStageItem {
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

const MANUFACTURING_STAGES: ManufacturingStageItem[] = [
  {
    id: "stage-1",
    number: "01",
    title: "Pre-Due ERP Matching & GRN Audit",
    subtitle: "Proactively confirms GRN, PO numbers, and delivery manifests before Net 60/90 terms expire",
    timing: "Day -15 to Due Date",
    tone: "Courteous, Administrative, Collaborative",
    badge: "Day -15 Pre-Due",
    description: "Proactively reaches out to corporate AP teams 15 days before the extended credit term expires. Confirms that goods receipt notes (GRN), purchase order numbers, and delivery manifests match their ERP batch queue, preventing silent clerical holds.",
    safeguardTitle: "Pre-Due Audit",
    safeguardDesc: "Direct AP email with secure PDF statement and itemized delivery confirmation link.",
  },
  {
    id: "stage-2",
    number: "02",
    title: "Receiving Dock & PO Discrepancy Triage",
    subtitle: "Isolates line-item price variances and dock delays while prompting undisputed payments",
    timing: "Days 1–7 Overdue",
    tone: "Friendly, Solution-Oriented",
    badge: "Days 1–7 Overdue",
    description: "When an industrial buyer states \"PO line item price variance\" or \"dock receiving pending sign-off\", Jaktra's NLP DisputeAgent classifies the ticket, freezes dunning sequences, and alerts your plant shipping team to upload proof of delivery.",
    safeguardTitle: "Dispute Agent",
    safeguardDesc: "Prompts buyer to remit undisputed line items immediately while the variance is investigated.",
  },
  {
    id: "stage-3",
    number: "03",
    title: "Structured Multi-Tranche Installment Engine",
    subtitle: "Enables 2x, 3x, or 4x milestone installment contracts for large machinery or bulk raw material orders",
    timing: "Days 8–20 Overdue",
    tone: "Professional, Firm, Commercial",
    badge: "Days 8–20 Overdue",
    description: "For large capital machinery or bulk raw material orders ($50,000+), demanding immediate full payment when a manufacturer faces inventory cycles can trigger insolvency. Jaktra enables structured milestone installment contracts directly inside the debtor portal.",
    safeguardTitle: "Active Installments",
    safeguardDesc: "Cadences switch exclusively to tracking upcoming installment due dates once agreed.",
  },
  {
    id: "stage-4",
    number: "04",
    title: "Procurement Credit Suspension Warning",
    subtitle: "Formal notice that upcoming supply chain runs and raw material shipments will be placed on credit hold",
    timing: "Days 21–30 Overdue",
    tone: "Formal, Direct, High-Stakes",
    badge: "Days 21–30 Critical",
    description: "Escalates to senior procurement directors and the Chief Financial Officer. Formally outlines that future supply chain runs and raw material shipments will be placed on credit hold unless the past-due balance is cleared.",
    safeguardTitle: "Executive Guardrail",
    safeguardDesc: "CCs designated enterprise sales and account directors to preserve commercial relationships.",
  },
  {
    id: "stage-5",
    number: "05",
    title: "Stage 5 Legal Stop & Executive Ledger Freeze",
    subtitle: "Autonomous dunning halts completely; compiles certified audit trail for human review",
    timing: "Day 31+ Overdue",
    tone: "Final Demand / Human Escalation Halt",
    badge: "Day 31+ (Legal Halt)",
    description: "Autonomous dunning shuts down completely to prevent compliance violations and relationship blowouts. Compiles a certified audit trail—including POs, signed BOLs, delivery receipts, and communication transcripts—ready for human credit committee or legal review.",
    safeguardTitle: "Compliance Halt",
    safeguardDesc: "100% human-in-the-loop review required before legal transfer or collections placement.",
  },
];

export function ManufacturingUseCase() {
  // Calculator State
  const [annualRevenue, setAnnualRevenue] = useState<number>(8000000);
  const [creditTermsDays, setCreditTermsDays] = useState<number>(60);
  const [avgDaysOverdue, setAvgDaysOverdue] = useState<number>(24);
  const [targetReductionDays, setTargetReductionDays] = useState<number>(14);
  const interestRate = 0.085; // 8.5% cost of capital

  const currentDso = creditTermsDays + avgDaysOverdue;
  const capitalTrapped = (annualRevenue / 365) * currentDso;
  const annualFinancingCost = capitalTrapped * interestRate;

  // Transparent treasury formula based on simulated reduction goal
  const simulatedReduction = Math.min(avgDaysOverdue, targetReductionDays);
  const freedCapital = (annualRevenue / 365) * simulatedReduction;
  const interestSaved = freedCapital * interestRate;

  const faqs = [
    {
      q: "How does Jaktra handle extended Net 60 and Net 90 payment terms?",
      a: "In long credit cycles, waiting until Day 61 to contact accounts payable creates massive working capital lag. Jaktra automates proactive, collaborative pre-due milestones (e.g., at Day 45 of a Net 60 term) to confirm invoice receipt, purchase order matching, and scheduled payment runs before the due date passes.",
    },
    {
      q: "What happens when a manufacturing buyer claims a missing PO or dock receiving delay?",
      a: "Over 40% of manufacturing invoice delays are clerical. Jaktra's NLP DisputeAgent classifies incoming emails referencing 'missing PO', 'wrong item description', or 'dock receipt pending' into sentiment categories. It automatically halts collection cadences and notifies your fulfillment team with an AI-drafted resolution response.",
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
      a: "Jaktra generates authenticated, tokenized debtor links where corporate buyers can pay via instant bank transfers (NEFT/RTGS, NetBanking) or corporate cards powered by live Razorpay payment rails, with real-time webhook confirmation.",
    },
    {
      q: "How does Jaktra prevent annoying enterprise procurement buyers with spam?",
      a: "Industrial relationships rely on multi-year trust. Jaktra enforces a strict 20-hour rolling idempotency barrier preventing multi-contact spam, while Stage 5 Legal Stop automatically freezes automated messaging at 31+ days overdue, ensuring all communication remains measured, professional, and compliant.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#f5f5f5] font-sans selection:bg-[#b7d2f8]/20 selection:text-white antialiased">
      <SEOHead
        title="AI Accounts Receivable Automation for Manufacturing & Industrial | Jaktra"
        description="Accelerate cash flow across industrial supply chains. Resolve PO matching disputes, manage Net 60/90 terms, and eliminate receivables drag with Jaktra's autonomous AI AR platform."
        canonicalPath="/use-cases/manufacturing"
        jsonLd={[
          manufacturingUseCaseSchema,
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Use Cases", path: "/use-cases" },
            { name: "Manufacturing & Industrial", path: "/use-cases/manufacturing" },
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
              Manufacturing &amp; Industrial
            </li>
          </ol>
        </nav>

        {/* Hero Section */}
        <section className="text-center max-w-4xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-4">
            Industrial Suppliers &amp; Contract Manufacturers
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-6 leading-tight">
            Stop PO Disputes &amp; Net 90 Terms from Trapping Industrial Cash Flow
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 max-w-3xl mx-auto leading-relaxed mb-8">
            Capital-intensive manufacturers face high raw material costs and 60-to-90-day buyer payment windows. Jaktra automates pre-due ERP matching check-ins, triages goods receipt disputes via NLP, and accelerates working capital recovery.
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

        {/* Capability Architecture Banner */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-20">
          <div className="rounded-2xl border border-white/[0.08] bg-[#111113] p-6 text-center">
            <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono mb-1">5 Stages</div>
            <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Tone Escalation Cadence</div>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-[#111113] p-6 text-center">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#b7d2f8] font-mono mb-1">Auto-Pause</div>
            <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider">PO Discrepancy NLP Triage</div>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-[#111113] p-6 text-center">
            <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono mb-1">Zero Login</div>
            <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Tokenized Settlement Portal</div>
          </div>
        </section>

        {/* Working Capital Drag Calculator */}
        <section className="rounded-2xl border border-white/[0.08] bg-[#111113] p-8 sm:p-10 mb-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-lg bg-[#b7d2f8]/10 border border-[#b7d2f8]/20 flex items-center justify-center">
              <Calculator className="w-5 h-5 text-[#b7d2f8]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Manufacturing Working Capital Drag Calculator</h2>
              <p className="text-xs sm:text-sm text-zinc-400">
                Model the financing cost of trapped receivables under extended credit terms and quantify potential cash release.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Input 1: Annual Revenue */}
            <div>
              <label htmlFor="annual-revenue-range" className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
                Annual B2B Revenue: <span className="text-white font-mono font-bold">${(annualRevenue / 1000000).toFixed(1)}M</span>
              </label>
              <input
                id="annual-revenue-range"
                type="range"
                min={1000000}
                max={25000000}
                step={500000}
                value={annualRevenue}
                onChange={(e) => setAnnualRevenue(Number(e.target.value))}
                className="w-full accent-[#b7d2f8] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-zinc-500 mt-1">
                <span>$1M</span>
                <span>$25M</span>
              </div>
            </div>

            {/* Input 2: Stated Credit Terms */}
            <div>
              <label htmlFor="credit-terms-select" className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
                Standard Credit Terms
              </label>
              <select
                id="credit-terms-select"
                value={creditTermsDays}
                onChange={(e) => setCreditTermsDays(Number(e.target.value))}
                className="w-full rounded-lg bg-zinc-900 border border-white/[0.08] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#b7d2f8]"
              >
                <option value={30}>Net 30 Days</option>
                <option value={45}>Net 45 Days</option>
                <option value={60}>Net 60 Days</option>
                <option value={90}>Net 90 Days</option>
              </select>
              <p className="text-[11px] text-zinc-500 mt-1.5">Baseline contract term extended.</p>
            </div>

            {/* Input 3: Days Overdue */}
            <div>
              <label htmlFor="days-overdue-range" className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
                Average Overdue Lag: <span className="text-white font-mono font-bold">+{avgDaysOverdue} Days</span>
              </label>
              <input
                id="days-overdue-range"
                type="range"
                min={5}
                max={60}
                step={1}
                value={avgDaysOverdue}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setAvgDaysOverdue(val);
                  if (targetReductionDays > val) setTargetReductionDays(val);
                }}
                className="w-full accent-zinc-400 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-zinc-500 mt-1">
                <span>5d</span>
                <span>60d</span>
              </div>
            </div>

            {/* Input 4: Target Reduction Goal */}
            <div>
              <label htmlFor="target-reduction-range" className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
                Simulated Target Reduction: <span className="text-[#b7d2f8] font-mono font-bold">-{simulatedReduction} Days</span>
              </label>
              <input
                id="target-reduction-range"
                type="range"
                min={1}
                max={avgDaysOverdue}
                step={1}
                value={targetReductionDays}
                onChange={(e) => setTargetReductionDays(Number(e.target.value))}
                className="w-full accent-[#b7d2f8] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-zinc-500 mt-1">
                <span>1d</span>
                <span>{avgDaysOverdue}d</span>
              </div>
            </div>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 rounded-xl bg-black/40 border border-white/[0.08]">
            <div>
              <div className="text-xs text-zinc-400 uppercase tracking-wider mb-1">Current Effective DSO</div>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-white">{currentDso} Days</div>
              <div className="text-xs text-zinc-500 mt-1">{creditTermsDays}d term + {avgDaysOverdue}d overdue</div>
            </div>
            <div>
              <div className="text-xs text-zinc-400 uppercase tracking-wider mb-1">Capital Trapped in AR</div>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-white">
                ${Math.round(capitalTrapped).toLocaleString()}
              </div>
              <div className="text-xs text-zinc-500 mt-1">${Math.round(annualFinancingCost).toLocaleString()}/yr financing cost (8.5%)</div>
            </div>
            <div>
              <div className="text-xs text-zinc-400 uppercase tracking-wider mb-1">Modeled Capital Released</div>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-white">
                +${Math.round(freedCapital).toLocaleString()}
              </div>
              <div className="text-xs text-zinc-500 mt-1">+${Math.round(interestSaved).toLocaleString()}/yr saved at modeled -{simulatedReduction}d</div>
            </div>
          </div>
        </section>

        {/* 5-STAGE CADENCE INTERACTIVE ACCORDION */}
        <section className="mb-20">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-2">
              Industrial AR Cadence
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Autonomous 5-Stage Cadence for Industrial Receivables
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
              Tailored for complex enterprise procurement cycles. Proactively catches clerical holds before due dates, triages goods receipt variances, and protects buyer relationships.
            </p>
          </div>

          {/* Quick-Glance Cadence Table */}
          <div className="mb-10 overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#111113]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                  <th className="py-3.5 px-4 font-semibold text-zinc-300">Stage &amp; Timing</th>
                  <th className="py-3.5 px-4 font-semibold text-zinc-300">Tone Classification</th>
                  <th className="py-3.5 px-4 font-semibold text-zinc-300">Supply Chain Safeguard</th>
                  <th className="py-3.5 px-4 font-semibold text-zinc-300">Operational Objective</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {MANUFACTURING_STAGES.map((s) => (
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
            {MANUFACTURING_STAGES.map((stage) => (
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

        {/* 3 CORE MANUFACTURING CHALLENGES */}
        <section className="space-y-6 mb-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Built Specifically for Industrial Supply Chains
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base">
              Solve the friction points that cause industrial invoices to stall in corporate procurement.
            </p>
          </div>

          <div className="space-y-4">
            {/* Dilemma 1 */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[#111113] border border-white/[0.08] hover:border-white/[0.18] transition-all duration-200 shadow-md">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="lg:w-5/12 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#b7d2f8]/10 border border-[#b7d2f8]/20 flex items-center justify-center text-[#b7d2f8] shrink-0">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#b7d2f8] uppercase tracking-wider">Clerical Reconciliation</span>
                    <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
                      Automated PO &amp; GRN Triage
                    </h3>
                    <div className="mt-1 text-xs font-mono text-zinc-400">
                      Zero manual spreadsheet chasing
                    </div>
                  </div>
                </div>

                <div className="lg:w-7/12 lg:border-l lg:border-white/[0.08] lg:pl-8">
                  <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                    Industrial AP teams routinely freeze payments when a line item price differs by pennies or when dock receiving slips are missing. Jaktra's NLP DisputeAgent classifies replies and alerts shipping coordinators instantly.
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-xs font-medium text-[#b7d2f8]">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Dispute quarantine prevents relationship friction while receiving slips are matched</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dilemma 2 */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[#111113] border border-white/[0.08] hover:border-white/[0.18] transition-all duration-200 shadow-md">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="lg:w-5/12 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8] shrink-0">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Flexible Liquidity</span>
                    <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
                      Milestone Installment Plans
                    </h3>
                    <div className="mt-1 text-xs font-mono text-zinc-400">
                      ActiveInstallmentContext tracking
                    </div>
                  </div>
                </div>

                <div className="lg:w-7/12 lg:border-l lg:border-white/[0.08] lg:pl-8">
                  <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                    Demanding immediate $50k+ lump sums when an industrial buyer faces liquidity cycles causes friction. Offer structured installment plans via zero-login debtor links (<code className="text-xs text-[#b7d2f8]">/i/:token</code>) without renegotiating contracts.
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-xs font-medium text-[#b7d2f8]">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Converts stalled high-ticket capital invoices into predictable installment inflows</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dilemma 3 */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[#111113] border border-white/[0.08] hover:border-white/[0.18] transition-all duration-200 shadow-md">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="lg:w-5/12 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8] shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Relationship Protection</span>
                    <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
                      20-Hour Anti-Spam Barrier
                    </h3>
                    <div className="mt-1 text-xs font-mono text-zinc-400">
                      100% human-in-the-loop audit
                    </div>
                  </div>
                </div>

                <div className="lg:w-7/12 lg:border-l lg:border-white/[0.08] lg:pl-8">
                  <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                    Industrial supplier relationships take years to build. Jaktra guarantees no customer receives duplicate reminders within 20 rolling hours, and halts automation entirely at Stage 5 before any legal or credit escalation.
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-xs font-medium text-[#b7d2f8]">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Hard limits on communication frequency ensure client executives are never annoyed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* COMPARISON TABLE */}
        <section className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Traditional Manufacturing AR vs. Jaktra
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base">
              Why manual spreadsheet tracking and legacy collectors fail extended supply chain terms.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#111113] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse min-w-[720px]">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-white/[0.03] text-xs font-mono uppercase tracking-wider text-zinc-300">
                    <th className="py-4 px-6 font-semibold">Capability</th>
                    <th className="py-4 px-6 font-semibold text-[#b7d2f8]">Jaktra Autonomous AR</th>
                    <th className="py-4 px-6 font-semibold text-zinc-400">Legacy Enterprise ERP</th>
                    <th className="py-4 px-6 font-semibold text-zinc-400">Manual Accounting Team</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05] text-xs sm:text-sm">
                  <tr className="hover:bg-white/[0.015] transition-colors">
                    <td className="py-4 px-6 font-medium text-white">Pre-Due Invoice Audit</td>
                    <td className="py-4 px-6 text-zinc-100 font-medium bg-white/[0.02]">Autonomous at Day -15 of Net 60/90</td>
                    <td className="py-4 px-6 text-zinc-400">None (waits until past due)</td>
                    <td className="py-4 px-6 text-zinc-400">Sporadic manual calendar reminders</td>
                  </tr>
                  <tr className="hover:bg-white/[0.015] transition-colors">
                    <td className="py-4 px-6 font-medium text-white">Dispute Classification</td>
                    <td className="py-4 px-6 text-zinc-100 font-medium bg-white/[0.02]">NLP categorizes PO/dock discrepancies</td>
                    <td className="py-4 px-6 text-zinc-400">Manual dispute flag in ledger</td>
                    <td className="py-4 px-6 text-zinc-400">Lost in credit controller inbox</td>
                  </tr>
                  <tr className="hover:bg-white/[0.015] transition-colors">
                    <td className="py-4 px-6 font-medium text-white">Payment Portal</td>
                    <td className="py-4 px-6 text-zinc-100 font-medium bg-white/[0.02]">Zero-login (<code className="text-xs font-mono text-[#b7d2f8] bg-white/[0.05] px-1.5 py-0.5 rounded">/i/:token</code>) + Razorpay Rails</td>
                    <td className="py-4 px-6 text-zinc-400">Complex ERP login with MFA</td>
                    <td className="py-4 px-6 text-zinc-400">Static bank wire instructions on PDF</td>
                  </tr>
                  <tr className="hover:bg-white/[0.015] transition-colors">
                    <td className="py-4 px-6 font-medium text-white">Installment Engine</td>
                    <td className="py-4 px-6 text-zinc-100 font-medium bg-white/[0.02]">Automated 2x/3x/4x milestone plans</td>
                    <td className="py-4 px-6 text-zinc-400">Manual ERP credit note adjustments</td>
                    <td className="py-4 px-6 text-zinc-400">Informal, untracked payment promises</td>
                  </tr>
                  <tr className="hover:bg-white/[0.015] transition-colors">
                    <td className="py-4 px-6 font-medium text-white">DSO Impact</td>
                    <td className="py-4 px-6 text-zinc-100 font-medium bg-white/[0.02]">Average 16–22 day reduction</td>
                    <td className="py-4 px-6 text-zinc-400">Static reporting without action</td>
                    <td className="py-4 px-6 text-zinc-400">High headcount cost, linear scaling</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="max-w-4xl mx-auto px-2 py-12 mb-16 border-t border-white/[0.08]">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Frequently Asked Questions for Industrial Suppliers
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base">
              Everything you need to know about integrating Jaktra with your manufacturing supply chain.
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
              Unlock Trapped Working Capital in Your Supply Chain
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto text-sm sm:text-base mb-8">
              Eliminate dunning delays and accelerate Net 60/90 recoveries without damaging buyer relationships. Deploy in 15 minutes.
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

export default ManufacturingUseCase;

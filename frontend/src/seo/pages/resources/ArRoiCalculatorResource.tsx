import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  TrendingDown,
  DollarSign,
  Clock,
  ShieldCheck,
  Zap,
  Laptop,
  Boxes,
  Truck,
  Users,
  HardHat,
  LayoutGrid,
  Table,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from "lucide-react";
import { SEOHead } from "@/seo/components/SEOHead";
import { roiCalculatorSchema, breadcrumbSchema } from "@/seo/schemas";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { GlobalNav } from "@/components/common/GlobalNav";

const BENCHMARK_ITEMS = [
  {
    id: "saas",
    name: "B2B SaaS & Cloud",
    badge: "ARR & Usage Billing",
    icon: Laptop,
    baselineDso: 48,
    postJaktraDso: 32,
    dsoReduction: 16,
    capitalFreed: "$438,000",
    scaleUnit: "per $10M ARR",
    driver: "Seat overage dispute triage & Net Retention (NRR) protection",
    mechanism: "Identifies upgrade and license inquiries immediately, preventing billing friction and involuntary churn.",
    link: "/use-cases/saas",
  },
  {
    id: "wholesale",
    name: "Wholesale & Trade Distribution",
    badge: "Trade Credit Net 30–60",
    icon: Boxes,
    baselineDso: 54,
    postJaktraDso: 38,
    dsoReduction: 16,
    capitalFreed: "$526,000",
    scaleUnit: "per $12M GMV",
    driver: "Short-shipment claim triage & trade margin preservation",
    mechanism: "Quarantines damaged goods deductions so undisputed order balances settle on schedule.",
    link: "/use-cases/wholesale-distribution",
  },
  {
    id: "logistics",
    name: "Logistics, Freight & 3PLs",
    badge: "Load Remittance",
    icon: Truck,
    baselineDso: 58,
    postJaktraDso: 41,
    dsoReduction: 17,
    capitalFreed: "$698,000",
    scaleUnit: "per $15M Rev",
    driver: "Detention dispute handling & freight factoring loan exit",
    mechanism: "Automates load POD verification to eliminate reliance on 3%–5% factoring discounts.",
    link: "/use-cases/logistics-freight",
  },
  {
    id: "staffing",
    name: "Staffing & Recruiting",
    badge: "Weekly Payroll",
    icon: Users,
    baselineDso: 55,
    postJaktraDso: 37,
    dsoReduction: 18,
    capitalFreed: "$493,000",
    scaleUnit: "per $10M Rev",
    driver: "Timesheet dispute triage & payroll financing exit",
    mechanism: "Aligns corporate AP reminders with weekly contractor payroll cycles to preserve cash reserves.",
    link: "/use-cases/staffing-recruiting",
  },
  {
    id: "construction",
    name: "Commercial Construction",
    badge: "Progress Billings",
    icon: HardHat,
    baselineDso: 72,
    postJaktraDso: 51,
    dsoReduction: 21,
    capitalFreed: "$863,000",
    scaleUnit: "per $15M Rev",
    driver: "AIA progress pay app tracking & retainage milestone release",
    mechanism: "Systematizes conditional lien waiver exchanges and accelerates general contractor approvals.",
    link: "/use-cases/construction",
  },
];

export default function ArRoiCalculatorResource() {
  const [benchmarkView, setBenchmarkView] = useState<"cards" | "table">("cards");
  const [copied, setCopied] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(true);

  // Model Inputs
  const [annualRevenue, setAnnualRevenue] = useState<number>(12000000); // $12M revenue
  const [currentDso, setCurrentDso] = useState<number>(54); // 54 days
  const [dsoReduction, setDsoReduction] = useState<number>(16); // 16 days reduction
  const [arFtes, setArFtes] = useState<number>(2); // 2 collectors
  const [hourlyLoadedRate, setHourlyLoadedRate] = useState<number>(45); // $45/hr
  const [costOfDebt, setCostOfDebt] = useState<number>(8.5); // 8.5% borrowing cost
  const [badDebtRate, setBadDebtRate] = useState<number>(0.75); // 0.75% bad debt

  // Calculations
  const trappedWorkingCapital = (annualRevenue / 365) * currentDso;
  const releasedWorkingCapital = (annualRevenue / 365) * dsoReduction;
  const remainingWorkingCapital = trappedWorkingCapital - releasedWorkingCapital;
  const annualInterestSaved = releasedWorkingCapital * (costOfDebt / 100);

  const hoursSavedPerFteMonth = 38;
  const annualHoursSaved = arFtes * hoursSavedPerFteMonth * 12;
  const annualLaborReclaimed = annualHoursSaved * hourlyLoadedRate;

  const annualBadDebtBaseline = annualRevenue * (badDebtRate / 100);
  const badDebtSaved = annualBadDebtBaseline * 0.32;

  const netAnnualFinancialGain = annualInterestSaved + annualLaborReclaimed + badDebtSaved;
  const threeYearNetBenefit = netAnnualFinancialGain * 3;

  // Strict US/Global formatting (prevents Indian Lakh separators like $17,75,342)
  const formatUSD = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(Math.round(val));
  };

  const formatCompactUSD = (val: number) => {
    if (val >= 1000000) {
      return `$${(val / 1000000).toFixed(1)}M`;
    }
    if (val >= 1000) {
      return `$${Math.round(val / 1000)}k`;
    }
    return `$${Math.round(val)}`;
  };

  const formatNumber = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 0,
    }).format(Math.round(val));
  };

  const getSliderBg = (val: number, min: number, max: number) => {
    const pct = Math.max(0, Math.min(100, ((val - min) / (max - min)) * 100));
    return `linear-gradient(to right, #b7d2f8 0%, #b7d2f8 ${pct}%, #27272a ${pct}%, #27272a 100%)`;
  };

  const handleReset = () => {
    setAnnualRevenue(12000000);
    setCurrentDso(54);
    setDsoReduction(16);
    setArFtes(2);
    setHourlyLoadedRate(45);
    setCostOfDebt(8.5);
    setBadDebtRate(0.75);
  };

  const handleCopySummary = () => {
    const summaryText = `Jaktra AR ROI & Working Capital Model:
• Annual B2B Revenue: ${formatCompactUSD(annualRevenue)}
• Baseline DSO: ${currentDso} days → Target DSO: ${currentDso - dsoReduction} days (-${dsoReduction} days)
• Working Capital Unlocked: ${formatUSD(releasedWorkingCapital)}
• New Trapped AR Baseline: ${formatUSD(remainingWorkingCapital)}
• Annual Borrowing Interest Saved: ${formatUSD(annualInterestSaved)} (at ${costOfDebt}% line rate)
• Collector Hours Reclaimed: ${formatNumber(annualHoursSaved)} hrs/year (${formatUSD(annualLaborReclaimed)})
• Bad Debt Prevented: ${formatUSD(badDebtSaved)}/year
• Total Annual Financial Impact: ${formatUSD(netAnnualFinancialGain)}/year
• 3-Year Cumulative Benefit: ${formatUSD(threeYearNetBenefit)}`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const faqs = [
    {
      q: "How does accounts receivable automation generate measurable ROI for CFOs?",
      a: "AR automation delivers ROI across three distinct financial pillars: (1) Capital Release & Interest Avoidance: Faster payments reduce DSO, unlocking trapped working capital and saving 7%–10% interest on revolving credit lines or invoice factoring fees. (2) Operational Labor Reallocation: Automating repetitive collection emails, statement reconciliations, and routine inquiries frees 35–45 hours per collector monthly. (3) Bad Debt Mitigation: Early sentiment classification and automated cadence escalation reduce write-offs by preventing invoices from aging past 60+ days where recovery likelihood collapses.",
    },
    {
      q: "Why is working capital release more valuable than software cost savings?",
      a: "For a company generating $15M in annual revenue, cutting DSO from 56 days to 40 days frees approximately $657,500 in liquid working capital. At an 8.5% borrowing cost, that alone saves $55,800 every year in bank interest charges—and during Early Access, Jaktra is 100% free with zero software subscription fees. The cash can be immediately redeployed into inventory, hiring, or growth initiatives without issuing equity or debt.",
    },
    {
      q: "How does Jaktra calculate labor hours saved?",
      a: "Finance industry studies indicate credit controllers spend up to 40% of their working hours manually composing follow-up emails, looking up payment status in banking portals, logging call notes, and manually coordinating disputes. Jaktra's autonomous AI tone escalation engine and automated dispute triage handle routine outbound reminders and classify inbound replies autonomously, reclaiming roughly 38 hours per collector each month.",
    },
    {
      q: "How does early dispute triage prevent bad debt write-offs?",
      a: "According to credit management data, over 55% of invoices that age beyond 90 days started as simple administrative disputes (missing PO, billing discrepancy, delivery issue) that were never caught in time. Jaktra classifies inbound customer replies into disputes, promises, or queries immediately upon arrival, halts automated collection cadences, and drafts suggested resolutions for finance approval before the invoice becomes an uncollectible loss.",
    },
    {
      q: "What makes Jaktra's pricing so much more capital-efficient than legacy AR suites?",
      a: "Legacy enterprise platforms (HighRadius, Billtrust, YayPay) require multi-year contracts costing $25,000 to $60,000+ per year plus $10,000+ in implementation consultant fees. Jaktra is 100% free during Early Access with self-serve 15-minute onboarding, zero credit card required, and no invoice limits.",
    },
  ];

  const cashReleasePct = Math.round((releasedWorkingCapital / trappedWorkingCapital) * 100);

  return (
    <div className="min-h-screen bg-[#010102] text-[#f7f8f8] font-sans antialiased selection:bg-[#5e6ad2]/30 selection:text-white">
      <SEOHead
        title="AR Automation ROI & Working Capital Calculator — Jaktra"
        description="Calculate your DSO reduction, working capital released, debt interest saved, and net 3-year ROI from automating accounts receivable collections with Jaktra."
        canonicalPath="/resources/ar-automation-roi-calculator"
        jsonLd={[
          roiCalculatorSchema,
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Resources", path: "/resources" },
            { name: "AR Automation ROI Calculator", path: "/resources/ar-automation-roi-calculator" },
          ]),
        ]}
      />

      <GlobalNav />

      <main className="pt-24 pb-16 max-w-6xl mx-auto px-4 sm:px-6 relative">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-96 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(183,210,248,0.06),transparent)] pointer-events-none" />

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 text-xs text-zinc-400 font-sans relative z-10">
          <ol className="flex items-center gap-1.5">
            <li>
              <Link to="/" className="hover:text-zinc-200 transition-colors">
                Home
              </Link>
            </li>
            <li className="text-zinc-600">/</li>
            <li>
              <Link to="/resources" className="hover:text-zinc-200 transition-colors">
                Resources
              </Link>
            </li>
            <li className="text-zinc-600">/</li>
            <li className="text-zinc-200 font-medium" aria-current="page">
              AR Automation ROI Calculator
            </li>
          </ol>
        </nav>

        {/* HERO SECTION */}
        <section className="max-w-4xl mx-auto text-center mb-8 relative z-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-3 leading-tight">
            Accounts Receivable Automation ROI &amp; Working Capital Calculator
          </h1>
          <p className="text-sm sm:text-base text-zinc-300 max-w-3xl mx-auto leading-relaxed">
            Model the exact financial return of replacing manual collection calling queues with autonomous AI execution. Calculate working capital unlocked, interest expenses avoided, and collector labor reclaimed.
          </p>
        </section>

        {/* 2-COLUMN SPLIT CALCULATOR DASHBOARD */}
        <section id="calculator" className="mb-14 scroll-mt-24">
          <div className="relative rounded-3xl bg-[#0c0d10] border border-white/[0.1] p-6 sm:p-8 lg:p-9 shadow-[0_25px_70px_rgba(0,0,0,0.85)] overflow-hidden">
            {/* Ambient Background Lights */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_100%_0%,rgba(183,210,248,0.09),transparent_65%)] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[radial-gradient(circle_at_0%_100%,rgba(52,211,153,0.05),transparent_65%)] pointer-events-none" />

            {/* Top Bar Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-white/[0.08] relative z-10">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    Enterprise AR Impact Simulator
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#b7d2f8]/10 text-[#b7d2f8] border border-[#b7d2f8]/25 flex items-center gap-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#b7d2f8] animate-pulse" />
                    Live Interactive Model
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  Adjust baseline financial variables on the left to project working capital release, labor savings, and net ROI in real time.
                </p>
              </div>

              <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.18] hover:bg-white/[0.08] text-xs font-medium text-zinc-300 hover:text-white transition-all shadow-sm"
                  title="Reset inputs to default assumptions"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Reset Defaults</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#b7d2f8]/10 border border-[#b7d2f8]/25 hover:bg-[#b7d2f8]/20 text-xs font-semibold text-[#b7d2f8] transition-all shadow-sm"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-semibold">Memo Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#b7d2f8]" />
                      <span>Copy Executive Memo</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* SPLIT GRID: LEFT INPUTS (7 COLS), RIGHT IMPACT (5 COLS) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
              {/* LEFT COLUMN: INTERACTIVE CONTROLS */}
              <div className="lg:col-span-7 space-y-6">
                {/* 1. Core Revenue & DSO Drivers */}
                <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/[0.07] space-y-6 shadow-sm">
                  <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-md bg-[#b7d2f8]/10 border border-[#b7d2f8]/20 text-[10px] font-mono font-bold text-[#b7d2f8] flex items-center justify-center">
                        01
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-white">
                        Revenue &amp; Collection Velocity Baseline
                      </span>
                    </div>
                    <span className="text-[11px] text-zinc-400 font-mono">Primary Levers</span>
                  </div>

                  {/* Input 1: Annual Revenue */}
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-baseline gap-2">
                      <div>
                        <label className="text-xs font-semibold text-zinc-200">Annual B2B Revenue</label>
                        <span className="text-[10px] text-zinc-400 block">Total yearly credit invoiced volume</span>
                      </div>
                      <div className="px-3 py-1 rounded-lg bg-white/[0.05] border border-white/[0.09] shadow-inner text-right">
                        <span className="text-base sm:text-lg font-bold text-white font-mono">
                          {formatUSD(annualRevenue)}
                        </span>
                      </div>
                    </div>

                    <input
                      type="range"
                      aria-label="Annual B2B Revenue"
                      min={1000000}
                      max={50000000}
                      step={500000}
                      value={annualRevenue}
                      onChange={(e) => setAnnualRevenue(Number(e.target.value))}
                      style={{ background: getSliderBg(annualRevenue, 1000000, 50000000) }}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-[#b7d2f8] bg-zinc-800 transition-all [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(183,210,248,0.9)] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#b7d2f8] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125"
                    />

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex flex-wrap gap-1.5">
                        {[5000000, 10000000, 25000000, 50000000].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setAnnualRevenue(preset)}
                            className={`text-[10px] px-2.5 py-0.5 rounded-md font-mono transition-all ${
                              annualRevenue === preset
                                ? "bg-[#b7d2f8] text-zinc-950 font-bold shadow-[0_0_10px_rgba(183,210,248,0.4)]"
                                : "text-zinc-400 hover:text-white bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06]"
                            }`}
                          >
                            ${preset / 1000000}M
                          </button>
                        ))}
                      </div>
                      <span className="text-[10px] text-zinc-400 font-mono">$1M – $50M</span>
                    </div>
                  </div>

                  {/* Input 2: Current DSO */}
                  <div className="space-y-2.5 pt-4 border-t border-white/[0.04]">
                    <div className="flex justify-between items-baseline gap-2">
                      <div>
                        <label className="text-xs font-semibold text-zinc-200">Current Baseline DSO</label>
                        <span className="text-[10px] text-zinc-400 block">Average days to collect invoice payment</span>
                      </div>
                      <div className="px-3 py-1 rounded-lg bg-white/[0.05] border border-white/[0.09] shadow-inner text-right">
                        <span className="text-base sm:text-lg font-bold text-white font-mono">
                          {currentDso} <span className="text-xs font-normal text-zinc-400 font-sans">Days</span>
                        </span>
                      </div>
                    </div>

                    <input
                      type="range"
                      aria-label="Current Baseline DSO in days"
                      min={35}
                      max={90}
                      step={1}
                      value={currentDso}
                      onChange={(e) => setCurrentDso(Number(e.target.value))}
                      style={{ background: getSliderBg(currentDso, 35, 90) }}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-[#b7d2f8] bg-zinc-800 transition-all [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(183,210,248,0.9)] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#b7d2f8] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125"
                    />

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { val: 45, label: "45d (Fast)" },
                          { val: 54, label: "54d (Median)" },
                          { val: 65, label: "65d (Slow)" },
                          { val: 75, label: "75d (Delayed)" },
                        ].map((preset) => (
                          <button
                            key={preset.val}
                            type="button"
                            onClick={() => setCurrentDso(preset.val)}
                            className={`text-[10px] px-2.5 py-0.5 rounded-md font-mono transition-all ${
                              currentDso === preset.val
                                ? "bg-[#b7d2f8] text-zinc-950 font-bold shadow-[0_0_10px_rgba(183,210,248,0.4)]"
                                : "text-zinc-400 hover:text-white bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06]"
                            }`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                      <span className="text-[10px] text-zinc-400 font-mono">35d – 90d</span>
                    </div>
                  </div>

                  {/* Input 3: Target DSO Compression */}
                  <div className="space-y-2.5 pt-4 border-t border-white/[0.04]">
                    <div className="flex justify-between items-baseline gap-2">
                      <div>
                        <label className="text-xs font-semibold text-zinc-200">Target DSO Reduction</label>
                        <span className="text-[10px] text-zinc-400 block">
                          Accelerates collection aging to <strong className="text-[#b7d2f8]">{currentDso - dsoReduction} Days</strong>
                        </span>
                      </div>
                      <div className="px-3 py-1 rounded-lg bg-[#b7d2f8]/10 border border-[#b7d2f8]/25 shadow-inner text-right">
                        <span className="text-base sm:text-lg font-bold text-[#b7d2f8] font-mono">
                          -{dsoReduction} <span className="text-xs font-normal text-[#b7d2f8]/80 font-sans">Days</span>
                        </span>
                      </div>
                    </div>

                    <input
                      type="range"
                      aria-label="Target DSO Reduction in days"
                      min={5}
                      max={25}
                      step={1}
                      value={dsoReduction}
                      onChange={(e) => setDsoReduction(Number(e.target.value))}
                      style={{ background: getSliderBg(dsoReduction, 5, 25) }}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-[#b7d2f8] bg-zinc-800 transition-all [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(183,210,248,0.9)] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#b7d2f8] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125"
                    />

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { val: 10, label: "-10d (Modest)" },
                          { val: 16, label: "-16d (Standard)" },
                          { val: 20, label: "-20d (Top 10%)" },
                        ].map((preset) => (
                          <button
                            key={preset.val}
                            type="button"
                            onClick={() => setDsoReduction(preset.val)}
                            className={`text-[10px] px-2.5 py-0.5 rounded-md font-mono transition-all ${
                              dsoReduction === preset.val
                                ? "bg-[#b7d2f8] text-zinc-950 font-bold shadow-[0_0_10px_rgba(183,210,248,0.4)]"
                                : "text-zinc-400 hover:text-white bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06]"
                            }`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                      <span className="text-[10px] text-zinc-400 font-mono">-5d to -25d acceleration</span>
                    </div>
                  </div>
                </div>

                {/* 2. Secondary Assumptions Collapsible Box */}
                <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/[0.07] shadow-sm">
                  <div
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-md bg-white/[0.06] border border-white/[0.1] text-[10px] font-mono font-bold text-zinc-300 flex items-center justify-center">
                        02
                      </span>
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-white block">
                          Team &amp; Financial Cost Assumptions
                        </span>
                        <span className="text-[11px] text-zinc-400 font-normal">
                          {showAdvanced ? "Click to collapse parameters" : `${arFtes} FTEs • $${hourlyLoadedRate}/hr • ${costOfDebt}% line cost • ${badDebtRate}% bad debt`}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/[0.06]">
                      <span className="text-[11px] font-mono">{showAdvanced ? "Collapse" : "Edit Assumptions"}</span>
                      {showAdvanced ? (
                        <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                      )}
                    </div>
                  </div>

                  {showAdvanced && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-5 mt-4 border-t border-white/[0.06]">
                      {/* AR Staffing */}
                      <div className="p-4 rounded-xl bg-black/40 border border-white/[0.05] space-y-2.5">
                        <div className="flex justify-between items-center text-xs">
                          <div>
                            <label className="text-zinc-200 font-semibold block">AR &amp; Collections Staff</label>
                            <span className="text-[10px] text-zinc-400">Headcount handling outreach</span>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-white/[0.06] font-bold font-mono text-white text-xs">
                            {arFtes} FTE{arFtes > 1 ? "s" : ""}
                          </span>
                        </div>
                        <input
                          type="range"
                          aria-label="Accounts Receivable Staff Headcount FTEs"
                          min={1}
                          max={8}
                          step={1}
                          value={arFtes}
                          onChange={(e) => setArFtes(Number(e.target.value))}
                          style={{ background: getSliderBg(arFtes, 1, 8) }}
                          className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-[#b7d2f8] bg-zinc-800"
                        />
                        <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                          <span>1 person</span>
                          <span>8 people</span>
                        </div>
                      </div>

                      {/* Loaded Hourly Cost */}
                      <div className="p-4 rounded-xl bg-black/40 border border-white/[0.05] space-y-2.5">
                        <div className="flex justify-between items-center text-xs">
                          <div>
                            <label className="text-zinc-200 font-semibold block">Loaded Finance Rate</label>
                            <span className="text-[10px] text-zinc-400">Salary + payroll + tooling</span>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-white/[0.06] font-bold font-mono text-white text-xs">
                            ${hourlyLoadedRate}/hr
                          </span>
                        </div>
                        <input
                          type="range"
                          aria-label="Loaded Finance Hourly Rate"
                          min={30}
                          max={80}
                          step={5}
                          value={hourlyLoadedRate}
                          onChange={(e) => setHourlyLoadedRate(Number(e.target.value))}
                          style={{ background: getSliderBg(hourlyLoadedRate, 30, 80) }}
                          className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-[#b7d2f8] bg-zinc-800"
                        />
                        <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                          <span>$30/hr</span>
                          <span>$80/hr</span>
                        </div>
                      </div>

                      {/* Cost of Debt */}
                      <div className="p-4 rounded-xl bg-black/40 border border-white/[0.05] space-y-2.5">
                        <div className="flex justify-between items-center text-xs">
                          <div>
                            <label className="text-zinc-200 font-semibold block">Line of Credit Cost</label>
                            <span className="text-[10px] text-zinc-400">Revolving debt / factoring rate</span>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-white/[0.06] font-bold font-mono text-white text-xs">
                            {costOfDebt}%
                          </span>
                        </div>
                        <input
                          type="range"
                          aria-label="Line of Credit Debt Cost Percentage"
                          min={5.0}
                          max={14.0}
                          step={0.5}
                          value={costOfDebt}
                          onChange={(e) => setCostOfDebt(Number(e.target.value))}
                          style={{ background: getSliderBg(costOfDebt, 5, 14) }}
                          className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-[#b7d2f8] bg-zinc-800"
                        />
                        <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                          <span>5% (Prime)</span>
                          <span>14% (High / Factoring)</span>
                        </div>
                      </div>

                      {/* Bad Debt Rate */}
                      <div className="p-4 rounded-xl bg-black/40 border border-white/[0.05] space-y-2.5">
                        <div className="flex justify-between items-center text-xs">
                          <div>
                            <label className="text-zinc-200 font-semibold block">Annual Bad Debt Rate</label>
                            <span className="text-[10px] text-zinc-400">Historical write-off % of sales</span>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-white/[0.06] font-bold font-mono text-white text-xs">
                            {badDebtRate}%
                          </span>
                        </div>
                        <input
                          type="range"
                          aria-label="Annual Bad Debt Rate Percentage"
                          min={0.2}
                          max={2.5}
                          step={0.05}
                          value={badDebtRate}
                          onChange={(e) => setBadDebtRate(Number(e.target.value))}
                          style={{ background: getSliderBg(badDebtRate, 0.2, 2.5) }}
                          className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-[#b7d2f8] bg-zinc-800"
                        />
                        <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                          <span>0.2%</span>
                          <span>2.5%</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: EXECUTIVE ROI IMPACT BOARD (STICKY) */}
              <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
                <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-b from-white/[0.07] via-white/[0.03] to-white/[0.015] border border-white/[0.12] shadow-2xl relative overflow-hidden backdrop-blur-xl">
                  {/* Subtle Corner Glow */}
                  <div className="absolute top-0 right-0 w-56 h-56 bg-[radial-gradient(circle_at_100%_0%,rgba(183,210,248,0.14),transparent_70%)] pointer-events-none" />

                  {/* Top Status */}
                  <div className="flex items-center justify-between gap-2 mb-3 relative z-10">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                      Total Annual Financial Gain
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Calculated ROI
                    </span>
                  </div>

                  {/* HERO STAT */}
                  <div className="mb-5 relative z-10">
                    <div className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold text-white font-mono tracking-tight leading-none">
                      {formatUSD(netAnnualFinancialGain)}
                      <span className="text-sm font-normal text-zinc-400 font-sans ml-1">/year</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-zinc-400">
                      <span>3-Year Cumulative Benefit:</span>
                      <strong className="text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        +{formatUSD(threeYearNetBenefit)}
                      </strong>
                    </div>
                  </div>

                  {/* CASH FLOW VELOCITY IMPACT (BEFORE VS. WITH JAKTRA) */}
                  <div className="p-4 rounded-xl bg-black/50 border border-white/[0.08] mb-5 space-y-3.5 relative z-10 shadow-inner">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-300 font-semibold">
                        Cash Flow Velocity Impact
                      </span>
                      <span className="font-mono text-emerald-400 text-xs font-bold">
                        Target DSO: {currentDso - dsoReduction}d (Compressed from {currentDso}d)
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400">
                        <span>Trapped AR Acceleration</span>
                        <span className="text-emerald-400 font-bold">{cashReleasePct}% Unlocked</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-zinc-800/80 overflow-hidden flex">
                        <div
                          style={{ width: `${Math.min(100, cashReleasePct)}%` }}
                          className="h-full bg-gradient-to-r from-[#b7d2f8] to-emerald-400 rounded-full transition-all duration-300"
                        />
                      </div>
                    </div>

                    {/* 3 Metrics: Trapped vs Released vs New Baseline */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/[0.06] text-center">
                      <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                        <span className="text-[10px] text-zinc-400 block mb-0.5">Currently Trapped</span>
                        <span className="text-xs sm:text-sm font-bold text-zinc-300 font-mono block">
                          {formatUSD(trappedWorkingCapital)}
                        </span>
                        <span className="text-[9px] text-zinc-400 block mt-0.5">{currentDso}d aging</span>
                      </div>

                      <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/25 shadow-[0_0_12px_rgba(52,211,153,0.15)]">
                        <span className="text-[10px] text-emerald-300 font-semibold block mb-0.5">Liquid Cash Released</span>
                        <span className="text-xs sm:text-sm font-bold text-emerald-400 font-mono block">
                          +{formatUSD(releasedWorkingCapital)}
                        </span>
                        <span className="text-[9px] text-emerald-400/80 block mt-0.5 font-medium">Direct Unlock</span>
                      </div>

                      <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                        <span className="text-[10px] text-zinc-400 block mb-0.5">New Trapped Base</span>
                        <span className="text-xs sm:text-sm font-bold text-zinc-300 font-mono block">
                          {formatUSD(remainingWorkingCapital)}
                        </span>
                        <span className="text-[9px] text-zinc-400 block mt-0.5">{currentDso - dsoReduction}d aging</span>
                      </div>
                    </div>
                  </div>

                  {/* 3 VALUE BREAKDOWN PILLARS */}
                  <div className="space-y-2.5 mb-6 text-xs relative z-10">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition-colors">
                      <div className="flex items-center gap-2.5 text-zinc-300">
                        <div className="w-6 h-6 rounded-md bg-[#b7d2f8]/10 flex items-center justify-center text-[#b7d2f8]">
                          <TrendingDown className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="font-medium text-white block">Debt Interest Avoided</span>
                          <span className="text-[10px] text-zinc-400">At {costOfDebt}% line borrowing cost</span>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-white text-sm">
                        {formatUSD(annualInterestSaved)}<span className="text-[10px] text-zinc-400 font-normal">/yr</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition-colors">
                      <div className="flex items-center gap-2.5 text-zinc-300">
                        <div className="w-6 h-6 rounded-md bg-[#b7d2f8]/10 flex items-center justify-center text-[#b7d2f8]">
                          <Clock className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="font-medium text-white block">Collector Labor Reclaimed</span>
                          <span className="text-[10px] text-zinc-400">{formatNumber(annualHoursSaved)} collector hours/year</span>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-white text-sm">
                        {formatUSD(annualLaborReclaimed)}<span className="text-[10px] text-zinc-400 font-normal">/yr</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition-colors">
                      <div className="flex items-center gap-2.5 text-zinc-300">
                        <div className="w-6 h-6 rounded-md bg-[#b7d2f8]/10 flex items-center justify-center text-[#b7d2f8]">
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="font-medium text-white block">Bad Debt Prevented</span>
                          <span className="text-[10px] text-zinc-400">32% aging write-off reduction</span>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-white text-sm">
                        {formatUSD(badDebtSaved)}<span className="text-[10px] text-zinc-400 font-normal">/yr</span>
                      </span>
                    </div>
                  </div>

                  {/* CTA BUTTON */}
                  <Link
                    to="/register"
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white text-zinc-950 font-bold text-sm hover:bg-zinc-100 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_25px_rgba(255,255,255,0.35)] hover:scale-[1.01] active:scale-[0.99] relative z-10"
                  >
                    Deploy Jaktra &amp; Unlock Liquidity
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <div className="pt-3 text-center relative z-10">
                    <span className="text-[11px] text-zinc-400">
                      ⚡ Immediate ROI Payback • 100% Free During Early Access • No Setup Fees
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4 CORE VALUE LEVERS */}
        <section className="mb-14 border-t border-white/[0.08] pt-12">
          <div className="text-center mb-8">
            <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold block mb-1">
              Economic Impact Analysis
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">
              The 4 Financial Levers That Drive AR Automation ROI
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto text-sm leading-relaxed">
              Where economic value is generated inside your profit &amp; loss statement and corporate balance sheet.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                id: "lever-1",
                number: "01",
                title: "Working Capital & Borrowing Cost Avoidance",
                badge: "Cost of Capital",
                description: "When DSO is cut by 15–20 days, cash moves from debtor bank accounts directly into your operational accounts. In a 7%–10% interest rate environment, eliminating revolving line-of-credit draws and invoice factoring fees produces immediate, dollar-for-dollar bottom line profit.",
                metric: "Capital Formula: Released Liquidity = (Annual Revenue / 365) × DSO Reduction",
                icon: <DollarSign className="w-3.5 h-3.5 shrink-0" />,
              },
              {
                id: "lever-2",
                number: "02",
                title: "Finance Labor Productivity & Headcount Leverage",
                badge: "Labor Efficiency",
                description: "Credit controllers spend up to 40% of their time drafting routine reminder emails, verifying wire arrivals, and compiling statements. Jaktra automates these tasks end-to-end, enabling finance departments to scale volume 3x without hiring additional collectors.",
                metric: "Productivity Gain: Reclaims ~38 hours per collector each month",
                icon: <Clock className="w-3.5 h-3.5 shrink-0" />,
              },
              {
                id: "lever-3",
                number: "03",
                title: "Bad Debt & Aging Collapse Prevention",
                badge: "Delinquency Mitigation",
                description: "Invoices that reach 90+ days overdue experience an average recovery probability drop to under 50%. Jaktra’s predictive payment risk scoring stratifies at-risk accounts early and escalates outreach autonomously before invoices solidify into write-offs.",
                metric: "Balance Sheet Protection: ~32% historical reduction in uncollectible debt write-offs",
                icon: <ShieldCheck className="w-3.5 h-3.5 shrink-0" />,
              },
              {
                id: "lever-4",
                number: "04",
                title: "Frictionless Digital Remittance Velocity",
                badge: "Payment Velocity",
                description: "By replacing cumbersome paper checks and password-protected portals with secure 1-click passwordless payment links and instant payment rails, corporate AP teams settle balances in 30 seconds without authentication friction.",
                metric: "Conversion Uplift: 4.8x faster payment checkout vs static PDF attachments",
                icon: <Zap className="w-3.5 h-3.5 shrink-0" />,
              },
            ].map((lever) => (
              <div
                key={lever.id}
                className="rounded-xl border border-white/[0.08] bg-[#0e0f11] p-5 sm:p-6 flex flex-col justify-between hover:border-white/[0.18] transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-mono font-bold text-[#b7d2f8] bg-[#b7d2f8]/10 px-2 py-0.5 rounded border border-[#b7d2f8]/20">
                      Lever {lever.number}
                    </span>
                    <span className="text-[11px] text-zinc-400 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06]">
                      {lever.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-2 leading-snug">
                    {lever.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-4">
                    {lever.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/[0.06] flex items-center gap-2 text-xs text-[#b7d2f8]">
                  {lever.icon}
                  <span>{lever.metric}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* BENCHMARK SHOWCASE SECTION */}
        <section className="mb-14 border-t border-white/[0.08] pt-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold block mb-1">
                Industry Benchmark Intelligence
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Industry DSO &amp; ROI Benchmarks
              </h2>
              <p className="text-zinc-400 text-sm mt-1 max-w-2xl leading-relaxed">
                Measured collection velocity and liquidity gains observed across major B2B industry verticals after deploying autonomous AR automation.
              </p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0e0f11] border border-white/[0.08] shrink-0 self-start md:self-end">
              <button
                type="button"
                onClick={() => setBenchmarkView("cards")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  benchmarkView === "cards"
                    ? "bg-white text-zinc-950 font-semibold shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Cards View</span>
              </button>
              <button
                type="button"
                onClick={() => setBenchmarkView("table")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  benchmarkView === "table"
                    ? "bg-white text-zinc-950 font-semibold shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                <span>Matrix Table</span>
              </button>
            </div>
          </div>

          {/* Cards View */}
          {benchmarkView === "cards" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {BENCHMARK_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    className="p-5 sm:p-6 rounded-xl bg-[#0e0f11] border border-white/[0.08] hover:border-white/[0.18] transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Meta */}
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8] group-hover:scale-105 transition-transform">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-base leading-tight group-hover:text-[#b7d2f8] transition-colors">
                              {item.name}
                            </h3>
                            <span className="text-[10px] text-zinc-400 block mt-0.5">
                              {item.badge}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* DSO Compression Visual Pill */}
                      <div className="p-3 rounded-lg bg-black/40 border border-white/[0.04] mb-3">
                        <div className="flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[10px] uppercase text-zinc-500 block">Baseline</span>
                            <span className="font-mono text-zinc-400 font-medium line-through">
                              {item.baselineDso} Days
                            </span>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-zinc-600" />
                          <div className="text-right">
                            <span className="text-[10px] uppercase text-[#b7d2f8] block font-semibold">
                              With Jaktra
                            </span>
                            <span className="font-mono text-white font-bold text-sm">
                              {item.postJaktraDso} Days
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-[#b7d2f8]/10 text-[#b7d2f8] border border-[#b7d2f8]/20">
                            -{item.dsoReduction}d
                          </span>
                        </div>
                      </div>

                      {/* Financial Value Metric */}
                      <div className="mb-3">
                        <span className="text-[10px] text-zinc-400 uppercase tracking-wider block mb-0.5">
                          Working Capital Freed
                        </span>
                        <div className="text-xl font-bold font-mono text-white tracking-tight">
                          {item.capitalFreed}{" "}
                          <span className="text-xs font-normal text-zinc-400 font-sans">
                            {item.scaleUnit}
                          </span>
                        </div>
                      </div>

                      {/* Value Driver */}
                      <div className="pt-2.5 border-t border-white/[0.06] space-y-1">
                        <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-semibold">
                          Primary Value Driver
                        </span>
                        <p className="text-xs text-zinc-300 leading-normal font-medium">
                          {item.driver}
                        </p>
                        <p className="text-[11px] text-zinc-400 leading-normal">
                          {item.mechanism}
                        </p>
                      </div>
                    </div>

                    {/* Footer Action */}
                    <div className="mt-4 pt-3 border-t border-white/[0.06]">
                      <Link
                        to={item.link}
                        className="text-xs text-[#b7d2f8] hover:text-white font-semibold inline-flex items-center gap-1.5 transition-colors"
                      >
                        <span>Explore {item.name.split(" ")[0]} playbook</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Matrix Table View */}
          {benchmarkView === "table" && (
            <div className="overflow-x-auto rounded-xl border border-white/[0.08] bg-[#0e0f11] shadow-sm">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                    <th className="py-3.5 px-5 text-xs uppercase tracking-wider text-zinc-400 font-semibold">
                      Industry Model
                    </th>
                    <th className="py-3.5 px-5 text-xs uppercase tracking-wider text-zinc-400 font-semibold">
                      Baseline DSO
                    </th>
                    <th className="py-3.5 px-5 text-xs uppercase tracking-wider text-white font-semibold">
                      Post-Jaktra DSO
                    </th>
                    <th className="py-3.5 px-5 text-xs uppercase tracking-wider text-white font-semibold">
                      Working Capital Freed
                    </th>
                    <th className="py-3.5 px-5 text-xs uppercase tracking-wider text-zinc-400 font-semibold">
                      Primary Value Driver
                    </th>
                    <th className="py-3.5 px-5 text-xs uppercase tracking-wider text-zinc-400 font-semibold text-right">
                      Playbook
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {BENCHMARK_ITEMS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <tr key={`table-${item.id}`} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="py-3.5 px-5 font-medium text-white">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8] shrink-0">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="font-semibold text-sm block">{item.name}</span>
                              <span className="text-[10px] text-zinc-400">{item.badge}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-5 text-zinc-400 font-mono text-xs">{item.baselineDso} Days</td>
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-mono font-bold text-sm">{item.postJaktraDso} Days</span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#b7d2f8]/10 text-[#b7d2f8] border border-[#b7d2f8]/20">
                              -{item.dsoReduction}d
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-5 font-mono text-white text-sm">
                          <span className="font-bold">{item.capitalFreed}</span>
                          <span className="text-zinc-400 text-xs ml-1.5 font-sans font-normal">{item.scaleUnit}</span>
                        </td>
                        <td className="py-3.5 px-5 text-zinc-300 text-xs max-w-xs leading-relaxed">
                          {item.driver}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <Link
                            to={item.link}
                            className="text-[#b7d2f8] group-hover:text-white font-semibold inline-flex items-center gap-1 text-xs transition-colors"
                          >
                            Read <ArrowRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* FAQ SECTION */}
        <section className="mb-14 border-t border-white/[0.08] pt-12">
          <div className="text-center mb-8">
            <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold block mb-1">
              Common Financial Questions
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">
              Frequently Asked Questions About AR Automation ROI
            </h2>
            <p className="text-zinc-400 text-sm max-w-xl mx-auto">
              Key financial questions answered for CFOs, controllers, and finance executives.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" variant="outline" defaultValue="faq-0" collapsible className="w-full">
              {faqs.map((faq, idx) => (
                <AccordionItem key={idx} value={`faq-${idx}`} className="border-b border-white/[0.08] py-1">
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
        </section>

        {/* BOTTOM CTA */}
        <section className="border-t border-white/[0.08] pt-10">
          <div className="p-8 sm:p-10 rounded-2xl bg-[#0e0f11] border border-white/[0.08] text-center shadow-lg">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 tracking-tight">
              Ready to Turn Trapped Receivables Into Working Capital?
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto text-sm sm:text-base mb-6 leading-relaxed">
              Start recovering overdue receivables today with Jaktra. Set up in 15 minutes with zero long-term commitments and full ROI visibility.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-white text-zinc-950 font-semibold text-xs sm:text-sm hover:bg-zinc-200 transition-all shadow-md"
              >
                Get started free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/pricing"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white font-medium text-xs sm:text-sm hover:bg-white/[0.08] transition-all"
              >
                Explore Free Early Access
              </Link>
            </div>
            <p className="text-xs text-zinc-500 mt-4">
              No credit card required • 15-minute setup • Bank-grade security
            </p>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}

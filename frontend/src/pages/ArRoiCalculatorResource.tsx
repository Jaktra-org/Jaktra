import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  TrendingDown,
  DollarSign,
  Clock,
  ShieldCheck,
  Zap,
  Sparkles,
  Laptop,
  Boxes,
  Truck,
  Users,
  HardHat,
  LayoutGrid,
  Table,
} from "lucide-react";
import jaktraLogo from "../assets/jaktra_svg.svg";
import { SEOHead } from "../components/common/SEOHead";
import { roiCalculatorSchema, breadcrumbSchema } from "../components/common/seo-schemas";
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
    mechanism: "NLP classifies upgrade & license disputes immediately, preventing billing churn.",
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
    driver: "AIA G702 pay app tracking & retainage milestone release",
    mechanism: "Systematizes conditional lien waiver exchanges and accelerates general contractor signoffs.",
    link: "/use-cases/construction",
  },
];

export default function ArRoiCalculatorResource() {
  // View Switcher for Benchmarks
  const [benchmarkView, setBenchmarkView] = useState<"cards" | "table">("cards");

  // Model Inputs
  const [annualRevenue, setAnnualRevenue] = useState<number>(12000000); // $12M revenue
  const [currentDso, setCurrentDso] = useState<number>(54); // 54 days
  const [dsoReduction, setDsoReduction] = useState<number>(16); // 16 days reduction
  const [arFtes, setArFtes] = useState<number>(2); // 2 collectors
  const [hourlyLoadedRate, setHourlyLoadedRate] = useState<number>(45); // $45/hr
  const [costOfDebt, setCostOfDebt] = useState<number>(8.5); // 8.5% borrowing cost
  const [badDebtRate, setBadDebtRate] = useState<number>(0.75); // 0.75% bad debt

  // Mathematical Calculations
  const trappedWorkingCapital = (annualRevenue / 365) * currentDso;
  const releasedWorkingCapital = (annualRevenue / 365) * dsoReduction;
  const annualInterestSaved = releasedWorkingCapital * (costOfDebt / 100);

  const hoursSavedPerFteMonth = 38; // 38 hours/month automated per collector
  const annualHoursSaved = arFtes * hoursSavedPerFteMonth * 12;
  const annualLaborReclaimed = annualHoursSaved * hourlyLoadedRate;

  const annualBadDebtBaseline = annualRevenue * (badDebtRate / 100);
  const badDebtSaved = annualBadDebtBaseline * 0.32; // 32% reduction via ML risk scoring & dispute triage

  const netAnnualFinancialGain = annualInterestSaved + annualLaborReclaimed + badDebtSaved;
  const threeYearNetBenefit = netAnnualFinancialGain * 3;
  const roiMultiple = "100% Free";

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
      a: "Finance industry studies indicate credit controllers spend up to 40% of their working hours manually composing follow-up emails, looking up payment status in banking portals, logging call notes, and manually coordinating disputes. Jaktra's Groq LLaMA 3.1 tone escalation engine and automated DisputeAgent handle routine outbound reminders and classify inbound replies autonomously, reclaiming roughly 38 hours per collector each month.",
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

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-zinc-100 font-sans selection:bg-[#b7d2f8]/20 selection:text-white">
      <SEOHead
        title="B2B Accounts Receivable Automation ROI & Working Capital Calculator | Jaktra"
        description="Calculate your DSO reduction, working capital released, debt interest saved, and net 3-year ROI from automating accounts receivable collections with Jaktra."
        canonicalPath="/resources/ar-automation-roi-calculator"
        jsonLd={[
          roiCalculatorSchema,
          breadcrumbSchema([
            { name: "Resources", path: "/resources" },
            { name: "AR Automation ROI Calculator", path: "/resources/ar-automation-roi-calculator" },
          ]),
        ]}
      />

      <HeaderNav />

      <main className="pt-28 sm:pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(183,210,248,0.08),transparent)] pointer-events-none" />

        {/* HERO SECTION */}
        <section className="max-w-5xl mx-auto text-center mb-20 sm:mb-24 relative z-10">
          <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-4">
            CFO &amp; Finance Controller Planning Tool
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 leading-tight font-display">
            Accounts Receivable Automation ROI &amp; Working Capital Calculator
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 max-w-3xl mx-auto leading-relaxed mb-8">
            Model the exact financial return of replacing manual collection calling queues with autonomous AI execution. Calculate working capital unlocked, interest expenses avoided, and collector labor reclaimed.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#calculator"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-200 transition-all shadow-md"
            >
              Run your company's calculation
              <ArrowRight className="w-4 h-4" />
            </a>
            <Link
              to="/pricing"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-white/5 border border-white/10 text-white font-medium text-sm hover:bg-white/10 transition-all"
            >
              Explore Free Early Access
            </Link>
          </div>
        </section>

        {/* CALCULATOR CONTAINER */}
        <section id="calculator" className="mb-20 sm:mb-24 scroll-mt-24">
          <div className="p-6 sm:p-10 rounded-3xl bg-[#111113] border border-white/[0.08] shadow-2xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/[0.08]">
              <div>
                <h2 className="text-2xl font-bold text-white font-display">
                  Enterprise AR Impact Simulator
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                  Adjust your baseline financial variables to project liquidity, labor savings, and net ROI.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[#b7d2f8] text-xs font-semibold">
                <Sparkles className="w-4 h-4" />
                Live Model • 100% Free Early Access
              </div>
            </div>

            {/* INPUT CONTROLS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {/* Annual Revenue */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/[0.08]">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-medium text-zinc-300">Annual B2B Revenue</label>
                  <span className="text-xs font-bold text-white font-mono">
                    ${(annualRevenue / 1000000).toFixed(1)}M
                  </span>
                </div>
                <input
                  type="range"
                  min={1000000}
                  max={50000000}
                  step={500000}
                  value={annualRevenue}
                  onChange={(e) => setAnnualRevenue(Number(e.target.value))}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#b7d2f8]"
                />
                <div className="flex justify-between text-[10px] text-zinc-500 mt-1 font-mono">
                  <span>$1M</span>
                  <span>$50M</span>
                </div>
              </div>

              {/* Current DSO */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/[0.08]">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-medium text-zinc-300">Current DSO</label>
                  <span className="text-xs font-bold text-white font-mono">{currentDso} Days</span>
                </div>
                <input
                  type="range"
                  min={35}
                  max={90}
                  step={1}
                  value={currentDso}
                  onChange={(e) => setCurrentDso(Number(e.target.value))}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#b7d2f8]"
                />
                <div className="flex justify-between text-[10px] text-zinc-500 mt-1 font-mono">
                  <span>35 days (Fast)</span>
                  <span>90 days (Slow)</span>
                </div>
              </div>

              {/* Simulated Target DSO Compression */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/[0.08]">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-medium text-zinc-300">Simulated Target DSO Compression</label>
                  <span className="text-xs font-bold text-white font-mono">-{dsoReduction} Days</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={25}
                  step={1}
                  value={dsoReduction}
                  onChange={(e) => setDsoReduction(Number(e.target.value))}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#b7d2f8]"
                />
                <div className="flex justify-between text-[10px] text-zinc-500 mt-1 font-mono">
                  <span>-5 days</span>
                  <span>-25 days</span>
                </div>
              </div>

              {/* Dedicated AR FTEs */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/[0.08]">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-medium text-zinc-300">AR &amp; Collections Staff</label>
                  <span className="text-xs font-bold text-white font-mono">{arFtes} FTEs</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={8}
                  step={1}
                  value={arFtes}
                  onChange={(e) => setArFtes(Number(e.target.value))}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#b7d2f8]"
                />
                <div className="flex justify-between text-[10px] text-zinc-500 mt-1 font-mono">
                  <span>1 person</span>
                  <span>8 team members</span>
                </div>
              </div>

              {/* Hourly Loaded Rate */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/[0.08]">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-medium text-zinc-300">Loaded Finance Rate</label>
                  <span className="text-xs font-bold text-white font-mono">${hourlyLoadedRate}/hr</span>
                </div>
                <input
                  type="range"
                  min={30}
                  max={80}
                  step={5}
                  value={hourlyLoadedRate}
                  onChange={(e) => setHourlyLoadedRate(Number(e.target.value))}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#b7d2f8]"
                />
                <div className="flex justify-between text-[10px] text-zinc-500 mt-1 font-mono">
                  <span>$30/hr</span>
                  <span>$80/hr (Senior)</span>
                </div>
              </div>

              {/* Cost of Debt / Credit Facility */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/[0.08]">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-medium text-zinc-300">Cost of Debt (Revolving Line)</label>
                  <span className="text-xs font-bold text-white font-mono">{costOfDebt}%</span>
                </div>
                <input
                  type="range"
                  min={5.0}
                  max={14.0}
                  step={0.5}
                  value={costOfDebt}
                  onChange={(e) => setCostOfDebt(Number(e.target.value))}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#b7d2f8]"
                />
                <div className="flex justify-between text-[10px] text-zinc-500 mt-1 font-mono">
                  <span>5% (Prime)</span>
                  <span>14% (Factoring)</span>
                </div>
              </div>

              {/* Bad Debt Rate */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/[0.08]">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-medium text-zinc-300">Annual Bad Debt Rate</label>
                  <span className="text-xs font-bold text-white font-mono">{badDebtRate}%</span>
                </div>
                <input
                  type="range"
                  min={0.2}
                  max={2.5}
                  step={0.05}
                  value={badDebtRate}
                  onChange={(e) => setBadDebtRate(Number(e.target.value))}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#b7d2f8]"
                />
                <div className="flex justify-between text-[10px] text-zinc-500 mt-1 font-mono">
                  <span>0.2% (Low)</span>
                  <span>2.5% (High)</span>
                </div>
              </div>
            </div>

            {/* KEY EXECUTIVE METRICS DISPLAY */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="p-5 rounded-2xl bg-black/40 border border-white/[0.08]">
                <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1.5">
                  <DollarSign className="w-4 h-4 text-[#b7d2f8]" />
                  <span>Working Capital Freed</span>
                </div>
                <div className="text-2xl font-bold text-white font-mono">
                  ${Math.round(releasedWorkingCapital).toLocaleString()}
                </div>
                <p className="text-[11px] text-zinc-500 mt-1 font-mono">
                  Down from ${Math.round(trappedWorkingCapital).toLocaleString()} currently trapped
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-black/40 border border-white/[0.08]">
                <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1.5">
                  <TrendingDown className="w-4 h-4 text-[#b7d2f8]" />
                  <span>Annual Interest Saved</span>
                </div>
                <div className="text-2xl font-bold text-white font-mono">
                  ${Math.round(annualInterestSaved).toLocaleString()}
                </div>
                <p className="text-[11px] text-zinc-500 mt-1 font-mono">
                  At {costOfDebt}% credit facility borrowing rate
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-black/40 border border-white/[0.08]">
                <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1.5">
                  <Clock className="w-4 h-4 text-[#b7d2f8]" />
                  <span>Collector Hours Saved</span>
                </div>
                <div className="text-2xl font-bold text-white font-mono">
                  {annualHoursSaved.toLocaleString()} hrs/yr
                </div>
                <p className="text-[11px] text-zinc-500 mt-1 font-mono">
                  Reclaiming ${Math.round(annualLaborReclaimed).toLocaleString()} in finance labor
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-black/40 border border-white/[0.08]">
                <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#b7d2f8]" />
                  <span>Bad Debt Mitigated</span>
                </div>
                <div className="text-2xl font-bold text-white font-mono">
                  ${Math.round(badDebtSaved).toLocaleString()}/yr
                </div>
                <p className="text-[11px] text-zinc-500 mt-1 font-mono">
                  32% write-off prevention via ML risk scoring
                </p>
              </div>
            </div>

            {/* EXECUTIVE SUMMARY BANNER */}
            <div className="p-6 sm:p-8 rounded-2xl bg-black/40 border border-white/[0.08]">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                <div>
                  <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400 block mb-1">
                    Net Annual Financial Impact
                  </span>
                  <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono">
                    ${Math.round(netAnnualFinancialGain).toLocaleString()}{" "}
                    <span className="text-sm font-normal text-zinc-400 font-sans">/ year</span>
                  </div>
                  <div className="text-xs text-zinc-400 mt-2 flex flex-wrap items-center gap-4">
                    <span>
                      3-Year Net Benefit:{" "}
                      <strong className="text-white font-mono font-semibold">
                        ${Math.round(threeYearNetBenefit).toLocaleString()}
                      </strong>
                    </span>
                    <span>•</span>
                    <span>
                      Payback Period:{" "}
                      <strong className="text-white font-semibold">Immediate (Free Early Access)</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Pricing:{" "}
                      <strong className="text-white font-semibold">{roiMultiple}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                  <Link
                    to="/register"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-200 transition-all shadow-lg"
                  >
                    Deploy Jaktra &amp; Unlock Liquidity
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4 CORE VALUE LEVERS */}
        <section className="mb-20 sm:mb-24 border-t border-white/[0.08] pt-16">
          <div className="text-center mb-10">
            <span className="text-xs font-mono uppercase tracking-wider text-[#b7d2f8] font-semibold block mb-2">
              Economic Impact Analysis
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              The 4 Financial Levers That Drive AR Automation ROI
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
              Where economic value is generated inside your profit &amp; loss statement and corporate balance sheet.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
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
                description: "Invoices that reach 90+ days overdue experience an average recovery probability drop to under 50%. Jaktra’s predictive delinquency ML risk scoring stratifies at-risk accounts early and escalates outreach autonomously before invoices solidify into write-offs.",
                metric: "Balance Sheet Protection: ~32% historical reduction in uncollectible debt write-offs",
                icon: <ShieldCheck className="w-3.5 h-3.5 shrink-0" />,
              },
              {
                id: "lever-4",
                number: "04",
                title: "Frictionless Digital Remittance Velocity",
                badge: "Checkout Velocity",
                description: "By replacing cumbersome paper checks and password-protected portals with cryptographically tokenized zero-login links (/i/:token) and instant payment rails, corporate AP teams settle balances in 30 seconds without authentication friction.",
                metric: "Conversion Uplift: 4.8x faster payment checkout vs static PDF attachments",
                icon: <Zap className="w-3.5 h-3.5 shrink-0" />,
              },
            ].map((lever) => (
              <div
                key={lever.id}
                className="rounded-2xl border border-white/[0.08] bg-[#111113] p-6 sm:p-7 flex flex-col justify-between hover:border-white/20 transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-xs font-mono font-bold text-[#b7d2f8] bg-[#b7d2f8]/10 px-2.5 py-0.5 rounded-full border border-[#b7d2f8]/20">
                      Lever {lever.number}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-400 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06]">
                      {lever.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 leading-snug">
                    {lever.title}
                  </h3>
                  <p className="text-sm text-zinc-300 leading-relaxed mb-5">
                    {lever.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/[0.06] flex items-center gap-2 text-xs text-[#b7d2f8] font-mono">
                  {lever.icon}
                  <span>{lever.metric}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* BENCHMARK SHOWCASE SECTION */}
        <section className="mb-20 sm:mb-24 border-t border-white/[0.08] pt-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 max-w-6xl mx-auto">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-[#b7d2f8] font-semibold block mb-2">
                Industry Benchmark Intelligence
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                Industry DSO &amp; ROI Benchmarks
              </h2>
              <p className="text-zinc-400 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
                Measured collection velocity and liquidity gains observed across major B2B industry verticals after deploying autonomous AR automation.
              </p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/[0.08] shrink-0 self-start md:self-end">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
              {BENCHMARK_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    className="p-6 rounded-2xl bg-[#111113] border border-white/[0.08] hover:border-[#b7d2f8]/40 transition-all duration-200 flex flex-col justify-between shadow-sm group"
                  >
                    <div>
                      {/* Top Meta */}
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8] group-hover:scale-105 transition-transform">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-base leading-tight group-hover:text-[#b7d2f8] transition-colors">
                              {item.name}
                            </h3>
                            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block mt-0.5">
                              {item.badge}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* DSO Compression Visual Pill */}
                      <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] mb-4">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <div>
                            <span className="text-[10px] uppercase font-mono text-zinc-500 block">Baseline</span>
                            <span className="font-mono text-zinc-400 font-medium line-through">
                              {item.baselineDso} Days
                            </span>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-zinc-600" />
                          <div className="text-right">
                            <span className="text-[10px] uppercase font-mono text-[#b7d2f8] block font-semibold">
                              Post-Jaktra
                            </span>
                            <span className="font-mono text-white font-bold text-sm">
                              {item.postJaktraDso} Days
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-[#b7d2f8]/10 text-[#b7d2f8] border border-[#b7d2f8]/20">
                            -{item.dsoReduction}d
                          </span>
                        </div>
                      </div>

                      {/* Financial Value Metric */}
                      <div className="mb-4">
                        <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider block mb-1">
                          Working Capital Freed
                        </span>
                        <div className="text-2xl font-bold font-mono text-white tracking-tight">
                          {item.capitalFreed}{" "}
                          <span className="text-xs font-normal text-zinc-400 font-sans">
                            {item.scaleUnit}
                          </span>
                        </div>
                      </div>

                      {/* Value Driver */}
                      <div className="pt-3 border-t border-white/[0.06] space-y-1.5">
                        <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider block">
                          Primary Value Driver
                        </span>
                        <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                          {item.driver}
                        </p>
                        <p className="text-[11px] text-zinc-500 leading-relaxed">
                          {item.mechanism}
                        </p>
                      </div>
                    </div>

                    {/* Footer Action */}
                    <div className="mt-5 pt-3 border-t border-white/[0.06]">
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
            <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#111113] max-w-6xl mx-auto shadow-sm">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                    <th className="py-4 px-6 text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                      Industry Model
                    </th>
                    <th className="py-4 px-6 text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                      Baseline DSO
                    </th>
                    <th className="py-4 px-6 text-xs font-mono uppercase tracking-wider text-white font-semibold">
                      Post-Jaktra DSO
                    </th>
                    <th className="py-4 px-6 text-xs font-mono uppercase tracking-wider text-white font-semibold">
                      Working Capital Freed
                    </th>
                    <th className="py-4 px-6 text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                      Primary Value Driver
                    </th>
                    <th className="py-4 px-6 text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold text-right">
                      Playbook
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {BENCHMARK_ITEMS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <tr key={`table-${item.id}`} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="py-4 px-6 font-medium text-white">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8] shrink-0">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="font-semibold text-sm block">{item.name}</span>
                              <span className="text-[10px] font-mono text-zinc-500">{item.badge}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-zinc-400 font-mono text-xs">{item.baselineDso} Days</td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-mono font-bold text-sm">{item.postJaktraDso} Days</span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#b7d2f8]/10 text-[#b7d2f8] border border-[#b7d2f8]/20">
                              -{item.dsoReduction}d
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-mono text-white text-sm">
                          <span className="font-bold">{item.capitalFreed}</span>
                          <span className="text-zinc-500 text-xs ml-1.5 font-sans font-normal">{item.scaleUnit}</span>
                        </td>
                        <td className="py-4 px-6 text-zinc-300 text-xs max-w-xs leading-relaxed">
                          {item.driver}
                        </td>
                        <td className="py-4 px-6 text-right">
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
        <section className="max-w-4xl mx-auto px-6 py-16 border-t border-white/[0.08]">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Frequently Asked Questions About AR Automation ROI
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base">
              Key financial questions answered for CFOs, controllers, and finance executives.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" variant="outline" defaultValue="faq-0" collapsible className="w-full">
              {faqs.map((faq, idx) => (
                <AccordionItem key={idx} value={`faq-${idx}`}>
                  <AccordionTrigger className="text-left font-medium text-white text-base">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-zinc-400 text-sm leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="max-w-4xl mx-auto px-6 py-16 text-center border-t border-white/5">
          <div className="p-8 sm:p-12 rounded-2xl bg-gradient-to-b from-white/[0.04] to-transparent border border-white/10">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 font-display">
              Ready to Turn Trapped Receivables Into Working Capital?
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto text-sm sm:text-base mb-8">
              Start recovering overdue receivables today with Jaktra. Set up in 15 minutes with zero long-term commitments and full ROI visibility.
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
                Explore Free Early Access
              </Link>
            </div>
            <p className="text-xs text-zinc-500 mt-4">
              No credit card required • 15-minute setup • AES-256 bank-grade encryption
            </p>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}

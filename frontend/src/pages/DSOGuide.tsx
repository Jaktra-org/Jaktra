import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Clock,
  Sparkles,
  List,
  ExternalLink,
  AlertCircle,
  Zap,
} from "lucide-react";
import jaktraLogo from "../assets/jaktra_svg.svg";
import { SEOHead } from "../components/common/SEOHead";
import { dsoGuideSchema, dsoGuideFaqSchema, breadcrumbSchema } from "../components/common/seo-schemas";
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
          <Link
            to="/login"
            className="text-xs sm:text-sm text-zinc-300 hover:text-white transition-colors"
          >
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

export function DSOGuide() {
  // Calculator state
  const [calcMethod, setCalcMethod] = useState<"simple" | "countback">("simple");
  const [arBalance, setArBalance] = useState<number>(185000);
  const [creditSales, setCreditSales] = useState<number>(310000);
  const [periodDays, setPeriodDays] = useState<number>(90);

  // Countback monthly inputs
  const [month1Sales, setMonth1Sales] = useState<number>(120000);
  const [month2Sales, setMonth2Sales] = useState<number>(100000);
  const [month3Sales, setMonth3Sales] = useState<number>(90000);

  interface DsoLeverItem {
    id: string;
    number: string;
    title: string;
    subtitle: string;
    impactArea: string;
    badge: string;
    actionPill: string;
    content: string;
  }

  const leversItems: DsoLeverItem[] = [
    {
      id: "lever-1",
      number: "01",
      title: "Invoice Immediately on Day 0",
      subtitle: "Eliminate clerical billing lag",
      impactArea: "Upstream Billing Velocity",
      badge: "Day 0 Dispatch",
      actionPill: "Automate billing dispatch directly upon milestone completion",
      content:
        "Internal invoicing delays create immediate latency. If your finance team takes 4 to 6 days after milestone completion or shipment to send the invoice, your collection cycle is already delayed by nearly a week. Automate billing dispatch directly upon delivery.",
    },
    {
      id: "lever-2",
      number: "02",
      title: "Automate Consistent Reminder Cadences",
      subtitle: "Polite, structured follow-up sequences",
      impactArea: "Remittance Discipline",
      badge: "Predictable Cadence",
      actionPill: "Deploy automated multi-stage reminders before & after due dates",
      content:
        "Most late payments occur simply because accounts payable teams juggle hundreds of vendor bills. Deploy polite, automated email cadences: an upcoming due date reminder (3 days before), a due-date confirmation, and structured follow-ups at 7, 14, and 21 days past due.",
    },
    {
      id: "lever-3",
      number: "03",
      title: "Eliminate Payment Friction with Direct Links",
      subtitle: "Zero-login tokenized payment checkout",
      impactArea: "Payer Conversion",
      badge: "1-Click Checkout",
      actionPill: "Zero-login cryptographic payment links (/i/:token) via Razorpay",
      content:
        "Forcing customers to create login credentials, reset forgotten passwords, or manually write and mail paper checks causes significant checkout abandonment. Embed secure direct payment links with instant ACH, card, and bank transfers inside every reminder.",
    },
    {
      id: "lever-4",
      number: "04",
      title: "Triage Invoicing Disputes Immediately",
      subtitle: "Auto-detect objections and pause dunning",
      impactArea: "Dispute Friction",
      badge: "NLP Sentiment Detection",
      actionPill: "Isolate disputed line items while securing payment on undisputed funds",
      content:
        "Over 30% of delinquent invoices are delayed because the customer replied with a simple clerical question (such as a missing PO number or line-item clarification) that sat unanswered in a collector's inbox. Automatically detect dispute sentiment and pause aggressive dunning until resolved.",
    },
    {
      id: "lever-5",
      number: "05",
      title: "Offer Structured Installment Plans for Stalled Accounts",
      subtitle: "Convert delinquent balances into milestone recovery",
      impactArea: "Delinquency Recovery",
      badge: "Milestone Tranches",
      actionPill: "Offer 2x or 3x installment plans directly inside the payment portal",
      content:
        "When a trusted customer experiences temporary cash flow constraints, demanding immediate 100% lump-sum payment often leads to ghosting and default. Offering structured 2x or 3x installment plans helps recover the balance predictably while preserving the client relationship.",
    },
  ];

  // Simple DSO calculation
  const simpleDso = creditSales > 0 ? Number(((arBalance / creditSales) * periodDays).toFixed(1)) : 0;

  // Countback DSO calculation
  let remaining = Math.max(0, arBalance);
  let countbackDays = 0;

  if (month1Sales > 0) {
    const m1Exhausted = Math.min(remaining, month1Sales);
    countbackDays += (m1Exhausted / month1Sales) * 30;
    remaining -= m1Exhausted;
  }
  if (remaining > 0 && month2Sales > 0) {
    const m2Exhausted = Math.min(remaining, month2Sales);
    countbackDays += (m2Exhausted / month2Sales) * 30;
    remaining -= m2Exhausted;
  }
  if (remaining > 0 && month3Sales > 0) {
    const m3Exhausted = Math.min(remaining, month3Sales);
    countbackDays += (m3Exhausted / month3Sales) * 30;
    remaining -= m3Exhausted;
  }
  if (remaining > 0 && month3Sales > 0) {
    countbackDays += (remaining / month3Sales) * 30;
  }
  countbackDays = Number(countbackDays.toFixed(1));

  const activeDso = calcMethod === "simple" ? simpleDso : countbackDays;

  // Evaluation status
  const getDsoStatus = (dso: number) => {
    if (dso <= 35) return { label: "Optimal (< 35 Days)", color: "text-white bg-white/[0.04] border-white/[0.08]" };
    if (dso <= 50) return { label: "Typical B2B (35–50 Days)", color: "text-[#b7d2f8] bg-[#b7d2f8]/10 border-[#b7d2f8]/20" };
    return { label: "Elevated (> 50 Days)", color: "text-white bg-white/[0.08] border-white/[0.12]" };
  };

  const status = getDsoStatus(activeDso);

  const faqs = [
    {
      q: "What is Days Sales Outstanding (DSO) and why does it matter?",
      a: "Days Sales Outstanding (DSO) measures the average number of calendar days it takes a business to collect payment after completing a credit sale. A higher DSO means cash is tied up in uncollected receivables rather than sitting in your bank account, which strains liquidity and increases borrowing costs.",
    },
    {
      q: "What is considered a 'healthy' DSO for B2B companies?",
      a: "As a general benchmark, a healthy DSO is no more than 33% to 50% above your agreed payment terms. If your standard payment term is Net 30, a DSO between 35 and 45 days is typical. A DSO consistently exceeding 55 days indicates collection friction, invoice delivery delays, or unaddressed disputes.",
    },
    {
      q: "When should I use the Countback Method instead of Simple DSO?",
      a: "Use Simple DSO when monthly sales are relatively consistent. If your company experiences strong seasonal spikes or closes a significant portion of quarterly revenue in the final month of the quarter, use the Countback Method. Countback exhausts receivables month-by-month in reverse chronological order, preventing fresh, un-due invoices from distorting your collection velocity.",
    },
    {
      q: "What is the difference between DSO and DPO?",
      a: "DSO (Days Sales Outstanding) measures how long it takes customers to pay you. In contrast, DPO (Days Payable Outstanding) measures how long your company takes to pay its own vendors and suppliers. Balancing DSO and DPO ensures a positive working capital cash conversion cycle.",
    },
  ];

  const tocItems = [
    { id: "definition", label: "What is Days Sales Outstanding?" },
    { id: "calculator", label: "Interactive DSO Calculator" },
    { id: "simple-vs-countback", label: "Simple DSO vs. Countback Method" },
    { id: "benchmarks", label: "B2B Industry Benchmarks" },
    { id: "operational-levers", label: "5 Practical Ways to Reduce DSO" },
    { id: "faqs", label: "Frequently Asked Questions" },
  ];

  const benchmarks = [
    {
      sector: "B2B SaaS & Cloud Software",
      baseline: "38–48 Days",
      target: "28–34 Days",
      bottleneck: "Unresolved usage true-ups, renewal paperwork delays",
    },
    {
      sector: "Digital & Marketing Agencies",
      baseline: "48–60 Days",
      target: "35–42 Days",
      bottleneck: "Client deliverable approvals, delayed payment follow-ups",
    },
    {
      sector: "Consulting & Professional Services",
      baseline: "45–58 Days",
      target: "32–38 Days",
      bottleneck: "Timesheet sign-offs and multi-tier corporate AP approvals",
    },
    {
      sector: "Manufacturing & Industrial Goods",
      baseline: "55–70 Days",
      target: "42–50 Days",
      bottleneck: "Net 60 OEM terms, purchase order matching discrepancies",
    },
    {
      sector: "Logistics, Freight & 3PL",
      baseline: "48–60 Days",
      target: "34–40 Days",
      bottleneck: "High volume billings, accessorial rate clarifications",
    },
    {
      sector: "Wholesale & Trade Distribution",
      baseline: "50–65 Days",
      target: "36–44 Days",
      bottleneck: "Customer cash constraints, manual check processing",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#f5f5f5] font-sans selection:bg-[#b7d2f8]/20 selection:text-white antialiased">
      <SEOHead
        title="How to Reduce Days Sales Outstanding (DSO): Calculation & 5 Best Practices — Jaktra"
        description="A clear financial guide on calculating DSO accurately, comparing Simple DSO vs. Countback, benchmarking across B2B industries, and shortening collection cycles."
        canonicalPath="/resources/how-to-reduce-dso"
        jsonLd={[
          dsoGuideSchema,
          dsoGuideFaqSchema,
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Resources", path: "/resources" },
            { name: "How to Reduce DSO", path: "/resources/how-to-reduce-dso" },
          ]),
        ]}
      />

      <HeaderNav />

      <main className="pt-28 sm:pt-32 pb-24 px-4 sm:px-6 max-w-6xl mx-auto w-full relative">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-96 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(183,210,248,0.08),transparent)] pointer-events-none" />
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6 text-xs text-zinc-500">
          <ol className="flex items-center gap-2">
            <li>
              <Link to="/" className="hover:text-zinc-300 transition-colors">
                Home
              </Link>
            </li>
            <li className="text-zinc-700">/</li>
            <li>
              <Link to="/resources" className="hover:text-zinc-300 transition-colors">
                Resources
              </Link>
            </li>
            <li className="text-zinc-700">/</li>
            <li className="text-zinc-300 font-medium" aria-current="page">
              How to Reduce DSO
            </li>
          </ol>
        </nav>

        {/* Hero Section */}
        <header className="max-w-4xl mb-12">
          <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-3">
            Finance &amp; Working Capital Guide
          </span>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-5 leading-[1.15]">
            How to Reduce Days Sales Outstanding (DSO): Calculation & 5 Best Practices
          </h1>

          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed mb-6">
            Days Sales Outstanding (DSO) measures how quickly your business converts credit sales into cash. Learn the standard calculation formulas, understand B2B industry payment patterns, and discover 5 operational strategies to compress your collection cycle.
          </p>

          {/* Author & Reading Info */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 py-3 border-y border-white/[0.08]">
            <div className="flex items-center gap-1.5 text-zinc-300">
              <BookOpen className="w-3.5 h-3.5 text-[#b7d2f8]" />
              <span className="font-medium">Jaktra Research</span>
            </div>
            <span className="text-zinc-700">•</span>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-zinc-500" />
              <span>8 min read</span>
            </div>
            <span className="text-zinc-700">•</span>
            <span>Updated September 2026</span>
          </div>
        </header>

        {/* Two-Column Editorial Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Sticky Left Sidebar: Table of Contents & Action Card */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-20">
            {/* Table of Contents */}
            <div className="p-5 rounded-xl bg-[#111113] border border-white/[0.08]">
              <div className="flex items-center gap-2 pb-3 mb-3 border-b border-white/[0.06] text-xs font-bold uppercase tracking-wider text-zinc-300">
                <List className="w-4 h-4 text-[#b7d2f8]" />
                <span>On This Page</span>
              </div>
              <ul className="space-y-1">
                {tocItems.map((item, idx) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-2 py-1.5 group"
                    >
                      <span className="text-[10px] font-mono text-zinc-600 group-hover:text-[#b7d2f8] transition-colors font-semibold">
                        0{idx + 1}.
                      </span>
                      <span className="leading-snug">{item.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Card */}
            <div className="p-5 rounded-xl bg-[#111113] border border-white/[0.08]">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[#b7d2f8]/10 text-[#b7d2f8] border border-[#b7d2f8]/20 mb-3">
                <Sparkles className="w-3 h-3" />
                <span>Free Early Access</span>
              </div>
              <h3 className="text-sm font-bold text-white mb-1.5">
                Automate Invoice Follow-Ups
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                Connect QuickBooks, Xero, or Stripe to automate polite reminder cadences and reduce overdue balances.
              </p>
              <Link
                to="/register"
                className="w-full py-2 px-3 rounded-lg bg-white text-zinc-950 text-xs font-semibold hover:bg-zinc-200 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>Get started free</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </aside>

          {/* Right Main Editorial Flow */}
          <div className="lg:col-span-8 space-y-14">
            {/* Section 1: Executive Definition */}
            <section id="definition" className="space-y-4">
              <div className="text-xs font-mono uppercase tracking-widest text-[#b7d2f8]">01 / Core Definition</div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                What is Days Sales Outstanding (DSO)?
              </h2>

              <div className="border-l-2 border-[#b7d2f8] pl-5 py-2 my-4 bg-gradient-to-r from-[#b7d2f8]/5 to-transparent">
                <p className="text-base text-zinc-200 leading-relaxed">
                  <strong>Days Sales Outstanding (DSO)</strong> is a financial metric that measures the average number of calendar days it takes for a company to collect payment after completing a B2B credit sale.
                </p>
              </div>

              <p className="text-sm text-zinc-400 leading-relaxed">
                In simple terms, DSO answers: <em>"How long does our cash stay tied up in unpaid customer invoices?"</em> A lower DSO indicates that your company collects cash quickly, improving liquidity and reducing the risk of bad debt. A high DSO signals payment friction, clerical delays, or customer collection issues.
              </p>
            </section>

            {/* Section 2: Interactive DSO Calculator */}
            <section id="calculator" className="space-y-6">
              <div>
                <div className="text-xs font-mono uppercase tracking-widest text-[#b7d2f8] mb-1">02 / Calculator</div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Interactive DSO Calculator
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed">
                  Calculate your DSO using the standard formula or the Countback method for seasonal revenue.
                </p>
              </div>

              {/* Calculator Box */}
              <div className="rounded-xl border border-white/[0.08] bg-[#111113] p-5 sm:p-6 space-y-5">
                {/* Method Switcher */}
                <div className="flex items-center gap-2 p-1 rounded-lg bg-[#0a0a0b] border border-white/[0.06] w-fit">
                  <button
                    onClick={() => setCalcMethod("simple")}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      calcMethod === "simple"
                        ? "bg-white text-zinc-950 shadow-sm"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Simple DSO (Standard)
                  </button>
                  <button
                    onClick={() => setCalcMethod("countback")}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      calcMethod === "countback"
                        ? "bg-white text-zinc-950 shadow-sm"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Countback Method (Monthly)
                  </button>
                </div>

                {/* Input Controls */}
                {calcMethod === "simple" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="ar-balance-input" className="text-xs font-medium text-zinc-300 block">
                        Total Accounts Receivable ($)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-xs">$</span>
                        <input
                          id="ar-balance-input"
                          type="number"
                          value={arBalance}
                          onChange={(e) => setArBalance(Math.max(0, Number(e.target.value)))}
                          className="w-full bg-[#0a0a0b] border border-white/[0.1] rounded-lg pl-7 pr-3 py-2 text-white font-mono text-xs focus:border-[#b7d2f8]/50 focus:outline-none transition-colors"
                        />
                      </div>
                      <span className="text-[10px] text-zinc-500 block">Current total unpaid trade balance</span>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="credit-sales-input" className="text-xs font-medium text-zinc-300 block">
                        Total Credit Sales in Period ($)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-xs">$</span>
                        <input
                          id="credit-sales-input"
                          type="number"
                          value={creditSales}
                          onChange={(e) => setCreditSales(Math.max(0, Number(e.target.value)))}
                          className="w-full bg-[#0a0a0b] border border-white/[0.1] rounded-lg pl-7 pr-3 py-2 text-white font-mono text-xs focus:border-[#b7d2f8]/50 focus:outline-none transition-colors"
                        />
                      </div>
                      <span className="text-[10px] text-zinc-500 block">Total gross billings across period</span>
                    </div>

                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-xs font-medium text-zinc-300 block">
                        Period Duration
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { days: 30, label: "30 Days (1 Month)" },
                          { days: 90, label: "90 Days (Quarter)" },
                          { days: 365, label: "365 Days (1 Year)" },
                        ].map((p) => (
                          <button
                            key={p.days}
                            onClick={() => setPeriodDays(p.days)}
                            className={`py-1.5 px-2 rounded-lg text-xs font-mono border transition-colors ${
                              periodDays === p.days
                                ? "bg-[#b7d2f8]/10 text-[#b7d2f8] border-[#b7d2f8]/30 font-semibold"
                                : "bg-[#0a0a0b] text-zinc-400 border-white/[0.08] hover:border-white/[0.2]"
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2 space-y-1.5">
                      <label htmlFor="cb-ar-balance-input" className="text-xs font-medium text-zinc-300 block">
                        Total Accounts Receivable ($)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-xs">$</span>
                        <input
                          id="cb-ar-balance-input"
                          type="number"
                          value={arBalance}
                          onChange={(e) => setArBalance(Math.max(0, Number(e.target.value)))}
                          className="w-full bg-[#0a0a0b] border border-white/[0.1] rounded-lg pl-7 pr-3 py-2 text-white font-mono text-xs focus:border-[#b7d2f8]/50 focus:outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="cb-month-1-input" className="text-xs font-medium text-zinc-300 block">
                        Month 1 Sales (Days 1–30) ($)
                      </label>
                      <input
                        id="cb-month-1-input"
                        type="number"
                        value={month1Sales}
                        onChange={(e) => setMonth1Sales(Math.max(0, Number(e.target.value)))}
                        className="w-full bg-[#0a0a0b] border border-white/[0.1] rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-[#b7d2f8]/50 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="cb-month-2-input" className="text-xs font-medium text-zinc-300 block">
                        Month 2 Sales (Days 31–60) ($)
                      </label>
                      <input
                        id="cb-month-2-input"
                        type="number"
                        value={month2Sales}
                        onChange={(e) => setMonth2Sales(Math.max(0, Number(e.target.value)))}
                        className="w-full bg-[#0a0a0b] border border-white/[0.1] rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-[#b7d2f8]/50 focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1.5">
                      <label htmlFor="cb-month-3-input" className="text-xs font-medium text-zinc-300 block">
                        Month 3 Sales (Days 61–90) ($)
                      </label>
                      <input
                        id="cb-month-3-input"
                        type="number"
                        value={month3Sales}
                        onChange={(e) => setMonth3Sales(Math.max(0, Number(e.target.value)))}
                        className="w-full bg-[#0a0a0b] border border-white/[0.1] rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-[#b7d2f8]/50 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Compact, Clean Result Display */}
                <div className="p-4 rounded-xl bg-[#0a0a0b] border border-white/[0.08] space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[11px] text-zinc-400 uppercase tracking-wider font-medium block">
                        {calcMethod === "simple" ? "Simple DSO Result" : "Countback DSO Result"}
                      </span>
                      <div className="text-2xl sm:text-3xl font-bold text-white font-mono mt-0.5">
                        {activeDso} <span className="text-base font-normal text-zinc-400">Days</span>
                      </div>
                    </div>

                    <div className={`px-2.5 py-1 rounded-full text-xs font-medium border w-fit ${status.color}`}>
                      {status.label}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/[0.06] text-xs text-zinc-400 space-y-1">
                    <p>
                      <strong>Benchmark Context:</strong> On standard Net 30 payment terms, your business collects payment an average of{" "}
                      <span className="text-white font-mono font-medium">
                        {Math.max(0, Number((activeDso - 30).toFixed(1)))} days
                      </span>{" "}
                      after the invoice due date.
                    </p>
                    <p className="text-[11px] text-zinc-500 font-mono">
                      {calcMethod === "simple"
                        ? `Calculation: ($${arBalance.toLocaleString()} ÷ $${creditSales.toLocaleString()}) × ${periodDays} days = ${activeDso} days`
                        : `Calculated using reverse monthly sales exhaustion`}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3: Simple DSO vs. Countback Method */}
            <section id="simple-vs-countback" className="space-y-5">
              <div>
                <div className="text-xs font-mono uppercase tracking-widest text-[#b7d2f8] mb-1">03 / Methodology</div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Simple DSO vs. The Countback Method
                </h2>
              </div>

              <p className="text-sm text-zinc-400 leading-relaxed">
                Most businesses use the standard <strong>Simple DSO</strong> formula because it requires only three numbers. However, when sales fluctuate significantly month-to-month, Simple DSO can produce misleading figures:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-white/[0.08] bg-[#111113] space-y-2">
                  <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Simple DSO</div>
                  <div className="p-2 rounded bg-[#0a0a0b] font-mono text-xs text-zinc-300 border border-white/[0.06]">
                    DSO = (Ending AR ÷ Period Sales) × Days
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Averages total sales across the entire period. If your company closes a huge volume of sales at the end of the quarter, those fresh invoices are not yet due, but Simple DSO will treat them as collection delay, artificially inflating your number.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-[#b7d2f8]/20 bg-[#111113] space-y-2">
                  <div className="text-xs font-bold text-[#b7d2f8] uppercase tracking-wider">Countback Method</div>
                  <div className="p-2 rounded bg-[#0a0a0b] font-mono text-xs text-[#b7d2f8] border border-white/[0.06]">
                    Exhausts AR month-by-month backward
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Walks backward through trailing monthly sales in 30-day blocks. Outstanding balances are matched against the specific months in which they originated, providing an unskewed reflection of true collection efficiency.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4: Industry DSO Benchmarks */}
            <section id="benchmarks" className="space-y-5">
              <div>
                <div className="text-xs font-mono uppercase tracking-widest text-[#b7d2f8] mb-1">04 / Benchmarks</div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  B2B Industry DSO Benchmarks
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1 leading-relaxed">
                  Average collection cycles vary considerably depending on industry business models, contract sizes, and payment terms:
                </p>
              </div>

              {/* Sector Benchmark Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benchmarks.map((row) => (
                  <div
                    key={row.sector}
                    className="p-5 rounded-xl border border-white/[0.08] bg-[#111113] hover:border-white/[0.18] transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <h3 className="font-bold text-white text-sm leading-snug">{row.sector}</h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#b7d2f8]/10 text-[#b7d2f8] border border-[#b7d2f8]/20 font-bold shrink-0">
                          Target: {row.target}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-3 pb-3 border-b border-white/[0.06]">
                        <span className="text-[11px] uppercase font-sans text-zinc-500">Industry Median:</span>
                        <span className="text-zinc-300 font-semibold">{row.baseline}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider block">
                        Common Bottleneck
                      </span>
                      <p className="text-xs text-zinc-300 leading-relaxed flex items-start gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                        <span>{row.bottleneck}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-zinc-500 italic mt-2">
                * Benchmarks reflect median commercial trade credit performance across standard Net 30 to Net 60 agreements.
              </p>
            </section>

            {/* Section 5: 5 Ways to Reduce DSO - Open Editorial Matrix & Cards */}
            <section id="operational-levers" className="space-y-6">
              <div>
                <div className="text-xs font-mono uppercase tracking-widest text-[#b7d2f8] mb-1">05 / Best Practices</div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  5 Practical Ways to Reduce DSO
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1 leading-relaxed">
                  Shortening your collection cycle requires eliminating the administrative bottlenecks that cause invoices to stall. Explore the 5 core operational levers:
                </p>
              </div>

              {/* Quick-Glance Levers Matrix */}
              <div className="overflow-x-auto rounded-xl border border-white/[0.08] bg-[#111113]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                      <th className="py-3 px-4 font-semibold text-zinc-300">Lever # &amp; Action</th>
                      <th className="py-3 px-4 font-semibold text-zinc-300">Impact Domain</th>
                      <th className="py-3 px-4 font-semibold text-zinc-300">Execution Mechanism</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {leversItems.map((lever) => (
                      <tr key={lever.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[#b7d2f8] font-bold">{lever.number}</span>
                            <span className="font-medium text-white">{lever.title}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-white/[0.04] text-zinc-300 border border-white/[0.06]">
                            {lever.impactArea}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-zinc-400 text-xs">
                          {lever.actionPill}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Unrolled Lever Cards */}
              <div className="space-y-4">
                {leversItems.map((lever) => (
                  <div
                    key={lever.id}
                    className="rounded-xl border border-white/[0.08] bg-[#111113] p-5 sm:p-6 hover:border-white/20 transition-all duration-300"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-[#b7d2f8] bg-[#b7d2f8]/10 px-2 py-0.5 rounded border border-[#b7d2f8]/20">
                          Lever {lever.number}
                        </span>
                        <h3 className="text-base font-bold text-white tracking-tight">
                          {lever.title}
                        </h3>
                      </div>
                      <span className="text-[11px] font-mono text-zinc-400 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06] w-fit">
                        {lever.badge}
                      </span>
                    </div>

                    <p className="text-xs text-[#b7d2f8] font-medium mb-3">
                      {lever.subtitle}
                    </p>

                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-4">
                      {lever.content}
                    </p>

                    <div className="pt-3 border-t border-white/[0.04] flex items-center gap-2 text-xs text-zinc-400">
                      <Zap className="w-3.5 h-3.5 text-[#b7d2f8] shrink-0" />
                      <span><strong>Key Recommendation:</strong> {lever.actionPill}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 6: FAQs */}
            <section id="faqs" className="space-y-4">
              <div>
                <div className="text-xs font-mono uppercase tracking-widest text-[#b7d2f8] mb-1">06 / Questions</div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Frequently Asked Questions
                </h2>
              </div>

              <Accordion type="single" variant="outline" defaultValue="faq-0" collapsible className="w-full">
                {faqs.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`}>
                    <AccordionTrigger>{faq.q}</AccordionTrigger>
                    <AccordionContent>{faq.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>

            {/* Section 7: Final Conversion Module */}
            <section className="p-8 sm:p-10 rounded-2xl bg-gradient-to-b from-[#111113] to-[#0a0a0b] border border-white/[0.08] text-center space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Accelerate Cash Collections with Jaktra
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
                Connect your accounting ledger in 15 minutes. Automate respectful accounts receivable follow-ups with 100% Free Early Access.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link
                  to="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white text-zinc-950 text-xs sm:text-sm font-semibold hover:bg-zinc-200 transition-colors shadow-sm"
                >
                  <span>Get started free</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/resources/ar-automation-roi-calculator"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-xs sm:text-sm font-medium hover:bg-white/[0.08] transition-colors"
                >
                  <span>View AR ROI Calculator</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}

export default DSOGuide;

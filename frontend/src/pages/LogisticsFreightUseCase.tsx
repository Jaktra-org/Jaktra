import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Truck,
  ShieldCheck,
  Clock,
  FileText,
  Calculator,
  AlertTriangle,
  Shield,
  Calendar,
} from "lucide-react";
import jaktraLogo from "../assets/jaktra_svg.svg";
import { SEOHead } from "../components/common/SEOHead";
import { logisticsUseCaseSchema, breadcrumbSchema } from "../components/common/seo-schemas";
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

interface LogisticsStageItem {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  timing: string;
  tone: string;
  badge: string;
  description: string;
  preventionTitle: string;
  preventionDesc: string;
}

const LOGISTICS_STAGES: LogisticsStageItem[] = [
  {
    id: "stage-1",
    number: "01",
    title: "POD & Rate Con Verification Cadence",
    subtitle: "Proactively confirms with shipper AP that signed BOLs and rate confirmations are logged",
    timing: "Day -3 to Due Date",
    tone: "Polite, Administrative, Inquiring",
    badge: "Day -3 Pre-Due",
    description: "Proactively confirms with shipper accounts payable that signed Bills of Lading (BOL), rate confirmations, and lumper receipts are attached and approved for the upcoming weekly payment run.",
    preventionTitle: "Clerical Prevention",
    preventionDesc: "Stops shippers from waiting 45 days before claiming they are missing a delivery receipt.",
  },
  {
    id: "stage-2",
    number: "02",
    title: "AP Batch Status & Scheduled Run Check",
    subtitle: "Polite check-in confirming voucher numbers and direct deposit dates",
    timing: "Days 1–7 Overdue",
    tone: "Friendly, Solution-Oriented",
    badge: "Days 1–7 Overdue",
    description: "Polite administrative check-in asking if the freight bill is queued in the upcoming weekly disbursement cycle. Confirms voucher numbers and direct deposit dates.",
    preventionTitle: "Zero-Login Link",
    preventionDesc: "Embeds an instant payment link (/i/:token) so AP managers can pay immediately via Razorpay virtual accounts or corporate cards.",
  },
  {
    id: "stage-3",
    number: "03",
    title: "Accessorial Dispute Isolation & Linehaul Release",
    subtitle: "Isolates contested accessory fees while securing immediate release of base linehaul funds",
    timing: "Days 8–14 Overdue",
    tone: "Commercial, Collaborative, Firm",
    badge: "Days 8–14 Overdue",
    description: "When a shipper disputes detention hours, pallet charges, or fuel variances, Jaktra’s NLP DisputeAgent isolates the contested accessory fee, halts dunning on that portion, and prompts immediate disbursement of undisputed base linehaul funds.",
    preventionTitle: "Cash Flow Unlocked",
    preventionDesc: "Prevents a $150 detention dispute from freezing a $4,500 linehaul freight invoice.",
  },
  {
    id: "stage-4",
    number: "04",
    title: "Carrier Capacity Hold & Dedicated Lane Warning",
    subtitle: "Executive warning that prolonged receivables lag triggers dedicated lane tender holds",
    timing: "Days 15–30 Overdue",
    tone: "Formal, Direct, High-Stakes",
    badge: "Days 15–30 Critical",
    description: "Executive notice warning the shipper's transportation director that prolonged payment delays place future truckload tender acceptance and contract lane pricing on credit hold.",
    preventionTitle: "Tender Protection",
    preventionDesc: "Automatically loops in your brokerage VP and designated enterprise logistics account executive.",
  },
  {
    id: "stage-5",
    number: "05",
    title: "Legal Stop & BMC-84 Bond Claim Prep",
    subtitle: "Autonomous messaging halts; compiles documentation for credit committee review",
    timing: "Day 31+ Overdue",
    tone: "Final Demand / Human Review",
    badge: "Day 31+ (Legal Halt)",
    description: "Autonomous messaging strictly halts. Compiles certified rate confirmations, signed delivery manifests, driver GPS timestamps, and communications transcripts for human credit leadership, collection placement, or formal bond filings.",
    preventionTitle: "Audit Compliance",
    preventionDesc: "Zero automated spam. Complete transparency and human approval required before legal escalation.",
  },
];

export default function LogisticsFreightUseCase() {
  // Freight Factoring Calculator State
  const [monthlyFreightBilling, setMonthlyFreightBilling] = useState<number>(650000);
  const [factoringFeeRate, setFactoringFeeRate] = useState<number>(3.0); // 3% typical freight factoring fee
  const [shipperDso, setShipperDso] = useState<number>(58);
  const [targetDsoReduction, setTargetDsoReduction] = useState<number>(15);

  // Calculations
  const monthlyFactoringFeeCost = monthlyFreightBilling * (factoringFeeRate / 100);
  const annualFactoringCost = monthlyFactoringFeeCost * 12;
  const jaktraAnnualCost = 249 * 12; // Scale plan: $2,988/yr
  const annualProfitReclaimed = annualFactoringCost - jaktraAnnualCost;
  const workingCapitalTrapped = (monthlyFreightBilling * 12 / 365) * shipperDso;
  const freedCashFlow = (monthlyFreightBilling * 12 / 365) * targetDsoReduction;

  const faqs = [
    {
      q: "How does Jaktra help freight brokers escape high-cost invoice factoring?",
      a: "Freight factoring companies charge 2.5% to 5.0% of gross invoice volume simply to advance cash because shippers take 50–75 days to pay. On a $500,000 monthly freight book, factoring siphons $15,000/month in fees—often exceeding total net profits. Jaktra accelerates shipper collection cycles through automated tone escalation, instant zero-login digital payment links, and automated dispute triage, enabling brokers to self-fund carrier payouts and eliminate factoring fees.",
    },
    {
      q: "How does Jaktra handle detention, lumper, and accessorial billing disputes?",
      a: "Accessorial charges (detention hours, lumper receipts, layovers) are the #1 cause of shipper invoice payment delays. When a shipper replies stating 'detention not pre-approved' or 'missing signed lumper slip', Jaktra's DisputeAgent parses the reply using NLP, immediately freezes automated collection cadences, tags the dispute type, and generates a pre-drafted resolution briefing for your dispatch team.",
    },
    {
      q: "What happens if a shipper is missing a signed Bill of Lading (BOL) or POD?",
      a: "Shipper AP departments routinely sit on invoices for 30+ days before casually notifying you that they lack a signed POD. Jaktra solves this by initiating collaborative Stage 1 check-ins 3 days prior to due date that explicitly confirm receipt of the rate confirmation and delivery paperwork, preventing last-minute payment halts.",
    },
    {
      q: "Can enterprise shippers pay via ACH, NEFT/RTGS, or corporate credit cards?",
      a: "Yes. Jaktra embeds cryptographic, zero-login payment links (/i/:token) in every communication. Shippers can review their full freight invoice statement and remit payment in 30 seconds via Razorpay (supporting corporate credit cards, NetBanking, UPI, and dedicated virtual bank accounts for direct wire reconciliation) with zero account creation required.",
    },
    {
      q: "How does the 20-Hour Idempotency Guard protect shipper relationships?",
      a: "Freight brokerages rely heavily on shipper goodwill to secure tender volume. In Jaktra, idempotency rules enforce a strict 20-hour contact barrier, preventing multiple automated emails from hitting the same shipper in a single day and protecting your sender domain reputation.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#f5f5f5] font-sans selection:bg-[#b7d2f8]/20 selection:text-white antialiased">
      <SEOHead
        title="AI Accounts Receivable Automation for Logistics, Freight & 3PLs | Jaktra"
        description="Eliminate the freight working capital crunch. Automate shipper collection cadences, triage detention and accessorial disputes, cut freight factoring dependence, and accelerate cash flow with Jaktra."
        canonicalPath="/use-cases/logistics-freight"
        jsonLd={[
          logisticsUseCaseSchema,
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Use Cases", path: "/use-cases" },
            { name: "Logistics & Freight AR", path: "/use-cases/logistics-freight" },
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
              Logistics, Freight &amp; 3PLs
            </li>
          </ol>
        </nav>

        {/* Hero Section */}
        <section className="text-center max-w-4xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-4">
            Truckload Brokerage &amp; 3PL AR Automation
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-6 leading-tight">
            Escape the Freight Factoring Trap: Cut 60+ Day Shipper DSO &amp; Reclaim Margins
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 max-w-3xl mx-auto leading-relaxed mb-8">
            Freight brokerages pay carriers in Net 7–15 days while shippers take 60+ days to pay invoices. Jaktra automates shipper collection cadences, triages detention and POD disputes with AI, and accelerates cash flow so you can eliminate 3%–5% factoring fees.
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

        {/* The Working Capital Dilemma Callout */}
        <section className="mb-16 p-6 sm:p-8 rounded-2xl bg-[#111113] border border-white/[0.08]">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-[#b7d2f8] text-sm font-semibold mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span>The Freight Cash Conversion Gap: Paying in 7 Days, Getting Paid in 60</span>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed">
                When motor carriers demand Quick-Pay and enterprise shippers take 55 to 75 days to pay freight invoices, logistics companies get squeezed into <strong className="text-white">predatory 3%–5% invoice factoring</strong>. On a 15% gross margin brokerage, factoring consumes up to a third of your profit just to fund the cash float.
              </p>
            </div>
            <Link
              to="/resources/how-to-reduce-dso"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 text-sm text-white font-medium transition-colors shrink-0"
            >
              <span>Explore DSO Strategy</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Interactive Factoring Elimination & ROI Calculator */}
        <section className="mb-20 p-8 sm:p-10 rounded-2xl bg-[#111113] border border-white/[0.08]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-lg bg-[#b7d2f8]/10 border border-[#b7d2f8]/20 flex items-center justify-center">
              <Calculator className="w-5 h-5 text-[#b7d2f8]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Freight Factoring vs. Jaktra Profit Simulator</h2>
              <p className="text-xs sm:text-sm text-zinc-400">
                See how much margin your brokerage surrenders to invoice factoring, and how shortening DSO with Jaktra restores net profit.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Inputs */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <div className="flex justify-between text-xs text-zinc-400 mb-2">
                  <span>Monthly Freight Billing Volume:</span>
                  <span className="text-white font-mono font-semibold">${monthlyFreightBilling.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="100000"
                  max="3000000"
                  step="50000"
                  value={monthlyFreightBilling}
                  onChange={(e) => setMonthlyFreightBilling(Number(e.target.value))}
                  className="w-full accent-[#b7d2f8] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-zinc-400 mb-2">
                  <span>Current Factoring Fee Percentage:</span>
                  <span className="text-white font-mono font-semibold">{factoringFeeRate.toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min="1.5"
                  max="5.0"
                  step="0.1"
                  value={factoringFeeRate}
                  onChange={(e) => setFactoringFeeRate(Number(e.target.value))}
                  className="w-full accent-[#b7d2f8] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-zinc-400 mb-2">
                  <span>Average Shipper DSO (Days to Pay):</span>
                  <span className="text-white font-mono font-semibold">{shipperDso} days</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="90"
                  step="1"
                  value={shipperDso}
                  onChange={(e) => setShipperDso(Number(e.target.value))}
                  className="w-full accent-[#b7d2f8] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-zinc-400 mb-2">
                  <span>Simulated Shipper DSO Reduction Goal:</span>
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
                  <div className="text-xs text-zinc-500 mb-1">Monthly Factoring Fee Drain</div>
                  <div className="text-2xl font-bold text-white font-mono">
                    ${Math.round(monthlyFactoringFeeCost).toLocaleString()}/mo
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1">Paid to factoring companies</div>
                </div>

                <div className="p-4 rounded-lg bg-zinc-900 border border-white/[0.05]">
                  <div className="text-xs text-zinc-500 mb-1">Trapped Shipper Capital</div>
                  <div className="text-2xl font-bold text-white font-mono">
                    ${Math.round(workingCapitalTrapped).toLocaleString()}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1">Waiting on shipper AP runs</div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-white/[0.04] border border-white/[0.12]">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-300">Modeled Net Margin Restored (Factoring vs Platform):</span>
                  <span className="text-lg font-bold text-white font-mono">
                    +${Math.round(annualProfitReclaimed).toLocaleString()} / yr
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/[0.08]">
                  <span className="text-[11px] text-zinc-400">Modeled Cash Flow Accelerated (-{targetDsoReduction} Days DSO):</span>
                  <span className="text-sm font-semibold text-white font-mono">
                    +${Math.round(freedCashFlow).toLocaleString()}
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
              Groq LLaMA 3.1 Escalation
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Freight &amp; Logistics 5-Stage Escalation Cadence
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
              How Jaktra secures freight collections quickly while preserving high-volume shipper tender relationships.
            </p>
          </div>

          {/* Quick-Glance Cadence Table */}
          <div className="mb-10 overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#111113]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                  <th className="py-3.5 px-4 font-semibold text-zinc-300">Stage &amp; Timing</th>
                  <th className="py-3.5 px-4 font-semibold text-zinc-300">Tone Classification</th>
                  <th className="py-3.5 px-4 font-semibold text-zinc-300">Carrier Safeguard</th>
                  <th className="py-3.5 px-4 font-semibold text-zinc-300">Operational Objective</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {LOGISTICS_STAGES.map((s) => (
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
                      <span className="text-[#b7d2f8] font-mono text-[11px] mr-1">[{s.preventionTitle}]</span>
                      <span className="text-xs text-zinc-400">{s.preventionDesc}</span>
                    </td>
                    <td className="py-3 px-4 text-zinc-400 font-mono text-[11px]">{s.timing}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Unrolled 5 Stage Cards */}
          <div className="space-y-5">
            {LOGISTICS_STAGES.map((stage) => (
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
                      <span>{stage.preventionTitle}</span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {stage.preventionDesc}
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

        {/* 4 CORE FREIGHT AR PILLARS */}
        <section className="mb-20 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-[#111113] border border-white/[0.08] space-y-3">
            <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Detention &amp; Accessorial Triage</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              When a shipper disputes detention hours, lumper receipts, or fuel surcharges, Jaktra’s NLP DisputeAgent classifies the inbound email, freezes automated cadences, and immediately routes the inquiry with an AI draft to your dispatch operations team.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#111113] border border-white/[0.08] space-y-3">
            <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8]">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Signed BOL &amp; POD Verification</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Never let an invoice sit unpaid for 45 days because the shipper claims they didn't receive a delivery signature. Jaktra coordinates Stage 1 collaborative check-ins that confirm the rate con and signed POD are in the shipper’s accounts payable queue before the due date.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#111113] border border-white/[0.08] space-y-3">
            <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8]">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Zero-Login Shipper Payment Portals</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Shipper AP teams can view freight bills and remit payments in 30 seconds via Razorpay (supporting corporate credit cards, NetBanking, UPI, and dedicated virtual bank accounts) using cryptographic <code className="text-xs">/i/:token</code> links without password friction.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#111113] border border-white/[0.08] space-y-3">
            <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8]">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Shipper Goodwill &amp; Tender Protection</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Shippers control lane allocation. Jaktra’s tone escalation maintains an institutional, collaborative finance tone across early stages, ensuring freight bills get prioritized without alienating high-volume commercial freight customers.
            </p>
          </div>
        </section>

        {/* COMPARISON TABLE */}
        <section className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Traditional Freight Factoring vs. Jaktra
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base">
              Why leading brokers and 3PLs are replacing 3%–5% factoring fees with autonomous AR.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#111113] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse min-w-[680px]">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-white/[0.03] text-xs font-mono uppercase tracking-wider text-zinc-300">
                    <th className="py-4 px-6 font-semibold">Capability</th>
                    <th className="py-4 px-6 font-semibold text-[#b7d2f8]">Jaktra Autonomous AR</th>
                    <th className="py-4 px-6 font-semibold text-zinc-400">Traditional Invoice Factoring</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05] text-xs sm:text-sm">
                  <tr className="hover:bg-white/[0.015] transition-colors">
                    <td className="py-4 px-6 font-medium text-white">Effective Cost</td>
                    <td className="py-4 px-6 text-zinc-100 font-medium bg-white/[0.02]">Flat SaaS fee ($0 during Early Access)</td>
                    <td className="py-4 px-6 text-zinc-400">2.5%–5.0% of entire gross freight volume ($15,000+/mo)</td>
                  </tr>
                  <tr className="hover:bg-white/[0.015] transition-colors">
                    <td className="py-4 px-6 font-medium text-white">Shipper Relationship</td>
                    <td className="py-4 px-6 text-zinc-100 font-medium bg-white/[0.02]">Branded in your brokerage identity with collaborative AI</td>
                    <td className="py-4 px-6 text-zinc-400">Aggressive third-party factor calls that damage broker reputation</td>
                  </tr>
                  <tr className="hover:bg-white/[0.015] transition-colors">
                    <td className="py-4 px-6 font-medium text-white">Dispute Triage</td>
                    <td className="py-4 px-6 text-zinc-100 font-medium bg-white/[0.02]">NLP separates accessorials; unlocks undisputed linehaul</td>
                    <td className="py-4 px-6 text-zinc-400">Full invoice charged back or reserved against broker reserve</td>
                  </tr>
                  <tr className="hover:bg-white/[0.015] transition-colors">
                    <td className="py-4 px-6 font-medium text-white">Idempotency &amp; Safeguards</td>
                    <td className="py-4 px-6 text-zinc-100 font-medium bg-white/[0.02]">Strict 20-hour contact barrier; Stage 5 Legal Stop</td>
                    <td className="py-4 px-6 text-zinc-400">Repetitive dunning calls that cause shipper complaints</td>
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
              Frequently Asked Questions: Freight &amp; Logistics AR
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base">
              Answers to common operational questions regarding accessorial disputes, factoring alternatives, and payment rails.
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
              Accelerate Freight Collections in 15 Minutes
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto text-sm sm:text-base mb-8">
              Connect your transportation management or billing system to Jaktra today. Free during Early Access with zero credit card required.
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

import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Gauge,
} from "lucide-react";
import jaktraLogo from "../assets/jaktra_svg.svg";
import { SEOHead } from "../components/common/SEOHead";
import { riskScoringSchema, breadcrumbSchema } from "../components/common/seo-schemas";
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



const FAQS = [
  {
    q: "How does Jaktra calculate predictive delinquency risk scores?",
    a: "Jaktra's AI risk engine (ai-service/src/risk/scorer.py) analyzes four key data vectors for every open invoice: temporal days overdue (35% weight), outstanding balance exposure (25% weight), debtor responsiveness / follow-up attempts (20% weight), and the client's historical on-time payment track record (20% weight).",
  },
  {
    q: "Why is risk-based prioritization better than FIFO invoice dunning?",
    a: "Chasing invoices on a simple first-in, first-out (FIFO) schedule forces finance teams to spend identical energy on a $400 bill from an enterprise customer who always pays late as on a $45,000 balance from an unstable startup. Risk scoring directs human and automated attention to high-dollar, high-default accounts before they turn into write-offs.",
  },
  {
    q: "Can the risk score trigger automated collection cadences dynamically?",
    a: "Yes. When an invoice's risk score climbs from Medium to High, Jaktra automatically accelerates the tone escalation velocity—switching from cordial check-ins to firm administrative notices with installment offers—while triggering internal notifications to the finance controller.",
  },
  {
    q: "What happens when a debtor's historical payment rate is 100%?",
    a: "For long-standing clients with flawless payment history, Jaktra softens the escalation progression. The AI model treats the delay as an administrative oversight rather than credit delinquency, preserving executive goodwill and preventing aggressive collection phrasing.",
  },
  {
    q: "Does Jaktra update risk scores in real time as actions occur?",
    a: "Yes. When a debtor opens a tokenized portal link, downloads a statement, proposes an installment schedule, or sends an inquiry, the event stream updates the scoring parameters immediately, adjusting collection urgency in real time.",
  },
];

export function RiskScoring() {
  // Simulator Inputs
  const [invoiceAmount, setInvoiceAmount] = useState<number>(12500);
  const [daysOverdue, setDaysOverdue] = useState<number>(14);
  const [followupCount, setFollowupCount] = useState<number>(2);
  const [historicalPaymentRate, setHistoricalPaymentRate] = useState<number>(75);

  // Risk Score Computation matching ai-service/src/risk/scorer.py logic
  const agingScore = Math.min(daysOverdue / 30, 1) * 35;
  const amountScore = Math.min(invoiceAmount / 50000, 1) * 25;
  const followupScore = Math.min(followupCount / 4, 1) * 20;
  const historyScore = (1 - historicalPaymentRate / 100) * 20;
  const totalRiskScore = Math.round(agingScore + amountScore + followupScore + historyScore);

  let riskTier = "LOW RISK";
  let tierColor = "text-white font-mono";
  let badgeColor = "bg-white/[0.04] text-zinc-300 border-white/[0.08]";
  let recommendation = "Autonomous polite nudges. Debtor shows high historical reliability with low default risk.";

  if (totalRiskScore > 75) {
    riskTier = "CRITICAL RISK";
    tierColor = "text-white font-mono";
    badgeColor = "bg-white/[0.12] text-white border-white/20";
    recommendation = "High default probability. Immediate priority review, phone follow-up by account executive, and pre-legal demand prep.";
  } else if (totalRiskScore > 55) {
    riskTier = "HIGH RISK";
    tierColor = "text-[#b7d2f8] font-mono";
    badgeColor = "bg-[#b7d2f8]/10 text-[#b7d2f8] border-[#b7d2f8]/20";
    recommendation = "Escalate tone to Stage 3 / 4. Require formal remittance confirmation and propose immediate installment milestones.";
  } else if (totalRiskScore > 30) {
    riskTier = "MEDIUM RISK";
    tierColor = "text-white font-mono";
    badgeColor = "bg-white/[0.06] text-zinc-200 border-white/[0.12]";
    recommendation = "Firm administrative follow-up. Inquire regarding accounts payable batch schedule and offer self-serve portal links.";
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#f5f5f5] font-sans selection:bg-[#b7d2f8]/20 selection:text-white antialiased">
      <SEOHead
        title="How to Predict Late Payments: B2B Accounts Receivable Risk Scoring Guide | Jaktra"
        description="Learn how to identify at-risk debtors before invoices default. A practical guide to AR delinquency scoring, aging velocity, balance exposure, and collection prioritization."
        canonicalPath="/features/risk-scoring"
        jsonLd={[
          riskScoringSchema,
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Features", path: "/features" },
            { name: "Receivables Risk Scoring Guide", path: "/features/risk-scoring" },
          ]),
        ]}
      />

      <HeaderNav />

      <main className="pt-28 sm:pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(183,210,248,0.06),transparent)] pointer-events-none" />
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-8 text-xs text-zinc-500 relative z-10">
          <ol className="flex items-center gap-2">
            <li>
              <Link to="/" className="hover:text-zinc-300 transition-colors">
                Home
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link to="/features" className="hover:text-zinc-300 transition-colors">
                Features
              </Link>
            </li>
            <li>/</li>
            <li className="text-zinc-300 font-medium" aria-current="page">
              Receivables Risk Scoring Guide
            </li>
          </ol>
        </nav>

        {/* Hero Section */}
        <section className="text-center max-w-4xl mx-auto mb-20 sm:mb-24">
          <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-4">
            Credit Delinquency &amp; B2B Payment Forecasting Guide
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-6 leading-tight">
            How to Identify At-Risk Debtors Early: A Practical Guide to Receivables Risk Scoring
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 max-w-3xl mx-auto leading-relaxed mb-8">
            Chasing every overdue invoice with equal effort wastes finance hours while high-risk accounts slip into default. Discover how multi-vector risk scoring identifies high-risk debtors early, prioritizes collector attention, and prevents bad debt write-offs.
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

        {/* Metrics Banner */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-20 sm:mb-24">
          <div className="rounded-2xl border border-white/[0.08] bg-[#111113] p-8 text-center">
            <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono mb-1">4 Vectors</div>
            <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Multi-Feature Risk Analysis</div>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-[#111113] p-8 text-center">
            <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono mb-1">4 Tiers</div>
            <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Low to Critical Stratification</div>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-[#111113] p-8 text-center">
            <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono mb-1">Real-Time</div>
            <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Event-Driven Score Adjustments</div>
          </div>
        </section>

        {/* Interactive Delinquency Risk Simulator */}
        <section className="rounded-2xl border border-white/[0.08] bg-[#111113] p-6 sm:p-10 mb-20 sm:mb-24">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
              <Gauge className="w-5 h-5 text-[#b7d2f8]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Live Delinquency Risk Scoring Simulator</h2>
              <p className="text-xs sm:text-sm text-zinc-400">
                Adjust the invoice parameters below to observe how Jaktra's algorithm dynamically scores default probability.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Input 1: Invoice Amount */}
            <div>
              <label htmlFor="invoice-amount-range" className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
                Invoice Amount: <span className="text-white font-mono font-bold">${invoiceAmount.toLocaleString()}</span>
              </label>
              <input
                id="invoice-amount-range"
                type="range"
                min={1000}
                max={50000}
                step={500}
                value={invoiceAmount}
                onChange={(e) => setInvoiceAmount(Number(e.target.value))}
                className="w-full accent-[#b7d2f8] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-zinc-500 mt-1">
                <span>$1,000</span>
                <span>$25,000</span>
                <span>$50,000+</span>
              </div>
            </div>

            {/* Input 2: Days Past Due */}
            <div>
              <label htmlFor="days-past-due-range" className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
                Days Overdue: <span className="text-white font-mono font-bold">{daysOverdue} Days</span>
              </label>
              <input
                id="days-past-due-range"
                type="range"
                min={1}
                max={45}
                step={1}
                value={daysOverdue}
                onChange={(e) => setDaysOverdue(Number(e.target.value))}
                className="w-full accent-[#b7d2f8] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-zinc-500 mt-1">
                <span>1d</span>
                <span>20d</span>
                <span>45d</span>
              </div>
            </div>

            {/* Input 3: Follow-Up Touches */}
            <div>
              <label htmlFor="followup-touches-range" className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
                Follow-Up Touches Sent: <span className="text-white font-mono font-bold">{followupCount} Contacts</span>
              </label>
              <input
                id="followup-touches-range"
                type="range"
                min={0}
                max={6}
                step={1}
                value={followupCount}
                onChange={(e) => setFollowupCount(Number(e.target.value))}
                className="w-full accent-[#b7d2f8] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-zinc-500 mt-1">
                <span>0</span>
                <span>3</span>
                <span>6+</span>
              </div>
            </div>

            {/* Input 4: Historical Payment Rate */}
            <div>
              <label htmlFor="historical-rate-range" className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
                Debtor Historical On-Time Rate: <span className="text-white font-mono font-bold">{historicalPaymentRate}%</span>
              </label>
              <input
                id="historical-rate-range"
                type="range"
                min={20}
                max={100}
                step={5}
                value={historicalPaymentRate}
                onChange={(e) => setHistoricalPaymentRate(Number(e.target.value))}
                className="w-full accent-[#b7d2f8] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-zinc-500 mt-1">
                <span>20% (Unreliable)</span>
                <span>60%</span>
                <span>100% (Pristine)</span>
              </div>
            </div>
          </div>

          {/* Results Score Card */}
          <div className="rounded-xl border border-white/[0.08] bg-black/40 p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-5 mb-5">
              <div>
                <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-mono font-semibold border ${badgeColor}`}>
                  {riskTier}
                </span>
                <div className="text-xs text-zinc-400 mt-1">Calculated Delinquency Probability</div>
              </div>
              <div className="text-right">
                <div className={`text-3xl sm:text-4xl font-extrabold font-mono ${tierColor}`}>
                  {totalRiskScore} <span className="text-xs text-zinc-500 font-sans">/ 100</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Jaktra AI Action Directive:
              </div>
              <p className="text-sm text-zinc-200 leading-relaxed bg-black/30 p-4 rounded-lg border border-white/[0.08]">
                {recommendation}
              </p>
            </div>
          </div>
        </section>

        {/* 4 Core Pillars */}
        <section className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Core Algorithmic Foundations
            </h2>
            <p className="text-center text-sm text-zinc-400 max-w-2xl mx-auto">
              How Jaktra avoids simple FIFO dunning and prevents bad debt write-offs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-white/[0.08] bg-[#111113] p-6 sm:p-7 flex flex-col justify-between shadow-lg">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.1] text-xs font-mono font-bold flex items-center justify-center text-[#b7d2f8]">
                    01
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-white/[0.04] border border-white/[0.08] text-[#b7d2f8]">
                    Vector 01 &bull; 35% Weight
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  Temporal Aging Dynamics vs. Flat Counting
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-4">
                  Default risk accelerates non-linearly after Day 21 and spikes exponentially past Day 30. Jaktra&apos;s regression model applies non-linear acceleration curves rather than flat daily penalties, ensuring urgent remediation before accounts cross write-off thresholds.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#0a0a0b]/60 border border-white/[0.06] text-xs text-zinc-300">
                <strong className="text-white font-medium block mb-0.5">Day 21 Inflection:</strong>
                Accounts crossing Day 21 receive automatic risk weight doubling in the daily autonomous execution queue.
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-[#111113] p-6 sm:p-7 flex flex-col justify-between shadow-lg">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.1] text-xs font-mono font-bold flex items-center justify-center text-[#b7d2f8]">
                    02
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-white/[0.04] border border-white/[0.08] text-[#b7d2f8]">
                    Vector 02 &bull; 25% Weight
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  Balance Concentration &amp; Liquidity Exposure
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-4">
                  A $50,000 overdue invoice presents existential cash flow risk, whereas a $250 invoice is trivial. Jaktra heavily weights dollar concentration in the risk index, eliminating FIFO blind spots so major accounts are always prioritized.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#0a0a0b]/60 border border-white/[0.06] text-xs text-zinc-300">
                <strong className="text-white font-medium block mb-0.5">Liquidity Protection:</strong>
                Guarantees company cash positions are defended by focusing autonomous power where dollars matter most.
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-[#111113] p-6 sm:p-7 flex flex-col justify-between shadow-lg">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.1] text-xs font-mono font-bold flex items-center justify-center text-[#b7d2f8]">
                    03
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-white/[0.04] border border-white/[0.08] text-[#b7d2f8]">
                    Vector 03 &bull; 20% Weight
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  Debtor Behavioral Velocity &amp; Loyalty Shield
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-4">
                  Long-standing enterprise clients who routinely pay on Net 45 shouldn&apos;t be alienated with aggressive legal notices on Day 32. By tracking historical remittance patterns, Jaktra preserves buyer rapport while flagging truly erratic payers.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#0a0a0b]/60 border border-white/[0.06] text-xs text-zinc-300">
                <strong className="text-white font-medium block mb-0.5">Commercial Rapport:</strong>
                Proven on-time track records soften the escalation trajectory, framing early contact as polite check-ins.
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="max-w-4xl mx-auto px-2 py-12 mb-16 border-t border-white/[0.08]">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Frequently Asked Questions: Delinquency Risk Scoring
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base">
              Learn how our multi-vector scoring model adapts to historical patterns and real-time events.
            </p>
          </div>

          <Accordion type="single" variant="outline" defaultValue="faq-0" collapsible className="w-full">
            {FAQS.map((faq, idx) => (
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
              Prioritize AR Recovery with Predictive Machine Learning
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto text-sm sm:text-base mb-8">
              Eliminate guesswork and recover high-risk receivables before they default. Free during Early Access with zero credit card required.
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

export default RiskScoring;

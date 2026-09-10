import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ShieldCheck,
  CreditCard,
  DollarSign,
  AlertTriangle,
  Users,
  CheckCircle2,
  Lock,
  Mail,
  ChevronRight,
} from "lucide-react";
import jaktraLogo from "../assets/jaktra_svg.svg";
import { SEOHead } from "../components/common/SEOHead";
import { saasUseCaseSchema, breadcrumbSchema } from "../components/common/seo-schemas";
import { LandingFooter } from "../components/landing/LandingFooter";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

function HeaderNav() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-[#0a0a0b]/90 backdrop-blur-md border-b border-white/[0.08]">
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 h-full flex items-center justify-between">
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

interface DunningStage {
  id: string;
  stageNumber: string;
  timing: string;
  title: string;
  tone: string;
  badge: string;
  psychology: string;
  description: string;
  subject: string;
  sample: string;
  guardrail: string;
  actionPrompt: string;
}

const DUNNING_STAGES: DunningStage[] = [
  {
    id: "stage-1",
    stageNumber: "01",
    timing: "Day -3 (Pre-Due)",
    title: "Proactive Courtesy Notice",
    tone: "Polite & Administrative",
    badge: "bg-white/[0.04] text-zinc-300 border-white/[0.08]",
    psychology: "Enterprise AP departments batch wire payments on set weekly schedules. Prompting 3 days ahead ensures PO alignment before deadlines.",
    description: "Sends an automated statement 3 days prior to invoice maturity with itemized usage lines and a zero-friction verification link.",
    subject: "Courtesy reminder: Acme Cloud Subscription Invoice #INV-4921 due in 3 days",
    sample: "Hi Sarah — Sharing a courtesy copy of invoice #INV-4921 due this Friday. Let us know if your AP desk requires any PO updates, W-9 re-verification, or tax certificates from our side before processing.",
    guardrail: "Zero urgency language; confirms invoice receipt without triggering spam filters or alienating stakeholders.",
    actionPrompt: "Verify Invoice & Schedule Payment",
  },
  {
    id: "stage-2",
    stageNumber: "02",
    timing: "Day +3 Past Due",
    title: "Friendly Settlement Prompt",
    tone: "Helpful & Collaborative",
    badge: "bg-white/[0.04] text-zinc-300 border-white/[0.08]",
    psychology: "Most initial SaaS payment delays stem from administrative friction like expired corporate cards, AP turnover, or PO re-routing, rather than intentional default.",
    description: "Checks in right after maturity date, providing one-click links for updating expired corporate credit cards, ACH details, or raising a billing query.",
    subject: "Follow-up: Settle invoice #INV-4921 via your secure payment link",
    sample: "Hi Sarah — Following up on invoice #INV-4921 ($14,200) which was due earlier this week. You can update your payment method or complete settlement in one click using your secure portal link below.",
    guardrail: "Includes cryptographic one-click link. No login password required for the debtor's finance team.",
    actionPrompt: "Pay $14,200 via 1-Click ACH / Card",
  },
  {
    id: "stage-3",
    stageNumber: "03",
    timing: "Day +14 Past Due",
    title: "Commercial Cadence Escalation",
    tone: "Firm & Professional",
    badge: "bg-white/[0.04] text-zinc-300 border-white/[0.08]",
    psychology: "Invoices past 14 days risk becoming aged debt if not escalated to the primary finance controller and internal account owner.",
    description: "Escalates to the primary billing controller and copy-notifies the client account owner, highlighting contract terms and requesting scheduled remittance.",
    subject: "Payment Status Request: Invoice #INV-4921 is 14 days overdue",
    sample: "Hello Accounting Team — Invoice #INV-4921 is now 14 days overdue. Please confirm whether this payment is scheduled in this week's disbursement run or if there is a billing discrepancy we can resolve immediately.",
    guardrail: "Built-in 20-hour contact barrier prevents spamming client executives. Automatic dispute NLP pauses dunning if buyer flags an error.",
    actionPrompt: "Confirm Remittance Date or Request Review",
  },
  {
    id: "stage-4",
    stageNumber: "04",
    timing: "Day +30 Past Due",
    title: "Executive Finance Notice",
    tone: "Formal & Urgency-Driven",
    badge: "bg-white/[0.04] text-zinc-300 border-white/[0.08]",
    psychology: "Risk of involuntary churn surges past 30 days. Internal Customer Success leads need real-time awareness before renewal friction.",
    description: "Informs executive finance contacts and internal account leads. Offers self-serve installment plan options to clear the balance without service interruption.",
    subject: "Urgent: Overdue Account Notice & Settlement Options for Acme Cloud",
    sample: "Notice of Overdue Account: Account #AC-281 is 30 days past due. To prevent service interruption and retain uninterrupted workspace access, please settle the outstanding balance or select an automated installment schedule.",
    guardrail: "Offers 2x–4x automated installment schedule to prevent contract write-off and preserve Net Revenue Retention.",
    actionPrompt: "Review Flexible 2x–4x Payment Plan",
  },
  {
    id: "stage-5",
    stageNumber: "05",
    timing: "Day +45 Past Due",
    title: "Service Suspension Warning",
    tone: "Definitive & Compliance",
    badge: "bg-white/[0.08] text-white border-white/[0.15]",
    psychology: "Final compliance requirement prior to API or tenant access suspension. Provides a clear path to instant digital cure.",
    description: "Final formal notice before automated API/workspace access pause. Strict compliance formatting with options for immediate digital cure.",
    subject: "FINAL NOTICE: Pending Service Suspension for Account #AC-281",
    sample: "FINAL NOTICE: In accordance with our master services agreement, account #AC-281 will experience automated API token suspension in 7 business days unless payment is confirmed. Settle immediately to retain operational access.",
    guardrail: "Stage 5 Legal Stop halts automated messaging at Day 45. Handed off to human executive collectors.",
    actionPrompt: "Resolve Immediately & Prevent Service Freeze",
  },
];

const FAQS = [
  {
    q: "How does Jaktra prevent involuntary churn for B2B SaaS companies?",
    a: "When subscription invoices go past due due to expired cards or missed AP approval runs, generic dunning emails often land in spam or alienate buyers. Jaktra uses AI tone escalation across 5 stages and provides a secure, tokenized debtor portal where customers can update payment details, pay instantly via ACH/credit card, or select an installment schedule without customer success intervention.",
  },
  {
    q: "How does Jaktra handle usage-based invoice disputes and seat true-ups?",
    a: "If a SaaS debtor replies with a question about overage hours, API call spikes, or seat license discrepancies, Jaktra's NLP classifier detects the dispute topic, immediately pauses automated dunning to prevent relationship damage, and routes a structured summary with contract references directly to your finance or CS team.",
  },
  {
    q: "Can our sales reps and account managers view collections activity before renewal calls?",
    a: "Yes. Jaktra provides role-based visibility and audit logs. Account executives and Customer Success Managers can check live communication feeds and overdue balances directly before jumping into quarterly business reviews (QBRs) or annual renewal contract negotiations.",
  },
  {
    q: "How fast does Jaktra integrate with existing SaaS billing systems?",
    a: "You can connect QuickBooks Online, Xero, Stripe Invoicing, or Chargebee in under 15 minutes. Jaktra synchronizes open invoices, debtor emails, and payment updates bidirectionally with zero engineering required.",
  },
  {
    q: "Does Jaktra support self-serve payment plans for cash-strapped subscribers?",
    a: "Yes. In Stages 3 and 4, Jaktra can offer customizable installment schedules. Overdue debtors can split large annual contracts into 2 to 4 automated monthly payments via ACH or card, preserving Net Revenue Retention and avoiding contract write-offs.",
  },
  {
    q: "Will autonomous AI collections damage our sensitive corporate client relationships?",
    a: "Never. Jaktra's Groq LLaMA 3.1 model operates with strict SaaS guardrails: early stages are framed as helpful administrative assistance rather than aggressive debt collection, and a built-in 20-hour contact barrier prevents spamming client executives.",
  },
];

export function SaasUseCase() {
  // SaaS ROI Simulator State
  const [annualArr, setAnnualArr] = useState<number>(4000000); // $4M ARR
  const [overduePercent, setOverduePercent] = useState<number>(14); // 14% past due
  const [currentDso, setCurrentDso] = useState<number>(52); // 52 days
  const [targetDso, setTargetDso] = useState<number>(34); // 34 days
  const [activeStageId, setActiveStageId] = useState<string>("stage-1");

  // Derived Calculations
  const overdueArr = annualArr * (overduePercent / 100);
  const dsoCompression = Math.max(0, currentDso - targetDso);
  const dailyRevenue = annualArr / 365;
  const cashUnlocked = Math.round(dailyRevenue * dsoCompression);
  const interestSaved = Math.round(cashUnlocked * 0.08); // 8% cost of capital

  const activeStage = DUNNING_STAGES.find((s) => s.id === activeStageId) || DUNNING_STAGES[0];

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-zinc-100 font-sans selection:bg-[#b7d2f8]/20 selection:text-white">
      <SEOHead
        title="How to Collect Overdue B2B SaaS Invoices Without Churning Accounts | Jaktra"
        description="Learn how to collect overdue B2B SaaS invoices without damaging customer relationships or churning accounts. Automate seat/usage dispute triage, polite tone escalation, and protect Net Retention."
        canonicalPath="/use-cases/saas"
        jsonLd={[
          saasUseCaseSchema,
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Industry Solutions", path: "/use-cases" },
            { name: "B2B SaaS AR", path: "/use-cases/saas" },
          ]),
        ]}
      />

      <HeaderNav />

      <main className="pt-24 pb-20 w-full px-4 sm:px-8 lg:px-12 xl:px-16 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(183,210,248,0.06),transparent)] pointer-events-none" />
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6 text-xs text-zinc-500 font-mono relative z-10">
          <ol className="flex items-center gap-2">
            <li>
              <Link to="/" className="hover:text-zinc-300 transition-colors">
                Home
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link to="/use-cases" className="hover:text-zinc-300 transition-colors">
                Industry Solutions
              </Link>
            </li>
            <li>/</li>
            <li className="text-zinc-300 font-medium" aria-current="page">
              B2B SaaS Collections
            </li>
          </ol>
        </nav>

        {/* Hero Section: Expansive Editorial Header */}
        <header className="mb-12">
          <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-3">
            B2B SaaS Collections &amp; Net Retention Guide
          </span>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="lg:w-7/12">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                B2B SaaS Accounts Receivable: How to Recover Overdue ARR &amp; Protect Net Retention
              </h1>
              <p className="mt-5 text-base sm:text-lg text-zinc-300 leading-relaxed max-w-3xl">
                Stop forcing Account Executives and Customer Success Managers to chase past-due subscription invoices. Discover how autonomous tone escalation and NLP dispute triage resolve seat and usage discrepancies, pulling overdue ARR forward without damaging enterprise renewal relationships.
              </p>
            </div>

            <div className="lg:w-5/12 flex flex-col sm:flex-row lg:flex-col gap-4 lg:items-end">
              <div className="flex items-center gap-3">
                <Link
                  to="/register"
                  className="px-6 py-3.5 rounded-lg bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-200 transition-colors shadow-sm flex items-center gap-2"
                >
                  Start Free Trial <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/use-cases"
                  className="px-5 py-3.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white font-medium text-sm hover:bg-white/[0.08] transition-colors"
                >
                  View All Industries
                </Link>
              </div>
              <span className="text-xs text-zinc-400 font-mono">
                Connects with Stripe Invoicing, QuickBooks, Xero & Chargebee in 15 mins
              </span>
            </div>
          </div>
        </header>

        {/* Edge-to-Edge Architectural Capability Ribbon */}
        <section className="border-y border-white/[0.08] py-8 my-12 grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.08]">
          <div className="px-4 sm:px-6 py-4 sm:py-0">
            <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              Tone Escalation
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono mt-2 tracking-tight">
              5 Stages
            </div>
            <div className="text-xs text-zinc-400 font-medium mt-1 flex items-center gap-1.5">
              <span>Courtesy reminder to executive notice</span>
            </div>
          </div>

          <div className="px-4 sm:px-6 py-4 sm:py-0">
            <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              Direct Settlement
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono mt-2 tracking-tight">
              Zero Login
            </div>
            <div className="text-xs text-zinc-400 font-medium mt-1">
              Tokenized 1-click ACH & card portal
            </div>
          </div>

          <div className="px-4 sm:px-6 py-4 sm:py-0">
            <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              Dispute Handling
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono mt-2 tracking-tight">
              Auto-Pause
            </div>
            <div className="text-xs text-zinc-400 font-medium mt-1">
              NLP detects queries & holds reminders
            </div>
          </div>

          <div className="px-4 sm:px-6 py-4 sm:py-0">
            <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              Ledger Sync
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono mt-2 tracking-tight">
              15 Mins
            </div>
            <div className="text-xs text-zinc-400 font-medium mt-1">
              Connects QuickBooks, Xero & Stripe
            </div>
          </div>
        </section>

        {/* Interactive SaaS ARR & NRR Modeler: Full-Width Split Cockpit */}
        <section className="border-t border-white/[0.08] pt-16 pb-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-2">
                Balance Sheet Simulator
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                Model Cash Flow Acceleration & Involuntary Churn Defense
              </h2>
            </div>
            <p className="text-sm text-zinc-400 max-w-xl leading-relaxed">
              Adjust your SaaS ARR scale and delinquent exposure to quantify working capital accelerated from overdue subscriptions.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Simulator Controls (7 cols) */}
            <div className="lg:col-span-7 space-y-8">
              {/* ARR Slider */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold">
                    Annual Recurring Revenue (ARR)
                  </label>
                  <span className="text-base font-mono font-bold text-white">
                    ${(annualArr / 1000000).toFixed(1)}M USD
                  </span>
                </div>
                <input
                  type="range"
                  min={500000}
                  max={30000000}
                  step={250000}
                  value={annualArr}
                  onChange={(e) => setAnnualArr(Number(e.target.value))}
                  className="w-full accent-blue-400 cursor-pointer h-2 bg-white/[0.08] rounded-lg appearance-none"
                />
                <div className="flex justify-between items-center text-xs text-zinc-500 mt-2 font-mono">
                  <span>$500K</span>
                  <div className="flex gap-2">
                    {[2000000, 5000000, 15000000].map((val) => (
                      <button
                        key={val}
                        onClick={() => setAnnualArr(val)}
                        className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                          annualArr === val ? "bg-white text-zinc-950 font-bold" : "bg-white/[0.04] text-zinc-400 hover:text-white"
                        }`}
                      >
                        ${val / 1000000}M
                      </button>
                    ))}
                  </div>
                  <span>$30M</span>
                </div>
              </div>

              {/* Overdue Percent Slider */}
              <div className="pt-4 border-t border-white/[0.06]">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold">
                    Past-Due Subscription Volume
                  </label>
                  <span className="text-base font-mono font-bold text-white">
                    {overduePercent}% (${Math.round(overdueArr).toLocaleString()} Overdue ARR)
                  </span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={35}
                  step={1}
                  value={overduePercent}
                  onChange={(e) => setOverduePercent(Number(e.target.value))}
                  className="w-full accent-[#b7d2f8] cursor-pointer h-2 bg-white/[0.08] rounded-lg appearance-none"
                />
                <div className="flex justify-between text-xs text-zinc-500 mt-2 font-mono">
                  <span>5% (Best-in-class)</span>
                  <span>15% (Typical B2B SaaS)</span>
                  <span>35% (Elevated Churn Risk)</span>
                </div>
              </div>

              {/* DSO Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4 border-t border-white/[0.06]">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold">
                      Current Baseline DSO
                    </label>
                    <span className="text-base font-mono font-bold text-zinc-200">
                      {currentDso} days
                    </span>
                  </div>
                  <input
                    type="range"
                    min={35}
                    max={75}
                    step={1}
                    value={currentDso}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setCurrentDso(val);
                      if (val <= targetDso) setTargetDso(Math.max(20, val - 10));
                    }}
                    className="w-full accent-zinc-400 cursor-pointer h-2 bg-white/[0.08] rounded-lg appearance-none"
                  />
                  <span className="text-xs text-zinc-500 mt-2 block">Typical SaaS AP cycle turnaround</span>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-xs font-mono uppercase tracking-wider text-[#b7d2f8] font-semibold">
                      Simulated Target DSO Goal
                    </label>
                    <span className="text-base font-mono font-bold text-[#b7d2f8]">
                      {targetDso} days
                    </span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={Math.max(25, currentDso - 5)}
                    step={1}
                    value={targetDso}
                    onChange={(e) => setTargetDso(Number(e.target.value))}
                    className="w-full accent-[#b7d2f8] cursor-pointer h-2 bg-white/[0.08] rounded-lg appearance-none"
                  />
                  <span className="text-xs text-zinc-400 mt-2 block">Simulated goal for treasury modeling</span>
                </div>
              </div>

              {/* Visual Balance Sheet Allocation Meter */}
              <div className="pt-4">
                <div className="flex justify-between text-xs font-mono text-zinc-400 mb-2">
                  <span>Current AR Balance Composition</span>
                  <span className="text-[#b7d2f8] font-semibold">${cashUnlocked.toLocaleString()} Liquidity Unlocked</span>
                </div>
                <div className="w-full h-3 bg-white/[0.06] rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${Math.min(100, Math.max(10, (100 - overduePercent)))}%` }}
                    className="h-full bg-white transition-all duration-300"
                    title="Healthy Active ARR"
                  />
                  <div
                    style={{ width: `${Math.min(100, Math.max(5, overduePercent))}%` }}
                    className="h-full bg-white/[0.25] transition-all duration-300"
                    title="Overdue Subscription ARR"
                  />
                </div>
                <div className="flex gap-6 mt-2 text-[11px] font-mono text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-white shrink-0" />
                    <span>Current Active ARR ({(100 - overduePercent)}%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-zinc-500 shrink-0" />
                    <span>Past-Due Invoices ({overduePercent}%)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Cockpit (5 cols, architectural vertical border, no enclosed card box) */}
            <div className="lg:col-span-5 lg:border-l lg:border-white/[0.08] lg:pl-10 space-y-6">
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold mb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[#b7d2f8]" />
                  <span>Modeled Working Capital Acceleration</span>
                </div>
                <div className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white font-mono tracking-tight">
                  ${cashUnlocked.toLocaleString()}
                </div>
                <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
                  Hypothetical operating cash pulled forward by achieving your simulated {dsoCompression}-day DSO compression target (Formula: <span className="font-mono text-xs text-zinc-300">(ΔDSO / 365) × ARR</span>).
                </p>
              </div>

              <div className="pt-6 border-t border-white/[0.08] grid grid-cols-2 gap-6">
                <div>
                  <div className="text-xs font-mono uppercase text-zinc-400 font-semibold">
                    Past-Due Subscription Pool
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-white mt-1 font-mono">
                    ${Math.round(overdueArr).toLocaleString()}
                  </div>
                  <span className="text-xs text-zinc-500 mt-1 block">Active ARR currently overdue</span>
                </div>

                <div>
                  <div className="text-xs font-mono uppercase text-zinc-400 font-semibold">
                    Simulated Financing Savings
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-white mt-1 font-mono">
                    ${interestSaved.toLocaleString()}<span className="text-xs text-zinc-500 font-normal">/yr</span>
                  </div>
                  <span className="text-xs text-zinc-500 mt-1 block">Modeled at 8% cost of short-term credit</span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/[0.08]">
                <div className="text-xs text-zinc-300 font-mono mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#b7d2f8] shrink-0" />
                  <span>Zero commission charged on recovered revenue</span>
                </div>
                <Link
                  to="/register"
                  className="w-full py-3.5 px-6 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  Accelerate Your SaaS Cash Flow Free <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 3 Core SaaS Dilemmas: Full-Width Open Editorial 3-Column Strip */}
        <section className="border-t border-white/[0.08] pt-16 pb-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-2">
                Operational Breakdown
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                Why Traditional B2B SaaS Dunning Fails High-Value Accounts
              </h2>
            </div>
            <p className="text-sm text-zinc-400 max-w-xl leading-relaxed">
              Standard billing tools blast robotic reminders that land in spam or alienate executive sponsors before renewals. Here is how Jaktra automates collections safely.
            </p>
          </div>

          <div className="border-y border-white/[0.08] divide-y lg:divide-y-0 lg:divide-x divide-white/[0.08] grid grid-cols-1 lg:grid-cols-3">
            {/* Column 1 */}
            <div className="py-8 lg:py-10 lg:pr-8 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8] shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">Account Relationships</span>
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    Protecting Renewal Goodwill
                  </h3>
                </div>
              </div>
              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                When Account Executives or CS managers are tasked with chasing overdue invoices, buyers get defensive and threaten non-renewal during quarterly business reviews (QBRs).
              </p>
              <div className="pt-2 border-t border-white/[0.06] space-y-2">
                <span className="text-xs font-mono uppercase text-[#b7d2f8] font-semibold block">
                  Jaktra Autonomous Resolution:
                </span>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  Acts as an objective, polite third-party finance buffer. Sales leads maintain pure expansion relationships while billing terms are executed professionally.
                </p>
              </div>
            </div>

            {/* Column 2 */}
            <div className="py-8 lg:py-10 lg:px-8 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8] shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">Dispute Resolution</span>
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    Usage & Seat True-up Triage
                  </h3>
                </div>
              </div>
              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                In usage-based or seat-tiered SaaS, debtors freeze payments over surprise overage line-items or unutilized seat allocations. Generic dunning keeps pinging them, causing outrage.
              </p>
              <div className="pt-2 border-t border-white/[0.06] space-y-2">
                <span className="text-xs font-mono uppercase text-[#b7d2f8] font-semibold block">
                  Jaktra Autonomous Resolution:
                </span>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  NLP DisputeAgent detects line-item inquiries immediately, freezes the reminder sequence, and routes a structured audit to your finance team to resolve in hours.
                </p>
              </div>
            </div>

            {/* Column 3 */}
            <div className="py-8 lg:py-10 lg:pl-8 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8] shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">Payment Friction</span>
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    Tokenized Zero-Login Settlement
                  </h3>
                </div>
              </div>
              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                Enterprise AP desks reject navigating multi-step customer portals requiring forgotten passwords or two-factor authentications just to remit a routine invoice.
              </p>
              <div className="pt-2 border-t border-white/[0.06] space-y-2">
                <span className="text-xs font-mono uppercase text-[#b7d2f8] font-semibold block">
                  Jaktra Autonomous Resolution:
                </span>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  Every reminder includes a secure cryptographic debtor link. In 30 seconds, AP updates expired cards, downloads tax forms, or approves instant ACH wires.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* The 5-Stage SaaS Dunning Cadence: Bespoke Interactive Debtor Journey Stream */}
        <section className="border-t border-white/[0.08] pt-16 pb-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-2">
                Tone Escalation Architecture
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                The 5-Stage SaaS Debtor Lifecycle Pipeline
              </h2>
            </div>
            <p className="text-sm text-zinc-400 max-w-xl leading-relaxed">
              Jaktra modulates communication urgency as overdue days accumulate, preserving customer goodwill early and escalating firmly when accounts become delinquent.
            </p>
          </div>

          {/* Interactive Horizontal Stage Pipeline Selector */}
          <div className="border-y border-white/[0.08] py-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {DUNNING_STAGES.map((s) => {
              const isActive = s.id === activeStageId;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveStageId(s.id)}
                  className={`text-left p-4 rounded-xl transition-all duration-200 border ${
                    isActive
                      ? "bg-white/[0.06] border-white/30 shadow-sm"
                      : "bg-transparent border-transparent hover:bg-white/[0.02] hover:border-white/[0.06]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-zinc-400 font-semibold">STAGE {s.stageNumber}</span>
                    <span className="text-xs font-mono text-zinc-400 font-semibold">
                      {s.timing}
                    </span>
                  </div>
                  <div className="text-sm sm:text-base font-bold text-white truncate">
                    {s.title}
                  </div>
                  <div className="text-xs text-zinc-400 mt-1 truncate">
                    {s.tone}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Stage Deep-Dive Cockpit (No Enclosed Boxes: Clean Architectural Split) */}
          <div className="pt-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Stage Strategic Context (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-2">
                  {activeStage.timing} · {activeStage.tone}
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {activeStage.title}
                </h3>
                <p className="text-base text-zinc-300 mt-3 leading-relaxed">
                  {activeStage.description}
                </p>
              </div>

              <div className="pt-4 border-t border-white/[0.08] space-y-2">
                <span className="text-xs font-mono uppercase text-zinc-400 font-semibold block">
                  Debtor Psychology & Timing Logic:
                </span>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  {activeStage.psychology}
                </p>
              </div>

              <div className="pt-4 border-t border-white/[0.08] flex items-start gap-3 text-xs text-[#b7d2f8] font-medium">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Guardrail: {activeStage.guardrail}</span>
              </div>
            </div>

            {/* Stage Live AI Communication Preview (7 cols, Sleek Minimalist Terminal Stream) */}
            <div className="lg:col-span-7 lg:border-l lg:border-white/[0.08] lg:pl-10 space-y-4">
              <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#b7d2f8]" />
                  <span>Autonomous Communication Draft Preview</span>
                </div>
                <span className="text-[11px] text-zinc-500 font-normal">Tone: {activeStage.tone}</span>
              </div>

              <div className="border border-white/[0.08] rounded-xl bg-white/[0.015] p-6 space-y-4">
                <div className="space-y-1.5 pb-4 border-b border-white/[0.06] text-xs font-mono text-zinc-400">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500 w-16">Subject:</span>
                    <span className="text-zinc-200 font-semibold">{activeStage.subject}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500 w-16">To:</span>
                    <span className="text-zinc-300">sarah.finance@clientdomain.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500 w-16">Sender:</span>
                    <span className="text-zinc-300">billing@yourcompany.com (via Jaktra Agent)</span>
                  </div>
                </div>

                <div className="py-2">
                  <p className="text-sm sm:text-base text-zinc-200 leading-relaxed font-sans">
                    {activeStage.sample}
                  </p>
                </div>

                {/* Simulated Debtor Action Link */}
                <div className="pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                    <Lock className="w-3.5 h-3.5 text-[#b7d2f8] shrink-0" />
                    <span>Cryptographic token valid for 7 days</span>
                  </div>
                  <div className="px-4 py-2 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer">
                    <span>{activeStage.actionPrompt}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs: Full-Width Open Split Architecture */}
        <section className="border-t border-white/[0.08] pt-16 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-4 space-y-4">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-2">
                SaaS AR FAQs
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                Frequently Asked Questions for B2B SaaS
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Clear answers on protecting client renewals, resolving seat disputes, and deploying Jaktra alongside Stripe, QuickBooks, or Xero.
              </p>
              <div className="pt-4">
                <Link
                  to="/features/dispute-triage"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[#b7d2f8] hover:text-white transition-colors"
                >
                  Explore AI Dispute Triage Details <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-8 lg:border-l lg:border-white/[0.08] lg:pl-10">
              <Accordion type="single" variant="outline" defaultValue="faq-0" collapsible className="w-full">
                {FAQS.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`} className="border-b border-white/[0.08] py-2">
                    <AccordionTrigger className="text-left font-semibold text-white text-base sm:text-lg hover:no-underline hover:text-[#b7d2f8] transition-colors py-4">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-zinc-300 text-sm sm:text-base leading-relaxed pb-6">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* Bottom Horizon CTA: Full-Width Open Banner */}
        <section className="border-t border-white/[0.08] py-20 text-center relative">
          <div className="max-w-4xl mx-auto space-y-6">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-2">
              Zero Risk · 100% Free During Early Access
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
              Reclaim Overdue ARR & Protect Net Revenue Retention
            </h2>
            <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Connect QuickBooks, Xero, or Stripe Invoicing in under 15 minutes. Stop losing days to awkward collection calls and release trapped working capital immediately.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-200 transition-colors shadow-sm"
              >
                Start Free Trial
              </Link>
              <Link
                to="/use-cases"
                className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white font-medium text-sm hover:bg-white/[0.08] transition-colors"
              >
                Explore All 14 Industry Playbooks
              </Link>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}

export default SaasUseCase;

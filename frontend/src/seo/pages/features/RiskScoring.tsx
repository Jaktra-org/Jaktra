import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ShieldCheck,
  PauseCircle,
  Sparkles,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Scale,
} from "lucide-react";
import { SEOHead } from "@/seo/components/SEOHead";
import { riskScoringSchema, breadcrumbSchema } from "@/seo/schemas";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { GlobalNav } from "@/components/common/GlobalNav";

interface RiskScenario {
  id: string;
  tabLabel: string;
  company: string;
  invoiceNo: string;
  amount: string;
  daysOverdue: string;
  score: number;
  tierLabel: string;
  tierBadgeStyle: string;
  agingSignal: string;
  balanceExposure: string;
  responseSignal: string;
  historySignal: string;
  whatJaktraDoes: string;
  howAiAdapts: string;
  safeguardNote: string;
}

const SCENARIOS: RiskScenario[] = [
  {
    id: "low-risk",
    tabLabel: "Low Risk (0–7 Days / Warm)",
    company: "Meridian Health Tech",
    invoiceNo: "INV-5120",
    amount: "$3,200.00",
    daysOverdue: "4 Days Overdue",
    score: 16,
    tierLabel: "Stage 1: Warm Courtesy",
    tierBadgeStyle: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    agingSignal: "4 days past due (within typical grace window)",
    balanceExposure: "$3,200 (Low portfolio concentration)",
    responseSignal: "Opened portal link 2 hours ago; viewed statement",
    historySignal: "98% on-time settlement track record over 14 prior invoices",
    whatJaktraDoes:
      "Classifies the delay as a routine administrative oversight rather than credit delinquency. Keeps the invoice in the standard low-urgency queue without triggering alarm flags.",
    howAiAdapts:
      "The AI agent deploys a friendly courtesy note referencing the invoice details and attaching a zero-login payment portal link. Preserves client relationship equity without aggressive phrasing.",
    safeguardNote:
      "Autonomous follow-up pacing with zero manual credit controller intervention needed.",
  },
  {
    id: "medium-risk",
    tabLabel: "Medium Risk (8–14 Days / Firm)",
    company: "Crestview Digital Partners",
    invoiceNo: "INV-4890",
    amount: "$14,500.00",
    daysOverdue: "11 Days Overdue",
    score: 42,
    tierLabel: "Stage 2: Firm Commercial Check",
    tierBadgeStyle: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    agingSignal: "11 days past due (exceeded initial grace window)",
    balanceExposure: "$14,500 (Moderate working capital exposure)",
    responseSignal: "2 touches dispatched; debtor link remains unclicked",
    historySignal: "82% historical settlement rate with occasional batch AP delays",
    whatJaktraDoes:
      "Elevates invoice priority in your collection dashboard. Transitions tracking schedule to structured accounts payable follow-up and verifies billing contact accuracy.",
    howAiAdapts:
      "AI tone shifts from casual check-in to firm commercial accounting follow-up, requesting verification of the upcoming batch pay run date and attaching direct invoice PDFs.",
    safeguardNote:
      "If the customer promises a future pay date, Jaktra automatically pauses cadences until that date passes.",
  },
  {
    id: "high-risk",
    tabLabel: "High Risk (15–21 Days / Serious)",
    company: "Apex Industrial Systems",
    invoiceNo: "INV-4215",
    amount: "$36,800.00",
    daysOverdue: "18 Days Overdue",
    score: 68,
    tierLabel: "Stage 3: Serious Escalation & Installments",
    tierBadgeStyle: "text-orange-400 bg-orange-500/10 border-orange-500/20",
    agingSignal: "18 days past due (entering delinquent aging bracket)",
    balanceExposure: "$36,800 (High revenue concentration risk)",
    responseSignal: "3 prior reminders unacknowledged; zero portal engagement",
    historySignal: "65% on-time settlement rate; history of cash flow bottlenecks",
    whatJaktraDoes:
      "Flags the account prominently on the finance manager review queue. Increases follow-up cadence velocity and automatically introduces structured milestone installment alternatives.",
    howAiAdapts:
      "The agent reaches out to executive finance contacts with structured options, offering a 1-click 2x or 3x installment schedule (/i/:token) to unlock partial cash flow immediately.",
    safeguardNote:
      "If the debtor accepts an installment plan, full-balance demands freeze instantly upon manager approval.",
  },
  {
    id: "critical-risk",
    tabLabel: "Critical Risk (22+ Days / Legal Stop)",
    company: "Solarix Energy Dynamics",
    invoiceNo: "INV-3910",
    amount: "$54,000.00",
    daysOverdue: "32 Days Overdue",
    score: 92,
    tierLabel: "Stage 5: Legal Review Stop Trigger",
    tierBadgeStyle: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    agingSignal: "32 days past due (severe default threshold)",
    balanceExposure: "$54,000 (Critical working capital exposure)",
    responseSignal: "4 automated reminders unacknowledged; debtor ghosting",
    historySignal: "Severe delinquency record; previous invoices required formal counsel notices",
    whatJaktraDoes:
      "Autonomous follow-up stops immediately. Jaktra prevents tone-deaf automated dunning, places the account on review hold, and compiles an audit-ready dossier for executive leadership.",
    howAiAdapts:
      "The engine drafts a formal pre-legal demand dossier containing complete communication logs, timestamped reminder histories, and signed purchase order documentation.",
    safeguardNote:
      "Dead-Letter Queue (DLQ) safeguards block robot communications until human counsel authorizes next steps.",
  },
];

export function RiskScoring() {
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  const activeScenario = SCENARIOS[selectedScenarioIndex];

  const handleScenarioSelect = (index: number) => {
    setSelectedScenarioIndex(index);
  };

  const faqs = [
    {
      q: "How does Jaktra calculate predictive delinquency risk scores?",
      a: "Jaktra's risk engine analyzes four key data vectors for every open invoice: temporal days overdue (35% weight), outstanding balance exposure (25% weight), debtor responsiveness / follow-up attempts (20% weight), and the client's historical on-time payment track record (20% weight).",
    },
    {
      q: "Why is risk-based prioritization better than FIFO invoice dunning?",
      a: "Chasing invoices on a simple first-in, first-out (FIFO) schedule forces finance teams to spend identical energy on a $400 bill from a reliable enterprise customer as on a $45,000 balance from an unstable startup. Risk scoring directs human and automated attention to high-dollar, high-default accounts before they turn into write-offs.",
    },
    {
      q: "How does the risk score dynamically adjust collection cadences?",
      a: "When an invoice's risk score climbs from Low to High, Jaktra automatically accelerates the tone escalation velocity—switching from cordial check-ins to firm administrative notices with installment offers—while triggering internal notifications to the finance controller.",
    },
    {
      q: "What happens when a debtor has a flawless historical payment rate?",
      a: "For long-standing clients with pristine payment records, Jaktra softens the escalation progression. The AI model treats the delay as an administrative oversight rather than credit delinquency, preserving executive goodwill and preventing aggressive collection phrasing.",
    },
    {
      q: "Does Jaktra update risk scores in real time as debtor actions occur?",
      a: "Yes. When a debtor opens a tokenized portal link, downloads a statement, proposes an installment schedule, or sends an inquiry, the event stream updates the scoring parameters immediately, adjusting collection urgency in real time.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#010102] text-[#f7f8f8] font-sans antialiased selection:bg-[#5e6ad2]/30 selection:text-white">
      <SEOHead
        title="Predictive AR Risk Scoring & Priority Engine | Jaktra"
        description="Predict invoice defaults before they happen. Discover how Jaktra's 4-factor AR risk scoring model prioritizes collection efforts and protects cash flow."
        canonicalPath="/features/risk-scoring"
        jsonLd={[
          riskScoringSchema,
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Features", path: "/features" },
            { name: "Predictive Risk Scoring", path: "/features/risk-scoring" },
          ]),
        ]}
      />

      <GlobalNav />

      <main className="pt-24 pb-20 max-w-6xl mx-auto px-4 sm:px-6 relative">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(183,210,248,0.07),transparent)] pointer-events-none" />

        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6 text-xs text-zinc-400 font-sans relative z-10">
          <ol className="flex items-center gap-1.5">
            <li>
              <Link to="/" className="hover:text-zinc-200 transition-colors">
                Home
              </Link>
            </li>
            <li className="text-zinc-600">/</li>
            <li>
              <Link to="/features" className="hover:text-zinc-200 transition-colors">
                Features
              </Link>
            </li>
            <li className="text-zinc-600">/</li>
            <li className="text-zinc-200 font-medium" aria-current="page">
              Predictive Risk Scoring
            </li>
          </ol>
        </nav>

        {/* CLEAN HERO HEADER */}
        <header className="mb-10 relative z-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] xl:text-[44px] font-extrabold tracking-tight text-white mb-3.5 leading-tight lg:leading-none whitespace-normal md:whitespace-nowrap">
            Predictive AR Risk Scoring &amp; Priority Engine
          </h1>

          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-3xl">
            Stop chasing all overdue invoices equally. Jaktra scores open receivables across aging velocity, balance exposure, debtor responsiveness, and dispute history to direct human and automated focus where default risk is highest.
          </p>
        </header>

        {/* SIMPLE, UNCLUTTERED SCENARIO EXPLORER */}
        <section className="mb-16 relative z-10">
          {/* Clean Scenario Tabs */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {SCENARIOS.map((sc, idx) => {
              const isSelected = selectedScenarioIndex === idx;
              return (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => handleScenarioSelect(idx)}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    isSelected
                      ? "bg-white text-zinc-950 font-semibold shadow-sm"
                      : "bg-white/[0.03] text-zinc-400 hover:text-white hover:bg-white/[0.06] border border-white/[0.06]"
                  }`}
                >
                  {sc.tabLabel}
                </button>
              );
            })}
          </div>

          {/* Single Focused Card */}
          <div className="rounded-2xl bg-[#0c0d10] border border-white/[0.08] p-6 sm:p-8 space-y-6 shadow-2xl">
            {/* Header: Invoice & Status */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-white/[0.06]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base font-bold text-white">{activeScenario.company}</span>
                  <span className="text-xs font-mono text-zinc-400">({activeScenario.invoiceNo})</span>
                </div>
                <div className="text-xs text-zinc-400">
                  Balance: <strong className="text-white">{activeScenario.amount}</strong> &bull; Status: {activeScenario.daysOverdue}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[11px] font-mono text-zinc-500 uppercase block">Risk Score</span>
                  <span className="text-lg font-bold font-mono text-white">{activeScenario.score} / 100</span>
                </div>
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium ${activeScenario.tierBadgeStyle}`}>
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{activeScenario.tierLabel}</span>
                </div>
              </div>
            </div>

            {/* 1. Risk Telemetry Signals */}
            <div className="space-y-3">
              <div className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="w-3.5 h-3.5 text-[#b7d2f8]" />
                <span>Computed Telemetry Signals</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs space-y-1">
                  <div className="text-[11px] font-mono text-zinc-500 uppercase">Aging Velocity</div>
                  <div className="font-semibold text-white">{activeScenario.agingSignal}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs space-y-1">
                  <div className="text-[11px] font-mono text-zinc-500 uppercase">Balance Exposure</div>
                  <div className="font-semibold text-white">{activeScenario.balanceExposure}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs space-y-1">
                  <div className="text-[11px] font-mono text-zinc-500 uppercase">Debtor Responsiveness</div>
                  <div className="font-semibold text-white">{activeScenario.responseSignal}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs space-y-1">
                  <div className="text-[11px] font-mono text-zinc-500 uppercase">Historical Track Record</div>
                  <div className="font-semibold text-white">{activeScenario.historySignal}</div>
                </div>
              </div>
            </div>

            {/* 2. Feature Explanation: What Jaktra Does & How Outreach Adapts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <PauseCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>What Jaktra Does Immediately</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {activeScenario.whatJaktraDoes}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <Sparkles className="w-4 h-4 text-[#b7d2f8] shrink-0" />
                  <span>How AI Follow-Ups Adapt</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {activeScenario.howAiAdapts}
                </p>
              </div>
            </div>

            {/* Safeguard & Human Review Guarantee */}
            <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
              <div className="flex items-center gap-2 text-zinc-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{activeScenario.safeguardNote}</span>
              </div>
              <span className="text-[11px] text-zinc-500 font-mono shrink-0">
                Continuous real-time telemetry scoring
              </span>
            </div>
          </div>
        </section>

        {/* 4-PHASE LIFECYCLE: HOW THE RISK SCORING ENGINE WORKS */}
        <section className="mb-16 border-t border-white/[0.08] pt-12">
          <div className="max-w-2xl mb-8">
            <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold block mb-1">
              End-to-End Scoring Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              How Jaktra Predicts and Mitigates Delinquency Risk
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#0c0d10] border border-white/[0.08] space-y-3 relative">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Phase 1
              </span>
              <h3 className="text-sm font-semibold text-white">Continuous Signal Ingestion</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Jaktra pulls real-time telemetry: invoice age, balance exposure, prior reminders sent, debtor portal clicks, and historical on-time payment track records.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0c0d10] border border-white/[0.08] space-y-3 relative">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Phase 2
              </span>
              <h3 className="text-sm font-semibold text-white">Multi-Factor Scoring</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                The algorithm weights aging (35%), balance exposure (25%), responsiveness (20%), and client history (20%), computing a precise risk score from 0 to 100.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0c0d10] border border-white/[0.08] space-y-3 relative">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                Phase 3
              </span>
              <h3 className="text-sm font-semibold text-white">Cadence &amp; Tone Modulation</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Scores dynamically adjust collection velocity. Low-risk accounts receive polite nudges; high-risk accounts receive accelerated, firm notices with installment offers.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0c0d10] border border-white/[0.08] space-y-3 relative">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Phase 4
              </span>
              <h3 className="text-sm font-semibold text-white">Controller Alert &amp; Safeguards</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Critical receivables surface immediately on your finance dashboard. If legal escalation triggers, robot outreach halts and an audit dossier is prepared for counsel.
              </p>
            </div>
          </div>
        </section>

        {/* COMPARISON TABLE: JAKTRA VS FIFO DUNNING */}
        <section className="mb-16 rounded-2xl bg-[#0c0d10] border border-white/[0.08] p-5 sm:p-7 shadow-xl">
          <div className="mb-5">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-1">
              Operational Comparison
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Predictive Risk Scoring vs. Traditional FIFO Dunning
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[620px]">
              <thead>
                <tr className="border-b border-white/[0.08] text-[11px] font-mono uppercase text-zinc-400">
                  <th className="py-3 px-4">Operational Dimension</th>
                  <th className="py-3 px-4 text-zinc-400">Traditional FIFO Dunning</th>
                  <th className="py-3 px-4 text-[#b7d2f8] font-bold">Jaktra Predictive Risk Engine</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Collection Prioritization</td>
                  <td className="py-3 px-4 text-zinc-400">Chases invoices strictly in calendar order regardless of amount</td>
                  <td className="py-3 px-4 text-white font-medium bg-[#b7d2f8]/5">Prioritizes high-exposure, at-risk receivables before small bills</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Large Enterprise Exposure</td>
                  <td className="py-3 px-4 text-zinc-400">Treated identically to minor $200 transactional invoices</td>
                  <td className="py-3 px-4 text-white font-medium bg-[#b7d2f8]/5">Monitors concentration risk and flags balances exceeding thresholds</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Client Relationship Tone</td>
                  <td className="py-3 px-4 text-zinc-400">Sends aggressive emails to reliable buyers who pay a few days late</td>
                  <td className="py-3 px-4 text-white font-medium bg-[#b7d2f8]/5">Adjusts tone based on history, treating minor delays as courtesy checks</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Unresponsive Debtor Actions</td>
                  <td className="py-3 px-4 text-zinc-400">Spams the same template until client blocks the email domain</td>
                  <td className="py-3 px-4 text-white font-medium bg-[#b7d2f8]/5">Accelerates escalation, introduces installment options, then halts for review</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Finance Team Workload</td>
                  <td className="py-3 px-4 text-zinc-400">Manual review of sprawling aging reports and spreadsheets</td>
                  <td className="py-3 px-4 text-white font-medium bg-[#b7d2f8]/5">Autonomous scoring surfaces top 5% at-risk accounts for human action</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 6 CORE CAPABILITIES GRID */}
        <section className="mb-16">
          <div className="max-w-2xl mb-8">
            <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold block mb-1">
              Built-In Architecture
            </span>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Real Features Powering Predictive Risk Intelligence
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-[#0c0d10] border border-white/[0.08] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">4-Factor Telemetry Engine</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Weights aging velocity, balance exposure, debtor responsiveness, and historical track record into an objective 0–100 score.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0c0d10] border border-white/[0.08] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">Dynamic 5-Stage Tone Mapping</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Maps risk scores directly into Jaktra&apos;s tone stages (Warm, Firm, Serious, Stern, Legal) so outreach scales proportionally.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0c0d10] border border-white/[0.08] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Scale className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">Portfolio Exposure Weighting</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Differentiates large enterprise contracts from low-value invoices, ensuring high-risk balances receive immediate executive visibility.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0c0d10] border border-white/[0.08] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">Portal Interaction Telemetry</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Tracks whether debtors view statements or click payment links via zero-login tokens (<code className="text-[#b7d2f8] font-mono text-[11px]">/i/:token</code>) to detect intent early.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0c0d10] border border-white/[0.08] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">Installment Recovery Off-Ramp</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                When invoices enter Stage 3 risk, Jaktra automatically offers structured 2x–4x installment plans to avoid write-offs.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0c0d10] border border-white/[0.08] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">Dead-Letter Queue Safeguards</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Invoices subject to disputes or legal escalation are safely blocked from automated outreach, preventing tone-deaf emails.
              </p>
            </div>
          </div>
        </section>

        {/* FREQUENTLY ASKED QUESTIONS */}
        <section className="mb-16">
          <div className="max-w-2xl mb-8">
            <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold block mb-1">
              Common Questions
            </span>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="rounded-2xl bg-[#0c0d10] border border-white/[0.08] p-6 sm:p-8">
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="border-b border-white/[0.06] last:border-0 pb-4 last:pb-0"
                >
                  <AccordionTrigger className="text-sm font-medium text-white hover:text-[#b7d2f8] text-left">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-xs sm:text-sm text-zinc-400 leading-relaxed pt-2">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CLEAN HIGH-CONVERTING BOTTOM CTA */}
        <section className="rounded-2xl bg-[#0c0d10] border border-white/[0.08] p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
          <div className="max-w-xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Prioritize Collections with Predictive Risk Scoring
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Stop treating all invoices equally. Identify delinquent accounts before they default and protect cash flow with Jaktra&apos;s autonomous AI collections agent.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                to="/register"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-white text-zinc-950 font-semibold text-xs sm:text-sm hover:bg-zinc-200 transition-colors shadow-sm inline-flex items-center justify-center gap-2"
              >
                <span>Get started free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/features"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-white/[0.04] text-zinc-300 hover:text-white hover:bg-white/[0.08] border border-white/[0.08] text-xs sm:text-sm font-medium transition-colors"
              >
                Explore all features
              </Link>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}

export default RiskScoring;

import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, ArrowRight, Sparkles, ShieldCheck, Layers, PhoneCall, Bot, CreditCard } from "lucide-react";
import jaktraLogo from "../assets/jaktra_svg.svg";
import { SEOHead } from "../components/common/SEOHead";
import { kollenoCompareSchema, breadcrumbSchema } from "../components/common/seo-schemas";
import { LandingFooter } from "../components/landing/LandingFooter";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { CompareDisclaimer } from "../components/common/CompareDisclaimer";

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

interface ComparisonRow {
  feature: string;
  category: string;
  kolleno: string;
  jaktra: string;
  highlight?: boolean;
}

const COMPARISON_DATA: ComparisonRow[] = [
  {
    feature: "Core Architecture & Operating Model",
    category: "Architecture",
    kolleno: "Omnichannel collector task queues (call logs, SMS, manual tasks)",
    jaktra: "Lightweight autonomous AI collections execution agent (zero call queues)",
    highlight: true,
  },
  {
    feature: "Outbound Communication Engine",
    category: "Messaging",
    kolleno: "Static email templates and multi-channel scheduled tasks",
    jaktra: "Groq LLaMA 3.1 generative tone modulation across 5 stages",
    highlight: true,
  },
  {
    feature: "Inbound Debtor Reply Triage",
    category: "Workflow",
    kolleno: "Manual collector review in shared inbox; manual dispute tagging",
    jaktra: "NLP DisputeAgent auto-classifies replies & halts cadences instantly",
    highlight: true,
  },
  {
    feature: "Debtor Payment Portal Access",
    category: "Debtor Experience",
    kolleno: "Multi-step customer portal requiring account setup or sign-in",
    jaktra: "Cryptographic zero-login portal (/i/:token) with instant 30s Razorpay settlement",
    highlight: true,
  },
  {
    feature: "Delinquency Recovery Rails",
    category: "Flexibility",
    kolleno: "Collector manually negotiates terms and logs custom installment notes",
    jaktra: "Debtor self-serves structured 2x/3x/4x automated installment plans",
    highlight: true,
  },
  {
    feature: "Deliverability & Reputation Guardrails",
    category: "Deliverability",
    kolleno: "Standard mailer relay; manual bounce handling",
    jaktra: "Dead Letter Queue (DLQ), 3-drop circuit breaker, 20-hr idempotency guard",
    highlight: true,
  },
  {
    feature: "Contract Terms & Annual Pricing",
    category: "Commercial",
    kolleno: "Custom quote-based annual enterprise plans",
    jaktra: "100% Free during Early Access (No credit card required)",
    highlight: true,
  },
];



export function KollenoCompare() {
  const [kollenoAnnualFee, setKollenoAnnualFee] = useState<number>(12500);
  const [collectorCount, setCollectorCount] = useState<number>(2);

  const jaktraAnnualCost = 0; 
  const directSoftwareSavings = kollenoAnnualFee - jaktraAnnualCost;
  const hoursSavedPerMonth = collectorCount * 36;
  const annualHoursSaved = hoursSavedPerMonth * 12;
  const laborValueReclaimed = annualHoursSaved * 45;
  const totalAnnualBenefit = directSoftwareSavings + laborValueReclaimed;

  const faqs = [
    {
      q: "What is the primary architectural difference between Kolleno and Jaktra?",
      a: "Kolleno is an omnichannel AR management workspace designed to organize human collectors with task queues, manual call logging, and multi-channel message scheduling. Jaktra is an Autonomous Conversational AI Collections Agent designed to eliminate manual collector task lists altogether. Jaktra dynamically writes and modulates email tone using Groq LLaMA 3.1, automatically classifies inbound replies via NLP, and provides tokenized zero-login payment links.",
    },
    {
      q: "Why do finance teams switch from Kolleno to Jaktra?",
      a: "Finance leaders frequently switch because Kolleno still requires significant human collector hours to manage queues and respond to incoming emails. Jaktra automates the routine follow-up and sentiment classification lifecycle autonomously, eliminating repetitive task lists while costing a fraction of Kolleno's $8,000–$18,000+/year enterprise contracts.",
    },
    {
      q: "How does Jaktra handle debtor dispute emails compared to Kolleno?",
      a: "In Kolleno, incoming debtor replies land in a shared communications inbox where a collector must manually read, tag, and assign the dispute. Jaktra uses an NLP DisputeAgent that instantly classifies replies into disputes, promises, or queries upon receipt, automatically pauses the collection cadence, and generates a context-aware drafted response for one-click human approval.",
    },
    {
      q: "Does Jaktra require multi-step debtor portal logins?",
      a: "No. Requiring customer AP contacts to create a password or log into a portal introduces friction that delays payments by days. Jaktra generates cryptographic, tokenized links (/i/:token) that allow debtors to view invoices, inspect statements, and remit payment in 30 seconds via Razorpay (corporate cards, NetBanking, UPI, and dedicated virtual bank accounts).",
    },
    {
      q: "Can debtors select installment payment plans autonomously?",
      a: "Yes. In Jaktra, debtors who cannot pay in full can self-select 2x, 3x, or 4x milestone installment plans directly inside the tokenized portal. Jaktra automatically schedules the payment milestones and coordinates follow-ups without requiring a collector to manually draft payment agreements.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#f5f5f5] font-sans selection:bg-[#b7d2f8]/20 selection:text-white antialiased">
      <SEOHead
        title="Kolleno Alternative — Autonomous Conversational AI vs Manual Collector Task Lists | Jaktra"
        description="Compare Kolleno vs Jaktra. Learn why finance teams choose Jaktra's autonomous Groq LLaMA 3.1 tone escalation and NLP dispute triage over Kolleno's manual collector task lists and multi-channel queues."
        canonicalPath="/compare/kolleno-alternative"
        jsonLd={[
          kollenoCompareSchema,
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Compare", path: "/compare" },
            { name: "Kolleno Alternative", path: "/compare/kolleno-alternative" },
          ]),
        ]}
      />

      <HeaderNav />

      <main className="pt-28 sm:pt-32 pb-24 px-4 sm:px-6 max-w-5xl mx-auto relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(183,210,248,0.06),transparent)] pointer-events-none" />
        <nav aria-label="Breadcrumb" className="mb-6 text-xs text-zinc-500 relative z-10">
          <ol className="flex items-center gap-2">
            <li>
              <Link to="/" className="hover:text-zinc-300 transition-colors">
                Home
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link to="/compare" className="text-zinc-400 hover:text-zinc-300 transition-colors">
                Compare
              </Link>
            </li>
            <li>/</li>
            <li className="text-zinc-300 font-medium" aria-current="page">
              Kolleno Alternative
            </li>
          </ol>
        </nav>

        <section className="text-center max-w-4xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-4">
            Competitor Comparison &amp; Architectural Fit
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-6 leading-tight">
            Kolleno vs. Jaktra: Manual Collector Task Queues vs. Autonomous Conversational AI
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 max-w-3xl mx-auto leading-relaxed mb-8">
            Kolleno organizes human collectors with multi-channel calling lists and manual task queues. Jaktra eliminates collector calling lists entirely with an autonomous conversational AI agent that modulates tone across 5 stages in 15 minutes.
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
              Explore Free Early Access
            </Link>
          </div>
        </section>

        <section className="mb-16">
          <div className="max-w-3xl mb-8">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-2">
              Operating Models
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Two Distinct Operating Models for Accounts Receivable
            </h2>
            <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
              Do you want to equip human collectors with a daily call list, or do you want an autonomous AI agent that executes collection cadences for you?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.08] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-[#b7d2f8]/10 border border-[#b7d2f8]/20 flex items-center justify-center text-[#b7d2f8] mb-4">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">When You Need Kolleno</h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-4">
                  Kolleno is built for finance teams that want to maintain a hands-on credit control staff and need a centralized hub for:
                </p>
                <ul className="space-y-2.5 text-xs text-zinc-300">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                    <span>Orchestrating phone call scripts, manual phone logs, and SMS cadences</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                    <span>Assigning manual daily task checklists to junior credit controllers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                    <span>Handling multi-channel inbound messaging inside a unified shared inbox</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                    <span>Enterprise software budget with custom annual contract terms and onboarding</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-white/[0.06] text-xs text-[#b7d2f8] font-medium">
                Best for: Teams with dedicated credit controllers who execute outbound calls daily
              </div>
            </div>

            <div className="p-6 rounded-xl bg-[#b7d2f8]/[0.03] border border-[#b7d2f8]/30 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-[#b7d2f8]/10 border border-[#b7d2f8]/20 flex items-center justify-center text-[#b7d2f8] mb-4">
                  <Bot className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">When You Need Jaktra</h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-4">
                  Jaktra is built for high-velocity finance teams that want autonomous execution without paying for human calling queues:
                </p>
                <ul className="space-y-2.5 text-xs text-zinc-300">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#b7d2f8] shrink-0 mt-0.5" />
                    <span>Autonomous Groq LLaMA 3.1 tone escalation across 5 stages (no human queues needed)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#b7d2f8] shrink-0 mt-0.5" />
                    <span>Automated NLP dispute triage with cadence auto-freeze</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#b7d2f8] shrink-0 mt-0.5" />
                    <span>Cryptographic zero-login debtor links (`/i/:token`) with 30s Razorpay settlement</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#b7d2f8] shrink-0 mt-0.5" />
                    <span>15-minute setup with 100% Free Early Access (No credit card required)</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-white/[0.06] text-xs text-[#b7d2f8] font-medium">
                Best for: Lean finance teams looking to reduce DSO autonomously without hiring collectors
              </div>
            </div>
          </div>
        </section>

        <section className="mb-20">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Head-to-Head Feature Comparison Matrix
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto text-xs sm:text-sm">
              Evaluate Kolleno and Jaktra across core architectural parameters and commercial terms.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#111113]">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.03] text-xs font-mono uppercase tracking-wider text-zinc-300">
                  <th className="py-4 px-6 font-semibold">Capability</th>
                  <th className="py-4 px-6 text-zinc-400 font-semibold w-1/3">Kolleno</th>
                  <th className="py-4 px-6 text-[#b7d2f8] font-bold w-1/3 bg-[#b7d2f8]/10 border-l border-[#b7d2f8]/20">
                    Jaktra (Autonomous AI)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {COMPARISON_DATA.map((row, idx) => (
                  <tr
                    key={idx}
                    className={row.highlight ? "bg-white/[0.02] hover:bg-white/[0.04] transition-colors" : "hover:bg-white/[0.02] transition-colors"}
                  >
                    <td className="py-4 px-6 font-medium text-white">
                      <div>{row.feature}</div>
                      <div className="text-[11px] text-zinc-400 font-mono mt-0.5">{row.category}</div>
                    </td>
                    <td className="py-4 px-6 text-zinc-400">{row.kolleno}</td>
                    <td className="py-4 px-6 text-zinc-200 bg-[#b7d2f8]/[0.03] border-l border-[#b7d2f8]/20">
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#b7d2f8] shrink-0 mt-0.5" />
                        <span>{row.jaktra}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-20 rounded-2xl border border-white/[0.08] bg-[#111113] p-8 sm:p-10">
          <div className="text-center mb-8">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#b7d2f8] block mb-2">
              Interactive ROI Model
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Kolleno vs. Jaktra TCO Savings Calculator
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm max-w-xl mx-auto">
              Calculate software subscription savings plus reclaimed finance labor hours.
            </p>
          </div>

          <div className="max-w-2xl mx-auto space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-xs text-zinc-300 font-medium flex justify-between mb-2">
                  <span>Estimated Enterprise Annual Software Cost</span>
                  <span className="text-[#b7d2f8] font-mono">${kollenoAnnualFee.toLocaleString()}</span>
                </label>
                <input
                  type="range"
                  min={6000}
                  max={25000}
                  step={500}
                  value={kollenoAnnualFee}
                  onChange={(e) => setKollenoAnnualFee(Number(e.target.value))}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#b7d2f8]"
                />
                <span className="text-[11px] text-zinc-500 mt-1 block">Benchmark quote range for mid-market AR suites</span>
              </div>

              <div>
                <label className="text-xs text-zinc-300 font-medium flex justify-between mb-2">
                  <span>Finance Collectors on Staff</span>
                  <span className="text-[#b7d2f8] font-mono">{collectorCount} collector(s)</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={6}
                  step={1}
                  value={collectorCount}
                  onChange={(e) => setCollectorCount(Number(e.target.value))}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#b7d2f8]"
                />
                <span className="text-[11px] text-zinc-500 mt-1 block">Reclaims ~36 hours/month per collector</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-white/[0.08] text-center">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <span className="text-xs text-zinc-400 block mb-1">Direct Software Savings</span>
                <span className="text-xl sm:text-2xl font-bold text-white font-mono">
                  ${directSoftwareSavings.toLocaleString()}/yr
                </span>
                <span className="text-[10px] text-zinc-500 block mt-1">vs. Jaktra $0 Early Access</span>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <span className="text-xs text-zinc-400 block mb-1">Collector Hours Reclaimed</span>
                <span className="text-xl sm:text-2xl font-bold text-[#b7d2f8] font-mono">
                  {annualHoursSaved.toLocaleString()} hrs/yr
                </span>
                <span className="text-[10px] text-zinc-500 block mt-1">{hoursSavedPerMonth} hrs/month reallocated</span>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.12]">
                <span className="text-xs text-zinc-300 font-medium block mb-1">Total Economic Benefit</span>
                <span className="text-xl sm:text-2xl font-bold text-white font-mono">
                  ${Math.round(totalAnnualBenefit).toLocaleString()}/yr
                </span>
                <span className="text-[10px] text-zinc-400 block mt-1">Direct savings + finance labor value</span>
              </div>
            </div>
          </div>
        </section>

        {/* 4 Pillars of Autonomous Superiority (Open Scannable Grid) */}
        <section className="mb-20">
          <div className="text-center mb-10">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-2">
              Autonomous Efficiency
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Why Fast-Moving Finance Teams Choose Jaktra
            </h2>
            <p className="text-sm text-zinc-400 max-w-xl mx-auto mt-2">
              Autonomous execution that preserves client goodwill without manual work queues.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 sm:p-7 rounded-2xl bg-[#111113] border border-white/[0.08] shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8]">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-white/[0.04] border border-white/[0.08] text-[#b7d2f8]">
                    Tone Intelligence
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  Groq LLaMA 3.1 AI Generation vs. Rigid Templates
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-4">
                  Kolleno organizes human credit controllers into manual call lists and static email templates. Jaktra uses Groq LLaMA 3.1 to compose context-aware messages tailored to aging and prior payment patterns, keeping communications courteous, firm, and relationship-friendly without human collector fatigue.
                </p>
              </div>
              <div className="text-xs text-zinc-300 flex items-center gap-1.5 pt-3 border-t border-white/[0.05]">
                <Check className="w-3.5 h-3.5 text-[#b7d2f8]" />
                <span>Shortens payment cycles by 15–25 days while protecting enterprise vendor relationships</span>
              </div>
            </div>

            <div className="p-6 sm:p-7 rounded-2xl bg-[#111113] border border-white/[0.08] shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8]">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-white/[0.04] border border-white/[0.08] text-[#b7d2f8]">
                    Dispute Safeguard
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  Automated Dispute Triage &amp; Cadence Freeze
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-4">
                  When debtors reply asking about invoice details or disputing an item, Kolleno requires human collectors to triage the email in a shared queue. Jaktra&apos;s NLP DisputeAgent parses replies instantly, immediately freezes active dunning schedules, and drafts recommended resolution steps for one-click finance approval.
                </p>
              </div>
              <div className="text-xs text-zinc-300 flex items-center gap-1.5 pt-3 border-t border-white/[0.05]">
                <Check className="w-3.5 h-3.5 text-[#b7d2f8]" />
                <span>Zero risk of blast-dunning clients who have open queries or billing questions</span>
              </div>
            </div>

            <div className="p-6 sm:p-7 rounded-2xl bg-[#111113] border border-white/[0.08] shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8]">
                    <Layers className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-white/[0.04] border border-white/[0.08] text-[#b7d2f8]">
                    Flexible Recovery
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  Self-Serve Installment Plans (2x / 3x / 4x)
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-4">
                  In Kolleno, credit controllers must manually negotiate payment plans over calls and write custom installment notes. Jaktra gives debtors the self-serve option to break large overdue invoices into 2x, 3x, or 4x milestone payments with automated recurring debits directly inside their tokenized portal.
                </p>
              </div>
              <div className="text-xs text-zinc-300 flex items-center gap-1.5 pt-3 border-t border-white/[0.05]">
                <Check className="w-3.5 h-3.5 text-[#b7d2f8]" />
                <span>Debtors choose terms that fit their cash flow, eliminating 90%+ of default losses</span>
              </div>
            </div>

            <div className="p-6 sm:p-7 rounded-2xl bg-[#111113] border border-white/[0.08] shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8]">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-white/[0.04] border border-white/[0.08] text-[#b7d2f8]">
                    Debtor UX
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  Cryptographic Zero-Login Debtor Portals (<code className="text-xs font-mono">/i/:token</code>)
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-4">
                  Instead of demanding that AP accountants register accounts and remember credentials, Jaktra generates secure cryptographic links. Debtors inspect their live statements of account, review attached documentation, and pay instantly using Razorpay (UPI, NetBanking, Cards).
                </p>
              </div>
              <div className="text-xs text-zinc-300 flex items-center gap-1.5 pt-3 border-t border-white/[0.05]">
                <Check className="w-3.5 h-3.5 text-[#b7d2f8]" />
                <span>Immediate webhook ledger reconciliation updates your books automatically upon payment</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-20">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Frequently Asked Questions: Kolleno vs. Jaktra
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm">
              Clear technical answers to help you evaluate the right accounts receivable platform.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" variant="outline" defaultValue="faq-0" collapsible className="w-full">
              {faqs.map((faq, idx) => (
                <AccordionItem key={idx} value={`faq-${idx}`}>
                  <AccordionTrigger className="text-left font-medium text-white text-base">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        <section className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-[#111113] p-8 sm:p-12 text-center shadow-xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready for Autonomous Collections Without Manual Calling Lists?
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto text-sm sm:text-base mb-8">
            Start recovering overdue receivables today with Jaktra. Set up in 15 minutes with zero long-term commitments.
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
            No credit card required • 15-minute onboarding • AES-256 bank-grade encryption
          </p>
        </section>

        <CompareDisclaimer />
      </main>

      <LandingFooter />
    </div>
  );
}

export default KollenoCompare;

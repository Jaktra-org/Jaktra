import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Zap,
  MessageSquareCode,
  CalendarClock,
  KeyRound,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Layers,
  Scale,
  Compass,
} from "lucide-react";
import jaktraLogo from "../assets/jaktra_svg.svg";
import { SEOHead } from "../components/common/SEOHead";
import { featuresHubSchema, breadcrumbSchema } from "../components/common/seo-schemas";
import { LandingFooter } from "../components/landing/LandingFooter";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

function HeaderNav() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-[#0a0a0b]/90 backdrop-blur-md border-b border-white/[0.08]">
      <div className="w-full h-full px-4 sm:px-8 lg:px-12 xl:px-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 text-decoration-none">
          <img src={jaktraLogo} alt="Jaktra" width={24} height={24} className="h-6 w-6 block" />
          <span className="font-semibold text-white text-lg tracking-tight font-sans">Jaktra</span>
        </Link>
        <div className="flex items-center gap-4 sm:gap-6">
          <Link to="/pricing" className="text-sm text-zinc-400 hover:text-white transition-colors hidden sm:block">
            Pricing
          </Link>
          <Link to="/features" className="text-sm text-white font-medium transition-colors hidden sm:block">
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

interface FeatureItem {
  id: string;
  badge: string;
  category: "ai" | "infra";
  title: string;
  tagline: string;
  description: string;
  link: string;
  icon: typeof Zap;
  techStack: string;
  stats: { label: string; value: string };
  highlights: string[];
  visualType: "cadence" | "dispute" | "portal" | "installment" | "risk" | "circuit";
}

const CORE_FEATURES: FeatureItem[] = [
  {
    id: "5-stage-escalation",
    badge: "Cadence Intelligence",
    category: "ai",
    title: "5-Stage AI Tone Escalation Cadences",
    tagline: "Modulate collection urgency from polite reminders to formal demands without burning client trust.",
    description:
      "Replaces static, repetitive dunning templates with generative LLaMA 3.1 8B intelligence. Cadences smoothly transition through 5 stages: Friendly Reminder (1–7d), Firm Notice (8–14d), Serious Demand (15–21d), Stern Executive Notice (22–30d), and Stage 5 Legal Hold (31+d) with strict human approval gates.",
    link: "/features/5-stage-escalation",
    icon: Zap,
    techStack: "Groq LLaMA 3.1 8B + 20-Hour Idempotency Guard",
    stats: { label: "Cadence Stages", value: "5 Tiers" },
    highlights: [
      "Dynamic prompt interpolation referencing debtor's exact balance and aging",
      "Strict 20-hour idempotency guard eliminates debtor spamming",
      "Automatic Stage 5 Legal Stop halts outreach pending human review",
    ],
    visualType: "cadence",
  },
  {
    id: "dispute-triage",
    badge: "Inbound Reply Parsing",
    category: "ai",
    title: "Automatic Inbound Reply Catch & Dispute Triage",
    tagline: "Intercept debtor replies, classify billing disputes with NLP, and freeze dunning to protect relationships.",
    description:
      "When debtors reply with scope disputes, incorrect invoice amounts, or broken deliverables, Jaktra's NLP classifier detects the sentiment, freezes further automated reminders to prevent harassment, and drafts an intelligent response for finance review.",
    link: "/features/dispute-triage",
    icon: MessageSquareCode,
    techStack: "FastAPI + NLP Sentiment Classifier + Human-in-the-Loop",
    stats: { label: "Dispute Detection", value: "Auto-Pause" },
    highlights: [
      "4-way intent classification: dispute, question, promise, or unclear",
      "Immediate cadence pause halts embarrassing automated follow-ups",
      "Suggested reply drafting saves AR teams 10+ hours per week",
    ],
    visualType: "dispute",
  },
  {
    id: "zero-login-portal",
    badge: "1-Click Frictionless Billing",
    category: "infra",
    title: "1-Click B2B Payment Links & Zero-Login Portal",
    tagline: "Why customer portals fail: 1-click passwordless payment links get invoices settled 2x faster.",
    description:
      "Traditional customer portals experience heavy drop-off because debtors forget credentials. Jaktra generates cryptographic, time-limited token links (/i/:token) that allow debtors to review invoices, download statements, and settle instantly with zero account setup.",
    link: "/features/zero-login-portal",
    icon: KeyRound,
    techStack: "Cryptographic SHA-256 Tokens + Instant Statement Sync",
    stats: { label: "Access Architecture", value: "Tokenized" },
    highlights: [
      "Zero account creation or password friction for debtors",
      "Instant Razorpay checkout (Cards, UPI, NetBanking, Virtual Accounts)",
      "Real-time Statement of Account (SOA) and invoice PDF download",
    ],
    visualType: "portal",
  },
  {
    id: "installment-plans",
    badge: "Structured Receivables Recovery",
    category: "infra",
    title: "Structured B2B Payment Plans & Installment Engine",
    tagline: "What to do when a client can't pay: recover overdue receivables with structured installment milestones.",
    description:
      "Instead of forcing an insolvent debtor into total delinquency or costly litigation, offer customized installment schedules directly through their secure portal. Automates milestone tracking and payment reconciliation.",
    link: "/features/installment-plans",
    icon: CalendarClock,
    techStack: "PostgreSQL State Engine + Dynamic Payment Schedules",
    stats: { label: "Schedule Types", value: "Multi-Tranche" },
    highlights: [
      "Debtor self-selects weekly or monthly installment milestones",
      "Automatic reminder cadence tied to individual installment due dates",
      "Instant status update when payments clear via webhooks",
    ],
    visualType: "installment",
  },
  {
    id: "risk-scoring",
    badge: "Early Default Detection",
    category: "ai",
    title: "Predictive Delinquency Risk Scoring & Prioritization",
    tagline: "Identify at-risk debtors early and prioritize collection follow-ups with multi-vector ML scoring.",
    description:
      "Identifies which debtors are sliding toward default before 60+ days elapse. Combines invoice aging, balance concentration, historical payment velocity, and communication response latency to assign actionable risk tiers (Low, Medium, High, Critical).",
    link: "/features/risk-scoring",
    icon: TrendingUp,
    techStack: "Python ML Scorer + Multi-Variable Delinquency Heuristics",
    stats: { label: "Risk Categorization", value: "4 Tiers" },
    highlights: [
      "Dynamic risk score recalculation upon every payment or communication event",
      "Automated prioritization of high-risk collections in the Agent workspace",
      "Actionable recommendations: prompt installment offer or executive call",
    ],
    visualType: "risk",
  },
  {
    id: "email-deliverability",
    badge: "Sender Reputation Shield",
    category: "infra",
    title: "Billing Email Deliverability & Domain Protection (DLQ)",
    tagline: "Stop invoice emails from landing in spam with automated Dead Letter Queues and 3-drop circuit breakers.",
    description:
      "Never burn your domain sender score. If SendGrid experiences a hard bounce or rate limit, Jaktra's Dead Letter Queue catches the failure, triggers exponential backoff, fails over to backup providers (Resend, custom SMTP), and trips a circuit breaker after 3 consecutive failures.",
    link: "/features/email-deliverability",
    icon: ShieldCheck,
    techStack: "Dead Letter Queue + SendGrid / Resend / AES-256 SMTP",
    stats: { label: "Circuit Breaker", value: "3-Drop Halt" },
    highlights: [
      "Automatic multi-channel failover across SendGrid, Resend, and SMTP",
      "3-drop circuit breaker automatically blocks faulty debtor emails",
      "AES-256-GCM encryption for all tenant email credentials",
    ],
    visualType: "circuit",
  },
];

const FAQS = [
  {
    q: "How does Jaktra's generative AI prevent embarrassing communication mistakes?",
    a: "Jaktra does not let raw LLM outputs run unchecked. Every generated communication is strictly bounded by deterministic parameters: exact invoice numbers, verified ledger balances, and strict tone constraints mapped to the account's aging stage. Furthermore, Jaktra enforces a 20-hour rolling idempotency barrier and halts entirely at Stage 5 (31+ days overdue) for human review before any legal escalation.",
  },
  {
    q: "Does Jaktra replace our existing accounting software (QuickBooks, Xero, NetSuite)?",
    a: "No. Jaktra is designed as an autonomous execution layer that sits on top of your existing accounting system. It syncs open receivables via CSV or REST API, autonomously executes collection cadences, triages inbound debtor inquiries, and settles payments via Razorpay webhook reconciliation.",
  },
  {
    q: "What happens when a debtor replies saying they never received the goods or services?",
    a: "Jaktra's NLP DisputeAgent parses incoming email sentiment. When it detects keywords related to delivery claims, missing goods, or billing discrepancies, it instantly classifies the ticket as 'dispute', halts all automated dunning sequences, and drafts an internal resolution briefing with the debtor's statements for your operations team.",
  },
  {
    q: "How does the 20-hour idempotency barrier work across automated batch runs?",
    a: "In fast-moving B2B operations, finance teams frequently re-run collections or sync updated ledgers. Jaktra's idempotency engine tracks the exact timestamp of every debtor contact attempt in PostgreSQL. If a debtor has been contacted within the last 20 hours, Jaktra suppresses new automated dispatches, protecting your domain sender reputation and client goodwill.",
  },
  {
    q: "Can debtors set up installment plans without speaking to a collections agent?",
    a: "Yes. In the tokenized debtor portal (/i/:token), debtors can self-select structured 2x, 3x, or 4x milestone installment plans. Once agreed, the invoice state updates to ActiveInstallmentContext, and automated cadences transition to tracking upcoming milestone dates rather than overdue demands.",
  },
];

export function FeaturesHub() {
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const filteredFeatures =
    activeFilter === "all"
      ? CORE_FEATURES
      : CORE_FEATURES.filter((f) => f.category === activeFilter);

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#f5f5f5] font-sans selection:bg-[#b7d2f8]/20 selection:text-white antialiased">
      <SEOHead
        title="Autonomous AI Accounts Receivable Capabilities & Features | Jaktra"
        description="Explore Jaktra's complete AR execution stack: 5-stage generative tone escalation, automated dispute reply triage, tokenized zero-login debtor portals, Dead Letter Queue resilience, and predictive ML risk scoring."
        canonicalPath="/features"
        jsonLd={[
          featuresHubSchema,
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Features", path: "/features" },
          ]),
        ]}
      />

      <HeaderNav />

      <main className="pt-24 pb-20 w-full px-4 sm:px-8 lg:px-12 xl:px-16 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(183,210,248,0.06),transparent)] pointer-events-none" />
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 text-xs text-zinc-500 font-mono relative z-10">
          <ol className="flex items-center gap-2">
            <li>
              <Link to="/" className="hover:text-zinc-300 transition-colors">
                Home
              </Link>
            </li>
            <li>/</li>
            <li className="text-zinc-300 font-medium" aria-current="page">
              Platform Architecture & Capabilities
            </li>
          </ol>
        </nav>

        {/* Hero Section: Expansive Platform Command Masthead with Spacious Flow */}
        <header className="mb-20 sm:mb-24 pt-8 max-w-7xl mx-auto">
          <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-4">
            Autonomous AR Execution Architecture
          </span>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
            <div className="lg:w-8/12 space-y-4">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
                The Autonomous AI Accounts Receivable Execution Stack
              </h1>
              <p className="text-base sm:text-lg text-zinc-300 leading-relaxed max-w-2xl pt-1">
                Replace manual dunning, missed debtor replies, and awkward collection calls with a closed-loop, intelligent AR system. Engineered from the ground up for modern B2B finance teams.
              </p>
            </div>

            <div className="lg:w-4/12 flex flex-col sm:flex-row lg:flex-col gap-3.5 lg:items-end">
              <div className="flex items-center gap-3">
                <Link
                  to="/register"
                  className="px-6 py-3.5 rounded-lg bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-200 transition-colors shadow-sm flex items-center gap-2"
                >
                  Start Free Trial <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/resources/ar-automation-roi-calculator"
                  className="px-5 py-3.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white font-medium text-sm hover:bg-white/[0.08] transition-colors"
                >
                  Model DSO ROI
                </Link>
              </div>
              <div className="flex items-center gap-1.5 pt-1">
                {[
                  { id: "all", label: "All 6 Capabilities" },
                  { id: "ai", label: "Language Intelligence" },
                  { id: "infra", label: "Payment Infrastructure" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setActiveFilter(f.id)}
                    className={`px-3 py-1.5 rounded-md text-xs font-mono transition-colors ${
                      activeFilter === f.id
                        ? "bg-white text-zinc-950 font-bold shadow-sm"
                        : "bg-white/[0.03] text-zinc-400 hover:text-white border border-white/[0.06]"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* Unified Monochrome System Telemetry Ribbon (Spacious, Zero Rainbow Colors) */}
        <section className="border-y border-white/[0.08] py-10 my-16 sm:my-20 grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.08] max-w-7xl mx-auto">
          <div className="px-4 sm:px-8 py-6 sm:py-2 space-y-1.5">
            <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              Cognitive Engine
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white font-mono">
              Groq LLaMA 3.1
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Sub-second tone modulation across 5 escalating psychological stages.
            </p>
          </div>

          <div className="px-4 sm:px-8 py-6 sm:py-2 space-y-1.5">
            <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              Contact Safety
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white font-mono">
              20h Idempotency
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Deterministic contact barriers eliminate debtor spamming.
            </p>
          </div>

          <div className="px-4 sm:px-8 py-6 sm:py-2 space-y-1.5">
            <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              Settlement UX
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white font-mono">
              Zero-Login Portal
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Cryptographic /i/:token links eliminate password friction for debtors.
            </p>
          </div>

          <div className="px-4 sm:px-8 py-6 sm:py-2 space-y-1.5">
            <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              Failover DLQ
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white font-mono">
              3-Drop Breaker
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Protects domain sender reputation with automated multi-channel failover.
            </p>
          </div>
        </section>

        {/* 6 Capabilities Roster: Full-Width Spacious Architectural Rows */}
        <section className="border-b border-white/[0.08] pb-24 mb-24 max-w-7xl mx-auto">
          <div className="mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
              Autonomous Capabilities Breakdown
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 max-w-2xl">
              Each capability functions autonomously or integrates into your existing accounts receivable workflow.
            </p>
          </div>

          <div className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
            {filteredFeatures.map((feat) => {
              const Icon = feat.icon;
              return (
                <div key={feat.id} className="py-12 lg:py-16 hover:bg-white/[0.015] transition-colors">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
                    {/* Col 1: Identity & Stat Badge (4 cols) */}
                    <div className="lg:col-span-4 space-y-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono uppercase tracking-wider font-semibold text-zinc-400">
                          {feat.badge}
                        </span>
                        <span className="text-xs font-mono text-zinc-500">·</span>
                        <span className="text-xs font-mono text-zinc-400">{feat.stats.label}: <strong className="text-white font-medium">{feat.stats.value}</strong></span>
                      </div>

                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8] shrink-0">
                          <Icon className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                          {feat.title}
                        </h3>
                      </div>

                      <p className="text-xs sm:text-sm text-zinc-400 font-mono">
                        Stack: {feat.techStack}
                      </p>

                      <div className="pt-2">
                        <Link
                          to={feat.link}
                          className="inline-flex items-center gap-2 text-xs font-semibold text-[#b7d2f8] hover:text-white transition-colors"
                        >
                          <span>Deep-dive architecture spec</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>

                    {/* Col 2: Operational Description & Highlights (4 cols, vertical border) */}
                    <div className="lg:col-span-4 lg:border-x lg:border-white/[0.08] lg:px-10 space-y-4">
                      <div className="text-xs font-mono uppercase text-zinc-400 font-semibold tracking-wider">
                        Operational Execution:
                      </div>
                      <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                        {feat.description}
                      </p>
                      <ul className="space-y-2.5 pt-2">
                        {feat.highlights.map((h, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#b7d2f8] shrink-0 mt-0.5" />
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Col 3: Visual Interactive Representation (4 cols, pl-4) */}
                    <div className="lg:col-span-4 lg:pl-6 space-y-3">
                      <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold flex items-center justify-between">
                        <span>Live State Visual</span>
                        <span className="text-zinc-500 font-normal">Active Protocol</span>
                      </div>

                      {feat.visualType === "cadence" && (
                        <div className="border border-white/[0.08] rounded-2xl bg-white/[0.015] p-5 space-y-3">
                          <div className="text-xs font-mono text-zinc-300 font-semibold">
                            Autonomous Cadence Waveform
                          </div>
                          <div className="space-y-1.5 font-mono text-[11px]">
                            <div className="flex justify-between text-zinc-300">
                              <span>Stage 1 (1–7d)</span>
                              <span className="text-zinc-400">Courtesy Check-in</span>
                            </div>
                            <div className="flex justify-between text-zinc-300">
                              <span>Stage 2 (8–14d)</span>
                              <span className="text-zinc-400">Friendly Remittance</span>
                            </div>
                            <div className="flex justify-between text-zinc-300">
                              <span>Stage 3 (15–21d)</span>
                              <span className="text-zinc-400">Firm Commercial Escalation</span>
                            </div>
                            <div className="flex justify-between text-zinc-300">
                              <span>Stage 4 (22–30d)</span>
                              <span className="text-zinc-400">Executive CFO Notice</span>
                            </div>
                            <div className="flex justify-between text-[#b7d2f8] font-bold">
                              <span>Stage 5 (31+d)</span>
                              <span>Legal Stop / Human Gate</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {feat.visualType === "dispute" && (
                        <div className="border border-white/[0.08] rounded-2xl bg-white/[0.015] p-5 space-y-2.5 font-mono text-xs">
                          <div className="text-zinc-300 font-semibold">NLP Sentiment Classifier</div>
                          <div className="p-3 rounded-lg bg-black/40 border border-white/[0.06] text-[11px] text-zinc-300">
                            "The deliverable was missing milestone B files..."
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-[#b7d2f8]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#b7d2f8]" />
                            <span>Intent: Scope Dispute → Cadence Auto-Frozen</span>
                          </div>
                        </div>
                      )}

                      {feat.visualType === "portal" && (
                        <div className="border border-white/[0.08] rounded-2xl bg-white/[0.015] p-5 space-y-2.5 font-mono text-xs">
                          <div className="text-zinc-300 font-semibold">Cryptographic Link /i/:token</div>
                          <div className="text-[11px] text-zinc-400">
                            Token: <span className="text-zinc-300 font-mono">sha256_8f9c2d1b...</span>
                          </div>
                          <div className="pt-2.5 flex items-center justify-between text-[11px] border-t border-white/[0.06]">
                            <span className="text-zinc-400">Instant Razorpay Checkout</span>
                            <span className="text-white font-bold">Pay $14,200</span>
                          </div>
                        </div>
                      )}

                      {feat.visualType === "installment" && (
                        <div className="border border-white/[0.08] rounded-2xl bg-white/[0.015] p-5 space-y-2.5 font-mono text-xs">
                          <div className="text-zinc-300 font-semibold">Active Milestone Schedule</div>
                          <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                            <div className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white">
                              <div className="text-zinc-400">Paid</div>
                              <div className="font-bold font-mono mt-0.5">$5,000</div>
                            </div>
                            <div className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[#b7d2f8]">
                              <div>Due May 15</div>
                              <div className="font-bold font-mono mt-0.5">$5,000</div>
                            </div>
                            <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.06] text-zinc-400">
                              <div>Due Jun 15</div>
                              <div className="font-bold font-mono mt-0.5">$5,000</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {feat.visualType === "risk" && (
                        <div className="border border-white/[0.08] rounded-2xl bg-white/[0.015] p-5 space-y-2.5 font-mono text-xs">
                          <div className="text-zinc-300 font-semibold">Ledger Delinquency Radar</div>
                          <div className="flex justify-between text-[11px]">
                            <span className="text-zinc-400">Acme Logistics</span>
                            <span className="text-white font-bold">Critical Risk (92/100)</span>
                          </div>
                          <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                            <div className="w-[92%] h-full bg-[#b7d2f8]" />
                          </div>
                          <p className="text-[10px] text-zinc-500">Predicted default in 24 days based on payment history.</p>
                        </div>
                      )}

                      {feat.visualType === "circuit" && (
                        <div className="border border-white/[0.08] rounded-2xl bg-white/[0.015] p-5 space-y-2.5 font-mono text-xs">
                          <div className="text-zinc-300 font-semibold">Failover Channel Matrix</div>
                          <div className="space-y-1.5 text-[11px]">
                            <div className="flex justify-between text-white font-medium">
                              <span>SendGrid API</span>
                              <span>Active (Primary)</span>
                            </div>
                            <div className="flex justify-between text-zinc-400">
                              <span>Resend Backup</span>
                              <span>Standby</span>
                            </div>
                            <div className="flex justify-between text-zinc-500">
                              <span>Custom SMTP</span>
                              <span>Encrypted (AES-256)</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Closed-Loop System Architecture Section (Full-Width Open Pipeline) */}
        <section className="border-b border-white/[0.08] pb-24 mb-24 max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-2">
              Closed-Loop Execution Pipeline
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
              How Jaktra's Autonomous AR Loop Works
            </h2>
            <p className="mt-2 text-sm sm:text-base text-zinc-400 max-w-xl mx-auto">
              Predictive risk scoring, generative dunning, dispute triage, and debtor settlement operate in one unified loop.
            </p>
          </div>

          <div className="border-y border-white/[0.08] divide-y sm:divide-y-0 sm:divide-x divide-white/[0.08] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: "01",
                title: "Ledger Ingestion & ML Risk",
                detail: "Invoices sync via REST API or CSV. Python ML assigns risk tiers (Low, Medium, High, Critical) based on debtor payment velocity.",
              },
              {
                step: "02",
                title: "5-Stage Contextual Escalation",
                detail: "Generative Groq LLaMA 3.1 adapts tone from gentle reminders to executive notices while enforcing 20-hour anti-spam barriers.",
              },
              {
                step: "03",
                title: "Tokenized Settlement & Plans",
                detail: "Cryptographic /i/:token links let debtors inspect live statements and pay via Razorpay or commit to milestone installment schedules.",
              },
              {
                step: "04",
                title: "NLP Dispute Triage & Sync",
                detail: "Replies stating billing disputes freeze active cadences immediately. Real-time webhooks update your accounting ledger automatically.",
              },
            ].map((st) => (
              <div key={st.step} className="p-6 sm:p-8 space-y-3">
                <div className="text-xs font-mono text-zinc-500 font-bold">STAGE {st.step}</div>
                <h4 className="text-lg font-bold text-white">{st.title}</h4>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">{st.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Architecture FAQs (2-Column Open Split) */}
        <section className="border-b border-white/[0.08] pb-16 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-4 space-y-4">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block">
                Architecture FAQs
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                Frequently Asked Technical Questions
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Technical and operational details on how Jaktra automates B2B collections safely and securely.
              </p>
            </div>

            <div className="lg:col-span-8 lg:border-l lg:border-white/[0.08] lg:pl-10">
              <Accordion type="single" variant="outline" defaultValue="faq-0" collapsible className="w-full">
                {FAQS.map((faq, idx) => (
                  <AccordionItem key={idx} value={`faq-${idx}`} className="border-b border-white/[0.08] py-2">
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

        {/* Cross-Link Directories & Horizon CTA */}
        <section className="py-12 border-t border-white/[0.08]">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Explore More Solutions & Research
            </h2>
            <p className="mt-2 text-zinc-400 text-sm max-w-xl mx-auto">
              Compare Jaktra against alternative AR platforms or explore industry use cases.
            </p>
          </div>

          <div className="border-y border-white/[0.08] divide-y sm:divide-y-0 sm:divide-x divide-white/[0.08] grid grid-cols-1 sm:grid-cols-3 mb-16">
            <Link
              to="/compare"
              className="py-8 sm:pr-8 space-y-3 group hover:bg-white/[0.015] transition-colors"
            >
              <div className="text-xs font-mono uppercase text-[#b7d2f8] font-semibold flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5" />
                <span>Buyer's Matrix</span>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-[#b7d2f8] transition-colors">
                Compare Software →
              </h3>
              <p className="text-sm text-zinc-300 leading-relaxed">
                Compare Jaktra vs HighRadius, Upflow, Chaser, PaidNice, and Kolleno.
              </p>
            </Link>

            <Link
              to="/use-cases"
              className="py-8 sm:px-8 space-y-3 group hover:bg-white/[0.015] transition-colors"
            >
              <div className="text-xs font-mono uppercase text-[#b7d2f8] font-semibold flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                <span>Industry Playbooks</span>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-[#b7d2f8] transition-colors">
                Industry Solutions →
              </h3>
              <p className="text-sm text-zinc-300 leading-relaxed">
                Sector-specific collections playbooks for B2B SaaS, manufacturing, and staffing.
              </p>
            </Link>

            <Link
              to="/resources"
              className="py-8 sm:pl-8 space-y-3 group hover:bg-white/[0.015] transition-colors"
            >
              <div className="text-xs font-mono uppercase text-[#b7d2f8] font-semibold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>Knowledge Hub</span>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-[#b7d2f8] transition-colors">
                Research & Tools →
              </h3>
              <p className="text-sm text-zinc-300 leading-relaxed">
                Countback DSO mathematical guides, working capital calculators, and scripts.
              </p>
            </Link>
          </div>

          <div className="text-center space-y-6 pt-6">
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Ready to Modernize Your Accounts Receivable Stack?
            </h3>
            <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Connect QuickBooks, Xero, or Stripe in under 15 minutes. 100% free during Early Access.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
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
                View Industry Solutions
              </Link>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}

export default FeaturesHub;

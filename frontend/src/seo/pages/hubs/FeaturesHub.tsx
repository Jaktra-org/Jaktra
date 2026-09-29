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
  PauseCircle,
  Sparkles,
} from "lucide-react";
import { SEOHead } from "@/seo/components/SEOHead";
import { featuresHubSchema, breadcrumbSchema } from "@/seo/schemas";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { GlobalNav } from "@/components/common/GlobalNav";

interface FeatureExplorerItem {
  id: string;
  tabLabel: string;
  title: string;
  category: string;
  categoryBadgeStyle: string;
  link: string;
  summary: string;
  realWorldTrigger: string;
  whatJaktraDoes: string;
  howAiAdapts: string;
  safeguardNote: string;
}

const EXPLORER_FEATURES: FeatureExplorerItem[] = [
  {
    id: "5-stage-escalation",
    tabLabel: "5-Stage Tone Escalation",
    title: "5-Stage Adaptive Follow-Up Cadences",
    category: "Autonomous Outreach",
    categoryBadgeStyle: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    link: "/features/5-stage-escalation",
    summary:
      "Gradually escalates collection urgency from courteous check-ins to firm administrative notices without damaging client relationships.",
    realWorldTrigger:
      "Invoice passes due date (Days Overdue 1–30+). System evaluates days past due and maps directly to the calibrated tone tier.",
    whatJaktraDoes:
      "Replaces static robotic templates with context-aware communications. Cadences smoothly transition across 5 stages (Warm, Firm, Serious, Stern, Legal Stop), referencing exact invoice numbers, balances, and agreed credit terms.",
    howAiAdapts:
      "The Groq LLaMA 3.1 agent synthesizes unique, relationship-safe messages that feel human. At Stage 5 (31+ days), all automated outreach halts for required human manager approval before legal escalation.",
    safeguardNote:
      "Enforces a strict 20-hour cooldown spacing between touches. Zero repetitive spamming or double-messaging.",
  },
  {
    id: "dispute-triage",
    tabLabel: "Inbound Dispute Triage",
    title: "Inbound Reply Catch & Dispute Triage",
    category: "Intent Intelligence",
    categoryBadgeStyle: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    link: "/features/dispute-triage",
    summary:
      "Intercepts customer replies, classifies intent via AI, pauses automated follow-ups instantly, and routes threads into your review dashboard.",
    realWorldTrigger:
      "Debtor clicks 'Reply' in Gmail or Outlook to dispute an amount, request a W-9, or promise a future pay date.",
    whatJaktraDoes:
      "Outbound reminders embed tamper-proof cryptographic reply tokens (r_token@reply.domain). Inbound emails match to invoices instantly, pausing reminders in less than 1 second to eliminate tone-deaf chasing.",
    howAiAdapts:
      "AI classifies sentiment into 4 categories (Dispute, Payment Promise, Document Request, Unclear) and prepares a suggested resolution draft in your Inbound AR Dashboard (/disputes). Your team approves with one click.",
    safeguardNote:
      "Automated follow-ups stay frozen until your finance team explicitly marks the inquiry resolved.",
  },
  {
    id: "zero-login-portal",
    tabLabel: "1-Click Client Portal",
    title: "1-Click Zero-Login Payment Portal",
    category: "Frictionless Settlement",
    categoryBadgeStyle: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    link: "/features/zero-login-portal",
    summary:
      "Eliminates 70%+ debtor login drop-off with secure, passwordless payment links where accounts payable teams settle in 30 seconds.",
    realWorldTrigger:
      "Debtor receives collection reminder containing a cryptographically signed portal token link (/i/:token).",
    whatJaktraDoes:
      "Debtors view itemized invoices, download formal Statements of Account (SOA), and settle via UPI, NetBanking, NEFT/RTGS, or Corporate Cards without account registration or password hurdles.",
    howAiAdapts:
      "Every debtor portal interaction (viewed statement, downloaded PDF, opened payment modal) emits real-time telemetry, updating account health scores and collection priority immediately.",
    safeguardNote:
      "Tokens expire securely and support rate-limiting to prevent unauthorized balance scraping.",
  },
  {
    id: "installment-plans",
    tabLabel: "Installment Milestone Recovery",
    title: "B2B Payment Plans & Installment Recovery",
    category: "Cash Flow Flexibility",
    categoryBadgeStyle: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    link: "/features/installment-plans",
    summary:
      "Recovers overdue balances smoothly by allowing cash-strapped debtors to self-select structured milestone installment plans.",
    realWorldTrigger:
      "Debtor encounters temporary liquidity constraints and requests to split overdue balance into 2x, 3x, or 4x tranches.",
    whatJaktraDoes:
      "Full lump-sum demands halt immediately upon manager approval (/payment-plans/pending). Jaktra generates penny-perfect milestone schedules and sets hasActivePaymentPlan: true.",
    howAiAdapts:
      "Agent context switches into ActiveInstallmentContext. Reminders modulate to reference only the upcoming milestone tranche amount and due date, maintaining positive vendor goodwill.",
    safeguardNote:
      "Real-time Razorpay/Stripe webhooks reconcile each milestone as paid and automatically queue the next installment.",
  },
  {
    id: "risk-scoring",
    tabLabel: "Predictive Risk Scoring",
    title: "Predictive AR Risk Scoring & Priority Engine",
    category: "Early Default Detection",
    categoryBadgeStyle: "text-orange-400 bg-orange-500/10 border-orange-500/20",
    link: "/features/risk-scoring",
    summary:
      "Scores open receivables across 4 telemetry vectors to prioritize collection efforts and flag delinquent accounts before bad debt occurs.",
    realWorldTrigger:
      "Invoices age in your receivables ledger. Jaktra continuously ingests balance exposure, response velocity, and historical payment data.",
    whatJaktraDoes:
      "Calculates an objective 0–100 risk score weighting aging velocity (35%), balance exposure (25%), debtor responsiveness (20%), and client history (20%), categorizing invoices into 4 actionable priority tiers.",
    howAiAdapts:
      "Elevates high-exposure, at-risk accounts on the credit controller dashboard while softening tone for long-standing clients with temporary administrative delays.",
    safeguardNote:
      "Dead-Letter Queue (DLQ) safeguards prevent automated outreach on disputed or legally escalated receivables.",
  },
  {
    id: "email-deliverability",
    tabLabel: "Email Deliverability & DLQ",
    title: "B2B Invoice Email Deliverability & DLQ",
    category: "Domain & Reputation Shield",
    categoryBadgeStyle: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    link: "/features/email-deliverability",
    summary:
      "Guarantees 99.4% inbox placement with authenticated DNS sending, automated Dead Letter Queues, and a 3-drop circuit breaker.",
    realWorldTrigger:
      "Reminder encounters invalid email addresses, recipient rate limits (429/451), or enterprise firewall greylisting.",
    whatJaktraDoes:
      "Dispatches through authenticated tenant domains via custom SMTP (TLS 1.3), SendGrid, or Resend. Applies exponential backoff for transient glitches and quarantines persistent bounces in the Dead Letter Queue (/dlq).",
    howAiAdapts:
      "When a contact fails 3 consecutive times, a circuit breaker trips to freeze robotic outreach, protecting corporate SPF/DKIM standing and requesting an updated billing contact.",
    safeguardNote:
      "Tenant credentials stored in AES-256-GCM encrypted vault with complete multi-tenant cryptographic isolation.",
  },
];

interface CoreFeatureCard {
  id: string;
  badge: string;
  title: string;
  description: string;
  link: string;
  icon: typeof Zap;
  highlights: string[];
}

const CORE_FEATURE_CARDS: CoreFeatureCard[] = [
  {
    id: "5-stage-escalation",
    badge: "Outreach Engine",
    title: "5-Stage Adaptive Follow-Up Cadences",
    description:
      "Calibrate tone smoothly from courtesy check-ins (1–7d) to firm administrative notices (22–30d). Stage 5 pauses automatically for human manager review.",
    link: "/features/5-stage-escalation",
    icon: Zap,
    highlights: [
      "Groq LLaMA 3.1 unique tone synthesis referencing exact invoices",
      "Automatic 20-hour rolling idempotency cooldown spacing",
      "Human manager approval gatekeeper before legal escalation",
    ],
  },
  {
    id: "dispute-triage",
    badge: "Inbound AI",
    title: "Inbound Reply Catch & Dispute Triage",
    description:
      "Catches customer email replies in under 1 second, freezes automated reminders immediately, and drafts ready-to-send resolution replies in your dashboard.",
    link: "/features/dispute-triage",
    icon: MessageSquareCode,
    highlights: [
      "Cryptographic reply tokens map emails to invoices without manual matching",
      "AI categorizes sentiment: Disputes, Promises, Document Queries, Unclear",
      "Follow-ups stay paused until your finance team marks the issue resolved",
    ],
  },
  {
    id: "zero-login-portal",
    badge: "Debtor Portal",
    title: "1-Click Client Payment Portal (/i/:token)",
    description:
      "Eliminate password friction. Debtors click secure, cryptographically hashed links to review invoices, download statements, and settle in 30 seconds.",
    link: "/features/zero-login-portal",
    icon: KeyRound,
    highlights: [
      "Zero registration or password hurdles for customer AP accounting teams",
      "Direct settlement options via UPI, NetBanking, Cards, and Virtual Bank",
      "Instant Statement of Account (SOA) and invoice PDF generation",
    ],
  },
  {
    id: "installment-plans",
    badge: "Recovery Rail",
    title: "B2B Payment Plans & Milestone Engine",
    description:
      "Turn delinquent accounts into steady cash flow. Debtors self-select 2x, 3x, or 4x milestone splits, halting full-balance demands instantly.",
    link: "/features/installment-plans",
    icon: CalendarClock,
    highlights: [
      "Debtors self-select pre-approved 2x–4x splits inside debtor portal",
      "AI agent switches context to track only the active milestone due date",
      "Sub-second Razorpay/Stripe webhook ledger sync upon tranche payment",
    ],
  },
  {
    id: "risk-scoring",
    badge: "Predictive Analytics",
    title: "Predictive AR Risk Scoring & Priority Engine",
    description:
      "Stop chasing all invoices equally. Jaktra scores open receivables across aging velocity, balance exposure, response speed, and historical reliability.",
    link: "/features/risk-scoring",
    icon: TrendingUp,
    highlights: [
      "4-factor telemetry model: Aging (35%), Amount (25%), Response (20%), History (20%)",
      "Maps risk scores directly to calibrated tone velocity tiers",
      "Surfaces high-exposure accounts before delinquency turns into bad debt",
    ],
  },
  {
    id: "email-deliverability",
    badge: "Deliverability Shield",
    title: "B2B Invoice Email Deliverability & DLQ",
    description:
      "Protect your corporate domain sender reputation with authenticated sending, automated Dead Letter Queues, and a 3-drop circuit breaker.",
    link: "/features/email-deliverability",
    icon: ShieldCheck,
    highlights: [
      "Multi-provider sending via Custom SMTP (TLS 1.3), SendGrid, or Resend",
      "3-Drop Circuit Breaker halts outreach when contacts bounce consecutively",
      "20-Hour rolling idempotency gatekeeper prevents spam button clicks",
    ],
  },
];

const FAQS = [
  {
    q: "How does Jaktra ensure communications stay professional and accurate?",
    a: "Jaktra operates under strict safeguards. Every communication references verified invoice numbers, exact balances, and agreed payment terms. Reminders follow calibrated stages, enforce polite 20-hour spacing between messages, and require manual human approval at Stage 5 before any formal legal escalation.",
  },
  {
    q: "Does Jaktra replace our existing accounting software (QuickBooks, Xero, NetSuite)?",
    a: "No. Jaktra works directly alongside your existing accounting software. It connects to your current ledger, reads open invoices, sends follow-ups autonomously, and automatically records payments as soon as webhooks clear.",
  },
  {
    q: "What happens when a client replies with a billing question or dispute?",
    a: "Jaktra instantly intercepts customer replies via cryptographic reply tokens. If a client mentions an incorrect amount, missing item, or service question, all automated reminders freeze immediately so your team can resolve the issue without awkward follow-ups.",
  },
  {
    q: "How does Jaktra prevent clients from receiving too many emails?",
    a: "Jaktra enforces an intelligent 20-hour rolling idempotency guard. It never contacts an account more than once within a 20-hour window, ensuring your clients are never overwhelmed, even when multiple batch syncs run.",
  },
  {
    q: "Can clients set up installment plans on their own?",
    a: "Yes. In their secure payment link (/i/:token), clients who need flexibility can select structured 2x, 3x, or 4x installment milestones. Once approved by your finance manager, Jaktra transitions reminders to track the agreed tranche dates rather than overdue lump sums.",
  },
];

export function FeaturesHub() {
  const [selectedFeatureIndex, setSelectedFeatureIndex] = useState(0);
  const activeFeature = EXPLORER_FEATURES[selectedFeatureIndex];

  return (
    <div className="min-h-screen bg-[#010102] text-[#f7f8f8] font-sans antialiased selection:bg-[#5e6ad2]/30 selection:text-white">
      <SEOHead
        title="Autonomous AI Accounts Receivable Platform | Jaktra"
        description="Explore Jaktra's AR features: 5-stage adaptive tone escalation, dispute triage, 1-click passwordless payment links, and cash flow risk scoring."
        canonicalPath="/features"
        jsonLd={[
          featuresHubSchema,
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Features", path: "/features" },
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
            <li className="text-zinc-200 font-medium" aria-current="page">
              Features &amp; Capabilities
            </li>
          </ol>
        </nav>

        {/* CLEAN HERO HEADER */}
        <header className="mb-10 relative z-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] xl:text-[44px] font-extrabold tracking-tight text-white mb-3.5 leading-tight lg:leading-none whitespace-normal md:whitespace-nowrap">
            Autonomous AI Accounts Receivable Platform
          </h1>

          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-3xl">
            Replace manual dunning, missed debtor replies, and awkward collection calls with an intelligent, closed-loop AR platform. Grounded in real-time ERP sync, adaptive tone escalation, automated dispute triage, and 1-click settlement rails.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-4">
            <Link
              to="/register"
              className="px-5 py-2.5 rounded-xl bg-white text-zinc-950 font-semibold text-xs sm:text-sm hover:bg-zinc-200 transition-colors shadow-sm inline-flex items-center gap-2"
            >
              <span>Start free trial</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/resources/ar-automation-roi-calculator"
              className="px-4 py-2.5 rounded-xl bg-white/[0.04] text-zinc-300 hover:text-white hover:bg-white/[0.08] border border-white/[0.08] text-xs sm:text-sm font-medium transition-colors"
            >
              Calculate ROI
            </Link>
          </div>
        </header>

        {/* INTERACTIVE CAPABILITIES SHOWCASE */}
        <section className="mb-16 relative z-10">
          {/* Clean Capability Tabs */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {EXPLORER_FEATURES.map((feat, idx) => {
              const isSelected = selectedFeatureIndex === idx;
              return (
                <button
                  key={feat.id}
                  type="button"
                  onClick={() => setSelectedFeatureIndex(idx)}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    isSelected
                      ? "bg-white text-zinc-950 font-semibold shadow-sm"
                      : "bg-white/[0.03] text-zinc-400 hover:text-white hover:bg-white/[0.06] border border-white/[0.06]"
                  }`}
                >
                  {feat.tabLabel}
                </button>
              );
            })}
          </div>

          {/* Single Focused Card */}
          <div className="rounded-2xl bg-[#0c0d10] border border-white/[0.08] p-6 sm:p-8 space-y-6 shadow-2xl">
            {/* Header: Title & Meta */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-white/[0.06]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base font-bold text-white">{activeFeature.title}</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold border ${activeFeature.categoryBadgeStyle}`}>
                    {activeFeature.category}
                  </span>
                </div>
                <div className="text-xs text-zinc-400">
                  {activeFeature.summary}
                </div>
              </div>

              <Link
                to={activeFeature.link}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] text-xs font-medium text-white hover:bg-white/[0.08] border border-white/[0.08] transition-colors"
              >
                <span>Read in-depth guide</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#b7d2f8]" />
              </Link>
            </div>

            {/* 1. Real-World Trigger */}
            <div className="space-y-2">
              <div className="text-xs text-zinc-400 font-medium">Operational Trigger</div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs sm:text-sm text-zinc-200 leading-relaxed italic">
                &ldquo;{activeFeature.realWorldTrigger}&rdquo;
              </div>
            </div>

            {/* 2. Feature Explanation: What Jaktra Does & How AI Adapts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <PauseCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>What Jaktra Does Autonomously</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {activeFeature.whatJaktraDoes}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <Sparkles className="w-4 h-4 text-[#b7d2f8] shrink-0" />
                  <span>AI Intelligence &amp; Team Controls</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {activeFeature.howAiAdapts}
                </p>
              </div>
            </div>

            {/* Safeguard Bar */}
            <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
              <div className="flex items-center gap-2 text-zinc-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{activeFeature.safeguardNote}</span>
              </div>
              <span className="text-[11px] text-zinc-500 font-mono shrink-0">
                Enterprise safeguards active
              </span>
            </div>
          </div>
        </section>

        {/* 6 CORE ARCHITECTURAL PILLARS GRID */}
        <section className="mb-16 border-t border-white/[0.08] pt-12">
          <div className="max-w-2xl mb-8">
            <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold block mb-1">
              Core Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              6 Built-In Pillars of Autonomous Accounts Receivable
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CORE_FEATURE_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.id}
                  className="p-6 rounded-2xl bg-[#0c0d10] border border-white/[0.08] hover:border-white/[0.18] transition-all flex flex-col justify-between space-y-4 shadow-lg group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8]">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-mono text-zinc-400 px-2 py-0.5 rounded bg-white/[0.03] border border-white/[0.06]">
                        {card.badge}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-[#b7d2f8] transition-colors">
                      {card.title}
                    </h3>

                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {card.description}
                    </p>

                    <ul className="space-y-1.5 pt-2 border-t border-white/[0.05]">
                      {card.highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#b7d2f8] shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2">
                    <Link
                      to={card.link}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#b7d2f8] hover:text-white transition-colors"
                    >
                      <span>Explore feature guide</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 4-PHASE CLOSED-LOOP WORKFLOW */}
        <section className="mb-16">
          <div className="max-w-2xl mb-8">
            <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold block mb-1">
              End-to-End Execution
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              The Closed-Loop Accounts Receivable Lifecycle
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#0c0d10] border border-white/[0.08] space-y-3 relative">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Phase 1
              </span>
              <h3 className="text-sm font-semibold text-white">Invoice Sync &amp; Telemetry</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Connect your accounting ledger (QuickBooks, Xero, Stripe) or upload a CSV. Jaktra tracks aging and computes real-time default risk.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0c0d10] border border-white/[0.08] space-y-3 relative">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Phase 2
              </span>
              <h3 className="text-sm font-semibold text-white">Calibrated AI Outreach</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Autonomous agent crafts unique, respectful follow-ups that escalate through 5 stages with 20-hour anti-spam spacing.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0c0d10] border border-white/[0.08] space-y-3 relative">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                Phase 3
              </span>
              <h3 className="text-sm font-semibold text-white">1-Click Client Settlement</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Clients receive passwordless portal links (/i/:token) to view statements, pay in 30 seconds, or activate milestone installment plans.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0c0d10] border border-white/[0.08] space-y-3 relative">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Phase 4
              </span>
              <h3 className="text-sm font-semibold text-white">Triage &amp; Webhook Sync</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Inbound replies pause reminders automatically. When payments clear via webhooks, invoices mark Paid in full with zero manual data entry.
              </p>
            </div>
          </div>
        </section>

        {/* COMPARISON TABLE: JAKTRA VS TRADITIONAL AR TOOLS */}
        <section className="mb-16 rounded-2xl bg-[#0c0d10] border border-white/[0.08] p-5 sm:p-7 shadow-xl">
          <div className="mb-5">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-1">
              Operational Comparison
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Autonomous AR Platform vs. Legacy Dunning Robots
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[620px]">
              <thead>
                <tr className="border-b border-white/[0.08] text-[11px] font-mono uppercase text-zinc-400">
                  <th className="py-3 px-4">AR Capability</th>
                  <th className="py-3 px-4 text-zinc-400">Legacy Dunning Robots</th>
                  <th className="py-3 px-4 text-[#b7d2f8] font-bold">Jaktra Autonomous AR Platform</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Outreach Personalization</td>
                  <td className="py-3 px-4 text-zinc-400">Fires identical, static email templates that land in spam</td>
                  <td className="py-3 px-4 text-white font-medium bg-[#b7d2f8]/5">Groq LLaMA 3.1 unique tone synthesis across 5 calibrated stages</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Customer Email Replies</td>
                  <td className="py-3 px-4 text-zinc-400">Ignored; dunning robot continues harassing customer with warnings</td>
                  <td className="py-3 px-4 text-white font-medium bg-[#b7d2f8]/5">Cryptographic reply catch pauses follow-ups in &lt;1s and drafts resolution</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Debtor Portal Experience</td>
                  <td className="py-3 px-4 text-zinc-400">Requires username/password logins that 70%+ of debtors abandon</td>
                  <td className="py-3 px-4 text-white font-medium bg-[#b7d2f8]/5">1-click zero-login tokenized link (/i/:token) with instant statement view</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Cash-Strapped Debtors</td>
                  <td className="py-3 px-4 text-zinc-400">Demands rigid 100% payment, triggering ghosting and write-offs</td>
                  <td className="py-3 px-4 text-white font-medium bg-[#b7d2f8]/5">Debtor self-selects 2x–4x installment plans; reminders track milestones</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Domain Sender Reputation</td>
                  <td className="py-3 px-4 text-zinc-400">Hammers invalid emails until domain is blacklisted on Google/O365</td>
                  <td className="py-3 px-4 text-white font-medium bg-[#b7d2f8]/5">3-Drop Circuit Breaker &amp; Dead Letter Queue (DLQ) protect standing</td>
                </tr>
              </tbody>
            </table>
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
              {FAQS.map((faq, i) => (
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

        {/* EXPLORE MORE SOLUTIONS DIRECTORY */}
        <section className="mb-16">
          <div className="max-w-2xl mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Explore More AR Solutions &amp; Guides
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to="/compare"
              className="p-5 rounded-2xl bg-[#0c0d10] border border-white/[0.08] hover:border-white/[0.18] space-y-2 group transition-all shadow-md"
            >
              <div className="text-xs uppercase text-[#b7d2f8] font-semibold flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5" />
                <span>Competitor Comparisons</span>
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-[#b7d2f8] transition-colors">
                Compare AR Platforms →
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Compare Jaktra against HighRadius, Upflow, Chaser, PaidNice, and Kolleno.
              </p>
            </Link>

            <Link
              to="/use-cases"
              className="p-5 rounded-2xl bg-[#0c0d10] border border-white/[0.08] hover:border-white/[0.18] space-y-2 group transition-all shadow-md"
            >
              <div className="text-xs uppercase text-[#b7d2f8] font-semibold flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                <span>Industry Playbooks</span>
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-[#b7d2f8] transition-colors">
                Industry Solutions →
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Tailored collections playbooks for B2B SaaS, manufacturing, and staffing agencies.
              </p>
            </Link>

            <Link
              to="/resources"
              className="p-5 rounded-2xl bg-[#0c0d10] border border-white/[0.08] hover:border-white/[0.18] space-y-2 group transition-all shadow-md"
            >
              <div className="text-xs uppercase text-[#b7d2f8] font-semibold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>Research &amp; Playbooks</span>
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-[#b7d2f8] transition-colors">
                Finance Resources →
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Countback DSO calculation guides, working capital calculators, and dispute frameworks.
              </p>
            </Link>
          </div>
        </section>

        {/* CLEAN HIGH-CONVERTING BOTTOM CTA */}
        <section className="rounded-2xl bg-[#0c0d10] border border-white/[0.08] p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
          <div className="max-w-xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Ready to Modernize Your Accounts Receivable?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Connect QuickBooks, Xero, or Stripe in under 15 minutes. 100% free during Early Access.
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
                to="/use-cases"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-white/[0.04] text-zinc-300 hover:text-white hover:bg-white/[0.08] border border-white/[0.08] text-xs sm:text-sm font-medium transition-colors"
              >
                View industry solutions
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

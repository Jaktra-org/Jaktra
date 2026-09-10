import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Lock,
  Copy,
  Check,
  FileText,
  Ban,
} from "lucide-react";
import jaktraLogo from "../assets/jaktra_svg.svg";
import { SEOHead } from "../components/common/SEOHead";
import { fiveStageEscalationSchema, breadcrumbSchema } from "../components/common/seo-schemas";
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

interface StageDetail {
  id: string;
  stageNumber: string;
  name: string;
  timing: string;
  tone: string;
  badge: string;
  description: string;
  aiObjective: string;
  complianceGuardrail: string;
  sampleSubject: string;
  sampleBody: string;
  isLegalStop?: boolean;
}

const STAGES: StageDetail[] = [
  {
    id: "stage-1",
    stageNumber: "01",
    name: "Collaborative Courtesy",
    timing: "Days 1–7 Overdue",
    tone: "Courteous, Helpful, Administrative Oversight",
    badge: "Stage 01 • Days 1–7",
    description:
      "Assumes accidental oversight. Reaches out courteously confirming invoice delivery and offering zero-login payment links. Preserves long-term client goodwill while removing all settlement friction.",
    aiObjective: "Polite, supportive inquiry confirming receipt and offering direct 1-click statement access.",
    complianceGuardrail: "Protected by 20-hour rolling idempotency. Zero repeated outreach permitted inside 20 hours.",
    sampleSubject: "Friendly follow-up: Invoice #INV-2048 ($4,250.00)",
    sampleBody:
      "Hi Alex — Hope your week is off to a productive start! Just a gentle note that Invoice #INV-2048 ($4,250.00) was due on Friday. You can review your account statement and clear payment instantly via your direct link: https://jaktra.site/i/demo-token. If you need any clarifications or updated purchase order notes, please let us know!",
  },
  {
    id: "stage-2",
    stageNumber: "02",
    name: "Firm Accounting Follow-Up & Installment Introduction",
    timing: "Days 8–14 Overdue",
    tone: "Professional, Structured, Remittance Inquiry",
    badge: "Stage 02 • Days 8–14",
    description:
      "Direct and professional. Inquires if the invoice has been placed on the weekly AP processing run and introduces self-serve installment plans if temporary liquidity constraints are delaying disbursement.",
    aiObjective: "Assertive inquiry regarding AP payment schedule; introduce self-serve installment alternatives.",
    complianceGuardrail: "Inbound dispute replies immediately halt cadence and trigger human review with drafted reply.",
    sampleSubject: "Remittance status request: Invoice #INV-2048 ($4,250.00)",
    sampleBody:
      "Hi Alex — We have not yet received payment for Invoice #INV-2048 ($4,250.00), which is now 10 days past due. Could you please confirm if this has been scheduled with accounts payable? If your team needs structured cash flow flexibility, you can request an installment plan directly through your portal: https://jaktra.site/i/demo-token.",
  },
  {
    id: "stage-3",
    stageNumber: "03",
    name: "Formal Commercial Notice & Deliverable Review",
    timing: "Days 15–21 Overdue",
    tone: "Formal, Contractual, Deliverable Contingency",
    badge: "Stage 03 • Days 15–21",
    description:
      "Heightened commercial urgency. Emphasizes contractual payment terms and cautions that continued delinquency risks placing active deliverables, accounts, or credit terms on temporary hold.",
    aiObjective: "Formal contractual language citing commercial credit status and potential delivery disruption.",
    complianceGuardrail: "Elevates delinquency risk score; triggers internal notification to finance leadership.",
    sampleSubject: "Commercial notice: Account status for Invoice #INV-2048",
    sampleBody:
      "Dear Alex — We are following up urgently regarding overdue Invoice #INV-2048 ($4,250.00), now 18 days past due. To prevent an automatic hold on your account deliverables and maintain good commercial standing, we request that this balance be cleared immediately via your secure portal: https://jaktra.site/i/demo-token.",
  },
  {
    id: "stage-4",
    stageNumber: "04",
    name: "Stern Demand & Executive Escalation Notice",
    timing: "Days 22–30 Overdue",
    tone: "High-Stakes, Final Automated Warning, 4-Day Deadline",
    badge: "Stage 04 • Days 22–30",
    description:
      "Final automated warning. Establishes a strict 4-business-day settlement deadline before irreversible transfer of the file to executive management, collection counsel, or credit reporting agencies.",
    aiObjective: "Strict demand stating exact settlement deadline date and impending legal/agency transfer.",
    complianceGuardrail: "Final automated touchpoint before the mandatory Stage 5 Legal Stop permanently freezes outreach.",
    sampleSubject: "FINAL AUTOMATED NOTICE: Immediate payment required for #INV-2048",
    sampleBody:
      "URGENT: Final Notice for Overdue Invoice #INV-2048 ($4,250.00) — Your account is now 26 days overdue despite multiple prior notices. Full payment is required within 4 business days to prevent transfer of this file to our corporate legal and recovery counsel. Settle immediately: https://jaktra.site/i/demo-token.",
  },
  {
    id: "stage-5",
    stageNumber: "05",
    name: "Stage 5 Legal Stop (Automation Cutoff)",
    timing: "Day 31+ Overdue",
    tone: "Automation Permanently Halted • Certified Audit Log",
    badge: "Stage 05 • Day 31+ (Legal Halt)",
    description:
      "Strict compliance safeguard. AI automation permanently halts to prevent regulatory harassment violations. The invoice file is locked and routed for executive sign-off, ensuring all subsequent contact is conducted by authorized personnel.",
    aiObjective: "AI messaging engine locks down completely. Certified compliance audit trail generated.",
    complianceGuardrail: "Mandatory FDCPA / regulatory stop. Zero outreach sent without manual written authorization.",
    sampleSubject: "AUDIT LOG: [AUTOMATION HALTED] File locked for executive legal review",
    sampleBody:
      "[AUTOMATION HALTED]: Invoice #INV-2048 has reached 31+ days overdue. Automated AI communication has been permanently halted by Jaktra's Stage 5 Legal Stop. This account requires manual executive review and written legal authorization prior to further outreach.",
    isLegalStop: true,
  },
];

const FAQS = [
  {
    q: "Why is an open 5-stage escalation better than standard dunning reminders?",
    a: "Standard dunning sends generic, repetitive emails that debtors quickly tune out or mark as spam. Jaktra's 5-stage generative engine modulates tone dynamically: starting with empathetic, polite inquiries that preserve customer goodwill, and gradually escalating to firm, contractual demands only as overdue duration increases.",
  },
  {
    q: "What is the Stage 5 Legal Stop and why is it critical?",
    a: "The Stage 5 Legal Stop is a foundational compliance feature in Jaktra's backend (agent.service.ts). When an invoice reaches 31+ days overdue, our engine permanently halts automated AI communications. This prevents regulatory and FDCPA harassment violations, ensuring that no debtor is badgered indefinitely by an automated bot without human executive review.",
  },
  {
    q: "How does the 20-Hour Idempotency Guard prevent debtor spam?",
    a: "Our communication service enforces a strict 20-hour rolling window on all debtor contacts. Even if multiple collection triggers or manual runs occur in a single day, Jaktra guarantees that no customer receives more than one email within a 20-hour period.",
  },
  {
    q: "Can I customize the system prompt or tone boundaries for my industry?",
    a: "Yes. In your Organization Settings, you can fine-tune cadence thresholds (e.g. extending Stage 1 for enterprise accounts on Net-60 terms), modify brand voice parameters, and configure custom notification channels for manual Stage 5 handoffs.",
  },
  {
    q: "Can debtors respond and dispute invoices during the cadence?",
    a: "Yes. Jaktra includes an inbound NLP DisputeAgent. If a debtor replies with a question about pricing, usage, or deliverables, the engine instantly halts the escalation cadence, marks the invoice as disputed, and drafts an AI-suggested resolution response for your finance team.",
  },
];

export function FiveStageEscalation() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#f5f5f5] font-sans selection:bg-[#b7d2f8]/20 selection:text-white antialiased">
      <SEOHead
        title="5-Stage Autonomous AR Tone Escalation Engine | Jaktra"
        description="Explore Jaktra's generative AI tone escalation matrix. Dynamically shifts collection tone across 5 stages with automated 20-hour idempotency and a strict Stage 5 legal stop."
        canonicalPath="/features/5-stage-escalation"
        jsonLd={[
          fiveStageEscalationSchema,
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Features", path: "/features" },
            { name: "5-Stage Tone Escalation", path: "/features/5-stage-escalation" },
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
              5-Stage Tone Escalation
            </li>
          </ol>
        </nav>

        {/* Hero Section */}
        <section className="text-center max-w-4xl mx-auto mb-16 sm:mb-20">
          <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-4">
            Groq LLaMA 3.1 Generative Tone Matrix
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-6 leading-tight">
            The Autonomous 5-Stage AR Tone Escalation Engine
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 max-w-3xl mx-auto leading-relaxed mb-8">
            Generic dunning emails alienate customers and get ignored. Jaktra uses generative AI to dynamically modulate collections copy from courteous reminders to stern demands—backed by institutional legal compliance guards.
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

        {/* SECTION 1: Quick-Glance Cadence Matrix Table (Open, Scannable) */}
        <section className="mb-20 sm:mb-24">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-2">
                Executive Cadence Overview
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                5-Stage Tone Escalation at a Glance
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 sm:max-w-md">
              Every stage modulates psychological framing and tone automatically, backed by hard legal boundaries.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#111113] overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[760px]">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-white/[0.02] text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                    <th className="py-4 px-6 font-semibold">Stage &amp; Timing</th>
                    <th className="py-4 px-6 font-semibold">Tone Classification</th>
                    <th className="py-4 px-6 font-semibold">Core AI Objective</th>
                    <th className="py-4 px-6 font-semibold">Automated Guardrail</th>
                    <th className="py-4 px-6 font-semibold text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05] text-xs sm:text-sm">
                  {STAGES.map((s) => (
                    <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-6 h-6 rounded-md flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                            s.isLegalStop ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-white/[0.06] text-white border border-white/[0.1]"
                          }`}>
                            {s.stageNumber}
                          </span>
                          <div>
                            <div className="font-semibold text-white">{s.name}</div>
                            <div className="text-[11px] text-zinc-400 font-mono mt-0.5">{s.timing}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-zinc-300">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white/[0.03] border border-white/[0.06] text-zinc-300">
                          {s.tone.split(",")[0]}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-zinc-300 leading-relaxed max-w-xs">
                        {s.aiObjective}
                      </td>
                      <td className="py-4 px-6 text-zinc-400 leading-relaxed max-w-xs">
                        <div className="flex items-start gap-1.5">
                          {s.isLegalStop ? (
                            <Ban className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                          ) : (
                            <ShieldCheck className="w-3.5 h-3.5 text-[#b7d2f8] shrink-0 mt-0.5" />
                          )}
                          <span>{s.complianceGuardrail}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <a
                          href={`#${s.id}`}
                          className="inline-flex items-center gap-1 text-xs text-[#b7d2f8] hover:underline font-mono"
                        >
                          Details &darr;
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* SECTION 2: Complete 5-Stage Escalation Roadmap (Unrolled & Open) */}
        <section className="mb-20 sm:mb-24">
          <div className="mb-10 text-center max-w-3xl mx-auto">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-2">
              Deep-Dive Cadence Mechanics
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Sequential 5-Stage Cadence Architecture
            </h2>
            <p className="text-sm text-zinc-400 mt-2">
              Every stage displays its psychological rationale, automated Groq LLaMA 3.1 directives, word-for-word email preview, and built-in regulatory guardrail.
            </p>
          </div>

          <div className="space-y-10">
            {STAGES.map((stage) => (
              <div
                id={stage.id}
                key={stage.id}
                className={`scroll-mt-24 rounded-2xl border p-6 sm:p-8 transition-all ${
                  stage.isLegalStop
                    ? "border-red-500/30 bg-[#111113] relative overflow-hidden"
                    : "border-white/[0.08] bg-[#111113]"
                }`}
              >
                {stage.isLegalStop && (
                  <div className="absolute top-0 right-0 px-4 py-1.5 bg-red-500/10 border-b border-l border-red-500/20 text-red-400 text-xs font-mono font-semibold uppercase tracking-wider rounded-bl-xl flex items-center gap-1.5">
                    <Ban className="w-3.5 h-3.5" />
                    Automation Halts Permanently
                  </div>
                )}

                {/* Stage Header */}
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-mono font-semibold uppercase tracking-wider border ${
                    stage.isLegalStop
                      ? "bg-red-500/10 border-red-500/20 text-red-300"
                      : "bg-white/[0.04] border-white/[0.08] text-[#b7d2f8]"
                  }`}>
                    {stage.badge}
                  </span>
                  <span className="text-xs text-zinc-400 font-medium">
                    Tone: <strong className="text-zinc-200">{stage.tone}</strong>
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
                  {stage.name}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed mb-6 max-w-3xl">
                  {stage.description}
                </p>

                {/* Specs Grid: Objective & Guardrail */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0a0a0b]/60">
                    <div className="text-xs font-semibold text-[#b7d2f8] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      AI Objective &amp; Framing
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {stage.aiObjective}
                    </p>
                  </div>

                  <div className={`p-4 rounded-xl border ${
                    stage.isLegalStop
                      ? "border-red-500/20 bg-red-950/10"
                      : "border-white/[0.08] bg-[#0a0a0b]/60"
                  }`}>
                    <div className={`text-xs font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1.5 ${
                      stage.isLegalStop ? "text-red-400" : "text-zinc-300"
                    }`}>
                      {stage.isLegalStop ? <Ban className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5 text-[#b7d2f8]" />}
                      Compliance Safeguard
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {stage.complianceGuardrail}
                    </p>
                  </div>
                </div>

                {/* Email or Audit Preview Box */}
                <div className="rounded-xl border border-white/[0.08] bg-[#0a0a0b] overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.08] bg-white/[0.02]">
                    <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                      <FileText className="w-3.5 h-3.5 text-[#b7d2f8]" />
                      <span className="font-semibold text-zinc-300">
                        {stage.isLegalStop ? "Audit Trail Record" : "Sample Generated Email"}
                      </span>
                      <span className="hidden sm:inline text-zinc-600">|</span>
                      <span className="hidden sm:inline text-zinc-400 truncate max-w-xs">{stage.sampleSubject}</span>
                    </div>
                    <button
                      onClick={() => handleCopy(stage.id, stage.sampleBody)}
                      className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors font-mono px-2 py-1 rounded bg-white/[0.04] border border-white/[0.06]"
                    >
                      {copiedId === stage.id ? (
                        <>
                          <Check className="w-3 h-3 text-green-400" />
                          <span className="text-green-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-4 sm:p-5 font-mono text-xs text-zinc-300 leading-relaxed whitespace-pre-line">
                    {stage.sampleBody}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 3: 3 Built-In Architectural Safeguards */}
        <section className="mb-20 sm:mb-24">
          <div className="text-center mb-10">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-2">
              Institutional Reliability
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Three Built-In Institutional Safeguards
            </h2>
            <p className="text-center text-sm text-zinc-400 max-w-2xl mx-auto">
              Most dunning tools blindly blast repetitive emails until a customer complains or files a spam report. Jaktra is engineered with zero-compromise institutional safeguards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-white/[0.08] bg-[#111113] p-8 flex flex-col justify-between shadow-lg">
              <div>
                <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4">
                  <Lock className="w-5 h-5 text-[#b7d2f8]" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Stage 5 Legal Stop</h3>
                <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                  Automation strictly halts at 31+ days overdue. AI outreach is permanently frozen to prevent regulatory harassment violations, requiring human finance officer sign-off before formal recovery actions.
                </p>
              </div>
              <div className="text-xs text-zinc-400 flex items-center gap-1.5 font-medium pt-3 border-t border-white/[0.05]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#b7d2f8]" />
                <span>Zero runaway bot risk</span>
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-[#111113] p-8 flex flex-col justify-between shadow-lg">
              <div>
                <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4">
                  <Clock className="w-5 h-5 text-[#b7d2f8]" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">20-Hour Idempotency Guard</h3>
                <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                  Guarantees that no debtor ever receives more than one email in a 20-hour window, eliminating duplicate blasts across automated trigger schedules or manual admin syncs.
                </p>
              </div>
              <div className="text-xs text-zinc-400 flex items-center gap-1.5 font-medium pt-3 border-t border-white/[0.05]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#b7d2f8]" />
                <span>Protected domain reputation</span>
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-[#111113] p-8 flex flex-col justify-between shadow-lg">
              <div>
                <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4">
                  <AlertTriangle className="w-5 h-5 text-[#b7d2f8]" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Predictive Delinquency Scorer</h3>
                <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                  Machine learning model evaluates invoice balance, payment history, and follow-up frequency to automatically tailor escalation velocity and prioritize high-risk accounts.
                </p>
              </div>
              <div className="text-xs text-zinc-400 flex items-center gap-1.5 font-medium pt-3 border-t border-white/[0.05]">
                <Sparkles className="w-3.5 h-3.5 text-[#b7d2f8]" />
                <span>Contextual risk adjustment</span>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="max-w-4xl mx-auto px-2 py-12 mb-16 border-t border-white/[0.08]">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base">
              Common questions about generative tone escalation, AI prompts, and compliance guardrails.
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
              Accelerate Cash Flow with Intelligent Tone Modulation
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto text-sm sm:text-base mb-8">
              Get your autonomous collections agent active in 15 minutes. Free during Early Access with zero credit card required.
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

export default FiveStageEscalation;


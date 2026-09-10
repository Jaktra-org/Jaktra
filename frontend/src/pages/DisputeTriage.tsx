import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  PauseCircle,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import jaktraLogo from "../assets/jaktra_svg.svg";
import { SEOHead } from "../components/common/SEOHead";
import { disputeTriageSchema, breadcrumbSchema } from "../components/common/seo-schemas";
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

interface DisputeScenario {
  id: string;
  category: "dispute" | "question" | "payment_promise";
  label: string;
  inboundText: string;
  classification: string;
  confidence: number;
  cadenceAction: string;
  aiSuggestedDraft: string;
}

const SCENARIOS: DisputeScenario[] = [
  {
    id: "billing_dispute",
    category: "dispute",
    label: "Billing Discrepancy",
    inboundText:
      "Hi team — We received this invoice #INV-4091 for $6,800, but our purchase order specified $5,200. There appears to be an extra 20 hours of consulting billed that were never approved by our director. Please revise before we can issue payment.",
    classification: "Dispute (Billing Discrepancy)",
    confidence: 0.96,
    cadenceAction: "AUTOMATICALLY PAUSED (Outreach frozen to prevent relationship friction)",
    aiSuggestedDraft:
      "Hi Jordan — Thank you for bringing this to our attention. We have immediately paused automated reminders for Invoice #INV-4091 while our finance team verifies the 20 consulting hours against your approved PO #PO-8821. We will follow up by tomorrow at 2:00 PM with an adjusted statement or timesheet breakdown. We appreciate your patience!",
  },
  {
    id: "payment_promise",
    category: "payment_promise",
    label: "Payment Promise Date",
    inboundText:
      "Hello! Our quarterly pay run is scheduled for next Thursday, September 18th. Invoice #INV-4091 has been approved by accounting and will be transferred on that date via ACH.",
    classification: "Payment Promise (Scheduled for Sep 18)",
    confidence: 0.94,
    cadenceAction: "CADENCE SNOOZED (Postponed until Sep 19 follow-up verification)",
    aiSuggestedDraft:
      "Hi Jordan — Thanks so much for confirming your pay run date! We have noted that payment for Invoice #INV-4091 ($6,800) is scheduled for Thursday, September 18th, and have postponed further reminders until then. If you need any payment details or want to clear it earlier, your portal remains active: https://jaktra.site/i/demo-token.",
  },
  {
    id: "inquiry_question",
    category: "question",
    label: "Tax & Entity Inquiry",
    inboundText:
      "Hi accounts team — Before we can release payment for this invoice, our compliance team requires an updated W-9 form and your GST identification certificate. Could you send those over?",
    classification: "Question (Vendor Onboarding / Tax Info)",
    confidence: 0.92,
    cadenceAction: "CADENCE PAUSED (Waiting on document provision)",
    aiSuggestedDraft:
      "Hi Jordan — Thanks for reaching out! Attached please find our updated tax documents (W-9 / GST certificate) for your compliance records. We have temporarily paused follow-ups on Invoice #INV-4091. Please let us know once this has been processed by your vendor onboarding desk!",
  },
];



const FAQS = [
  {
    q: "How does Jaktra detect invoice disputes automatically?",
    a: "When debtors reply to an automated reminder email, Jaktra's inbound webhook ingests the text and feeds it into our NLP DisputeAgent (ai-service/src/agents/dispute_agent.py). The model classifies the message into dispute, question, payment promise, or unclear, scoring confidence based on language semantics.",
  },
  {
    q: "Why is automatically freezing the collection cadence so important?",
    a: "Sending aggressive overdue reminders to a customer who has already replied with a legitimate billing question or pricing dispute is the #1 cause of customer churn and sour business relationships. Jaktra immediately freezes automated dispatches the second a dispute or question is detected, protecting your brand.",
  },
  {
    q: "Does Jaktra send replies automatically without human review?",
    a: "By default, no. Jaktra generates an AI-suggested resolution draft tailored to the customer's exact inquiry and presents it in your dashboard with confidence scores and reasoning. Your finance manager can approve the draft with one click, edit the text, or upload revised credit memos before sending.",
  },
  {
    q: "What happens when a debtor promises to pay on a specific date?",
    a: "When a customer provides a payment promise (e.g. 'Payment scheduled for next Friday'), Jaktra automatically snoozes reminders until after that promised date. If the funds arrive, the ledger settles via webhook. If the date passes without payment, the engine gently re-engages.",
  },
  {
    q: "Can disputes be resolved with structured installment plans?",
    a: "Yes. In cases where debtors dispute their ability to clear a large lump sum due to temporary cash flow constraints, Jaktra allows finance managers to convert the balance into a structured installment schedule accessible through the debtor's tokenized portal link.",
  },
];

export function DisputeTriage() {
  const [selectedScenario, setSelectedScenario] = useState<string>("billing_dispute");

  const scenario = SCENARIOS.find((s) => s.id === selectedScenario) || SCENARIOS[0];

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#f5f5f5] font-sans selection:bg-[#b7d2f8]/20 selection:text-white antialiased">
      <SEOHead
        title="Automatic Email Reply Catch & Dispute Triage for Accounts Receivable | Jaktra"
        description="Stop collection emails from irritating clients who already replied. Discover how automatic inbound email reply catch and NLP dispute triage pause dunning and resolve invoice disputes fast."
        canonicalPath="/features/dispute-triage"
        jsonLd={[
          disputeTriageSchema,
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Features", path: "/features" },
            { name: "Automatic Inbound Reply Triage", path: "/features/dispute-triage" },
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
              Automatic Inbound Reply Triage
            </li>
          </ol>
        </nav>

        {/* Hero Section */}
        <section className="text-center max-w-4xl mx-auto mb-20 sm:mb-24">
          <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-4">
            Inbound Billing Email Automation &amp; Dispute Resolution
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-6 leading-tight">
            Automatic Inbound Reply Triage: How to Catch, Classify &amp; Resolve Invoice Disputes Before They Stall Cash Flow
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 max-w-3xl mx-auto leading-relaxed mb-8">
            The biggest fear of accounts receivable automation is sending a robotic payment demand to a client who already replied with a billing question or dispute. Discover how closed-loop inbound reply catching intercepts debtor responses, freezes dunning sequences instantly, and drafts one-click resolution proposals.
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

        {/* Interactive Dispute Simulation */}
        <section className="mb-20 sm:mb-24">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Interactive Dispute Triage Simulator
            </h2>
            <p className="text-sm text-zinc-400 max-w-xl mx-auto">
              Select an inbound customer reply scenario to see how Jaktra’s NLP DisputeAgent reacts in real time.
            </p>
          </div>

          {/* Scenario Buttons */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {SCENARIOS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedScenario(s.id)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  selectedScenario === s.id
                    ? "bg-white text-zinc-950 shadow-md"
                    : "bg-[#111113] border border-white/[0.08] text-zinc-400 hover:text-white hover:border-white/20"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Simulation Output Card */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#111113] p-6 sm:p-8">
            {/* Inbound Email Box */}
            <div className="mb-6">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                <MessageSquare className="w-4 h-4 text-[#b7d2f8]" />
                <span>Inbound Debtor Email Received</span>
              </div>
              <div className="p-4 rounded-xl border border-white/[0.08] bg-black/40 text-sm text-zinc-300 leading-relaxed font-sans">
                "{scenario.inboundText}"
              </div>
            </div>

            {/* AI Analysis Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="p-4 rounded-xl border border-white/[0.08] bg-black/30">
                <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-[#b7d2f8]" />
                  <span>NLP Classification</span>
                </div>
                <div className="text-base font-bold text-white mb-2">{scenario.classification}</div>
                <div className="text-xs text-zinc-400">
                  Confidence Score: <span className="font-mono text-white font-semibold">{Math.round(scenario.confidence * 100)}%</span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-white/[0.08] bg-black/30">
                <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <PauseCircle className="w-3.5 h-3.5 text-[#b7d2f8]" />
                  <span>Cadence Protection Action</span>
                </div>
                <div className="text-xs sm:text-sm font-medium text-zinc-200 leading-relaxed">
                  {scenario.cadenceAction}
                </div>
              </div>
            </div>

            {/* AI Draft Response Box */}
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                <Sparkles className="w-4 h-4 text-[#b7d2f8]" />
                <span>AI-Suggested Resolution Response (Pending Finance Review)</span>
              </div>
              <div className="p-4 rounded-xl border border-white/[0.12] bg-white/[0.02] text-sm text-zinc-200 leading-relaxed font-sans mb-4">
                {scenario.aiSuggestedDraft}
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.08] text-white text-xs font-semibold border border-white/20">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#b7d2f8]" />
                  <span>One-Click Finance Approval</span>
                </span>
                <span className="text-xs text-zinc-500">Edit or send directly from your Jaktra dashboard</span>
              </div>
            </div>
          </div>
        </section>

        {/* 3 Steps in Dispute Lifecycle */}
        <section className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              The 3-Step Dispute Resolution Workflow
            </h2>
            <p className="text-center text-sm text-zinc-400 max-w-2xl mx-auto">
              How Jaktra handles inbound billing inquiries without manual inbox chaos.
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
                    Ingestion
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  Instant Inbound Ingestion &amp; Token Matching
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-4">
                  When a debtor replies to any collection email, Jaktra&apos;s inbound webhook processes the message in real time. It normalizes headers, strips signature footers, and links the reply directly to the debtor&apos;s open invoice token (<code className="text-xs font-mono">/i/:token</code>).
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#0a0a0b]/60 border border-white/[0.06] text-xs text-zinc-300">
                <strong className="text-white font-medium block mb-0.5">Sub-Second Ingestion:</strong>
                Processed in under 120ms with zero manual inbox monitoring or triage routing.
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-[#111113] p-6 sm:p-7 flex flex-col justify-between shadow-lg">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.1] text-xs font-mono font-bold flex items-center justify-center text-[#b7d2f8]">
                    02
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-white/[0.04] border border-white/[0.08] text-[#b7d2f8]">
                    Cadence Freeze
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  NLP Sentiment Classification &amp; Auto-Freeze
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-4">
                  Our NLP DisputeAgent categorizes the reply into four intent buckets: Dispute, Inquiry Question, Payment Promise, or Unclear. The moment a dispute or question is confirmed, active dunning halts immediately.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#0a0a0b]/60 border border-white/[0.06] text-xs text-zinc-300">
                <strong className="text-white font-medium block mb-0.5">Relationship Shield:</strong>
                Guarantees zero robotic &ldquo;overdue&rdquo; notices send while a client is waiting on an answer.
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-[#111113] p-6 sm:p-7 flex flex-col justify-between shadow-lg">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.1] text-xs font-mono font-bold flex items-center justify-center text-[#b7d2f8]">
                    03
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-white/[0.04] border border-white/[0.08] text-[#b7d2f8]">
                    Resolution
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  Pre-Drafted AI Resolution &amp; One-Click Approval
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-4">
                  Jaktra generates a tailored, cordial resolution email referencing the exact invoice number, disputed amount, and proposed action. Finance controllers review the draft and approve or edit in one click.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#0a0a0b]/60 border border-white/[0.06] text-xs text-zinc-300">
                <strong className="text-white font-medium block mb-0.5">Time Saved:</strong>
                Reduces dispute cycle time from 3+ business days down to under 4 minutes.
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="max-w-4xl mx-auto px-2 py-12 mb-16 border-t border-white/[0.08]">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Frequently Asked Questions: Dispute Triage
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base">
              Answers regarding sentiment classification, human approval workflows, and cadence controls.
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
              Stop Churn with Intelligent Dispute Resolution
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto text-sm sm:text-base mb-8">
              Protect commercial relationships while collecting cash faster. Start free with Jaktra today.
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

export default DisputeTriage;

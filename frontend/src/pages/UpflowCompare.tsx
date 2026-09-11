import { Link } from "react-router-dom";
import { Check, ArrowRight, Sparkles, ShieldCheck, MailX, CreditCard, RefreshCw } from "lucide-react";
import jaktraLogo from "../assets/jaktra_svg.svg";
import { SEOHead } from "../components/common/SEOHead";
import { upflowCompareSchema, breadcrumbSchema } from "../components/common/seo-schemas";
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

export function UpflowCompare() {

  const faqs = [
    {
      q: "Why do finance teams switch from Upflow to Jaktra?",
      a: "Upflow modernized accounts receivable reporting, but its collection engine relies on static, rule-based text templates sent on rigid schedules. If a customer replies with a dispute or partial payment promise, static tools often continue blindly blasting overdue notices. Jaktra is an autonomous AI agent: it uses Groq LLaMA 3.1 to modulate tone across 5 stages, automatically triages inbound dispute replies, halts cadences when questions arise, and provides zero-login tokenized payment portals with native Razorpay settlement.",
    },
    {
      q: "How does Jaktra's 5-stage AI tone escalation differ from Upflow's email workflows?",
      a: "In Upflow, you create rigid text templates (Template 1 at Day 7, Template 2 at Day 14). In Jaktra, our AI agent dynamically generates communication copy across 5 distinct urgency tiers (Warm Reminder → Firm Follow-Up → Serious Notice → Stern Demand → Legal Stop) tailored to the debtor's payment history, invoice size, and delinquency risk score. Every message feels natural, polite, and human.",
    },
    {
      q: "What happens when a customer replies to an invoice reminder?",
      a: "In Upflow, replies go to a shared inbox where finance managers must manually sort through complaints and pause email sequences by hand. In Jaktra, our DisputeAgent automatically classifies inbound email sentiment into dispute, question, payment promise, or unclear. If a dispute is detected, the collection cadence is automatically paused, and an AI-drafted resolution response is prepared for finance approval.",
    },
    {
      q: "How does debtor payment work compared to Upflow?",
      a: "Upflow typically attaches static PDF invoices with bank account instructions or redirects debtors through generic payment portals. Jaktra generates a secure, tokenized debtor portal link (`/i/:token`) with no passwords required. Debtors view their complete statement of account, select structured installment payment plans, and pay instantly via Razorpay (UPI, NetBanking, Cards) with real-time webhook reconciliation.",
    },
    {
      q: "How does pricing compare between Jaktra and Upflow?",
      a: "Upflow requires talking to sales for custom quotes and typically has annual contract floors. Jaktra is completely free during our public Early Access program with zero sales calls, no artificial invoice limits, and no credit card required.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-zinc-100 font-sans selection:bg-[#b7d2f8]/20 selection:text-white">
      <SEOHead
        title="Upflow Alternative — Autonomous AI Tone Escalation vs Static Dunning"
        description="Compare Upflow vs Jaktra. Discover why finance teams upgrade from Upflow's static email templates to Jaktra's autonomous Groq LLaMA 3.1 tone escalation, NLP dispute triage, and tokenized payment portals."
        canonicalPath="/compare/upflow-alternative"
        jsonLd={[
          upflowCompareSchema,
          breadcrumbSchema([
            { name: "Compare", path: "/compare" },
            { name: "Upflow Alternative", path: "/compare/upflow-alternative" },
          ]),
        ]}
      />

      <HeaderNav />

      <main className="pt-24 pb-20 px-6 max-w-5xl mx-auto relative">
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
              <span className="text-zinc-400">Compare</span>
            </li>
            <li>/</li>
            <li className="text-zinc-300 font-medium" aria-current="page">
              Upflow Alternative
            </li>
          </ol>
        </nav>

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-3">
            Autonomous AI Agent vs. Static Email Schedules
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-5 leading-tight">
            The Modern Upflow Alternative with Autonomous AI Tone Modulation
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
            Upflow pioneered modern AR reporting. But static, schedule-based email templates alienate customers and
            require manual inbox sorting. Jaktra is the next-generation autonomous AI collections agent.
          </p>
        </div>

        {/* Architectural Shift Overview */}
        <section className="mb-16">
          <div className="max-w-3xl mb-8">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-2">
              Architectural Evolution
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              The Paradigm Shift: From Static Dunning Rules to Autonomous AI Agents
            </h2>
            <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
              Why fast-moving finance teams outgrow rigid calendar-based email templates and upgrade to closed-loop autonomous collections.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 sm:p-8 rounded-2xl bg-[#111113] border border-white/[0.08] shadow-lg">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400 mb-3">
                <span className="w-2 h-2 rounded-full bg-zinc-500" />
                The Legacy Model: Upflow Drip Rules
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Rigid Template Schedules
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Traditional tools like Upflow rely on static drip campaigns: <em>&ldquo;Send Template A at Day 7, Template B at Day 14.&rdquo;</em> They cannot adapt their tone to customer sentiment, cannot interpret inbound dispute replies, and risk damaging commercial goodwill by blasting overdue notices after a customer has asked a question.
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-2xl bg-[#111113] border border-white/[0.08] shadow-lg">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-[#b7d2f8] mb-3">
                <span className="w-2 h-2 rounded-full bg-[#b7d2f8]" />
                The Modern Model: Jaktra Autonomous AI
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Closed-Loop Autonomous AI
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                Jaktra combines predictive ML risk scoring with <strong>Groq LLaMA 3.1 generative tone modulation</strong>. It adapts messaging across 5 urgency stages, automatically pauses sequences when an inbound dispute is detected, guarantees delivery via Dead Letter Queues, and collects instant payments through tokenized debtor portals.
              </p>
            </div>
          </div>
        </section>

        {/* Head-to-Head Comparison Matrix */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold text-white text-center mb-4">Detailed Head-to-Head Comparison</h2>
          <p className="text-center text-sm text-zinc-400 mb-8 max-w-2xl mx-auto">
            Evaluate how Jaktra’s autonomous architecture outperforms traditional rule-based dunning workflows.
          </p>

          <div className="rounded-2xl border border-white/[0.08] bg-[#111113] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm min-w-[680px]">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-white/[0.03] text-xs font-mono uppercase tracking-wider text-zinc-300">
                    <th className="py-4 px-6 font-semibold">Feature / Capability</th>
                    <th className="py-4 px-6 font-semibold text-[#b7d2f8] bg-white/[0.02]">Jaktra Autonomous AR</th>
                    <th className="py-4 px-6 font-semibold text-zinc-400">Upflow</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05] text-xs sm:text-sm">
                  <tr className="hover:bg-white/[0.015] transition-colors">
                    <td className="py-4 px-6 text-white font-medium">Outreach Generation</td>
                    <td className="py-4 px-6 text-zinc-100 font-medium bg-white/[0.02]">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 shrink-0 text-[#b7d2f8]" />
                        <span>Autonomous Groq LLaMA 3.1 5-Stage Tone Modulation</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-zinc-400">Static rule-based text templates</td>
                  </tr>
                  <tr className="hover:bg-white/[0.015] transition-colors">
                    <td className="py-4 px-6 text-white font-medium">Inbound Dispute Triage</td>
                    <td className="py-4 px-6 text-zinc-100 font-medium bg-white/[0.02]">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 shrink-0 text-[#b7d2f8]" />
                        <span>NLP sentiment classifier; auto-pauses cadences; drafts response</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-zinc-400">Manual inbox review and manual workflow pausing</td>
                  </tr>
                  <tr className="hover:bg-white/[0.015] transition-colors">
                    <td className="py-4 px-6 text-white font-medium">Debtor Payment Experience</td>
                    <td className="py-4 px-6 text-zinc-100 font-medium bg-white/[0.02]">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 shrink-0 text-[#b7d2f8]" />
                        <span>Tokenized link (<code className="text-xs font-mono text-[#b7d2f8] bg-white/[0.05] px-1.5 py-0.5 rounded">/i/:token</code>) with Razorpay &amp; installment plans</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-zinc-400">Static PDF invoices &amp; bank wire transfer details</td>
                  </tr>
                  <tr className="hover:bg-white/[0.015] transition-colors">
                    <td className="py-4 px-6 text-white font-medium">Delivery Resilience</td>
                    <td className="py-4 px-6 text-zinc-100 font-medium bg-white/[0.02]">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 shrink-0 text-[#b7d2f8]" />
                        <span>Dead Letter Queue (DLQ) with exponential retry &amp; admin alerts</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-zinc-400">Standard email dispatch without DLQ isolation</td>
                  </tr>
                  <tr className="hover:bg-white/[0.015] transition-colors">
                    <td className="py-4 px-6 text-white font-medium">Overdue Escalation Safeguard</td>
                    <td className="py-4 px-6 text-zinc-100 font-medium bg-white/[0.02]">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 shrink-0 text-[#b7d2f8]" />
                        <span>Stage 5 Legal Stop (Strict halt after 30 days overdue)</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-zinc-400">Loops indefinitely until manually stopped</td>
                  </tr>
                  <tr className="hover:bg-white/[0.015] transition-colors">
                    <td className="py-4 px-6 text-white font-medium">Spam Protection</td>
                    <td className="py-4 px-6 text-zinc-100 font-medium bg-white/[0.02]">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 shrink-0 text-[#b7d2f8]" />
                        <span>20-Hour Rolling Idempotency Guard</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-zinc-400">Static schedule triggers</td>
                  </tr>
                  <tr className="hover:bg-white/[0.015] transition-colors">
                    <td className="py-4 px-6 text-white font-medium">Transparent Self-Serve Pricing</td>
                    <td className="py-4 px-6 text-zinc-100 font-medium bg-white/[0.02]">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 shrink-0 text-[#b7d2f8]" />
                        <span>100% Free during Early Access (No credit card required)</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-zinc-400">Sales-led custom quoting; annual contract commitments</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 4 Architectural Differentiators */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <div className="rounded-xl border border-white/[0.08] bg-[#111113] p-6">
            <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4 text-[#b7d2f8]">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">Groq LLaMA 3.1 Generative Tone Modulation</h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Instead of firing canned, impersonal template strings, Jaktra crafts dynamic email copy that adapts across
              5 stages (Warm Reminder → Firm Follow-Up → Serious Notice → Stern Demand → Legal Stop) tailored to customer
              aging and payment history.
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-[#111113] p-6">
            <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4 text-[#b7d2f8]">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">Automatic Inbound Dispute Sentiment Triage</h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              When a customer replies with a billing question or dispute, our NLP sentiment agent immediately halts the
              collection cadence to protect the commercial relationship, creates a dispute ticket, and drafts an
              executive resolution response.
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-[#111113] p-6">
            <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4 text-[#b7d2f8]">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">Zero-Login Tokenized Debtor Portals</h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Debtors receive a secure tokenized link (`/i/:token`) with zero password friction. They can inspect open
              invoices, request structured installment plans, and pay immediately via Razorpay with instant webhook ledger
              reconciliation.
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-[#111113] p-6">
            <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4 text-[#b7d2f8]">
              <MailX className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">Dead Letter Queue (DLQ) Delivery SLA</h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Unlike dumb mailers that bounce silently, Jaktra’s Dead Letter Queue isolates deliverability issues
              (SendGrid, Resend, SMTP), applies exponential retry policies, and alerts administrators before bad emails
              escalate.
            </p>
          </div>
        </section>

        {/* Objective Decision Guide */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <div className="rounded-2xl border border-white/[0.08] bg-[#111113] p-6 sm:p-7">
            <h3 className="text-base font-semibold text-zinc-300 mb-3">When Upflow is the Right Choice</h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-400">
              <li className="flex items-start gap-2">
                <span className="text-zinc-500 font-mono">•</span>
                <span>You want fixed, calendar-based dunning sequences with visual drag-and-drop workflow builders.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-zinc-500 font-mono">•</span>
                <span>Your finance department maintains dedicated human credit controllers who collaborate across shared team inboxes.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-zinc-500 font-mono">•</span>
                <span>You have an established budget for sales-contracted SaaS tools and prioritize European multi-currency ledger analytics.</span>
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-white/[0.12] bg-[#111113] p-6">
            <h3 className="text-base font-semibold text-white mb-3">When Jaktra is the Right Architectural Fit</h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-300">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#b7d2f8] shrink-0 mt-0.5" />
                <span>You want autonomous AI that modulates tone across 5 stages without sending repetitive, identical templates.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#b7d2f8] shrink-0 mt-0.5" />
                <span>You need inbound dispute triage that immediately halts cadences when customers query an invoice item.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#b7d2f8] shrink-0 mt-0.5" />
                <span>You want zero-login tokenized payment links (/i/:token) that allow 30-second digital settlement and installment plans.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#b7d2f8] shrink-0 mt-0.5" />
                <span>You want an active solution running today with 100% Free Early Access (no credit card or sales call required).</span>
              </li>
            </ul>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-20">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Frequently Asked Questions</h2>
            <p className="text-sm text-zinc-400">
              Key differences for finance teams switching from Upflow's static templates to Jaktra.
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" variant="outline" defaultValue="faq-0" collapsible className="w-full">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left font-medium text-white text-base">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-zinc-400 text-sm leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-2xl border border-white/[0.08] bg-gradient-to-r from-blue-950/30 via-[#111113] to-indigo-950/30 p-10 text-center shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Upgrade to Autonomous AI Collections Today
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto mb-6">
            Stop sending robotic, static dunning templates. Accelerate cash recovery while preserving client goodwill
            with Jaktra.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-zinc-950 text-sm font-semibold hover:bg-zinc-200 transition-colors shadow-lg"
          >
            <span>Get started free</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>

        <CompareDisclaimer />
      </main>

      <LandingFooter />
    </div>
  );
}

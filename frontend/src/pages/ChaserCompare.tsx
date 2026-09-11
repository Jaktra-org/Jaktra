import { Link } from "react-router-dom";
import { Check, ArrowRight, Sparkles, ShieldCheck, Zap, CreditCard } from "lucide-react";
import jaktraLogo from "../assets/jaktra_svg.svg";
import { SEOHead } from "../components/common/SEOHead";
import { chaserCompareSchema, breadcrumbSchema } from "../components/common/seo-schemas";
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



export function ChaserCompare() {
  const faqs = [
    {
      q: "Why do companies evaluate alternatives to Chaser?",
      a: "Chaser is an established traditional dunning tool, but its core architecture is built around static schedule-based email rules and manual telephone call logging. Finance teams looking for true autonomous execution—where AI modulates tone dynamically, automatically triages dispute replies, and provides tokenized zero-password debtor portals—find Jaktra to be a more agile, cost-effective solution.",
    },
    {
      q: "How does Jaktra replace manual telephone call logging?",
      a: "Chaser features a telephone tracker where human staff manually type notes after calling debtors. Jaktra is built on autonomous agent architecture: instead of relying on human phone collectors, our Groq LLaMA 3.1 agent dynamically modulates written tone across 5 escalation tiers, answers debtor inquiries via AI, and provides zero-login digital payment links that minimize the need for manual phone chasing.",
    },
    {
      q: "How does dispute handling differ between Chaser and Jaktra?",
      a: "In Chaser, customer replies to dunning emails hit a regular inbox where finance staff must manually spot complaints and manually pause reminder schedules. In Jaktra, our NLP DisputeAgent automatically parses inbound replies, flags disputes or payment promises, immediately halts active cadences, and drafts suggested responses for one-click finance approval.",
    },
    {
      q: "How does debtor payment reconciliation work?",
      a: "Chaser redirects debtors to generic payment links or provides bank wire details. Jaktra generates a secure, cryptographic debtor portal link (`/i/:token`). Debtors inspect their real-time statement of account, request structured installment plans, and pay instantly via Razorpay (UPI, NetBanking, Cards) with immediate webhook ledger reconciliation.",
    },
    {
      q: "How do the pricing models compare?",
      a: "Chaser starts with paid tiers and charges extra for add-on features and collector seats. Jaktra is completely free during our public Early Access program with zero credit card required to start.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#f5f5f5] font-sans selection:bg-[#b7d2f8]/20 selection:text-white antialiased">
      <SEOHead
        title="Chaser Alternative — Autonomous Generative AI AR Agent vs Static Dunning"
        description="Compare Chaser vs Jaktra. Learn why finance leaders upgrade from Chaser's static email templates and manual phone call tracking to Jaktra's autonomous AI agent, tokenized debtor portals, and Razorpay settlement."
        canonicalPath="/compare/chaser-alternative"
        jsonLd={[
          chaserCompareSchema,
          breadcrumbSchema([
            { name: "Compare", path: "/compare/chaser-alternative" },
            { name: "Chaser Alternative", path: "/compare/chaser-alternative" },
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
              <Link to="/compare" className="text-zinc-400 hover:text-zinc-300 transition-colors">
                Compare
              </Link>
            </li>
            <li>/</li>
            <li className="text-zinc-300 font-medium" aria-current="page">
              Chaser Alternative
            </li>
          </ol>
        </nav>

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-3">
            Autonomous AI Agent vs. Traditional Scheduled Dunning
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-5 leading-tight">
            The Modern Chaser Alternative with Autonomous AI Tone Modulation
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
            Chaser relies on rigid email schedules and manual phone call logging. Jaktra is an autonomous AI collections
            agent that dynamically modulates tone, triages inbound disputes, and settles payments instantly.
          </p>
        </div>

        {/* Comparison Overview Section */}
        <section className="mb-16">
          <div className="max-w-3xl mb-8">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-2">
              Operational Paradigm
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              The Architectural Difference: Automated Schedules vs. Autonomous Execution
            </h2>
            <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
              Why leading finance teams transition from manual telephone logs and rigid templates to closed-loop autonomous collections.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 sm:p-8 rounded-2xl bg-[#111113] border border-white/[0.08] shadow-lg">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400 mb-3">
                <span className="w-2 h-2 rounded-full bg-zinc-500" />
                The Chaser Approach: Static Rules &amp; Manual Tasks
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Static Email Drips &amp; Manual Call Trackers
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Chaser automates the dispatch of static email templates at fixed intervals (e.g. 7 days, 14 days) and provides a task log for human collectors to log manual phone calls. When disputes arise, staff must manually monitor inboxes and pause campaigns by hand.
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-2xl bg-[#111113] border border-white/[0.08] shadow-lg">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-[#b7d2f8] mb-3">
                <span className="w-2 h-2 rounded-full bg-[#b7d2f8]" />
                The Jaktra Approach: Closed-Loop Autonomous AI
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Predictive Risk &amp; 5-Stage Generative Modulation
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                Jaktra combines predictive ML delinquency scoring with Groq LLaMA 3.1 generative tone escalation. It handles customer communication across 5 stages, automatically halts outreach when disputes are detected, and collects payments through zero-login tokenized debtor portals.
              </p>
            </div>
          </div>
        </section>

        {/* Detailed Comparison Table */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold text-white text-center mb-4">Head-to-Head Architectural Comparison</h2>
          <p className="text-center text-sm text-zinc-400 mb-8 max-w-2xl mx-auto">
            Compare operational models, AI capabilities, and debtor experiences side by side.
          </p>

          <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#111113] shadow-sm">
            <table className="w-full text-left border-collapse text-sm min-w-[680px]">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.03] text-xs font-mono uppercase tracking-wider text-zinc-300">
                  <th className="py-4 px-6 font-semibold">Capability</th>
                  <th className="py-4 px-6 text-[#b7d2f8] font-bold bg-[#b7d2f8]/10 border-l border-[#b7d2f8]/20">Jaktra (Autonomous AI)</th>
                  <th className="py-4 px-6 text-zinc-400 font-semibold">Chaser</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                <tr className="hover:bg-white/[0.015] transition-colors">
                  <td className="py-4 px-6 text-white font-medium">Outreach Tone Engine</td>
                  <td className="py-4 px-6 text-zinc-100 font-medium bg-[#b7d2f8]/[0.03] border-l border-[#b7d2f8]/20">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 shrink-0 text-[#b7d2f8]" />
                      <span>Autonomous Groq LLaMA 3.1 5-Stage Tone Modulation</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-zinc-400">Static rule-based text templates</td>
                </tr>
                <tr className="hover:bg-white/[0.015] transition-colors">
                  <td className="py-4 px-6 text-white font-medium">Dispute Sentiment Triage</td>
                  <td className="py-4 px-6 text-zinc-100 font-medium bg-[#b7d2f8]/[0.03] border-l border-[#b7d2f8]/20">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 shrink-0 text-[#b7d2f8]" />
                      <span>NLP classifier; auto-pauses cadences; drafts response</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-zinc-400">Manual inbox triage and manual sequence pausing</td>
                </tr>
                <tr className="hover:bg-white/[0.015] transition-colors">
                  <td className="py-4 px-6 text-white font-medium">Debtor Payment Flow</td>
                  <td className="py-4 px-6 text-zinc-100 font-medium bg-[#b7d2f8]/[0.03] border-l border-[#b7d2f8]/20">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 shrink-0 text-[#b7d2f8]" />
                      <span>Tokenized link (<code className="text-xs font-mono text-[#b7d2f8] bg-white/[0.05] px-1.5 py-0.5 rounded">/i/:token</code>) with Razorpay &amp; installment plans</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-zinc-400">Redirects to generic payment link or bank transfer</td>
                </tr>
                <tr className="hover:bg-white/[0.015] transition-colors">
                  <td className="py-4 px-6 text-white font-medium">Phone Collection Model</td>
                  <td className="py-4 px-6 text-zinc-100 font-medium bg-[#b7d2f8]/[0.03] border-l border-[#b7d2f8]/20">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 shrink-0 text-[#b7d2f8]" />
                      <span>Autonomous digital outreach minimizes manual phone chasing</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-zinc-400">Task logger for human collectors to make manual calls</td>
                </tr>
                <tr className="hover:bg-white/[0.015] transition-colors">
                  <td className="py-4 px-6 text-white font-medium">Overdue Escalation Limit</td>
                  <td className="py-4 px-6 text-zinc-100 font-medium bg-[#b7d2f8]/[0.03] border-l border-[#b7d2f8]/20">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 shrink-0 text-[#b7d2f8]" />
                      <span>Stage 5 Legal Stop (Automation cutoff at 31+ days)</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-zinc-400">Loops email templates until manually cancelled</td>
                </tr>
                <tr className="hover:bg-white/[0.015] transition-colors">
                  <td className="py-4 px-6 text-white font-medium">Spam Prevention</td>
                  <td className="py-4 px-6 text-zinc-100 font-medium bg-[#b7d2f8]/[0.03] border-l border-[#b7d2f8]/20">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 shrink-0 text-[#b7d2f8]" />
                      <span>20-Hour Rolling Idempotency Guard</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-zinc-400">Triggered on fixed day schedules</td>
                </tr>
                <tr className="hover:bg-white/[0.015] transition-colors">
                  <td className="py-4 px-6 text-white font-medium">Transparent Free-to-Start Pricing</td>
                  <td className="py-4 px-6 text-zinc-100 font-medium bg-[#b7d2f8]/[0.03] border-l border-[#b7d2f8]/20">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 shrink-0 text-[#b7d2f8]" />
                      <span>100% Free during Early Access (No credit card required)</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-zinc-400">Paid tiers only; no free forever tier</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 4 Architectural Moats (Open Scannable Grid) */}
        <section className="mb-20">
          <div className="text-center mb-10">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-2">
              Autonomous Moats
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              4 Structural Advantages of Modern Autonomous Collections
            </h2>
            <p className="text-sm text-zinc-400 max-w-xl mx-auto mt-2">
              The architectural pillars that distinguish Jaktra&apos;s closed-loop AI execution from Chaser&apos;s static templates.
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
                    AI Communications
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  Generative Tone Modulation vs. Static Templates
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-4">
                  Traditional tools like Chaser force you to compose rigid, static email templates that get sent out on pre-fixed day counts. Jaktra&apos;s Groq LLaMA 3.1 agent dynamically tailors every single communication to the buyer&apos;s payment history, invoice size, and delinquency risk score across 5 psychological tiers.
                </p>
              </div>
              <div className="text-xs text-zinc-300 flex items-center gap-1.5 pt-3 border-t border-white/[0.05]">
                <Check className="w-3.5 h-3.5 text-[#b7d2f8]" />
                <span>Shortens payment lag by 15–25 days without sounding robotic</span>
              </div>
            </div>

            <div className="p-6 sm:p-7 rounded-2xl bg-[#111113] border border-white/[0.08] shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8]">
                    <Zap className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-white/[0.04] border border-white/[0.08] text-[#b7d2f8]">
                    Dispute Safeguard
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  Autonomous Dispute Triage &amp; Immediate Cadence Freeze
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-4">
                  When a debtor replies with a billing question, wrong PO note, or partial delivery dispute, traditional mailers keep blindly blasting reminders until a human spots the email. Jaktra&apos;s DisputeAgent parses incoming replies instantly, categorizes sentiment, immediately freezes active dunning schedules, and drafts an AI suggested resolution.
                </p>
              </div>
              <div className="text-xs text-zinc-300 flex items-center gap-1.5 pt-3 border-t border-white/[0.05]">
                <Check className="w-3.5 h-3.5 text-[#b7d2f8]" />
                <span>Prevents relationship-damaging notices to customers with active queries</span>
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
                  Tokenized Zero-Login Debtor Portals (<code className="text-xs font-mono">/i/:token</code>)
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-4">
                  Forget attachments lost in spam or clunky portals requiring accounts and forgotten passwords. Jaktra issues cryptographic debtor links. Accounts Payable contacts open a single-view statement of account, choose instant settlement via Razorpay (UPI, NetBanking, Cards), or request self-service installment plans in 30 seconds.
                </p>
              </div>
              <div className="text-xs text-zinc-300 flex items-center gap-1.5 pt-3 border-t border-white/[0.05]">
                <Check className="w-3.5 h-3.5 text-[#b7d2f8]" />
                <span>Automated webhook reconciliation updates your books instantly upon settlement</span>
              </div>
            </div>

            <div className="p-6 sm:p-7 rounded-2xl bg-[#111113] border border-white/[0.08] shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8]">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-white/[0.04] border border-white/[0.08] text-[#b7d2f8]">
                    Enterprise Governance
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  Hardcoded Stage 5 Legal Stop &amp; 20-Hour Idempotency Guard
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-4">
                  Unlike loop-based auto-reminders that can trigger harassment violations, Jaktra imposes a strict Stage 5 Legal Stop at 31+ days overdue. Collection outreach halts automatically, handing the account over to human management for debt recovery or legal review, backed by a 20-hour rolling idempotency guard.
                </p>
              </div>
              <div className="text-xs text-zinc-300 flex items-center gap-1.5 pt-3 border-t border-white/[0.05]">
                <Check className="w-3.5 h-3.5 text-[#b7d2f8]" />
                <span>Enterprise-grade regulatory governance built directly into the engine</span>
              </div>
            </div>
          </div>
        </section>

        {/* Objective Decision Guide */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <div className="rounded-2xl border border-white/[0.08] bg-[#111113] p-6 sm:p-7">
            <h3 className="text-base font-semibold text-zinc-300 mb-3">When Chaser is the Right Choice</h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-400">
              <li className="flex items-start gap-2">
                <span className="text-zinc-500 font-mono">•</span>
                <span>Your credit control team conducts phone calls and requires an integrated call logging and task tracking workflow.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-zinc-500 font-mono">•</span>
                <span>You want scheduled email reminders based on fixed day counts (e.g. +7, +14, +21 days).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-zinc-500 font-mono">•</span>
                <span>You prefer an established Xero/QuickBooks ecosystem app with manual credit control notes.</span>
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-white/[0.12] bg-[#111113] p-6">
            <h3 className="text-base font-semibold text-white mb-3">When Jaktra is the Right Architectural Fit</h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-300">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#b7d2f8] shrink-0 mt-0.5" />
                <span>You want autonomous AI execution that eliminates manual phone calling lists and generates personalized tone-modulated emails.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#b7d2f8] shrink-0 mt-0.5" />
                <span>You want NLP dispute triage that freezes cadences automatically the moment a customer replies with questions.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#b7d2f8] shrink-0 mt-0.5" />
                <span>You want zero-login tokenized payment portals (/i/:token) that let debtors settle immediately or split into installment plans.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#b7d2f8] shrink-0 mt-0.5" />
                <span>You want 100% Free Early Access without credit card requirements or seat-based upsells.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* FAQ Section with outline Accordion */}
        <section className="mb-20">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Frequently Asked Questions</h2>
            <p className="text-sm text-zinc-400">
              Technical and commercial comparisons for finance leaders evaluating Chaser vs Jaktra.
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
            Switch to Modern AI Accounts Receivable
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto mb-6">
            Eliminate manual call tracking and static templates. Start collecting autonomously today with Jaktra.
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
export default ChaserCompare;

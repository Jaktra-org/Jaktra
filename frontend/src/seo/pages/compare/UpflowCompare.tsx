import { Link } from "react-router-dom";
import { Check, ArrowRight, Sparkles, MailX, CreditCard, RefreshCw } from "lucide-react";
import { SEOHead } from "@/seo/components/SEOHead";
import { upflowCompareSchema, breadcrumbSchema } from "@/seo/schemas";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { GlobalNav } from "@/components/common/GlobalNav";
import { SEOHero } from "@/seo/components/SEOHero";
import { ComparisonMatrix, type ComparisonFeature } from "@/seo/components/ComparisonMatrix";
import upflowLogo from "@/assets/competition/upflow.svg";

const UPFLOW_COMPARISON_FEATURES: ComparisonFeature[] = [
  {
    name: "Follow-up Message Generation",
    description: "How overdue notices and debtor reminders are authored.",
    jaktra: true,
    competitor: false,
    jaktraNote: "Autonomous Groq LLaMA 3.1 AI writes custom emails across 5 escalation stages",
    competitorNote: "Scheduled email cadences using pre-written text templates and merge tags",
  },
  {
    name: "Inbound Dispute & Reply Triage",
    description: "What happens when a customer replies questioning an invoice or scope.",
    jaktra: true,
    competitor: false,
    jaktraNote: "NLP classifies disputes, pauses reminders instantly, and drafts a resolution reply",
    competitorNote: "Replies land in shared inbox; requires manual review and manual workflow hold",
  },
  {
    name: "1-Click Payment Settlement",
    description: "How debtors access their invoice and complete payment.",
    jaktra: true,
    competitor: false,
    jaktraNote: "Zero-login token link (/i/:token) with instant Razorpay card or ACH payment",
    competitorNote: "Debtor receives PDF attachment with bank wire instructions or portal login",
  },
  {
    name: "Installment Plan Negotiation",
    description: "Options when a debtor experiences temporary cash flow crunch.",
    jaktra: true,
    competitor: false,
    jaktraNote: "Debtors can split overdue balances into automated 2x–3x structured installments",
    competitorNote: "Requires manual finance team agreement and offline payment coordination",
  },
  {
    name: "Multi-Currency & Consolidated Subsidiary AR",
    description: "Tracking receivables across international entities and currencies.",
    jaktra: false,
    competitor: true,
    jaktraNote: "Single primary ledger currency per workspace",
    competitorNote: "Consolidated multi-subsidiary tracking with live FX rates across global currencies",
  },
  {
    name: "Executive DSO & Cash Flow Forecasting",
    description: "Balance sheet metrics and expected weekly cash inflow modeling.",
    jaktra: false,
    competitor: true,
    jaktraNote: "Operational recovery tracking; no treasury cash flow forecasting",
    competitorNote: "Aging waterfall charts, DSO trends, CEI metrics, and predictive cash forecasts",
  },
  {
    name: "Cross-Department Collaboration (Sales / AE Tagging)",
    description: "Internal communication between finance and sales account owners.",
    jaktra: false,
    competitor: true,
    jaktraNote: "Direct collections automation for finance teams without CRM chat",
    competitorNote: "Internal invoice notes, AE tagging, and account exclusion rules for VIP deals",
  },
  {
    name: "Native Accounting & ERP 2-Way Sync",
    description: "Direct pre-built integrations with core financial software.",
    jaktra: false,
    competitor: true,
    jaktraNote: "Instant CSV upload, developer webhooks, and REST API",
    competitorNote: "Native bidirectional sync with NetSuite SuiteApp, QuickBooks, Xero & Stripe Billing",
  },
  {
    name: "Time to Launch & Setup",
    description: "Time required from account signup to live automated follow-ups.",
    jaktra: "15 Minutes (Self-Serve)",
    competitor: "2 to 4 Weeks (Guided)",
    jaktraNote: "Upload a CSV or connect a webhook with zero setup fees",
    competitorNote: "Requires sales demos, scoping, and guided ERP connector onboarding",
  },
  {
    name: "Pricing Structure",
    description: "Software licensing model and contract commitments.",
    jaktra: "100% Free during Early Access",
    competitor: "Quote-based (~$5k–$15k+/yr)",
    jaktraNote: "Full platform features unlocked with zero credit card required",
    competitorNote: "Annual contract commitment scaled to gross invoiced revenue volume",
  },
];

export function UpflowCompare() {
  const faqs = [
    {
      q: "How does Jaktra differ fundamentally from Upflow?",
      a: "Upflow focuses on collaborative accounts receivable reporting, cross-department sales/finance workflows, and scheduled email cadences. Jaktra is an autonomous collections execution engine: powered by Groq LLaMA 3.1, Jaktra dynamically modulates email tone across 5 escalation stages, automatically classifies and triages inbound dispute replies, halts cadences when questions arise, and provides zero-login tokenized payment links (/i/:token) for friction-free settlement.",
    },
    {
      q: "How does Jaktra's 5-stage AI tone escalation compare to Upflow's email cadences?",
      a: "In Upflow, teams configure rules-based email sequences with static templates triggered on calendar dates. In Jaktra, an autonomous AI agent drafts contextual messaging across 5 distinct urgency tiers (Warm Reminder → Firm Follow-Up → Serious Notice → Stern Demand → Legal Stop) tailored to debtor aging, transaction size, and historical payment behavior.",
    },
    {
      q: "What happens when a customer replies with a billing question or dispute?",
      a: "In Upflow, replies arrive in a shared inbox where finance team members manually review emails and pause workflows by hand. In Jaktra, our DisputeAgent automatically classifies inbound email sentiment into disputes, questions, or payment commitments. When a dispute is detected, the collection cadence is automatically paused, and an AI-drafted resolution response is prepared for finance review.",
    },
    {
      q: "Can I use Jaktra alongside our current ERP without long implementation?",
      a: "Yes. Jaktra allows you to import open invoices via CSV or REST API webhooks in under 15 minutes, with zero ERP migration or multi-week systems integration required.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#010102] text-[#f7f8f8] font-sans antialiased selection:bg-[#5e6ad2]/30 selection:text-white">
      <SEOHead
        title="Jaktra vs Upflow: Which AR Platform Fits Your Team? | Jaktra"
        description="An objective side-by-side comparison of Upflow and Jaktra. Compare dunning workflows, automated dispute triage, payment friction, and pricing models."
        canonicalPath="/compare/jaktra-vs-upflow"
        jsonLd={[
          upflowCompareSchema,
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Compare", path: "/compare" },
            { name: "Jaktra vs Upflow", path: "/compare/jaktra-vs-upflow" },
          ]),
        ]}
      />

      <GlobalNav />

      <main className="pb-24">
        {/* SEO Hero Masthead */}
        <SEOHero
          badge="Platform Comparison"
          badgeDotColor="bg-[#b7d2f8]"
          breadcrumbs={[
            { name: "Home", path: "/" },
            { name: "Compare", path: "/compare" },
            { name: "Jaktra vs Upflow", path: "/compare/jaktra-vs-upflow" },
          ]}
          title="Jaktra vs Upflow: Which AR Platform Fits Your Team?"
          description="Upflow helps finance teams track DSO and schedule email reminders. Jaktra handles the actual collection work—resolving customer disputes, adjusting tone automatically, and collecting payments in one click."
        />

        <div className="seo-container space-y-16">
          {/* Comparison Matrix Table */}
          <ComparisonMatrix
            competitorName="Upflow"
            competitorLogo={upflowLogo}
            features={UPFLOW_COMPARISON_FEATURES}
          />

          {/* Architectural Shift Overview */}
          <section className="bg-[#0e0f11] border border-white/[0.08] rounded-xl p-6 sm:p-8">
            <div className="max-w-3xl mb-6">
              <span className="text-xs font-mono uppercase tracking-wider text-[#b7d2f8] block mb-1">
                Architectural Evolution
              </span>
              <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                The Paradigm Shift: From Static Dunning Rules to Autonomous AI
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                Why forward-thinking finance teams are replacing rigid calendar triggers with closed-loop autonomous agents.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-xl bg-[#0f1011] border border-[#23252a]">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#8a8f98] mb-2">
                  <span className="w-2 h-2 rounded-full bg-[#8a8f98]" />
                  Legacy Model: Static Drip Rules
                </div>
                <h3 className="text-sm font-semibold text-[#f7f8f8] mb-2">Rigid Template Schedules</h3>
                <p className="text-xs text-[#8a8f98] leading-relaxed">
                  Traditional tools rely on calendar-driven drip templates: &ldquo;Send Template A at Day 7, Template B at Day 14.&rdquo; They cannot adapt tone to customer relationship depth, cannot understand inbound dispute replies, and risk damaging commercial goodwill by blasting automated reminders while an accounting discrepancy is unresolved.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-[#0f1011] border border-[#23252a]">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#828fff] mb-2">
                  <span className="w-2 h-2 rounded-full bg-[#5e6ad2]" />
                  Modern Model: Jaktra Autonomous AI
                </div>
                <h3 className="text-sm font-semibold text-[#f7f8f8] mb-2">Closed-Loop Autonomous Agent</h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Jaktra combines predictive ML risk scoring with <strong>Groq LLaMA 3.1 generative tone modulation</strong>. It crafts unique messaging across 5 urgency stages, automatically pauses sequences when an inbound dispute is detected, guarantees delivery via Dead Letter Queues, and collects instant payments through tokenized debtor portals.
                </p>
              </div>
            </div>
          </section>

          {/* 4 Architectural Differentiators Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="rounded-xl border border-white/[0.08] bg-[#0e0f11] p-6">
              <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4 text-[#b7d2f8]">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">Groq LLaMA 3.1 Generative Tone Modulation</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Instead of sending canned, impersonal templates, Jaktra generates dynamic emails across 5 distinct urgency stages tailored to debtor aging, payment history, and risk score.
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-[#0e0f11] p-6">
              <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4 text-[#b7d2f8]">
                <RefreshCw className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">Automatic Inbound Dispute Triage</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                When a customer queries an invoice item, our NLP sentiment classifier immediately pauses collection reminders, logs a dispute ticket, and drafts an executive resolution.
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-[#0e0f11] p-6">
              <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4 text-[#b7d2f8]">
                <CreditCard className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">Zero-Login Debtor Portals</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Debtors receive a secure tokenized link (<code className="text-[11px] font-mono text-[#b7d2f8]">/i/:token</code>) with no password friction, allowing 1-click Razorpay checkout and flexible 2x–3x installment plans.
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-[#0e0f11] p-6">
              <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4 text-[#b7d2f8]">
                <MailX className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">Dead Letter Queue (DLQ) Delivery SLA</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Unlike simple mailers that bounce silently, Jaktra’s DLQ isolates deliverability failures, triggers exponential retry policies, and alerts finance before delays compound.
              </p>
            </div>
          </section>

          {/* Objective Decision Guide */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-white/[0.08] bg-[#0e0f11] p-6">
              <h3 className="text-sm font-semibold text-zinc-300 mb-3">When Upflow is the Right Fit</h3>
              <ul className="space-y-2.5 text-xs text-zinc-400">
                <li className="flex items-start gap-2">
                  <span className="text-zinc-600 font-mono">&bull;</span>
                  <span>You have dedicated human credit controllers who collaborate across shared team inboxes.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-zinc-600 font-mono">&bull;</span>
                  <span>You want fixed, calendar-based dunning sequences with visual drag-and-drop workflow builders.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-zinc-600 font-mono">&bull;</span>
                  <span>You have an established budget for sales-contracted software ($500–$2,000+/mo).</span>
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-white/[0.12] bg-[#0e0f11] p-6 ring-1 ring-white/10">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <span>When Jaktra is the Right Fit</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Recommended
                </span>
              </h3>
              <ul className="space-y-2.5 text-xs text-zinc-300">
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#b7d2f8] shrink-0 mt-0.5" />
                  <span>You want autonomous AI execution that recovers cash without adding headcount.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#b7d2f8] shrink-0 mt-0.5" />
                  <span>You need NLP dispute triage that immediately pauses outreach when billing questions arise.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#b7d2f8] shrink-0 mt-0.5" />
                  <span>You want 15-minute onboarding and 100% Free Early Access with zero sales gatekeeping.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* FAQ Section */}
          <section>
            <div className="text-center mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2">Frequently Asked Questions</h2>
              <p className="text-xs sm:text-sm text-zinc-400">
                Key differences for finance leaders evaluating Jaktra vs Upflow.
              </p>
            </div>
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" variant="outline" defaultValue="faq-0" collapsible className="w-full">
                {faqs.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`}>
                    <AccordionTrigger className="text-left font-medium text-white text-sm">
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

          {/* Final Call to Action */}
          <section className="rounded-2xl border border-white/[0.08] bg-[#0e0f11] p-8 sm:p-12 text-center shadow-xl">
            <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-3 tracking-tight">
              Upgrade to Autonomous AI Collections
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto mb-6 leading-relaxed">
              Stop sending static, repetitive dunning templates. Accelerate cash recovery while safeguarding client goodwill with Jaktra.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition-colors shadow-lg group min-h-[44px]"
              >
                <span>Start Autonomous Collections Free</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                to="/compare"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-medium text-zinc-300 transition-colors min-h-[44px]"
              >
                <span>View All Competitor Comparisons</span>
              </Link>
            </div>
          </section>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}

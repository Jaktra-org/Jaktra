import { Link } from "react-router-dom";
import { Check, ArrowRight, ShieldCheck, Bot, CreditCard, RefreshCw } from "lucide-react";
import { SEOHead } from "@/seo/components/SEOHead";
import { kollenoCompareSchema, breadcrumbSchema } from "@/seo/schemas";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { GlobalNav } from "@/components/common/GlobalNav";
import { SEOHero } from "@/seo/components/SEOHero";
import { ComparisonMatrix, type ComparisonFeature } from "@/seo/components/ComparisonMatrix";
import kollenoLogo from "@/assets/competition/kolleno.png";

const KOLLENO_COMPARISON_FEATURES: ComparisonFeature[] = [
  {
    name: "Collection Execution Model",
    description: "How accounts receivable outreach is authored and executed.",
    jaktra: true,
    competitor: false,
    jaktraNote: "Autonomous Groq LLaMA 3.1 AI executes written outreach and tone escalation without extra staff",
    competitorNote: "Creates daily task worklists for human credit controllers to review & dial",
  },
  {
    name: "Inbound Dispute & Reply Triage",
    description: "Behavior when a customer replies questioning fees or invoice scope.",
    jaktra: true,
    competitor: false,
    jaktraNote: "NLP classifies disputes, pauses reminders instantly, and drafts a resolution reply",
    competitorNote: "Tickets route to collector inbox; requires manual review and hold assignment",
  },
  {
    name: "1-Click Payment Settlement",
    description: "How debtors access their invoice and complete payment.",
    jaktra: true,
    competitor: false,
    jaktraNote: "Zero-login token link (/i/:token) with instant Razorpay card or ACH payment",
    competitorNote: "Buyer portal requiring user login credentials or offline bank transfer",
  },
  {
    name: "Installment Plan Negotiation",
    description: "Options when a debtor experiences temporary cash flow crunch.",
    jaktra: true,
    competitor: false,
    jaktraNote: "Debtors can autonomously split overdue balances into automated 2x–3x structured installments",
    competitorNote: "Requires manual phone/email negotiation by human credit controller",
  },
  {
    name: "Omnichannel Softphone (VoIP Dialing & Recording)",
    description: "Browser softphone for human collectors to make and record calls.",
    jaktra: false,
    competitor: true,
    jaktraNote: "Autonomous digital execution engine; no manual call center telephony",
    competitorNote: "Built-in browser dialer, auto-call logging, call recording, and WhatsApp queues",
  },
  {
    name: "Automated Cash Application & Bank Reconciliation",
    description: "Matching incoming bank wire payments to open invoices.",
    jaktra: false,
    competitor: true,
    jaktraNote: "Collection recovery focus; final reconciliation handled by accounting system",
    competitorNote: "Auto-matches incoming bank transactions to open invoices using ML rules",
  },
  {
    name: "Collector Leaderboards & Headcount Tracking",
    description: "Tracking productivity metrics for individual human collectors.",
    jaktra: false,
    competitor: true,
    jaktraNote: "Engineered for autonomous recovery without expanding collector headcount",
    competitorNote: "Tracks calls dialed, emails sent, and recovery targets per credit controller",
  },
  {
    name: "Enterprise ERP & Salesforce CRM 2-Way Sync",
    description: "Deep enterprise system integration.",
    jaktra: false,
    competitor: true,
    jaktraNote: "CSV uploads, developer REST API, and inbound webhook sync",
    competitorNote: "Native bidirectional connectors for NetSuite, Sage Intacct, and Salesforce CRM",
  },
  {
    name: "Time to Launch & Setup",
    description: "Time required to go live.",
    jaktra: "15 Minutes (Self-Serve)",
    competitor: "3 to 6 Weeks (Enterprise)",
    jaktraNote: "Instant CSV or webhook sync with zero setup fees",
    competitorNote: "Custom enterprise onboarding, user training, and systems integration",
  },
  {
    name: "Pricing Structure",
    description: "Cost model and contract terms.",
    jaktra: "100% Free during Early Access",
    competitor: "Quote-based (~£650–£1,250/seat/mo)",
    jaktraNote: "Full enterprise platform unlocked with zero commitments",
    competitorNote: "Annual enterprise contracts + per-user collector seat licenses",
  },
];

export function KollenoCompare() {
  const faqs = [
    {
      q: "What is the primary difference between Kolleno and Jaktra?",
      a: "Kolleno is a collaborative AR workspace that organizes multi-channel tasks (phone calls, SMS, emails) for human credit control teams. Jaktra is an autonomous AI agent: instead of giving human collectors longer to-do lists, Jaktra autonomously drafts dynamic communications, classifies inbound disputes, freezes cadences when issues arise, and provides zero-login tokenized payment portals.",
    },
    {
      q: "Does Jaktra require a large finance team to operate?",
      a: "No. Jaktra is specifically engineered for lean finance teams and growing businesses that want enterprise-grade collection automation without hiring additional credit controllers or billing clerks.",
    },
    {
      q: "How does Jaktra ensure safe automated communications?",
      a: "Jaktra includes strict institutional guardrails: a 20-hour rolling idempotency guard to prevent overlapping emails, automatic dispute detection that freezes reminders when clients ask questions, and a hardcoded Stage 5 Legal Stop that prevents AI from sending rogue notices on heavily overdue accounts.",
    },
    {
      q: "How does Jaktra's pricing compare to Kolleno?",
      a: "Kolleno typically charges high monthly subscriptions ($1,000–$3,500+/mo) with annual commitments and seat licenses. Jaktra is 100% free during our public Early Access program with all features unlocked.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#010102] text-[#f7f8f8] font-sans antialiased selection:bg-[#5e6ad2]/30 selection:text-white">
      <SEOHead
        title="Jaktra vs Kolleno: AR Credit Control Comparison | Jaktra"
        description="Compare Kolleno vs Jaktra. Evaluate omnichannel credit control task queues against autonomous AI tone escalation and zero-login debtor payment portals."
        canonicalPath="/compare/jaktra-vs-kolleno"
        jsonLd={[
          kollenoCompareSchema,
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Compare", path: "/compare" },
            { name: "Jaktra vs Kolleno", path: "/compare/jaktra-vs-kolleno" },
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
            { name: "Jaktra vs Kolleno", path: "/compare/jaktra-vs-kolleno" },
          ]}
          title="Jaktra vs Kolleno: Collector Task Queues vs Autonomous AI"
          description="Kolleno organizes phone calls and email queues for dedicated credit controllers. Jaktra handles collections end-to-end autonomously—recovering overdue invoices without requiring you to hire extra staff."
        />

        <div className="seo-container space-y-16">
          {/* Comparison Matrix Table */}
          <ComparisonMatrix
            competitorName="Kolleno"
            competitorLogo={kollenoLogo}
            features={KOLLENO_COMPARISON_FEATURES}
          />

          {/* 4 Architectural Differentiators Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="rounded-xl border border-[#23252a] bg-[#0f1011] p-6">
              <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-[#23252a] flex items-center justify-center mb-4 text-[#606cd2]">
                <Bot className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">Autonomous Agent Execution</h3>
              <p className="text-xs text-[#8a8f98] leading-relaxed">
                While Kolleno assigns manual follow-up tasks to human team members, Jaktra executes outreach autonomously, freeing your finance staff from repetitive chasing.
              </p>
            </div>

            <div className="rounded-xl border border-[#23252a] bg-[#0f1011] p-6">
              <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-[#23252a] flex items-center justify-center mb-4 text-[#606cd2]">
                <RefreshCw className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">Automated Dispute Sentiment Triage</h3>
              <p className="text-xs text-[#8a8f98] leading-relaxed">
                When a customer queries an invoice item, Jaktra’s NLP classifier instantly halts reminders, logs a dispute ticket, and drafts an executive resolution.
              </p>
            </div>

            <div className="rounded-xl border border-[#23252a] bg-[#0f1011] p-6">
              <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-[#23252a] flex items-center justify-center mb-4 text-[#606cd2]">
                <CreditCard className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">Tokenized Zero-Login Settlement</h3>
              <p className="text-xs text-[#8a8f98] leading-relaxed">
                Debtors click directly into <code className="text-[11px] font-mono text-[#606cd2]">/i/:token</code> without passwords, allowing 1-click Razorpay checkout and flexible installment options.
              </p>
            </div>

            <div className="rounded-xl border border-[#23252a] bg-[#0f1011] p-6">
              <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-[#23252a] flex items-center justify-center mb-4 text-[#606cd2]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">Stage 5 Hard Legal Stop</h3>
              <p className="text-xs text-[#8a8f98] leading-relaxed">
                Autonomous communications strictly halt at D+46 to protect compliance, automatically compiling an audit trail for legal counsel review.
              </p>
            </div>
          </section>

          {/* Objective Decision Guide */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-[#23252a] bg-[#0f1011] p-6">
              <h3 className="text-sm font-semibold text-zinc-300 mb-3">When Kolleno is the Right Fit</h3>
              <ul className="space-y-2.5 text-xs text-[#8a8f98]">
                <li className="flex items-start gap-2">
                  <span className="text-zinc-600 font-mono">&bull;</span>
                  <span>You have a dedicated team of human credit controllers who need shared call lists and task queues.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-zinc-600 font-mono">&bull;</span>
                  <span>You want manual omnichannel workflows including manual SMS and phone call notes.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-zinc-600 font-mono">&bull;</span>
                  <span>You have an enterprise software budget of $1,000–$3,500+/mo and require custom onboarding.</span>
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-[#23252a] bg-[#0f1011] p-6 ring-1 ring-white/10">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <span>When Jaktra is the Right Fit</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Recommended
                </span>
              </h3>
              <ul className="space-y-2.5 text-xs text-zinc-300">
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#606cd2] shrink-0 mt-0.5" />
                  <span>You want autonomous AI execution that recovers cash without adding human headcount.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#606cd2] shrink-0 mt-0.5" />
                  <span>You need NLP dispute triage that catches customer pushback and freezes cadences.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#606cd2] shrink-0 mt-0.5" />
                  <span>You want 15-minute onboarding and 100% Free Early Access with zero sales friction.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* FAQ Section */}
          <section>
            <div className="text-center mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2">Frequently Asked Questions</h2>
              <p className="text-xs sm:text-sm text-[#8a8f98]">
                Evaluating manual task queues vs autonomous AI collections.
              </p>
            </div>
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" variant="outline" defaultValue="faq-0" collapsible className="w-full">
                {faqs.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`} className="border-[#23252a] bg-[#0f1011] rounded-lg mb-2">
                    <AccordionTrigger className="text-left font-medium text-white text-sm px-4">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-[#8a8f98] text-xs sm:text-sm leading-relaxed px-4">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>

          {/* Final Call to Action */}
          <section className="rounded-2xl border border-[#23252a] bg-[#0f1011] p-8 sm:p-12 text-center shadow-xl">
            <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-3 tracking-tight">
              Upgrade to Autonomous AI Collections
            </h2>
            <p className="text-xs sm:text-sm text-[#8a8f98] max-w-xl mx-auto mb-6 leading-relaxed">
              Stop burdening your team with manual collector task queues. Let Jaktra autonomously recover cash with dynamic tone escalation and dispute triage.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#5e6ad2] text-white text-xs font-semibold hover:bg-[#525ec2] transition-colors shadow-lg group min-h-[44px]"
              >
                <span>Start Autonomous Collections Free</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                to="/compare"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-[#23252a] text-xs font-medium text-zinc-300 transition-colors min-h-[44px]"
              >
                <span>View All Competitors</span>
              </Link>
            </div>
          </section>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}

export default KollenoCompare;

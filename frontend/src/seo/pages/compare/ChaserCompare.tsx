import { Link } from "react-router-dom";
import { Check, ArrowRight, ShieldCheck, Zap, CreditCard, RefreshCw } from "lucide-react";
import { SEOHead } from "@/seo/components/SEOHead";
import { chaserCompareSchema, breadcrumbSchema } from "@/seo/schemas";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { GlobalNav } from "@/components/common/GlobalNav";
import { SEOHero } from "@/seo/components/SEOHero";
import { ComparisonMatrix, type ComparisonFeature } from "@/seo/components/ComparisonMatrix";
import chaserLogo from "@/assets/competition/chaser.png";

const CHASER_COMPARISON_FEATURES: ComparisonFeature[] = [
  {
    name: "Follow-up Message Generation",
    description: "How overdue notices and debtor reminders are authored.",
    jaktra: true,
    competitor: false,
    jaktraNote: "Autonomous Groq LLaMA 3.1 AI writes custom emails across 5 escalation stages",
    competitorNote: "Scheduled email cadences using pre-written static text and merge tags",
  },
  {
    name: "Inbound Dispute & Reply Triage",
    description: "What happens when a customer replies questioning an invoice or scope.",
    jaktra: true,
    competitor: false,
    jaktraNote: "NLP classifies disputes, pauses reminders instantly, and drafts a resolution reply",
    competitorNote: "Chronological inbox feed requires human credit controller to manually tag & pause",
  },
  {
    name: "1-Click Payment Settlement",
    description: "How debtors access their invoice and complete payment.",
    jaktra: true,
    competitor: false,
    jaktraNote: "Zero-login token link (/i/:token) with instant Razorpay card or ACH payment",
    competitorNote: "Redirects to Chaser Pay portal or displays static bank wire details",
  },
  {
    name: "Installment Plan Negotiation",
    description: "Options when a debtor experiences temporary cash flow crunch.",
    jaktra: true,
    competitor: false,
    jaktraNote: "Debtors can split overdue balances into automated 2x–3x structured installments",
    competitorNote: "Requires manual finance team agreement and offline payment schedule tracking",
  },
  {
    name: "Live Credit Checking & Bureau Scores",
    description: "Evaluating customer financial health before extending trade terms.",
    jaktra: false,
    competitor: true,
    jaktraNote: "Internal debtor payment behavior risk scoring only",
    competitorNote: "Integrated Creditsafe business credit reports and live financial health checks",
  },
  {
    name: "Physical Postal Letters Dispatch",
    description: "Sending physical paper letters for formal legal demand.",
    jaktra: false,
    competitor: true,
    jaktraNote: "Digital-only delivery via email & tokenized links",
    competitorNote: "Direct postal mail printing and Royal Mail dispatch from within the app",
  },
  {
    name: "Outsourced Debt Collection Partner",
    description: "In-app escalation to licensed third-party collection agencies.",
    jaktra: false,
    competitor: true,
    jaktraNote: "Software-only autonomous conversational AI negotiation",
    competitorNote: "In-app referral to licensed third-party debt collection agency partner",
  },
  {
    name: "Native Accounting 2-Way Sync",
    description: "Direct accounting platform synchronization.",
    jaktra: false,
    competitor: true,
    jaktraNote: "Instant CSV upload, developer webhooks, and REST API",
    competitorNote: "Direct bidirectional sync with Xero, QuickBooks Online, and Sage 50/Cloud",
  },
  {
    name: "Time to Launch & Setup",
    description: "Time required to activate live collections.",
    jaktra: "15 Minutes (Self-Serve)",
    competitor: "1 to 3 Days",
    jaktraNote: "Instant CSV or webhook sync with zero setup fees",
    competitorNote: "Requires template creation, cadence setup, and schedule configuration",
  },
  {
    name: "Pricing Structure",
    description: "Software licensing model and contract terms.",
    jaktra: "100% Free during Early Access",
    competitor: "£199 to £899+/month",
    jaktraNote: "Full platform features unlocked with zero credit card required",
    competitorNote: "Revenue-tiered subscription with user seat and credit check limits",
  },
];

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
      q: "How does dispute handling differ between Chaser's Chase Feed and Jaktra?",
      a: "Chaser aggregates debtor replies into a chronological 'Chase Feed' timeline, leaving the heavy lifting of reading inbound emails, tagging query categories, and halting reminder schedules entirely to human credit controllers. If an inbound message goes unread, Chaser's automated schedules can keep reminding a disgruntled client. Jaktra's NLP classifier inspects incoming email sentiment and intent in real time: when a dispute, missing PO claim, or short-payment reason is detected, Jaktra immediately freezes the dunning sequence, assigns a dispute hold state in the dashboard, and generates a context-aware draft response for finance sign-off.",
    },
    {
      q: "How does debtor payment reconciliation compare to Chaser's payment portals?",
      a: "Chaser relies on integrations with third-party payment gateways like Stripe or directs debtors to static bank wire instructions embedded in invoice templates. Jaktra provides an end-to-end proprietary settlement workflow: every reminder includes an authenticated tokenized link (/i/:token) that opens directly on mobile or desktop without login credentials. Debtors can view invoice line items, calculate automated 2x, 3x, or 4x milestone installment plans on overdue balances, and execute instant clearing through Razorpay (UPI, QR, NetBanking, Credit/Debit cards). Webhook handlers verify transaction signatures (HMAC-SHA256) and reconcile the ledger in real time.",
    },
    {
      q: "How do the pricing models compare?",
      a: "Chaser starts with paid tiers and charges extra for add-on features and collector seats. Jaktra is completely free during our public Early Access program with zero credit card required to start.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#010102] text-[#f7f8f8] font-sans antialiased selection:bg-[#5e6ad2]/30 selection:text-white">
      <SEOHead
        title="Jaktra vs Chaser: AR Collections Tool Comparison | Jaktra"
        description="Compare Chaser vs Jaktra. Discover why finance teams upgrade from manual call logging and static dunning to autonomous AI escalation and debtor portals."
        canonicalPath="/compare/jaktra-vs-chaser"
        jsonLd={[
          chaserCompareSchema,
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Compare", path: "/compare" },
            { name: "Jaktra vs Chaser", path: "/compare/jaktra-vs-chaser" },
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
            { name: "Jaktra vs Chaser", path: "/compare/jaktra-vs-chaser" },
          ]}
          title="Jaktra vs Chaser: Which Collections Tool Fits Your Team?"
          description="Chaser gives credit controllers call lists and templated email schedules. Jaktra works autonomously—writing personalized follow-ups, catching disputes before they escalate, and offering instant 1-click payment links."
        />

        <div className="seo-container space-y-16">
          {/* Comparison Matrix Table */}
          <ComparisonMatrix
            competitorName="Chaser"
            competitorLogo={chaserLogo}
            features={CHASER_COMPARISON_FEATURES}
          />

          {/* 4 Architectural Differentiators Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="rounded-xl border border-[#23252a] bg-[#0f1011] p-6">
              <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-[#23252a] flex items-center justify-center mb-4 text-[#606cd2]">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">Zero Manual Phone Chasing</h3>
              <p className="text-xs text-[#8a8f98] leading-relaxed">
                Rather than forcing your finance team to spend hours cold-calling debtors with a telephone tracker, Jaktra’s autonomous agent resolves overdue invoices digitally with polite, firm escalation.
              </p>
            </div>

            <div className="rounded-xl border border-[#23252a] bg-[#0f1011] p-6">
              <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-[#23252a] flex items-center justify-center mb-4 text-[#606cd2]">
                <RefreshCw className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">Intelligent Dispute Catch</h3>
              <p className="text-xs text-[#8a8f98] leading-relaxed">
                When a customer responds with questions about billable hours or purchase orders, Jaktra automatically freezes automated reminders to protect client relationships and drafts a resolution.
              </p>
            </div>

            <div className="rounded-xl border border-[#23252a] bg-[#0f1011] p-6">
              <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-[#23252a] flex items-center justify-center mb-4 text-[#606cd2]">
                <CreditCard className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">Tokenized Zero-Login Settlement</h3>
              <p className="text-xs text-[#8a8f98] leading-relaxed">
                Debtors click directly into <code className="text-[11px] font-mono text-[#606cd2]">/i/:token</code> to view statements, select flexible 2x–3x installment schedules, and settle via Razorpay with zero password friction.
              </p>
            </div>

            <div className="rounded-xl border border-[#23252a] bg-[#0f1011] p-6">
              <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-[#23252a] flex items-center justify-center mb-4 text-[#606cd2]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">Stage 5 Hard Legal Stop</h3>
              <p className="text-xs text-[#8a8f98] leading-relaxed">
                Autonomous sending strictly freezes at D+46, preventing runaway dunning and automatically compiling an audit trail for legal counsel review.
              </p>
            </div>
          </section>

          {/* Objective Decision Guide */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-[#23252a] bg-[#0f1011] p-6">
              <h3 className="text-sm font-semibold text-zinc-300 mb-3">When Chaser is the Right Fit</h3>
              <ul className="space-y-2.5 text-xs text-[#8a8f98]">
                <li className="flex items-start gap-2">
                  <span className="text-zinc-600 font-mono">&bull;</span>
                  <span>Your team prefers making telephone calls to debtors and needs a manual call activity tracker.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-zinc-600 font-mono">&bull;</span>
                  <span>You rely on static dunning email templates and manual shared inbox routing.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-zinc-600 font-mono">&bull;</span>
                  <span>You want traditional SME accounting integrations with paid monthly subscriptions.</span>
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
                  <span>You want autonomous AI execution that eliminates manual phone chasing entirely.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#606cd2] shrink-0 mt-0.5" />
                  <span>You need automated dispute triage that detects counterparty pushback and pauses cadences.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#606cd2] shrink-0 mt-0.5" />
                  <span>You want 100% Free Early Access with zero per-user or per-invoice fees.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* FAQ Section */}
          <section>
            <div className="text-center mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2">Frequently Asked Questions</h2>
              <p className="text-xs sm:text-sm text-[#8a8f98]">
                Common questions from finance teams comparing Chaser vs Jaktra.
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
              Eliminate Manual Phone Chasing with Jaktra
            </h2>
            <p className="text-xs sm:text-sm text-[#8a8f98] max-w-xl mx-auto mb-6 leading-relaxed">
              Accelerate cash recovery with autonomous AI tone modulation, dispute triage, and instant zero-login settlement.
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
                <span>View All Comparisons</span>
              </Link>
            </div>
          </section>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}

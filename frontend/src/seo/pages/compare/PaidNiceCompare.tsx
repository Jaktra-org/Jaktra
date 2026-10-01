import { Link } from "react-router-dom";
import { Check, ArrowRight, Sparkles, ShieldCheck, CreditCard, Split } from "lucide-react";
import { SEOHead } from "@/seo/components/SEOHead";
import { paidniceCompareSchema, breadcrumbSchema } from "@/seo/schemas";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { GlobalNav } from "@/components/common/GlobalNav";
import { SEOHero } from "@/seo/components/SEOHero";
import { ComparisonMatrix, type ComparisonFeature } from "@/seo/components/ComparisonMatrix";
import paidniceLogo from "@/assets/competition/paidnice.png";

const PAIDNICE_COMPARISON_FEATURES: ComparisonFeature[] = [
  {
    name: "Follow-up Communication Approach",
    description: "How overdue accounts are incentivized and reminded to settle.",
    jaktra: true,
    competitor: false,
    jaktraNote: "Autonomous Groq LLaMA 3.1 AI modulates tone across 5 stages to protect client goodwill",
    competitorNote: "Automated late fee penalty notices and static dunning warnings",
  },
  {
    name: "Inbound Dispute & Reply Triage",
    description: "Action taken when customer replies with a billing question or scope issue.",
    jaktra: true,
    competitor: false,
    jaktraNote: "NLP classifies disputes, pauses reminders instantly, and drafts a resolution reply",
    competitorNote: "No sentiment parsing; continues applying late fees until manually stopped in Xero/QBO",
  },
  {
    name: "1-Click Payment Settlement",
    description: "How debtors access their invoice and complete payment.",
    jaktra: true,
    competitor: false,
    jaktraNote: "Zero-login token link (/i/:token) with instant Razorpay card or ACH payment",
    competitorNote: "Redirects to standard accounting portal or static invoice PDF",
  },
  {
    name: "Installment Plan Negotiation",
    description: "Options when debtor cannot pay the full balance at once.",
    jaktra: true,
    competitor: false,
    jaktraNote: "Debtors can autonomously split overdue balances into 2x–3x structured installments",
    competitorNote: "Enforces all-or-nothing balance settlement plus accumulated fee line items",
  },
  {
    name: "Automated Late Fees & Compound Interest",
    description: "Adding penalty fee line items to overdue invoices automatically.",
    jaktra: false,
    competitor: true,
    jaktraNote: "Focuses on tone escalation and installments instead of punitive fee surcharges",
    competitorNote: "Automatically adds fixed late fees or compound interest line items in Xero/QBO",
  },
  {
    name: "Prompt Payment Discount Automation",
    description: "Incentivizing early settlement and revoking discounts after due date.",
    jaktra: false,
    competitor: true,
    jaktraNote: "Standard commercial settlement terms",
    competitorNote: "Applies prompt payment discounts and revokes them automatically after due date",
  },
  {
    name: "Automated Monthly PDF Statement Runs",
    description: "Compiling and emailing monthly customer account statements.",
    jaktra: false,
    competitor: true,
    jaktraNote: "Transactional invoice-specific payment notifications",
    competitorNote: "Generates consolidated monthly statement PDFs and emails them on set schedule",
  },
  {
    name: "Accounting App Store 1-Click Install",
    description: "Direct marketplace installation and accounting sync.",
    jaktra: false,
    competitor: true,
    jaktraNote: "Instant CSV upload, developer webhooks, and REST API",
    competitorNote: "1-click install from official Xero and Intuit QuickBooks App Store",
  },
  {
    name: "Time to Launch & Setup",
    description: "Time required to activate live collections.",
    jaktra: "15 Minutes (Self-Serve)",
    competitor: "1 Day (App Store Sync)",
    jaktraNote: "Instant CSV or webhook sync with zero setup fees",
    competitorNote: "Connects to Xero/QuickBooks and configures fee penalty rules",
  },
  {
    name: "Pricing Structure",
    description: "Software licensing model.",
    jaktra: "100% Free during Early Access",
    competitor: "$49 to $149+/month",
    jaktraNote: "Full enterprise feature set unlocked with zero fees",
    competitorNote: "Tiered monthly subscription based on active invoice volume",
  },
];

export function PaidNiceCompare() {
  const faqs = [
    {
      q: "Why do businesses choose Jaktra over PaidNice?",
      a: "PaidNice focuses on automated late fees and interest penalties. While late fees can incentivize payment in some consumer or micro-business contexts, in B2B transactions they often alienate key clients, trigger PO rejections, and complicate accounting. Jaktra takes a collaborative autonomous approach: modulating written tone across 5 stages, offering structured 2x–3x installment schedules, and automatically pausing cadences when disputes arise to preserve long-term enterprise goodwill.",
    },
    {
      q: "Do late fees actually hurt B2B customer relationships?",
      a: "Yes, in many enterprise B2B relationships, adding unexpected late fee line items causes procurement pushback, requires new purchase order approvals from the client's finance team, and slows down overall payment clearance. Jaktra's research shows that dynamic tone escalation paired with flexible installment options accelerates cash collection without friction or client churn.",
    },
    {
      q: "How does Jaktra handle customer billing disputes?",
      a: "In PaidNice, if a customer replies questioning an invoice, the system continues its automated schedule unless manually altered. Jaktra's NLP sentiment classifier immediately identifies disputes, pauses all automated reminders, notifies your team, and auto-drafts an executive response.",
    },
    {
      q: "How fast can I get started with Jaktra?",
      a: "You can connect your accounting system, upload an invoice CSV, or send a webhook in under 15 minutes. Jaktra is completely free during our public Early Access program.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#010102] text-[#f7f8f8] font-sans antialiased selection:bg-[#5e6ad2]/30 selection:text-white">
      <SEOHead
        title="Jaktra vs PaidNice: Late Fees vs Smart Recovery | Jaktra"
        description="Compare PaidNice vs Jaktra. Learn why finance teams upgrade from static late fees to autonomous AI tone escalation and installment payment recovery."
        canonicalPath="/compare/jaktra-vs-paidnice"
        jsonLd={[
          paidniceCompareSchema,
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Compare", path: "/compare" },
            { name: "Jaktra vs PaidNice", path: "/compare/jaktra-vs-paidnice" },
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
            { name: "Jaktra vs PaidNice", path: "/compare/jaktra-vs-paidnice" },
          ]}
          title="Jaktra vs PaidNice: Late Fees vs Smart Recovery"
          description="PaidNice adds late fee penalties and interest surcharges to unpaid invoices. Jaktra takes a relationship-first approach—using smart tone escalation and flexible installment plans to recover cash without upsetting clients."
        />

        <div className="seo-container space-y-16">
          {/* Comparison Matrix Table */}
          <ComparisonMatrix
            competitorName="PaidNice"
            competitorLogo={paidniceLogo}
            features={PAIDNICE_COMPARISON_FEATURES}
          />

          {/* 4 Architectural Differentiators Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="rounded-xl border border-[#23252a] bg-[#0f1011] p-6">
              <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-[#23252a] flex items-center justify-center mb-4 text-[#606cd2]">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">Relationship-First Tone Modulation</h3>
              <p className="text-xs text-[#8a8f98] leading-relaxed">
                Rather than relying solely on automated penalty surcharges, Jaktra modulates communication urgency across 5 stages, maintaining commercial partnerships while securing definitive payment commitments.
              </p>
            </div>

            <div className="rounded-xl border border-[#23252a] bg-[#0f1011] p-6">
              <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-[#23252a] flex items-center justify-center mb-4 text-[#606cd2]">
                <Split className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">Automated Installment Recovery</h3>
              <p className="text-xs text-[#8a8f98] leading-relaxed">
                When debtors face temporary cash flow constraints, Jaktra allows them to split balances into automated 2x or 3x weekly installments directly from their tokenized portal.
              </p>
            </div>

            <div className="rounded-xl border border-[#23252a] bg-[#0f1011] p-6">
              <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-[#23252a] flex items-center justify-center mb-4 text-[#606cd2]">
                <CreditCard className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">Zero-Login Debtor Portals</h3>
              <p className="text-xs text-[#8a8f98] leading-relaxed">
                Debtors click directly into <code className="text-[11px] font-mono text-[#606cd2]">/i/:token</code> with zero passwords or registration, allowing instant settlement via Razorpay.
              </p>
            </div>

            <div className="rounded-xl border border-[#23252a] bg-[#0f1011] p-6">
              <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-[#23252a] flex items-center justify-center mb-4 text-[#606cd2]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">Stage 5 Hard Legal Stop</h3>
              <p className="text-xs text-[#8a8f98] leading-relaxed">
                At D+46, autonomous reminders automatically halt to ensure compliance, compiling a complete tamper-proof case audit for human legal review.
              </p>
            </div>
          </section>

          {/* Objective Decision Guide */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-[#23252a] bg-[#0f1011] p-6">
              <h3 className="text-sm font-semibold text-zinc-300 mb-3">When PaidNice is the Right Fit</h3>
              <ul className="space-y-2.5 text-xs text-[#8a8f98]">
                <li className="flex items-start gap-2">
                  <span className="text-zinc-600 font-mono">&bull;</span>
                  <span>You specifically want to add automated late fee interest charges to client invoices.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-zinc-600 font-mono">&bull;</span>
                  <span>You operate a transactional business where clients expect contractual late payment penalties.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-zinc-600 font-mono">&bull;</span>
                  <span>You need standard dunning schedules integrated directly with Xero or QuickBooks.</span>
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
                  <span>You want to collect overdue cash without alienating valuable B2B clients with late fees.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#606cd2] shrink-0 mt-0.5" />
                  <span>You need automated dispute triage that catches invoice queries and freezes reminders.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#606cd2] shrink-0 mt-0.5" />
                  <span>You want 100% Free Early Access with zero setup friction or monthly subscriptions.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* FAQ Section */}
          <section>
            <div className="text-center mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2">Frequently Asked Questions</h2>
              <p className="text-xs sm:text-sm text-[#8a8f98]">
                Evaluating late fee penalties vs autonomous tone escalation.
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
              Collect Overdue Invoices Without Losing Clients
            </h2>
            <p className="text-xs sm:text-sm text-[#8a8f98] max-w-xl mx-auto mb-6 leading-relaxed">
              Upgrade from punitive late fees to autonomous AI tone modulation, dispute triage, and seamless installment recovery.
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

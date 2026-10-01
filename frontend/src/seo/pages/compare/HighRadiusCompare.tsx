import { Link } from "react-router-dom";
import { Check, ArrowRight, ShieldCheck, Zap, RefreshCw, CreditCard } from "lucide-react";
import { SEOHead } from "@/seo/components/SEOHead";
import { highRadiusCompareSchema, breadcrumbSchema } from "@/seo/schemas";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { GlobalNav } from "@/components/common/GlobalNav";
import { SEOHero } from "@/seo/components/SEOHero";
import { ComparisonMatrix, type ComparisonFeature } from "@/seo/components/ComparisonMatrix";
import highRadiusLogo from "@/assets/competition/cropped-HighRadius-Stack-Logo-full-color-1-1-32x32.png";

const HIGHRADIUS_COMPARISON_FEATURES: ComparisonFeature[] = [
  {
    name: "Collection Execution Model",
    description: "How debtor follow-up communications are authored and sent.",
    jaktra: true,
    competitor: false,
    jaktraNote: "Autonomous Groq LLaMA 3.1 AI writes custom emails across 5 escalation stages",
    competitorNote: "Predictive ML prioritizes debtor accounts and assigns manual phone calls to human collectors",
  },
  {
    name: "Inbound Dispute & Reply Triage",
    description: "Handling customer questions on billable hours, scopes, or purchase orders.",
    jaktra: true,
    competitor: false,
    jaktraNote: "NLP classifies disputes, pauses reminders instantly, and drafts a resolution reply",
    competitorNote: "Complex deductions module requiring manual research and invoice line matching",
  },
  {
    name: "1-Click Payment Settlement",
    description: "How buyers inspect open invoices and complete payment.",
    jaktra: true,
    competitor: false,
    jaktraNote: "Zero-login token link (/i/:token) with instant Razorpay card or ACH payment",
    competitorNote: "Heavy enterprise buyer portal, EDI payment clearing, or bank lockbox transfer",
  },
  {
    name: "Installment Plan Negotiation",
    description: "Debtor option to split overdue balances during a temporary cash crunch.",
    jaktra: true,
    competitor: false,
    jaktraNote: "Debtors can split overdue balances into automated 2x–3x structured installments",
    competitorNote: "Requires formal credit analyst payment plan restructuring workflow",
  },
  {
    name: "Paper Check Lockbox OCR & Remittance Extraction",
    description: "Scanning physical paper checks and remittance stubs via computer vision.",
    jaktra: false,
    competitor: true,
    jaktraNote: "Digital-only payment recovery via card, ACH, and tokenized portal",
    competitorNote: "Proprietary AI OCR scans physical checks, check stubs, and bank lockbox files",
  },
  {
    name: "Enterprise Deduction & Trade Claims Management",
    description: "Processing retail short-payments, trade allowances, and freight claims.",
    jaktra: false,
    competitor: true,
    jaktraNote: "Conversational B2B dispute classification and recovery",
    competitorNote: "Specialized enterprise deduction management workflows and claim routing",
  },
  {
    name: "Global Credit Agency Ingestion (D&B / Experian)",
    description: "Automated commercial credit limit underwriting and scoring.",
    jaktra: false,
    competitor: true,
    jaktraNote: "Internal debtor payment behavior risk scoring only",
    competitorNote: "Direct feeds from Dun & Bradstreet, Experian, and multi-tier approval matrix",
  },
  {
    name: "Certified SAP S/4HANA & Oracle ERP Connectors",
    description: "Deep native enterprise database and ERP integration.",
    jaktra: false,
    competitor: true,
    jaktraNote: "Cloud-native Webhook, API, and CSV data sync",
    competitorNote: "Native ABAP modules and Oracle enterprise application connectors",
  },
  {
    name: "Time to Launch & Setup",
    description: "Timeline from signup to active automated collections.",
    jaktra: "15 Minutes (Self-Serve)",
    competitor: "6 to 12 Months",
    jaktraNote: "Zero IT consulting; instant CSV upload or webhook sync",
    competitorNote: "Requires systems integrators (Deloitte, Accenture) and custom SAP ABAP",
  },
  {
    name: "Annual Investment / Licensing",
    description: "Software and deployment cost.",
    jaktra: "100% Free during Early Access",
    competitor: "$50,000 to $150,000+/year",
    jaktraNote: "All enterprise capabilities unlocked with no commitments",
    competitorNote: "Annual enterprise contracts + heavy implementation service fees",
  },
];

export function HighRadiusCompare() {
  const faqs = [
    {
      q: "Is Jaktra a complete replacement for HighRadius?",
      a: "No, and we are deliberate about that distinction. HighRadius is a comprehensive enterprise Order-to-Cash (O2C) suite built for Fortune 500 multinationals that need bank lockbox paper check scanning (OCR), EDI 820 feeds, retail deduction clearing, and deep SAP/Oracle integrations. Jaktra is an autonomous AI accounts receivable collections and dunning agent. If your company is evaluating HighRadius primarily to solve overdue invoice chasing, reduce DSO, and automate polite dunning, Jaktra is the focused, right-sized alternative for that specific workflow—deployable in 15 minutes without enterprise consultants.",
    },
    {
      q: "How does Jaktra relate to HighRadius?",
      a: "Jaktra relates to HighRadius in two distinct ways: (1) As a lightweight, accessible alternative for collections: mid-market and SaaS finance teams that don't need a $50,000+ O2C suite can solve the collections bottleneck directly with Jaktra. (2) As an autonomous AI execution layer: while HighRadius Collections generates static worklists for human collectors to make manual calls, Jaktra autonomously generates tone-modulated emails across 5 stages, triages dispute replies via NLP, and collects digital payments via tokenized debtor portals.",
    },
    {
      q: "How does Jaktra's AI differ from HighRadius's machine learning?",
      a: "HighRadius uses predictive machine learning to score account delinquency and rank work queues for human collectors. Jaktra combines predictive ML risk scoring (analyzing historical payment rates, days overdue, and follow-up counts) with generative AI execution: it uses Groq LLaMA 3.1 to dynamically craft context-aware debtor communications across a 5-stage tone escalation matrix, automatically parses incoming dispute sentiment, and halts cadences when disputes arise.",
    },
    {
      q: "When should an organization choose HighRadius over Jaktra?",
      a: "Choose HighRadius if you are a multi-billion-dollar enterprise with on-premise SAP or Oracle ERPs, process physical paper checks sent to bank lockboxes requiring OCR cash application, or manage high-volume consumer-goods retail deduction and trade promotion claims.",
    },
    {
      q: "When should an organization choose Jaktra?",
      a: "Choose Jaktra if you run a B2B SaaS, digital agency, or growing mid-market business with 50 to 5,000 open invoices monthly, want an intelligent collections cadence running today without IT implementation fees, and want to get started with 100% Free Early Access.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#010102] text-[#f7f8f8] font-sans antialiased selection:bg-[#5e6ad2]/30 selection:text-white">
      <SEOHead
        title="Jaktra vs HighRadius: Enterprise Suite vs Fast AI Agent | Jaktra"
        description="Compare HighRadius vs Jaktra. Learn why Jaktra is a lightweight, autonomous AI collections agent built for rapid 15-minute deployment and cash recovery."
        canonicalPath="/compare/jaktra-vs-highradius"
        jsonLd={[
          highRadiusCompareSchema,
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Compare", path: "/compare" },
            { name: "Jaktra vs HighRadius", path: "/compare/jaktra-vs-highradius" },
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
            { name: "Jaktra vs HighRadius", path: "/compare/jaktra-vs-highradius" },
          ]}
          title="Jaktra vs HighRadius: Enterprise Suite vs Fast AI Agent"
          description="HighRadius is an enterprise Order-to-Cash suite requiring 6-month consulting rollouts and $50k+ budgets. Jaktra is an autonomous collections agent you can launch in 15 minutes for free."
        />

        <div className="seo-container space-y-16">
          {/* Comparison Matrix Table */}
          <ComparisonMatrix
            competitorName="HighRadius"
            competitorLogo={highRadiusLogo}
            features={HIGHRADIUS_COMPARISON_FEATURES}
          />

          {/* Setting the Record Straight Banner */}
          <section className="bg-[#0e0f11] border border-white/[0.08] rounded-xl p-6 sm:p-8">
            <span className="text-xs font-mono uppercase tracking-wider text-[#b7d2f8] block mb-2">
              Honest Positioning
            </span>
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
              Setting the Record Straight: Where HighRadius Still Excels
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-3xl">
              We do not claim to replace HighRadius’s entire footprint. If your business processes physical lockbox checks with complex OCR remittance scanning, manages massive consumer retail trade promotion deductions, or runs on-premise SAP S/4HANA with a dedicated team of credit analysts, HighRadius is the proven enterprise standard.
              <br /><br />
              However, if your primary pain point is that overdue invoices linger, human collectors waste time manually writing emails and making phone calls, and you want an intelligent AI agent that recovers cash autonomously without a $100k IT project, Jaktra is purpose-built for you.
            </p>
          </section>

          {/* 4 Architectural Differentiators Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="rounded-xl border border-white/[0.08] bg-[#0e0f11] p-6">
              <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4 text-[#b7d2f8]">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">Autonomous Execution vs Call Queues</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                HighRadius prioritizes work queues for human collectors to call. Jaktra autonomously drafts, modulates, and executes written collection cadences across 5 stages without human labor.
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-[#0e0f11] p-6">
              <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4 text-[#b7d2f8]">
                <RefreshCw className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">Lightweight NLP Dispute Triage</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Rather than forcing complex multi-stage deduction matching workflows, Jaktra’s NLP classifier instantly halts reminders on disputes and drafts executive resolution replies.
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-[#0e0f11] p-6">
              <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4 text-[#b7d2f8]">
                <CreditCard className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">Tokenized Zero-Login Settlement</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Debtors click directly into <code className="text-[11px] font-mono text-[#b7d2f8]">/i/:token</code> with zero passwords, enabling instant Razorpay checkout or flexible 2x–3x installment plans.
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-[#0e0f11] p-6">
              <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4 text-[#b7d2f8]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">Stage 5 Hard Legal Stop</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                At D+46, autonomous reminders automatically freeze to protect compliance, compiling an unalterable audit dossier for legal counsel review.
              </p>
            </div>
          </section>

          {/* Objective Decision Guide */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-white/[0.08] bg-[#0e0f11] p-6">
              <h3 className="text-sm font-semibold text-zinc-300 mb-3">When HighRadius is the Right Fit</h3>
              <ul className="space-y-2.5 text-xs text-zinc-400">
                <li className="flex items-start gap-2">
                  <span className="text-zinc-600 font-mono">&bull;</span>
                  <span>You are a Global 2000 enterprise with multi-billion revenue and on-premise SAP/Oracle ERPs.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-zinc-600 font-mono">&bull;</span>
                  <span>You process high volumes of physical paper checks sent to bank lockboxes requiring OCR cash app.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-zinc-600 font-mono">&bull;</span>
                  <span>You have an IT budget of $50,000–$150,000+/year and a 6-month consulting runway.</span>
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
                  <span>You want to automate accounts receivable collections in 15 minutes without IT consulting fees.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#b7d2f8] shrink-0 mt-0.5" />
                  <span>You need autonomous AI tone modulation that writes custom emails instead of generating call lists.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#b7d2f8] shrink-0 mt-0.5" />
                  <span>You want 100% Free Early Access with zero long-term contractual lock-in.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* FAQ Section */}
          <section>
            <div className="text-center mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2">Frequently Asked Questions</h2>
              <p className="text-xs sm:text-sm text-zinc-400">
                Key architectural distinctions between HighRadius and Jaktra.
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
              Start Autonomous Collections in 15 Minutes
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto mb-6 leading-relaxed">
              No 6-month consulting engagements. No six-figure software fees. Just autonomous AI collections that recover cash starting today.
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

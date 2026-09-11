import { Link } from "react-router-dom";
import { Check, ArrowRight, ShieldCheck } from "lucide-react";
import jaktraLogo from "../assets/jaktra_svg.svg";
import { SEOHead } from "../components/common/SEOHead";
import { highRadiusCompareSchema, breadcrumbSchema } from "../components/common/seo-schemas";
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
    <div className="min-h-screen bg-[#0a0a0b] text-zinc-100 font-sans selection:bg-[#b7d2f8]/20 selection:text-white">
      <SEOHead
        title="HighRadius vs Jaktra — Enterprise O2C Suite vs Focused AI Collections Agent"
        description="Comparing HighRadius and Jaktra? Learn why Jaktra is not a complete O2C suite replacement, but a focused, autonomous AI collections agent built for fast deployment and high recovery."
        canonicalPath="/compare/highradius-vs-jaktra"
        jsonLd={[
          highRadiusCompareSchema,
          breadcrumbSchema([
            { name: "Compare", path: "/compare/highradius-vs-jaktra" },
            { name: "HighRadius vs Jaktra", path: "/compare/highradius-vs-jaktra" },
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
              HighRadius vs Jaktra
            </li>
          </ol>
        </nav>

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-3">
            Architecture &amp; Scope Analysis
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-5 leading-tight">
            HighRadius vs. Jaktra: Enterprise O2C Suite vs. Focused AI Collections Agent
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
            HighRadius is a full-scale Order-to-Cash ERP suite built for Fortune 500 back-offices. Jaktra is an
            autonomous AI collections agent built for fast-moving finance teams. Here is how to evaluate the right
            architecture for your exact operational bottleneck.
          </p>
        </div>

        {/* Setting the Record Straight */}
        <section className="mb-16">
          <div className="max-w-3xl mb-8">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-2">
              Operational Scope &amp; Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Setting the Record Straight: What Jaktra Is (and Is Not) to HighRadius
            </h2>
            <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
              Many software comparisons make sweeping claims that one tool replaces another. In financial architecture, precision matters: Jaktra is not an entire Order-to-Cash ERP suite—it is a specialized autonomous collections execution engine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 sm:p-8 rounded-2xl bg-[#111113] border border-white/[0.08] shadow-lg">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400 mb-3">
                <span className="w-2 h-2 rounded-full bg-zinc-500" />
                HighRadius Scope: Full-Scale Enterprise O2C
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Heavyweights for Fortune 500 SAP Back-Offices
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                HighRadius automates the broad Order-to-Cash spectrum: credit risk underwriting, bank lockbox paper check scanning (OCR cash matching), deduction and trade promotion clearing for consumer goods vendors, and complex SAP S/4HANA integrations. It requires multi-month IT rollouts and enterprise contract floors.
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-2xl bg-[#111113] border border-white/[0.08] shadow-lg">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-[#b7d2f8] mb-3">
                <span className="w-2 h-2 rounded-full bg-[#b7d2f8]" />
                Jaktra Scope: Dedicated Autonomous Collections
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Agile Autonomous AI Collections Agent
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                Jaktra solves the <strong>overdue invoice collection and dunning bottleneck</strong>. Instead of forcing you into an entire back-office suite, Jaktra deploys an autonomous AI agent with 5-stage generative tone escalation (Groq LLaMA 3.1), inbound dispute sentiment triage, Dead Letter Queue reliability, and tokenized Razorpay settlement—active in 15 minutes.
              </p>
            </div>
          </div>
        </section>

        {/* Detailed Comparison Table */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold text-white text-center mb-4">Functional & Architectural Comparison</h2>
          <p className="text-center text-sm text-zinc-400 mb-8 max-w-2xl mx-auto">
            Compare functional scope, implementation timelines, and operating models objectively.
          </p>

          <div className="rounded-2xl border border-white/[0.08] bg-[#111113] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm min-w-[680px]">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-white/[0.03] text-xs font-mono uppercase tracking-wider text-zinc-300">
                    <th className="py-4 px-6 font-semibold">Evaluation Criteria</th>
                    <th className="py-4 px-6 font-semibold text-[#b7d2f8] bg-white/[0.02]">Jaktra Autonomous AR</th>
                    <th className="py-4 px-6 font-semibold text-zinc-400">HighRadius</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05] text-xs sm:text-sm">
                  <tr className="hover:bg-white/[0.015] transition-colors">
                    <td className="py-4 px-6 text-white font-medium">Core Functional Scope</td>
                    <td className="py-4 px-6 text-zinc-100 font-medium bg-white/[0.02]">
                      Autonomous AR Collections, Dunning, Dispute Triage &amp; Digital Payment Portals
                    </td>
                    <td className="py-4 px-6 text-zinc-400">Full Order-to-Cash Suite (Credit, Lockbox, Invoicing, Deductions, Collections)</td>
                  </tr>
                  <tr className="hover:bg-white/[0.015] transition-colors">
                    <td className="py-4 px-6 text-white font-medium">Deployment Timeline</td>
                    <td className="py-4 px-6 text-zinc-100 font-medium bg-white/[0.02]">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#b7d2f8] shrink-0" />
                        <span>Under 15 minutes (CSV or REST API)</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-zinc-400">3 to 9 months (Requires systems integration partner)</td>
                  </tr>
                  <tr className="hover:bg-white/[0.015] transition-colors">
                    <td className="py-4 px-6 text-white font-medium">Pricing Model</td>
                    <td className="py-4 px-6 text-zinc-100 font-medium bg-white/[0.02]">
                      100% Free during Early Access (No credit card required)
                    </td>
                    <td className="py-4 px-6 text-zinc-400">$50k–$100k+ annual floor + professional consulting fees</td>
                  </tr>
                  <tr className="hover:bg-white/[0.015] transition-colors">
                    <td className="py-4 px-6 text-white font-medium">Collections Execution Model</td>
                    <td className="py-4 px-6 text-zinc-100 font-medium bg-white/[0.02]">
                      Autonomous Generative AI Agent (Groq LLaMA 3.1 5-stage tone escalation)
                    </td>
                    <td className="py-4 px-6 text-zinc-400">Prioritized call and task lists assigned to manual human collectors</td>
                  </tr>
                  <tr className="hover:bg-white/[0.015] transition-colors">
                    <td className="py-4 px-6 text-white font-medium">Inbound Dispute Handling</td>
                    <td className="py-4 px-6 text-zinc-100 font-medium bg-white/[0.02]">
                      NLP sentiment triage; auto-pauses cadences; drafts suggested response
                    </td>
                    <td className="py-4 px-6 text-zinc-400">Enterprise deduction coding module for supply chain chargebacks</td>
                  </tr>
                  <tr className="hover:bg-white/[0.015] transition-colors">
                    <td className="py-4 px-6 text-white font-medium">Debtor Settlement Flow</td>
                    <td className="py-4 px-6 text-zinc-100 font-medium bg-white/[0.02]">
                      Tokenized link (<code className="text-xs font-mono text-[#b7d2f8] bg-white/[0.05] px-1.5 py-0.5 rounded">/i/:token</code>) with instant digital pay &amp; payment plans
                    </td>
                    <td className="py-4 px-6 text-zinc-400">Enterprise customer portal with username/password logins</td>
                  </tr>
                  <tr className="hover:bg-white/[0.015] transition-colors">
                    <td className="py-4 px-6 text-white font-medium">Bank Lockbox Paper Check OCR</td>
                    <td className="py-4 px-6 text-zinc-400 bg-white/[0.02]">Not supported (Focuses strictly on digital settlement)</td>
                    <td className="py-4 px-6 text-zinc-300 font-medium">Deep OCR lockbox check scanning &amp; cash application</td>
                  </tr>
                  <tr className="hover:bg-white/[0.015] transition-colors">
                    <td className="py-4 px-6 text-white font-medium">Harassment &amp; Compliance Guard</td>
                    <td className="py-4 px-6 text-zinc-100 font-medium bg-white/[0.02]">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#b7d2f8] shrink-0" />
                        <span>20-Hour Idempotency Guard + Stage 5 Legal Stop</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-zinc-400">Dependent on human collector compliance with dialer queues</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Objective Decision Guide */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <div className="rounded-2xl border border-white/[0.08] bg-[#111113] p-6 sm:p-7">
            <h3 className="text-base font-semibold text-zinc-300 mb-3">When HighRadius is the Necessary Choice</h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-400">
              <li className="flex items-start gap-2">
                <span className="text-zinc-500 font-mono">•</span>
                <span>You are a multi-billion-dollar enterprise running on-premise SAP or Oracle ERPs.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-zinc-500 font-mono">•</span>
                <span>You receive large volumes of physical paper checks into bank lockboxes that need OCR cash matching.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-zinc-500 font-mono">•</span>
                <span>You distribute consumer goods or manufactured products requiring automated trade promotion and retail deduction resolution.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-zinc-500 font-mono">•</span>
                <span>You have a dedicated team of full-time collections agents who need dialer-integrated call queues.</span>
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-white/[0.12] bg-[#111113] p-6">
            <h3 className="text-base font-semibold text-white mb-3">When Jaktra is the Right Architectural Fit</h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-300">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#b7d2f8] shrink-0 mt-0.5" />
                <span>Your specific operational bottleneck is overdue invoice collection and reducing Days Sales Outstanding (DSO).</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#b7d2f8] shrink-0 mt-0.5" />
                <span>You want an autonomous agent that modulates tone across 5 stages without annoying clients or requiring human callers.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#b7d2f8] shrink-0 mt-0.5" />
                <span>You need an active, working solution today without paying $50,000+ or waiting months for IT systems integrators.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#b7d2f8] shrink-0 mt-0.5" />
                <span>You want zero-login tokenized payment portals where debtors can pay immediately or select installment plans.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-20">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Frequently Asked Questions</h2>
            <p className="text-sm text-zinc-400">
              Clear answers for finance leaders evaluating HighRadius versus focused AI collections.
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
            Accelerate Cash Flow with Focused AI Automation
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto mb-6">
            Stop waiting months for enterprise rollouts. Start collecting overdue receivables autonomously today with
            Jaktra.
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

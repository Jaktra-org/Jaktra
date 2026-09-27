import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Zap, Lock, Cpu, Sparkles, CheckCircle2 } from "lucide-react";
import { SEOHead } from "../components/common/SEOHead";
import { aboutPageSchema, breadcrumbSchema } from "../components/common/seo-schemas";
import { LandingFooter } from "../components/landing/LandingFooter";
import { GlobalNav } from "../components/common/GlobalNav";



export function About() {
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-zinc-100 font-sans selection:bg-[#b7d2f8]/20 selection:text-white antialiased">
      <SEOHead
        title="About Jaktra — Autonomous B2B Accounts Receivable Automation"
        description="Learn about Jaktra's mission to modernize B2B collections with AI-native tone escalation, dispute triage, and financial-grade security."
        canonicalPath="/about"
        jsonLd={[aboutPageSchema, breadcrumbSchema([{ name: "About", path: "/about" }])]}
      />

      <GlobalNav />

      <main className="pt-24 pb-16 px-6 max-w-5xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6 text-xs text-zinc-500">
          <ol className="flex items-center gap-2">
            <li>
              <Link to="/" className="hover:text-zinc-300 transition-colors">
                Home
              </Link>
            </li>
            <li>/</li>
            <li className="text-zinc-300 font-medium" aria-current="page">
              About
            </li>
          </ol>
        </nav>

        {/* Hero Section */}
        <div className="max-w-3xl mb-8 pt-2">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3 leading-tight">
            Built to Eliminate Friction in B2B Accounts Receivable
          </h1>
          <p className="text-sm sm:text-base text-zinc-300 leading-normal">
            Jaktra was created with a clear objective: replace stressful, manual invoice chasing with an autonomous,
            respectful AI agent. We enable finance teams to accelerate cash flow and reduce Days Sales Outstanding (DSO)
            while actively protecting critical customer relationships.
          </p>
        </div>

        {/* Problem & Approach */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="p-6 sm:p-7 rounded-xl bg-[#111113] border border-white/[0.08]">
            <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-300 mb-4">
              <Zap className="w-4 h-4 text-[#b7d2f8]" />
            </div>
            <h2 className="text-lg font-semibold text-white mb-2.5">Why Traditional Collections Fail</h2>
            <p className="text-sm text-zinc-300 leading-relaxed mb-3">
              Finance operations teams spend hundreds of hours every quarter manually copying spreadsheet rows, sending generic email blasts, and following up on overdue invoices.
            </p>
            <p className="text-sm text-zinc-300 leading-relaxed">
              When debtor disputes or billing questions arise, static dunning software keeps bombarding clients with automated notices—straining commercial relationships, damaging customer retention, and slowing payment reconciliation.
            </p>
          </div>

          <div className="p-6 sm:p-7 rounded-xl bg-[#111113] border border-white/[0.08]">
            <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-300 mb-4">
              <Cpu className="w-4 h-4 text-[#b7d2f8]" />
            </div>
            <h2 className="text-lg font-semibold text-white mb-2.5">Our Autonomous Approach</h2>
            <p className="text-sm text-zinc-300 leading-relaxed mb-3">
              Jaktra acts as an intelligent system of execution. Using Groq LLaMA 3.1 8B inference, our agent adapts collection tone across 5 progressive stages—from courteous reminders to firm demand notices.
            </p>
            <p className="text-sm text-zinc-300 leading-relaxed">
              The moment a debtor replies with a query or dispute, automated cadences pause immediately. Jaktra classifies the inquiry intent, drafts an executive reply for review, and directs debtors to friction-free payment portals.
            </p>
          </div>
        </section>

        {/* Core Principles Grid */}
        <section className="mb-8">
          <div className="mb-4">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-semibold block mb-1">
              Our Foundation
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Engineering Principles Governing Jaktra
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 sm:p-5 rounded-xl bg-[#111113] border border-white/[0.08]">
              <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-3 text-[#b7d2f8]">
                <Lock className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1.5">Strict Tenant Isolation</h3>
              <p className="text-xs text-zinc-300 leading-normal">
                Every tenant&apos;s financial records, debtor data, and communication logs are segregated at the database query level with AES-256 encryption at rest and TLS 1.3 in transit.
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-xl bg-[#111113] border border-white/[0.08]">
              <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-3 text-[#b7d2f8]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1.5">Non-Alienating Communication</h3>
              <p className="text-xs text-zinc-300 leading-normal">
                Collection cadences are engineered to preserve client relationships. We implement hard-coded 20-hour anti-spam guardrails and mandatory Stage 5 regulatory stops.
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-xl bg-[#111113] border border-white/[0.08]">
              <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-3 text-[#b7d2f8]">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1.5">Zero Platform Take-Rates</h3>
              <p className="text-xs text-zinc-300 leading-normal">
                We believe finance teams should keep 100% of their recovered capital. All customer payments settle directly into your corporate gateway with zero percentage fees.
              </p>
            </div>
          </div>
        </section>

        {/* Leadership & Editorial Transparency */}
        <section className="p-5 sm:p-6 rounded-xl bg-[#111113] border border-white/[0.08] mb-8">
          <div className="flex items-center gap-3 mb-2.5">
            <h2 className="text-lg font-semibold text-white">Leadership &amp; Content Integrity</h2>
          </div>
          <p className="text-sm text-zinc-300 leading-relaxed mb-3">
            Founded and architected by <span className="text-white font-medium">Suresh Jakhar</span>, Jaktra is engineered by a specialized team of financial operations practitioners and distributed software engineers. We build software to solve the acute cash flow bottlenecks experienced by growing B2B enterprises.
          </p>
          <p className="text-sm text-zinc-300 leading-relaxed mb-4">
            Educational resources published by Jaktra Research are authored by our receivables operations and engineering team. Our guides on Days Sales Outstanding (DSO), dunning email cadences, and dispute response frameworks are grounded in verified mathematical formulas (such as Countback DSO), statutory payment compliance requirements, and real-world collections data.
          </p>
          <div className="flex flex-wrap items-center gap-5 pt-1 text-xs text-zinc-300">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#b7d2f8]" /> Founded by Suresh Jakhar
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#b7d2f8]" /> Independent Technical Analysis
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#b7d2f8]" /> Real-World Operations Benchmarks
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#b7d2f8]" /> Free Open Resources
            </span>
          </div>
        </section>

        {/* CTA Card */}
        <section className="rounded-xl border border-white/[0.08] bg-[#111113] p-7 sm:p-10 text-center">
          <div className="max-w-xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2.5">
              Experience Autonomous Collections Today
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 mb-6 leading-relaxed">
              Jaktra is 100% free during public Early Access. Set up your ledger connection in under 10 minutes with zero credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-white text-zinc-950 text-sm font-semibold hover:bg-zinc-200 transition-colors shadow-sm w-full sm:w-auto"
              >
                <span>Get started free</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-white/[0.12] bg-white/[0.03] text-zinc-300 hover:text-white hover:bg-white/[0.06] text-sm font-medium transition-colors w-full sm:w-auto"
              >
                <span>Contact support</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}

export default About;

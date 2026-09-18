import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Zap, Lock, Cpu, Sparkles, Building2, CheckCircle2 } from "lucide-react";
import jaktraLogo from "../assets/jaktra_svg.svg";
import { SEOHead } from "../components/common/SEOHead";
import { aboutPageSchema, breadcrumbSchema } from "../components/common/seo-schemas";
import { LandingFooter } from "../components/landing/LandingFooter";

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

export function About() {
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-zinc-100 font-sans selection:bg-[#b7d2f8]/20 selection:text-white">
      <SEOHead
        title="About Jaktra — Autonomous B2B Accounts Receivable Automation"
        description="Learn about Jaktra's mission to modernize B2B collections with AI-native tone escalation, dispute triage, and financial-grade security."
        canonicalPath="/about"
        jsonLd={[aboutPageSchema, breadcrumbSchema([{ name: "About", path: "/about" }])]}
      />

      <HeaderNav />

      <main className="pt-24 pb-20 px-6 max-w-6xl mx-auto">
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
        <div className="max-w-3xl mb-16 pt-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-white/[0.08] bg-white/[0.03] text-zinc-300 text-xs font-mono mb-6">
            <Building2 className="w-3.5 h-3.5 text-[#b7d2f8]" />
            <span>Company &amp; Engineering Mission</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-6 leading-[1.15]">
            Built to Eliminate the Friction in B2B Accounts Receivable
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
            Jaktra was created with a clear objective: replace stressful, manual invoice chasing with an autonomous, respectful AI agent. We enable finance teams to accelerate cash flow and reduce Days Sales Outstanding (DSO) while protecting critical customer relationships.
          </p>
        </div>

        {/* The Problem & Our Mission */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <div className="p-8 rounded-2xl bg-[#111113] border border-white/[0.08]">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-6">
              <Zap className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white mb-3">Why Traditional Collections Fail</h2>
            <p className="text-sm text-zinc-400 leading-relaxed mb-4">
              Finance operations teams spend hundreds of hours every quarter manually copying spreadsheet rows, sending generic email blasts, and following up on overdue invoices.
            </p>
            <p className="text-sm text-zinc-400 leading-relaxed">
              When debtor disputes or billing questions arise, static dunning software keeps bombarding clients with automated notices—straining commercial relationships, damaging customer retention, and slowing payment reconciliation.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-[#111113] border border-white/[0.08]">
            <div className="w-10 h-10 rounded-xl bg-[#b7d2f8]/10 border border-[#b7d2f8]/20 flex items-center justify-center text-[#b7d2f8] mb-6">
              <Cpu className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white mb-3">Our Autonomous Approach</h2>
            <p className="text-sm text-zinc-400 leading-relaxed mb-4">
              Jaktra acts as an intelligent system of execution. Using Groq LLaMA 3.1 8B inference, our agent adapts collection tone across 5 progressive stages—from courteous reminders to firm demand notices.
            </p>
            <p className="text-sm text-zinc-400 leading-relaxed">
              The moment a debtor replies with a query or dispute, automated cadences pause immediately. Jaktra classifies the inquiry intent, drafts an executive reply for review, and directs debtors to friction-free payment portals.
            </p>
          </div>
        </section>

        {/* Core Principles Grid */}
        <section className="mb-20">
          <div className="max-w-2xl mb-10">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-semibold block mb-2">Our Foundation</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Engineering Principles Governing Jaktra
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#111113] border border-white/[0.08]">
              <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4 text-[#b7d2f8]">
                <Lock className="w-4 h-4" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">Strict Tenant Isolation</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Every tenant&apos;s financial records, debtor data, and communication logs are segregated at the database query level with AES-256 encryption at rest and TLS 1.3 in transit.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#111113] border border-white/[0.08]">
              <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4 text-[#b7d2f8]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">Non-Alienating Communication</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Collection cadences are engineered to preserve client relationships. We implement hard-coded 24-hour anti-spam guardrails and mandatory Stage 5 regulatory stops.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#111113] border border-white/[0.08]">
              <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4 text-[#b7d2f8]">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">Zero Platform Take-Rates</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                We believe finance teams should keep 100% of their recovered capital. All customer payments settle directly into your corporate gateway with zero percentage fees.
              </p>
            </div>
          </div>
        </section>

        {/* Research & Editorial Transparency */}
        <section className="p-8 rounded-2xl bg-[#111113] border border-white/[0.08] mb-20">
          <h2 className="text-xl font-bold text-white mb-3">Research &amp; Content Integrity</h2>
          <p className="text-sm text-zinc-400 leading-relaxed mb-4">
            Educational resources published by Jaktra Research are authored by our receivables operations and engineering team. Our guides on Days Sales Outstanding (DSO), dunning email cadences, and dispute response frameworks are grounded in verified mathematical formulas (such as Countback DSO), statutory payment compliance requirements, and real-world collections data.
          </p>
          <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-zinc-300">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#b7d2f8]" /> Independent Technical Analysis
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#b7d2f8]" /> Real-World Operations Benchmarks
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#b7d2f8]" /> Free Open Resources
            </span>
          </div>
        </section>

        {/* CTA Card */}
        <section className="rounded-2xl border border-white/[0.08] bg-[#111113] p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Experience Autonomous Collections Today
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 mb-6 leading-relaxed">
              Jaktra is 100% free during public Early Access. Set up your ledger connection in under 10 minutes with zero credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white text-zinc-950 text-sm font-semibold hover:bg-zinc-200 transition-colors shadow-lg w-full sm:w-auto"
              >
                <span>Get started free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-white/[0.12] bg-white/[0.04] text-white text-sm font-medium hover:bg-white/[0.08] transition-colors w-full sm:w-auto"
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

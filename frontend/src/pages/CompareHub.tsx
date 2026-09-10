import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bot,
  Shield,
  Layers,
  Check,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import jaktraLogo from "../assets/jaktra_svg.svg";
import { SEOHead } from "../components/common/SEOHead";
import { compareHubSchema, breadcrumbSchema } from "../components/common/seo-schemas";
import { LandingFooter } from "../components/landing/LandingFooter";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

function HeaderNav() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-[#0a0a0b]/90 backdrop-blur-md border-b border-white/[0.08]">
      <div className="w-full h-full px-4 sm:px-8 lg:px-12 xl:px-16 flex items-center justify-between">
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
          <Link to="/compare" className="text-sm text-white font-medium transition-colors hidden sm:block">
            Compare
          </Link>
          <Link to="/resources" className="text-sm text-zinc-400 hover:text-white transition-colors hidden sm:block">
            Resources
          </Link>
          <Link
            to="/login"
            className="text-xs sm:text-sm text-zinc-300 hover:text-white transition-colors"
          >
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

interface CompetitorCard {
  name: string;
  url: string;
  hasDedicatedPage?: boolean;
  category: "direct" | "portal" | "enterprise";
  bestFor: string;
  jaktraAdvantage: string;
  setupTime: string;
  pricing: string;
}

const COMPETITORS: CompetitorCard[] = [
  // Direct AI & Dunning Agents
  {
    name: "Upflow",
    url: "/compare/upflow-alternative",
    hasDedicatedPage: true,
    category: "direct",
    bestFor: "Mid-market B2B finance teams seeking scheduled email workflow templates.",
    jaktraAdvantage: "Groq LLaMA 3.1 autonomous tone escalation vs static email templates; automated dispute triage.",
    setupTime: "1 to 2 weeks vs 15 minutes",
    pricing: "Custom quote vs 100% Free Early Access",
  },
  {
    name: "Chaser",
    url: "/compare/chaser-alternative",
    hasDedicatedPage: true,
    category: "direct",
    bestFor: "SMEs wanting scheduled invoice reminders and manual phone call tracking.",
    jaktraAdvantage: "Autonomous conversational AI execution agent vs manual call schedule lists.",
    setupTime: "1 to 3 days vs 15 minutes",
    pricing: "Per-invoice volume scaling vs 100% Free Early Access",
  },
  {
    name: "PaidNice",
    url: "/compare/paidnice-alternative",
    hasDedicatedPage: true,
    category: "direct",
    bestFor: "Small businesses using Xero or QuickBooks wanting late fee penalties.",
    jaktraAdvantage: "Generative tone escalation & dispute resolution rather than punitive late fees that hurt client goodwill.",
    setupTime: "1 day vs 15 minutes",
    pricing: "Tiered pricing vs 100% Free Early Access",
  },
  {
    name: "Kolleno",
    url: "/compare/kolleno-alternative",
    hasDedicatedPage: true,
    category: "direct",
    bestFor: "Mid-market teams wanting omnichannel task queues for human credit controllers.",
    jaktraAdvantage: "Fully autonomous execution agent (no manual calling required) with zero-login debtor links.",
    setupTime: "2 to 4 weeks vs 15 minutes",
    pricing: "$6,000 to $15,000+/yr vs 100% Free Early Access",
  },

  // Billing Portals & Cash Forecasting
  {
    name: "Invoiced",
    url: "/register",
    hasDedicatedPage: false,
    category: "portal",
    bestFor: "Companies needing a complete customer billing portal and recurring subscription billing.",
    jaktraAdvantage: "Zero-login payment links (/i/:token) that eliminate buyer password friction and lift portal adoption.",
    setupTime: "3 to 6 weeks vs 15 minutes",
    pricing: "$12,000+/yr contracts vs 100% Free Early Access",
  },
  {
    name: "Gaviti",
    url: "/register",
    hasDedicatedPage: false,
    category: "portal",
    bestFor: "Credit teams wanting centralized collector task management and DSO reporting.",
    jaktraAdvantage: "Eliminates collector task lists entirely by autonomously executing collections communication.",
    setupTime: "3 to 6 weeks vs 15 minutes",
    pricing: "$10,000 to $25,000+/yr vs 100% Free Early Access",
  },
  {
    name: "Tesorio",
    url: "/register",
    hasDedicatedPage: false,
    category: "portal",
    bestFor: "Finance leaders wanting 13-week direct cash flow forecasting linked to NetSuite/Workday.",
    jaktraAdvantage: "Focused on tactical collection execution and debt recovery rather than cash forecasting models.",
    setupTime: "4 to 8 weeks vs 15 minutes",
    pricing: "$20,000+/yr contracts vs 100% Free Early Access",
  },
  {
    name: "Quadient YayPay",
    url: "/register",
    hasDedicatedPage: false,
    category: "portal",
    bestFor: "Mid-market enterprises with legacy ERPs needing credit scoring and buyer portals.",
    jaktraAdvantage: "Cloud-native 15-minute setup with Groq LLaMA 3.1 tone escalation vs heavy legacy middleware.",
    setupTime: "2 to 4 months vs 15 minutes",
    pricing: "$15,000 to $35,000+/yr vs 100% Free Early Access",
  },

  // Enterprise O2C, Networks & Treasury
  {
    name: "HighRadius",
    url: "/compare/highradius-vs-jaktra",
    hasDedicatedPage: true,
    category: "enterprise",
    bestFor: "Global 2000 enterprises needing bank lockbox check OCR and SAP deduction clearing.",
    jaktraAdvantage: "Focused autonomous collections agent with 15-minute setup vs multi-quarter enterprise O2C consulting.",
    setupTime: "6 to 9 months vs 15 minutes",
    pricing: "$50,000 to $150,000+/yr vs 100% Free Early Access",
  },
  {
    name: "Billtrust",
    url: "/register",
    hasDedicatedPage: false,
    category: "enterprise",
    bestFor: "Large distributors processing heavy lockbox checks and supplier payment networks.",
    jaktraAdvantage: "Eliminates network registration friction via tokenized zero-login links with direct Razorpay virtual accounts.",
    setupTime: "4 to 8 months vs 15 minutes",
    pricing: "$30,000 to $80,000+/yr vs 100% Free Early Access",
  },
  {
    name: "Versapay",
    url: "/register",
    hasDedicatedPage: false,
    category: "enterprise",
    bestFor: "B2B suppliers looking for collaborative buyer-seller portal networks.",
    jaktraAdvantage: "Zero-login debtor links prevent low buyer adoption; zero network transaction processing markups.",
    setupTime: "3 to 6 months vs 15 minutes",
    pricing: "$15,000 to $35,000+/yr + transaction fees vs 100% Free Early Access",
  },
  {
    name: "Sidetrade",
    url: "/register",
    hasDedicatedPage: false,
    category: "enterprise",
    bestFor: "Global 2000 enterprise credit departments running cross-entity predictive scoring (Aimie AI).",
    jaktraAdvantage: "Autonomous conversational AI execution without massive data lake warehousing projects.",
    setupTime: "6 to 9 months vs 15 minutes",
    pricing: "$30,000 to $75,000+/yr vs 100% Free Early Access",
  },
  {
    name: "Emagia",
    url: "/register",
    hasDedicatedPage: false,
    category: "enterprise",
    bestFor: "Shared service centers running enterprise SAP/Oracle ERPs needing Gia AI worklists.",
    jaktraAdvantage: "Autonomous Groq LLaMA 3.1 tone escalation (no collector calling) with 15-minute self-serve setup.",
    setupTime: "4 to 8 months vs 15 minutes",
    pricing: "$40,000 to $100,000+/yr vs 100% Free Early Access",
  },
  {
    name: "Serrala",
    url: "/register",
    hasDedicatedPage: false,
    category: "enterprise",
    bestFor: "Multinational corporate treasuries requiring on-premise SAP ABAP cash application.",
    jaktraAdvantage: "Cloud-native conversational AI agent without SAP ABAP transports or systems integrators.",
    setupTime: "6 to 12 months vs 15 minutes",
    pricing: "$50,000 to $150,000+/yr vs 100% Free Early Access",
  },
  {
    name: "BlackLine",
    url: "/register",
    hasDedicatedPage: false,
    category: "enterprise",
    bestFor: "Corporate controllers managing month-end financial close and balance sheet substantiation.",
    jaktraAdvantage: "Focused on debtor collections execution rather than accounting close transformation.",
    setupTime: "4 to 9 months vs 15 minutes",
    pricing: "$35,000 to $90,000+/yr vs 100% Free Early Access",
  },
];

export default function CompareHub() {
  const [selectedCategory, setSelectedCategory] = useState<"all" | "direct" | "portal" | "enterprise">("all");

  const filteredCompetitors =
    selectedCategory === "all"
      ? COMPETITORS
      : COMPETITORS.filter((c) => c.category === selectedCategory);

  const faqs = [
    {
      q: "How does Jaktra differ fundamentally from legacy accounts receivable software?",
      a: "Legacy AR software operates either as a scheduled template runner (sending identical, robotic dunning emails at fixed intervals) or as a task list generator (telling human collectors who to phone each day). Jaktra is an autonomous AI collections execution agent. Powered by Groq LLaMA 3.1, Jaktra personalizes and modulates tone across 5 stages, automatically triages inbound dispute replies, and provides tokenized zero-login settlement links (/i/:token) that allow 30-second payment without account friction.",
    },
    {
      q: "When should a company choose an enterprise suite (like HighRadius or Serrala) over Jaktra?",
      a: "If your organization is a Fortune 500 conglomerate with thousands of daily physical check lockboxes requiring optical character recognition (OCR), complex SAP deduction clearing workflows, or multi-bank SWIFT/EBICS treasury management, an enterprise suite like HighRadius or Serrala is designed for your needs. If your primary bottleneck is collecting overdue invoices from B2B customers without hiring an agency or embarking on a 6-month IT project, Jaktra delivers faster ROI.",
    },
    {
      q: "Why do debtor payment links perform better than customer portals?",
      a: "Customer portals (used by platforms like Versapay, Invoiced, and YayPay) require your clients' accounts payable clerks to register accounts, remember passwords, and navigate unfamiliar dashboards. Consequently, buyer portal adoption is notoriously low (often under 25%). Jaktra uses cryptographically tokenized links (/i/:token) embedded directly in emails. Debtors can review invoices and pay via Razorpay virtual accounts in 30 seconds with zero login friction.",
    },
    {
      q: "Can Jaktra integrate with existing accounting and email systems?",
      a: "Yes. Jaktra integrates with your transactional email provider (SendGrid, Resend, or custom SMTP) with credentials encrypted via AES-256-GCM. Invoices can be imported via CSV or REST API, and payments are auto-reconciled via Razorpay webhooks.",
    },
    {
      q: "What is Jaktra's pricing model compared to competitor annual contracts?",
      a: "Most B2B AR platforms require annual contracts ranging from $10,000 to $100,000+/year plus mandatory setup fees. Jaktra is completely free during our public Early Access program with zero setup fees, no artificial invoice limits, and no credit card required.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-zinc-100 font-sans selection:bg-[#b7d2f8]/20 selection:text-white">
      <SEOHead
        title="B2B Accounts Receivable Software Buyer's Guide & Alternatives Hub | Jaktra"
        description="Compare the leading B2B accounts receivable automation and dunning software. In-depth architectural comparisons of Jaktra vs HighRadius, Upflow, Chaser, Invoiced, Kolleno, Billtrust, and more."
        canonicalPath="/compare"
        jsonLd={[
          compareHubSchema,
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Software Comparisons", path: "/compare" },
          ]),
        ]}
      />

      <HeaderNav />

      <main className="pt-24 pb-20 w-full px-4 sm:px-8 lg:px-12 xl:px-16 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(183,210,248,0.06),transparent)] pointer-events-none" />
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6 text-xs text-zinc-500 font-mono relative z-10">
          <ol className="flex items-center gap-2">
            <li>
              <Link to="/" className="hover:text-zinc-300 transition-colors">
                Home
              </Link>
            </li>
            <li>/</li>
            <li className="text-zinc-300 font-medium" aria-current="page">
              Software Comparisons & Alternatives
            </li>
          </ol>
        </nav>

        {/* Hero Section: Expansive Market Intelligence Masthead with Spacious Flow */}
        <header className="mb-20 sm:mb-24 pt-8 max-w-7xl mx-auto">
          <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-4">
            B2B Accounts Receivable Software Buyer's Matrix
          </span>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
            <div className="lg:w-8/12 space-y-4">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
                Find the Right AR Platform. Without Vendor Marketing Spin.
              </h1>
              <p className="text-base sm:text-lg text-zinc-300 leading-relaxed max-w-2xl pt-1">
                Every accounts receivable vendor claims "AI" and "automation." Here is an objective, architectural breakdown of the 15 leading platforms—evaluating implementation complexity, debtor payment friction, and true autonomous execution.
              </p>
            </div>

            <div className="lg:w-4/12 flex flex-col gap-3.5 lg:items-end">
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: "all", label: `All (${COMPETITORS.length})` },
                  { id: "direct", label: "Dunning & AI (4)" },
                  { id: "portal", label: "Portals & Tasks (4)" },
                  { id: "enterprise", label: "Enterprise O2C (7)" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id as any)}
                    className={`px-3 py-1.5 rounded-md text-xs font-mono transition-colors ${
                      selectedCategory === cat.id
                        ? "bg-white text-zinc-950 font-bold shadow-sm"
                        : "bg-white/[0.03] text-zinc-400 hover:text-white border border-white/[0.06]"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* Unified Monochrome Market Telemetry Ribbon (Spacious, Zero Rainbow Colors) */}
        <section className="border-y border-white/[0.08] py-10 my-16 sm:my-20 grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.08] max-w-7xl mx-auto">
          <div className="px-4 sm:px-8 py-6 sm:py-2 space-y-1.5">
            <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              Setup Velocity
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white font-mono">
              15 Mins
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              vs 6–12 months for enterprise SAP suites.
            </p>
          </div>

          <div className="px-4 sm:px-8 py-6 sm:py-2 space-y-1.5">
            <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              Execution Autonomy
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white font-mono">
              Full AI Agent
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Automates dunning &amp; triage vs human call queues.
            </p>
          </div>

          <div className="px-4 sm:px-8 py-6 sm:py-2 space-y-1.5">
            <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              Debtor Adoption
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white font-mono">
              Zero-Login
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Tokenized /i/:token links eliminate password friction.
            </p>
          </div>

          <div className="px-4 sm:px-8 py-6 sm:py-2 space-y-1.5">
            <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              Commercial Terms
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white font-mono">
              100% Free
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Zero mandatory annual locks ($10k–$150k+/yr saved).
            </p>
          </div>
        </section>

        {/* The 3 Architectural Categories: Full-Width Open Editorial 3-Column Strip */}
        <section className="border-b border-white/[0.08] pb-24 mb-24 max-w-7xl mx-auto">
          <div className="mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
              Understanding the 3 Architectural Categories
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 max-w-2xl">
              Before comparing specific software features, understand which underlying architecture aligns with your team's bottleneck:
            </p>
          </div>

          <div className="border-y border-white/[0.08] divide-y lg:divide-y-0 lg:divide-x divide-white/[0.08] grid grid-cols-1 lg:grid-cols-3">
            {/* Col 1 */}
            <div className="py-10 lg:pr-10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8] shrink-0">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider font-semibold">Jaktra Model</span>
                  <h3 className="text-lg sm:text-xl font-bold text-white">Autonomous AI Execution</h3>
                </div>
              </div>
              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                Autonomous agent modulates tone across 5 stages, triages inbound disputes, and collects overdue cash end-to-end without hiring extra staff.
              </p>
              <ul className="space-y-2 text-xs text-zinc-300 pt-3 border-t border-white/[0.06]">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#b7d2f8]" /> 15-minute cloud setup</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#b7d2f8]" /> Zero debtor login friction</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#b7d2f8]" /> 100% Free during Early Access</li>
              </ul>
            </div>

            {/* Col 2 */}
            <div className="py-10 lg:px-10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8] shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider font-semibold">Invoiced, Gaviti, YayPay</span>
                  <h3 className="text-lg sm:text-xl font-bold text-white">Portals &amp; Task Lists</h3>
                </div>
              </div>
              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                Focuses on self-service customer billing portals and task queues that tell human collectors who to phone each day. Requires dedicated staff.
              </p>
              <ul className="space-y-2 text-xs text-zinc-300 pt-3 border-t border-white/[0.06]">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-zinc-400" /> 2 to 6 week setup</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-zinc-400" /> Comprehensive portal dashboards</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-zinc-400" /> $10k–$25k/yr contracts</li>
              </ul>
            </div>

            {/* Col 3 */}
            <div className="py-10 lg:pl-10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8] shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider font-semibold">HighRadius, Serrala</span>
                  <h3 className="text-lg sm:text-xl font-bold text-white">Enterprise O2C &amp; Treasury</h3>
                </div>
              </div>
              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                Deeply integrated suites for Fortune 500 multinationals running SAP or Oracle. Handles physical check lockbox OCR and complex deduction clearing.
              </p>
              <ul className="space-y-2 text-xs text-zinc-300 pt-3 border-t border-white/[0.06]">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-zinc-400" /> 6 to 12 month implementation</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-zinc-400" /> Heavy ERP cash application</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-zinc-400" /> $50k–$150k+/yr licensing</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Competitor Battlecards Roster: Full-Width Open Rows (Spacious) */}
        <section className="border-b border-white/[0.08] pb-24 mb-24 max-w-7xl mx-auto">
          <div className="mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
              Objective Competitor Evaluation Directory
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 max-w-2xl">
              Compare implementation velocity, pricing transparency, and execution models across all 15 platforms:
            </p>
          </div>

          <div className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
            {filteredCompetitors.map((comp, idx) => (
              <div key={idx} className="py-10 lg:py-12 hover:bg-white/[0.015] transition-colors group">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
                  {/* Col 1: Identity & Setup / Pricing Metadata (4 cols) */}
                  <div className="lg:col-span-4 space-y-3.5">
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="uppercase tracking-wider font-semibold text-zinc-400">
                        {comp.category === "direct" ? "AI Dunning" : comp.category === "portal" ? "Portal & Tasks" : "Enterprise Suite"}
                      </span>
                      {comp.hasDedicatedPage && (
                        <>
                          <span className="text-zinc-600">·</span>
                          <span className="text-[#b7d2f8] font-semibold">
                            Dedicated Guide
                          </span>
                        </>
                      )}
                    </div>

                    <h3 className="text-2xl font-bold text-white group-hover:text-[#b7d2f8] transition-colors">
                      {comp.name} vs Jaktra
                    </h3>

                    <div className="pt-3 border-t border-white/[0.06] grid grid-cols-2 gap-4 text-xs font-mono">
                      <div>
                        <span className="text-zinc-500 block mb-0.5">Setup Time</span>
                        <span className="text-white font-medium">{comp.setupTime}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block mb-0.5">Pricing Model</span>
                        <span className="text-white font-medium">{comp.pricing}</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      {comp.hasDedicatedPage ? (
                        <Link
                          to={comp.url}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#b7d2f8] hover:text-white transition-colors"
                        >
                          <span>Read In-Depth Comparison</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      ) : (
                        <Link
                          to="/register"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
                        >
                          <span>Get Started Free</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Col 2: Objective When to Choose (4 cols, vertical border) */}
                  <div className="lg:col-span-4 lg:border-x lg:border-white/[0.08] lg:px-8 space-y-2">
                    <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block">
                      When to choose {comp.name}:
                    </span>
                    <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                      {comp.bestFor}
                    </p>
                  </div>

                  {/* Col 3: Jaktra Advantage (4 cols, pl-4) */}
                  <div className="lg:col-span-4 lg:pl-6 space-y-3">
                    <span className="text-xs font-mono uppercase tracking-wider text-[#b7d2f8] font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#b7d2f8]" />
                      <span>The Jaktra Advantage:</span>
                    </span>
                    <p className="text-sm sm:text-base text-zinc-200 leading-relaxed">
                      {comp.jaktraAdvantage}
                    </p>
                    <div className="flex flex-wrap gap-2 text-[11px] pt-1">
                      <span className="px-2.5 py-1 rounded-md bg-white/[0.03] text-zinc-300 border border-white/[0.06]">
                        ✓ 5-stage tone escalation
                      </span>
                      <span className="px-2.5 py-1 rounded-md bg-white/[0.03] text-zinc-300 border border-white/[0.06]">
                        ✓ Zero debtor login friction
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQs Section (2-Column Open Split) */}
        <section className="border-b border-white/[0.08] pb-24 mb-24 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            <div className="lg:col-span-4 space-y-4">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block">
                Buyer's FAQs
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-snug">
                Frequently Asked Buyer Questions
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Key considerations for CFOs, Controllers, and Credit Managers evaluating software alternatives.
              </p>
            </div>

            <div className="lg:col-span-8 lg:border-l lg:border-white/[0.08] lg:pl-10">
              <Accordion type="single" variant="outline" defaultValue="faq-0" collapsible className="w-full">
                {faqs.map((faq, idx) => (
                  <AccordionItem key={idx} value={`faq-${idx}`} className="border-b border-white/[0.08] py-2">
                    <AccordionTrigger className="text-left font-semibold text-white text-base sm:text-lg hover:no-underline hover:text-[#b7d2f8] transition-colors py-4">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-zinc-300 text-sm sm:text-base leading-relaxed pb-6">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* Bottom Horizon CTA (Full-Width Open Horizon) */}
        <section className="py-12 border-t border-white/[0.08] text-center">
          <div className="max-w-4xl mx-auto space-y-6">
            <span className="text-xs font-mono uppercase tracking-wider text-[#b7d2f8] font-semibold block">
              100% Free During Early Access
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
              Try Autonomous AI Collections Free Today
            </h2>
            <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Skip the multi-month sales demo and systems integration cycle. Connect your transactional email in 15 minutes and start recovering overdue receivables today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-200 transition-colors shadow-sm"
              >
                Start Collecting Free
              </Link>
              <Link
                to="/pricing"
                className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white font-medium text-sm hover:bg-white/[0.08] transition-colors"
              >
                View Transparent Pricing
              </Link>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}

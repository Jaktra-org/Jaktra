import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Check,
  ExternalLink,
} from "lucide-react";
import { SEOHead } from "@/seo/components/SEOHead";
import { compareHubSchema, breadcrumbSchema } from "@/seo/schemas";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { GlobalNav } from "@/components/common/GlobalNav";

import jaktraLogo from "@/assets/jaktra_svg.svg";
import upflowLogo from "@/assets/competition/upflow.svg";
import chaserLogo from "@/assets/competition/chaser.png";
import paidniceLogo from "@/assets/competition/paidnice.png";
import kollenoLogo from "@/assets/competition/kolleno.png";
import invoicedLogo from "@/assets/competition/invoiced.com.png";
import gavitiLogo from "@/assets/competition/gaviti.png";
import tesorioLogo from "@/assets/competition/tesorio-icon.svg";
import yaypayLogo from "@/assets/competition/yaypay-logo-icon.svg";
import highRadiusLogo from "@/assets/competition/cropped-HighRadius-Stack-Logo-full-color-1-1-32x32.png";
import billtrustLogo from "@/assets/competition/billtrust.png";
import versapayLogo from "@/assets/competition/versapay.png";
import sidetradeLogo from "@/assets/competition/sidetrade-logo-2026-DB.svg";
import emagiaLogo from "@/assets/competition/emagia.png";
import serralaLogo from "@/assets/competition/logo-header-serrala.png";
import blacklineLogo from "@/assets/competition/blackline.png";

interface SlidingLogoItem {
  name: string;
  src: string;
  className?: string;
}

const PORTAL_LOGOS: SlidingLogoItem[] = [
  { name: "Invoiced", src: invoicedLogo },
  { name: "Gaviti", src: gavitiLogo },
  { name: "YayPay", src: yaypayLogo },
];

const ENTERPRISE_LOGOS: SlidingLogoItem[] = [
  { name: "HighRadius", src: highRadiusLogo },
  { name: "Serrala", src: serralaLogo },
];

function SlidingLogoIcon({
  logos,
  interval = 3000,
}: {
  logos: SlidingLogoItem[];
  interval?: number;
}) {
  const [index, setIndex] = useState(0);
  const [transitionEnabled, setTransitionEnabled] = useState(true);

  // Extend with first logo at the end for seamless upward looping
  const items = logos.length > 1 ? [...logos, logos[0]] : logos;

  useEffect(() => {
    if (logos.length <= 1) return;

    const timer = setInterval(() => {
      setIndex((prev) => prev + 1);
    }, interval);

    return () => clearInterval(timer);
  }, [logos.length, interval]);

  useEffect(() => {
    if (index === logos.length) {
      // Snap back to index 0 after the 500ms slide animation completes
      const snapTimer = setTimeout(() => {
        setTransitionEnabled(false);
        setIndex(0);
      }, 550);
      return () => clearTimeout(snapTimer);
    } else if (!transitionEnabled) {
      // Re-enable transition smoothly after the reset commit
      const enableTimer = setTimeout(() => {
        setTransitionEnabled(true);
      }, 50);
      return () => clearTimeout(enableTimer);
    }
  }, [index, logos.length, transitionEnabled]);

  return (
    <div
      className="w-9 h-9 rounded-lg bg-white border border-white/20 relative overflow-hidden shrink-0 shadow-sm"
      title={logos[index % logos.length]?.name}
    >
      <div
        className={`w-full flex flex-col ${
          transitionEnabled ? "transition-transform duration-500 ease-in-out" : ""
        }`}
        style={{ transform: `translateY(-${index * 36}px)` }}
      >
        {items.map((logo, i) => (
          <div
            key={`${logo.name}-${i}`}
            className="w-9 h-9 flex items-center justify-center p-1.5 shrink-0"
          >
            <img
              src={logo.src}
              alt={logo.name}
              className="max-w-full max-h-full object-contain"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
}



interface CompetitorCard {
  name: string;
  logo: string;
  url: string;
  hasDedicatedPage?: boolean;
  alternativesUrl?: string;
  isJaktra?: boolean;
  category: "direct" | "portal" | "enterprise";
  pricing: string;
  bestFor: string;
  tradeoff: string;
}

const COMPETITORS: CompetitorCard[] = [
  // Autonomous AI Execution
  {
    name: "Jaktra",
    logo: jaktraLogo,
    url: "/features",
    hasDedicatedPage: true,
    isJaktra: true,
    category: "direct",
    pricing: "100% Free during Early Access",
    bestFor: "B2B companies, agencies, and SaaS finance teams seeking an autonomous conversational AI agent that modulates tone across 5 escalation stages, automatically triages inbound dispute replies, and collects overdue cash without extra headcount.",
    tradeoff: "Built specifically for autonomous digital invoice recovery, email dunning, and tokenized zero-login settlement; does not provide physical check lockbox OCR, on-premise ERP treasury workstations, or EDI 820 payment clearing.",
  },

  // Direct AI & Dunning Agents
  {
    name: "Upflow",
    logo: upflowLogo,
    url: "/compare/jaktra-vs-upflow",
    hasDedicatedPage: true,
    alternativesUrl: "/compare/upflow-alternatives",
    category: "direct",
    pricing: "Custom quote based on annual invoiced volume (~$5k–$15k+/yr)",
    bestFor: "Mid-market B2B companies using NetSuite, QuickBooks, or Xero wanting collaborative finance-sales workflows (Salesforce/Slack integration), multi-currency tracking, and structured dunning cadences.",
    tradeoff: "Pricing scales with gross invoiced volume; collections workflows rely on scheduled rules and templates rather than autonomous conversational negotiation to resolve underlying invoice disputes.",
  },
  {
    name: "Chaser",
    logo: chaserLogo,
    url: "/compare/jaktra-vs-chaser",
    hasDedicatedPage: true,
    alternativesUrl: "/compare/chaser-alternatives",
    category: "direct",
    pricing: "£199 – £899+/mo ($250–$1,100+/mo, revenue-tiered) + add-ons",
    bestFor: "UK and European small-to-mid businesses integrated with Xero, QuickBooks, or Sage needing scheduled multi-channel chasing (email, SMS), customer credit checks, and automated statement delivery.",
    tradeoff: "Chasing sequences follow rigid timetable rules; the auto-call feature relies on pre-scripted synthetic text-to-speech rather than conversational AI; payment portals, SMS, and telephone calls require paid add-ons.",
  },
  {
    name: "PaidNice",
    logo: paidniceLogo,
    url: "/compare/jaktra-vs-paidnice",
    hasDedicatedPage: true,
    alternativesUrl: "/compare/paidnice-alternatives",
    category: "direct",
    pricing: "$49 – $149/mo (up to 300 invoices) | Custom from $999/mo",
    bestFor: "Small businesses, trade services, and bookkeeping firms on Xero or QuickBooks Online looking to automate late fee penalties, prompt payment discount deadlines, and monthly customer statement dispatch.",
    tradeoff: "Focuses on programmatic policy enforcement (late fee interest & discount cutoffs); lacks conversational dispute triage or natural language negotiation to resolve client payment objections.",
  },
  {
    name: "Kolleno",
    logo: kollenoLogo,
    url: "/compare/jaktra-vs-kolleno",
    hasDedicatedPage: true,
    alternativesUrl: "/compare/kolleno-alternatives",
    category: "direct",
    pricing: "Quote-based (~£650–£1,250/user/mo, annual commitment)",
    bestFor: "Mid-market finance and credit control teams needing an omnichannel communications cockpit (Email, SMS, Call logs, WhatsApp) that synchronizes with NetSuite, Sage, and major ERPs.",
    tradeoff: "Architected primarily as a task-routing inbox and workflow orchestrator ('Maestro') that directs daily worklists for human collectors, rather than autonomously resolving debtor inquiries without human intervention.",
  },

  // Billing Portals & Cash Forecasting
  {
    name: "Invoiced",
    logo: invoicedLogo,
    url: "#",
    hasDedicatedPage: false,
    alternativesUrl: "/compare/invoiced-alternatives",
    category: "portal",
    pricing: "Quote-based (~$1,000 – $2,500+/mo based on volume)",
    bestFor: "Mid-market billing-heavy and subscription businesses requiring a self-service customer payment portal, multi-gateway merchant processing (ACH/Credit Card), and recurring subscription billing management.",
    tradeoff: "Relies heavily on customer portal adoption; requiring buyers' accounts payable clerks to register and remember portal logins introduces friction that can slow down settlement compared to frictionless direct links.",
  },
  {
    name: "Gaviti",
    logo: gavitiLogo,
    url: "#",
    hasDedicatedPage: false,
    alternativesUrl: "/compare/gaviti-alternatives",
    category: "portal",
    pricing: "Custom annual enterprise contract ($15,000 – $30,000+/yr)",
    bestFor: "Mid-market to enterprise credit managers managing multiple ERP instances simultaneously who require standardized credit policy workflows, collector task assignment queues, and team KPI performance tracking.",
    tradeoff: "Engineered as an internal collector management and workflow automation platform; focuses on structuring daily task queues for human staff rather than autonomously conducting conversational recovery with debtors.",
  },
  {
    name: "Tesorio",
    logo: tesorioLogo,
    url: "#",
    hasDedicatedPage: false,
    alternativesUrl: "/compare/tesorio-alternatives",
    category: "portal",
    pricing: "Custom annual platform subscription ($18,000 – $36,000+/yr)",
    bestFor: "Corporate finance leaders and CFOs connected to NetSuite, Workday, or Salesforce who need predictive 13-week direct cash flow forecasting and liquidity analytics alongside collaborative AR task management.",
    tradeoff: "Core product orientation is cash forecasting and working capital modeling; collections features provide internal prioritization queues for finance teams rather than autonomous frontline debtor negotiation.",
  },
  {
    name: "Quadient YayPay",
    logo: yaypayLogo,
    url: "#",
    hasDedicatedPage: false,
    alternativesUrl: "/compare/yaypay-alternatives",
    category: "portal",
    pricing: "Transaction-volume quote ($15,000 – $40,000+/yr)",
    bestFor: "Mid-market enterprises running NetSuite, Acumatica, or Sage Intacct seeking predictive machine-learning debtor payment scoring, dispute tracking, and customer-facing billing portals.",
    tradeoff: "Multi-system middleware architecture requires dedicated implementation consulting; dispute handling depends on buyers actively logging into the YayPay customer portal rather than conversational inbox resolution.",
  },

  // Enterprise O2C, Networks & Treasury
  {
    name: "HighRadius",
    logo: highRadiusLogo,
    url: "/compare/jaktra-vs-highradius",
    hasDedicatedPage: true,
    alternativesUrl: "/compare/highradius-alternatives",
    category: "enterprise",
    pricing: "Custom enterprise / Outcome-based ($50,000 – $150,000+/yr)",
    bestFor: "Fortune 500 multinationals with heavy Order-to-Cash complexity, requiring automated cash application across hundreds of bank lockboxes, complex EDI 820 parsing, and automated deduction resolution for SAP and Oracle.",
    tradeoff: "Heavy enterprise suite requiring extensive multi-month systems integration, dedicated administrators, and 6-figure commitments; excessive overhead for teams looking primarily to recover overdue commercial invoices.",
  },
  {
    name: "Billtrust",
    logo: billtrustLogo,
    url: "#",
    hasDedicatedPage: false,
    category: "enterprise",
    pricing: "Custom annual contract + payment processing fees ($30,000 – $80,000+/yr)",
    bestFor: "High-volume B2B manufacturing, wholesale, and logistics distributors processing thousands of paper lockbox checks, electronic bill presentment, and payment routing through the Billtrust Business Directory.",
    tradeoff: "Network-centric model levies interchange and processing fees across invoice transactions; optimal efficiency requires trading partners to enroll and transact through the Billtrust payment network.",
  },
  {
    name: "Versapay",
    logo: versapayLogo,
    url: "#",
    hasDedicatedPage: false,
    alternativesUrl: "/compare/versapay-alternatives",
    category: "enterprise",
    pricing: "Custom annual subscription + processing fees ($18,000 – $45,000+/yr)",
    bestFor: "Suppliers running NetSuite, Microsoft Dynamics, or Sage seeking a collaborative buyer-seller cloud portal where customers and vendors can view invoices, collaborate on line-item billing disputes, and make payments.",
    tradeoff: "Collaboration is constrained by buyer portal adoption; accounts payable departments that refuse to create separate vendor portal logins remain outside the collaborative workflow, requiring manual follow-up.",
  },
  {
    name: "Sidetrade",
    logo: sidetradeLogo,
    url: "#",
    hasDedicatedPage: false,
    category: "enterprise",
    pricing: "Custom enterprise contract ($35,000 – $90,000+/yr)",
    bestFor: "Global enterprise credit departments seeking predictive AI (Aimie) trained on multi-trillion-dollar B2B payment data lakes to benchmark customer payment behaviors and recommend next-best collector actions.",
    tradeoff: "Enterprise data warehousing integration tailored for large corporate credit departments; primarily provides predictive behavioral guidance and prioritization queues for human collection staff.",
  },
  {
    name: "Emagia",
    logo: emagiaLogo,
    url: "#",
    hasDedicatedPage: false,
    category: "enterprise",
    pricing: "Custom enterprise modular SaaS ($40,000 – $100,000+/yr)",
    bestFor: "Global shared service organizations running SAP or Oracle that need an end-to-end digital Order-to-Cash suite with conversational AI (Gia), automated credit risk assessment, and global multi-currency cash application.",
    tradeoff: "Broad multi-module footprint requiring phased deployment across credit, collections, and cash app; entails substantial operational complexity, change management, and ongoing enterprise IT maintenance.",
  },
  {
    name: "Serrala",
    logo: serralaLogo,
    url: "#",
    hasDedicatedPage: false,
    category: "enterprise",
    pricing: "Custom enterprise license / SAP deployment ($60,000 – $180,000+/yr)",
    bestFor: "Multinational corporate treasuries running SAP ECC or S/4HANA that require native ABAP-embedded cash application (FS² AutoBank), complex bank lockbox processing, and multi-bank connectivity (EBICS/SWIFT).",
    tradeoff: "Specialized SAP-embedded core architecture requires dedicated SAP ABAP consultants, transport management, and heavy IT overhead; unsuitable for organizations seeking a fast, lightweight cloud deployment.",
  },
  {
    name: "BlackLine",
    logo: blacklineLogo,
    url: "#",
    hasDedicatedPage: false,
    category: "enterprise",
    pricing: "Custom modular enterprise license ($50,000 – $120,000+/yr)",
    bestFor: "Corporate controllers modernizing financial close accounting, balance sheet account substantiation, and automated invoice matching (via BlackLine AR / Rimilia) across complex multi-ERP landscapes.",
    tradeoff: "AR cash application is part of a broader, costly financial close and accounting transformation suite; high platform cost and implementation scope make it unfeasible for teams seeking dedicated collections automation.",
  },
];

export default function CompareHub() {
  const [selectedCategory, setSelectedCategory] = useState<"all" | "direct" | "portal" | "enterprise">("all");

  const directCount = COMPETITORS.filter((c) => c.category === "direct").length;
  const portalCount = COMPETITORS.filter((c) => c.category === "portal").length;
  const enterpriseCount = COMPETITORS.filter((c) => c.category === "enterprise").length;

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
    <div className="min-h-screen bg-[#010102] text-[#f7f8f8] font-sans antialiased selection:bg-[#5e6ad2]/30 selection:text-white">
      <SEOHead
        title="B2B AR Software Comparisons & Buyer's Guide | Jaktra"
        description="Compare leading B2B accounts receivable automation tools. Architectural comparisons of Jaktra vs HighRadius, Upflow, Chaser, Kolleno, and alternatives."
        canonicalPath="/compare"
        jsonLd={[
          compareHubSchema,
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Compare", path: "/compare" },
          ]),
        ]}
      />

      <GlobalNav />

      <main className="pt-24 pb-20 max-w-6xl mx-auto px-6 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(183,210,248,0.06),transparent)] pointer-events-none" />
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-zinc-400 font-sans relative z-10">
          <ol className="flex items-center gap-1.5">
            <li>
              <Link to="/" className="hover:text-zinc-200 transition-colors">
                Home
              </Link>
            </li>
            <li className="text-zinc-600">/</li>
            <li className="text-zinc-200 font-medium" aria-current="page">
              Compare
            </li>
          </ol>
        </nav>

        {/* Hero Section: Left-aligned, wide, clean masthead */}
        <header className="mb-8 pt-1">
          <div className="max-w-4xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight mb-3">
              <span className="block">Find the Right AR Platform.</span>
              <span className="block text-zinc-300">Without Vendor Marketing Spin.</span>
            </h1>
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-3xl">
              Every accounts receivable vendor claims "AI" and "automation." Here is an objective, architectural breakdown of the 16 leading platforms, evaluating implementation complexity, debtor payment friction, and true autonomous execution.
            </p>
          </div>
        </header>

        {/* The 3 Architectural Categories */}
        <section className="mb-8">
          <div className="mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-1">
              Understanding the 3 Architectural Categories
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
              Before comparing specific software features, understand which underlying architecture aligns with your team's bottleneck:
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
            {/* Col 1 */}
            <div className="p-4 sm:p-5 rounded-xl bg-[#0e0f11] border border-white/[0.08] space-y-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-[#0e1629] border border-[#3d5fb8]/40 flex items-center justify-center p-1.5 shrink-0 shadow-sm">
                  <img src={jaktraLogo} alt="Jaktra" className="w-full h-full object-contain" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">Jaktra</span>
                  <h3 className="text-sm sm:text-base font-bold text-white">Autonomous AI Execution</h3>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-zinc-300 leading-normal">
                Autonomous agent modulates tone across 5 stages, triages inbound disputes, and collects overdue cash end-to-end without hiring extra staff.
              </p>
              <ul className="space-y-1.5 text-xs text-zinc-300 pt-2 border-t border-white/[0.06]">
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#b7d2f8]" /> 15-minute cloud setup</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#b7d2f8]" /> Zero debtor login friction</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#b7d2f8]" /> 100% Free during Early Access</li>
              </ul>
            </div>

            {/* Col 2 */}
            <div className="p-4 sm:p-5 rounded-xl bg-[#0e0f11] border border-white/[0.08] space-y-2.5">
              <div className="flex items-center gap-2.5">
                <SlidingLogoIcon logos={PORTAL_LOGOS} interval={3000} />
                <div>
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">Invoiced, Gaviti, YayPay</span>
                  <h3 className="text-sm sm:text-base font-bold text-white">Portals &amp; Task Lists</h3>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-zinc-300 leading-normal">
                Focuses on self-service customer billing portals and task queues that tell human collectors who to phone each day. Requires dedicated staff.
              </p>
              <ul className="space-y-1.5 text-xs text-zinc-300 pt-2 border-t border-white/[0.06]">
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-zinc-400" /> 2 to 6 week setup</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-zinc-400" /> Comprehensive portal dashboards</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-zinc-400" /> $10k–$25k/yr contracts</li>
              </ul>
            </div>

            {/* Col 3 */}
            <div className="p-4 sm:p-5 rounded-xl bg-[#0e0f11] border border-white/[0.08] space-y-2.5">
              <div className="flex items-center gap-2.5">
                <SlidingLogoIcon logos={ENTERPRISE_LOGOS} interval={3200} />
                <div>
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">HighRadius, Serrala</span>
                  <h3 className="text-sm sm:text-base font-bold text-white">Enterprise O2C &amp; Treasury</h3>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-zinc-300 leading-normal">
                Deeply integrated suites for Fortune 500 multinationals running SAP or Oracle. Handles physical check lockbox OCR and complex deduction clearing.
              </p>
              <ul className="space-y-1.5 text-xs text-zinc-300 pt-2 border-t border-white/[0.06]">
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-zinc-400" /> 6 to 12 month implementation</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-zinc-400" /> Heavy ERP cash application</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-zinc-400" /> $50k–$150k+/yr licensing</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Competitor Battlecards Roster: Compact & Conversable */}
        <section className="mb-8">
          <div className="mb-4 space-y-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-1">
                Accounts Receivable Platform Directory
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
                Compare verified pricing, target workflows, and architectural tradeoffs across all {COMPETITORS.length} platforms.
              </p>
            </div>

            {/* Filter Pills Bar */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#0e0f11] rounded-xl border border-white/[0.08] shadow-md w-fit">
              {(
                [
                  { id: "all", label: `All Platforms (${COMPETITORS.length})` },
                  { id: "direct", label: `Dunning & AI (${directCount})` },
                  { id: "portal", label: `Portals & Tasks (${portalCount})` },
                  { id: "enterprise", label: `Enterprise O2C (${enterpriseCount})` },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedCategory === cat.id
                      ? "bg-white text-zinc-950 font-bold shadow-sm"
                      : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3.5">
            {filteredCompetitors.map((comp, idx) => (
              <div
                key={idx}
                className="p-4 sm:p-5 rounded-xl bg-[#0e0f11] border border-white/[0.08] hover:border-white/[0.16] transition-all group shadow-sm space-y-3.5"
              >
                {/* Header: Logo, Name & Pricing */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${
                        comp.isJaktra
                          ? "bg-[#0e1629] border border-white/20 p-1.5"
                          : "bg-white border border-white/20 p-1"
                      }`}
                    >
                      <img
                        src={comp.logo}
                        alt={comp.name}
                        className="max-w-full max-h-full object-contain"
                        loading="lazy"
                      />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-[#b7d2f8] transition-colors">
                      {comp.name}
                    </h3>
                  </div>

                  {/* Metadata: Real Pricing */}
                  <div className="flex items-center gap-1.5 bg-white/[0.03] px-2.5 py-1 rounded-md border border-white/[0.06] text-xs font-mono">
                    <span className="text-zinc-500">Pricing:</span>
                    <span className="text-zinc-200 font-medium">{comp.pricing}</span>
                  </div>
                </div>

                {/* Body: Natural Description & Architectural Tradeoff */}
                <div className="space-y-2.5 text-xs sm:text-sm">
                  <p className="text-zinc-300 leading-relaxed">
                    {comp.bestFor}
                  </p>

                  <div className="border-l-2 border-zinc-700/80 group-hover:border-zinc-500/80 transition-colors pl-3 py-0.5 text-xs leading-relaxed text-zinc-400">
                    <span className="font-semibold text-zinc-300 mr-1.5">Tradeoff:</span>
                    <span>{comp.tradeoff}</span>
                  </div>
                </div>

                {/* Footer Links */}
                {(comp.hasDedicatedPage || comp.alternativesUrl) && (
                  <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between flex-wrap gap-2 text-xs">
                    {comp.hasDedicatedPage && (
                      <Link
                        to={comp.url}
                        className="inline-flex items-center gap-1.5 font-semibold text-[#b7d2f8] hover:text-white transition-colors"
                      >
                        <span>
                          {comp.isJaktra
                            ? "Explore Jaktra autonomous collections architecture"
                            : `Jaktra vs ${comp.name} 1v1 comparison`}
                        </span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    )}
                    {comp.alternativesUrl && (
                      <Link
                        to={comp.alternativesUrl}
                        className="inline-flex items-center gap-1 font-medium text-zinc-400 hover:text-white transition-colors"
                      >
                        <span>Top {comp.name} Alternatives Guide →</span>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* FAQs Section */}
        <section className="border border-white/[0.08] rounded-xl bg-[#0e0f11] p-5 sm:p-7 mb-8 shadow-md">
          <div className="max-w-2xl mb-5">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-1">
              Frequently Asked Buyer Questions
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Key considerations for CFOs, Controllers, and Credit Managers evaluating software alternatives.
            </p>
          </div>

          <Accordion type="single" variant="outline" defaultValue="faq-0" collapsible className="w-full">
            {faqs.map((faq, idx) => (
              <AccordionItem key={idx} value={`faq-${idx}`} className="border-b border-white/[0.08] py-1.5">
                <AccordionTrigger className="text-left font-semibold text-white text-sm sm:text-base hover:no-underline hover:text-[#b7d2f8] transition-colors py-3">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-zinc-300 text-xs sm:text-sm leading-normal pb-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* Bottom Horizon CTA */}
        <section className="border border-white/[0.08] rounded-xl bg-[#0e0f11] p-6 sm:p-8 text-center relative shadow-md mb-8">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Try Autonomous AI Collections Free Today
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-normal">
              Skip the multi-month sales demo and systems integration cycle. Connect your transactional email in 15 minutes and start recovering overdue receivables today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                to="/register"
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-white text-zinc-950 font-semibold text-xs sm:text-sm hover:bg-zinc-200 transition-colors shadow-sm"
              >
                Start Collecting Free
              </Link>
              <Link
                to="/pricing"
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white font-medium text-xs sm:text-sm hover:bg-white/[0.08] transition-colors"
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

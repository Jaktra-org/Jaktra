import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  XCircle,
  FileText,
  Calendar,
  User,
  Clock,
  ChevronRight,
  Lightbulb,
} from "lucide-react";
import { SEOHead } from "@/seo/components/SEOHead";
import { bestFinanceAutomationSchema, breadcrumbSchema } from "@/seo/schemas";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { GlobalNav } from "@/components/common/GlobalNav";

// Logo imports
import jaktraLogo from "@/assets/jaktra_svg.svg";
import upflowLogo from "@/assets/competition/upflow.svg";
import chaserLogo from "@/assets/competition/chaser.png";
import highradiusLogo from "@/assets/competition/cropped-HighRadius-Stack-Logo-full-color-1-1-32x32.png";
import kollenoLogo from "@/assets/competition/kolleno.png";
import paidniceLogo from "@/assets/competition/paidnice.png";
import gavitiLogo from "@/assets/competition/gaviti.png";
import tesorioLogo from "@/assets/competition/tesorio-icon.svg";
import versapayLogo from "@/assets/competition/versapay.png";
import billtrustLogo from "@/assets/competition/billtrust.png";
import invoicedLogo from "@/assets/competition/invoiced.com.png";
import yaypayLogo from "@/assets/competition/yaypay-logo-icon.svg";
import blacklineLogo from "@/assets/competition/blackline.png";
import emagiaLogo from "@/assets/competition/emagia.png";
import sidetradeLogo from "@/assets/competition/sidetrade-logo-2026-DB.svg";

interface ToolProfile {
  id: string;
  name: string;
  logo: string;
  logoBg?: string;
  badge: string;
  rating: string;
  tagline: string;
  overview: string;
  strengths: string[];
  limitations: string[];
  bestFor: string;
  pricingOverview: string;
  isFeatured?: boolean;
}

const FEATURED_TOOLS: ToolProfile[] = [
  {
    id: "jaktra",
    name: "Jaktra",
    logo: jaktraLogo,
    badge: "Autonomous AR & Dispute Triage",
    rating: "4.9 / 5.0",
    tagline: "Autonomous B2B accounts receivable platform with calibrated tone escalation, dispute triage, and 1-click payments.",
    overview:
      "Jaktra represents the next generation of accounts receivable automation. Rather than blasting the exact same rigid email template every week, Jaktra automatically modulates communication urgency across a 5-stage curve—from polite courtesy reminders to formal pre-legal demands. Crucially, Jaktra includes closed-loop dispute triage: the moment a customer replies with a billing question or pricing dispute, automated outreach pauses instantly to prevent customer friction.",
    strengths: [
      "Calibrated 5-stage tone escalation that prevents recipient template blindness",
      "Automatic inbound reply triage: instantly detects disputes and freezes cadences",
      "1-click zero-login settlement links that eliminate customer portal password friction",
      "Built-in flexible 2x, 3x, or 4x installment payment plan options for cash-delayed accounts",
      "15-minute quick setup with direct ledger synchronization for QuickBooks, Xero, and CSV",
      "100% free during Early Access with unlimited invoices and zero credit card required",
    ],
    limitations: [
      "Focused specifically on Accounts Receivable follow-up execution rather than accounts payable bill pay or treasury management",
    ],
    bestFor:
      "B2B SaaS, digital agencies, wholesale distributors, and professional services looking to accelerate cash collection without damaging client relationships.",
    pricingOverview: "100% free during Early Access; transparent volume tiers at general availability.",
    isFeatured: true,
  },
  {
    id: "upflow",
    name: "Upflow",
    logo: upflowLogo,
    logoBg: "bg-white",
    badge: "AR Dashboard & Cadences",
    rating: "4.4 / 5.0",
    tagline: "Centralized accounts receivable dashboard with scheduled email sequences and aging analytics.",
    overview:
      "Upflow was an early innovator in modern B2B accounts receivable management. It provides finance controllers with clear visibility into aging buckets, DSO tracking, and multi-step scheduled email cadences directly connected to billing engines like Stripe, Chargebee, and Xero.",
    strengths: [
      "Intuitive, clean reporting on aging buckets and overall receivables performance",
      "Pre-built integrations with major subscription billing providers (Stripe, Chargebee)",
      "Standard debtor customer portal with integrated payment gateway support",
    ],
    limitations: [
      "Relies on static email templates that can lead to template blindness when sent repeatedly",
      "Does not automatically parse inbound reply sentiment—outbound emails can continue if not manually paused",
      "High starting price point ($500+/month) with invoice volume thresholds",
    ],
    bestFor:
      "Subscription businesses with standard reminder needs that already operate on Stripe or Chargebee.",
    pricingOverview: "Starts around $500–$1,000/month with onboarding setup fees.",
  },
  {
    id: "chaser",
    name: "Chaser",
    logo: chaserLogo,
    badge: "SME Accounting Add-on",
    rating: "4.3 / 5.0",
    tagline: "Credit control and invoice chasing application built for Xero and QuickBooks Online.",
    overview:
      "Chaser offers automated invoice chasing tailored for small and mid-sized businesses using QuickBooks and Xero. It enables accounting teams to configure scheduled email reminders and integrates commercial credit scoring data feeds.",
    strengths: [
      "Tight, seamless two-way synchronization with Xero and QuickBooks Online",
      "Integrated commercial credit checking to assess customer risk before extending terms",
      "Manual debtor call logging and payment tracking for internal finance teams",
    ],
    limitations: [
      "Basic static email templates with limited dynamic context customization",
      "No automated self-service installment plan engine for cash-strapped debtors",
      "Does not automatically pause cadences based on email reply sentiment",
    ],
    bestFor:
      "Small businesses and boutique agencies running on Xero who need a straightforward scheduled email reminder tool.",
    pricingOverview: "Starts at approximately $150–$300/month based on active debtor volume.",
  },
  {
    id: "kolleno",
    name: "Kolleno",
    logo: kollenoLogo,
    badge: "Mid-Market AR & Reconciliation",
    rating: "4.6 / 5.0",
    tagline: "All-in-one accounts receivable management, multi-channel communication, and bank reconciliation.",
    overview:
      "Kolleno is a comprehensive AR management platform designed for mid-market finance departments. It combines multi-channel customer communications (email, SMS, call tasks) with automated bank reconciliation and cash application across major ERPs.",
    strengths: [
      "Multi-channel outreach support across email, SMS, and scheduled phone call tasks",
      "Automated open banking reconciliation and ERP synchronization",
      "Comprehensive credit risk monitoring and workflow task assignments",
    ],
    limitations: [
      "Steeper learning curve and multi-week implementation process compared to lightweight tools",
      "Requires higher software budget suitable primarily for established mid-market teams",
    ],
    bestFor:
      "Mid-market finance teams needing a unified hub for multi-channel communications, collections tasks, and bank reconciliation.",
    pricingOverview: "Custom mid-market annual contracts, generally starting around $6,000+/year.",
  },
  {
    id: "highradius",
    name: "HighRadius",
    logo: highradiusLogo,
    badge: "Enterprise Order-to-Cash Suite",
    rating: "4.2 / 5.0",
    tagline: "Enterprise order-to-cash platform with AI cash application, lockbox parsing, and credit management.",
    overview:
      "HighRadius is an enterprise software platform purpose-built for Global 2000 enterprises running SAP and Oracle. It provides deep bank lockbox parsing, check optical character recognition (OCR), complex credit underwriting, and robotic process automation.",
    strengths: [
      "Deep bank lockbox parsing and automated check image OCR for high-volume enterprise checks",
      "Sophisticated credit risk scoring and credit limit governance algorithms",
      "Scales across global corporations with hundreds of legal entities and subsidiaries",
    ],
    limitations: [
      "Lengthy 6–12 month implementation timeline requiring specialized systems consultants",
      "Rigid enterprise architecture that is far too heavy and expensive for mid-market teams",
      "High annual licensing costs typically starting at $50,000+ per year",
    ],
    bestFor:
      "Global enterprises ($200M+ revenue) with large accounting teams running on-premise SAP or Oracle ERPs.",
    pricingOverview: "Custom enterprise licensing, typically $50,000–$100,000+/year.",
  },
  {
    id: "paidnice",
    name: "PaidNice",
    logo: paidniceLogo,
    badge: "Prompt Discounts & Late Fees",
    rating: "4.4 / 5.0",
    tagline: "Automated invoice chasing with dynamic prompt payment discounts and late fee application.",
    overview:
      "PaidNice is an accounts receivable add-on designed specifically for Xero and QuickBooks users who want to automate late fee calculations and prompt payment discounts. It automatically applies fees or discounts to invoices based on aging rules.",
    strengths: [
      "Automates early-payment discount incentives and late payment penalty fees directly on invoices",
      "Simple setup with direct sync to QuickBooks and Xero",
      "Automated email and SMS reminder schedules",
    ],
    limitations: [
      "Primarily focused on fee and discount automation rather than dynamic tone modulation or dispute resolution",
      "Best suited for small business ledgers rather than complex multi-subsidiary enterprise setups",
    ],
    bestFor:
      "Small businesses and service firms looking to incentivize faster payments through automated early discounts or late fees.",
    pricingOverview: "Starts around $49–$199/month depending on invoice volume.",
  },
  {
    id: "gaviti",
    name: "Gaviti",
    logo: gavitiLogo,
    badge: "Receivables Workflow Automation",
    rating: "4.5 / 5.0",
    tagline: "A/R collections management software that automates customer communication workflows.",
    overview:
      "Gaviti helps B2B accounting teams streamline collections workflows by mapping customized communication trees. It connects to various ERPs and automates reminder tasks based on customer segments and balance sizes.",
    strengths: [
      "Flexible workflow builder for custom communication sequences and internal tasks",
      "Broad ERP compatibility including NetSuite, QuickBooks, Sage, and SAP Business One",
      "Actionable reporting on collector efficiency and overdue balance recovery",
    ],
    limitations: [
      "Requires upfront configuration to map multi-step communication logic",
      "Pricing geared toward mid-market and enterprise budgets with annual agreements",
    ],
    bestFor:
      "Mid-sized finance departments with dedicated credit controllers wanting customized rule-based collection workflows.",
    pricingOverview: "Custom annual quotes, typically starting around $5,000–$10,000/year.",
  },
  {
    id: "tesorio",
    name: "Tesorio",
    logo: tesorioLogo,
    badge: "Cash Flow & A/R Platform",
    rating: "4.5 / 5.0",
    tagline: "Connected finance platform combining accounts receivable automation with cash flow forecasting.",
    overview:
      "Tesorio integrates accounts receivable automation with cash forecasting. By analyzing historical payment trends and customer behaviors, it gives finance teams predictive insights into when invoices will actually be paid.",
    strengths: [
      "Combines AR collection cadences with real-time cash flow forecasting models",
      "Deep integration with NetSuite, Sage Intacct, and Salesforce",
      "Predictive payment timing insights based on historical payer velocity",
    ],
    limitations: [
      "More complex to deploy than standalone reminder tools due to forecasting data requirements",
      "Priced for mid-market and enterprise companies with dedicated FP&A teams",
    ],
    bestFor:
      "High-growth mid-market tech and services companies that want integrated AR management and 13-week cash forecasting.",
    pricingOverview: "Custom annual contracts, typically starting around $12,000+/year.",
  },
  {
    id: "versapay",
    name: "Versapay",
    logo: versapayLogo,
    badge: "Collaborative AR & Portals",
    rating: "4.3 / 5.0",
    tagline: "Collaborative accounts receivable software with integrated buyer payment portals and dispute chat.",
    overview:
      "Versapay focuses on collaborative A/R, offering an interactive cloud portal where buyers and sellers can view invoices, ask questions, resolve line-item discrepancies, and make digital payments in one place.",
    strengths: [
      "Shared portal environment where buyers and sellers can message directly on invoice line items",
      "Omni-channel payment processing supporting ACH, credit cards, and virtual cards",
      "Strong integrations with Microsoft Dynamics, NetSuite, and Sage Intacct",
    ],
    limitations: [
      "Requires buyers to actively engage with a portal environment, which some accounts payable teams resist",
      "Significant implementation scope requiring IT alignment and payment gateway configuration",
    ],
    bestFor:
      "Mid-market to enterprise B2B distributors and suppliers with high transaction volume who want collaborative invoice resolution.",
    pricingOverview: "Custom enterprise pricing based on transaction volume and ERP complexity.",
  },
  {
    id: "billtrust",
    name: "Billtrust",
    logo: billtrustLogo,
    badge: "Enterprise Invoicing & Payments",
    rating: "4.2 / 5.0",
    tagline: "End-to-end B2B order-to-cash platform covering electronic invoicing, payment capture, and cash application.",
    overview:
      "Billtrust is an established enterprise order-to-cash platform widely used in wholesale, manufacturing, and distribution. It specializes in automating multi-channel invoice delivery, business payments, and digital lockbox processing.",
    strengths: [
      "Robust B2B digital payment network (Business Payments Network - BPN)",
      "High-volume print, mail, and electronic multi-channel invoice dispatch",
      "Automated cash application matching electronic remittance advice to open invoices",
    ],
    limitations: [
      "Traditional enterprise software footprint with lengthy rollout periods",
      "Heavy fee structures tailored for large transaction volumes and large corporate contracts",
    ],
    bestFor:
      "Large-scale commercial suppliers and manufacturers processing high invoice volumes with complex payment delivery needs.",
    pricingOverview: "Custom enterprise contracts with setup fees and transaction-based pricing.",
  },
];

const HONORABLE_MENTIONS = [
  { name: "Invoiced", logo: invoicedLogo, desc: "A/R billing automation with payment plans and customer portal." },
  { name: "YayPay by Quadient", logo: yaypayLogo, desc: "Predictive A/R management with communications tracking." },
  { name: "BlackLine", logo: blacklineLogo, desc: "Enterprise cash application and financial close automation." },
  { name: "Emagia", logo: emagiaLogo, desc: "Autonomous order-to-cash platform for large enterprises." },
  { name: "Sidetrade", logo: sidetradeLogo, desc: "AI-driven order-to-cash and B2B payment intelligence." },
];

const COMPARISON_COLUMNS = [
  { key: "bestFor", label: "Best For" },
  { key: "toneEscalation", label: "Tone Escalation" },
  { key: "disputeHandling", label: "Dispute Handling" },
  { key: "paymentFriction", label: "Payment Method" },
  { key: "typicalPricing", label: "Typical Pricing" },
];

const COMPARISON_DATA = [
  {
    name: "Jaktra",
    logo: jaktraLogo,
    bestFor: "Fast-growing B2B SaaS, agencies & distributors",
    toneEscalation: "Automated 5-stage progressive tone",
    disputeHandling: "Auto-detects disputes & freezes cadences",
    paymentFriction: "1-click zero-login link + installments",
    typicalPricing: "100% Free (Early Access)",
    highlight: true,
  },
  {
    name: "Upflow",
    logo: upflowLogo,
    logoBg: "bg-white",
    bestFor: "Subscription companies on Stripe / Chargebee",
    toneEscalation: "Static scheduled templates",
    disputeHandling: "Manual inbox review",
    paymentFriction: "Customer billing portal login",
    typicalPricing: "$500–$1,000+/mo",
    highlight: false,
  },
  {
    name: "Chaser",
    logo: chaserLogo,
    bestFor: "Small businesses on Xero & QuickBooks",
    toneEscalation: "Scheduled email sequences",
    disputeHandling: "Manual review",
    paymentFriction: "Standard payment portal",
    typicalPricing: "$150–$300/mo",
    highlight: false,
  },
  {
    name: "Kolleno",
    logo: kollenoLogo,
    bestFor: "Mid-market AR & bank reconciliation",
    toneEscalation: "Multi-channel custom workflows",
    disputeHandling: "Manual task assignment",
    paymentFriction: "Customer portal & open banking",
    typicalPricing: "$6,000+/year",
    highlight: false,
  },
  {
    name: "HighRadius",
    logo: highradiusLogo,
    bestFor: "Global enterprises ($200M+) on SAP / Oracle",
    toneEscalation: "Rule-based enterprise templates",
    disputeHandling: "Complex enterprise approval workflows",
    paymentFriction: "Enterprise ERP lockbox / check OCR",
    typicalPricing: "$50,000+/year",
    highlight: false,
  },
  {
    name: "PaidNice",
    logo: paidniceLogo,
    bestFor: "SMEs wanting automated early discounts & fees",
    toneEscalation: "Scheduled email & SMS reminders",
    disputeHandling: "Manual pause",
    paymentFriction: "Standard invoice payment link",
    typicalPricing: "$49–$199/mo",
    highlight: false,
  },
  {
    name: "Gaviti",
    logo: gavitiLogo,
    bestFor: "Mid-market credit control teams",
    toneEscalation: "Custom workflow sequence tree",
    disputeHandling: "Manual dispute flagging",
    paymentFriction: "Customer portal",
    typicalPricing: "$5,000+/year",
    highlight: false,
  },
];

const FAQS = [
  {
    q: "What is the difference between Accounts Payable (AP) and Accounts Receivable (AR) software?",
    a: "Accounts Payable (AP) software manages the money flowing out of your business—ingesting vendor bills via OCR, routing manager approvals, and scheduling outgoing wire or card payments (e.g., Ramp, Tipalti, Bill.com). Accounts Receivable (AR) software manages the money flowing into your business—tracking unpaid customer invoices, sending calibrated collection reminders, resolving disputes, and accelerating cash collection into your bank (e.g., Jaktra, Upflow, Chaser).",
  },
  {
    q: "Why do static collection email templates stop working over time?",
    a: "When debtors receive the exact same copy-pasted reminder email multiple times, they develop 'template blindness.' They recognize it as an automated robot and simply tune it out. Worse, repetitive boilerplate text with urgent keywords can trigger corporate email spam filters. Modern tools solve this by progressively modulating tone across aging stages so that each message feels unique, personal, and calibrated.",
  },
  {
    q: "Do finance automation tools replace QuickBooks, Xero, or NetSuite?",
    a: "No. Finance automation software connects directly to your existing accounting system or ERP as a system of execution. Your general ledger remains the single source of truth for your chart of accounts and balance sheet, while the automation platform handles the repetitive work of following up with customers, detecting disputes, and recording payments.",
  },
  {
    q: "What should an AR automation tool do when a customer replies with a dispute?",
    a: "A good AR platform should immediately recognize the dispute and pause all automated follow-ups for that specific invoice. If automated emails continue firing while a customer is waiting for an answer on a disputed line item, it causes severe friction and damages the business relationship.",
  },
  {
    q: "How long does it take to implement a modern AR automation platform?",
    a: "Lightweight and modern platforms (like Jaktra, Chaser, or PaidNice) connect directly via cloud accounting APIs in 10 to 15 minutes. Heavy enterprise suites (like HighRadius or Billtrust) require custom ERP integrations and typically take 3 to 9 months to deploy.",
  },
];

export function BestFinanceAutomationGuide() {
  return (
    <div className="min-h-screen bg-[#010102] text-[#f7f8f8] font-sans antialiased selection:bg-[#5e6ad2]/30 selection:text-white">
      <SEOHead
        title="Best B2B Finance Automation Tools in 2026 | Jaktra"
        description="Compare the best B2B finance automation tools in 2026. Objective reviews of Jaktra, Upflow, Chaser, HighRadius, Kolleno, PaidNice, Gaviti, and more."
        canonicalPath="/resources/best-b2b-finance-automation-tools"
        jsonLd={[
          bestFinanceAutomationSchema,
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Resources", path: "/resources" },
            { name: "Best B2B Finance Automation Tools", path: "/resources/best-b2b-finance-automation-tools" },
          ]),
        ]}
      />

      <GlobalNav />

      <main className="pt-20 sm:pt-24 pb-20 px-4 sm:px-6 max-w-4xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-zinc-400">
          <Link to="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <Link to="/resources" className="hover:text-white transition-colors">
            Resources
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-zinc-200">Best B2B Finance Automation Tools</span>
        </nav>

        {/* Editorial Header */}
        <header className="mb-10 pb-8 border-b border-white/[0.08]">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#b7d2f8] font-semibold mb-3">
            <FileText className="w-3.5 h-3.5" />
            <span>Buyer&apos;s Guide &amp; Software Evaluation · 2026</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight text-white mb-4 leading-tight">
            10 Best B2B Finance Automation Tools in 2026 (Invoicing &amp; AR)
          </h1>

          <p className="text-base sm:text-lg text-zinc-300 leading-relaxed mb-6 font-normal">
            An objective evaluation of the leading B2B accounts receivable and invoicing automation platforms—from lightweight SME accounting add-ons to comprehensive mid-market and enterprise order-to-cash suites.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400">
            <Link to="/about" className="flex items-center gap-1.5 text-zinc-300 hover:text-white transition-colors">
              <User className="w-3.5 h-3.5 text-[#b7d2f8]" />
              <span className="font-medium">By Suresh Jakhar &amp; Jaktra Research Team</span>
            </Link>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" /> Updated September 2026
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-zinc-400" /> 12 min read
            </span>
          </div>
        </header>

        {/* Article Body */}
        <article className="space-y-12 text-base leading-relaxed text-zinc-300">
          {/* Executive Summary Insight Card */}
          <section className="p-6 rounded-2xl bg-[#0e0f12] border border-white/[0.08] space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Lightbulb className="w-4 h-4 text-[#b7d2f8]" />
              <span>The State of B2B Finance Automation in 2026</span>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed">
              Most accounting teams still chase customer receivables using spreadsheets, manual email follow-ups, and disconnected billing tools. This operational friction results in high Days Sales Outstanding (DSO), unresolved billing disputes, and unnecessary bad debt write-offs.
            </p>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Modern finance automation software solves this by connecting directly to your general ledger (QuickBooks, Xero, NetSuite, Sage), automatically executing polite yet persistent follow-ups, catching customer disputes early, and providing frictionless digital payment options.
            </p>
          </section>

          {/* Section 1: Quick-Glance Ranked Index Table with Logos */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Best B2B Finance Automation Tools at a Glance
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              A rapid comparison of the top platforms evaluated in this guide, ranked by capability, user feedback, and target customer fit:
            </p>

            <div className="rounded-xl border border-white/[0.08] bg-[#0c0d10] overflow-hidden shadow-lg my-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[620px]">
                  <thead>
                    <tr className="border-b border-white/[0.08] bg-[#08080a]">
                      <th className="py-3.5 px-4 font-mono text-[11px] uppercase tracking-wider text-[#b7d2f8] font-semibold w-16">
                        Rank
                      </th>
                      <th className="py-3.5 px-4 font-mono text-[11px] uppercase tracking-wider text-[#b7d2f8] font-semibold w-52">
                        Platform
                      </th>
                      <th className="py-3.5 px-4 font-mono text-[11px] uppercase tracking-wider text-[#b7d2f8] font-semibold">
                        Best For
                      </th>
                      <th className="py-3.5 px-4 font-mono text-[11px] uppercase tracking-wider text-[#b7d2f8] font-semibold text-right w-24">
                        Rating
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {FEATURED_TOOLS.map((tool, idx) => (
                      <tr
                        key={tool.id}
                        className={`transition-colors hover:bg-white/[0.02] ${
                          tool.isFeatured ? "bg-[#b7d2f8]/[0.02]" : ""
                        }`}
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-zinc-400">
                          {idx + 1}
                        </td>
                        <td className="py-3.5 px-4">
                          <a
                            href={`#review-${tool.id}`}
                            className="flex items-center gap-3 hover:text-[#b7d2f8] transition-colors group"
                          >
                            <div
                              className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 p-1 ${
                                tool.logoBg ? "bg-white border-white/20" : "bg-white/[0.04] border-white/[0.1]"
                              }`}
                            >
                              <img
                                src={tool.logo}
                                alt={`${tool.name} logo`}
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <span className="font-semibold text-white group-hover:text-[#b7d2f8] transition-colors">
                              {tool.name}
                            </span>
                          </a>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-zinc-300 leading-relaxed">
                          {tool.bestFor}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-mono font-bold text-right text-white whitespace-nowrap">
                          {tool.rating.split("/")[0].trim()} ★
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Section 2: Side-by-Side Feature Comparison Matrix */}
          <section className="space-y-4 pt-4">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Side-by-Side Feature Comparison
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Compare how the top platforms stack up across core accounts receivable operational capabilities:
            </p>

            <div className="rounded-xl border border-white/[0.08] bg-[#0c0d10] overflow-hidden shadow-lg my-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[700px]">
                  <thead>
                    <tr className="border-b border-white/[0.08] bg-[#08080a]">
                      <th className="p-3.5 font-semibold text-white w-40">Solution</th>
                      {COMPARISON_COLUMNS.map((col) => (
                        <th key={col.key} className="p-3.5 font-mono text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {COMPARISON_DATA.map((row, idx) => (
                      <tr
                        key={idx}
                        className={`transition-colors ${
                          row.highlight
                            ? "bg-[#b7d2f8]/[0.03] font-medium text-white"
                            : "text-zinc-300 hover:bg-white/[0.01]"
                        }`}
                      >
                        <td className="p-3.5 font-semibold text-white">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-6 h-6 rounded border flex items-center justify-center shrink-0 p-0.5 ${
                                row.logoBg ? "bg-white border-white/20" : "bg-white/[0.04] border-white/[0.08]"
                              }`}
                            >
                              <img src={row.logo} alt={`${row.name} logo`} className="w-full h-full object-contain" />
                            </div>
                            <span>{row.name}</span>
                          </div>
                        </td>
                        <td className="p-3.5 text-xs text-zinc-300">{row.bestFor}</td>
                        <td className="p-3.5 text-xs text-zinc-300">{row.toneEscalation}</td>
                        <td className="p-3.5 text-xs text-zinc-300">{row.disputeHandling}</td>
                        <td className="p-3.5 text-xs text-zinc-300">{row.paymentFriction}</td>
                        <td className="p-3.5 text-xs font-mono text-zinc-200">{row.typicalPricing}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Section 3: In-Depth Platform Reviews */}
          <section className="space-y-10 pt-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
                Detailed Platform Reviews
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Comprehensive breakdowns of each platform&apos;s architecture, strengths, limitations, and target customer fit:
              </p>
            </div>

            {FEATURED_TOOLS.map((tool, idx) => (
              <div
                key={tool.id}
                id={`review-${tool.id}`}
                className="p-6 sm:p-8 rounded-2xl bg-[#0c0d10] border border-white/[0.08] space-y-5 shadow-xl scroll-mt-20"
              >
                {/* Header with Platform Logo */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 shadow-sm p-2 ${
                        tool.logoBg ? "bg-white border-white/20" : "bg-white/[0.04] border-white/[0.1]"
                      }`}
                    >
                      <img
                        src={tool.logo}
                        alt={`${tool.name} logo`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-zinc-400 font-bold">
                          #{idx + 1}
                        </span>
                        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                          {tool.name}
                        </h3>
                        <span className="text-xs font-mono px-2 py-0.5 rounded border border-white/[0.1] bg-white/[0.04] text-zinc-300">
                          {tool.badge}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5">{tool.tagline}</p>
                    </div>
                  </div>

                  <div className="text-xs font-bold font-mono text-white px-3 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] self-start sm:self-auto">
                    ★ {tool.rating}
                  </div>
                </div>

                {/* Best For Tag */}
                <div className="text-xs sm:text-sm text-zinc-300">
                  <strong className="text-white font-medium mr-1.5">Best For:</strong>
                  {tool.bestFor}
                </div>

                {/* Overview Text */}
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  {tool.overview}
                </p>

                {/* Strengths */}
                <div className="space-y-2">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                    Key Strengths:
                  </h4>
                  <ul className="space-y-2 text-xs sm:text-sm text-zinc-300">
                    {tool.strengths.map((s, sIdx) => (
                      <li key={sIdx} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#b7d2f8] shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Limitations */}
                <div className="space-y-2">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                    Key Trade-Offs &amp; Limitations:
                  </h4>
                  <ul className="space-y-2 text-xs sm:text-sm text-zinc-400">
                    {tool.limitations.map((l, lIdx) => (
                      <li key={lIdx} className="flex items-start gap-2.5">
                        <XCircle className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{l}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pricing & CTA Footer */}
                <div className="pt-3 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="text-zinc-400">
                    <strong className="text-zinc-300 font-medium mr-1.5">Pricing:</strong>
                    <span className="font-mono text-zinc-200">{tool.pricingOverview}</span>
                  </div>

                  {tool.isFeatured && (
                    <Link
                      to="/register"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white text-zinc-950 font-semibold text-xs hover:bg-zinc-200 transition-colors shadow-sm self-start sm:self-auto"
                    >
                      <span>Try Jaktra Free</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </section>

          {/* Section 4: Honorable Mentions */}
          <section className="space-y-4 pt-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Other Notable Finance &amp; AR Platforms
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Additional established platforms serving specialized enterprise or niche accounting requirements:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 my-3">
              {HONORABLE_MENTIONS.map((tool, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#0c0d10] border border-white/[0.06] flex items-start gap-3"
                >
                  <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.1] p-1.5 flex items-center justify-center shrink-0">
                    <img src={tool.logo} alt={`${tool.name} logo`} className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{tool.name}</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed mt-0.5">{tool.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 5: How to Choose */}
          <section className="space-y-4 pt-4">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              How to Choose the Right AR Automation Platform
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              When evaluating B2B finance and accounts receivable automation software, focus on these four foundational questions:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
              <div className="p-5 rounded-xl bg-[#0c0d10] border border-white/[0.08] space-y-2">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  <span>1. Does it handle inbound dispute replies?</span>
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Over 40% of overdue invoices stem from billing questions or missing purchase orders. If your tool keeps sending automated reminders after a customer reports an issue, it will infuriate them. Look for tools that automatically detect dispute sentiment and freeze outreach.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-[#0c0d10] border border-white/[0.08] space-y-2">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span>2. How easy is it for customers to pay?</span>
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Forcing accounts payable clerks to create an account and remember a password to view an invoice creates high drop-off. Zero-login tokenized payment links and automated installment options significantly accelerate payment velocity.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-[#0c0d10] border border-white/[0.08] space-y-2">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>3. Does it protect sender reputation?</span>
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Blasting the exact same template repeatedly causes Google Workspace and Microsoft 365 to flag your domain as spam. Look for solutions with dynamic tone modulation and sensible sending cadences.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-[#0c0d10] border border-white/[0.08] space-y-2">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  <span>4. What is the true time-to-value?</span>
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Avoid paying for heavy enterprise platforms that take 6 to 12 months to deploy if you simply need automated customer follow-ups and dispute triage. Choose tools with fast API or CSV connections that provide immediate results.
                </p>
              </div>
            </div>
          </section>

          {/* Section 6: Frequently Asked Questions */}
          <section className="space-y-4 pt-4">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Clear answers to common questions about selecting B2B accounts receivable and finance automation tools:
            </p>

            <div className="rounded-xl border border-white/[0.08] bg-[#0c0d10] p-5 sm:p-6 shadow-xl">
              <Accordion type="single" variant="outline" defaultValue="faq-0" collapsible className="w-full">
                {FAQS.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`}>
                    <AccordionTrigger className="text-left font-medium text-white hover:text-[#b7d2f8] cursor-pointer">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-zinc-300 leading-relaxed pt-2">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>

          {/* Section 7: Subtle Bottom CTA Banner */}
          <section className="p-6 sm:p-8 rounded-2xl bg-[#0e0f12] border border-white/[0.08] text-center space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Try Autonomous AR Follow-Ups with Jaktra
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
              Stop chasing late payments manually. Connect your ledger in 15 minutes to automate calibrated tone escalation, dispute triage, and 1-click customer payments.
            </p>
            <div className="pt-2">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-zinc-950 text-xs sm:text-sm font-semibold hover:bg-zinc-200 transition-colors shadow-md"
              >
                <span>Deploy Free (No Credit Card)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </section>
        </article>
      </main>

      <LandingFooter />
    </div>
  );
}

export default BestFinanceAutomationGuide;

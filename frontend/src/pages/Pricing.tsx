import { useState, useId } from "react";
import { Link } from "react-router-dom";
import { Check, ArrowRight, Calculator, Zap, Sparkles } from "lucide-react";
import jaktraLogo from "../assets/jaktra_svg.svg";
import { SEOHead } from "../components/common/SEOHead";
import { pricingPageSchema, breadcrumbSchema } from "../components/common/seo-schemas";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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
          <Link to="/pricing" className="text-sm text-white font-medium transition-colors hidden sm:block">
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

interface EarlyAccessPillar {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  badge: string;
  content: React.ReactNode;
}

const EARLY_ACCESS_PILLARS: EarlyAccessPillar[] = [
  {
    id: "unlimited-scale",
    number: "01",
    title: "Unrestricted Ledger Scale (Zero Artificial Paywalls)",
    subtitle: "No invoice limits, seat fees, or forced credit card commitments",
    badge: "Full Access",
    content: (
      <div className="space-y-4 pt-1 text-sm text-zinc-300 leading-relaxed">
        <p>
          Legacy AR vendors lock advanced automation behind mandatory five-figure annual contracts or cripple self-serve
          tiers with 25-invoice ceilings. During Early Access, Jaktra grants unrestricted volume capacity, letting your
          finance team connect unlimited ledgers and process full receivables portfolios without billing friction.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-3.5 rounded-xl border border-white/[0.08] bg-[#0a0a0b]/60">
            <div className="text-xs font-semibold text-white uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#b7d2f8]" />
              Unlimited Team Seats
            </div>
            <p className="text-xs text-zinc-400">
              Invite finance directors, credit controllers, account managers, and executives with granular RBAC permissions.
            </p>
          </div>
          <div className="p-3.5 rounded-xl border border-white/[0.08] bg-[#0a0a0b]/60">
            <div className="text-xs font-semibold text-[#b7d2f8] uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#b7d2f8]" />
              No Credit Card Required
            </div>
            <p className="text-xs text-zinc-400">
              Instant activation with zero auto-renew traps or unexpected billing surprises down the road.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "full-ai-engine",
    number: "02",
    title: "Production AI & Predictive Risk Engine Included",
    subtitle: "5-stage tone escalation, dispute NLP triage, and ML scoring",
    badge: "Enterprise AI",
    content: (
      <div className="space-y-4 pt-1 text-sm text-zinc-300 leading-relaxed">
        <p>
          Every Early Access account receives full access to our Groq LLaMA 3.1 8B inference layer and multi-vector ML
          risk scoring engine. Autonomously triage customer disputes, modulate reminder tone from gentle nudges to legal
          warnings, and pinpoint high-risk delinquent accounts before default happens.
        </p>
        <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0a0a0b]/60 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4 text-[#b7d2f8]" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white mb-1">Autonomous Customer Sentiment Classification</div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              When a customer replies with a billing dispute or missing documentation query, the agent pauses aggressive
              cadences immediately and prepares an executive draft for your approval.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "zero-take-rate",
    number: "03",
    title: "Direct Payment Settlement (Zero Transaction Take-Rates)",
    subtitle: "Direct-to-bank settlements with zero intermediary platform taxes",
    badge: "Direct Payouts",
    content: (
      <div className="space-y-4 pt-1 text-sm text-zinc-300 leading-relaxed">
        <p>
          Unlike platforms that siphon a percentage fee (0.5% – 1.5%) off every recovered invoice, Jaktra routes all debtor
          settlements directly through your corporate payment gateway (Razorpay UPI, NetBanking, Cards, NEFT). You keep
          100% of your recovered working capital.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3 rounded-xl border border-white/[0.08] bg-[#0a0a0b]/60 text-center">
            <div className="text-xs font-semibold text-white mb-1 font-mono">0.0%</div>
            <p className="text-[11px] text-zinc-400">Jaktra Platform Take Rate</p>
          </div>
          <div className="p-3 rounded-xl border border-white/[0.08] bg-[#0a0a0b]/60 text-center">
            <div className="text-xs font-semibold text-white mb-1 font-mono">Real-Time</div>
            <p className="text-[11px] text-zinc-400">Webhook Reconcilement</p>
          </div>
          <div className="p-3 rounded-xl border border-white/[0.08] bg-[#0a0a0b]/60 text-center">
            <div className="text-xs font-semibold text-[#b7d2f8] mb-1 font-mono">T+0 / T+1</div>
            <p className="text-[11px] text-zinc-400">Direct Bank Settlement</p>
          </div>
        </div>
      </div>
    ),
  },
];

export function Pricing() {
  const [invoiceVolume, setInvoiceVolume] = useState<number>(250000);
  const [daysOverdue, setDaysOverdue] = useState<number>(24);

  const volumeSliderId = useId();
  const daysSliderId = useId();

  // Financial ROI calculations based on standard treasury formula
  const daysReduction = Math.min(18, Math.max(5, Math.round(daysOverdue * 0.5)));
  const annualSales = invoiceVolume * 12;
  const releasedCash = Math.round((annualSales / 365) * daysReduction);
  const capitalSavings = Math.round(releasedCash * 0.08); // 8% cost of capital

  const faqs = [
    {
      q: "Is Jaktra truly free during Early Access?",
      a: "Yes. Jaktra is 100% free during our Early Access program with zero credit card required. You get full, unrestricted access to the complete 5-stage AI tone escalation engine, dispute triage, tokenized payment portals, and predictive ML risk scoring.",
    },
    {
      q: "Are there any invoice limits during Early Access?",
      a: "No. During early access, there are no artificial invoice limits or restrictive paywalls. You can connect your ledger, import invoices, and automate collections freely.",
    },
    {
      q: "How does the 5-stage AI tone escalation work?",
      a: "Jaktra uses Groq LLaMA 3.1 8B inference to dynamically modulate email tone across 5 stages (Warm Reminder → Direct Confirmation → Serious Notice → Stern Warning → Legal Stop) tailored to customer aging, payment history, and dispute status.",
    },
    {
      q: "Can I connect my own payment gateway?",
      a: "Yes. Jaktra natively connects with Razorpay (supporting UPI, NetBanking, Cards, and direct bank transfers) with instant webhook reconciliation, and features an extensible gateway architecture for enterprise custom integrations and upcoming Stripe connectors.",
    },
    {
      q: "How does automated dispute triage work?",
      a: "When a customer replies with an invoice complaint or inquiry, our AI sentiment analyzer classifies the dispute, halts aggressive escalation cadences automatically, and drafts an executive response for your team to approve.",
    },
    {
      q: "Is our financial data safe and isolated?",
      a: "Absolutely. Jaktra uses tenant-isolated database architecture with AES-256 encryption at rest and TLS 1.3 in transit. Debtor portals use secure cryptographic tokens with no debtor password required.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-zinc-100 font-sans selection:bg-[#b7d2f8]/20 selection:text-white">
      <SEOHead
        title="Jaktra Pricing — 100% Free During Early Access"
        description="Jaktra is 100% free during Early Access. Automate B2B accounts receivable with 5-stage AI tone escalation, dispute triage, and tokenized payment portals with zero credit card required."
        canonicalPath="/pricing"
        jsonLd={[pricingPageSchema, breadcrumbSchema([{ name: "Pricing", path: "/pricing" }])]}
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
              Pricing
            </li>
          </ol>
        </nav>

        {/* Hero Title & Subheading with Spacious Flow */}
        <div className="text-center max-w-3xl mx-auto mb-20 sm:mb-24 pt-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] text-zinc-300 text-xs font-mono mb-6">
            <Zap className="w-3.5 h-3.5 text-[#b7d2f8]" />
            <span>100% Free During Early Access • Zero Credit Card Required</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 leading-[1.12]">
            Simple, 100% Free Accounts Receivable Automation
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            Jaktra is completely free during our public Early Access phase. Autonomously accelerate cash flow, cut Days Sales Outstanding (DSO), and resolve invoice disputes with no credit card required.
          </p>
        </div>

        {/* Single Pricing Card — Refined Luxury Glassmorphic Design */}
        <div className="max-w-3xl mx-auto mb-24">
          <div className="rounded-2xl border border-white/[0.12] bg-[#111113]/80 p-8 sm:p-14 relative shadow-2xl shadow-black/50 backdrop-blur-xl">
            {/* Top Pill */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-white text-zinc-950 text-xs font-bold uppercase tracking-wider shadow-md flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-950" />
              100% Free • Early Access
            </div>

            <div className="text-center mb-10 pt-2 space-y-3">
              <div className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                Early Access Plan
              </div>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl sm:text-6xl font-extrabold text-white font-mono tracking-tight">$0</span>
                <span className="text-zinc-400 text-lg sm:text-xl font-medium">/ Free Early Access</span>
              </div>
              <p className="text-zinc-300 text-base sm:text-lg max-w-xl mx-auto leading-relaxed pt-1">
                Full access to all features during Early Access. Automate your collection cadences, triage disputes with AI, and recover overdue receivables with zero commitments.
              </p>
            </div>

            {/* Features Checklist Grid */}
            <div className="border-t border-b border-white/[0.08] py-10 mb-10">
              <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-8 text-center">
                All Capabilities Included — Zero Restrictions
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-4 text-sm text-zinc-200">
                <div className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-[#b7d2f8] mt-0.5 shrink-0" />
                  <span><strong className="text-white font-medium">Unlimited active invoices</strong> with no volume caps</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-[#b7d2f8] mt-0.5 shrink-0" />
                  <span><strong className="text-white font-medium">Unlimited team seats</strong> &amp; role permissions</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-[#b7d2f8] mt-0.5 shrink-0" />
                  <span><strong className="text-white font-medium">5-stage autonomous tone escalation</strong> (LLaMA 3.1)</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-[#b7d2f8] mt-0.5 shrink-0" />
                  <span><strong className="text-white font-medium">NLP dispute triage</strong> &amp; AI draft responses</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-[#b7d2f8] mt-0.5 shrink-0" />
                  <span><strong className="text-white font-medium">Cryptographic debtor portal</strong> (<code className="text-xs text-zinc-300">/i/:token</code>)</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-[#b7d2f8] mt-0.5 shrink-0" />
                  <span><strong className="text-white font-medium">Structured installment payment plans</strong> (2x–4x)</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-[#b7d2f8] mt-0.5 shrink-0" />
                  <span><strong className="text-white font-medium">Dead Letter Queue (DLQ)</strong> &amp; delivery resilience</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-[#b7d2f8] mt-0.5 shrink-0" />
                  <span><strong className="text-white font-medium">Predictive ML delinquency risk scoring</strong></span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-[#b7d2f8] mt-0.5 shrink-0" />
                  <span><strong className="text-white font-medium">Multi-provider email failover</strong> (SendGrid, Resend, SMTP)</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-[#b7d2f8] mt-0.5 shrink-0" />
                  <span><strong className="text-white font-medium">Razorpay settlement</strong> &amp; webhook reconciliation</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-[#b7d2f8] mt-0.5 shrink-0" />
                  <span><strong className="text-white font-medium">Full tenant isolation</strong> &amp; immutable audit trail</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-[#b7d2f8] mt-0.5 shrink-0" />
                  <span><strong className="text-white font-medium">Direct CSV import</strong> &amp; custom webhook sync</span>
                </div>
              </div>
            </div>

            {/* CTA button */}
            <div className="flex flex-col items-center justify-center gap-3.5">
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-4 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 text-base font-bold transition-all shadow-lg hover:shadow-xl"
              >
                <span>Get started free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <p className="text-xs text-zinc-500">
                No credit card required • 15-minute onboarding • All features included
              </p>
            </div>
          </div>
        </div>

        {/* Enterprise Capabilities Included Free in Early Access */}
        <section className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-2">
              Full Production Access
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Why Jaktra Early Access Outperforms Trial-Locked Competitors
            </h2>
            <p className="text-sm text-zinc-400 mt-2">
              Explore how our zero-friction model compares to opaque enterprise sales cycles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {EARLY_ACCESS_PILLARS.map((pillar) => (
              <div
                key={pillar.id}
                className="rounded-2xl border border-white/[0.08] bg-[#111113] p-6 sm:p-7 flex flex-col justify-between hover:border-white/20 transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-xs font-mono font-bold text-[#b7d2f8] bg-[#b7d2f8]/10 px-2.5 py-1 rounded-full border border-[#b7d2f8]/20">
                      Pillar {pillar.number}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider border border-white/[0.08] px-2 py-0.5 rounded">
                      {pillar.badge}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-white mb-1.5 leading-snug">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-zinc-400 mb-5 leading-relaxed font-medium">
                    {pillar.subtitle}
                  </p>

                  <div>
                    {pillar.content}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Interactive Working Capital & DSO ROI Calculator */}
        <section className="mb-20 rounded-2xl border border-white/[0.08] bg-[#111113] p-8 sm:p-10 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-lg bg-[#b7d2f8]/10 text-[#b7d2f8] border border-[#b7d2f8]/20">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Interactive DSO &amp; Working Capital ROI Calculator
              </h2>
              <p className="text-sm text-zinc-400">
                See how much trapped working capital Jaktra unlocks based on your monthly invoice volume.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Sliders */}
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm font-medium mb-2">
                  <label htmlFor={volumeSliderId} className="text-zinc-300">Monthly Invoiced Volume ($)</label>
                  <span className="text-[#b7d2f8] font-mono text-base">${invoiceVolume.toLocaleString()}</span>
                </div>
                <input
                  id={volumeSliderId}
                  type="range"
                  min={50000}
                  max={2000000}
                  step={25000}
                  value={invoiceVolume}
                  onChange={(e) => setInvoiceVolume(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#b7d2f8]"
                />
                <div className="flex justify-between text-xs text-zinc-500 mt-1">
                  <span>$50,000</span>
                  <span>$1,000,000</span>
                  <span>$2,000,000+</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm font-medium mb-2">
                  <label htmlFor={daysSliderId} className="text-zinc-300">Current Average Days Overdue</label>
                  <span className="text-[#b7d2f8] font-mono text-base">{daysOverdue} days</span>
                </div>
                <input
                  id={daysSliderId}
                  type="range"
                  min={10}
                  max={60}
                  step={1}
                  value={daysOverdue}
                  onChange={(e) => setDaysOverdue(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#b7d2f8]"
                />
                <div className="flex justify-between text-xs text-zinc-500 mt-1">
                  <span>10 days</span>
                  <span>30 days</span>
                  <span>60 days</span>
                </div>
              </div>

              <div className="text-xs text-zinc-500 leading-relaxed">
                * Working capital recovery modeled using the standard treasury formula: Released Liquidity = (Annual Revenue / 365) × Days Accelerated, assuming an 8% cost of capital.
              </div>
            </div>

            {/* Results Callout Box */}
            <div className="rounded-xl border border-white/[0.08] bg-[#0a0a0b] p-6 flex flex-col justify-between">
              <div>
                <div className="text-xs font-semibold text-[#b7d2f8] uppercase tracking-wider mb-1">
                  Modeled Working Capital Release
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono mb-2">
                  ${releasedCash.toLocaleString()}
                </div>
                <div className="text-sm text-zinc-300 mb-6">
                  in operating cash flow released from overdue receivables.
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-white/[0.08] pt-4">
                  <div>
                    <div className="text-xs text-zinc-400">Modeled DSO Compression</div>
                    <div className="text-lg font-bold text-white font-mono">-{daysReduction} Days</div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-400">Annual Interest Saved</div>
                    <div className="text-lg font-bold text-[#b7d2f8] font-mono">${capitalSavings.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              <Link
                to="/register"
                className="mt-6 flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-white text-zinc-950 text-sm font-semibold hover:bg-zinc-200 transition-colors"
              >
                <span>Unlock this cash with Jaktra</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ Section with Outline Accordion */}
        <section className="mb-20 max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-zinc-400 mt-2">
              Common questions about Jaktra&apos;s pricing, Early Access, and enterprise features.
            </p>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-[#111113] p-6 sm:p-8 shadow-xl">
            <Accordion type="single" variant="outline" defaultValue="faq-0" collapsible className="w-full">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left font-medium text-white hover:text-[#b7d2f8]">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-zinc-400 leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Final CTA Banner */}
        <section className="rounded-2xl border border-white/[0.08] bg-[#111113] p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Ready to Automate Your Accounts Receivable?
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 mb-6 leading-relaxed">
              Join hundreds of forward-thinking finance teams. Create your free account in under 60 seconds with zero credit card required.
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
                to="/features"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-white/[0.12] bg-white/[0.04] text-white text-sm font-medium hover:bg-white/[0.08] transition-colors w-full sm:w-auto"
              >
                <span>Explore all features</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}

export default Pricing;

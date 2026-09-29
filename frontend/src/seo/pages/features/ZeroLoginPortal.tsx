import { Link } from "react-router-dom";
import {
  ArrowRight,
  KeyRound,
  CreditCard,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Split,
} from "lucide-react";
import { SEOHead } from "@/seo/components/SEOHead";
import { zeroLoginPortalSchema, breadcrumbSchema } from "@/seo/schemas";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { GlobalNav } from "@/components/common/GlobalNav";
import { SEOHero } from "@/seo/components/SEOHero";
import { DebtorPortalMockup } from "@/seo/components/mockups";

const FAQS = [
  {
    q: "How is a zero-login debtor portal secure without passwords?",
    a: "Jaktra generates a high-entropy, cryptographically unique URL token (/i/:token) for each invoice or statement of account. The token is verified server-side against the debtor's account record. Because it exposes only that specific customer's invoice data and payment rails, it eliminates account hijacking while removing authentication friction.",
  },
  {
    q: "Why do traditional customer login portals have high abandonment rates?",
    a: "B2B accounts payable teams process invoices for hundreds of vendors. Forcing a busy AP clerk to register an account, create a complex password, and verify an email just to pay one invoice results in over 70% portal abandonment. Jaktra's tokenized portal lets them review and pay in under 45 seconds.",
  },
  {
    q: "Can debtors select installment schedules through the portal without human intervention?",
    a: "Yes. If enabled by the finance team, the portal allows debtors experiencing liquidity pinches to choose a 2-part, 3-part, or 4-part installment plan. Selecting a plan automatically shifts Jaktra's agent to ActiveInstallmentContext, updating the collection cadence to remind only for upcoming milestones.",
  },
  {
    q: "What payment rails can buyers use on the tokenized portal?",
    a: "Through Jaktra's native payment rails (powered by Razorpay), buyers can settle via Instant UPI, Corporate Credit/Debit Cards, NetBanking across all major commercial banks, or obtain dynamic virtual bank accounts for direct NEFT/RTGS wire transfers with automated webhook confirmation.",
  },
  {
    q: "Does the finance team get telemetry when a debtor opens the link?",
    a: "Yes. When a debtor opens their tokenized portal link, Jaktra records an audit event timestamp. Finance teams can see exactly when the invoice was viewed, whether the PDF was downloaded, and if the debtor initiated checkout.",
  },
];

export function ZeroLoginPortal() {
  return (
    <div className="min-h-screen bg-[#010102] text-[#f7f8f8] font-sans antialiased selection:bg-[#5e6ad2]/30 selection:text-white">
      <SEOHead
        title="1-Click Zero-Login B2B Invoice Payment Links | Jaktra"
        description="Why traditional billing portals fail. Discover how Jaktra's 1-click zero-login payment links and self-serve installments get B2B invoices paid 2x faster."
        canonicalPath="/features/zero-login-portal"
        jsonLd={[
          zeroLoginPortalSchema,
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Features", path: "/features" },
            { name: "1-Click Payment Links Guide", path: "/features/zero-login-portal" },
          ]),
        ]}
      />

      <GlobalNav />

      <main className="pb-24">
        {/* SEO Hero Masthead with Debtor Portal Mockup */}
        <SEOHero
          badge="Zero-Friction Settlement"
          badgeDotColor="bg-[#b7d2f8]"
          breadcrumbs={[
            { name: "Home", path: "/" },
            { name: "Features", path: "/features" },
            { name: "Zero-Login Payment Portal", path: "/features/zero-login-portal" },
          ]}
          title="1-Click Zero-Login Debtor Payment Links"
          description="Traditional customer portals demand passwords and account creation—causing 70% of debtors to abandon payment. Jaktra generates cryptographically tokenized links that allow debtors to review invoices, select installment plans, and pay instantly via Razorpay in under 45 seconds."
          primaryCtaText="Try Jaktra Free"
          primaryCtaHref="/register"
          secondaryCtaText="Book a Demo"
          secondaryCtaHref="/contact"
        >
          {/* Live Product UI Artifact */}
          <div className="mt-8">
            <DebtorPortalMockup />
          </div>
        </SEOHero>

        <div className="seo-container space-y-16">
          {/* Comparative Breakdown: Legacy Portal vs Jaktra */}
          <section className="bg-[#0e0f11] border border-white/[0.08] rounded-xl p-6 sm:p-8">
            <div className="max-w-3xl mb-6">
              <span className="text-xs font-mono uppercase tracking-wider text-[#b7d2f8] block mb-1">
                Friction Elimination
              </span>
              <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                Why Password Portals Cause Payment Abandonment
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                B2B accounts payable staff deal with hundreds of vendors. Forcing them to remember passwords for each vendor leads directly to delayed payments.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Legacy Model */}
              <div className="p-5 rounded-lg bg-[#141516] border border-[#23252a] space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-rose-400">
                  <XCircle className="w-4 h-4 text-rose-400" />
                  Legacy Billing Portals (70% Abandonment)
                </div>
                <ul className="space-y-2 text-xs text-[#8a8f98]">
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400 font-mono">&times;</span>
                    <span>Requires registration, account verification, and complex passwords.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400 font-mono">&times;</span>
                    <span>Lost credentials trigger &ldquo;Forgot Password&rdquo; loops that delay check runs.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400 font-mono">&times;</span>
                    <span>No self-serve installment options; debtor closes tab when full funds unavailable.</span>
                  </li>
                </ul>
              </div>

              {/* Jaktra Model */}
              <div className="p-5 rounded-lg bg-[#141516] border border-[#23252a] space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Jaktra Tokenized Links (45-Second Settlement)
                </div>
                <ul className="space-y-2 text-xs text-zinc-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Cryptographic URL token (<code className="text-[11px] font-mono text-[#606cd2]">/i/:token</code>) opens directly without passwords.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Instant Razorpay checkout via Cards, NetBanking, and Instant UPI.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Self-serve 2x or 3x milestone installment schedules reduce default rates.</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* 4 Feature Pillars Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="rounded-xl border border-[#23252a] bg-[#0f1011] p-6">
              <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-[#23252a] flex items-center justify-center mb-4 text-[#606cd2]">
                <KeyRound className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">Zero Authentication Friction</h3>
              <p className="text-xs text-[#8a8f98] leading-relaxed">
                Tokens grant access only to the specific invoice statement. No accounts to create, no passwords to reset, and no multi-factor obstacles stopping payment.
              </p>
            </div>

            <div className="rounded-xl border border-[#23252a] bg-[#0f1011] p-6">
              <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-[#23252a] flex items-center justify-center mb-4 text-[#606cd2]">
                <Split className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">Automated Installment Schedules</h3>
              <p className="text-xs text-[#8a8f98] leading-relaxed">
                Debtors experiencing liquidity pinches can choose 2x or 3x weekly payment plans directly from the portal, converting stalled accounts into active receivables.
              </p>
            </div>

            <div className="rounded-xl border border-[#23252a] bg-[#0f1011] p-6">
              <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-[#23252a] flex items-center justify-center mb-4 text-[#606cd2]">
                <CreditCard className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">Universal Payment Rails</h3>
              <p className="text-xs text-[#8a8f98] leading-relaxed">
                Supports Razorpay checkout across Corporate Credit Cards, Debit Cards, NetBanking across 50+ banks, and UPI with instant cryptographic ledger reconciliation.
              </p>
            </div>

            <div className="rounded-xl border border-[#23252a] bg-[#0f1011] p-6">
              <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-[#23252a] flex items-center justify-center mb-4 text-[#606cd2]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">Real-Time Open Telemetry</h3>
              <p className="text-xs text-[#8a8f98] leading-relaxed">
                Know the exact minute a debtor opens the payment link, inspects line items, or downloads the invoice PDF, eliminating the excuse: &ldquo;We never received it.&rdquo;
              </p>
            </div>
          </section>

          {/* FAQ Section */}
          <section>
            <div className="text-center mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2">Frequently Asked Questions</h2>
              <p className="text-xs sm:text-sm text-[#8a8f98]">
                Security and operational details of Jaktra’s tokenized zero-login debtor links.
              </p>
            </div>
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" variant="outline" defaultValue="faq-0" collapsible className="w-full">
                {FAQS.map((faq, i) => (
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
              Get Invoices Paid 2x Faster with Zero Friction
            </h2>
            <p className="text-xs sm:text-sm text-[#8a8f98] max-w-xl mx-auto mb-6 leading-relaxed">
              Eliminate password abandonment. Deploy tokenized 1-click debtor payment links and self-serve installments with Jaktra today.
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
                to="/features"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-[#23252a] text-xs font-medium text-zinc-300 transition-colors min-h-[44px]"
              >
                <span>Explore All Features</span>
              </Link>
            </div>
          </section>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}

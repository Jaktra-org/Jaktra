import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Lock,
  KeyRound,
  CreditCard,
  Download,
  Zap,
} from "lucide-react";
import jaktraLogo from "../assets/jaktra_svg.svg";
import { SEOHead } from "../components/common/SEOHead";
import { zeroLoginPortalSchema, breadcrumbSchema } from "../components/common/seo-schemas";
import { LandingFooter } from "../components/landing/LandingFooter";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

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
  const [activeTab, setActiveTab] = useState<"statement" | "installments" | "checkout">("statement");

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#f5f5f5] font-sans selection:bg-[#b7d2f8]/20 selection:text-white antialiased">
      <SEOHead
        title="1-Click B2B Invoice Payment Links: Eliminate Passwords & Get Paid 2x Faster | Jaktra"
        description="Discover why traditional customer billing portals fail with 70%+ abandonment. See how 1-click zero-login payment links and self-service installments get B2B invoices paid 2x faster."
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

      <HeaderNav />

      <main className="pt-28 sm:pt-32 pb-24 px-4 sm:px-6 max-w-5xl mx-auto relative">
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
              <Link to="/features" className="hover:text-zinc-300 transition-colors">
                Features
              </Link>
            </li>
            <li>/</li>
            <li className="text-zinc-300 font-medium" aria-current="page">
              1-Click Payment Links Guide
            </li>
          </ol>
        </nav>

        {/* Hero Section */}
        <section className="text-center max-w-4xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-4">
            Frictionless B2B Billing &amp; 1-Click Invoicing
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-6 leading-tight">
            Why Customer Portals Fail: How 1-Click Zero-Login Payment Links Accelerate B2B Cash Collection
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 max-w-3xl mx-auto leading-relaxed mb-8">
            Forcing busy accounts payable teams to create accounts, remember passwords, and navigate complex ERP portals causes severe payment delays. Learn why passwordless 1-click invoice links eliminate payment friction and cut DSO in half.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-200 transition-all shadow-md"
            >
              Get started free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/pricing"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white/5 border border-white/10 text-white font-medium text-sm hover:bg-white/10 transition-all"
            >
              Calculate your DSO ROI
            </Link>
          </div>
        </section>

        {/* Metrics Banner */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-20">
          <div className="rounded-2xl border border-white/[0.08] bg-[#111113] p-6 text-center">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#b7d2f8] font-mono mb-1">0</div>
            <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Passwords Required to Pay</div>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-[#111113] p-6 text-center">
            <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono mb-1">1-Click</div>
            <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Direct Payment Link Access</div>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-[#111113] p-6 text-center">
            <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono mb-1">SHA-256</div>
            <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Cryptographic Token Architecture</div>
          </div>
        </section>

        {/* Interactive Debtor Portal Simulator */}
        <section className="rounded-2xl border border-white/[0.08] bg-[#111113] p-6 sm:p-10 mb-20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-[#b7d2f8]" />
                <h2 className="text-xl font-bold text-white">Live Debtor Experience Sandbox</h2>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                Preview the exact zero-friction portal your customers see when clicking their payment link.
              </p>
            </div>

            {/* Tab Controls */}
            <div className="flex items-center gap-1.5 p-1 rounded-lg bg-black/50 border border-white/[0.08]">
              <button
                onClick={() => setActiveTab("statement")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeTab === "statement" ? "bg-white text-zinc-950 font-semibold shadow" : "text-zinc-400 hover:text-white"
                }`}
              >
                Statement View
              </button>
              <button
                onClick={() => setActiveTab("installments")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeTab === "installments" ? "bg-white text-zinc-950 font-semibold shadow" : "text-zinc-400 hover:text-white"
                }`}
              >
                Installment Split
              </button>
              <button
                onClick={() => setActiveTab("checkout")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeTab === "checkout" ? "bg-white text-zinc-950 font-semibold shadow" : "text-zinc-400 hover:text-white"
                }`}
              >
                Instant Checkout
              </button>
            </div>
          </div>

          {/* Browser Shell Mockup */}
          <div className="rounded-xl border border-white/[0.08] bg-black/60 overflow-hidden shadow-2xl">
            {/* Browser Address Bar */}
            <div className="px-4 py-2.5 bg-black/80 border-b border-white/[0.08] flex items-center gap-3 text-xs text-zinc-500">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
              </div>
              <div className="flex-1 max-w-md mx-auto py-1 px-3 rounded bg-zinc-900 border border-white/[0.08] font-mono text-[11px] text-zinc-400 flex items-center justify-between">
                <span className="truncate">https://jaktra.site/i/sec_9f82ab410d...</span>
                <Lock className="w-3 h-3 text-[#b7d2f8] shrink-0 ml-2" />
              </div>
            </div>

            {/* Portal Tab Contents */}
            <div className="p-6 sm:p-8">
              {activeTab === "statement" && (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
                    <div>
                      <div className="text-xs text-zinc-400 uppercase tracking-wider">Statement of Account</div>
                      <div className="text-2xl font-bold font-mono text-white mt-0.5">$4,250.00 USD</div>
                      <div className="text-xs text-zinc-400 mt-1 font-medium">Invoice #INV-2048 · 12 Days Past Due</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-white/[0.08] bg-white/5 hover:bg-white/10 text-xs font-medium text-zinc-200">
                        <Download className="w-3.5 h-3.5" />
                        <span>Download PDF</span>
                      </button>
                      <button
                        onClick={() => setActiveTab("checkout")}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-white hover:bg-zinc-200 text-xs font-semibold text-zinc-950 transition-colors"
                      >
                        <span>Pay $4,250 Now</span>
                      </button>
                    </div>
                  </div>

                  {/* Line Items Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-white/[0.08] text-zinc-400 font-mono text-[11px] uppercase tracking-wider">
                          <th className="pb-2 font-medium">Description</th>
                          <th className="pb-2 text-right">Quantity</th>
                          <th className="pb-2 text-right">Unit Price</th>
                          <th className="pb-2 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.05] text-zinc-300">
                        <tr>
                          <td className="py-3 font-medium text-white">Cloud Infrastructure — Enterprise Tier (Monthly)</td>
                          <td className="py-3 text-right">1</td>
                          <td className="py-3 text-right font-mono">$3,500.00</td>
                          <td className="py-3 text-right font-mono">$3,500.00</td>
                        </tr>
                        <tr>
                          <td className="py-3 font-medium text-white">Dedicated API Rate Limit Add-on</td>
                          <td className="py-3 text-right">3</td>
                          <td className="py-3 text-right font-mono">$250.00</td>
                          <td className="py-3 text-right font-mono">$750.00</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === "installments" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-white">Structured Installment Options</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Need cash flow flexibility? Split this $4,250.00 balance into monthly installments with zero interest fees.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="rounded-xl border border-white/[0.08] bg-black/40 p-4 relative">
                      <div className="text-xs text-zinc-400 uppercase tracking-wider">2 Payments</div>
                      <div className="text-xl font-bold font-mono text-white mt-1">$2,125 / mo</div>
                      <p className="text-[11px] text-zinc-500 mt-2">Due Today &amp; in 30 days</p>
                      <button className="w-full mt-4 py-1.5 rounded bg-white/5 hover:bg-white/10 text-xs font-medium text-zinc-200 border border-white/[0.08]">
                        Select 2x Plan
                      </button>
                    </div>

                    <div className="rounded-xl border border-[#b7d2f8]/40 bg-[#b7d2f8]/10 p-4 relative">
                      <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-[#b7d2f8] text-zinc-950 font-bold text-[10px]">
                        Recommended
                      </span>
                      <div className="text-xs text-[#b7d2f8] uppercase tracking-wider">3 Payments</div>
                      <div className="text-xl font-bold font-mono text-white mt-1">$1,416 / mo</div>
                      <p className="text-[11px] text-zinc-300 mt-2">Due Today, Day 30 &amp; Day 60</p>
                      <button className="w-full mt-4 py-1.5 rounded bg-[#b7d2f8] hover:bg-white text-zinc-950 font-semibold text-xs transition-colors">
                        Select 3x Plan
                      </button>
                    </div>

                    <div className="rounded-xl border border-white/[0.08] bg-black/40 p-4 relative">
                      <div className="text-xs text-zinc-400 uppercase tracking-wider">4 Payments</div>
                      <div className="text-xl font-bold font-mono text-white mt-1">$1,062 / mo</div>
                      <p className="text-[11px] text-zinc-500 mt-2">Due over 90 days</p>
                      <button className="w-full mt-4 py-1.5 rounded bg-white/5 hover:bg-white/10 text-xs font-medium text-zinc-200 border border-white/[0.08]">
                        Select 4x Plan
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "checkout" && (
                <div className="space-y-6 max-w-md mx-auto">
                  <div className="text-center">
                    <div className="text-xs text-zinc-400 uppercase tracking-wider">Pay Outstanding Balance</div>
                    <div className="text-2xl font-bold font-mono text-white mt-1">$4,250.00 USD</div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg border border-white/[0.08] bg-black/40">
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-4 h-4 text-[#b7d2f8]" />
                        <span className="text-xs font-medium text-white">Corporate Credit / Debit Card</span>
                      </div>
                      <span className="text-[11px] text-zinc-400 font-medium">Instant</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg border border-white/[0.08] bg-black/40">
                      <div className="flex items-center gap-3">
                        <KeyRound className="w-4 h-4 text-[#b7d2f8]" />
                        <span className="text-xs font-medium text-white">NetBanking / Direct Debit</span>
                      </div>
                      <span className="text-[11px] text-zinc-400">All Major Banks</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg border border-white/[0.08] bg-black/40">
                      <div className="flex items-center gap-3">
                        <Zap className="w-4 h-4 text-[#b7d2f8]" />
                        <span className="text-xs font-medium text-white">Instant UPI Settlement</span>
                      </div>
                      <span className="text-[11px] text-zinc-400 font-medium">Zero Fee</span>
                    </div>
                  </div>

                  <button className="w-full py-2.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-bold transition-colors shadow-sm">
                    Confirm &amp; Settle $4,250.00
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 3 Core Architecture Moats */}
        <section className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Three Core Architecture Moats
            </h2>
            <p className="text-center text-sm text-zinc-400 max-w-2xl mx-auto">
              How Jaktra eliminates portal drop-off while maintaining bank-grade security and auditability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-white/[0.08] bg-[#111113] p-6 sm:p-7 flex flex-col justify-between shadow-lg">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.1] text-xs font-mono font-bold flex items-center justify-center text-[#b7d2f8]">
                    01
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-white/[0.04] border border-white/[0.08] text-[#b7d2f8]">
                    Security Moat
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  Cryptographic Tokenized Access &amp; Telemetry
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-4">
                  Every outreach notification generates an ephemeral cryptographic URL token (<code className="text-xs font-mono">/i/:token</code>). The token verifies server-side, serving only that debtor&apos;s verified ledger without exposure to other accounts.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#0a0a0b]/60 border border-white/[0.06] text-xs text-zinc-300">
                <strong className="text-white font-medium block mb-0.5">Real-Time Telemetry:</strong>
                Records exact timestamps when the buyer views statements, downloads PDF invoices, or initiates checkout.
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-[#111113] p-6 sm:p-7 flex flex-col justify-between shadow-lg">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.1] text-xs font-mono font-bold flex items-center justify-center text-[#b7d2f8]">
                    02
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-white/[0.04] border border-white/[0.08] text-[#b7d2f8]">
                    Cashflow Flexibility
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  Self-Serve Milestone Plans &amp; Context Switching
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-4">
                  Instead of awkward phone negotiation when a customer cannot pay in full, the portal empowers debtors to select structured 2x, 3x, or 4x milestone installment plans. Committing to a plan automatically generates schedule records and updates the collection cadence.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#0a0a0b]/60 border border-white/[0.06] text-xs text-zinc-300">
                <strong className="text-white font-medium block mb-0.5">Cadence Shift:</strong>
                Dunning stops demanding full payment and transitions solely to reminding for upcoming milestone tranches.
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-[#111113] p-6 sm:p-7 flex flex-col justify-between shadow-lg">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.1] text-xs font-mono font-bold flex items-center justify-center text-[#b7d2f8]">
                    03
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-white/[0.04] border border-white/[0.08] text-[#b7d2f8]">
                    Instant Settlement
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  Instant Razorpay Settlement &amp; Ledger Updates
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-4">
                  Buyers remit payment directly on modern rails: Instant UPI, Corporate Cards, NetBanking across commercial banks, or dedicated virtual accounts for instant NEFT/RTGS reconciliation.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#0a0a0b]/60 border border-white/[0.06] text-xs text-zinc-300">
                <strong className="text-white font-medium block mb-0.5">Zero Human Admin:</strong>
                Verified webhook signatures update ledger records instantly to PAID, halting all further reminders in under 1 second.
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="max-w-4xl mx-auto px-2 py-12 mb-16 border-t border-white/[0.08]">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Frequently Asked Questions: Zero-Login Portal
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base">
              Security, telemetry, and payment gateway specifications.
            </p>
          </div>

          <Accordion type="single" variant="outline" defaultValue="faq-0" collapsible className="w-full">
            {FAQS.map((faq, idx) => (
              <AccordionItem key={idx} value={`faq-${idx}`}>
                <AccordionTrigger>{faq.q}</AccordionTrigger>
                <AccordionContent>{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* BOTTOM CTA */}
        <section className="max-w-4xl mx-auto text-center border-t border-white/[0.08] pt-16">
          <div className="p-8 sm:p-12 rounded-2xl bg-gradient-to-b from-white/[0.04] to-transparent border border-white/[0.08]">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 font-display">
              Offer Zero-Friction Payment Portals to Your Debtors
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto text-sm sm:text-base mb-8">
              Eliminate password barriers and accelerate online cash recovery. Set up Jaktra in 15 minutes with Free Early Access.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-200 transition-all shadow-lg"
              >
                Get started free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/pricing"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-white/5 border border-white/10 text-white font-medium text-sm hover:bg-white/10 transition-all"
              >
                Calculate your DSO ROI
              </Link>
            </div>
            <p className="text-xs text-zinc-500 mt-4">
              No credit card required • Deploy in 15 minutes • AES-256 encrypted
            </p>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}

export default ZeroLoginPortal;

import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Sparkles,
} from "lucide-react";
import jaktraLogo from "../assets/jaktra_svg.svg";
import { SEOHead } from "../components/common/SEOHead";
import { installmentPlansSchema, breadcrumbSchema } from "../components/common/seo-schemas";
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



export function InstallmentPlans() {
  const [invoiceAmount, setInvoiceAmount] = useState<number>(12000);
  const [installmentsCount, setInstallmentsCount] = useState<number>(3);

  const installmentAmount = Math.round(invoiceAmount / installmentsCount);

  const faqs = [
    {
      q: "Why are structured installment plans better than demanding immediate full payment?",
      a: "When B2B debtors encounter temporary cash crunches, rigid demands for immediate 100% settlement often force them to ghost communications, dispute the invoice, or push the balance into severe delinquency. Offering structured installment plans gives debtors a dignified, manageable off-ramp while securing steady cash flow and eliminating default write-offs.",
    },
    {
      q: "How does Jaktra adapt its automated tone when an installment plan is active?",
      a: "In Jaktra's triage engine (triage.service.ts), active installment plans shift the context (ActiveInstallmentContext). Instead of demanding the full lump sum, our Groq LLaMA 3.1 agent automatically adjusts its copy to reference only the upcoming installment milestone, its due date, and remaining balance.",
    },
    {
      q: "How do debtors request and approve installment plans?",
      a: "Every collection reminder contains a secure tokenized link (/i/:token). In their portal, debtors see an option to split the invoice balance across pre-authorized schedules (e.g. 2, 3, or 4 monthly installments). Finance managers can pre-approve these rules or review custom debtor requests with a single click in their Jaktra dashboard.",
    },
    {
      q: "How does payment reconciliation work across installments?",
      a: "As debtors clear each installment milestone via Razorpay (UPI, NetBanking, Cards), Jaktra's verified webhooks reconcile the ledger in real time, mark that installment as PAID, and automatically queue the next installment's tracking schedule.",
    },
    {
      q: "What happens if a debtor misses an installment payment milestone?",
      a: "If an installment becomes past due, Jaktra immediately resumes its 5-stage tone escalation cadence focused specifically on the delinquent installment amount, escalating with polite firmness before legal review.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-zinc-100 font-sans selection:bg-[#b7d2f8]/20 selection:text-white">
      <SEOHead
        title="How to Offer Payment Plans to Overdue B2B Clients (Templates & Recovery Strategy) | Jaktra"
        description="Learn what to do when a B2B client can't pay their invoice. Discover how to offer structured installment plans, agreement terms, and automated milestone tracking to recover cash."
        canonicalPath="/features/installment-plans"
        jsonLd={[
          installmentPlansSchema,
          breadcrumbSchema([
            { name: "Features", path: "/features" },
            { name: "B2B Payment Plans & Installments Guide", path: "/features/installment-plans" },
          ]),
        ]}
      />

      <HeaderNav />

      <main className="pt-28 sm:pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(183,210,248,0.06),transparent)] pointer-events-none" />
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-8 text-xs text-zinc-500 relative z-10">
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
              B2B Payment Plans &amp; Installments Guide
            </li>
          </ol>
        </nav>

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-20 sm:mb-24">
          <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-3">
            B2B Receivables Recovery &amp; Payment Plan Playbook
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-6 leading-tight">
            What to Do When a Client Can&apos;t Pay: How to Recover Receivables with Structured Payment Plans
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
            When a debtor experiences temporary cash flow constraints, demanding full immediate payment leads to ghosting, disputes, and bad debt write-offs. Discover how to structure viable installment schedules, preserve client relationships, and automate milestone recovery.
          </p>
        </div>

        {/* Metric Highlights Banner */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-20 sm:mb-24">
          <div className="rounded-2xl border border-white/[0.08] bg-[#111113] p-8 text-center shadow-lg">
            <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono mb-1">Structured</div>
            <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Multi-Tranche Milestone Plans</div>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-[#111113] p-8 text-center shadow-lg">
            <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono mb-1">Zero-Login</div>
            <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Instant Debtor Portal Access</div>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-[#111113] p-8 text-center shadow-lg">
            <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono mb-1">100% Auto</div>
            <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Razorpay Webhook Ledger Sync</div>
          </div>
        </section>

        {/* Interactive Installment Simulator */}
        <section className="mb-20 sm:mb-24 rounded-2xl border border-white/[0.08] bg-[#111113] p-6 sm:p-10 shadow-xl">
          <div className="text-center mb-10 max-w-xl mx-auto">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-2">
              Interactive Schedule Simulator
            </span>
            <h2 className="text-2xl font-bold text-white mb-2">Simulate a Structured Milestone Schedule</h2>
            <p className="text-sm text-zinc-400">
              See how Jaktra splits overdue invoices into manageable tranches and adjusts agent outreach.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Controls */}
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center text-sm font-semibold mb-2">
                  <span className="text-zinc-300">Overdue Invoice Balance</span>
                  <span className="text-white font-mono text-base">${invoiceAmount.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min={2000}
                  max={50000}
                  step={1000}
                  value={invoiceAmount}
                  onChange={(e) => setInvoiceAmount(Number(e.target.value))}
                  className="w-full accent-[#b7d2f8] bg-zinc-800 h-2 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-xs text-zinc-500 mt-1 font-mono">
                  <span>$2,000</span>
                  <span>$25,000</span>
                  <span>$50,000</span>
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold text-zinc-300 mb-3">Installment Milestone Split</div>
                <div className="grid grid-cols-3 gap-3">
                  {[2, 3, 4].map((count) => (
                    <button
                      key={count}
                      onClick={() => setInstallmentsCount(count)}
                      className={`py-3 px-4 rounded-xl border text-center transition-all ${
                        installmentsCount === count
                          ? "border-white/[0.2] bg-white/[0.08] text-white shadow-sm font-bold"
                          : "border-white/[0.08] bg-[#0a0a0b] text-zinc-400 hover:border-zinc-700"
                      }`}
                    >
                      <div className="text-lg font-mono">{count}x</div>
                      <div className="text-xs font-normal">Installments</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0a0a0b]">
                <div className="text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#b7d2f8]" />
                  AI Agent Nudge Adaptation
                </div>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  Active status halts full-balance demands. Outreach automatically pivots to tracking Milestone #1
                  (${installmentAmount.toLocaleString()}) due in 30 days.
                </p>
              </div>
            </div>

            {/* Simulated Schedule Output */}
            <div className="rounded-xl border border-white/[0.08] bg-[#0a0a0b] p-6 flex flex-col justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-4 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#b7d2f8]" />
                  <span>Structured Debtor Milestone Breakdown</span>
                </div>

                <div className="space-y-3">
                  {Array.from({ length: installmentsCount }).map((_, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-lg border border-white/[0.08] bg-[#111113] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-white/[0.08] text-white text-xs font-bold font-mono flex items-center justify-center">
                          {i + 1}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white">
                            Installment {i + 1} of {installmentsCount}
                          </div>
                          <div className="text-xs text-zinc-500">
                            Due in {(i + 1) * 30} days • Tokenized Link Ready
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold font-mono text-white">
                          ${installmentAmount.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-zinc-400">Razorpay Sync</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-white/[0.08] pt-4 mt-6 flex items-center justify-between">
                <div>
                  <div className="text-xs text-zinc-400">Payment Structure</div>
                  <div className="text-base font-bold text-white font-mono">Milestone Tranches (vs Rigid Full Demand)</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-zinc-400">Total Recovered</div>
                  <div className="text-base font-bold text-white font-mono">${invoiceAmount.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3 Pillars of Jaktra's Installment Engine (Interactive Accordion) */}
        <section className="mb-20 sm:mb-24">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-2">
              Architectural Breakdown
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              How Jaktra’s Installment Engine Works
            </h2>
            <p className="text-sm text-zinc-400 mt-2">
              From debtor self-selection to automatic ledger reconciliation.
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
                    Debtor UX
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  Tokenized Debtor Self-Selection
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-4">
                  Debtors click their secure, cryptographically hashed portal link (<code className="text-xs font-mono text-[#b7d2f8]">/i/:token</code>) without needing to register or enter passwords. The portal presents pre-authorized installment options governed by your credit policy (e.g. 2, 3, or 4 monthly milestones).
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/[0.05] text-[11px] text-zinc-300">
                <div className="p-2 rounded bg-[#0a0a0b]/60 border border-white/[0.06]">
                  <span className="text-[#b7d2f8] font-semibold block mb-0.5">Pre-Approval</span>
                  <span>Zero awkward phone negotiation</span>
                </div>
                <div className="p-2 rounded bg-[#0a0a0b]/60 border border-white/[0.06]">
                  <span className="text-zinc-200 font-semibold block mb-0.5">Custom Terms</span>
                  <span>1-click finance review requests</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-[#111113] p-6 sm:p-7 flex flex-col justify-between shadow-lg">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.1] text-xs font-mono font-bold flex items-center justify-center text-[#b7d2f8]">
                    02
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-white/[0.04] border border-white/[0.08] text-[#b7d2f8]">
                    Agent Intelligence
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  Dynamic Triage Modulation &amp; Tone Calming
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-4">
                  As soon as an installment plan is ratified, Jaktra&apos;s autonomous collection engine switches the invoice state into <code className="text-xs font-mono text-zinc-300">ActiveInstallmentContext</code>. Aggressive lump-sum demands stop instantly, preventing customer irritation and preserving relationship equity.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#0a0a0b]/60 border border-white/[0.06] text-xs text-zinc-300 flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#b7d2f8] shrink-0 mt-0.5" />
                <span>Cadence shifts specifically to remind only for upcoming tranche dates, never demanding the full balance.</span>
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-[#111113] p-6 sm:p-7 flex flex-col justify-between shadow-lg">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.1] text-xs font-mono font-bold flex items-center justify-center text-[#b7d2f8]">
                    03
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-white/[0.04] border border-white/[0.08] text-[#b7d2f8]">
                    Payment Rails
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  Real-Time Razorpay Webhook Reconciliation
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-4">
                  When debtors pay individual milestones via UPI, NetBanking, NEFT/RTGS, or Corporate Cards, Razorpay dispatches signed webhook events directly to Jaktra (<code className="text-xs font-mono text-zinc-300">webhook.handler.ts</code>).
                </p>
              </div>
              <div className="grid grid-cols-3 gap-1.5 pt-3 border-t border-white/[0.05] text-[10px] text-zinc-300 text-center">
                <div className="p-1.5 rounded bg-[#0a0a0b]/60 border border-white/[0.06]">
                  <div className="text-white font-semibold">PDF Receipt</div>
                  <div className="text-zinc-500">Auto-sent</div>
                </div>
                <div className="p-1.5 rounded bg-[#0a0a0b]/60 border border-white/[0.06]">
                  <div className="text-[#b7d2f8] font-semibold">Ledger Sync</div>
                  <div className="text-zinc-500">Sub-second</div>
                </div>
                <div className="p-1.5 rounded bg-[#0a0a0b]/60 border border-white/[0.06]">
                  <div className="text-white font-semibold">Next Tranche</div>
                  <div className="text-zinc-500">Queued</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Payment Methods Supported */}
        <section className="mb-20 sm:mb-24 rounded-2xl border border-white/[0.08] bg-[#111113] p-6 sm:p-8 shadow-xl">
          <div className="max-w-3xl mb-6">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#b7d2f8]" />
              Omnichannel Debtor Payment Rails
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Every milestone can be settled instantly through the debtor&apos;s preferred commercial payment method with
              automated fees handling and instant ledger updates.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0a0a0b]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-white">Instant UPI &amp; QR</span>
                <CheckCircle2 className="w-4 h-4 text-[#b7d2f8]" />
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                One-tap UPI payment links for corporate accounting teams, settling directly into your company bank account.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0a0a0b]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-white">NetBanking / Virtual Bank</span>
                <CheckCircle2 className="w-4 h-4 text-[#b7d2f8]" />
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Direct NEFT/RTGS virtual account matching that eliminates manual bank statement reconcile passes.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0a0a0b]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-white">Corporate Cards</span>
                <CheckCircle2 className="w-4 h-4 text-[#b7d2f8]" />
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Visa, Mastercard, and Amex corporate credit cards with automatic settlement receipts.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section with Outline Accordion */}
        <section className="mb-20 sm:mb-24">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Frequently Asked Questions</h2>
            <p className="text-sm text-zinc-400 mt-2">
              Everything finance leaders need to know about B2B installment plans and AR cash recovery.
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

        {/* CTA Banner */}
        <section className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-transparent p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Recover More Cash with Intelligent Installment Plans
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 mb-6 leading-relaxed">
              Turn delinquent accounts into structured cash flow today with Jaktra&apos;s autonomous AI collections agent. 100% free during Early Access.
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

export default InstallmentPlans;

import { Link } from "react-router-dom";
import { Check, ArrowRight, Sparkles, ShieldCheck, CreditCard, Split, MailX } from "lucide-react";
import jaktraLogo from "../assets/jaktra_svg.svg";
import { SEOHead } from "../components/common/SEOHead";
import { paidniceCompareSchema, breadcrumbSchema } from "../components/common/seo-schemas";
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

interface ComparisonRow {
  feature: string;
  category: string;
  paidNice: string;
  jaktra: string;
  highlight?: boolean;
}

const COMPARISON_DATA: ComparisonRow[] = [
  {
    feature: "Core Recovery Philosophy",
    category: "Philosophy",
    paidNice: "Punitive late fees & interest penalties added to invoice",
    jaktra: "Autonomous generative tone escalation & installment plans",
    highlight: true,
  },
  {
    feature: "Dunning Communication Engine",
    category: "Messaging",
    paidNice: "Static email templates with fee line items",
    jaktra: "Groq LLaMA 3.1 generative tone modulation across 5 stages",
    highlight: true,
  },
  {
    feature: "Dispute Reply Handling",
    category: "Workflow",
    paidNice: "Manual workflow adjustment required in accounting software",
    jaktra: "NLP DisputeAgent auto-classifies replies & halts cadences",
    highlight: true,
  },
  {
    feature: "At-Risk Account Flexibility",
    category: "Flexibility",
    paidNice: "Demands full balance plus accrued late penalties",
    jaktra: "Tokenized debtor portal with self-serve 2x/3x/4x installment splits",
    highlight: true,
  },
  {
    feature: "Regulatory & Compliance Safety",
    category: "Compliance",
    paidNice: "Runs on schedule unless manually paused or excluded",
    jaktra: "Hardcoded Stage 5 Legal Stop at 31+ days overdue",
    highlight: true,
  },
  {
    feature: "Email Delivery Resilience",
    category: "Infrastructure",
    paidNice: "Basic SMTP / Xero email relay",
    jaktra: "Dead Letter Queue (DLQ) with 3-drop circuit breaker & 20h guard",
    highlight: false,
  },
  {
    feature: "Debtor Payment Experience",
    category: "Payments",
    paidNice: "Standard payment processor redirect",
    jaktra: "Zero-login cryptographic portal (`/i/:token`) with Razorpay webhooks",
    highlight: false,
  },
  {
    feature: "Pricing Model",
    category: "Pricing",
    paidNice: "Paid-only subscription ($49–$199+/mo)",
    jaktra: "100% Free during Early Access (No credit card required)",
    highlight: false,
  },
];



export function PaidNiceCompare() {
  const faqs = [
    {
      q: "Why do B2B finance teams look for an alternative to PaidNice?",
      a: "PaidNice's primary mechanism is automatically calculating and adding late payment fees and interest to invoices in Xero or QuickBooks. In business-to-business commerce, imposing automated late fee penalties on enterprise clients, long-standing partners, or distributor accounts often triggers billing disputes, stalls principal recovery, and strains commercial goodwill. Finance teams switch to Jaktra to replace punitive fee compounding with intelligent tone escalation and constructive installment options.",
    },
    {
      q: "How does Jaktra recover overdue receivables without adding late fees?",
      a: "Rather than creating animosity with late fee penalties, Jaktra uses Groq LLaMA 3.1 to modulate tone dynamically across 5 stages—starting with cordial, collaborative check-ins that assume accidental oversight, and gradually escalating urgency based on aging and risk score. If a client is cash-constrained, Jaktra lets them split the invoice into structured installments via their secure debtor portal.",
    },
    {
      q: "What happens when a customer replies with a billing dispute?",
      a: "With PaidNice, automated fee compounding and dunning rules continue firing unless someone manually removes the invoice from the sequence. In Jaktra, our NLP DisputeAgent analyzes incoming replies in real time: the moment a customer questions a charge, dunning cadences halt immediately and an AI-drafted resolution response is generated for human review.",
    },
    {
      q: "How does Jaktra ensure compliance with debt collection regulations?",
      a: "Continuing to blast automated dunning past 30 days overdue creates severe regulatory harassment risks. Jaktra hardcodes a Stage 5 Legal Stop that strictly terminates automated messaging after 30 days overdue, mandating human executive authorization.",
    },
    {
      q: "Can I try Jaktra alongside our current accounting software?",
      a: "Yes. You can import your accounts receivable ledger via CSV or connect directly via API/Razorpay in under 15 minutes. Jaktra is 100% free during Early Access with zero credit card required and no invoice limits.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#f5f5f5] font-sans selection:bg-[#b7d2f8]/20 selection:text-white antialiased">
      <SEOHead
        title="PaidNice Alternative — Autonomous AI Tone Escalation vs Static Late Fees | Jaktra"
        description="Compare PaidNice vs Jaktra. Learn why finance teams upgrade from PaidNice's punitive static late fees to Jaktra's autonomous Groq LLaMA 3.1 tone escalation, NLP dispute triage, and self-serve installment recovery."
        canonicalPath="/compare/paidnice-alternative"
        jsonLd={[
          paidniceCompareSchema,
          breadcrumbSchema([
            { name: "Compare", path: "/compare" },
            { name: "PaidNice Alternative", path: "/compare/paidnice-alternative" },
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
              <Link to="/compare" className="text-zinc-400 hover:text-zinc-300 transition-colors">
                Compare
              </Link>
            </li>
            <li>/</li>
            <li className="text-zinc-300 font-medium" aria-current="page">
              PaidNice Alternative
            </li>
          </ol>
        </nav>

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-3">
            Autonomous AI Tone Escalation vs. Punitive Late Fee Penalties
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-5 leading-tight">
            The Modern Alternative to PaidNice
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
            In B2B commerce, applying automated late fee penalties on key clients can harm commercial goodwill and spark billing disputes.
            Jaktra replaces punitive penalties with Groq LLaMA 3.1 generative tone escalation, automated dispute triage,
            and self-serve installment recovery.
          </p>
        </div>

        {/* 3 Core Conceptual Differences */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          <div className="rounded-2xl border border-white/[0.08] bg-[#111113] p-6 hover:border-white/[0.18] transition-all">
            <div className="w-10 h-10 rounded-lg bg-[#b7d2f8]/10 border border-[#b7d2f8]/20 flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5 text-[#b7d2f8]" />
            </div>
            <h2 className="text-base font-bold text-white mb-2">Generative Tone vs. Penalty Math</h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              PaidNice relies on static late fee percentages and compounding interest. Jaktra uses Groq LLaMA 3.1 to modulate
              tone dynamically across 5 stages, motivating settlement while protecting customer goodwill.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#111113] p-6 hover:border-white/[0.18] transition-all">
            <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4 text-[#b7d2f8]">
              <Split className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-white mb-2">Installment Plans vs. Full Demands</h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              When cash-constrained clients face punitive late fees, they often default or ghost. Jaktra provides self-serve
              installment plans via zero-login portals (`/i/:token`), turning potential bad debt into steady cash flow.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#111113] p-6 hover:border-white/[0.18] transition-all">
            <div className="w-10 h-10 rounded-lg bg-[#b7d2f8]/10 border border-[#b7d2f8]/20 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5 text-[#b7d2f8]" />
            </div>
            <h2 className="text-base font-bold text-white mb-2">Dispute Triage & Legal Stops</h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Standard late fee utilities continue applying schedule rules unless an administrator manually intervenes.
              Jaktra automatically freezes cadences on customer inquiries and enforces a hardcoded Stage 5 Legal Stop at 31+ days overdue.
            </p>
          </div>
        </section>

        {/* Detailed Feature Comparison Matrix */}
        <section className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Head-to-Head Comparison: PaidNice vs. Jaktra
            </h2>
            <p className="text-sm text-zinc-400 max-w-xl mx-auto">
              Compare architectural scope, recovery mechanisms, and customer experience side by side.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#111113] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-white/[0.03] text-xs font-mono uppercase tracking-wider text-zinc-300">
                    <th className="py-4 px-6 font-semibold">Capability</th>
                    <th className="py-4 px-6 font-semibold w-1/3 text-zinc-400">PaidNice</th>
                    <th className="py-4 px-6 font-semibold w-1/3 text-[#b7d2f8] bg-[#b7d2f8]/10 border-l border-[#b7d2f8]/20">
                      Jaktra (Autonomous AI)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {COMPARISON_DATA.map((row, idx) => (
                    <tr
                      key={idx}
                      className={row.highlight ? "bg-white/[0.02] hover:bg-white/[0.04] transition-colors" : "hover:bg-white/[0.02] transition-colors"}
                    >
                      <td className="py-4 px-6 font-medium text-white">
                        <div>{row.feature}</div>
                        <div className="text-[11px] text-zinc-400 font-mono mt-0.5">{row.category}</div>
                      </td>
                      <td className="py-4 px-6 text-zinc-400">{row.paidNice}</td>
                      <td className="py-4 px-6 text-zinc-200 bg-[#b7d2f8]/[0.03] border-l border-[#b7d2f8]/20">
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-[#b7d2f8] shrink-0 mt-0.5" />
                          <span>{row.jaktra}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 4 Architectural Moats (Open Scannable Grid) */}
        <section className="mb-20">
          <div className="text-center mb-10">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-2">
              Operational Strategy
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Why Autonomous Engagement Outperforms Punitive Penalties
            </h2>
            <p className="text-sm text-zinc-400 max-w-xl mx-auto mt-2">
              Critical operational advantages of partnering constructively with buyers rather than imposing late fee frictions that break PO matching.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 sm:p-7 rounded-2xl bg-[#111113] border border-white/[0.08] shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8]">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-white/[0.04] border border-white/[0.08] text-[#b7d2f8]">
                    Enterprise Reality
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  The Flaw of Automated Late Fees in B2B Commerce
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-4">
                  In enterprise contracting, buyers have established payment terms (Net 30/60) and strict approval cycles. When an automated tool adds a $150 late fee to an overdue invoice, accounts payable systems reject the invoice because the total no longer matches their approved Purchase Order (PO). This creates administrative gridlock, forcing human account executives to apologize and issue credit notes. Jaktra uses respectful, generative tone escalation that inspires urgent payment without breaking PO matching.
                </p>
              </div>
              <div className="text-xs text-zinc-300 flex items-center gap-1.5 pt-3 border-t border-white/[0.05]">
                <Check className="w-3.5 h-3.5 text-[#b7d2f8]" />
                <span>Keep your invoices 100% PO-compliant while driving faster cash collection</span>
              </div>
            </div>

            <div className="p-6 sm:p-7 rounded-2xl bg-[#111113] border border-white/[0.08] shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8]">
                    <Split className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-white/[0.04] border border-white/[0.08] text-[#b7d2f8]">
                    Cashflow Recovery
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  Self-Service 2x / 3x / 4x Installment Workflows
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-4">
                  When cash-constrained clients face punitive late fees, they often default, dispute, or ghost entirely. Inside Jaktra&apos;s tokenized debtor portal (<code className="text-xs font-mono">/i/:token</code>), buyers can split large delinquent balances into automated 2x, 3x, or 4x milestone payments with pre-scheduled Razorpay auto-debits. This turns potential write-offs into predictable incoming cash.
                </p>
              </div>
              <div className="text-xs text-zinc-300 flex items-center gap-1.5 pt-3 border-t border-white/[0.05]">
                <Check className="w-3.5 h-3.5 text-[#b7d2f8]" />
                <span>Recover 40%+ more doubtful accounts by providing structured flexibility</span>
              </div>
            </div>

            <div className="p-6 sm:p-7 rounded-2xl bg-[#111113] border border-white/[0.08] shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8]">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-white/[0.04] border border-white/[0.08] text-[#b7d2f8]">
                    Debtor UX
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  Zero-Login Tokenized Debtor Portals (<code className="text-xs font-mono">/i/:token</code>)
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-4">
                  PaidNice redirects debtors to standard payment links or requests manual bank wire confirmation. Jaktra generates secure cryptographic debtor portal links. Debtors review itemized statements, select installment plans, and pay instantly via Razorpay (UPI, NetBanking, Cards) with immediate webhook ledger reconciliation.
                </p>
              </div>
              <div className="text-xs text-zinc-300 flex items-center gap-1.5 pt-3 border-t border-white/[0.05]">
                <Check className="w-3.5 h-3.5 text-[#b7d2f8]" />
                <span>Instant payment links lower payment friction from days down to under 60 seconds</span>
              </div>
            </div>

            <div className="p-6 sm:p-7 rounded-2xl bg-[#111113] border border-white/[0.08] shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8]">
                    <MailX className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-white/[0.04] border border-white/[0.08] text-[#b7d2f8]">
                    Infrastructure
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  Dead Letter Queue &amp; Domain Sender Reputation Protection
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-4">
                  Traditional dunning tools send emails through basic relays without bounce management. Jaktra incorporates a real-time Dead Letter Queue with exponential backoff retries and an automated 3-drop circuit breaker that halts outreach before invalid addresses can trigger spam blacklist penalties on your corporate domain.
                </p>
              </div>
              <div className="text-xs text-zinc-300 flex items-center gap-1.5 pt-3 border-t border-white/[0.05]">
                <Check className="w-3.5 h-3.5 text-[#b7d2f8]" />
                <span>Proactively isolate failing recipient mailboxes and alert credit controllers immediately</span>
              </div>
            </div>
          </div>
        </section>

        {/* Objective Decision Guide */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <div className="rounded-2xl border border-white/[0.08] bg-[#111113] p-6 sm:p-7">
            <h3 className="text-base font-semibold text-zinc-300 mb-3">When PaidNice is the Right Choice</h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-400">
              <li className="flex items-start gap-2">
                <span className="text-zinc-500 font-mono">•</span>
                <span>Your customer contracts explicitly specify and mandate automated late payment fees and interest charges.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-zinc-500 font-mono">•</span>
                <span>You operate primarily with small business customers in Xero or QuickBooks who accept line-item penalties.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-zinc-500 font-mono">•</span>
                <span>Your primary accounts receivable policy relies on interest compounding to deter delinquent payers.</span>
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-white/[0.12] bg-[#111113] p-6">
            <h3 className="text-base font-semibold text-white mb-3">When Jaktra is the Right Architectural Fit</h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-300">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#b7d2f8] shrink-0 mt-0.5" />
                <span>You sell to B2B or enterprise accounts where adding late fee line items causes Purchase Order (PO) mismatches and invoice rejections.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#b7d2f8] shrink-0 mt-0.5" />
                <span>You want generative AI tone escalation that urges payment while protecting executive and client relationships.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#b7d2f8] shrink-0 mt-0.5" />
                <span>You want to offer self-serve 2x/3x/4x installment payment plans via tokenized portals (/i/:token) to recover cash from constrained debtors.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#b7d2f8] shrink-0 mt-0.5" />
                <span>You want automated NLP dispute triage and a hardcoded Stage 5 Legal Stop at 31+ days overdue.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* FAQ Section with outline Accordion */}
        <section className="mb-20">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Frequently Asked Questions</h2>
            <p className="text-sm text-zinc-400">
              Key considerations for finance teams evaluating PaidNice vs Jaktra.
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
        <section className="rounded-2xl border border-white/[0.08] bg-gradient-to-r from-blue-950/30 via-[#111113] to-purple-950/30 p-10 text-center shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Upgrade from Punitive Late Fees to Autonomous AI Collections
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto mb-6">
            Get paid faster while preserving client relationships. Set up Jaktra in 15 minutes with our 100% Free Early Access.
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

export default PaidNiceCompare;

import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Boxes, ShieldCheck, Calculator, DollarSign, AlertCircle, Truck, Clock, FileCheck, CheckCircle2, Shield, Calendar } from "lucide-react";
import jaktraLogo from "../assets/jaktra_svg.svg";
import { SEOHead } from "../components/common/SEOHead";
import { wholesaleUseCaseSchema, breadcrumbSchema } from "../components/common/seo-schemas";
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

interface WholesaleStageItem {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  timing: string;
  tone: string;
  badge: string;
  description: string;
  safeguardTitle: string;
  safeguardDesc: string;
}

const WHOLESALE_STAGES: WholesaleStageItem[] = [
  {
    id: "stage-1",
    number: "01",
    title: "Delivery Confirmation & Pre-Due Verification",
    subtitle: "Verifies signed delivery slips, manifest numbers, and AP billing details before due date",
    timing: "Day -3 to Due Date",
    tone: "Polite, Administrative, Collaborative",
    badge: "Day -3 Pre-Due",
    description: "Verifies receipt of signed delivery slips, manifest numbers, and AP billing contact details before the due date so routine route invoices are scheduled for payment on time.",
    safeguardTitle: "Pre-Due Audit",
    safeguardDesc: "Proactively catches missing POs or incorrect invoice amounts before month-end settlement deadlines.",
  },
  {
    id: "stage-2",
    number: "02",
    title: "Firm Account Reconciliation & Discrepancy Inquiry",
    subtitle: "Inquires whether damaged cases occurred; isolates discrepancies with instant payment links",
    timing: "Days 1–7 Overdue",
    tone: "Friendly, Inquiring, Professional",
    badge: "Days 1–7 Overdue",
    description: "Inquires whether damaged cases, crushed pallets, or invoice matching issues occurred; isolates discrepancies immediately and provides instant zero-login payment links for undisputed lines.",
    safeguardTitle: "Dispute Triage",
    safeguardDesc: "Enables retail store managers and restaurant AP to settle partial balances in 30 seconds via Razorpay without password friction.",
  },
  {
    id: "stage-3",
    number: "03",
    title: "Commercial Escalation & Credit Hold Advisory",
    subtitle: "Reminds store ownership that route deliveries depend on resolving overdue balances",
    timing: "Days 8–14 Overdue",
    tone: "Direct, Business-Critical, Clear",
    badge: "Days 8–14 Overdue",
    description: "Reminds store ownership and procurement leads that upcoming route deliveries and trade credit terms depend on resolving outstanding account balances.",
    safeguardTitle: "Margin Protection",
    safeguardDesc: "Protects distributor operating margins by establishing clear payment boundaries while maintaining open communication.",
  },
  {
    id: "stage-4",
    number: "04",
    title: "Urgent Notice & Shipment Suspension Warning",
    subtitle: "Notifies debtor executives of Cash-on-Delivery (COD) hold while offering 2x/3x installment plans",
    timing: "Days 15–30 Overdue",
    tone: "Stern, Executive, Direct",
    badge: "Days 15–30 Critical",
    description: "Notifies debtor executives that scheduled delivery routes are being placed on Cash-on-Delivery (COD) hold, while offering 2x/3x structured installment plans to clear delinquent balances.",
    safeguardTitle: "Structured Recovery",
    safeguardDesc: "Provides automated weekly milestone recovery plans via the tokenized portal to keep retail doors open.",
  },
  {
    id: "stage-5",
    number: "05",
    title: "Legal Stop & Executive Credit Review",
    subtitle: "Strict automated circuit breaker halts communication; mandates executive credit review",
    timing: "Day 31+ Overdue",
    tone: "Compliance Halt & Human Handover",
    badge: "Day 31+ Legal Stop",
    description: "Strict automated circuit breaker halts communication; mandates VP of Finance and credit manager review before taking formal legal collection steps or debt recovery action.",
    safeguardTitle: "Compliance Safeguard",
    safeguardDesc: "Ensures regulatory compliance, protects your corporate domain reputation, and prevents harassment claims.",
  },
];

export function WholesaleDistributionUseCase() {
  // Wholesale Working Capital Calculator State
  const [monthlyVolume, setMonthlyVolume] = useState<number>(1200000);
  const [netMargin, setNetMargin] = useState<number>(4.5); // 4.5% typical distributor margin
  const [currentDso, setCurrentDso] = useState<number>(54);
  const [targetDsoReduction, setTargetDsoReduction] = useState<number>(14);

  // Calculations
  const annualRevenue = monthlyVolume * 12;
  const annualNetProfit = annualRevenue * (netMargin / 100);
  const trappedWorkingCapital = (annualRevenue / 365) * currentDso;
  const freedWorkingCapital = (annualRevenue / 365) * targetDsoReduction;
  const jaktraAnnualCost = 249 * 12; // $2,988/yr Scale tier
  const interestSavingsAt8Pct = freedWorkingCapital * 0.085;
  const netAnnualWorkingCapitalGain = interestSavingsAt8Pct - jaktraAnnualCost;

  const faqs = [
    {
      q: "Why are wholesale distributor margins so uniquely vulnerable to late receivables?",
      a: "Wholesale distributors in food & beverage, industrial hardware, and electronics operate on razor-thin net margins typically between 3% and 6%. When a retail customer defaults on a $20,000 invoice at 4% net margin, the distributor must generate $500,000 in new sales just to break even on that single bad debt. Jaktra accelerates payment velocity and halts credit exposure before losses accumulate.",
    },
    {
      q: "How does Jaktra handle short-shipments, crushed cartons, and damaged pallet claims?",
      a: "Delivery discrepancies are the #1 reason supermarket chains, restaurants, and retail AP teams hold up distributor payments. When a customer replies with 'short 4 cases of SKU-402' or 'pallet arrived crushed on dock', Jaktra's DisputeAgent parses the response, auto-freezes the collection cadence, alerts warehouse operations to verify the bill of lading, and immediately prompts the buyer to remit the undisputed portion of the invoice.",
    },
    {
      q: "Can retail customers settle invoices via direct virtual bank accounts or ACH?",
      a: "Yes. Jaktra generates tokenized, zero-login debtor links (/i/:token). Retailers and restaurant groups can view invoice itemizations, inspect delivery notes, and settle balances in under 30 seconds via Razorpay (supporting corporate NetBanking, UPI, dedicated virtual accounts for instant NEFT/RTGS reconciliation, and cards) without creating an account or remembering a password.",
    },
    {
      q: "What if an independent retailer is facing seasonal cash crunches and cannot pay in full?",
      a: "Cutting off an independent grocery or specialty store risks losing a long-term account permanently. Jaktra's self-serve installment engine allows finance teams to offer structured 2x, 3x, or 4x milestone payment plans directly inside the debtor portal. Debtors commit to manageable weekly tranches while inventory holds are conditionally lifted upon initial down payment.",
    },
    {
      q: "How does Jaktra's 20-hour idempotency and Stage 5 Legal Stop prevent client alienation?",
      a: "Distributor-retailer relationships are built on weekly recurring routes. Excessive or mis-timed automated dunning damages buyer goodwill. Jaktra enforces a strict 20-hour rolling idempotency barrier preventing multi-contact spam, while Stage 5 Legal Stop automatically freezes automated messaging at 31+ days overdue, requiring human credit manager review before legal or credit agency handoff.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#f5f5f5] font-sans selection:bg-[#b7d2f8]/20 selection:text-white antialiased">
      <SEOHead
        title="How Wholesale Distributors Stop Delivery Deductions & Accelerate Net-60 Terms | Jaktra"
        description="Learn how wholesale distributors stop short-shipment claims and delivery deductions from eroding gross margins. Automate invoice follow-ups and isolate disputed line items."
        canonicalPath="/use-cases/wholesale-distribution"
        jsonLd={[
          wholesaleUseCaseSchema,
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Use Cases", path: "/use-cases" },
            { name: "Wholesale Distribution AR Guide", path: "/use-cases/wholesale-distribution" },
          ]),
        ]}
      />

      <HeaderNav />

      <main className="pt-28 sm:pt-32 pb-24 px-4 sm:px-6 max-w-5xl mx-auto relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(183,210,248,0.06),transparent)] pointer-events-none" />
        <nav aria-label="Breadcrumb" className="mb-6 text-xs text-zinc-500 relative z-10">
          <ol className="flex items-center gap-2">
            <li>
              <Link to="/" className="hover:text-zinc-300 transition-colors">
                Home
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link to="/use-cases" className="text-zinc-400 hover:text-zinc-300 transition-colors">
                Use Cases
              </Link>
            </li>
            <li>/</li>
            <li className="text-zinc-300 font-medium" aria-current="page">
              Wholesale Distribution AR Guide
            </li>
          </ol>
        </nav>

        {/* HERO SECTION */}
        <section className="text-center max-w-4xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-4">
            Wholesale Distribution Cash Flow &amp; Deduction Control Guide
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-6 leading-tight">
            Stop Short-Shipment Deductions &amp; 60-Day Terms from Crushing Wholesale Margins
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 max-w-3xl mx-auto leading-relaxed mb-8">
            Distributors operate on thin 3%–6% gross margins where short-shipment deductions and 60-day payment delays stall supplier restocking. Discover how automated reply parsing isolates disputed items and collects undisputed invoice balances immediately.
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

        {/* PAIN POINTS SECTION: Standard Horizontal Design */}
        <section className="max-w-5xl mx-auto px-6 py-16 border-t border-white/5">
          <div className="max-w-3xl mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight">
              Why Traditional AR Fails Wholesale &amp; Distribution Operations
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
              Weekly delivery routes meet bureaucratic corporate AP departments. Here is why distributors suffer from chronic cash crunches:
            </p>
          </div>

          <div className="space-y-4">
            {/* Dilemma 1 */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[#111113] border border-white/[0.08] hover:border-white/[0.18] transition-all duration-200 shadow-md">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="lg:w-5/12 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">Margin Vulnerability</span>
                    <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
                      3%–6% Net Margin Fragility
                    </h3>
                    <div className="mt-1 text-xs font-mono text-zinc-400">
                      High leverage turns late AR into acute liquidity distress
                    </div>
                  </div>
                </div>

                <div className="lg:w-7/12 lg:border-l lg:border-white/[0.08] lg:pl-8">
                  <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                    When margins are thin, write-offs are catastrophic. Writing off a $25,000 restaurant chain invoice forces your team to sell $600,000+ of inventory just to replace that lost capital.
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-xs font-medium text-[#b7d2f8]">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Disciplined autonomous tone escalation protects tight margins before debts age past 60 days</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dilemma 2 */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[#111113] border border-white/[0.08] hover:border-white/[0.18] transition-all duration-200 shadow-md">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="lg:w-5/12 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8] shrink-0">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Dock Receiving Holds</span>
                    <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
                      Delivery Discrepancies Stall Full Invoices
                    </h3>
                    <div className="mt-1 text-xs font-mono text-zinc-400">
                      Minor receiving dock disputes freeze major cash flow
                    </div>
                  </div>
                </div>

                <div className="lg:w-7/12 lg:border-l lg:border-white/[0.08] lg:pl-8">
                  <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                    A missing carton on dock receiving or a crushed outer carton causes retail AP to freeze the entire $40,000 order for 60 days rather than paying the undisputed 98% balance immediately.
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-xs font-medium text-[#b7d2f8]">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>DisputeAgent isolates dock claims and collects undisputed balances immediately</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dilemma 3 */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[#111113] border border-white/[0.08] hover:border-white/[0.18] transition-all duration-200 shadow-md">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="lg:w-5/12 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8] shrink-0">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Working Capital Gap</span>
                    <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
                      Supplier Pay Runs vs. Net 60 Terms
                    </h3>
                    <div className="mt-1 text-xs font-mono text-zinc-400">
                      Distributors absorb the financing costs of entire supply chains
                    </div>
                  </div>
                </div>

                <div className="lg:w-7/12 lg:border-l lg:border-white/[0.08] lg:pl-8">
                  <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                    Primary manufacturers require payment in Net 15–30 days, while retail grocers and institutional buyers stretch to Net 60–75, forcing distributors to max out expensive revolving credit lines.
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-xs font-medium text-[#b7d2f8]">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Automated payment links and 2x–4x installments compress DSO from 58d down to 37d</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ARCHITECTURE SOLUTION SECTION */}
        <section className="max-w-5xl mx-auto px-6 py-16 border-t border-white/5">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Jaktra’s Purpose-Built Architecture for Wholesale &amp; Supply Chains
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto text-sm sm:text-base">
              Autonomous conversational AI execution designed to preserve retail buyer relationships while accelerating cash velocity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 rounded-xl bg-[#111113] border border-white/[0.08]">
              <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8] mb-4">
                <FileCheck className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">AI Short-Shipment &amp; Damage Triage</h3>
              <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                When retail AP replies stating cartons were damaged or quantities did not match the delivery ticket, Jaktra’s <code className="text-zinc-200 text-xs bg-white/[0.06] px-1.5 py-0.5 rounded">dispute_agent.py</code> classifies the claim, halts automated dunning on the disputed portion, notifies the warehouse, and facilitates immediate payment of the undisputed goods.
              </p>
              <ul className="space-y-2 text-xs text-zinc-300">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#b7d2f8]" />
                  Extracts SKU numbers, carton counts, and damaged lot codes
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#b7d2f8]" />
                  Isolates undisputed lines so 90%+ of invoice funds clear immediately
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-xl bg-[#111113] border border-white/[0.08]">
              <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8] mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Proof-of-Delivery (POD) Verification</h3>
              <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                Jaktra initiates Stage 1 courtesy check-ins 3 days before due date, asking buyer receiving contacts to confirm receipt of signed bills of lading and receiving stamps, eliminating the classic "we never got this invoice" excuse on Day 45.
              </p>
              <ul className="space-y-2 text-xs text-zinc-300">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#b7d2f8]" />
                  Direct attachments of receiving slips and signed driver manifests
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#b7d2f8]" />
                  Pre-due verification resolves administrative discrepancies before invoice maturity
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-xl bg-[#111113] border border-white/[0.08]">
              <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8] mb-4">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Zero-Login Debtor Payment Portal</h3>
              <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                Retail buyers click a secure tokenized link (<code className="text-zinc-200 text-xs bg-white/[0.06] px-1.5 py-0.5 rounded">/i/:token</code>) and settle within 30 seconds via Razorpay using dedicated virtual bank accounts (instant NEFT/RTGS auto-reconciliation), NetBanking, UPI, or corporate cards without creating logins.
              </p>
              <ul className="space-y-2 text-xs text-zinc-300">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#b7d2f8]" />
                  Zero password friction for store managers and busy restaurant bookkeepers
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#b7d2f8]" />
                  Real-time webhook reconciliation updates your ERP ledger instantaneously
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-xl bg-[#111113] border border-white/[0.08]">
              <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8] mb-4">
                <Boxes className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Structured 2x/3x/4x Installments</h3>
              <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                For struggling independent retail accounts, cutting credit shuts off revenue and pushes them into default. Jaktra enables debtors to self-select structured weekly installment plans that protect business continuity while recovering principal.
              </p>
              <ul className="space-y-2 text-xs text-zinc-300">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#b7d2f8]" />
                  Automated weekly milestone collection via Razorpay mandate
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#b7d2f8]" />
                  Maintains accounts on route deliveries while curing historical arrears
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 5-STAGE TONE ESCALATION - Open Cadence Architecture */}
        <section className="mb-20 sm:mb-24">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-2">
              Wholesale AR Cadence
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              5-Stage Tone Escalation Engine: Adapted for Wholesale Accounts
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto text-xs sm:text-sm leading-relaxed">
              How Jaktra’s Groq LLaMA 3.1 AI modulates communication to recover past-due funds without alienating valuable recurring commercial buyers.
            </p>
          </div>

          {/* Quick-Glance Cadence Table */}
          <div className="mb-10 overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#111113]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                  <th className="py-3.5 px-4 font-semibold text-zinc-300">Stage &amp; Timing</th>
                  <th className="py-3.5 px-4 font-semibold text-zinc-300">Tone Classification</th>
                  <th className="py-3.5 px-4 font-semibold text-zinc-300">Distributor Safeguard</th>
                  <th className="py-3.5 px-4 font-semibold text-zinc-300">Operational Objective</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {WHOLESALE_STAGES.map((s) => (
                  <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[#b7d2f8] font-bold">{s.number}</span>
                        <span className="font-medium text-white">{s.title}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-white/[0.04] text-zinc-300 border border-white/[0.06]">
                        {s.tone}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-300 font-medium">
                      <span className="text-[#b7d2f8] font-mono text-[11px] mr-1">[{s.safeguardTitle}]</span>
                      <span className="text-xs text-zinc-400">{s.safeguardDesc}</span>
                    </td>
                    <td className="py-3 px-4 text-zinc-400 font-mono text-[11px]">{s.timing}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Unrolled 5 Stage Cards */}
          <div className="space-y-5">
            {WHOLESALE_STAGES.map((stage) => (
              <div
                key={stage.id}
                className="rounded-2xl border border-white/[0.08] bg-[#111113] p-6 sm:p-7 hover:border-white/20 transition-all duration-300"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  <div className="lg:col-span-7 space-y-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-[#b7d2f8] bg-[#b7d2f8]/10 px-2.5 py-0.5 rounded-full border border-[#b7d2f8]/20">
                        Stage {stage.number}
                      </span>
                      <span className="text-xs font-mono text-zinc-400 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06]">
                        {stage.badge}
                      </span>
                      <span className="text-xs text-zinc-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-zinc-400" />
                        {stage.timing}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white tracking-tight">
                      {stage.title}
                    </h3>
                    <p className="text-xs text-[#b7d2f8] font-medium">
                      {stage.subtitle}
                    </p>
                    <p className="text-sm text-zinc-400 leading-relaxed pt-1">
                      {stage.description}
                    </p>
                  </div>

                  <div className="lg:col-span-5 rounded-xl bg-[#0a0a0b]/80 border border-white/[0.06] p-4 sm:p-5 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-white">
                      <Shield className="w-4 h-4 text-[#b7d2f8] shrink-0" />
                      <span>{stage.safeguardTitle}</span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {stage.safeguardDesc}
                    </p>
                    <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                      <span>Tone Profile:</span>
                      <span className="text-zinc-300">{stage.tone}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* INTERACTIVE CALCULATOR */}
        <section className="max-w-4xl mx-auto px-6 py-16 border-t border-white/5">
          <div className="p-8 rounded-2xl bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/10 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8]">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Wholesale Working Capital &amp; Margin Simulator</h3>
                <p className="text-xs text-zinc-400">Model the cash released from faster payment cycles on low distributor margins.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-2">
                  Monthly Distribution Volume: ${monthlyVolume.toLocaleString()}
                </label>
                <input
                  type="range"
                  min={300000}
                  max={5000000}
                  step={100000}
                  value={monthlyVolume}
                  onChange={(e) => setMonthlyVolume(Number(e.target.value))}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#b7d2f8]"
                />
                <span className="text-[11px] text-zinc-500 mt-1 block">$300k to $5M/month</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-2">
                  Net Operating Margin: {netMargin}%
                </label>
                <input
                  type="range"
                  min={2.0}
                  max={8.0}
                  step={0.5}
                  value={netMargin}
                  onChange={(e) => setNetMargin(Number(e.target.value))}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#b7d2f8]"
                />
                <span className="text-[11px] text-zinc-500 mt-1 block">Typical distributor: 3% to 6%</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-2">
                  Current Customer DSO: {currentDso} days
                </label>
                <input
                  type="range"
                  min={35}
                  max={85}
                  step={1}
                  value={currentDso}
                  onChange={(e) => setCurrentDso(Number(e.target.value))}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#b7d2f8]"
                />
                <span className="text-[11px] text-zinc-500 mt-1 block">Wholesale average: 50–65 days</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-2">
                  Simulated DSO Compression: -{targetDsoReduction} days
                </label>
                <input
                  type="range"
                  min={5}
                  max={30}
                  step={1}
                  value={targetDsoReduction}
                  onChange={(e) => setTargetDsoReduction(Number(e.target.value))}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#b7d2f8]"
                />
                <span className="text-[11px] text-zinc-500 mt-1 block">Simulated treasury target</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-white/10 text-center">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-xs text-zinc-400 block mb-1">Trapped Working Capital</span>
                <span className="text-xl sm:text-2xl font-bold font-mono text-zinc-200">
                  ${Math.round(trappedWorkingCapital).toLocaleString()}
                </span>
                <span className="text-[10px] text-zinc-500 block mt-1">Capital tied in overdue AR</span>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-xs text-zinc-400 block mb-1">Simulated DSO Goal</span>
                <span className="text-xl sm:text-2xl font-bold text-white">
                  -{targetDsoReduction} Days
                </span>
                <span className="text-[10px] text-zinc-500 block mt-1">Down to {currentDso - targetDsoReduction} days</span>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.12]">
                <span className="text-xs text-zinc-300 font-medium block mb-1">Modeled Cash Flow Unlocked</span>
                <span className="text-xl sm:text-2xl font-bold text-white">
                  ${Math.round(freedWorkingCapital).toLocaleString()}
                </span>
                <span className="text-[10px] text-zinc-400 block mt-1">Saves ${Math.round(interestSavingsAt8Pct).toLocaleString()}/yr on credit line</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs text-zinc-400">
                Annual Net Profit: <span className="text-white font-medium">${Math.round(annualNetProfit).toLocaleString()}</span> • Annual Jaktra Cost: <span className="text-white font-medium">$2,988</span> • Net working capital interest saved: <span className="text-[#b7d2f8] font-semibold">${Math.round(netAnnualWorkingCapitalGain).toLocaleString()}/yr</span>
              </p>
            </div>
          </div>
        </section>

        {/* COMPARISON TABLE */}
        <section className="max-w-5xl mx-auto px-6 py-16 border-t border-white/5">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Jaktra vs. Legacy ERP &amp; Manual Credit Control
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto text-sm sm:text-base">
              Why spreadsheet dunning and generic ERP reminder emails fail in wholesale logistics.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#111113] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse min-w-[720px]">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-white/[0.03] text-xs font-mono uppercase tracking-wider text-zinc-300">
                    <th className="py-4 px-6 font-semibold">Capability</th>
                    <th className="py-4 px-6 font-semibold text-[#b7d2f8]">Jaktra Autonomous Agent</th>
                    <th className="py-4 px-6 font-semibold text-zinc-400">Generic ERP (NetSuite/SAP)</th>
                    <th className="py-4 px-6 font-semibold text-zinc-400">Manual Collector Calls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05] text-xs sm:text-sm">
                  <tr className="hover:bg-white/[0.015] transition-colors">
                    <td className="py-4 px-6 font-medium text-white">Dispute Classification</td>
                    <td className="py-4 px-6 text-zinc-100 font-medium bg-white/[0.02]">
                      Autonomous NLP triage (<code className="text-xs font-mono text-[#b7d2f8] bg-white/[0.05] px-1.5 py-0.5 rounded">dispute_agent.py</code>)
                    </td>
                    <td className="py-4 px-6 text-zinc-400">None (emails hit shared inbox)</td>
                    <td className="py-4 px-6 text-zinc-400">Manual logging in spreadsheets</td>
                  </tr>
                  <tr className="hover:bg-white/[0.015] transition-colors">
                    <td className="py-4 px-6 font-medium text-white">Short-Shipment Handling</td>
                    <td className="py-4 px-6 text-zinc-100 font-medium bg-white/[0.02]">
                      Isolates claim, collects undisputed balance
                    </td>
                    <td className="py-4 px-6 text-zinc-400">Full invoice paused or unpaid</td>
                    <td className="py-4 px-6 text-zinc-400">Manual dispute notes</td>
                  </tr>
                  <tr className="hover:bg-white/[0.015] transition-colors">
                    <td className="py-4 px-6 font-medium text-white">Tone Modulation</td>
                    <td className="py-4 px-6 text-zinc-100 font-medium bg-white/[0.02]">
                      Groq LLaMA 3.1 5-stage adaptive copy
                    </td>
                    <td className="py-4 px-6 text-zinc-400">Static boilerplate merge fields</td>
                    <td className="py-4 px-6 text-zinc-400">Inconsistent collector mood</td>
                  </tr>
                  <tr className="hover:bg-white/[0.015] transition-colors">
                    <td className="py-4 px-6 font-medium text-white">Payment Experience</td>
                    <td className="py-4 px-6 text-zinc-100 font-medium bg-white/[0.02]">
                      Zero-login portal (<code className="text-xs font-mono text-[#b7d2f8] bg-white/[0.05] px-1.5 py-0.5 rounded">/i/:token</code>) + Razorpay
                    </td>
                    <td className="py-4 px-6 text-zinc-400">Complex multi-factor customer portal</td>
                    <td className="py-4 px-6 text-zinc-400">Check or manual wire instructions</td>
                  </tr>
                  <tr className="hover:bg-white/[0.015] transition-colors">
                    <td className="py-4 px-6 font-medium text-white">Installment Recovery</td>
                    <td className="py-4 px-6 text-zinc-100 font-medium bg-white/[0.02]">
                      Self-serve 2x/3x/4x milestone plans
                    </td>
                    <td className="py-4 px-6 text-zinc-400">Custom manual journal entries</td>
                    <td className="py-4 px-6 text-zinc-400">Unenforced handshake agreements</td>
                  </tr>
                  <tr className="hover:bg-white/[0.015] transition-colors">
                    <td className="py-4 px-6 font-medium text-white">Time to Value</td>
                    <td className="py-4 px-6 text-zinc-100 font-medium bg-white/[0.02]">
                      15 minutes (CSV or REST API)
                    </td>
                    <td className="py-4 px-6 text-zinc-400">3 to 6 months implementation</td>
                    <td className="py-4 px-6 text-zinc-400">Ongoing recruiter/collector hiring</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="max-w-4xl mx-auto px-6 py-16 border-t border-white/5">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Frequently Asked Questions for Wholesale Distributors
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base">
              Common questions about automated AR, delivery claim triage, and buyer retention.
            </p>
          </div>

          <Accordion type="single" variant="outline" defaultValue="faq-0" collapsible className="w-full">
            {faqs.map((faq, idx) => (
              <AccordionItem key={idx} value={`faq-${idx}`}>
                <AccordionTrigger>{faq.q}</AccordionTrigger>
                <AccordionContent>{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* BOTTOM CTA */}
        <section className="max-w-4xl mx-auto px-6 py-16 text-center border-t border-white/5">
          <div className="p-8 sm:p-12 rounded-2xl bg-gradient-to-b from-white/[0.04] to-transparent border border-white/10">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 font-display">
              Accelerate Wholesale Route Cash Flow Today
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto text-sm sm:text-base mb-8">
              Join leading distributors using Jaktra’s autonomous conversational AI to eliminate short-shipment disputes, cut DSO by 16+ days, and safeguard working capital.
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

export default WholesaleDistributionUseCase;

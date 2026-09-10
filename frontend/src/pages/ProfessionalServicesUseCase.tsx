import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Scale,
  CreditCard,
  Calculator,
  Users,
  CheckCircle2,
  Shield,
  Calendar,
} from "lucide-react";
import jaktraLogo from "../assets/jaktra_svg.svg";
import { SEOHead } from "../components/common/SEOHead";
import { professionalServicesSchema, breadcrumbSchema } from "../components/common/seo-schemas";
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

interface ProfessionalServicesStageItem {
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

const PROFESSIONAL_SERVICES_STAGES: ProfessionalServicesStageItem[] = [
  {
    id: "stage-1",
    number: "01",
    title: "Pre-Due Retainer Top-Up & Milestone Audit",
    subtitle: "Reviews retainer burn rates and milestone signoffs before the billing cycle closes",
    timing: "Day -5 to Due Date",
    tone: "Courteous, Administrative",
    badge: "Day -5 Pre-Due",
    description: "Courteously reviews client retainer burn rates and milestone phase signoffs 5 days before the monthly billing cycle closes. Verifies whether client AP has the necessary purchase order numbers on file.",
    safeguardTitle: "Retainer Replenishment",
    safeguardDesc: "Prompts evergreen trust or operating retainer top-ups before monthly work exhausts balance.",
  },
  {
    id: "stage-2",
    number: "02",
    title: "Accounts Receivable Institutional Check-in",
    subtitle: "Follow-up originates from centralized finance, keeping partners as trusted advisors",
    timing: "Days 1–7 Overdue",
    tone: "Friendly, Objective, Solution-Oriented",
    badge: "Days 1–7 Overdue",
    description: "Removes senior partners from the awkward role of debt collection. Polite follow-up originates from the centralized finance desk, maintaining the partner's position as a trusted advisor.",
    safeguardTitle: "Zero-Login Link",
    safeguardDesc: "Embeds an instant settlement link (/i/:token) where corporate clients can pay in under 60 seconds via Razorpay NetBanking, UPI, or corporate cards.",
  },
  {
    id: "stage-3",
    number: "03",
    title: "Time-Entry & Scope Dispute Triage",
    subtitle: "Isolates disputed hours or advisory fees while pausing dunning during review",
    timing: "Days 8–14 Overdue",
    tone: "Commercial, Collaborative, Firm",
    badge: "Days 8–14 Overdue",
    description: "When a corporate client questions partner billing rates, out-of-scope advisory deliverables, or expense receipts, Jaktra’s NLP DisputeAgent isolates the query, pauses automated dunning immediately, and drafts an internal ticket for your billing manager.",
    safeguardTitle: "Dispute Protection",
    safeguardDesc: "Prevents embarrassing automated collection emails from triggering during sensitive fee negotiations.",
  },
  {
    id: "stage-4",
    number: "04",
    title: "Practice Leadership Delivery Pause Notice",
    subtitle: "Formal notice that upcoming advisory workstreams or deliverables will be paused",
    timing: "Days 15–30 Overdue",
    tone: "Formal, Direct, High-Stakes",
    badge: "Days 15–30 Critical",
    description: "Formal communication warning that upcoming advisory workstreams, legal filings, or executive presentation milestones will be paused until outstanding billing is reconciled.",
    safeguardTitle: "Partner Shield",
    safeguardDesc: "Pre-notifies the lead relationship partner before sending, ensuring complete coordination.",
  },
  {
    id: "stage-5",
    number: "05",
    title: "Stage 5 Legal Stop & Managing Partner Audit",
    subtitle: "Autonomous messaging halts; compiles certified engagement letters and logs for review",
    timing: "Day 31+ Overdue",
    tone: "Final Demand / Human Review",
    badge: "Day 31+ (Legal Halt)",
    description: "Autonomous messaging strictly halts. Compiles certified engagement letters, time entry audit logs, delivered work products, and communications history for executive committee or general counsel review.",
    safeguardTitle: "Zero Spam",
    safeguardDesc: "100% human-in-the-loop audit trail. No robotic escalation damages your firm's market reputation.",
  },
];

export function ProfessionalServicesUseCase() {
  // Lockup & Realization Calculator State
  const [annualFees, setAnnualFees] = useState<number>(3000000);
  const [currentLockupDays, setCurrentLockupDays] = useState<number>(65);
  const [targetReductionDays, setTargetReductionDays] = useState<number>(14);
  const [partnerCount, setPartnerCount] = useState<number>(6);

  const capitalTrappedTotal = (annualFees / 365) * currentLockupDays;
  const capitalReleasedTotal = (annualFees / 365) * targetReductionDays;
  const capitalReleasedPerPartner = Math.round(capitalReleasedTotal / partnerCount);

  const faqs = [
    {
      q: "How does Jaktra eliminate awkward partner collections in law and advisory firms?",
      a: "Senior partners and practice directors should never be forced to chase unpaid bills right before quarterly reviews or strategic pitches. Jaktra acts as an institutional finance buffer: polite, professional reminders originate from accounts receivable, keeping partners 100% focused on billable delivery and client advisory.",
    },
    {
      q: "What happens when a client disputes billable hours or time entries?",
      a: "When a corporate client replies questioning partner billing rates or requesting an itemized breakdown of hours, Jaktra's NLP DisputeAgent flags the inquiry, immediately freezes automated collection cadences, and drafts an internal ticket for the practice billing manager to review with the client.",
    },
    {
      q: "Can clients replenish evergreen retainers through the portal?",
      a: "Yes. Jaktra generates secure, zero-login tokenized payment links (/i/:token). Clients can review their statement of account, verify trust or operating account balances, and replenish retainers via corporate credit cards, NetBanking, or instant UPI in under 60 seconds.",
    },
    {
      q: "How does Jaktra protect client relationships during fee escalations?",
      a: "Jaktra's tone modulation engine dynamically adapts communications across 5 stages: Stage 1 assumes administrative oversight, Stage 2 provides structured accounting follow-up, and Stage 3 introduces installment options—ensuring the firm's elite brand reputation and client goodwill remain pristine.",
    },
    {
      q: "How quickly can a consulting or law firm onboard onto Jaktra?",
      a: "In under 15 minutes. Practice managers can import their billing ledger via CSV or connect directly via API. Jaktra automatically extracts client billing contacts, due dates, and open balances with zero custom IT implementation.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#f5f5f5] font-sans selection:bg-[#b7d2f8]/20 selection:text-white antialiased">
      <SEOHead
        title="AI Accounts Receivable Automation for Professional Services & Legal | Jaktra"
        description="Eliminate partner billing friction for law firms, consultancies, and accounting practices. Triage billable hours scope disputes, automate retainer top-ups, and accelerate cash flow with Jaktra."
        canonicalPath="/use-cases/professional-services"
        jsonLd={[
          professionalServicesSchema,
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Use Cases", path: "/use-cases" },
            { name: "Professional Services", path: "/use-cases/professional-services" },
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
              <Link to="/use-cases" className="hover:text-zinc-300 transition-colors">
                Use Cases
              </Link>
            </li>
            <li>/</li>
            <li className="text-zinc-300 font-medium" aria-current="page">
              Professional Services
            </li>
          </ol>
        </nav>

        {/* Hero Section */}
        <section className="text-center max-w-4xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-4">
            Law Firms, Advisory &amp; Consulting Practices
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-6 leading-tight">
            Eliminate the Partner Billing Bottleneck: Cut 65+ Day Lockup &amp; Accelerate Cash Flow
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 max-w-3xl mx-auto leading-relaxed mb-8">
            Partners and practice directors should never have to chase unpaid invoices right before client pitches. Jaktra acts as an institutional finance buffer, triages billable hours disputes autonomously, and accelerates partner capital distributions.
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

        {/* Capability Architecture Banner */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-20">
          <div className="rounded-2xl border border-white/[0.08] bg-[#111113] p-6 text-center">
            <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono mb-1">5 Stages</div>
            <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Tone Escalation Cadence</div>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-[#111113] p-6 text-center">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#b7d2f8] font-mono mb-1">Auto-Pause</div>
            <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Fee Dispute NLP Triage</div>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-[#111113] p-6 text-center">
            <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono mb-1">Zero Login</div>
            <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Tokenized Retainer Portal</div>
          </div>
        </section>

        {/* Interactive Lockup & Partner Capital Calculator */}
        <section className="rounded-2xl border border-white/[0.08] bg-[#111113] p-8 sm:p-10 mb-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-lg bg-[#b7d2f8]/10 border border-[#b7d2f8]/20 flex items-center justify-center">
              <Calculator className="w-5 h-5 text-[#b7d2f8]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Partner Capital &amp; Lockup Acceleration Calculator</h2>
              <p className="text-xs sm:text-sm text-zinc-400">
                Model how reducing billing lockup days releases liquidity directly to partner capital distributions.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Input 1: Annual Billable Fees */}
            <div>
              <label htmlFor="annual-fees-range" className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
                Annual Billable Fees: <span className="text-white font-mono font-bold">${(annualFees / 1000000).toFixed(1)}M</span>
              </label>
              <input
                id="annual-fees-range"
                type="range"
                min={1000000}
                max={15000000}
                step={500000}
                value={annualFees}
                onChange={(e) => setAnnualFees(Number(e.target.value))}
                className="w-full accent-[#b7d2f8] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-zinc-500 mt-1">
                <span>$1M</span>
                <span>$15M</span>
              </div>
            </div>

            {/* Input 2: Current Lockup Days */}
            <div>
              <label htmlFor="lockup-days-range" className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
                Current Total DSO Lockup: <span className="text-white font-mono font-bold">{currentLockupDays} Days</span>
              </label>
              <input
                id="lockup-days-range"
                type="range"
                min={45}
                max={100}
                step={1}
                value={currentLockupDays}
                onChange={(e) => setCurrentLockupDays(Number(e.target.value))}
                className="w-full accent-zinc-400 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-zinc-500 mt-1">
                <span>45d</span>
                <span>100d</span>
              </div>
            </div>

            {/* Input 3: Simulated Reduction Goal */}
            <div>
              <label htmlFor="reduction-goal-range" className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
                Simulated Compression Goal: <span className="text-[#b7d2f8] font-mono font-bold">-{targetReductionDays} Days</span>
              </label>
              <input
                id="reduction-goal-range"
                type="range"
                min={1}
                max={30}
                step={1}
                value={targetReductionDays}
                onChange={(e) => setTargetReductionDays(Number(e.target.value))}
                className="w-full accent-[#b7d2f8] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-zinc-500 mt-1">
                <span>1d</span>
                <span>30d</span>
              </div>
            </div>

            {/* Input 4: Equity Partners Count */}
            <div>
              <label htmlFor="partners-count-range" className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
                Equity Partners: <span className="text-[#b7d2f8] font-mono font-bold">{partnerCount} Partners</span>
              </label>
              <input
                id="partners-count-range"
                type="range"
                min={2}
                max={25}
                step={1}
                value={partnerCount}
                onChange={(e) => setPartnerCount(Number(e.target.value))}
                className="w-full accent-[#b7d2f8] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-zinc-500 mt-1">
                <span>2</span>
                <span>25</span>
              </div>
            </div>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 rounded-xl bg-black/40 border border-white/[0.08]">
            <div>
              <div className="text-xs text-zinc-400 uppercase tracking-wider mb-1">Capital Trapped in AR Lockup</div>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-white">
                ${Math.round(capitalTrappedTotal).toLocaleString()}
              </div>
              <div className="text-xs text-zinc-500 mt-1">{currentLockupDays} days of trailing fee production</div>
            </div>
            <div>
              <div className="text-xs text-zinc-400 uppercase tracking-wider mb-1">Modeled Liquidity Released</div>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-white">
                +${Math.round(capitalReleasedTotal).toLocaleString()}
              </div>
              <div className="text-xs text-zinc-500 mt-1">Based on simulated -{targetReductionDays}d lockup compression</div>
            </div>
            <div>
              <div className="text-xs text-zinc-400 uppercase tracking-wider mb-1">Released per Equity Partner</div>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-[#b7d2f8]">
                +${capitalReleasedPerPartner.toLocaleString()}
              </div>
              <div className="text-xs text-zinc-500 mt-1">Modeled cash flow injection to partner distributions</div>
            </div>
          </div>
        </section>

        {/* 5-STAGE TONE ESCALATION - Open Cadence Architecture */}
        <section className="mb-20 sm:mb-24">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-2">
              Advisory AR Cadence
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Professional Services 5-Stage Tone Escalation
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
              How Jaktra accelerates billable collections while keeping relationship partners completely insulated from uncomfortable debt collection discussions.
            </p>
          </div>

          {/* Quick-Glance Cadence Table */}
          <div className="mb-10 overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#111113]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                  <th className="py-3.5 px-4 font-semibold text-zinc-300">Stage &amp; Timing</th>
                  <th className="py-3.5 px-4 font-semibold text-zinc-300">Tone Classification</th>
                  <th className="py-3.5 px-4 font-semibold text-zinc-300">Advisory Safeguard</th>
                  <th className="py-3.5 px-4 font-semibold text-zinc-300">Operational Objective</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {PROFESSIONAL_SERVICES_STAGES.map((s) => (
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
            {PROFESSIONAL_SERVICES_STAGES.map((stage) => (
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

        {/* 3 CORE FIRM CHALLENGES: Standard Horizontal Design */}
        <section className="mb-20">
          <div className="max-w-3xl mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight">
              Built for High-Trust Advisory Relationships
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
              Protect partner goodwill while eliminating the slow collection cycles that stall firm liquidity:
            </p>
          </div>

          <div className="space-y-4">
            {/* Dilemma 1 */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[#111113] border border-white/[0.08] hover:border-white/[0.18] transition-all duration-200 shadow-md">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="lg:w-5/12 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#b7d2f8]/10 border border-[#b7d2f8]/20 flex items-center justify-center text-[#b7d2f8] shrink-0">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#b7d2f8] uppercase tracking-wider">Partner Goodwill</span>
                    <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
                      Remove Partner Collection Friction
                    </h3>
                    <div className="mt-1 text-xs font-mono text-zinc-400">
                      Zero partner awkwardness
                    </div>
                  </div>
                </div>

                <div className="lg:w-7/12 lg:border-l lg:border-white/[0.08] lg:pl-8">
                  <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                    When partners have to send awkward reminder emails, it creates friction before major deliverables or fee renegotiations. Jaktra acts as an institutional finance desk, keeping partners in their trusted advisor role.
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-xs font-medium text-[#b7d2f8]">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Senior partners never chase late invoices or negotiate unpaid retainer balances</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dilemma 2 */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[#111113] border border-white/[0.08] hover:border-white/[0.18] transition-all duration-200 shadow-md">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="lg:w-5/12 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8] shrink-0">
                    <Scale className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Dispute Classification</span>
                    <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
                      Time-Entry Dispute Triage
                    </h3>
                    <div className="mt-1 text-xs font-mono text-zinc-400">
                      Auto-drafted resolution briefs
                    </div>
                  </div>
                </div>

                <div className="lg:w-7/12 lg:border-l lg:border-white/[0.08] lg:pl-8">
                  <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                    Corporate clients frequently hold back payment when questioning hourly timesheets or partner rates. Jaktra’s NLP DisputeAgent analyzes incoming replies, flags time entry inquiries immediately, and halts active follow-ups.
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-xs font-medium text-[#b7d2f8]">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Dispute quarantine freezes automated emails until the engagement partner responds</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dilemma 3 */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[#111113] border border-white/[0.08] hover:border-white/[0.18] transition-all duration-200 shadow-md">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="lg:w-5/12 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8] shrink-0">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Fast Settlement</span>
                    <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
                      Zero-Login Retainer Top-Ups
                    </h3>
                    <div className="mt-1 text-xs font-mono text-zinc-400">
                      Instant Razorpay reconciliation
                    </div>
                  </div>
                </div>

                <div className="lg:w-7/12 lg:border-l lg:border-white/[0.08] lg:pl-8">
                  <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                    Jaktra embeds cryptographic single-use links (<code className="text-xs text-[#b7d2f8]">/i/:token</code>) where clients can review statements, top up evergreen retainers, or select milestone installment schedules via Razorpay in under 60 seconds.
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-xs font-medium text-[#b7d2f8]">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Clients settle retainers and progress invoices with zero passwords or portal logins</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* COMPARISON TABLE */}
        <section className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Traditional Advisory Billing vs. Jaktra
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base">
              Why leading law and advisory firms choose autonomous receivables over manual partner chasing.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#111113] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse min-w-[680px]">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-white/[0.03] text-xs font-mono uppercase tracking-wider text-zinc-300">
                    <th className="py-4 px-6 font-semibold">Capability</th>
                    <th className="py-4 px-6 font-semibold text-[#b7d2f8]">Jaktra Autonomous AR</th>
                    <th className="py-4 px-6 font-semibold text-zinc-400">Manual Partner Chasing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05] text-xs sm:text-sm">
                  <tr className="hover:bg-white/[0.015] transition-colors">
                    <td className="py-4 px-6 font-medium text-white">Partner Time Spent Chasing</td>
                    <td className="py-4 px-6 text-zinc-100 font-medium bg-white/[0.02]">0 hours (automated institutional AR buffer)</td>
                    <td className="py-4 px-6 text-zinc-400">5–10 billable hours/month per partner</td>
                  </tr>
                  <tr className="hover:bg-white/[0.015] transition-colors">
                    <td className="py-4 px-6 font-medium text-white">Fee Dispute Handling</td>
                    <td className="py-4 px-6 text-zinc-100 font-medium bg-white/[0.02]">NLP categorizes scope questions; pauses dunning</td>
                    <td className="py-4 px-6 text-zinc-400">Awkward partner-client phone calls</td>
                  </tr>
                  <tr className="hover:bg-white/[0.015] transition-colors">
                    <td className="py-4 px-6 font-medium text-white">Payment Experience</td>
                    <td className="py-4 px-6 text-zinc-100 font-medium bg-white/[0.02]">Zero-login token (<code className="text-xs font-mono text-[#b7d2f8] bg-white/[0.05] px-1.5 py-0.5 rounded">/i/:token</code>) + Razorpay Rails</td>
                    <td className="py-4 px-6 text-zinc-400">Static wire details on PDF attachment</td>
                  </tr>
                  <tr className="hover:bg-white/[0.015] transition-colors">
                    <td className="py-4 px-6 font-medium text-white">Safety &amp; Compliance</td>
                    <td className="py-4 px-6 text-zinc-100 font-medium bg-white/[0.02]">Strict 20-hour contact barrier; Stage 5 Legal Stop</td>
                    <td className="py-4 px-6 text-zinc-400">Uncoordinated emails causing client irritation</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="max-w-4xl mx-auto px-2 py-12 mb-16 border-t border-white/[0.08]">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Frequently Asked Questions: Advisory &amp; Legal AR
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base">
              Common questions about eliminating partner billing friction and protecting client rapport.
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
        <section className="max-w-4xl mx-auto text-center border-t border-white/[0.08] pt-16">
          <div className="p-8 sm:p-12 rounded-2xl bg-gradient-to-b from-white/[0.04] to-transparent border border-white/[0.08]">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 font-display">
              Accelerate Practice Cash Flow Without Straining Client Goodwill
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto text-sm sm:text-base mb-8">
              Equip your practice with autonomous AI collections and zero-login settlement. Free during Early Access with zero credit card required.
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

export default ProfessionalServicesUseCase;

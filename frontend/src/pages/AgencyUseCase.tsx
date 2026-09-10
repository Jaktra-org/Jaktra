import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  DollarSign,
  AlertTriangle,
  Users,
  Layers,
  CheckCircle2,
  Copy,
  Check,
  Calendar,
  Sparkles,
  Shield,
} from "lucide-react";
import jaktraLogo from "../assets/jaktra_svg.svg";
import { SEOHead } from "../components/common/SEOHead";
import { agencyUseCaseSchema, breadcrumbSchema } from "../components/common/seo-schemas";
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

interface AgencyStageItem {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  badge: string;
  timing: string;
  tone: string;
  targetAudience: string;
  guardrail: string;
  description: string;
  excerpt: string;
}

const AGENCY_STAGES: AgencyStageItem[] = [
  {
    id: "stage-1",
    number: "01",
    title: "Retainer Courtesy Check-in",
    subtitle: "Sends a courtesy verification 3 days before the 1st of the month",
    badge: "Day -3 Courtesy",
    timing: "3 Days Pre-Due",
    tone: "Warm Administrative",
    targetAudience: "Primary Client Contact & Account Manager",
    guardrail: "Attaches verified SOW deliverable log and automated direct link",
    description: "Sends a courtesy verification 3 days before the 1st of the month with the itemized retainer invoice and direct payment link to ensure accounts payable schedules it before the billing cycle begins.",
    excerpt: "Hi Alex — Sending over invoice #AG-8192 for next month's creative retainer due on the 1st. Let us know if your AP team requires any PO signoffs!",
  },
  {
    id: "stage-2",
    number: "02",
    title: "Friendly Milestone Prompt",
    subtitle: "Warm check-in with one-click tokenized payment portal link",
    badge: "Day +3 Prompt",
    timing: "Day +3 Post-Due",
    tone: "Collaborative Service-Minded",
    targetAudience: "Billing Lead & Creative Director",
    guardrail: "Delivers zero-login cryptographic payment portal link (UPI/Card/NEFT)",
    description: "Politely checks in after due date, providing one-click zero-login settlement links for corporate credit cards, ACH, or wire transfers.",
    excerpt: "Hi Alex — Just a friendly reminder regarding retainer invoice #AG-8192. You can review the deliverables summary and settle instantly via the secure link below.",
  },
  {
    id: "stage-3",
    number: "03",
    title: "Commercial AP Escalation",
    subtitle: "Firm follow-up directly referencing contract terms to AP & controller",
    badge: "Day +14 Escalation",
    timing: "Day +14 Post-Due",
    tone: "Objective Commercial",
    targetAudience: "Client Finance Controller & AP Inbox",
    guardrail: "Cites Master Services Agreement payment schedule & requests disbursement date",
    description: "Escalates to the client's finance controller and accounts payable inbox, referencing contract payment terms and requesting a firm disbursement date.",
    excerpt: "Attention Accounts Payable — Retainer invoice #AG-8192 is now 14 days overdue. Please confirm whether remittance has been scheduled for this week's payment cycle.",
  },
  {
    id: "stage-4",
    number: "04",
    title: "Executive Account Notice",
    subtitle: "Direct notification to CMO/VP Marketing with structured installment options",
    badge: "Day +30 Executive",
    timing: "Day +30 Delinquent",
    tone: "Firm Executive Leadership",
    targetAudience: "CMO / VP Marketing & Agency Founder",
    guardrail: "Offers automated 2-part milestone installment plan to maintain account momentum",
    description: "Informs executive sponsors (CMO/VP Marketing) and agency leadership. Offers structured installment options for project milestone balances.",
    excerpt: "Notice of Overdue Account: Balance #AG-8192 is 30 days overdue. To prevent workflow bottlenecks and maintain dedicated creative staffing, please settle the outstanding balance.",
  },
  {
    id: "stage-5",
    number: "05",
    title: "Deliverable & Media Pause Notice",
    subtitle: "Definitive compliance cutoff prior to freezing deliverables or ad spend",
    badge: "Day +45 Pause Halt",
    timing: "Day +45 Critical",
    tone: "Contractual Enforcement",
    targetAudience: "Executive Sponsor, Legal Counsel & CFO",
    guardrail: "Mandatory human-in-the-loop review before suspending active ad campaigns or Figma access",
    description: "Final formal notice prior to freezing creative deliverables, campaign ad spend, and staging server access. Strict commercial language with one-click payment cure.",
    excerpt: "Final Notice: Retainer #AG-8192 remains unpaid. In accordance with Section 4 of our Master Services Agreement, creative deliverables and ad management will pause in 48 hours unless payment is received.",
  },
];

const FAQS = [
  {
    q: "How does Jaktra prevent awkward payment conversations for creative and account directors?",
    a: "Agency founders and account leads should never have to chase overdue retainers—it destroys creative collaboration and weakens leverage during contract expansions. Jaktra acts as an autonomous, objective finance department: early communications are polite, administrative, and assume oversight, allowing your client leads to focus 100% on strategy and campaign delivery.",
  },
  {
    q: "What happens when an agency client disputes out-of-scope billable hours or revisions?",
    a: "If a client replies stating that certain hours were out of scope or revisions exceeded the project quote, Jaktra’s NLP DisputeAgent immediately flags the email, halts all automated collection messages, and generates a pre-drafted briefing citing approved SOWs, PO numbers, and milestone deliverables for your operations director to review.",
  },
  {
    q: "How does Jaktra protect agencies from financing client media and ad spend out of pocket?",
    a: "Many performance marketing agencies float Google and Meta ad spend on corporate credit cards. If a client delays paying their media invoice, the agency faces crippling cash crunches. Jaktra prioritizes media pass-through invoices with automated pre-due verification and rapid escalation cadences so you never bankroll client ad budgets.",
  },
  {
    q: "Can agencies offer installment plans for large overdue project balance milestones?",
    a: "Yes. Rather than writing off an unpaid web design or branding milestone, Jaktra enables you to offer structured 2 to 4 part payment plans via the tokenized debtor portal. Debtors authorize automated scheduled debits, preserving the client relationship while guaranteeing cash recovery.",
  },
  {
    q: "How quickly can a digital agency integrate Jaktra with QuickBooks or Xero?",
    a: "In under 15 minutes. Jaktra connects with QuickBooks Online, Xero, Stripe Invoicing, and FreshBooks. It syncs recurring monthly retainers, customer billing emails, and open project invoices automatically with zero manual entry.",
  },
  {
    q: "Can client AP departments pay via ACH, Wire, or Credit Card without creating an account?",
    a: "Yes. Every reminder includes a cryptographic, zero-login link (`/i/:token`). Your client views the itemized statement with all attached SOW receipts and completes payment via corporate card or ACH transfer in 30 seconds.",
  },
];

export function AgencyUseCase() {
  // Agency Cashflow Simulator State
  const [monthlyRetainers, setMonthlyRetainers] = useState<number>(250000); // $250k/mo
  const [passThroughMedia, setPassThroughMedia] = useState<number>(75000); // $75k/mo ad spend
  const [currentDso, setCurrentDso] = useState<number>(62); // 62 days
  const [targetDso, setTargetDso] = useState<number>(38); // 38 days

  // Calculations
  const annualBillings = (monthlyRetainers + passThroughMedia) * 12;
  const dsoReduction = Math.max(0, currentDso - targetDso);
  const dailyCash = annualBillings / 365;
  const capitalUnlocked = Math.round(dailyCash * dsoReduction);
  const mediaFloatProtected = Math.round((passThroughMedia / 30) * dsoReduction);
  const interestSaved = Math.round(capitalUnlocked * 0.08); // 8% cost of capital

  const [copiedStage, setCopiedStage] = useState<string | null>(null);
  const handleCopyExcerpt = (stageId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStage(stageId);
    setTimeout(() => setCopiedStage(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#f5f5f5] font-sans selection:bg-[#b7d2f8]/20 selection:text-white antialiased">
      <SEOHead
        title="How Agencies Get Clients to Pay Retainers on Time (Cash Flow Guide) | Jaktra"
        description="Stop awkward retainer chasing and protect out-of-pocket ad spend. Discover how creative and digital agencies get clients to pay retainers and project milestones on time."
        canonicalPath="/use-cases/agencies"
        jsonLd={[
          agencyUseCaseSchema,
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Industry Solutions", path: "/use-cases" },
            { name: "Agency Cash Flow Playbook", path: "/use-cases/agencies" },
          ]),
        ]}
      />

      <HeaderNav />

      <main className="pt-28 sm:pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
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
                Industry Solutions
              </Link>
            </li>
            <li>/</li>
            <li className="text-zinc-300 font-medium" aria-current="page">
              Agency Cash Flow Playbook
            </li>
          </ol>
        </nav>

        {/* Hero Section */}
        <header className="mb-16 sm:mb-20">
          <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-3">
            Agency Cash Flow &amp; Retainer Billing Playbook
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-6 leading-tight max-w-4xl">
            The Agency Cash Flow Playbook: How to Eliminate Retainer Chasing &amp; Protect Out-of-Pocket Ad Spend
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 max-w-3xl leading-relaxed">
            Stop making account directors and project managers make awkward payment calls to clients while trying to sell more work. Discover how an automated finance buffer recovers overdue retainers, eliminates pass-through media float, and preserves client rapport.
          </p>
        </header>

        {/* Capability Architecture Banner */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-20 sm:mb-24 p-6 sm:p-8 rounded-2xl bg-[#111113] border border-white/[0.08] shadow-sm">
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">5 Stages</div>
            <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider mt-1">Tone Escalation Cadence</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">Zero Login</div>
            <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider mt-1">Tokenized Settlement Portal</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">Auto-Pause</div>
            <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider mt-1">Scope Dispute NLP Triage</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">15 Mins</div>
            <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider mt-1">Setup (QBO, Xero, Stripe)</div>
          </div>
        </section>

        {/* Interactive Agency Cashflow & Media Float Simulator */}
        <section className="mb-20 sm:mb-24 p-8 sm:p-10 rounded-2xl bg-[#111113] border border-white/[0.08] shadow-sm">
          <div className="max-w-3xl mb-8">
            <span className="text-xs font-mono uppercase tracking-wider text-[#b7d2f8] font-semibold block mb-2">
              Agency Retainer &amp; Media Float Simulator
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Calculate Cash Unlocked & Media Out-of-Pocket Risk Eliminated
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Model how compressing your client collections cycle releases locked retainer capital and shields your agency from floating pass-through ad budgets:
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Sliders */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                    Monthly Retainer Billings
                  </label>
                  <span className="text-sm font-mono font-bold text-white">
                    ${(monthlyRetainers / 1000).toFixed(0)}K / mo
                  </span>
                </div>
                <input
                  type="range"
                  min={25000}
                  max={1000000}
                  step={25000}
                  value={monthlyRetainers}
                  onChange={(e) => setMonthlyRetainers(Number(e.target.value))}
                  className="w-full accent-[#b7d2f8] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-zinc-500 mt-1">
                  <span>$25K/mo</span>
                  <span>$500K/mo</span>
                  <span>$1M/mo</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                    Monthly Pass-Through Ad / Media Spend
                  </label>
                  <span className="text-sm font-mono font-bold text-white">
                    ${(passThroughMedia / 1000).toFixed(0)}K / mo
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={500000}
                  step={10000}
                  value={passThroughMedia}
                  onChange={(e) => setPassThroughMedia(Number(e.target.value))}
                  className="w-full accent-[#b7d2f8] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-zinc-500 mt-1">
                  <span>$0 (Pure retainer)</span>
                  <span>$250K/mo</span>
                  <span>$500K/mo (Heavy media float)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                      Current DSO
                    </label>
                    <span className="text-sm font-mono font-bold text-zinc-200">{currentDso} days</span>
                  </div>
                  <input
                    type="range"
                    min={35}
                    max={90}
                    step={1}
                    value={currentDso}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setCurrentDso(val);
                      if (val <= targetDso) setTargetDso(Math.max(20, val - 10));
                    }}
                    className="w-full accent-[#b7d2f8] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                      Simulated Target DSO Goal
                    </label>
                    <span className="text-sm font-mono font-bold text-white">{targetDso} days</span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={Math.max(25, currentDso - 5)}
                    step={1}
                    value={targetDso}
                    onChange={(e) => setTargetDso(Number(e.target.value))}
                    className="w-full accent-[#b7d2f8] cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Results Box */}
            <div className="lg:col-span-5 bg-black/40 rounded-xl p-6 border border-white/[0.08] space-y-4">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-1">
                  <DollarSign className="w-4 h-4 text-[#b7d2f8]" /> Working Capital Reclaimed
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
                  ${capitalUnlocked.toLocaleString()}
                </div>
                <p className="text-xs text-zinc-500 mt-1">
                  Cash pulled forward from unpaid client retainers and project billings.
                </p>
              </div>

              <div className="pt-4 border-t border-white/[0.08] grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[11px] text-zinc-400 uppercase font-semibold">
                    Media Float Protected
                  </div>
                  <div className="text-base font-bold text-white mt-0.5 font-mono">
                    ${mediaFloatProtected.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-zinc-500">Unfunded ad spend eliminated</span>
                </div>
                <div>
                  <div className="text-[11px] text-zinc-400 uppercase font-semibold">
                    Interest Costs Saved
                  </div>
                  <div className="text-base font-bold text-white mt-0.5 font-mono">
                    ${interestSaved.toLocaleString()}/yr
                  </div>
                  <span className="text-[10px] text-zinc-500">At 8% working capital rate</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/register"
                  className="w-full py-2.5 px-4 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-medium text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  Accelerate Agency Cash Flow Free <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 3 Core Agency AR Dilemmas Solved: Standard Horizontal Design */}
        <section className="mb-20 sm:mb-24">
          <div className="max-w-3xl mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight">
              Why Agency Client Collections Break Down
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
              Creative partnerships are fragile. Chasing money creates tension right before pitch presentations or contract renewals. Here is how Jaktra fixes it:
            </p>
          </div>

          <div className="space-y-4">
            {/* Dilemma 1 */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[#111113] border border-white/[0.08] hover:border-white/[0.18] transition-all duration-200 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="lg:w-5/12 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8] shrink-0">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#b7d2f8] uppercase tracking-wider">Account Protection</span>
                    <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
                      Preserving Creative &amp; Account Goodwill
                    </h3>
                    <div className="mt-1 text-xs font-mono text-zinc-400">
                      Zero awkward debt conversations for creative directors
                    </div>
                  </div>
                </div>

                <div className="lg:w-7/12 lg:border-l lg:border-white/[0.08] lg:pl-8">
                  <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                    When account leads chase unpaid invoices, clients become defensive during creative reviews. Jaktra acts as an objective, polite third-party finance department, keeping your account team positioned entirely on strategy and delivery.
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-xs font-medium text-zinc-400">
                    <CheckCircle2 className="w-4 h-4 text-[#b7d2f8] shrink-0" />
                    <span>Creative directors never have to ask clients for money during pitch or review calls</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dilemma 2 */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[#111113] border border-white/[0.08] hover:border-white/[0.18] transition-all duration-200 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="lg:w-5/12 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8] shrink-0">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#b7d2f8] uppercase tracking-wider">Dispute Triage</span>
                    <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
                      Scope-Creep &amp; Revision Dispute Triage
                    </h3>
                    <div className="mt-1 text-xs font-mono text-zinc-400">
                      Automated dispute quarantine protects client trust
                    </div>
                  </div>
                </div>

                <div className="lg:w-7/12 lg:border-l lg:border-white/[0.08] lg:pl-8">
                  <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                    Clients often delay an entire invoice over a dispute regarding 3 hours of out-of-scope work. Jaktra’s NLP DisputeAgent detects the issue, pauses automated reminders, and briefs your ops director with signed SOW clauses to resolve it immediately.
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-xs font-medium text-zinc-400">
                    <CheckCircle2 className="w-4 h-4 text-[#b7d2f8] shrink-0" />
                    <span>Automatic freeze prevents spamming client while scope adjustments are finalized</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dilemma 3 */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[#111113] border border-white/[0.08] hover:border-white/[0.18] transition-all duration-200 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="lg:w-5/12 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8] shrink-0">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#b7d2f8] uppercase tracking-wider">Cash Flow Safeguard</span>
                    <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
                      Stopping Media Budget Float
                    </h3>
                    <div className="mt-1 text-xs font-mono text-zinc-400">
                      Shields agency operating lines from media defaults
                    </div>
                  </div>
                </div>

                <div className="lg:w-7/12 lg:border-l lg:border-white/[0.08] lg:pl-8">
                  <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                    Agencies cannot afford to fund hundreds of thousands in Google, Meta, or TikTok media spend on internal credit lines. Jaktra runs dedicated pre-due verification cadences for media pass-throughs, ensuring prompt client reimbursement.
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-xs font-medium text-zinc-400">
                    <CheckCircle2 className="w-4 h-4 text-[#b7d2f8] shrink-0" />
                    <span>Dedicated pass-through cadences ensure ad budgets arrive before vendor debit dates</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The 5-Stage Agency Cadence Walkthrough - Open Editorial Presentation */}
        <section className="mb-20 sm:mb-24">
          <div className="text-center mb-10">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-2">
              Groq LLaMA 3.1 Tone Escalation
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              The 5-Stage Agency Retainer &amp; Milestone Cadence
            </h2>
            <p className="text-sm text-zinc-400 max-w-xl mx-auto">
              Jaktra modulates communication urgency as overdue days accumulate, preserving customer goodwill early and escalating firmly when accounts become delinquent.
            </p>
          </div>

          {/* Quick-Glance Cadence Table */}
          <div className="mb-10 overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#111113]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                  <th className="py-3.5 px-4 font-semibold text-zinc-300">Stage &amp; Timing</th>
                  <th className="py-3.5 px-4 font-semibold text-zinc-300">Tone Classification</th>
                  <th className="py-3.5 px-4 font-semibold text-zinc-300">Target Recipient</th>
                  <th className="py-3.5 px-4 font-semibold text-zinc-300">Automated Guardrail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {AGENCY_STAGES.map((s) => (
                  <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[#b7d2f8] font-bold">{s.number}</span>
                        <span className="font-medium text-white">{s.title}</span>
                        <span className="text-[11px] font-mono text-zinc-400 ml-1">({s.timing})</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-white/[0.04] text-zinc-300 border border-white/[0.06]">
                        {s.tone}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-400">{s.targetAudience}</td>
                    <td className="py-3 px-4 text-zinc-400 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-[#b7d2f8] shrink-0" />
                      <span>{s.guardrail}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Unrolled Stage Cards */}
          <div className="space-y-6">
            {AGENCY_STAGES.map((stage) => (
              <div
                key={stage.id}
                className="rounded-2xl border border-white/[0.08] bg-[#111113] p-6 sm:p-7 hover:border-white/20 transition-all duration-300"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Context & Metadata */}
                  <div className="lg:col-span-6 space-y-3">
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

                    <div className="pt-2 flex items-center gap-2 text-xs text-zinc-400">
                      <Sparkles className="w-3.5 h-3.5 text-[#b7d2f8] shrink-0" />
                      <span><strong className="text-zinc-300">Guardrail:</strong> {stage.guardrail}</span>
                    </div>
                  </div>

                  {/* Right Column: Autonomous Email Directive & Excerpt */}
                  <div className="lg:col-span-6 flex flex-col justify-between rounded-xl bg-[#0a0a0b]/80 border border-white/[0.06] p-4 sm:p-5">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-white/[0.06]">
                        <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                          Autonomous Email Directive
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyExcerpt(stage.id, stage.excerpt)}
                          className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-400 hover:text-white transition-colors bg-white/[0.04] hover:bg-white/[0.08] px-2 py-1 rounded border border-white/[0.08]"
                          title="Copy sample copy"
                        >
                          {copiedStage === stage.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>

                      <p className="text-xs font-mono text-zinc-300 italic leading-relaxed py-1">
                        &ldquo;{stage.excerpt}&rdquo;
                      </p>
                    </div>

                    <div className="mt-4 pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                      <span>Audience: {stage.targetAudience}</span>
                      <span className="text-[#b7d2f8]">{stage.tone}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQs with outline Accordion */}
        <section className="mb-20 sm:mb-24">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Frequently Asked Questions for Agency Leaders
            </h2>
            <p className="text-sm text-zinc-400 max-w-xl mx-auto">
              Common questions about deploying automated AR across your client roster:
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" variant="outline" defaultValue="faq-0" collapsible className="w-full">
              {FAQS.map((faq, i) => (
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

        {/* CTA Banner */}
        <section className="rounded-2xl border border-white/[0.08] bg-[#111113] p-8 sm:p-12 text-center shadow-sm">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Accelerate Retainer Cash Flow & Protect Client Trust
          </h2>
          <p className="text-sm text-zinc-400 max-w-xl mx-auto mb-6">
            Connect QuickBooks, Xero, or Stripe in 15 minutes. 100% free during Early Access with zero credit card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white text-zinc-950 text-sm font-semibold hover:bg-zinc-200 transition-colors shadow-lg"
            >
              <span>Get started free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/use-cases"
              className="px-6 py-3 rounded-lg bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 transition-colors"
            >
              Explore All 14 Industry Solutions
            </Link>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}

export default AgencyUseCase;

import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Users,
  ShieldCheck,
  Clock,
  FileCheck,
  Calculator,
  AlertCircle,
  Shield,
  Calendar,
} from "lucide-react";
import jaktraLogo from "../assets/jaktra_svg.svg";
import { SEOHead } from "../components/common/SEOHead";
import { staffingUseCaseSchema, breadcrumbSchema } from "../components/common/seo-schemas";
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

interface StaffingStageItem {
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

const STAFFING_STAGES: StaffingStageItem[] = [
  {
    id: "stage-1",
    number: "01",
    title: "VMS Timesheet Confirmation & Pre-Due Audit",
    subtitle: "Verifies contractor hours, bill rates, and hiring manager signoffs in VMS platforms",
    timing: "Day -3 to Due Date",
    tone: "Courteous, Administrative",
    badge: "Day -3 Pre-Due",
    description: "Verifies that contractor hours, bill rates, and client hiring manager signoffs are logged and approved in Fieldglass, Beeline, or Coupa before the client's bi-weekly AP check run locks.",
    safeguardTitle: "Clerical Prevention",
    safeguardDesc: "Eliminates delayed payments caused by unapproved timesheets sitting in manager inboxes.",
  },
  {
    id: "stage-2",
    number: "02",
    title: "AP Disbursement Check-in & Voucher Status",
    subtitle: "Polite inquiry confirming voucher numbers, check batches, and ACH remittance details",
    timing: "Days 1–7 Overdue",
    tone: "Friendly, Inquiring, Respectful",
    badge: "Days 1–7 Overdue",
    description: "Polite administrative inquiry asking if the staffing invoice is scheduled for the upcoming weekly payment batch. Confirms voucher numbers and ACH remittance details.",
    safeguardTitle: "Zero-Login Link",
    safeguardDesc: "Embeds an instant payment link (/i/:token) so corporate AP teams can settle invoices via Razorpay virtual accounts or corporate cards.",
  },
  {
    id: "stage-3",
    number: "03",
    title: "Direct Controller Notice & Installment Splits",
    subtitle: "Direct outreach offering milestone installment schedules to preserve payroll cash flow",
    timing: "Days 8–14 Overdue",
    tone: "Commercial, Collaborative, Firm",
    badge: "Days 8–14 Overdue",
    description: "Direct outreach to the client's corporate controller. If budget cycles are delayed, Jaktra enables structured 2x or 3x milestone installment schedules so contractor payroll cash flow is preserved.",
    safeguardTitle: "Dispute Agent",
    safeguardDesc: "If overtime rates are queried, Jaktra freezes dunning and alerts your staffing account manager with an AI-drafted resolution.",
  },
  {
    id: "stage-4",
    number: "04",
    title: "Contractor Deployment Pause Warning",
    subtitle: "Authoritative notice that ongoing placement renewals and shifts will be placed on credit hold",
    timing: "Days 15–30 Overdue",
    tone: "Formal, Direct, High-Stakes",
    badge: "Days 15–30 Critical",
    description: "Authoritative notice stating that ongoing contractor placement renewals, active shift staffing, or upcoming interview slates will be placed on credit hold until past-due balances are cleared.",
    safeguardTitle: "Executive Visibility",
    safeguardDesc: "CCs designated enterprise recruitment directors to safeguard the commercial account relationship.",
  },
  {
    id: "stage-5",
    number: "05",
    title: "Stage 5 Legal Stop & Agency Leadership Review",
    subtitle: "Autonomous messaging halts; compiles certified timesheets and SOWs for leadership review",
    timing: "Day 31+ Overdue",
    tone: "Final Demand / Human Escalation Halt",
    badge: "Day 31+ (Legal Halt)",
    description: "Autonomous messaging strictly halts. Compiles certified timesheets, signed Master Services Agreements (MSAs), Statements of Work (SOWs), and communications history for agency leadership or legal counsel.",
    safeguardTitle: "Compliance Guardrail",
    safeguardDesc: "100% human-in-the-loop review required before any legal demand or collections handoff.",
  },
];

export default function StaffingRecruitingUseCase() {
  // Staffing Payroll Calculator State
  const [monthlyPayroll, setMonthlyPayroll] = useState<number>(500000);
  const [factoringRate, setFactoringRate] = useState<number>(2.5); // 2.5% typical staffing payroll factoring
  const [clientDso, setClientDso] = useState<number>(55);
  const [targetDsoReduction, setTargetDsoReduction] = useState<number>(15);

  // Calculations
  const monthlyFactoringCost = monthlyPayroll * (factoringRate / 100);
  const annualFactoringDrain = monthlyFactoringCost * 12;
  const jaktraAnnualCost = 249 * 12; // Scale tier: $2,988/yr
  const annualProfitReclaimed = annualFactoringDrain - jaktraAnnualCost;
  const trappedPayrollCapital = (monthlyPayroll * 12 / 365) * clientDso;
  const freedCashFlow = (monthlyPayroll * 12 / 365) * targetDsoReduction;

  const faqs = [
    {
      q: "How does Jaktra help staffing firms eliminate expensive payroll factoring?",
      a: "Staffing agencies must disburse payroll to placed contractors every Friday, but corporate clients often take 50 to 75 days to pay invoices. This forces agencies into payroll factoring facilities that charge 2.0% to 4.0% of gross invoice volume. Jaktra closes this cash conversion gap by accelerating client collections using automated 5-stage tone escalation, pre-due VMS verification, and zero-login digital payment links, allowing firms to fund payroll from operating cash flow and cancel factoring lines.",
    },
    {
      q: "What happens when a client disputes a timesheet or overtime calculation?",
      a: "A missing timesheet approval or disputed overtime rate is the #1 reason client AP departments delay paying staffing bills. When a client replies stating 'timesheet not approved by manager' or 'overtime rate discrepancy', Jaktra's DisputeAgent parses the email, tags the dispute type, freezes all automated follow-ups immediately, and alerts your staffing account manager with an AI-generated briefing.",
    },
    {
      q: "How does Jaktra handle Vendor Management Systems (VMS) like Fieldglass, Beeline, and Coupa?",
      a: "In VMS environments, payment timing hinges on whether timesheets are released into the system before the client's billing cutoff. Jaktra coordinates collaborative Stage 1 check-ins 3 days prior to due date, reminding client hiring managers and AP contacts to verify VMS approval so payments are not pushed to the next bi-weekly cycle.",
    },
    {
      q: "Can enterprise clients settle invoices via ACH, NEFT, or corporate cards?",
      a: "Yes. Jaktra embeds cryptographic, zero-login payment links (/i/:token) in communications. Corporate AP teams can view full invoice statements, backup timesheets, and remit payments via Razorpay (supporting corporate credit cards, NetBanking, UPI, and dedicated virtual bank accounts for direct wire reconciliation) in 30 seconds without creating an account.",
    },
    {
      q: "How does Jaktra preserve client relationships during collection escalation?",
      a: "Enterprise clients are high-value commercial accounts that provide recurring staffing placements. Jaktra's tone modulation maintains a collaborative, administrative tone in early stages, framing outreach as helpful verification of hours worked rather than aggressive debt collection, while strictly adhering to a 20-hour contact barrier.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#f5f5f5] font-sans selection:bg-[#b7d2f8]/20 selection:text-white antialiased">
      <SEOHead
        title="AI Accounts Receivable Automation for Staffing & Recruitment Agencies | Jaktra"
        description="Bridge the weekly contractor payroll gap for staffing and recruitment agencies. Automate client collection cadences, triage timesheet disputes via AI, eliminate payroll factoring fees, and accelerate cash flow."
        canonicalPath="/use-cases/staffing-recruiting"
        jsonLd={[
          staffingUseCaseSchema,
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Use Cases", path: "/use-cases" },
            { name: "Staffing & Recruiting AR", path: "/use-cases/staffing-recruiting" },
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
              Staffing &amp; Recruiting
            </li>
          </ol>
        </nav>

        {/* Hero Section */}
        <section className="text-center max-w-4xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-4">
            Staffing &amp; IT Recruitment AR Automation
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-6 leading-tight">
            Bridge the Weekly Contractor Payroll Gap: Cut 55+ Day Client DSO &amp; Reclaim Margins
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 max-w-3xl mx-auto leading-relaxed mb-8">
            Staffing agencies fund contractor payroll every Friday, but corporate clients take 45 to 75+ days to pay invoices. Jaktra automates client collection cadences, triages timesheet approval bottlenecks with AI, and unlocks operating cash flow without expensive payroll factoring.
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

        {/* The Payroll Float Callout */}
        <section className="mb-16 p-6 sm:p-8 rounded-2xl bg-[#111113] border border-white/[0.08]">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-[#b7d2f8] text-sm font-semibold mb-2">
                <AlertCircle className="w-4 h-4" />
                <span>The Staffing Payroll Dilemma: Weekly Outflows vs. Net 60 Inflows</span>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed">
                You cannot delay paying placed software developers, healthcare professionals, or temporary staff on Friday. When clients stretch payment terms past Day 50, agencies surrender <strong className="text-white">2.0% to 4.0% of top-line revenue</strong> to payroll factoring facilities, destroying net operating margins.
              </p>
            </div>
            <Link
              to="/resources/how-to-reduce-dso"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 text-sm text-white font-medium transition-colors shrink-0"
            >
              <span>Explore DSO Strategy</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Interactive Payroll Factoring vs Jaktra ROI Calculator */}
        <section className="mb-20 p-8 sm:p-10 rounded-2xl bg-[#111113] border border-white/[0.08]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-lg bg-[#b7d2f8]/10 border border-[#b7d2f8]/20 flex items-center justify-center">
              <Calculator className="w-5 h-5 text-[#b7d2f8]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Staffing Payroll Factoring Profit Reclaim Calculator</h2>
              <p className="text-xs sm:text-sm text-zinc-400">
                See how much net margin your agency loses to payroll factoring fees, and how shortening client DSO lets you self-fund contractor payroll.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Inputs */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <div className="flex justify-between text-xs text-zinc-400 mb-2">
                  <span>Monthly Contractor Payroll Volume:</span>
                  <span className="text-white font-mono font-semibold">${monthlyPayroll.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="100000"
                  max="2500000"
                  step="50000"
                  value={monthlyPayroll}
                  onChange={(e) => setMonthlyPayroll(Number(e.target.value))}
                  className="w-full accent-[#b7d2f8] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-zinc-400 mb-2">
                  <span>Current Payroll Factoring Fee:</span>
                  <span className="text-white font-mono font-semibold">{factoringRate.toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="4.5"
                  step="0.1"
                  value={factoringRate}
                  onChange={(e) => setFactoringRate(Number(e.target.value))}
                  className="w-full accent-[#b7d2f8] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-zinc-400 mb-2">
                  <span>Average Client Payment DSO:</span>
                  <span className="text-white font-mono font-semibold">{clientDso} days</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="90"
                  step="1"
                  value={clientDso}
                  onChange={(e) => setClientDso(Number(e.target.value))}
                  className="w-full accent-[#b7d2f8] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-zinc-400 mb-2">
                  <span>Simulated Client DSO Reduction Goal:</span>
                  <span className="text-white font-mono font-semibold">-{targetDsoReduction} days</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="35"
                  step="1"
                  value={targetDsoReduction}
                  onChange={(e) => setTargetDsoReduction(Number(e.target.value))}
                  className="w-full accent-[#b7d2f8] cursor-pointer"
                />
              </div>
            </div>

            {/* Right Metrics Box */}
            <div className="lg:col-span-6 p-6 rounded-xl bg-black/40 border border-white/[0.08] space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-zinc-900 border border-white/[0.05]">
                  <div className="text-xs text-zinc-500 mb-1">Monthly Factoring Cost</div>
                  <div className="text-2xl font-bold text-white font-mono">
                    ${Math.round(monthlyFactoringCost).toLocaleString()}/mo
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1">Paid to factoring lender</div>
                </div>

                <div className="p-4 rounded-lg bg-zinc-900 border border-white/[0.05]">
                  <div className="text-xs text-zinc-500 mb-1">Trapped Payroll Float</div>
                  <div className="text-2xl font-bold text-white font-mono">
                    ${Math.round(trappedPayrollCapital).toLocaleString()}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1">Locked in client AP runs</div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-white/[0.04] border border-white/[0.12]">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-300">Modeled Net Profit Reclaimed (Factoring vs Platform):</span>
                  <span className="text-lg font-bold text-white font-mono">
                    +${Math.round(annualProfitReclaimed).toLocaleString()} / yr
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/[0.08]">
                  <span className="text-[11px] text-zinc-400">Modeled Cash Flow Accelerated (-{targetDsoReduction} Days DSO):</span>
                  <span className="text-sm font-semibold text-white font-mono">
                    +${Math.round(freedCashFlow).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5-STAGE CADENCE INTERACTIVE ACCORDION */}
        {/* 5-STAGE TONE ESCALATION - Open Cadence Architecture */}
        <section className="mb-20 sm:mb-24">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-2">
              Staffing AR Cadence
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Staffing &amp; Recruiting 5-Stage Escalation Cadence
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
              How Jaktra secures timely invoice payment without creating awkward friction between recruiters and corporate hiring managers.
            </p>
          </div>

          {/* Quick-Glance Cadence Table */}
          <div className="mb-10 overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#111113]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                  <th className="py-3.5 px-4 font-semibold text-zinc-300">Stage &amp; Timing</th>
                  <th className="py-3.5 px-4 font-semibold text-zinc-300">Tone Classification</th>
                  <th className="py-3.5 px-4 font-semibold text-zinc-300">Staffing Safeguard</th>
                  <th className="py-3.5 px-4 font-semibold text-zinc-300">Operational Objective</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {STAFFING_STAGES.map((s) => (
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
            {STAFFING_STAGES.map((stage) => (
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

        {/* 4 CORE PILLARS */}
        <section className="mb-20 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-[#111113] border border-white/[0.08] space-y-3">
            <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Timesheet &amp; Overtime Dispute Triage</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              When a client AP contact replies stating that an onsite manager hasn't signed a weekly timesheet or questions an overtime multiplier, Jaktra’s NLP DisputeAgent automatically tags the dispute, halts automated dunning cadences, and alerts your staffing recruiter.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#111113] border border-white/[0.08] space-y-3">
            <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8]">
              <FileCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">VMS Pre-Due Verification Cadences</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Never let an invoice sit unapproved in Fieldglass, Beeline, or Coupa. Jaktra coordinates collaborative Stage 1 check-ins 3 days prior to due date, ensuring timesheet releases are validated by hiring managers before the client's bi-weekly AP check run locks.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#111113] border border-white/[0.08] space-y-3">
            <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8]">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Zero-Login Client Settlement Portals</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Client AP departments can view full invoice details, breakdown hours, and remit payment in 30 seconds via Razorpay (corporate cards, NetBanking, UPI, and dedicated virtual bank accounts) using cryptographic <code className="text-xs">/i/:token</code> links with zero password barriers.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#111113] border border-white/[0.08] space-y-3">
            <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8]">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Placement &amp; Relationship Protection</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Client hiring managers control placement renewals. Jaktra acts as an institutional finance desk buffer, using professional tone modulation across early stages, protecting recruiter-client relationships from awkward collection friction.
            </p>
          </div>
        </section>

        {/* COMPARISON TABLE */}
        <section className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Traditional Payroll Factoring vs. Jaktra
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base">
              Why fast-growing recruitment agencies are ditching 2%–4% factoring fees for autonomous AR.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#111113] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse min-w-[680px]">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-white/[0.03] text-xs font-mono uppercase tracking-wider text-zinc-300">
                    <th className="py-4 px-6 font-semibold">Metric</th>
                    <th className="py-4 px-6 font-semibold text-[#b7d2f8]">Jaktra Autonomous AR</th>
                    <th className="py-4 px-6 font-semibold text-zinc-400">Payroll Factoring Lenders</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05] text-xs sm:text-sm">
                  <tr className="hover:bg-white/[0.015] transition-colors">
                    <td className="py-4 px-6 font-medium text-white">Annual Cost</td>
                    <td className="py-4 px-6 text-zinc-100 font-medium bg-white/[0.02]">Flat software subscription ($0 during Early Access)</td>
                    <td className="py-4 px-6 text-zinc-400">2.0%–4.0% of total contractor payroll ($120k+/yr)</td>
                  </tr>
                  <tr className="hover:bg-white/[0.015] transition-colors">
                    <td className="py-4 px-6 font-medium text-white">Client Experience</td>
                    <td className="py-4 px-6 text-zinc-100 font-medium bg-white/[0.02]">Branded in your agency name with collaborative tone</td>
                    <td className="py-4 px-6 text-zinc-400">Aggressive third-party collection calls that annoy clients</td>
                  </tr>
                  <tr className="hover:bg-white/[0.015] transition-colors">
                    <td className="py-4 px-6 font-medium text-white">VMS &amp; Timesheets</td>
                    <td className="py-4 px-6 text-zinc-100 font-medium bg-white/[0.02]">Automated pre-due verification of Fieldglass/Beeline approvals</td>
                    <td className="py-4 px-6 text-zinc-400">No VMS integration; delayed approvals trigger penalties</td>
                  </tr>
                  <tr className="hover:bg-white/[0.015] transition-colors">
                    <td className="py-4 px-6 font-medium text-white">Safeguards</td>
                    <td className="py-4 px-6 text-zinc-100 font-medium bg-white/[0.02]">Strict 20-hour contact barrier; Stage 5 Legal Stop</td>
                    <td className="py-4 px-6 text-zinc-400">Frequent repetitive calls that damage commercial goodwill</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="max-w-4xl mx-auto px-2 py-12 mb-16 border-t border-white/[0.08]">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Frequently Asked Questions: Staffing &amp; Recruiting AR
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base">
              Operational guidance on eliminating payroll factoring, managing VMS approvals, and preserving client accounts.
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
              Accelerate Staffing Collections in 15 Minutes
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto text-sm sm:text-base mb-8">
              Connect your invoicing or applicant tracking system to Jaktra today. Free during Early Access with zero credit card required.
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

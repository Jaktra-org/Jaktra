import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  PauseCircle,
  Sparkles,
  ShieldCheck,
  MailCheck,
  Inbox,
} from "lucide-react";
import { SEOHead } from "@/seo/components/SEOHead";
import { disputeTriageSchema, breadcrumbSchema } from "@/seo/schemas";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { GlobalNav } from "@/components/common/GlobalNav";

interface InboundScenario {
  id: string;
  tabLabel: string;
  sender: string;
  company: string;
  invoiceNo: string;
  amount: string;
  dueDate: string;
  receivedTime: string;
  categoryLabel: string;
  badgeStyle: string;
  customerMessage: string;
  aiSummary: string;
  systemAction: string;
  howAiDrafts: string;
  teamControls: string;
}

const SCENARIOS: InboundScenario[] = [
  {
    id: "dispute",
    tabLabel: "Line Item Dispute",
    sender: "sarah.jenkins@acmeworks.com",
    company: "Acme Works Corp",
    invoiceNo: "INV-4091",
    amount: "$6,800.00",
    dueDate: "Sep 10, 2026",
    receivedTime: "12m ago",
    categoryLabel: "Invoice Dispute Detected",
    badgeStyle: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    customerMessage:
      "Hi team, we received invoice #INV-4091 for $6,800, but our purchase order specified $5,200. There are 20 hours of consulting billed that were not approved by our director. Please verify before we can process payment.",
    aiSummary:
      "Dispute flagged: 20 unapproved consulting hours ($1,600 difference) against authorized PO #PO-8821.",
    systemAction:
      "All automated reminders for #INV-4091 stop the millisecond this email arrives. The invoice is placed on Dispute Hold so your customer never receives an aggressive overdue reminder while an issue is open.",
    howAiDrafts:
      "Jaktra reads the invoice context and prior communication, then prepares a suggested clarification email referencing the signed change orders and timesheets. Your team reviews the draft, makes any adjustments, and approves it.",
    teamControls:
      "Automated follow-ups stay paused until your finance team explicitly marks the dispute resolved.",
  },
  {
    id: "promise",
    tabLabel: "Payment Promise",
    sender: "d.miller@horizondynamics.io",
    company: "Horizon Dynamics",
    invoiceNo: "INV-3882",
    amount: "$14,250.00",
    dueDate: "Sep 08, 2026",
    receivedTime: "34m ago",
    categoryLabel: "Payment Promise Detected",
    badgeStyle: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    customerMessage:
      "Hello! Our corporate accounts payable pay run is scheduled for next Thursday, September 18th. Invoice #INV-3882 has been approved by accounting and will be transferred on that date via ACH.",
    aiSummary:
      "Promise detected: Payment approved and scheduled for ACH batch run on September 18th.",
    systemAction:
      "Jaktra extracts the promised date (September 18th) and automatically snoozes reminders until September 19th. This gives the ACH transfer time to clear without sending annoying follow-ups.",
    howAiDrafts:
      "Jaktra prepares a quick confirmation note acknowledging their pay run date, with an optional 1-click portal link if they wish to settle earlier via card or instant transfer. Your team confirms it with one click.",
    teamControls:
      "If payment clears on schedule, the invoice marks Paid automatically with zero further emails sent.",
  },
  {
    id: "document",
    tabLabel: "Document & Tax Query",
    sender: "acole@nexusmedia.com",
    company: "Nexus Media Group",
    invoiceNo: "INV-4120",
    amount: "$3,400.00",
    dueDate: "Sep 14, 2026",
    receivedTime: "1h ago",
    categoryLabel: "Document Request",
    badgeStyle: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    customerMessage:
      "Could you please send over an updated W-9 and direct ACH routing instructions? Our vendor onboarding team requires these documents before releasing payment for #INV-4120.",
    aiSummary:
      "Document inquiry: Client requested updated W-9 tax documentation and direct ACH bank details.",
    systemAction:
      "Jaktra classifies this as an administrative request rather than a refusal to pay, and pauses reminder sequences for 48 hours so your team can deliver the required vendor documentation.",
    howAiDrafts:
      "Jaktra prepares a suggested reply that automatically attaches your verified W-9 form and company wiring instructions, alongside a passwordless payment portal link for fast settlement.",
    teamControls:
      "Administrative bottlenecks are resolved immediately without losing customer emails in shared inboxes.",
  },
  {
    id: "unclear",
    tabLabel: "Ambiguous Note",
    sender: "m.vance@apexstudio.co",
    company: "Apex Creative Studio",
    invoiceNo: "INV-4015",
    amount: "$5,100.00",
    dueDate: "Sep 05, 2026",
    receivedTime: "2h ago",
    categoryLabel: "Human Review Flagged",
    badgeStyle: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    customerMessage:
      "Checking on this with finance. Will circle back once our managing partners have their weekly meeting.",
    aiSummary:
      "Low intent clarity (<50% confidence): Brief note without a specific pay date. Human review flagged.",
    systemAction:
      "Because the intent is ambiguous, Jaktra avoids making assumptions and flags the message for human review, while temporarily pausing reminders so no tone-deaf emails are sent during the partner meeting.",
    howAiDrafts:
      "Jaktra suggests a polite clarification note asking when the partners meet or offering a structured installment plan. Your team can easily customize the draft or set a custom reminder date.",
    teamControls:
      "Finance maintains full control over sensitive communications and client relationships.",
  },
];

export function DisputeTriage() {
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  const activeScenario = SCENARIOS[selectedScenarioIndex];

  const handleScenarioSelect = (index: number) => {
    setSelectedScenarioIndex(index);
  };

  const faqs = [
    {
      q: "How does Jaktra catch inbound customer replies without shared inbox clutter?",
      a: "Every automated reminder Jaktra sends includes a cryptographic reply token (e.g. r_token@reply.domain). When a customer clicks 'Reply' in Gmail or Outlook, the inbound email is intercepted via webhooks, verified against sender security domains, and matched directly to the exact invoice, customer record, and balance.",
    },
    {
      q: "Does Jaktra ever send dispute responses automatically without human review?",
      a: "No. Jaktra adheres strictly to a human-in-the-loop philosophy for dispute resolution. The moment a reply arrives, Jaktra pauses automated reminders, analyzes customer intent with AI, and suggests a response. Your finance team reviews, adjusts, and approves the message before anything is sent.",
    },
    {
      q: "What happens when a customer promises a future payment date?",
      a: "When a customer specifies a date (such as 'Paying on Friday' or 'ACH pay run on Sep 18th'), Jaktra's AI extracts the exact milestone date and snoozes automated cadences until after that date passes. If payment clears on time, the invoice marks Paid without annoying follow-ups. If the date passes without payment, Jaktra alerts your team to check in gently.",
    },
    {
      q: "How does the Inbound Review Dashboard (/disputes) organize customer conversations?",
      a: "The Inbound Review Dashboard acts as a dedicated AR communications inbox. It categorizes replies into 4 distinct tabs (Disputes, Payment Promises, Document Questions, and Unclear), displays complete threaded email history, provides 1-sentence executive summaries, and lets finance staff review pre-drafted responses.",
    },
    {
      q: "How do we unfreeze reminders once a dispute or question is resolved?",
      a: "Once an inquiry is answered or revised billing terms are agreed upon, your team can resolve the ticket in the dashboard with one click. You can choose to resume standard follow-ups, adjust the payment schedule to an installment plan, or mark the invoice as settled.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#010102] text-[#f7f8f8] font-sans antialiased selection:bg-[#5e6ad2]/30 selection:text-white">
      <SEOHead
        title="Inbound Email Catch & Dispute Triage | Jaktra"
        description="Learn how Jaktra catches customer replies, automatically pauses reminders, classifies intent via AI, and triages invoice disputes for finance teams."
        canonicalPath="/features/dispute-triage"
        jsonLd={[
          disputeTriageSchema,
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Features", path: "/features" },
            { name: "Dispute Triage", path: "/features/dispute-triage" },
          ]),
        ]}
      />

      <GlobalNav />

      <main className="pt-24 pb-20 max-w-6xl mx-auto px-4 sm:px-6 relative">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(183,210,248,0.07),transparent)] pointer-events-none" />

        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6 text-xs text-zinc-400 font-sans relative z-10">
          <ol className="flex items-center gap-1.5">
            <li>
              <Link to="/" className="hover:text-zinc-200 transition-colors">
                Home
              </Link>
            </li>
            <li className="text-zinc-600">/</li>
            <li>
              <Link to="/features" className="hover:text-zinc-200 transition-colors">
                Features
              </Link>
            </li>
            <li className="text-zinc-600">/</li>
            <li className="text-zinc-200 font-medium" aria-current="page">
              Inbound Reply &amp; Dispute Triage
            </li>
          </ol>
        </nav>

        {/* CLEAN HERO HEADER */}
        <header className="mb-10 relative z-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] xl:text-[44px] font-extrabold tracking-tight text-white mb-3.5 leading-tight lg:leading-none whitespace-normal md:whitespace-nowrap">
            Inbound Reply Catch &amp; Dispute Triage
          </h1>

          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-3xl">
            When customers reply to reminders, Jaktra immediately pauses automated follow-ups, classifies customer intent via AI, and routes the thread into your Inbound Review Dashboard with ready-to-send resolution drafts.
          </p>
        </header>

        {/* SIMPLE, UNCLUTTERED SCENARIO EXPLORER */}
        <section className="mb-16 relative z-10">
          {/* Clean Scenario Tabs */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {SCENARIOS.map((sc, idx) => {
              const isSelected = selectedScenarioIndex === idx;
              return (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => handleScenarioSelect(idx)}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    isSelected
                      ? "bg-white text-zinc-950 font-semibold shadow-sm"
                      : "bg-white/[0.03] text-zinc-400 hover:text-white hover:bg-white/[0.06] border border-white/[0.06]"
                  }`}
                >
                  {sc.tabLabel}
                </button>
              );
            })}
          </div>

          {/* Single Focused Card */}
          <div className="rounded-2xl bg-[#0c0d10] border border-white/[0.08] p-6 sm:p-8 space-y-6 shadow-2xl">
            {/* Header: Invoice & Status */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-white/[0.06]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base font-bold text-white">{activeScenario.company}</span>
                  <span className="text-xs font-mono text-zinc-400">({activeScenario.invoiceNo})</span>
                </div>
                <div className="text-xs text-zinc-400">
                  Balance: <strong className="text-white">{activeScenario.amount}</strong> &bull; Due {activeScenario.dueDate}
                </div>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs font-medium text-amber-400">
                <PauseCircle className="w-4 h-4 shrink-0" />
                <span>Automated reminders paused</span>
              </div>
            </div>

            {/* 1. Inbound Customer Message */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400 font-medium">Customer Email</span>
                <span className="font-mono text-zinc-500 text-[11px]">{activeScenario.sender} &bull; {activeScenario.receivedTime}</span>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs sm:text-sm text-zinc-200 leading-relaxed italic">
                &ldquo;{activeScenario.customerMessage}&rdquo;
              </div>
            </div>

            {/* 2. Jaktra AI Detection Banner */}
            <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold border ${activeScenario.badgeStyle}`}>
                    {activeScenario.categoryLabel}
                  </span>
                  <span className="text-zinc-400">Routed to Inbound Queue</span>
                </div>
                <p className="text-zinc-300 text-xs">
                  <strong className="text-white font-medium">Summary: </strong>
                  {activeScenario.aiSummary}
                </p>
              </div>
              <div className="text-[11px] font-mono text-emerald-400 shrink-0">
                Follow-ups frozen instantly
              </div>
            </div>

            {/* 3. Feature Explanation: What Jaktra Does & How AI Suggests the Response */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <PauseCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>What Jaktra Does Immediately</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {activeScenario.systemAction}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <Sparkles className="w-4 h-4 text-[#b7d2f8] shrink-0" />
                  <span>How AI Suggests the Response</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {activeScenario.howAiDrafts}
                </p>
              </div>
            </div>

            {/* Safeguard & Human Review Guarantee */}
            <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
              <div className="flex items-center gap-2 text-zinc-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{activeScenario.teamControls}</span>
              </div>
              <span className="text-[11px] text-zinc-500 font-mono shrink-0">
                Zero automated emails sent without review
              </span>
            </div>
          </div>
        </section>

        {/* 4-PHASE LIFECYCLE: HOW THE COMPLETE INBOUND LOOP WORKS */}
        <section className="mb-16 border-t border-white/[0.08] pt-12">
          <div className="max-w-2xl mb-8">
            <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold block mb-1">
              End-to-End Inbound Lifecycle
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              How Jaktra Handles Inbound Replies from Detection to Settlement
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#0c0d10] border border-white/[0.08] space-y-3 relative">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Phase 1
              </span>
              <h3 className="text-sm font-semibold text-white">Cryptographic Reply Catch</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Outbound reminders embed tamper-proof sub-addresses or reply tokens (<code className="text-[#b7d2f8] font-mono">r_token@reply.domain</code>). When debtors reply in Gmail or Outlook, SendGrid/Resend webhooks match the email to the exact invoice instantly.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0c0d10] border border-white/[0.08] space-y-3 relative">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Phase 2
              </span>
              <h3 className="text-sm font-semibold text-white">Guaranteed Cadence Freeze</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                The millisecond an inbound reply arrives, automated follow-up cadences stop immediately. Clients are never sent awkward, aggressive payment warnings while discussing an open inquiry.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0c0d10] border border-white/[0.08] space-y-3 relative">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                Phase 3
              </span>
              <h3 className="text-sm font-semibold text-white">AI Intent Classification</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Jaktra evaluates debtor sentiment into 4 strict categories: <strong className="text-zinc-200">Dispute</strong>, <strong className="text-zinc-200">Payment Promise</strong>, <strong className="text-zinc-200">Question</strong>, or <strong className="text-zinc-200">Unclear</strong>, stripping email pleasantries into a 1-sentence summary.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0c0d10] border border-white/[0.08] space-y-3 relative">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Phase 4
              </span>
              <h3 className="text-sm font-semibold text-white">Inbound Dashboard &amp; Draft</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Everything surfaces in <code className="text-[#b7d2f8] font-mono">/disputes</code>. Review the pre-drafted response written in your company&apos;s vendor voice, make any edits, and approve with one click.
              </p>
            </div>
          </div>
        </section>

        {/* COMPARISON TABLE: JAKTRA VS TRADITIONAL DUNNING */}
        <section className="mb-16 rounded-2xl bg-[#0c0d10] border border-white/[0.08] p-5 sm:p-7 shadow-xl">
          <div className="mb-5">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-1">
              Operational Comparison
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Inbound Triage vs. Blind Automated Reminders
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[620px]">
              <thead>
                <tr className="border-b border-white/[0.08] text-[11px] font-mono uppercase text-zinc-400">
                  <th className="py-3 px-4">Debtor Scenario</th>
                  <th className="py-3 px-4 text-zinc-400">Traditional Dunning Tools</th>
                  <th className="py-3 px-4 text-[#b7d2f8] font-bold">Jaktra Inbound AI Engine</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Debtor replies with dispute</td>
                  <td className="py-3 px-4 text-zinc-400">Ignored; dunning robot keeps sending overdue warnings</td>
                  <td className="py-3 px-4 text-white font-medium bg-[#b7d2f8]/5">Automated cadence halts in &lt;1s; flags invoice on hold</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Debtor promises future pay date</td>
                  <td className="py-3 px-4 text-zinc-400">Repeatedly reminds customer before the promised date</td>
                  <td className="py-3 px-4 text-white font-medium bg-[#b7d2f8]/5">AI extracts milestone date and snoozes cadences until after</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Customer asks for W-9 / Tax copy</td>
                  <td className="py-3 px-4 text-zinc-400">Languishes in unmonitored shared inbox for days</td>
                  <td className="py-3 px-4 text-white font-medium bg-[#b7d2f8]/5">Prepares draft with verified paperwork &amp; 1-click portal link</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Drafting vendor resolution</td>
                  <td className="py-3 px-4 text-zinc-400">Credit controller manually copies data &amp; writes email</td>
                  <td className="py-3 px-4 text-white font-medium bg-[#b7d2f8]/5">Pre-populates formal vendor response with invoice details</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Thread conversation tracking</td>
                  <td className="py-3 px-4 text-zinc-400">Scattered across personal Outlook and Gmail threads</td>
                  <td className="py-3 px-4 text-white font-medium bg-[#b7d2f8]/5">Unified threaded history directly linked to invoice record</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 6 CORE CAPABILITIES GRID */}
        <section className="mb-16">
          <div className="max-w-2xl mb-8">
            <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold block mb-1">
              Built-In Architecture
            </span>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Real Features Powering Autonomous Inbound Triage
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-[#0c0d10] border border-white/[0.08] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <MailCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">Cryptographic Inbound Tokens</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Outbound reminders use unique reply-to tokens (<code className="text-[#b7d2f8] font-mono text-[11px]">r_token@domain</code>) that map direct replies to invoices without requiring customers to quote reference IDs.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0c0d10] border border-white/[0.08] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <PauseCircle className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">Automated Cadence Freeze</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                The moment a customer replies, scheduled dunning cadences pause instantly. Protect customer relationships from robotic, ill-timed collection notices.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0c0d10] border border-white/[0.08] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">4 Intent Classifications</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Accurately distinguishes between genuine invoice disputes, scheduled payment promises, administrative tax requests, and ambiguous replies.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0c0d10] border border-white/[0.08] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">AI-Assisted Resolution Drafts</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Jaktra pre-composes formal, courteous replies referencing exact invoice amounts and terms so your finance team can review and respond in seconds.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0c0d10] border border-white/[0.08] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Inbox className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">Dedicated Inbound Dashboard</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Access your AR review queue at <code className="text-[#b7d2f8] font-mono text-[11px]">/disputes</code> with status filters (Pending, Resolved, Archived), full threaded history, and audit trails.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0c0d10] border border-white/[0.08] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">Security &amp; Domain Verification</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Includes SPF/DKIM verification, sender domain validation, and hourly Redis rate-limiting to prevent inbound webhook spoofing and mail loops.
              </p>
            </div>
          </div>
        </section>

        {/* FAQS */}
        <section className="mb-16">
          <div className="max-w-2xl mb-8">
            <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold block mb-1">
              Questions &amp; Answers
            </span>
            <h2 className="text-2xl font-bold text-white tracking-tight">Frequently Asked Questions</h2>
          </div>

          <div className="max-w-3xl">
            <Accordion type="single" variant="outline" defaultValue="faq-0" collapsible className="w-full">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left font-medium text-white text-sm">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* BOTTOM HIGH-CONVERTING CTA */}
        <section className="rounded-2xl border border-white/[0.08] bg-[#0c0d10] p-8 sm:p-12 text-center shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-[radial-gradient(ellipse_50%_50%_at_50%_0%,rgba(183,210,248,0.1),transparent)] pointer-events-none" />

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 tracking-tight relative z-10">
            Stop Tone-Deaf Automated Chasing Forever
          </h2>
          <p className="text-xs sm:text-sm text-zinc-300 max-w-xl mx-auto mb-6 leading-relaxed relative z-10">
            Catch inbound replies in real time, automatically pause follow-up sequences, and resolve billing disputes with AI-assisted clarity.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 relative z-10">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-zinc-950 text-xs sm:text-sm font-semibold hover:bg-zinc-200 transition-all shadow-lg"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/features"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs sm:text-sm font-medium text-zinc-300 transition-all"
            >
              Explore All Features
            </Link>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}

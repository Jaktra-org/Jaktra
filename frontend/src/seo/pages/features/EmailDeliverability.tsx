import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ShieldCheck,
  PauseCircle,
  Sparkles,
  Clock,
  ShieldAlert,
  Server,
  CheckCircle2,
  Lock,
  AlertTriangle,
} from "lucide-react";
import { SEOHead } from "@/seo/components/SEOHead";
import { emailDeliverabilitySchema, breadcrumbSchema } from "@/seo/schemas";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { GlobalNav } from "@/components/common/GlobalNav";

interface DeliverabilityScenario {
  id: string;
  tabLabel: string;
  targetEmail: string;
  company: string;
  invoiceNo: string;
  statusBadge: string;
  badgeStyle: string;
  smtpEvent: string;
  reputationImpact: string;
  sendingRail: string;
  systemAction: string;
  whatJaktraDoes: string;
  howAiAdapts: string;
  safeguardNote: string;
}

const SCENARIOS: DeliverabilityScenario[] = [
  {
    id: "circuit-breaker",
    tabLabel: "3-Drop Circuit Breaker (Hard Bounce 550)",
    targetEmail: "accounting.lead@departed-firm.com",
    company: "Apex Fabrication Group",
    invoiceNo: "INV-4108",
    statusBadge: "Circuit Breaker Tripped (3/3 Drops)",
    badgeStyle: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    smtpEvent: "SMTP 550 5.1.1: Mailbox disabled / Recipient departed company",
    reputationImpact: "0 spam complaints recorded; domain blacklist avoided",
    sendingRail: "Custom SMTP (TLS 1.3 / Port 587)",
    systemAction: "Quarantined in Dead Letter Queue (consecutiveFailures = 3)",
    whatJaktraDoes:
      "When a contact bounces 3 consecutive times, Jaktra immediately trips an automated circuit breaker. Automated dunning cadences halt instantly for this invoice, suppressing blind retry loops that would trigger spam traps.",
    howAiAdapts:
      "Jaktra flags the invoice on your finance review dashboard (/dlq) with a high-priority action item to request an updated accounts payable email, keeping collections moving without damaging sender reputation.",
    safeguardNote:
      "Dead Letter Queue (DLQ) safeguards prevent repeated bounces across Google Workspace and Microsoft 365.",
  },
  {
    id: "idempotency-lock",
    tabLabel: "20-Hour Anti-Spam Guard (Idempotency Lock)",
    targetEmail: "finance@horizon-logistics.io",
    company: "Horizon Logistics Corp",
    invoiceNo: "INV-3840",
    statusBadge: "20-Hour Idempotency Active",
    badgeStyle: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    smtpEvent: "Duplicate touch request within rolling 20-hour window",
    reputationImpact: "Zero spam report clicks; preserves debtor relationship",
    sendingRail: "SendGrid Dedicated Subuser Route",
    systemAction: "Atomic distributed lock skips duplicate outreach (idempotency_skip)",
    whatJaktraDoes:
      "Even if scheduled background crons, manual team follow-ups, and automated triage triggers run on the same day, Jaktra hardcodes a 20-hour idempotency gatekeeper (idempotency.service.ts) to prevent accidental double-touching.",
    howAiAdapts:
      "The system logs an idempotency skip event and safely postpones the reminder until the next authorized window. Clients never feel spammed, protecting corporate sender score from 'Report as Spam' penalties.",
    safeguardNote:
      "Enforces respectful communication pacing across all automated and manual outreach channels.",
  },
  {
    id: "rate-limit-retry",
    tabLabel: "Soft Bounce & Greylisting (Backoff Retry)",
    targetEmail: "ap-payables@megacorp-industries.com",
    company: "MegaCorp Industries",
    invoiceNo: "INV-4322",
    statusBadge: "Queued for Exponential Retry (+1h)",
    badgeStyle: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    smtpEvent: "SMTP 429 / 451: Recipient mail server greylisted connection",
    reputationImpact: "No delivery drop; automated transient recovery",
    sendingRail: "Resend Modern Transactional Engine",
    systemAction: "Staggered retry scheduled: Attempt 1 (+1h), Attempt 2 (+4h), Attempt 3 (+12h)",
    whatJaktraDoes:
      "When enterprise firewalls temporarily greylist an inbound connection or return rate limit codes, Jaktra captures the exact SMTP code and places the message into the Dead Letter Queue for staggered retry rather than dropping the bill.",
    howAiAdapts:
      "Outreach retries automatically during quiet server hours. If the mail server clears the greylist check, the reminder delivers directly into the accounting inbox without human intervention.",
    safeguardNote:
      "Exponential backoff eliminates false delivery alarms and avoids silent overdue invoice aging.",
  },
  {
    id: "auth-dns",
    tabLabel: "Authenticated Domain Sending (SPF, DKIM & DMARC)",
    targetEmail: "vendor-invoices@enterprise-client.com",
    company: "Nexus Cloud Systems",
    invoiceNo: "INV-5190",
    statusBadge: "100% DNS Alignment Verified",
    badgeStyle: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    smtpEvent: "SPF: PASS · DKIM: PASS · DMARC: PASS (100% Strict Policy)",
    reputationImpact: "99.4% inbox placement rate; zero junk folder drops",
    sendingRail: "Authenticated Tenant Domain Integration",
    systemAction: "Cryptographic tokenized links (/i/:token) replace suspicious attachments",
    whatJaktraDoes:
      "All outbound emails dispatch directly through your verified corporate domain records using AES-256-GCM encrypted API keys and SMTP credentials, completely aligning SPF, DKIM, and DMARC headers.",
    howAiAdapts:
      "Instead of attaching risky raw .zip or unsigned statement files that trigger corporate antivirus filters (Proofpoint/Mimecast), Jaktra embeds zero-login secure portal links with verified cryptographic tokens.",
    safeguardNote:
      "Tenant credentials stored with AES-256-GCM encryption with complete multi-tenant cryptographic isolation.",
  },
];

export function EmailDeliverability() {
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  const activeScenario = SCENARIOS[selectedScenarioIndex];

  const handleScenarioSelect = (index: number) => {
    setSelectedScenarioIndex(index);
  };

  const faqs = [
    {
      q: "How does traditional dunning software damage corporate email domain reputation?",
      a: "Legacy dunning tools blindly fire repetitive email templates at outdated or invalid debtor addresses. When inboxes bounce (SMTP 550 mailbox unavailable) or recipients mark robotic reminders as spam, domain spam scores spike. This degrades SPF/DKIM reputations and causes regular commercial sales and executive emails to land in spam folders.",
    },
    {
      q: "What is Jaktra's Dead Letter Queue (DLQ) and how does it prevent domain blacklisting?",
      a: "Jaktra's DLQ module (backend/src/modules/dlq/) acts as an automated safety cushion. When an outbound email fails, rather than repeatedly firing until the provider blacklists your domain, Jaktra logs the exact SMTP error code, applies exponential backoff for temporary glitches, and quarantines permanently failing debtor records into the DLQ.",
    },
    {
      q: "What is the 3-Drop Threshold Circuit Breaker?",
      a: "If an automated reminder fails 3 consecutive times for a specific debtor, Jaktra immediately trips a circuit breaker: automated messaging is halted for that invoice, preventing further bounces. The account is flagged on your dashboard with an action item to request an updated billing contact.",
    },
    {
      q: "How are email credentials secured across multi-tenant teams?",
      a: "Jaktra encrypts all tenant SMTP, SendGrid, and Resend API credentials at rest using AES-256-GCM (backend/src/modules/communication/tenant-mailer.ts). Emails are sent directly through your authenticated domain records, preserving deliverability while maintaining complete cryptographic isolation.",
    },
    {
      q: "Does Jaktra enforce spacing between reminder touches to prevent spam classification?",
      a: "Yes. Jaktra enforces a 20-hour rolling idempotency guard (backend/src/modules/communication/services/idempotency.service.ts). Even if multiple background collection sweeps run on the same day, no debtor can ever receive more than one outreach in a 20-hour rolling window.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#010102] text-[#f7f8f8] font-sans antialiased selection:bg-[#5e6ad2]/30 selection:text-white">
      <SEOHead
        title="B2B Invoice Email Deliverability & DLQ | Jaktra"
        description="Stop invoice emails from landing in spam. Configure SPF, DKIM, and DMARC correctly, and use automated Dead Letter Queues to protect sender reputation."
        canonicalPath="/features/email-deliverability"
        jsonLd={[
          emailDeliverabilitySchema,
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Features", path: "/features" },
            { name: "Email Deliverability & DLQ", path: "/features/email-deliverability" },
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
              Email Deliverability &amp; DLQ
            </li>
          </ol>
        </nav>

        {/* CLEAN HERO HEADER */}
        <header className="mb-10 relative z-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] xl:text-[44px] font-extrabold tracking-tight text-white mb-3.5 leading-tight lg:leading-none whitespace-normal md:whitespace-nowrap">
            B2B Invoice Email Deliverability &amp; DLQ
          </h1>

          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-3xl">
            When invoice reminders land in spam or bounce repeatedly, cash collection stalls and your corporate domain gets blacklisted. Jaktra combines authenticated DNS sending, 20-hour anti-spam spacing, automated Dead Letter Queues (DLQ), and a 3-drop circuit breaker to guarantee inbox delivery.
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
                  Target Recipient: <strong className="text-white font-mono">{activeScenario.targetEmail}</strong>
                </div>
              </div>

              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium ${activeScenario.badgeStyle}`}>
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{activeScenario.statusBadge}</span>
              </div>
            </div>

            {/* 1. Diagnostic Signals */}
            <div className="space-y-3">
              <div className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                <Server className="w-3.5 h-3.5 text-[#b7d2f8]" />
                <span>Deliverability Diagnostics</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs space-y-1">
                  <div className="text-[11px] font-mono text-zinc-500 uppercase">SMTP Diagnostic</div>
                  <div className="font-semibold text-white">{activeScenario.smtpEvent}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs space-y-1">
                  <div className="text-[11px] font-mono text-zinc-500 uppercase">Domain Standing</div>
                  <div className="font-semibold text-white">{activeScenario.reputationImpact}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs space-y-1">
                  <div className="text-[11px] font-mono text-zinc-500 uppercase">Sending Provider Rail</div>
                  <div className="font-semibold text-white">{activeScenario.sendingRail}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs space-y-1">
                  <div className="text-[11px] font-mono text-zinc-500 uppercase">System Protection State</div>
                  <div className="font-semibold text-white">{activeScenario.systemAction}</div>
                </div>
              </div>
            </div>

            {/* 2. Feature Explanation: What Jaktra Does & How Outreach Adapts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <PauseCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>What Jaktra Does Immediately</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {activeScenario.whatJaktraDoes}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <Sparkles className="w-4 h-4 text-[#b7d2f8] shrink-0" />
                  <span>How Sender Reputation is Protected</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {activeScenario.howAiAdapts}
                </p>
              </div>
            </div>

            {/* Safeguard & Security Guarantee */}
            <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
              <div className="flex items-center gap-2 text-zinc-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{activeScenario.safeguardNote}</span>
              </div>
              <span className="text-[11px] text-zinc-500 font-mono shrink-0">
                AES-256-GCM encrypted credential vault
              </span>
            </div>
          </div>
        </section>

        {/* 4-PHASE LIFECYCLE: HOW DELIVERABILITY RESILIENCE WORKS */}
        <section className="mb-16 border-t border-white/[0.08] pt-12">
          <div className="max-w-2xl mb-8">
            <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold block mb-1">
              End-to-End Delivery Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              How Jaktra Ensures 99.4% Inbox Placement
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#0c0d10] border border-white/[0.08] space-y-3 relative">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Phase 1
              </span>
              <h3 className="text-sm font-semibold text-white">Authenticated Domain Sending</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Reminders dispatch through your verified domain records via custom SMTP, SendGrid, or Resend, aligning SPF, DKIM, and DMARC parameters perfectly.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0c0d10] border border-white/[0.08] space-y-3 relative">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Phase 2
              </span>
              <h3 className="text-sm font-semibold text-white">20-Hour Anti-Spam Gatekeeper</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                An atomic idempotency lock guarantees no customer receives more than one reminder in a 20-hour window, eliminating 'Report as Spam' clicks.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0c0d10] border border-white/[0.08] space-y-3 relative">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                Phase 3
              </span>
              <h3 className="text-sm font-semibold text-white">Real-Time Error Interception</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Temporary glitches and rate limits (429/451) trigger staggered exponential backoff retries, preventing silent invoice aging without manual checks.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0c0d10] border border-white/[0.08] space-y-3 relative">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Phase 4
              </span>
              <h3 className="text-sm font-semibold text-white">Dead Letter Queue &amp; Circuit Breaker</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Consecutive failures (3 drops) automatically trip a circuit breaker, halting robotic outreach and escalating the account for updated contact review.
              </p>
            </div>
          </div>
        </section>

        {/* COMPARISON TABLE: JAKTRA VS TRADITIONAL DUNNING TOOLS */}
        <section className="mb-16 rounded-2xl bg-[#0c0d10] border border-white/[0.08] p-5 sm:p-7 shadow-xl">
          <div className="mb-5">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-1">
              Operational Comparison
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Enterprise Deliverability Shields vs. Traditional Dunning Robots
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[620px]">
              <thead>
                <tr className="border-b border-white/[0.08] text-[11px] font-mono uppercase text-zinc-400">
                  <th className="py-3 px-4">Deliverability Vector</th>
                  <th className="py-3 px-4 text-zinc-400">Legacy Dunning Robots</th>
                  <th className="py-3 px-4 text-[#b7d2f8] font-bold">Jaktra Deliverability &amp; DLQ Shield</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Inactive or Departed AP Staff</td>
                  <td className="py-3 px-4 text-zinc-400">Repeatedly hammers deleted mailboxes; spikes SMTP 550 bounces</td>
                  <td className="py-3 px-4 text-white font-medium bg-[#b7d2f8]/5">Trips 3-Drop Circuit Breaker; freezes cadences and alerts team</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Daily Follow-Up Frequency</td>
                  <td className="py-3 px-4 text-zinc-400">Multiple touches fired in 24h by uncoordinated crons and staff</td>
                  <td className="py-3 px-4 text-white font-medium bg-[#b7d2f8]/5">Enforces strict 20-hour idempotency gatekeeper across all sweeps</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Mail Server Rate Limits (429 / 451)</td>
                  <td className="py-3 px-4 text-zinc-400">Drops reminder silently or continues aggressive retry hammering</td>
                  <td className="py-3 px-4 text-white font-medium bg-[#b7d2f8]/5">Exponential backoff (+1h, +4h, +12h) recovers soft bounces cleanly</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Email Authentication Routing</td>
                  <td className="py-3 px-4 text-zinc-400">Sends from shared 3rd-party pool with misaligned SPF/DKIM</td>
                  <td className="py-3 px-4 text-white font-medium bg-[#b7d2f8]/5">Sends directly from authenticated tenant domain (SMTP/SendGrid/Resend)</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Invoice Attachment Security</td>
                  <td className="py-3 px-4 text-zinc-400">Attaches raw files that corporate spam filters (Proofpoint) quarantine</td>
                  <td className="py-3 px-4 text-white font-medium bg-[#b7d2f8]/5">Delivers zero-login cryptographically verified portal links (/i/:token)</td>
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
              Real Features Protecting Corporate Sender Standing
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-[#0c0d10] border border-white/[0.08] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Server className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">Multi-Provider Redundancy</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Connect authenticated custom SMTP (TLS 1.3), SendGrid API subusers, or Resend infrastructure with automated health probing.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0c0d10] border border-white/[0.08] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">Automated Dead Letter Queue</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Captures every delivery rejection in a dedicated database queue (<code className="text-[#b7d2f8] font-mono text-[11px]">/dlq</code>) with full technical SMTP error details.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0c0d10] border border-white/[0.08] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">3-Drop Circuit Breaker</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Automatically trips when an address fails 3 consecutive times, halting all automated outreach until an alternate contact is provided.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0c0d10] border border-white/[0.08] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">20-Hour Idempotency Lock</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Strict rolling 20-hour window prevents multiple reminders on the same invoice, eliminating debtor spam complaints.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0c0d10] border border-white/[0.08] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Lock className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">AES-256-GCM Vault</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                All email provider credentials, API keys, and SMTP passwords are encrypted at rest with multi-tenant cryptographic isolation.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0c0d10] border border-white/[0.08] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">Tokenized Web Portals</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Reminders embed zero-login cryptographic portal links (<code className="text-[#b7d2f8] font-mono text-[11px]">/i/:token</code>) rather than attachments that trigger spam filters.
              </p>
            </div>
          </div>
        </section>

        {/* FREQUENTLY ASKED QUESTIONS */}
        <section className="mb-16">
          <div className="max-w-2xl mb-8">
            <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold block mb-1">
              Common Questions
            </span>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="rounded-2xl bg-[#0c0d10] border border-white/[0.08] p-6 sm:p-8">
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="border-b border-white/[0.06] last:border-0 pb-4 last:pb-0"
                >
                  <AccordionTrigger className="text-sm font-medium text-white hover:text-[#b7d2f8] text-left">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-xs sm:text-sm text-zinc-400 leading-relaxed pt-2">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CLEAN HIGH-CONVERTING BOTTOM CTA */}
        <section className="rounded-2xl bg-[#0c0d10] border border-white/[0.08] p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
          <div className="max-w-xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Collect Outstanding Receivables Without Domain Risks
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Equip your finance team with enterprise DLQ protection, automated circuit breakers, and verified provider failover. 100% free during Early Access.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                to="/register"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-white text-zinc-950 font-semibold text-xs sm:text-sm hover:bg-zinc-200 transition-colors shadow-sm inline-flex items-center justify-center gap-2"
              >
                <span>Get started free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/features"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-white/[0.04] text-zinc-300 hover:text-white hover:bg-white/[0.08] border border-white/[0.08] text-xs sm:text-sm font-medium transition-colors"
              >
                Explore all features
              </Link>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}

export default EmailDeliverability;

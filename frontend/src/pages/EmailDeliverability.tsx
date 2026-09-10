import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ShieldAlert,
  Server,
  CheckCircle2,
  Zap,
  Activity,
  AlertTriangle,
  Lock,
} from "lucide-react";
import jaktraLogo from "../assets/jaktra_svg.svg";
import { SEOHead } from "../components/common/SEOHead";
import { emailDeliverabilitySchema, breadcrumbSchema } from "../components/common/seo-schemas";
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

type SimulationScenario = "rate_limit" | "hard_bounce" | "circuit_breaker";



export function EmailDeliverability() {
  const [selectedScenario, setSelectedScenario] = useState<SimulationScenario>("circuit_breaker");

  const faqs = [
    {
      q: "How does traditional dunning software damage corporate email domain reputation?",
      a: "Legacy dunning tools blindly fire repetitive email templates at outdated or invalid debtor addresses. When inboxes bounce (550 mailbox unavailable) or recipients mark robotic reminders as spam, domain spam scores spike. This degrades SPF/DKIM reputations and causes regular commercial sales and executive emails to land in spam folders.",
    },
    {
      q: "What is Jaktra's Dead Letter Queue (DLQ) and how does it prevent domain blacklisting?",
      a: "Jaktra's DLQ module (backend/src/modules/dlq/) acts as an automated safety cushion. When an outbound email fails, rather than repeatedly firing until the provider blacklists your domain, Jaktra logs the exact SMTP error code, applies exponential backoff for temporary glitches, and quarantines permanently failing debtor records into the DLQ.",
    },
    {
      q: "What is the 3-Drop Threshold Circuit Breaker?",
      a: "If an automated dunning email fails 3 consecutive times for a specific debtor, Jaktra immediately trips a circuit breaker: automated messaging is halted for that invoice, preventing further bounces. The account is flagged on your dashboard with an action item to request an updated billing contact.",
    },
    {
      q: "How are email credentials secured across multi-tenant teams?",
      a: "Jaktra encrypts all tenant SMTP, SendGrid, and Resend API credentials at rest using AES-256-GCM (backend/src/modules/communication/tenant-mailer.ts). Emails are sent directly through your authenticated domain records, preserving deliverability while maintaining complete cryptographic isolation.",
    },
    {
      q: "Does Jaktra enforce spacing between dunning touches to prevent spam classification?",
      a: "Yes. Jaktra hardcodes a 20-hour idempotency guard (backend/src/modules/communication/services/idempotency.service.ts). Even if multiple background collection sweeps run on the same day, no debtor can ever receive more than one outreach in a 20-hour rolling window.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-zinc-100 font-sans selection:bg-[#b7d2f8]/20 selection:text-white">
      <SEOHead
        title="Why Invoice Emails Go to Spam (And 7 Ways to Ensure Clients Actually Receive Them) | Jaktra"
        description="Discover why invoice and payment reminder emails go to spam, how to fix SPF/DKIM/DMARC deliverability, and how automated Dead Letter Queues (DLQ) and circuit breakers protect sender reputation."
        canonicalPath="/features/email-deliverability"
        jsonLd={[
          emailDeliverabilitySchema,
          breadcrumbSchema([
            { name: "Features", path: "/features" },
            { name: "Invoice Email Deliverability Guide", path: "/features/email-deliverability" },
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
              Invoice Email Deliverability Guide
            </li>
          </ol>
        </nav>

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-20 sm:mb-24">
          <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-3">
            Billing Email Deliverability &amp; Domain Protection Guide
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-6 leading-tight">
            Why Your Invoice Emails Go to Spam (And How to Ensure Clients Actually Receive Them)
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
            When overdue invoice reminders land in spam or bounce, cash collection stalls and your corporate domain reputation suffers. Discover why billing emails get flagged by Microsoft 365 and Google Workspace—and how autonomous Dead Letter Queues (DLQ) and circuit breakers guarantee delivery without domain penalties.
          </p>
        </div>

        {/* Metrics Banner */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16 sm:mb-20">
          <div className="rounded-2xl border border-white/[0.08] bg-[#111113] p-8 text-center shadow-lg">
            <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono mb-1">Failover</div>
            <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Multi-Provider Redundancy</div>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-[#111113] p-8 text-center shadow-lg">
            <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono mb-1">3 Drops</div>
            <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Circuit Breaker Auto-Halt Limit</div>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-[#111113] p-8 text-center shadow-lg">
            <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono mb-1">AES-256</div>
            <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider">GCM Multi-Tenant Credential Security</div>
          </div>
        </section>

        {/* Search Intent Section: The 7 Reasons Invoice Emails Go to Spam */}
        <section className="mb-20 sm:mb-24">
          <div className="max-w-3xl mb-10">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-2">
              Deliverability Diagnostic
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              7 Root Causes Why Invoice Emails Go to Spam (And How to Fix Each)
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 mt-2 leading-relaxed">
              When clients claim &ldquo;we never received the invoice,&rdquo; it is rarely an excuse—corporate spam filters aggressively isolate payment reminder emails. Here are the 7 core vulnerabilities finance teams face:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl bg-[#111113] border border-white/[0.08]">
              <div className="flex items-center gap-2.5 text-white font-semibold text-sm mb-2">
                <span className="w-6 h-6 rounded-md bg-white/[0.06] border border-white/[0.1] text-xs font-mono flex items-center justify-center text-[#b7d2f8]">01</span>
                <span>Missing or Misaligned SPF, DKIM &amp; DMARC</span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                If your billing software sends emails from a third-party server without authenticated DNS records (DKIM keys and SPF includes), Microsoft 365 and Google Workspace immediately route the message to the Junk folder or drop it silently.
              </p>
              <div className="mt-3 text-xs text-[#b7d2f8] font-mono flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Jaktra Solution: Multi-tenant authenticated DNS routing.
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#111113] border border-white/[0.08]">
              <div className="flex items-center gap-2.5 text-white font-semibold text-sm mb-2">
                <span className="w-6 h-6 rounded-md bg-white/[0.06] border border-white/[0.1] text-xs font-mono flex items-center justify-center text-[#b7d2f8]">02</span>
                <span>Repetitive &ldquo;Spam Trigger&rdquo; Boilerplate Copy</span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Legacy dunning tools send the identical static template text (&ldquo;URGENT: OVERDUE PAYMENT REQUIRED&rdquo;) to hundreds of debtors. Mail servers identify repetitive hash signatures and flag them as automated phishing scams.
              </p>
              <div className="mt-3 text-xs text-[#b7d2f8] font-mono flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Jaktra Solution: Groq LLaMA 3.1 unique tone synthesis.
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#111113] border border-white/[0.08]">
              <div className="flex items-center gap-2.5 text-white font-semibold text-sm mb-2">
                <span className="w-6 h-6 rounded-md bg-white/[0.06] border border-white/[0.1] text-xs font-mono flex items-center justify-center text-[#b7d2f8]">03</span>
                <span>High Hard Bounce Rates from Inactive AP Contacts</span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Accounts payable staff change jobs frequently. When a dunning bot repeatedly hammers deleted mailboxes (SMTP 550 errors), your corporate sender score collapses, poisoning deliverability across all company communications.
              </p>
              <div className="mt-3 text-xs text-[#b7d2f8] font-mono flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Jaktra Solution: Automated 3-Drop Circuit Breaker isolation.
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#111113] border border-white/[0.08]">
              <div className="flex items-center gap-2.5 text-white font-semibold text-sm mb-2">
                <span className="w-6 h-6 rounded-md bg-white/[0.06] border border-white/[0.1] text-xs font-mono flex items-center justify-center text-[#b7d2f8]">04</span>
                <span>Over-Frequent Messaging (Spam Button Clicks)</span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Multiple cron jobs or overzealous credit controllers emailing the same client twice in 24 hours annoys buyers. Just one debtor clicking &ldquo;Report as Spam&rdquo; does 10x more damage to your domain than 50 successful opens.
              </p>
              <div className="mt-3 text-xs text-[#b7d2f8] font-mono flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Jaktra Solution: Enforced 20-Hour Rolling Idempotency Guard.
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#111113] border border-white/[0.08]">
              <div className="flex items-center gap-2.5 text-white font-semibold text-sm mb-2">
                <span className="w-6 h-6 rounded-md bg-white/[0.06] border border-white/[0.1] text-xs font-mono flex items-center justify-center text-[#b7d2f8]">05</span>
                <span>Suspicious Unencrypted Attachments (.zip / .scr)</span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Attaching large raw files or unverified statement archives triggers enterprise antivirus quarantine. Modern firewalls (Proofpoint, Mimecast) block inbound corporate emails carrying suspicious billing attachments.
              </p>
              <div className="mt-3 text-xs text-[#b7d2f8] font-mono flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Jaktra Solution: Cryptographic /i/:token zero-login web portals.
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#111113] border border-white/[0.08]">
              <div className="flex items-center gap-2.5 text-white font-semibold text-sm mb-2">
                <span className="w-6 h-6 rounded-md bg-white/[0.06] border border-white/[0.1] text-xs font-mono flex items-center justify-center text-[#b7d2f8]">06</span>
                <span>Transient Mail Server Glitches &amp; Greylisting</span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Recipient MX servers often return temporary 451 or 429 rate limit codes. Tools that fail to retry with exponential backoff drop the reminder entirely, causing invoices to age silently without follow-up.
              </p>
              <div className="mt-3 text-xs text-[#b7d2f8] font-mono flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Jaktra Solution: Dead Letter Queue (DLQ) exponential backoff.
              </div>
            </div>
          </div>
        </section>

        {/* Interactive DLQ Simulation Sandbox */}
        <section className="rounded-2xl border border-white/[0.08] bg-[#111113] p-6 sm:p-8 mb-20 sm:mb-24 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-4 h-4 text-[#b7d2f8]" />
                <h2 className="text-lg sm:text-xl font-bold text-white">Interactive Dead Letter Queue (DLQ) Simulator</h2>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400">
                Select a delivery failure event to inspect Jaktra&apos;s automated resilience logic and domain protection shields.
              </p>
            </div>

            {/* Scenario Buttons */}
            <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[#0a0a0b] border border-white/[0.08] shrink-0">
              <button
                onClick={() => setSelectedScenario("rate_limit")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  selectedScenario === "rate_limit" ? "bg-white/[0.12] text-white font-semibold" : "text-zinc-400 hover:text-white"
                }`}
              >
                Soft Bounce / Rate Limit
              </button>
              <button
                onClick={() => setSelectedScenario("hard_bounce")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  selectedScenario === "hard_bounce" ? "bg-white/[0.12] text-white font-semibold" : "text-zinc-400 hover:text-white"
                }`}
              >
                Hard Bounce (550)
              </button>
              <button
                onClick={() => setSelectedScenario("circuit_breaker")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  selectedScenario === "circuit_breaker"
                    ? "bg-white text-zinc-950 font-bold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                3-Drop Circuit Breaker
              </button>
            </div>
          </div>

          {/* Terminal / Event Log Display */}
          <div className="rounded-xl border border-white/[0.08] bg-[#0a0a0b] p-5 font-mono text-xs space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] text-zinc-500 text-[11px]">
              <span className="flex items-center gap-2">
                <Server className="w-3.5 h-3.5 text-[#b7d2f8]" />
                <span>JAKTRA DLQ MONITOR · RUNNING ASYNC</span>
              </span>
              <span>PORT: 587 (TLSv1.3)</span>
            </div>

            {selectedScenario === "rate_limit" && (
              <div className="space-y-2 text-zinc-300">
                <div className="text-zinc-200">[WARN] Delivery encounter: 429 Too Many Requests from recipient MX server.</div>
                <div className="text-zinc-400">&gt; Action: Triggering exponential backoff schedule (Attempt 1 of 3).</div>
                <div className="text-zinc-400">&gt; Next Retry Window: Calculated at +3,600s (1 hour delay).</div>
                <div className="text-white font-semibold">&gt; Status: Outbox quarantined. Domain reputation score unaffected (0 complaints).</div>
              </div>
            )}

            {selectedScenario === "hard_bounce" && (
              <div className="space-y-2 text-zinc-300">
                <div className="text-zinc-200">[ERROR] Delivery failed: 550 5.1.1 User unknown / mailbox unavailable.</div>
                <div className="text-zinc-400">&gt; Action: Intercepted by Dead Letter Queue (backend/src/modules/dlq/).</div>
                <div className="text-zinc-400">&gt; Blind retries suppressed immediately to prevent spam trap penalties.</div>
                <div className="text-[#b7d2f8] font-semibold">&gt; Status: Invoice flagged as BAD_RECIPIENT. Alternative AP contact requested.</div>
              </div>
            )}

            {selectedScenario === "circuit_breaker" && (
              <div className="space-y-2 text-zinc-300">
                <div className="text-white font-bold">[CIRCUIT BREAKER TRIPPED]: Consecutive failure threshold exceeded (3/3 drops).</div>
                <div className="text-zinc-400">&gt; Target: billing@delinquent-client.com · Invoice #INV-1092</div>
                <div className="text-zinc-400">&gt; Automation Lock: Agent dunning cadences strictly HALTED for this invoice record.</div>
                <div className="text-[#b7d2f8] font-semibold">&gt; Shield Active: SENDER REPUTATION PROTECTED. Escalated to internal Finance Ops review.</div>
              </div>
            )}
          </div>
        </section>

        {/* 3 Core Architecture Moats (Open 3-Layer Sequence) */}
        <section className="mb-20 sm:mb-24">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-2">
              Three Layers of Sender Protection
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Enterprise Resilience &amp; Domain Shields
            </h2>
            <p className="text-sm text-zinc-400 mt-2">
              Explore how Jaktra keeps your domain off blacklists while maintaining high collection inbox placement.
            </p>
          </div>

          <div className="space-y-6">
            {/* Layer 01 */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#111113] p-6 sm:p-8 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.1] text-xs font-mono font-bold flex items-center justify-center text-[#b7d2f8]">
                    01
                  </span>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">
                      Automated 3-Drop Circuit Breaker (Protecting DKIM &amp; SPF Standing)
                    </h3>
                    <p className="text-xs text-zinc-400 font-mono mt-0.5">
                      Permanent bounce quarantine &bull; Module: <code className="text-zinc-300">backend/src/modules/dlq/circuit-breaker.ts</code>
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-white/[0.04] border border-white/[0.08] text-[#b7d2f8]">
                  Reputation Shield
                </span>
              </div>

              <p className="text-sm text-zinc-300 leading-relaxed mb-6">
                When an overdue accounting contact leaves a customer organization, their mailbox is deleted or disabled. Traditional dunning tools blindly hammer that inactive address week after week, triggering consecutive SMTP 550 errors that destroy your domain&apos;s reputation across Google Workspace and Microsoft 365.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0a0a0b]/60">
                  <div className="text-xs font-semibold text-zinc-200 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#b7d2f8]" />
                    The 3-Drop Threshold
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Upon 3 consecutive bounces, Jaktra immediately trips an automated circuit breaker. Outreach is frozen for that recipient, isolating your corporate domain from spam traps.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0a0a0b]/60">
                  <div className="text-xs font-semibold text-[#b7d2f8] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Ops Escalation Ticket
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    The invoice is flagged with a high-priority action item for your finance team to secure an alternate billing or AP email address without interrupting cash collection.
                  </p>
                </div>
              </div>
            </div>

            {/* Layer 02 */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#111113] p-6 sm:p-8 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.1] text-xs font-mono font-bold flex items-center justify-center text-[#b7d2f8]">
                    02
                  </span>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">
                      Dead Letter Queue (DLQ) with Exponential Backoff Retries
                    </h3>
                    <p className="text-xs text-zinc-400 font-mono mt-0.5">
                      Multi-tiered soft bounce recovery &bull; Module: <code className="text-zinc-300">backend/src/modules/dlq/</code>
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-white/[0.04] border border-white/[0.08] text-[#b7d2f8]">
                  DLQ Core
                </span>
              </div>

              <p className="text-sm text-zinc-300 leading-relaxed mb-6">
                Transient server glitches, greylisting, and recipient MX rate-limiting (HTTP 429 / SMTP 451) should never derail your collection cadences. Jaktra&apos;s DLQ engine classifies error signatures in real time and schedules staggered retries automatically.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0a0a0b]/60 text-center">
                  <div className="text-xs font-semibold text-zinc-400 mb-1 font-mono uppercase tracking-wider">Attempt 1</div>
                  <div className="text-base font-bold text-white font-mono">+1 Hour Delay</div>
                  <div className="text-xs text-zinc-400 mt-1">Transient Greylist Recovery</div>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0a0a0b]/60 text-center">
                  <div className="text-xs font-semibold text-zinc-400 mb-1 font-mono uppercase tracking-wider">Attempt 2</div>
                  <div className="text-base font-bold text-white font-mono">+4 Hours Delay</div>
                  <div className="text-xs text-zinc-400 mt-1">Secondary MX Failover</div>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0a0a0b]/60 text-center">
                  <div className="text-xs font-semibold text-zinc-400 mb-1 font-mono uppercase tracking-wider">Attempt 3</div>
                  <div className="text-base font-bold text-white font-mono">+12 Hours Delay</div>
                  <div className="text-xs text-zinc-400 mt-1">Final Soft-Retry Window</div>
                </div>
              </div>
            </div>

            {/* Layer 03 */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#111113] p-6 sm:p-8 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.1] text-xs font-mono font-bold flex items-center justify-center text-[#b7d2f8]">
                    03
                  </span>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">
                      20-Hour Rolling Idempotency Guard (Anti-Spam Spacing)
                    </h3>
                    <p className="text-xs text-zinc-400 font-mono mt-0.5">
                      Atomic distributed lock &bull; Module: <code className="text-zinc-300">idempotency.service.ts</code>
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-white/[0.04] border border-white/[0.08] text-[#b7d2f8]">
                  Idempotency
                </span>
              </div>

              <p className="text-sm text-zinc-300 leading-relaxed mb-6">
                Sending multiple collection emails in a single day annoys accounting contacts, damages goodwill, and rapidly triggers recipient spam buttons. Jaktra enforces a strict 20-hour idempotency gatekeeper.
              </p>

              <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0a0a0b]/60 flex items-start gap-4">
                <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0 mt-0.5 text-[#b7d2f8]">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white mb-1">Multi-Worker Race Condition Elimination</div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Even if manual follow-ups, scheduled cron jobs, and agent triage actions trigger simultaneously on the same overdue ledger entry, atomic distributed locks prevent duplicate touches. Debtor contacts receive clean, spaced communications every single time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Multi-Provider Failover Matrix */}
        <section className="mb-20 sm:mb-24 rounded-2xl border border-white/[0.08] bg-[#111113] p-6 sm:p-8 shadow-xl">
          <div className="max-w-3xl mb-6">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#b7d2f8]" />
              Multi-Provider Failover Matrix
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Jaktra never locks your receivables communications to a single delivery pipe. You can configure your own
              authenticated SMTP host, SendGrid, or Resend infrastructure with automated health probing.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0a0a0b]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-white">Custom SMTP Host</span>
                <CheckCircle2 className="w-4 h-4 text-[#b7d2f8]" />
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Connect Office 365, Google Workspace, or on-premise Exchange with TLS 1.3 encryption and dedicated port assignment.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0a0a0b]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-white">SendGrid API</span>
                <CheckCircle2 className="w-4 h-4 text-[#b7d2f8]" />
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Enterprise subuser routing with automatic bounce webhook parsing and IP pool isolation per business unit.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0a0a0b]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-white">Resend Modern Engine</span>
                <CheckCircle2 className="w-4 h-4 text-[#b7d2f8]" />
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Instant transactional delivery with real-time delivery telemetry and sub-second webhook notifications.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section with Outline Accordion */}
        <section className="mb-20 sm:mb-24">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Frequently Asked Questions</h2>
            <p className="text-sm text-zinc-400 mt-2">
              Everything you need to know about corporate domain reputation and AR email deliverability.
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
              Collect Outstanding Receivables Without Domain Risks
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 mb-6 leading-relaxed">
              Equip your finance team with enterprise DLQ protection, automated circuit breakers, and verified provider failover. 100% free during Early Access with zero credit card required.
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

export default EmailDeliverability;

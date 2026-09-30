import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Copy,
  Check,
  Clock,
  Calendar,
  User,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  FileText,
  Lightbulb,
} from "lucide-react";
import { SEOHead } from "@/seo/components/SEOHead";
import { toneEscalationPlaybookSchema, breadcrumbSchema } from "@/seo/schemas";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { GlobalNav } from "@/components/common/GlobalNav";

interface StageTemplate {
  stage: number;
  title: string;
  days: string;
  tone: string;
  badgeColor: string;
  summary: string;
  tip: string;
  subject: string;
  body: string;
}

const STAGES: StageTemplate[] = [
  {
    stage: 1,
    title: "The Friendly Courtesy Reminder",
    days: "Days 1–7 Overdue",
    tone: "Polite, helpful, and collaborative",
    badgeColor: "bg-blue-500/10 text-blue-300 border-blue-500/20",
    summary:
      "Assume accidental oversight. Most invoices that go unpaid in the first week simply slipped through the cracks, got stuck in an internal approval queue, or need a minor administrative update.",
    tip: "Always attach the original invoice PDF and include a direct payment link so their AP team doesn't have to search their inbox.",
    subject: "Friendly reminder: Invoice #{invoiceNumber} for {companyName}",
    body: `Hi {recipientName},

Hope your week is going well!

This is a quick courtesy note to check in on Invoice #{invoiceNumber} for {amount}, which was due on {dueDate}. 

We know how busy things get, so we wanted to make sure your accounting team has everything needed to process payment. You can view the invoice details and complete payment directly here:

{paymentLink}

If payment is already scheduled in this week's run, or if you need an updated PO or tax form on our end, please let me know and I'll gladly take care of it.

Warm regards,
{senderName}
{senderCompany}`,
  },
  {
    stage: 2,
    title: "The Professional Commercial Follow-Up",
    days: "Days 8–14 Overdue",
    tone: "Direct, structured, and inquiry-focused",
    badgeColor: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
    summary:
      "Move from a casual nudge to a structured accounting inquiry. Ask specifically for their scheduled payment date and offer payment flexibility if they are managing short-term cash flow constraints.",
    tip: "Proactively offering a 2- or 3-part installment plan at this stage resolves more than 40% of cash-delayed invoices without conflict.",
    subject: "Follow-up: Invoice #{invoiceNumber} is past due — {companyName}",
    body: `Hi {recipientName},

I am following up on Invoice #{invoiceNumber} ({amount}), which is now past due by {daysPastDue} days (original due date: {dueDate}).

Could you please check with your accounts payable team to confirm when the remittance is scheduled?

If your team is currently balancing project cash timing, we are happy to offer a flexible installment option (e.g., splitting this balance into 2 or 3 weekly payments) via our portal:

{paymentLink}

Please let me know if you need another copy of the statement or if anything requires clarification regarding the deliverables.

Best regards,
{senderName}
{senderCompany}`,
  },
  {
    stage: 3,
    title: "The Firm Operational Warning",
    days: "Days 15–21 Overdue",
    tone: "Formal, firm, and focused on service continuity",
    badgeColor: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    summary:
      "When payment is two to three weeks late, escalate communication from AP clerks to project sponsors and department managers. Make it clear that overdue balances impact ongoing deliverables and commercial credit terms.",
    tip: "CC your primary project contact or executive sponsor. Often the business sponsor has no idea their finance department hasn't paid you.",
    subject: "Action Required: Overdue Invoice #{invoiceNumber} ({amount})",
    body: `Dear {recipientName} and Accounts Payable Team,

Our records show that Invoice #{invoiceNumber} for {amount} remains unpaid and is now {daysPastDue} days past due despite earlier reminders.

To ensure uninterrupted delivery of ongoing services and keep your commercial account in good standing, we require settlement or a confirmed payment schedule by {cutoffDate, e.g., this Friday at 5:00 PM}.

You can complete payment immediately via our secure link:
{paymentLink}

If there is a billing discrepancy, missing purchase order, or dispute holding up approval, please reply immediately to this email so we can resolve it today.

Sincerely,
{senderName}
Finance & Accounts Receivable, {senderCompany}`,
  },
  {
    stage: 4,
    title: "The Formal Pre-Legal Demand",
    days: "Days 22–30 Overdue",
    tone: "Strict, uncompromising, and deadline-driven",
    badgeColor: "bg-orange-500/10 text-orange-300 border-orange-500/20",
    summary:
      "This is your final written warning before escalating outside normal business channels. State a concrete calendar deadline (typically 3 to 5 business days) and outline the specific consequences of non-payment.",
    tip: "State specific dates and times (e.g., 'Friday, October 17 at 5:00 PM EST') rather than vague phrasing like 'as soon as possible'.",
    subject: "FINAL NOTICE: Overdue Invoice #{invoiceNumber} — Action Required",
    body: `DEMAND NOTICE: Final Warning for Overdue Invoice #{invoiceNumber}

Dear {recipientName} and Executive Management,

Your account is now {daysPastDue} days overdue with an outstanding balance of {amount}. Despite multiple prior notices, this obligation has not been settled.

Please accept this communication as formal notice that full payment must be received within four (4) business days—by {specificDeadlineDate, e.g., Friday, October 17, at 5:00 PM EST}.

If payment is not received by this date, we will be forced to take the following steps:
1. Immediate suspension of active account access and ongoing services
2. Revocation of commercial credit terms
3. Referral of this file to external collections counsel

Please remit payment immediately to keep your account in good standing:
{paymentLink}

If remittance has already been dispatched via wire transfer, please reply with the bank confirmation reference immediately so we can pause escalation.

Office of the Chief Financial Officer
{senderCompany}`,
  },
  {
    stage: 5,
    title: "The Direct Phone & Legal Escalation Hold",
    days: "Days 31+ Overdue",
    tone: "Direct executive outreach & legal referral",
    badgeColor: "bg-rose-500/10 text-rose-300 border-rose-500/20",
    summary:
      "Continuing to send routine dunning emails past 30 days is counterproductive. At this stage, stop automated emails, pick up the phone for a direct conversation with executive leadership, and prepare legal documentation.",
    tip: "Never threaten legal action you aren't prepared to take. If you say you will refer the account to counsel, follow through promptly.",
    subject: "Account Escalation Notice: Invoice #{invoiceNumber} ({companyName})",
    body: `Dear {recipientName},

As of today, Invoice #{invoiceNumber} for {amount} is {daysPastDue} days overdue. We have reached out on multiple occasions without receiving payment or an agreed resolution.

We have now placed your account on credit hold and paused all active deliverables. 

Before we officially transfer this file to our external legal counsel and commercial recovery partner, I would like to offer one final opportunity to resolve this amicably.

Please contact our office directly today at {phoneNumber} or settle the outstanding balance via the secure link below:

{paymentLink}

If we do not hear from your executive team by {finalDate}, this matter will be handled directly through legal collections.

Sincerely,
{senderName}
{senderTitle}, {senderCompany}
Direct: {phoneNumber}`,
  },
];

const FAQS = [
  {
    q: "Why shouldn't I use the same email template for every overdue reminder?",
    a: "When clients see the exact same boilerplate text multiple times, they develop 'template blindness.' They assume it's just an automated robot and ignore it. Gradually escalating your tone from friendly courtesy to formal demand shows that a real human is paying attention and creates natural urgency.",
  },
  {
    q: "What should I do if a client responds with a dispute during Stage 2 or 3?",
    a: "Immediately pause all payment reminders. Continuing to send overdue notices while a client is waiting for you to resolve a billing question damages trust. Address the dispute directly, separate any undisputed amount for immediate settlement, and resume follow-ups only after the issue is resolved.",
  },
  {
    q: "Can I charge interest or late fees on overdue invoices?",
    a: "Yes, but only if late fee terms were clearly stated in your original signed agreement or contract. In Stage 3 or 4 notices, you can remind clients of contractual late fee clauses to incentivize immediate remittance.",
  },
  {
    q: "When is it appropriate to pick up the phone instead of emailing?",
    a: "A quick phone call is often effective as early as Stage 2 (Day 10). A brief, friendly check-in with the primary stakeholder can uncover hidden bottlenecks that emails miss. By Stage 5 (30+ days), phone calls to executive leadership are mandatory.",
  },
  {
    q: "How many days should I wait between follow-up emails?",
    a: "As a rule of thumb, allow 5 to 7 days between early reminders (Days 1–14). Never send reminders daily, which looks desperate and triggers spam filters. For urgent later stages (Days 20+), 3 to 4 business days between notices is standard.",
  },
];

export function ToneEscalationPlaybook() {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCopy = (body: string, stageNum: number) => {
    navigator.clipboard.writeText(body);
    setCopiedId(stageNum);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#010102] text-[#f7f8f8] font-sans antialiased selection:bg-[#5e6ad2]/30 selection:text-white">
      <SEOHead
        title="Overdue Invoice 5-Stage Tone Escalation Playbook | Jaktra"
        description="Learn how to escalate overdue invoice email tone across 5 aging stages. Get word-for-word templates from friendly courtesy checks to formal final demands."
        canonicalPath="/resources/5-stage-ar-tone-escalation"
        jsonLd={[
          toneEscalationPlaybookSchema,
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Resources", path: "/resources" },
            { name: "Overdue Invoice Tone Escalation Guide", path: "/resources/5-stage-ar-tone-escalation" },
          ]),
        ]}
      />

      <GlobalNav />

      <main className="pt-20 sm:pt-24 pb-20 px-4 sm:px-6 max-w-4xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-zinc-400">
          <Link to="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <Link to="/resources" className="hover:text-white transition-colors">
            Resources
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-zinc-200">5-Stage AR Tone Escalation Guide</span>
        </nav>

        {/* Editorial Header */}
        <header className="mb-10 pb-8 border-b border-white/[0.08]">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#b7d2f8] font-semibold mb-3">
            <FileText className="w-3.5 h-3.5" />
            <span>Accounts Receivable Playbook</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight text-white mb-4 leading-tight">
            How to Escalate Overdue Invoice Tone: From Polite Reminders to Final Demand
          </h1>

          <p className="text-base sm:text-lg text-zinc-300 leading-relaxed mb-6 font-normal">
            If your polite payment reminder was ignored, repeating the exact same copy won&apos;t get you paid. Discover how to escalate communication urgency across 5 distinct aging stages—accelerating cash collection while preserving client goodwill.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400">
            <Link to="/about" className="flex items-center gap-1.5 text-zinc-300 hover:text-white transition-colors">
              <User className="w-3.5 h-3.5 text-[#b7d2f8]" />
              <span className="font-medium">By Suresh Jakhar &amp; Jaktra Research</span>
            </Link>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" /> Updated September 2026
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-zinc-400" /> 8 min read
            </span>
          </div>
        </header>

        {/* Article Body */}
        <article className="space-y-12 text-base leading-relaxed text-zinc-300">
          {/* Key Insight Callout */}
          <section className="p-6 rounded-2xl bg-[#0e0f12] border border-white/[0.08] space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Lightbulb className="w-4 h-4 text-[#b7d2f8]" />
              <span>The Psychology of Late Invoice Follow-Ups</span>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed">
              Most unpaid invoices aren&apos;t intentional fraud—they are administrative bottlenecks, cash timing constraints, or simple oversights. Going too aggressive too early damages client relationships. But staying overly timid for weeks leaves you at the bottom of their payment stack.
            </p>
            <p className="text-sm text-zinc-400 leading-relaxed">
              The solution is a structured <strong className="text-white">5-stage escalation cadence</strong>: start friendly and frictionless, introduce structured options, bring in operational leadership, and only transition to strict formal demands when deadlines are repeatedly missed.
            </p>
          </section>

          {/* Section 1: Quick Reference Summary Table */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              The 5-Stage Cadence at a Glance
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Use this timeline to determine which tone and communication approach fits your invoice&apos;s current aging status:
            </p>

            <div className="rounded-xl border border-white/[0.08] bg-[#0c0d10] overflow-hidden shadow-lg my-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[560px]">
                  <thead>
                    <tr className="border-b border-white/[0.08] bg-[#08080a]">
                      <th className="py-3.5 px-4 font-mono text-[11px] uppercase tracking-wider text-[#b7d2f8] font-semibold w-28">
                        Stage
                      </th>
                      <th className="py-3.5 px-4 font-mono text-[11px] uppercase tracking-wider text-[#b7d2f8] font-semibold w-40">
                        Timing
                      </th>
                      <th className="py-3.5 px-4 font-mono text-[11px] uppercase tracking-wider text-[#b7d2f8] font-semibold">
                        Tone &amp; Primary Stance
                      </th>
                      <th className="py-3.5 px-4 font-mono text-[11px] uppercase tracking-wider text-[#b7d2f8] font-semibold w-44">
                        Key Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {STAGES.map((s) => (
                      <tr key={s.stage} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-white whitespace-nowrap">
                          <span className={`inline-block px-2 py-0.5 rounded border text-[11px] font-mono ${s.badgeColor}`}>
                            Stage 0{s.stage}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-zinc-300 text-xs whitespace-nowrap">
                          {s.days}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-zinc-300 leading-relaxed">
                          {s.tone}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-zinc-400">
                          {s.stage === 1 && "Send invoice link & PDF"}
                          {s.stage === 2 && "Ask date & offer installments"}
                          {s.stage === 3 && "CC executive sponsor"}
                          {s.stage === 4 && "Set strict 4-day cutoff"}
                          {s.stage === 5 && "Direct phone call & credit hold"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Section 2: Detailed Stage-by-Stage Breakdown & Templates */}
          <section className="space-y-8 pt-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
                Detailed Stage Walkthrough &amp; Copyable Email Templates
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Copy, customize, and deploy these word-for-word email templates based on how many days your invoice is past due:
              </p>
            </div>

            {STAGES.map((stage) => (
              <div
                key={stage.stage}
                id={`stage-${stage.stage}`}
                className="p-6 sm:p-7 rounded-2xl bg-[#0c0d10] border border-white/[0.08] space-y-5 shadow-xl scroll-mt-20"
              >
                {/* Stage Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${stage.badgeColor}`}>
                        Stage 0{stage.stage}
                      </span>
                      <span className="text-xs font-mono text-zinc-400">{stage.days}</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                      {stage.title}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(`Subject: ${stage.subject}\n\n${stage.body}`, stage.stage)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-xs font-medium text-white transition-colors cursor-pointer self-start sm:self-auto"
                  >
                    {copiedId === stage.stage ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Copy Template</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Strategy Summary */}
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  {stage.summary}
                </p>

                {/* Pro Tip Box */}
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-2.5 text-xs text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-[#b7d2f8] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white font-medium mr-1">Best Practice:</strong>
                    {stage.tip}
                  </span>
                </div>

                {/* Clean Email Template Box */}
                <div className="rounded-xl border border-white/[0.08] bg-[#070709] overflow-hidden">
                  <div className="p-3 sm:p-3.5 bg-white/[0.02] border-b border-white/[0.06] text-xs">
                    <span className="text-zinc-500 font-mono mr-2">Subject:</span>
                    <span className="text-white font-medium">{stage.subject}</span>
                  </div>
                  <div className="p-4 sm:p-5 font-sans text-xs sm:text-sm text-zinc-200 whitespace-pre-line leading-relaxed">
                    {stage.body}
                  </div>
                </div>
              </div>
            ))}
          </section>

          {/* Section 3: 4 Cardinal Rules */}
          <section className="space-y-4 pt-4">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              4 Golden Rules of Commercial Payment Escalation
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Keep these foundational principles in mind to accelerate receivables without burning bridge relationships:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
              <div className="p-5 rounded-xl bg-[#0c0d10] border border-white/[0.08] space-y-2">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  <span>1. Never Assume Malicious Intent Early</span>
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Over 70% of invoices that are 1–7 days late stem from missing purchase order numbers, email spam filters, or approval bottlenecks. Treating clients with hostility early guarantees long-term friction.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-[#0c0d10] border border-white/[0.08] space-y-2">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span>2. Keep Reminders Spaced Out</span>
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Never blast reminders every single day. Allow a reasonable 5 to 7 business day cadence between initial touches. High-frequency daily emails annoy decision-makers and trigger corporate spam filters.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-[#0c0d10] border border-white/[0.08] space-y-2">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>3. Immediately Freeze on Inbound Disputes</span>
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  If a client replies stating that line items or billable hours are disputed, immediately pause all reminders. Sending an overdue notice while they are waiting for an explanation infuriates clients.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-[#0c0d10] border border-white/[0.08] space-y-2">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  <span>4. Use Concrete Dates, Not &quot;ASAP&quot;</span>
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Phrases like &quot;Please remit as soon as possible&quot; invite procrastination. State exact cutoff dates: &quot;Please submit payment by Friday, Oct 17, at 5:00 PM EST&quot; to prompt immediate action.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4: Frequently Asked Questions */}
          <section className="space-y-4 pt-4">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Common questions on escalating invoice collection communications professionally:
            </p>

            <div className="rounded-xl border border-white/[0.08] bg-[#0c0d10] p-5 sm:p-6 shadow-xl">
              <Accordion type="single" variant="outline" defaultValue="faq-0" collapsible className="w-full">
                {FAQS.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`}>
                    <AccordionTrigger className="text-left font-medium text-white hover:text-[#b7d2f8] cursor-pointer">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-zinc-300 leading-relaxed pt-2">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>

          {/* Section 5: Subtle, Clean Callout Banner */}
          <section className="p-6 sm:p-8 rounded-2xl bg-[#0e0f12] border border-white/[0.08] text-center space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Automate Payment Follow-Ups Without the Awkwardness
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
              Jaktra connects to your accounting system to handle friendly courtesy reminders and structured escalations automatically—freeing your finance team from chasing unpaid invoices.
            </p>
            <div className="pt-2">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-zinc-950 text-xs sm:text-sm font-semibold hover:bg-zinc-200 transition-colors shadow-md"
              >
                <span>Try Jaktra Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </section>
        </article>
      </main>

      <LandingFooter />
    </div>
  );
}

export default ToneEscalationPlaybook;

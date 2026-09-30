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
  FileText,
  Lightbulb,
  CheckCircle2,
} from "lucide-react";
import { SEOHead } from "@/seo/components/SEOHead";
import { dunningTemplatesSchema, breadcrumbSchema } from "@/seo/schemas";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { GlobalNav } from "@/components/common/GlobalNav";

interface TemplateItem {
  id: string;
  stageNum: number;
  stageCategory: string;
  title: string;
  timing: string;
  tone: string;
  badgeColor: string;
  tip: string;
  subject: string;
  body: string;
}

const TEMPLATES: TemplateItem[] = [
  {
    id: "template-1",
    stageNum: 1,
    stageCategory: "Pre-Due & Due Date",
    title: "Advance Courtesy & Invoice Verification",
    timing: "3 Days Before Due Date",
    tone: "Polite, helpful, and service-oriented",
    badgeColor: "bg-blue-500/10 text-blue-300 border-blue-500/20",
    tip: "Use this to verify they received the invoice and have all required PO/tax documentation before the payment run.",
    subject: "Upcoming: Invoice #{invoiceNumber} for {companyName} due on {dueDate}",
    body: `Hi {recipientName},

Hope you’re having a productive week!

This is a quick courtesy note to confirm that Invoice #{invoiceNumber} for {amount} is scheduled for payment on {dueDate}.

We’ve attached a copy of the invoice for your records. You can also review line items and complete payment directly via our secure portal:
{paymentLink}

If you require any supplemental billing documentation, vendor tax forms, or PO verification on our end, please let me know and I will gladly provide it.

Best regards,
{senderName}
Finance & Accounts Receivable, {senderCompany}`,
  },
  {
    id: "template-2",
    stageNum: 1,
    stageCategory: "Pre-Due & Due Date",
    title: "Due Date Accounts Payable Check-In",
    timing: "Due Date (Day 0)",
    tone: "Friendly administrative reminder",
    badgeColor: "bg-blue-500/10 text-blue-300 border-blue-500/20",
    tip: "Acknowledge that payment might already be queued in their weekly batch to keep tone light and respectful.",
    subject: "Invoice #{invoiceNumber} is due today — {senderCompany}",
    body: `Hi {recipientName},

We’re reaching out regarding Invoice #{invoiceNumber} ({amount}), which is due today, {dueDate}.

If payment is already scheduled in this week's accounts payable run, please disregard this note! Otherwise, your team can review the statement and settle payment in seconds via our direct portal:
{paymentLink}

Thank you for your ongoing partnership.

Warm regards,
{senderName}
{senderCompany} Accounting`,
  },
  {
    id: "template-3",
    stageNum: 2,
    stageCategory: "1–7 Days Overdue",
    title: "Friendly Post-Due Reminder",
    timing: "Days 1–4 Overdue",
    tone: "Collaborative, assumes accidental oversight",
    badgeColor: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
    tip: "Assume good intentions. Most invoices unpaid at this stage simply slipped past an approval queue.",
    subject: "Gentle reminder: Invoice #{invoiceNumber} past due ({companyName})",
    body: `Hi {recipientName},

We hope you're having a great week!

We noticed that we haven’t yet received payment for Invoice #{invoiceNumber} ({amount}), which was due on {dueDate}. We know how fast inboxes fill up, so we wanted to bring this to the top of your stack.

You can view the invoice details and complete payment directly here:
{paymentLink}

If payment has already been sent, or if you have any questions about this statement, please reply to let us know so we can update our records.

Best,
{senderName}
Accounts Receivable, {senderCompany}`,
  },
  {
    id: "template-4",
    stageNum: 2,
    stageCategory: "1–7 Days Overdue",
    title: "AP Troubleshooting & Resend",
    timing: "Days 4–7 Overdue",
    tone: "Helpful inquiry and troubleshooting",
    badgeColor: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
    tip: "Proactively ask if an internal paperwork issue or missing receipt is holding up payment.",
    subject: "Quick check-in regarding Invoice #{invoiceNumber} — {companyName}",
    body: `Hi {recipientName},

Following up on our earlier note regarding Invoice #{invoiceNumber} ({amount}), which was due on {dueDate}.

Sometimes invoices get misrouted or stuck in internal approval workflows. Does your team have everything required to approve this payment, or would it help to speak with our accounting desk?

You can review the invoice or pay directly using our secure link:
{paymentLink}

Thank you for helping us keep our accounts reconciled!

Warm regards,
{senderName}
{senderCompany} AR Team`,
  },
  {
    id: "template-5",
    stageNum: 3,
    stageCategory: "8–14 Days Overdue",
    title: "Structured Overdue Follow-Up",
    timing: "Days 8–10 Overdue",
    tone: "Direct, professional, action-oriented",
    badgeColor: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    tip: "Ask for an exact remittance date and mention that timely settlement ensures uninterrupted service.",
    subject: "Overdue Notice: Invoice #{invoiceNumber} ({amount}) — Action Required",
    body: `Dear {recipientName},

Our records indicate that Invoice #{invoiceNumber} for {amount} is now past due by more than one week (original due date: {dueDate}).

We have not received payment or a status update regarding this balance. Could you please confirm when the next AP check run or bank transfer is scheduled for this invoice?

Please submit payment today using our secure portal:
{paymentLink}

If there is a billing discrepancy, or if payment was remitted under a different reference number, please reply immediately so we can pause follow-ups and investigate.

Sincerely,
{senderName}
Credit & Collections, {senderCompany}`,
  },
  {
    id: "template-6",
    stageNum: 3,
    stageCategory: "8–14 Days Overdue",
    title: "Proactive Installment Plan Offer",
    timing: "Days 10–14 Overdue",
    tone: "Solution-oriented and flexible",
    badgeColor: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    tip: "Offering a 2x or 3x payment plan helps collect cash without forcing a client into an embarrassing financial corner.",
    subject: "Payment options for Invoice #{invoiceNumber} — {companyName}",
    body: `Dear {recipientName},

We are reaching out regarding Invoice #{invoiceNumber} ({amount}), which is now overdue.

We value our partnership and understand that cash timing can occasionally present unexpected challenges. If settling this full balance in one payment is difficult right now, we are happy to offer a structured installment plan:

You can split this balance into 2 or 3 automated weekly payments directly via our portal:
{paymentLink}

Selecting an installment plan keeps your account in good standing and pauses collection escalations. Please take a moment today to choose a schedule that works best for your team.

Best regards,
{senderName}
Finance Management, {senderCompany}`,
  },
  {
    id: "template-7",
    stageNum: 4,
    stageCategory: "15–30 Days Overdue",
    title: "Urgent Warning: Service Suspension Notice",
    timing: "Days 15–21 Overdue",
    tone: "Urgent, authoritative, service impact warning",
    badgeColor: "bg-orange-500/10 text-orange-300 border-orange-500/20",
    tip: "CC the primary executive sponsor or project contact so they are aware of the operational risk.",
    subject: "URGENT: Outstanding balance on Invoice #{invoiceNumber} — Risk of account hold",
    body: `Dear {recipientName},

This is an urgent communication regarding overdue Invoice #{invoiceNumber} in the amount of {amount}, which is now {daysOverdue} days past due.

Despite previous reminders, your account remains unsettled. Continued delay may result in a temporary hold on active services and deliverables within three (3) business days.

To avoid suspension of active services or revision of commercial credit terms, please clear this balance today:
{paymentLink}

If remittance has already been initiated, please reply with the bank wire confirmation number so we can mark your file.

Regards,
{senderName}
Financial Controller & Operations, {senderCompany}`,
  },
  {
    id: "template-8",
    stageNum: 4,
    stageCategory: "15–30 Days Overdue",
    title: "Executive Office Escalation Notice",
    timing: "Days 22–30 Overdue",
    tone: "Executive, formal, pre-escalation deadline",
    badgeColor: "bg-orange-500/10 text-orange-300 border-orange-500/20",
    tip: "Frame this as a notice from leadership, giving them a clear cutoff date before external escalation.",
    subject: "Notice of Impending Credit Hold: {companyName} — Invoice #{invoiceNumber}",
    body: `Dear {recipientName} and Executive Management,

Your account has been escalated to senior financial management regarding unpaid Invoice #{invoiceNumber} ({amount}), which is now three weeks delinquent.

We have made multiple attempts to resolve this balance amicably. Continued non-payment impacts our ability to provide active services and maintain open credit terms for your organization.

Please arrange immediate settlement via our payment portal:
{paymentLink}

Should payment not be received by Friday at 5:00 PM EST, we will be forced to pause account deliverables and initiate formal recovery procedures.

Yours faithfully,
{senderName}
Office of the CFO, {senderCompany}`,
  },
  {
    id: "template-9",
    stageNum: 5,
    stageCategory: "31+ Days Overdue",
    title: "Final Demand Notice Before External Collection",
    timing: "Days 31–35 Overdue",
    tone: "Formal demand, final resolution opportunity",
    badgeColor: "bg-rose-500/10 text-rose-300 border-rose-500/20",
    tip: "State an uncompromising 4- or 5-business-day deadline before third-party collection referral.",
    subject: "FINAL NOTICE: Invoice #{invoiceNumber} — Immediate settlement required",
    body: `FORMAL NOTICE OF DEFAULT

Dear {recipientName},

RE: INVOICE #{invoiceNumber} | BALANCE: {amount} | ORIGINAL DUE DATE: {dueDate}

This letter serves as our final formal demand for payment of the overdue invoice noted above. Your balance is now severely overdue, and prior correspondence has gone unanswered.

Unless full payment of {amount} is received within five (5) business days of this notice, we will escalate this file to external corporate recovery counsel and credit reporting agencies without further notification.

You may settle this obligation immediately via secure digital payment:
{paymentLink}

Please treat this notice with the urgency it requires.

Sincerely,
{senderName}
Legal & Financial Recovery, {senderCompany}`,
  },
  {
    id: "template-10",
    stageNum: 5,
    stageCategory: "31+ Days Overdue",
    title: "Pre-Litigation Advisory Notice",
    timing: "Day 35+ Overdue",
    tone: "Strict, pre-litigation formal advisory",
    badgeColor: "bg-rose-500/10 text-rose-300 border-rose-500/20",
    tip: "Final written warning confirming that all informal customer correspondence has closed.",
    subject: "PRE-LITIGATION NOTICE: Delinquent Account {companyName} — #{invoiceNumber}",
    body: `PRE-LITIGATION NOTICE

To: {recipientName}
Company: {companyName}
Invoice: #{invoiceNumber}
Principal Balance: {amount}

Take notice that {companyName} has defaulted on payment obligations for services rendered under Invoice #{invoiceNumber}.

This file has been queued for immediate transfer to third-party recovery counsel. Continued default may result in statutory collection proceedings to recover the principal balance plus applicable late payment interest and recovery costs.

To prevent formal legal filing, clear the balance immediately via our portal:
{paymentLink}

All further communications regarding this account must be conducted in writing.

Recovery Operations
{senderCompany}`,
  },
];

const FAQS = [
  {
    q: "Why shouldn't I use the exact same template for every reminder?",
    a: "When debtors receive the exact same boilerplate text repeatedly, they develop 'template blindness.' They assume it's just a robot and tune it out. Progressively escalating your tone from a friendly courtesy check to an executive notice demonstrates that real humans are monitoring the account and creates natural urgency.",
  },
  {
    q: "How many days should I wait between reminder emails?",
    a: "For initial reminders (Days 1–14), maintain a 5 to 7 business day cadence. Never email daily, which triggers spam filters and annoys decision-makers. For later overdue stages (Days 15+), follow up every 3 to 4 business days.",
  },
  {
    q: "What should I do if a client responds claiming an invoice dispute?",
    a: "Immediately pause all automated reminders. Sending past-due emails while a client is waiting for you to resolve a pricing or line-item question causes severe friction. Resolve the dispute directly, collect payment on the undisputed portion, and resume standard cadences only if needed.",
  },
  {
    q: "Should I offer an installment plan if a client can't pay in full?",
    a: "Yes. Invoices that reach 10–14 days overdue often stall due to short-term cash flow constraints. Proactively offering to split the balance into 2 or 3 weekly installments recovers working capital without damaging the commercial relationship.",
  },
  {
    q: "When is the right time to pick up the phone?",
    a: "A quick phone call is often effective as early as Day 10. A friendly 2-minute conversation with your project contact can uncover internal billing bottlenecks that emails miss. By Day 30+, executive phone calls are essential.",
  },
];

export default function DunningTemplatesResource() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredTemplates =
    activeFilter === "all"
      ? TEMPLATES
      : TEMPLATES.filter((t) => t.stageCategory === activeFilter);

  const categories = [
    { id: "all", label: "All 10 Templates" },
    { id: "Pre-Due & Due Date", label: "Pre-Due & Due Date (#1–2)" },
    { id: "1–7 Days Overdue", label: "1–7 Days Overdue (#3–4)" },
    { id: "8–14 Days Overdue", label: "8–14 Days Overdue (#5–6)" },
    { id: "15–30 Days Overdue", label: "15–30 Days Overdue (#7–8)" },
    { id: "31+ Days Overdue", label: "31+ Days Final Demands (#9–10)" },
  ];

  return (
    <div className="min-h-screen bg-[#010102] text-[#f7f8f8] font-sans antialiased selection:bg-[#5e6ad2]/30 selection:text-white">
      <SEOHead
        title="10 Overdue Invoice Payment Reminder Email Templates | Jaktra"
        description="10 proven payment reminder email templates for overdue B2B invoices. Follow up politely at Day 1, firmly at Day 14, and formally without harming trust."
        canonicalPath="/resources/b2b-dunning-email-templates"
        jsonLd={[
          dunningTemplatesSchema,
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Resources", path: "/resources" },
            { name: "Payment Reminder Email Templates", path: "/resources/b2b-dunning-email-templates" },
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
          <span className="text-zinc-200">Payment Reminder Email Templates</span>
        </nav>

        {/* Header */}
        <header className="mb-10 pb-8 border-b border-white/[0.08]">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#b7d2f8] font-semibold mb-3">
            <FileText className="w-3.5 h-3.5" />
            <span>Accounts Receivable Email Scripts</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight text-white mb-4 leading-tight">
            How to Follow Up on Unpaid Invoices: 10 Word-for-Word Reminder Templates
          </h1>

          <p className="text-base sm:text-lg text-zinc-300 leading-relaxed mb-6 font-normal">
            Stop stressing over how to ask clients for overdue payments. Use these 10 field-tested email templates—ranging from polite pre-due courtesy checks to firm final demands—designed to get invoices paid fast while protecting client goodwill.
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
              <Clock className="w-3.5 h-3.5 text-zinc-400" /> 10 min read
            </span>
          </div>
        </header>

        {/* Article Body */}
        <article className="space-y-12 text-base leading-relaxed text-zinc-300">
          {/* Introductory Insight */}
          <section className="p-6 rounded-2xl bg-[#0e0f12] border border-white/[0.08] space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Lightbulb className="w-4 h-4 text-[#b7d2f8]" />
              <span>How to Use These Templates</span>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed">
              Every template below contains standard bracket placeholders like <code className="text-[#b7d2f8] font-mono text-xs bg-white/[0.05] px-1.5 py-0.5 rounded">&#123;recipientName&#125;</code>, <code className="text-[#b7d2f8] font-mono text-xs bg-white/[0.05] px-1.5 py-0.5 rounded">&#123;invoiceNumber&#125;</code>, and <code className="text-[#b7d2f8] font-mono text-xs bg-white/[0.05] px-1.5 py-0.5 rounded">&#123;amount&#125;</code>.
            </p>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Match the template to how many days your invoice has been past due. Early on, always assume good intentions and verify invoice details. Only shift to strict deadlines after earlier notices receive no response.
            </p>
          </section>

          {/* Category Filter Pills */}
          <section className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    activeFilter === cat.id
                      ? "bg-white text-zinc-950 font-semibold shadow"
                      : "bg-[#0c0d10] text-zinc-400 border border-white/[0.08] hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </section>

          {/* 10 Email Templates Section */}
          <section className="space-y-8">
            {filteredTemplates.map((tmpl) => (
              <div
                key={tmpl.id}
                id={tmpl.id}
                className="p-6 sm:p-7 rounded-2xl bg-[#0c0d10] border border-white/[0.08] space-y-5 shadow-xl scroll-mt-20"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${tmpl.badgeColor}`}>
                        {tmpl.stageCategory}
                      </span>
                      <span className="text-xs font-mono text-zinc-400">{tmpl.timing}</span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                      {tmpl.title}
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(`Subject: ${tmpl.subject}\n\n${tmpl.body}`, tmpl.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-xs font-medium text-white transition-colors cursor-pointer self-start sm:self-auto"
                  >
                    {copiedId === tmpl.id ? (
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

                {/* Tone & Tip */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-zinc-400">
                  <div>
                    <span className="text-zinc-500 mr-1.5">Tone:</span>
                    <span className="text-zinc-200 font-medium">{tmpl.tone}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-2.5 text-xs text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-[#b7d2f8] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white font-medium mr-1">When to use:</strong>
                    {tmpl.tip}
                  </span>
                </div>

                {/* Email Box */}
                <div className="rounded-xl border border-white/[0.08] bg-[#070709] overflow-hidden">
                  <div className="p-3 sm:p-3.5 bg-white/[0.02] border-b border-white/[0.06] text-xs">
                    <span className="text-zinc-500 font-mono mr-2">Subject:</span>
                    <span className="text-white font-medium">{tmpl.subject}</span>
                  </div>
                  <div className="p-4 sm:p-5 font-sans text-xs sm:text-sm text-zinc-200 whitespace-pre-line leading-relaxed">
                    {tmpl.body}
                  </div>
                </div>
              </div>
            ))}
          </section>

          {/* 5 Best Practices for Writing Payment Reminders */}
          <section className="space-y-4 pt-4">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              5 Best Practices for B2B Payment Reminder Emails
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Follow these simple guidelines to increase payment collection rates and reduce back-and-forth emails:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
              <div className="p-5 rounded-xl bg-[#0c0d10] border border-white/[0.08] space-y-2">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  <span>1. Always Re-Attach the Invoice PDF</span>
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Never make their accounts team search for the original bill. Attaching the invoice PDF directly eliminates the most common excuse (&quot;We never received it&quot;).
                </p>
              </div>

              <div className="p-5 rounded-xl bg-[#0c0d10] border border-white/[0.08] space-y-2">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span>2. Provide a 1-Click Payment Link</span>
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Forcing clients to log into an old vendor portal with forgotten passwords causes 70%+ drop-off. Give them a direct, secure link to pay via card, ACH, or bank transfer in seconds.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-[#0c0d10] border border-white/[0.08] space-y-2">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>3. State Specific Cutoff Dates</span>
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Avoid vague words like &quot;ASAP&quot; or &quot;at your earliest convenience.&quot; Use concrete calendar dates: &quot;Please remit payment by Friday, October 17th at 5:00 PM.&quot;
                </p>
              </div>

              <div className="p-5 rounded-xl bg-[#0c0d10] border border-white/[0.08] space-y-2">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  <span>4. Pause Reminders on Disputes</span>
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  If the client questions a line item, pause all reminders immediately. Sending overdue notices while they wait for an answer makes you look careless and damages goodwill.
                </p>
              </div>
            </div>
          </section>

          {/* Frequently Asked Questions */}
          <section className="space-y-4 pt-4">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Common questions on optimizing B2B invoice collection correspondence:
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

          {/* Bottom Subtle Callout */}
          <section className="p-6 sm:p-8 rounded-2xl bg-[#0e0f12] border border-white/[0.08] text-center space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Automate Payment Follow-Ups with Jaktra
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
              Connect your accounting system in 15 minutes to automate friendly courtesy notes and structured payment reminders—without awkward manual follow-ups.
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

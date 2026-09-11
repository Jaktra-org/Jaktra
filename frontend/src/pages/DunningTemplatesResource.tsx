import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Copy, Check, Sparkles, ShieldAlert, Clock, CheckCircle2, Sliders, ExternalLink } from "lucide-react";
import jaktraLogo from "../assets/jaktra_svg.svg";
import { SEOHead } from "../components/common/SEOHead";
import { dunningTemplatesSchema, breadcrumbSchema } from "../components/common/seo-schemas";
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

interface TemplateItem {
  id: string;
  stageNum: number;
  stageName: string;
  timing: string;
  tone: string;
  badgeColor: string;
  title: string;
  subject: string;
  rawBody: string;
  aiPromptDirective: string;
}

const TEMPLATES: TemplateItem[] = [
  {
    id: "stage-1-courtesy",
    stageNum: 1,
    stageName: "Pre-Due & Due Date Courtesy",
    timing: "3 Days Before Due Date → Due Date",
    tone: "Polite, Helpful, Service-Oriented",
    badgeColor: "bg-white/[0.04] text-zinc-300 border-white/[0.08]",
    title: "1. Advance Courtesy & Invoice Verification",
    subject: "Upcoming: Invoice #{invoiceNumber} for {companyName} due on {dueDate}",
    rawBody: `Hi {recipientName},

Hope you’re having a productive week.

This is a quick courtesy note to confirm that Invoice #{invoiceNumber} for {amount} is scheduled for payment on {dueDate}.

We’ve attached a copy of the invoice for your records. You can also view line-item details or pay instantly via our secure one-click portal:
{paymentLink}

If you require any supplemental billing documentation, vendor tax forms, or PO verification, please let us know by replying directly to this email.

Best regards,
Finance & Accounts Receivable Team
{senderCompany}`,
    aiPromptDirective: `Act as a helpful accounts receivable assistant for {senderCompany}. The invoice #{invoiceNumber} ($ {amount}) is coming due in 3 days. Write a collaborative, courteous reminder. Emphasize verification of line items and PO information. Provide a direct one-click settlement link. Assume total good faith.`,
  },
  {
    id: "stage-1-ap-checkin",
    stageNum: 1,
    stageName: "Pre-Due & Due Date Courtesy",
    timing: "Due Date (Day 0)",
    tone: "Friendly Administrative Sync",
    badgeColor: "bg-white/[0.04] text-zinc-300 border-white/[0.08]",
    title: "2. Due Date Accounts Payable Check-In",
    subject: "Invoice #{invoiceNumber} is due today — {senderCompany}",
    rawBody: `Hi {recipientName},

We’re reaching out regarding Invoice #{invoiceNumber} ({amount}), which is due today, {dueDate}.

If payment is already scheduled in your weekly AP run, please disregard this note! Otherwise, your accounts team can review and settle in seconds using our zero-login portal:
{paymentLink}

Thank you for your ongoing partnership.

Warm regards,
{senderCompany} Accounting`,
    aiPromptDirective: `Draft a cheerful, zero-friction due date reminder for invoice #{invoiceNumber}. Acknowledge that the payment might already be queued in their weekly payment run. Include the zero-login portal link.`,
  },
  {
    id: "stage-2-polite-reminder",
    stageNum: 2,
    stageName: "Warm Reminder",
    timing: "Days 1–7 Overdue",
    tone: "Collaborative, Assumes Accidental Oversight",
    badgeColor: "bg-white/[0.04] text-zinc-300 border-white/[0.08]",
    title: "3. Friendly Post-Due Reminder",
    subject: "Gentle reminder: Invoice #{invoiceNumber} past due ({companyName})",
    rawBody: `Hi {recipientName},

We hope you're having a great week!

We noticed that we haven’t yet received payment for Invoice #{invoiceNumber} ({amount}), which was due on {dueDate}. We know how fast inboxes fill up, so we wanted to bring this to the top of your stack.

You can view the invoice details and complete payment directly here:
{paymentLink}

If payment has already been sent, or if you have any questions about this statement, please reply to let us know so we can update our records.

Best,
Accounts Receivable
{senderCompany}`,
    aiPromptDirective: `Compose a stage 2 reminder for an invoice that is 4 days overdue. Assume accidental oversight or an inbox backlog. Maintain a supportive commercial relationship while clearly highlighting the amount due and one-click payment URL.`,
  },
  {
    id: "stage-2-missing-details",
    stageNum: 2,
    stageName: "Warm Reminder",
    timing: "Days 4–7 Overdue",
    tone: "Helpful Inquiry & Troubleshooting",
    badgeColor: "bg-white/[0.04] text-zinc-300 border-white/[0.08]",
    title: "4. AP Troubleshooting & Resend",
    subject: "Quick check-in regarding Invoice #{invoiceNumber} — {companyName}",
    rawBody: `Hi {recipientName},

Following up on our earlier note regarding Invoice #{invoiceNumber} ({amount}) due on {dueDate}.

Sometimes invoices get misrouted or stuck in internal approval queues. Does your team have everything required to approve this payment, or would it help to speak with our accounting team?

Instant payment link:
{paymentLink}

Thank you for helping us keep our accounts reconciled!

Warm regards,
{senderCompany} AR Team`,
    aiPromptDirective: `Inquire proactively whether an internal approval bottleneck or missing paperwork is delaying payment. Keep tone warm and cooperative. Provide payment portal link.`,
  },
  {
    id: "stage-3-firm-notice",
    stageNum: 3,
    stageName: "Firm Notice",
    timing: "Days 8–14 Overdue",
    tone: "Direct, Professional, Action-Oriented",
    badgeColor: "bg-white/[0.06] text-zinc-200 border-white/[0.12]",
    title: "5. Structured Overdue Follow-Up",
    subject: "Overdue Notice: Invoice #{invoiceNumber} ({amount}) — Action Required",
    rawBody: `Dear {recipientName},

Our records indicate that Invoice #{invoiceNumber} for {amount} is now past due by more than one week (original due date: {dueDate}).

We have not received payment or a status update regarding this balance. Timely settlement ensures uninterrupted service and helps us maintain our current pricing commitments.

Please submit payment today using our secure portal:
{paymentLink}

If there is a billing discrepancy, or if payment was remitted under a different reference, please reply immediately so we can pause follow-ups and investigate.

Sincerely,
Credit & Collections Desk
{senderCompany}`,
    aiPromptDirective: `Draft a Stage 3 firm collection email. The invoice is 10 days overdue. Shift from casual check-in to clear, direct administrative accountability. Mention that uninterrupted service relies on timely settlement. Provide immediate digital settlement link and invite dispute explanation.`,
  },
  {
    id: "stage-3-payment-plan",
    stageNum: 3,
    stageName: "Firm Notice",
    timing: "Days 10–14 Overdue",
    tone: "Flexible & Solution-Oriented",
    badgeColor: "bg-white/[0.06] text-zinc-200 border-white/[0.12]",
    title: "6. Proactive Installment Plan Split Offer",
    subject: "Payment options for Invoice #{invoiceNumber} — {companyName}",
    rawBody: `Dear {recipientName},

We are reaching out regarding Invoice #{invoiceNumber} ({amount}), which is now overdue.

We value your partnership and understand that cash flow timing can occasionally present temporary challenges. If settling this full balance in one payment is currently difficult, we are pleased to offer a structured installment plan:

You can split this balance into 2, 3, or 4 automated milestone payments directly in your portal:
{paymentLink}

Selecting an installment plan keeps your account in full standing and pauses collection escalation. Please review your portal today to choose a schedule that works for your team.

Best regards,
Finance Management
{senderCompany}`,
    aiPromptDirective: `The debtor is 12 days overdue and has not paid. Offer a structured installment plan (2x, 3x, or 4x splits) via the tokenized debtor portal. Frame this as a cooperative working capital accommodation that maintains account goodwill.`,
  },
  {
    id: "stage-4-urgent",
    stageNum: 4,
    stageName: "Urgent Escalation",
    timing: "Days 15–30 Overdue",
    tone: "Urgent, Authoritative, Service Suspension Warning",
    badgeColor: "bg-[#b7d2f8]/10 text-[#b7d2f8] border-[#b7d2f8]/20",
    title: "7. Urgent Warning: Impending Service Suspension",
    subject: "URGENT: Outstanding balance on Invoice #{invoiceNumber} — Risk of account hold",
    rawBody: `Dear {recipientName},

This is an urgent communication regarding overdue Invoice #{invoiceNumber} in the amount of {amount}, now {daysOverdue} days past due.

Despite multiple previous notices, your account remains delinquent. As a result, your account has been placed on our finance escalation list and may be subject to a service pause within 3 business days if balance is not cleared.

To avoid suspension of your account services or credit terms, please settle this invoice immediately:
{paymentLink}

If you are experiencing extenuating circumstances or require finance management review, contact us today at billing@{senderCompanyLower}.com.

Regards,
Financial Controller & Operations
{senderCompany}`,
    aiPromptDirective: `Draft a Stage 4 urgent escalation email for an invoice that is 20 days overdue. Clearly state that continued delinquency risks service suspension within 3 business days. Tone must be authoritative, grave, and unambiguous while remaining professional. Provide direct portal link.`,
  },
  {
    id: "stage-4-cfo-escalation",
    stageNum: 4,
    stageName: "Urgent Escalation",
    timing: "Days 22–30 Overdue",
    tone: "Executive / Leadership Notice",
    badgeColor: "bg-[#b7d2f8]/10 text-[#b7d2f8] border-[#b7d2f8]/20",
    title: "8. Executive Office Escalation Notice",
    subject: "Notice of Impending Credit Hold: {companyName} — Invoice #{invoiceNumber}",
    rawBody: `Dear {recipientName},

Your account has been escalated to senior financial management regarding unpaid Invoice #{invoiceNumber} ({amount}), which is now over three weeks delinquent.

We have made multiple attempts to resolve this balance amicably. Continued non-payment impacts our ability to provide active services and maintain open credit terms for your organization.

Please arrange immediate settlement via our payment portal:
{paymentLink}

Should payment not be received by Friday at 5:00 PM, we will be forced to pause account deliverables and initiate formal recovery procedures.

Yours faithfully,
Office of the CFO
{senderCompany}`,
    aiPromptDirective: `Write an executive escalation letter from the Office of the CFO. The invoice is 25 days past due. Clearly state that formal credit hold and recovery procedures will be initiated unless settled by the end of the week.`,
  },
  {
    id: "stage-5-final-demand",
    stageNum: 5,
    stageName: "Final Demand / Legal Stop",
    timing: "Day 31+ Overdue",
    tone: "Formal, Legalistic, Final Opportunity",
    badgeColor: "bg-white/[0.12] text-white border-white/20",
    title: "9. Final Demand Notice Before External Collection",
    subject: "FINAL NOTICE: Invoice #{invoiceNumber} — Immediate settlement required",
    rawBody: `FORMAL NOTICE OF DEFAULT

Dear {recipientName},

RE: INVOICE #{invoiceNumber} | OUTSTANDING BALANCE: {amount} | ORIGINAL DUE DATE: {dueDate}

This letter serves as our final formal demand for payment of the aforementioned outstanding invoice. Your balance is now severely overdue, and prior correspondence has gone unanswered.

Unless full payment of {amount} is received within five (5) business days of this notice, we will escalate this matter to our external collections counsel and credit bureau reporting agencies without further notification.

You may satisfy this obligation immediately via secure digital payment:
{paymentLink}

Please treat this notice with the urgency it requires.

Sincerely,
Legal & Financial Recovery Department
{senderCompany}`,
    aiPromptDirective: `Stage 5 Final Formal Demand letter for invoice #{invoiceNumber} ($ {amount}). State clearly that this is the final opportunity to resolve the account before legal transfer. (Note: In Jaktra, automated outbound messages halt at Stage 5 to enforce compliance review).`,
  },
  {
    id: "stage-5-legal-counsel",
    stageNum: 5,
    stageName: "Final Demand / Legal Stop",
    timing: "Day 35+ Overdue",
    tone: "Pre-Litigation Statutory Warning",
    badgeColor: "bg-white/[0.12] text-white border-white/20",
    title: "10. Pre-Litigation Advisory Notice",
    subject: "PRE-LITIGATION NOTICE: Delinquent Account {companyName} — #{invoiceNumber}",
    rawBody: `PRE-LITIGATION NOTICE

To: {recipientName}
Company: {companyName}
Invoice: #{invoiceNumber}
Principal Balance: {amount}

Take notice that {companyName} has defaulted on payment obligations for services rendered under Invoice #{invoiceNumber}.

This file has been queued for immediate transfer to third-party recovery counsel. Continued default may result in legal proceedings to recover the principal balance plus statutory late payment interest and applicable legal costs.

To prevent formal legal filing, clear the balance immediately via our portal:
{paymentLink}

All further communications regarding this account must be in writing.

Recovery Operations
{senderCompany}`,
    aiPromptDirective: `Formal pre-litigation notice informing the debtor that the file is queued for third-party legal recovery unless settled immediately. Written in strict compliance with commercial debt collection standards.`,
  },
];

const FAQS = [
  {
    q: "Why do static dunning email templates stop working over time?",
    a: "Static email templates suffer from 'template blindness' and spam filter degradation. When a debtor receives three identical or boilerplate dunning emails with the exact same phrasing, they tune it out or mark it as junk. Modern email filters (Google Workspace, Microsoft 365) detect repetitive templated emails and divert them to the spam or promotional folder. Jaktra solves this by utilizing Groq LLaMA 3.1 inference to dynamically generate unique, context-aware emails tailored to aging, amount, and prior responsiveness.",
  },
  {
    q: "What is the optimal cadence frequency for B2B collection emails?",
    a: "The most effective B2B cadence follows an exponential timeline: a courtesy notice at Day -3, a reminder on Day 1, followed by touches on Day 7, Day 14, Day 21, and Day 30. Blasting emails every 2 days damages client goodwill and triggers mailer spam flags. Jaktra enforces an automated 20-Hour Idempotency Guard to guarantee no debtor receives multiple touches in less than 20 hours.",
  },
  {
    q: "What is the Stage 5 Legal Stop in accounts receivable automation?",
    a: "Once an invoice reaches 31+ days overdue (Stage 5), continuing to send automated generative AI follow-ups poses compliance risks under debt collection regulations and damages legal enforceability. Jaktra's Stage 5 Legal Stop automatically freezes automated communication, locks the audit trail, and escalates the file to human finance leadership for manual legal counsel review.",
  },
  {
    q: "Should I include a payment link directly in every dunning email?",
    a: "Yes, absolutely. Forcing a debtor to log in to an enterprise portal with a forgotten password or manually look up bank account wiring details adds immense friction. Jaktra embeds cryptographic, zero-login payment links (/i/:token) that allow debtors to view their invoice statement and pay instantly via Razorpay (UPI, NetBanking, Cards, or Virtual Bank Accounts) with zero login credentials required.",
  },
  {
    q: "How does Jaktra handle inbound replies to these dunning emails?",
    a: "Unlike static template tools that ignore incoming replies, Jaktra's DisputeAgent (ai-service/src/agents/dispute_agent.py) parses inbound debtor emails using NLP sentiment classification. If a client replies stating that goods were damaged or that an invoice line item was incorrect, Jaktra immediately tags the invoice as 'dispute', halts all automated dunning cadences, and alerts the finance team with a pre-drafted resolution response.",
  },
];

export default function DunningTemplatesResource() {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateItem>(TEMPLATES[0]);
  const [activeTab, setActiveTab] = useState<"template" | "aiPrompt">("template");
  const [copied, setCopied] = useState(false);

  // Customizer inputs
  const [recipientName, setRecipientName] = useState("Alex Morgan");
  const [companyName, setCompanyName] = useState("Vanguard Tech");
  const [invoiceNumber, setInvoiceNumber] = useState("INV-4092");
  const [amount, setAmount] = useState("$6,450.00");
  const [dueDate, setDueDate] = useState("October 15, 2026");
  const [senderCompany, setSenderCompany] = useState("Nexus Cloud");

  const resolvedSubject = selectedTemplate.subject
    .replace(/{invoiceNumber}/g, invoiceNumber)
    .replace(/{companyName}/g, companyName)
    .replace(/{dueDate}/g, dueDate)
    .replace(/{amount}/g, amount)
    .replace(/{recipientName}/g, recipientName)
    .replace(/{senderCompany}/g, senderCompany);

  const resolvedBody = selectedTemplate.rawBody
    .replace(/{invoiceNumber}/g, invoiceNumber)
    .replace(/{companyName}/g, companyName)
    .replace(/{dueDate}/g, dueDate)
    .replace(/{amount}/g, amount)
    .replace(/{recipientName}/g, recipientName)
    .replace(/{senderCompany}/g, senderCompany)
    .replace(/{senderCompanyLower}/g, senderCompany.toLowerCase().replace(/\s+/g, ""))
    .replace(/{paymentLink}/g, "https://jaktra.site/i/demo-token-xyz")
    .replace(/{daysOverdue}/g, "21");

  const resolvedAiPrompt = selectedTemplate.aiPromptDirective
    .replace(/{invoiceNumber}/g, invoiceNumber)
    .replace(/{amount}/g, amount)
    .replace(/{senderCompany}/g, senderCompany);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-zinc-100 font-sans selection:bg-[#b7d2f8]/20 selection:text-white">
      <SEOHead
        title="10 Overdue Invoice Payment Reminder Email Templates (From Polite to Final Demand) | Jaktra"
        description="10 word-for-word payment reminder email templates for overdue invoices. Learn how to follow up politely at Day 1, firmly at Day 14, and formally at Day 30 without damaging client relationships."
        canonicalPath="/resources/b2b-dunning-email-templates"
        jsonLd={[
          dunningTemplatesSchema,
          breadcrumbSchema([
            { name: "Resources", path: "/resources" },
            { name: "Payment Reminder Email Templates", path: "/resources/b2b-dunning-email-templates" },
          ]),
        ]}
      />

      <HeaderNav />

      <main className="pt-28 sm:pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(183,210,248,0.06),transparent)] pointer-events-none" />
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-zinc-500 mb-8 relative z-10" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-zinc-300 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/resources/how-to-reduce-dso" className="hover:text-zinc-300 transition-colors">Resources</Link>
          <span>/</span>
          <span className="text-zinc-300">Payment Reminder Email Templates</span>
        </nav>

        {/* Hero Section */}
        <header className="mb-20 sm:mb-24 text-center max-w-4xl mx-auto">
          <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-3">
            Accounts Receivable Follow-Up Guide &amp; Email Templates
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-6 leading-tight">
            How to Follow Up on Unpaid Invoices: 10 Word-for-Word Payment Reminder Templates
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
            Stop stressing over how to ask clients for overdue payments. Use these 10 field-tested email templates—ranging from friendly pre-due courtesy checks to formal final demand notices—designed to get invoices paid fast while preserving commercial relationships.
          </p>
        </header>

        {/* The Problem with Static Templates Callout */}
        <section className="mb-20 sm:mb-24 p-6 sm:p-8 rounded-2xl bg-[#111113] border border-white/[0.08]">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-white text-sm font-semibold mb-2 font-mono">
                <ShieldAlert className="w-4 h-4 text-[#b7d2f8]" />
                <span>Why Copy-Pasting the Same Reminder Template Fails</span>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed">
                When accounting teams blast the exact same boilerplate overdue reminder every week, debtors develop <strong className="text-zinc-200">template blindness</strong>. If your first two emails were ignored, repeating the identical copy won't work. Below, explore word-for-word scripts categorized by escalation tier—and see how autonomous AI can modulate tone and timing dynamically so you never have to copy-paste manually.
              </p>
            </div>
            <Link
              to="/features/5-stage-escalation"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-sm text-white font-medium transition-colors shrink-0"
            >
              <span>Explore Tone Engine</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Live Variable Customizer Bar */}
        <section className="mb-12 p-6 rounded-2xl bg-[#111113] border border-white/[0.08]">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-4">
            <Sliders className="w-3.5 h-3.5 text-[#b7d2f8]" />
            <span>Customize Template Preview Variables</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            <div>
              <label className="block text-zinc-500 mb-1">Recipient Name</label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full bg-black/40 border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-zinc-200 focus:outline-none focus:border-white/30"
              />
            </div>
            <div>
              <label className="block text-zinc-500 mb-1">Debtor Company</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-black/40 border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-zinc-200 focus:outline-none focus:border-white/30"
              />
            </div>
            <div>
              <label className="block text-zinc-500 mb-1">Invoice Number</label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full bg-black/40 border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-zinc-200 focus:outline-none focus:border-white/30"
              />
            </div>
            <div>
              <label className="block text-zinc-500 mb-1">Amount Due</label>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-black/40 border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-zinc-200 focus:outline-none focus:border-white/30"
              />
            </div>
            <div>
              <label className="block text-zinc-500 mb-1">Due Date</label>
              <input
                type="text"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-black/40 border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-zinc-200 focus:outline-none focus:border-white/30"
              />
            </div>
            <div>
              <label className="block text-zinc-500 mb-1">Your Company</label>
              <input
                type="text"
                value={senderCompany}
                onChange={(e) => setSenderCompany(e.target.value)}
                className="w-full bg-black/40 border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-zinc-200 focus:outline-none focus:border-white/30"
              />
            </div>
          </div>
        </section>

        {/* Interactive Template Selector & Viewer */}
        <section className="mb-20 sm:mb-24 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Template Navigation */}
          <div className="lg:col-span-5 space-y-2">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              Select Template by Escalation Stage
            </h2>
            <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
              {TEMPLATES.map((tmpl) => {
                const isSelected = tmpl.id === selectedTemplate.id;
                return (
                  <button
                    key={tmpl.id}
                    onClick={() => {
                      setSelectedTemplate(tmpl);
                      setCopied(false);
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                      isSelected
                        ? "bg-[#18181b] border-white/[0.2] shadow-lg shadow-black/40"
                        : "bg-[#111113] border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.02]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${tmpl.badgeColor}`}>
                        Stage {tmpl.stageNum}: {tmpl.stageName}
                      </span>
                      <span className="text-[11px] text-zinc-500 font-mono">{tmpl.timing}</span>
                    </div>
                    <div className="text-sm font-semibold text-white">{tmpl.title}</div>
                    <div className="text-xs text-zinc-400 truncate mt-1 font-mono">
                      {tmpl.subject.replace(/{invoiceNumber}/g, invoiceNumber)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Template Preview & Action Box */}
          <div className="lg:col-span-7 bg-[#111113] border border-white/[0.08] rounded-2xl p-6 sm:p-8 relative">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/[0.08] mb-5">
              <div>
                <span className={`text-xs font-mono px-2.5 py-0.5 rounded border ${selectedTemplate.badgeColor}`}>
                  Stage {selectedTemplate.stageNum} — {selectedTemplate.timing}
                </span>
                <h3 className="text-lg font-bold text-white mt-2">{selectedTemplate.title}</h3>
                <div className="text-xs text-zinc-400 mt-0.5">Tone: <span className="text-zinc-200">{selectedTemplate.tone}</span></div>
              </div>

              {/* Tab Switcher: Static vs AI Prompt Directive */}
              <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/[0.08]">
                <button
                  onClick={() => setActiveTab("template")}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    activeTab === "template" ? "bg-white text-zinc-950 shadow" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Email Copy
                </button>
                <button
                  onClick={() => setActiveTab("aiPrompt")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
                    activeTab === "aiPrompt" ? "bg-white text-zinc-950 shadow" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-[#b7d2f8]" />
                  <span>AI Prompt</span>
                </button>
              </div>
            </div>

            {activeTab === "template" ? (
              <div>
                {/* Subject Line Bar */}
                <div className="mb-4 bg-black/40 border border-white/[0.08] rounded-lg p-3">
                  <div className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1">Subject Line</div>
                  <div className="text-sm font-mono text-zinc-200 select-all">{resolvedSubject}</div>
                </div>

                {/* Email Body */}
                <div className="mb-6 bg-black/40 border border-white/[0.08] rounded-lg p-4 font-mono text-xs sm:text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed select-all">
                  {resolvedBody}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between gap-4 pt-2 border-t border-white/[0.08]">
                  <div className="text-xs text-zinc-500">
                    One-click payment links use <code className="text-zinc-400">/i/:token</code> zero-login URLs.
                  </div>
                  <button
                    onClick={() => handleCopy(`Subject: ${resolvedSubject}\n\n${resolvedBody}`)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-zinc-950 font-semibold text-xs sm:text-sm hover:bg-zinc-200 transition-colors shadow-sm"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-[#b7d2f8]" />
                        <span>Copied to Clipboard</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Full Email</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-4 text-xs text-zinc-400 leading-relaxed">
                  Below is the system prompt directive injected into <strong className="text-white">Groq LLaMA 3.1</strong>. Jaktra replaces static templates with dynamic generative modulation, synthesizing invoice age, payment history, and dispute status.
                </div>
                <div className="mb-6 bg-black/40 border border-white/[0.08] rounded-lg p-4 font-mono text-xs sm:text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed select-all">
                  {resolvedAiPrompt}
                </div>
                <div className="flex items-center justify-between gap-4 pt-2 border-t border-white/[0.08]">
                  <div className="text-xs text-zinc-500">
                    Groq LLaMA 3.1 8B inference runs in &lt;300ms per generated notice.
                  </div>
                  <button
                    onClick={() => handleCopy(resolvedAiPrompt)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-zinc-950 font-semibold text-xs sm:text-sm hover:bg-zinc-200 transition-colors shadow-sm"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-[#b7d2f8]" />
                        <span>Copied Prompt</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy AI Prompt</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 5-Stage AR Escalation Architecture Overview */}
        <section className="mb-20 sm:mb-24">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              The 5-Stage Tone Escalation Architecture
            </h2>
            <p className="text-sm text-zinc-400">
              How Jaktra balances maximum cash acceleration with long-term customer goodwill across aging milestones.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="p-5 rounded-xl bg-[#111113] border border-white/[0.08]">
              <div className="text-xs font-bold text-white font-mono mb-1">Stage 1</div>
              <div className="text-sm font-semibold text-white mb-1">Collaborative Courtesy</div>
              <div className="text-xs text-zinc-500 mb-2 font-mono">Days 0–7 Overdue</div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Assumes accidental oversight. Verifies PO receipt and provides instant one-click payment portal links.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#111113] border border-white/[0.08]">
              <div className="text-xs font-bold text-white font-mono mb-1">Stage 2</div>
              <div className="text-sm font-semibold text-white mb-1">Administrative Sync</div>
              <div className="text-xs text-zinc-500 mb-2 font-mono">Days 8–14 Overdue</div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Polite administrative check-in. Inquires if internal approval paperwork or routing assistance is needed.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#111113] border border-white/[0.08]">
              <div className="text-xs font-bold text-white font-mono mb-1">Stage 3</div>
              <div className="text-sm font-semibold text-white mb-1">Firm Notice &amp; Plans</div>
              <div className="text-xs text-zinc-500 mb-2 font-mono">Days 15–21 Overdue</div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Direct accountability. Offers self-serve installment plans (2x/3x/4x) to recover cash without confrontation.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#111113] border border-white/[0.08]">
              <div className="text-xs font-bold text-[#b7d2f8] font-mono mb-1">Stage 4</div>
              <div className="text-sm font-semibold text-white mb-1">Urgent Hold Warning</div>
              <div className="text-xs text-zinc-500 mb-2 font-mono">Days 22–30 Overdue</div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Authoritative executive notice. Clearly states that continued default risks credit hold or service pause.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#111113] border border-white/[0.08]">
              <div className="text-xs font-bold text-white font-mono mb-1">Stage 5</div>
              <div className="text-sm font-semibold text-white mb-1">Legal Stop &amp; Review</div>
              <div className="text-xs text-zinc-500 mb-2 font-mono">Day 31+ Overdue</div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Automation halts completely. The file is locked and routed to human counsel to protect legal enforceability.
              </p>
            </div>
          </div>
        </section>

        {/* 4 Deliverability Pillars */}
        <section className="mb-20 sm:mb-24 p-8 rounded-2xl bg-[#111113] border border-white/[0.08]">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
            Why High-Performance Dunning Requires Deliverability Infrastructure
          </h2>
          <p className="text-sm text-zinc-400 mb-8 max-w-2xl">
            Even the best dunning email copy is useless if it lands in spam. Jaktra couples AI tone modulation with bulletproof email infrastructure.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8]">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">20-Hour Rolling Idempotency</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Guarantees no debtor is contacted twice within 20 hours, preventing aggressive spamming complaints.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8]">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">Dead Letter Queue (DLQ)</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Catches delivery drops and retries on transient errors with exponential backoff schedules.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8]">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">3-Drop Circuit Breaker</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Halts outreach immediately if 3 consecutive emails bounce, protecting your corporate DKIM/SPF reputation.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8]">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">Automated Dispute Triage</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Inbound replies with billing queries automatically pause all cadences to prevent tone-deaf follow-ups.
              </p>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Frequently Asked Questions About B2B Dunning
            </h2>
            <p className="text-sm text-zinc-400">
              Everything finance and revenue leaders need to know about optimizing collection correspondence.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" variant="outline" defaultValue="faq-0" collapsible className="w-full">
              {FAQS.map((faq, idx) => (
                <AccordionItem key={idx} value={`faq-${idx}`}>
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

        {/* Bottom CTA */}
        <section className="p-8 sm:p-12 rounded-2xl bg-[#111113] border border-white/[0.08] text-center shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Automate These Email Cadences with AI in 15 Minutes
          </h2>
          <p className="text-sm text-zinc-400 max-w-xl mx-auto mb-8">
            Connect your billing system to Jaktra today. 100% free during Early Access with zero credit card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-200 transition-colors shadow-lg"
            >
              Get started free
            </Link>
            <Link
              to="/features/5-stage-escalation"
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white font-medium text-sm transition-colors flex items-center justify-center gap-2"
            >
              <span>See How Tone Engine Works</span>
              <ExternalLink className="w-4 h-4 text-zinc-400" />
            </Link>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}

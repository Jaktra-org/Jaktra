import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Copy,
  Check,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  PauseCircle,
  ExternalLink,
  ChevronRight,
  Scale,
} from "lucide-react";
import jaktraLogo from "../assets/jaktra_svg.svg";
import { SEOHead } from "../components/common/SEOHead";
import { invoiceDisputeTemplatesSchema, breadcrumbSchema } from "../components/common/seo-schemas";
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

interface DisputeTemplate {
  id: string;
  category: string;
  title: string;
  scenarioDescription: string;
  badgeColor: string;
  subject: string;
  rawBody: string;
  tacticalAdvice: string[];
  aiPromptDirective: string;
}

const TEMPLATES: DisputeTemplate[] = [
  {
    id: "billable-hours-dispute",
    category: "Billable Hours & Time Logs",
    title: "1. Client Questioning Billable Hours or Timesheets",
    scenarioDescription:
      "Use when a client emails stating that your logged hours exceed their expectations, questioning specific tasks, or asking for a time audit before paying.",
    badgeColor: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    subject: "Clarification & Timesheet Breakdown: Invoice #{invoiceNumber} — {senderCompany}",
    rawBody: `Hi {clientName},

Thank you for reaching out regarding Invoice #{invoiceNumber}. I appreciate you bringing your questions regarding the logged hours to our attention, and I want to ensure we give you complete clarity.

To make this completely transparent, I have attached our detailed time logs for this billing cycle, which include:
• Timestamped task descriptions and deliverables completed.
• Team member attribution for each milestone.
• Direct references to the project scope agreed upon on {agreementDate}.

Specifically, the {disputedHours} hours you noted were dedicated to {briefExplanationOfWork, e.g., resolving the unexpected database migration bottlenecks discussed in our sprint review}.

Could you review the attached log and let me know which specific line items or tasks look different than what you anticipated? If helpful, I am also happy to jump on a quick 10-minute call tomorrow at {suggestedTime} to walk through the log together.

In the meantime, we have placed automated reminders for this invoice on temporary hold so you won't receive any automated notices while we review this.

Best regards,
{senderName}
{senderTitle}
{senderCompany}`,
    tacticalAdvice: [
      "Acknowledge the dispute within 24 hours. Silence makes clients feel ignored and hardens their stance.",
      "Never offer an immediate discount right away. Offering a discount prematurely implies your initial billing was dishonest or arbitrary.",
      "Lead with objective, timestamped proof of work rather than defensive assertions.",
    ],
    aiPromptDirective:
      "Act as an empathetic AR specialist. The customer is questioning billable hours on invoice #{invoiceNumber}. Acknowledge their concern warmly, attach time audit logs, reference the original project agreement, invite a 10-minute sync, and reassure them that reminder cadences are paused.",
  },
  {
    id: "po-mismatch-dispute",
    category: "PO & Pricing Discrepancy",
    title: "2. Invoice Amount Doesn't Match Purchase Order (PO Mismatch)",
    scenarioDescription:
      "Use when Accounts Payable rejects an invoice because the total or unit pricing differs from their approved Purchase Order or contract price.",
    badgeColor: "bg-blue-500/10 text-blue-300 border-blue-500/20",
    subject: "PO Reconciliation: Invoice #{invoiceNumber} (PO #{poNumber}) — {senderCompany}",
    rawBody: `Hi {clientName},

Thank you for flagging the discrepancy between Invoice #{invoiceNumber} ({invoiceAmount}) and Purchase Order #{poNumber} ({poAmount}).

We reviewed our records alongside your AP team's notes:
1. Base contract items: Fully align with approved PO #{poNumber} totaling {poAmount}.
2. Additional line item: The additional {varianceAmount} reflects {reasonForVariance, e.g., expedited courier delivery requested on June 14th / additional software seats added on May 2nd}.

[Option A: If discrepancy was an internal billing error]
You are entirely correct. We have recalculated the statement to match PO #{poNumber} exactly. Please find attached credit memo #{creditMemoNumber} adjusting the balance to {correctedAmount}, alongside the revised invoice PDF.

[Option B: If the additional amount was authorized out-of-band]
Attached is the signed change request email from {stakeholderName} dated {authorizationDate} authorizing this addition. Could you please check if your procurement team can issue an amended PO, or advise whether we should split this into two separate invoices?

We have paused automated payment follow-ups on our side while you cross-reference this with your team.

Warm regards,
{senderName}
Accounts Receivable
{senderCompany}`,
    tacticalAdvice: [
      "Validate the PO numbers immediately. In large enterprises, 70% of payment holds are strictly procedural PO mismatches.",
      "If your billing department made a mistake, admit it cheerfully and issue a credit memo within hours.",
      "If the client's internal team authorized the extra spend without updating their procurement PO, provide the signed approval email to speed up PO amendment.",
    ],
    aiPromptDirective:
      "Reconcile an invoice vs PO price mismatch. Separate the base contract from the disputed delta. Offer either an instant credit adjustment or verified authorization records with options to split invoices.",
  },
  {
    id: "scope-creep-dispute",
    category: "Scope Creep & Change Orders",
    title: "3. Client Refusing to Pay Due to Scope Creep",
    scenarioDescription:
      "Use when a client claims work delivered was 'out of scope' or claims they were not informed that extra requests would incur additional fees.",
    badgeColor: "bg-purple-500/10 text-purple-300 border-purple-500/20",
    subject: "Regarding Invoice #{invoiceNumber} and Scope Details — {senderCompany}",
    rawBody: `Dear {clientName},

Thank you for your candid feedback regarding Invoice #{invoiceNumber}. We take your partnership seriously, and I want to make sure we resolve this openly and fairly.

When we began this phase of the engagement under the {contractName} agreement, our baseline deliverable was defined as {originalScopeDescription}.

During the project, your team requested {additionalFeaturesOrWork}, which required {additionalHoursOrResources}. We documented these additions in our project summary on {dateOfCommunication}.

That being said, I recognize that the distinction between our fixed-scope agreement and these additional requests may not have been highlighted as clearly as it should have been prior to billing.

To reach a fair resolution so we can continue our momentum:
• We are willing to issue a one-time courtesy adjustment of {discountOrCreditPercentage, e.g., 50%} on the additional scope line item ({adjustedAmount}).
• The core deliverables ({coreAmount}) remain due under our standard terms.

Could you let me know if this works for your team, so we can issue the revised statement and close out this phase? Automated reminders have been frozen while we align on this.

Best regards,
{senderName}
{senderTitle}
{senderCompany}`,
    tacticalAdvice: [
      "Distinguish between core contract value and disputed add-ons. Don't let an add-on dispute hold up 100% of payment.",
      "Take accountability for communication gaps without forfeiting legitimate work value.",
      "Offering a structured compromise on out-of-scope line items preserves the ongoing customer relationship.",
    ],
    aiPromptDirective:
      "Draft a constructive scope creep dispute response. Reference the original contract scope and the subsequent client requests. Propose a fair compromise on additional fees while securing prompt payment for core deliverables.",
  },
  {
    id: "quality-dissatisfaction-dispute",
    category: "Deliverable Quality / Dissatisfaction",
    title: "4. Client Disputing Invoice Due to Deliverable Dissatisfaction",
    scenarioDescription:
      "Use when a client claims the work delivered was incomplete, defective, or failed to meet their expected standards and is withholding payment.",
    badgeColor: "bg-red-500/10 text-red-300 border-red-500/20",
    subject: "Addressing your feedback on Invoice #{invoiceNumber} — {senderCompany}",
    rawBody: `Hi {clientName},

Thank you for sharing your feedback regarding the deliverables tied to Invoice #{invoiceNumber}. We pride ourselves on delivering top-tier work, and I am genuinely sorry to hear that the outcome did not meet your expectations.

We want to make this right immediately. To ensure we understand every nuance of what needs attention:
1. Could you list the specific items or criteria that fell short of the agreed specification?
2. Our team is prepared to dedicate {remedyHoursOrDays, e.g., 2 business days} at zero additional cost to refine and correct these deliverables to your complete satisfaction.

Because your satisfaction is our priority, we have suspended all automated payment reminders for Invoice #{invoiceNumber} until we have fully reviewed and resolved these items.

Can we schedule a 15-minute video call on {proposedDay} at {proposedTime} so our lead technical/project manager can review the corrections with you directly?

Thank you for your honesty, and we look forward to making this right.

Sincerely,
{senderName}
{senderTitle}
{senderCompany}`,
    tacticalAdvice: [
      "Do not get defensive. Focus immediately on remediation and corrective action.",
      "Demonstrate good faith by offering a dedicated revision sprint to meet the original contractual spec.",
      "Explicitly mention that payment collection is frozen during remediation so the client feels respected.",
    ],
    aiPromptDirective:
      "Address a client claiming poor deliverable quality. De-escalate tensions, offer zero-cost revision work to meet specifications, freeze payment notices, and request a collaborative alignment call.",
  },
  {
    id: "unauthorized-deduction-dispute",
    category: "Partial Payment & Deductions",
    title: "5. Client Made an Unauthorized Deduction on Payment",
    scenarioDescription:
      "Use when a client sends a partial payment and short-pays an invoice without prior explanation or formal credit agreement.",
    badgeColor: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    subject: "Payment Received: Reconciling Balance for Invoice #{invoiceNumber} — {senderCompany}",
    rawBody: `Hi {clientName},

We gratefully received your payment of {receivedAmount} applied toward Invoice #{invoiceNumber} on {paymentDate}. Thank you for processing that transfer.

While reconciling our ledger, our accounting team noticed an unpaid variance of {shortPaidAmount} against the invoiced total of {originalAmount}.

Could you clarify the reason for this deduction?
• If this was due to a credit memo, withholding tax certificate, or vendor fee we should record, please forward the corresponding documentation so we can balance your ledger account.
• If this was an unintended administrative omission, the remaining balance of {shortPaidAmount} can be settled conveniently via our direct payment portal:
{paymentLink}

We have held follow-up notices on this balance while we wait for your clarification.

Thank you for helping us keep your account records up to date!

Best regards,
{senderName}
Accounts Receivable Team
{senderCompany}`,
    tacticalAdvice: [
      "Start by thanking them for what they did pay. An aggressive tone on short payments often turns minor bookkeeping oversights into angry disputes.",
      "Give them the benefit of the doubt—it could be a withholding tax, bank wire fee deduction, or unreferenced credit.",
      "Provide a direct link to clear the remaining balance easily once verified.",
    ],
    aiPromptDirective:
      "Draft a friendly short-payment reconciliation email. Thank the client for the partial remittance, state the exact unpaid variance, request supporting credit documentation, and provide an instant link to settle.",
  },
];

const RESOLUTION_FRAMEWORK = [
  {
    step: "01",
    title: "Immediately Freeze Automated Reminders",
    description:
      "The #1 mistake businesses make is letting automated collection bots keep pinging a client who has already disputed an invoice. Continued automated dunning while a dispute is active feels hostile, insulting, and escalates to C-level complaints. Pause the sequence within seconds.",
    icon: PauseCircle,
  },
  {
    step: "02",
    title: "Audit the Paper Trail First",
    description:
      "Before typing an emotional response, gather your documentation: original signed contract, purchase orders, time-tracking logs, deliverable approval emails, and recorded meeting notes. Objective documentation resolves 90% of disputes.",
    icon: FileText,
  },
  {
    step: "03",
    title: "Send a Collaborative Acknowledgment within 24 Hours",
    description:
      "Never let a dispute linger unanswered over the weekend. Send an initial acknowledgment stating that you received their note, are investigating the details, and have frozen automated reminders in the interim.",
    icon: Clock,
  },
  {
    step: "04",
    title: "Separate Undisputed Amounts from the Contested Delta",
    description:
      "If a client disputes $800 of a $5,000 invoice, do not wait on the entire $5,000. Ask the client to release the undisputed $4,200 immediately while both parties work through the $800 discrepancy.",
    icon: Scale,
  },
  {
    step: "05",
    title: "Issue a Written Resolution & Resume Normal Terms",
    description:
      "Once an agreement is reached, memorialize it immediately in writing. Issue an adjusted statement or credit memo within 2 hours and provide a one-click payment link to finalize the settlement.",
    icon: CheckCircle2,
  },
];

const FAQS = [
  {
    q: "What should I do immediately when a client disputes an invoice?",
    a: "Immediately pause all automated payment reminder emails and collection outreach for that specific invoice. Sending an automated 'Your invoice is overdue' reminder to a customer who just emailed disputing a line item makes you look disorganized and damages the business relationship.",
  },
  {
    q: "How do I respond when a client claims my billable hours are too high?",
    a: "Respond with empathy and objective data. Do not offer an immediate discount, as this signals that your billing was arbitrary. Instead, share your itemized time logs, explain what technical or project challenges required the hours, and offer a short 10-minute sync to walk through the log together.",
  },
  {
    q: "Can a client withhold payment on the entire invoice if they only dispute one line item?",
    a: "Legally and practically, no. You should politely request that the client release payment for the undisputed portion immediately while you both work collaboratively to resolve the specific contested line item. This keeps cash flow moving and isolates the conflict.",
  },
  {
    q: "How does Jaktra automatically handle invoice disputes?",
    a: "When a customer replies to an invoice reminder email with concerns about pricing, hours, or purchase orders, Jaktra's NLP Dispute Triage Agent automatically detects the dispute, pauses the reminder sequence instantly, tags the issue in your dashboard, and pre-drafts a professional response citing your project contract or PO for your one-click approval.",
  },
  {
    q: "Should I offer a discount to settle a disputed invoice?",
    a: "Only as a final compromise when there were genuine communication ambiguities or scope misunderstandings. Always start by providing documentation (timesheets, signed approvals, delivery receipts). If a compromise is necessary, frame it as a 'one-time courtesy adjustment' to prevent setting a precedent for future invoices.",
  },
];

export default function InvoiceDisputeTemplatesResource() {
  const [selectedTemplate, setSelectedTemplate] = useState<DisputeTemplate>(TEMPLATES[0]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white font-sans antialiased selection:bg-white/20 selection:text-white">
      <SEOHead
        title="How to Respond to a Disputed Invoice: Free Response Email Templates & Resolution Guide"
        description="Learn how to respond when a client disputes an invoice. Free word-for-word email templates for billable hours pushback, PO mismatches, scope creep, and how AI dispute triage pauses automated dunning to protect client relationships."
        canonicalPath="/resources/invoice-dispute-response-templates"
        jsonLd={[
          invoiceDisputeTemplatesSchema,
          breadcrumbSchema([
            { name: "Resources", path: "/resources" },
            { name: "Invoice Dispute Response Templates", path: "/resources/invoice-dispute-response-templates" },
          ]),
        ]}
      />

      <HeaderNav />

      <main className="pt-24 pb-20 px-4 sm:px-6 max-w-6xl mx-auto">
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
          <span className="text-zinc-200">Invoice Dispute Response Templates</span>
        </nav>

        {/* Hero Section */}
        <header className="mb-14 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-medium text-amber-300 mb-6">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Operational Playbook & Response Library</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            How to Respond to a Disputed Invoice: Free Email Templates & Resolution Guide
          </h1>

          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed mb-6">
            When a client disputes an invoice, a defensive reaction can destroy a profitable relationship—while continuing to send automated payment reminders infuriates them. Here are 5 battle-tested, word-for-word response templates and a step-by-step resolution framework to protect your revenue and client goodwill.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-zinc-400" /> 8 min read
            </span>
            <span>•</span>
            <span>Updated September 2026</span>
            <span>•</span>
            <span className="text-emerald-400 font-medium">5 Ready-to-Copy Templates</span>
          </div>
        </header>

        {/* Cardinal Rule Alert */}
        <section className="mb-16 p-6 rounded-2xl bg-amber-500/[0.06] border border-amber-500/20 backdrop-blur-sm">
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 shrink-0 mt-0.5">
              <PauseCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-white mb-1">
                The Cardinal Rule: Pause Automated Collections the Second a Dispute Arrives
              </h2>
              <p className="text-sm text-zinc-300 leading-relaxed mb-3">
                The single biggest failure in automated accounts receivable is what finance professionals call the{" "}
                <strong className="text-white">“Dumb Dunning Trap”</strong>: A client replies disputing an invoice, and 48 hours later your automated software blindly sends an aggressive notice threatening late fees or collection agencies.
              </p>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Always freeze reminder sequences on disputed invoices immediately while investigating. Modern platforms like{" "}
                <Link to="/features/dispute-triage" className="text-amber-300 hover:underline">
                  Jaktra automatically detect dispute replies and halt cadences instantly
                </Link>
                .
              </p>
            </div>
          </div>
        </section>

        {/* Interactive Template Selector */}
        <section className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Word-for-Word Dispute Response Email Templates
            </h2>
            <p className="text-sm text-zinc-400">
              Select your specific dispute scenario below to get a tested, collaborative email response script ready to copy and send.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Template Scenario List */}
            <div className="lg:col-span-4 space-y-2.5">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-2 mb-2">
                Dispute Scenarios
              </p>
              {TEMPLATES.map((tmpl) => {
                const isSelected = selectedTemplate.id === tmpl.id;
                return (
                  <button
                    key={tmpl.id}
                    onClick={() => setSelectedTemplate(tmpl)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-150 flex flex-col gap-1.5 ${
                      isSelected
                        ? "bg-[#111113] border-white/20 text-white shadow-lg shadow-black/40 ring-1 ring-white/10"
                        : "bg-[#0a0a0b] hover:bg-[#111113]/60 border-white/[0.06] text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium tracking-wide uppercase px-2 py-0.5 rounded border text-zinc-300 bg-white/[0.04] border-white/[0.08]">
                        {tmpl.category}
                      </span>
                      {isSelected && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
                    </div>
                    <span className="text-sm font-semibold text-white leading-snug">
                      {tmpl.title}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Template Display Area */}
            <div className="lg:col-span-8 rounded-2xl bg-[#111113] border border-white/[0.08] p-6 sm:p-8 relative">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
                <div>
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Scenario Overview
                  </span>
                  <p className="text-sm text-zinc-300 mt-1">
                    {selectedTemplate.scenarioDescription}
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleCopy(
                      `Subject: ${selectedTemplate.subject}\n\n${selectedTemplate.rawBody}`,
                      selectedTemplate.id
                    )
                  }
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-semibold transition-colors shadow-sm shrink-0 self-start sm:self-auto"
                >
                  {copiedId === selectedTemplate.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Full Email</span>
                    </>
                  )}
                </button>
              </div>

              {/* Subject Line */}
              <div className="mt-6 p-3.5 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                <span className="text-xs font-semibold text-zinc-400 block mb-1">Subject Line:</span>
                <p className="text-sm font-mono text-zinc-200 select-all">
                  {selectedTemplate.subject}
                </p>
              </div>

              {/* Email Body */}
              <div className="mt-4 p-5 rounded-xl bg-black/40 border border-white/[0.04]">
                <span className="text-xs font-semibold text-zinc-400 block mb-2">Email Body:</span>
                <pre className="text-xs sm:text-sm font-mono text-zinc-300 whitespace-pre-wrap leading-relaxed select-all">
                  {selectedTemplate.rawBody}
                </pre>
              </div>

              {/* Tactical Advice & Jaktra Prompt Directive */}
              <div className="mt-6 pt-6 border-t border-white/[0.08] space-y-4">
                <div>
                  <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    Expert Negotiation Tips for this Dispute
                  </h3>
                  <ul className="space-y-1.5">
                    {selectedTemplate.tacticalAdvice.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-zinc-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-300 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>How Jaktra AI Generates This Automatically</span>
                  </div>
                  <p className="text-xs text-zinc-400 italic">
                    "{selectedTemplate.aiPromptDirective}"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5-Step Resolution Framework */}
        <section className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              The 5-Step Invoice Dispute Resolution Process
            </h2>
            <p className="text-sm text-zinc-400">
              A structured methodology followed by leading B2B controllers to resolve billing disputes without sacrificing cash flow or customer retention.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {RESOLUTION_FRAMEWORK.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className={`p-6 rounded-xl bg-[#111113] border border-white/[0.08] flex flex-col justify-between ${
                    idx === 0 ? "lg:col-span-1 border-amber-500/30 ring-1 ring-amber-500/10" : ""
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-mono font-bold text-zinc-400">
                        {item.step}
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-300">
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>
                    <h3 className="text-base font-semibold text-white mb-2">{item.title}</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              );
            })}

            {/* Final Summary Card */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-white/[0.05] to-transparent border border-white/[0.1] flex flex-col justify-center">
              <h3 className="text-base font-semibold text-white mb-2">Automate this with Jaktra</h3>
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                Instead of manually monitoring replies and coordinating timesheets, Jaktra’s NLP agent intercepts disputes, freezes dunning, and drafts verified responses automatically.
              </p>
              <Link
                to="/features/dispute-triage"
                className="inline-flex items-center gap-2 text-xs font-semibold text-white hover:text-zinc-200 transition-colors"
              >
                <span>Explore Dispute Triage Feature</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Traditional Tools vs Jaktra Comparison */}
        <section className="mb-20 p-8 rounded-2xl bg-[#111113] border border-white/[0.08]">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Why Traditional Collections Software Fails on Disputes
            </h2>
            <p className="text-sm text-zinc-400">
              Basic dunning tools are built like blind broadcast machines. Here is how Jaktra’s autonomous triage fundamentally differs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl bg-red-500/[0.04] border border-red-500/20">
              <div className="flex items-center gap-2 text-red-400 text-sm font-semibold mb-3">
                <AlertTriangle className="w-4 h-4" />
                <span>Traditional Dunning Software (Chaser, Upflow, QB)</span>
              </div>
              <ul className="space-y-3 text-xs text-zinc-300">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">✕</span>
                  <span>Ignores incoming email replies; treats disputes as non-responses.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">✕</span>
                  <span>Keeps blasting aggressive overdue reminders while the client is waiting for clarification.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">✕</span>
                  <span>Forces your finance manager to manually log in and click "Pause" for every single dispute.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">✕</span>
                  <span>Offers no AI drafting or contract cross-referencing capabilities.</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/20">
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold mb-3">
                <CheckCircle2 className="w-4 h-4" />
                <span>Jaktra Autonomous Dispute Triage</span>
              </div>
              <ul className="space-y-3 text-xs text-zinc-300">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>NLP catches dispute replies via webhook in sub-second time.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Instantly halts automated cadences, safeguarding the client relationship.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Classifies the dispute type (Hours, PO Mismatch, Scope, Quality) with confidence scoring.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Pre-drafts a polite, documented response ready for 1-click review and send.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Frequently Asked Questions About Invoice Disputes
            </h2>
            <p className="text-sm text-zinc-400">
              Clear answers to common questions about handling pushback and collecting disputed accounts receivable.
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
            Never Send an Embarrassing Reminder to a Disputed Client Again
          </h2>
          <p className="text-sm text-zinc-400 max-w-xl mx-auto mb-8">
            Connect Jaktra in 10 minutes. Automatically catch inbound disputes, pause collection emails in real-time, and resolve billing pushback with AI-drafted responses.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-200 transition-colors shadow-lg"
            >
              Start Free Early Access
            </Link>
            <Link
              to="/features/dispute-triage"
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white font-medium text-sm transition-colors flex items-center justify-center gap-2"
            >
              <span>See Interactive Dispute Demo</span>
              <ExternalLink className="w-4 h-4 text-zinc-400" />
            </Link>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}

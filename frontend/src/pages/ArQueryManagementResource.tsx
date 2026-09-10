import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Copy,
  Check,
  Sparkles,
  Inbox,
  Clock,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  CreditCard,
} from "lucide-react";
import jaktraLogo from "../assets/jaktra_svg.svg";
import { SEOHead } from "../components/common/SEOHead";
import { arQueryManagementSchema, breadcrumbSchema } from "../components/common/seo-schemas";
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

interface RoutineQueryTemplate {
  id: string;
  category: string;
  title: string;
  queryFrequency: string;
  description: string;
  subject: string;
  rawBody: string;
  bestPractices: string[];
  howJaktraAutomates: string;
}

const ROUTINE_TEMPLATES: RoutineQueryTemplate[] = [
  {
    id: "invoice-copy-request",
    category: "Document Request",
    title: "1. Customer Asking for Invoice PDF Copy / Resend",
    queryFrequency: "35% of all inbound billing inquiries",
    description:
      "When a debtor replies saying they misplaced the original invoice, need a new PDF copy for their AP queue, or say their accounting system purged the file.",
    subject: "Requested Copy: Invoice #{invoiceNumber} for {clientCompany} — {senderCompany}",
    rawBody: `Hi {clientName},

Thanks for reaching out!

As requested, attached is the official PDF copy of Invoice #{invoiceNumber} ({amount}) due on {dueDate}.

You can also review the line-item breakdown, download payment receipts, or pay directly via our secure zero-login portal link:
{paymentPortalLink}

Please let me know if your Accounts Payable team needs any additional purchase order details or vendor documentation to schedule this in your upcoming pay run.

Best regards,
{senderName}
Accounts Receivable Team
{senderCompany}`,
    bestPractices: [
      "Reply within 2 hours. Every day an AP clerk waits for an invoice copy pushes your payment back an entire weekly pay cycle.",
      "Always include both the direct PDF attachment and a self-serve portal link so they can settle with 1-click.",
      "Ask if they have everything needed to schedule payment so they don't hit another blocker next week.",
    ],
    howJaktraAutomates:
      "With Jaktra's 1-click zero-login debtor portal, every automated reminder includes a permanent tokenized link where customers download PDF invoices and statements self-service—eliminating 80% of these emails entirely.",
  },
  {
    id: "w9-tax-compliance-request",
    category: "Compliance & Onboarding",
    title: "2. Vendor Onboarding & W-9 / Tax Document Request",
    queryFrequency: "20% of inbound billing inquiries for new vendors",
    description:
      "When a corporate client's finance department withholds invoice processing until you submit an updated Form W-9, VAT/GST registration, or bank proof letter.",
    subject: "Vendor Documentation & Tax Forms: Invoice #{invoiceNumber} — {senderCompany}",
    rawBody: `Hi {clientName},

Thank you for the update. To assist your vendor onboarding and compliance team, please find attached our updated tax documentation:

• Form W-9 (Signed for {currentYear})
• Certificate of Incorporation / Tax Identification Proof
• Remittance & Banking Verification Letter

Our vendor master file details:
• Legal Entity Name: {legalCompanyName}
• EIN / Tax ID: {taxIdNumber}
• Remittance Email: {remittanceEmail}

Could you confirm receipt and let us know once your compliance team has cleared Invoice #{invoiceNumber} ({amount}) for payment scheduling?

We have temporarily paused follow-up reminder notices while your team processes this paperwork.

Warm regards,
{senderName}
Finance Department
{senderCompany}`,
    bestPractices: [
      "Keep pre-signed, watermarked W-9 and tax certificates in your quick-access templates.",
      "State your exact legal entity name and EIN in the email body so AP clerks don't even have to open the PDF to input it into their ERP.",
      "Polite reminder pause: explicitly state that reminders are on hold while they review compliance documents.",
    ],
    howJaktraAutomates:
      "Jaktra's NLP agent classifies compliance and vendor onboarding questions, attaches your pre-configured tax pack automatically, and snoozes the overdue collection cadence until the review date.",
  },
  {
    id: "bank-wire-ach-confirmation",
    category: "Payment Logistics",
    title: "3. Bank Wire / ACH Routing Confirmation Request",
    queryFrequency: "15% of all inbound billing inquiries",
    description:
      "When a client is ready to release payment via EFT, ACH, or international wire and requests verified bank routing details to prevent wire fraud.",
    subject: "Verified Banking & Wire Details: Invoice #{invoiceNumber} — {senderCompany}",
    rawBody: `Hi {clientName},

Thank you for preparing the transfer for Invoice #{invoiceNumber} ({amount}).

For your security and to prevent wire fraud, our verified remittance instructions are as follows:

• Account Name: {bankAccountName}
• Bank Name: {bankName}
• ACH Routing Number (ABA): {achRoutingNumber}
• Account Number: {bankAccountNumber}
• SWIFT / BIC (for international wires): {swiftBicCode}
• Reference / Memo: Invoice #{invoiceNumber}

Alternatively, you can settle instantly via ACH or corporate credit card through our encrypted payment gateway:
{paymentPortalLink}

Once the transfer has been initiated, could you please send a quick copy of the remittance advice so our treasury team can reconcile your ledger balance immediately?

Thank you for your partnership!

Best regards,
{senderName}
Accounts Receivable
{senderCompany}`,
    bestPractices: [
      "Wire Fraud Awareness: Encourage clients to verify payment details against their original vendor agreement to ensure security.",
      "Include a direct reference requirement (e.g. 'Invoice #1042') so their bank transfer isn't deposited into an unallocated suspense account.",
      "Offer self-service digital settlement alongside manual wire instructions.",
    ],
    howJaktraAutomates:
      "Jaktra integrates with payment processors like Razorpay and Stripe to offer tokenized, 1-click bank transfer and card settlement directly on the debtor's payment portal page.",
  },
  {
    id: "installment-plan-request",
    category: "Payment Flexibility",
    title: "4. Client Requesting Split Payments or Due Date Extension",
    queryFrequency: "15% of overdue account replies",
    description:
      "When a debtor is experiencing cash flow constraints and proactively replies asking to split an overdue balance into installments or delay due date.",
    subject: "Payment Arrangement Options for Invoice #{invoiceNumber} — {senderCompany}",
    rawBody: `Hi {clientName},

Thank you for reaching out transparently about your cash flow timing. We truly appreciate you contacting us proactively rather than letting the invoice go unaddressed.

We value our ongoing relationship and are happy to support your team with a structured installment plan:

Option: 2-Part Milestone Settlement
• Installment 1: {firstPaymentAmount} (50%) due by {firstPaymentDate}
• Installment 2: {secondPaymentAmount} (50%) due by {secondPaymentDate}

You can confirm this plan and set up the first milestone payment directly through our automated portal:
{installmentSetupLink}

Once Installment 1 is initiated, all automated past-due notices will be snoozed, and reminders will only trigger 3 days prior to Installment 2.

Does this schedule align with your cash flow forecast? Let me know and we will lock this in on your account ledger.

Best regards,
{senderName}
Finance Director
{senderCompany}`,
    bestPractices: [
      "Always respond with gratitude when a client is proactive about cash flow struggles. It indicates high willingness to pay.",
      "Require a meaningful initial deposit (typically 30% to 50%) to establish commitment.",
      "Lock in exact calendar dates for subsequent installments rather than vague terms like 'next month'.",
    ],
    howJaktraAutomates:
      "Jaktra has built-in automated installment schedule creation. Clients can view split milestones, schedule automated ACH debits, and pause collection cadences between milestones automatically.",
  },
  {
    id: "remittance-advice-check",
    category: "Reconciliation",
    title: "5. Remittance Advice & Payment Status Confirmation",
    queryFrequency: "15% of payment-related emails",
    description:
      "When a debtor says 'We sent the payment yesterday, can you confirm receipt and stop sending reminders?'",
    subject: "Payment Confirmation Status: Invoice #{invoiceNumber} — {senderCompany}",
    rawBody: `Hi {clientName},

Thank you for letting us know that payment for Invoice #{invoiceNumber} ({amount}) has been initiated!

Our finance desk reconciles incoming bank settlements daily at 4:00 PM EST. Bank wires and ACH transfers typically take 1 to 2 business days to clear interbank settlement.

To ensure your account is protected:
1. We have immediately snoozed all automated collection reminders for 72 hours while funds settle.
2. If you have the bank confirmation or remittance advice PDF handy, feel free to reply with it attached so we can mark your ledger account as 'Payment Pending Verification'.

We will send an automated receipt confirmation the moment the deposit clears our account.

Thank you again for your prompt handling!

Best regards,
{senderName}
Credit & Collections Desk
{senderCompany}`,
    bestPractices: [
      "Snooze reminders immediately! Nothing frustrates an AP clerk more than receiving an automated overdue notice 6 hours after they executed the wire transfer.",
      "Clarify bank settlement timelines (1-3 business days) so they understand why the receipt isn't instantaneous.",
      "Commit to sending an official receipt upon settlement.",
    ],
    howJaktraAutomates:
      "When Jaktra's AI identifies a payment promise or remittance confirmation in an inbound email, it automatically snoozes reminders for that invoice for 72 hours, preventing unwanted dunning notices while funds clear.",
  },
];

const SHARED_INBOX_COMPARISON = [
  {
    feature: "Automatic Inbound Reply Triage",
    sharedOutlook: "None (Manual folder sorting by humans)",
    generalHelpdesk: "Basic keyword filters (creates generic tickets)",
    jaktra: "NLP extracts invoice number, sentiment, and categorizes queries in < 1 sec",
  },
  {
    feature: "Cadence Snoozing During Inquiries",
    sharedOutlook: "Impossible (Reminders keep sending unless manually stopped)",
    generalHelpdesk: "No integration with AR collection cadences",
    jaktra: "Instantly freezes automated reminder emails on that specific invoice",
  },
  {
    feature: "Self-Service Debtor Portal",
    sharedOutlook: "None (Team must manually email PDFs every time)",
    generalHelpdesk: "Requires client login and password credentials",
    jaktra: "1-Click tokenized zero-login portal for instant PDF download and payment",
  },
  {
    feature: "ERP & Accounting Ledger Sync",
    sharedOutlook: "Manual double entry into QuickBooks/NetSuite",
    generalHelpdesk: "Requires complex, brittle Zapier webhooks",
    jaktra: "Direct two-way invoice synchronization with payment reconciliation",
  },
  {
    feature: "AI Pre-Drafted Responses",
    sharedOutlook: "None (Copy-pasting from static Word docs)",
    generalHelpdesk: "Static canned macros without financial context",
    jaktra: "Context-aware drafts citing exact POs, contracts, and tax documents",
  },
];

const FAQS = [
  {
    q: "Why do routine billing queries delay payments so significantly?",
    a: "Corporate Accounts Payable departments operate on strict weekly or bi-weekly payment runs. If an AP specialist asks for an invoice PDF or W-9 and waits 48 hours for your team to reply, that invoice misses their current pay run cutoff and is delayed by an entire 1 to 2 weeks.",
  },
  {
    q: "How should a finance team organize a shared accounts receivable mailbox?",
    a: "Standardize naming conventions, create categorized subfolders (Disputes, Tax/W-9, Payment Promises, Remittance), and establish a strict rule: every customer inquiry must be acknowledged within 4 hours. Better yet, deploy an AR query management platform like Jaktra that categorizes inquiries and pauses collection cadences automatically.",
  },
  {
    q: "Why shouldn't we just use Zendesk or Freshdesk for billing emails?",
    a: "General-purpose helpdesks are designed for customer support tickets, not financial receivables. They assign sterile ticket numbers (e.g. 'Ticket #49201') that look impersonal, lack native ledger synchronization, cannot pause dunning email sequences, and don't provide encrypted payment settlement links.",
  },
  {
    q: "How does Jaktra eliminate repetitive invoice copy requests?",
    a: "Every email sent by Jaktra includes a secure, tokenized zero-login payment link. Clients can click the link from any device to view line-item breakdowns, download official PDF invoices, and review payment history without needing a username or password.",
  },
  {
    q: "What happens when a client replies with a question about their invoice?",
    a: "Jaktra's NLP agent catches the reply via webhook, classifies it as an inquiry (e.g., vendor onboarding, tax form request, bank wire details), puts the overdue reminder cadence on temporary hold, and pre-drafts a response with the required documents attached for your 1-click approval.",
  },
];

export default function ArQueryManagementResource() {
  const [selectedTemplate, setSelectedTemplate] = useState<RoutineQueryTemplate>(ROUTINE_TEMPLATES[0]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white font-sans antialiased selection:bg-white/20 selection:text-white">
      <SEOHead
        title="How to Manage Accounts Receivable Inquiries & Billing Emails"
        description="A practical guide for finance teams on handling customer billing inquiries, managing shared accounts receivable mailboxes, responding to W-9 and invoice copy requests, and eliminating collection delays with zero-login debtor portals."
        canonicalPath="/resources/accounts-receivable-query-management"
        jsonLd={[
          arQueryManagementSchema,
          breadcrumbSchema([
            { name: "Resources", path: "/resources" },
            { name: "AR Query Management Guide", path: "/resources/accounts-receivable-query-management" },
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
          <span className="text-zinc-200">AR Query Management Guide</span>
        </nav>

        {/* Hero Section */}
        <header className="mb-14 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-medium text-emerald-300 mb-6">
            <Inbox className="w-3.5 h-3.5 text-emerald-400" />
            <span>Accounts Receivable Operations & Inbox Playbook</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            How to Manage Inbound Accounts Receivable Queries & Billing Emails
          </h1>

          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed mb-6">
            Over 40% of overdue B2B invoices aren't delayed by unwilling clients—they are stalled by clerical questions lost in shared billing inboxes. Here is how high-performing finance teams manage accounts receivable email volume, respond to routine inquiries in minutes, and cut Days Sales Outstanding (DSO).
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-zinc-400" /> 10 min read
            </span>
            <span>•</span>
            <span>Updated September 2026</span>
            <span>•</span>
            <span className="text-emerald-400 font-medium">5 Ready-to-Use Response Scripts</span>
          </div>
        </header>

        {/* Key Operational Insight Banner */}
        <section className="mb-16 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 rounded-xl bg-black/40 border border-white/[0.04]">
            <span className="text-2xl font-bold text-white block mb-1">42%</span>
            <span className="text-xs text-zinc-400">
              Of collection delays are caused by missing invoice copies, PO clarifications, or compliance W-9 requests.
            </span>
          </div>
          <div className="p-4 rounded-xl bg-black/40 border border-white/[0.04]">
            <span className="text-2xl font-bold text-emerald-400 block mb-1">&lt; 4 Hours</span>
            <span className="text-xs text-zinc-400">
              Target query response time to ensure invoices don't miss the client's current weekly payment batch.
            </span>
          </div>
          <div className="p-4 rounded-xl bg-black/40 border border-white/[0.04]">
            <span className="text-2xl font-bold text-blue-400 block mb-1">70%</span>
            <span className="text-xs text-zinc-400">
              Reduction in inbound inquiries achieved when customers are provided a 1-click self-service payment portal.
            </span>
          </div>
        </section>

        {/* Interactive Query Template Library */}
        <section className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Top 5 Routine Billing Inquiries & Ready-to-Use Email Templates
            </h2>
            <p className="text-sm text-zinc-400">
              Click on any inquiry type below to get a tested response script designed to answer questions immediately and accelerate settlement.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Sidebar Query Selector */}
            <div className="lg:col-span-4 space-y-2.5">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-2 mb-2">
                Routine AR Inquiries
              </p>
              {ROUTINE_TEMPLATES.map((tmpl) => {
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
                    <span className="text-[11px] text-zinc-400">{tmpl.queryFrequency}</span>
                  </button>
                );
              })}
            </div>

            {/* Template Display Box */}
            <div className="lg:col-span-8 rounded-2xl bg-[#111113] border border-white/[0.08] p-6 sm:p-8 relative">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
                <div>
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Inquiry Context
                  </span>
                  <p className="text-sm text-zinc-300 mt-1">
                    {selectedTemplate.description}
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
                      <span>Copied Script!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Email Template</span>
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
                <span className="text-xs font-semibold text-zinc-400 block mb-2">Email Response Body:</span>
                <pre className="text-xs sm:text-sm font-mono text-zinc-300 whitespace-pre-wrap leading-relaxed select-all">
                  {selectedTemplate.rawBody}
                </pre>
              </div>

              {/* Best Practices & Jaktra Automation */}
              <div className="mt-6 pt-6 border-t border-white/[0.08] space-y-4">
                <div>
                  <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    Best Practices for this Inquiry
                  </h3>
                  <ul className="space-y-1.5">
                    {selectedTemplate.bestPractices.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-zinc-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-lg bg-emerald-500/[0.04] border border-emerald-500/20">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>How Jaktra Eliminates this Manual Step</span>
                  </div>
                  <p className="text-xs text-zinc-300">
                    {selectedTemplate.howJaktraAutomates}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison: Shared Mailbox vs Helpdesk vs Jaktra */}
        <section className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Shared Mailbox vs IT Helpdesk vs Jaktra
            </h2>
            <p className="text-sm text-zinc-400">
              Why handling receivables in an Outlook shared mailbox or a generic Zendesk instance leads to uncollected cash.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#111113]">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                  <th className="p-4 font-semibold text-zinc-300">Capability</th>
                  <th className="p-4 font-semibold text-zinc-400">Shared Outlook/Gmail</th>
                  <th className="p-4 font-semibold text-zinc-400">General Helpdesk (Zendesk)</th>
                  <th className="p-4 font-semibold text-emerald-400 bg-emerald-500/[0.04]">Jaktra AR Platform</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-zinc-300">
                {SHARED_INBOX_COMPARISON.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.01]">
                    <td className="p-4 font-medium text-white">{row.feature}</td>
                    <td className="p-4 text-zinc-400">{row.sharedOutlook}</td>
                    <td className="p-4 text-zinc-400">{row.generalHelpdesk}</td>
                    <td className="p-4 font-medium text-emerald-300 bg-emerald-500/[0.02]">{row.jaktra}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Deep Dive: How Jaktra Powers Modern AR Query Management */}
        <section className="mb-20 p-8 rounded-2xl bg-[#111113] border border-white/[0.08]">
          <div className="max-w-2xl mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              How Jaktra Solves AR Query Management Automatically
            </h2>
            <p className="text-sm text-zinc-400">
              Transform your reactive receivables inbox into an automated cash collection engine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-300">
                <CreditCard className="w-4 h-4" />
              </div>
              <h3 className="text-base font-semibold text-white">1-Click Zero-Login Portal</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Eliminate 70% of "Can you resend the invoice?" emails. Every reminder links directly to a secure self-service portal where customers view invoices, download receipts, and pay in one click.
              </p>
              <Link to="/features/zero-login-portal" className="text-xs text-emerald-400 hover:underline inline-flex items-center gap-1">
                <span>Learn about Zero-Login Portal</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-300">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="text-base font-semibold text-white">Automated Cadence Snoozing</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                When a customer replies asking for a W-9 or wire routing info, Jaktra immediately snoozes upcoming reminder emails so you never spam an account while answering their clerical question.
              </p>
              <Link to="/features/dispute-triage" className="text-xs text-blue-400 hover:underline inline-flex items-center gap-1">
                <span>Explore Inbound Triage</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-300">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-base font-semibold text-white">AI-Assisted Suggested Drafts</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Rather than hunting through templates, Jaktra generates complete, context-aware email drafts with your remittance instructions, tax documents, or payment milestone agreements pre-attached.
              </p>
              <Link to="/features/5-stage-escalation" className="text-xs text-purple-400 hover:underline inline-flex items-center gap-1">
                <span>See Tone Engine</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Frequently Asked Questions About AR Query Management
            </h2>
            <p className="text-sm text-zinc-400">
              Clear answers to help your finance team structure inbound billing inquiries and prevent cash bottlenecks.
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
            Turn Your Billing Inbox into an Automated Cash Engine
          </h2>
          <p className="text-sm text-zinc-400 max-w-xl mx-auto mb-8">
            Connect Jaktra in 10 minutes. Give debtors instant zero-login portal access, catch inbound queries automatically, and eliminate collection friction.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-200 transition-colors shadow-lg"
            >
              Start Free Early Access
            </Link>
            <Link
              to="/features/zero-login-portal"
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white font-medium text-sm transition-colors flex items-center justify-center gap-2"
            >
              <span>Explore Zero-Login Portal</span>
              <ExternalLink className="w-4 h-4 text-zinc-400" />
            </Link>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}

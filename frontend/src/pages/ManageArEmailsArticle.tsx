import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Copy,
  Check,
  Clock,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Sparkles,
  User,
  Calendar,
} from "lucide-react";
import jaktraLogo from "../assets/jaktra_svg.svg";
import { SEOHead } from "../components/common/SEOHead";
import { manageArEmailsSchema, breadcrumbSchema } from "../components/common/seo-schemas";
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

const FAQS = [
  {
    q: "Why do routine billing inquiry emails delay payments so much?",
    a: "Most B2B companies run Accounts Payable in strict weekly or bi-weekly batches. If an AP specialist emails asking for an invoice PDF or W-9 and waits 48 hours for a reply, that invoice misses their current payment cycle cutoff, instantly pushing your cash collection back by 7 to 14 days.",
  },
  {
    q: "Can we use customer support ticketing software like Zendesk for AR emails?",
    a: "General customer service helpdesks work poorly for finance. They assign impersonal ticket numbers (e.g. 'Ticket #50921') to corporate buyers, have no live connection to your accounting ledger, cannot freeze collection reminder cadences during an inquiry, and lack integrated payment links.",
  },
  {
    q: "What is the best way to reduce the volume of inbound billing emails?",
    a: "Provide a 1-click self-service payment link with every automated reminder. When customers can click a secure link to view line-item details, download official PDF invoices, and access bank routing details without logging in, over 70% of routine inbound questions disappear.",
  },
  {
    q: "How does Jaktra handle inbound accounts receivable emails?",
    a: "Jaktra acts as an intelligent layer over your receivables. Inbound replies are parsed via NLP into questions, payment promises, or disputes. Reminders on that invoice are snoozed automatically while the inquiry is answered, and pre-drafted replies with requested documents are generated for your 1-click approval.",
  },
];

export default function ManageArEmailsArticle() {
  const [copiedScript, setCopiedScript] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedScript(id);
    setTimeout(() => setCopiedScript(null), 2000);
  };

  const invoiceCopyScript = `Subject: Requested Copy: Invoice #{invoiceNumber} for {clientCompany}

Hi {clientName},

Thanks for reaching out!

As requested, attached is the official PDF copy of Invoice #{invoiceNumber} ({amount}) due on {dueDate}.

You can also view line-item details, download payment receipts, or pay directly via our secure zero-login portal link:
{paymentPortalLink}

Please let me know if your Accounts Payable team needs any additional purchase order details or vendor documentation to schedule this in your upcoming pay run.

Best regards,
{senderName}
Finance & AR Team
{senderCompany}`;

  const w9Script = `Subject: Updated Vendor Tax Documents & W-9 — {senderCompany}

Hi {clientName},

Thank you for the update. To assist your vendor onboarding and compliance team, please find attached our updated tax documentation:

• Form W-9 (Signed for {currentYear})
• Certificate of Incorporation / Tax Identification Proof
• Verified Bank Remittance Letter

Our vendor master file details:
• Legal Entity: {legalCompanyName}
• EIN / Tax ID: {taxIdNumber}
• Remittance Email: {remittanceEmail}

Could you confirm receipt and let us know once your compliance team has cleared Invoice #{invoiceNumber} ({amount}) for payment scheduling?

We have temporarily paused follow-up reminder notices while your team processes this paperwork.

Warm regards,
{senderName}
Finance Department
{senderCompany}`;

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white font-sans antialiased selection:bg-white/20 selection:text-white">
      <SEOHead
        title="How to Manage Inbound Accounts Receivable Emails (Without the Inbox Chaos)"
        description="How high-efficiency finance teams handle customer billing inquiries, manage shared AR mailboxes, respond to W-9 and invoice copy requests in minutes, and cut Days Sales Outstanding."
        canonicalPath="/resources/how-to-manage-accounts-receivable-emails"
        jsonLd={[
          manageArEmailsSchema,
          breadcrumbSchema([
            { name: "Resources", path: "/resources" },
            { name: "How to Manage AR Emails", path: "/resources/how-to-manage-accounts-receivable-emails" },
          ]),
        ]}
      />

      <HeaderNav />

      <main className="pt-24 pb-20 px-4 sm:px-6 max-w-4xl mx-auto">
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
          <span className="text-zinc-200">How to Manage AR Emails</span>
        </nav>

        {/* Article Header */}
        <header className="mb-10 pb-8 border-b border-white/[0.08]">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            How to Manage Inbound Accounts Receivable Emails (Without the Inbox Chaos)
          </h1>

          <p className="text-lg sm:text-xl text-zinc-300 leading-relaxed mb-6 font-normal">
            Your `billing@` or `accounting@` inbox is overflowing with 150 unread messages: <em>"Can you resend invoice #1042?"</em>, <em>"We need an updated W-9"</em>, and <em>"What is your ACH routing number?"</em> Here is how high-performing finance teams organize incoming receivables emails and eliminate payment bottlenecks.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-zinc-400" /> Jaktra AR Operations Team
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" /> September 2026
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-zinc-400" /> 8 min read
            </span>
          </div>
        </header>

        {/* Article Body Content */}
        <article className="space-y-10 text-base leading-relaxed text-zinc-300">
          {/* Section 1: The Hidden Bottleneck */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              1. The Hidden Bottleneck: Why Inquiries Stall 40% of Receivables
            </h2>
            <p className="mb-4">
              Finance leaders often assume overdue invoices are caused by customers with cash flow problems. In reality, accounts receivable benchmarks reveal that over <strong>40% of overdue invoices are delayed simply because a routine clerical question got lost in an email thread</strong>.
            </p>
            <p className="mb-4">
              Corporate Accounts Payable (AP) departments operate on strict payment run schedules (usually every other Thursday). If an AP specialist asks for an invoice PDF on Tuesday morning and doesn't get a response until Thursday afternoon, that invoice misses the pay run cutoff. Your company just waited an extra two weeks for cash because a 2-minute email was answered too late.
            </p>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] text-sm text-zinc-300">
              <p className="font-semibold text-white mb-1">The 4-Hour Response Rule:</p>
              <p className="text-zinc-400">
                To keep invoices inside the client's active payment queue, routine administrative requests (W-9 forms, invoice PDF attachments, bank routing info) must be answered within 4 hours during business days.
              </p>
            </div>
          </section>

          {/* Section 2: Pitfalls of Shared Inboxes */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              2. Why Managing AR in a Shared Outlook/Gmail Box Breaks Down
            </h2>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#111113] border border-white/[0.08]">
                <h3 className="text-sm font-semibold text-white mb-1">Collision and Duplicate Outreach</h3>
                <p className="text-xs text-zinc-400">
                  Two different credit controllers open the same email thread and both reply to the client, looking disorganized and confusing the client's accounting department.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#111113] border border-white/[0.08]">
                <h3 className="text-sm font-semibold text-white mb-1">No Connection to Collection Cadences</h3>
                <p className="text-xs text-zinc-400">
                  When a client replies asking for an updated tax document, an Outlook inbox has no way to pause your scheduled dunning emails. Two days later, an automated bot yells at them for not paying, even though they were waiting on your paperwork.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#111113] border border-white/[0.08]">
                <h3 className="text-sm font-semibold text-white mb-1">No Real-Time Payment Links</h3>
                <p className="text-xs text-zinc-400">
                  Replying with a static PDF still requires the customer to manually log into their corporate banking portal to send a check or ACH. There is no direct 1-click settlement mechanism.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Word-for-Word Inquiry Templates */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              3. Ready-to-Use Scripts for the 2 Most Common Inbound Inquiries
            </h2>

            {/* Template 1: Invoice Copy */}
            <div className="mb-8 rounded-2xl bg-[#111113] border border-white/[0.08] p-6">
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/[0.08]">
                <div>
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">
                    Template: Responding to Invoice Copy Request
                  </span>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    For clients asking to resend an invoice PDF for their AP payment queue.
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(invoiceCopyScript, "invoiceCopy")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-zinc-950 text-xs font-semibold hover:bg-zinc-200 transition-colors"
                >
                  {copiedScript === "invoiceCopy" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Script</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="text-xs sm:text-sm font-mono text-zinc-300 whitespace-pre-wrap leading-relaxed select-all bg-black/40 p-4 rounded-xl border border-white/[0.04]">
                {invoiceCopyScript}
              </pre>
            </div>

            {/* Template 2: W-9 / Tax Request */}
            <div className="rounded-2xl bg-[#111113] border border-white/[0.08] p-6">
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/[0.08]">
                <div>
                  <span className="text-xs font-semibold text-blue-400 uppercase tracking-wide">
                    Template: Vendor Onboarding & W-9 Compliance Request
                  </span>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    For corporate procurement teams requesting tax forms and banking letters.
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(w9Script, "w9Script")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-zinc-950 text-xs font-semibold hover:bg-zinc-200 transition-colors"
                >
                  {copiedScript === "w9Script" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Script</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="text-xs sm:text-sm font-mono text-zinc-300 whitespace-pre-wrap leading-relaxed select-all bg-black/40 p-4 rounded-xl border border-white/[0.04]">
                {w9Script}
              </pre>
            </div>
          </section>

          {/* Section 4: The Modern Solution Bridge (Jaktra) */}
          <section className="p-8 rounded-2xl bg-gradient-to-b from-white/[0.04] to-transparent border border-white/[0.08] relative overflow-hidden">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-medium text-blue-300 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>The Modern Automation Standard</span>
            </div>

            <h2 className="text-2xl font-bold text-white mb-3">
              How Modern Finance Teams Eliminate Inbound Email Chaos
            </h2>

            <p className="text-sm text-zinc-300 leading-relaxed mb-4">
              Responding to 20 emails a day asking for PDF attachments or bank wire details is low-value clerical work that burns out finance teams and keeps DSO high.
            </p>

            <p className="text-sm text-zinc-300 leading-relaxed mb-6">
              The modern answer is to shift from <strong>reactive email handling</strong> to <strong>proactive self-service</strong>.
            </p>

            <div className="p-5 rounded-xl bg-black/40 border border-white/[0.06] mb-6">
              <h3 className="text-sm font-semibold text-white mb-2">
                How Jaktra Solves AR Query Management:
              </h3>
              <ul className="space-y-2.5 text-xs text-zinc-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">1-Click Zero-Login Portal:</strong> Every reminder email includes a secure link where clients view invoices, download receipts, and pay in one click without a password—eliminating 70% of inbound emails before they happen.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Automated Cadence Snoozing:</strong> When a client replies with a clerical question, Jaktra immediately snoozes upcoming overdue reminders so they are never spammed while waiting on answers.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">AI-Drafted Fulfillment:</strong> Generates context-aware responses with tax documents, bank wiring info, or split payment agreements pre-attached.
                  </span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-white text-zinc-950 font-semibold text-xs hover:bg-zinc-200 transition-colors shadow-sm text-center"
              >
                Try Jaktra Free (Early Access)
              </Link>
              <Link
                to="/features/zero-login-portal"
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white font-medium text-xs hover:bg-white/[0.08] transition-colors flex items-center justify-center gap-2"
              >
                <span>See Zero-Login Portal Feature</span>
                <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
              </Link>
            </div>
          </section>

          {/* FAQs */}
          <section className="pt-6">
            <h2 className="text-2xl font-bold text-white mb-6">
              Frequently Asked Questions About AR Email Management
            </h2>
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
          </section>
        </article>
      </main>

      <LandingFooter />
    </div>
  );
}

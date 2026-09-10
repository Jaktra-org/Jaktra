import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Copy,
  Check,
  Clock,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Calendar,
  User,
  PauseCircle,
} from "lucide-react";
import jaktraLogo from "../assets/jaktra_svg.svg";
import { SEOHead } from "../components/common/SEOHead";
import { clientDisputedInvoiceSchema, breadcrumbSchema } from "../components/common/seo-schemas";
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
    q: "What is the very first thing I should do when a client disputes an invoice?",
    a: "Immediately pause all automated payment reminders and dunning emails for that specific invoice. If your automated billing tool sends a past-due notice 2 days later while the client is waiting for you to resolve their dispute, you will infuriate them and damage the business relationship.",
  },
  {
    q: "Can a client refuse to pay the whole invoice if they only dispute one line item?",
    a: "No. You should politely request that the client release payment for the undisputed portion of the invoice immediately, while both parties work together to resolve the specific disputed line item. Never let a $500 dispute hold up a $10,000 payment.",
  },
  {
    q: "How do I know if a dispute is genuine or just a delay tactic?",
    a: "Genuine disputes point to specific line items, purchase order numbers, or unapproved scope additions within 1 to 2 business days of receiving the invoice. Stalling tactics typically occur 30+ days after the due date with vague statements like 'We aren't happy with the project' or 'We need to review our budget.'",
  },
  {
    q: "How does Jaktra prevent customer friction when disputes occur?",
    a: "Jaktra's NLP Dispute Triage Agent automatically intercepts incoming email replies to invoices. If it detects pushback, pricing disagreements, or missing PO claims, it freezes automated reminders instantly and pre-drafts a polite response referencing your contract or PO for your one-click review.",
  },
];

export default function ClientDisputedInvoiceArticle() {
  const [copiedScript, setCopiedScript] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedScript(id);
    setTimeout(() => setCopiedScript(null), 2000);
  };

  const disputeScript = `Subject: Regarding Invoice #{invoiceNumber} and your questions — {senderCompany}

Hi {clientName},

Thank you for reaching out regarding Invoice #{invoiceNumber}. We value our partnership, and I appreciate you bringing this discrepancy to our attention so we can resolve it quickly and fairly.

We reviewed your notes alongside our project agreement and internal delivery records:
• Undisputed Core Scope: The primary deliverables completed under PO #{poNumber} total {undisputedAmount}.
• Disputed Item: The {disputedAmount} variance relates to {briefReason, e.g., expedited courier delivery / out-of-scope revisions requested on June 14th}.

To keep everything moving forward seamlessly:
1. We have immediately paused automated payment reminders for this invoice on our end while we work through this together.
2. Could your accounts team release payment for the undisputed portion ({undisputedAmount}) while we review the documentation for the remaining {disputedAmount}?
3. Attached please find our {supportingDocumentName, e.g., signed change request / timesheet breakdown} for your review.

Would you have 10 minutes tomorrow at {suggestedTime} for a brief call to align on this, or would you prefer us to issue an adjusted statement?

Best regards,
{senderName}
{senderTitle}
{senderCompany}`;

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white font-sans antialiased selection:bg-white/20 selection:text-white">
      <SEOHead
        title="Client Disputed an Invoice? What to Do Immediately (Step-by-Step Guide)"
        description="What to do when a customer disputes an invoice or refuses to pay. How to pause collection reminders immediately, diagnose the dispute type, negotiate partial payments, and use tested response scripts."
        canonicalPath="/resources/client-disputed-invoice-what-to-do"
        jsonLd={[
          clientDisputedInvoiceSchema,
          breadcrumbSchema([
            { name: "Resources", path: "/resources" },
            { name: "Client Disputed Invoice: What to Do", path: "/resources/client-disputed-invoice-what-to-do" },
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
          <span className="text-zinc-200">Client Disputed Invoice: What to Do</span>
        </nav>

        {/* Article Header */}
        <header className="mb-10 pb-8 border-b border-white/[0.08]">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Client Disputed an Invoice? What to Do Immediately (Step-by-Step Guide)
          </h1>

          <p className="text-lg sm:text-xl text-zinc-300 leading-relaxed mb-6 font-normal">
            You sent an invoice expecting a routine payment, but instead you get an email saying: <em className="text-white font-medium">"We're not paying this invoice. The amount is incorrect and we never approved these charges."</em> Here is the exact step-by-step playbook to protect your cash and de-escalate the conflict.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-zinc-400" /> Jaktra Credit & Risk Team
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
          {/* Section 1: The Cardinal Rule */}
          <section className="p-6 rounded-2xl bg-amber-500/[0.06] border border-amber-500/20">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 shrink-0 mt-0.5">
                <PauseCircle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white mb-2">
                  The #1 Cardinal Rule: Immediately Freeze Automated Collection Reminders
                </h2>
                <p className="text-sm text-zinc-300 leading-relaxed mb-2">
                  The most dangerous mistake a business can make during an invoice dispute is continuing to send automated payment reminders.
                </p>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Imagine your client has just emailed explaining that an invoice is disputed. Two days later, your automated billing software blindly sends an automated notice: <em className="text-zinc-200">"REMINDER: Your payment is 14 days overdue. Please pay immediately to avoid late fees."</em> The client feels ignored and insulted. Log into your billing system immediately and pause notifications for that specific invoice.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2: Diagnosing the Dispute Type */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              Step 1: Diagnose Which of the 4 Dispute Types You're Facing
            </h2>
            <p className="mb-4">
              Not all disputes are created equal. Identifying the root cause dictates how you should respond:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#111113] border border-white/[0.08]">
                <h3 className="text-sm font-semibold text-white mb-1">1. Purchase Order (PO) Mismatch</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Accounts Payable rejects the invoice because the dollar amount or item count doesn't match their approved procurement PO. This is 100% administrative and easily fixed with a credit memo or amended PO.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#111113] border border-white/[0.08]">
                <h3 className="text-sm font-semibold text-white mb-1">2. Scope Creep Dispute</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  The client claims certain deliverables were out of scope or that they were never informed that extra requests would result in higher fees. Requires referencing signed briefs and proposing a structured compromise.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#111113] border border-white/[0.08]">
                <h3 className="text-sm font-semibold text-white mb-1">3. Deliverable Dissatisfaction</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  The client claims the work delivered was incomplete, defective, or buggy. Requires focusing on remediation, offering a dedicated revision sprint, and scheduling a live video alignment call.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#111113] border border-white/[0.08]">
                <h3 className="text-sm font-semibold text-white mb-1">4. Cash Flow Stalling Tactic</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  The debtor is experiencing cash constraints and uses a vague "dispute" to delay payment by 30 days. Requires separating the undisputed portion and requiring immediate settlement.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: The Golden Negotiation Strategy */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              Step 2: Isolate the Disputed Delta (Never Let $500 Hold Up $10,000)
            </h2>
            <p className="mb-4">
              When a client disputes an invoice, they usually withhold the entire payment. If an invoice is for $10,000 and the disputed line item is $1,200, you should not wait for the dispute to resolve before collecting the other $8,800.
            </p>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] text-sm text-zinc-300">
              <p className="font-semibold text-white mb-1">The "Two-Track" Settlement Formula:</p>
              <p className="text-zinc-400">
                <em>"We want to resolve the $1,200 question fully with your team. In the meantime, could your AP desk release the undisputed $8,800 today so our project accounting remains current?"</em> 
                Most reasonable clients agree immediately, protecting 85%+ of your expected cash flow.
              </p>
            </div>
          </section>

          {/* Section 4: Word-for-Word Dispute Response Email Template */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              Step 3: Send a De-Escalating Email Response
            </h2>
            <p className="mb-4 text-sm text-zinc-400">
              Use this proven, collaborative template to acknowledge the dispute, pause cadences, isolate undisputed funds, and request documentation without sounding defensive:
            </p>

            <div className="rounded-2xl bg-[#111113] border border-white/[0.08] p-6">
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/[0.08]">
                <span className="text-xs font-semibold text-white uppercase tracking-wider">
                  Word-for-Word Dispute Response Script
                </span>
                <button
                  onClick={() => handleCopy(disputeScript, "disputeScript")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-zinc-950 text-xs font-semibold hover:bg-zinc-200 transition-colors"
                >
                  {copiedScript === "disputeScript" ? (
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
                {disputeScript}
              </pre>
            </div>
          </section>

          {/* Section 5: The Automated Solution Bridge (Jaktra) */}
          <section className="p-8 rounded-2xl bg-gradient-to-b from-white/[0.04] to-transparent border border-white/[0.08] relative overflow-hidden">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-300 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>How Modern Teams Automate This</span>
            </div>

            <h2 className="text-2xl font-bold text-white mb-3">
              Eliminate Dispute Anxiety with Automated Reply Triage
            </h2>

            <p className="text-sm text-zinc-300 leading-relaxed mb-4">
              Manually managing disputes is stressful. You have to remember to log into your billing software, find the right invoice, manually click "Pause Reminder," draft an email, and follow up in your CRM.
            </p>

            <p className="text-sm text-zinc-300 leading-relaxed mb-6">
              If an account manager is out sick or misses the email, the automated reminder sequence keeps firing—turning a minor clerical question into a broken business relationship.
            </p>

            <div className="p-5 rounded-xl bg-black/40 border border-white/[0.06] mb-6">
              <h3 className="text-sm font-semibold text-white mb-2">
                How Jaktra Handles Invoice Disputes Autonomously:
              </h3>
              <ul className="space-y-2 text-xs text-zinc-300">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>Webhook Inbound Reply Catching:</strong> When a client replies with dispute keywords, Jaktra’s NLP flags it within 1 second.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>Automatic Cadence Freeze:</strong> Instantly stops scheduled overdue reminder emails on that specific invoice so you never look disorganized.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>AI Suggested Resolution Drafts:</strong> Categorizes the dispute (PO error vs. Scope vs. Hours) and generates a polite response with supporting documents ready for your review.</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-white text-zinc-950 font-semibold text-xs hover:bg-zinc-200 transition-colors shadow-sm text-center"
              >
                Start Free Early Access
              </Link>
              <Link
                to="/features/dispute-triage"
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white font-medium text-xs hover:bg-white/[0.08] transition-colors flex items-center justify-center gap-2"
              >
                <span>Learn How Dispute Triage Works</span>
                <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
              </Link>
            </div>
          </section>

          {/* FAQs */}
          <section className="pt-6">
            <h2 className="text-2xl font-bold text-white mb-6">
              Frequently Asked Questions About Disputed Invoices
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

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
  Calendar,
  User,
} from "lucide-react";
import jaktraLogo from "../assets/jaktra_svg.svg";
import { SEOHead } from "../components/common/SEOHead";
import { clientQuestioningHoursSchema, breadcrumbSchema } from "../components/common/seo-schemas";
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
    q: "Should I immediately offer a discount when a client questions my billable hours?",
    a: "No. Slashing your fees immediately implies that your original invoice was inflated, inaccurate, or negotiable. First, acknowledge their concern politely, provide an itemized breakdown of the time logged with deliverables, and ask for specific line items they are unsure about. Adjustments should only be considered if a genuine clerical error was made.",
  },
  {
    q: "How quickly should I reply to a client questioning invoice hours?",
    a: "Within 24 hours. Waiting longer makes the client feel ignored or defensive, which hardens their position and jeopardizes future retainers. An initial prompt response acknowledging the question de-escalates the tension immediately.",
  },
  {
    q: "Can the client refuse to pay the entire invoice while disputing some hours?",
    a: "No. You should politely request that the client release payment for the undisputed base portion of the invoice immediately, while both parties work together to review the specific disputed hours. This keeps cash flow moving and isolates the disagreement.",
  },
  {
    q: "How does automated AR software like Jaktra help with billable hour questions?",
    a: "When a client replies questioning invoice hours, traditional dunning bots blindly continue sending aggressive past-due reminders. Jaktra's NLP automatically detects the inquiry, freezes automated reminder emails on that invoice immediately, and drafts a documented reply for your 1-click review.",
  },
];

export default function ClientQuestioningBillableHoursArticle() {
  const [copiedScript, setCopiedScript] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedScript(id);
    setTimeout(() => setCopiedScript(null), 2000);
  };

  const script1 = `Subject: Details & Timesheet Breakdown for Invoice #{invoiceNumber}

Hi {clientName},

Thank you for reaching out regarding Invoice #{invoiceNumber}. I appreciate you bringing your questions regarding the logged hours to our attention, and I want to ensure we give you complete clarity.

To make this completely transparent, I have attached our detailed activity log for this billing cycle, which includes:
• Timestamped task descriptions and deliverables completed.
• Team member attribution for each milestone.
• References to the project deliverables agreed upon in our project brief.

Specifically, the {disputedHours} hours you noted were dedicated to {briefExplanationOfWork, e.g., resolving the unexpected database migration bottlenecks discussed in our sprint review}.

Could you review the attached log and let me know which specific items or tasks look different than what you anticipated? If helpful, I am also happy to jump on a quick 10-minute call tomorrow at {suggestedTime} to walk through the log together.

In the meantime, we have placed automated reminders for this invoice on temporary hold so you won't receive any automated notices while we review this.

Best regards,
{senderName}
{senderCompany}`;

  const script2 = `Subject: Regarding your questions on Invoice #{invoiceNumber}

Hi {clientName},

Thank you for reaching out with your questions regarding Invoice #{invoiceNumber}. I appreciate you bringing this to my attention, and I want to ensure we clear up any confusion quickly.

To help me address your concerns most effectively, could you please provide a little more detail on which specific hours or line items look different than what you expected?

Once I have that information, I will review our internal activity logs and the original project scope to provide you with a comprehensive breakdown.

In the interim, we have paused payment follow-up reminders for this invoice on our end.

Warm regards,
{senderName}
{senderCompany}`;

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white font-sans antialiased selection:bg-white/20 selection:text-white">
      <SEOHead
        title="Client Questioning Your Billable Hours? How to Respond Without Losing the Client"
        description="A step-by-step guide for agencies, consultants, and contractors on how to respond when a client questions invoice hours. Includes word-for-word email templates, non-defensive communication tips, and prevention tactics."
        canonicalPath="/resources/client-questioning-billable-hours"
        jsonLd={[
          clientQuestioningHoursSchema,
          breadcrumbSchema([
            { name: "Resources", path: "/resources" },
            { name: "Client Questioning Billable Hours", path: "/resources/client-questioning-billable-hours" },
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
          <span className="text-zinc-200">Client Questioning Billable Hours</span>
        </nav>

        {/* Article Header */}
        <header className="mb-10 pb-8 border-b border-white/[0.08]">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Client Questioning Your Billable Hours? How to Respond Without Losing the Client
          </h1>

          <p className="text-lg sm:text-xl text-zinc-300 leading-relaxed mb-6 font-normal">
            It's every service provider's nightmare email: You pour 80 hours of hard work into a client project, send the invoice, and get a reply stating: <em className="text-white font-medium">"This looks way higher than we expected—can you explain these hours?"</em>
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-zinc-400" /> Jaktra Research Team
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" /> September 2026
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-zinc-400" /> 7 min read
            </span>
          </div>
        </header>

        {/* Article Body Content */}
        <article className="space-y-10 text-base leading-relaxed text-zinc-300">
          {/* Section 1: Immediate Empathy & Diagnosis */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              1. Why Clients Question Billable Hours (It's Rarely Malice)
            </h2>
            <p className="mb-4">
              When a client questions your billable hours, your immediate instinct is often anger or anxiety. You might feel accused of dishonesty or wonder if they're trying to nickel-and-dime you out of your hard-earned money.
            </p>
            <p className="mb-4">
              In reality, over <strong>85% of billable hour disputes stem from surprise, not malice</strong>. Clients don't see the behind-the-scenes complexity of software debugging, design iterations, or regulatory compliance reviews. When the total dollar amount exceeds the rough mental estimate they had in mind, their natural reaction is to ask for clarity.
            </p>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] text-sm text-zinc-300">
              <p className="font-semibold text-white mb-1">The Golden Perspective Shift:</p>
              <p className="text-zinc-400">
                Do not view their email as an accusation. View it as an administrative request for clarity. When you approach the conversation with curiosity and transparency rather than defensiveness, the tension evaporates.
              </p>
            </div>
          </section>

          {/* Section 2: The 3 Things You Must NEVER Do */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              2. The 3 Things You Must Never Do When Hours Are Challenged
            </h2>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-red-500/[0.05] border border-red-500/20">
                <h3 className="text-base font-semibold text-red-300 mb-1">
                  1. Never offer an immediate discount as your first reply
                </h3>
                <p className="text-sm text-zinc-400">
                  Offering a 15% discount in your first response is a massive strategic mistake. It immediately signals to the client that your original billing was arbitrary, padded, or negotiable. Only offer adjustments if an honest review reveals a genuine duplicate or clerical error.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-red-500/[0.05] border border-red-500/20">
                <h3 className="text-base font-semibold text-red-300 mb-1">
                  2. Never respond defensively or emotionally
                </h3>
                <p className="text-sm text-zinc-400">
                  Replies like <em>"I've been doing this for 10 years, and my rates are very standard"</em> make the client feel alienated. Keep emotional pride out of the response. Let cold, objective timestamped work logs speak for you.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-red-500/[0.05] border border-red-500/20">
                <h3 className="text-base font-semibold text-red-300 mb-1">
                  3. Never let automated past-due reminders keep firing
                </h3>
                <p className="text-sm text-zinc-400">
                  If your accounting software is set to automatically email <em>"REMINDER: Your invoice is 7 days overdue"</em> while the client is waiting for you to explain the hours, they will be furious. You must pause collection cadences the second an inquiry arrives.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Word-for-Word Email Templates */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              3. Word-for-Word Email Scripts to Respond Professionally
            </h2>
            <p className="mb-6 text-sm text-zinc-400">
              Here are two battle-tested templates you can copy and adapt immediately.
            </p>

            {/* Script 1 */}
            <div className="mb-8 rounded-2xl bg-[#111113] border border-white/[0.08] p-6">
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/[0.08]">
                <div>
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">
                    Option A: Detailed Proof-of-Work Response
                  </span>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Use when you have itemized time logs, timesheets, or sprint tasks ready to attach.
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(script1, "script1")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-zinc-950 text-xs font-semibold hover:bg-zinc-200 transition-colors"
                >
                  {copiedScript === "script1" ? (
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
                {script1}
              </pre>
            </div>

            {/* Script 2 */}
            <div className="rounded-2xl bg-[#111113] border border-white/[0.08] p-6">
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/[0.08]">
                <div>
                  <span className="text-xs font-semibold text-blue-400 uppercase tracking-wide">
                    Option B: Requesting Clarification First
                  </span>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Use when the client's email is vague (e.g. "This looks high") and you need to know their specific concern.
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(script2, "script2")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-zinc-950 text-xs font-semibold hover:bg-zinc-200 transition-colors"
                >
                  {copiedScript === "script2" ? (
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
                {script2}
              </pre>
            </div>
          </section>

          {/* Section 4: How to Prevent This Moving Forward */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              4. How to Prevent Billable Hours Disputes in Future Sprints
            </h2>
            <p className="mb-4">
              The best way to resolve an invoice dispute is to make sure it never happens again. Top agencies follow three prevention rules:
            </p>
            <ul className="space-y-3 text-sm text-zinc-300">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Send Weekly "Burn Rate" Snapshots:</strong> Never surprise a client with a monthly block of 100 hours. A quick email every Friday stating <em>"This week we logged 22 hours, bringing our total to 54 hours"</em> eliminates surprise.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Formal Change Notices:</strong> If a client asks for a quick feature during a Slack call that takes 8 extra hours, email them: <em>"Happy to build this! It will take about 8 additional hours ($1,200). Should we proceed?"</em>
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Separate Undisputed Amounts:</strong> If a client disputes 10 hours out of an 80-hour invoice, ask them to release payment for the 70 undisputed hours today while you review the remaining 10. Never let a minor disagreement freeze your entire cash flow.
                </span>
              </li>
            </ul>
          </section>

          {/* Section 5: The Logical Automation Solution Bridge (Jaktra) */}
          <section className="p-8 rounded-2xl bg-gradient-to-b from-white/[0.04] to-transparent border border-white/[0.08] relative overflow-hidden">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-medium text-purple-300 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Automating the Workflow</span>
            </div>

            <h2 className="text-2xl font-bold text-white mb-3">
              How Modern Teams Eliminate Billing Disputes Automatically
            </h2>

            <p className="text-sm text-zinc-300 leading-relaxed mb-4">
              Handling billable hours questions manually works fine when you have 3 clients. But when you manage 20 or 50 active client retainers, the risk of embarrassing mistakes skyrockets.
            </p>

            <p className="text-sm text-zinc-300 leading-relaxed mb-6">
              The biggest nightmare is when a client replies with a thoughtful question about their invoice hours, but your automated accounting software (like QuickBooks, Chaser, or Upflow) blindly continues to send aggressive payment reminders threatening late fees. It humiliates the client and can ruin an annual contract.
            </p>

            <div className="p-5 rounded-xl bg-black/40 border border-white/[0.06] mb-6">
              <h3 className="text-sm font-semibold text-white mb-2">
                This is why we built Jaktra's NLP Dispute Triage Agent:
              </h3>
              <ul className="space-y-2 text-xs text-zinc-300">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>Automatic Inbound Reply Detection:</strong> Catches client replies questioning hours in real time.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>Instant Reminder Freeze:</strong> Automatically pauses overdue collection emails on that specific invoice to preserve goodwill.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>AI-Assisted Resolution Drafts:</strong> Pre-drafts a polite, documented response ready for your 1-click review and send.</span>
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
                to="/features/dispute-triage"
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white font-medium text-xs hover:bg-white/[0.08] transition-colors flex items-center justify-center gap-2"
              >
                <span>See Dispute Triage Feature</span>
                <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
              </Link>
            </div>
          </section>

          {/* FAQs */}
          <section className="pt-6">
            <h2 className="text-2xl font-bold text-white mb-6">
              Frequently Asked Questions
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

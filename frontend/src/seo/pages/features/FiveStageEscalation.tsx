import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ShieldCheck,
  Lock,
  Clock,
  CheckCircle2,
  PauseCircle,
  CreditCard,
  RefreshCw,
} from "lucide-react";
import { SEOHead } from "@/seo/components/SEOHead";
import { fiveStageEscalationSchema, breadcrumbSchema } from "@/seo/schemas";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { GlobalNav } from "@/components/common/GlobalNav";

interface StageDetails {
  number: number;
  name: string;
  timing: string;
  badgeColor: string;
  summary: string;
  whatJaktraDoes: string[];
  customerExperience: string[];
  safeguard: string;
  isStop?: boolean;
}

const STAGES: StageDetails[] = [
  {
    number: 1,
    name: "Courtesy Reminder",
    timing: "Days 1–7 Overdue",
    badgeColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    summary: "A gentle check-in sent shortly after the due date, assuming the delay is an oversight.",
    whatJaktraDoes: [
      "Verifies the invoice is still open in your accounting system before sending.",
      "Sends a polite reminder to the billing contact with the invoice attached.",
      "Includes a direct, secure payment link that requires no login or password.",
    ],
    customerExperience: [
      "The customer receives a friendly reminder confirming the invoice details.",
      "They can click the link to view the invoice, download the PDF, or pay immediately via Card, ACH, or bank wire.",
    ],
    safeguard: "Assumes good faith. Never mentions penalties, late fees, or account holds.",
  },
  {
    number: 2,
    name: "Payment Scheduling & Options",
    timing: "Days 8–14 Overdue",
    badgeColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    summary: "Follows up with accounts payable to confirm payment timing and offers installment plans if needed.",
    whatJaktraDoes: [
      "Follows up with AP to ask when the invoice is scheduled in their payment run.",
      "Enables flexible weekly installment options on the customer's payment page.",
      "Monitors for customer replies and pauses further messages the moment an email is received.",
    ],
    customerExperience: [
      "The customer can confirm their expected payment date.",
      "If cash flow is tight, they can split the invoice into 2 or 3 weekly installments directly on the payment page rather than letting it sit unpaid.",
    ],
    safeguard: "If the customer replies with an inquiry or dispute, reminders pause immediately so your team can handle it.",
  },
  {
    number: 3,
    name: "Overdue Notice",
    timing: "Days 15–30 Overdue",
    badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    summary: "A clear, formal notice highlighting the overdue balance and original payment terms.",
    whatJaktraDoes: [
      "Sends a formal notice stating the overdue balance and days past due.",
      "Flags the invoice as overdue on your team dashboard so account managers have visibility before client calls.",
      "Provides payment options to resolve the balance before service holds apply.",
    ],
    customerExperience: [
      "Clear, unambiguous notification that the balance is past due.",
      "Direct link to resolve payment immediately or reply with remittance details.",
    ],
    safeguard: "Firm and clear, but strictly professional. Avoids aggressive language while setting clear expectations.",
  },
  {
    number: 4,
    name: "Final Notice",
    timing: "Days 31–45 Overdue",
    badgeColor: "text-orange-400 bg-orange-500/10 border-orange-500/20",
    summary: "The final automated message requesting payment within a set deadline before account escalation.",
    whatJaktraDoes: [
      "Sends a final notice requesting payment within 5 business days.",
      "Alerts your internal finance team that this invoice has reached its final automated touchpoint.",
      "Records all delivery and engagement timestamps for internal records.",
    ],
    customerExperience: [
      "High-priority notice indicating the deadline to clear the balance before manual account referral.",
      "Direct link to settle the balance or contact finance immediately.",
    ],
    safeguard: "This is the final automated email sent to the customer before automation stops.",
  },
  {
    number: 5,
    name: "Automation Stops (Human Review)",
    timing: "Day 46+ Overdue",
    badgeColor: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    summary: "All automated emails halt completely. The account is flagged for your finance team to review and handle manually.",
    whatJaktraDoes: [
      "Automatically turns off outbound automated emails for this invoice.",
      "Compiles a complete timeline of past reminders, link visits, and invoice history.",
      "Assigns the account to an account manager or finance lead for direct personal outreach.",
    ],
    customerExperience: [
      "The customer does not receive any further automated emails.",
      "Any next step is handled personally by your team (such as a direct phone call or executive review).",
    ],
    safeguard: "Prevents repetitive automated emails from damaging relationships or creating friction. Human review is required before any further action.",
    isStop: true,
  },
];

export function FiveStageEscalation() {
  const [selectedStageIndex, setSelectedStageIndex] = useState(0);

  const currentStage = STAGES[selectedStageIndex];

  const faqs = [
    {
      q: "Can I customize the timing and days for each stage?",
      a: "Yes. In your settings, you can adjust when each stage triggers (for example, setting Stage 1 at Day 3 instead of Day 1) and customize the schedules for different client types.",
    },
    {
      q: "What happens when a customer pays?",
      a: "When payment clears in your accounting software or through Jaktra's payment link, the invoice marks as paid immediately and all scheduled reminders cancel automatically.",
    },
    {
      q: "What happens if a customer replies to a reminder?",
      a: "Future reminders pause immediately. Jaktra detects incoming emails and notifies your team so you can reply personally without automated emails getting in the way.",
    },
    {
      q: "Why do automated emails stop at Stage 5?",
      a: "Sending automated emails to an invoice that is 45+ days overdue is counterproductive. Jaktra stops automated follow-ups and flags the account so your team can handle it directly via phone or personal outreach.",
    },
    {
      q: "How do customers pay from these reminders?",
      a: "Each reminder contains a secure payment link. Customers can view the invoice and pay via Card, ACH, or bank wire without having to create an account or remember passwords.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#010102] text-[#f7f8f8] font-sans antialiased selection:bg-[#5e6ad2]/30 selection:text-white">
      <SEOHead
        title="5-Stage Automated AR Follow-Up Cadence | Jaktra"
        description="Learn how Jaktra's 5-stage payment cadence recovers overdue receivables faster while protecting customer goodwill and pausing on replies."
        canonicalPath="/features/5-stage-escalation"
        jsonLd={[
          fiveStageEscalationSchema,
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Features", path: "/features" },
            { name: "5-Stage Tone Escalation", path: "/features/5-stage-escalation" },
          ]),
        ]}
      />

      <GlobalNav />

      <main className="pt-24 pb-20 max-w-6xl mx-auto px-4 sm:px-6 relative">
        {/* Subtle Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(183,210,248,0.06),transparent)] pointer-events-none" />

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
              5-Stage Follow-Up Cadence
            </li>
          </ol>
        </nav>

        {/* PAGE HEADER */}
        <section className="max-w-3xl mb-12 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono uppercase tracking-wider text-zinc-300 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#b7d2f8]" />
            Feature Overview
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
            How the 5-Stage Follow-Up Cadence Works
          </h1>
          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-2xl">
            When an invoice goes unpaid, Jaktra manages follow-ups based on how long it has been overdue. Rather than sending the same email repeatedly, the cadence moves through five distinct stages—starting with a polite courtesy note, offering flexible payment options, and automatically pausing if a customer replies.
          </p>
        </section>

        {/* INTERACTIVE STAGE EXPLORER */}
        <section className="mb-16 relative z-10">
          <div className="rounded-2xl bg-[#0c0d10] border border-white/[0.1] shadow-2xl overflow-hidden">
            {/* Header Description */}
            <div className="bg-[#121316] border-b border-white/[0.08] px-5 py-4">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                Cadence Walkthrough
              </span>
              <p className="text-xs sm:text-sm text-zinc-200">
                Select a stage below to see what Jaktra does, what the customer experiences, and how the invoice is handled.
              </p>
            </div>

            {/* Stage Selector Tabs */}
            <div className="p-4 sm:p-6 border-b border-[#23252a] bg-[#0f1011]">
              <div className="flex sm:grid sm:grid-cols-5 gap-2.5 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0 thin-scrollbar">
                {STAGES.map((stg, idx) => {
                  const isSelected = selectedStageIndex === idx;
                  return (
                    <button
                      key={stg.number}
                      type="button"
                      onClick={() => setSelectedStageIndex(idx)}
                      className={`min-w-[140px] sm:min-w-0 p-3 rounded-lg border text-left transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#141516] border-[#5e6ad2] shadow-md ring-1 ring-[#5e6ad2]/40"
                          : "bg-[#010102] border-[#23252a] hover:bg-[#141516]/50 text-[#8a8f98] hover:text-[#f7f8f8]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                            stg.isStop
                              ? "bg-rose-500/15 text-rose-300 font-bold"
                              : isSelected
                              ? "bg-[#5e6ad2]/20 text-[#828fff] font-bold"
                              : "bg-[#141516] text-[#8a8f98]"
                          }`}
                        >
                          Stage {stg.number}
                        </span>
                        {stg.isStop ? (
                          <Lock className="w-3.5 h-3.5 text-rose-400" />
                        ) : idx < selectedStageIndex ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-zinc-500" />
                        )}
                      </div>
                      <div className="text-xs font-semibold text-white truncate">{stg.name}</div>
                      <div className="text-[11px] font-mono text-zinc-400 mt-0.5">{stg.timing}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stage Details (What happens in this stage) */}
            <div className="p-5 sm:p-8 bg-[#0e0f11]">
              <div className="max-w-4xl space-y-6">
                {/* Stage Headline */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-white/[0.06]">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-base sm:text-lg font-bold text-white">
                        Stage {currentStage.number}: {currentStage.name}
                      </span>
                      <span className={`text-[10px] px-2.5 py-0.5 rounded border font-mono font-medium ${currentStage.badgeColor}`}>
                        {currentStage.timing}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-300 mt-1.5 leading-relaxed">
                      {currentStage.summary}
                    </p>
                  </div>
                </div>

                {/* 2-Column Functional Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Column 1: What Jaktra Does */}
                  <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-white">
                      <RefreshCw className="w-4 h-4 text-[#b7d2f8]" />
                      <span>What Jaktra Does</span>
                    </div>
                    <ul className="space-y-2.5 text-xs text-zinc-300">
                      {currentStage.whatJaktraDoes.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#b7d2f8] shrink-0 mt-1.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Column 2: What the Customer Experiences */}
                  <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-white">
                      <CreditCard className="w-4 h-4 text-emerald-400" />
                      <span>What the Customer Experiences</span>
                    </div>
                    <ul className="space-y-2.5 text-xs text-zinc-300">
                      {currentStage.customerExperience.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Safeguard Banner */}
                <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                  currentStage.isStop
                    ? "bg-rose-500/10 border-rose-500/25 text-rose-200"
                    : "bg-blue-500/5 border-blue-500/20 text-zinc-200"
                }`}>
                  <ShieldCheck className={`w-4 h-4 shrink-0 mt-0.5 ${
                    currentStage.isStop ? "text-rose-400" : "text-[#b7d2f8]"
                  }`} />
                  <div>
                    <span className="text-xs font-bold block mb-0.5">
                      {currentStage.isStop ? "Automatic Safety Shutoff" : "Active Safeguard"}
                    </span>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {currentStage.safeguard}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW THE ENGINE OPERATES BEHIND THE SCENES */}
        <section className="mb-16 border-t border-white/[0.08] pt-12">
          <div className="max-w-2xl mb-8">
            <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold block mb-1">
              Operational Mechanics
            </span>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              How Jaktra Manages Follow-Ups
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 sm:p-6 rounded-2xl bg-[#0c0d10] border border-white/[0.08] space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <RefreshCw className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">Live Accounting Sync</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Connects directly to your accounting software. The moment an invoice is marked as paid, scheduled follow-ups cancel instantly.
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-[#0c0d10] border border-white/[0.08] space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <PauseCircle className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">Instant Pause on Reply</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                If a customer replies with a billing question, dispute, or payment date, Jaktra stops future reminders immediately so your team can assist.
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-[#0c0d10] border border-white/[0.08] space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <Lock className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">Hard Stop at Stage 5</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                At 46+ days past due, all automated emails stop. Accounts are flagged for your team to handle directly through phone calls or personal review.
              </p>
            </div>
          </div>
        </section>

        {/* COMPARISON TABLE */}
        <section className="mb-16 rounded-2xl bg-[#0c0d10] border border-white/[0.08] p-6 sm:p-8">
          <div className="mb-6">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-1">
              Comparison
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              5-Stage Cadence vs. Traditional Follow-Ups
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-white/[0.08] text-[11px] font-mono uppercase text-zinc-400">
                  <th className="py-3 px-4">Aspect</th>
                  <th className="py-3 px-4 text-zinc-400">Manual / Traditional Reminders</th>
                  <th className="py-3 px-4 text-[#b7d2f8] font-bold">Jaktra 5-Stage Cadence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-white">Tone Adjustment</td>
                  <td className="py-3.5 px-4 text-zinc-400">Same generic copy sent repeatedly</td>
                  <td className="py-3.5 px-4 text-white font-medium bg-[#b7d2f8]/5">Adjusts progressively from courteous to firm</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-white">Inbound Customer Replies</td>
                  <td className="py-3.5 px-4 text-zinc-400">Often ignored; reminders keep sending</td>
                  <td className="py-3.5 px-4 text-white font-medium bg-[#b7d2f8]/5">Automatically pauses cadence; alerts your team</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-white">Payment Options</td>
                  <td className="py-3.5 px-4 text-zinc-400">Single lump-sum demand</td>
                  <td className="py-3.5 px-4 text-white font-medium bg-[#b7d2f8]/5">Enables 2x or 3x weekly installment splits</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-white">Payment Experience</td>
                  <td className="py-3.5 px-4 text-zinc-400">Requires manual check or complex portal login</td>
                  <td className="py-3.5 px-4 text-white font-medium bg-[#b7d2f8]/5">1-click passwordless link with Card &amp; ACH</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-white">Aging Safety</td>
                  <td className="py-3.5 px-4 text-zinc-400">Spams indefinitely or gets lost in inbox</td>
                  <td className="py-3.5 px-4 text-white font-medium bg-[#b7d2f8]/5">Automatic stop at Day 46 for personal team review</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQS */}
        <section className="mb-16">
          <div className="max-w-2xl mb-8">
            <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold block mb-1">
              Questions &amp; Answers
            </span>
            <h2 className="text-2xl font-bold text-white tracking-tight">Frequently Asked Questions</h2>
          </div>

          <div className="max-w-3xl">
            <Accordion type="single" variant="outline" defaultValue="faq-0" collapsible className="w-full">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left font-medium text-white text-sm">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="rounded-2xl border border-white/[0.08] bg-[#0c0d10] p-8 sm:p-12 text-center shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 tracking-tight">
            Automate Your Follow-Up Cadence
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto mb-6 leading-relaxed">
            Recover overdue invoices consistently without spending hours writing manual follow-up emails.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-zinc-950 text-xs sm:text-sm font-semibold hover:bg-zinc-200 transition-all shadow-lg"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/features"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs sm:text-sm font-medium text-zinc-300 transition-all"
            >
              Explore All Features
            </Link>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Brain,
  AlertTriangle,
  Lock,
  Copy,
  Check,
  Clock,
  BookOpen,
  List,
} from "lucide-react";
import jaktraLogo from "../assets/jaktra_svg.svg";
import { SEOHead } from "../components/common/SEOHead";
import { toneEscalationPlaybookSchema, breadcrumbSchema } from "../components/common/seo-schemas";
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

interface PlaybookStage {
  stage: number;
  name: string;
  days: string;
  badgeColor: string;
  psychology: string;
  promptDirective: string;
  sampleEmail: string;
  complianceRule: string;
}

const PLAYBOOK_STAGES: PlaybookStage[] = [
  {
    stage: 1,
    name: "Collaborative Courtesy",
    days: "Days 1–7 Overdue",
    badgeColor: "bg-white/[0.04] text-zinc-300 border-white/[0.08]",
    psychology: "Presumed Administrative Oversight. Employs polite, frictionless framing to ensure the customer feels valued while receiving direct payment access.",
    promptDirective: `You are an accounts receivable assistant for Acme Corp. Invoice #INV-2048 ($4,250) is 3 days past due. Tone: warm, collaborative, and helpful. Assume accidental oversight. Emphasize that you are reaching out to ensure everything was received properly. Include direct tokenized payment portal link.`,
    sampleEmail: `Hi Alex,\n\nHope your week is going smoothly! Just a friendly note that Invoice #INV-2048 ($4,250.00) was due on Friday. We want to make sure your team has everything needed for processing.\n\nYou can review your full invoice statement and clear payment directly via your secure one-click link:\nhttps://jaktra.site/i/demo-token\n\nIf you have any questions regarding line items or need updated tax forms, feel free to reply directly to this email.\n\nWarm regards,\nFinance Team, Acme Corp`,
    complianceRule: "Protected by the 20-Hour Idempotency Guard. No repeat outreach permitted within 20 hours.",
  },
  {
    stage: 2,
    name: "Structured Administrative Follow-Up",
    days: "Days 8–14 Overdue",
    badgeColor: "bg-white/[0.04] text-zinc-300 border-white/[0.08]",
    psychology: "Priority Scheduling & Cash Flexibility. Moves from casual reminder to structured accounting follow-up. Introduces installment payment alternatives.",
    promptDirective: `You are an accounts receivable assistant. Invoice #INV-2048 ($4,250) is 10 days past due. Prior reminder sent 5 days ago. Tone: professional, structured, and direct. Inquire if this has entered their weekly accounts payable run. Mention that installment plans are available through their portal if needed.`,
    sampleEmail: `Hi Alex,\n\nWe have not yet received payment for Invoice #INV-2048 ($4,250.00), which is now 10 days past due.\n\nCould you kindly check with your accounts payable department to confirm the scheduled remittance date? If your team is experiencing cash timing constraints, you can split this balance into structured monthly installments directly through your portal:\nhttps://jaktra.site/i/demo-token\n\nThank you for keeping your account current.\n\nBest regards,\nAccounts Receivable, Acme Corp`,
    complianceRule: "Evaluates historical client payment velocity. Inbound dispute replies immediately freeze cadences.",
  },
  {
    stage: 3,
    name: "Operational Warning",
    days: "Days 15–21 Overdue",
    badgeColor: "bg-white/[0.04] text-zinc-300 border-white/[0.08]",
    psychology: "Commercial Accountability & Deliverable Continuity. Clear warning that prolonged delinquency threatens active services, deliverables, or credit terms.",
    promptDirective: `Invoice #INV-2048 ($4,250) is now 18 days past due. Tone: serious, firm, and urgent. Highlight that continued delay may affect active service availability and commercial credit terms. Urge immediate resolution via the secure link.`,
    sampleEmail: `Dear Alex,\n\nWe are contacting you urgently regarding overdue Invoice #INV-2048 for $4,250.00, which remains unpaid at 18 days past due.\n\nTo ensure uninterrupted delivery of ongoing project milestones and protect your commercial credit standing, we require settlement of this balance immediately.\n\nPlease process this payment today through your direct settlement link:\nhttps://jaktra.site/i/demo-token\n\nIf you have already initiated a bank transfer, please reply with the payment confirmation or reference number.\n\nSincerely,\nFinance Controller, Acme Corp`,
    complianceRule: "Elevates predictive delinquency risk score. Triggers internal finance director notification.",
  },
  {
    stage: 4,
    name: "Formal Pre-Legal Demand",
    days: "Days 22–30 Overdue",
    badgeColor: "bg-white/[0.04] text-zinc-300 border-white/[0.08]",
    psychology: "Executive Escalation & Fixed Deadline. Establishes a concrete date cutoff before the file is forwarded to executive leadership and recovery counsel.",
    promptDirective: `Invoice #INV-2048 ($4,250) is 26 days past due. This is the final notice before automated systems freeze. Tone: formal, uncompromising, and urgent. State strict 4-business-day deadline before file transfer to legal recovery counsel.`,
    sampleEmail: `DEMAND NOTICE: Final Warning for Overdue Invoice #INV-2048\n\nDear Alex,\n\nYour account is now 26 days overdue with an outstanding balance of $4,250.00. Despite multiple prior notices, this obligation has not been resolved.\n\nThis communication serves as formal notice that full payment must be received within four (4) business days (by Friday, 5:00 PM EST). Failure to settle by this deadline will result in immediate suspension of all services and escalation to external corporate legal recovery counsel.\n\nRemit payment immediately to avoid escalation fees:\nhttps://jaktra.site/i/demo-token\n\nOffice of the Chief Financial Officer\nAcme Corp`,
    complianceRule: "Final automated stage. Prepares file metadata and audit trail for executive sign-off.",
  },
  {
    stage: 5,
    name: "Stage 5 Legal Stop (Automation Cutoff)",
    days: "Days 31+ Overdue",
    badgeColor: "bg-white/[0.08] text-white border-white/[0.15]",
    psychology: "Mandatory Regulatory Cessation. Automated AI messaging is permanently terminated to avoid harassment liability under global debt collection statutes.",
    promptDirective: `[SYSTEM OVERRIDE]: Invoice #INV-2048 has reached 31+ days past due. Automated outreach has been permanently terminated by Jaktra's Stage 5 Legal Stop. No further automated communications may be generated.`,
    sampleEmail: `[AUTOMATION PERMANENTLY HALTED]\n\nInvoice #INV-2048 ($4,250.00) has transitioned to Stage 5 (31+ days overdue).\n\nIn accordance with Jaktra's regulatory compliance engine (backend/src/modules/agent/agent.service.ts), all autonomous messaging has been strictly halted to prevent harassment violations. This file is locked and requires executive review and written legal authorization for any further action.`,
    complianceRule: "Hard code block in agent.service.ts. FDCPA & regulatory compliance enforced.",
  },
];

const TOC_ITEMS = [
  { id: "stage-matrix", label: "5-Stage Cadence Matrix at a Glance" },
  { id: "legacy-vs-generative", label: "Legacy Dunning vs. Generative Tone" },
  { id: "stage-walkthrough", label: "5-Stage Detailed Walkthrough" },
  { id: "compliance-guardrails", label: "3 Non-Negotiable Compliance Guardrails" },
  { id: "faqs", label: "Frequently Asked Questions" },
];

function StageItemCard({ stage }: { stage: PlaybookStage }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(stage.sampleEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article
      id={`stage-${stage.stage}`}
      className="pt-10 border-t border-white/[0.08] first:border-t-0 first:pt-0 scroll-mt-24 space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Stage {stage.stage}: {stage.name}
          </h3>
          <span className="text-xs font-mono px-2.5 py-0.5 rounded border border-white/[0.1] bg-white/[0.04] text-zinc-300">
            {stage.days}
          </span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium text-zinc-200 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-[#b7d2f8]" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
          <span>{copied ? "Copied" : "Copy Template"}</span>
        </button>
      </div>

      <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
        <strong className="text-white font-semibold">Psychological Framework: </strong>
        {stage.psychology}
      </p>

      {/* Prompt Directive */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-[#b7d2f8]">
          <Brain className="w-3.5 h-3.5" />
          <span>LLM System Prompt Directive (Groq LLaMA 3.1)</span>
        </div>
        <div className="p-3.5 rounded-xl bg-black/50 border border-white/[0.08] font-mono text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap select-all">
          {stage.promptDirective}
        </div>
      </div>

      {/* Generated Email Sample */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-[#b7d2f8]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Word-for-Word Email Outreach Sample</span>
        </div>
        <div className="p-4 rounded-xl bg-black/60 border border-white/[0.08] font-mono text-xs sm:text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap select-all">
          {stage.sampleEmail}
        </div>
      </div>

      {/* Compliance Rule */}
      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
        <ShieldCheck className="w-4 h-4 text-[#b7d2f8] shrink-0 mt-0.5" />
        <div className="text-xs text-zinc-400">
          <strong className="text-zinc-200 block mb-0.5">Automated Compliance Guardrail:</strong>
          {stage.complianceRule}
        </div>
      </div>
    </article>
  );
}

export function ToneEscalationPlaybook() {
  const [activeSection, setActiveSection] = useState<string>("stage-matrix");
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 160;

      for (let i = TOC_ITEMS.length - 1; i >= 0; i--) {
        const el = document.getElementById(TOC_ITEMS[i].id);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(TOC_ITEMS[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const faqs = [
    {
      q: "Why does Jaktra permanently halt automated outreach at Stage 5 (31+ days)?",
      a: "Continuing to blast automated emails past 30 days overdue creates severe regulatory and legal risks under the Fair Debt Collection Practices Act (FDCPA) and commercial harassment statutes. Jaktra hardcodes a Stage 5 Legal Stop in backend/src/modules/agent/agent.service.ts that terminates automated AI messaging and mandates human executive review.",
    },
    {
      q: "How does Groq LLaMA 3.1 prevent repetitive dunning copy?",
      a: "Static dunning tools send the same rigid template on Day 7, Day 14, and Day 21, which causes debtors to mark messages as spam. Jaktra uses Groq LLaMA 3.1 generative inference to dynamically modulate tone, synthesizing the invoice age, payment history, client tier, and outstanding balance into unique, contextual communications.",
    },
    {
      q: "Can businesses adjust stage timing for Net 45 or Net 60 terms?",
      a: "Yes. While Jaktra's default escalation cadences are tuned for Net 30 invoices, finance managers can configure custom milestone thresholds for extended commercial credit terms (such as pre-due check-ins at Day 45 and post-due escalations at Day 65).",
    },
    {
      q: "What happens if a debtor replies with a dispute during Stage 3 or Stage 4?",
      a: "The moment an inbound reply is detected, Jaktra's NLP DisputeAgent analyzes debtor sentiment. If the reply contains a pricing dispute, scope inquiry, or proof-of-delivery question, automated cadences freeze immediately across all channels, preventing aggressive follow-ups during active resolution.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-zinc-100 font-sans selection:bg-[#b7d2f8]/20 selection:text-white antialiased">
      <SEOHead
        title="Overdue Invoice Escalation: How to Shift Tone from Polite Reminder to Final Demand | Jaktra"
        description="Learn how to escalate overdue invoice email tone professionally across 5 aging stages. Understand when to be polite, when to be firm, and when to enforce a formal legal cutoff."
        canonicalPath="/resources/5-stage-ar-tone-escalation"
        jsonLd={[
          toneEscalationPlaybookSchema,
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Resources", path: "/resources" },
            { name: "Collection Tone Escalation Guide", path: "/resources/5-stage-ar-tone-escalation" },
          ]),
        ]}
      />

      <HeaderNav />

      <main className="pt-24 sm:pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(183,210,248,0.06),transparent)] pointer-events-none" />

        {/* Editorial Header */}
        <header className="pb-10 mb-10 border-b border-white/[0.08] relative z-10">
          <nav aria-label="Breadcrumb" className="mb-6 text-xs text-zinc-500">
            <ol className="flex items-center gap-2">
              <li>
                <Link to="/" className="hover:text-zinc-300 transition-colors">
                  Home
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link to="/resources" className="hover:text-zinc-300 transition-colors">
                  Resources
                </Link>
              </li>
              <li>/</li>
              <li className="text-zinc-300 font-medium" aria-current="page">
                Tone Escalation Playbook
              </li>
            </ol>
          </nav>

          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#b7d2f8] font-semibold">
              <BookOpen className="w-3.5 h-3.5" />
              <span>AR Strategy Playbook · 2026</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-[1.15] max-w-4xl">
              How to Escalate Collection Email Tone: When to Be Polite, Firm, and When to Stop
            </h1>

            <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-3xl">
              If your polite payment reminder was ignored, repeating the identical copy won&apos;t get you paid. Discover how to transition communication urgency across 5 psychological stages—accelerating cash collection while protecting client goodwill and regulatory compliance.
            </p>

            {/* Author & Share Metadata Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 text-xs text-zinc-400 border-t border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-[#b7d2f8]/10 border border-[#b7d2f8]/30 flex items-center justify-center font-bold text-xs text-[#b7d2f8]">
                  J
                </div>
                <div>
                  <div className="text-white font-medium">Jaktra Credit &amp; Collections Research</div>
                  <div className="text-[11px] text-zinc-500">Last Updated On September 2026 · 10 min read</div>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:ml-auto">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#111113] border border-white/[0.08] hover:border-white/20 text-zinc-300 hover:text-white transition-colors text-xs font-medium"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-[#b7d2f8]" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
                  <span>{copiedLink ? "Copied!" : "Copy Link"}</span>
                </button>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                    typeof window !== "undefined" ? window.location.href : "https://jaktra.site"
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#111113] border border-white/[0.08] hover:border-white/20 text-zinc-300 hover:text-white transition-colors text-xs font-medium"
                >
                  <span className="font-bold text-[11px] text-[#b7d2f8]">in</span>
                  <span>Share</span>
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* Two-Column Editorial Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Sticky Left Sidebar: Table of Contents */}
          <aside className="hidden lg:block lg:col-span-4 lg:sticky lg:top-20 space-y-6">
            <div className="p-5 rounded-2xl bg-[#111113] border border-white/[0.08] shadow-xl">
              <div className="flex items-center gap-2 pb-3 mb-3 border-b border-white/[0.08] text-xs font-bold uppercase tracking-wider text-white">
                <List className="w-4 h-4 text-[#b7d2f8]" />
                <span>Table of Contents</span>
              </div>

              <nav aria-label="Playbook outline">
                <ul className="space-y-1 text-xs">
                  {TOC_ITEMS.map((item, idx) => {
                    const isActive = activeSection === item.id;
                    return (
                      <li key={item.id}>
                        <a
                          href={`#${item.id}`}
                          className={`flex items-center gap-2.5 py-2 px-3 rounded-lg transition-all ${
                            isActive
                              ? "bg-[#b7d2f8]/10 text-[#b7d2f8] font-semibold border-l-2 border-[#b7d2f8]"
                              : "text-zinc-400 hover:text-white hover:bg-white/[0.03]"
                          }`}
                        >
                          <span className="font-mono text-[10px] text-zinc-500 font-semibold shrink-0">
                            0{idx + 1}.
                          </span>
                          <span className="leading-snug">{item.label}</span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>

            {/* Sidebar CTA Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-white/[0.05] to-[#111113] border border-white/[0.08] shadow-lg">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[#b7d2f8]/10 text-[#b7d2f8] border border-[#b7d2f8]/20 mb-3">
                <Sparkles className="w-3 h-3" />
                <span>Groq LLaMA 3.1 Tone Engine</span>
              </div>
              <h3 className="text-sm font-bold text-white mb-1.5">
                Automate 5-Stage Tone Modulation
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                Connect your accounting ledger in 15 minutes. Automatically modulate collection urgency without template blindness.
              </p>
              <Link
                to="/register"
                className="w-full py-2.5 px-3 rounded-lg bg-white text-zinc-950 text-xs font-semibold hover:bg-zinc-200 transition-colors flex items-center justify-center gap-1.5 shadow-md"
              >
                <span>Deploy Free (No Credit Card)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </aside>

          {/* Right Main Editorial Flow */}
          <div className="lg:col-span-8 space-y-16 min-w-0">
            {/* Section 1: Quick-Glance Cadence Matrix Table */}
            <section id="stage-matrix" className="space-y-4 scroll-mt-24">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-widest text-[#b7d2f8] font-semibold">01 / Cadence Matrix</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                5-Stage Tone Escalation Cadence at a Glance
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                An open reference matrix mapping each aging stage to its psychological objective, communication urgency, and compliance constraints:
              </p>

              {/* Scannable Stage Table */}
              <div className="rounded-xl border border-white/[0.08] bg-[#111113] overflow-x-auto shadow-xl my-6">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.08] bg-[#0a0a0b]/90">
                      <th className="py-3 px-4 font-mono text-[11px] uppercase tracking-wider text-[#b7d2f8] font-semibold w-16">
                        Stage
                      </th>
                      <th className="py-3 px-4 font-mono text-[11px] uppercase tracking-wider text-[#b7d2f8] font-semibold">
                        Timing
                      </th>
                      <th className="py-3 px-4 font-mono text-[11px] uppercase tracking-wider text-[#b7d2f8] font-semibold">
                        Tone &amp; Psychological Objective
                      </th>
                      <th className="py-3 px-4 font-mono text-[11px] uppercase tracking-wider text-[#b7d2f8] font-semibold">
                        Compliance Guardrail
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {PLAYBOOK_STAGES.map((s) => (
                      <tr key={s.stage} className="hover:bg-white/[0.01] transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-zinc-400">
                          0{s.stage}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-white whitespace-nowrap">
                          <a href={`#stage-${s.stage}`} className="hover:text-[#b7d2f8] transition-colors block">
                            <div>{s.name}</div>
                            <div className="text-[11px] text-zinc-500 font-mono font-normal">{s.days}</div>
                          </a>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-zinc-300 leading-relaxed">
                          {s.psychology}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-[#b7d2f8] font-mono leading-relaxed">
                          {s.complianceRule}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 2: Why Static Templates Fail */}
            <section id="legacy-vs-generative" className="space-y-4 scroll-mt-24">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-widest text-[#b7d2f8] font-semibold">02 / Methodology</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                The Flaw of Legacy Dunning Sequences
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                When accounting teams blast the exact same boilerplate overdue reminder every week, debtors develop template blindness. If your first two emails were ignored, repeating the identical copy won&apos;t work:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 my-6 text-sm">
                <div className="p-5 rounded-xl bg-[#111113] border border-white/[0.08] space-y-3">
                  <h3 className="text-base font-semibold text-zinc-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-zinc-500" />
                    <span>Static Rule-Based Dunning (Legacy)</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    Traditional software (Upflow, Chaser) fires rigid templates: Template A at Day 7, Template B at Day 14. Debtors quickly recognize the robotic pattern and tune out the sender.
                  </p>
                  <ul className="space-y-2 text-xs text-zinc-400 pt-1">
                    <li className="flex items-start gap-2">
                      <span className="text-zinc-600 font-bold">•</span>
                      <span>Repetitive email bodies trigger corporate spam filters</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-zinc-600 font-bold">•</span>
                      <span>Treats enterprise VIP accounts identically to delinquent debtors</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-zinc-600 font-bold">•</span>
                      <span>Zero automated dispute reply classification</span>
                    </li>
                  </ul>
                </div>

                <div className="p-5 rounded-xl bg-[#111113] border border-white/[0.08] space-y-3">
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#b7d2f8]" />
                    <span>Generative Tone Escalation (Jaktra)</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    Jaktra uses Groq LLaMA 3.1 to generate unique, context-aware communications across 5 distinct stages. Tone scales smoothly from collaborative courtesy to stern contractual demands.
                  </p>
                  <ul className="space-y-2 text-xs text-zinc-300 pt-1">
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-[#b7d2f8] shrink-0 mt-0.5" />
                      <span>Dynamic phrasing ensures high inbox deliverability</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-[#b7d2f8] shrink-0 mt-0.5" />
                      <span>Zero-login tokenized links with instant payment &amp; installments</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-[#b7d2f8] shrink-0 mt-0.5" />
                      <span>Strict Stage 5 Legal Stop halts automation at 31+ days overdue</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 3: Open Stage-by-Stage Detailed Walkthrough */}
            <section id="stage-walkthrough" className="space-y-12 scroll-mt-24">
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase tracking-widest text-[#b7d2f8] font-semibold">03 / Stage Deep Dives</span>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  5-Stage Detailed Walkthrough: Prompts &amp; Email Scripts
                </h2>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Inspect the psychological framing, system prompt directives, and copyable email scripts across all 5 operational stages:
                </p>
              </div>

              {/* All 5 Stages Rendered Openly (No Hidden Drawers) */}
              <div className="space-y-12">
                {PLAYBOOK_STAGES.map((stage) => (
                  <StageItemCard key={stage.stage} stage={stage} />
                ))}
              </div>
            </section>

            {/* Section 4: 3 Non-Negotiable Compliance Guardrails */}
            <section id="compliance-guardrails" className="space-y-6 scroll-mt-24">
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase tracking-widest text-[#b7d2f8] font-semibold">04 / Compliance</span>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  The 3 Non-Negotiable Compliance Guardrails
                </h2>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Automated outreach without strict guardrails introduces severe regulatory liability. Jaktra hardcodes three automated circuit breakers:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="rounded-xl border border-white/[0.08] bg-[#111113] p-5 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-3 text-[#b7d2f8]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-white">Stage 5 Legal Stop</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Automated AI outreach terminates permanently at 31+ days overdue. Mandates executive human review before any further contact to comply with commercial debt collection regulations.
                  </p>
                </div>

                <div className="rounded-xl border border-white/[0.08] bg-[#111113] p-5 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-3 text-[#b7d2f8]">
                    <Clock className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-white">20-Hour Idempotency</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Enforces a strict minimum 20-hour gap between outbound communications to eliminate duplicate touches and prevent aggressive spam cadence penalties.
                  </p>
                </div>

                <div className="rounded-xl border border-white/[0.08] bg-[#111113] p-5 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-3 text-[#b7d2f8]">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-white">Instant Dispute Freeze</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Inbound replies expressing billing confusion or dispute immediately pause all dunning cadences, preventing angry customer escalation while finance reviews the claim.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 5: FAQs */}
            <section id="faqs" className="space-y-4 scroll-mt-24">
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase tracking-widest text-[#b7d2f8] font-semibold">05 / FAQ</span>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Frequently Asked Questions
                </h2>
                <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                  Clear answers on how autonomous tone modulation balances recovery velocity with client goodwill.
                </p>
              </div>

              <div className="rounded-xl border border-white/[0.08] bg-[#111113] p-5 sm:p-7 shadow-xl">
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

            {/* Final CTA Banner */}
            <section className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-transparent p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
              <div className="relative z-10 max-w-2xl mx-auto space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#b7d2f8]/10 border border-[#b7d2f8]/30 text-xs font-mono text-[#b7d2f8] font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Free Early Access</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-bold text-white">
                  Deploy Autonomous 5-Stage Tone Escalation in 15 Minutes
                </h2>
                <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                  Replace robotic templates with respectful, high-converting AI tone modulation. 100% free during Early Access with zero credit card required.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white text-zinc-950 text-sm font-semibold hover:bg-zinc-200 transition-colors shadow-lg w-full sm:w-auto"
                  >
                    <span>Get started free</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/features/5-stage-escalation"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-white/[0.12] bg-white/[0.04] text-white text-sm font-medium hover:bg-white/[0.08] transition-colors w-full sm:w-auto"
                  >
                    <span>Explore Tone Escalation Feature</span>
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}

export default ToneEscalationPlaybook;

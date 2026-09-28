import { useState } from "react";
import {
  Copy,
  Check,
  Sparkles,
  Lock,
  Mail,
  Zap,
  ShieldCheck,
  Brain,
  CreditCard,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export interface StageData {
  id: string;
  stageNumber: number;
  name: string;
  shortName: string;
  timing: string;
  tone: string;
  urgencyLevel: number; // 1 to 5 (20% to 100%)
  accentColor: string; // Tailwind text/bg color tokens
  badgeColor: string;
  objective: string;
  guardrails: string[];
  sampleSubject: string;
  sampleBody: string;
  systemPrompt: string;
  isLegalStop?: boolean;
}

const DEFAULT_STAGES: StageData[] = [
  {
    id: "stage-1",
    stageNumber: 1,
    name: "Collaborative Courtesy",
    shortName: "Warm Courtesy",
    timing: "Days 1–7 Overdue",
    tone: "Helpful, collaborative, and assume accidental oversight.",
    urgencyLevel: 1,
    accentColor: "blue",
    badgeColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    objective:
      "Verify receipt, provide zero-friction payment links, and identify any billing or PO mismatches before they cause accounting delays.",
    guardrails: [
      "Explicitly assumes the client intended to pay on time.",
      "Never mentions penalties, late fees, or collections.",
      "Includes 1-click tokenized payment portal link.",
      "Protected by the 20-Hour Idempotency Guard.",
    ],
    sampleSubject: "Reminder: Invoice #INV-2026-891 due for Acme Corp",
    sampleBody: `Hi Alex,

Hope your week is going smoothly!

This is a quick courtesy note regarding invoice #INV-2026-891 ($14,250.00), which came due yesterday. We want to ensure your accounts payable team has all required paperwork for processing.

You can review the invoice statement and complete 1-click settlement here:
https://billing.yourcompany.com/i/tok_89f92a01

If this payment is already scheduled in this week's check run, or if you need a purchase order updated on our end, please reply directly and I will gladly take care of it.

Warm regards,
Finance Operations Team`,
    systemPrompt: `You are an accounts receivable assistant for Acme Corp. Invoice #INV-2026-891 ($14,250.00) is 3 days past due. Tone: warm, collaborative, and helpful. Assume accidental oversight. Emphasize that you are reaching out to ensure everything was received properly. Include direct tokenized payment portal link. Do not mention penalties or legal action.`,
  },
  {
    id: "stage-2",
    stageNumber: 2,
    name: "Commercial Follow-Up",
    shortName: "Commercial Follow-Up",
    timing: "Days 8–14 Overdue",
    tone: "Direct, professional, structured, and inquiry-focused.",
    urgencyLevel: 2,
    accentColor: "cyan",
    badgeColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    objective:
      "Establish direct contact with accounts payable, request an expected remittance date, and proactively offer flexible installment options if cash timing is constrained.",
    guardrails: [
      "Maintains respectful commercial goodwill.",
      "Offers structured installment alternatives automatically.",
      "Inbound dispute replies immediately freeze cadences.",
      "Evaluates historical client payment velocity.",
    ],
    sampleSubject: "Status update request: Invoice #INV-2026-891 past due",
    sampleBody: `Hi Alex,

I am following up on invoice #INV-2026-891 for $14,250.00, which is now 10 days past due.

Could you kindly check with your accounts payable department to confirm the scheduled remittance date?

If your team is experiencing cash timing constraints, we have enabled a flexible 3-week payment plan ($4,750.00/week) directly through your portal:
https://billing.yourcompany.com/i/tok_89f92a01

Please let me know if you need another copy of the statement or if anything requires clarification.

Best regards,
Finance Operations Team`,
    systemPrompt: `You are an accounts receivable assistant. Invoice #INV-2026-891 ($14,250.00) is 10 days past due. Prior reminder sent 5 days ago. Tone: professional, structured, and direct. Inquire if this has entered their weekly accounts payable run. Mention that installment plans are available through their portal if needed.`,
  },
  {
    id: "stage-3",
    stageNumber: 3,
    name: "Operational Warning",
    shortName: "Operational Warning",
    timing: "Days 15–21 Overdue",
    tone: "Formal, firm, and focused on account balance reconciliation.",
    urgencyLevel: 3,
    accentColor: "amber",
    badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    objective:
      "Escalate beyond routine AP staff to department heads and procurement sponsors to unblock approvals and highlight deliverable continuity.",
    guardrails: [
      "CCs executive account owner and billing signatories.",
      "Clear articulation of overdue balance and aging bucket.",
      "Strict avoidance of abusive language or statutory threats.",
      "Elevates predictive delinquency risk score in ERP.",
    ],
    sampleSubject: "Action Required: Overdue Account Reconciliation (#INV-2026-891)",
    sampleBody: `Dear Alex and Accounts Payable Team,

Our records indicate that invoice #INV-2026-891 ($14,250.00) is now 18 days past due despite previous reminders.

To ensure uninterrupted delivery of ongoing project milestones and protect active credit terms, we require settlement or an agreed remittance confirmation by this Friday.

Immediate portal settlement link:
https://billing.yourcompany.com/i/tok_89f92a01

If there is an unaddressed dispute or discrepancy preventing sign-off, please reply directly to this notice so our team can expedite a resolution today.

Sincerely,
Credit & Accounts Receivable Operations`,
    systemPrompt: `Invoice #INV-2026-891 ($14,250.00) is now 18 days past due. Tone: serious, firm, and urgent. Highlight that continued delay may affect active service availability and commercial credit terms. Urge immediate resolution via the secure link. Maintain professional decorum.`,
  },
  {
    id: "stage-4",
    stageNumber: 4,
    name: "Formal Pre-Legal Demand",
    shortName: "Pre-Legal Demand",
    timing: "Days 22–30 Overdue",
    tone: "Strict, authoritative, uncompromising, and outlining contract terms.",
    urgencyLevel: 4,
    accentColor: "orange",
    badgeColor: "text-orange-400 bg-orange-500/10 border-orange-500/20",
    objective:
      "Establish a concrete deadline cutoff before automated systems freeze and the file is forwarded to executive leadership and recovery counsel.",
    guardrails: [
      "Delivered with automated DKIM/DMARC delivery receipts.",
      "Cites master service agreement terms and grace period limits.",
      "Mandatory 4-business-day cure notice window.",
      "Final automated stage before irreversible Stage 5 cutoff.",
    ],
    sampleSubject: "DEMAND NOTICE: Final Warning for Overdue Invoice #INV-2026-891",
    sampleBody: `DEMAND NOTICE: Final Warning for Overdue Invoice #INV-2026-891

Dear Alex and Executive Management,

Your account is now 26 days overdue with an outstanding balance of $14,250.00. Despite multiple prior notices, this obligation has not been resolved.

This communication serves as formal notice that full payment must be received within four (4) business days (by Friday, 5:00 PM EST). Failure to settle by this deadline will result in immediate suspension of all services and escalation to corporate legal recovery counsel.

Remit payment immediately via secure link to avoid escalation fees:
https://billing.yourcompany.com/i/tok_89f92a01

If remittance has already been initiated, please provide the bank transaction reference number immediately in reply to this message.

Office of the Chief Financial Officer
Finance Management Group`,
    systemPrompt: `Invoice #INV-2026-891 ($14,250.00) is 26 days past due. This is the final notice before automated systems freeze. Tone: formal, uncompromising, and urgent. State strict 4-business-day deadline before file transfer to legal recovery counsel.`,
  },
  {
    id: "stage-5",
    stageNumber: 5,
    name: "Stage 5 Hard Legal Stop",
    shortName: "Hard Legal Stop",
    timing: "Days 31+ Overdue (AI Frozen)",
    tone: "Hardcoded compliance lock — AI autonomous actions permanently halted.",
    urgencyLevel: 5,
    accentColor: "rose",
    badgeColor: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    objective:
      "Prevent AI hallucinations, regulatory non-compliance, and legal liabilities by halting all autonomous communications and handing the case to human legal counsel.",
    guardrails: [
      "AI is strictly prohibited from sending emails, SMS, or notices.",
      "Hard code block in backend/src/modules/agent/agent.service.ts.",
      "Case file automatically exports tamper-proof audit log.",
      "Requires two-factor human executive sign-off for legal action.",
    ],
    isLegalStop: true,
    sampleSubject: "[HALTED] Case Referred to Human Counsel: Acme Corp",
    sampleBody: `=== AUTONOMOUS DISPATCH CIRCUIT BREAKER ACTIVATED ===

Notice ID: AUDIT-LGL-2026-0891
Status: AUTONOMOUS TRANSMISSION FROZEN (STAGE 5 LOCK)
Debtor Entity: Acme Corp (Tax ID: 94-8192841)
Outstanding Principal: $14,250.00
Aging: 33 Days Past Due

Compliance Safeguard:
In accordance with fair debt collection regulations (FDCPA) and commercial dispute statutes, the Jaktra AI Agent has permanently disengaged from automated debtor communication.

Audit Log Summary:
• Stage 1 (Day 3): Polite Courtesy Notice [Delivered, Opened]
• Stage 2 (Day 10): Commercial Follow-Up [Delivered, Portal Visited]
• Stage 3 (Day 18): Operational Warning [Delivered, No Reply]
• Stage 4 (Day 26): Formal Demand Notice [Delivered, Signed Receipt]
• Dispute Status: No dispute filed by debtor.

Next Steps:
This file is locked and assigned to: Chief Legal Officer / External Recovery Counsel. Human authorization is strictly required for statutory demand or collections referral.`,
    systemPrompt: `[SYSTEM OVERRIDE]: Invoice #INV-2026-891 has reached 31+ days past due. Automated outreach has been permanently terminated by Jaktra's Stage 5 Legal Stop. No further automated communications may be generated.`,
  },
];

export function StageTimelineStepper({
  stages = DEFAULT_STAGES,
}: {
  stages?: StageData[];
}) {
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"email" | "prompt">("email");
  const [copied, setCopied] = useState(false);

  const activeStage = stages[activeStageIndex];

  const handleCopy = () => {
    const textToCopy =
      activeTab === "email"
        ? `Subject: ${activeStage.sampleSubject}\n\n${activeStage.sampleBody}`
        : activeStage.systemPrompt;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Color schemes for urgency levels
  const getUrgencyColor = (level: number) => {
    switch (level) {
      case 1:
        return {
          bar: "bg-blue-400",
          text: "text-blue-400",
          bg: "bg-blue-500/10",
          border: "border-blue-500/30",
          glow: "shadow-blue-500/10",
          label: "Low Urgency · Collaborative",
        };
      case 2:
        return {
          bar: "bg-cyan-400",
          text: "text-cyan-400",
          bg: "bg-cyan-500/10",
          border: "border-cyan-500/30",
          glow: "shadow-cyan-500/10",
          label: "Moderate Urgency · Structured",
        };
      case 3:
        return {
          bar: "bg-amber-400",
          text: "text-amber-400",
          bg: "bg-amber-500/10",
          border: "border-amber-500/30",
          glow: "shadow-amber-500/10",
          label: "Elevated Urgency · Firm Stance",
        };
      case 4:
        return {
          bar: "bg-orange-500",
          text: "text-orange-400",
          bg: "bg-orange-500/10",
          border: "border-orange-500/30",
          glow: "shadow-orange-500/10",
          label: "High Urgency · Pre-Legal Cutoff",
        };
      case 5:
      default:
        return {
          bar: "bg-rose-500",
          text: "text-rose-400",
          bg: "bg-rose-500/10",
          border: "border-rose-500/30",
          glow: "shadow-rose-500/20",
          label: "Critical · Hard Legal Circuit Breaker",
        };
    }
  };

  const urgencyStyle = getUrgencyColor(activeStage.urgencyLevel);

  return (
    <div className="w-full bg-[#0a0a0c] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl transition-all">
      {/* Top Header & Mission Control Bar */}
      <div className="p-5 sm:p-6 bg-gradient-to-b from-white/[0.03] to-transparent border-b border-white/[0.08]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-[#b7d2f8] animate-pulse" />
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Interactive 5-Stage Tone Escalation Ladder
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Step through each aging milestone to observe how communication tone, psychological leverage, and compliance guardrails modulate.
            </p>
          </div>

          {/* Engine Status Beacon */}
          <div className="flex items-center gap-2 shrink-0">
            {activeStage.isLegalStop ? (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-medium text-rose-300 bg-rose-500/15 border border-rose-500/30 shadow-lg shadow-rose-950/40">
                <Lock className="w-3.5 h-3.5 text-rose-400" />
                <span>Stage 5 Circuit Breaker Active (AI Frozen)</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-medium text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 shadow-lg shadow-emerald-950/20">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Autonomous Agent Active · Groq LLaMA 3.1</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Responsive Horizontal Stepper Navigation Bar */}
      <div className="p-4 sm:p-6 border-b border-white/[0.06] bg-[#070709]">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
          {stages.map((stg, idx) => {
            const isCurrent = idx === activeStageIndex;
            const stageUrgency = getUrgencyColor(stg.urgencyLevel);

            return (
              <button
                key={stg.id}
                type="button"
                onClick={() => setActiveStageIndex(idx)}
                className={`relative text-left p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between min-h-[92px] ${
                  isCurrent
                    ? `${stageUrgency.bg} ${stageUrgency.border} shadow-lg ring-1 ring-white/10`
                    : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.12] text-zinc-400"
                }`}
              >
                {/* Active indicator bar on top */}
                {isCurrent && (
                  <span
                    className={`absolute top-0 left-3 right-3 h-[2px] rounded-full ${stageUrgency.bar}`}
                  />
                )}

                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                      stg.isLegalStop
                        ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                        : isCurrent
                        ? `${stageUrgency.bg} ${stageUrgency.text} ${stageUrgency.border}`
                        : "bg-white/[0.04] text-zinc-400 border-white/[0.08]"
                    }`}
                  >
                    Stage 0{stg.stageNumber}
                  </span>
                  {stg.isLegalStop ? (
                    <Lock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  ) : (
                    <span className="text-[11px] font-mono text-zinc-500">
                      {stg.urgencyLevel * 20}%
                    </span>
                  )}
                </div>

                <div>
                  <h4
                    className={`text-xs sm:text-sm font-semibold tracking-tight leading-snug ${
                      isCurrent ? "text-white" : "text-zinc-300"
                    }`}
                  >
                    {stg.shortName}
                  </h4>
                  <p className="text-[11px] font-mono text-zinc-500 mt-0.5 whitespace-nowrap">
                    {stg.timing}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Global Urgency Meter Bar */}
        <div className="mt-5 pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Zap className={`w-4 h-4 ${urgencyStyle.text}`} />
            <span className="text-zinc-400 font-medium">Escalation Urgency Index:</span>
            <span className={`font-mono font-bold ${urgencyStyle.text}`}>
              {activeStage.urgencyLevel * 20}% — {urgencyStyle.label}
            </span>
          </div>

          <div className="w-full sm:w-64 h-2 rounded-full bg-white/[0.06] overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-300 ${urgencyStyle.bar}`}
              style={{ width: `${activeStage.urgencyLevel * 20}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Two-Panel Workspace */}
      <div className="p-5 sm:p-7 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: AI Parameters, Strategy & Compliance Guardrails */}
        <div className="lg:col-span-5 space-y-4">
          {/* Active Stage Overview Card */}
          <div className="p-4 sm:p-5 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#b7d2f8] font-semibold">
                Strategy &amp; Stance
              </span>
              <span className="text-xs font-mono text-zinc-400">{activeStage.timing}</span>
            </div>
            <div>
              <h4 className="text-base font-bold text-white mb-1">
                Stage {activeStage.stageNumber}: {activeStage.name}
              </h4>
              <p className="text-xs text-zinc-300 leading-relaxed">
                {activeStage.tone}
              </p>
            </div>
          </div>

          {/* Core AI Objective */}
          <div className="p-4 sm:p-5 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-2">
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-[#b7d2f8] font-semibold">
              <Brain className="w-3.5 h-3.5" />
              <span>Agent Strategic Objective</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {activeStage.objective}
            </p>
          </div>

          {/* Institutional Compliance Guardrails */}
          <div className="p-4 sm:p-5 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-3">
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-[#b7d2f8] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Active Compliance Circuit Breakers</span>
            </div>
            <ul className="space-y-2.5">
              {activeStage.guardrails.map((rule, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-zinc-300 leading-snug">
                  <CheckCircle2 className="w-4 h-4 text-[#b7d2f8] shrink-0 mt-0.5" />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: High-Fidelity Dispatch Preview (Email / Audit Screen) */}
        <div className="lg:col-span-7 bg-[#050507] border border-white/[0.1] rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between">
          <div>
            {/* Realistic Window Chrome / Header */}
            <div className="p-3.5 sm:p-4 bg-[#0d0e12] border-b border-white/[0.08] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {/* Micro Window Dots */}
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                </div>
                <div className="h-3.5 w-px bg-white/10" />
                <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                  {activeStage.isLegalStop ? (
                    <span className="flex items-center gap-1.5 text-rose-400 font-semibold">
                      <Lock className="w-3.5 h-3.5" />
                      Tamper-Proof Audit Terminal
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-zinc-300">
                      <Mail className="w-3.5 h-3.5 text-[#b7d2f8]" />
                      Autonomous Outreach Dispatch
                    </span>
                  )}
                </div>
              </div>

              {/* View Switcher & Copy Action */}
              <div className="flex items-center gap-2">
                <div className="flex items-center rounded-lg bg-black/60 p-0.5 border border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => setActiveTab("email")}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                      activeTab === "email"
                        ? "bg-white text-zinc-950 font-semibold shadow"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {activeStage.isLegalStop ? "Audit View" : "Email Preview"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("prompt")}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                      activeTab === "prompt"
                        ? "bg-white text-zinc-950 font-semibold shadow"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    System Prompt
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-medium">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Email Client Metadata Row (when tab is email and not legal stop) */}
            {activeTab === "email" && !activeStage.isLegalStop && (
              <div className="p-4 bg-[#08080a] border-b border-white/[0.06] text-xs space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-zinc-400">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500 font-mono w-14">From:</span>
                    <span className="text-zinc-200">Finance Operations &lt;ar-agent@yourcompany.com&gt;</span>
                  </div>
                  <span className="font-mono text-[11px] text-zinc-500">Groq LLaMA 3.1 70B</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400">
                  <span className="text-zinc-500 font-mono w-14">To:</span>
                  <span className="text-zinc-200">Alex Morgan &lt;alex@acmecorp.com&gt; (VP Finance)</span>
                </div>
                <div className="flex items-start gap-2 pt-1 border-t border-white/[0.04]">
                  <span className="text-zinc-500 font-mono w-14 shrink-0">Subject:</span>
                  <span className="text-white font-semibold">{activeStage.sampleSubject}</span>
                </div>
              </div>
            )}

            {/* Content Area */}
            <div className="p-5 sm:p-6 text-xs sm:text-sm">
              {activeTab === "prompt" ? (
                /* System Prompt Directive View */
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-zinc-400 pb-2 border-b border-white/[0.06]">
                    <span className="font-mono text-[#b7d2f8]">groq_llama_3_1_system_prompt.txt</span>
                    <span className="font-mono text-zinc-500">temperature: 0.2 · top_p: 0.9</span>
                  </div>
                  <div className="p-4 rounded-xl bg-black/80 border border-white/[0.08] font-mono text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed select-all">
                    {activeStage.systemPrompt}
                  </div>
                </div>
              ) : activeStage.isLegalStop ? (
                /* Stage 5 Hard Legal Stop View */
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-sm text-rose-300">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>AUTONOMOUS DISPATCH CIRCUIT BREAKER ACTIVATED</span>
                    </div>
                    <p className="text-xs text-rose-200/90 leading-relaxed">
                      At 31+ days overdue, Jaktra hardcodes an emergency stop in{" "}
                      <code className="font-mono text-rose-300 bg-rose-950/40 px-1 py-0.5 rounded">
                        backend/src/modules/agent/agent.service.ts
                      </code>
                      . All generative AI messaging is locked to prevent FDCPA harassment liabilities.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-black/60 border border-white/[0.08] font-mono text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed">
                    {activeStage.sampleBody}
                  </div>
                </div>
              ) : (
                /* Readable, Formatted Email Body */
                <div className="space-y-4 text-zinc-200 leading-relaxed">
                  <div className="whitespace-pre-line font-sans text-xs sm:text-sm text-zinc-200 leading-relaxed">
                    {activeStage.sampleBody}
                  </div>

                  {/* Tokenized Payment Link Card Preview */}
                  <div className="mt-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.1] hover:border-white/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#b7d2f8]/10 border border-[#b7d2f8]/20 flex items-center justify-center text-[#b7d2f8] shrink-0">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">
                          Invoice #INV-2026-891 ($14,250.00)
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          Secure 1-Click Settlement · Zero Login Required
                        </div>
                      </div>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#b7d2f8] text-zinc-950 text-xs font-bold shrink-0 shadow-md">
                      <span>Clear Payment</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Stage 2 Installment Plan Callout */}
                  {activeStage.stageNumber === 2 && (
                    <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-200 flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>
                        Automated 3-week installment breakdown ($4,750.00/wk) offered with instant bank pre-authorization.
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action indicator footer */}
          <div className="px-5 py-3.5 bg-[#08080a] border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-zinc-400">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Dynamic variable hydration via ERP &amp; Stripe webhooks
            </span>
            <span className="font-mono text-zinc-400">
              Deterministic Guardrail Validation · 100% Passed
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StageTimelineStepper;

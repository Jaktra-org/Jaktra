import { useState } from "react";
import {
  Sparkles,
  ShieldAlert,
  User,
} from "lucide-react";

interface DisputeCase {
  id: string;
  sender: string;
  subject: string;
  receivedAt: string;
  classification: "DISPUTE_RAISED" | "INSTALLMENT_REQUEST" | "PROMISE_TO_PAY";
  confidence: number;
  pauseEscalation: boolean;
  incomingText: string;
  aiProposedAction: string;
  draftResponse: string;
}

const SAMPLE_CASES: DisputeCase[] = [
  {
    id: "case-1",
    sender: "cfo@technovate.io",
    subject: "Re: Invoice #INV-4921 — Billable hours query",
    receivedAt: "12 mins ago",
    classification: "DISPUTE_RAISED",
    confidence: 96.8,
    pauseEscalation: true,
    incomingText:
      "Hi team, we received invoice #INV-4921 for $18,400. However, Section 3 includes 42 hours of QA testing that was supposed to be absorbed under our sprint warranty. We will hold payment until this is clarified.",
    aiProposedAction:
      "Autonomous collections instantly paused. Escalation timer frozen. Dispute ticket created and routed to Lead Project Manager with timesheet breakdown.",
    draftResponse:
      "Hi Michael, thank you for flagging this. I have immediately placed your invoice escalation on hold so no automated reminders will be sent. I have pulled the timesheet records for Sprint 14 QA testing and routed this to Sarah (Lead PM) for immediate review and adjustment today.",
  },
  {
    id: "case-2",
    sender: "ap@globalfreight.com",
    subject: "Invoice #INV-4910 payment schedule",
    receivedAt: "44 mins ago",
    classification: "INSTALLMENT_REQUEST",
    confidence: 94.2,
    pauseEscalation: true,
    incomingText:
      "We had unexpected supply chain hold-ups this month. Can we break the $24,000 balance into 3 equal bi-weekly payments starting this Friday?",
    aiProposedAction:
      "Generated 3-part installment schedule ($8,000 every 14 days) via tokenized debtor portal. Automated reminders updated to match the new installment milestones.",
    draftResponse:
      "Hi David, absolutely. We have set up a 3-part payment schedule of $8,000 bi-weekly. You can review the installment schedule and authorize the first installment via your secure portal link: https://billing.yourcompany.com/i/tok_sched_771",
  },
];

export function DisputeTriageMockup() {
  const [selectedCaseIndex, setSelectedCaseIndex] = useState(0);
  const activeCase = SAMPLE_CASES[selectedCaseIndex];

  return (
    <div className="w-full bg-[#0f1011] border border-[#23252a] rounded-xl overflow-hidden shadow-2xl">
      {/* Titlebar */}
      <div className="bg-[#141516] border-b border-[#23252a] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <span className="text-xs font-mono text-zinc-400 pl-2 border-l border-white/[0.08]">
            jaktra-agent &bull; dispute-triage-engine &bull; active-inbox
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-zinc-400">NLP Classification Model: LLaMA 3.1 70B</span>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-white/[0.08]">
        {/* Left Column: Triage Queue (4 cols) */}
        <div className="md:col-span-4 bg-[#0e0f11] p-3 space-y-2">
          <div className="text-[11px] font-mono text-zinc-500 uppercase px-2 py-1">
            Inbound Debtor Inquiries ({SAMPLE_CASES.length})
          </div>

          {SAMPLE_CASES.map((item, idx) => {
            const isSelected = idx === selectedCaseIndex;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedCaseIndex(idx)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  isSelected
                    ? "bg-white/[0.08] border-white/20 shadow-md"
                    : "bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.04] text-zinc-400"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-white truncate max-w-[160px]">
                    {item.sender}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">{item.receivedAt}</span>
                </div>
                <p className="text-xs text-zinc-300 truncate mb-2">{item.subject}</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {item.classification === "DISPUTE_RAISED" ? "Dispute Detected" : "Installment Request"}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    {item.confidence}% AI
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Case Analysis & Automation (8 cols) */}
        <div className="md:col-span-8 bg-[#0a0a0c] p-5 space-y-5">
          {/* Dispute Status Banner */}
          <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-xs font-semibold text-white">
                  Automated Collections Paused &bull; Dispute Freeze Active
                </div>
                <div className="text-xs text-zinc-300 mt-0.5">
                  Jaktra automatically suspended all overdue reminder cadences to protect client goodwill while this issue is under review.
                </div>
              </div>
            </div>
            <span className="text-[10px] font-mono text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30 flex-shrink-0">
              PROTECTED
            </span>
          </div>

          {/* Incoming Message Box */}
          <div className="p-4 rounded-lg bg-[#0e0f11] border border-white/[0.06]">
            <div className="flex items-center gap-2 text-xs text-zinc-400 mb-2">
              <User className="w-3.5 h-3.5 text-zinc-400" />
              <span className="font-semibold text-white">{activeCase.sender}</span>
              <span>wrote:</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed italic bg-white/[0.02] p-3 rounded border border-white/[0.04]">
              &ldquo;{activeCase.incomingText}&rdquo;
            </p>
          </div>

          {/* AI Decision & Autonomous Action */}
          <div className="p-4 rounded-lg bg-[#0e0f11] border border-white/[0.06] space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <Sparkles className="w-4 h-4 text-[#b7d2f8]" />
              <span>AI Engine Action:</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {activeCase.aiProposedAction}
            </p>

            <div className="pt-3 border-t border-white/[0.06]">
              <div className="text-[11px] font-mono text-zinc-400 mb-2">
                AUTO-COMPOSED RESOLUTION DRAFT:
              </div>
              <div className="p-3 rounded bg-[#141516] border border-[#23252a] text-xs font-mono text-zinc-300 leading-relaxed">
                {activeCase.draftResponse}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

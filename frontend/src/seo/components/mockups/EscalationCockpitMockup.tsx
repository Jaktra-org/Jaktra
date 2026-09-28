import { useState } from "react";
import {
  Clock,
  Lock,
  CheckCircle2,
} from "lucide-react";

export function EscalationCockpitMockup() {
  const [selectedStage, setSelectedStage] = useState<number>(3);

  const stages = [
    { num: 1, label: "Warm Notice", dso: "D+1", tone: "Collaborative" },
    { num: 2, label: "Commercial Follow", dso: "D+8", tone: "Inquiry" },
    { num: 3, label: "Urgent Demand", dso: "D+15", tone: "Firm Commercial" },
    { num: 4, label: "Executive Notice", dso: "D+31", tone: "Formal Pre-Default" },
    { num: 5, label: "Legal Stop", dso: "D+46+", tone: "Autonomous Freeze" },
  ];

  return (
    <div className="w-full bg-[#0f1011] border border-[#23252a] rounded-xl overflow-hidden shadow-2xl">
      {/* Cockpit Titlebar */}
      <div className="bg-[#141516] border-b border-[#23252a] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <span className="text-xs font-mono text-zinc-400 pl-2 border-l border-white/[0.08]">
            jaktra-daemon &bull; escalation-cockpit &bull; inv_acme_891
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Active Escalation
          </span>
        </div>
      </div>

      {/* Invoice Overview Bar */}
      <div className="p-4 sm:p-5 border-b border-white/[0.06] bg-[#0e0f11] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1">
            <span>Invoice #INV-2026-891</span>
            <span>&bull;</span>
            <span className="text-white font-medium">Acme Corporation Inc.</span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-semibold text-white tracking-tight">$14,250.00</span>
            <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              18 Days Overdue
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-[11px] font-mono text-zinc-500">Predicted Pay Probability</div>
            <div className="text-sm font-semibold font-mono text-[#b7d2f8]">88.4% via Razorpay</div>
          </div>
        </div>
      </div>

      {/* Interactive Stage Stepper Indicator */}
      <div className="p-4 sm:p-6 bg-[#0a0a0c]">
        <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-4 flex items-center justify-between">
          <span>Escalation Trajectory</span>
          <span className="text-[11px] text-zinc-500 lowercase">Click nodes to inspect generated drafts</span>
        </div>

        <div className="grid grid-cols-5 gap-2 relative">
          {stages.map((stg) => {
            const isSelected = selectedStage === stg.num;
            const isPassed = stg.num < selectedStage;

            return (
              <button
                key={stg.num}
                type="button"
                onClick={() => setSelectedStage(stg.num)}
                className={`p-2.5 sm:p-3 rounded-lg border text-left transition-all ${
                  isSelected
                    ? "bg-[#141517] border-white/20 shadow-md ring-1 ring-white/10"
                    : isPassed
                    ? "bg-white/[0.02] border-white/[0.05] text-zinc-400"
                    : "bg-white/[0.01] border-white/[0.03] text-zinc-500"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-[10px] font-mono px-1 py-0.5 rounded ${
                      isSelected
                        ? "bg-[#5e6ad2]/20 text-[#b7d2f8]"
                        : "bg-white/[0.05] text-zinc-400"
                    }`}
                  >
                    Stage {stg.num}
                  </span>
                  {stg.num === 5 ? (
                    <Lock className="w-3 h-3 text-rose-400" />
                  ) : isPassed ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Clock className="w-3 h-3 text-zinc-500" />
                  )}
                </div>
                <div className="text-xs font-semibold text-white truncate">{stg.label}</div>
                <div className="text-[10px] font-mono text-zinc-500 mt-0.5">{stg.dso}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Split Details: Reasoning + Autonomous Draft */}
      <div className="p-4 sm:p-6 border-t border-white/[0.06] bg-[#0e0f11] grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        {/* Left: AI Diagnostics (5 cols) */}
        <div className="md:col-span-5 space-y-3">
          <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
            <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">
              Autonomous Decision Logic
            </span>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {selectedStage === 5
                ? "Hardcoded legal safety tripwire hit at D+46. Autonomous sending blocked. Case file compiled for legal counsel."
                : `Stage ${selectedStage} triggered due to lack of payment acknowledgment after 2 previous touches. Tone calibrated to maintain client goodwill while securing definite payment commitment.`}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
            <span className="text-xs text-zinc-400">Recipient Sentiment</span>
            <span className="text-xs font-mono text-[#b7d2f8] bg-[#5e6ad2]/20 px-2 py-0.5 rounded border border-[#5e6ad2]/30">
              Low Friction / Non-Disputed
            </span>
          </div>

          <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
            <span className="text-xs text-zinc-400">Idempotency Guard</span>
            <span className="text-xs font-mono text-emerald-400">20-Hour Minimum Gap OK</span>
          </div>
        </div>

        {/* Right: Email Preview Box (7 cols) */}
        <div className="md:col-span-7 bg-[#141516] border border-[#23252a] rounded-lg p-4 font-mono text-xs text-zinc-300">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.06] text-zinc-500 text-[11px]">
            <span>OUTGOING DISPATCH (STAGE {selectedStage})</span>
            <span>AUTONOMOUS</span>
          </div>
          <div className="text-zinc-400 text-xs mb-2">
            <span className="text-zinc-600">To: </span> alex.reyes@acme.com, ap@acme.com
          </div>
          <div className="text-zinc-200 text-xs font-medium mb-3">
            <span className="text-zinc-600">Subject: </span>
            {selectedStage === 1 && "Reminder: Invoice #INV-2026-891 due for Acme Corp"}
            {selectedStage === 2 && "Payment update request: Invoice #INV-2026-891 ($14,250.00)"}
            {selectedStage === 3 && "Action Required: Overdue Account Reconciliation (#INV-2026-891)"}
            {selectedStage === 4 && "Urgent: Formal Notice of Impending Account Suspension"}
            {selectedStage === 5 && "[CIRCUIT BREAKER] Autonomous Engine Halted - Human Sign-off Required"}
          </div>
          <div className="p-3 rounded bg-[#0e0f11] border border-white/[0.04] text-[11px] leading-relaxed text-zinc-300">
            {selectedStage === 3 ? (
              <>
                Hi Alex and AP Team,
                <br /><br />
                Our records show invoice #INV-2026-891 for $14,250.00 is now 18 days past due. To prevent any disruption to your active enterprise services, please confirm payment today:
                <br /><br />
                <span className="text-[#b7d2f8] underline">https://billing.yourcompany.com/i/tok_89f92a01</span>
                <br /><br />
                You can settle immediately via Razorpay or select a 3-week installment schedule directly from the portal.
              </>
            ) : selectedStage === 5 ? (
              <span className="text-rose-400">
                [ALERT] Escalation passed D+45 without payment. Autonomous generation suspended. Legal demand letter generated for manual signature.
              </span>
            ) : (
              <>
                Courtesy communication generated automatically. Tone dynamically adapted for commercial goodwill and immediate settlement.
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

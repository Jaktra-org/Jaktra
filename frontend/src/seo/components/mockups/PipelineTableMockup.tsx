import { useState } from "react";

interface PipelineInvoice {
  id: string;
  client: string;
  amount: number;
  dueDate: string;
  dsoOverdue: number;
  stage: number;
  stageName: string;
  riskTier: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  lastAction: string;
  nextAllowedAction: string;
}

const SAMPLE_PIPELINE: PipelineInvoice[] = [
  {
    id: "INV-9021",
    client: "Apex Logistics LLC",
    amount: 28500,
    dueDate: "2026-09-12",
    dsoOverdue: 23,
    stage: 3,
    stageName: "Urgent Review",
    riskTier: "HIGH",
    lastAction: "Reminded 22h ago",
    nextAllowedAction: "Ready (20h window met)",
  },
  {
    id: "INV-9018",
    client: "CloudScale Systems",
    amount: 9400,
    dueDate: "2026-09-28",
    dsoOverdue: 7,
    stage: 1,
    stageName: "Warm Reminder",
    riskTier: "LOW",
    lastAction: "Sent 4h ago",
    nextAllowedAction: "Cooling down (16h left)",
  },
  {
    id: "INV-8994",
    client: "BioPharm Solutions",
    amount: 41200,
    dueDate: "2026-08-18",
    dsoOverdue: 48,
    stage: 5,
    stageName: "Legal Stop",
    riskTier: "CRITICAL",
    lastAction: "Halted at D+46",
    nextAllowedAction: "Human Counsel Sign-off",
  },
  {
    id: "INV-9032",
    client: "Vertex Media Works",
    amount: 12800,
    dueDate: "2026-09-21",
    dsoOverdue: 14,
    stage: 2,
    stageName: "Commercial Follow",
    riskTier: "MEDIUM",
    lastAction: "Portal viewed 1d ago",
    nextAllowedAction: "Ready for installment nudge",
  },
];

export function PipelineTableMockup() {
  const [filter, setFilter] = useState<string>("ALL");

  const filtered =
    filter === "ALL"
      ? SAMPLE_PIPELINE
      : SAMPLE_PIPELINE.filter((inv) => inv.riskTier === filter);

  return (
    <div className="w-full bg-[#0a0a0c] border border-white/[0.08] rounded-xl overflow-hidden shadow-2xl">
      {/* Title Header */}
      <div className="bg-[#121316] border-b border-white/[0.08] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <span className="text-xs font-mono text-zinc-400 pl-2 border-l border-white/[0.08]">
            jaktra-cockpit &bull; aging-pipeline &bull; autonomous-queue
          </span>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1">
          {["ALL", "LOW", "MEDIUM", "HIGH", "CRITICAL"].map((tier) => (
            <button
              key={tier}
              type="button"
              onClick={() => setFilter(tier)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                filter === tier
                  ? "bg-white text-black font-semibold"
                  : "text-zinc-500 hover:text-white"
              }`}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[640px]">
          <thead>
            <tr className="border-b border-white/[0.06] bg-[#0e0f11] text-[11px] font-mono uppercase tracking-wider text-zinc-500">
              <th className="py-3 px-4">Invoice & Client</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Aging / DSO</th>
              <th className="py-3 px-4">Escalation Stage</th>
              <th className="py-3 px-4">Risk Tier</th>
              <th className="py-3 px-4 text-right">Idempotency Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04] text-xs">
            {filtered.map((inv) => (
              <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                {/* Client */}
                <td className="py-3 px-4">
                  <div className="font-semibold text-white">{inv.client}</div>
                  <div className="text-[11px] font-mono text-zinc-500">{inv.id}</div>
                </td>

                {/* Amount */}
                <td className="py-3 px-4 font-mono font-medium text-white">
                  ${inv.amount.toLocaleString()}
                </td>

                {/* Aging */}
                <td className="py-3 px-4">
                  <span
                    className={`font-mono text-xs ${
                      inv.dsoOverdue >= 30
                        ? "text-rose-400"
                        : inv.dsoOverdue >= 15
                        ? "text-amber-400"
                        : "text-zinc-400"
                    }`}
                  >
                    +{inv.dsoOverdue}d overdue
                  </span>
                </td>

                {/* Stage */}
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono ${
                      inv.stage === 5
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        : "bg-white/[0.05] text-zinc-300 border border-white/[0.08]"
                    }`}
                  >
                    Stage {inv.stage}: {inv.stageName}
                  </span>
                </td>

                {/* Risk Tier */}
                <td className="py-3 px-4">
                  <span
                    className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded ${
                      inv.riskTier === "CRITICAL"
                        ? "text-rose-400 bg-rose-500/10 border border-rose-500/20"
                        : inv.riskTier === "HIGH"
                        ? "text-orange-400 bg-orange-500/10 border border-orange-500/20"
                        : inv.riskTier === "MEDIUM"
                        ? "text-amber-400 bg-amber-500/10 border border-amber-500/20"
                        : "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                    }`}
                  >
                    {inv.riskTier}
                  </span>
                </td>

                {/* Idempotency Window */}
                <td className="py-3 px-4 text-right font-mono text-[11px] text-zinc-400">
                  {inv.nextAllowedAction}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { useState } from "react";
import {
  CreditCard,
  Lock,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Download,
} from "lucide-react";

export function DebtorPortalMockup() {
  const [selectedPlan, setSelectedPlan] = useState<"full" | "2x" | "3x">("full");
  const totalAmount = 14250.0;

  return (
    <div className="w-full max-w-2xl mx-auto bg-[#0f1011] border border-[#23252a] rounded-2xl overflow-hidden shadow-2xl">
      {/* Browser Bar */}
      <div className="bg-[#141516] border-b border-[#23252a] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <div className="bg-[#010102] px-3 py-1 rounded text-xs font-mono text-[#8a8f98] border border-[#23252a] flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>billing.acmecloud.com/i/tok_89f92a01</span>
          </div>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          Zero-Login Protected
        </span>
      </div>

      {/* Invoice Portal Body */}
      <div className="p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-mono text-zinc-500 uppercase">Statement of Account</div>
            <h4 className="text-xl font-semibold text-white tracking-tight">Invoice #INV-2026-891</h4>
            <p className="text-xs text-zinc-400 mt-0.5">Billed to Acme Corporation Inc.</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-semibold text-white tracking-tight font-mono">
              ${totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <span className="text-xs text-amber-400 font-mono">Due on Oct 1, 2026</span>
          </div>
        </div>

        {/* 1-Click Payment Option Selector */}
        <div className="space-y-3">
          <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider flex items-center justify-between">
            <span>Select Remittance Option</span>
            <span className="text-emerald-400 font-normal">Zero Processing Surcharge</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Pay Full */}
            <button
              type="button"
              onClick={() => setSelectedPlan("full")}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                selectedPlan === "full"
                  ? "bg-white/[0.08] border-[#5e6ad2] ring-1 ring-[#5e6ad2]"
                  : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-white">Pay in Full</span>
                {selectedPlan === "full" && <CheckCircle2 className="w-4 h-4 text-[#b7d2f8]" />}
              </div>
              <div className="text-sm font-semibold text-white font-mono">
                ${totalAmount.toLocaleString()}
              </div>
              <div className="text-[10px] text-zinc-400 mt-1">Instant clearance</div>
            </button>

            {/* 2x Installments */}
            <button
              type="button"
              onClick={() => setSelectedPlan("2x")}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                selectedPlan === "2x"
                  ? "bg-white/[0.08] border-[#5e6ad2] ring-1 ring-[#5e6ad2]"
                  : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-white">2x Bi-Weekly</span>
                {selectedPlan === "2x" && <CheckCircle2 className="w-4 h-4 text-[#b7d2f8]" />}
              </div>
              <div className="text-sm font-semibold text-white font-mono">
                ${(totalAmount / 2).toLocaleString()} / 2w
              </div>
              <div className="text-[10px] text-zinc-400 mt-1">50% now, 50% in 14d</div>
            </button>

            {/* 3x Installments */}
            <button
              type="button"
              onClick={() => setSelectedPlan("3x")}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                selectedPlan === "3x"
                  ? "bg-white/[0.08] border-[#5e6ad2] ring-1 ring-[#5e6ad2]"
                  : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-white">3x Monthly</span>
                {selectedPlan === "3x" && <CheckCircle2 className="w-4 h-4 text-[#b7d2f8]" />}
              </div>
              <div className="text-sm font-semibold text-white font-mono">
                ${(totalAmount / 3).toLocaleString()} / mo
              </div>
              <div className="text-[10px] text-zinc-400 mt-1">3 equal installments</div>
            </button>
          </div>
        </div>

        {/* 1-Click Pay Button */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold bg-white text-black hover:bg-zinc-200 transition-colors shadow-lg min-h-[48px]"
          >
            <CreditCard className="w-4 h-4 text-[#5e6ad2]" />
            <span>
              Pay Now &bull; $
              {selectedPlan === "full"
                ? totalAmount.toLocaleString()
                : selectedPlan === "2x"
                ? (totalAmount / 2).toLocaleString()
                : (totalAmount / 3).toLocaleString()}{" "}
              via Razorpay
            </span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>

          <div className="flex items-center justify-between text-xs text-zinc-500 pt-1">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              256-bit TLS encrypted &bull; PCI-DSS Level 1
            </span>
            <button type="button" className="hover:text-zinc-300 flex items-center gap-1">
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useMemo } from "react";
import { Clock, TrendingUp, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export interface ROICalculatorWidgetProps {
  defaultArr?: number; // e.g. 5000000 ($5M)
  defaultDso?: number; // e.g. 54 days
  defaultCostOfCapital?: number; // e.g. 8.5%
  industryLabel?: string;
}

export function ROICalculatorWidget({
  defaultArr = 5000000,
  defaultDso = 54,
  defaultCostOfCapital = 8.5,
  industryLabel = "B2B Business",
}: ROICalculatorWidgetProps) {
  const [arr, setArr] = useState<number>(defaultArr);
  const [currentDso, setCurrentDso] = useState<number>(defaultDso);
  const [costOfCapital, setCostOfCapital] = useState<number>(defaultCostOfCapital);

  // Benchmarked average DSO reduction with Jaktra autonomous collections is ~16 days
  const dsoReduction = useMemo(() => {
    return Math.min(Math.round(currentDso * 0.3), 22);
  }, [currentDso]);

  const targetDso = Math.max(currentDso - dsoReduction, 25);

  // Cash flow unlocked = (ARR / 365) * DSO Reduction
  const cashUnlocked = useMemo(() => {
    const dailyRevenue = arr / 365;
    return Math.round(dailyRevenue * dsoReduction);
  }, [arr, dsoReduction]);

  // Annual interest savings = Cash Unlocked * (Cost of Capital / 100)
  const annualSavings = useMemo(() => {
    return Math.round(cashUnlocked * (costOfCapital / 100));
  }, [cashUnlocked, costOfCapital]);

  // AR staff hours saved per month ~ 10 hours per $1M ARR
  const staffHoursSaved = useMemo(() => {
    return Math.min(Math.round((arr / 1000000) * 12), 120);
  }, [arr]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="w-full bg-[#0f1011] border border-[#23252a] rounded-xl p-6 sm:p-8 shadow-2xl">
      {/* Title & Presets */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#23252a]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#5e6ad2]/15 border border-[#5e6ad2]/30 text-xs font-mono text-[#828fff] mb-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-[#5e6ad2]" />
            ROI & CASH FLOW SIMULATOR
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-[#f7f8f8] tracking-tight">
            Calculate Your Working Capital Acceleration ({industryLabel})
          </h3>
        </div>

        {/* ARR Presets */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#8a8f98] font-mono hidden sm:inline">ARR Presets:</span>
          {[1000000, 5000000, 20000000].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setArr(preset)}
              className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                arr === preset
                  ? "bg-[#5e6ad2] text-white font-semibold shadow-sm"
                  : "bg-[#141516] text-[#8a8f98] hover:text-[#f7f8f8] border border-[#23252a]"
              }`}
            >
              ${preset / 1000000}M
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Controls on left, Results on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-6">
        {/* Sliders (Left 7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* ARR Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-[#d0d6e0]">
                Annual B2B Revenue (ARR / Invoiced Volume)
              </label>
              <span className="text-sm font-mono font-semibold text-[#f7f8f8]">
                {formatCurrency(arr)}
              </span>
            </div>
            <input
              type="range"
              min="500000"
              max="30000000"
              step="500000"
              value={arr}
              onChange={(e) => setArr(Number(e.target.value))}
              className="w-full accent-[#5e6ad2] bg-[#141516] h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-[#8a8f98] font-mono mt-1">
              <span>$500k</span>
              <span>$15M</span>
              <span>$30M+</span>
            </div>
          </div>

          {/* Current DSO Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-[#d0d6e0]">
                Current Average Days Sales Outstanding (DSO)
              </label>
              <span className="text-sm font-mono font-semibold text-[#f7f8f8]">
                {currentDso} Days
              </span>
            </div>
            <input
              type="range"
              min="30"
              max="95"
              step="1"
              value={currentDso}
              onChange={(e) => setCurrentDso(Number(e.target.value))}
              className="w-full accent-[#5e6ad2] bg-[#141516] h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-[#8a8f98] font-mono mt-1">
              <span>30 Days (Fast)</span>
              <span>60 Days (Avg)</span>
              <span>90+ Days (Severe Drag)</span>
            </div>
          </div>

          {/* Cost of Capital Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-[#d0d6e0]">
                Cost of Capital / Line of Credit APR
              </label>
              <span className="text-sm font-mono font-semibold text-[#f7f8f8]">
                {costOfCapital.toFixed(1)}%
              </span>
            </div>
            <input
              type="range"
              min="4"
              max="16"
              step="0.5"
              value={costOfCapital}
              onChange={(e) => setCostOfCapital(Number(e.target.value))}
              className="w-full accent-[#5e6ad2] bg-[#141516] h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-[#8a8f98] font-mono mt-1">
              <span>4.0%</span>
              <span>8.5% (Prime)</span>
              <span>16.0%</span>
            </div>
          </div>
        </div>

        {/* Calculated Results Card (Right 5 cols) */}
        <div className="lg:col-span-5 bg-[#141516] border border-[#23252a] rounded-xl p-6 relative overflow-hidden flex flex-col justify-between shadow-lg">
          <div className="space-y-4">
            {/* Primary KPI: Cash Unlocked */}
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#8a8f98] block mb-1">
                Permanent Working Capital Unlocked
              </span>
              <div className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#828fff]">
                {formatCurrency(cashUnlocked)}
              </div>
              <p className="text-xs text-[#8a8f98] mt-1">
                Liquid cash accelerated from uncollected invoices into your bank account.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#23252a]">
              {/* DSO Compression */}
              <div>
                <span className="text-[10px] font-mono text-[#8a8f98] uppercase block">
                  DSO Compression
                </span>
                <span className="text-lg font-semibold text-emerald-400 font-mono">
                  -{dsoReduction} Days
                </span>
                <span className="text-[10px] text-[#8a8f98] block">
                  ({currentDso}d &rarr; {targetDso}d)
                </span>
              </div>

              {/* Annual Interest Saved */}
              <div>
                <span className="text-[10px] font-mono text-[#8a8f98] uppercase block">
                  Interest Expense Saved
                </span>
                <span className="text-lg font-semibold text-[#f7f8f8] font-mono">
                  {formatCurrency(annualSavings)}/yr
                </span>
                <span className="text-[10px] text-[#8a8f98] block">
                  at {costOfCapital}% LOC
                </span>
              </div>
            </div>

            {/* Staff Hours Saved */}
            <div className="p-2.5 rounded-lg bg-[#0f1011] border border-[#23252a] flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-[#5e6ad2] flex-shrink-0" />
              <div className="text-xs text-[#d0d6e0]">
                <span className="font-semibold text-[#f7f8f8]">{staffHoursSaved} hours/month</span> manual follow-up labor eliminated.
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-6 pt-4 border-t border-[#23252a]">
            <Link
              to="/register"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-semibold bg-[#5e6ad2] text-white hover:bg-[#828fff] active:bg-[#5e69d1] transition-colors shadow-sm group min-h-[44px]"
            >
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>Accelerate Your Cash Flow — 100% Free</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

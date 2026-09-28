import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export interface ScorecardVerdictProps {
  competitorName: string;
  verdictSummary?: string;
  jaktraSetupTime?: string;
  competitorSetupTime?: string;
  jaktraPricing?: string;
  competitorPricing?: string;
  jaktraExecution?: string;
  competitorExecution?: string;
  bestForJaktra?: string;
  bestForCompetitor?: string;
}

export function ScorecardVerdict({
  competitorName,
  verdictSummary,
  jaktraSetupTime = "15 minutes (CSV or API)",
  competitorSetupTime = "2 to 6 weeks onboarding",
  jaktraPricing = "100% Free during Early Access",
  competitorPricing = "$500 to $2,500+/month",
  jaktraExecution = "Autonomous Groq LLaMA 3.1 AI Agent",
  competitorExecution = "Scheduled email cadences & manual queues",
  bestForJaktra = "Teams wanting autonomous recovery without extra headcount",
  bestForCompetitor = "Teams wanting manual workflows and reporting dashboards",
}: ScorecardVerdictProps) {
  return (
    <div className="w-full bg-[#0e0f11] border border-white/[0.08] rounded-xl overflow-hidden shadow-lg text-left">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-white/[0.08] bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <h2 className="text-xs sm:text-sm font-semibold text-white tracking-tight">
            Jaktra vs {competitorName} at a Glance
          </h2>
        </div>

        <Link
          to="/register"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white text-black hover:bg-zinc-200 transition-colors shadow-sm group"
        >
          <span>Try Jaktra Free</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Summary Narrative (if provided) */}
      {verdictSummary && (
        <p className="text-xs text-zinc-300 leading-relaxed px-4 sm:px-5 py-3 border-b border-white/[0.06] bg-white/[0.01]">
          {verdictSummary}
        </p>
      )}

      {/* Structured Comparison Spec Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/[0.06] text-zinc-400 font-mono uppercase text-[10px] tracking-wider bg-white/[0.01]">
              <th className="py-2.5 px-4 sm:px-5 font-medium w-1/4 sm:w-1/5">Dimension</th>
              <th className="py-2.5 px-4 sm:px-5 font-semibold text-white w-[37.5%] sm:w-[40%]">
                <span className="inline-flex items-center gap-1.5 text-white">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Jaktra
                </span>
              </th>
              <th className="py-2.5 px-4 sm:px-5 font-medium text-zinc-400 w-[37.5%] sm:w-[40%]">
                {competitorName}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            <tr className="hover:bg-white/[0.02] transition-colors">
              <td className="py-3 px-4 sm:px-5 text-zinc-400 font-mono text-[11px]">Setup Speed</td>
              <td className="py-3 px-4 sm:px-5 font-medium text-white">{jaktraSetupTime}</td>
              <td className="py-3 px-4 sm:px-5 text-zinc-400">{competitorSetupTime}</td>
            </tr>
            <tr className="hover:bg-white/[0.02] transition-colors">
              <td className="py-3 px-4 sm:px-5 text-zinc-400 font-mono text-[11px]">Cost / Pricing</td>
              <td className="py-3 px-4 sm:px-5 font-medium text-white">{jaktraPricing}</td>
              <td className="py-3 px-4 sm:px-5 text-zinc-400">{competitorPricing}</td>
            </tr>
            <tr className="hover:bg-white/[0.02] transition-colors">
              <td className="py-3 px-4 sm:px-5 text-zinc-400 font-mono text-[11px]">Execution Engine</td>
              <td className="py-3 px-4 sm:px-5 font-medium text-white">{jaktraExecution}</td>
              <td className="py-3 px-4 sm:px-5 text-zinc-400">{competitorExecution}</td>
            </tr>
            <tr className="hover:bg-white/[0.02] transition-colors">
              <td className="py-3 px-4 sm:px-5 text-zinc-400 font-mono text-[11px]">Best Fit</td>
              <td className="py-3 px-4 sm:px-5 font-medium text-white leading-relaxed">{bestForJaktra}</td>
              <td className="py-3 px-4 sm:px-5 text-zinc-400 leading-relaxed">{bestForCompetitor}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

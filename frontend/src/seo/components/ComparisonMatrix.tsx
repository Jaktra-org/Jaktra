import { Check, X } from "lucide-react";
import { JaktraLogo } from "@/components/common/JaktraLogo";

export interface ComparisonFeature {
  name: string;
  description?: string;
  jaktra: boolean | string;
  competitor: boolean | string;
  jaktraNote?: string;
  competitorNote?: string;
}

export interface ComparisonCategory {
  categoryName: string;
  features: ComparisonFeature[];
}

export interface ComparisonMatrixProps {
  competitorName: string;
  competitorLogo?: string;
  features?: ComparisonFeature[];
  categories?: ComparisonCategory[];
  title?: string;
  subtitle?: string;
  className?: string;
}

function renderValue(value: boolean | string, isJaktra: boolean) {
  if (typeof value === "boolean") {
    if (value) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
          <Check className="w-3.5 h-3.5" />
          <span>Included</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
        <X className="w-3.5 h-3.5" />
        <span>Unavailable</span>
      </span>
    );
  }

  return (
    <span
      className={`text-xs font-semibold ${
        isJaktra ? "text-[#828fff]" : "text-[#f7f8f8]"
      }`}
    >
      {value}
    </span>
  );
}

export function ComparisonMatrix({
  competitorName,
  competitorLogo,
  features,
  categories,
  title,
  subtitle,
  className = "",
}: ComparisonMatrixProps) {
  const allFeatures: ComparisonFeature[] =
    features && features.length > 0
      ? features
      : categories?.flatMap((c) => c.features) || [];

  return (
    <div className={`w-full ${className}`}>
      {/* Title block (optional) */}
      {(title || subtitle) && (
        <div className="mb-6">
          {title && (
            <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#f7f8f8] mb-2">
              {title}
            </h3>
          )}
          {subtitle && <p className="text-sm text-[#8a8f98] max-w-2xl">{subtitle}</p>}
        </div>
      )}

      {/* Mobile Swipe Affordance Cue */}
      <div className="flex items-center justify-between sm:hidden mb-2 px-1 text-[11px] text-[#8a8f98]">
        <span>Feature Comparison</span>
        <span className="font-mono text-[#828fff] flex items-center gap-1">Swipe to compare →</span>
      </div>

      {/* Matrix Table Wrapper with Horizontal Scroll Affordance */}
      <div className="overflow-x-auto rounded-xl border border-[#23252a] bg-[#0f1011] shadow-xl">
        <table className="w-full text-left border-collapse min-w-[620px]">
          {/* Table Header */}
          <thead>
            <tr className="border-b border-[#23252a] bg-[#141516]">
              <th className="py-4 px-5 text-xs font-mono uppercase tracking-wider text-[#8a8f98] w-5/12">
                Capabilities & Workflows
              </th>
              <th className="py-4 px-5 text-xs font-medium text-[#f7f8f8] w-3.5/12 bg-[#18191a]/40 border-x border-[#23252a]">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-[#23252a] flex items-center justify-center p-0.5 shrink-0">
                    <JaktraLogo size={14} />
                  </div>
                  <span className="font-semibold text-sm text-[#f7f8f8]">Jaktra</span>
                </div>
              </th>
              <th className="py-4 px-5 text-xs font-medium text-[#d0d6e0] w-3.5/12">
                <div className="flex items-center gap-2">
                  {competitorLogo && (
                    <div className="w-5 h-5 rounded bg-white flex items-center justify-center p-0.5 shrink-0 shadow-sm">
                      <img
                        src={competitorLogo}
                        alt={competitorName}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                  <span className="font-semibold text-sm text-[#f7f8f8]">{competitorName}</span>
                </div>
              </th>
            </tr>
          </thead>

          {/* Table Body - Streamlined flat list ordered by importance */}
          <tbody className="divide-y divide-[#23252a]">
            {allFeatures.map((feature, featIdx) => (
              <tr
                key={feature.name || featIdx}
                className="hover:bg-[#141516]/40 transition-colors"
              >
                {/* Capability Name & Description */}
                <td className="py-4 px-5 align-top">
                  <p className="text-xs sm:text-sm font-semibold text-[#f7f8f8] tracking-tight">
                    {feature.name}
                  </p>
                  {feature.description && (
                    <p className="text-xs text-[#8a8f98] mt-1 leading-relaxed max-w-sm">
                      {feature.description}
                    </p>
                  )}
                </td>

                {/* Jaktra Column */}
                <td className="py-4 px-5 align-top bg-[#18191a]/20 border-x border-[#23252a]">
                  <div>{renderValue(feature.jaktra, true)}</div>
                  {feature.jaktraNote && (
                    <p className="text-xs text-[#d0d6e0] mt-1.5 leading-relaxed">
                      {feature.jaktraNote}
                    </p>
                  )}
                </td>

                {/* Competitor Column */}
                <td className="py-4 px-5 align-top">
                  <div>{renderValue(feature.competitor, false)}</div>
                  {feature.competitorNote && (
                    <p className="text-xs text-[#8a8f98] mt-1.5 leading-relaxed">
                      {feature.competitorNote}
                    </p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

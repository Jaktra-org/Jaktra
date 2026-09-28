import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronRight, CheckCircle2, Calendar } from "lucide-react";

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export interface SEOHeroProps {
  badge?: string;
  badgeDotColor?: string;
  title: string | ReactNode;
  description: string;
  primaryCtaText?: string;
  primaryCtaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  trustPill?: string;
  breadcrumbs?: BreadcrumbItem[];
  children?: ReactNode;
  className?: string;
  contentClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
}

export function SEOHero({
  badge,
  badgeDotColor = "bg-[#5e6ad2]",
  title,
  description,
  primaryCtaText,
  primaryCtaHref = "/register",
  secondaryCtaText,
  secondaryCtaHref = "/contact",
  trustPill,
  breadcrumbs = [],
  children,
  className = "",
  contentClassName = "max-w-4xl lg:max-w-5xl w-full",
  titleClassName = "text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-[-0.03em] text-[#f7f8f8] leading-[1.15] mb-3",
  descriptionClassName = "text-sm sm:text-base text-[#d0d6e0] leading-normal max-w-2xl mb-5",
}: SEOHeroProps) {
  return (
    <section className={`relative pt-16 pb-8 sm:pt-20 sm:pb-10 overflow-hidden ${className}`}>
      {/* Subtle top illumination glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-80 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(94,106,210,0.08),transparent)] pointer-events-none"
        aria-hidden="true"
      />

      <div className="seo-container relative z-10">
        {/* Breadcrumb Navigation */}
        {breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-4 text-xs text-[#8a8f98] font-sans">
            <ol className="flex flex-wrap items-center gap-1.5">
              {breadcrumbs.map((crumb, idx) => {
                const isLast = idx === breadcrumbs.length - 1;
                return (
                  <li key={crumb.path} className="flex items-center gap-1.5">
                    {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-[#8a8f98]" />}
                    {isLast ? (
                      <span className="text-[#f7f8f8] font-medium truncate max-w-[240px] sm:max-w-md" aria-current="page">
                        {crumb.name}
                      </span>
                    ) : (
                      <Link to={crumb.path} className="text-[#8a8f98] hover:text-[#f7f8f8] transition-colors">
                        {crumb.name}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        )}

        {/* Masthead Content */}
        <div className={contentClassName}>
          {/* Optional Eyebrow / Taxonomy Badge */}
          {badge && (
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-mono text-[#d0d6e0] bg-[#141516] border border-[#23252a] mb-3.5">
              <span className={`w-1.5 h-1.5 rounded-full ${badgeDotColor}`} />
              <span>{badge}</span>
            </div>
          )}

          {/* H1 Title */}
          <h1 className={titleClassName}>
            {title}
          </h1>

          {/* Subtitle / Value Proposition */}
          <p className={descriptionClassName}>
            {description}
          </p>

          {/* Optional CTAs */}
          {(primaryCtaText || secondaryCtaText) && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
              {primaryCtaText && (
                <Link
                  to={primaryCtaHref}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-[#5e6ad2] text-white hover:bg-[#828fff] active:bg-[#5e69d1] transition-all shadow-sm group min-h-[44px]"
                >
                  <span>{primaryCtaText}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              )}

              {secondaryCtaText && (
                <Link
                  to={secondaryCtaHref}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-[#f7f8f8] bg-[#0f1011] hover:bg-[#141516] border border-[#23252a] hover:border-[#34343a] transition-all min-h-[44px]"
                >
                  <Calendar className="w-4 h-4 text-[#8a8f98]" />
                  <span>{secondaryCtaText}</span>
                </Link>
              )}
            </div>
          )}

          {/* Optional Trust Metric / Micro-Callout */}
          {trustPill && (
            <div className="flex items-center gap-2 text-xs text-[#8a8f98]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>{trustPill}</span>
            </div>
          )}
        </div>

        {/* Optional Visual Artifact / Cockpit Mockup Slot */}
        {children && <div className="mt-6 sm:mt-8">{children}</div>}
      </div>
    </section>
  );
}

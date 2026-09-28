import { Link } from "react-router-dom";
import { Check, X, ArrowRight, AlertCircle, ChevronRight, CreditCard, Clock, Sparkles } from "lucide-react";
import { SEOHead } from "./SEOHead";
import { GlobalNav } from "@/components/common/GlobalNav";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { SEOHero } from "./SEOHero";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { JaktraLogo } from "@/components/common/JaktraLogo";

export interface AlternativeProduct {
  name: string;
  logo?: string;
  isJaktra?: boolean;
  badge?: string; // e.g. "Closest Direct Match", "Best Enterprise O2C Suite", "Best Autonomous AI Alternative"
  categoryTag: string;
  bestFor: string;
  pricing: string;
  deploymentTime: string;
  debtorExperience: string;
  disputeTriage: string;
  strengths: string[];
  limitations: string[];
  review: string;
  comparisonUrl?: string; // e.g. "/compare/jaktra-vs-highradius"
}

export interface PainPoint {
  title: string;
  description: string;
}

export interface QuickPick {
  award: string;
  winnerName: string;
  winnerLogo?: string;
  isJaktra?: boolean;
  reason: string;
}

export interface DecisionScenario {
  scenario: string;
  recommendedPick: string;
  rationale: string;
}

export interface AlternativesGuideProps {
  incumbentName: string;
  incumbentLogo?: string;
  canonicalPath: string; // e.g. "/compare/highradius-alternatives"
  metaTitle: string;
  metaDescription: string;
  heroHeading: string;
  heroSubheading: string;
  incumbentOverview: string;
  whyLeaveIncumbent: PainPoint[];
  quickPicks?: QuickPick[];
  alternatives: AlternativeProduct[];
  decisionScenarios: DecisionScenario[];
  faqs: { q: string; a: string }[];
}

export function AlternativesGuideTemplate({
  incumbentName,
  incumbentLogo,
  canonicalPath,
  metaTitle,
  metaDescription,
  heroHeading,
  heroSubheading,
  incumbentOverview,
  whyLeaveIncumbent,
  quickPicks,
  alternatives,
  decisionScenarios,
  faqs,
}: AlternativesGuideProps) {
  const siteUrl = "https://jaktra.site";

  // Build JSON-LD structured data: ItemList + FAQPage + BreadcrumbList
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `${heroHeading} — Ranked & Reviewed`,
      description: metaDescription,
      url: `${siteUrl}${canonicalPath}`,
      numberOfItems: alternatives.length,
      itemListElement: alternatives.map((alt, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        name: alt.name,
        description: alt.bestFor,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.a,
        },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: `${siteUrl}/`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Compare",
          item: `${siteUrl}/compare`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: `${incumbentName} Alternatives`,
          item: `${siteUrl}${canonicalPath}`,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#010102] text-[#f7f8f8] font-sans antialiased selection:bg-[#5e6ad2]/30 selection:text-white">
      <SEOHead
        title={metaTitle}
        description={metaDescription}
        canonicalPath={canonicalPath}
        jsonLd={jsonLd}
      />

      <GlobalNav />

      <main className="pb-24">
        {/* Hero Masthead */}
        <SEOHero
          badge="Buyer's Guide & Alternatives"
          badgeDotColor="bg-[#5e6ad2]"
          breadcrumbs={[
            { name: "Home", path: "/" },
            { name: "Compare", path: "/compare" },
            { name: `${incumbentName} Alternatives`, path: canonicalPath },
          ]}
          contentClassName="w-full max-w-full"
          titleClassName="text-2xl sm:text-[1.75rem] lg:text-[2.2rem] font-bold tracking-tight text-[#f7f8f8] leading-tight mb-2.5"
          descriptionClassName="text-sm sm:text-base text-[#d0d6e0] leading-relaxed max-w-4xl mb-5"
          title={heroHeading}
          description={heroSubheading}
        />

        <div className="seo-container space-y-16">
          {/* Quick Picks / At-a-Glance Winners */}
          {quickPicks && quickPicks.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#5e6ad2]" />
                <h2 className="text-base font-semibold text-[#f7f8f8] tracking-tight">
                  At a Glance: Top Recommended Alternatives
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {quickPicks.map((pick, idx) => (
                  <div
                    key={idx}
                    className={`rounded-xl border p-5 flex flex-col justify-between transition-colors ${
                      pick.isJaktra
                        ? "bg-[#141516] border-[#5e6ad2]/40 shadow-lg ring-1 ring-[#5e6ad2]/20"
                        : "bg-[#0f1011] border-[#23252a]"
                    }`}
                  >
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono text-[#828fff] bg-[#5e6ad2]/15 border border-[#5e6ad2]/30 mb-3">
                        {pick.award}
                      </div>
                      <h3 className="text-base font-semibold text-[#f7f8f8] mb-1.5 flex items-center gap-2">
                        {pick.winnerLogo && (
                          <img src={pick.winnerLogo} alt={pick.winnerName} className="w-5 h-5 object-contain" />
                        )}
                        <span>{pick.winnerName}</span>
                      </h3>
                      <p className="text-xs text-[#8a8f98] leading-relaxed">
                        {pick.reason}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Why Teams Leave Incumbent */}
          <section className="rounded-xl border border-[#23252a] bg-[#0f1011] p-6 sm:p-8 shadow-xl">
            <div className="max-w-3xl mb-6">
              <div className="flex items-center gap-3">
                {incumbentLogo && (
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center p-1 shrink-0 shadow-sm">
                    <img src={incumbentLogo} alt={incumbentName} className="max-w-full max-h-full object-contain" />
                  </div>
                )}
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Why Finance Teams Look for Alternatives to {incumbentName}
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed">
                {incumbentOverview}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {whyLeaveIncumbent.map((pain, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-xl bg-[#050608] border border-rose-500/20 hover:border-rose-500/35 transition-colors relative overflow-hidden group"
                >
                  <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-3 text-rose-400 group-hover:scale-105 transition-transform">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-2">{pain.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{pain.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* In-Depth Alternatives Profiles */}
          <section className="space-y-6">
            {alternatives.map((alt, index) => (
              <div
                key={alt.name}
                id={alt.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
                className="p-6 sm:p-8 rounded-2xl border transition-all bg-[#0e0f11] border-white/[0.08] hover:border-white/[0.14]"
              >
                {/* Card Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-white/[0.08]">
                  <div className="flex items-start sm:items-center gap-3.5">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-white/[0.06] border border-white/[0.1] text-zinc-300 text-xs font-bold shrink-0 mt-0.5 sm:mt-0 shadow-sm">
                      #{index + 1}
                    </span>

                    {alt.isJaktra ? (
                      <div className="w-11 h-11 rounded-xl bg-[#0e1629] border border-sky-400/30 flex items-center justify-center p-2 shrink-0 shadow-md">
                        <JaktraLogo size={24} />
                      </div>
                    ) : alt.logo ? (
                      <div className="w-11 h-11 rounded-xl bg-white border border-white/20 flex items-center justify-center p-2 shrink-0 shadow-sm">
                        <img
                          src={alt.logo}
                          alt={alt.name}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    ) : null}

                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                          {alt.name}
                        </h2>
                        {alt.badge && (
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border shadow-sm ${
                              alt.isJaktra
                                ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/25"
                                : "bg-sky-500/10 text-sky-200 border-sky-400/25"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                alt.isJaktra ? "bg-emerald-400" : "bg-sky-400"
                              }`}
                            />
                            {alt.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-[13px] text-zinc-400 mt-1">
                        {alt.categoryTag}
                      </p>
                    </div>
                  </div>

                  {/* Pricing Model Badge */}
                  <div className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.12] transition-colors self-start lg:self-center shrink-0">
                    <div className="w-6 h-6 rounded-md bg-white/[0.05] flex items-center justify-center text-zinc-400 shrink-0">
                      <CreditCard className="w-3.5 h-3.5 text-zinc-300" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400 leading-none mb-1">
                        Pricing Model
                      </span>
                      <span className="text-xs font-medium text-zinc-200">
                        {alt.pricing}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Summary / Best For */}
                <div className="my-4.5 p-3.5 sm:p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                    <span className="font-semibold text-[#b7d2f8] mr-2">
                      Best for:
                    </span>
                    {alt.bestFor}
                  </p>
                </div>

                {/* Pros & Cons Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                  <div className="p-4 rounded-xl bg-[#141516] border border-emerald-500/20">
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 block mb-2.5">
                      Key Strengths
                    </span>
                    <ul className="space-y-2 text-xs text-zinc-300">
                      {alt.strengths.map((pro, pIdx) => (
                        <li key={pIdx} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-[#141516] border border-[#23252a]">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#8a8f98] block mb-2.5">
                      Tradeoffs &amp; Limitations
                    </span>
                    <ul className="space-y-2 text-xs text-[#8a8f98]">
                      {alt.limitations.map((con, cIdx) => (
                        <li key={cIdx} className="flex items-start gap-2">
                          <X className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* In-depth Analytical Review */}
                <div className="pt-2">
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                    {alt.review}
                  </p>
                </div>

                {/* Action Link */}
                <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <Clock className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Implementation:</span>
                    <span className="text-zinc-200 font-medium">{alt.deploymentTime}</span>
                  </div>

                  {alt.isJaktra ? (
                    <Link
                      to="/register"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white text-zinc-950 font-semibold text-xs hover:bg-zinc-200 transition-all shadow-sm group"
                    >
                      <span>Start Free with Jaktra</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  ) : alt.comparisonUrl ? (
                    <Link
                      to={alt.comparisonUrl}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] transition-all group"
                    >
                      <span>Compare Jaktra vs {alt.name}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  ) : null}
                </div>
                </div>
              ))}
          </section>

          {/* Side-by-Side Comparison Matrix Table */}
          <section className="bg-[#0e0f11] border border-white/[0.08] rounded-2xl p-6 sm:p-8 shadow-xl">
            <div className="max-w-2xl mb-6">
              <span className="text-xs font-mono uppercase tracking-wider text-[#b7d2f8] block mb-1">
                Feature Breakdown
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {incumbentName} vs Top Alternatives Matrix
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                Compare debtor payment access, dispute triage mechanics, and implementation timelines side-by-side.
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#23252a] bg-[#141516]">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-[#23252a] bg-[#0f1011]">
                    <th className="py-3.5 px-4 text-xs font-mono uppercase tracking-wider text-[#8a8f98]">
                      Platform
                    </th>
                    <th className="py-3.5 px-4 text-xs font-mono uppercase tracking-wider text-[#8a8f98]">
                      Primary Strength
                    </th>
                    <th className="py-3.5 px-4 text-xs font-mono uppercase tracking-wider text-[#8a8f98]">
                      Pricing Model
                    </th>
                    <th className="py-3.5 px-4 text-xs font-mono uppercase tracking-wider text-[#8a8f98]">
                      Debtor Payment
                    </th>
                    <th className="py-3.5 px-4 text-xs font-mono uppercase tracking-wider text-[#8a8f98]">
                      Dispute Triage
                    </th>
                    <th className="py-3.5 px-4 text-xs font-mono uppercase tracking-wider text-[#8a8f98]">
                      Launch Time
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#23252a] text-xs">
                  {alternatives.map((alt) => (
                    <tr
                      key={alt.name}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                        {alt.isJaktra ? (
                          <div className="w-5 h-5 rounded bg-[#0e1629] border border-white/20 flex items-center justify-center p-0.5 shrink-0">
                            <JaktraLogo size={12} />
                          </div>
                        ) : alt.logo ? (
                          <div className="w-5 h-5 rounded bg-white flex items-center justify-center p-0.5 shrink-0">
                            <img src={alt.logo} alt={alt.name} className="w-full h-full object-contain" />
                          </div>
                        ) : null}
                        <span>{alt.name}</span>
                      </td>
                      <td className="py-3.5 px-4 text-zinc-300 max-w-[200px]">{alt.categoryTag}</td>
                      <td className="py-3.5 px-4 text-zinc-300 font-mono">{alt.pricing}</td>
                      <td className="py-3.5 px-4 text-zinc-300">{alt.debtorExperience}</td>
                      <td className="py-3.5 px-4 text-zinc-300">{alt.disputeTriage}</td>
                      <td className="py-3.5 px-4 text-zinc-300 font-mono">{alt.deploymentTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Decision Framework: How to Choose */}
          <section className="bg-[#0f1011] border border-[#23252a] rounded-2xl p-6 sm:p-8">
            <div className="max-w-2xl mb-6">
              <span className="text-xs font-mono uppercase tracking-wider text-[#606cd2] block mb-1">
                Buyer Decision Guide
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Which Alternative Fits Your Company Best?
              </h2>
              <p className="text-xs sm:text-sm text-[#8a8f98] mt-1">
                Choose the right software replacement based on your business stage, invoice volume, and collection bottleneck:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {decisionScenarios.map((item, idx) => (
                <div key={idx} className="p-5 rounded-xl bg-[#141516] border border-[#23252a] space-y-2.5">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#8a8f98] block font-semibold">
                    {item.scenario}
                  </span>
                  <div className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span className="text-[#8a8f98]">Choose:</span>
                    <span className="text-[#606cd2]">{item.recommendedPick}</span>
                  </div>
                  <p className="text-xs text-[#8a8f98] leading-relaxed">{item.rationale}</p>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ Accordion Section */}
          <section className="bg-[#0f1011] border border-[#23252a] rounded-2xl p-6 sm:p-8">
            <div className="max-w-2xl mb-6">
              <span className="text-xs font-mono uppercase tracking-wider text-[#606cd2] block mb-1">
                Frequently Asked Questions
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Common Questions When Switching from {incumbentName}
              </h2>
            </div>

            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, fIdx) => (
                <AccordionItem
                  key={fIdx}
                  value={`item-${fIdx}`}
                  className="border border-[#23252a] rounded-xl px-5 bg-[#141516]"
                >
                  <AccordionTrigger className="text-left text-sm font-bold text-white hover:text-[#606cd2] py-4">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-xs sm:text-sm text-zinc-300 leading-relaxed pb-4">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          {/* Conversion CTA Footer Banner */}
          <section className="rounded-2xl sm:rounded-3xl bg-[#0f1011] border border-[#23252a] p-8 sm:p-12 relative overflow-hidden shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-[#23252a] text-xs font-medium text-[#8a8f98]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Start Collecting Without Extra Headcount</span>
                </div>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#f7f8f8] tracking-tight leading-tight">
                  Experience Autonomous B2B Invoice Recovery in 15 Minutes
                </h2>

                <p className="text-xs sm:text-sm text-[#8a8f98] leading-relaxed max-w-xl">
                  Connect your invoices via CSV or API webhook. Let Jaktra's autonomous AI craft dynamic 5-stage follow-ups, triage debtor disputes automatically, and collect instant payments through zero-login links.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#5e6ad2] text-white font-medium text-xs sm:text-sm hover:bg-[#525ec2] transition-all shadow-sm group"
                  >
                    <span>Get Started Free</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                  <Link
                    to="/features"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-white/[0.04] text-[#8a8f98] border border-[#23252a] font-medium text-xs sm:text-sm hover:bg-white/[0.08] hover:text-[#f7f8f8] transition-all"
                  >
                    <span>Explore Autonomous AI Architecture</span>
                  </Link>
                </div>
              </div>

              {/* Feature Highlights on Right */}
              <div className="lg:col-span-5 space-y-3">
                <div className="p-4 rounded-xl bg-[#141516] border border-[#23252a] flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-[#f7f8f8]">15-Minute Self-Serve Onboarding</h3>
                    <p className="text-[11px] sm:text-xs text-[#8a8f98] mt-0.5 leading-relaxed">
                      Upload invoice CSV or connect webhooks without months of enterprise IT implementation.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#141516] border border-[#23252a] flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#5e6ad2]/10 border border-[#5e6ad2]/20 flex items-center justify-center text-[#606cd2] shrink-0 mt-0.5">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-[#f7f8f8]">Zero-Login Debtor Links</h3>
                    <p className="text-[11px] sm:text-xs text-[#8a8f98] mt-0.5 leading-relaxed">
                      Customers verify line items and pay instantly via Stripe or bank transfer with no passwords.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#141516] border border-[#23252a] flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-[#23252a] flex items-center justify-center text-[#8a8f98] shrink-0 mt-0.5">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-[#f7f8f8]">Automated Dispute Triage</h3>
                    <p className="text-[11px] sm:text-xs text-[#8a8f98] mt-0.5 leading-relaxed">
                      L1 inquiries are answered instantly, routing complex queries to your team with full audit logs.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}

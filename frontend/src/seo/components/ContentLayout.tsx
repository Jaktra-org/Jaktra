import { useState, useEffect, type ReactNode, type MouseEvent } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Clock, ArrowRight, UserCheck, Sparkles, ChevronDown } from "lucide-react";

export interface TocItem {
  id: string;
  label: string;
  level?: number; // 2 for H2, 3 for H3
}

export interface AuthorInfo {
  name: string;
  role: string;
  avatarUrl?: string;
  lastUpdated?: string;
}

export interface ContentLayoutProps {
  tocItems: TocItem[];
  author?: AuthorInfo;
  readingTime?: string;
  children: ReactNode;
}

export function ContentLayout({
  tocItems,
  author = {
    name: "Suresh Jakhar",
    role: "Founder & Lead Architect, Jaktra",
    lastUpdated: "October 2026",
  },
  readingTime = "8 min read",
  children,
}: ContentLayoutProps) {
  const [activeId, setActiveId] = useState<string>(tocItems[0]?.id || "");
  const [mobileTocOpen, setMobileTocOpen] = useState(false);

  // Track active section via IntersectionObserver
  useEffect(() => {
    if (typeof window === "undefined" || tocItems.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-80px 0px -60% 0px",
      }
    );

    tocItems.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [tocItems]);

  const scrollToSection = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      setActiveId(id);
      setMobileTocOpen(false);
    }
  };

  return (
    <div className="seo-container py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Sticky Sidebar (4 cols) */}
        <aside className="hidden lg:block lg:col-span-4 sticky top-20 space-y-6">
          {/* Table of Contents Card */}
          <div className="bg-[#0f1011] border border-[#23252a] rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#23252a]">
              <span className="text-xs font-mono uppercase tracking-wider text-[#d0d6e0] flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#5e6ad2]" />
                Contents
              </span>
              <span className="text-[11px] font-mono text-[#8a8f98] flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {readingTime}
              </span>
            </div>

            <nav className="space-y-1 max-h-[50vh] overflow-y-auto thin-scrollbar pr-1" aria-label="Table of contents">
              {tocItems.map((item) => {
                const isActive = activeId === item.id;
                const isH3 = item.level === 3;

                return (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={(e) => scrollToSection(e, item.id)}
                    className={`block text-xs py-1.5 px-2.5 rounded-lg transition-all ${
                      isH3 ? "pl-4 text-[11px]" : "font-medium"
                    } ${
                      isActive
                        ? "text-[#f7f8f8] bg-[#141516] font-semibold border-l-2 border-[#5e6ad2]"
                        : "text-[#8a8f98] hover:text-[#f7f8f8] hover:bg-[#141516]/50"
                    }`}
                  >
                    {item.label}
                  </a>
                );
              })}
            </nav>
          </div>

          {/* Author Attribution Card */}
          <div className="bg-[#0f1011] border border-[#23252a] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full border border-[#23252a] bg-[#141516] flex items-center justify-center flex-shrink-0">
                <UserCheck className="w-4 h-4 text-[#d0d6e0]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#f7f8f8]">{author.name}</p>
                <p className="text-[11px] text-[#8a8f98]">{author.role}</p>
                {author.lastUpdated && (
                  <p className="text-[10px] text-[#8a8f98] font-mono mt-0.5">
                    Updated {author.lastUpdated}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Contextual CTA Card */}
          <div className="bg-[#0f1011] border border-[#23252a] rounded-xl p-5 text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono text-[#828fff] bg-[#5e6ad2]/15 border border-[#5e6ad2]/30 mb-2.5">
              <Sparkles className="w-3 h-3 text-[#5e6ad2]" />
              AUTONOMOUS AR AGENT
            </div>
            <h4 className="text-xs font-semibold text-[#f7f8f8] mb-1.5">
              Automate your collection cycle
            </h4>
            <p className="text-[11px] text-[#8a8f98] leading-relaxed mb-4">
              Stop manually drafting follow-ups. Jaktra automatically resolves overdue balances and disputes with AI.
            </p>
            <Link
              to="/register"
              className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium bg-[#5e6ad2] text-white hover:bg-[#828fff] active:bg-[#5e69d1] transition-colors shadow-sm min-h-[40px]"
            >
              <span>Get Early Access Free</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </aside>

        {/* Right Article Body (8 cols) */}
        <article className="lg:col-span-8 prose prose-invert max-w-none space-y-8 text-[#d0d6e0] leading-relaxed">
          {/* Mobile Collapsible Table of Contents (< 1024px) */}
          {tocItems.length > 0 && (
            <div className="block lg:hidden mb-6 bg-[#0f1011] border border-[#23252a] rounded-xl p-4 shadow-md not-prose">
              <button
                type="button"
                onClick={() => setMobileTocOpen(!mobileTocOpen)}
                className="w-full flex items-center justify-between text-left cursor-pointer"
                aria-expanded={mobileTocOpen}
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#5e6ad2]" />
                  <span className="text-xs font-semibold text-[#f7f8f8]">Table of Contents</span>
                  <span className="text-[11px] font-mono text-[#8a8f98] ml-2">({readingTime})</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-[#8a8f98] transition-transform duration-200 ${
                    mobileTocOpen ? "rotate-180 text-[#f7f8f8]" : ""
                  }`}
                />
              </button>

              {mobileTocOpen && (
                <nav className="mt-3 pt-3 border-t border-[#23252a] space-y-1 max-h-[40vh] overflow-y-auto thin-scrollbar">
                  {tocItems.map((item) => {
                    const isActive = activeId === item.id;
                    const isH3 = item.level === 3;

                    return (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        onClick={(e) => scrollToSection(e, item.id)}
                        className={`block text-xs py-2 px-2.5 rounded-lg transition-colors ${
                          isH3 ? "pl-5 text-[11px]" : "font-medium"
                        } ${
                          isActive
                            ? "text-[#f7f8f8] bg-[#141516] font-semibold border-l-2 border-[#5e6ad2]"
                            : "text-[#8a8f98] hover:text-[#f7f8f8]"
                        }`}
                      >
                        {item.label}
                      </a>
                    );
                  })}
                </nav>
              )}
            </div>
          )}

          {children}
        </article>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ArrowRight, Sparkles } from "lucide-react";

import { JaktraLogo } from "./JaktraLogo";

interface NavItem {
  name: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { name: "Features", href: "/features" },
  { name: "Solutions", href: "/use-cases" },
  { name: "Compare", href: "/compare" },
  { name: "Pricing", href: "/pricing" },
  { name: "Resources", href: "/resources" },
];

export function GlobalNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile drawer on route change (render phase reset per React guidelines)
  const [prevPathname, setPrevPathname] = useState(location.pathname);
  if (prevPathname !== location.pathname) {
    setPrevPathname(location.pathname);
    setMobileMenuOpen(false);
  }

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-[#010102]/90 backdrop-blur-md border-b border-[#23252a] transition-colors">
      <div className="seo-container h-full flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5e69d1] rounded-lg"
          aria-label="Jaktra Homepage"
        >
          <JaktraLogo size={24} className="group-hover:opacity-90 transition-opacity" />
          <span className="text-sm font-semibold tracking-tight text-[#f7f8f8]">
            Jaktra
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
          {NAV_ITEMS.map((item) => {
            const isActive =
              location.pathname === item.href ||
              (item.href !== "/" && location.pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                to={item.href}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "text-[#f7f8f8] bg-[#141516]"
                    : "text-[#8a8f98] hover:text-[#f7f8f8] hover:bg-[#0f1011]"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login"
            className="text-xs font-medium text-[#8a8f98] hover:text-[#f7f8f8] transition-colors px-2.5 py-1.5 rounded-lg hover:bg-[#0f1011]"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center gap-1.5 text-xs font-medium bg-[#5e6ad2] text-white hover:bg-[#828fff] active:bg-[#5e69d1] transition-colors px-3.5 py-1.5 rounded-lg shadow-sm group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5e69d1]"
          >
            <span>Get started free</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            to="/register"
            className="inline-flex items-center text-xs font-medium bg-[#5e6ad2] text-white hover:bg-[#828fff] px-3 py-1.5 rounded-lg"
          >
            Start free
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-[#8a8f98] hover:text-[#f7f8f8] hover:bg-[#0f1011] transition-colors focus:outline-none focus:ring-2 focus:ring-[#5e69d1]"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay & Panel */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-14 z-40 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Menu */}
          <div className="relative bg-[#0f1011] border-b border-[#23252a] px-6 py-6 space-y-4 shadow-2xl">
            <nav className="flex flex-col space-y-1" aria-label="Mobile Menu">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  location.pathname === item.href ||
                  (item.href !== "/" && location.pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between py-2.5 px-3.5 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                      isActive
                        ? "text-[#f7f8f8] bg-[#141516]"
                        : "text-[#d0d6e0] hover:text-[#f7f8f8] hover:bg-[#141516]/50"
                    }`}
                  >
                    <span>{item.name}</span>
                    <ArrowRight className="w-4 h-4 text-[#8a8f98]" />
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-[#23252a] flex flex-col gap-2.5">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center py-2.5 text-sm font-medium text-[#f7f8f8] bg-[#141516] border border-[#23252a] hover:bg-[#18191a] rounded-lg transition-colors min-h-[44px]"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-white bg-[#5e6ad2] hover:bg-[#828fff] rounded-lg transition-colors shadow-sm min-h-[44px]"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>Get started free</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

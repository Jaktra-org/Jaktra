import { Link } from "react-router-dom";
import { ArrowLeft, Home, Compass, BookOpen, Layers, Zap } from "lucide-react";
import jaktraLogo from "../assets/jaktra_svg.svg";
import { SEOHead } from "../components/common/SEOHead";

export function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-zinc-100 font-sans selection:bg-[#b7d2f8]/20 selection:text-white flex flex-col justify-between">
      <SEOHead
        title="Page Not Found"
        description="The requested page could not be found on Jaktra. Return to the homepage to explore AI-powered accounts receivable automation."
        noindex={true}
      />

      {/* Top Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-[#0a0a0b]/90 backdrop-blur-md border-b border-white/[0.08]">
        <div className="max-w-6xl mx-auto h-full px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 text-decoration-none">
            <img src={jaktraLogo} alt="Jaktra" width={24} height={24} className="h-6 w-6 block" />
            <span className="font-semibold text-white text-lg tracking-tight font-sans">Jaktra</span>
          </Link>
          <div className="flex items-center gap-4 sm:gap-6">
            <Link to="/features" className="text-sm text-zinc-400 hover:text-white transition-colors hidden sm:block">
              Features
            </Link>
            <Link to="/pricing" className="text-sm text-zinc-400 hover:text-white transition-colors hidden sm:block">
              Pricing
            </Link>
            <Link to="/docs" className="text-sm text-zinc-400 hover:text-white transition-colors hidden sm:block">
              Docs
            </Link>
            <Link
              to="/"
              className="text-xs sm:text-sm font-medium bg-white text-zinc-950 px-3.5 py-1.5 rounded-lg hover:bg-zinc-200 transition-colors shadow-sm inline-flex items-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Back Home</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main 404 Content */}
      <main className="flex-1 flex items-center justify-center px-6 pt-28 pb-20 relative">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[radial-gradient(circle_at_center,rgba(183,210,248,0.08),transparent_70%)] pointer-events-none" />

        <div className="max-w-2xl w-full text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-white/[0.08] bg-white/[0.03] text-zinc-400 text-xs font-mono mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" />
            <span>404 ERROR • RESOURCE NOT FOUND</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-5 leading-tight">
            Page Not Found
          </h1>

          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-xl mx-auto mb-10">
            The link you followed may be broken, the page may have been moved, or the URL might be misspelled.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14">
            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-zinc-950 text-sm font-bold hover:bg-zinc-200 transition-colors shadow-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Homepage</span>
            </Link>
            <Link
              to="/features"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/[0.12] bg-white/[0.04] text-white text-sm font-medium hover:bg-white/[0.08] transition-colors"
            >
              <Compass className="w-4 h-4 text-[#b7d2f8]" />
              <span>Explore Features</span>
            </Link>
          </div>

          {/* Quick Helpful Links */}
          <div className="text-left border-t border-white/[0.08] pt-10">
            <div className="text-xs font-mono uppercase tracking-wider text-zinc-500 mb-4 text-center sm:text-left">
              Popular Destinations
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link
                to="/pricing"
                className="p-4 rounded-xl border border-white/[0.06] bg-[#111113] hover:border-white/[0.15] transition-all group block"
              >
                <div className="flex items-center gap-2 text-white font-medium text-sm mb-1 group-hover:text-[#b7d2f8] transition-colors">
                  <Zap className="w-4 h-4 text-[#b7d2f8]" />
                  <span>Pricing</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  100% free during early access with zero credit card required.
                </p>
              </Link>

              <Link
                to="/docs"
                className="p-4 rounded-xl border border-white/[0.06] bg-[#111113] hover:border-white/[0.15] transition-all group block"
              >
                <div className="flex items-center gap-2 text-white font-medium text-sm mb-1 group-hover:text-[#b7d2f8] transition-colors">
                  <BookOpen className="w-4 h-4 text-[#b7d2f8]" />
                  <span>Documentation</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Integration guides, API specs, and webhook signatures.
                </p>
              </Link>

              <Link
                to="/resources"
                className="p-4 rounded-xl border border-white/[0.06] bg-[#111113] hover:border-white/[0.15] transition-all group block"
              >
                <div className="flex items-center gap-2 text-white font-medium text-sm mb-1 group-hover:text-[#b7d2f8] transition-colors">
                  <Layers className="w-4 h-4 text-[#b7d2f8]" />
                  <span>Resources</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  DSO reduction guides, dunning templates, and ROI calculators.
                </p>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] py-6 px-6 text-center text-xs text-zinc-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>© {new Date().getFullYear()} Jaktra. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-zinc-400 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-zinc-400 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default NotFound;

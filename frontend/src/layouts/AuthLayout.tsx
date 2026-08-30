import React from "react";
import { Outlet, Link } from "react-router-dom";
import { ArrowLeft, FileText, Mail } from "lucide-react";
import { motion } from "framer-motion";
import jaktraLogo from "../assets/jaktra_svg.svg";
import { AuthLayoutContext } from "../contexts/AuthLayoutContext";

export function AuthLayout({ children }: { children?: React.ReactNode }) {
  return (
    <AuthLayoutContext.Provider value={true}>
      <section className="min-h-screen bg-[#050505] text-white antialiased [font-synthesis:none]">
        <div className="grid min-h-screen lg:grid-cols-[0.94fr_1.06fr]">
          {/* Left Side - Form Container */}
          <div className="flex min-h-[760px] items-center justify-center bg-[#0a0a0c] border-b lg:border-b-0 lg:border-r border-white/10 px-6 py-10 sm:px-10 lg:min-h-screen lg:px-14 lg:py-16 xl:px-20">
            <div className="mx-auto w-full max-w-[460px]">
              {/* Brand Header */}
              <div className="flex items-center justify-between mb-7">
                <Link to="/" className="inline-flex items-center gap-2.5 text-white no-underline">
                  <img src={jaktraLogo} alt="Jaktra Logo" className="h-6 w-auto object-contain" />
                  <span className="font-semibold text-lg tracking-tight">Jaktra</span>
                </Link>
                <Link
                  to="/"
                  className="text-xs text-white/50 hover:text-white transition-colors no-underline inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Back to Home
                </Link>
              </div>

              {children ?? <Outlet />}
            </div>
          </div>

          {/* Right Side - Persistent Architectural Art & Context */}
          <div className="relative flex min-h-[720px] flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#071551] via-[#060913] to-[#040507] p-6 text-white sm:p-10 lg:min-h-screen lg:p-12">
            {/* Fluted Glass Pattern */}
            <div
              className="absolute inset-0 z-0 pointer-events-none"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.04) 0px, rgba(255, 255, 255, 0.04) 1px, transparent 1px, transparent 24px)",
                backgroundSize: "24px 100%",
              }}
            />

            {/* Prismatic ambient reflection overlay */}
            <div
              className="absolute inset-0 z-0 pointer-events-none opacity-40"
              style={{
                background:
                  "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(183, 210, 248, 0.16) 0%, rgba(7, 21, 81, 0.25) 45%, transparent 70%)",
              }}
            />

            <div className="relative z-10 w-full max-w-[560px] flex flex-col items-center justify-center">
              <SignInArtSystem />
            </div>
          </div>
        </div>
      </section>
    </AuthLayoutContext.Provider>
  );
}

/* ─── Architectural Wireframe Art System for Sign-In / Forgot-Password ─── */
function SignInArtSystem() {
  return (
    <div className="relative w-full max-w-[540px] flex flex-col items-center justify-center select-none py-4">
      {/* SVG Geometric Orbital Arcs and Connector Lines */}
      <svg
        className="absolute inset-0 size-full pointer-events-none"
        viewBox="0 0 540 600"
        fill="none"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Top Elliptical Wireframe Arc */}
        <path
          d="M 35 185 C 115 65, 425 65, 505 185"
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="1"
        />

        {/* Top Radial Tick Markers & Nodes */}
        <line x1="72" y1="152" x2="58" y2="138" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" />
        <circle cx="58" cy="138" r="1.5" fill="rgba(255, 255, 255, 0.5)" />

        <line x1="148" y1="106" x2="138" y2="90" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" />
        <circle cx="138" cy="90" r="1.5" fill="rgba(255, 255, 255, 0.5)" />

        <line x1="392" y1="106" x2="402" y2="90" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" />
        <circle cx="402" cy="90" r="1.5" fill="rgba(255, 255, 255, 0.5)" />

        <line x1="468" y1="152" x2="482" y2="138" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" />
        <circle cx="482" cy="138" r="1.5" fill="rgba(255, 255, 255, 0.5)" />

        {/* Center Vertical Stems */}
        <line x1="270" y1="46" x2="270" y2="96" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" />
        <line x1="270" y1="485" x2="270" y2="550" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" />
        <circle cx="270" cy="550" r="1.5" fill="rgba(255, 255, 255, 0.5)" />

        {/* Bottom Elliptical Wireframe Arc */}
        <path
          d="M 35 415 C 115 535, 425 535, 505 415"
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="1"
        />

        {/* Bottom Radial Tick Markers & Nodes */}
        <line x1="72" y1="448" x2="58" y2="462" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" />
        <circle cx="58" cy="462" r="1.5" fill="rgba(255, 255, 255, 0.5)" />

        <line x1="148" y1="494" x2="138" y2="510" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" />
        <circle cx="138" cy="510" r="1.5" fill="rgba(255, 255, 255, 0.5)" />

        <line x1="392" y1="494" x2="402" y2="510" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" />
        <circle cx="402" cy="510" r="1.5" fill="rgba(255, 255, 255, 0.5)" />

        <line x1="468" y1="448" x2="482" y2="462" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" />
        <circle cx="482" cy="462" r="1.5" fill="rgba(255, 255, 255, 0.5)" />
      </svg>

      {/* ─── Top Section: Eyebrow + Stacked Invoice Card ─── */}
      <div className="relative z-10 flex flex-col items-center">
        <span className="text-[10px] font-mono tracking-[0.26em] uppercase text-white/45 mb-4">
          AUTONOMOUS RECOVERY
        </span>

        {/* Top Stacked Card with depth shadows */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative flex flex-col items-center"
        >
          {/* Main Card */}
          <div className="relative z-10 w-[270px] sm:w-[300px] rounded-xl border border-white/20 bg-[#0e1118]/95 px-3.5 py-3 shadow-[0_16px_36px_rgba(0,0,0,0.6)] backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-lg border border-white/15 bg-white/5 flex items-center justify-center shrink-0">
                <FileText className="size-4 text-white/80" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium text-white tracking-tight truncate">
                  Invoice #INV-8412.pdf
                </div>
                <div className="text-[11px] text-white/45 font-mono mt-0.5">
                  Acme Cloud • $128,400 settled
                </div>
              </div>
            </div>
          </div>

          {/* Stepped Layer 1 */}
          <div className="relative -mt-1 h-2 w-[246px] sm:w-[276px] rounded-b-xl border-x border-b border-white/10 bg-[#090b10]/95" />
          {/* Stepped Layer 2 */}
          <div className="relative -mt-1 h-2 w-[220px] sm:w-[250px] rounded-b-xl border-x border-b border-white/5 bg-[#050608]/95" />
        </motion.div>
      </div>

      {/* ─── Center Philosophy / Editorial Typography ─── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative z-10 my-9 sm:my-11 max-w-[440px] text-center px-4"
      >
        <h2 className="text-xl sm:text-[24px] font-light leading-[1.32] tracking-[-0.025em] text-white/90">
          Overdue balances shouldn't stall behind manual emails and broken reconciliation.
        </h2>
        <p className="mt-4 text-xs sm:text-[13.5px] font-light leading-[1.65] text-white/50 max-w-[410px] mx-auto">
          Welcome back. Your autonomous reminder cadences, debtor reply triage, and ledger reconciliation have been actively recovering cash while you were away.
        </p>
      </motion.div>

      {/* ─── Bottom Section: Stacked Debtor Reply Card ─── */}
      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="relative flex flex-col items-center"
        >
          {/* Stepped Layer 2 (top) */}
          <div className="relative h-2 w-[220px] sm:w-[250px] rounded-t-xl border-x border-t border-white/5 bg-[#050608]/95" />
          {/* Stepped Layer 1 (middle) */}
          <div className="relative -mt-1 h-2 w-[246px] sm:w-[276px] rounded-t-xl border-x border-t border-white/10 bg-[#090b10]/95" />

          {/* Main Card */}
          <div className="relative z-10 -mt-1 w-[270px] sm:w-[300px] rounded-xl border border-white/20 bg-[#0e1118]/95 px-3.5 py-3 shadow-[0_16px_36px_rgba(0,0,0,0.6)] backdrop-blur-xl">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-8 rounded-lg border border-white/15 bg-white/5 flex items-center justify-center shrink-0">
                  <Mail className="size-4 text-white/80" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-medium text-white tracking-tight truncate">
                    Datadog EMEA Corp
                  </div>
                  <div className="text-[11px] text-white/45 truncate mt-0.5">
                    FW: Wire release confirmed
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-white/35 shrink-0 pl-1">
                Just now
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

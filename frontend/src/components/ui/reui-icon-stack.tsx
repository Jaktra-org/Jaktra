import React from "react";
import { clsx } from "clsx";

export interface IconStackProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  iconClassName?: string;
  className?: string;
}

export function IconStack({
  children,
  className,
  iconClassName,
  ...props
}: IconStackProps) {
  return (
    <div
      className={clsx(
        "relative inline-flex items-center justify-center p-2 group select-none transition-transform duration-300 hover:scale-105",
        className
      )}
      {...props}
    >
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center [perspective:800px] [transform-style:preserve-3d]">
        {/* Layer 1: Back Card (Furthest offset top-left) */}
        <div
          className="absolute w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border border-current/20 bg-current/5 transition-transform duration-300 group-hover:-translate-x-3.5 group-hover:-translate-y-2.5"
          style={{
            transform: "rotateY(-20deg) rotateX(12deg) rotateZ(-6deg) translate3d(-12px, -8px, -16px)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          }}
        />

        {/* Layer 2: Middle Card */}
        <div
          className="absolute w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border border-current/40 bg-current/10 transition-transform duration-300 group-hover:-translate-x-2 group-hover:-translate-y-1.5"
          style={{
            transform: "rotateY(-20deg) rotateX(12deg) rotateZ(-6deg) translate3d(-6px, -4px, -8px)",
            boxShadow: "0 6px 16px rgba(0,0,0,0.4)",
          }}
        />

        {/* Layer 3: Front Card (Contains Icon) */}
        <div
          className="absolute w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border border-current/75 bg-[#0e1013]/95 backdrop-blur-md shadow-2xl flex items-center justify-center transition-all duration-300 group-hover:border-current group-hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]"
          style={{
            transform: "rotateY(-20deg) rotateX(12deg) rotateZ(-6deg) translate3d(0, 0, 0)",
          }}
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/15 via-transparent to-transparent pointer-events-none" />
          <div className={clsx("w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-current", iconClassName)}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

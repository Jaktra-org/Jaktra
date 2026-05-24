import type React from "react";
import { clsx } from "clsx";

interface DarkGradientBgProps {
  children?: React.ReactNode;
  className?: string;
}

export function DarkGradientBg({ children, className }: DarkGradientBgProps) {
  return (
    <div
      className={clsx(
        "relative min-h-full w-auto -mx-4 -mt-4 -mb-4 md:-mx-6 md:-mt-6 md:-mb-6 p-4 md:p-6 flex flex-col flex-1 bg-[#010102]",
        className
      )}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 opacity-100"
          style={{
            background:
              "radial-gradient(60% 60% at 55% 50%, rgb(14, 16, 22) 0%, rgb(1, 1, 2) 100%)",
            mask: "radial-gradient(60% 60% at 55% 50%, rgb(0, 0, 0) 0%, rgba(0, 0, 0, 0) 100%)",
            WebkitMask:
              "radial-gradient(60% 60% at 55% 50%, rgb(0, 0, 0) 0%, rgba(0, 0, 0, 0) 100%)",
          }}
        >
          {/* Skewed fading dark streaks */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              background:
                "linear-gradient(rgb(100, 110, 130) 0%, rgba(100, 110, 130, 0) 100%)",
              mask: "linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 20%, rgba(0, 0, 0, 0) 36%, rgb(0, 0, 0) 55%, rgba(0, 0, 0, 0.13) 67%, rgb(0, 0, 0) 78%, rgba(0, 0, 0, 0) 97%)",
              WebkitMask:
                "linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 20%, rgba(0, 0, 0, 0) 36%, rgb(0, 0, 0) 55%, rgba(0, 0, 0, 0.13) 67%, rgb(0, 0, 0) 78%, rgba(0, 0, 0, 0) 97%)",
              transform: "skewX(45deg)",
            }}
          />
          <div
            className="absolute inset-0 opacity-5"
            style={{
              background:
                "linear-gradient(rgb(100, 110, 130) 0%, rgba(100, 110, 130, 0) 100%)",
              mask: "linear-gradient(90deg, rgba(0, 0, 0, 0) 11%, rgb(0, 0, 0) 25%, rgba(0, 0, 0, 0.55) 41%, rgba(0, 0, 0, 0.13) 67%, rgb(0, 0, 0) 78%, rgba(0, 0, 0, 0) 97%)",
              WebkitMask:
                "linear-gradient(90deg, rgba(0, 0, 0, 0) 11%, rgb(0, 0, 0) 25%, rgba(0, 0, 0, 0.55) 41%, rgba(0, 0, 0, 0.13) 67%, rgb(0, 0, 0) 78%, rgba(0, 0, 0, 0) 97%)",
              transform: "skewX(45deg)",
            }}
          />
          <div
            className="absolute inset-0 opacity-5"
            style={{
              background:
                "linear-gradient(rgb(100, 110, 130) 0%, rgba(100, 110, 130, 0) 100%)",
              mask: "linear-gradient(90deg, rgba(0, 0, 0, 0) 9%, rgb(0, 0, 0) 20%, rgba(0, 0, 0, 0.55) 28%, rgba(0, 0, 0, 0.424) 40%, rgb(0, 0, 0) 48%, rgba(0, 0, 0, 0.267) 54%, rgba(0, 0, 0, 0.13) 78%, rgb(0, 0, 0) 88%, rgba(0, 0, 0, 0) 97%)",
              WebkitMask:
                "linear-gradient(90deg, rgba(0, 0, 0, 0) 9%, rgb(0, 0, 0) 20%, rgba(0, 0, 0, 0.55) 28%, rgba(0, 0, 0, 0.424) 40%, rgb(0, 0, 0) 48%, rgba(0, 0, 0, 0.267) 54%, rgba(0, 0, 0, 0.13) 78%, rgb(0, 0, 0) 88%, rgba(0, 0, 0, 0) 97%)",
              transform: "skewX(45deg)",
            }}
          />
          <div
            className="absolute inset-0 opacity-5"
            style={{
              background:
                "linear-gradient(rgb(100, 110, 130) 0%, rgba(100, 110, 130, 0) 100%)",
              mask: "linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 17%, rgba(0, 0, 0, 0.55) 26%, rgb(0, 0, 0) 35%, rgba(0, 0, 0, 0) 47%, rgba(0, 0, 0, 0.13) 69%, rgb(0, 0, 0) 79%, rgba(0, 0, 0, 0) 97%)",
              WebkitMask:
                "linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 17%, rgba(0, 0, 0, 0.55) 26%, rgb(0, 0, 0) 35%, rgba(0, 0, 0, 0) 47%, rgba(0, 0, 0, 0.13) 69%, rgb(0, 0, 0) 79%, rgba(0, 0, 0, 0) 97%)",
              transform: "skewX(45deg)",
            }}
          />
          <div
            className="absolute inset-0 opacity-5"
            style={{
              background:
                "linear-gradient(rgb(100, 110, 130) 0%, rgba(100, 110, 130, 0) 100%)",
              mask: "linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 20%, rgba(0, 0, 0, 0.55) 27%, rgb(0, 0, 0) 42%, rgba(0, 0, 0, 0) 48%, rgba(0, 0, 0, 0.13) 67%, rgb(0, 0, 0) 74%, rgb(0, 0, 0) 82%, rgba(0, 0, 0, 0.47) 88%, rgba(0, 0, 0, 0) 97%)",
              WebkitMask:
                "linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 20%, rgba(0, 0, 0, 0.55) 27%, rgb(0, 0, 0) 42%, rgba(0, 0, 0, 0) 48%, rgba(0, 0, 0, 0.13) 67%, rgb(0, 0, 0) 74%, rgb(0, 0, 0) 82%, rgba(0, 0, 0, 0.47) 88%, rgba(0, 0, 0, 0) 97%)",
              transform: "skewX(45deg)",
            }}
          />
        </div>
      </div>

      <div
        className="absolute inset-0 opacity-5 bg-repeat pointer-events-none"
        style={{
          backgroundImage:
            'url("https://framerusercontent.com/images/6mcf62RlDfRfU61Yg5vb2pefpi4.png")',
          backgroundSize: "149.76px",
        }}
      />
      {/* Subtle dot pattern overlay */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
          backgroundSize: "20px 20px",
        }}
      />

      {/* Left edge vignette to guarantee seamless blend with sidebar */}
      <div className="absolute inset-y-0 left-0 w-64 bg-gradient-to-r from-[#010102] via-[#010102]/80 to-transparent pointer-events-none z-0" />

      {/* Subtle radial highlight */}
      <div className="absolute inset-0 bg-gradient-radial from-white/[0.015] via-transparent to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex flex-col flex-1 space-y-6">{children}</div>
    </div>
  );
}

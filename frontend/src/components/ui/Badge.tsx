import React from "react";
import { cn } from "../../utils/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "danger" | "outline";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors border",
        {
          "bg-[#141516] text-[#d0d6e0] border-[#23252a]": variant === "default",
          "bg-[#27a644]/10 text-[#27a644] border-[#27a644]/30": variant === "success",
          "bg-amber-500/10 text-amber-400 border-amber-500/30": variant === "warning",
          "bg-red-500/10 text-red-400 border-red-500/30": variant === "danger",
          "bg-transparent text-[#8a8f98] border-[#23252a]": variant === "outline",
        },
        className
      )}
      {...props}
    />
  );
}


import React from "react";
import { cn } from "../../utils/cn";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5e69d1] disabled:pointer-events-none disabled:opacity-40 cursor-pointer select-none",
          {
            "bg-[#5e6ad2] text-white hover:bg-[#828fff] active:bg-[#5e69d1] shadow-sm": variant === "primary",
            "bg-[#0f1011] text-[#f7f8f8] border border-[#23252a] hover:bg-[#141516] hover:border-[#34343a]": variant === "secondary",
            "border border-[#23252a] bg-transparent text-[#f7f8f8] hover:bg-[#0f1011] hover:border-[#34343a]": variant === "outline",
            "bg-transparent text-[#d0d6e0] hover:bg-[#0f1011] hover:text-[#f7f8f8]": variant === "ghost",
            "bg-red-950/40 text-red-400 border border-red-900/50 hover:bg-red-900/60": variant === "danger",
            "h-8 px-3 text-xs": size === "sm",
            "h-9 px-4 py-2 text-sm": size === "md",
            "h-11 px-6 text-base": size === "lg",
          },
          className
        )}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && (
          <svg className="mr-2 h-4 w-4 animate-spin text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";


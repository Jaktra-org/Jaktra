import React from "react";
import { cn } from "../../utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className="mb-1.5 block text-xs font-medium text-[#d0d6e0] tracking-wide">{label}</label>}
        <input
          ref={ref}
          className={cn(
            "flex h-9 w-full rounded-md border border-[#23252a] bg-[#0f1011] px-3 py-2 text-sm text-[#f7f8f8] placeholder-[#62666d] transition-colors focus:border-[#5e69d1] focus:outline-none focus:ring-1 focus:ring-[#5e69d1] disabled:cursor-not-allowed disabled:opacity-40",
            error && "border-red-500/80 focus:ring-red-500/80",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";


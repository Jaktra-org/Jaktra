import React, { useState } from "react";
import { cn } from "../../utils/cn";
import { Eye, EyeOff } from "lucide-react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, type, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const actualType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-xs font-semibold text-[#8a8f98] tracking-wide cursor-pointer">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <input
            ref={ref}
            id={inputId}
            type={actualType}
            className={cn(
              "flex h-9 w-full rounded-lg border border-[#23252a] bg-[#010102] px-3.5 py-2 text-xs text-[#f7f8f8] placeholder-[#8a8f98] transition-colors focus:border-[#5e6ad2] focus:outline-none focus:ring-2 focus:ring-[#5e69d1]/50 disabled:cursor-not-allowed disabled:opacity-40",
              isPassword && "pr-10 font-mono",
              error && "border-red-500/80 bg-red-950/20 text-red-300 ring-1 ring-red-500/50 focus:border-red-500 focus:ring-red-500/50",
              className
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 text-[#8a8f98] hover:text-[#f7f8f8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5e69d1] rounded p-0.5 transition-colors cursor-pointer"
              title={showPassword ? "Hide Password" : "Show Password"}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>
        {typeof error === "string" && <p className="mt-1 text-xs text-red-400 font-medium">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

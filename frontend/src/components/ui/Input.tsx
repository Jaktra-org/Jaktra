import React, { useState } from "react";
import { cn } from "../../utils/cn";
import { Eye, EyeOff } from "lucide-react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const actualType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className="w-full">
        {label && <label className="mb-1.5 block text-xs font-semibold text-[#8a8f98] tracking-wide">{label}</label>}
        <div className="relative flex items-center">
          <input
            ref={ref}
            type={actualType}
            className={cn(
              "flex h-9 w-full rounded-xl border border-[#23252a] bg-[#010102] px-3.5 py-2 text-xs text-[#f7f8f8] placeholder-[#62666d] transition-colors focus:border-[#40434d] focus:outline-none focus:ring-1 focus:ring-[#555761] disabled:cursor-not-allowed disabled:opacity-40",
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
              className="absolute right-3 text-[#8a8f98] hover:text-[#f7f8f8] transition-colors cursor-pointer"
              title={showPassword ? "Hide Password" : "Show Password"}
              tabIndex={-1}
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

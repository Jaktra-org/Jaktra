import React from "react";
import { cn } from "../../utils/cn";

export interface ToneSelectorProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  value: string;
  onChange: (value: string) => void;
  includeAuto?: boolean;
  placeholder?: string;
}

export function ToneSelector({
  value,
  onChange,
  includeAuto = true,
  placeholder,
  className,
  ...props
}: ToneSelectorProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "flex h-9 rounded-md border border-[#23252a] bg-[#010102] px-3 py-1.5 text-xs text-[#f7f8f8] focus:outline-none focus:ring-1 focus:ring-[#5e69d1] disabled:cursor-not-allowed disabled:opacity-40 font-medium",
        className
      )}
      {...props}
    >
      {placeholder && (
        <option value="" disabled hidden={value !== ""}>
          {placeholder}
        </option>
      )}
      {includeAuto && (
        <option value="">Auto (Triage Engine)</option>
      )}
      <option value="stage_1_warm">Warm (Stage 1)</option>
      <option value="stage_2_firm">Firm (Stage 2)</option>
      <option value="stage_3_serious">Serious (Stage 3)</option>
      <option value="stage_4_stern">Stern (Stage 4)</option>
    </select>
  );
}

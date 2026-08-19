import { CustomSelect } from "../ui/CustomSelect";

export interface ToneSelectorProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  includeAuto?: boolean;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  placement?: 'bottom' | 'top';
}

export function ToneSelector({
  value,
  onChange,
  includeAuto = true,
  placeholder,
  className,
  disabled = false,
  placement = 'bottom',
}: ToneSelectorProps) {
  const options = [
    ...(includeAuto ? [{ label: "Triage Engine (Auto)", value: "" }] : []),
    { label: "Warm (Stage 1)", value: "stage_1_warm" },
    { label: "Firm (Stage 2)", value: "stage_2_firm" },
    { label: "Serious (Stage 3)", value: "stage_3_serious" },
    { label: "Stern (Stage 4)", value: "stage_4_stern" },
  ];

  return (
    <CustomSelect
      value={value}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
      placement={placement}
    />
  );
}

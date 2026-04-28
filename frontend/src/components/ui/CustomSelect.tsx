import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface CustomSelectOption {
  label: string;
  value: string;
}

export interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder,
  icon,
  rightIcon,
  className = '',
  disabled = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <button
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-[#13161c]/80 border transition-all text-xs font-medium rounded-xl cursor-pointer select-none ${
          isOpen
            ? 'border-[#5e6ad2] bg-[#13161c] text-[#f7f8f8] shadow-sm'
            : 'border-[#1e2025] text-[#f7f8f8] hover:border-[#2e3444] hover:bg-[#13161c]'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className="flex items-center gap-2 truncate">
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <span className="truncate">{selectedOption?.label || placeholder}</span>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0 text-[#8a8f98]">
          {rightIcon}
          <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#5e6ad2]' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-[#13161c] border border-[#1e2025] rounded-xl shadow-2xl p-1 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100 space-y-0.5 custom-scrollbar">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-all text-left cursor-pointer ${
                  isSelected
                    ? 'bg-[#1a1e2e] text-[#5e6ad2] border border-[#282f45] font-semibold'
                    : 'text-[#8a8f98] hover:bg-[#181a26]/60 hover:text-[#f7f8f8] border border-transparent font-medium'
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && <Check className="h-3.5 w-3.5 text-[#5e6ad2] flex-shrink-0 ml-2" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

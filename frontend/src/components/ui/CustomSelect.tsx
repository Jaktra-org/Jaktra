import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface CustomSelectOption {
  label: string;
  value: string;
  disabled?: boolean;
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
  placement?: 'bottom' | 'top';
  size?: 'sm' | 'md';
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
  placement = 'bottom',
  size = 'md',
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
        className={`w-full flex items-center justify-between gap-1.5 bg-[#010102] border transition-all font-medium cursor-pointer select-none ${
          size === 'sm' ? 'px-2.5 py-1 h-6.5 text-[11px] rounded-lg' : 'px-3 py-2.5 text-xs rounded-xl'
        } ${
          isOpen
            ? 'border-[#40434d] bg-[#0f1011] text-[#f7f8f8] shadow-sm'
            : 'border-[#23252a] text-[#f7f8f8] hover:border-[#40434d] hover:bg-[#0f1011]'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className="flex items-center gap-1.5 truncate">
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <span className="truncate">{selectedOption?.label || placeholder}</span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0 text-[#8a8f98]">
          {rightIcon}
          <ChevronDown className={`${size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#f7f8f8]' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div className={`absolute left-0 right-0 ${placement === 'top' ? 'bottom-full mb-1.5' : 'top-full mt-1.5'} z-50 bg-[#0f1011] border border-[#23252a] rounded-xl shadow-2xl p-1 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100 space-y-0.5 custom-scrollbar`}>
          {options.map((opt) => {
            if (opt.disabled) {
              return (
                <div
                  key={opt.value}
                  className={`w-full flex items-center justify-between opacity-40 cursor-not-allowed select-none ${
                    size === 'sm' ? 'px-2 py-1 text-[11px]' : 'px-3 py-2 text-xs'
                  } text-[#62666d]`}
                >
                  <span className="truncate">{opt.label}</span>
                </div>
              );
            }
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between transition-all text-left cursor-pointer ${
                  size === 'sm' ? 'px-2 py-1 text-[11px] rounded-md' : 'px-3 py-2 text-xs rounded-lg'
                } ${
                  isSelected
                    ? 'bg-[#18191c] text-[#f7f8f8] border border-[#34343a] font-semibold'
                    : 'text-[#8a8f98] hover:bg-[#18191c] hover:text-[#f7f8f8] border border-transparent font-medium'
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && <Check className={`${size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} text-[#f7f8f8] flex-shrink-0 ml-1.5`} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

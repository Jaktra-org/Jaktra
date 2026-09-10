import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../utils/cn";

type AccordionType = "single" | "multiple";
type AccordionVariant = "default" | "outline";

interface AccordionContextValue {
  type: AccordionType;
  variant: AccordionVariant;
  collapsible?: boolean;
  value: string[];
  onItemToggle: (itemValue: string) => void;
}

const AccordionContext = React.createContext<AccordionContextValue | null>(null);

interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: AccordionType;
  variant?: AccordionVariant;
  collapsible?: boolean;
  defaultValue?: string | string[];
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  children: React.ReactNode;
}

export function Accordion({
  type = "single",
  variant = "default",
  collapsible = true,
  defaultValue,
  value: controlledValue,
  onValueChange,
  className,
  children,
  ...props
}: AccordionProps) {
  const [internalValue, setInternalValue] = React.useState<string[]>(() => {
    if (defaultValue) {
      return Array.isArray(defaultValue) ? defaultValue : [defaultValue];
    }
    return [];
  });

  const activeValues = React.useMemo(() => {
    if (controlledValue !== undefined) {
      return Array.isArray(controlledValue) ? controlledValue : [controlledValue];
    }
    return internalValue;
  }, [controlledValue, internalValue]);

  const onItemToggle = React.useCallback(
    (itemValue: string) => {
      let nextValues: string[];
      if (type === "single") {
        const isCurrentOpen = activeValues.includes(itemValue);
        if (isCurrentOpen) {
          nextValues = collapsible ? [] : activeValues;
        } else {
          nextValues = [itemValue];
        }
      } else {
        if (activeValues.includes(itemValue)) {
          nextValues = activeValues.filter((v) => v !== itemValue);
        } else {
          nextValues = [...activeValues, itemValue];
        }
      }

      if (controlledValue === undefined) {
        setInternalValue(nextValues);
      }
      if (onValueChange) {
        onValueChange(type === "single" ? (nextValues[0] ?? "") : nextValues);
      }
    },
    [type, collapsible, activeValues, controlledValue, onValueChange]
  );

  return (
    <AccordionContext.Provider
      value={{
        type,
        variant,
        collapsible,
        value: activeValues,
        onItemToggle,
      }}
    >
      <div
        className={cn(
          "w-full",
          variant === "outline" ? "space-y-3" : "divide-y divide-white/[0.08]",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

const AccordionItemContext = React.createContext<{
  value: string;
  isOpen: boolean;
} | null>(null);

interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  children: React.ReactNode;
}

export function AccordionItem({
  value,
  className,
  children,
  ...props
}: AccordionItemProps) {
  const context = React.useContext(AccordionContext);
  if (!context) {
    throw new Error("AccordionItem must be used within an Accordion");
  }

  const isOpen = context.value.includes(value);

  return (
    <AccordionItemContext.Provider value={{ value, isOpen }}>
      <div
        className={cn(
          context.variant === "outline"
            ? "rounded-xl border border-white/[0.08] bg-[#111113]/90 transition-all duration-200 hover:border-white/[0.16] overflow-hidden"
            : "border-b border-white/[0.06] last:border-b-0",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}

interface AccordionTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function AccordionTrigger({
  className,
  children,
  ...props
}: AccordionTriggerProps) {
  const accordionContext = React.useContext(AccordionContext);
  const itemContext = React.useContext(AccordionItemContext);

  if (!accordionContext || !itemContext) {
    throw new Error("AccordionTrigger must be used within AccordionItem");
  }

  const { isOpen, value } = itemContext;

  return (
    <button
      type="button"
      onClick={() => accordionContext.onItemToggle(value)}
      aria-expanded={isOpen}
      className={cn(
        "flex w-full items-center justify-between text-left font-medium text-white transition-colors focus:outline-none",
        accordionContext.variant === "outline"
          ? "px-5 py-4 text-sm sm:text-base hover:text-[#b7d2f8]"
          : "py-4 text-sm sm:text-base hover:text-[#b7d2f8]",
        className
      )}
      {...props}
    >
      <span className="leading-snug pr-4">{children}</span>
      <ChevronDown
        className={cn(
          "h-4 w-4 shrink-0 text-zinc-400 transition-transform duration-200",
          isOpen && "rotate-180 text-white"
        )}
      />
    </button>
  );
}

interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function AccordionContent({
  className,
  children,
  ...props
}: AccordionContentProps) {
  const accordionContext = React.useContext(AccordionContext);
  const itemContext = React.useContext(AccordionItemContext);

  if (!accordionContext || !itemContext) {
    throw new Error("AccordionContent must be used within AccordionItem");
  }

  const { isOpen } = itemContext;

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "text-xs sm:text-sm text-zinc-400 leading-relaxed",
        accordionContext.variant === "outline"
          ? "px-5 pb-5 pt-1 border-t border-white/[0.04]"
          : "pb-4 pt-1",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

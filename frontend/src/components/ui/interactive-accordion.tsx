import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../utils/cn";

export interface InteractiveAccordionItem {
  id: string;
  number: string;
  title: string;
  subtitle?: string;
  badge?: string;
  content: React.ReactNode;
}

const defaultItems: InteractiveAccordionItem[] = [
  {
    id: "01",
    number: "01",
    title: "Instant Invoicing on Day 0",
    content:
      "Eliminate manual billing delays. Connect your billing source to trigger verified email and tokenized invoice links the moment work is signed off or goods ship.",
  },
  {
    id: "02",
    number: "02",
    title: "5-Stage Tone Escalation Cadence",
    content:
      "Calibrate follow-up urgency from polite upcoming due reminders to formal demand notices without human collection friction.",
  },
  {
    id: "03",
    number: "03",
    title: "Autonomous Dispute Triage",
    content:
      "Detect customer questions, missing POs, and rate disputes in inbound replies. Automatically pause reminders to protect commercial goodwill.",
  },
  {
    id: "04",
    number: "04",
    title: "Tokenized Zero-Login Payment Links",
    content:
      "Allow accounts payable contacts to view statements and pay via cards, bank transfer, or UPI in one click without password friction.",
  },
];

interface InteractiveAccordionProps {
  items?: InteractiveAccordionItem[];
  defaultActiveId?: string | null;
  className?: string;
}

export function InteractiveAccordion({
  items = defaultItems,
  defaultActiveId = items[0]?.id ?? null,
  className,
}: InteractiveAccordionProps) {
  const [activeId, setActiveId] = useState<string | null>(defaultActiveId);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className={cn("w-full", className)}>
      <div className="space-y-0">
        {items.map((item) => {
          const isActive = activeId === item.id;
          const isHovered = hoveredId === item.id;

          return (
            <div key={item.id} className="relative">
              <motion.button
                type="button"
                onClick={() => setActiveId(isActive ? null : item.id)}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="w-full group relative text-left focus:outline-none"
                initial={false}
              >
                <div className="flex items-center gap-4 sm:gap-6 py-5 px-2">
                  {/* Number with animated circle */}
                  <div className="relative flex items-center justify-center w-10 h-10 shrink-0">
                    <motion.div
                      className="absolute inset-0 rounded-full bg-white"
                      initial={false}
                      animate={{
                        scale: isActive ? 1 : isHovered ? 0.85 : 0,
                        opacity: isActive ? 1 : isHovered ? 0.15 : 0,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                      }}
                    />
                    <motion.span
                      className="relative z-10 text-xs sm:text-sm font-mono font-semibold tracking-wider"
                      animate={{
                        color: isActive ? "#0a0a0b" : isHovered ? "#ffffff" : "#71717a",
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.number}
                    </motion.span>
                  </div>

                  {/* Title & Subtitle */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <motion.h3
                        className="text-base sm:text-lg font-medium tracking-tight text-left"
                        animate={{
                          x: isActive || isHovered ? 3 : 0,
                          color: isActive ? "#ffffff" : isHovered ? "#ffffff" : "#a1a1aa",
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                      >
                        {item.title}
                      </motion.h3>
                      {item.badge && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-zinc-400 border border-white/[0.06]">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    {item.subtitle && (
                      <p className="text-xs text-zinc-500 mt-0.5">{item.subtitle}</p>
                    )}
                  </div>

                  {/* Animated plus/cross indicator */}
                  <div className="ml-auto flex items-center gap-3 shrink-0">
                    <motion.div
                      className="flex items-center justify-center w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.06]"
                      animate={{
                        rotate: isActive ? 45 : 0,
                        backgroundColor: isActive ? "rgba(183, 210, 248, 0.15)" : isHovered ? "rgba(255, 255, 255, 0.08)" : "rgba(255, 255, 255, 0.04)",
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      }}
                    >
                      <motion.svg
                        width="14"
                        height="14"
                        viewBox="0 0 16 16"
                        fill="none"
                        className="text-white"
                        animate={{
                          opacity: isActive || isHovered ? 1 : 0.6,
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <motion.path
                          d="M8 1V15M1 8H15"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          initial={false}
                        />
                      </motion.svg>
                    </motion.div>
                  </div>
                </div>

                {/* Base Divider */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-white/[0.08]" />

                {/* Animated Accent Underline */}
                <motion.div
                  className="absolute bottom-0 left-0 h-px bg-[#b7d2f8] origin-left"
                  initial={{ scaleX: 0 }}
                  animate={{
                    scaleX: isActive ? 1 : isHovered ? 0.25 : 0,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                  style={{ width: "100%" }}
                />
              </motion.button>

              {/* Content */}
              <AnimatePresence mode="wait">
                {isActive && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{
                      height: "auto",
                      opacity: 1,
                      transition: {
                        height: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2, delay: 0.08 },
                      },
                    }}
                    exit={{
                      height: 0,
                      opacity: 0,
                      transition: {
                        height: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.15 },
                      },
                    }}
                    className="overflow-hidden"
                  >
                    <motion.div
                      className="pl-14 sm:pl-16 pr-4 sm:pr-12 py-4 text-xs sm:text-sm text-zinc-400 leading-relaxed space-y-2"
                      initial={{ y: -8 }}
                      animate={{ y: 0 }}
                      exit={{ y: -8 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                      }}
                    >
                      {typeof item.content === "string" ? (
                        <p>{item.content}</p>
                      ) : (
                        item.content
                      )}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const UniqueAccordion = InteractiveAccordion;
export default InteractiveAccordion;

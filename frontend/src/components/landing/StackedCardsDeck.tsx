import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import "../../styles/jaktra-theme.css";
import { PLATFORM_CARDS } from "./platformCards";
export type { PlatformCardItem } from "./platformCards";

export interface StackedCardsDeckProps {
  activeIndex?: number;
  onActiveIndexChange?: (index: number) => void;
  autoCycle?: boolean;
  cycleInterval?: number;
  tilted?: boolean;
  tiltAngle?: number;
  scale?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function StackedCardsDeck({
  activeIndex: controlledIndex,
  onActiveIndexChange,
  autoCycle = true,
  cycleInterval = 6000,
  tilted = false,
  tiltAngle = -3,
  scale,
  className = "",
  style = {},
}: StackedCardsDeckProps) {
  const [internalIndex, setInternalIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const isControlled = controlledIndex !== undefined;
  const activeIndex = isControlled ? controlledIndex : internalIndex;

  const CARDS = PLATFORM_CARDS;

  const handleNext = useCallback(() => {
    const nextIdx = (activeIndex + 1) % CARDS.length;
    if (isControlled && onActiveIndexChange) {
      onActiveIndexChange(nextIdx);
    } else {
      setInternalIndex(nextIdx);
    }
  }, [activeIndex, isControlled, onActiveIndexChange, CARDS.length]);

  useEffect(() => {
    if (!autoCycle || isPaused) return;
    const timer = setInterval(() => {
      handleNext();
    }, cycleInterval);
    return () => clearInterval(timer);
  }, [autoCycle, isPaused, handleNext, cycleInterval]);

  return (
    <div
      className={`stacked-cards-container ${className}`}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 775,
        height: 580,
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        paddingLeft: 115,
        transform: tilted
          ? `perspective(1000px) rotate(${tiltAngle}deg) ${scale ? `scale(${scale})` : ""}`
          : scale
          ? `scale(${scale})`
          : undefined,
        transformOrigin: "bottom left",
        transition: "transform 0.4s ease",
        ...style,
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {CARDS.map((card, i) => {
        // Relative position in 4-card stack: 0 = front, 1 = behind, 2 = deep, 3 = back
        const position = (i - activeIndex + CARDS.length) % CARDS.length;

        const getTransform = () => {
          if (position === 0) {
            return {
              zIndex: 40,
              scale: 1,
              x: 0,
              y: 0,
              opacity: 1,
              filter: "blur(0px)",
            };
          }
          if (position === 1) {
            return {
              zIndex: 30,
              scale: 0.98,
              x: -40,
              y: -28,
              opacity: 0.92,
              filter: "blur(0px)",
            };
          }
          if (position === 2) {
            return {
              zIndex: 20,
              scale: 0.95,
              x: -76,
              y: -52,
              opacity: 0.74,
              filter: "blur(0px)",
            };
          }
          return {
            zIndex: 10,
            scale: 0.92,
            x: -108,
            y: -74,
            opacity: 0.45,
            filter: "blur(0px)",
          };
        };

        const getCardBorder = () => {
          if (position === 0) return "1.5px solid rgba(255, 255, 255, 0.22)";
          if (position === 1) return "1.5px solid rgba(255, 255, 255, 0.15)";
          if (position === 2) return "1.5px solid rgba(255, 255, 255, 0.10)";
          return "1.5px solid rgba(255, 255, 255, 0.06)";
        };

        const getCardBg = () => {
          if (position === 0) return "#0d0e12";
          if (position === 1) return "#12151e";
          if (position === 2) return "#161923";
          return "#191c28";
        };

        const getCardShadow = () => {
          if (position === 0) {
            return "0 32px 75px rgba(0, 0, 0, 0.9), 0 0 1px rgba(255, 255, 255, 0.2)";
          }
          if (position === 1) {
            return "0 24px 50px rgba(0, 0, 0, 0.8), -5px -5px 24px rgba(255, 255, 255, 0.04)";
          }
          if (position === 2) {
            return "0 18px 40px rgba(0, 0, 0, 0.7), -7px -7px 20px rgba(255, 255, 255, 0.02)";
          }
          return "0 12px 30px rgba(0, 0, 0, 0.6)";
        };

        return (
          <motion.div
            key={card.id}
            animate={getTransform()}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 24,
              mass: 0.8,
            }}
            whileHover={position === 0 ? { scale: 1.012 } : undefined}
            onClick={handleNext}
            style={{
              position: "absolute",
              top: 76,
              right: 0,
              width: "100%",
              maxWidth: 660,
              height: 475,
              borderRadius: 20,
              background: getCardBg(),
              border: getCardBorder(),
              boxShadow: getCardShadow(),
              overflow: "hidden",
              cursor: "pointer",
              userSelect: "none",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Card Window Top Bar */}
            <div
              style={{
                height: 42,
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                background: "rgba(255, 255, 255, 0.02)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 18px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ display: "flex", gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#FF5F57" }} />
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#FEBC2E" }} />
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28C840" }} />
                </div>
                {position === 0 && (
                  <span style={{ fontSize: 11.5, fontFamily: "var(--mono)", color: "rgba(255, 255, 255, 0.65)", marginLeft: 6 }}>
                    {card.windowTitle}
                  </span>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {position === 0 && card.statusText ? (
                  <span style={{ fontSize: 10.5, fontFamily: "var(--mono)", color: "rgba(255, 255, 255, 0.75)", fontWeight: 500 }}>
                    {card.statusText}
                  </span>
                ) : null}
              </div>
            </div>

            {/* Card Content Area (Only visible on active front card; background cards appear blank) */}
            {position === 0 && (
              <div style={{ padding: "16px 20px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                {/* 1. INVOICE PAGE (AUTHENTIC JAKTRA INVOICE LEDGER) */}
                {card.type === "invoices" && (
                  <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between", fontFamily: "var(--sans)" }}>
                    {/* Page Title & Actions Header */}
                    <div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 600, color: "#ffffff", letterSpacing: "-0.01em" }}>
                            Invoices
                          </div>
                          <div style={{ fontSize: 10, color: "rgba(255, 255, 255, 0.42)", marginTop: 1 }}>
                            Manage your collection portfolio and track aging accounts.
                          </div>
                        </div>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 3, padding: "4px 10px", borderRadius: 6, background: "#ffffff", color: "#000000", fontSize: 9.5, fontWeight: 600 }}>
                            + Add Invoice
                          </div>
                        </div>
                      </div>

                      {/* Filter Tabs & Search Bar */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                          <span style={{ fontSize: 9.5, padding: "2.5px 7px", borderRadius: 4, background: "rgba(255, 255, 255, 0.12)", color: "#fff", border: "1px solid rgba(255, 255, 255, 0.16)", fontWeight: 500 }}>All</span>
                          <span style={{ fontSize: 9.5, padding: "2.5px 6px", color: "rgba(255, 255, 255, 0.45)" }}>Unpaid</span>
                          <span style={{ fontSize: 9.5, padding: "2.5px 6px", color: "rgba(255, 255, 255, 0.45)" }}>Paid</span>
                          <span style={{ fontSize: 9.5, padding: "2.5px 6px", color: "rgba(255, 255, 255, 0.45)" }}>Overdue</span>
                          <span style={{ fontSize: 9.5, padding: "2.5px 6px", color: "rgba(255, 255, 255, 0.35)", display: "flex", alignItems: "center", gap: 3 }}>
                            <svg width="8.5" height="8.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                            Trash
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: 5, padding: "3px 7px", display: "flex", alignItems: "center", gap: 5, fontSize: 9.5, color: "rgba(255, 255, 255, 0.4)", width: 130 }}>
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                            Search clients...
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 3, padding: "3px 7px", borderRadius: 5, background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)", fontSize: 9.5, color: "rgba(255, 255, 255, 0.5)" }}>
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>
                            Filters
                          </div>
                        </div>
                      </div>

                      {/* Authentic Open Table */}
                      <div style={{ width: "100%" }}>
                        {/* Table Header Row */}
                        <div style={{ display: "grid", gridTemplateColumns: "72px 160px 88px 76px 96px 78px 54px", padding: "6px 4px", borderBottom: "1px solid rgba(255, 255, 255, 0.07)", fontSize: 9.5, color: "rgba(255, 255, 255, 0.42)", fontWeight: 500 }}>
                          <div>Invoice No ↕</div>
                          <div>Client Name ↕</div>
                          <div>Amount ↕</div>
                          <div>Due Date ↕</div>
                          <div>Status ↕</div>
                          <div>Days Overdue</div>
                          <div>Follow-ups ↕</div>
                        </div>

                        {/* Table Rows: Diverse Order */}
                        {[
                          {
                            no: "INV-8412",
                            client: "Acme Cloud Labs",
                            email: "billing@acmecloud.io",
                            amount: "$128,400.00",
                            due: "14/08/2026",
                            status: "Overdue",
                            badgeColor: "#ef4444",
                            badgeBg: "rgba(239, 68, 68, 0.12)",
                            badgeBorder: "1px solid rgba(239, 68, 68, 0.25)",
                            days: "14 days",
                            daysColor: "#f59e0b",
                            followUps: "2 sent",
                          },
                          {
                            no: "INV-6104",
                            client: "Datadog EMEA Corp",
                            email: "ap-finance@datadog.com",
                            amount: "$94,600.00",
                            due: "24/07/2026",
                            status: "Legal Escalation",
                            badgeColor: "#fb7185",
                            badgeBg: "rgba(244, 63, 94, 0.14)",
                            badgeBorder: "1px solid rgba(244, 63, 94, 0.3)",
                            days: "42 days",
                            daysColor: "#fb7185",
                            followUps: "5 sent",
                          },
                          {
                            no: "INV-3920",
                            client: "Supabase Technologies",
                            email: "ap@supabase.com",
                            amount: "$42,500.00",
                            due: "28/08/2026",
                            status: "Paid",
                            badgeColor: "#22c55e",
                            badgeBg: "rgba(34, 197, 94, 0.12)",
                            badgeBorder: "1px solid rgba(34, 197, 94, 0.25)",
                            days: "0 days",
                            daysColor: "rgba(255, 255, 255, 0.35)",
                            followUps: "0 sent",
                          },
                          {
                            no: "INV-5189",
                            client: "Retool Systems HQ",
                            email: "invoices@retool.com",
                            amount: "$19,250.00",
                            due: "09/09/2026",
                            status: "Pending",
                            badgeColor: "#f59e0b",
                            badgeBg: "rgba(245, 158, 11, 0.12)",
                            badgeBorder: "1px solid rgba(245, 158, 11, 0.35)",
                            days: "0 days",
                            daysColor: "rgba(255, 255, 255, 0.38)",
                            followUps: "1 sent",
                          },
                          {
                            no: "INV-7741",
                            client: "Linear Orbit Labs",
                            email: "finance@linear.app",
                            amount: "$67,800.00",
                            due: "14/08/2026",
                            status: "Overdue",
                            badgeColor: "#ef4444",
                            badgeBg: "rgba(239, 68, 68, 0.12)",
                            badgeBorder: "1px solid rgba(239, 68, 68, 0.25)",
                            days: "21 days",
                            daysColor: "#f59e0b",
                            followUps: "3 sent",
                          },
                        ].map((row, rIdx) => (
                          <div
                            key={row.no}
                            style={{
                              display: "grid",
                              gridTemplateColumns: "72px 160px 88px 76px 96px 78px 54px",
                              alignItems: "center",
                              padding: "7px 4px",
                              borderBottom: rIdx < 4 ? "1px solid rgba(255, 255, 255, 0.035)" : "none",
                              fontSize: 10.5,
                            }}
                          >
                            <div style={{ color: "rgba(255, 255, 255, 0.9)", fontWeight: 500 }}>{row.no}</div>
                            <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 8 }}>
                              <div style={{ color: "#ffffff", fontWeight: 500, fontSize: 11 }}>{row.client}</div>
                              <div style={{ fontSize: 9, color: "rgba(255, 255, 255, 0.38)", marginTop: 1 }}>{row.email}</div>
                            </div>
                            <div style={{ color: "#ffffff", fontWeight: 600, fontSize: 11, fontVariantNumeric: "tabular-nums" }}>{row.amount}</div>
                            <div style={{ fontSize: 10, color: "rgba(255, 255, 255, 0.5)" }}>{row.due}</div>
                            <div>
                              <span
                                style={{
                                  display: "inline-block",
                                  padding: "1.5px 6px",
                                  borderRadius: 4,
                                  fontSize: 9,
                                  fontWeight: 500,
                                  background: row.badgeBg,
                                  color: row.badgeColor,
                                  border: row.badgeBorder,
                                }}
                              >
                                {row.status}
                              </span>
                            </div>
                            <div style={{ fontSize: 10, color: row.daysColor, fontWeight: row.daysColor !== "rgba(255, 255, 255, 0.35)" ? 500 : 400 }}>
                              {row.days}
                            </div>
                            <div style={{ fontSize: 9.5, color: "rgba(255, 255, 255, 0.4)" }}>
                              {row.followUps}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pagination Footer */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 9.5, color: "rgba(255, 255, 255, 0.4)", paddingTop: 4 }}>
                      <div>
                        Showing <span style={{ color: "#fff" }}>1 to 5</span> of <span style={{ color: "#fff" }}>70 results</span> · Show 15 per page
                      </div>
                      <div style={{ display: "flex", gap: 10 }}>
                        <span style={{ color: "rgba(255, 255, 255, 0.25)" }}>&lt; Previous</span>
                        <span style={{ color: "#fff", cursor: "pointer" }}>Next &gt;</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. INBOUND INQUIRIES & DISPUTES PAGE */}
                {card.type === "disputes" && (
                  <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between", fontFamily: "var(--sans)" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                        <div style={{ fontSize: 16, fontWeight: 600, color: "#ffffff", letterSpacing: "-0.01em" }}>
                          Inbound Inquiries
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <span style={{ fontSize: 9.5, padding: "3px 9px", borderRadius: 5, background: "rgba(255, 255, 255, 0.12)", color: "#fff", border: "1px solid rgba(255, 255, 255, 0.2)", fontWeight: 500 }}>
                            Pending <span style={{ opacity: 0.7, marginLeft: 2 }}>4</span>
                          </span>
                          <span style={{ fontSize: 9.5, padding: "3px 7px", color: "rgba(255, 255, 255, 0.45)" }}>
                            Resolved <span style={{ opacity: 0.5 }}>28</span>
                          </span>
                          <span style={{ fontSize: 9.5, padding: "3px 7px", color: "rgba(255, 255, 255, 0.35)" }}>
                            Archived <span style={{ opacity: 0.5 }}>12</span>
                          </span>
                        </div>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {[
                          {
                            company: "Datadog Global",
                            invoice: "#INV-6104",
                            email: "ap-billing@datadog.com",
                            badge: "Payment Promise",
                            badgeColor: "#22c55e",
                            badgeBg: "rgba(34, 197, 94, 0.12)",
                            badgeBorder: "1px solid rgba(34, 197, 94, 0.25)",
                            time: "18/8/2026, 4:45 pm",
                            text: "Finance controller confirmed $94,600 wire scheduled in the Friday disbursement run. Remittance advised.",
                          },
                          {
                            company: "Figma Design Inc",
                            invoice: "#INV-2940",
                            email: "finance@figma.com",
                            badge: "Question",
                            badgeColor: "#b7d2f8",
                            badgeBg: "rgba(183, 210, 248, 0.12)",
                            badgeBorder: "1px solid rgba(183, 210, 248, 0.25)",
                            time: "18/8/2026, 3:12 pm",
                            text: "Customer requested updated ACH routing instructions and signed vendor W-9 before payment release.",
                          },
                          {
                            company: "Supabase Inc",
                            invoice: "#INV-3920",
                            email: "ap@supabase.com",
                            badge: "Unclear",
                            badgeColor: "#f59e0b",
                            badgeBg: "rgba(245, 158, 11, 0.12)",
                            badgeBorder: "1px solid rgba(245, 158, 11, 0.25)",
                            time: "18/8/2026, 1:40 pm",
                            text: "Customer indicates partial payment of $20,000 released; remainder pending audit verification next week.",
                          },
                        ].map((item) => (
                          <div
                            key={item.invoice}
                            style={{
                              background: "rgba(255, 255, 255, 0.02)",
                              border: "1px solid rgba(255, 255, 255, 0.06)",
                              borderRadius: 8,
                              padding: "9.5px 12px",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "nowrap" }}>
                                <span style={{ fontSize: 10.5, fontWeight: 600, color: "#ffffff", background: "rgba(255, 255, 255, 0.06)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: 4, padding: "2px 7px" }}>
                                  {item.company}
                                </span>
                                <span style={{ fontSize: 9.5, color: "#b7d2f8", background: "rgba(183, 210, 248, 0.08)", border: "1px solid rgba(183, 210, 248, 0.22)", borderRadius: 4, padding: "2px 6px", display: "flex", alignItems: "center", gap: 2.5 }}>
                                  Invoice: {item.invoice}
                                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                                </span>
                                <span style={{ fontSize: 9.5, color: "rgba(255, 255, 255, 0.38)" }}>
                                  {item.email}
                                </span>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <span
                                  style={{
                                    fontSize: 9,
                                    fontWeight: 500,
                                    color: item.badgeColor,
                                    background: item.badgeBg,
                                    border: item.badgeBorder,
                                    borderRadius: 4,
                                    padding: "2px 7px",
                                  }}
                                >
                                  {item.badge}
                                </span>
                                <span style={{ fontSize: 9, color: "rgba(255, 255, 255, 0.35)", display: "flex", alignItems: "center", gap: 3 }}>
                                  <svg width="8.5" height="8.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                  {item.time}
                                </span>
                                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                              </div>
                            </div>
                            <div style={{ background: "rgba(0, 0, 0, 0.22)", border: "1px solid rgba(255, 255, 255, 0.04)", borderRadius: 6, padding: "7px 10px", fontSize: 10.5, color: "rgba(255, 255, 255, 0.75)", lineHeight: 1.4 }}>
                              {item.text}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 9.5, color: "rgba(255, 255, 255, 0.4)", paddingTop: 6 }}>
                      <div>
                        Showing <span style={{ color: "#fff" }}>4</span> of <span style={{ color: "#fff" }}>4 pending inquiries</span>
                      </div>
                      <div style={{ display: "flex", gap: 10 }}>
                        <span style={{ color: "rgba(255, 255, 255, 0.25)" }}>&lt; Previous</span>
                        <span style={{ color: "rgba(255, 255, 255, 0.25)" }}>Next &gt;</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. ANALYTICS PAGE (PORTFOLIO FINANCIAL INTELLIGENCE) */}
                {card.type === "analytics" && (
                  <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between", fontFamily: "var(--sans)" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                        <div>
                          <div style={{ fontSize: 16, fontWeight: 600, color: "#ffffff", letterSpacing: "-0.01em" }}>
                            Portfolio Analytics
                          </div>
                          <div style={{ fontSize: 10, color: "rgba(255, 255, 255, 0.42)", marginTop: 1 }}>
                            Real-time cashflow velocity, aging risk distribution, and portfolio health.
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 5, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.09)", fontSize: 9.5, color: "rgba(255, 255, 255, 0.8)" }}>
                          <span>Last 30 Days</span>
                          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 11 }}>
                        <div style={{ background: "rgba(255, 255, 255, 0.025)", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: 8, padding: "8px 10px" }}>
                          <div style={{ fontSize: 9, fontWeight: 500, color: "rgba(255, 255, 255, 0.42)", letterSpacing: "0.02em" }}>TOTAL RECEIVABLE</div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: "#ffffff", marginTop: 3 }}>$352,550</div>
                          <div style={{ fontSize: 9, color: "rgba(255, 255, 255, 0.4)", marginTop: 2 }}>Across 70 invoices</div>
                        </div>
                        <div style={{ background: "rgba(255, 255, 255, 0.025)", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: 8, padding: "8px 10px" }}>
                          <div style={{ fontSize: 9, fontWeight: 500, color: "rgba(255, 255, 255, 0.42)", letterSpacing: "0.02em" }}>30-DAY VELOCITY</div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: "#34d399", marginTop: 3 }}>$188,950</div>
                          <div style={{ fontSize: 9, color: "rgba(255, 255, 255, 0.4)", marginTop: 2 }}>53.6% recovery rate</div>
                        </div>
                        <div style={{ background: "rgba(255, 255, 255, 0.025)", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: 8, padding: "8px 10px" }}>
                          <div style={{ fontSize: 9, fontWeight: 500, color: "rgba(255, 255, 255, 0.42)", letterSpacing: "0.02em" }}>OVERDUE AT RISK</div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: "#f87171", marginTop: 3 }}>$68,400</div>
                          <div style={{ fontSize: 9, color: "rgba(255, 255, 255, 0.4)", marginTop: 2 }}>19.4% in 30+ days</div>
                        </div>
                        <div style={{ background: "rgba(255, 255, 255, 0.025)", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: 8, padding: "8px 10px" }}>
                          <div style={{ fontSize: 9, fontWeight: 500, color: "rgba(255, 255, 255, 0.42)", letterSpacing: "0.02em" }}>DSO AVERAGE</div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: "#b7d2f8", marginTop: 3 }}>31.4 Days</div>
                          <div style={{ fontSize: 9, color: "rgba(255, 255, 255, 0.4)", marginTop: 2 }}>-8.2d from last month</div>
                        </div>
                      </div>

                      <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: 8, padding: "10px 12px" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                          <div style={{ fontSize: 9.5, fontWeight: 600, color: "#ffffff" }}>CASH INFLOW TREND (PAST 6 MONTHS)</div>
                          <div style={{ display: "flex", gap: 10, fontSize: 8.5 }}>
                            <span style={{ color: "#818cf8" }}>● Billed</span>
                            <span style={{ color: "#34d399" }}>● Collected</span>
                          </div>
                        </div>
                        <div style={{ height: 64, width: "100%", position: "relative" }}>
                          <svg viewBox="0 0 580 70" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
                            <defs>
                              <linearGradient id="gl-deck-chart-billed" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#818cf8" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="#818cf8" stopOpacity="0.0" />
                              </linearGradient>
                              <linearGradient id="gl-deck-chart-collected" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#34d399" stopOpacity="0.35" />
                                <stop offset="100%" stopColor="#34d399" stopOpacity="0.0" />
                              </linearGradient>
                            </defs>
                            <path d="M 20 54 Q 120 48, 220 40 T 420 22 L 560 14 L 560 64 L 20 64 Z" fill="url(#gl-deck-chart-billed)" />
                            <path d="M 20 54 Q 120 48, 220 40 T 420 22 L 560 14" stroke="#818cf8" strokeWidth="2" fill="none" />
                            <path d="M 20 58 Q 120 52, 220 46 T 420 34 L 560 22 L 560 64 L 20 64 Z" fill="url(#gl-deck-chart-collected)" />
                            <path d="M 20 58 Q 120 52, 220 46 T 420 34 L 560 22" stroke="#34d399" strokeWidth="2" fill="none" />
                            <circle cx="560" cy="14" r="3" fill="#818cf8" stroke="#0d0e12" strokeWidth="1.5" />
                            <circle cx="560" cy="22" r="3" fill="#34d399" stroke="#0d0e12" strokeWidth="1.5" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 9.5, color: "rgba(255, 255, 255, 0.4)", paddingTop: 6 }}>
                      <div>
                        Portfolio Health Score: <span style={{ color: "#34d399", fontWeight: 600 }}>88 / 100 (Grade A)</span>
                      </div>
                      <div>
                        Expected 30-Day Cash Inflow: <span style={{ color: "#ffffff", fontWeight: 600 }}>$163,600</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. AUTOPILOT PAGE (REPLICA OF ACTUAL JAKTRA AUTOPILOT DASHBOARD) */}
                {card.type === "autopilot" && (
                  <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between", fontFamily: "var(--sans)" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                        <div style={{ fontSize: 16, fontWeight: 700, color: "#ffffff", letterSpacing: "-0.01em" }}>
                          Autopilot
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ fontSize: 9.5, padding: "3.5px 8px", borderRadius: 6, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.1)", color: "rgba(255, 255, 255, 0.8)", display: "flex", alignItems: "center", gap: 5 }}>
                            <span>Triage Engine (Auto)</span>
                            <svg width="7.5" height="7.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                          </div>
                          <div style={{ fontSize: 9.5, fontWeight: 600, padding: "3.5px 10px", borderRadius: 6, background: "#ffffff", color: "#000000", display: "flex", alignItems: "center", gap: 4 }}>
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                            Run Autopilot
                          </div>
                        </div>
                      </div>

                      <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: 8, padding: "9px 12px" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
                          <div style={{ fontSize: 8.5, fontWeight: 600, color: "rgba(255, 255, 255, 0.4)", letterSpacing: "0.03em" }}>
                            INVOICE PROCESSING BREAKDOWN
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                            <span style={{ fontSize: 8, padding: "1.5px 5px", borderRadius: 3, background: "rgba(255, 255, 255, 0.1)", color: "#fff", border: "1px solid rgba(255, 255, 255, 0.15)" }}>All (36)</span>
                            <span style={{ fontSize: 8, padding: "1.5px 4px", color: "rgba(255, 255, 255, 0.4)" }}>Emails Sent (28)</span>
                            <span style={{ fontSize: 8, padding: "1.5px 4px", color: "rgba(255, 255, 255, 0.4)" }}>Legal Escalation (4)</span>
                          </div>
                        </div>

                        <div style={{ marginBottom: 6 }}>
                          <div style={{ fontSize: 8.5, fontWeight: 500, color: "#34d399", display: "flex", alignItems: "center", gap: 4, marginBottom: 3 }}>
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                            Emails Sent & Dispatched (28)
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
                            <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: 5, padding: "4.5px 7px", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 8.5, minWidth: 0 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 5, minWidth: 0, flex: 1, overflow: "hidden" }}>
                                <span style={{ color: "#b7d2f8", fontWeight: 600, flexShrink: 0 }}>INV-8412</span>
                                <span style={{ color: "rgba(255, 255, 255, 0.7)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Stage 3 notice sent (billing@acme.com)</span>
                              </div>
                              <span style={{ color: "rgba(255, 255, 255, 0.35)", fontSize: 8, flexShrink: 0, whiteSpace: "nowrap", marginLeft: 6 }}>05:09 pm</span>
                            </div>
                            <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: 5, padding: "4.5px 7px", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 8.5, minWidth: 0 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 5, minWidth: 0, flex: 1, overflow: "hidden" }}>
                                <span style={{ color: "#b7d2f8", fontWeight: 600, flexShrink: 0 }}>INV-6104</span>
                                <span style={{ color: "rgba(255, 255, 255, 0.7)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Cadence reminder sent (ap@datadog.com)</span>
                              </div>
                              <span style={{ color: "rgba(255, 255, 255, 0.35)", fontSize: 8, flexShrink: 0, whiteSpace: "nowrap", marginLeft: 6 }}>05:09 pm</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: 8.5, fontWeight: 500, color: "#f87171", display: "flex", alignItems: "center", gap: 4, marginBottom: 3 }}>
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                            Skipped due to legal escalation (4)
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
                            <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: 5, padding: "4.5px 7px", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 8.5, minWidth: 0 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 5, minWidth: 0, flex: 1, overflow: "hidden" }}>
                                <span style={{ color: "#f87171", fontWeight: 600, flexShrink: 0 }}>INV-2291</span>
                                <span style={{ color: "rgba(255, 255, 255, 0.7)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>General counsel litigation hold active</span>
                              </div>
                              <span style={{ color: "rgba(255, 255, 255, 0.35)", fontSize: 8, flexShrink: 0, whiteSpace: "nowrap", marginLeft: 6 }}>05:09 pm</span>
                            </div>
                            <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: 5, padding: "4.5px 7px", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 8.5, minWidth: 0 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 5, minWidth: 0, flex: 1, overflow: "hidden" }}>
                                <span style={{ color: "#f87171", fontWeight: 600, flexShrink: 0 }}>INV-4180</span>
                                <span style={{ color: "rgba(255, 255, 255, 0.7)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Dispute raised: PO mismatch hold</span>
                              </div>
                              <span style={{ color: "rgba(255, 255, 255, 0.35)", fontSize: 8, flexShrink: 0, whiteSpace: "nowrap", marginLeft: 6 }}>05:09 pm</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 9.5, color: "rgba(255, 255, 255, 0.4)", paddingTop: 5 }}>
                      <div>
                        Showing <span style={{ color: "#fff" }}>1</span> of <span style={{ color: "#fff" }}>1 completed batch runs</span>
                      </div>
                      <div style={{ display: "flex", gap: 10 }}>
                        <span style={{ color: "rgba(255, 255, 255, 0.25)" }}>&lt; Previous</span>
                        <span style={{ color: "rgba(255, 255, 255, 0.25)" }}>Next &gt;</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Card Footer Strip */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11, color: "rgba(255, 255, 255, 0.45)", borderTop: "1px solid rgba(255, 255, 255, 0.06)", paddingTop: 10, marginTop: 8 }}>
                  <span>{card.footerNote}</span>
                </div>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

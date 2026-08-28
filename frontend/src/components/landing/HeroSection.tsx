import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";

const stageColors: Record<string, string> = {
  "Stage 1": "#27a644",
  "Stage 2": "#d4a017",
  "Stage 3": "#d97706",
  "Stage 4": "#dc2626",
  "Stage 5": "#7f1d1d",
};

const invoices = [
  { company: "Apex Dynamics", invoice: "INV-7841", amount: "$14,500", due: "Sep 10", stage: "Stage 1", label: "Friendly Reminder" },
  { company: "ByteBridge Solutions", invoice: "INV-7839", amount: "$8,920", due: "Sep 6", stage: "Stage 2", label: "Firm Nudge" },
  { company: "CloudPulse Inc.", invoice: "INV-7835", amount: "$21,150", due: "Sep 2", stage: "Stage 3", label: "Urgency Notice" },
  { company: "DataFlow Systems", invoice: "INV-7830", amount: "$5,680", due: "Aug 28", stage: "Stage 4", label: "Final Warning" },
  { company: "Evolve Tech Partners", invoice: "INV-7828", amount: "$17,300", due: "Aug 25", stage: "Stage 5", label: "Legal Hold" },
];

function StageBadge({ stage, label }: { stage: string; label: string }) {
  const color = stageColors[stage] || "#8a8f98";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "2px 8px",
        borderRadius: "9999px",
        fontSize: "11px",
        fontWeight: 500,
        color: color,
        backgroundColor: `${color}18`,
        border: `1px solid ${color}40`,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: color, flexShrink: 0 }} />
      {stage}: {label}
    </span>
  );
}

export function HeroSection() {
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const el = document.querySelector("#how-it-works");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      style={{
        minHeight: "100vh",
        backgroundColor: "#010102",
        paddingTop: "100px",
        paddingBottom: "80px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Subtle radial glow behind content */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "0",
          left: "50%",
          transform: "translateX(-50%)",
          width: "900px",
          height: "500px",
          background: "radial-gradient(ellipse at center, rgba(94,106,210,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: "1280px",
          width: "100%",
          padding: "0 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "64px",
        }}
      >
        {/* Copy block */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ textAlign: "center", maxWidth: "760px" }}
        >
          {/* Eyebrow */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 10px",
              borderRadius: "9999px",
              backgroundColor: "#0f1011",
              border: "1px solid #23252a",
              fontSize: "12px",
              fontWeight: 500,
              color: "#8a8f98",
              letterSpacing: "0.4px",
              textTransform: "uppercase",
              marginBottom: "28px",
            }}
          >
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "var(--lavender)" }} />
            Accounts-Receivable Automation
          </div>

          {/* Headline */}
          <h1
            style={{
              fontSize: "clamp(40px, 6vw, 72px)",
              fontWeight: 600,
              lineHeight: 1.06,
              letterSpacing: "-2.5px",
              color: "#f7f8f8",
              marginBottom: "24px",
            }}
          >
            Your invoices are overdue.{" "}
            <span style={{ color: "#62666d" }}>Your team is still writing reminder emails.</span>
          </h1>

          {/* Subhead */}
          <p
            style={{
              fontSize: "18px",
              lineHeight: 1.6,
              color: "#8a8f98",
              maxWidth: "580px",
              margin: "0 auto 36px",
              letterSpacing: "-0.1px",
            }}
          >
            Jaktra replaces manual follow-up with a closed-loop AI collection system — 5-stage escalation, instant dispute triage, and structured payment plans. Finance teams stop chasing; cash starts moving.
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              to="/register"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "10px 18px",
                borderRadius: "8px",
                backgroundColor: "var(--lavender)",
                color: "#fff",
                fontSize: "14px",
                fontWeight: 500,
                textDecoration: "none",
                transition: "background-color 0.15s ease",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "var(--lavender-hover)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "var(--lavender)")}
            >
              Book a demo <ArrowRight size={14} />
            </Link>
            <a
              href="#how-it-works"
              onClick={handleScroll}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "10px 18px",
                borderRadius: "8px",
                backgroundColor: "#0f1011",
                border: "1px solid #23252a",
                color: "#d0d6e0",
                fontSize: "14px",
                fontWeight: 500,
                textDecoration: "none",
                transition: "background-color 0.15s ease",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "#141516")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "#0f1011")}
            >
              See how it works <ChevronDown size={14} />
            </a>
          </div>
        </motion.div>

        {/* Dashboard mock */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: "100%", maxWidth: "920px" }}
        >
          <div
            style={{
              backgroundColor: "#0f1011",
              borderRadius: "16px",
              border: "1px solid #23252a",
              overflow: "hidden",
              boxShadow: "0 0 0 1px #23252a, 0 32px 64px rgba(0,0,0,0.5)",
            }}
          >
            {/* Mock window chrome */}
            <div
              style={{
                padding: "12px 16px",
                borderBottom: "1px solid #23252a",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#141516",
              }}
            >
              <div style={{ display: "flex", gap: "6px" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#3e3e44" }} />
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#3e3e44" }} />
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#3e3e44" }} />
              </div>
              <div style={{ fontSize: "12px", color: "#62666d", letterSpacing: "0.2px" }}>Invoice Collection Pipeline — Jaktra</div>
              <div style={{ width: "60px" }} />
            </div>

            {/* Table header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1.2fr 1fr 1fr 1.5fr",
                padding: "10px 20px",
                borderBottom: "1px solid #23252a",
                fontSize: "11px",
                fontWeight: 500,
                color: "#62666d",
                letterSpacing: "0.3px",
                textTransform: "uppercase",
              }}
            >
              <span>Company</span>
              <span>Invoice #</span>
              <span>Amount</span>
              <span>Due Date</span>
              <span>Escalation Stage</span>
            </div>

            {/* Rows */}
            {invoices.map((inv, i) => (
              <motion.div
                key={inv.invoice}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1.2fr 1fr 1fr 1.5fr",
                  padding: "12px 20px",
                  borderBottom: "1px solid #1a1b1e",
                  alignItems: "center",
                  transition: "background-color 0.15s ease",
                  cursor: "default",
                }}
                whileHover={{ backgroundColor: "#141516" }}
              >
                <span style={{ fontSize: "13px", fontWeight: 500, color: "#f7f8f8" }}>{inv.company}</span>
                <span style={{ fontSize: "12px", color: "#8a8f98", fontFamily: "monospace" }}>{inv.invoice}</span>
                <span style={{ fontSize: "13px", fontWeight: 500, color: "#d0d6e0" }}>{inv.amount}</span>
                <span style={{ fontSize: "12px", color: "#62666d" }}>{inv.due}</span>
                <StageBadge stage={inv.stage} label={inv.label} />
              </motion.div>
            ))}

            {/* Action bar */}
            <div
              style={{
                padding: "12px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#141516",
              }}
            >
              <span style={{ fontSize: "12px", color: "#62666d" }}>5 invoices · last run 4 min ago</span>
              <button
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "5px 12px",
                  borderRadius: "6px",
                  backgroundColor: "var(--lavender)",
                  border: "none",
                  color: "#fff",
                  fontSize: "12px",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                ✦ Run AI Cycle
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

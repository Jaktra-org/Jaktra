import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import escalationMock from "../../assets/mocks/escalation-timeline.jpg";

const stages = [
  {
    number: 1,
    label: "Friendly Reminder",
    daysOverdue: "1–5 days",
    tone: "Warm, helpful, assumes oversight",
    subject: "Quick note — Invoice #INV-7841 was due Sep 10",
    preview: `Hi Sarah,\n\nHope this finds you well. This is a gentle note that Invoice #INV-7841 for $14,500.00 was due on September 10th. If you've already arranged payment, please disregard — or use the secure link below to settle it now.\n\nBest,\nAlex — Finance, Apex Corp`,
    color: "#27a644",
  },
  {
    number: 2,
    label: "Firm Nudge",
    daysOverdue: "6–14 days",
    tone: "Professional, direct, acknowledges delay",
    subject: "Following up — Invoice #INV-7841 is now 8 days overdue",
    preview: `Hi Sarah,\n\nFollowing up on Invoice #INV-7841 ($14,500.00), now 8 days past its due date of September 10th. We'd appreciate prompt settlement to keep your account in good standing.\n\nPlease pay via the link below or reply to discuss.\n\nRegards,\nAlex — Finance, Apex Corp`,
    color: "#d4a017",
  },
  {
    number: 3,
    label: "Urgency Notice",
    daysOverdue: "15–29 days",
    tone: "Firm, urgency signalled, risk implied",
    subject: "Urgent: Invoice #INV-7841 remains unpaid — action required",
    preview: `Hi Sarah,\n\nDespite two prior notices, Invoice #INV-7841 for $14,500.00 remains unpaid, now 18 days overdue. Continued non-payment may affect your credit standing and our ability to extend future terms.\n\nPlease settle immediately or contact us to arrange an alternative.\n\nAlex — Finance, Apex Corp`,
    color: "#d97706",
  },
  {
    number: 4,
    label: "Final Warning",
    daysOverdue: "30–44 days",
    tone: "Formal, last opportunity before escalation",
    subject: "Final notice — Invoice #INV-7841 ($14,500) — respond within 5 days",
    preview: `Dear Sarah,\n\nThis is a formal final notice. Invoice #INV-7841 for $14,500.00 is now 32 days overdue. If payment or a written payment arrangement is not received within 5 business days, this matter will be referred for formal debt recovery.\n\nAlex — Finance, Apex Corp`,
    color: "#dc2626",
  },
  {
    number: 5,
    label: "Legal Hold",
    daysOverdue: "45+ days",
    tone: "Legal referral notice, formal language only",
    subject: "Notice of debt recovery referral — Invoice #INV-7841",
    preview: `Dear Ms. Chen,\n\nPlease be advised that Invoice #INV-7841 for $14,500.00, now 47 days overdue, has been referred to our legal/collections team. Further communication regarding this matter will proceed through formal channels.\n\nRef: JAK-DRF-2024-0392`,
    color: "#7f1d1d",
  },
];

export function EscalationTimeline() {
  const [active, setActive] = useState(0);
  const stage = stages[active];

  return (
    <section
      style={{
        backgroundColor: "#010102",
        borderTop: "1px solid #23252a",
        padding: "96px 24px",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "48px" }}>
          <p
            style={{
              fontSize: "12px",
              fontWeight: 500,
              letterSpacing: "0.4px",
              textTransform: "uppercase",
              color: "#62666d",
              marginBottom: "14px",
            }}
          >
            Escalation engine
          </p>
          <h2
            style={{
              fontSize: "clamp(26px, 3.5vw, 36px)",
              fontWeight: 600,
              lineHeight: 1.15,
              letterSpacing: "-0.8px",
              color: "#f7f8f8",
              maxWidth: "560px",
            }}
          >
            Escalation that adapts to every invoice, automatically.
          </h2>
          <p style={{ fontSize: "15px", color: "#8a8f98", marginTop: "12px", maxWidth: "500px" }}>
            The 5-stage Tone Matrix advances only when needed — no manual triggers, no accidental legal threats on day two. Click a stage to preview the generated email.
          </p>
        </div>

        {/* Stage selector */}
        <div
          style={{
            display: "flex",
            gap: "0",
            borderRadius: "10px",
            border: "1px solid #23252a",
            overflow: "hidden",
            marginBottom: "24px",
          }}
        >
          {stages.map((s, i) => (
            <button
              key={s.number}
              onClick={() => setActive(i)}
              style={{
                flex: 1,
                padding: "12px 4px",
                border: "none",
                borderRight: i < stages.length - 1 ? "1px solid #23252a" : "none",
                background: active === i ? "#0f1011" : "transparent",
                cursor: "pointer",
                transition: "background-color 0.15s ease",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: active === i ? s.color : "#3e3e44",
                  transition: "background-color 0.2s ease",
                }}
              />
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: active === i ? 600 : 400,
                  color: active === i ? "#f7f8f8" : "#62666d",
                  whiteSpace: "nowrap",
                }}
              >
                Stage {s.number}
              </span>
              <span
                style={{
                  fontSize: "10px",
                  color: active === i ? "#8a8f98" : "#3e3e44",
                  display: "none",
                }}
                className="sm:block"
              >
                {s.label}
              </span>
            </button>
          ))}
        </div>

        {/* Email preview panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            style={{
              backgroundColor: "#0f1011",
              border: "1px solid #23252a",
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            {/* Stage badge row */}
            <div
              style={{
                padding: "14px 20px",
                borderBottom: "1px solid #23252a",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#141516",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    padding: "3px 10px",
                    borderRadius: "9999px",
                    fontSize: "11px",
                    fontWeight: 500,
                    color: stage.color,
                    backgroundColor: `${stage.color}18`,
                    border: `1px solid ${stage.color}40`,
                  }}
                >
                  <span style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: stage.color }} />
                  Stage {stage.number}: {stage.label}
                </span>
                <span style={{ fontSize: "11px", color: "#62666d" }}>{stage.daysOverdue} overdue</span>
              </div>
              <span style={{ fontSize: "11px", color: "#62666d", fontStyle: "italic" }}>Tone: {stage.tone}</span>
            </div>

            {/* Email subject */}
            <div
              style={{
                padding: "14px 20px",
                borderBottom: "1px solid #23252a",
                fontSize: "13px",
                color: "#d0d6e0",
              }}
            >
              <span style={{ color: "#62666d", marginRight: "8px" }}>Subject:</span>
              {stage.subject}
            </div>

            {/* Email body */}
            <div style={{ padding: "20px", fontSize: "14px", lineHeight: 1.7, color: "#8a8f98", whiteSpace: "pre-line" }}>
              {stage.preview}
            </div>

            {/* Action footer */}
            <div
              style={{
                padding: "12px 20px",
                borderTop: "1px solid #23252a",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                backgroundColor: "#141516",
                flexWrap: "wrap",
              }}
            >
              <button
                style={{
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
                Pay ${stage.number === 1 ? "14,500" : "14,500"} →
              </button>
              <span style={{ fontSize: "11px", color: "#62666d" }}>
                Sent via SendGrid · Reply-token verified · Delivery tracked
              </span>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Screenshot below */}
        <div style={{ borderRadius: "12px", overflow: "hidden", border: "1px solid #23252a" }}>
          <img
            src={escalationMock}
            alt="Jaktra escalation timeline email preview"
            style={{ width: "100%", height: "auto", display: "block" }}
          />
        </div>
      </div>
    </section>
  );
}

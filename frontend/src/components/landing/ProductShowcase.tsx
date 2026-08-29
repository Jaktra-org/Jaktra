// ProductShowcase — disputes queue mock + screenshot
import disputesMock from "../../assets/mocks/disputes-queue.jpg";
export function ProductShowcase() {
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
            Dispute & reply intelligence
          </p>
          <h2
            style={{
              fontSize: "clamp(26px, 3.5vw, 36px)",
              fontWeight: 600,
              lineHeight: 1.15,
              letterSpacing: "-0.8px",
              color: "#f7f8f8",
              maxWidth: "540px",
              marginBottom: "14px",
            }}
          >
            Every debtor reply, classified and queued in seconds.
          </h2>
          <p style={{ fontSize: "15px", color: "#8a8f98", maxWidth: "480px" }}>
            When a debtor replies or uses their self-service portal, Jaktra ingests the message, classifies it by intent, summarises it, and generates a draft response — before you open your inbox.
          </p>
        </div>

        {/* Mock disputes panel (code-based) */}
        <div
          style={{
            backgroundColor: "#0f1011",
            border: "1px solid #23252a",
            borderRadius: "12px",
            overflow: "hidden",
            marginBottom: "32px",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "14px 20px",
              borderBottom: "1px solid #23252a",
              backgroundColor: "#141516",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#f7f8f8" }}>
              Dispute & Reply Queue
            </span>
            <span
              style={{
                fontSize: "11px",
                padding: "2px 8px",
                borderRadius: "9999px",
                backgroundColor: "rgba(94,106,210,0.12)",
                color: "#7a7fad",
                border: "1px solid rgba(94,106,210,0.2)",
              }}
            >
              5 unread
            </span>
          </div>

          {/* Reply rows */}
          {[
            { from: "Sarah Chen", company: "ByteBridge Solutions", preview: "Hi, I've reviewed the invoice and believe the amount should be…", tag: "Dispute", tagColor: "#dc2626" },
            { from: "James Okafor", company: "DataFlow Systems", preview: "Payment is being processed — bank transfer sent this morning…", tag: "Payment Promise", tagColor: "#27a644" },
            { from: "Priya Mehta", company: "Evolve Tech Partners", preview: "Could you clarify the service period covered by this invoice?", tag: "Query", tagColor: "#5e6ad2" },
            { from: "Liu Wei", company: "CloudPulse Inc.", preview: "We'd like to discuss a payment plan for the outstanding amount…", tag: "Installment Request", tagColor: "#d97706" },
          ].map((row, i) => (
            <div
              key={i}
              style={{
                padding: "14px 20px",
                borderBottom: "1px solid #1a1b1e",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                transition: "background-color 0.15s",
                cursor: "default",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "#141516")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "transparent")}
            >
              {/* Avatar */}
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: "#23252a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#8a8f98",
                  flexShrink: 0,
                }}
              >
                {row.from.charAt(0)}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 500, color: "#f7f8f8" }}>{row.from}</span>
                  <span style={{ fontSize: "11px", color: "#62666d" }}>· {row.company}</span>
                </div>
                <div style={{ fontSize: "12px", color: "#62666d", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {row.preview}
                </div>
              </div>

              {/* Classification tag */}
              <span
                style={{
                  fontSize: "11px",
                  padding: "2px 8px",
                  borderRadius: "9999px",
                  color: row.tagColor,
                  backgroundColor: `${row.tagColor}18`,
                  border: `1px solid ${row.tagColor}40`,
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                {row.tag}
              </span>

              {/* Draft reply button */}
              <button
                style={{
                  padding: "4px 10px",
                  borderRadius: "6px",
                  backgroundColor: "var(--lavender)",
                  border: "none",
                  color: "#fff",
                  fontSize: "11px",
                  fontWeight: 500,
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                AI Draft
              </button>
            </div>
          ))}
        </div>

        <div style={{ borderRadius: "12px", overflow: "hidden", border: "1px solid #23252a" }}>
          <img
            src={disputesMock}
            alt="Jaktra disputes and reply queue"
            style={{ width: "100%", height: "auto", display: "block" }}
          />
        </div>
      </div>
    </section>
  );
}

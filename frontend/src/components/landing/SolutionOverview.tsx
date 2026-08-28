import { Link } from "react-router-dom";
import { ArrowRight, Mail, MessageSquare, CreditCard } from "lucide-react";

const features = [
  {
    icon: <Mail size={18} color="#5e6ad2" />,
    eyebrow: "01 — Escalation",
    title: "5-Stage Tone Escalation Matrix",
    body: "From warm nudge to legal-hold, every overdue invoice follows a calibrated sequence. AI generates personalized emails with embedded Razorpay payment links — no manual drafting, no accidental legal threats on day two.",
    badge: "AI-native",
    anchor: "#features",
  },
  {
    icon: <MessageSquare size={18} color="#5e6ad2" />,
    eyebrow: "02 — Disputes",
    title: "Dispute & Reply Intelligence",
    body: "Every debtor reply — email or self-service portal — is ingested, AI-classified as dispute / question / payment promise, summarized, and queued with a drafted response. Your team intervenes; AI does the triage.",
    badge: "Zero inbox chaos",
    anchor: "#features",
  },
  {
    icon: <CreditCard size={18} color="#5e6ad2" />,
    eyebrow: "03 — Plans",
    title: "Structured Installment Plans",
    body: "Debtors propose 2–24 month payment schedules from their self-service portal. You approve once. Jaktra schedules installments with penny-accurate rounding and automatically adjusts collection tone.",
    badge: "Self-service portal",
    anchor: "#features",
  },
];

export function SolutionOverview() {
  return (
    <section
      id="features"
      style={{
        backgroundColor: "#0f1011",
        borderTop: "1px solid #23252a",
        borderBottom: "1px solid #23252a",
        padding: "96px 24px",
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <p
            style={{
              fontSize: "12px",
              fontWeight: 500,
              letterSpacing: "0.4px",
              textTransform: "uppercase",
              color: "#62666d",
              marginBottom: "16px",
            }}
          >
            How Jaktra works
          </p>
          <h2
            style={{
              fontSize: "clamp(28px, 4vw, 40px)",
              fontWeight: 600,
              lineHeight: 1.15,
              letterSpacing: "-1px",
              color: "#f7f8f8",
              marginBottom: "16px",
            }}
          >
            One system. Three closed loops.
          </h2>
          <p style={{ fontSize: "16px", color: "#8a8f98", maxWidth: "460px", margin: "0 auto" }}>
            Each loop handles a distinct failure point of manual AR — and they all feed into a single unified dashboard.
          </p>
        </div>

        {/* Feature cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "16px",
            marginBottom: "48px",
          }}
        >
          {features.map((f) => (
            <div
              key={f.title}
              style={{
                backgroundColor: "#141516",
                border: "1px solid #23252a",
                borderRadius: "12px",
                padding: "28px",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                transition: "border-color 0.2s ease, background-color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "#34343a";
                (e.currentTarget as HTMLElement).style.backgroundColor = "#18191a";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "#23252a";
                (e.currentTarget as HTMLElement).style.backgroundColor = "#141516";
              }}
            >
              {/* Icon + eyebrow */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(94,106,210,0.1)",
                    border: "1px solid rgba(94,106,210,0.18)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {f.icon}
                </div>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 500,
                    color: "#62666d",
                    letterSpacing: "0.3px",
                  }}
                >
                  {f.eyebrow}
                </span>
              </div>

              {/* Title */}
              <h3
                style={{
                  fontSize: "17px",
                  fontWeight: 600,
                  color: "#f7f8f8",
                  letterSpacing: "-0.4px",
                  lineHeight: 1.3,
                }}
              >
                {f.title}
              </h3>

              {/* Body */}
              <p style={{ fontSize: "14px", lineHeight: 1.65, color: "#8a8f98", flex: 1 }}>{f.body}</p>

              {/* Footer */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "4px" }}>
                <span
                  style={{
                    fontSize: "11px",
                    padding: "2px 8px",
                    borderRadius: "9999px",
                    backgroundColor: "rgba(94,106,210,0.1)",
                    color: "#7a7fad",
                    border: "1px solid rgba(94,106,210,0.18)",
                  }}
                >
                  {f.badge}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Section CTA */}
        <div style={{ textAlign: "center" }}>
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
            Start for free <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}

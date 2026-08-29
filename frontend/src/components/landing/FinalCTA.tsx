import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export function FinalCTA() {
  return (
    <section
      style={{
        backgroundColor: "#010102",
        borderTop: "1px solid #23252a",
        padding: "80px 24px",
      }}
    >
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div
          style={{
            backgroundColor: "#0f1011",
            border: "1px solid #23252a",
            borderRadius: "16px",
            padding: "64px 48px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Subtle lavender glow */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(ellipse at 50% 0%, rgba(94,106,210,0.07) 0%, transparent 65%)",
              pointerEvents: "none",
            }}
          />

          <p
            style={{
              fontSize: "12px",
              fontWeight: 500,
              letterSpacing: "0.4px",
              textTransform: "uppercase",
              color: "#62666d",
              marginBottom: "20px",
            }}
          >
            Get started today
          </p>

          <h2
            style={{
              fontSize: "clamp(26px, 4vw, 40px)",
              fontWeight: 600,
              lineHeight: 1.12,
              letterSpacing: "-1px",
              color: "#f7f8f8",
              marginBottom: "16px",
              position: "relative",
            }}
          >
            Your overdue invoices are running on a spreadsheet.{" "}
            <span style={{ color: "#62666d" }}>They don't have to.</span>
          </h2>

          <p
            style={{
              fontSize: "16px",
              color: "#8a8f98",
              maxWidth: "480px",
              margin: "0 auto 36px",
              lineHeight: 1.6,
              position: "relative",
            }}
          >
            Join finance teams using Jaktra to close collection cycles in days, not months. Start free — no credit card required.
          </p>

          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "center",
              flexWrap: "wrap",
              position: "relative",
            }}
          >
            <Link
              to="/register"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "11px 20px",
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
            <Link
              to="/register"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "11px 20px",
                borderRadius: "8px",
                backgroundColor: "#141516",
                border: "1px solid #23252a",
                color: "#d0d6e0",
                fontSize: "14px",
                fontWeight: 500,
                textDecoration: "none",
                transition: "background-color 0.15s ease",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "#18191a")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "#141516")}
            >
              Start for free
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

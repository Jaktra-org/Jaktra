import { Link } from "react-router-dom";
import jaktraLogo from "../assets/jaktra_svg.svg";

export function DocsMock() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0b",
        color: "#f5f5f5",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        textAlign: "center",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <img src={jaktraLogo} alt="Jaktra" style={{ height: 26, width: "auto" }} />
        <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em", color: "#fff" }}>Jaktra Docs</span>
      </div>

      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "4px 14px",
          borderRadius: 9999,
          background: "rgba(183,210,248,0.1)",
          border: "1px solid rgba(183,210,248,0.25)",
          color: "#b7d2f8",
          fontSize: 12,
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: "0.05em",
          marginBottom: 16,
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#b7d2f8" }} />
        DOCUMENTATION CENTER · IN PROGRESS
      </div>

      <h1 style={{ fontSize: "clamp(26px, 3vw, 36px)", fontWeight: 600, color: "#fff", marginBottom: 12 }}>
        Full Documentation Center
      </h1>

      <p style={{ color: "rgba(255,255,255,0.6)", maxWidth: 520, lineHeight: 1.65, fontSize: 15, marginBottom: 28 }}>
        We are finalizing comprehensive setup guides, REST API specifications, webhook payloads, and cadence tuning playbooks.
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <Link
          to="/#faq"
          style={{
            padding: "10px 22px",
            borderRadius: 9999,
            background: "#fff",
            color: "#000",
            fontSize: 13,
            fontWeight: 600,
            textDecoration: "none",
            transition: "opacity 0.2s",
          }}
        >
          ← Back to FAQs
        </Link>
        <Link
          to="/register"
          style={{
            padding: "10px 22px",
            borderRadius: 9999,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.18)",
            color: "#fff",
            fontSize: 13,
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          Start for Free
        </Link>
      </div>
    </div>
  );
}

import { Link } from "react-router-dom";
import { Check } from "lucide-react";

const tiers = [
  {
    name: "Early Access",
    tagline: "All features included with zero restrictions. Autonomously accelerate cash flow today.",
    price: "$0",
    period: "free early access",
    cta: "Get started free",
    ctaLink: "/register",
    featured: true,
    limits: "Unlimited invoices · Unlimited users",
    features: [
      "5-stage autonomous escalation cadence",
      "AI dispute triage & sentiment classification",
      "Debtor self-service payment portal (/i/:token)",
      "Structured installment payment plans",
      "Dead Letter Queue (DLQ) & deliverability resilience",
      "Predictive ML delinquency risk scoring",
      "SendGrid, Resend & custom SMTP integration",
      "Full activity audit trail & event history",
      "Razorpay settlement & webhook reconciliation",
      "Multi-entity isolation & role-based access",
    ],
    missing: [],
  },
];

export function PricingSection() {
  return (
    <section
      id="pricing"
      style={{
        backgroundColor: "#010102",
        borderTop: "1px solid #23252a",
        padding: "96px 24px",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
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
            Pricing
          </p>
          <h2
            style={{
              fontSize: "clamp(28px, 4vw, 40px)",
              fontWeight: 600,
              lineHeight: 1.12,
              letterSpacing: "-1px",
              color: "#f7f8f8",
              marginBottom: "14px",
            }}
          >
            100% Free during Early Access.
          </h2>
          <p style={{ fontSize: "15px", color: "#8a8f98", maxWidth: "420px", margin: "0 auto" }}>
            Experience the full autonomous collections engine with zero credit card required and no invoice limits.
          </p>
        </div>

        {/* Tier grid */}
        <div
          style={{
            maxWidth: "540px",
            margin: "0 auto",
          }}
        >
          {tiers.map((tier) => (
            <div
              key={tier.name}
              style={{
                backgroundColor: tier.featured ? "#141516" : "#0f1011",
                border: tier.featured ? "1px solid #34343a" : "1px solid #23252a",
                borderRadius: "12px",
                padding: "28px",
                display: "flex",
                flexDirection: "column",
                gap: "0",
                position: "relative",
              }}
            >
              {/* Featured badge */}
              {tier.featured && (
                <div
                  style={{
                    position: "absolute",
                    top: "-1px",
                    right: "20px",
                    padding: "3px 10px",
                    borderRadius: "0 0 8px 8px",
                    backgroundColor: "var(--lavender)",
                    fontSize: "11px",
                    fontWeight: 500,
                    color: "#fff",
                  }}
                >
                  Most popular
                </div>
              )}

              {/* Tier name & tagline */}
              <div style={{ marginBottom: "20px" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#f7f8f8", marginBottom: "6px" }}>
                  {tier.name}
                </h3>
                <p style={{ fontSize: "12px", color: "#62666d", lineHeight: 1.5 }}>{tier.tagline}</p>
              </div>

              {/* Price */}
              <div style={{ marginBottom: "6px" }}>
                <span style={{ fontSize: "28px", fontWeight: 600, color: "#f7f8f8", letterSpacing: "-1px" }}>
                  {tier.price}
                </span>
                {tier.price !== "Custom" && (
                  <span style={{ fontSize: "12px", color: "#62666d", marginLeft: "6px" }}>{tier.period}</span>
                )}
              </div>
              <p style={{ fontSize: "11px", color: "#62666d", marginBottom: "20px" }}>{tier.limits}</p>

              {/* CTA */}
              <Link
                to={tier.ctaLink}
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "8px 14px",
                  borderRadius: "8px",
                  backgroundColor: tier.featured ? "var(--lavender)" : "#0f1011",
                  border: tier.featured ? "none" : "1px solid #23252a",
                  color: tier.featured ? "#fff" : "#f7f8f8",
                  fontSize: "13px",
                  fontWeight: 500,
                  textDecoration: "none",
                  marginBottom: "24px",
                  transition: "background-color 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  if (tier.featured) (e.currentTarget as HTMLElement).style.backgroundColor = "var(--lavender-hover)";
                  else (e.currentTarget as HTMLElement).style.backgroundColor = "#141516";
                }}
                onMouseLeave={(e) => {
                  if (tier.featured) (e.currentTarget as HTMLElement).style.backgroundColor = "var(--lavender)";
                  else (e.currentTarget as HTMLElement).style.backgroundColor = "#0f1011";
                }}
              >
                {tier.cta}
              </Link>

              {/* Divider */}
              <div style={{ height: "1px", backgroundColor: "#23252a", marginBottom: "20px" }} />

              {/* Feature list */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
                {tier.features.map((feat) => (
                  <div key={feat} style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                    <Check size={13} color="#27a644" style={{ flexShrink: 0, marginTop: "2px" }} />
                    <span style={{ fontSize: "12px", color: "#d0d6e0", lineHeight: 1.5 }}>{feat}</span>
                  </div>
                ))}
                {tier.missing.map((feat) => (
                  <div key={feat} style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                    <span style={{ fontSize: "13px", color: "#3e3e44", flexShrink: 0, marginTop: "0px", lineHeight: 1 }}>—</span>
                    <span style={{ fontSize: "12px", color: "#3e3e44", lineHeight: 1.5 }}>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Note */}
        <p style={{ textAlign: "center", fontSize: "12px", color: "#62666d", marginTop: "28px" }}>
          Paid tier pricing is being finalised. Book a demo to discuss volume, team size, and custom requirements.
        </p>
      </div>
    </section>
  );
}

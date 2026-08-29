import { Link } from "react-router-dom";
import { Check } from "lucide-react";

const tiers = [
  {
    name: "Free",
    tagline: "For individuals exploring AR automation",
    price: "$0",
    period: "forever",
    cta: "Start for free",
    ctaLink: "/register",
    featured: false,
    limits: "Up to 10 invoices · 1 user",
    features: [
      "5-stage escalation (up to 10 active invoices)",
      "SendGrid / SMTP email send",
      "Debtor self-service portal",
      "CSV import",
      "Basic dispute classification",
      "Email support",
    ],
    missing: [
      "Installment payment plans",
      "AI reply drafting",
      "Analytics dashboard",
      "Multi-user team",
      "Audit log export",
    ],
  },
  {
    name: "Starter",
    tagline: "For growing AR teams with regular volume",
    price: "—",
    period: "pricing TBD",
    cta: "Book a demo",
    ctaLink: "/register",
    featured: false,
    limits: "Up to 200 invoices · 5 users",
    features: [
      "Everything in Free",
      "200 active invoices",
      "5 team members",
      "AI reply drafting",
      "Installment payment plans",
      "Analytics & reporting",
      "Priority email support",
    ],
    missing: [
      "Custom escalation tone config",
      "Advanced audit log",
      "SLA guarantees",
    ],
  },
  {
    name: "Growth",
    tagline: "For mid-market finance teams running high volumes",
    price: "—",
    period: "pricing TBD",
    cta: "Book a demo",
    ctaLink: "/register",
    featured: true,
    limits: "Up to 1,000 invoices · 15 users",
    features: [
      "Everything in Starter",
      "1,000 active invoices",
      "15 team members",
      "Custom escalation tone prompts",
      "Advanced audit log & export",
      "Webhook integrations",
      "Dedicated onboarding call",
    ],
    missing: [],
  },
  {
    name: "Enterprise",
    tagline: "No limits. Custom SLA. Dedicated support.",
    price: "Custom",
    period: "talk to sales",
    cta: "Talk to sales",
    ctaLink: "/register",
    featured: false,
    limits: "Unlimited invoices · Unlimited users",
    features: [
      "Everything in Growth",
      "Unlimited invoices & users",
      "Custom integrations (QuickBooks, Xero, NetSuite)",
      "SSO / SAML",
      "DPA / BAA on request",
      "SLA guarantee",
      "Dedicated success manager",
      "Custom contract terms",
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
            Priced for the volume you actually collect.
          </h2>
          <p style={{ fontSize: "15px", color: "#8a8f98", maxWidth: "420px", margin: "0 auto" }}>
            Start free. Upgrade when your AR volume demands it. Exact pricing for paid tiers is being finalised — book a demo to discuss.
          </p>
        </div>

        {/* Tier grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "16px",
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

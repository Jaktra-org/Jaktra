import { Link } from "react-router-dom";
import jaktraLogo from "../../assets/jaktra_svg.svg";
import "../../styles/jaktra-theme.css";

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
  internal?: boolean;
}

const columns: { heading: string; links: FooterLink[] }[] = [
  {
    heading: "Product",
    links: [
      { label: "5-Stage Escalation", href: "/features/5-stage-escalation", internal: true },
      { label: "AI Dispute Triage", href: "/features/dispute-triage", internal: true },
      { label: "Installment Plans", href: "/features/installment-plans", internal: true },
      { label: "Zero-Login Portal", href: "/features/zero-login-portal", internal: true },
      { label: "AI Risk Scoring", href: "/features/risk-scoring", internal: true },
      { label: "Pricing & DSO Math", href: "/pricing", internal: true },
      { label: "All Platform Features →", href: "/features", internal: true },
      { label: "All Resources & Guides →", href: "/resources", internal: true },
    ],
  },
  {
    heading: "Solutions",
    links: [
      { label: "B2B SaaS AR", href: "/use-cases/saas", internal: true },
      { label: "Digital Agencies AR", href: "/use-cases/agencies", internal: true },
      { label: "Manufacturing AR", href: "/use-cases/manufacturing", internal: true },
      { label: "Construction AR", href: "/use-cases/construction", internal: true },
      { label: "Logistics & Freight AR", href: "/use-cases/logistics-freight", internal: true },
      { label: "View all 14 industries →", href: "/use-cases", internal: true },
    ],
  },
  {
    heading: "Compare",
    links: [
      { label: "Jaktra vs HighRadius", href: "/compare/jaktra-vs-highradius", internal: true },
      { label: "Jaktra vs Upflow", href: "/compare/jaktra-vs-upflow", internal: true },
      { label: "Jaktra vs Chaser", href: "/compare/jaktra-vs-chaser", internal: true },
      { label: "Jaktra vs PaidNice", href: "/compare/jaktra-vs-paidnice", internal: true },
      { label: "Jaktra vs Kolleno", href: "/compare/jaktra-vs-kolleno", internal: true },
      { label: "All software comparisons →", href: "/compare", internal: true },
    ],
  },
  {
    heading: "Integrations",
    links: [
      { label: "SendGrid", href: "https://sendgrid.com", external: true },
      { label: "Resend", href: "https://resend.com", external: true },
      { label: "Razorpay", href: "https://razorpay.com", external: true },
      { label: "QuickBooks & Xero", href: "/docs", internal: true },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about", internal: true },
      { label: "Contact", href: "/contact", internal: true },
      { label: "Documentation", href: "/docs", internal: true },
      { label: "Sign in", href: "/login", internal: true },
      { label: "Register", href: "/register", internal: true },
      { label: "Privacy Policy", href: "/privacy", internal: true },
      { label: "Terms of Service", href: "/terms", internal: true },
    ],
  },
];

export function LandingFooter() {
  const handleAnchor = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="gl-footer">
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {/* Top row: wordmark + columns */}
        <div className="gl-footer-grid">
          {/* Brand */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "12px",
              }}
            >
              <img
                src={jaktraLogo}
                alt="Jaktra"
                width={26}
                height={26}
                style={{ height: "26px", width: "26px", display: "block" }}
              />
            </div>
            <p style={{ fontSize: "12px", color: "#62666d", lineHeight: 1.6, maxWidth: "200px" }}>
              AI-native accounts-receivable automation for B2B finance teams.
            </p>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.heading}>
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: 500,
                  color: "#3e3e44",
                  letterSpacing: "0.4px",
                  textTransform: "uppercase",
                  marginBottom: "14px",
                }}
              >
                {col.heading}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {col.links.map((link) =>
                  link.internal ? (
                    <Link
                      key={link.label}
                      to={link.href}
                      style={{
                        fontSize: "12px",
                        color: "#8a8f98",
                        textDecoration: "none",
                        transition: "color 0.15s ease",
                      }}
                      onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "#f7f8f8")}
                      onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "#8a8f98")}
                    >
                      {link.label}
                    </Link>
                  ) : link.external ? (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: "12px",
                        color: "#8a8f98",
                        textDecoration: "none",
                        transition: "color 0.15s ease",
                      }}
                      onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "#f7f8f8")}
                      onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "#8a8f98")}
                    >
                      {link.label} ↗
                    </a>
                  ) : (
                    <a
                      key={link.label}
                      href={link.href}
                      onClick={(e) => handleAnchor(e, link.href)}
                      style={{
                        fontSize: "12px",
                        color: "#8a8f98",
                        textDecoration: "none",
                        transition: "color 0.15s ease",
                      }}
                      onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "#f7f8f8")}
                      onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "#8a8f98")}
                    >
                      {link.label}
                    </a>
                  )
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div
          style={{
            borderTop: "1px solid #23252a",
            paddingTop: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <p style={{ fontSize: "11px", color: "#62666d" }}>
            © {new Date().getFullYear()} Jaktra. All rights reserved.
          </p>
          <div style={{ display: "flex", gap: "20px" }}>
            <Link
              to="/privacy"
              style={{ fontSize: "11px", color: "#62666d", textDecoration: "none" }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "#8a8f98")}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "#62666d")}
            >
              Privacy
            </Link>
            <Link
              to="/terms"
              style={{ fontSize: "11px", color: "#62666d", textDecoration: "none" }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "#8a8f98")}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "#62666d")}
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

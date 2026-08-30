import { Link } from "react-router-dom";
import jaktraLogo from "../../assets/jaktra_svg.svg";

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
      { label: "Features", href: "#features" },
      { label: "How It Works", href: "#how-it-works" },
      { label: "Security", href: "#security" },
      { label: "Pricing", href: "#pricing" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    heading: "Integrations",
    links: [
      { label: "SendGrid", href: "https://sendgrid.com", external: true },
      { label: "Resend", href: "https://resend.com", external: true },
      { label: "Razorpay", href: "https://razorpay.com", external: true },
      { label: "SMTP", href: "#faq" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "Sign in", href: "/login", internal: true },
      { label: "Register", href: "/register", internal: true },
    ],
  },
  {
    heading: "Legal",
    links: [
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
    <footer
      style={{
        backgroundColor: "#010102",
        borderTop: "1px solid #23252a",
        padding: "64px 24px 32px",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {/* Top row: wordmark + columns */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.5fr repeat(4, 1fr)",
            gap: "32px",
            marginBottom: "48px",
          }}
        >
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
                style={{ height: "26px", width: "auto", display: "block" }}
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

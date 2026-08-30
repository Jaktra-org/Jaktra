import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import jaktraLogo from "../assets/jaktra_svg.svg";

function LegalNav() {
  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: "56px",
        backgroundColor: "rgba(7, 9, 14, 0.8)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          height: "100%",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          to="/"
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <img
            src={jaktraLogo}
            alt="Jaktra"
            style={{ height: "26px", width: "auto", display: "block" }}
          />
          <span
            style={{
              fontFamily: "var(--display)",
              fontSize: "18px",
              fontWeight: 600,
              letterSpacing: "-0.4px",
              color: "#ffffff",
            }}
          >
            Jaktra
          </span>
        </Link>
        <Link
          to="/"
          style={{
            fontSize: "13px",
            color: "rgba(255, 255, 255, 0.65)",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 12px",
            borderRadius: "8px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            background: "rgba(255, 255, 255, 0.02)",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = "#ffffff";
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(183, 210, 248, 0.35)";
            (e.currentTarget as HTMLElement).style.background = "rgba(183, 210, 248, 0.08)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = "rgba(255, 255, 255, 0.65)";
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(255, 255, 255, 0.08)";
            (e.currentTarget as HTMLElement).style.background = "rgba(255, 255, 255, 0.02)";
          }}
        >
          ← Back to home
        </Link>
      </div>
    </nav>
  );
}

export function Privacy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        backgroundColor: "#08090b",
        color: "#f7f8f8",
        overflowX: "hidden",
      }}
    >
      {/* Background glow mesh from landing theme */}
      <div
        className="gl-glow-mesh"
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          opacity: 0.75,
        }}
      />
      <div className="gl-colgrid" style={{ position: "fixed", zIndex: 0 }} />

      <LegalNav />
      <main
        style={{
          position: "relative",
          zIndex: 10,
          paddingTop: "56px",
          minHeight: "100vh",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{
            maxWidth: "760px",
            margin: "0 auto",
            padding: "64px 24px 96px",
          }}
        >
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
              Legal
            </p>
            <h1
              style={{
                fontSize: "36px",
                fontWeight: 600,
                letterSpacing: "-1px",
                color: "#f7f8f8",
                marginBottom: "12px",
              }}
            >
              Privacy Policy
            </h1>
            <p style={{ fontSize: "13px", color: "#62666d" }}>
              Last updated: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>

          {/* Body */}
          <div
            style={{
              fontSize: "15px",
              lineHeight: 1.75,
              color: "#8a8f98",
              display: "flex",
              flexDirection: "column",
              gap: "36px",
            }}
          >
            <section>
              <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#f7f8f8", marginBottom: "12px", letterSpacing: "-0.3px" }}>
                1. Introduction
              </h2>
              <p>
                Jaktra ("we", "us", or "our") is an accounts-receivable automation platform. This Privacy Policy explains how we collect, use, share, and protect information about you when you use our website at jaktra.site (the "Site") and our software-as-a-service platform (collectively, the "Service").
              </p>
              <p style={{ marginTop: "12px" }}>
                By accessing or using the Service, you agree to this Privacy Policy. If you do not agree, please do not use the Service.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#f7f8f8", marginBottom: "12px", letterSpacing: "-0.3px" }}>
                2. Information We Collect
              </h2>
              <p><strong style={{ color: "#d0d6e0" }}>Account information.</strong> When you register, we collect your name, work email address, company name, and password (stored hashed).</p>
              <p style={{ marginTop: "10px" }}><strong style={{ color: "#d0d6e0" }}>Customer data (invoice & debtor data).</strong> You upload or enter invoice information including debtor company names, contact names, email addresses, amounts, and due dates. This data is processed solely to operate the Service on your behalf and is never used for our own marketing or sold to third parties.</p>
              <p style={{ marginTop: "10px" }}><strong style={{ color: "#d0d6e0" }}>Usage data.</strong> We collect logs of actions taken within the platform (email sends, escalation stage changes, dispute resolutions) for audit trail, security monitoring, and product improvement. These logs are associated with your account and are exportable.</p>
              <p style={{ marginTop: "10px" }}><strong style={{ color: "#d0d6e0" }}>Device & browser data.</strong> When you visit the Site, we automatically collect your IP address, browser type, operating system, referring URL, and pages visited. This is used for security, analytics, and fraud detection.</p>
              <p style={{ marginTop: "10px" }}><strong style={{ color: "#d0d6e0" }}>Communication data.</strong> If you contact us by email or via the Service, we retain those communications to respond to you and improve our support.</p>
            </section>

            <section>
              <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#f7f8f8", marginBottom: "12px", letterSpacing: "-0.3px" }}>
                3. How We Use Your Information
              </h2>
              <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <li>To create and manage your account and authenticate your sessions.</li>
                <li>To operate the accounts-receivable automation features you have configured, including sending collection emails on your behalf.</li>
                <li>To process and classify inbound debtor replies via our AI service.</li>
                <li>To generate and display analytics and audit logs within your account.</li>
                <li>To send you transactional emails about your account (delivery failures, security alerts, billing).</li>
                <li>To improve the Service, diagnose technical issues, and develop new features.</li>
                <li>To comply with legal obligations and enforce our Terms of Service.</li>
              </ul>
              <p style={{ marginTop: "12px" }}>
                We do not use your customer data (invoice or debtor data) to train our AI models without your explicit written consent.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#f7f8f8", marginBottom: "12px", letterSpacing: "-0.3px" }}>
                4. Data Sharing and Third Parties
              </h2>
              <p>We do not sell your personal data or your customer data. We share data only with the following categories of service providers, each bound by a data processing agreement:</p>
              <ul style={{ paddingLeft: "20px", marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <li><strong style={{ color: "#d0d6e0" }}>Email delivery providers</strong> (SendGrid, Resend, or your configured SMTP) — to transmit collection emails on your behalf.</li>
                <li><strong style={{ color: "#d0d6e0" }}>Payment providers</strong> (Razorpay) — to generate and validate payment links embedded in collection emails. We do not store card details.</li>
                <li><strong style={{ color: "#d0d6e0" }}>Cloud infrastructure</strong> — our hosting, database, and caching infrastructure providers for system operation.</li>
                <li><strong style={{ color: "#d0d6e0" }}>AI inference providers</strong> — our AI classification service. Invoice and debtor data sent to inference is subject to the AI provider's enterprise data-processing terms and is not used for model training.</li>
              </ul>
              <p style={{ marginTop: "12px" }}>
                We may disclose information if required by law, court order, or governmental authority, or to protect the rights, property, or safety of Jaktra, our customers, or others.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#f7f8f8", marginBottom: "12px", letterSpacing: "-0.3px" }}>
                5. Data Security
              </h2>
              <p>
                We implement industry-standard security measures including AES-256-GCM encryption at rest, TLS 1.2+ in transit, multi-factor authentication (TOTP), JWT-based session management with short expiry, Redis-backed rate limiting, cryptographic webhook authentication, and a self-healing Dead Letter Queue for email delivery.
              </p>
              <p style={{ marginTop: "12px" }}>
                No method of transmission over the internet is 100% secure. While we take reasonable precautions, we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#f7f8f8", marginBottom: "12px", letterSpacing: "-0.3px" }}>
                6. Data Retention
              </h2>
              <p>
                We retain your account and customer data for as long as your account is active, plus 90 days after account closure to allow for data export and dispute resolution. Audit logs are retained for 12 months by default. Enterprise plans may negotiate custom retention periods.
              </p>
              <p style={{ marginTop: "12px" }}>
                You may request deletion of your account and associated data at any time by contacting us at support@jaktra.site.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#f7f8f8", marginBottom: "12px", letterSpacing: "-0.3px" }}>
                7. Your Rights
              </h2>
              <p>Depending on your jurisdiction, you may have the right to:</p>
              <ul style={{ paddingLeft: "20px", marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <li>Access the personal data we hold about you.</li>
                <li>Correct inaccurate or incomplete data.</li>
                <li>Request deletion of your data ("right to be forgotten").</li>
                <li>Restrict or object to certain processing activities.</li>
                <li>Data portability — receive your data in a machine-readable format.</li>
                <li>Withdraw consent at any time where processing is based on consent.</li>
              </ul>
              <p style={{ marginTop: "12px" }}>To exercise any of these rights, contact us at support@jaktra.site.</p>
            </section>

            <section>
              <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#f7f8f8", marginBottom: "12px", letterSpacing: "-0.3px" }}>
                8. International Data Transfers
              </h2>
              <p>
                Jaktra may process your data in countries outside your country of residence. Where data is transferred outside the EEA, UK, or other jurisdictions with specific transfer restrictions, we ensure appropriate safeguards are in place (such as Standard Contractual Clauses) as required by applicable law.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#f7f8f8", marginBottom: "12px", letterSpacing: "-0.3px" }}>
                9. Cookies and Tracking
              </h2>
              <p>
                The Jaktra platform uses session cookies (strictly necessary for authentication) and does not set tracking or advertising cookies. The marketing site (jaktra.site) may use analytics cookies to measure page performance. You may disable cookies in your browser settings; doing so will not prevent access to the core Service but may affect analytics features.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#f7f8f8", marginBottom: "12px", letterSpacing: "-0.3px" }}>
                10. Children's Privacy
              </h2>
              <p>
                The Service is not directed to individuals under 18. We do not knowingly collect personal data from minors. If you believe we have collected such data, contact us immediately at support@jaktra.site.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#f7f8f8", marginBottom: "12px", letterSpacing: "-0.3px" }}>
                11. Changes to This Policy
              </h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of material changes via email or a prominent in-product notice at least 14 days before the change takes effect. Continued use of the Service after the effective date constitutes acceptance.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#f7f8f8", marginBottom: "12px", letterSpacing: "-0.3px" }}>
                12. Contact Us
              </h2>
              <p>
                For privacy-related enquiries, data subject requests, or Data Processing Addendum requests, contact us at:
              </p>
              <div
                style={{
                  marginTop: "14px",
                  padding: "16px 20px",
                  backgroundColor: "#0f1011",
                  border: "1px solid #23252a",
                  borderRadius: "8px",
                  fontSize: "13px",
                  color: "#d0d6e0",
                  lineHeight: 1.8,
                }}
              >
                <strong>Jaktra</strong><br />
                Email: support@jaktra.site
              </div>
            </section>

            {/* Accept Privacy Policy CTA Card */}
            <div
              style={{
                marginTop: "48px",
                padding: "26px 28px",
                borderRadius: "16px",
                backgroundColor: "rgba(183, 210, 248, 0.04)",
                border: "1.5px solid rgba(183, 210, 248, 0.22)",
                boxShadow: "0 16px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(7, 21, 81, 0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "18px",
              }}
            >
              <div>
                <div style={{ fontSize: "16px", fontWeight: 600, color: "#ffffff", letterSpacing: "-0.01em" }}>
                  Ready to automate your collection portfolio?
                </div>
                <div style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.6)", marginTop: "4px" }}>
                  Your privacy and enterprise data are safeguarded with 256-bit encryption.
                </div>
              </div>
              <Link
                to="/register"
                style={{
                  padding: "11px 24px",
                  borderRadius: "9px",
                  backgroundColor: "#ffffff",
                  color: "#050505",
                  fontWeight: 600,
                  fontSize: "13.5px",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  fontFamily: "var(--sans)",
                  transition: "all 0.2s ease",
                  boxShadow: "0 4px 14px rgba(0, 0, 0, 0.35)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#b7d2f8";
                  e.currentTarget.style.boxShadow = "0 0 24px rgba(183, 210, 248, 0.45)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#ffffff";
                  e.currentTarget.style.boxShadow = "0 4px 14px rgba(0, 0, 0, 0.35)";
                }}
              >
                Accept & Continue to Register →
              </Link>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

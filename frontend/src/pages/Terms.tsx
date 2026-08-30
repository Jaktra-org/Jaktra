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

export function Terms() {
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
              Terms of Service
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
                1. Acceptance of Terms
              </h2>
              <p>
                These Terms of Service ("Terms") constitute a legally binding agreement between you (or the entity you represent) and Jaktra ("we", "us", or "our") governing your access to and use of the Jaktra platform and website at jaktra.site (collectively, the "Service"). By creating an account or using the Service, you agree to be bound by these Terms and our Privacy Policy.
              </p>
              <p style={{ marginTop: "12px" }}>
                If you are accepting these Terms on behalf of an organisation, you represent that you have authority to bind that organisation. If you do not agree, do not use the Service.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#f7f8f8", marginBottom: "12px", letterSpacing: "-0.3px" }}>
                2. Description of Service
              </h2>
              <p>
                Jaktra is an accounts-receivable automation platform that enables businesses ("Customers") to automate the sending of collection communications to their own clients ("Debtors"), manage inbound replies, classify disputes, and administer structured payment plans. The Service operates as a software-as-a-service (SaaS) product accessible via web browser.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#f7f8f8", marginBottom: "12px", letterSpacing: "-0.3px" }}>
                3. Accounts and Registration
              </h2>
              <p>
                You must register for an account to use the Service. You agree to provide accurate, complete, and current information and to keep it updated. You are responsible for maintaining the confidentiality of your credentials and for all activity that occurs under your account.
              </p>
              <p style={{ marginTop: "12px" }}>
                You must enable multi-factor authentication (MFA) on admin and manager accounts. Jaktra reserves the right to suspend accounts that show signs of compromise or suspicious activity without prior notice.
              </p>
              <p style={{ marginTop: "12px" }}>
                You must be at least 18 years of age to use the Service.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#f7f8f8", marginBottom: "12px", letterSpacing: "-0.3px" }}>
                4. Acceptable Use
              </h2>
              <p>You agree not to use the Service to:</p>
              <ul style={{ paddingLeft: "20px", marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <li>Send collection communications to individuals or entities who do not owe you a legitimate, verifiable commercial debt.</li>
                <li>Send spam, unsolicited communications, or harassment of any kind.</li>
                <li>Violate any applicable law, including consumer protection, debt collection regulations (e.g., the Fair Debt Collection Practices Act in the US, FCA rules in the UK), or data protection law.</li>
                <li>Impersonate another person or entity, or misrepresent your identity or authority to collect a debt.</li>
                <li>Attempt to circumvent the platform's security controls, rate limits, or authentication mechanisms.</li>
                <li>Reverse engineer, decompile, or attempt to extract the source code of the Service.</li>
                <li>Resell, sublicense, or make the Service available to third parties without written consent from Jaktra.</li>
              </ul>
              <p style={{ marginTop: "12px" }}>
                Jaktra reserves the right to suspend or terminate accounts that violate this Acceptable Use Policy without refund.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#f7f8f8", marginBottom: "12px", letterSpacing: "-0.3px" }}>
                5. Customer Responsibility for Collection Communications
              </h2>
              <p>
                You are solely responsible for the accuracy of the invoice and debtor data you input into Jaktra, and for ensuring that your use of the Service complies with all applicable debt collection laws in your jurisdiction. Jaktra acts as a technology service provider, not a debt collection agency, and is not responsible for the content of communications you send or for their legal compliance.
              </p>
              <p style={{ marginTop: "12px" }}>
                You must have a legitimate legal basis and a pre-existing commercial relationship with each Debtor to whom collection communications are sent via the Service.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#f7f8f8", marginBottom: "12px", letterSpacing: "-0.3px" }}>
                6. Fees and Payment
              </h2>
              <p>
                The Free plan is provided at no charge. Paid plans ("Subscription Plans") are billed in advance on a monthly or annual basis. Current pricing for paid plans will be made available on our pricing page. All fees are exclusive of applicable taxes.
              </p>
              <p style={{ marginTop: "12px" }}>
                Failure to pay subscription fees may result in suspension of your account. You may cancel your subscription at any time; cancellation takes effect at the end of the current billing period. We do not issue refunds for unused portions of a billing period except where required by applicable law.
              </p>
              <p style={{ marginTop: "12px" }}>
                Jaktra reserves the right to modify pricing with 30 days' notice to existing subscribers.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#f7f8f8", marginBottom: "12px", letterSpacing: "-0.3px" }}>
                7. Data Ownership and Processing
              </h2>
              <p>
                You retain full ownership of your Customer Data (invoice data, debtor data, and communications). You grant Jaktra a limited licence to process your Customer Data solely for the purpose of operating the Service. Jaktra will not use your Customer Data for any other purpose, including training AI models, without your explicit written consent.
              </p>
              <p style={{ marginTop: "12px" }}>
                For Enterprise customers requiring a formal Data Processing Addendum (DPA) under GDPR, UK GDPR, or equivalent regulation, contact support@jaktra.site.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#f7f8f8", marginBottom: "12px", letterSpacing: "-0.3px" }}>
                8. Intellectual Property
              </h2>
              <p>
                Jaktra and its licensors retain all intellectual property rights in and to the Service, including the software, design, trademarks, and documentation. Nothing in these Terms grants you any rights in the Jaktra brand, software, or intellectual property beyond the limited right to use the Service as described herein.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#f7f8f8", marginBottom: "12px", letterSpacing: "-0.3px" }}>
                9. Service Availability and Modifications
              </h2>
              <p>
                Jaktra strives to maintain high availability but does not guarantee uninterrupted access to the Service. We reserve the right to modify, suspend, or discontinue any feature of the Service at any time, with notice where reasonably practicable. We will provide at least 30 days' notice of any discontinuation of a material feature for paid subscribers.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#f7f8f8", marginBottom: "12px", letterSpacing: "-0.3px" }}>
                10. Disclaimer of Warranties
              </h2>
              <p>
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. JAKTRA DOES NOT WARRANT THAT THE SERVICE WILL BE ERROR-FREE, UNINTERRUPTED, OR THAT AI-GENERATED EMAIL CONTENT WILL BE LEGALLY COMPLIANT IN YOUR JURISDICTION.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#f7f8f8", marginBottom: "12px", letterSpacing: "-0.3px" }}>
                11. Limitation of Liability
              </h2>
              <p>
                TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, JAKTRA'S TOTAL LIABILITY TO YOU FOR ANY CLAIM ARISING FROM THESE TERMS OR THE USE OF THE SERVICE SHALL NOT EXCEED THE GREATER OF (A) THE FEES YOU PAID TO JAKTRA IN THE TWELVE MONTHS PRECEDING THE CLAIM OR (B) $100. JAKTRA SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOST REVENUE, LOST PROFITS, OR LOSS OF DATA.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#f7f8f8", marginBottom: "12px", letterSpacing: "-0.3px" }}>
                12. Indemnification
              </h2>
              <p>
                You agree to indemnify and hold harmless Jaktra, its officers, employees, and agents from any claims, damages, losses, liabilities, and costs (including reasonable legal fees) arising from: (a) your use of the Service; (b) your violation of these Terms; (c) your violation of any third-party rights; or (d) the content of collection communications you send using the Service.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#f7f8f8", marginBottom: "12px", letterSpacing: "-0.3px" }}>
                13. Termination
              </h2>
              <p>
                Either party may terminate the agreement at any time. Jaktra may terminate or suspend your account immediately, without prior notice, for violation of these Terms, non-payment, or illegal use of the Service. Upon termination, your right to use the Service ceases immediately. You may export your data during the 90-day post-termination window described in our Privacy Policy.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#f7f8f8", marginBottom: "12px", letterSpacing: "-0.3px" }}>
                14. Governing Law and Dispute Resolution
              </h2>
              <p>
                These Terms are governed by applicable law, without regard to conflict of law principles. Any dispute arising from these Terms that cannot be resolved informally shall be submitted to binding arbitration in accordance with the applicable arbitration rules, except where prohibited by law. You waive any right to participate in a class action lawsuit or class-wide arbitration.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#f7f8f8", marginBottom: "12px", letterSpacing: "-0.3px" }}>
                15. Changes to These Terms
              </h2>
              <p>
                We may update these Terms from time to time. We will provide at least 14 days' notice of material changes via email or in-product notice. Your continued use of the Service after the effective date of updated Terms constitutes acceptance.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#f7f8f8", marginBottom: "12px", letterSpacing: "-0.3px" }}>
                16. Contact
              </h2>
              <p>For questions about these Terms, contact:</p>
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

            {/* Accept Terms & Conditions CTA Card */}
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
                  Accept these Terms and start recovering cash on autopilot. Free for up to 10 invoices.
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
                Accept Terms & Continue to Register →
              </Link>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

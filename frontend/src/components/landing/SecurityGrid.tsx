import { Lock, Shield, Layers, Key, List, RefreshCw } from "lucide-react";

const items = [
  {
    icon: <Lock size={18} color="#7a7fad" />,
    title: "End-to-End Data Encryption",
    body: "All invoice records, debtor details, and financial credentials are encrypted at rest with AES-256 and in transit via TLS 1.3. Zero plaintext key storage.",
  },
  {
    icon: <Shield size={18} color="#7a7fad" />,
    title: "Role-Based Team Access",
    body: "Invite team members with distinct Admin and Member roles. Protect email settings, payment keys, and collection cadences with least-privilege access.",
  },
  {
    icon: <Layers size={18} color="#7a7fad" />,
    title: "Cryptographic Tenant Isolation",
    body: "Your organization's accounts receivable, invoices, and debtor ledgers are strictly partitioned by tenant ID. Zero cross-tenant data access.",
  },
  {
    icon: <Key size={18} color="#7a7fad" />,
    title: "Cryptographic Webhook Verification",
    body: "Inbound debtor email replies and payment provider webhooks are authenticated via cryptographic signatures to reject unauthorized payloads.",
  },
  {
    icon: <List size={18} color="#7a7fad" />,
    title: "Comprehensive Audit Logs",
    body: "Tamper-evident logs recording every automated email dispatch, debtor reply, dispute review, and operator action with timestamps and actor IDs.",
  },
  {
    icon: <RefreshCw size={18} color="#7a7fad" />,
    title: "Dead Letter Queue (DLQ) Recovery",
    body: "Failed email deliveries and bounces are automatically captured in the DLQ with exponential retry logic and operator controls so no message is lost.",
  },
];

export function SecurityGrid() {
  return (
    <section
      id="security"
      style={{
        backgroundColor: "#0f1011",
        borderTop: "1px solid #23252a",
        padding: "20px 24px 80px",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "56px", maxWidth: "580px" }}>
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
            Security & compliance by design
          </p>
          <h2
            style={{
              fontSize: "clamp(26px, 3.5vw, 36px)",
              fontWeight: 600,
              lineHeight: 1.15,
              letterSpacing: "-0.8px",
              color: "#f7f8f8",
              marginBottom: "14px",
            }}
          >
            Built for the controls your IT and legal teams will actually ask about.
          </h2>
          <p style={{ fontSize: "15px", color: "#8a8f98" }}>
            Financial-grade governance, strict tenant isolation, and auditability engineered into the platform core.
          </p>
        </div>

        {/* Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "16px",
          }}
        >
          {items.map((item) => (
            <div
              key={item.title}
              style={{
                backgroundColor: "#141516",
                border: "1px solid #23252a",
                borderRadius: "12px",
                padding: "24px",
                transition: "border-color 0.2s ease",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "#34343a")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "#23252a")}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(122,127,173,0.1)",
                  border: "1px solid rgba(122,127,173,0.18)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "14px",
                }}
              >
                {item.icon}
              </div>
              <h3
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#f7f8f8",
                  marginBottom: "8px",
                  letterSpacing: "-0.2px",
                }}
              >
                {item.title}
              </h3>
              <p style={{ fontSize: "13px", lineHeight: 1.6, color: "#8a8f98" }}>{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

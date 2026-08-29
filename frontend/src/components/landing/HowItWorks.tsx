import { useRef } from "react";
import { useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Connect your email & payment stack",
    body: "Link your SendGrid, SMTP, or Resend credentials and add a Razorpay payment key. No code required — takes under 10 minutes from a settings screen.",
    detail: "Supports SendGrid · Any SMTP · Resend · Razorpay",
  },
  {
    number: "02",
    title: "Create or upload your invoices",
    body: "Create invoices directly or import via CSV. Jaktra reads debtor details, amount, and due date — and maps each invoice to the correct escalation stage immediately.",
    detail: "Manual creation · CSV import · QuickBooks/Xero coming soon",
  },
  {
    number: "03",
    title: "Let the system run the cycle",
    body: "Outbound emails go on schedule. Replies are classified and queued. Disputes are surfaced with AI-drafted responses. You intervene only when a human decision is needed.",
    detail: "Automated scheduling · AI triage · Full audit trail",
  },
];

function Step({ step, index }: { step: typeof steps[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 0.5s ease ${index * 0.12}s, transform 0.5s ease ${index * 0.12}s`,
        display: "flex",
        gap: "24px",
      }}
    >
      {/* Left: number + connector */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "9999px",
            border: "1px solid var(--lavender)",
            backgroundColor: "rgba(94,106,210,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            fontWeight: 600,
            color: "var(--lavender)",
            flexShrink: 0,
          }}
        >
          {step.number}
        </div>
        {index < steps.length - 1 && (
          <div
            style={{
              flex: 1,
              width: "1px",
              backgroundColor: "#23252a",
              marginTop: "8px",
              minHeight: "40px",
            }}
          />
        )}
      </div>

      {/* Right: content */}
      <div style={{ paddingBottom: index < steps.length - 1 ? "40px" : "0" }}>
        <h3
          style={{
            fontSize: "17px",
            fontWeight: 600,
            color: "#f7f8f8",
            letterSpacing: "-0.4px",
            marginBottom: "10px",
            marginTop: "6px",
          }}
        >
          {step.title}
        </h3>
        <p style={{ fontSize: "14px", lineHeight: 1.65, color: "#8a8f98", marginBottom: "10px" }}>
          {step.body}
        </p>
        <span
          style={{
            fontSize: "11px",
            color: "#62666d",
            fontFamily: "monospace",
          }}
        >
          {step.detail}
        </span>
      </div>
    </div>
  );
}

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      style={{
        backgroundColor: "#0f1011",
        borderTop: "1px solid #23252a",
        borderBottom: "1px solid #23252a",
        padding: "96px 24px",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "80px",
          alignItems: "start",
        }}
      >
        {/* Left: heading */}
        <div style={{ position: "sticky", top: "80px" }}>
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
            Setup to collections
          </p>
          <h2
            style={{
              fontSize: "clamp(28px, 3.5vw, 40px)",
              fontWeight: 600,
              lineHeight: 1.12,
              letterSpacing: "-1px",
              color: "#f7f8f8",
              marginBottom: "20px",
            }}
          >
            Connect. Create. Collect.
          </h2>
          <p style={{ fontSize: "15px", lineHeight: 1.65, color: "#8a8f98", marginBottom: "32px" }}>
            Jaktra is operational in under a day. No professional services, no six-week onboarding. Your first automated collection cycle runs before your next stand-up.
          </p>
          <Link
            to="/register"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "10px 16px",
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
            Get started <ArrowRight size={14} />
          </Link>
        </div>

        {/* Right: steps */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {steps.map((step, i) => (
            <Step key={step.number} step={step} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

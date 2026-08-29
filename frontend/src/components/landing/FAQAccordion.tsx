import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    q: "Does Jaktra send emails from my domain or yours?",
    a: "Your domain, via your own SendGrid, SMTP, or Resend credentials. We never send collection emails from a Jaktra address — every outbound email is from your verified sending domain, preserving your sender reputation and brand identity.",
  },
  {
    q: "What happens if a debtor disputes the invoice amount?",
    a: "Disputes are automatically detected, flagged, classified, and queued for your team. The escalation cycle pauses automatically until the dispute is resolved or manually restarted. An AI-drafted response is queued ready for your review — you don't start from a blank page.",
  },
  {
    q: "Can we control the escalation tone ourselves?",
    a: "Yes. Each of the 5 stages has a configurable tone prompt and a configurable send delay. You define the guardrails; the AI generates copy within those parameters. You can require approval before any stage advances, or run it fully automated.",
  },
  {
    q: "Does Jaktra integrate with our accounting software?",
    a: "Currently via CSV import and direct invoice entry. Native integrations with QuickBooks Online, Xero, and NetSuite are on the roadmap. If you have a specific integration requirement, raise it during your demo — we're actively prioritising based on customer need.",
  },
  {
    q: "Is there a free tier or trial?",
    a: "Yes — the Free plan supports up to 10 active invoices and 1 user with no time limit. It's a permanent free tier, not a trial. If you need to evaluate the full feature set at scale, book a demo and we'll configure a sandbox with your invoice data.",
  },
  {
    q: "What email providers and payment gateways are supported?",
    a: "For email: SendGrid, any SMTP-compatible mail server, and Resend. For payment links embedded in collection emails: Razorpay. Additional payment gateways are on the roadmap.",
  },
  {
    q: "Who has access to our debtor and invoice data?",
    a: "Only your team. Jaktra is fully multi-tenant with cryptographic data isolation. Jaktra staff do not access customer data except under an agreed Data Processing Addendum (DPA) for Enterprise plans, and only for support purposes with explicit written consent.",
  },
  {
    q: "What happens if an email fails to deliver?",
    a: "Jaktra's Dead Letter Queue automatically retries failed deliveries with exponential backoff. Persistent failures trigger an operations alert and are surfaced in your dashboard so no invoice falls through the cracks silently.",
  },
];

export function FAQAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section
      id="faq"
      style={{
        backgroundColor: "#010102",
        borderTop: "1px solid #23252a",
        padding: "96px 24px",
      }}
    >
      <div style={{ maxWidth: "760px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "48px", textAlign: "center" }}>
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
            FAQ
          </p>
          <h2
            style={{
              fontSize: "clamp(26px, 3.5vw, 36px)",
              fontWeight: 600,
              lineHeight: 1.15,
              letterSpacing: "-0.8px",
              color: "#f7f8f8",
            }}
          >
            Frequently asked
          </h2>
        </div>

        {/* Accordion items */}
        <div
          style={{
            border: "1px solid #23252a",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          {faqs.map((faq, i) => (
            <div
              key={i}
              style={{
                borderBottom: i < faqs.length - 1 ? "1px solid #23252a" : "none",
              }}
            >
              {/* Question row */}
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "18px 24px",
                  background: open === i ? "#0f1011" : "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  gap: "16px",
                  transition: "background-color 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  if (open !== i) (e.currentTarget as HTMLElement).style.backgroundColor = "#0a0a0c";
                }}
                onMouseLeave={(e) => {
                  if (open !== i) (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                }}
              >
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: 500,
                    color: open === i ? "#f7f8f8" : "#d0d6e0",
                    lineHeight: 1.4,
                    flex: 1,
                  }}
                >
                  {faq.q}
                </span>
                <span style={{ color: "#62666d", flexShrink: 0 }}>
                  {open === i ? <Minus size={15} /> : <Plus size={15} />}
                </span>
              </button>

              {/* Answer */}
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: "easeInOut" }}
                    style={{ overflow: "hidden" }}
                  >
                    <div
                      style={{
                        padding: "0 24px 20px",
                        backgroundColor: "#0f1011",
                        fontSize: "14px",
                        lineHeight: 1.7,
                        color: "#8a8f98",
                      }}
                    >
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

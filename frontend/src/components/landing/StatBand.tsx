import { useRef, useEffect, useState } from "react";
import { useInView } from "framer-motion";

const stats = [
  { value: 5, suffix: " Stages", label: "Tone Escalation Cadence", note: "Courtesy reminder to legal notice" },
  { value: 20, suffix: " Hours", label: "Rolling Idempotency Barrier", note: "Deterministic anti-spam guard" },
  { value: 15, suffix: " Mins", label: "Ledger Connection Setup", note: "QuickBooks, Xero, Stripe & CSV" },
  { value: 100, suffix: "%", label: "Free in Early Access", note: "Full platform, no credit card required" },
];

function CountUp({ to, suffix, active }: { to: number; suffix: string; active: boolean }) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!active) return;
    const duration = 1400;
    const start = performance.now();
    const isDecimal = !Number.isInteger(to);

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * to;
      setVal(isDecimal ? Math.round(current * 10) / 10 : Math.round(current));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [active, to]);

  return (
    <span>
      {val}
      {suffix}
    </span>
  );
}

export function StatBand() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section
      ref={ref}
      style={{
        backgroundColor: "#010102",
        borderTop: "1px solid #23252a",
        padding: "80px 24px",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1px",
            backgroundColor: "#23252a",
            borderRadius: "12px",
            overflow: "hidden",
            border: "1px solid #23252a",
          }}
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              style={{
                backgroundColor: "#0f1011",
                padding: "32px 24px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <div
                style={{
                  fontSize: "36px",
                  fontWeight: 600,
                  letterSpacing: "-1.5px",
                  color: "#f7f8f8",
                  lineHeight: 1,
                }}
              >
                <CountUp to={stat.value} suffix={stat.suffix} active={inView} />
              </div>
              <div style={{ fontSize: "13px", fontWeight: 500, color: "#d0d6e0" }}>{stat.label}</div>
              <div style={{ fontSize: "11px", color: "#62666d" }}>{stat.note}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

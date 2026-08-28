import { Inbox, AlertTriangle, Sheet } from "lucide-react";

const pains = [
  {
    icon: <Inbox size={20} color="#5e6ad2" />,
    title: "Inbox chaos",
    body: "Your reminders live in five people's sent folders. Replies fall through the cracks. No one knows who said what last — or whether the client has even been contacted this month.",
  },
  {
    icon: <AlertTriangle size={20} color="#5e6ad2" />,
    title: "Inconsistent tone",
    body: "One AR manager sends a polite nudge. Another threatens legal on day three. Debtors notice the inconsistency — and use it to stall. Every uncoordinated email costs you leverage.",
  },
  {
    icon: <Sheet size={20} color="#5e6ad2" />,
    title: "Spreadsheet triage",
    body: "You built a colour-coded tracker to manage your overdue AR. It was out of date before lunch. Every status update is manual, every follow-up is a reminder-to-write-a-reminder.",
  },
];

export function PainBand() {
  return (
    <section
      style={{
        backgroundColor: "#010102",
        padding: "96px 24px",
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        {/* Section headline */}
        <div style={{ maxWidth: "620px", marginBottom: "56px" }}>
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
            The problem
          </p>
          <h2
            style={{
              fontSize: "clamp(28px, 4vw, 40px)",
              fontWeight: 600,
              lineHeight: 1.15,
              letterSpacing: "-1px",
              color: "#f7f8f8",
            }}
          >
            Collections isn't hard because clients won't pay. It's hard because everything is manual.
          </h2>
        </div>

        {/* Pain cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "16px",
          }}
        >
          {pains.map((pain) => (
            <div
              key={pain.title}
              style={{
                backgroundColor: "#0f1011",
                border: "1px solid #23252a",
                borderRadius: "12px",
                padding: "28px",
                transition: "border-color 0.2s ease",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "#34343a")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "#23252a")}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(94,106,210,0.1)",
                  border: "1px solid rgba(94,106,210,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px",
                }}
              >
                {pain.icon}
              </div>
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#f7f8f8",
                  marginBottom: "10px",
                  letterSpacing: "-0.3px",
                }}
              >
                {pain.title}
              </h3>
              <p style={{ fontSize: "14px", lineHeight: 1.6, color: "#8a8f98" }}>{pain.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

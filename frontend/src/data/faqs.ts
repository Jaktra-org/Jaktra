export interface FAQItem {
  question: string;
  answer: string;
}

export const FAQS_LEFT: FAQItem[] = [
  {
    question: "How does the autonomous 5-stage cadence work?",
    answer:
      "Jaktra continuously monitors invoice due dates and aging buckets. Based on your schedule configuration, it automatically advances accounts through 5 staged notices: from courteous pre-due reminders to firm overdue follow-ups and final demand notices. You configure the delay between stages and can require manual approval before any stage dispatches.",
  },
  {
    question: "What happens when a debtor disputes an invoice?",
    answer:
      "The moment a debtor replies or submits a dispute through the self-service portal, Jaktra immediately pauses all cadence timers for that invoice. This prevents inappropriate automated collection notices while an issue is under review. Disputes are categorized with reason and notes, and an AI-drafted reply proposal is prepared for your team.",
  },
  {
    question: "Does Jaktra send emails from my own domain?",
    answer:
      "Yes. Jaktra integrates directly with your SendGrid, Resend, or custom SMTP server. All outbound reminders and escalation notices originate from your verified business address (e.g., billing@yourcompany.com) with full SPF, DKIM, and DMARC alignment.",
  },
  {
    question: "Can debtors set up installment payment plans?",
    answer:
      "Yes. When debtors access their secure portal, they can request structured multi-part payment plans. Once approved, Jaktra generates individual installment schedules and tracks partial settlements, keeping collection cadences paused as long as installments remain on track.",
  },
  {
    question: "How do debtors pay invoices through the portal?",
    answer:
      "Every notification includes a tokenized, zero-friction link to a branded Debtor Portal. Debtors require no password or login. They can view line items, download PDF copies, submit notes, and settle immediately via integrated online checkout (e.g., Razorpay).",
  },
  {
    question: "Can we control escalation tones and copy?",
    answer:
      "Absolutely. Each of the 5 escalation stages has customizable subject lines, email templates, and AI tone prompts (from courteous reminders to firm formal demand letters). You retain complete authority over your brand voice.",
  },
];

export const FAQS_RIGHT: FAQItem[] = [
  {
    question: "How do I import existing invoices into Jaktra?",
    answer:
      "You can bulk-import invoices via CSV upload or synchronize them via our REST API. Jaktra automatically parses customer details, line items, currency, issue dates, and due dates, instantly slotting each account into its correct aging bucket.",
  },
  {
    question: "How is debtor data isolated and secured?",
    answer:
      "Jaktra enforces strict tenant isolation at the database layer. All sensitive credentials—such as SMTP passwords and payment gateway secrets—are encrypted with AES-256 at rest. Webhook payloads are cryptographically signed using HMAC SHA-256, and data in transit is protected by TLS 1.3.",
  },
  {
    question: "Is there an audit log of all communications?",
    answer:
      "Yes. Jaktra maintains an immutable, tenant-scoped Activity Log recording every event: email dispatch and delivery status, debtor payment link views, dispute submissions, installment agreements, and manual cadence overrides.",
  },
  {
    question: "Is Jaktra free to use?",
    answer:
      "Yes. Jaktra is 100% free during Early Access with zero credit card required. You get full access to the 5-stage cadence engine, debtor portal, CSV import, dispute triage, and SendGrid/SMTP delivery with no artificial invoice limits.",
  },
  {
    question: "Can multiple team members access the workspace?",
    answer:
      "Yes. Jaktra supports role-based team management (Admin, Member, and Auditor). You can invite finance colleagues with specific permissions, allowing AR specialists to manage cadences while safeguarding tenant configuration.",
  },
  {
    question: "What happens if an email bounces or delivery fails?",
    answer:
      "Jaktra captures webhook delivery events and tracks bounces or drops. Unrecoverable failures are routed to a built-in Dead-Letter Queue (DLQ) with diagnostics, ensuring your team can inspect issues without losing track of overdue accounts.",
  },
];

export const ALL_FAQS: FAQItem[] = [...FAQS_LEFT, ...FAQS_RIGHT];

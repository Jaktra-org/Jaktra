/**
 * Centralized SEO structured data definitions for Jaktra.
 * All JSON-LD schemas used across the site are defined here
 * so they can be validated in one place and shared across pages.
 */

const SITE_URL = "https://jaktra.site";

/* ─── Organization ────────────────────────────────────────────────── */
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#org`,
  name: "Jaktra",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.webp`,
  description:
    "AI-native accounts receivable automation platform for B2B finance teams. Replaces manual collection workflows with intelligent, automated multi-channel follow-up.",
};

/* ─── WebSite ─────────────────────────────────────────────────────── */
export const webSiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: "Jaktra",
  url: SITE_URL,
  publisher: { "@id": `${SITE_URL}/#org` },
};

/* ─── SoftwareApplication ─────────────────────────────────────────── */
export const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Jaktra",
  applicationCategory: "FinanceApplication",
  operatingSystem: "All modern browsers (Web)",
  browserRequirements: "Requires a modern web browser",
  url: SITE_URL,
  description:
    "Automate B2B accounts receivable with AI-powered 5-stage tone escalation, dispute triage, installment plans, and multi-channel follow-up. 100% free during early access.",
  offers: {
    "@type": "Offer",
    name: "Early Access",
    price: "0",
    priceCurrency: "USD",
    description: "100% Free during Early Access with zero credit card required",
    availability: "https://schema.org/InStock",
  },
  image: `${SITE_URL}/logo.webp`,
  screenshot: `${SITE_URL}/og-image.png`,
  creator: { "@id": `${SITE_URL}/#org` },
  featureList: [
    "5-stage AI tone escalation",
    "Dispute triage and AI reply drafting",
    "Installment payment plans",
    "Dead Letter Queue with automatic retries",
    "Multi-channel communication (email, SMS, WhatsApp)",
    "Debtor self-service portal",
    "SendGrid, Resend, and SMTP integration",
    "Razorpay payment gateway integration",
    "CSV invoice import",
    "Role-based team management",
    "Analytics and reporting dashboard",
  ],
};

import { ALL_FAQS } from "../../data/faqs";

/* ─── FAQPage ─────────────────────────────────────────────────────── */
export const faqPageSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: ALL_FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

/* ─── BreadcrumbList helper ───────────────────────────────────────── */
export function breadcrumbSchema(
  items: { name: string; path: string }[]
): Record<string, unknown> {
  // If the caller already included "Home" or path "/" as first item, filter it out to prevent duplicate Home entries
  const normalizedItems = items.filter(
    (item, idx) => !(idx === 0 && (item.path === "/" || item.name.trim().toLowerCase() === "home"))
  );

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      ...normalizedItems.map((item, i) => ({
        "@type": "ListItem",
        position: i + 2,
        name: item.name,
        item: `${SITE_URL}${item.path}`,
      })),
    ],
  };
}

export const pricingPageSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Jaktra AR Automation",
  description: "AI-powered accounts receivable automation with 5-stage tone escalation, dispute triage, and self-service debtor payment portals.",
  image: `${SITE_URL}/og-image.png`,
  sku: "JAKTRA-EARLY-ACCESS",
  brand: {
    "@type": "Brand",
    name: "Jaktra",
  },
  offers: {
    "@type": "Offer",
    name: "Early Access",
    price: "0",
    priceCurrency: "USD",
    priceValidUntil: "2027-12-31",
    description: "100% free during early access with unlimited invoices and all platform features",
    availability: "https://schema.org/InStock",
    url: `${SITE_URL}/pricing`,
    shippingDetails: {
      "@type": "OfferShippingDetails",
      shippingRate: {
        "@type": "MonetaryAmount",
        value: "0",
        currency: "USD",
      },
      shippingDestination: {
        "@type": "DefinedRegion",
        addressCountry: "US",
      },
      deliveryTime: {
        "@type": "ShippingDeliveryTime",
        handlingTime: {
          "@type": "QuantitativeValue",
          minValue: 0,
          maxValue: 0,
          unitCode: "DAY",
        },
        transitTime: {
          "@type": "QuantitativeValue",
          minValue: 0,
          maxValue: 0,
          unitCode: "DAY",
        },
      },
    },
    hasMerchantReturnPolicy: {
      "@type": "MerchantReturnPolicy",
      applicableCountry: "US",
      returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
    },
  },
};

export const highRadiusCompareSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "HighRadius vs Jaktra: Enterprise O2C Suite vs Focused AI Collections Agent",
  description: "Compare HighRadius and Jaktra. Understand why Jaktra is not a complete O2C suite replacement, but a focused, autonomous AI collections agent built for fast deployment and high recovery.",
  author: { "@id": `${SITE_URL}/#org` },
  publisher: { "@id": `${SITE_URL}/#org` },
  datePublished: "2026-09-08",
  dateModified: "2026-09-08",
  mainEntityOfPage: `${SITE_URL}/compare/highradius-vs-jaktra`,
};

export const saasUseCaseSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "B2B SaaS Accounts Receivable: How to Recover Overdue ARR & Protect Net Retention — Jaktra",
  description: "Learn how to collect overdue B2B SaaS invoices without damaging customer relationships or churning accounts. Automate seat/usage dispute triage, polite tone escalation, and protect Net Retention.",
  author: { "@id": `${SITE_URL}/#org` },
  publisher: { "@id": `${SITE_URL}/#org` },
  datePublished: "2026-09-08",
  dateModified: "2026-09-10",
  mainEntityOfPage: `${SITE_URL}/use-cases/saas`,
};

export const upflowCompareSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Upflow Alternative — Autonomous Generative AI Tone Escalation vs Static Dunning",
  description: "Compare Upflow vs Jaktra. Discover why finance teams upgrade from Upflow's static email templates to Jaktra's autonomous Groq LLaMA 3.1 tone escalation, NLP dispute triage, and tokenized payment portals.",
  author: { "@id": `${SITE_URL}/#org` },
  publisher: { "@id": `${SITE_URL}/#org` },
  datePublished: "2026-09-08",
  dateModified: "2026-09-08",
  mainEntityOfPage: `${SITE_URL}/compare/upflow-alternative`,
};

export const fiveStageEscalationSchema = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  headline: "Autonomous 5-Stage AR Tone Escalation Engine — Jaktra",
  description: "Explore Jaktra's 5-stage generative tone escalation engine. How Groq LLaMA 3.1, predictive ML delinquency risk scoring, the 20-hour idempotency guard, and Stage 5 Legal Stop recover cash without client friction.",
  author: { "@id": `${SITE_URL}/#org` },
  publisher: { "@id": `${SITE_URL}/#org` },
  datePublished: "2026-09-08",
  dateModified: "2026-09-08",
  mainEntityOfPage: `${SITE_URL}/features/5-stage-escalation`,
};

export const disputeTriageSchema = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  headline: "Automatic Email Reply Catch & Dispute Triage for Accounts Receivable — Jaktra",
  description: "Stop collection emails from irritating clients who already replied. Discover how automatic inbound email reply catch and NLP dispute triage pause dunning and resolve invoice disputes fast.",
  author: { "@id": `${SITE_URL}/#org` },
  publisher: { "@id": `${SITE_URL}/#org` },
  datePublished: "2026-09-08",
  dateModified: "2026-09-10",
  mainEntityOfPage: `${SITE_URL}/features/dispute-triage`,
};

export const chaserCompareSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Chaser Alternative — Autonomous Generative AI AR Agent vs Static Dunning",
  description: "Compare Chaser vs Jaktra. Learn why finance leaders upgrade from Chaser's static email templates and manual phone call tracking to Jaktra's autonomous AI agent, tokenized debtor portals, and Razorpay settlement.",
  author: { "@id": `${SITE_URL}/#org` },
  publisher: { "@id": `${SITE_URL}/#org` },
  datePublished: "2026-09-08",
  dateModified: "2026-09-08",
  mainEntityOfPage: `${SITE_URL}/compare/chaser-alternative`,
};

export const agencyUseCaseSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "The Agency Cash Flow Playbook: How to Eliminate Retainer Chasing & Protect Out-of-Pocket Ad Spend — Jaktra",
  description: "Stop awkward retainer chasing and protect out-of-pocket ad spend. Discover how creative and digital agencies get clients to pay retainers and project milestones on time.",
  author: { "@id": `${SITE_URL}/#org` },
  publisher: { "@id": `${SITE_URL}/#org` },
  datePublished: "2026-09-08",
  dateModified: "2026-09-10",
  mainEntityOfPage: `${SITE_URL}/use-cases/agencies`,
};

export const installmentPlansSchema = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  headline: "How to Offer Payment Plans to Overdue B2B Clients (Templates & Recovery Strategy) — Jaktra",
  description: "Learn what to do when a B2B client can't pay their invoice. Discover how to offer structured installment plans, agreement terms, and automated milestone tracking to recover cash.",
  author: { "@id": `${SITE_URL}/#org` },
  publisher: { "@id": `${SITE_URL}/#org` },
  datePublished: "2026-09-08",
  dateModified: "2026-09-10",
  mainEntityOfPage: `${SITE_URL}/features/installment-plans`,
};

export const dsoGuideSchema = {
  "@context": "https://schema.org",
  "@type": ["Article", "HowTo"],
  headline: "How to Reduce Days Sales Outstanding (DSO): Countback Math & 5 Operational Levers",
  name: "How to Reduce Days Sales Outstanding (DSO): Countback Math & 5 Operational Levers",
  description: "A comprehensive financial guide for CFOs and Controllers on calculating DSO using the Countback method, understanding B2B industry payment patterns, and accelerating collections with autonomous AI workflows.",
  image: `${SITE_URL}/og-image.png`,
  totalTime: "P18D",
  author: { "@id": `${SITE_URL}/#org` },
  publisher: { "@id": `${SITE_URL}/#org` },
  datePublished: "2026-09-08",
  dateModified: "2026-09-09",
  mainEntityOfPage: `${SITE_URL}/resources/how-to-reduce-dso`,
  step: [
    {
      "@type": "HowToStep",
      name: "Calculate True Collection Velocity Using the Countback Method",
      text: "Avoid Simple DSO distortion by exhausting outstanding receivables month-by-month in reverse chronological order against gross monthly sales.",
      url: `${SITE_URL}/resources/how-to-reduce-dso#calculator`,
    },
    {
      "@type": "HowToStep",
      name: "Eliminate Day-0 Invoice Delivery Latency",
      text: "Deploy multi-channel SMTP/SendGrid delivery with Dead Letter Queue (DLQ) retry logic to guarantee invoices reach active AP contacts on Day 1.",
      url: `${SITE_URL}/resources/how-to-reduce-dso#operational-levers`,
    },
    {
      "@type": "HowToStep",
      name: "Automate 5-Stage Non-Alienating Tone Modulation",
      text: "Progress reminders across 5 calibrated stages (Warm Reminder, Firm Prompt, Serious Notice, Stern Warning, Legal Stop) using Groq LLaMA 3.1.",
      url: `${SITE_URL}/resources/how-to-reduce-dso#operational-levers`,
    },
    {
      "@type": "HowToStep",
      name: "Deploy Cryptographic Zero-Login Debtor Portals",
      text: "Embed tokenized /i/:token direct links in communications so buyers can view and settle invoices via UPI, cards, or bank transfer in under 60 seconds.",
      url: `${SITE_URL}/resources/how-to-reduce-dso#operational-levers`,
    },
    {
      "@type": "HowToStep",
      name: "Offer Structured Self-Service Installment Recovery",
      text: "Convert high delinquent balances into automated 2x, 3x, or 4x milestone installment plans directly in the debtor portal to prevent bad debt default.",
      url: `${SITE_URL}/resources/how-to-reduce-dso#operational-levers`,
    },
  ],
};

export const dsoGuideFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Days Sales Outstanding (DSO) and why does it matter?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Days Sales Outstanding (DSO) is a corporate liquidity metric that measures the average number of days required to convert credit sales into liquid cash. A high DSO traps working capital on your balance sheet, forces unnecessary short-term borrowing, and exponentially increases the risk of bad debt write-offs.",
      },
    },
    {
      "@type": "Question",
      name: "Why does the Simple DSO formula fail during revenue growth or seasonal spikes?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The Simple DSO formula assumes uniform credit sales across the entire period. If a business closes 60% of its quarterly revenue in the final month of the quarter, Simple DSO artificially divides by the flat 90-day daily average, exaggerating collection lag. The Countback Method eliminates this distortion by exhausting receivables month-by-month in reverse chronological order against actual sales generated in each period.",
      },
    },
    {
      "@type": "Question",
      name: "What are realistic B2B DSO benchmarks by industry?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "According to the Credit Research Foundation (CRF) National Summary, median B2B SaaS DSO sits between 42 and 52 days on Net-30 terms. Digital agencies average 54 to 68 days due to creative scope approval delays. Heavy manufacturing and distribution median DSO spans 65 to 82 days due to OEM purchase order verification cycles.",
      },
    },
    {
      "@type": "Question",
      name: "How does autonomous AI reduce DSO by 15–25 days without damaging client relationships?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Human collectors are limited by manual call queues and often delay follow-ups out of fear of irritating clients. Jaktra uses Groq LLaMA 3.1 to automate a 5-Stage Tone Escalation curve (Warm Reminder → Firm Follow-Up → Serious Notice → Stern Warning → Legal Stop). Combined with instant dispute triage that pauses reminders when objections arise and tokenized zero-login payment links, Jaktra eliminates administrative latency without human friction.",
      },
    },
    {
      "@type": "Question",
      name: "How much working capital is released for every day of DSO reduction?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The mathematical formula is: Working Capital Released = (Annual Credit Sales / 365) × DSO Reduction. For a $10M company, every single day of DSO compression pulls $27,397 forward from receivables directly into cash. Reducing DSO by 18 days releases $493,150 in liquid working capital while saving roughly $39,452 annually in credit line interest (at 8% WACC).",
      },
    },
  ],
};

export const manufacturingUseCaseSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "AI Accounts Receivable Automation for Manufacturing & Supply Chain — Jaktra",
  description: "Accelerate cash flow in manufacturing. Resolve PO matching disputes, manage Net 60/90 terms, and eliminate receivables drag with autonomous AI dunning.",
  author: { "@id": `${SITE_URL}/#org` },
  publisher: { "@id": `${SITE_URL}/#org` },
  datePublished: "2026-09-08",
  dateModified: "2026-09-08",
  mainEntityOfPage: `${SITE_URL}/use-cases/manufacturing`,
};

export const toneEscalationPlaybookSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Overdue Invoice Escalation: How to Shift Tone from Polite Reminder to Final Demand — Jaktra",
  description: "Learn how to escalate overdue invoice email tone professionally across 5 aging stages. Understand when to be polite, when to be firm, and when to enforce a formal legal cutoff.",
  author: { "@id": `${SITE_URL}/#org` },
  publisher: { "@id": `${SITE_URL}/#org` },
  datePublished: "2026-09-08",
  dateModified: "2026-09-10",
  mainEntityOfPage: `${SITE_URL}/resources/5-stage-ar-tone-escalation`,
};


export const zeroLoginPortalSchema = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  headline: "1-Click B2B Invoice Payment Links: Eliminate Passwords & Get Paid 2x Faster — Jaktra",
  description: "Discover why traditional customer billing portals fail with 70%+ abandonment. See how 1-click zero-login payment links and self-service installments get B2B invoices paid 2x faster.",
  author: { "@id": `${SITE_URL}/#org` },
  publisher: { "@id": `${SITE_URL}/#org` },
  datePublished: "2026-09-08",
  dateModified: "2026-09-10",
  mainEntityOfPage: `${SITE_URL}/features/zero-login-portal`,
};

export const emailDeliverabilitySchema = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  headline: "Why Your Invoice Emails Go to Spam (And 7 Ways to Ensure Clients Actually Receive Them) — Jaktra",
  description: "Discover why invoice emails go to spam, how to fix SPF/DKIM/DMARC deliverability, and how automated Dead Letter Queues (DLQ) and circuit breakers protect corporate sender reputation.",
  author: { "@id": `${SITE_URL}/#org` },
  publisher: { "@id": `${SITE_URL}/#org` },
  datePublished: "2026-09-08",
  dateModified: "2026-09-10",
  mainEntityOfPage: `${SITE_URL}/features/email-deliverability`,
};

export const riskScoringSchema = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  headline: "How to Predict Late Payments: B2B Accounts Receivable Risk Scoring Guide — Jaktra",
  description: "Learn how to identify at-risk debtors before invoices default. A practical guide to AR delinquency scoring, aging velocity, balance exposure, and collection prioritization.",
  author: { "@id": `${SITE_URL}/#org` },
  publisher: { "@id": `${SITE_URL}/#org` },
  datePublished: "2026-09-08",
  dateModified: "2026-09-10",
  mainEntityOfPage: `${SITE_URL}/features/risk-scoring`,
};

export const paidniceCompareSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "PaidNice Alternative — Autonomous AI Tone Escalation vs Static Late Fee Penalties | Jaktra",
  description: "Compare PaidNice vs Jaktra. Learn why finance teams upgrade from PaidNice's punitive static late fees to Jaktra's autonomous Groq LLaMA 3.1 tone escalation, NLP dispute triage, and self-serve installment recovery.",
  author: { "@id": `${SITE_URL}/#org` },
  publisher: { "@id": `${SITE_URL}/#org` },
  datePublished: "2026-09-08",
  dateModified: "2026-09-08",
  mainEntityOfPage: `${SITE_URL}/compare/paidnice-alternative`,
};

export const professionalServicesSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "AI Accounts Receivable Automation for Professional Services & Legal — Jaktra",
  description: "Eliminate partner billing friction for law firms, consultancies, and accounting practices. Triage billable hours scope disputes, automate retainer top-ups, and accelerate cash flow with Jaktra.",
  author: { "@id": `${SITE_URL}/#org` },
  publisher: { "@id": `${SITE_URL}/#org` },
  datePublished: "2026-09-08",
  dateModified: "2026-09-08",
  mainEntityOfPage: `${SITE_URL}/use-cases/professional-services`,
};

export const dunningTemplatesSchema = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  headline: "10 Overdue Invoice Payment Reminder Email Templates (From Polite to Final Demand) — Jaktra",
  description: "10 word-for-word payment reminder email templates for overdue invoices. Learn how to follow up politely at Day 1, firmly at Day 14, and formally at Day 30 without damaging client relationships.",
  author: { "@id": `${SITE_URL}/#org` },
  publisher: { "@id": `${SITE_URL}/#org` },
  datePublished: "2026-09-08",
  dateModified: "2026-09-10",
  mainEntityOfPage: `${SITE_URL}/resources/b2b-dunning-email-templates`,
};


export const constructionUseCaseSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "AI Accounts Receivable Automation for Construction & Subcontractors — Jaktra",
  description: "Accelerate cash flow for commercial contractors and subcontractors. Automate progress billing reminders, triage change-order disputes, track retainage releases, and cut construction DSO with Jaktra.",
  author: { "@id": `${SITE_URL}/#org` },
  publisher: { "@id": `${SITE_URL}/#org` },
  datePublished: "2026-09-08",
  dateModified: "2026-09-08",
  mainEntityOfPage: `${SITE_URL}/use-cases/construction`,
};


export const logisticsUseCaseSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "AI Accounts Receivable Automation for Logistics, Freight & 3PLs — Jaktra",
  description: "Eliminate the freight working capital crunch. Automate shipper collection cadences, triage detention and accessorial disputes, cut freight factoring dependence, and accelerate cash flow with Jaktra.",
  author: { "@id": `${SITE_URL}/#org` },
  publisher: { "@id": `${SITE_URL}/#org` },
  datePublished: "2026-09-08",
  dateModified: "2026-09-08",
  mainEntityOfPage: `${SITE_URL}/use-cases/logistics-freight`,
};


export const staffingUseCaseSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "AI Accounts Receivable Automation for Staffing & Recruitment — Jaktra",
  description: "Bridge the weekly contractor payroll gap for staffing and recruitment agencies. Automate client collection cadences, triage timesheet disputes via AI, eliminate payroll factoring fees, and accelerate cash flow.",
  author: { "@id": `${SITE_URL}/#org` },
  publisher: { "@id": `${SITE_URL}/#org` },
  datePublished: "2026-09-08",
  dateModified: "2026-09-08",
  mainEntityOfPage: `${SITE_URL}/use-cases/staffing-recruiting`,
};


export const wholesaleUseCaseSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Stop Short-Shipment Deductions & 60-Day Terms from Crushing Wholesale Margins — Jaktra",
  description: "How wholesale distributors resolve delivery deductions, isolate disputed line items, and protect margins on Net 60 commercial credit terms.",
  author: { "@id": `${SITE_URL}/#org` },
  publisher: { "@id": `${SITE_URL}/#org` },
  datePublished: "2026-09-08",
  dateModified: "2026-09-10",
  mainEntityOfPage: `${SITE_URL}/use-cases/wholesale-distribution`,
};


export const roiCalculatorSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "B2B Accounts Receivable Automation ROI & Working Capital Calculator — Jaktra",
  description: "Calculate your DSO reduction, working capital released, debt interest saved, and net 3-year ROI from automating accounts receivable collections with Jaktra.",
  author: { "@id": `${SITE_URL}/#org` },
  publisher: { "@id": `${SITE_URL}/#org` },
  datePublished: "2026-09-08",
  dateModified: "2026-09-08",
  mainEntityOfPage: `${SITE_URL}/resources/ar-automation-roi-calculator`,
};

export const kollenoCompareSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Kolleno Alternative — Autonomous Conversational AI vs Manual Collector Task Lists | Jaktra",
  description: "Compare Kolleno vs Jaktra. Learn why finance teams choose Jaktra's autonomous Groq LLaMA 3.1 tone escalation and NLP dispute triage over Kolleno's manual collector task lists and multi-channel queues.",
  author: { "@id": `${SITE_URL}/#org` },
  publisher: { "@id": `${SITE_URL}/#org` },
  datePublished: "2026-09-08",
  dateModified: "2026-09-08",
  mainEntityOfPage: `${SITE_URL}/compare/kolleno-alternative`,
};


export const compareHubSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  headline: "B2B Accounts Receivable Software Buyer's Guide & Alternatives Hub | Jaktra",
  description: "Compare the leading B2B accounts receivable automation and dunning software. In-depth architectural comparisons of Jaktra vs HighRadius, Upflow, Chaser, PaidNice, and Kolleno.",
  url: `${SITE_URL}/compare`,
  author: { "@id": `${SITE_URL}/#org` },
  publisher: { "@id": `${SITE_URL}/#org` },
  mainEntity: {
    "@type": "ItemList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "HighRadius vs Jaktra", url: `${SITE_URL}/compare/highradius-vs-jaktra` },
      { "@type": "ListItem", position: 2, name: "Upflow Alternative", url: `${SITE_URL}/compare/upflow-alternative` },
      { "@type": "ListItem", position: 3, name: "Chaser Alternative", url: `${SITE_URL}/compare/chaser-alternative` },
      { "@type": "ListItem", position: 4, name: "PaidNice Alternative", url: `${SITE_URL}/compare/paidnice-alternative` },
      { "@type": "ListItem", position: 5, name: "Kolleno Alternative", url: `${SITE_URL}/compare/kolleno-alternative` },
    ],
  },
};

export const useCasesHubSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  headline: "B2B Accounts Receivable Industry Solutions & DSO Benchmarks | Jaktra",
  description: "Explore tailored AI accounts receivable automation solutions across core B2B industries. Learn how SaaS, agencies, manufacturing, construction, logistics, and staffing accelerate cash collections with Jaktra.",
  url: `${SITE_URL}/use-cases`,
  author: { "@id": `${SITE_URL}/#org` },
  publisher: { "@id": `${SITE_URL}/#org` },
  mainEntity: {
    "@type": "ItemList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "B2B SaaS AR", url: `${SITE_URL}/use-cases/saas` },
      { "@type": "ListItem", position: 2, name: "Digital Agencies AR", url: `${SITE_URL}/use-cases/agencies` },
      { "@type": "ListItem", position: 3, name: "Manufacturing AR", url: `${SITE_URL}/use-cases/manufacturing` },
      { "@type": "ListItem", position: 4, name: "Professional Services AR", url: `${SITE_URL}/use-cases/professional-services` },
      { "@type": "ListItem", position: 5, name: "Construction AR", url: `${SITE_URL}/use-cases/construction` },
      { "@type": "ListItem", position: 6, name: "Logistics & Freight AR", url: `${SITE_URL}/use-cases/logistics-freight` },
      { "@type": "ListItem", position: 7, name: "Staffing & Recruiting AR", url: `${SITE_URL}/use-cases/staffing-recruiting` },
      { "@type": "ListItem", position: 8, name: "Wholesale & Distribution AR", url: `${SITE_URL}/use-cases/wholesale-distribution` },
    ],
  },
};

export const featuresHubSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  headline: "Autonomous AI Accounts Receivable Capabilities & Features — Jaktra",
  description: "Explore Jaktra's complete AR execution stack: 5-stage generative tone escalation, automated dispute reply triage, tokenized zero-login debtor portals, Dead Letter Queue resilience, and predictive ML risk scoring.",
  url: `${SITE_URL}/features`,
  author: { "@id": `${SITE_URL}/#org` },
  publisher: { "@id": `${SITE_URL}/#org` },
  mainEntity: {
    "@type": "ItemList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "5-Stage Tone Escalation Engine", url: `${SITE_URL}/features/5-stage-escalation` },
      { "@type": "ListItem", position: 2, name: "AI Dispute Triage & Sentiment Analysis", url: `${SITE_URL}/features/dispute-triage` },
      { "@type": "ListItem", position: 3, name: "Structured Installment Plans", url: `${SITE_URL}/features/installment-plans` },
      { "@type": "ListItem", position: 4, name: "Tokenized Zero-Login Debtor Portal", url: `${SITE_URL}/features/zero-login-portal` },
      { "@type": "ListItem", position: 5, name: "Email Deliverability & DLQ Resilience", url: `${SITE_URL}/features/email-deliverability` },
      { "@type": "ListItem", position: 6, name: "Predictive ML Delinquency Risk Scoring", url: `${SITE_URL}/features/risk-scoring` },
    ],
  },
};

export const bestFinanceAutomationSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "The Best B2B Finance Automation Tools in 2026: From Invoice Follow-Ups to Cash Flow — Jaktra",
  description: "An objective guide comparing the best B2B finance automation tools in 2026 across Accounts Payable, ERP reconciliation, and autonomous Accounts Receivable collection follow-ups.",
  author: { "@id": `${SITE_URL}/#org` },
  publisher: { "@id": `${SITE_URL}/#org` },
  datePublished: "2026-09-10",
  dateModified: "2026-09-10",
  mainEntityOfPage: `${SITE_URL}/resources/best-b2b-finance-automation-tools`,
};

export const resourcesHubSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  headline: "B2B Accounts Receivable Guides, Tools & Research — Jaktra",
  description: "Free, research-backed guides, financial models, and operational playbooks for CFOs, Controllers, and AR teams to accelerate cash flow and reduce DSO.",
  url: `${SITE_URL}/resources`,
  author: { "@id": `${SITE_URL}/#org` },
  publisher: { "@id": `${SITE_URL}/#org` },
  mainEntity: {
    "@type": "ItemList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "The Best B2B Finance Automation Tools in 2026", url: `${SITE_URL}/resources/best-b2b-finance-automation-tools` },
      { "@type": "ListItem", position: 2, name: "How to Reduce DSO Guide", url: `${SITE_URL}/resources/how-to-reduce-dso` },
      { "@type": "ListItem", position: 3, name: "How to Escalate Collection Email Tone", url: `${SITE_URL}/resources/5-stage-ar-tone-escalation` },
      { "@type": "ListItem", position: 4, name: "10 Overdue Invoice Reminder Email Templates", url: `${SITE_URL}/resources/b2b-dunning-email-templates` },
      { "@type": "ListItem", position: 5, name: "AR Automation ROI & DSO Calculator", url: `${SITE_URL}/resources/ar-automation-roi-calculator` },
      { "@type": "ListItem", position: 6, name: "Invoice Dispute Response Templates", url: `${SITE_URL}/resources/invoice-dispute-response-templates` },
      { "@type": "ListItem", position: 7, name: "AR Query Management Guide", url: `${SITE_URL}/resources/accounts-receivable-query-management` },
      { "@type": "ListItem", position: 8, name: "Client Questioning Billable Hours Guide", url: `${SITE_URL}/resources/client-questioning-billable-hours` },
      { "@type": "ListItem", position: 9, name: "Client Disputed Invoice What to Do", url: `${SITE_URL}/resources/client-disputed-invoice-what-to-do` },
      { "@type": "ListItem", position: 10, name: "How to Manage AR Emails", url: `${SITE_URL}/resources/how-to-manage-accounts-receivable-emails` },
    ],
  },
};

export const invoiceDisputeTemplatesSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "How to Respond to a Disputed Invoice: Free Response Email Templates & Resolution Guide — Jaktra",
  description: "Learn how to respond when a client disputes an invoice. Free word-for-word email templates for billable hours pushback, PO mismatches, scope creep, and how AI dispute triage pauses automated dunning to protect client relationships.",
  author: { "@id": `${SITE_URL}/#org` },
  publisher: { "@id": `${SITE_URL}/#org` },
  datePublished: "2026-09-10",
  dateModified: "2026-09-10",
  mainEntityOfPage: `${SITE_URL}/resources/invoice-dispute-response-templates`,
};

export const arQueryManagementSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "How to Manage Inbound Accounts Receivable Queries & Billing Emails — Jaktra",
  description: "A practical guide for finance teams on handling customer billing inquiries, managing shared accounts receivable mailboxes, responding to W-9 and invoice copy requests, and eliminating collection delays with zero-login debtor portals.",
  author: { "@id": `${SITE_URL}/#org` },
  publisher: { "@id": `${SITE_URL}/#org` },
  datePublished: "2026-09-10",
  dateModified: "2026-09-10",
  mainEntityOfPage: `${SITE_URL}/resources/accounts-receivable-query-management`,
};

export const clientQuestioningHoursSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Client Questioning Your Billable Hours? How to Respond Without Losing the Client — Jaktra",
  description: "A step-by-step guide for agencies, consultants, and contractors on how to respond when a client questions invoice hours. Includes word-for-word email templates, non-defensive communication tips, and prevention tactics.",
  author: { "@id": `${SITE_URL}/#org` },
  publisher: { "@id": `${SITE_URL}/#org` },
  datePublished: "2026-09-10",
  dateModified: "2026-09-10",
  mainEntityOfPage: `${SITE_URL}/resources/client-questioning-billable-hours`,
};

export const clientDisputedInvoiceSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Client Disputed an Invoice? What to Do Immediately (Step-by-Step Guide) — Jaktra",
  description: "What to do when a customer disputes an invoice or refuses to pay. How to pause collection reminders immediately, diagnose the dispute type, negotiate partial payments, and use tested response scripts.",
  author: { "@id": `${SITE_URL}/#org` },
  publisher: { "@id": `${SITE_URL}/#org` },
  datePublished: "2026-09-10",
  dateModified: "2026-09-10",
  mainEntityOfPage: `${SITE_URL}/resources/client-disputed-invoice-what-to-do`,
};

export const manageArEmailsSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "How to Manage Inbound Accounts Receivable Emails (Without the Inbox Chaos) — Jaktra",
  description: "How high-efficiency finance teams handle customer billing inquiries, manage shared AR mailboxes, respond to W-9 and invoice copy requests in minutes, and cut Days Sales Outstanding.",
  author: { "@id": `${SITE_URL}/#org` },
  publisher: { "@id": `${SITE_URL}/#org` },
  datePublished: "2026-09-10",
  dateModified: "2026-09-10",
  mainEntityOfPage: `${SITE_URL}/resources/how-to-manage-accounts-receivable-emails`,
};

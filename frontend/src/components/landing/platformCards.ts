export interface PlatformCardItem {
  id: string;
  tabTitle: string;
  tabSub: string;
  windowTitle: string;
  statusText: string;
  type: "invoices" | "disputes" | "analytics" | "autopilot";
  footerNote: string;
}

export const PLATFORM_CARDS: PlatformCardItem[] = [
  {
    id: "invoices",
    tabTitle: "Invoices & Aging Ledger",
    tabSub: "Real-time receivables tracking across aging buckets",
    windowTitle: "Jaktra / Invoices",
    statusText: "",
    type: "invoices",
    footerNote: "Live ERP reconciliation across QuickBooks, Stripe & NetSuite",
  },
  {
    id: "disputes",
    tabTitle: "Inbound Inquiries & AI Triage",
    tabSub: "Intent classification, auto-draft replies & dispute holds",
    windowTitle: "Jaktra / Inbound Inquiries",
    statusText: "",
    type: "disputes",
    footerNote: "AI classifies customer intent in <4s · Auto-pauses cadences on disputes",
  },
  {
    id: "analytics",
    tabTitle: "Receivables Analytics",
    tabSub: "DSO trends, collection velocity & cash recovery",
    windowTitle: "Jaktra / Portfolio Analytics",
    statusText: "",
    type: "analytics",
    footerNote: "Automated cash telemetry synced continuously with ERP & banking APIs",
  },
  {
    id: "autopilot",
    tabTitle: "Autonomous Autopilot",
    tabSub: "Self-driving multi-channel execution & live run stream",
    windowTitle: "Jaktra / Autopilot",
    statusText: "",
    type: "autopilot",
    footerNote: "Next automated batch run in 12m 45s · Continuous background daemon",
  },
];

import { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  FileSpreadsheet,
  AlertCircle,
  ShieldCheck,
  Clock,
  CreditCard,
  Bot,
  Sparkles,
  RefreshCw,
  Sliders,
  FileText,
  Layers,
  Database,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  UserCheck,
  Zap,
  Search,
  Copy,
  Check,
  BookOpen,
  X,
  ArrowUp,
} from "lucide-react";
import { SEOHead } from "../components/common/SEOHead";
import { breadcrumbSchema } from "../components/common/seo-schemas";
import { LandingFooter } from "../components/landing/LandingFooter";
import { GlobalNav } from "../components/common/GlobalNav";

const docsSchema = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  headline: "Jaktra Platform Documentation & Operations Guide",
  name: "Jaktra Platform Documentation & Operations Guide",
  description:
    "Documentation for Jaktra accounts receivable automation: CSV schema, email deliverability setup, 5-stage AI cadence, debtor portal, and payment sync.",
  articleSection: "Platform Documentation",
  image: "https://jaktra.site/og-image.png",
  author: {
    "@type": "Organization",
    name: "Jaktra Engineering & Operations",
    url: "https://jaktra.site",
  },
  publisher: {
    "@type": "Organization",
    "@id": "https://jaktra.site/#org",
    name: "Jaktra",
    url: "https://jaktra.site",
    logo: "https://jaktra.site/logo.webp",
  },
  datePublished: "2026-09-08T00:00:00Z",
  dateModified: "2026-10-10T00:00:00Z",
  mainEntityOfPage: "https://jaktra.site/docs",
};

interface SectionItem {
  id: string;
  category: "all" | "ingestion" | "cadence" | "payments" | "operations";
  title: string;
  shortTitle: string;
  icon: typeof Layers;
  description: string;
}

const SECTIONS: SectionItem[] = [
  {
    id: "platform-overview",
    category: "ingestion",
    title: "1. Platform Architecture & Operating Model",
    shortTitle: "1. Architecture",
    icon: Layers,
    description: "End-to-end receivables lifecycle from ingestion to automated reconciliation.",
  },
  {
    id: "invoice-ingestion",
    category: "ingestion",
    title: "2. Invoice Ingestion & Spreadsheet Schema",
    shortTitle: "2. Ingestion & Schema",
    icon: FileSpreadsheet,
    description: "CSV/Excel formats, required columns, and automatic header canonicalization.",
  },
  {
    id: "email-deliverability",
    category: "operations",
    title: "3. Email Deliverability & DNS Authentication",
    shortTitle: "3. Email & DNS Setup",
    icon: Mail,
    description: "SPF, DKIM, and DMARC configuration for 99%+ primary inbox placement.",
  },
  {
    id: "cadence-system",
    category: "cadence",
    title: "4. 5-Stage Autonomous Escalation Framework",
    shortTitle: "4. 5-Stage Cadence",
    icon: Bot,
    description: "Progressive urgency tiers, Groq LLaMA 3.1 AI inference, and Stage 5 legal stop.",
  },
  {
    id: "debtor-portal",
    category: "payments",
    title: "5. Zero-Login Debtor Portal (/i/:token)",
    shortTitle: "5. Debtor Portal",
    icon: CreditCard,
    description: "Direct tokenized payment, installment requests, and dispute submission.",
  },
  {
    id: "dispute-triage",
    category: "cadence",
    title: "6. AI Dispute Triage & Reply Intelligence",
    shortTitle: "6. Dispute Triage",
    icon: Sparkles,
    description: "Automated cadence suspension, intent detection, and human review.",
  },
  {
    id: "payment-gateway",
    category: "payments",
    title: "7. Payment Gateway Integration (Razorpay)",
    shortTitle: "7. Payment Gateway",
    icon: Zap,
    description: "Dynamic payment links, multi-rail settlement, and real-time ledger updates.",
  },
  {
    id: "dlq-resilience",
    category: "operations",
    title: "8. Dead Letter Queue (DLQ) & Resilience",
    shortTitle: "8. DLQ & Errors",
    icon: AlertTriangle,
    description: "3-drop circuit breaker, deliverability quarantine, and error resolution.",
  },
  {
    id: "roles-security",
    category: "operations",
    title: "9. Security, Governance & Access Roles",
    shortTitle: "9. Security & Roles",
    icon: ShieldCheck,
    description: "Role-based access control, tenant isolation, and immutable audit logs.",
  },
];

const CATEGORIES = [
  { id: "all", label: "All Topics" },
  { id: "ingestion", label: "Ingestion & Sync" },
  { id: "cadence", label: "AI Cadence & Triage" },
  { id: "payments", label: "Debtor Portal & Pay" },
  { id: "operations", label: "Email, DLQ & Security" },
];

export function DocsMock() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeSection, setActiveSection] = useState("platform-overview");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Scrollspy to automatically update active section on scroll
  useEffect(() => {
    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      const visible = entries.find((e) => e.isIntersecting);
      if (visible?.target?.id) {
        setActiveSection(visible.target.id);
      }
    };

    observerRef.current = new IntersectionObserver(handleIntersect, {
      rootMargin: "-100px 0px -60% 0px",
      threshold: 0.1,
    });

    SECTIONS.forEach((sec) => {
      const el = document.getElementById(sec.id);
      if (el) observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [searchQuery, selectedCategory]);

  const filteredSections = useMemo(() => {
    return SECTIONS.filter((sec) => {
      const matchesCategory =
        selectedCategory === "all" || sec.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        sec.title.toLowerCase().includes(q) ||
        sec.description.toLowerCase().includes(q) ||
        sec.id.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#050506] text-[#f7f8f8] font-sans selection:bg-[#5e6ad2]/30 selection:text-white antialiased">
      <SEOHead
        title="Documentation & Operations Guide — Jaktra"
        description="Documentation for Jaktra accounts receivable automation: CSV schema, email deliverability setup, 5-stage AI cadence, debtor portal, and payment sync."
        canonicalPath="/docs"
        jsonLd={[
          docsSchema,
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Documentation", path: "/docs" },
          ]),
        ]}
      />

      <GlobalNav />

      <main className="pt-20 pb-20 px-4 sm:px-6 max-w-7xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-zinc-500">
          <ol className="flex items-center gap-2">
            <li>
              <Link to="/" className="hover:text-zinc-300 transition-colors">
                Home
              </Link>
            </li>
            <li>/</li>
            <li className="text-zinc-300 font-medium" aria-current="page">
              Documentation
            </li>
          </ol>
        </nav>

        {/* Hero Section */}
        <div className="mb-10 border-b border-white/[0.08] pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-[#5e6ad2]/10 border border-[#5e6ad2]/25 text-[#b7d2f8] mb-3">
            <BookOpen className="w-3.5 h-3.5 text-[#5e6ad2]" />
            Platform Documentation &amp; Operations Reference
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-3">
            Jaktra Documentation
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 max-w-3xl leading-relaxed">
            Everything finance and operations teams need to run autonomous accounts receivable: connect accounting data, configure authenticated email relays, tune AI cadences, and automate debtor payment reconciliation.
          </p>

          {/* Search & Topic Filters */}
          <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search documentation (e.g., CSV schema, SPF, Stage 5)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0e0f11] border border-white/[0.1] rounded-xl pl-9 pr-9 py-2 text-xs sm:text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs no-scrollbar">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors font-medium ${
                    selectedCategory === cat.id
                      ? "bg-[#5e6ad2] text-white"
                      : "bg-[#0e0f11] text-zinc-400 hover:text-white border border-white/[0.08] hover:bg-white/[0.04]"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* Quick Index Sticky Sidebar */}
          <aside className="lg:col-span-1 hidden lg:block">
            <div className="sticky top-24 space-y-1 rounded-xl border border-white/[0.08] bg-[#0e0f11] p-3 text-xs">
              <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-mono font-semibold block mb-2 px-2.5 pt-1">
                Table of Contents
              </span>
              <nav className="space-y-0.5">
                {SECTIONS.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  const isVisibleInFilter = filteredSections.some((s) => s.id === item.id);
                  if (!isVisibleInFilter) return null;

                  return (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all ${
                        isActive
                          ? "bg-[#5e6ad2]/20 text-[#b7d2f8] font-medium border-l-2 border-[#5e6ad2]"
                          : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]"
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-[#b7d2f8]" : "text-zinc-500"}`} />
                      <span className="truncate">{item.shortTitle}</span>
                    </a>
                  );
                })}
              </nav>

              <div className="pt-3 mt-3 border-t border-white/[0.08] space-y-1 px-1">
                <a
                  href="#email-deliverability"
                  className="flex items-center justify-between text-[11px] text-zinc-400 hover:text-white py-1 px-1.5 rounded hover:bg-white/[0.04] transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <Sliders className="w-3 h-3 text-zinc-500" />
                    Relay &amp; DNS Settings
                  </span>
                  <ChevronRight className="w-3 h-3 text-zinc-500" />
                </a>
                <Link
                  to="/contact"
                  className="flex items-center justify-between text-[11px] text-zinc-400 hover:text-white py-1 px-1.5 rounded hover:bg-white/[0.04] transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-zinc-500" />
                    Help &amp; Support
                  </span>
                  <ExternalLink className="w-3 h-3 text-zinc-500" />
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Content Pane */}
          <div className="lg:col-span-3 space-y-16">
            {filteredSections.length === 0 ? (
              <div className="text-center py-16 px-4 rounded-xl border border-white/[0.08] bg-[#0e0f11]">
                <Search className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-white mb-1">No matching sections found</h3>
                <p className="text-xs text-zinc-400 mb-4">
                  Try adjusting your search query or reset the filter category.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-[#5e6ad2] text-white hover:bg-[#5e6ad2]/90"
                >
                  Clear Filters
                </button>
              </div>
            ) : null}

            {/* Section 1: Platform Overview */}
            {filteredSections.some((s) => s.id === "platform-overview") && (
              <section id="platform-overview" className="scroll-mt-24 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-[#5e6ad2]/15 border border-[#5e6ad2]/30 text-xs font-mono font-bold flex items-center justify-center text-[#b7d2f8]">
                    01
                  </span>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                      Platform Architecture &amp; Operating Model
                    </h2>
                    <p className="text-xs text-zinc-400">
                      End-to-end automation between accounting ledgers and customer AP departments
                    </p>
                  </div>
                </div>

                <p className="text-zinc-300 text-sm leading-relaxed">
                  Jaktra operates as an autonomous accounts receivable orchestration platform. Instead of generic blast templates that damage client goodwill, Jaktra continuously analyzes invoice aging, payment promise history, and debtor replies to execute a collaborative, multi-stage recovery strategy.
                </p>

                {/* 3 Core Pillars */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
                  <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0e0f11] hover:border-white/[0.14] transition-colors space-y-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-2">
                      <Database className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-xs font-semibold text-white">1. Ledger Ingestion</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Upload CSV or Excel spreadsheets exported from QuickBooks, Xero, NetSuite, or SAP. Intelligent fuzzy matching canonicalizes column headers automatically.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0e0f11] hover:border-white/[0.14] transition-colors space-y-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-2">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-xs font-semibold text-white">2. AI Cadence Engine</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Powered by Groq LLaMA 3.1 inference, Jaktra tailors message wording to the 5-stage escalation framework with prompt injection filters and automated PII masking.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0e0f11] hover:border-white/[0.14] transition-colors space-y-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2">
                      <CreditCard className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-xs font-semibold text-white">3. Zero-Login Settlement</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Every email embeds a secure tokenized link. Debtors settle instantly via Razorpay, request 2x/3x installment splits, or file disputes without logging in.
                    </p>
                  </div>
                </div>

                {/* Lifecycle Pipeline Flow */}
                <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0e0f11]">
                  <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-2.5 font-semibold">
                    The 4-Step Operational Flow
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                    <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                      <span className="text-[10px] font-mono text-[#b7d2f8] block mb-0.5">STEP 1</span>
                      <span className="font-semibold text-white block">Invoice Upload</span>
                      <span className="text-[11px] text-zinc-400">CSV/Excel batch sync</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                      <span className="text-[10px] font-mono text-blue-400 block mb-0.5">STEP 2</span>
                      <span className="font-semibold text-white block">Cadence Assessment</span>
                      <span className="text-[11px] text-zinc-400">Aging bucket &amp; risk score</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                      <span className="text-[10px] font-mono text-indigo-400 block mb-0.5">STEP 3</span>
                      <span className="font-semibold text-white block">Smart Outreach</span>
                      <span className="text-[11px] text-zinc-400">Authenticated domain relay</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                      <span className="text-[10px] font-mono text-emerald-400 block mb-0.5">STEP 4</span>
                      <span className="font-semibold text-white block">Settlement &amp; Sync</span>
                      <span className="text-[11px] text-zinc-400">Auto-reconciliation</span>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Section 2: Invoice Ingestion & File Schema */}
            {filteredSections.some((s) => s.id === "invoice-ingestion") && (
              <section id="invoice-ingestion" className="scroll-mt-24 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-[#5e6ad2]/15 border border-[#5e6ad2]/30 text-xs font-mono font-bold flex items-center justify-center text-[#b7d2f8]">
                    02
                  </span>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                      Invoice Ingestion &amp; Spreadsheet Schema
                    </h2>
                    <p className="text-xs text-zinc-400">
                      Standard formats, field specifications, and column auto-mapping
                    </p>
                  </div>
                </div>

                <p className="text-zinc-300 text-sm leading-relaxed">
                  Jaktra accepts standard tabular files exported from your ERP or accounting software (<span className="text-white font-medium">.csv, .xlsx, .xls</span>). The built-in ingestion parser canonicalizes common header synonyms automatically.
                </p>

                {/* Quick Copy Header Bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-white/[0.08] bg-[#0e0f11]">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-white block">Standard CSV Headers</span>
                    <span className="text-[11px] text-zinc-400 font-mono">
                      invoice_number, client_name, client_email, amount, due_date, currency, po_number
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        "invoice_number,client_name,client_email,amount,due_date,currency,po_number,invoice_subject",
                        "csv-header"
                      )
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 transition-colors border border-white/[0.08]"
                  >
                    {copiedKey === "csv-header" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Headers Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Copy CSV Headers</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Schema Table */}
                <div className="overflow-x-auto rounded-xl border border-white/[0.08] bg-[#0e0f11]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-white/[0.02] border-b border-white/[0.08] text-zinc-400">
                      <tr>
                        <th className="p-3 font-medium">Column Name</th>
                        <th className="p-3 font-medium">Type</th>
                        <th className="p-3 font-medium">Status</th>
                        <th className="p-3 font-medium">Accepted Aliases &amp; Example</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.06] text-zinc-300">
                      <tr>
                        <td className="p-3 font-mono font-semibold text-emerald-400">invoice_number</td>
                        <td className="p-3 text-zinc-400 font-mono">String</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Required
                          </span>
                        </td>
                        <td className="p-3 text-zinc-400">
                          <span className="text-zinc-300">invoice_no, inv_number, bill_no, id</span> (e.g. <span className="font-mono text-zinc-200">INV-2026-088</span>)
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-semibold text-emerald-400">client_name</td>
                        <td className="p-3 text-zinc-400 font-mono">String</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Required
                          </span>
                        </td>
                        <td className="p-3 text-zinc-400">
                          <span className="text-zinc-300">customer_name, client, customer, company</span> (e.g. <span className="font-mono text-zinc-200">Acme Logistics Corp</span>)
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-semibold text-emerald-400">client_email</td>
                        <td className="p-3 text-zinc-400 font-mono">Email</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Required
                          </span>
                        </td>
                        <td className="p-3 text-zinc-400">
                          <span className="text-zinc-300">contact_email, email, email_address</span> (e.g. <span className="font-mono text-zinc-200">ap@client.com</span>)
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-semibold text-emerald-400">amount</td>
                        <td className="p-3 text-zinc-400 font-mono">Decimal</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Required
                          </span>
                        </td>
                        <td className="p-3 text-zinc-400">
                          <span className="text-zinc-300">invoice_amount, total, balance, val</span> (e.g. <span className="font-mono text-zinc-200">14500.00</span>)
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-semibold text-emerald-400">due_date</td>
                        <td className="p-3 text-zinc-400 font-mono">Date</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Required
                          </span>
                        </td>
                        <td className="p-3 text-zinc-400">
                          <span className="text-zinc-300">payment_due, deadline, due</span> (e.g. <span className="font-mono text-zinc-200">2026-10-31</span>)
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-semibold text-zinc-300">currency</td>
                        <td className="p-3 text-zinc-400 font-mono">ISO Code</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] text-zinc-400 bg-white/[0.04] border border-white/[0.08]">
                            Optional
                          </span>
                        </td>
                        <td className="p-3 text-zinc-400">
                          Defaults to organization currency (e.g. <span className="font-mono text-zinc-200">USD, INR, EUR, GBP</span>)
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-semibold text-zinc-300">po_number</td>
                        <td className="p-3 text-zinc-400 font-mono">String</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] text-zinc-400 bg-white/[0.04] border border-white/[0.08]">
                            Optional
                          </span>
                        </td>
                        <td className="p-3 text-zinc-400">
                          Purchase Order reference number (e.g. <span className="font-mono text-zinc-200">PO-88219</span>)
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-semibold text-zinc-300">invoice_subject</td>
                        <td className="p-3 text-zinc-400 font-mono">String</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] text-zinc-400 bg-white/[0.04] border border-white/[0.08]">
                            Optional
                          </span>
                        </td>
                        <td className="p-3 text-zinc-400">
                          Description or memo for contextual outreach (e.g. <span className="font-mono text-zinc-200">Annual License</span>)
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Import Duplicate Strategy */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div className="p-3.5 rounded-xl border border-white/[0.08] bg-[#0e0f11] space-y-1">
                    <div className="flex items-center gap-2 text-white font-medium text-xs">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                      <span>Strategy: Skip Existing Invoices (Default)</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Preserves current invoice balances, active cadence progress, and existing audit trails without overwriting.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-white/[0.08] bg-[#0e0f11] space-y-1">
                    <div className="flex items-center gap-2 text-white font-medium text-xs">
                      <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Strategy: Update Outstanding Balances</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Overwrites balances and due dates with incoming batch data; useful for synchronizing partial payments recorded externally.
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* Section 3: Email Relay & DNS Deliverability */}
            {filteredSections.some((s) => s.id === "email-deliverability") && (
              <section id="email-deliverability" className="scroll-mt-24 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-[#5e6ad2]/15 border border-[#5e6ad2]/30 text-xs font-mono font-bold flex items-center justify-center text-[#b7d2f8]">
                    03
                  </span>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                      Email Deliverability &amp; DNS Authentication
                    </h2>
                    <p className="text-xs text-zinc-400">
                      Authenticate your domain via SPF, DKIM, and DMARC for primary AP inbox delivery
                    </p>
                  </div>
                </div>

                <p className="text-zinc-300 text-sm leading-relaxed">
                  Jaktra sends all emails through your dedicated corporate domain credentials. Properly authenticating DNS records guarantees that emails bypass spam/promotions filters and land directly in front of client finance decision-makers.
                </p>

                {/* Relay Provider Options */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  <div className="p-3.5 rounded-xl border border-white/[0.08] bg-[#0e0f11] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white">SendGrid Integration</span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        In-App Wizard
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Connect via API Key. Includes 3-step domain validation, sender identity check, and automated test email in Settings.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-white/[0.08] bg-[#0e0f11] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white">Resend API</span>
                      <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                        API Relay
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Connect your Resend API token and verified sender address for fast dispatch and deliverability tracking.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-white/[0.08] bg-[#0e0f11] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white">Custom SMTP</span>
                      <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        Universal
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Use Microsoft 365, Google Workspace, or on-premise mail servers via TLS/SSL credentials.
                    </p>
                  </div>
                </div>

                {/* DNS Table with Quick Copy */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                      Required DNS Records for Primary AP Inbox Placement
                    </h3>
                    <span className="text-[11px] text-zinc-500 font-mono">Standard 2048-bit DKIM</span>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-white/[0.08] bg-[#0e0f11]">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-white/[0.02] border-b border-white/[0.08] text-zinc-400">
                        <tr>
                          <th className="p-3 font-medium">Type</th>
                          <th className="p-3 font-medium">Host / Name</th>
                          <th className="p-3 font-medium">Target Value</th>
                          <th className="p-3 font-medium">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.06] text-zinc-300 font-mono">
                        <tr>
                          <td className="p-3 text-blue-400 font-bold">TXT</td>
                          <td className="p-3 text-zinc-300">@</td>
                          <td className="p-3 text-zinc-300">v=spf1 include:sendgrid.net ~all</td>
                          <td className="p-3 font-sans">
                            <button
                              onClick={() => copyToClipboard("v=spf1 include:sendgrid.net ~all", "spf")}
                              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1"
                            >
                              {copiedKey === "spf" ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                              <span>{copiedKey === "spf" ? "Copied" : "Copy"}</span>
                            </button>
                          </td>
                        </tr>
                        <tr>
                          <td className="p-3 text-blue-400 font-bold">CNAME</td>
                          <td className="p-3 text-zinc-300">s1._domainkey</td>
                          <td className="p-3 text-zinc-300">s1.domainkey.u19283.sendgrid.net</td>
                          <td className="p-3 font-sans">
                            <button
                              onClick={() =>
                                copyToClipboard("s1.domainkey.u19283.sendgrid.net", "dkim")
                              }
                              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1"
                            >
                              {copiedKey === "dkim" ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                              <span>{copiedKey === "dkim" ? "Copied" : "Copy"}</span>
                            </button>
                          </td>
                        </tr>
                        <tr>
                          <td className="p-3 text-blue-400 font-bold">TXT</td>
                          <td className="p-3 text-zinc-300">_dmarc</td>
                          <td className="p-3 text-zinc-300">v=DMARC1; p=quarantine; pct=100</td>
                          <td className="p-3 font-sans">
                            <button
                              onClick={() =>
                                copyToClipboard("v=DMARC1; p=quarantine; pct=100", "dmarc")
                              }
                              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1"
                            >
                              {copiedKey === "dmarc" ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                              <span>{copiedKey === "dmarc" ? "Copied" : "Copy"}</span>
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            )}

            {/* Section 4: 5-Stage Autonomous Cadence System */}
            {filteredSections.some((s) => s.id === "cadence-system") && (
              <section id="cadence-system" className="scroll-mt-24 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-[#5e6ad2]/15 border border-[#5e6ad2]/30 text-xs font-mono font-bold flex items-center justify-center text-[#b7d2f8]">
                    04
                  </span>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                      5-Stage Autonomous Escalation Framework
                    </h2>
                    <p className="text-xs text-zinc-400">
                      Dynamic tone escalation, pacing guards, and hardcoded legal stops
                    </p>
                  </div>
                </div>

                <p className="text-zinc-300 text-sm leading-relaxed">
                  Jaktra uses Groq LLaMA 3.1 inference to adapt message wording across five progressive urgency tiers. The agent references previous communication context and promises to maintain commercial rapport while accelerating collection.
                </p>

                {/* Stages Timeline Cards */}
                <div className="space-y-3 pt-1">
                  {/* Stage 1 */}
                  <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                          STAGE 1
                        </span>
                        <span className="text-xs font-semibold text-white">Courtesy Verification</span>
                      </div>
                      <span className="text-[11px] font-mono text-zinc-400">Day -3 to Due Date</span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      Friendly check-in attaching official invoice PDF and PO confirmation. Catches clerical disputes before maturity and includes the 1-click zero-login debtor link.
                    </p>
                  </div>

                  {/* Stage 2 */}
                  <div className="p-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                          STAGE 2
                        </span>
                        <span className="text-xs font-semibold text-white">Collaborative Reminder &amp; Installments</span>
                      </div>
                      <span className="text-[11px] font-mono text-zinc-400">Days 1–7 Overdue</span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      Inquires about upcoming payment disbursement schedules. Activates self-service 2x/3x installment options directly on the customer's portal page.
                    </p>
                  </div>

                  {/* Stage 3 */}
                  <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                          STAGE 3
                        </span>
                        <span className="text-xs font-semibold text-white">Commercial Urgency</span>
                      </div>
                      <span className="text-[11px] font-mono text-zinc-400">Days 8–14 Overdue</span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      Direct outreach to accounts payable management referencing agreed credit terms. Flags the record as 'Medium Attention' on the finance dashboard.
                    </p>
                  </div>

                  {/* Stage 4 */}
                  <div className="p-4 rounded-xl border border-orange-500/20 bg-orange-500/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-orange-500/20 text-orange-300">
                          STAGE 4
                        </span>
                        <span className="text-xs font-semibold text-white">Executive Escalation</span>
                      </div>
                      <span className="text-[11px] font-mono text-zinc-400">Days 15–30 Overdue</span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      Formal notice looping commercial leads or client CFO. Informs the debtor of imminent service holds or delivery freezes unless resolved.
                    </p>
                  </div>

                  {/* Stage 5: Legal Stop */}
                  <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-red-300 font-semibold text-xs">
                        <AlertCircle className="w-4 h-4 text-red-400" />
                        <span>STAGE 5: Autonomous Legal Stop (Day 31+ Overdue)</span>
                      </div>
                      <span className="text-[10px] font-mono text-red-400 bg-red-500/20 px-2 py-0.5 rounded">
                        Hardcoded Halt
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      To prevent regulatory harassment violations and protect brand reputation, Jaktra <strong className="text-white">freezes automated dunning at Day 31 overdue</strong>. No automated emails are sent without manual credit manager sign-off.
                    </p>
                  </div>
                </div>

                {/* Idempotency Guard Callout */}
                <div className="p-3.5 rounded-xl border border-white/[0.08] bg-[#0e0f11] flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-[#b7d2f8] shrink-0" />
                  <p className="text-xs text-zinc-300">
                    <strong className="text-white">20-Hour Contact Lock:</strong> Jaktra enforces an unskippable 20-hour lock per invoice. Debtors will never receive duplicate or redundant collection reminders within the same business day.
                  </p>
                </div>
              </section>
            )}

            {/* Section 5: Zero-Login Debtor Portal */}
            {filteredSections.some((s) => s.id === "debtor-portal") && (
              <section id="debtor-portal" className="scroll-mt-24 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-[#5e6ad2]/15 border border-[#5e6ad2]/30 text-xs font-mono font-bold flex items-center justify-center text-[#b7d2f8]">
                    05
                  </span>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                      Zero-Login Debtor Portal (/i/:token)
                    </h2>
                    <p className="text-xs text-zinc-400">
                      Frictionless payments, flexible installments, and dispute submission
                    </p>
                  </div>
                </div>

                <p className="text-zinc-300 text-sm leading-relaxed">
                  Forcing accounts payable teams to register or remember passwords delays payments. Jaktra embeds a secure, cryptographically tokenized link in every communication, directing debtors to a dedicated invoice portal.
                </p>

                {/* Debtor Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0e0f11] space-y-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <CreditCard className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-xs font-semibold text-white">1-Click Online Payment</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Supports Cards, Net Banking, UPI, and verified corporate NEFT/RTGS wire transfer details via Razorpay.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0e0f11] space-y-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-xs font-semibold text-white">Installment Plan Requests</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Debtors can split balances into 2 or 3 scheduled installments directly on the portal rather than delaying payment entirely.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0e0f11] space-y-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                      <AlertCircle className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-xs font-semibold text-white">Dispute Filing &amp; Notes</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Debtors can submit dispute reasoning or request line-item clarification, which immediately halts reminders.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-white/[0.08] bg-[#0e0f11] text-xs text-zinc-400 space-y-1">
                  <span className="font-semibold text-white block">Portal Security Rails:</span>
                  <p>
                    Tokens are cryptographically generated UUIDs scoped strictly to an individual invoice. Debtors can only view their own invoice details and cannot enumerate other records or clients.
                  </p>
                </div>
              </section>
            )}

            {/* Section 6: AI Dispute Triage & Replies */}
            {filteredSections.some((s) => s.id === "dispute-triage") && (
              <section id="dispute-triage" className="scroll-mt-24 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-[#5e6ad2]/15 border border-[#5e6ad2]/30 text-xs font-mono font-bold flex items-center justify-center text-[#b7d2f8]">
                    06
                  </span>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                      AI Dispute Triage &amp; Reply Intelligence
                    </h2>
                    <p className="text-xs text-zinc-400">
                      Automated inbound email classification and human-in-the-loop review
                    </p>
                  </div>
                </div>

                <p className="text-zinc-300 text-sm leading-relaxed">
                  Automated dunning without reply intelligence causes embarrassing errors—like demanding payment while a customer has already emailed proof of payment. Jaktra inspects all inbound replies in real time and classifies them into structured action categories.
                </p>

                {/* Classification Table */}
                <div className="overflow-x-auto rounded-xl border border-white/[0.08] bg-[#0e0f11]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-white/[0.02] border-b border-white/[0.08] text-zinc-400">
                      <tr>
                        <th className="p-3 font-medium">Category</th>
                        <th className="p-3 font-medium">Detected Intent Example</th>
                        <th className="p-3 font-medium">Cadence Action</th>
                        <th className="p-3 font-medium">AI Recommendation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.06] text-zinc-300">
                      <tr>
                        <td className="p-3 font-medium text-red-400">Dispute</td>
                        <td className="p-3 text-zinc-400">"Amount is incorrect according to contract scope."</td>
                        <td className="p-3 text-amber-400 font-semibold">Paused Immediately</td>
                        <td className="p-3 text-zinc-400">Drafts response with contract scope or credit note offer</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-medium text-blue-400">Question / Query</td>
                        <td className="p-3 text-zinc-400">"Can you re-attach the invoice PDF copy?"</td>
                        <td className="p-3 text-amber-400 font-semibold">Paused Immediately</td>
                        <td className="p-3 text-zinc-400">Drafts email with wire details and direct portal link</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-medium text-emerald-400">Payment Promise</td>
                        <td className="p-3 text-zinc-400">"Payment scheduled in this Friday's check run."</td>
                        <td className="p-3 text-emerald-400 font-semibold">Rescheduled</td>
                        <td className="p-3 text-zinc-400">Approves extension and sets quiet follow-up for agreed date</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-medium text-zinc-400">Wrong Contact</td>
                        <td className="p-3 text-zinc-400">"I am no longer with the firm, please contact AP."</td>
                        <td className="p-3 text-zinc-400">Requires Review</td>
                        <td className="p-3 text-zinc-400">Prompts finance team to update debtor contact email</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Human in the loop */}
                <div className="p-3.5 rounded-xl border border-white/[0.08] bg-[#0e0f11] flex items-center gap-3">
                  <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <p className="text-xs text-zinc-300">
                    <strong className="text-white">Human Approval Safeguard:</strong> AI-generated responses are drafts only. Finance managers review and click to approve or modify responses before any message is sent.
                  </p>
                </div>
              </section>
            )}

            {/* Section 7: Payment Gateway Integration */}
            {filteredSections.some((s) => s.id === "payment-gateway") && (
              <section id="payment-gateway" className="scroll-mt-24 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-[#5e6ad2]/15 border border-[#5e6ad2]/30 text-xs font-mono font-bold flex items-center justify-center text-[#b7d2f8]">
                    07
                  </span>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                      Payment Gateway Integration (Razorpay)
                    </h2>
                    <p className="text-xs text-zinc-400">
                      Configure settlement accounts and automated real-time reconciliation
                    </p>
                  </div>
                </div>

                <p className="text-zinc-300 text-sm leading-relaxed">
                  Jaktra connects directly to Razorpay. No custom webhook servers or code required—simply save your Key ID and Key Secret in Settings. Jaktra creates dynamic payment links and updates your ledger the moment a payment is confirmed.
                </p>

                {/* 3 Steps */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  <div className="p-3.5 rounded-xl border border-white/[0.08] bg-[#0e0f11] space-y-1.5">
                    <span className="text-[10px] font-mono font-bold text-[#b7d2f8]">STEP 1</span>
                    <h3 className="text-xs font-semibold text-white">Generate API Keys</h3>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Open your Razorpay Dashboard under <span className="text-zinc-300 font-mono">Settings → API Keys</span> to copy your Key ID and Key Secret.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-white/[0.08] bg-[#0e0f11] space-y-1.5">
                    <span className="text-[10px] font-mono font-bold text-[#b7d2f8]">STEP 2</span>
                    <h3 className="text-xs font-semibold text-white">Save in Jaktra Settings</h3>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Navigate to <span className="text-zinc-300">Settings → Integrations</span> in Jaktra, input your keys, and click Save. Credentials are encrypted using AES-256.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-white/[0.08] bg-[#0e0f11] space-y-1.5">
                    <span className="text-[10px] font-mono font-bold text-[#b7d2f8]">STEP 3</span>
                    <h3 className="text-xs font-semibold text-white">Auto-Reconciliation</h3>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      When a client completes payment, Jaktra immediately sets the invoice status to <span className="text-emerald-400 font-medium">Paid</span> and stops all future outreach.
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* Section 8: DLQ Resilience */}
            {filteredSections.some((s) => s.id === "dlq-resilience") && (
              <section id="dlq-resilience" className="scroll-mt-24 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-[#5e6ad2]/15 border border-[#5e6ad2]/30 text-xs font-mono font-bold flex items-center justify-center text-[#b7d2f8]">
                    08
                  </span>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                      Dead Letter Queue (DLQ) &amp; Error Reference
                    </h2>
                    <p className="text-xs text-zinc-400">
                      Deliverability protection, error classification, and recovery procedures
                    </p>
                  </div>
                </div>

                <p className="text-zinc-300 text-sm leading-relaxed">
                  Jaktra implements a 3-drop Dead Letter Queue (DLQ) circuit breaker to isolate failed communications and prevent mailer blacklisting from repeated hard bounces.
                </p>

                {/* Error Reference Table */}
                <div className="overflow-x-auto rounded-xl border border-white/[0.08] bg-[#0e0f11]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-white/[0.02] border-b border-white/[0.08] text-zinc-400">
                      <tr>
                        <th className="p-3 font-medium">Error Code</th>
                        <th className="p-3 font-medium">Failure Condition</th>
                        <th className="p-3 font-medium">Action</th>
                        <th className="p-3 font-medium">Remediation Procedure</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.06] text-zinc-300">
                      <tr>
                        <td className="p-3 font-mono text-red-400 font-semibold">400_INVALID_SCHEMA</td>
                        <td className="p-3 text-zinc-400">Missing required CSV column</td>
                        <td className="p-3 text-zinc-300">Upload rejected</td>
                        <td className="p-3 text-zinc-400">Verify file headers match Section 02 schema table</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono text-red-400 font-semibold">401_AUTH_EXPIRED</td>
                        <td className="p-3 text-zinc-400">Email API key revoked or expired</td>
                        <td className="p-3 text-amber-400">Cadence paused</td>
                        <td className="p-3 text-zinc-400">Re-enter valid token in Settings → Integrations</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono text-red-400 font-semibold">422_BOUNCE_DROPPED</td>
                        <td className="p-3 text-zinc-400">Hard bounce (invalid inbox address)</td>
                        <td className="p-3 text-red-400">Moved to DLQ</td>
                        <td className="p-3 text-zinc-400">Update debtor AP email and click 'Retry' in DLQ tab</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono text-red-400 font-semibold">429_RATE_EXCEEDED</td>
                        <td className="p-3 text-zinc-400">Relay throughput quota hit</td>
                        <td className="p-3 text-blue-400">Backoff retry</td>
                        <td className="p-3 text-zinc-400">Automated retry scheduled using exponential backoff</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Section 9: Roles & Security */}
            {filteredSections.some((s) => s.id === "roles-security") && (
              <section id="roles-security" className="scroll-mt-24 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-[#5e6ad2]/15 border border-[#5e6ad2]/30 text-xs font-mono font-bold flex items-center justify-center text-[#b7d2f8]">
                    09
                  </span>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                      Security, Governance &amp; Access Roles
                    </h2>
                    <p className="text-xs text-zinc-400">
                      Role-based access permissions, tenant isolation, and audit trails
                    </p>
                  </div>
                </div>

                <p className="text-zinc-300 text-sm leading-relaxed">
                  Jaktra enforces strict tenant isolation and Role-Based Access Control (RBAC) so that operational teams can execute workflows while finance leaders maintain governance.
                </p>

                {/* Roles Table */}
                <div className="overflow-x-auto rounded-xl border border-white/[0.08] bg-[#0e0f11]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-white/[0.02] border-b border-white/[0.08] text-zinc-400">
                      <tr>
                        <th className="p-3 font-medium">Role</th>
                        <th className="p-3 font-medium">Intended Persona</th>
                        <th className="p-3 font-medium">Key Capabilities</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.06] text-zinc-300">
                      <tr>
                        <td className="p-3 font-semibold text-white">Admin</td>
                        <td className="p-3 text-zinc-400">Finance Director / CFO</td>
                        <td className="p-3 text-zinc-300">
                          Full management of email relays, payment integrations, billing plans, team invitations, and global cadence limits.
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-white">Manager</td>
                        <td className="p-3 text-zinc-400">Credit Controller / AR Lead</td>
                        <td className="p-3 text-zinc-300">
                          Uploads invoice batches, approves AI dispute drafts, sets installment plans, and overrides Stage 5 stops.
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-white">Viewer</td>
                        <td className="p-3 text-zinc-400">Auditor / Account Manager</td>
                        <td className="p-3 text-zinc-300">
                          Read-only access to aging analytics, invoices, activity logs, and dispute records. Cannot trigger or pause cadences.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="p-3.5 rounded-xl border border-white/[0.08] bg-[#0e0f11] flex items-center gap-3">
                  <FileText className="w-4 h-4 text-zinc-400 shrink-0" />
                  <p className="text-xs text-zinc-300">
                    <strong className="text-white">Immutable Audit Log:</strong> Every email dispatched, link clicked, payment recorded, and manual override is logged permanently in Activity Log (`/activity-log`) for audit compliance.
                  </p>
                </div>
              </section>
            )}

            {/* Bottom Support Banner & Back to Top */}
            <div className="pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <BookOpen className="w-4 h-4 text-zinc-500" />
                <span>Need help with custom setup?</span>
                <Link to="/contact" className="text-[#b7d2f8] hover:underline font-medium">
                  Contact our operations team
                </Link>
              </div>

              <button
                onClick={scrollToTop}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-white bg-[#0e0f11] border border-white/[0.08] hover:bg-white/[0.04] transition-colors"
              >
                <ArrowUp className="w-3.5 h-3.5" />
                <span>Back to top</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}

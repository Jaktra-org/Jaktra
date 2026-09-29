import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Calculator,
  Mail,
  TrendingDown,
  ArrowRight,
  Clock,
  CheckCircle2,
  Layers,
  Scale,
  Compass,
  Search,
  Sliders,
  Terminal,
  ChevronRight,
  Inbox,
} from "lucide-react";
import { SEOHead } from "@/seo/components/SEOHead";
import { resourcesHubSchema, breadcrumbSchema } from "@/seo/schemas";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { GlobalNav } from "@/components/common/GlobalNav";



interface ResourceItem {
  id: string;
  category: "guide" | "calculator" | "playbook" | "templates";
  badge: string;
  readTime: string;
  title: string;
  tagline: string;
  description: string;
  link: string;
  icon: typeof BookOpen;
  keyTakeaways: string[];
}

const RESOURCES: ResourceItem[] = [
  {
    id: "best-b2b-finance-automation-tools",
    category: "guide",
    badge: "Buyer's Guide 2026",
    readTime: "12 min read",
    title: "The Best B2B Finance Automation Tools in 2026: From Invoicing to Cash Flow",
    tagline: "An objective evaluation of the top software across Accounts Payable, ERP ledgers, and autonomous Accounts Receivable collections.",
    description:
      "A comprehensive review of modern automated finance stacks. Compares AP tools (Ramp, Tipalti), Accounting ERPs (NetSuite, QuickBooks), and autonomous collection follow-up agents (Jaktra, Upflow, Chaser, HighRadius) with side-by-side feature matrices.",
    link: "/resources/best-b2b-finance-automation-tools",
    icon: BookOpen,
    keyTakeaways: [
      "The 3 layers of an automated B2B finance stack (AP, ERP, and AR)",
      "Why traditional template chasers fail in 2026 and how autonomous AI agents solve collection drag",
      "Comprehensive side-by-side capability matrix across delivery safety, reply catching, and payment links",
    ],
  },
  {
    id: "how-to-reduce-dso",
    category: "guide",
    badge: "Flagship Research Paper",
    readTime: "12 min read",
    title: "How to Calculate and Reduce DSO: The Complete B2B Countback Guide",
    tagline: "The definitive mathematical guide for CFOs and Controllers on calculating DSO accurately and cutting 15–25 days of cash lag.",
    description:
      "Explains why the traditional Average DSO formula is deeply flawed for seasonal businesses and demonstrates the Countback (Exhaustive) calculation method step-by-step. Outlines 5 concrete operational levers to unlock working capital.",
    link: "/resources/how-to-reduce-dso",
    icon: TrendingDown,
    keyTakeaways: [
      "Countback DSO mathematical formula vs simple standard averaging",
      "Benchmarking DSO variances across B2B SaaS, manufacturing, and staffing",
      "5 actionable levers to shorten the cash conversion cycle without damaging client trust",
    ],
  },
  {
    id: "ar-automation-roi-calculator",
    category: "calculator",
    badge: "Interactive Financial Tool",
    readTime: "Interactive Simulator",
    title: "Accounts Receivable Automation ROI & Working Capital Savings Calculator",
    tagline: "Calculate your exact working capital release, debt interest saved, and 3-year net automation ROI.",
    description:
      "An interactive mathematical simulator that models your company's revenue, current DSO, debt cost of capital, and invoice volume to project freed cash, interest savings, and net ROI from deploying Jaktra.",
    link: "/resources/ar-automation-roi-calculator",
    icon: Calculator,
    keyTakeaways: [
      "Real-time working capital release formula: (Revenue / 365) × DSO Reduction",
      "Short-term borrowing interest savings based on benchmark rates",
      "Estimated labor hours saved weekly for credit controllers and AR managers",
    ],
  },
  {
    id: "5-stage-ar-tone-escalation",
    category: "playbook",
    badge: "Operational Playbook",
    readTime: "9 min read",
    title: "How to Escalate Collection Email Tone: From Polite Reminder to Final Demand",
    tagline: "When to be polite, when to be firm, and when to enforce a formal legal cutoff across 5 aging stages.",
    description:
      "A complete guide on mapping dunning outreach across 5 psychological stages: Friendly Reminder (1–7d) to Legal Hold (31+d). Includes cadence timing intervals, subject line formulas, and compliance safeguards.",
    link: "/resources/5-stage-ar-tone-escalation",
    icon: Compass,
    keyTakeaways: [
      "The psychological escalation curve from gentle nudges to formal notices",
      "Balancing proactive early engagement with strict Stage 5 compliance halts",
      "Eliminating collector burnout by automating repetitive follow-up tasks",
    ],
  },
  {
    id: "b2b-dunning-email-templates",
    category: "templates",
    badge: "Word-for-Word Scripts",
    readTime: "10 min read",
    title: "10 Overdue Invoice Payment Reminder Email Templates (Word-for-Word Scripts)",
    tagline: "Copy-paste collection email scripts across 5 escalation tiers with dynamic AI prompt directives.",
    description:
      "10+ field-tested B2B email templates engineered to balance commercial goodwill with urgency. Includes prompt engineering parameters for Groq LLaMA 3.1 to generate dynamic, contextual variations automatically.",
    link: "/resources/b2b-dunning-email-templates",
    icon: Mail,
    keyTakeaways: [
      "2 vetted templates per escalation stage with dynamic placeholder syntax",
      "Prompt engineering guidelines for courteous AI tone moderation",
      "Clear call-to-action phrasing that drives debtors to self-service payment links",
    ],
  },
  {
    id: "invoice-dispute-response-templates",
    category: "templates",
    badge: "Dispute Playbook",
    readTime: "8 min read",
    title: "How to Respond to a Disputed Invoice: 5 Free Templates & Resolution Guide",
    tagline: "Word-for-word response scripts for billable hours pushback, PO mismatches, and scope creep disputes.",
    description:
      "A complete operational guide for handling client pushback. Features 5 battle-tested email templates, negotiation best practices, and explains why pausing automated collections during a dispute is critical to preserving customer relationships.",
    link: "/resources/invoice-dispute-response-templates",
    icon: Scale,
    keyTakeaways: [
      "5 word-for-word email response scripts for hours, POs, and scope creep",
      "The cardinal rule of pausing automated reminders during active disputes",
      "How Jaktra NLP Dispute Triage detects pushback and drafts verified responses",
    ],
  },
  {
    id: "accounts-receivable-query-management",
    category: "guide",
    badge: "Operations Guide",
    readTime: "10 min read",
    title: "How to Manage Inbound Accounts Receivable Queries & Billing Emails",
    tagline: "Stop letting unanswered clerical questions delay weekly pay runs and inflate your DSO.",
    description:
      "How finance teams manage accounts receivable email volume, respond to routine W-9 and invoice copy requests in minutes, and replace chaotic shared inboxes with 1-click zero-login debtor portals.",
    link: "/resources/accounts-receivable-query-management",
    icon: Inbox,
    keyTakeaways: [
      "Templates for top 5 routine inquiries: invoice copy, W-9, wire details, and installment requests",
      "Shared Outlook mailbox pitfalls vs dedicated AR query management",
      "Eliminating 70% of inbound billing queries with 1-click zero-login portals",
    ],
  },
  {
    id: "client-questioning-billable-hours",
    category: "playbook",
    badge: "Agency Guide",
    readTime: "7 min read",
    title: "Client Questioning Your Billable Hours? How to Respond Without Losing the Client",
    tagline: "How to handle timesheet pushback, provide proof of work non-defensively, and prevent client churn.",
    description:
      "A complete guide for agencies and consultants on responding to clients who challenge invoice hours. Features word-for-word scripts, the 3 things never to do, and tips for setting up weekly burn-rate snapshots.",
    link: "/resources/client-questioning-billable-hours",
    icon: Clock,
    keyTakeaways: [
      "Why clients challenge hours (surprise vs malice) and how to reframe the conversation",
      "Word-for-word email response scripts with timesheet and deliverable breakdowns",
      "How to separate undisputed fees from contested hours to keep cash flowing",
    ],
  },
  {
    id: "client-disputed-invoice-what-to-do",
    category: "playbook",
    badge: "Crisis Playbook",
    readTime: "8 min read",
    title: "Client Disputed an Invoice? What to Do Immediately (Step-by-Step Guide)",
    tagline: "The emergency credit control playbook when a customer refuses to pay or challenges an invoice.",
    description:
      "What to do when an invoice is disputed. Explains the cardinal rule of pausing automated reminders, how to diagnose the 4 dispute types, and how to negotiate partial payment on undisputed balances.",
    link: "/resources/client-disputed-invoice-what-to-do",
    icon: Scale,
    keyTakeaways: [
      "Why continuing automated reminders during a dispute destroys customer relationships",
      "Diagnosing PO errors, scope creep, quality claims, and cash delay tactics",
      "The 'Two-Track' negotiation formula to collect undisputed funds immediately",
    ],
  },
  {
    id: "how-to-manage-accounts-receivable-emails",
    category: "guide",
    badge: "AR Operations",
    readTime: "8 min read",
    title: "How to Manage Inbound Accounts Receivable Emails (Without the Inbox Chaos)",
    tagline: "Stop letting unanswered clerical questions delay weekly pay runs and inflate your DSO.",
    description:
      "How high-efficiency finance teams organize shared AR mailboxes, respond to routine W-9 and invoice copy requests within 4 hours, and replace reactive email chasing with self-service portals.",
    link: "/resources/how-to-manage-accounts-receivable-emails",
    icon: Inbox,
    keyTakeaways: [
      "The 4-hour response SLA to ensure invoices don't miss client pay runs",
      "Response templates for invoice PDF copy requests and vendor tax onboarding",
      "Why general helpdesks fail for AR and how zero-login portals eliminate 70% of emails",
    ],
  },
];

const FAQS = [
  {
    q: "Are Jaktra's mathematical formulas (Countback DSO, Working Capital Release) standard across GAAP/IFRS?",
    a: "Yes. The Countback (exhaustive) DSO method and the working capital release equation (Revenue / 365) × ΔDSO are standard financial modeling formulas recognized by corporate treasury bodies, controllers, and auditors globally. They eliminate the mathematical distortion created by seasonal revenue fluctuations.",
  },
  {
    q: "Can we apply the 5-Stage AR Tone Escalation Playbook without installing software?",
    a: "Absolutely. All playbooks and email templates are published open-access for finance practitioners. You can copy-paste our cadence intervals, subject line templates, and psychological guidelines into your existing email client or ERP rules engine immediately.",
  },
  {
    q: "How does generative AI ensure that automated dunning never insults enterprise clients?",
    a: "Jaktra's Groq LLaMA 3.1 agent operates within strict psychological prompt guardrails. It never insults or accuses debtors. Communications calibrate tone based on invoice age and payment history, and cadences halt automatically if any billing dispute or inquiry is detected.",
  },
  {
    q: "How secure are tokenized debtor payment links?",
    a: "Each link contains an unpredictable, cryptographically secure 256-bit token (/i/:token). Links provide read-only access to statement line items and direct payment mechanisms without exposing user account credentials or sensitive banking details.",
  },
  {
    q: "Is there any subscription fee to access Jaktra's research, calculators, and playbooks?",
    a: "No. All research guides, email scripts, and interactive financial calculators are 100% free with zero paywalls. You can also sign up for Jaktra's Early Access tier completely free with no credit card required.",
  },
];

export function ResourcesHub() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Embedded Interactive Simulator State
  const [demoRevenue, setDemoRevenue] = useState<number>(12000000); // $12M
  const [demoDsoCut, setDemoDsoCut] = useState<number>(16); // 16 days

  const demoCashReleased = Math.round((demoRevenue / 365) * demoDsoCut);
  const demoInterestSaved = Math.round(demoCashReleased * 0.08); // 8%

  const filteredResources = useMemo(() => {
    return RESOURCES.filter((r) => {
      if (selectedCategory !== "all" && r.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = r.title.toLowerCase().includes(q);
        const matchesTagline = r.tagline.toLowerCase().includes(q);
        const matchesDesc = r.description.toLowerCase().includes(q);
        if (!matchesTitle && !matchesTagline && !matchesDesc) {
          return false;
        }
      }
      return true;
    });
  }, [selectedCategory, searchQuery]);

  const isVisible = (id: string) => filteredResources.some((r) => r.id === id);

  return (
    <div className="min-h-screen bg-[#010102] text-[#f7f8f8] font-sans antialiased selection:bg-[#5e6ad2]/30 selection:text-white">
      <SEOHead
        title="B2B Accounts Receivable Guides, Tools & Research — Jaktra"
        description="Free, research-backed guides, financial models, and operational playbooks for CFOs, Controllers, and AR teams to accelerate cash flow and reduce DSO."
        canonicalPath="/resources"
        jsonLd={[
          resourcesHubSchema,
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Resources", path: "/resources" },
          ]),
        ]}
      />

      <GlobalNav />

      <main className="pt-24 pb-20 max-w-6xl mx-auto px-6 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(183,210,248,0.06),transparent)] pointer-events-none" />
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-zinc-400 font-sans relative z-10">
          <ol className="flex items-center gap-1.5">
            <li>
              <Link to="/" className="hover:text-zinc-200 transition-colors">
                Home
              </Link>
            </li>
            <li className="text-zinc-600">/</li>
            <li className="text-zinc-200 font-medium" aria-current="page">
              Resources &amp; Knowledge Hub
            </li>
          </ol>
        </nav>

        {/* Hero Section: Left-aligned, wide, clean masthead */}
        <header className="mb-8 pt-1">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-white/[0.08]">
            <div className="max-w-3xl">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight mb-3">
                <span className="block">Accounts Receivable Intelligence,</span>
                <span className="block text-zinc-300">Countback Math &amp; Playbooks</span>
              </h1>
              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                Free, mathematically rigorous guides, generative AI email scripts, and interactive financial calculators to help finance teams shorten payment cycles, cut bad debt, and protect customer goodwill.
              </p>
            </div>

            {/* Quick Search & Filter Toolbar */}
            <div className="w-full lg:w-96 space-y-2.5 shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search DSO math, scripts, cadences..."
                  className="w-full bg-[#0e0f11] border border-white/[0.08] rounded-lg pl-8 pr-3 py-2 text-xs sm:text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#b7d2f8]/40 transition-colors shadow-md"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1 p-1 bg-[#0e0f11] rounded-xl border border-white/[0.08] shadow-md">
                {[
                  { id: "all", label: "All Items" },
                  { id: "guide", label: "Financial Guides" },
                  { id: "calculator", label: "Interactive Tools" },
                  { id: "playbook", label: "Cadence Playbooks" },
                  { id: "templates", label: "Email Scripts" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      selectedCategory === cat.id
                        ? "bg-white text-zinc-950 font-bold shadow-sm"
                        : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* Unified Monochrome Knowledge Telemetry Ribbon */}
        <section className="border border-white/[0.08] bg-[#0e0f11] rounded-xl p-4 sm:p-5 mb-8 grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.08] shadow-md">
          <div className="px-3 sm:px-4 py-2 sm:py-1 space-y-1">
            <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              Mathematical Rigor
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white font-mono">
              Countback Math
            </div>
            <p className="text-xs text-zinc-400 leading-normal">
              Recursively eliminates 12–25 day seasonal averaging distortions.
            </p>
          </div>

          <div className="px-3 sm:px-4 py-2 sm:py-1 space-y-1">
            <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              Cadence Psychology
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white font-mono">
              5-Stage Tiers
            </div>
            <p className="text-xs text-zinc-400 leading-normal">
              From courtesy check-in to formal legal notice.
            </p>
          </div>

          <div className="px-3 sm:px-4 py-2 sm:py-1 space-y-1">
            <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              Deployment Velocity
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white font-mono">
              10 Vetted Scripts
            </div>
            <p className="text-xs text-zinc-400 leading-normal">
              Includes prompt directives for Groq LLaMA 3.1 fine-tuning.
            </p>
          </div>

          <div className="px-3 sm:px-4 py-2 sm:py-1 space-y-1">
            <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              Open Access
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white font-mono">
              100% Free Tools
            </div>
            <p className="text-xs text-zinc-400 leading-normal">
              Zero paywalls or required credit card credentials.
            </p>
          </div>
        </section>

        {/* SECTION 1: Flagship Master Guide Spotlight */}
        {isVisible("how-to-reduce-dso") && (
          <section className="border border-white/[0.08] rounded-xl bg-[#0e0f11] p-5 sm:p-7 mb-8 shadow-lg">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left 7 Columns: Editorial Hook & Key Takeaways */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono uppercase tracking-wider font-semibold text-zinc-400">
                    Flagship Research Paper
                  </span>
                  <span className="text-xs font-mono text-zinc-500">·</span>
                  <span className="text-xs font-mono text-zinc-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-zinc-500" />
                    12 min read · Mathematical Methodology
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                  How to Reduce Days Sales Outstanding (DSO): Countback Math & 5 Levers
                </h2>

                <p className="text-sm sm:text-base text-zinc-300 leading-normal max-w-xl">
                  Why traditional average DSO formulas create multi-million-dollar cash distortions during seasonal revenue shifts, and how the exhaustive countback method gives CFOs total liquidity clarity.
                </p>

                <div className="space-y-2 pt-1">
                  <div className="text-xs font-mono uppercase text-zinc-400 font-semibold tracking-wider">
                    Core Operational Takeaways for Controllers:
                  </div>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-300">
                      <CheckCircle2 className="w-4 h-4 text-[#b7d2f8] shrink-0 mt-0.5" />
                      <span>Mathematical derivation of Countback DSO vs misleading Standard Annual Averaging.</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-300">
                      <CheckCircle2 className="w-4 h-4 text-[#b7d2f8] shrink-0 mt-0.5" />
                      <span>Industry DSO benchmark variances across B2B SaaS, manufacturing, distribution, and staffing.</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-300">
                      <CheckCircle2 className="w-4 h-4 text-[#b7d2f8] shrink-0 mt-0.5" />
                      <span>5 operational levers to systematically accelerate invoice turnaround without commercial friction.</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-2">
                  <Link
                    to="/resources/how-to-reduce-dso"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-zinc-950 font-semibold text-xs sm:text-sm hover:bg-zinc-200 transition-colors shadow-sm"
                  >
                    <span>Read Full Research Paper</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Right 5 Columns: Visual Countback Math Comparison Terminal */}
              <div className="lg:col-span-5 lg:border-l lg:border-white/[0.08] lg:pl-8 space-y-4">
                <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-[#b7d2f8]" />
                  <span>The Mathematical Variance Revealed</span>
                </div>

                <div className="border border-white/[0.08] rounded-xl bg-[#131518] p-4 sm:p-5 space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-mono text-zinc-400 mb-1">
                      <span>Standard Annual Average Method</span>
                      <span className="text-zinc-500">Smoothed Bias</span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-zinc-300 font-mono">
                      54.2 Days
                    </div>
                    <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden mt-2">
                      <div className="w-[54%] h-full bg-zinc-500 rounded-full" />
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-1.5 font-mono">
                      Formula: (Ending AR ÷ Total Credit Sales) × 365. Masks Q4 spikes.
                    </p>
                  </div>

                  <div className="pt-3.5 border-t border-white/[0.06]">
                    <div className="flex justify-between text-xs font-mono text-zinc-300 mb-1">
                      <span className="text-white font-semibold">Exhaustive Countback Method</span>
                      <span className="text-[#b7d2f8] font-semibold">+13.6 Days Uncovered</span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                      67.8 Days
                    </div>
                    <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden mt-2">
                      <div className="w-[68%] h-full bg-[#b7d2f8] rounded-full" />
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1.5 font-mono">
                      Recursively deducts actual monthly revenues to locate unpaid invoices.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-[#181a1f] border border-white/[0.08] text-xs text-zinc-300 font-mono flex items-center justify-between">
                    <span className="text-zinc-400">Working Capital Trapped:</span>
                    <span className="font-bold text-sm text-white font-mono">+$1,420,000 USD</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SECTION 2: Interactive Working Capital Simulator Station */}
        {isVisible("ar-automation-roi-calculator") && (
          <section className="border border-white/[0.08] rounded-xl bg-[#0e0f11] p-5 sm:p-7 mb-8 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-5">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block">
                  Interactive Financial Utility
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  B2B AR Automation ROI & Working Capital Release Calculator
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-zinc-300 max-w-lg leading-normal">
                Test the formula in real time. Adjust your annual credit sales and target DSO reduction to model balance sheet liquidity.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Simulator Sliders (7 cols) */}
              <div className="lg:col-span-7 space-y-5">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold">
                      Annual Gross Credit Sales
                    </label>
                    <span className="text-sm font-mono font-bold text-white">
                      ${(demoRevenue / 1000000).toFixed(1)}M USD
                    </span>
                  </div>
                  <input
                    type="range"
                    aria-label="Annual Gross Credit Sales"
                    min={2000000}
                    max={50000000}
                    step={1000000}
                    value={demoRevenue}
                    onChange={(e) => setDemoRevenue(Number(e.target.value))}
                    className="w-full accent-[#b7d2f8] cursor-pointer h-2 bg-white/[0.08] rounded-lg appearance-none"
                  />
                  <div className="flex justify-between text-[11px] text-zinc-500 mt-1.5 font-mono">
                    <span>$2,000,000</span>
                    <span>$25,000,000</span>
                    <span>$50,000,000</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/[0.06]">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold">
                      Simulated Target DSO Compression
                    </label>
                    <span className="text-sm font-mono font-bold text-[#b7d2f8]">
                      -{demoDsoCut} Days
                    </span>
                  </div>
                  <input
                    type="range"
                    aria-label="Simulated Target DSO Compression in days"
                    min={5}
                    max={30}
                    step={1}
                    value={demoDsoCut}
                    onChange={(e) => setDemoDsoCut(Number(e.target.value))}
                    className="w-full accent-[#b7d2f8] cursor-pointer h-2 bg-white/[0.08] rounded-lg appearance-none"
                  />
                  <div className="flex justify-between text-[11px] text-zinc-500 mt-1.5 font-mono">
                    <span>-5 Days (Conservative)</span>
                    <span>-15 Days (Target Modeling)</span>
                    <span>-30 Days (Aged Receivables Overhaul)</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#131518] border border-white/[0.06] text-xs text-zinc-400 flex items-center gap-2.5">
                  <Sliders className="w-4 h-4 text-[#b7d2f8] shrink-0" />
                  <span>Interactive preview models standard GAAP working capital equation: <code>(Annual Revenue / 365) × ΔDSO</code>.</span>
                </div>
              </div>

              {/* Instant Output Cockpit (5 cols, vertical divider) */}
              <div className="lg:col-span-5 lg:border-l lg:border-white/[0.08] lg:pl-8 space-y-5">
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold mb-1">
                    Direct Working Capital Accelerated
                  </div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
                    ${demoCashReleased.toLocaleString()}
                  </div>
                  <p className="text-xs text-zinc-400 mt-1.5 leading-normal">
                    Cash pulled forward onto your balance sheet from overdue receivables.
                  </p>
                </div>

                <div className="pt-4 border-t border-white/[0.08] grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                      Financing Saved
                    </div>
                    <div className="text-lg sm:text-xl font-bold text-white font-mono mt-0.5">
                      ${demoInterestSaved.toLocaleString()}/yr
                    </div>
                    <span className="text-[11px] text-zinc-500 mt-0.5 block">At 8% debt rate</span>
                  </div>
                  <div>
                    <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                      Finance Hours
                    </div>
                    <div className="text-lg sm:text-xl font-bold text-white font-mono mt-0.5">
                      ~38 hrs/mo
                    </div>
                    <span className="text-[11px] text-zinc-500 mt-0.5 block">Manual follow-ups</span>
                  </div>
                </div>

                <div className="pt-1">
                  <Link
                    to="/resources/ar-automation-roi-calculator"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-zinc-950 font-semibold text-xs sm:text-sm hover:bg-zinc-200 transition-colors shadow-sm"
                  >
                    <span>Launch Full Interactive Calculator & Pro-Forma Model</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SECTION 3: Specialized Playbooks & Script Vault */}
        {(isVisible("5-stage-ar-tone-escalation") || isVisible("b2b-dunning-email-templates")) && (
          <section className="border border-white/[0.08] rounded-xl bg-[#0e0f11] p-5 sm:p-7 mb-8 shadow-lg">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Playbook Column (6 cols) */}
              {isVisible("5-stage-ar-tone-escalation") && (
                <div className={`${!isVisible("b2b-dunning-email-templates") ? "lg:col-span-12" : "lg:col-span-6"} space-y-4`}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono uppercase tracking-wider font-semibold text-zinc-400">
                      Behavioral Playbook
                    </span>
                    <span className="text-xs font-mono text-zinc-500">·</span>
                    <span className="text-xs font-mono text-zinc-400">9 min read</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                    The 5-Stage AR Tone Escalation Playbook
                  </h3>

                  <p className="text-sm text-zinc-300 leading-normal">
                    How to design automated dunning cadences across 5 psychological tiers that accelerate collection turnaround without burning commercial goodwill.
                  </p>

                  {/* Visual Cadence Timeline Track */}
                  <div className="border border-white/[0.08] rounded-xl bg-[#131518] p-3.5 space-y-2.5">
                    <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold flex items-center justify-between">
                      <span>Psychological Cadence Progression</span>
                      <span className="text-zinc-400">5 Distinct Tiers</span>
                    </div>
                    <div className="grid grid-cols-5 gap-1.5 pt-0.5 text-center font-mono">
                      <div className="bg-white/[0.03] border border-white/[0.08] rounded-lg py-2 text-[10px] text-zinc-200">
                        <div className="font-bold">01</div>
                        <div className="text-[9px] text-zinc-400 mt-0.5">Courtesy</div>
                      </div>
                      <div className="bg-white/[0.03] border border-white/[0.08] rounded-lg py-2 text-[10px] text-zinc-200">
                        <div className="font-bold">02</div>
                        <div className="text-[9px] text-zinc-400 mt-0.5">Prompt</div>
                      </div>
                      <div className="bg-white/[0.03] border border-white/[0.08] rounded-lg py-2 text-[10px] text-zinc-200">
                        <div className="font-bold">03</div>
                        <div className="text-[9px] text-zinc-400 mt-0.5">Firm</div>
                      </div>
                      <div className="bg-white/[0.03] border border-white/[0.08] rounded-lg py-2 text-[10px] text-zinc-200">
                        <div className="font-bold">04</div>
                        <div className="text-[9px] text-zinc-400 mt-0.5">Notice</div>
                      </div>
                      <div className="bg-white/[0.03] border border-white/[0.08] rounded-lg py-2 text-[10px] text-zinc-200">
                        <div className="font-bold">05</div>
                        <div className="text-[9px] text-zinc-400 mt-0.5">Hold</div>
                      </div>
                    </div>
                  </div>

                  <ul className="space-y-2 text-xs sm:text-sm text-zinc-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#b7d2f8] shrink-0" />
                      <span>Cadence timing intervals from Day -3 to Day +45 past due.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#b7d2f8] shrink-0" />
                      <span>20-hour contact barrier prevents buyer spam fatigue.</span>
                    </li>
                  </ul>

                  <div className="pt-1">
                    <Link
                      to="/resources/5-stage-ar-tone-escalation"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#b7d2f8] hover:text-white transition-colors"
                    >
                      <span>Read the Full Cadence Playbook</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}

              {/* Templates Column (6 cols, border divider) */}
              {isVisible("b2b-dunning-email-templates") && (
                <div className={`${!isVisible("5-stage-ar-tone-escalation") ? "lg:col-span-12" : "lg:col-span-6 lg:border-l lg:border-white/[0.08] lg:pl-8"} space-y-4`}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono uppercase tracking-wider font-semibold text-zinc-400">
                      Prompt Engineering Vault
                    </span>
                    <span className="text-xs font-mono text-zinc-500">·</span>
                    <span className="text-xs font-mono text-zinc-400">10 min read</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                    B2B Dunning Email Templates: 10 Battle-Tested Scripts
                  </h3>

                  <p className="text-sm text-zinc-300 leading-normal">
                    Ready-to-use email templates and prompt directives for Groq LLaMA 3.1, engineered to balance commercial goodwill with urgency.
                  </p>

                  {/* Live Script Preview Window */}
                  <div className="border border-white/[0.08] rounded-xl bg-[#131518] p-3.5 space-y-2 font-mono text-xs">
                    <div className="flex items-center justify-between text-zinc-500 text-[11px] pb-2 border-b border-white/[0.06]">
                      <span>STAGE 2: FRIENDLY PROMPT TEMPLATE</span>
                      <span>LLaMA 3.1 DIRECTIVE</span>
                    </div>
                    <div className="text-zinc-400 text-[11px] leading-normal">
                      <span className="text-zinc-300 font-semibold">Subject:</span> Friendly follow-up: Invoice #INV-4921 for Acme Corp
                    </div>
                    <p className="text-zinc-300 text-[11px] leading-normal font-sans pt-0.5">
                      "Hi Sarah — Following up on invoice #INV-4921 ($14,200). You can update your payment method or complete settlement in one click using your secure portal link below."
                    </p>
                    <div className="pt-1 text-[10px] text-[#b7d2f8] flex items-center gap-1.5 font-sans">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Includes tokenized zero-login settlement link embed</span>
                    </div>
                  </div>

                  <ul className="space-y-2 text-xs sm:text-sm text-zinc-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#b7d2f8] shrink-0" />
                      <span>2 vetted scripts per escalation tier with dynamic variable placeholders.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#b7d2f8] shrink-0" />
                      <span>System prompts for Groq LLaMA 3.1 tone escalation.</span>
                    </li>
                  </ul>

                  <div className="pt-1">
                    <Link
                      to="/resources/b2b-dunning-email-templates"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#b7d2f8] hover:text-white transition-colors"
                    >
                      <span>Access All 10 Battle-Tested Templates</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {filteredResources.length === 0 && (
          <div className="border border-white/[0.08] rounded-xl bg-[#0e0f11] py-12 text-center mb-8">
            <p className="text-zinc-400 text-sm mb-3">No playbooks, tools, or templates match your search query.</p>
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
              }}
              className="px-4 py-2 rounded-lg bg-white text-zinc-950 text-xs font-semibold hover:bg-zinc-200 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* SECTION 4: 4 Methodological Pillars */}
        <section className="border border-white/[0.08] rounded-xl bg-[#0e0f11] p-5 sm:p-7 mb-8 shadow-lg">
          <div className="max-w-2xl mb-5">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-1">
              Research Principles
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
              The 4 Pillars of Autonomous Working Capital
            </h2>
            <p className="text-sm text-zinc-400 leading-normal">
              How Jaktra combines corporate treasury math with empathetic behavioral AI to accelerate cash conversion.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                num: "01",
                title: "Exhaustive Countback Math vs Flawed Averages",
                summary: "Traditional Average DSO smooths over monthly revenue spikes, hiding cash leaks during seasonal quarters. Countback deducts actual unpaid sales month-by-month to uncover true collection velocity.",
              },
              {
                num: "02",
                title: "Empathy-First Psychological Tone Curves",
                summary: "Robotic demand emails cause buyer resentment right before contract renewals. Jaktra uses 5 distinct tone phases that transition from administrative helpfulness to firm commercial escalation.",
              },
              {
                num: "03",
                title: "Machine-Speed Dispute Detection & Immediate Freeze",
                summary: "Over 40% of overdue invoices stem from billing inquiries. NLP sentiment classifiers detect dispute topics instantly, halting automated dunning to protect buyer goodwill while finance investigates.",
              },
              {
                num: "04",
                title: "Cryptographic Zero-Login Remittance Links",
                summary: "Requiring vendor AP contacts to register accounts or reset passwords creates friction. Tokenized /i/:token links let debtors inspect line items and settle via ACH or card in under 60 seconds.",
              },
            ].map((pillar) => (
              <div key={pillar.num} className="p-4 rounded-xl bg-[#131518] border border-white/[0.06] space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[#b7d2f8] font-bold">{pillar.num}</span>
                  <h3 className="text-sm sm:text-base font-bold text-white">{pillar.title}</h3>
                </div>
                <p className="text-xs text-zinc-300 leading-normal">
                  {pillar.summary}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 5: Curated Role-Based Reading Tracks */}
        <section className="border border-white/[0.08] rounded-xl bg-[#0e0f11] p-5 sm:p-7 mb-8 shadow-lg">
          <div className="mb-4">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-1">
              Curated Navigation
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Recommended Reading Tracks by Finance Role
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 sm:p-5 rounded-xl bg-[#131518] border border-white/[0.08] hover:border-white/[0.18] transition-colors space-y-2">
              <div className="text-xs font-mono uppercase text-[#b7d2f8] font-semibold">For CFOs &amp; Treasurers</div>
              <h4 className="text-base font-bold text-white">Working Capital Strategy</h4>
              <p className="text-xs sm:text-sm text-zinc-300 leading-normal">
                Prioritize Countback DSO mathematical models, balance sheet cash release projections, and debt financing avoidance.
              </p>
              <Link to="/resources/how-to-reduce-dso" className="inline-flex items-center gap-1 text-xs font-semibold text-white hover:text-[#b7d2f8] transition-colors pt-1">
                DSO Countback Guide <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="p-4 sm:p-5 rounded-xl bg-[#131518] border border-white/[0.08] hover:border-white/[0.18] transition-colors space-y-2">
              <div className="text-xs font-mono uppercase text-[#b7d2f8] font-semibold">For Credit Controllers</div>
              <h4 className="text-base font-bold text-white">Cadence &amp; Dunning Ops</h4>
              <p className="text-xs sm:text-sm text-zinc-300 leading-normal">
                Implement 5-stage behavioral tone curves, automated 20-hour contact barriers, and ready-to-use email templates.
              </p>
              <Link to="/resources/5-stage-ar-tone-escalation" className="inline-flex items-center gap-1 text-xs font-semibold text-white hover:text-[#b7d2f8] transition-colors pt-1">
                5-Stage Tone Playbook <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="p-4 sm:p-5 rounded-xl bg-[#131518] border border-white/[0.08] hover:border-white/[0.18] transition-colors space-y-2">
              <div className="text-xs font-mono uppercase text-[#b7d2f8] font-semibold">For RevOps &amp; Billing</div>
              <h4 className="text-base font-bold text-white">Dispute Triage &amp; Rails</h4>
              <p className="text-xs sm:text-sm text-zinc-300 leading-normal">
                Connect QuickBooks, Stripe, or Xero with NLP dispute detection, true-up reconciliation, and tokenized payment portals.
              </p>
              <Link to="/features/dispute-triage" className="inline-flex items-center gap-1 text-xs font-semibold text-white hover:text-[#b7d2f8] transition-colors pt-1">
                Dispute Triage Specs <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </section>

        {/* SECTION 6: Frequently Asked Questions */}
        <section className="border border-white/[0.08] rounded-xl bg-[#0e0f11] p-5 sm:p-7 mb-8 shadow-lg">
          <div className="max-w-2xl mb-5">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-1">
              Knowledge Base FAQs
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-zinc-400 leading-normal">
              Answers regarding our research methodology, mathematical formulas, and template application.
            </p>
          </div>

          <Accordion type="single" variant="outline" defaultValue="res-faq-0" collapsible className="w-full">
            {FAQS.map((faq, i) => (
              <AccordionItem key={i} value={`res-faq-${i}`} className="border-b border-white/[0.08] py-1">
                <AccordionTrigger className="text-left font-semibold text-white text-base hover:no-underline hover:text-[#b7d2f8] transition-colors py-3">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-zinc-300 text-sm leading-normal pb-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* SECTION 7: Cross-Platform Directories & Horizon CTA */}
        <section className="mb-8">
          <div className="text-center mb-5">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Looking for Product Capabilities or Industry Solutions?
            </h2>
            <p className="mt-1 text-zinc-400 text-sm max-w-xl mx-auto">
              Explore our core platform architecture, software comparison matrix, and sector-specific playbooks.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Link
              to="/features"
              className="p-4 sm:p-5 rounded-xl bg-[#0e0f11] border border-white/[0.08] hover:border-white/[0.18] space-y-2 group transition-all shadow-md"
            >
              <div className="text-xs font-mono uppercase text-[#b7d2f8] font-semibold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>Autonomous Capabilities</span>
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-[#b7d2f8] transition-colors">
                Platform Features →
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 leading-normal">
                Explore the core autonomous AR capabilities: 5-stage escalation, dispute triage, zero-login portals, and risk scoring.
              </p>
            </Link>

            <Link
              to="/compare"
              className="p-4 sm:p-5 rounded-xl bg-[#0e0f11] border border-white/[0.08] hover:border-white/[0.18] space-y-2 group transition-all shadow-md"
            >
              <div className="text-xs font-mono uppercase text-[#b7d2f8] font-semibold flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5" />
                <span>Software Buyer's Matrix</span>
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-[#b7d2f8] transition-colors">
                Software Comparisons →
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 leading-normal">
                Objective comparisons of Jaktra vs HighRadius, Upflow, Chaser, PaidNice, and Kolleno with live pricing.
              </p>
            </Link>

            <Link
              to="/use-cases"
              className="p-4 sm:p-5 rounded-xl bg-[#0e0f11] border border-white/[0.08] hover:border-white/[0.18] space-y-2 group transition-all shadow-md"
            >
              <div className="text-xs font-mono uppercase text-[#b7d2f8] font-semibold flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                <span>Industry Sector Playbooks</span>
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-[#b7d2f8] transition-colors">
                Industry Solutions →
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 leading-normal">
                Tailored collections playbooks for B2B SaaS, digital agencies, industrial manufacturing, logistics, and consulting.
              </p>
            </Link>
          </div>

          <div className="p-6 sm:p-8 rounded-xl bg-[#0e0f11] border border-white/[0.08] text-center space-y-4 shadow-lg mb-8">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Ready to Accelerate Your Accounts Receivable?
            </h3>
            <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto leading-normal">
              Connect QuickBooks, Xero, or Stripe in under 15 minutes. 100% free during Early Access with zero credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
              <Link
                to="/register"
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-white text-zinc-950 font-semibold text-xs sm:text-sm hover:bg-zinc-200 transition-colors shadow-sm"
              >
                Get Started Free
              </Link>
              <Link
                to="/use-cases"
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white font-medium text-xs sm:text-sm hover:bg-white/[0.08] transition-colors"
              >
                Explore All 14 Industry Playbooks
              </Link>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}

export default ResourcesHub;

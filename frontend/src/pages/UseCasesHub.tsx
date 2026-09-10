import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Laptop,
  Briefcase,
  Factory,
  HardHat,
  Truck,
  Users,
  Boxes,
  Megaphone,
  CheckCircle2,
  TrendingDown,
  ShieldCheck,
  Zap,
  CreditCard,
  Search,
} from "lucide-react";
import jaktraLogo from "../assets/jaktra_svg.svg";
import { SEOHead } from "../components/common/SEOHead";
import { useCasesHubSchema, breadcrumbSchema } from "../components/common/seo-schemas";
import { LandingFooter } from "../components/landing/LandingFooter";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

function HeaderNav() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-[#0a0a0b]/90 backdrop-blur-md border-b border-white/[0.08]">
      <div className="w-full h-full px-4 sm:px-8 lg:px-12 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 text-decoration-none">
          <img src={jaktraLogo} alt="Jaktra" width={24} height={24} className="h-6 w-6 block" />
          <span className="font-semibold text-white text-lg tracking-tight font-sans">Jaktra</span>
        </Link>
        <div className="flex items-center gap-4 sm:gap-6">
          <Link to="/pricing" className="text-sm text-zinc-400 hover:text-white transition-colors hidden sm:block">
            Pricing
          </Link>
          <Link to="/features" className="text-sm text-zinc-400 hover:text-white transition-colors hidden sm:block">
            Features
          </Link>
          <Link to="/compare" className="text-sm text-zinc-400 hover:text-white transition-colors hidden sm:block">
            Compare
          </Link>
          <Link to="/resources" className="text-sm text-zinc-400 hover:text-white transition-colors hidden sm:block">
            Resources
          </Link>
          <Link
            to="/login"
            className="text-xs sm:text-sm text-zinc-300 hover:text-white transition-colors"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="text-xs sm:text-sm font-medium bg-white text-zinc-950 px-3.5 py-1.5 rounded-lg hover:bg-zinc-200 transition-colors shadow-sm"
          >
            Get started free
          </Link>
        </div>
      </div>
    </header>
  );
}

interface IndustrySolution {
  id: string;
  name: string;
  url: string;
  category: "saas" | "agencies" | "consulting" | "manufacturing" | "freight" | "wholesale" | "staffing" | "construction";
  categoryLabel: string;
  icon: typeof Laptop;
  paymentTerms: string;
  primaryFriction: string;
  collectionChallenge: string;
  howJaktraSolves: string[];
  highlight: string;
  isFeatured?: boolean;
}

const INDUSTRIES: IndustrySolution[] = [
  {
    id: "saas",
    name: "B2B SaaS & Subscription Software",
    url: "/use-cases/saas",
    category: "saas",
    categoryLabel: "SaaS & Software",
    icon: Laptop,
    paymentTerms: "Net 30 / Annual Contracts",
    primaryFriction: "Expired corporate cards, seat true-up lag & renewal hesitation",
    collectionChallenge:
      "Finance teams hesitate to chase overdue renewals or seat true-ups because aggressive dunning creates friction right before contract renewal conversations.",
    howJaktraSolves: [
      "Generates courteous, relationship-first tone escalation (Warm Reminder → Firm Prompt) that never feels aggressive.",
      "Embedded tokenized payment links allow buyers to update expired cards or pay via ACH in one click.",
      "Automatically freezes collection cadences the instant a buyer replies with a billing question.",
    ],
    highlight: "Automates subscription dunning while preserving customer renewal relationships",
    isFeatured: true,
  },
  {
    id: "agencies",
    name: "Digital & Marketing Agencies",
    url: "/use-cases/agencies",
    category: "agencies",
    categoryLabel: "Agencies & Creative",
    icon: Megaphone,
    paymentTerms: "Net 30 / Monthly Retainers",
    primaryFriction: "Account manager collection hesitation & unapproved scope expansion",
    collectionChallenge:
      "Account managers and creative directors hate having awkward payment conversations with clients, so overdue invoices linger while the agency fronts payroll and ad spend.",
    howJaktraSolves: [
      "Acts as an autonomous, professional third-party AR agent so creative leads never have to make awkward collection calls.",
      "Automates scheduled milestone and retainer follow-ups before the 1st of the month.",
      "Provides structured installment options for large project milestones so clients don't ghost when cash is tight.",
    ],
    highlight: "Takes the awkward collection burden completely off creative account managers",
    isFeatured: true,
  },
  {
    id: "manufacturing",
    name: "Manufacturing & Industrial Suppliers",
    url: "/use-cases/manufacturing",
    category: "manufacturing",
    categoryLabel: "Manufacturing & Industrial",
    icon: Factory,
    paymentTerms: "Net 60–90 / Work-in-Progress",
    primaryFriction: "Missing PO numbers, receiving dock discrepancies & batch AP runs",
    collectionChallenge:
      "Enterprise buyers routinely push Net-30 terms out to 60–90 days because invoices sit unread in accounts payable queues until someone systematically follows up.",
    howJaktraSolves: [
      "Sends automated proactive courtesy notices before payment due dates to confirm PO matching and AP receipt.",
      "DisputeAgent classifies clerical hold-ups (missing PO, price variance) and pauses emails to resolve issues quickly.",
      "Enables high-value corporate bank transfers and installment plans for capital orders.",
    ],
    highlight: "Proactively verifies PO matching and itemized receiving before due dates",
    isFeatured: true,
  },
  {
    id: "professional-services",
    name: "Consulting & Professional Services",
    url: "/use-cases/professional-services",
    category: "consulting",
    categoryLabel: "Professional Services",
    icon: Briefcase,
    paymentTerms: "Net 30 / Hourly Engagements",
    primaryFriction: "Engagement partner collection reluctance & billed hours inquiries",
    collectionChallenge:
      "Partner billing hours and project retainers get delayed in multi-layer corporate approval chains, while partners avoid pressing clients for payment.",
    howJaktraSolves: [
      "Runs automated, disciplined reminder cadences directly to client AP departments.",
      "Instantly pauses messaging and notifies the engagement partner when a client questions billed hours.",
      "Sends zero-login payment links so clients can approve and settle invoices without friction.",
    ],
    highlight: "Insulates relationship partners from uncomfortable debt collection discussions",
  },
  {
    id: "logistics-freight",
    name: "Logistics, Freight & 3PL",
    url: "/use-cases/logistics-freight",
    category: "freight",
    categoryLabel: "Logistics & Freight",
    icon: Truck,
    paymentTerms: "Net 30–60 / Load Delivery",
    primaryFriction: "Missing proof-of-delivery (POD) & accessorial detention disputes",
    collectionChallenge:
      "High volumes of freight bills get buried in shipper inboxes, and minor accessorial questions cause payments to stall for months.",
    howJaktraSolves: [
      "Automates high-volume dunning cadences with Dead Letter Queue (DLQ) delivery tracking to prevent emails landing in spam.",
      "Detects rate and detention disputes immediately, alerting dispatchers before debts age.",
      "Offers fast digital settlement options via credit card, ACH, or net banking.",
    ],
    highlight: "Systematizes freight billing follow-ups and catches accessorial disputes early",
  },
  {
    id: "wholesale-distribution",
    name: "Wholesale & Trade Distribution",
    url: "/use-cases/wholesale-distribution",
    category: "wholesale",
    categoryLabel: "Wholesale Trade",
    icon: Boxes,
    paymentTerms: "Net 30–60 / Trade Credit",
    primaryFriction: "Short-shipment damage claims & buyer credit limit extensions",
    collectionChallenge:
      "Wholesale buyers stretch trade credit and pay only when pressed, while distributors worry that aggressive collections will push buyers to competing vendors.",
    howJaktraSolves: [
      "Maintains systematic 5-stage reminder cadences that preserve customer goodwill through respectful wording.",
      "Enables structured 2x, 3x, or 4x installment schedules when wholesale buyers face temporary cash flow crunches.",
      "Enforces payment deadlines consistently across your entire customer ledger.",
    ],
    highlight: "Protects thin wholesale trade margins with structured payment schedules",
  },
  {
    id: "staffing-recruiting",
    name: "Staffing & Recruitment Agencies",
    url: "/use-cases/staffing-recruiting",
    category: "staffing",
    categoryLabel: "Staffing & Payroll",
    icon: Users,
    paymentTerms: "Net 45–60 / Weekly Payroll",
    primaryFriction: "Client timesheet approval lag vs immediate contractor payroll funding",
    collectionChallenge:
      "Staffing agencies must fund contractor payroll every single week, while corporate clients take 45–60 days to pay, forcing agencies into expensive invoice factoring loans.",
    howJaktraSolves: [
      "Dispatches automated, timely reminders aligned with weekly payroll intervals.",
      "Flags timesheet and approval delays early so client hiring managers sign off promptly.",
      "Accelerates invoice settlement to protect weekly payroll cash flow without debt factoring.",
    ],
    highlight: "Protects weekly contractor payroll cash flow with automated client cadences",
  },
  {
    id: "construction",
    name: "Commercial Subcontractors & Trade Services",
    url: "/use-cases/construction",
    category: "construction",
    categoryLabel: "Commercial Contractors",
    icon: HardHat,
    paymentTerms: "Net 60–90 / Progress Billings",
    primaryFriction: "Pay-when-paid clauses, unapproved change orders & retainage holdbacks",
    collectionChallenge:
      "Trade contractors and subcontractors face slow-paying general contractors who hold back progress payments until chased repeatedly.",
    howJaktraSolves: [
      "Automates consistent milestone payment reminders with itemized balance summaries.",
      "Provides direct, zero-login payment links so general contractors can pay immediately via bank transfer or card.",
      "Escalates systematically from friendly courtesy notices to firm executive reminders over 45 days.",
    ],
    highlight: "Tracks progress billing milestones and retainage releases systematically",
  },
];

const FAQS = [
  {
    q: "How does Jaktra prevent damage to customer and client relationships?",
    a: "Generic dunning software sends repetitive, robotic notices that sound cold and aggressive. Jaktra uses Groq LLaMA 3.1 to generate respectful, relationship-first communications across 5 distinct stages—starting with a gentle courtesy reminder and only escalating if an invoice remains unpaid for weeks. The tone is always professional, polite, and aligned with standard B2B commercial etiquette.",
  },
  {
    q: "What happens when a debtor replies with a question or dispute?",
    a: "If a debtor replies saying 'we already paid this yesterday', 'the billed amount is incorrect', or 'waiting on manager approval', Jaktra's AI DisputeAgent immediately detects the objection. It instantly freezes all automated follow-ups for that invoice so you never embarrass your company by sending reminders during an active conversation, alerts your team, and drafts an AI-suggested reply for your review.",
  },
  {
    q: "Can debtors settle invoices directly without creating an account or logging in?",
    a: "Yes. Every follow-up email includes a secure, tokenized payment link (`/i/:token`). When your client clicks it, they see their invoice details and can settle immediately via Razorpay, credit card, NetBanking, or UPI in 60 seconds without creating a password or logging into an account.",
  },
  {
    q: "How does Jaktra help when a debtor cannot pay the full balance upfront?",
    a: "Demanding 100% immediate payment from a customer facing temporary cash constraints often causes them to ignore messages entirely. Jaktra allows you to offer flexible, structured installment payment plans (2x, 3x, or 4x installments). Debtors can self-select an installment schedule via their payment link, turning default risk into predictable cash inflows.",
  },
  {
    q: "Does Jaktra replace our existing accounting or invoicing software?",
    a: "No. Jaktra does not replace QuickBooks, Xero, Stripe, or your back-office billing systems. Instead, Jaktra connects to your invoices, tracks payment statuses, runs automated follow-up cadences, handles dispute detection, and reconciles payments back to your records automatically.",
  },
];

export default function UseCasesHub() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [annualRevenue, setAnnualRevenue] = useState<number>(10000000); // $10M
  const [currentDso, setCurrentDso] = useState<number>(58);
  const [targetDso, setTargetDso] = useState<number>(36);

  const filteredIndustries = useMemo(() => {
    return INDUSTRIES.filter((ind) => {
      if (selectedCategory !== "all" && ind.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = ind.name.toLowerCase().includes(q);
        const matchesChallenge = ind.collectionChallenge.toLowerCase().includes(q);
        const matchesCategory = ind.categoryLabel.toLowerCase().includes(q);
        if (!matchesName && !matchesChallenge && !matchesCategory) {
          return false;
        }
      }
      return true;
    });
  }, [selectedCategory, searchQuery]);

  // Working Capital Calculations
  const dsoReduction = Math.max(0, currentDso - targetDso);
  const dailySales = annualRevenue / 365;
  const cashUnlocked = Math.round(dailySales * dsoReduction);
  const annualFinancingSaved = Math.round(cashUnlocked * 0.08); // 8% cost of capital

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#f5f5f5] font-sans selection:bg-[#b7d2f8]/20 selection:text-white antialiased">
      <SEOHead
        title="B2B Accounts Receivable Industry Solutions & DSO Benchmarks | Jaktra"
        description="Discover how Jaktra automates B2B accounts receivable across SaaS, agencies, consulting, manufacturing, freight, wholesale, and staffing. Cut DSO by 15–25 days with autonomous 5-stage tone escalation."
        canonicalPath="/use-cases"
        jsonLd={[
          useCasesHubSchema,
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Industry Solutions", path: "/use-cases" },
          ]),
        ]}
      />

      <HeaderNav />

      <main className="pt-28 sm:pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(183,210,248,0.08),transparent)] pointer-events-none" />

        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6 relative z-10">
          <ol className="flex items-center gap-2 text-xs text-zinc-400">
            <li>
              <Link to="/" className="hover:text-zinc-200 transition-colors">
                Home
              </Link>
            </li>
            <li className="text-zinc-600">/</li>
            <li className="text-zinc-200 font-medium" aria-current="page">
              Industry Solutions
            </li>
          </ol>
        </nav>

        {/* Hero Section: Full-Width Open Layout */}
        <section className="mb-14">
          <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-3">
            Industry Solutions Directory
          </span>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 max-w-5xl leading-[1.1]">
            Accounts Receivable Built for Real-World B2B Cash Flow
          </h1>

          <p className="text-lg sm:text-xl text-zinc-300 max-w-4xl leading-relaxed mb-10">
            Every business model faces overdue invoices for different reasons—from fear of hurting client relationships, to complex corporate approval chains, to cash-strapped buyers. Jaktra replaces painful manual follow-ups with intelligent, respectful collection cadences that recover cash faster without annoying your clients.
          </p>

          {/* 4 Core Pillars: Full-Width Open Ribbon (Zero Boxes) */}
          <div className="border-y border-white/[0.08] py-8 my-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 text-white font-semibold text-base">
                <ShieldCheck className="w-5 h-5 text-[#b7d2f8] shrink-0" />
                <span>5-Stage Tone Escalation</span>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed">
                5 progressive stages from gentle reminders to firm notices that preserve customer trust.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2.5 text-white font-semibold text-base">
                <Zap className="w-5 h-5 text-[#b7d2f8] shrink-0" />
                <span>Autonomous Dispute Triage</span>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed">
                AI detects disputes and freezes cadences instantly so you never harass a questioning client.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2.5 text-white font-semibold text-base">
                <CreditCard className="w-5 h-5 text-[#b7d2f8] shrink-0" />
                <span>Zero-Login Debtor Pay</span>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed">
                One-click debtor link to pay via Razorpay, UPI, cards, or bank transfer without passwords.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2.5 text-white font-semibold text-base">
                <TrendingDown className="w-5 h-5 text-[#b7d2f8] shrink-0" />
                <span>Structured Installments</span>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Self-serve 2x, 3x, or 4x installments turn default risks into predictable incoming cash.
              </p>
            </div>
          </div>
        </section>

        {/* Directory Section: Open Full-Width Architectural Stream (No Box Design) */}
        <section className="mb-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/[0.08] mb-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-2">
                Industry Collection Blueprints
              </h2>
              <p className="text-base text-zinc-400">
                Select your business model to see tailored dunning cadences, dispute handling, and working capital acceleration.
              </p>
            </div>

            {/* Keyword Search Input */}
            <div className="relative min-w-[280px]">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search solutions..."
                className="w-full bg-white/[0.03] border border-white/[0.1] rounded-lg pl-9 pr-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 mb-10">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === "all"
                  ? "bg-white text-zinc-950 font-semibold shadow-sm"
                  : "bg-white/[0.03] text-zinc-400 hover:text-white border border-white/[0.08]"
              }`}
            >
              All Businesses ({INDUSTRIES.length})
            </button>
            <button
              onClick={() => setSelectedCategory("saas")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === "saas"
                  ? "bg-white text-zinc-950 font-semibold shadow-sm"
                  : "bg-white/[0.03] text-zinc-400 hover:text-white border border-white/[0.08]"
              }`}
            >
              SaaS &amp; Software
            </button>
            <button
              onClick={() => setSelectedCategory("agencies")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === "agencies"
                  ? "bg-white text-zinc-950 font-semibold shadow-sm"
                  : "bg-white/[0.03] text-zinc-400 hover:text-white border border-white/[0.08]"
              }`}
            >
              Agencies &amp; Creative
            </button>
            <button
              onClick={() => setSelectedCategory("consulting")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === "consulting"
                  ? "bg-white text-zinc-950 font-semibold shadow-sm"
                  : "bg-white/[0.03] text-zinc-400 hover:text-white border border-white/[0.08]"
              }`}
            >
              Consulting
            </button>
            <button
              onClick={() => setSelectedCategory("manufacturing")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === "manufacturing"
                  ? "bg-white text-zinc-950 font-semibold shadow-sm"
                  : "bg-white/[0.03] text-zinc-400 hover:text-white border border-white/[0.08]"
              }`}
            >
              Manufacturing
            </button>
            <button
              onClick={() => setSelectedCategory("freight")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === "freight"
                  ? "bg-white text-zinc-950 font-semibold shadow-sm"
                  : "bg-white/[0.03] text-zinc-400 hover:text-white border border-white/[0.08]"
              }`}
            >
              Freight &amp; 3PL
            </button>
            <button
              onClick={() => setSelectedCategory("wholesale")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === "wholesale"
                  ? "bg-white text-zinc-950 font-semibold shadow-sm"
                  : "bg-white/[0.03] text-zinc-400 hover:text-white border border-white/[0.08]"
              }`}
            >
              Wholesale
            </button>
            <button
              onClick={() => setSelectedCategory("staffing")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === "staffing"
                  ? "bg-white text-zinc-950 font-semibold shadow-sm"
                  : "bg-white/[0.03] text-zinc-400 hover:text-white border border-white/[0.08]"
              }`}
            >
              Staffing
            </button>
            <button
              onClick={() => setSelectedCategory("construction")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === "construction"
                  ? "bg-white text-zinc-950 font-semibold shadow-sm"
                  : "bg-white/[0.03] text-zinc-400 hover:text-white border border-white/[0.08]"
              }`}
            >
              Contractors
            </button>
          </div>

          {/* Open Full-Width Architectural Stream (No Enclosed Boxes) */}
          <div className="divide-y divide-white/[0.08]">
            {filteredIndustries.map((ind) => {
              const Icon = ind.icon;
              return (
                <div
                  key={ind.id}
                  className="py-10 lg:py-12 transition-colors hover:bg-white/[0.015] group"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                    {/* Col 1: Identity & Operational Workflow Focus (lg:col-span-4) */}
                    <div className="lg:col-span-4 space-y-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                          {ind.categoryLabel}
                        </span>
                        <span className="text-zinc-600">·</span>
                        <span className="text-xs font-mono text-zinc-400">
                          {ind.paymentTerms}
                        </span>
                      </div>

                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8] shrink-0">
                          <Icon className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-[#b7d2f8] transition-colors">
                          {ind.name}
                        </h3>
                      </div>

                      <p className="text-sm text-zinc-300 leading-relaxed">
                        {ind.highlight}
                      </p>

                      <div className="pt-2">
                        <Link
                          to={ind.url}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-[#b7d2f8] transition-colors group-hover:translate-x-1"
                        >
                          <span>Explore {ind.name.split("&")[0].trim()} Playbook</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>

                    {/* Col 2: Challenge Editorial (lg:col-span-4 lg:border-x lg:border-white/[0.08] lg:px-8) */}
                    <div className="lg:col-span-4 space-y-3">
                      <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 block font-semibold">
                        The Core Collection Challenge:
                      </span>
                      <p className="text-base text-zinc-300 leading-relaxed">
                        {ind.collectionChallenge}
                      </p>
                      <div className="pt-2 text-xs font-medium text-[#b7d2f8] italic">
                        "{ind.highlight}"
                      </div>
                    </div>

                    {/* Col 3: Solution Sequence (lg:col-span-4 lg:pl-4) */}
                    <div className="lg:col-span-4 space-y-3">
                      <span className="text-xs font-mono uppercase tracking-wider text-[#b7d2f8] block font-semibold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#b7d2f8]" />
                        <span>Autonomous Jaktra Workflow:</span>
                      </span>
                      <ul className="space-y-3">
                        {ind.howJaktraSolves.map((pt, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm sm:text-base text-zinc-200 leading-relaxed">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#b7d2f8] shrink-0 mt-2.5" />
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredIndustries.length === 0 && (
            <div className="py-16 text-center border-b border-white/[0.08]">
              <p className="text-zinc-400 text-base mb-3">No industry playbooks match your search query.</p>
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setSearchQuery("");
                }}
                className="px-5 py-2.5 rounded-lg bg-white text-zinc-950 text-sm font-semibold hover:bg-zinc-200 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          )}
        </section>

        {/* Interactive Working Capital & DSO Unlock Calculator */}
        <section className="border-t border-white/[0.08] pt-16 pb-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-2">
                Working Capital Model
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                Calculate Cash Released by Compressing Your DSO
              </h2>
            </div>
            <p className="text-sm text-zinc-400 max-w-xl leading-relaxed">
              Every day invoices sit unpaid represents cash trapped on your balance sheet. Adjust revenue and DSO targets to inspect immediate liquidity release.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Controls (7 cols) */}
            <div className="lg:col-span-7 space-y-8">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold">
                    Annual Gross Credit Sales
                  </label>
                  <span className="text-base font-mono font-bold text-white">
                    ${(annualRevenue / 1000000).toFixed(1)}M USD
                  </span>
                </div>
                <input
                  type="range"
                  min={1000000}
                  max={50000000}
                  step={500000}
                  value={annualRevenue}
                  onChange={(e) => setAnnualRevenue(Number(e.target.value))}
                  className="w-full accent-[#b7d2f8] cursor-pointer h-2 bg-white/[0.08] rounded-lg appearance-none"
                />
                <div className="flex justify-between text-xs text-zinc-500 mt-2 font-mono">
                  <span>$1,000,000</span>
                  <span>$25,000,000</span>
                  <span>$50,000,000</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4 border-t border-white/[0.06]">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold">
                      Current Baseline DSO
                    </label>
                    <span className="text-base font-mono font-bold text-zinc-200">
                      {currentDso} days
                    </span>
                  </div>
                  <input
                    type="range"
                    min={35}
                    max={90}
                    step={1}
                    value={currentDso}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setCurrentDso(val);
                      if (val <= targetDso) setTargetDso(Math.max(20, val - 10));
                    }}
                    className="w-full accent-zinc-400 cursor-pointer h-2 bg-white/[0.08] rounded-lg appearance-none"
                  />
                  <span className="text-xs text-zinc-500 mt-2 block">Your current average collection cycle time</span>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-xs font-mono uppercase tracking-wider text-[#b7d2f8] font-semibold">
                      Simulated Target DSO Goal
                    </label>
                    <span className="text-base font-mono font-bold text-[#b7d2f8]">
                      {targetDso} days
                    </span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={Math.max(25, currentDso - 5)}
                    step={1}
                    value={targetDso}
                    onChange={(e) => setTargetDso(Number(e.target.value))}
                    className="w-full accent-[#b7d2f8] cursor-pointer h-2 bg-white/[0.08] rounded-lg appearance-none"
                  />
                  <span className="text-xs text-zinc-400 mt-2 block">Adjust to model potential working capital accelerated</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-3 text-xs text-zinc-400 font-mono">
                <span>Standard treasury formula: <code>(Δ DSO / 365) × Annual Revenue</code>.</span>
              </div>
            </div>

            {/* Results Display (5 cols, architectural border divider, no enclosed box) */}
            <div className="lg:col-span-5 lg:border-l lg:border-white/[0.08] lg:pl-10 space-y-6">
              <div>
                <div className="text-xs text-zinc-400 font-mono uppercase tracking-wider font-semibold mb-2">
                  Modeled Working Capital Accelerated
                </div>
                <div className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white font-mono tracking-tight">
                  ${cashUnlocked.toLocaleString()}
                </div>
                <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
                  Liquidity accelerated from overdue accounts receivable directly into liquid operational cash balances.
                </p>
              </div>

              <div className="pt-6 border-t border-white/[0.08] grid grid-cols-2 gap-6">
                <div>
                  <div className="text-xs font-mono text-zinc-400 uppercase font-semibold">
                    Financing Cost Saved
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-white mt-1 font-mono">
                    ${annualFinancingSaved.toLocaleString()}<span className="text-xs text-zinc-500 font-normal">/yr</span>
                  </div>
                  <span className="text-xs text-zinc-500 mt-1 block">Assuming 8% cost of capital</span>
                </div>
                <div>
                  <div className="text-xs font-mono text-zinc-400 uppercase font-semibold">
                    Cadence Automation
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-white mt-1 font-mono">
                    5 Stages
                  </div>
                  <span className="text-xs text-zinc-500 mt-1 block">Full-loop reminder to resolution</span>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  to="/register"
                  className="w-full py-3.5 px-6 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  Unlock This Working Capital Free <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Cross-Industry Workflow & Operational Blueprint Table */}
        <section className="border-t border-white/[0.08] pt-16 pb-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-2">
                Operational Architecture Matrix
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                Industry Collection Realities &amp; Execution Workflows
              </h2>
            </div>
            <p className="text-sm text-zinc-400 max-w-xl leading-relaxed">
              Explore how automated, dispute-aware cadences align with standard commercial terms and eliminate friction across business models.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#111113] shadow-sm">
            <table className="w-full text-left text-sm border-collapse min-w-[760px]">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.03]">
                  <th className="py-4 px-6 text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">Industry Model</th>
                  <th className="py-4 px-6 text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">Standard Terms</th>
                  <th className="py-4 px-6 text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">Primary Collection Bottleneck</th>
                  <th className="py-4 px-6 text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">Autonomous Workflow</th>
                  <th className="py-4 px-6 text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold text-right">Dedicated Guide</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {INDUSTRIES.map((ind) => (
                  <tr key={`benchmark-${ind.id}`} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="py-4 px-6 font-medium text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8] shrink-0">
                          <ind.icon className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-sm sm:text-base">{ind.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-zinc-300 font-mono text-xs">{ind.paymentTerms}</td>
                    <td className="py-4 px-6 text-zinc-300 text-sm max-w-xs leading-relaxed">{ind.primaryFriction}</td>
                    <td className="py-4 px-6 text-zinc-300 text-sm max-w-xs leading-relaxed font-medium">{ind.highlight}</td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        to={ind.url}
                        className="text-[#b7d2f8] group-hover:text-white font-semibold inline-flex items-center gap-1.5 text-xs sm:text-sm transition-colors"
                      >
                        Read playbook <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQs Section: Open Split Layout */}
        <section className="border-t border-white/[0.08] pt-16 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-4 space-y-4">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-2">
                Frequently Asked Questions
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                Clear Answers on Autonomous Collections
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                How Jaktra safeguards client relationships, detects disputed invoices, and connects with your existing accounting stack.
              </p>
              <div className="pt-4">
                <Link
                  to="/features/ai-agent"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[#b7d2f8] hover:text-white transition-colors"
                >
                  Learn more about Jaktra's AI Agent <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-8 lg:border-l lg:border-white/[0.08] lg:pl-10">
              <Accordion type="single" variant="outline" defaultValue="faq-0" collapsible className="w-full">
                {FAQS.map((faq, idx) => (
                  <AccordionItem key={idx} value={`faq-${idx}`} className="border-b border-white/[0.08] py-2">
                    <AccordionTrigger className="text-left font-semibold text-white text-base sm:text-lg hover:no-underline hover:text-[#b7d2f8] transition-colors py-4">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-zinc-300 text-sm sm:text-base leading-relaxed pb-6">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* Bottom CTA: Full-Width Open Horizon Banner */}
        <section className="border-t border-white/[0.08] py-20 text-center relative">
          <div className="max-w-4xl mx-auto space-y-6">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-2">
              Zero Risk · 100% Free During Early Access
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
              Ready to Accelerate Your Accounts Receivable?
            </h2>
            <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Connect QuickBooks, Xero, or Stripe in under 15 minutes. Stop losing days to manual collections and release working capital immediately.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-200 transition-colors shadow-sm"
              >
                Start Free Trial
              </Link>
              <Link
                to="/compare"
                className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white font-medium text-sm hover:bg-white/[0.08] transition-colors"
              >
                Explore Software Comparison Guide
              </Link>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}

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
import { SEOHead } from "@/seo/components/SEOHead";
import { useCasesHubSchema, breadcrumbSchema } from "@/seo/schemas";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { GlobalNav } from "@/components/common/GlobalNav";

interface IndustrySolution {
  id: string;
  name: string;
  url: string;
  category: "saas" | "agencies" | "consulting" | "manufacturing" | "freight" | "wholesale" | "staffing" | "construction";
  categoryLabel: string;
  icon: typeof Laptop;
  paymentTerms: string;
  workflowFocus: string;
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
    categoryLabel: "SaaS & Tech",
    icon: Laptop,
    paymentTerms: "Net 30 / Annual Contracts",
    workflowFocus: "Renewal Preservation & Card Updates",
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
    workflowFocus: "Retainer Protection & Partner Shield",
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
    workflowFocus: "PO Discrepancy & Batch Installments",
    primaryFriction: "Missing PO numbers, receiving dock discrepancies & batch AP runs",
    collectionChallenge:
      "Enterprise buyers routinely push Net-30 terms out to 60–90 days because invoices sit unread in accounts payable queues until someone systematically follows up.",
    howJaktraSolves: [
      "Sends automated proactive courtesy notices before payment due dates to confirm PO matching and AP receipt.",
      "Dispute triage classifies clerical hold-ups (missing PO, price variance) and pauses emails to resolve issues quickly.",
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
    workflowFocus: "Fee Dispute Triage & AP Cadence",
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
    workflowFocus: "DLQ Delivery & Accessorial Triage",
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
    workflowFocus: "Goodwill Preservation & 2x-4x Installments",
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
    workflowFocus: "Weekly Payroll Cash & Timesheet Triage",
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
    workflowFocus: "Progress Billing & Retainage Cadences",
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
    a: "Generic dunning software sends repetitive, robotic notices that sound cold and confrontational. Jaktra uses autonomous AI to generate respectful, relationship-first communications across 5 distinct stages—starting with a gentle courtesy reminder and only escalating if an invoice remains unpaid for weeks. The tone is always professional, polite, and aligned with standard B2B commercial etiquette.",
  },
  {
    q: "What happens when a debtor replies with a question or dispute?",
    a: "If a debtor replies saying 'we already paid this yesterday', 'the billed amount is incorrect', or 'waiting on manager approval', Jaktra's autonomous dispute triage immediately detects the objection. It instantly freezes all automated follow-ups for that invoice so you never embarrass your company by sending reminders during an active conversation, alerts your team, and drafts a contextual resolution response for your review.",
  },
  {
    q: "Can debtors settle invoices directly without creating an account or logging in?",
    a: "Yes. Every follow-up email includes a secure, tokenized payment link (/i/:token). When your client clicks it, they see their invoice details and can settle immediately via bank transfer, credit card, or corporate payments in 30 seconds without creating a password or logging into an account.",
  },
  {
    q: "How does Jaktra help when a debtor cannot pay the full balance upfront?",
    a: "Demanding 100% immediate payment from a customer facing temporary cash constraints often causes them to ignore messages entirely. Jaktra allows you to offer flexible, structured installment payment plans (2x, 3x, or 4x installments). Debtors can self-select an installment schedule via their payment link, turning default risk into predictable cash inflows.",
  },
  {
    q: "Does Jaktra replace our existing accounting or invoicing software?",
    a: "No. Jaktra works alongside your existing accounting software (QuickBooks, Xero, NetSuite, Zoho, Stripe, etc.). You simply import your open receivables ledger via universal CSV upload or connect directly via our REST API. Jaktra then automates tone-escalated follow-up cadences, intercepts disputes, and tracks settlements without replacing your core ledger of record.",
  },
];

export default function UseCasesHub() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

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
        const matchesHighlight = ind.highlight.toLowerCase().includes(q);
        if (!matchesName && !matchesChallenge && !matchesCategory && !matchesHighlight) {
          return false;
        }
      }
      return true;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#010102] text-[#f7f8f8] font-sans antialiased selection:bg-[#5e6ad2]/30 selection:text-white">
      <SEOHead
        title="B2B Accounts Receivable Industry Solutions | Jaktra"
        description="Explore how Jaktra automates B2B accounts receivable across SaaS, agencies, manufacturing, freight, and staffing to cut DSO by 15–25 days with autonomous AI."
        canonicalPath="/use-cases"
        jsonLd={[
          useCasesHubSchema,
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Industry Solutions", path: "/use-cases" },
          ]),
        ]}
      />

      <GlobalNav />

      <main className="pt-24 pb-20 max-w-6xl mx-auto px-6 relative">
        {/* Subtle Ambient Glow */}
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
              Industry Solutions
            </li>
          </ol>
        </nav>

        {/* Hero Section */}
        <header className="mb-10 pt-1">
          <div className="max-w-4xl mb-7">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight mb-3">
              <span className="block">B2B Accounts Receivable Solutions</span>
              <span className="block text-zinc-300">Tailored to Your Industry Model</span>
            </h1>

            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-3xl">
              Every commercial business model faces overdue invoices for different reasons—from fear of straining recurring client relationships, to missing purchase orders, to slow-paying general contractors. Explore our tailored playbooks engineered for your specific terms, commercial etiquette, and cash flow dynamics.
            </p>
          </div>

          {/* 4 Core Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-left">
            <div className="p-4 rounded-xl bg-[#0e0f11] border border-white/[0.08] space-y-1.5 hover:border-white/[0.16] transition-colors">
              <div className="flex items-center gap-2 text-white font-semibold text-sm">
                <ShieldCheck className="w-4 h-4 text-[#b7d2f8] shrink-0" />
                <span>5-Stage Escalation</span>
              </div>
              <p className="text-xs text-zinc-400 leading-normal">
                Modulates tone across 5 progressive stages from courteous reminders to executive demand notices.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0e0f11] border border-white/[0.08] space-y-1.5 hover:border-white/[0.16] transition-colors">
              <div className="flex items-center gap-2 text-white font-semibold text-sm">
                <Zap className="w-4 h-4 text-[#b7d2f8] shrink-0" />
                <span>Instant Dispute Triage</span>
              </div>
              <p className="text-xs text-zinc-400 leading-normal">
                Detects billing questions immediately and freezes dunning cadences to protect sensitive buyer relationships.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0e0f11] border border-white/[0.08] space-y-1.5 hover:border-white/[0.16] transition-colors">
              <div className="flex items-center gap-2 text-white font-semibold text-sm">
                <CreditCard className="w-4 h-4 text-[#b7d2f8] shrink-0" />
                <span>Zero-Login Settle</span>
              </div>
              <p className="text-xs text-zinc-400 leading-normal">
                One-click tokenized payment links let buyers settle in 30 seconds via bank transfer, card, or ACH without passwords.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0e0f11] border border-white/[0.08] space-y-1.5 hover:border-white/[0.16] transition-colors">
              <div className="flex items-center gap-2 text-white font-semibold text-sm">
                <TrendingDown className="w-4 h-4 text-[#b7d2f8] shrink-0" />
                <span>Installment Plans</span>
              </div>
              <p className="text-xs text-zinc-400 leading-normal">
                Self-service 2x, 3x, or 4x installments turn default risks into predictable incoming cash flow.
              </p>
            </div>
          </div>
        </header>

        {/* Directory Section: Search, Filters & Playbook Cards */}
        <section className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-white/[0.08] mb-5">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-1">
                Industry Collection Blueprints
              </h2>
              <p className="text-sm text-zinc-400">
                Select your industry to review tailored dunning psychology, dispute resolution patterns, and DSO benchmarks.
              </p>
            </div>

            {/* Keyword Search Input */}
            <div className="relative min-w-[260px]">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by industry or bottleneck..."
                className="w-full bg-[#0e0f11] border border-white/[0.1] rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 mb-6">
            {[
              { id: "all", label: `All Industries (${INDUSTRIES.length})` },
              { id: "saas", label: "SaaS & Tech" },
              { id: "agencies", label: "Agencies & Creative" },
              { id: "consulting", label: "Professional Services" },
              { id: "manufacturing", label: "Manufacturing" },
              { id: "freight", label: "Freight & 3PL" },
              { id: "wholesale", label: "Wholesale Trade" },
              { id: "staffing", label: "Staffing & Payroll" },
              { id: "construction", label: "Commercial Contractors" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedCategory === cat.id
                    ? "bg-white text-zinc-950 font-semibold shadow-sm"
                    : "bg-[#0e0f11] text-zinc-400 hover:text-white border border-white/[0.08]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Playbook Cards Grid */}
          <div className="grid grid-cols-1 gap-4">
            {filteredIndustries.map((ind) => {
              const Icon = ind.icon;
              return (
                <div
                  key={ind.id}
                  className="p-5 sm:p-6 rounded-xl bg-[#0e0f11] border border-white/[0.08] hover:border-white/[0.18] transition-all shadow-md group"
                >
                  {/* Top Bar: Identity & Meta */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-white/[0.06]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#b7d2f8] shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-[#b7d2f8] transition-colors">
                            {ind.name}
                          </h3>
                        </div>
                        <p className="text-xs text-zinc-400 font-mono mt-0.5">
                          Standard Terms: {ind.paymentTerms}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="px-2.5 py-1 rounded bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-zinc-400 hidden sm:inline-block">
                        {ind.workflowFocus}
                      </span>
                      <Link
                        to={ind.url}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white text-zinc-200 hover:text-zinc-950 border border-white/[0.1] text-xs font-semibold transition-all group-hover:border-white/30 shadow-sm"
                      >
                        <span>Read Playbook</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </div>
                  </div>

                  {/* 2-Column Content: Left for Challenge, Right for Workflow */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    <div className="lg:col-span-6 space-y-3">
                      <div>
                        <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 block font-semibold mb-1">
                          The Core Collection Challenge:
                        </span>
                        <p className="text-sm text-zinc-300 leading-relaxed">
                          {ind.collectionChallenge}
                        </p>
                      </div>

                      <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] text-xs text-[#b7d2f8] italic">
                        "{ind.highlight}"
                      </div>

                      <div className="pt-1">
                        <Link
                          to={ind.url}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-white hover:text-[#b7d2f8] transition-colors group-hover:translate-x-1"
                        >
                          <span>Explore Full {ind.name.split("&")[0].trim()} Playbook</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>

                    <div className="lg:col-span-6 space-y-2">
                      <span className="text-xs font-mono uppercase tracking-wider text-[#b7d2f8] block font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#b7d2f8]" />
                        <span>Autonomous Jaktra Workflow:</span>
                      </span>
                      <ul className="space-y-2">
                        {ind.howJaktraSolves.map((pt, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-200 leading-normal">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#b7d2f8] shrink-0 mt-1.5" />
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
            <div className="py-12 text-center border border-white/[0.08] rounded-xl bg-[#0e0f11]">
              <p className="text-zinc-400 text-sm mb-3">No industry playbooks match your search query.</p>
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
        </section>

        {/* FAQs Section */}
        <section className="border border-white/[0.08] rounded-xl bg-[#0e0f11] p-5 sm:p-7 mb-12 shadow-lg">
          <div className="max-w-2xl mb-5">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-1">
              Frequently Asked Questions
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
              Clear Answers on Autonomous Collections
            </h2>
            <p className="text-sm text-zinc-400 leading-normal">
              How Jaktra safeguards client relationships, detects disputed invoices, and connects with your existing accounting stack.
            </p>
          </div>

          <Accordion type="single" variant="outline" defaultValue="faq-0" collapsible className="w-full">
            {FAQS.map((faq, idx) => (
              <AccordionItem key={idx} value={`faq-${idx}`} className="border-b border-white/[0.08] py-1">
                <AccordionTrigger className="text-left font-semibold text-white text-base hover:no-underline hover:text-[#b7d2f8] transition-colors py-3">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-zinc-300 text-sm leading-relaxed pb-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* Bottom CTA */}
        <section className="border border-white/[0.08] rounded-xl bg-[#0e0f11] p-6 sm:p-8 text-center relative shadow-lg">
          <div className="max-w-2xl mx-auto space-y-4">
            <span className="text-xs font-mono uppercase tracking-wider text-[#b7d2f8] font-semibold block">
              Zero Risk · 100% Free During Early Access
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Ready to Accelerate Your Accounts Receivable?
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed">
              Connect QuickBooks, Xero, or Stripe in under 15 minutes. Stop losing days to manual collections and release working capital immediately.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                to="/register"
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-white text-zinc-950 font-semibold text-xs sm:text-sm hover:bg-zinc-200 transition-colors shadow-sm"
              >
                Start Free Early Access
              </Link>
              <Link
                to="/compare"
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white font-medium text-xs sm:text-sm hover:bg-white/[0.08] transition-colors"
              >
                Explore Software Comparisons
              </Link>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}

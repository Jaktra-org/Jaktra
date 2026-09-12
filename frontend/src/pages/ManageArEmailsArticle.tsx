import { Link } from "react-router-dom";
import {
  Clock,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Sparkles,
  User,
  Calendar,
  Layers,
  AlertCircle,
  ShieldCheck,
  Server,
  ArrowRight,
} from "lucide-react";
import jaktraLogo from "../assets/jaktra_svg.svg";
import { SEOHead } from "../components/common/SEOHead";
import { manageArEmailsSchema, breadcrumbSchema } from "../components/common/seo-schemas";
import { LandingFooter } from "../components/landing/LandingFooter";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

function HeaderNav() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-[#0a0a0b]/90 backdrop-blur-md border-b border-white/[0.08]">
      <div className="max-w-6xl mx-auto h-full px-6 flex items-center justify-between">
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
          <Link to="/use-cases" className="text-sm text-zinc-400 hover:text-white transition-colors hidden sm:block">
            Use Cases
          </Link>
          <Link to="/compare" className="text-sm text-zinc-400 hover:text-white transition-colors hidden sm:block">
            Compare
          </Link>
          <Link to="/resources" className="text-sm text-zinc-400 hover:text-white transition-colors hidden sm:block">
            Resources
          </Link>
          <Link to="/login" className="text-sm text-zinc-300 hover:text-white transition-colors">
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

const FAQS = [
  {
    q: "Should our finance team use a Google Group or a licensed Google Workspace user for ar@company.com?",
    a: "Google Groups with 'Collaborative Inbox' enabled is free (does not consume a paid Google Workspace seat) and supports topic assignments and basic status tags. However, if your team needs to send emails that look like individual 1-on-1 personal replies, ensure 'Post as the group' or Send-As aliases are configured with matching SPF and DKIM records, or deliverability to corporate AP filters will drop.",
  },
  {
    q: "In Microsoft 365, what permissions are required for an AR shared mailbox?",
    a: "Create an M365 Shared Mailbox (which does not require an Exchange Online license under 50GB storage). Grant your AR team members both 'Read and manage' (Full Access) and 'Send As' permissions. In the Exchange Admin Center, enable 'Copy items sent as this mailbox' so replies sent by any team member appear in the shared Sent Items folder rather than their personal mailbox.",
  },
  {
    q: "How do you prevent two finance specialists from responding to the same debtor inquiry simultaneously?",
    a: "Without automated software, manual inboxes require a strict 'claim-before-reply' protocol. In Gmail, specialists apply their personal initials label (e.g., `Owner/SK`) before drafting. In Outlook, assign a color category corresponding to the team member. When message volume exceeds 40 inquiries daily, manual tagging invariably breaks down, leading to duplicate customer emails and contradictory payment instructions.",
  },
  {
    q: "Why do standard customer service helpdesks like Zendesk fail for AR teams?",
    a: "Ticketing systems assign visible ticket numbers (e.g., 'Ticket #48291: Re: Invoice 1042') in subject lines, signaling to corporate buyers that they are dealing with an impersonal support queue rather than their dedicated account contact. More critically, helpdesk tools do not connect with ERP ledgers, cannot check invoice aging balances, and cannot automatically halt dunning email schedules when a debtor raises a dispute.",
  },
  {
    q: "How does Jaktra eliminate shared inbox clutter entirely?",
    a: "Rather than asking finance teams to manually sort incoming emails into folders, Jaktra provides tokenized debtor portals (/i/:token) in every communication. Debtors independently inspect line items, download official tax invoices, and settle via Razorpay UPI or cards without emailing your team. Inbound queries are triaged by NLP sentiment analysis, which freezes dunning cadences and drafts verified responses automatically.",
  },
];

export default function ManageArEmailsArticle() {
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white font-sans antialiased selection:bg-white/20 selection:text-white">
      <SEOHead
        title="How to Set Up an Accounts Receivable Shared Inbox in Gmail & Outlook (SLA Matrix & Label Architecture)"
        description="A step-by-step IT and finance guide to configuring an AR shared mailbox in Google Workspace and Microsoft 365, establishing a 4-tier triage label architecture, and preventing collision."
        canonicalPath="/resources/how-to-manage-accounts-receivable-emails"
        jsonLd={[
          manageArEmailsSchema,
          breadcrumbSchema([
            { name: "Resources", path: "/resources" },
            { name: "AR Shared Inbox Architecture", path: "/resources/how-to-manage-accounts-receivable-emails" },
          ]),
        ]}
      />

      <HeaderNav />

      <main className="pt-24 pb-20 px-4 sm:px-6 max-w-4xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-zinc-400">
          <Link to="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <Link to="/resources" className="hover:text-white transition-colors">
            Resources
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-zinc-200">AR Shared Inbox Architecture</span>
        </nav>

        {/* Article Header */}
        <header className="mb-10 pb-8 border-b border-white/[0.08]">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-mono font-medium text-blue-300 mb-4">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>IT &amp; Finance Operations Guide</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            How to Set Up an Accounts Receivable Shared Inbox in Gmail &amp; Outlook (SLA Matrix &amp; Label Architecture)
          </h1>

          <p className="text-lg sm:text-xl text-zinc-300 leading-relaxed mb-6 font-normal">
            When customer billing inquiries arrive at <code className="text-[#b7d2f8] bg-white/[0.06] px-1.5 py-0.5 rounded font-mono text-sm">ar@company.com</code> or <code className="text-[#b7d2f8] bg-white/[0.06] px-1.5 py-0.5 rounded font-mono text-sm">billing@company.com</code>, lack of structure causes duplicate outreach, missed pay run deadlines, and customer disputes. Here is the exact operational framework to configure your mailbox, build a 4-tier triage hierarchy, and enforce a 4-hour SLA.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-zinc-400" /> Jaktra AR Architecture Team
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" /> Updated September 2026
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-zinc-400" /> 10 min read
            </span>
          </div>
        </header>

        {/* Article Body Content */}
        <article className="space-y-12 text-base leading-relaxed text-zinc-300">
          {/* Section 1: Mailbox Setup Architecture */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2.5">
              <Server className="w-6 h-6 text-[#b7d2f8]" />
              <span>1. Mailbox Infrastructure: Google Workspace vs. Microsoft 365 Setup</span>
            </h2>
            <p className="mb-4">
              Receivables management requires a central point of contact rather than individual employee addresses (<code className="text-xs font-mono bg-white/[0.05] px-1.5 py-0.5 rounded">john@company.com</code>). When collectors take PTO or transition roles, customer audit trails vanish. However, misconfigured shared mailboxes introduce security, collision, and deliverability vulnerabilities.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
              {/* Google Workspace Setup */}
              <div className="p-6 rounded-2xl bg-[#111113] border border-white/[0.08]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-bold text-white">Google Workspace Setup</h3>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">Collaborative Inbox</span>
                </div>
                <p className="text-xs text-zinc-400 mb-4">
                  Recommended for teams on Google Workspace without paying for dedicated standalone licenses:
                </p>
                <ul className="space-y-2.5 text-xs text-zinc-300">
                  <li className="flex items-start gap-2">
                    <span className="text-[#b7d2f8] font-bold font-mono">01</span>
                    <span>Create a Google Group at <strong>ar@yourcompany.com</strong> with <em>Collaborative Inbox</em> enabled in Group Settings.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#b7d2f8] font-bold font-mono">02</span>
                    <span>Set Permissions: <em>Who can post</em> = <strong>Public</strong> (to receive inbound vendor and customer emails).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#b7d2f8] font-bold font-mono">03</span>
                    <span>Set <em>Who can view conversations</em> = <strong>Group Members only</strong> for financial privacy.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#b7d2f8] font-bold font-mono">04</span>
                    <span>Configure Send-As in personal Gmail accounts: In personal Gmail Settings &gt; Accounts &gt; <em>Add another email address</em>, add <code className="font-mono">ar@yourcompany.com</code>. Ensure <strong>Treat as an alias</strong> is selected.</span>
                  </li>
                </ul>
              </div>

              {/* Microsoft 365 Setup */}
              <div className="p-6 rounded-2xl bg-[#111113] border border-white/[0.08]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-bold text-white">Microsoft 365 (Exchange) Setup</h3>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">Shared Mailbox</span>
                </div>
                <p className="text-xs text-zinc-400 mb-4">
                  Standard enterprise architecture for Microsoft Exchange environments:
                </p>
                <ul className="space-y-2.5 text-xs text-zinc-300">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold font-mono">01</span>
                    <span>Navigate to <strong>Microsoft 365 Admin Center</strong> &gt; Teams &amp; Groups &gt; <em>Shared mailboxes</em> &gt; <em>Add a shared mailbox</em>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold font-mono">02</span>
                    <span>Name the mailbox <code className="font-mono">Accounts Receivable</code> with email <code className="font-mono">ar@yourcompany.com</code> (Free up to 50 GB).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold font-mono">03</span>
                    <span>Assign Members: In mailbox settings, add AR staff under both <strong>Read and manage permissions</strong> and <strong>Send as permissions</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold font-mono">04</span>
                    <span>CRITICAL SETTING: In Exchange Admin Center, check <strong>Copy items sent as this mailbox</strong> and <strong>Copy items sent on behalf of this mailbox</strong> to avoid audit silos.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs sm:text-sm text-amber-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white mb-1">DKIM and SPF Alignment Requirement:</p>
                <p>
                  If collectors send emails from their individual inbox while spoofing <code className="font-mono">ar@yourcompany.com</code> via a custom 'From' header without DKIM signing for the root domain, corporate spam filters (e.g., Proofpoint, Mimecast) will reject or quarantine billing communications. Ensure your domain’s SPF TXT record includes <code className="font-mono">include:_spf.google.com</code> or <code className="font-mono">include:spf.protection.outlook.com</code>.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2: 4-Tier Label Architecture */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2.5">
              <Layers className="w-6 h-6 text-[#b7d2f8]" />
              <span>2. The 4-Tier AR Label &amp; Folder Taxonomy</span>
            </h2>
            <p className="mb-4">
              Unstructured inboxes default to chaotic sorting by date received. When 200 emails arrive each week, high-priority issues (like a dispute holding up a $50,000 payment) get buried beneath routine vendor onboarding confirmations. Implement this standardized 4-tier lifecycle folder structure:
            </p>

            <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#111113] shadow-sm mb-6">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-white/[0.03] text-xs font-mono uppercase tracking-wider text-zinc-300">
                    <th className="py-3 px-4 font-semibold">Tier / Label Name</th>
                    <th className="py-3 px-4 font-semibold">Color Code</th>
                    <th className="py-3 px-4 font-semibold">Purpose &amp; Criteria</th>
                    <th className="py-3 px-4 font-semibold">Target SLA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] text-zinc-300">
                  <tr className="hover:bg-white/[0.015]">
                    <td className="py-3 px-4 font-mono font-medium text-white">01-Triage / New</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-700/50 text-zinc-200 border border-zinc-600/50 text-xs">
                        Grey / Unmarked
                      </span>
                    </td>
                    <td className="py-3 px-4">Inbound message arrived; no team member has assumed ownership or classified intent.</td>
                    <td className="py-3 px-4 font-mono text-zinc-400">&lt; 30 mins</td>
                  </tr>
                  <tr className="hover:bg-white/[0.015]">
                    <td className="py-3 px-4 font-mono font-medium text-white">02-Pending-Internal</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs">
                        Amber / Orange
                      </span>
                    </td>
                    <td className="py-3 px-4">Waiting on internal input (e.g. Sales confirmation on custom discount, Operations proof of delivery, Tax team W-9 signature).</td>
                    <td className="py-3 px-4 font-mono text-zinc-400">&lt; 8 hours</td>
                  </tr>
                  <tr className="hover:bg-white/[0.015]">
                    <td className="py-3 px-4 font-mono font-medium text-white">03-Awaiting-Debtor</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 text-xs">
                        Blue
                      </span>
                    </td>
                    <td className="py-3 px-4">Reply dispatched with payment link, invoice PDF, or banking details. Awaiting client's pay run execution.</td>
                    <td className="py-3 px-4 font-mono text-zinc-400">48h check</td>
                  </tr>
                  <tr className="hover:bg-white/[0.015]">
                    <td className="py-3 px-4 font-mono font-medium text-white">04-Resolved / Closed</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs">
                        Green
                      </span>
                    </td>
                    <td className="py-3 px-4">Payment reconciled via bank statement, dispute resolved with credit memo, or installment plan contracted.</td>
                    <td className="py-3 px-4 font-mono text-zinc-400">Archived</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-xs text-zinc-400">
              In addition to lifecycle tiers, maintain two urgent cross-cutting labels: <code className="font-mono text-rose-400 bg-rose-500/10 px-1 py-0.5 rounded border border-rose-500/20">@Dispute-Hold</code> (instantly halts any external dunning automations) and <code className="font-mono text-purple-400 bg-purple-500/10 px-1 py-0.5 rounded border border-purple-500/20">@High-Exposure (&gt;$25k)</code> (mandates Controller oversight).
            </p>
          </section>

          {/* Section 3: SLA Matrix */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2.5">
              <Clock className="w-6 h-6 text-[#b7d2f8]" />
              <span>3. The AR Inquiry SLA Response Matrix</span>
            </h2>
            <p className="mb-4">
              Corporate Accounts Payable departments run weekly batch payment processing cutoffs (typically Tuesday 5:00 PM for Thursday ACH settlement). If a debtor's routine document inquiry lingers in your shared inbox for 24 hours, the invoice misses the cutoff, adding a full 7 to 14 days to your Days Sales Outstanding (DSO).
            </p>

            <div className="space-y-4 my-6">
              <div className="p-4 rounded-xl bg-[#111113] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-rose-500/10 text-rose-300 border border-rose-500/20">Priority 1</span>
                    <h3 className="text-sm font-semibold text-white">Missing Invoice PDF / W-9 / Banking Verification</h3>
                  </div>
                  <p className="text-xs text-zinc-400">Clerical blockers preventing the AP clerk from keying the voucher into their ERP system.</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-mono font-bold text-emerald-400">SLA: &lt; 2 Hours</div>
                  <div className="text-[11px] text-zinc-500">Same Business Day Cutoff</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#111113] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">Priority 2</span>
                    <h3 className="text-sm font-semibold text-white">Payment Confirmation / Remittance Advice Dispatched</h3>
                  </div>
                  <p className="text-xs text-zinc-400">Debtor shares UTR number, ACH trace, or check remittance advice.</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-mono font-bold text-amber-400">SLA: &lt; 4 Hours</div>
                  <div className="text-[11px] text-zinc-500">Bank Reconciliation Match</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#111113] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-blue-500/10 text-blue-300 border border-blue-500/20">Priority 3</span>
                    <h3 className="text-sm font-semibold text-white">PO Discrepancy or Quantity/Pricing Query</h3>
                  </div>
                  <p className="text-xs text-zinc-400">Customer flags mismatch between purchase order lines and invoice charges.</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-mono font-bold text-blue-400">SLA: &lt; 8 Hours</div>
                  <div className="text-[11px] text-zinc-500">Routing to Account Exec</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#111113] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">Priority 4</span>
                    <h3 className="text-sm font-semibold text-white">Formal Dispute / Legal Notice / Insolvency Claim</h3>
                  </div>
                  <p className="text-xs text-zinc-400">Customer formally rejects liability or signals restructuring/legal intervention.</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-mono font-bold text-rose-400">SLA: Immediate Pause</div>
                  <div className="text-[11px] text-zinc-500">Escalate to Legal/CFO</div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Collision Prevention Protocols */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2.5">
              <ShieldCheck className="w-6 h-6 text-[#b7d2f8]" />
              <span>4. Collision Prevention &amp; Team Ownership Protocols</span>
            </h2>
            <p className="mb-4">
              The single biggest failure point of shared inboxes is <strong>agent collision</strong>: two collectors open the same email simultaneously, draft two conflicting replies, or both assume the other is handling it, leaving the email abandoned.
            </p>

            <div className="p-6 rounded-2xl bg-[#111113] border border-white/[0.08] space-y-4">
              <h3 className="text-base font-bold text-white">The Three Rules of AR Mailbox Governance</h3>
              <div className="space-y-3 text-xs sm:text-sm text-zinc-300">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center font-mono text-xs text-[#b7d2f8] shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <strong className="text-white">Rule of Single Assignment:</strong> An email thread in <code className="text-xs font-mono bg-white/[0.05] px-1 py-0.5 rounded">01-Triage</code> must be assigned to an individual collector's initials label (e.g., <code className="text-xs font-mono bg-white/[0.05] px-1 py-0.5 rounded">Owner/Alex</code>) before any reply draft is opened.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center font-mono text-xs text-[#b7d2f8] shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <strong className="text-white">Mandatory Cadence Freeze:</strong> If an inbound query involves a dispute or payment promise, the collector must immediately mark the account on hold in your dunning tool. Automated dunning must never send a past-due threat while an inbound email is under review.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center font-mono text-xs text-[#b7d2f8] shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <strong className="text-white">The 250-Account Breaking Point:</strong> Manual mailbox labeling works smoothly up to approximately 250 active overdue customer accounts. Beyond this threshold, manual labeling degrades, response times exceed the 4-hour SLA, and finance teams require programmatic triage.
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: How Jaktra Automates Shared Inboxes */}
          <section className="p-8 rounded-2xl bg-gradient-to-b from-white/[0.04] to-transparent border border-white/[0.08] relative overflow-hidden">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-medium text-blue-300 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Programmatic Receivables Automation</span>
            </div>

            <h2 className="text-2xl font-bold text-white mb-3">
              How Jaktra Replaces Manual Shared Inbox Triage
            </h2>

            <p className="text-sm text-zinc-300 leading-relaxed mb-4">
              Instead of hiring additional credit controllers to manually tag emails in Outlook or Gmail, high-growth finance teams use Jaktra to eliminate shared inbox chaos at the architectural layer:
            </p>

            <div className="p-5 rounded-xl bg-black/40 border border-white/[0.06] mb-6">
              <ul className="space-y-3 text-xs sm:text-sm text-zinc-300">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#b7d2f8] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Tokenized Zero-Login Debtor Portals (<code className="text-xs font-mono text-[#b7d2f8]">/i/:token</code>):</strong> Every automated reminder embeds a cryptographic self-service link. Corporate AP clerks instantly view statements, download original invoice PDFs, and settle via Razorpay (UPI, NetBanking, Cards)—eliminating over 70% of routine inbound email requests before they are ever sent.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#b7d2f8] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Autonomous NLP Sentiment Triage:</strong> When a customer does reply to an outreach email, Jaktra’s NLP model categorizes the intent into Dispute, Inquiry, or Payment Promise within seconds.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#b7d2f8] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Automated Cadence Freezing:</strong> The instant a dispute or billing question is detected, Jaktra automatically suspends upcoming reminder escalations on that invoice, preventing awkward collection harassment.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#b7d2f8] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Instant Webhook Ledger Reconciliation:</strong> When payment clears via the debtor portal, webhook signatures are verified (HMAC-SHA256), invoices are marked paid, and the inquiry thread closes automatically.
                  </span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-white text-zinc-950 font-semibold text-xs hover:bg-zinc-200 transition-colors shadow-sm text-center"
              >
                Start Free with Jaktra
              </Link>
              <Link
                to="/features/zero-login-portal"
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white font-medium text-xs hover:bg-white/[0.08] transition-colors flex items-center justify-center gap-2"
              >
                <span>Explore Zero-Login Debtor Portal</span>
                <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
              </Link>
            </div>
          </section>

          {/* Cross-Link to Template Resource */}
          <section className="p-6 rounded-2xl bg-[#111113] border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-[#b7d2f8] mb-1">Related Resource</div>
              <h3 className="text-base font-bold text-white">Looking for word-for-word debtor response scripts?</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Read our dedicated guide on AR Query Management with 5 production-ready response templates for disputes, short-payments, and W-9 requests.
              </p>
            </div>
            <Link
              to="/resources/accounts-receivable-query-management"
              className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-xs font-semibold text-white transition-colors"
            >
              <span>View Response Templates</span>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
            </Link>
          </section>

          {/* FAQs */}
          <section className="pt-6">
            <h2 className="text-2xl font-bold text-white mb-6">
              Frequently Asked Questions: AR Shared Mailbox Operations
            </h2>
            <Accordion type="single" variant="outline" defaultValue="faq-0" collapsible className="w-full">
              {FAQS.map((faq, idx) => (
                <AccordionItem key={idx} value={`faq-${idx}`}>
                  <AccordionTrigger className="text-left font-medium text-white text-base">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-zinc-400 text-sm leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        </article>
      </main>

      <LandingFooter />
    </div>
  );
}

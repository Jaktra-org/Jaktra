import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Copy,
  Check,
  Webhook,
  Mail,
  FileSpreadsheet,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import jaktraLogo from "../assets/jaktra_svg.svg";
import { SEOHead } from "../components/common/SEOHead";
import { breadcrumbSchema } from "../components/common/seo-schemas";
import { LandingFooter } from "../components/landing/LandingFooter";

function HeaderNav() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-[#0a0a0b]/90 backdrop-blur-md border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 text-decoration-none">
          <img src={jaktraLogo} alt="Jaktra" width={24} height={24} className="h-6 w-6 block" />
          <span className="font-semibold text-white text-lg tracking-tight font-sans">Jaktra Docs</span>
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

function CodeBlock({ code, language, id }: { code: string; language: string; id: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-4 rounded-lg overflow-hidden border border-white/[0.08] bg-zinc-950/80 font-mono text-xs">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06] bg-white/[0.02]">
        <span className="text-zinc-400 font-medium uppercase tracking-wider">{language}</span>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors py-1 px-2 rounded bg-white/[0.04]"
          aria-label={`Copy ${id} code`}
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? "Copied!" : "Copy"}</span>
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-zinc-300 leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

const docsSchema = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": "Jaktra Technical Documentation & Integration Guide",
  "description": "Complete technical reference for Jaktra accounts receivable automation: API specifications, Razorpay webhook signature verification, CSV schema, and email deliverability setup.",
  "articleSection": "Developer Documentation",
  "author": {
    "@type": "Organization",
    "name": "Jaktra Engineering"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Jaktra",
    "url": "https://jaktra.site",
    "logo": "https://jaktra.site/assets/jaktra_svg.svg"
  }
};

export function DocsMock() {
  const nodeHmacCode = `import crypto from 'crypto';
import express from 'express';

const app = express();
app.use(express.json());

app.post('/api/webhooks/razorpay', (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];

  // Compute expected HMAC SHA-256 signature over raw request body
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (expectedSignature !== signature) {
    return res.status(400).json({ error: 'Invalid webhook signature' });
  }

  const { event, payload } = req.body;

  if (event === 'payment.captured') {
    const payment = payload.payment.entity;
    const invoiceNumber = payment.notes?.invoice_number;
    
    // Notify Jaktra to immediately halt dunning cadences and reconcile ledger
    console.log(\`Payment captured for invoice \${invoiceNumber}: \${payment.amount / 100} \${payment.currency}\`);
  }

  res.status(200).json({ status: 'ok' });
});`;

  const pythonHmacCode = `import hmac
import hashlib
import json
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/api/webhooks/razorpay', methods=['POST'])
def handle_razorpay_webhook():
    secret = "your_webhook_secret_key"
    received_signature = request.headers.get('X-Razorpay-Signature')
    payload_body = request.get_data()

    # Compute expected HMAC signature
    computed_signature = hmac.new(
        key=secret.encode('utf-8'),
        msg=payload_body,
        digestmod=hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(received_signature, computed_signature):
        return jsonify({"error": "Invalid signature verification"}), 400

    data = json.loads(payload_body.decode('utf-8'))
    event = data.get('event')

    if event == 'payment.captured':
        payment_entity = data['payload']['payment']['entity']
        invoice_id = payment_entity.get('notes', {}).get('invoice_number')
        print(f"Settled invoice {invoice_id} for amount {payment_entity['amount']}")

    return jsonify({"status": "received"}), 200`;

  const csvSample = `invoice_number,client_name,client_email,amount,currency,due_date,issue_date,po_number
INV-2026-001,Acme Logistics Corp,ap@acmelogistics.com,14500.00,USD,2026-09-30,2026-08-31,PO-88219
INV-2026-002,Global Freight Inc,billing@globalfreight.com,8250.50,USD,2026-09-15,2026-08-15,PO-94102
INV-2026-003,Starlight Media LLC,finance@starlight.io,4200.00,EUR,2026-10-05,2026-09-05,SOW-441`;

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#f5f5f5] font-sans selection:bg-[#b7d2f8]/20 selection:text-white antialiased">
      <SEOHead
        title="Jaktra Technical Documentation — Integration, Webhooks & API Reference"
        description="Comprehensive technical documentation for Jaktra accounts receivable automation. Setup guides for SendGrid/Resend SMTP, Razorpay webhook HMAC verification, CSV invoice schemas, and AI dunning configuration."
        canonicalPath="/docs"
        jsonLd={[
          docsSchema,
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Documentation", path: "/docs" },
          ]),
        ]}
      />

      <HeaderNav />

      <main className="pt-24 pb-20 px-4 sm:px-6 max-w-7xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-8 text-xs text-zinc-500">
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

        {/* Page Header */}
        <div className="mb-14 border-b border-white/[0.08] pb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-300 text-xs font-mono font-medium mb-4">
            <BookOpen className="w-3.5 h-3.5" />
            <span>DEVELOPER REFERENCE · V2.4</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Technical Documentation & Setup Guides
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 max-w-3xl leading-relaxed">
            Everything engineering and finance teams need to integrate Jaktra: connecting email providers with verified deliverability rails, securing inbound payment webhooks with HMAC-SHA256, formatting CSV invoice batches, and tuning autonomous AI escalation models.
          </p>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Quick Index Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-2 text-sm border-l border-white/[0.08] pl-4">
              <span className="text-xs uppercase tracking-wider text-zinc-500 font-mono font-semibold block mb-3">
                Documentation Index
              </span>
              <a href="#quickstart" className="block text-zinc-400 hover:text-white py-1 transition-colors">
                1. Quickstart Architecture
              </a>
              <a href="#email-providers" className="block text-zinc-400 hover:text-white py-1 transition-colors">
                2. Email Provider Setup (SendGrid/Resend)
              </a>
              <a href="#webhooks" className="block text-zinc-400 hover:text-white py-1 transition-colors">
                3. Webhook HMAC-SHA256 Verification
              </a>
              <a href="#csv-schema" className="block text-zinc-400 hover:text-white py-1 transition-colors">
                4. CSV Batch Ingestion Schema
              </a>
              <a href="#cadence-config" className="block text-zinc-400 hover:text-white py-1 transition-colors">
                5. 5-Stage Cadence Parameters
              </a>
              <a href="#dlq-errors" className="block text-zinc-400 hover:text-white py-1 transition-colors">
                6. Error Codes & DLQ Circuit Breakers
              </a>
            </div>
          </aside>

          {/* Documentation Content Area */}
          <div className="lg:col-span-3 space-y-16">
            {/* Section 1: Quickstart */}
            <section id="quickstart" className="scroll-mt-24 space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-md bg-white/[0.05] border border-white/[0.1] text-xs font-mono font-bold flex items-center justify-center text-[#b7d2f8]">
                  01
                </span>
                <h2 className="text-2xl font-semibold text-white">Quickstart Architecture</h2>
              </div>
              <p className="text-zinc-400 leading-relaxed">
                Jaktra operates as an autonomous accounts receivable orchestration layer between your accounting records and your customers' AP teams. Integrating Jaktra involves three core components:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl border border-white/[0.08] bg-zinc-900/40">
                  <div className="flex items-center gap-2 text-white font-medium text-sm mb-1.5">
                    <Mail className="w-4 h-4 text-blue-400" />
                    <span>1. Outbound Relay</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Connect SendGrid, Resend, or custom SMTP to send emails from your authentic business domain with verified SPF and DKIM.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.08] bg-zinc-900/40">
                  <div className="flex items-center gap-2 text-white font-medium text-sm mb-1.5">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    <span>2. Ingestion Engine</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Sync receivables data via structured CSV batch uploads or REST endpoints with automated idempotency deduplication.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.08] bg-zinc-900/40">
                  <div className="flex items-center gap-2 text-white font-medium text-sm mb-1.5">
                    <Webhook className="w-4 h-4 text-amber-400" />
                    <span>3. Settlement Webhooks</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Verify incoming Razorpay or bank payment webhooks to immediately halt automated dunning when an invoice is remitted.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 2: Email Deliverability */}
            <section id="email-providers" className="scroll-mt-24 space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-md bg-white/[0.05] border border-white/[0.1] text-xs font-mono font-bold flex items-center justify-center text-[#b7d2f8]">
                  02
                </span>
                <h2 className="text-2xl font-semibold text-white">Email Deliverability & Provider Setup</h2>
              </div>
              <p className="text-zinc-400 leading-relaxed">
                To ensure collection communications reach corporate CFO and AP inboxes rather than promotional spam folders, Jaktra sends exclusively via dedicated API relays configured with authenticated domain signatures.
              </p>
              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-semibold text-zinc-200">Required DNS Records for High-Deliverability Dunning</h3>
                <div className="overflow-x-auto rounded-lg border border-white/[0.08]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-white/[0.03] border-b border-white/[0.08] text-zinc-400">
                      <tr>
                        <th className="p-3">Record Type</th>
                        <th className="p-3">Host / Name</th>
                        <th className="p-3">Value / Target</th>
                        <th className="p-3">Purpose</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.06] text-zinc-300 font-mono">
                      <tr>
                        <td className="p-3 text-blue-300 font-bold">TXT</td>
                        <td className="p-3">@</td>
                        <td className="p-3">v=spf1 include:sendgrid.net ~all</td>
                        <td className="p-3 font-sans text-zinc-400">SPF sender authorization</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-blue-300 font-bold">CNAME</td>
                        <td className="p-3">s1._domainkey</td>
                        <td className="p-3">s1.domainkey.u19283.sendgrid.net</td>
                        <td className="p-3 font-sans text-zinc-400">2048-bit DKIM cryptographic signature</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-blue-300 font-bold">TXT</td>
                        <td className="p-3">_dmarc</td>
                        <td className="p-3">v=DMARC1; p=quarantine; pct=100</td>
                        <td className="p-3 font-sans text-zinc-400">DMARC policy enforcement</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Section 3: Webhooks */}
            <section id="webhooks" className="scroll-mt-24 space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-md bg-white/[0.05] border border-white/[0.1] text-xs font-mono font-bold flex items-center justify-center text-[#b7d2f8]">
                  03
                </span>
                <h2 className="text-2xl font-semibold text-white">Webhook HMAC-SHA256 Verification</h2>
              </div>
              <p className="text-zinc-400 leading-relaxed">
                When debtors remit payments via the zero-login payment link (`/i/:token`) or settle through Razorpay (UPI, NEFT/RTGS, Credit Card), webhooks are dispatched with cryptographic headers. Always compute the HMAC-SHA256 signature against your webhook secret before updating invoice records.
              </p>

              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-semibold text-zinc-200">Node.js (Express) Signature Verification</h3>
                <CodeBlock code={nodeHmacCode} language="javascript" id="node-hmac" />

                <h3 className="text-sm font-semibold text-zinc-200">Python (Flask / FastAPI) Signature Verification</h3>
                <CodeBlock code={pythonHmacCode} language="python" id="python-hmac" />
              </div>
            </section>

            {/* Section 4: CSV Batch Ingestion */}
            <section id="csv-schema" className="scroll-mt-24 space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-md bg-white/[0.05] border border-white/[0.1] text-xs font-mono font-bold flex items-center justify-center text-[#b7d2f8]">
                  04
                </span>
                <h2 className="text-2xl font-semibold text-white">CSV Batch Ingestion Schema</h2>
              </div>
              <p className="text-zinc-400 leading-relaxed">
                Jaktra accepts standard UTF-8 encoded CSV files exported from QuickBooks, Xero, NetSuite, or proprietary ERP systems. Uploaded files undergo schema validation and automatic duplicate key checking.
              </p>
              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-semibold text-zinc-200">Required CSV Column Specification</h3>
                <div className="overflow-x-auto rounded-lg border border-white/[0.08]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-white/[0.03] border-b border-white/[0.08] text-zinc-400">
                      <tr>
                        <th className="p-3">Column Name</th>
                        <th className="p-3">Data Type</th>
                        <th className="p-3">Required?</th>
                        <th className="p-3">Validation Rules & Example</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.06] text-zinc-300 font-mono">
                      <tr>
                        <td className="p-3 text-emerald-300 font-bold">invoice_number</td>
                        <td className="p-3">String</td>
                        <td className="p-3 text-amber-400 font-sans font-medium">Yes</td>
                        <td className="p-3 font-sans text-zinc-400">Unique alphanumeric key (e.g., INV-2026-042)</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-emerald-300 font-bold">client_name</td>
                        <td className="p-3">String</td>
                        <td className="p-3 text-amber-400 font-sans font-medium">Yes</td>
                        <td className="p-3 font-sans text-zinc-400">Debtor business or legal trade entity name</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-emerald-300 font-bold">client_email</td>
                        <td className="p-3">Email</td>
                        <td className="p-3 text-amber-400 font-sans font-medium">Yes</td>
                        <td className="p-3 font-sans text-zinc-400">Target AP inbox (e.g., ap@client.com)</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-emerald-300 font-bold">amount</td>
                        <td className="p-3">Decimal</td>
                        <td className="p-3 text-amber-400 font-sans font-medium">Yes</td>
                        <td className="p-3 font-sans text-zinc-400">Positive decimal without currency symbol (e.g., 14500.00)</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-emerald-300 font-bold">due_date</td>
                        <td className="p-3">Date</td>
                        <td className="p-3 text-amber-400 font-sans font-medium">Yes</td>
                        <td className="p-3 font-sans text-zinc-400">ISO 8601 format: YYYY-MM-DD (e.g., 2026-09-30)</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-emerald-300 font-bold">currency</td>
                        <td className="p-3">ISO Code</td>
                        <td className="p-3 text-zinc-400 font-sans">No (Default USD)</td>
                        <td className="p-3 font-sans text-zinc-400">3-letter ISO code: USD, EUR, GBP, INR, CAD</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-emerald-300 font-bold">po_number</td>
                        <td className="p-3">String</td>
                        <td className="p-3 text-zinc-400 font-sans">No</td>
                        <td className="p-3 font-sans text-zinc-400">Purchase Order reference to avoid clerical disputes</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3 className="text-sm font-semibold text-zinc-200 pt-2">Sample CSV Payload</h3>
                <CodeBlock code={csvSample} language="csv" id="csv-sample" />
              </div>
            </section>

            {/* Section 5: Cadence Config */}
            <section id="cadence-config" className="scroll-mt-24 space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-md bg-white/[0.05] border border-white/[0.1] text-xs font-mono font-bold flex items-center justify-center text-[#b7d2f8]">
                  05
                </span>
                <h2 className="text-2xl font-semibold text-white">5-Stage Autonomous Escalation Configuration</h2>
              </div>
              <p className="text-zinc-400 leading-relaxed">
                Jaktra uses Groq LLaMA 3.1 to modulate message wording across five progressive urgency tiers. Unlike static template engines, the agent references previous communication context, payment promise dates, and invoice aging dynamically.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl border border-white/[0.08] bg-zinc-900/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-blue-400 uppercase">Stage 1: Courtesy Verification</span>
                    <span className="text-[11px] font-mono text-zinc-500">Day -3 to Due</span>
                  </div>
                  <p className="text-xs text-zinc-300">
                    Friendly verification prompt attaching official invoice PDF and PO confirmation. Assumes goodwill and aims to catch clerical errors before maturity.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.08] bg-zinc-900/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-emerald-400 uppercase">Stage 2: Collaborative Reminder</span>
                    <span className="text-[11px] font-mono text-zinc-500">Days 1–7 Overdue</span>
                  </div>
                  <p className="text-xs text-zinc-300">
                    Gentle check-in providing 1-click tokenized payment portal link. Inquires if AP has queued payment in the upcoming disbursement batch.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.08] bg-zinc-900/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-400 uppercase">Stage 3: Commercial Urgency</span>
                    <span className="text-[11px] font-mono text-zinc-500">Days 8–14 Overdue</span>
                  </div>
                  <p className="text-xs text-zinc-300">
                    Direct outreach to AP management referencing agreed credit terms. Introduces self-service 2x/3x installment options via the portal.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.08] bg-zinc-900/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-orange-400 uppercase">Stage 4: Executive Escalation</span>
                    <span className="text-[11px] font-mono text-zinc-500">Days 15–30 Overdue</span>
                  </div>
                  <p className="text-xs text-zinc-300">
                    Formal escalation looping client CFO or commercial contact. Informs account lead of potential service pauses or account credit holds.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-red-500/25 bg-red-500/5 space-y-1.5 mt-4">
                <div className="flex items-center gap-2 text-red-300 font-semibold text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>Stage 5: Hardcoded Legal Stop (Day 31+ Overdue)</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  To prevent regulatory harassment violations and protect brand reputation, Jaktra hardcodes an automatic execution halt at 31 days overdue. No further automated communications are sent without manual executive override in the dashboard.
                </p>
              </div>
            </section>

            {/* Section 6: DLQ & Error Reference */}
            <section id="dlq-errors" className="scroll-mt-24 space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-md bg-white/[0.05] border border-white/[0.1] text-xs font-mono font-bold flex items-center justify-center text-[#b7d2f8]">
                  06
                </span>
                <h2 className="text-2xl font-semibold text-white">Error Codes & Dead Letter Queue (DLQ)</h2>
              </div>
              <p className="text-zinc-400 leading-relaxed">
                Jaktra implements a 3-drop Dead Letter Queue (DLQ) circuit breaker to isolate failed communications and prevent mailer blacklisting.
              </p>
              <div className="overflow-x-auto rounded-lg border border-white/[0.08]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/[0.03] border-b border-white/[0.08] text-zinc-400">
                    <tr>
                      <th className="p-3">HTTP / Code</th>
                      <th className="p-3">Error Classification</th>
                      <th className="p-3">System Action</th>
                      <th className="p-3">Resolution Procedure</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06] text-zinc-300 font-mono">
                    <tr>
                      <td className="p-3 text-red-300 font-bold">400_INVALID_SCHEMA</td>
                      <td className="p-3">Missing required CSV header</td>
                      <td className="p-3 font-sans text-zinc-400">Batch rejected</td>
                      <td className="p-3 font-sans text-zinc-400">Check CSV headers match specification in Section 04</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-red-300 font-bold">401_AUTH_EXPIRED</td>
                      <td className="p-3">Invalid SendGrid/Resend API key</td>
                      <td className="p-3 font-sans text-zinc-400">Cadence paused</td>
                      <td className="p-3 font-sans text-zinc-400">Re-authenticate API token in Settings → Integrations</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-red-300 font-bold">422_BOUNCE_DROPPED</td>
                      <td className="p-3">Permanent hard bounce (5xx)</td>
                      <td className="p-3 font-sans text-zinc-400">Moved to DLQ</td>
                      <td className="p-3 font-sans text-zinc-400">Update debtor email address and click 'Retry' in DLQ tab</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-red-300 font-bold">429_RATE_EXCEEDED</td>
                      <td className="p-3">Provider outbound throughput limit</td>
                      <td className="p-3 font-sans text-zinc-400">Exponential backoff</td>
                      <td className="p-3 font-sans text-zinc-400">Automated retry scheduled using backoff formula (T = 2^n × 60s)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}

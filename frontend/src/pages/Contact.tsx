import { Link } from "react-router-dom";
import { Mail, Clock, ShieldCheck, FileText, ArrowRight, MessageSquare, BookOpen, ExternalLink } from "lucide-react";
import jaktraLogo from "../assets/jaktra_svg.svg";
import { SEOHead } from "../components/common/SEOHead";
import { contactPageSchema, breadcrumbSchema } from "../components/common/seo-schemas";
import { LandingFooter } from "../components/landing/LandingFooter";

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

export function Contact() {
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-zinc-100 font-sans selection:bg-[#b7d2f8]/20 selection:text-white">
      <SEOHead
        title="Contact Jaktra — Support, Security & Inquiries"
        description="Get in touch with the Jaktra team for technical support, onboarding assistance, security reporting, and enterprise AR inquiries."
        canonicalPath="/contact"
        jsonLd={[contactPageSchema, breadcrumbSchema([{ name: "Contact", path: "/contact" }])]}
      />

      <HeaderNav />

      <main className="pt-24 pb-20 px-6 max-w-6xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6 text-xs text-zinc-500">
          <ol className="flex items-center gap-2">
            <li>
              <Link to="/" className="hover:text-zinc-300 transition-colors">
                Home
              </Link>
            </li>
            <li>/</li>
            <li className="text-zinc-300 font-medium" aria-current="page">
              Contact
            </li>
          </ol>
        </nav>

        {/* Hero Section */}
        <div className="max-w-3xl mb-16 pt-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-white/[0.08] bg-white/[0.03] text-zinc-300 text-xs font-mono mb-6">
            <Mail className="w-3.5 h-3.5 text-[#b7d2f8]" />
            <span>Support &amp; Communications Hub</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-6 leading-[1.15]">
            We&apos;re Here to Help Your Finance Team
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
            Have questions about connecting your billing stack, configuring 5-stage cadences, or security architecture? Reach out directly to our team.
          </p>
        </div>

        {/* Contact Channels Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="p-7 rounded-2xl bg-[#111113] border border-white/[0.08] flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#b7d2f8]/10 border border-[#b7d2f8]/20 flex items-center justify-center text-[#b7d2f8] mb-5">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-white mb-2">Customer &amp; Product Support</h2>
              <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                Assistance with account onboarding, CSV invoice sync, email integration (SendGrid/Resend/SMTP), and debtor portal management.
              </p>
            </div>
            <div>
              <a
                href="mailto:support@jaktra.site?subject=Product%20Support%20Inquiry"
                className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-[#b7d2f8] transition-colors"
              >
                <span>support@jaktra.site</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="p-7 rounded-2xl bg-[#111113] border border-white/[0.08] flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-white mb-2">Security &amp; Compliance</h2>
              <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                Technical inquiries regarding our tenant isolation, cryptographic webhook signatures, encryption at rest, or responsible vulnerability disclosure.
              </p>
            </div>
            <div>
              <a
                href="mailto:support@jaktra.site?subject=Security%20Inquiry"
                className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-[#b7d2f8] transition-colors"
              >
                <span>support@jaktra.site</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="p-7 rounded-2xl bg-[#111113] border border-white/[0.08] flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-5">
                <FileText className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-white mb-2">Privacy &amp; Data Subject Rights</h2>
              <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                Requests relating to GDPR data rights, account deletion, or Data Processing Addenda (DPA) requests as detailed in our Privacy Policy.
              </p>
            </div>
            <div>
              <a
                href="mailto:support@jaktra.site?subject=Data%20Privacy%20Request"
                className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-[#b7d2f8] transition-colors"
              >
                <span>support@jaktra.site</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </section>

        {/* Operating Hours & Self-Service Info */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <div className="p-8 rounded-2xl bg-[#111113] border border-white/[0.08]">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-5 h-5 text-[#b7d2f8]" />
              <h2 className="text-base font-bold text-white">Support Availability &amp; Response SLA</h2>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed mb-4">
              All support inquiries sent to <code className="text-xs text-zinc-300 bg-white/[0.05] px-1.5 py-0.5 rounded">support@jaktra.site</code> are routed directly to our core engineering and operations team.
            </p>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#b7d2f8]" />
                <span>Support Hours: Monday – Friday (Business Hours)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#b7d2f8]" />
                <span>Expected Response Time: 24 to 48 business hours</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#b7d2f8]" />
                <span>Critical platform incident escalation monitored 24/7</span>
              </li>
            </ul>
          </div>

          <div className="p-8 rounded-2xl bg-[#111113] border border-white/[0.08]">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-5 h-5 text-[#b7d2f8]" />
              <h2 className="text-base font-bold text-white">Fast Self-Service Resources</h2>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed mb-4">
              Looking for quick implementation answers? Our developer documentation and guides cover all platform capabilities:
            </p>
            <div className="space-y-2 text-xs">
              <div>
                <Link to="/docs" className="text-zinc-300 hover:text-white transition-colors inline-flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-[#b7d2f8]" />
                  <span>Integration Guide, API &amp; Webhook HMAC Specifications →</span>
                </Link>
              </div>
              <div>
                <Link to="/pricing" className="text-zinc-300 hover:text-white transition-colors inline-flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-[#b7d2f8]" />
                  <span>Early Access Pricing &amp; DSO Savings Calculator →</span>
                </Link>
              </div>
              <div>
                <Link to="/resources" className="text-zinc-300 hover:text-white transition-colors inline-flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-[#b7d2f8]" />
                  <span>B2B Dunning Templates &amp; Dispute Response Guides →</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Card */}
        <section className="rounded-2xl border border-white/[0.08] bg-[#111113] p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Ready to Put Your Receivables on Autopilot?
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 mb-6 leading-relaxed">
              Create an Early Access account in under 60 seconds with zero credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white text-zinc-950 text-sm font-semibold hover:bg-zinc-200 transition-colors shadow-lg w-full sm:w-auto"
              >
                <span>Get started free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/docs"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-white/[0.12] bg-white/[0.04] text-white text-sm font-medium hover:bg-white/[0.08] transition-colors w-full sm:w-auto"
              >
                <span>Explore documentation</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}

export default Contact;

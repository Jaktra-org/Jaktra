import { AlternativesGuideTemplate } from "@/seo/components/AlternativesGuideTemplate";
import kollenoLogo from "@/assets/competition/kolleno.png";
import upflowLogo from "@/assets/competition/upflow.svg";
import gavitiLogo from "@/assets/competition/gaviti.png";
import chaserLogo from "@/assets/competition/chaser.png";
import yaypayLogo from "@/assets/competition/yaypay-logo-icon.svg";
import tesorioLogo from "@/assets/competition/tesorio-icon.svg";

export function KollenoAlternatives() {
  return (
    <AlternativesGuideTemplate
      incumbentName="Kolleno"
      incumbentLogo={kollenoLogo}
      canonicalPath="/compare/kolleno-alternatives"
      metaTitle="Top 6 Kolleno Alternatives & Competitors in 2026 | Jaktra"
      metaDescription="Compare the top 6 Kolleno alternatives for 2026. Evaluate AR credit control tools on pricing, autonomous AI recovery, and alternatives to per-user queues."
      heroHeading="Top 6 Kolleno Alternatives & Competitors (2026)"
      heroSubheading="Kolleno coordinates phone calls, WhatsApp messages, and email queues into a unified cockpit for human credit controllers. If you want to collect overdue cash without paying expensive per-seat collector fees or managing manual call queues, here are the top alternatives for 2026."
      incumbentOverview="Kolleno built an impressive omnichannel communications hub ('Maestro') that routes tasks to human credit control staff. But as companies seek to scale without adding headcount, paying expensive per-seat fees for software that simply tells human employees who to call feels inefficient."
      whyLeaveIncumbent={[
        {
          title: "Expensive Per-Collector Seat Licensing",
          description: "Kolleno charges steep per-seat fees (~£650–£1,250/user/month) on annual contracts. As your transaction volume and finance team expand, your software overhead multiplies rapidly.",
        },
        {
          title: "Directs Human Staff Rather than Executing Work",
          description: "Kolleno is fundamentally a task router. It generates daily queues of debtors for your human collectors to dial and email, meaning your business still requires significant labor and payroll to collect cash.",
        },
        {
          title: "Multi-Week Onboarding & Change Management",
          description: "Deploying Kolleno across an existing credit control department requires extensive staff training, workflow adjustments, and multi-week ERP integration to achieve full utilization.",
        },
      ]}
      quickPicks={[
        {
          award: "Closest Workflow & Analytics Match",
          winnerName: "Upflow",
          winnerLogo: upflowLogo,
          reason: "Executive DSO waterfall analytics and cross-department Slack/Salesforce alerts that coordinate finance and sales before dunning.",
        },
        {
          award: "Best Multi-ERP Collector Workflows",
          winnerName: "Gaviti",
          winnerLogo: gavitiLogo,
          reason: "Structured credit management workflows, team KPI tracking, and standardized dunning rules for multi-ERP mid-market finance teams.",
        },
        {
          award: "Best Autonomous AI Alternative",
          winnerName: "Jaktra",
          isJaktra: true,
          reason: "Autonomous AI modulates tone across 5 stages, triages disputes automatically, and settles payments without requiring human collectors.",
        },
      ]}
      alternatives={[
        {
          name: "Upflow",
          logo: upflowLogo,
          badge: "Closest Workflow & Analytics Rival",
          categoryTag: "Collaborative Dunning & Executive DSO Reporting",
          bestFor: "B2B SaaS and high-growth venture-backed companies using NetSuite, QuickBooks, or Xero wanting collaborative finance-sales cadences.",
          pricing: "Quote-based on Gross Billed Revenue (~$5,000 – $15,000+/yr)",
          deploymentTime: "2 to 4 Weeks",
          debtorExperience: "PDF invoice attachment with bank wire instructions or Stripe billing link",
          disputeTriage: "Shared inbox routing requiring manual team triage",
          strengths: [
            "Executive-level DSO reporting, aging waterfall charts, and cash inflow forecasting",
            "Cross-department AE tagging that alerts account owners in Slack before dunning VIP clients",
            "Clean, intuitive interface designed for fast adoption without complex training",
          ],
          limitations: [
            "Pricing scales with gross billed revenue",
            "Relies on calendar-based email templates rather than autonomous generative tone modulation",
          ],
          review: "Upflow provides a much more intuitive, collaborative alternative to Kolleno for companies that don't need dedicated phone calling infrastructure and prefer to align finance and sales through Slack and executive dashboards.",
          comparisonUrl: "/compare/jaktra-vs-upflow",
        },
        {
          name: "Gaviti",
          logo: gavitiLogo,
          badge: "Best Mid-Market Rules Engine",
          categoryTag: "Mid-Market AR Collections Workflow & Team Management",
          bestFor: "Credit managers running multiple ERP instances simultaneously who require standardized credit policy workflows, collector task assignment queues, and team KPI performance tracking.",
          pricing: "Custom Annual Enterprise Contract ($15,000 – $30,000+/yr)",
          deploymentTime: "4 to 6 Weeks",
          debtorExperience: "Branded email reminders with attached invoice statements",
          disputeTriage: "Dispute assignment and root-cause tracking module",
          strengths: [
            "Deep multi-ERP synchronization supporting complex, fragmented accounting setups",
            "Standardized credit policy rules automating collector task prioritization",
            "Comprehensive collector performance analytics tracking recovery rates per team member",
          ],
          limitations: [
            "Requires dedicated human staff to work through daily generated collection tasks",
            "High annual enterprise subscription barrier",
          ],
          review: "If you have an established credit control team and want structured workflows and collector performance metrics across multiple ERPs, Gaviti offers an established mid-market alternative to Kolleno.",
        },
        {
          name: "Jaktra",
          isJaktra: true,
          badge: "Best Autonomous AI Alternative",
          categoryTag: "Autonomous AI Collections Execution",
          bestFor: "B2B companies, agencies, and mid-market finance teams that want to collect overdue invoices end-to-end autonomously without hiring or managing human credit controllers.",
          pricing: "100% Free during Early Access",
          deploymentTime: "15 Minutes (Self-Serve)",
          debtorExperience: "1-Click Tokenized Payment Link (/i/:token) with instant Razorpay bank/card settlement",
          disputeTriage: "Autonomous NLP sentiment analysis; pauses reminders instantly and drafts a resolution reply",
          strengths: [
            "Autonomous AI executes debtor outreach across 5 urgency tiers with zero human drafting",
            "Automatic inbound dispute triage catches and categorizes objections before human intervention is needed",
            "1-click tokenized payment links (/i/:token) eliminate buyer portal registration and login hurdles",
            "Automated installment plan negotiation allows cash-strapped debtors to split balances into milestones",
            "100% Free during Early Access with zero per-user or per-collector seat fees",
          ],
          limitations: [
            "Focused specifically on autonomous digital collections; does not include browser VoIP phone dialing",
            "Operates on a single primary operating ledger currency per workspace",
          ],
          review: "Jaktra solves the collections bottleneck at the root: by executing the work rather than assigning it. While Kolleno builds to-do lists for human collectors, Jaktra acts as an autonomous digital agent. It calculates delinquency risk, authors personalized 5-stage emails, immediately pauses cadences when an invoice dispute arises, and collects payments via zero-login links in under 30 seconds.",
          comparisonUrl: "/compare/jaktra-vs-kolleno",
        },
        {
          name: "Chaser",
          logo: chaserLogo,
          badge: "Best Established SMB/Mid-Market Match",
          categoryTag: "Scheduled Multi-Channel Dunning & Credit Checking",
          bestFor: "UK and European small-to-mid businesses integrated with Xero, QuickBooks, or Sage needing scheduled SMS/email reminders and customer credit checks.",
          pricing: "£199 – £899+/mo ($250–$1,100+/mo) + paid add-ons",
          deploymentTime: "1 to 2 Weeks",
          debtorExperience: "Branded email with attached PDF and optional customer portal",
          disputeTriage: "Manual note-taking and workflow hold in dashboard",
          strengths: [
            "Affordable entry point compared to Kolleno's expensive per-seat pricing",
            "Integrated credit bureau checks monitoring debtor risk directly inside Xero",
            "Multi-channel outreach supporting email, SMS, and debtor statement delivery",
          ],
          limitations: [
            "Paid add-on fees for SMS, telephone logs, and portals",
            "Relies on static timetable schedules rather than conversational intelligence",
          ],
          review: "Chaser is an accessible, established alternative to Kolleno for small-to-mid European businesses that want scheduled invoice chasing and credit checks without Kolleno's enterprise per-seat licensing.",
          comparisonUrl: "/compare/jaktra-vs-chaser",
        },
        {
          name: "Quadient AR (YayPay)",
          logo: yaypayLogo,
          badge: "Best for Predictive Credit Scoring",
          categoryTag: "Mid-Market Predictive Collections & Portals",
          bestFor: "Growing mid-market finance teams running NetSuite, Sage Intacct, or Acumatica who want predictive credit scoring, automated reminder cadences, and customer billing dashboards.",
          pricing: "Volume-tiered Quote ($15,000 – $40,000+/yr)",
          deploymentTime: "6 to 8 Weeks",
          debtorExperience: "YayPay branded customer billing portal",
          disputeTriage: "Dispute tagging module within collector dashboard",
          strengths: [
            "Predictive machine learning debtor scoring assessing payment probability",
            "Built-in customer communication timeline tracking internal notes and emails",
            "Self-service customer portal where clients can view statements and pay",
          ],
          limitations: [
            "Implementation complexity requires dedicated consulting and IT alignment",
            "Focuses on task assistance rather than closed-loop autonomous execution",
          ],
          review: "Quadient AR provides mid-market finance teams with predictive payment scoring and customer portals, making it a viable alternative for teams wanting deeper analytics than Kolleno's communications inbox.",
        },
        {
          name: "Tesorio",
          logo: tesorioLogo,
          badge: "Best for Cash Flow Forecasting",
          categoryTag: "Predictive Cash Flow Forecasting & AR Analytics",
          bestFor: "Corporate finance leaders and CFOs connected to NetSuite, Workday, or Salesforce who need predictive 13-week direct cash flow forecasting alongside AR task management.",
          pricing: "Custom Annual Subscription ($18,000 – $36,000+/yr)",
          deploymentTime: "4 to 8 Weeks",
          debtorExperience: "Branded email reminders with attached invoice statements",
          disputeTriage: "Internal dispute tagging within treasury dashboard",
          strengths: [
            "Institutional 13-week cash flow forecasting tying AR collections to cash runway",
            "Executive balance sheet analytics tracking Days Sales Outstanding (DSO) and CEI metrics",
            "Deep bi-directional NetSuite and Salesforce CRM synchronization",
          ],
          limitations: [
            "High annual enterprise subscription barrier",
            "Product focus is treasury forecasting; debtor communication still relies on human collectors",
          ],
          review: "If your finance team evaluated Kolleno for cash visibility but needs institutional-grade treasury forecasting and cash runway modeling, Tesorio is the leading predictive cash flow platform.",
        },
      ]}
      decisionScenarios={[
        {
          scenario: "You need executive DSO waterfall dashboards and collaborative Slack alerts with sales reps",
          recommendedPick: "Upflow",
          rationale: "Upflow excels at executive analytics and letting finance teams coordinate with account managers in Slack before following up.",
        },
        {
          scenario: "You have a dedicated credit control team that needs standardized KPI queues across multiple ERPs",
          recommendedPick: "Gaviti",
          rationale: "Gaviti structures daily task workflows and tracks collector performance metrics across fragmented multi-ERP environments.",
        },
        {
          scenario: "You want autonomous collections execution without paying expensive per-seat collector fees",
          recommendedPick: "Jaktra",
          rationale: "Jaktra eliminates the need for human collector queues by handling follow-ups, dispute triage, and settlement autonomously for free.",
        },
      ]}
      faqs={[
        {
          q: "Why do companies replace Kolleno?",
          a: "The most common reasons are high per-seat collector licensing costs (£650–£1,250/user/mo), long implementation cycles, and the realization that Kolleno is a task router that directs human staff rather than an autonomous worker that resolves collections without extra headcount.",
        },
        {
          q: "How does Jaktra differ fundamentally from Kolleno?",
          a: "Kolleno gives human collectors a browser cockpit with phone dials and task queues. Jaktra is an autonomous AI collections agent: powered by autonomous AI, Jaktra drafts contextual emails across 5 urgency stages, uses NLP to catch disputes and pause reminders automatically, and collects cash through 1-click tokenized links (/i/:token) without requiring human collectors.",
        },
        {
          q: "Does Jaktra charge per user or per collector like Kolleno?",
          a: "No. Jaktra has zero per-seat or per-collector fees. During our public Early Access program, Jaktra is 100% Free with unlimited open invoices and full access to all autonomous features.",
        },
      ]}
    />
  );
}

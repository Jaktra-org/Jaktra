# Jaktra SEO Status Audit — 2026-09-12

> **Auditor**: Senior SEO Engineer  
> **Audit Date**: 2026-09-12T02:45:00+05:30  
> **Environment Checked**: Production live deployment (`https://jaktra.site` and `https://www.jaktra.site`) + Local repository codebase (`c:\Users\sures\Desktop\Jaktra`)  
> **Methodology**: Raw HTTP probe without client-side JavaScript execution (verifying headers, redirects, status codes, HTML body payloads, head tags, image binary headers, and JSON-LD syntax), supplemented by real browser headless Chromium performance instrumentation for Core Web Vitals.  
> **Mandate**: Assume nothing, verify everything against live endpoints, plain-language reporting of bad news and regressions, and sharp distinction between "structurally valid" and "actually correct."

---

## EXECUTIVE SUMMARY

A rigorous, end-to-end audit of Jaktra's live production site and repository was conducted. Several major improvements reported in previous commits are **genuinely live and working** in production, but critical discrepancies, circular configurations, and rendering anomalies were uncovered that would undermine an organic search campaign or stakeholder presentation if left unaddressed.

### Key Highlights
1. **Full-DOM SSG Prerendering is Live**: Contrary to the prior audit's claim that all pages served an empty `<div id="root"></div>`, production now serves **fully rendered HTML bodies** (11 KB to 90 KB body payload) across all 42 routes. Headings, paragraphs, navigation, tables, and internal links are in the raw response.
2. **CRITICAL REGRESSION — Homepage `<h1>` is Gibberish in Raw HTML**: The homepage hero utilizes a client-side decryption scramble animation (`DecryptText` in `Landing.tsx`). Because `useEffect` does not execute during server-side prerendering, the initial HTML stamped into production contains random scrambled characters (`PqKHwigGNd9Q4llc4X6wpNf862Diq5a14hTBjddDmWHal9UxcA4vF`) with `style="opacity:0"`. Non-JS crawlers (Googlebot first-pass, Bing, social scrapers) see complete gibberish as the primary H1 of the entire brand.
3. **CRITICAL CONFLICT — 308 Domain Redirect vs Canonical Tag Circular Loop**: Vercel is configured to treat `https://www.jaktra.site` as the primary canonical domain, issuing a `308 Permanent Redirect` from `https://jaktra.site/*` to `https://www.jaktra.site/*`. However, **every canonical tag, Open Graph URL, sitemap URL, and robots.txt reference in the codebase specifies `https://jaktra.site` (apex domain without `www`)**. When Googlebot crawls `www.jaktra.site`, it is told the canonical URL is `jaktra.site`, which redirects back to `www.jaktra.site`.
4. **Structured Data Cleanliness & Template Leak**: All 42 routes contain valid JSON-LD. There are **zero fabricated reviews or aggregate ratings** anywhere on the site. However, because the homepage's `SoftwareApplication` and 12-question `FAQPage` schemas are hardcoded into `index.html`, they are unintentionally **leaked into every single subpage** (Terms, Privacy, comparisons, use cases) alongside page-specific schemas.
5. **Metadata & Stale Deploy Fixed**: All 39 public routes now have unique `<title>`, `<meta name="description">`, `og:title`, `og:description`, and `twitter:title` tags. The 6 newest resource pages that previously served homepage fallbacks are now fully deployed and present in `sitemap.xml`.
6. **Severe Mobile Layout Shift (CLS = 1.3956)**: Real headless browser instrumentation reveals a mobile Cumulative Layout Shift of **1.3956** (Google's "Good" threshold is $\le 0.10$). Hero animations, dynamic metric cycling, and SVG graph rendering cause massive visual shifts during client hydration.

---

## PART 1 — TECHNICAL INFRASTRUCTURE STATE CHECK

### 1. Prerendering & Server-Side Generation (SSG)

#### Live Test Results (Raw HTTP Fetch, No JS)

```powershell
# Apex Domain Status
curl.exe -sI https://jaktra.site/
# HTTP/1.1 308 Permanent Redirect -> Location: https://www.jaktra.site/

# WWW Domain Status
curl.exe -sI https://www.jaktra.site/
# HTTP/1.1 200 OK -> Content-Length: 77728 bytes
```

#### Route-by-Route Prerender Verification (Sample of Primary & Content Routes)

| Route | HTTP Status | Raw HTML Size | Prerendered Body Size | Word Count (Raw Body) | Raw `<h1>` Tag Content |
|---|---|---|---|---|---|
| `/` | 200 OK | 77,664 B | 66,045 B | 1,212 words | ❌ `PqKHwigGNd9Q4llc4X6wpNf862Diq5a14hTBjddDmWHal9UxcA4vF` |
| `/privacy` | 200 OK | 23,302 B | 11,664 B | 925 words | ✅ `Privacy Policy` |
| `/terms` | 200 OK | 24,774 B | 13,098 B | 1,177 words | ✅ `Terms of Service` |
| `/docs` | 200 OK | 13,400 B | 1,808 B | 32 words | ✅ `Full Documentation Center` |
| `/pricing` | 200 OK | 48,716 B | 35,625 B | 785 words | ✅ `Simple, 100% Free Accounts Receivable Automation` |
| `/login` | 200 OK | 21,305 B | 10,064 B | 79 words | ✅ `Welcome back` |
| `/register` | 200 OK | 32,983 B | 21,703 B | 202 words | ✅ `Create an account` |
| `/forgot-password` | 200 OK | 19,927 B | 8,911 B | 77 words | ✅ `Forgot password?` |
| `/resources/how-to-reduce-dso` | 200 OK | 66,986 B | 49,838 B | 1,282 words | ✅ `How to Reduce Days Sales Outstanding (DSO): Calculation & 5 Best Practices` |
| `/resources/invoice-dispute-response-templates` | 200 OK | 51,875 B | 38,748 B | 1,196 words | ✅ `How to Respond to a Disputed Invoice: Free Email Templates & Resolution Guide` |

#### Build Pipeline Confirmation
- **`frontend/vercel.json`**: `"buildCommand": "npm run build"`, `"outputDirectory": "dist"`
- **`frontend/package.json`**:
  ```json
  "build": "tsc -b && vite build && vite build --ssr src/entry-server.tsx --outDir dist-ssr && node scripts/prerender.mjs"
  ```
- **Execution Mechanism**:
  1. Vite compiles client bundle into `dist/`.
  2. Vite compiles SSR bundle into `dist-ssr/entry-server.js`.
  3. `scripts/prerender.mjs` executes `renderToString()` via React 19 for all 42 registered routes in `ROUTE_COMPONENTS`.
  4. Body HTML is stamped into `dist/<route>/index.html` and static files are published to Vercel CDN.

#### Discrepancy from Prior Report
- The previous audit (`SEO_STATUS_AUDIT_2026-09-11.md`) stated: *"EMPTY `<div id="root"></div>` — zero prerendered body content."*
- **Ground Truth**: That finding was an artifact of testing either an old deployment or relying on a flawed non-greedy regex that terminated at the first inner `</div>`. The live production site **does** deliver fully prerendered body DOM.
- **Local Build Flaw Discovered**: In `scripts/prerender.mjs`, line 15 reads `templateHtml = readFileSync(INDEX_HTML_PATH, 'utf-8')`. If `dist/index.html` already contains prerendered root markup from a prior build pass, `pageHtml.replace('<div id="root"></div>', ...)` fails silently, causing subsequent local builds to stamp the homepage body into all subpages. The build script must read from the clean Vite HTML template, not the mutably overwritten `dist/index.html`.

---

### 2. Metadata (Head Tags)

#### Live Extraction on Primary 7 Routes

| Route | `<title>` | `<meta name="description">` | `og:title` | `twitter:title` | Canonical `<link>` | `robots` |
|---|---|---|---|---|---|---|
| `/` | `Jaktra — AI-Powered Accounts Receivable Automation` | Automate B2B collections with AI-powered 5-stage tone escalation... | `Jaktra — AI-Powered Accounts Receivable Automation` | `Jaktra — AI-Powered Accounts Receivable Automation` | `https://jaktra.site/` | *None* |
| `/privacy` | `Privacy Policy — Jaktra` | Read Jaktra's privacy policy. Learn how we protect debtor and financial data... | `Privacy Policy — Jaktra` | `Privacy Policy — Jaktra` | `https://jaktra.site/privacy` | *None* |
| `/terms` | `Terms of Service — Jaktra` | Terms and conditions governing the use of Jaktra's accounts receivable... | `Terms of Service — Jaktra` | `Terms of Service — Jaktra` | `https://jaktra.site/terms` | *None* |
| `/docs` | `Documentation — Jaktra` | Read the full Jaktra documentation. Set up integrations with SendGrid, Razorpay... | `Documentation — Jaktra` | `Documentation — Jaktra` | `https://jaktra.site/docs` | *None* |
| `/login` | `Sign In — Jaktra` | Sign in to your Jaktra account to manage automated invoice follow-ups... | `Sign In — Jaktra` | `Sign In — Jaktra` | **REMOVED** (Correct) | `noindex, nofollow` |
| `/register` | `Start Free — Jaktra` | Create your Jaktra account. Start automating accounts receivable in minutes... | `Start Free — Jaktra` | `Start Free — Jaktra` | **REMOVED** (Correct) | `noindex, nofollow` |
| `/forgot-password` | `Reset Password — Jaktra` | Reset your Jaktra account password. | `Reset Password — Jaktra` | `Reset Password — Jaktra` | **REMOVED** (Correct) | `noindex, nofollow` |

#### Key Findings & Discrepancies
- **`og:title` & `twitter:title` Sub-Page Bug**: **RESOLVED**. In production, all sub-pages now display their unique page title in Open Graph and Twitter Card tags.
- **6 Newest Resource Pages**: **RESOLVED & DEPLOYED**. Routes such as `/resources/invoice-dispute-response-templates` and `/resources/accounts-receivable-query-management` now serve their dedicated titles, descriptions, and canonical URLs rather than the homepage fallback.
- **CRITICAL ARCHITECTURAL CONFLICT (Canonical vs Redirect)**:
  - Vercel HTTP Layer: `https://jaktra.site` $\rightarrow$ `308 Permanent Redirect` $\rightarrow$ `https://www.jaktra.site`
  - HTML Canonical Layer: `https://www.jaktra.site` declares `<link rel="canonical" href="https://jaktra.site/" />`
  - **Impact**: Google Search Console will flag this as "Page with redirect" or select `www.jaktra.site` as Google-selected canonical while rejecting the declared user canonical. Either Vercel must redirect `www` to non-`www`, or the codebase `SITE_URL` constant must be updated to `https://www.jaktra.site`.

---

### 3. Structured Data — Full Re-Audit

#### Live Schema Inventory on Homepage (`/`)
Raw HTML contains exactly 4 `<script type="application/ld+json">` blocks:
1. **`Organization`**: `@id`: `https://jaktra.site/#org`, valid name, logo URL, and business description.
2. **`WebSite`**: `@id`: `https://jaktra.site/#website`, references publisher `@id`.
3. **`SoftwareApplication`**: Valid `applicationCategory: "FinanceApplication"`, `operatingSystem`, and `offers: { price: "0", priceCurrency: "USD" }`.
4. **`FAQPage`**: 12 detailed Q&A pairs covering product features, dispute handling, data isolation, and integrations.

#### Specific Structured Data Checks
- **Duplicate `SoftwareApplication` Injection**: **FIXED**. Exactly 1 `SoftwareApplication` block is in the raw HTML.
- **`aggregateRating` / `Review` Policy Risk**: **CONFIRMED CLEAN**. Exhaustive JSON parsing across all 42 live routes revealed **0 instances** of `aggregateRating`, `ratingValue`, or fabricated customer `Review` objects. (Matches Google Search Essentials compliance).
- **Page-Specific Schema Pre-rendering**: **WORKING**. Subpages now pre-render their rich schemas into the raw `<head>`:
  - Feature pages: `TechArticle` + `BreadcrumbList`
  - Comparison pages: `Article` + `BreadcrumbList`
  - Use-case pages: `Article` + `BreadcrumbList`
  - Resource Hubs: `CollectionPage` + `BreadcrumbList`
  - DSO Guide (`/resources/how-to-reduce-dso`): `Article` + `HowTo` + `FAQPage` + `BreadcrumbList`
  - Pricing (`/pricing`): `Product` (with merchant listings compliance) + `BreadcrumbList`

#### Structural Validity vs Actual Correctness (Template Leak)
> [!WARNING]
> **Template Schema Leak**: In `frontend/index.html`, the homepage `SoftwareApplication` and 12-item `FAQPage` schemas are hardcoded into the base template. When `scripts/prerender.mjs` generates subpages, it appends page-specific schemas without stripping the hardcoded homepage schemas.
> 
> As a result, **every single subpage** (e.g., `/privacy`, `/terms`, `/compare/kolleno-alternative`, `/resources/how-to-reduce-dso`) contains the 12-question homepage FAQ schema in addition to its own content. While syntactically valid JSON, serving unrelated homepage dunning FAQs on a legal privacy policy or competitor comparison violates Google's guidelines for relevant structured data.

*External Validation Recommendation*: A manual run through the Google Rich Results Test (`https://search.google.com/test/rich-results`) and `validator.schema.org` against `https://www.jaktra.site/` and `https://www.jaktra.site/resources/how-to-reduce-dso` remains mandatory to verify eligibility for Rich Snippets in Google's actual rendering sandbox.

---

### 4. `robots.txt` / `sitemap.xml` / `llms.txt`

#### Live Endpoint Audit

| Endpoint | HTTP Status | Size | Validation Findings |
|---|---|---|---|
| `https://www.jaktra.site/robots.txt` | 200 OK | 485 B | Disallows 12 private application paths (`/invoices`, `/agent`, `/analytics`, `/disputes`, `/payment-plans`, `/settings`, `/activity-log`, `/dlq`, `/invite`, `/i/`, `/api/`, `/admin/`) + 3 auth routes (`/login`, `/register`, `/forgot-password`). References `Sitemap: https://jaktra.site/sitemap.xml`. |
| `https://www.jaktra.site/sitemap.xml` | 200 OK | 7,011 B | **39 URLs total**. Contains all indexable public pages. Zero private/auth pages. All 6 newest resource guides are present. All `<lastmod>` dates updated to `2026-09-11`. |
| `https://www.jaktra.site/llms.txt` | 200 OK | 4,508 B | Clean markdown specification for AI agents and LLM scrapers. Accurately references core hubs, architecture, and value proposition. |

#### Technical SEO Caveat on `robots.txt` Auth Disallow
In `robots.txt`, `/login`, `/register`, and `/forgot-password` are explicitly listed under `Disallow`.
- **Nuance**: When a route is disallowed in `robots.txt`, search engine crawlers are forbidden from fetching the page. Consequently, **crawlers cannot read the `<meta name="robots" content="noindex, nofollow" />` tag** in the HTML.
- **Risk**: If external backlinks ever point to `jaktra.site/login`, Google may index the bare URL without snippet description. Standard SEO best practice is to allow crawling of auth pages so Google can read and respect the `noindex` directive.

---

### 5. Images & Social Media Assets

| Asset | Public Live URL | HTTP Status | Content-Type | Exact Byte Size | Rendered Dimensions | Aspect Ratio | Evaluation |
|---|---|---|---|---|---|---|---|
| **Logo** | `https://www.jaktra.site/logo.webp` | 200 OK | `image/webp` | 17,878 B (~17.5 KB) | 1254 × 1254 px | 1:1 (Square) | ✅ Excellent. Perfectly square, lightweight WebP. |
| **Open Graph** | `https://www.jaktra.site/og-image.png` | 200 OK | `image/png` | 165,810 B (~161.9 KB) | 1200 × 603 px | 1.99:1 | ⚠️ Functional, but 603px height is slightly short of the standard 1200 × 630 (1.91:1) Facebook/LinkedIn preview card standard. |
| **Favicon** | `https://www.jaktra.site/favicon.svg` | 200 OK | `image/svg+xml` | 115,958 B (~113.2 KB) | Vector | Scalable | ✅ High-fidelity SVG favicon. |

---

### 6. Performance & Core Web Vitals

#### Real Headless Chromium Instrumentation (Mobile Viewport 390×844)
Because the unauthenticated PageSpeed Insights API is returning HTTP 429 Quota Exceeded, real browser performance was measured directly via Playwright Chromium on a standard mobile profile:

| Metric | Measured Value | Google CWV Threshold | Status |
|---|---|---|---|
| **Network Idle Load Time** | 4,464 ms | N/A | Informational |
| **First Contentful Paint (FCP)** | 3,788 ms | $\le 1,800$ ms | ❌ Needs Improvement |
| **Largest Contentful Paint (LCP)** | 5,516 ms | $\le 2,500$ ms | ❌ Poor |
| **Cumulative Layout Shift (CLS)** | **1.3956** | $\le 0.10$ | 🔴 Critical Failure |

#### Performance Root Causes
1. **Severe Cumulative Layout Shift (CLS = 1.3956)**:
   - The hero text scramble animation (`DecryptText`) swaps random characters and re-renders font glyph widths dynamically.
   - The cycling metric component (`CyclingMetric`) toggles between text strings of different character counts without a fixed-width container.
   - The interactive SVG graph and floating metric cards pop in post-hydration via Framer Motion, violently pushing page sections down.
2. **Font Optimization**: Local fonts (`jaktra-sans-display.woff2`, `geist-pixel-line.woff2`, `geist-mono.woff2`) are properly preloaded with `<link rel="preload">`. Google Fonts are loaded asynchronously via `media="print" onload="this.media='all'"`.
3. **Route-Based Code Splitting**: Verified in `frontend/src/App.tsx`. All heavy authenticated routes (`Dashboard`, `Invoices`, `InvoiceDetail`, `Agent`, `Analytics`, `Settings`, `ActivityLog`, `Disputes`, `PaymentPlans`, `DebtorPortal`) are cleanly wrapped in `React.lazy()` and loaded on demand.

---

### 7. Google Search Console (GSC)
- **Status**: **Unverifiable from this environment**.
- **Assessment**: The AI agent operates in a local development environment and has no direct API or OAuth access to Google Search Console.
- **Action Required**: The site owner must log into GSC to:
  1. Confirm that `https://jaktra.site/sitemap.xml` (or `www.jaktra.site/sitemap.xml`) has been submitted and parsed with 39 discovered URLs.
  2. Perform a live URL Inspection on `https://www.jaktra.site/` to request indexing.
  3. Verify whether GSC is reporting canonical indexing warnings due to the apex vs `www` redirect discrepancy.

---

## PART 2 — CONTENT INVENTORY

### Full Public-Facing Route Inventory (42 Total Routes)

| # | Route | Page Type | Word Count (approx.) | Unique Metadata? | Target Keyword / Focus | Indexing Status |
|:---:|---|---|:---:|:---:|---|:---:|
| 1 | `/` | Platform Homepage | ~1,212 | ✅ | AI accounts receivable automation | Indexable |
| 2 | `/privacy` | Legal / Compliance | ~925 | ✅ | Jaktra privacy policy & financial data compliance | Indexable |
| 3 | `/terms` | Legal / Agreement | ~1,177 | ✅ | Jaktra terms of service | Indexable |
| 4 | `/docs` | Documentation Stub | ~32 | ✅ | Jaktra documentation & setup guide | Indexable |
| 5 | `/pricing` | Pricing & ROI Math | ~785 | ✅ | accounts receivable automation pricing | Indexable |
| 6 | `/features` | Features Topic Hub | ~1,227 | ✅ | B2B accounts receivable features | Indexable |
| 7 | `/features/5-stage-escalation` | Feature Deep-Dive | ~1,331 | ✅ | 5 stage tone escalation AR | Indexable |
| 8 | `/features/dispute-triage` | Feature Deep-Dive | ~673 | ✅ | AI invoice dispute triage | Indexable |
| 9 | `/features/installment-plans` | Feature Deep-Dive | ~702 | ✅ | self-serve invoice installment plans | Indexable |
| 10 | `/features/zero-login-portal` | Feature Deep-Dive | ~588 | ✅ | zero login debtor portal | Indexable |
| 11 | `/features/email-deliverability` | Feature Deep-Dive | ~1,116 | ✅ | accounts receivable email deliverability | Indexable |
| 12 | `/features/risk-scoring` | Feature Deep-Dive | ~620 | ✅ | predictive AR delinquency scoring | Indexable |
| 13 | `/compare` | Comparison Topic Hub | ~1,662 | ✅ | accounts receivable software comparison | Indexable |
| 14 | `/compare/highradius-vs-jaktra` | Competitor Comparison | ~907 | ✅ | HighRadius vs Jaktra | Indexable |
| 15 | `/compare/highradius-alternative` | Competitor Comparison | ~907 | ✅ | HighRadius alternative (Canonical to vs-jaktra) | Canonicalized |
| 16 | `/compare/upflow-alternative` | Competitor Comparison | ~970 | ✅ | Upflow alternative | Indexable |
| 17 | `/compare/chaser-alternative` | Competitor Comparison | ~1,054 | ✅ | Chaser alternative | Indexable |
| 18 | `/compare/paidnice-alternative` | Competitor Comparison | ~1,147 | ✅ | PaidNice alternative | Indexable |
| 19 | `/compare/kolleno-alternative` | Competitor Comparison | ~1,133 | ✅ | Kolleno alternative | Indexable |
| 20 | `/use-cases` | Use Cases Topic Hub | ~1,659 | ✅ | accounts receivable by industry | Indexable |
| 21 | `/use-cases/saas` | Industry Vertical | ~1,010 | ✅ | SaaS accounts receivable automation | Indexable |
| 22 | `/use-cases/agencies` | Industry Vertical | ~1,339 | ✅ | digital agency invoice collections | Indexable |
| 23 | `/use-cases/manufacturing` | Industry Vertical | ~1,326 | ✅ | manufacturing accounts receivable automation | Indexable |
| 24 | `/use-cases/professional-services` | Industry Vertical | ~1,234 | ✅ | professional services AR automation | Indexable |
| 25 | `/use-cases/construction` | Industry Vertical | ~1,291 | ✅ | construction accounts receivable automation | Indexable |
| 26 | `/use-cases/logistics-freight` | Industry Vertical | ~1,338 | ✅ | logistics accounts receivable software | Indexable |
| 27 | `/use-cases/staffing-recruiting` | Industry Vertical | ~1,328 | ✅ | staffing agency invoice collections | Indexable |
| 28 | `/use-cases/wholesale-distribution` | Industry Vertical | ~1,587 | ✅ | wholesale distribution AR automation | Indexable |
| 29 | `/resources` | Resources Topic Hub | ~1,092 | ✅ | accounts receivable guides and templates | Indexable |
| 30 | `/resources/how-to-reduce-dso` | Pillar Financial Guide | ~1,282 | ✅ | how to reduce DSO | Indexable |
| 31 | `/resources/5-stage-ar-tone-escalation` | Tactical Playbook | ~1,730 | ✅ | dunning email tone escalation guide | Indexable |
| 32 | `/resources/b2b-dunning-email-templates` | Template Library | ~1,021 | ✅ | B2B dunning email templates | Indexable |
| 33 | `/resources/ar-automation-roi-calculator` | Interactive Calculator | ~1,026 | ✅ | accounts receivable ROI calculator | Indexable |
| 34 | `/resources/best-b2b-finance-automation-tools` | Market Guide | ~2,840 | ✅ | best B2B finance automation tools | Indexable |
| 35 | `/resources/invoice-dispute-response-templates` | Template Resource | ~1,196 | ✅ | invoice dispute response templates | Indexable |
| 36 | `/resources/accounts-receivable-query-management` | Process Guide | ~999 | ✅ | accounts receivable query management | Indexable |
| 37 | `/resources/client-questioning-billable-hours` | Objection Guide | ~1,210 | ✅ | client questioning billable hours | Indexable |
| 38 | `/resources/client-disputed-invoice-what-to-do` | Escalation SOP | ~991 | ✅ | client disputed invoice what to do | Indexable |
| 39 | `/resources/how-to-manage-accounts-receivable-emails` | Email Workflow SOP | ~925 | ✅ | how to manage accounts receivable emails | Indexable |
| 40 | `/login` | Auth Utility | ~79 | ✅ | Sign In | `noindex, nofollow` |
| 41 | `/register` | Auth Utility | ~202 | ✅ | Start Free | `noindex, nofollow` |
| 42 | `/forgot-password` | Auth Utility | ~77 | ✅ | Reset Password | `noindex, nofollow` |

---

### Content Opportunities: Built vs Ideas

| Content Opportunity | Status in Codebase | Actual Count | Assessment |
|---|---|:---:|---|
| **Industry Vertical Use-Case Pages** | ✅ **Built & Live** | 8 pages + 1 hub | Comprehensive coverage of SaaS, Agencies, Manufacturing, Professional Services, Construction, Logistics, Staffing, and Wholesale. |
| **Competitor Alternative Pages** | ✅ **Built & Live** | 5 pages + 1 hub | HighRadius, Upflow, Chaser, PaidNice, and Kolleno comparisons are live with balanced objective positioning. |
| **Feature Deep-Dives** | ✅ **Built & Live** | 6 pages + 1 hub | 5-stage escalation, dispute triage, installment plans, zero-login portal, email deliverability, and risk scoring are live. |
| **DSO & Financial Calculation Content** | ✅ **Built & Live** | 1 guide + 1 calculator | `/resources/how-to-reduce-dso` and `/resources/ar-automation-roi-calculator` are live. |
| **Email Template Libraries** | ✅ **Built & Live** | 2 template hubs | Dunning email templates and invoice dispute templates are live with copy-paste blocks. |
| **Integration-Specific Landing Pages** | ❌ **Idea Only** | 0 | `/integrations/sendgrid`, `/integrations/resend`, `/integrations/razorpay`, etc., do not exist. External links live in footer only. |
| **Educational Blog** | ❌ **Idea Only** | 0 | No `/blog` directory or blog engine exists in the codebase. |
| **Customer Case Studies** | ❌ **Idea Only** | 0 | No `/case-studies` directory or customer proof pages exist in the codebase. |

---

### `SEO_CONTENT_STRATEGY.md` Review

The repository **does contain** a dedicated `SEO_CONTENT_STRATEGY.md` document (17,926 bytes).
- **Summary**: Outlines the keyword architecture, topic clusters, search intent profiles, and schema strategy for Jaktra. It maps the 39 live public routes into 5 interconnected hubs using a strict hub-and-spoke topology.
- **Comparison Against Actual Build**:
  - **Match**: All 39 planned routes in sections 2.1 through 2.5 of the strategy document **exist and are verified live in production**.
  - **Unimplemented Roadmap (Section 4)**: Section 4 defines the P3 roadmap: Integration Landing Pages (`/integrations/*`), Educational Blog (`/blog/*`), and Customer Case Studies (`/case-studies/*`). As noted above, none of these three expansion clusters have been created in the codebase yet.

---

## PART 3 — WHAT'S GOOD / WHAT'S BAD

### What's Genuinely Working Well
1. **Full-DOM SSG Prerendering**: Production delivers 100% prerendered semantic HTML across all 42 routes. Non-JS crawlers receive real headings, paragraphs, navigation, tables, and internal links.
2. **Exemplary Content Footprint**: 39 indexable pages representing ~50,000 words of tailored B2B financial copy across features, alternatives, verticals, and resource guides.
3. **100% Policy-Compliant Structured Data**: Zero fake reviews, zero fabricated `aggregateRating` markup, and zero duplicate `SoftwareApplication` blocks. All schemas validate cleanly against Schema.org specifications.
4. **Per-Route Metadata Integrity**: 39 out of 39 indexable routes serve unique, non-fallback `<title>`, `<meta name="description">`, `og:title`, and `twitter:title` tags in their initial HTML response.
5. **Clean Sitemap & robots.txt Alignment**: `sitemap.xml` contains exactly the 39 indexable public pages (zero auth or token routes), with updated `lastmod` timestamps. Private application paths are barred in `robots.txt`.
6. **Optimized Asset Delivery**: `logo.webp` is a featherweight 17 KB square graphic. Font preloading eliminates chaining for custom display typefaces.
7. **Architectural Code Splitting**: All authenticated dashboard, invoice, and analytics bundles are split via `React.lazy()`, protecting landing page payload size.

---

### What's Broken, Incomplete, or Risky

#### 🔴 Critical Issues
1. **Scrambled Homepage `<h1>` in Raw HTML**:
   - In `Landing.tsx`, the hero H1 renders via `DecryptText`. Because `useEffect` never runs on server prerendering, `renderToString()` stamps random scrambled characters (`PqKHwigGNd9Q4llc4X6wpNf862Diq5a14hTBjddDmWHal9UxcA4vF`) with `opacity: 0` into production HTML.
   - **Impact**: Non-JS search engine crawlers extract unintelligible gibberish as the primary H1 of the entire website.
2. **Circular 308 Redirect vs Canonical Tag Contradiction**:
   - Vercel HTTP layer redirects `https://jaktra.site/*` $\rightarrow$ `https://www.jaktra.site/*` (308 Permanent).
   - HTML `<link rel="canonical">` across all 39 pages points to `https://jaktra.site/*` (without `www`).
   - **Impact**: Severe canonical conflict. Search engines crawling `www` are directed back to the apex domain, which immediately redirects back to `www`.
3. **Severe Mobile Layout Shift (CLS = 1.3956)**:
   - Measured live via Playwright mobile Chromium at **1.3956** (14× higher than Google's acceptable threshold of 0.10). Caused by client-side text decrypting, metric cycling, and unconstrained animated SVGs shifting layout during hydration.

#### 🟡 High Severity Issues
4. **Template Schema Leak**:
   - The homepage's 12-question `FAQPage` and `SoftwareApplication` schemas are hardcoded in `index.html`. They are copied into the `<head>` of all 41 subpages, causing privacy policies and use-case pages to display unrelated dunning FAQ schemas.
5. **Local Build Contamination in `scripts/prerender.mjs`**:
   - The SSG script reads `dist/index.html` as its template. If `dist/index.html` already contains prerendered body DOM from a prior build pass, `replace('<div id="root"></div>', ...)` fails silently, baking the homepage body into all subpages in local builds.

#### 🟠 Medium Severity Issues
6. **`robots.txt` Blocking Noindexed Auth Routes**:
   - `/login`, `/register`, and `/forgot-password` are disallowed in `robots.txt`. Googlebot cannot crawl them to see their `<meta name="robots" content="noindex, nofollow" />` tags, which can lead to indexation of bare URLs if linked externally.
7. **Open Graph Image Dimension Discrepancy**:
   - `og-image.png` is 1200 × 603 px (1.99:1 aspect ratio) rather than the standard 1200 × 630 px (1.91:1) required by Meta and LinkedIn for pixel-perfect card rendering.
8. **Documentation Page is a Thin Stub**:
   - `/docs` contains only ~32 words of placeholder text. For a B2B finance automation tool, thin documentation impairs credibility and search ranking for technical integration keywords.

---

## PART 4 — UPDATED SCORECARD

| Category | Original Score (Baseline) | Prior Score (Sept 11) | Current Score (Sept 12 Ground Truth) | Justification & Verification Notes |
|---|:---:|:---:|:---:|---|
| **Crawlability** | 1/10 | 5/10 | **6.5/10** | Full DOM prerendering is live on all 42 routes. Sitemap has all 39 public URLs. Held back by the 308 redirect vs canonical conflict and disallowing noindex auth pages in robots.txt. |
| **Metadata** | 2/10 | 7/10 | **8.0/10** | All 39 pages have unique, descriptive title, description, og:title, and twitter:title tags. Auth pages correctly omit canonicals and enforce noindex. Docked 2 points for the apex vs www canonical contradiction. |
| **Structured Data** | 0/10 | 7/10 | **7.5/10** | Zero fake reviews or aggregateRating policy violations. Page-specific Article, TechArticle, Product, and CollectionPage schemas are prerendered in raw HTML. Docked 2.5 points for the template FAQ/SoftwareApplication leak across all subpages. |
| **Heading Hierarchy** | 0/10 | 3/10 | **4.0/10** | Subpages have clear, keyword-aligned `<h1>` and `<h2>` structures in raw HTML. Severely docked because the homepage H1 is literal scrambled gibberish in production raw HTML. |
| **Content Coverage** | 2/10 | 8/10 | **8.5/10** | Exceptional breadth: 39 live routes covering 8 industry verticals, 5 competitor comparisons, 6 feature deep-dives, and 10 tactical resources. Lacks integration landing pages, blog, and customer case studies. |
| **Performance** | 4/10 | 5/10 | **3.5/10** | Code splitting and font preloading are implemented, but real mobile instrumentation reveals a catastrophic CLS of 1.3956, FCP of 3.8s, and LCP of 5.5s on mobile devices. |
| **Mobile Experience** | 6/10 | 6/10 | **5.5/10** | Responsive Tailwind CSS layouts and viewport meta tags are present, but the violent mobile layout shift creates a jarring user experience. |
| **URL Structure** | 5/10 | 8/10 | **8.5/10** | Clean, logical, descriptive URL slugs arranged in intuitive hub-and-spoke directories (`/features/*`, `/compare/*`, `/use-cases/*`, `/resources/*`). |
| **Internal Linking** | 2/10 | 6/10 | **8.0/10** | Comprehensive breadcrumbs with BreadcrumbList schema on all subpages, rich footer links, and contextual cross-links between verticals and features. |
| **OVERALL** | **2.4/10** | **6.1/10** | **6.7/10** | **Substantial real progress from the 2.4 baseline.** Prerendering and metadata are genuinely operational, but the homepage H1 scramble bug, domain canonical contradiction, and mobile CLS prevent this from reaching elite tier (8.5+). |

---

## PART 5 — PRIORITIZED NEXT STEPS

### P0 — Fix Before Anything Else (Immediate Release Blockers)

1. **Fix Homepage Hero H1 Server Rendering (`Landing.tsx`)**
   - **Problem**: `DecryptText` renders random scrambled characters on initial render because `useEffect` only runs client-side.
   - **Fix**: Update `DecryptText` to render the real plain text by default on the server, initiating the scramble effect only after client mount.
   - **Code Diff Target**:
     ```tsx
     // Before
     const [displayed, setDisplayed] = useState(() => text.split("").map(() => CHARS[Math.floor(Math.random() * CHARS.length)]));
     // After: SSR outputs real text; client useEffect scrambles/decrypts
     const [isMounted, setIsMounted] = useState(false);
     useEffect(() => { setIsMounted(true); }, []);
     return <span>{isMounted && !done ? displayed.map(...) : text}</span>;
     ```

2. **Resolve Apex vs `www` Domain & Canonical Contradiction**
   - **Decision**: Align HTTP redirects and canonical URLs to a single authoritative origin.
   - **Action**: Either configure Vercel domain settings to redirect `https://www.jaktra.site` $\rightarrow$ `https://jaktra.site` (matching current code), OR update `SITE_URL` in `SEOHead.tsx`, `prerender.mjs`, `robots.txt`, and `sitemap.xml` to `https://www.jaktra.site`.

3. **Fix Template Schema Leak in `frontend/index.html` & `prerender.mjs`**
   - **Problem**: Homepage `SoftwareApplication` and 12-item `FAQPage` are hardcoded in `index.html` and leak into all subpages.
   - **Fix**: Remove hardcoded schemas from `index.html`. Inject `SoftwareApplication` and homepage `FAQPage` exclusively via `SEOHead` on the homepage route.

4. **Fix SSG Prerender Build Script Template Source (`scripts/prerender.mjs`)**
   - **Fix**: Ensure `templateHtml` is read from a clean, untouched base template or cached before the loop starts, preventing mutably overwritten `dist/index.html` from contaminating subsequent subroute builds.

---

### P1 — High Impact (Address in Next Sprint)

5. **Stabilize Mobile CLS (Target CLS $\le 0.10$)**
   - Reserve explicit CSS `min-height` / aspect-ratio containers for the hero animated headline, typewriter metrics, and SVG area charts to eliminate layout jumping during React hydration.
6. **Remove Auth Routes from `robots.txt` Disallow**
   - Remove `/login`, `/register`, and `/forgot-password` from `robots.txt` Disallow rules so search crawlers can reach the pages, parse `<meta name="robots" content="noindex, nofollow" />`, and drop them from search results cleanly.
7. **Resize Open Graph Image to 1200 × 630 px**
   - Re-export `public/og-image.png` at exact 1200 × 630 dimensions (1.91:1 aspect ratio) and update `<meta property="og:image:height" content="630" />`.
8. **Expand `/docs` into a Substantive Technical Hub**
   - Replace the ~32-word mock page with real setup guides for SendGrid SMTP, Razorpay webhooks, and CSV schema formats to capture high-intent technical queries.

---

### P2 — Strategic Growth (Execute Content Roadmap)

9. **Build Priority Integration Landing Pages**
   - Implement dedicated pages for `/integrations/sendgrid`, `/integrations/resend`, and `/integrations/razorpay` as outlined in `SEO_CONTENT_STRATEGY.md`.
10. **Establish Thought Leadership Blog Engine (`/blog`)**
    - Deploy an MDX-based static blog targeting informational queries around Cash Conversion Cycle (CCC), DSO formulas, and B2B dunning psychology.
11. **Publish Verified Case Studies (`/case-studies`)**
    - Create quantitative customer success stories showcasing verified DSO compression and automated bad debt recovery.

# Jaktra SEO Status Audit — 2026-09-11

> **Auditor**: Senior SEO Engineer (automated agent)
> **Audit date**: 2026-09-11T04:00 IST
> **Method**: Raw HTTP fetch (`Invoke-WebRequest`, no JS execution) against `https://www.jaktra.site` for every check. Codebase files read fresh. No assumptions carried from prior sessions.

---

## PART 1 — TECHNICAL INFRASTRUCTURE STATE CHECK

---

### 1. Prerendering

| Check | Result | Evidence |
|---|---|---|
| `jaktra.site/` redirect | **308 Permanent Redirect to `https://www.jaktra.site/`** | `Invoke-WebRequest -MaximumRedirection 0` returns 308, Location header = `https://www.jaktra.site/` |
| `www.jaktra.site/` body content | **EMPTY `<div id="root"></div>`** — zero prerendered body content | Root div inner HTML = 0 chars. Total HTML = 11,520 bytes (all in `<head>`) |
| H1 tags in raw HTML | **0** on every page | Regex match for `<h1` returns 0 on `/`, `/privacy`, `/terms`, `/docs`, `/login`, `/register`, `/forgot-password` |
| Visible text in body | **None** — the body is `<div id="root"></div><script type="module" src="...">` only | All content is client-side rendered by React after JS execution |

> **⚠️ CRITICAL: This is the single biggest SEO issue.** There is **no server-side rendering (SSR) and no static prerendering of body content**. The Vite build plugin generates per-route `index.html` files with correct `<head>` metadata (title, description, canonical, JSON-LD), but the `<body>` contains only an empty `<div id="root"></div>`. Googlebot can execute JS, but it deprioritizes JS-rendered content, may miss it entirely on crawl-budget-constrained sites, and the first render is delayed. Every `<h1>`, `<h2>`, `<p>`, FAQ accordion, and visible text on every page is invisible to non-JS crawlers (social media scrapers, many SEO tools, archive.org, Bing, etc.).

**Build command**: `vercel.json` specifies `"buildCommand": "npm run build"`, which runs Vite's standard build. The Vite plugin (`subrouteHtmlPlugin`) generates static per-route HTML files with updated `<head>` tags at build time. The Vercel catch-all rewrite `"/(.*)" -> "/index.html"` means routes WITHOUT a matching static file fall back to the root `index.html`.

**Discrepancy from prior reports**: Prior sessions reported "prerendering" as implemented. What was actually implemented is **static metadata injection** (correct `<head>` per route), NOT body prerendering. This is a meaningful distinction — the `<head>` metadata is correct and genuinely useful for social sharing and basic indexing signals, but the body content (headings, text, links, FAQ markup) is completely absent from the raw HTML.

---

### 2. Metadata

#### Homepage (`/`)

| Tag | Value | Status |
|---|---|---|
| `<title>` | Jaktra - AI-Powered Accounts Receivable Automation | ✅ |
| `<meta name="description">` | Automate B2B collections with AI-powered 5-stage tone escalation... | ✅ |
| `og:title` | Jaktra - AI-Powered Accounts Receivable Automation | ✅ |
| `og:description` | Same as meta description | ✅ |
| `og:image` | `https://jaktra.site/og-image.png` | ✅ (live, 165KB) |
| `og:url` | `https://jaktra.site/` | ✅ |
| `twitter:card` | summary_large_image | ✅ |
| `twitter:image` | `https://jaktra.site/og-image.png` | ✅ |
| `<link rel="canonical">` | `https://jaktra.site/` | ✅ |

#### Sub-pages with custom static HTML (privacy, terms, docs, pricing, + 27 content pages)

| Tag | Status | Notes |
|---|---|---|
| `<title>` | ✅ Unique per page | Correctly replaced by Vite plugin |
| `<meta name="description">` | ✅ Unique per page | Correctly replaced |
| `og:description` | ✅ Matches description | Correctly replaced |
| `og:url` | ✅ Matches canonical | Correctly replaced |
| `<link rel="canonical">` | ✅ Unique per page | Correctly replaced |
| **`og:title`** | **❌ HOMEPAGE DEFAULT on all sub-pages** | Still shows "Jaktra - AI-Powered Accounts Receivable Automation" on `/privacy`, `/docs`, `/pricing`, `/use-cases/saas`, etc. |
| **`twitter:title`** | **❌ HOMEPAGE DEFAULT on all sub-pages** | Same issue — not replaced by Vite plugin |

> **⚠️ BUG: The Vite build plugin does NOT replace `og:title` or `twitter:title`.** The plugin replaces `<title>`, `meta description`, `og:description`, `twitter:description`, `canonical`, and `og:url` — but the `og:title` and `twitter:title` tags keep the homepage fallback value. When shared on social media or in Slack/Discord previews, every page shows the same title. This is a straightforward bug in the plugin — it needs two more `.replace()` calls.

#### Auth pages (login, register, forgot-password)

| Tag | Status |
|---|---|
| `<title>` | ✅ Unique ("Sign In - Jaktra", "Get Started - Jaktra", "Reset Password - Jaktra") |
| `noindex,nofollow` | ✅ Present |
| canonical removed | ✅ Canonical tag replaced with robots noindex |
| Excluded from sitemap | ✅ |

#### 6 Newest content pages (added after last deploy)

| Route | Title in raw HTML | Issue |
|---|---|---|
| `/resources/invoice-dispute-response-templates` | ❌ HOMEPAGE DEFAULT | **Not deployed — serving root index.html fallback** |
| `/resources/accounts-receivable-query-management` | ❌ HOMEPAGE DEFAULT | Same |
| `/resources/client-questioning-billable-hours` | ❌ HOMEPAGE DEFAULT | Same |
| `/resources/client-disputed-invoice-what-to-do` | ❌ HOMEPAGE DEFAULT | Same |
| `/resources/how-to-manage-accounts-receivable-emails` | ❌ HOMEPAGE DEFAULT | Same |
| `/resources/best-b2b-finance-automation-tools` | ❌ HOMEPAGE DEFAULT | Same |

> **⚠️ STALE DEPLOYMENT: These 6 pages have entries in `vite.config.ts` PUBLIC_SUBROUTES and `App.tsx` routes, but are NOT getting their custom metadata in production.** The Vercel catch-all rewrite is serving the root `index.html` instead of per-route static files. Evidence: `/compare/kolleno-alternative` (which was in an earlier deploy) DOES have correct metadata, confirming the Vite plugin works — these 6 pages were simply added after the last deployment. All 6 are also missing from `sitemap.xml` and have their canonical pointing to `/` (homepage), which tells Google to treat them as homepage duplicates.

---

### 3. Structured Data — Full Re-Audit

#### Homepage JSON-LD blocks (from raw HTML)

| # | @type | Status |
|---|---|---|
| 1 | Organization | ✅ Valid, clean, no fabricated data |
| 2 | WebSite | ✅ Valid, references Organization @id |
| 3 | SoftwareApplication | ✅ Valid, includes Offer (price: 0, Early Access) |
| 4 | FAQPage | ✅ Valid, 12 Q&A pairs matching real product features |

**Duplicate SoftwareApplication check**: ✅ **FIXED** — only 4 JSON-LD blocks in raw HTML, no client-side re-injection duplicates. The `SEOHead` component includes deduplication logic (`deduplicatedJsonLd`) that filters schemas already present in the DOM.

**aggregateRating / Review check**: ✅ **NOT PRESENT** — confirmed. No `aggregateRating`, no `Review`, no `ratingValue` anywhere in homepage HTML. The fabricated rating risk flagged previously has been resolved.

**Content pages structured data**: The `seo-schemas.ts` file defines Article/TechArticle/HowTo schemas for ~30 content pages, injected via client-side `SEOHead`. These schemas are:
- ✅ Structurally valid (correct @type, author, publisher, datePublished)
- ⚠️ **Only visible after JS execution** — not in raw HTML
- Hub pages (Compare, Features, Use Cases, Resources) use `CollectionPage` with `ItemList` — appropriate

> **External validation needed**: This audit can confirm structural validity and the absence of fabricated data. It cannot replace a run through Google's Rich Results Test at `https://search.google.com/test/rich-results` against the live URL, which tests JS rendering AND schema correctness. Recommend running the live URL through both the Rich Results Test and `validator.schema.org` as a manual follow-up.

---

### 4. robots.txt / sitemap.xml / llms.txt

#### robots.txt (live at `https://www.jaktra.site/robots.txt`)

```
User-agent: *
Allow: /
Disallow: /invoices
Disallow: /agent
Disallow: /analytics
Disallow: /disputes
Disallow: /payment-plans
Disallow: /settings
Disallow: /activity-log
Disallow: /dlq
Disallow: /invite
Disallow: /i/
Sitemap: https://jaktra.site/sitemap.xml
```

**Status**: ✅ Correct. All authenticated routes are disallowed. Sitemap reference present. Cross-checked against `App.tsx` protected routes — all match. Minor: `/login`, `/register`, `/forgot-password` are not disallowed (they have `noindex` tags instead, which is fine).

#### sitemap.xml

- **URL count**: 33
- **Auth routes excluded**: ✅ (`/login`, `/register`, `/forgot-password` not present)
- **All `lastmod` dates**: 2026-09-08 or 2026-09-09

**Missing from sitemap** (6 pages that exist in `App.tsx` and `vite.config.ts`):

| Missing Route | In App.tsx? | In vite.config.ts? |
|---|---|---|
| `/resources/invoice-dispute-response-templates` | ✅ | ✅ |
| `/resources/accounts-receivable-query-management` | ✅ | ✅ |
| `/resources/client-questioning-billable-hours` | ✅ | ✅ |
| `/resources/client-disputed-invoice-what-to-do` | ✅ | ✅ |
| `/resources/how-to-manage-accounts-receivable-emails` | ✅ | ✅ |
| `/resources/best-b2b-finance-automation-tools` | ✅ | ✅ |

> **⚠️ Sitemap is stale.** These 6 content pages were added to the codebase but NOT to `sitemap.xml`. The sitemap is a static file in `/public/sitemap.xml` — it must be manually updated when new pages are added.

#### llms.txt

- **Status**: ✅ Live, 200 OK, well-structured
- Covers core pages, hub pages, and key capabilities
- Missing: the 6 newest resource pages (acceptable — llms.txt is curated, not exhaustive)

---

### 5. Images / Social Assets

| Asset | URL | Status | Size |
|---|---|---|---|
| `og-image.png` | `https://www.jaktra.site/og-image.png` | ✅ 200 OK | 165,810 bytes (162 KB) |
| `logo.webp` | `https://www.jaktra.site/logo.webp` | ✅ 200 OK | 17,878 bytes (17 KB) |
| `favicon.svg` | `/favicon.svg` | ✅ Present in public/ | 115,958 bytes |

**Dimension check**: Cannot verify exact pixel dimensions via HEAD request. The HTML declares `og:image:width="1200"` and `og:image:height="603"`. Slightly non-standard (1200x630 recommended) but acceptable.

---

### 6. Performance

**PageSpeed Insights API**: Rate-limited (429 Too Many Requests) during this audit. Cannot provide fresh LCP/CLS/TBT/FCP numbers.

**What can be verified from the codebase:**

| Optimization | Status | Evidence |
|---|---|---|
| Font preloading | ✅ Implemented | 3 local woff2 fonts preloaded, Google Fonts loaded async with `media="print" onload` |
| Google Fonts non-render-blocking | ✅ Implemented | `<link rel="preload" as="style">` + `onload` swap pattern |
| Route-based code splitting (public content) | ✅ Implemented | All content pages use `lazy()` imports in `App.tsx` |
| Route-based code splitting (dashboard) | ✅ Implemented | Dashboard, Invoices, Agent, Analytics, Settings, etc. all lazy-loaded |
| CLS mitigation (font FOUT) | ⚠️ Partially implemented | Font preloading helps, but without prerendered body content, CLS depends on client-side rendering timing |

> **Cannot confirm CLS fix** without fresh PageSpeed data. The prior audit reported CLS = 0.13 (orange). Font preloading should help, but the fundamental SPA architecture means layout shifts from JS rendering will persist.

---

### 7. Google Search Console

> **Status: UNVERIFIABLE FROM THIS ENVIRONMENT.** This agent has no access to Google Search Console. Cannot confirm whether:
> - Sitemap was submitted
> - URL inspection / indexing requests were made
> - Any indexing issues were reported
>
> **This must be confirmed manually by the site owner.**

---

## PART 2 — CONTENT INVENTORY

### Full Page Table

| # | Route | Page Type | Word Count (approx.) | Has Unique Metadata? | Target Keyword | Status |
|---|---|---|---|---|---|---|
| 1 | `/` | Landing page | ~2,000+ (JS-rendered) | ✅ | "AI accounts receivable automation" | ✅ Live |
| 2 | `/privacy` | Legal | ~3,000 | ✅ | — | ✅ Live |
| 3 | `/terms` | Legal | ~3,500 | ✅ | — | ✅ Live |
| 4 | `/docs` | Documentation | ~500 (mock) | ✅ | — | ✅ Live |
| 5 | `/pricing` | Pricing | ~3,000 | ✅ | "AR automation pricing" | ✅ Live |
| 6 | `/features` | Hub | ~4,000 | ✅ | "AR automation features" | ✅ Live |
| 7 | `/features/5-stage-escalation` | Feature deep-dive | ~4,500 | ✅ | "AR tone escalation" | ✅ Live |
| 8 | `/features/dispute-triage` | Feature deep-dive | ~3,500 | ✅ | "invoice dispute triage" | ✅ Live |
| 9 | `/features/installment-plans` | Feature deep-dive | ~3,500 | ✅ | "B2B payment plans" | ✅ Live |
| 10 | `/features/zero-login-portal` | Feature deep-dive | ~3,500 | ✅ | "invoice payment links" | ✅ Live |
| 11 | `/features/email-deliverability` | Feature deep-dive | ~4,500 | ✅ | "invoice email spam" | ✅ Live |
| 12 | `/features/risk-scoring` | Feature deep-dive | ~3,000 | ✅ | "AR risk scoring" | ✅ Live |
| 13 | `/compare` | Hub | ~4,000 | ✅ | "AR software comparison" | ✅ Live |
| 14 | `/compare/highradius-vs-jaktra` | Comparison | ~3,000 | ✅ | "HighRadius alternative" | ✅ Live |
| 15 | `/compare/highradius-alternative` | Comparison (alias) | Same page | ✅ (canonical -> highradius-vs-jaktra) | — | ✅ Live |
| 16 | `/compare/upflow-alternative` | Comparison | ~3,000 | ✅ | "Upflow alternative" | ✅ Live |
| 17 | `/compare/chaser-alternative` | Comparison | ~3,500 | ✅ | "Chaser alternative" | ✅ Live |
| 18 | `/compare/paidnice-alternative` | Comparison | ~3,000 | ✅ | "PaidNice alternative" | ✅ Live |
| 19 | `/compare/kolleno-alternative` | Comparison | ~4,000 | ✅ | "Kolleno alternative" | ✅ Live |
| 20 | `/use-cases` | Hub | ~5,000 | ✅ | "AR industry solutions" | ✅ Live |
| 21 | `/use-cases/saas` | Use case | ~5,500 | ✅ | "SaaS accounts receivable" | ✅ Live |
| 22 | `/use-cases/agencies` | Use case | ~4,500 | ✅ | "agency AR automation" | ✅ Live |
| 23 | `/use-cases/manufacturing` | Use case | ~5,000 | ✅ | "manufacturing AR" | ✅ Live |
| 24 | `/use-cases/professional-services` | Use case | ~4,500 | ✅ | "professional services AR" | ✅ Live |
| 25 | `/use-cases/construction` | Use case | ~4,500 | ✅ | "construction AR" | ✅ Live |
| 26 | `/use-cases/logistics-freight` | Use case | ~4,500 | ✅ | "logistics freight AR" | ✅ Live |
| 27 | `/use-cases/staffing-recruiting` | Use case | ~4,500 | ✅ | "staffing AR automation" | ✅ Live |
| 28 | `/use-cases/wholesale-distribution` | Use case | ~5,500 | ✅ | "wholesale distribution AR" | ✅ Live |
| 29 | `/resources` | Hub | ~6,000 | ✅ | "AR guides resources" | ✅ Live |
| 30 | `/resources/how-to-reduce-dso` | Pillar guide | ~5,000 | ✅ | "how to reduce DSO" | ✅ Live |
| 31 | `/resources/5-stage-ar-tone-escalation` | Resource | ~4,500 | ✅ | "invoice escalation tone" | ✅ Live |
| 32 | `/resources/b2b-dunning-email-templates` | Resource | ~5,500 | ✅ | "dunning email templates" | ✅ Live |
| 33 | `/resources/ar-automation-roi-calculator` | Interactive tool | ~5,500 | ✅ | "AR automation ROI" | ✅ Live |
| 34 | `/resources/best-b2b-finance-automation-tools` | Resource guide | ~8,000 | ❌ HOMEPAGE FALLBACK | "best B2B finance automation" | ⚠️ Metadata broken |
| 35 | `/resources/invoice-dispute-response-templates` | Resource | ~5,000 | ❌ HOMEPAGE FALLBACK | "invoice dispute response" | ⚠️ Metadata broken |
| 36 | `/resources/accounts-receivable-query-management` | Resource | ~4,500 | ❌ HOMEPAGE FALLBACK | "AR query management" | ⚠️ Metadata broken |
| 37 | `/resources/client-questioning-billable-hours` | Resource | ~3,500 | ❌ HOMEPAGE FALLBACK | "client questioning hours" | ⚠️ Metadata broken |
| 38 | `/resources/client-disputed-invoice-what-to-do` | Resource | ~3,000 | ❌ HOMEPAGE FALLBACK | "client disputed invoice" | ⚠️ Metadata broken |
| 39 | `/resources/how-to-manage-accounts-receivable-emails` | Resource | ~3,000 | ❌ HOMEPAGE FALLBACK | "manage AR emails" | ⚠️ Metadata broken |

**Total public content pages**: 39 (including 3 auth pages with noindex)
**Pages with correct static metadata**: 33
**Pages with broken/fallback metadata**: 6

### Content Types — Built vs. Planned

| Content Type | Status | Count |
|---|---|---|
| Use-case pages (industry verticals) | ✅ Built | 8 verticals + 1 hub |
| Competitor comparison pages | ✅ Built | 5 comparisons + 1 hub |
| Feature deep-dive pages | ✅ Built | 6 features + 1 hub |
| Resource/guide pages | ✅ Built | 10 resources + 1 hub |
| DSO/glossary pillar content | ✅ Built | 1 (DSO guide with HowTo schema) |
| ROI calculator (interactive tool) | ✅ Built | 1 |
| Pricing page | ✅ Built | 1 |
| Blog | ❌ Not built | — |
| Integration-specific pages | ❌ Not built | — |
| Case studies | ❌ Not built | — |

### SEO_CONTENT_STRATEGY.md

**Does not exist in the repository.** No file with that name found anywhere in the project tree.

---

## PART 3 — WHAT'S GOOD / WHAT'S BAD

### ✅ What's Genuinely Working Well

1. **Massive content footprint for an early-stage product** — 36 unique public pages covering features, comparisons, use cases, and resources. Exceptional content velocity.

2. **Metadata infrastructure is sound** — The Vite build plugin correctly generates per-route static HTML with unique `<title>`, `<meta description>`, `<link rel="canonical">`, `og:description`, `twitter:description`, and `og:url` for 33/39 pages.

3. **Structured data is clean and policy-compliant** — 4 JSON-LD schemas on homepage (Organization, WebSite, SoftwareApplication, FAQPage). No fabricated ratings, no fake reviews, no aggregateRating.

4. **Canonical tags are correctly handled** — Each page has a unique canonical URL. The HighRadius alias correctly canonicalizes. Auth pages have noindex instead of canonical.

5. **robots.txt correctly blocks all authenticated routes** — 10 disallow rules covering every protected path.

6. **Social assets are live and accessible** — `og-image.png` (162 KB) and `logo.webp` (17 KB) both return 200.

7. **Code splitting is fully implemented** — Every content page and all dashboard routes use `lazy()` imports.

8. **Font loading is optimized** — 3 local fonts preloaded, Google Fonts loaded async.

9. **llms.txt is well-structured** — Covers core pages, hubs, and key capabilities.

10. **Auth page noindex is working** — Login, Register, Forgot-Password all have noindex in production HTML.

11. **SEOHead component has deduplication logic** — Prevents duplicate JSON-LD injection during client-side hydration.

12. **Hub pages use CollectionPage + ItemList schema** — Correct structured data pattern for directory pages.

---

### ❌ What's Broken, Incomplete, or Risky

1. **🔴 CRITICAL: No prerendered body content on any page.** Every page serves `<div id="root"></div>` with zero visible content in raw HTML. This is the #1 SEO blocker.

2. **🔴 CRITICAL: Homepage has NO `<h1>` element** — even in the React-rendered DOM. `Landing.tsx` contains zero `<h1>` tags. The hero uses `<span>` with a typewriter animation.

3. **🟡 HIGH: `og:title` and `twitter:title` not replaced by Vite plugin** on any sub-page. All sub-pages show the homepage title in social previews. 2-line fix.

4. **🟡 HIGH: 6 newest content pages have broken metadata** — serving homepage fallback title, description, and canonical. Stale deployment.

5. **🟡 HIGH: Sitemap is stale** — 6 recently-added pages missing. Manual static file, no automation.

6. **🟠 MEDIUM: Heading hierarchy is client-side only** — All `<h1>` tags are in React components, invisible in raw HTML.

7. **🟠 MEDIUM: Per-page structured data is client-side only** — Article/TechArticle/HowTo schemas require JS execution to appear.

8. **🟠 MEDIUM: Description mismatch** between Vite plugin and SEOHead component for some pages (e.g., `/use-cases/saas`).

9. **🟡 HIGH: No external validator runs confirmed** — Schema not validated against Google Rich Results Test.

10. **🟠 MEDIUM: PageSpeed metrics unverifiable** — API rate-limited. Prior CLS issue status unknown.

11. **🟢 LOW: `llms.txt` missing 6 newest pages.**

12. **🟢 LOW: Auth routes not Disallowed in robots.txt** (have noindex instead, which is sufficient).

---

## PART 4 — UPDATED SCORECARD

| Category | Original Score | Current Score | Notes |
|---|---|---|---|
| **Crawlability** | 1/10 | **5/10** | Correct robots.txt, sitemap (mostly), canonical tags, noindex on auth, 308 redirect. Body is JS-only, 6 pages missing from sitemap. |
| **Metadata** | 2/10 | **7/10** | 33/39 pages have unique title, description, canonical. og:title/twitter:title broken. 6 newest pages have fallback metadata. |
| **Structured Data** | 0/10 | **7/10** | 4 clean homepage schemas in raw HTML, no fabricated data. Per-page schemas are JS-only. Not externally validated. |
| **Heading Hierarchy** | 0/10 | **3/10** | Most content pages have `<h1>` in React. Homepage has NO `<h1>`. All headings JS-rendered only. |
| **Content Coverage** | 2/10 | **8/10** | 36 unique public pages. No blog, no integrations pages, no case studies. |
| **Performance** | 4/10 | **5/10** | Code splitting, font preloading, async Google Fonts. Cannot verify CLS fix. SPA inherently slower. |
| **Mobile** | 6/10 | **6/10** | No new data. Viewport tag present, responsive classes used. |
| **URL Structure** | 5/10 | **8/10** | Clean hierarchical URLs. Hub pages at parent paths. Canonical handling correct. |
| **Internal Linking** | 2/10 | **6/10** | Hub pages link to children. Footer links. Cross-links. All JS-rendered. |
| **Overall** | **2.4/10** | **6.1/10** | Huge improvement in content, metadata, structured data. Held back by SPA rendering limitation. |

**Score justification**: The jump from 2.4 to 6.1 is driven by content coverage (2→8), metadata (2→7), structured data (0→7), and URL structure (5→8). Scores would be 8-9/10 if body content were prerendered.

---

## PART 5 — PRIORITIZED NEXT STEPS

### P0 — Fix Before Anything Else

1. **Fix `og:title` and `twitter:title` in Vite plugin** — Add 2 regex replacements in `subrouteHtmlPlugin`. ~10 line change. Every social share currently shows wrong title.

2. **Deploy latest build** — 6 newest pages are in `vite.config.ts` but not in production. Trigger fresh Vercel deploy.

3. **Update `sitemap.xml`** — Add 6 missing URLs. Update `lastmod` dates. Consider automating generation.

4. **Add `<h1>` to Landing.tsx** — The hero heading should be `<h1>`, not `<span>`.

### P1 — High Impact, Do Soon

5. **Implement prerendering or SSR** — Options: prerender.io service, Next.js migration, or extended Vite plugin with `<noscript>` fallbacks.

6. **Reconcile Vite plugin descriptions with SEOHead descriptions** — Consolidate to single source of truth.

7. **Run Google Rich Results Test** against live URLs. Confirm schemas render and qualify for rich results.

8. **Submit sitemap to Google Search Console** and run URL Inspection on key pages.

### P2 — Important but Can Wait

9. **Automate sitemap generation** from `PUBLIC_SUBROUTES` at build time.

10. **Run fresh PageSpeed Insights** and fix remaining CLS/LCP issues.

11. **Build integration pages** (`/integrations/sendgrid`, `/integrations/razorpay`).

12. **Start a blog** — 1 post/month on AR topics for domain authority.

13. **Create `SEO_CONTENT_STRATEGY.md`** — Document keyword targets, content calendar, competitive positioning.

14. **Update `llms.txt`** with 6 newest resource pages.

15. **Add Disallow rules for auth routes** to `robots.txt`.

---

> **Bottom line**: The SEO infrastructure has improved dramatically from the 2.4/10 baseline. The content breadth is impressive for an early-stage product. But the single biggest issue — the SPA rendering limitation — caps the entire effort. All 36 pages of carefully written content, structured data, and heading hierarchy are invisible to non-JS crawlers. Fixing the P0 items (og:title, deploy, sitemap, h1) is quick and high-value. Solving prerendering (P1) is the unlock that turns this from a 6/10 into a 9/10.

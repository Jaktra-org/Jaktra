# SEO Implementation Plan — Post-Audit Remediation

> **Source audit**: [SEO_STATUS_AUDIT_2026-09-11.md](file:///c:/Users/sures/Desktop/Jaktra/SEO_STATUS_AUDIT_2026-09-11.md)
> **Audit overall score**: 6.1/10 (up from 2.4/10 baseline)
> **Pipeline Architecture**: Pure Node.js SSG (`entry-server.tsx` + `scripts/prerender.mjs` + React 19 / `SEOHead`) replacing obsolete `subrouteHtmlPlugin`.

---

## 1. Priority Definitions

| Priority | Meaning | SLA | Status |
|---|---|---|---|
| **P0** | Critical bug or policy risk — broken today, causes measurable harm. Fix immediately. | This session | All Resolved / In Verification |
| **P1** | High — significant SEO or functional impact. Do within days. | This week | All Code Items Resolved |
| **P2** | Medium — infrastructure improvements, automation. | Next 1–2 weeks | SSG & Auto-sitemap Completed |
| **P3** | Content & long-term growth — new pages, strategy docs, blog. | Ongoing | Backlog |

---

## 2. Status & Pipeline Re-Verification Summary

Following the completion of **Item 11 (Pure Node.js SSG prerendering)**, the entire head injection and static HTML generation architecture has been modernized:
- **`subrouteHtmlPlugin` is completely removed** from `vite.config.ts`.
- **`entry-server.tsx`** statically imports and renders all 42 routes (39 public + 3 auth utility pages) via `ReactDOMServer.renderToString()`.
- **`SEOHead`** is the **sole single source of truth** for all page metadata (`title`, `description`, `canonical`, `og:*`, `twitter:*`, and JSON-LD).
- **`scripts/prerender.mjs`** extracts hoisted metadata tags from the server render output, replaces the corresponding tags in `dist/*/index.html`, and writes out full body DOM.
- **Sitemap generation** is fully automated inside `scripts/prerender.mjs` across all 39 public routes, permanently eliminating static sitemap drift.

---

## 3. Items Status & Details

---

### P0 — Fix Immediately

---

#### 1. Fix `og:title` and `twitter:title` in Vite build plugin
- **Priority:** P0
- **Status:** ✅ **RESOLVED (as direct result of SSG prerender rewrite)**
- **Audit Source:** §2 (lines 55–58), Part 3 item 3, Part 5 item 1
- **Resolution Details:**
  The old `subrouteHtmlPlugin` regex replacement in `vite.config.ts` is obsolete because `subrouteHtmlPlugin` was completely removed. `SEOHead` provides page-specific `og:title` and `twitter:title`. In `scripts/prerender.mjs`, hoisted `<meta property="og:title">` and `<meta name="twitter:title">` tags are extracted from `entry-server.tsx`'s render output and injected into each `dist/*/index.html`. Every sub-page now generates with its own specific Open Graph and Twitter titles (e.g. `Privacy Policy — Jaktra`).

---

#### 2. Add 6 missing pages to `sitemap.xml`
- **Priority:** P0
- **Status:** ✅ **RESOLVED (Folded into Item 10)**
- **Audit Source:** §4 (lines 136–147), Part 3 item 5, Part 5 item 3
- **Resolution Details:**
  Folded into Item 10's automated build-time generation. `scripts/prerender.mjs` computes all 39 public routes directly from `ROUTE_COMPONENTS` (omitting noindex auth routes) and emits both `dist/sitemap.xml` and `public/sitemap.xml`. The 6 newest pages are now permanently included.

---

#### 3. Update `llms.txt` with 6 newest resource pages
- **Priority:** P0
- **Status:** ✅ **RESOLVED**
- **Audit Source:** §4 (line 153), Part 3 item 11, Part 5 item 14
- **Resolution Details:**
  Updated `frontend/public/llms.txt` to include the 6 newest resource pages:
  - Invoice Dispute Response Templates
  - AR Query Management Guide
  - Client Questioning Billable Hours Guide
  - Client Disputed Invoice Article
  - Managing AR Emails Article
  - Best B2B Finance Automation Tools 2026

---

#### 4. Deploy latest build to Vercel
- **Priority:** P0
- **Status:** ⏳ **READY TO DEPLOY**
- **Audit Source:** §2 (lines 69–80), Part 3 item 4, Part 5 item 2
- **Resolution Details:**
  All changes (SSG prerender, sitemap automation, robots.txt hardening, llms.txt, and UI components) will be deployed in a single unified Git push to `main`.

---

### P1 — High Impact

---

#### 5. Reconcile meta description sources
- **Priority:** P1
- **Status:** ✅ **RESOLVED (Obsolete / Architecture Eliminated Risk)**
- **Audit Source:** Part 3 item 8 (line 247), Part 5 item 6
- **Resolution Details:**
  Previously, `subrouteHtmlPlugin` in `vite.config.ts` maintained a duplicated `PUBLIC_SUBROUTES` dictionary of descriptions that risked diverging from `SEOHead`. With `subrouteHtmlPlugin` removed in Item 11, `SEOHead` is now the **only** source of truth for meta descriptions across the entire codebase. No secondary description map exists.

---

#### 6. Run Google Rich Results Test
- **Priority:** P1
- **Status:** ⏸️ Manual human action required after deployment.

---

#### 7. Run fresh PageSpeed Insights
- **Priority:** P1
- **Status:** ⏸️ Manual human action required after deployment.

---

#### 8. Confirm Google Search Console status
- **Priority:** P1
- **Status:** ⏸️ Manual human action required after deployment.

---

#### 9. Add Disallow rules for auth routes to `robots.txt`
- **Priority:** P1
- **Status:** ✅ **RESOLVED**
- **Audit Source:** Part 3 item 12 (line 323), Part 5 item 15
- **Resolution Details:**
  Hardened `frontend/public/robots.txt` with defense-in-depth rules:
  ```
  Disallow: /login
  Disallow: /register
  Disallow: /forgot-password
  Disallow: /api/
  Disallow: /admin/
  ```

---

### P2 — Infrastructure Improvements

---

#### 10. Automate sitemap generation at build time
- **Priority:** P2
- **Status:** ✅ **RESOLVED (Re-scoped to `scripts/prerender.mjs`)**
- **Audit Source:** §4 (line 147), Part 5 item 9
- **Resolution Details:**
  Re-scoped from Vite plugin hook to `scripts/prerender.mjs`. After prerendering routes, `prerender.mjs` automatically generates valid XML for all 39 public routes (with proper lastmod, priority, and changefreq tiers), and writes both `dist/sitemap.xml` and `public/sitemap.xml`.

---

#### 11. Implement full-DOM SSG prerendering for public pages
- **Priority:** P2 (Promoted to P0 & Completed)
- **Status:** ✅ **RESOLVED & VERIFIED**
- **Audit Source:** §1 (lines 17–26), Part 3 item 1, items 6–7, Part 5 item 5
- **Resolution Details:**
  Pure Node.js SSG pipeline via `ReactDOMServer.renderToString()` rendering all 42 routes (39 public + 3 auth utility pages) in ~450ms without any headless browser overhead. Includes hydration-safe two-phase `AuthContext` and verified `noindex, nofollow` on auth routes.

---

#### 12. Create `SEO_CONTENT_STRATEGY.md`
- **Priority:** P2
- **Status:** 📋 Backlog / Next Milestone.

---

### P3 — Content & Long-Term Growth
- **13. Build integration pages** (SendGrid, Razorpay, Resend)
- **14. Start a blog**
- **15. Build case study pages**

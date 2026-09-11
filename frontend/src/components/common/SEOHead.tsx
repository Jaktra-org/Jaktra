import { useEffect } from "react";

const SITE_URL = "https://jaktra.site";
const SITE_NAME = "Jaktra";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

interface SEOHeadProps {
  /** Page title — will be appended with " — Jaktra" unless it already contains it */
  title: string;
  /** Meta description — ideally 150–160 characters */
  description: string;
  /** Canonical path (e.g. "/privacy"). Full URL is built automatically. */
  canonicalPath?: string;
  /** Override OG image URL (defaults to /og-image.png) */
  ogImage?: string;
  /** Override og:type (defaults to "website") */
  ogType?: string;
  /** If true, adds noindex,nofollow — use for auth pages and token-based portals */
  noindex?: boolean;
  /** Additional JSON-LD structured data to inject */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

export function SEOHead({
  title,
  description,
  canonicalPath,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = "website",
  noindex = false,
  jsonLd,
}: SEOHeadProps) {
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} — ${SITE_NAME}`;
  const canonicalUrl = !noindex && canonicalPath ? `${SITE_URL}${canonicalPath}` : undefined;

  // Normalize JSON-LD into an array
  const jsonLdItems = jsonLd
    ? Array.isArray(jsonLd) ? jsonLd : [jsonLd]
    : [];

  // Client-side effect: keep document.title and meta in sync during SPA navigation
  // without creating duplicate DOM nodes during React 19 client hydration.
  useEffect(() => {
    if (typeof document === "undefined") return;

    // 1. Single authoritative title update
    document.title = fullTitle;

    // 2. Helper to idempotently update or create meta tags
    const setMeta = (attr: "name" | "property", key: string, content?: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!content) {
        if (el) el.remove();
        return;
      }
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("name", "description", description);
    setMeta("name", "robots", noindex ? "noindex, nofollow" : undefined);
    setMeta("property", "og:type", ogType);
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", description);
    setMeta("property", "og:site_name", SITE_NAME);
    setMeta("property", "og:url", canonicalUrl);
    setMeta("property", "og:image", ogImage);
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", ogImage);

    // 3. Canonical link update
    let canonicalEl = document.querySelector('link[rel="canonical"]');
    if (canonicalUrl) {
      if (!canonicalEl) {
        canonicalEl = document.createElement("link");
        canonicalEl.setAttribute("rel", "canonical");
        document.head.appendChild(canonicalEl);
      }
      canonicalEl.setAttribute("href", canonicalUrl);
    } else if (canonicalEl && noindex) {
      canonicalEl.remove();
    }

    // 4. Page-specific JSON-LD updates during SPA client navigation
    if (jsonLdItems.length > 0) {
      jsonLdItems.forEach((item, idx) => {
        const scriptId = `page-jsonld-${idx}`;
        let script = document.getElementById(scriptId) as HTMLScriptElement | null;
        if (!script) {
          // Check if server-rendered script with matching schema exists before creating new one
          const existing = document.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]');
          const itemType = (item as any)["@type"];
          for (const s of existing) {
            if (s.textContent && itemType && (s.textContent.includes(`"@type":"${itemType}"`) || s.textContent.includes(`"@type": "${itemType}"`))) {
              s.id = scriptId;
              script = s;
              break;
            }
          }
        }
        if (!script) {
          script = document.createElement("script");
          script.id = scriptId;
          script.setAttribute("type", "application/ld+json");
          document.head.appendChild(script);
        }
        script.textContent = JSON.stringify(item);
      });
    }
  }, [fullTitle, description, canonicalUrl, ogType, ogImage, noindex, jsonLdItems]);

  // On the server (Node SSG / prerender):
  // Render React 19 native metadata tags into the SSR stream so prerender.mjs
  // can extract them and stamp them into dist/*/index.html.
  // In the browser, return null so React 19's reconciler does NOT insert duplicate
  // <title> or <meta> tags into document.head during hydration.
  if (typeof document !== "undefined") {
    return null;
  }

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content={SITE_NAME} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="603" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD Structured Data */}
      {jsonLdItems.map((item, i) => (
        <script key={`jsonld-${i}`} id={`page-jsonld-${i}`} type="application/ld+json">
          {JSON.stringify(item)}
        </script>
      ))}
    </>
  );
}

import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync, statSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const DIST_DIR = resolve(process.cwd(), 'dist');
const DIST_SSR_DIR = resolve(process.cwd(), 'dist-ssr');
const INDEX_HTML_PATH = join(DIST_DIR, 'index.html');
const PUBLIC_SITEMAP_PATH = resolve(process.cwd(), 'public', 'sitemap.xml');

if (!existsSync(INDEX_HTML_PATH)) {
  console.error('❌ [SSG] dist/index.html not found. Run client build first.');
  process.exit(1);
}

const templateHtml = readFileSync(INDEX_HTML_PATH, 'utf-8');

const SSR_BUNDLE_PATH = join(DIST_SSR_DIR, 'entry-server.js');
if (!existsSync(SSR_BUNDLE_PATH)) {
  console.error('❌ [SSG] dist-ssr/entry-server.js not found. Run SSR bundle build first.');
  process.exit(1);
}

const { render, ROUTE_COMPONENTS } = await import(pathToFileURL(SSR_BUNDLE_PATH).href);

const NOINDEX_ROUTES = new Set(['/login', '/register', '/forgot-password', '/404']);

const routes = Object.keys(ROUTE_COMPONENTS);
console.log(`\n🚀 [SSG Prerender] Starting full-DOM static generation for ${routes.length} routes...`);

let successCount = 0;

for (const route of routes) {
  try {
    const { html: renderedOutput } = render(route);

    // Precise tag matcher for document metadata hoisted by React 19 / SEOHead
    const headTagRegex = /<title>.*?<\/title>|<script[^>]*application\/ld\+json[^>]*>.*?<\/script>|<(?:meta|link)[^>]*\/?>/gis;
    const tagsFound = renderedOutput.match(headTagRegex) || [];
    const bodyMarkup = renderedOutput.replace(headTagRegex, '').trim();

    let pageHtml = templateHtml;

    // 1. Inject rendered React DOM into #root
    pageHtml = pageHtml.replace(
      /<div id="root">[\s\S]*?<\/div>/,
      `<div id="root">${bodyMarkup}</div>`
    );

    // 2. Extract specific metadata from rendered tags
    const titleMatch = tagsFound.find(t => t.startsWith('<title'));
    const descMatch = tagsFound.find(t => t.includes('name="description"'));
    const canonicalMatch = tagsFound.find(t => t.includes('rel="canonical"'));
    const ogTitleMatch = tagsFound.find(t => t.includes('property="og:title"'));
    const ogDescMatch = tagsFound.find(t => t.includes('property="og:description"'));
    const ogUrlMatch = tagsFound.find(t => t.includes('property="og:url"'));
    const ogImageMatch = tagsFound.find(t => t.includes('property="og:image"'));
    const twTitleMatch = tagsFound.find(t => t.includes('name="twitter:title"'));
    const twDescMatch = tagsFound.find(t => t.includes('name="twitter:description"'));
    const twImageMatch = tagsFound.find(t => t.includes('name="twitter:image"'));
    const jsonLdMatches = tagsFound.filter(t => t.includes('application/ld+json'));

    // Update <title>
    if (titleMatch) {
      pageHtml = pageHtml.replace(/<title>.*?<\/title>/i, titleMatch);
    }

    // Update meta description
    if (descMatch) {
      pageHtml = pageHtml.replace(/<meta name="description" content="[^"]*"\s*\/?>/i, descMatch);
    }

    // Update Open Graph tags
    if (ogTitleMatch) {
      pageHtml = pageHtml.replace(/<meta property="og:title" content="[^"]*"\s*\/?>/i, ogTitleMatch);
    }
    if (ogDescMatch) {
      pageHtml = pageHtml.replace(/<meta property="og:description" content="[^"]*"\s*\/?>/i, ogDescMatch);
    }
    if (ogUrlMatch) {
      pageHtml = pageHtml.replace(/<meta property="og:url" content="[^"]*"\s*\/?>/i, ogUrlMatch);
    }
    if (ogImageMatch) {
      pageHtml = pageHtml.replace(/<meta property="og:image" content="[^"]*"\s*\/?>/i, ogImageMatch);
    }

    // Update Twitter card tags
    if (twTitleMatch) {
      pageHtml = pageHtml.replace(/<meta name="twitter:title" content="[^"]*"\s*\/?>/i, twTitleMatch);
    }
    if (twDescMatch) {
      pageHtml = pageHtml.replace(/<meta name="twitter:description" content="[^"]*"\s*\/?>/i, twDescMatch);
    }
    if (twImageMatch) {
      pageHtml = pageHtml.replace(/<meta name="twitter:image" content="[^"]*"\s*\/?>/i, twImageMatch);
    }

    // Update canonical or enforce noindex
    if (NOINDEX_ROUTES.has(route)) {
      // Auth routes: completely remove canonical link and inject noindex, nofollow
      pageHtml = pageHtml.replace(/<link rel="canonical"[^>]*\/?>/i, '');
      if (!pageHtml.includes('name="robots"')) {
        pageHtml = pageHtml.replace('</head>', '  <meta name="robots" content="noindex, nofollow" />\n</head>');
      }
    } else if (canonicalMatch) {
      pageHtml = pageHtml.replace(/<link rel="canonical" href="[^"]*"\s*\/?>/i, canonicalMatch);
    }

    // Route-aware schema filtering:
    // templateHtml contains homepage-only schemas: WebSite, SoftwareApplication and FAQPage.
    // For all subpages (route !== '/'), strip these homepage-only schemas so they
    // do not bleed into subpages.
    // Global Organization schema is preserved.
    if (route !== '/') {
      pageHtml = pageHtml.replace(
        /(?:<!--\s*Schema\.org\s*[234]:\s*(?:WebSite|SoftwareApplication|FAQPage)\s*-->\s*)?<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>\s*/gi,
        (fullMatch, jsonContent) => {
          try {
            const parsed = JSON.parse(jsonContent.trim());
            const type = parsed['@type'];
            if (type === 'WebSite' || type === 'SoftwareApplication' || type === 'FAQPage') {
              return '';
            }
          } catch {
            if (
              jsonContent.includes('"WebSite"') ||
              jsonContent.includes('"SoftwareApplication"') ||
              jsonContent.includes('"FAQPage"')
            ) {
              return '';
            }
          }
          return fullMatch;
        }
      );
    }

    // Inject page-specific JSON-LD scripts
    if (jsonLdMatches.length > 0) {
      const extraScripts = jsonLdMatches.join('\n  ');
      pageHtml = pageHtml.replace('</head>', `  ${extraScripts}\n</head>`);
    }

    // Write file to target output path
    const relativeOut = route === '/' ? 'index.html' : route === '/404' ? '404.html' : join(route.replace(/^\//, ''), 'index.html');
    const outPath = join(DIST_DIR, relativeOut);
    mkdirSync(resolve(outPath, '..'), { recursive: true });
    writeFileSync(outPath, pageHtml, 'utf-8');

    // Also write dist/404/index.html so /404 path is accessible directly
    if (route === '/404') {
      const dir404 = join(DIST_DIR, '404', 'index.html');
      mkdirSync(resolve(dir404, '..'), { recursive: true });
      writeFileSync(dir404, pageHtml, 'utf-8');
    }

    const byteSize = (Buffer.byteLength(pageHtml, 'utf-8') / 1024).toFixed(1);
    console.log(`  ✅ [Prerendered] ${route.padEnd(48)} → dist/${relativeOut} (${byteSize} KB)`);
    successCount++;
  } catch (err) {
    console.error(`  ❌ [Error prerendering] ${route}:`, err);
  }
}

// -------------------------------------------------------------
// Auto-generate sitemap.xml for all public routes (Item #10 & #2)
// -------------------------------------------------------------
const publicRoutes = routes.filter(r => !NOINDEX_ROUTES.has(r));

const ROUTE_FILES = {
  "/": "pages/Landing.tsx",
  "/privacy": "pages/Privacy.tsx",
  "/terms": "pages/Terms.tsx",
  "/docs": "pages/DocsMock.tsx",
  "/pricing": "pages/Pricing.tsx",
  "/about": "pages/About.tsx",
  "/contact": "pages/Contact.tsx",
  "/compare/jaktra-vs-highradius": "seo/pages/compare/HighRadiusCompare.tsx",
  "/compare/jaktra-vs-upflow": "seo/pages/compare/UpflowCompare.tsx",
  "/compare/jaktra-vs-chaser": "seo/pages/compare/ChaserCompare.tsx",
  "/compare/jaktra-vs-paidnice": "seo/pages/compare/PaidNiceCompare.tsx",
  "/compare/jaktra-vs-kolleno": "seo/pages/compare/KollenoCompare.tsx",
  "/features/5-stage-escalation": "seo/pages/features/FiveStageEscalation.tsx",
  "/features/dispute-triage": "seo/pages/features/DisputeTriage.tsx",
  "/features/installment-plans": "seo/pages/features/InstallmentPlans.tsx",
  "/features/zero-login-portal": "seo/pages/features/ZeroLoginPortal.tsx",
  "/features/email-deliverability": "seo/pages/features/EmailDeliverability.tsx",
  "/features/risk-scoring": "seo/pages/features/RiskScoring.tsx",
  "/resources/how-to-reduce-dso": "seo/pages/resources/DSOGuide.tsx",
  "/resources/5-stage-ar-tone-escalation": "seo/pages/resources/ToneEscalationPlaybook.tsx",
  "/resources/b2b-dunning-email-templates": "seo/pages/resources/DunningTemplatesResource.tsx",
  "/resources/best-b2b-finance-automation-tools": "seo/pages/resources/BestFinanceAutomationGuide.tsx",
  "/resources/ar-automation-roi-calculator": "seo/pages/resources/ArRoiCalculatorResource.tsx",
  "/resources/invoice-dispute-response-templates": "seo/pages/resources/InvoiceDisputeTemplatesResource.tsx",
  "/resources/accounts-receivable-query-management": "seo/pages/resources/ArQueryManagementResource.tsx",
  "/resources/client-questioning-billable-hours": "seo/pages/resources/ClientQuestioningBillableHoursArticle.tsx",
  "/resources/client-disputed-invoice-what-to-do": "seo/pages/resources/ClientDisputedInvoiceArticle.tsx",
  "/resources/how-to-manage-accounts-receivable-emails": "seo/pages/resources/ManageArEmailsArticle.tsx",
  "/use-cases/saas": "seo/pages/use-cases/SaasUseCase.tsx",
  "/use-cases/agencies": "seo/pages/use-cases/AgencyUseCase.tsx",
  "/use-cases/manufacturing": "seo/pages/use-cases/ManufacturingUseCase.tsx",
  "/use-cases/professional-services": "seo/pages/use-cases/ProfessionalServicesUseCase.tsx",
  "/use-cases/construction": "seo/pages/use-cases/ConstructionUseCase.tsx",
  "/use-cases/logistics-freight": "seo/pages/use-cases/LogisticsFreightUseCase.tsx",
  "/use-cases/staffing-recruiting": "seo/pages/use-cases/StaffingRecruitingUseCase.tsx",
  "/use-cases/wholesale-distribution": "seo/pages/use-cases/WholesaleDistributionUseCase.tsx",
  "/compare": "seo/pages/hubs/CompareHub.tsx",
  "/use-cases": "seo/pages/hubs/UseCasesHub.tsx",
  "/features": "seo/pages/hubs/FeaturesHub.tsx",
  "/resources": "seo/pages/hubs/ResourcesHub.tsx",
  "/compare/highradius-alternatives": "seo/pages/alternatives/HighRadiusAlternatives.tsx",
  "/compare/upflow-alternatives": "seo/pages/alternatives/UpflowAlternatives.tsx",
  "/compare/chaser-alternatives": "seo/pages/alternatives/ChaserAlternatives.tsx",
  "/compare/paidnice-alternatives": "seo/pages/alternatives/PaidNiceAlternatives.tsx",
  "/compare/kolleno-alternatives": "seo/pages/alternatives/KollenoAlternatives.tsx",
  "/compare/gaviti-alternatives": "seo/pages/alternatives/GavitiAlternatives.tsx",
  "/compare/invoiced-alternatives": "seo/pages/alternatives/InvoicedAlternatives.tsx",
  "/compare/versapay-alternatives": "seo/pages/alternatives/VersapayAlternatives.tsx",
  "/compare/yaypay-alternatives": "seo/pages/alternatives/YayPayAlternatives.tsx",
  "/compare/tesorio-alternatives": "seo/pages/alternatives/TesorioAlternatives.tsx",
};

function getLastModDate(route) {
  const relFile = ROUTE_FILES[route];
  if (relFile) {
    try {
      const filePath = resolve(process.cwd(), 'src', relFile);
      try {
        const gitDate = execSync(`git log -1 --format=%cs -- "${filePath}"`, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
        if (gitDate && /^\d{4}-\d{2}-\d{2}$/.test(gitDate)) {
          return gitDate;
        }
      } catch {}

      if (existsSync(filePath)) {
        const stats = statSync(filePath);
        return stats.mtime.toISOString().split('T')[0];
      }
    } catch {}
  }
  return '2026-10-05';
}

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${publicRoutes.map(route => {
  const loc = `https://jaktra.site${route === '/' ? '/' : route}`;
  const lastmod = getLastModDate(route);
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`;
}).join('\n')}
</urlset>
`;

writeFileSync(join(DIST_DIR, 'sitemap.xml'), sitemapXml, 'utf-8');
writeFileSync(PUBLIC_SITEMAP_PATH, sitemapXml, 'utf-8');
console.log(`\n🗺️  [Sitemap] Auto-generated sitemap.xml with ${publicRoutes.length} public URLs (dist/sitemap.xml + public/sitemap.xml).`);

// Clean up dist-ssr temporary build folder
try {
  rmSync(DIST_SSR_DIR, { recursive: true, force: true });
} catch {}

console.log(`\n🏁 [SSG Prerender Complete] ${successCount}/${routes.length} routes prerendered with full body DOM.\n`);

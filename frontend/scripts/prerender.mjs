import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
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

const NOINDEX_ROUTES = new Set(['/login', '/register', '/forgot-password']);

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

    // Inject page-specific JSON-LD scripts
    if (jsonLdMatches.length > 0) {
      const extraScripts = jsonLdMatches.join('\n  ');
      pageHtml = pageHtml.replace('</head>', `  ${extraScripts}\n</head>`);
    }

    // Write file to target output path
    const relativeOut = route === '/' ? 'index.html' : join(route.replace(/^\//, ''), 'index.html');
    const outPath = join(DIST_DIR, relativeOut);
    mkdirSync(resolve(outPath, '..'), { recursive: true });
    writeFileSync(outPath, pageHtml, 'utf-8');

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
const today = new Date().toISOString().split('T')[0];

function getPriorityAndChangeFreq(route) {
  if (route === '/') return { priority: '1.0', changefreq: 'daily' };
  if (route === '/pricing' || route === '/compare' || route === '/features' || route === '/resources' || route === '/use-cases') {
    return { priority: '0.9', changefreq: 'daily' };
  }
  if (route === '/privacy' || route === '/terms' || route === '/docs') {
    return { priority: '0.5', changefreq: 'monthly' };
  }
  return { priority: '0.8', changefreq: 'weekly' };
}

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${publicRoutes.map(route => {
  const loc = `https://jaktra.site${route === '/' ? '' : route}`;
  const { priority, changefreq } = getPriorityAndChangeFreq(route);
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
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

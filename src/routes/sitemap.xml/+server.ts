import type { RequestHandler } from './$types';
import { ARTICLE_DATES, SITE_URL } from '$lib/seo';
import { BRANCH_SLUGS } from '$lib/branches';

// Emit as a prerendered static file so crawlers always get a fast response
// without a Worker invocation.
export const prerender = true;

/**
 * Dynamic sitemap.xml generator.
 *
 * Because the site is small and statically prerendered, the route list is
 * kept here as a single source of truth. Add new public routes to this
 * array when they go live.
 */

interface SitemapEntry {
	path: string;
	lastmod: string;
	priority: string;
	changefreq: string;
}

const routes: SitemapEntry[] = [
	{ path: '/', lastmod: '2026-08-20', priority: '1.0', changefreq: 'weekly' },
	{ path: '/generator/', lastmod: '2026-08-10', priority: '0.9', changefreq: 'monthly' },
	{ path: '/pris/', lastmod: '2026-08-10', priority: '0.8', changefreq: 'monthly' },
	{ path: '/skabeloner/', lastmod: '2026-08-20', priority: '0.9', changefreq: 'weekly' },
	{ path: '/blog/', lastmod: '2026-08-20', priority: '0.7', changefreq: 'weekly' },
	{
		path: '/blog/krav-til-faktura/',
		lastmod: ARTICLE_DATES.requirements.modified,
		priority: '0.9',
		changefreq: 'monthly'
	},
	{
		path: '/blog/faktura-skabelon-faq/',
		lastmod: ARTICLE_DATES.faq.modified,
		priority: '0.7',
		changefreq: 'monthly'
	},
	{
		path: '/blog/faktura-skabelon-sammenligning/',
		lastmod: ARTICLE_DATES.comparison.modified,
		priority: '0.7',
		changefreq: 'monthly'
	},
	{
		path: '/blog/bogforingslov-2026-guide/',
		lastmod: ARTICLE_DATES.bookkeepingLaw.modified,
		priority: '0.8',
		changefreq: 'monthly'
	},
	{
		path: '/blog/faktura-uden-cvr/',
		lastmod: ARTICLE_DATES.withoutCvr.modified,
		priority: '0.8',
		changefreq: 'monthly'
	},
	{
		path: '/blog/faktura-skabelon-word/',
		lastmod: ARTICLE_DATES.word.modified,
		priority: '0.8',
		changefreq: 'monthly'
	},
	{
		path: '/blog/faktura-skabelon-excel/',
		lastmod: ARTICLE_DATES.excel.modified,
		priority: '0.8',
		changefreq: 'monthly'
	},
	{
		path: '/blog/faktura-skabelon-pdf/',
		lastmod: ARTICLE_DATES.pdfTemplate.modified,
		priority: '0.8',
		changefreq: 'monthly'
	},
	{
		path: '/blog/faktura-skabelon-google-docs/',
		lastmod: ARTICLE_DATES.googleDocs.modified,
		priority: '0.8',
		changefreq: 'monthly'
	},
	{
		path: '/blog/faktura-freelancer/',
		lastmod: ARTICLE_DATES.freelancer.modified,
		priority: '0.8',
		changefreq: 'monthly'
	},
	// Branch-specific template pages, one entry per erhverv.
	...BRANCH_SLUGS.map<SitemapEntry>((slug) => ({
		path: `/skabeloner/${slug}/`,
		lastmod: '2026-08-20',
		priority: '0.6',
		changefreq: 'monthly'
	}))
];

function escapeXml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

export const GET: RequestHandler = async () => {
	const urls = routes
		.map((route) => {
			const loc = `${SITE_URL}${route.path}`;
			return [
				'  <url>',
				`    <loc>${escapeXml(loc)}</loc>`,
				`    <lastmod>${route.lastmod}</lastmod>`,
				`    <changefreq>${route.changefreq}</changefreq>`,
				`    <priority>${route.priority}</priority>`,
				'  </url>'
			].join('\n');
		})
		.join('\n');

	const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'public, max-age=3600'
		}
	});
};

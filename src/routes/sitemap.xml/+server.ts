import type { RequestHandler } from './$types';
import { SITE_URL } from '$lib/seo';

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
	priority: string;
	changefreq: string;
}

const routes: SitemapEntry[] = [
	{ path: '/', priority: '1.0', changefreq: 'weekly' },
	{ path: '/generator/', priority: '0.9', changefreq: 'monthly' },
	{ path: '/pris/', priority: '0.8', changefreq: 'monthly' },
	{ path: '/blog/', priority: '0.7', changefreq: 'weekly' },
	{
		path: '/blog/faktura-skabelon-faq/',
		priority: '0.7',
		changefreq: 'monthly'
	},
	{
		path: '/blog/faktura-skabelon-sammenligning/',
		priority: '0.7',
		changefreq: 'monthly'
	},
	{
		path: '/blog/bogforingslov-2026-guide/',
		priority: '0.8',
		changefreq: 'monthly'
	},
	{
		path: '/blog/faktura-uden-cvr/',
		priority: '0.8',
		changefreq: 'monthly'
	},
	{
		path: '/blog/faktura-skabelon-word/',
		priority: '0.8',
		changefreq: 'monthly'
	},
	{
		path: '/blog/faktura-freelancer/',
		priority: '0.8',
		changefreq: 'monthly'
	},
	{ path: '/privatlivspolitik/', priority: '0.3', changefreq: 'yearly' },
	{ path: '/cookiepolitik/', priority: '0.3', changefreq: 'yearly' }
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
	const lastmod = new Date().toISOString().split('T')[0];

	const urls = routes
		.map((route) => {
			const loc = `${SITE_URL}${route.path}`;
			return [
				'  <url>',
				`    <loc>${escapeXml(loc)}</loc>`,
				`    <lastmod>${lastmod}</lastmod>`,
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

import type { RequestHandler } from './$types';
import { SITE_URL } from '$lib/seo';

// Emit as a prerendered static file so crawlers always get a fast response
// without a Worker invocation.
export const prerender = true;

/**
 * Dynamic robots.txt.
 *
 * Replaces the static `static/robots.txt` so the sitemap reference always
 * points at the canonical production domain.
 */
export const GET: RequestHandler = async () => {
	const body = ['User-agent: *', 'Allow: /', '', `Sitemap: ${SITE_URL}/sitemap.xml`, ''].join('\n');

	return new Response(body, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'public, max-age=3600'
		}
	});
};

/**
 * SEO metadata helper for skabelontilfaktura.dk.
 *
 * `buildMeta` returns a plain object that can be destructured inside
 * `<svelte:head>` to render `<title>`, canonical, Open Graph and Twitter
 * meta tags, plus an optional JSON-LD block.
 */

/** Site-wide brand suffix appended to page titles. */
export const SITE_NAME = 'skabelontilfaktura.dk' as const;

/** Canonical base URL (no trailing slash). */
export const SITE_URL = 'https://skabelontilfaktura.dk' as const;

export interface SeoMeta {
	/** Page title (without the brand suffix — it is added automatically). */
	title: string;
	/** Meta description (max ~155 characters recommended). */
	description: string;
	/** Canonical path or URL. If a path is given it is prefixed with {@link SITE_URL}. */
	canonical?: string;
	/** Open Graph type, e.g. `website`, `article`. Defaults to `website`. */
	ogType?: string;
	/** Absolute or path-based Open Graph image URL. */
	ogImage?: string;
	/** When true, emits a `noindex, nofollow` robots directive. */
	noindex?: boolean;
	/** One or more JSON-LD structured-data objects to embed. */
	jsonLd?: object | object[];
}

export interface BuiltMeta {
	/** Fully formatted page title with brand suffix. */
	title: string;
	description: string;
	canonical: string;
	ogType: string;
	ogImage?: string;
	noindex: boolean;
	robots: string;
	jsonLd?: object | object[];
}

/**
 * Resolve a canonical URL. Absolute URLs are returned as-is; paths are
 * joined to {@link SITE_URL}.
 */
function resolveCanonical(value: string): string {
	if (/^https?:\/\//i.test(value)) return value;
	const path = value.startsWith('/') ? value : `/${value}`;
	return `${SITE_URL}${path}`;
}

/**
 * Build SEO metadata ready to be consumed in `<svelte:head>`.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { buildMeta } from '$lib/seo';
 *   const meta = buildMeta({ title: 'Priser', description: '...' });
 * </script>
 *
 * <svelte:head>
 *   <title>{meta.title}</title>
 *   <meta name="description" content={meta.description} />
 *   <link rel="canonical" href={meta.canonical} />
 * </svelte:head>
 * ```
 */
export function buildMeta(opts: SeoMeta): BuiltMeta {
	const title = `${opts.title} | ${SITE_NAME}`;
	const canonical = opts.canonical ? resolveCanonical(opts.canonical) : SITE_URL;
	const ogImage = opts.ogImage
		? /^https?:\/\//i.test(opts.ogImage)
			? opts.ogImage
			: `${SITE_URL}${opts.ogImage.startsWith('/') ? '' : '/'}${opts.ogImage}`
		: undefined;

	return {
		title,
		description: opts.description,
		canonical,
		ogType: opts.ogType ?? 'website',
		...(ogImage ? { ogImage } : {}),
		noindex: opts.noindex ?? false,
		robots: opts.noindex ? 'noindex, nofollow' : 'index, follow',
		...(opts.jsonLd ? { jsonLd: opts.jsonLd } : {})
	};
}

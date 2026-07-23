/**
 * Generator page route config.
 *
 * `ssr = true` keeps the page crawlable for SEO while `prerender = false`
 * forces a runtime render so the client-only localStorage store can hydrate
 * the draft on every visit. (The marketing layout defaults to prerendering,
 * so we override it here.)
 */
export const ssr = true;
export const prerender = false;

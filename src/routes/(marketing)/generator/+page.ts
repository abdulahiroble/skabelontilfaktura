/**
 * Generator page route config.
 *
 * `ssr = true` keeps the page crawlable and `prerender = true` emits the
 * empty-draft state as static HTML at build time, so crawlers always get a
 * fast server response. The client-only localStorage store hydrates on mount
 * in the browser exactly as before, so the user's draft is restored on every
 * visit regardless of how the HTML was produced. (The marketing layout
 * already defaults to prerendering; this override keeps the intent explicit.)
 */
export const ssr = true;
export const prerender = true;

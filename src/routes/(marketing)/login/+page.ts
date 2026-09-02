/**
 * Login page route config.
 *
 * The root layout prerenders all marketing pages, but the login/signup form
 * is pure app chrome — no crawlable content, and the rendered state depends
 * on the `?next=` query param. Opt out of prerendering and serve it SSR.
 */
export const ssr = true;
export const prerender = false;

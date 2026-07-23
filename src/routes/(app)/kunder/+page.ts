/**
 * Client list is fully dynamic (per-user data) and must never be prerendered.
 * SSR stays enabled (inherited from the `(app)` layout) so the page is
 * rendered on the server with the authenticated user's clients.
 */
export const prerender = false;

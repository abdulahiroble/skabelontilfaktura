import type { LayoutServerLoad } from './$types';
/**
 * App layout load: reuse the root layout's entitlement snapshot so every page
 * under `(app)` can gate UI without issuing a duplicate subscription query.
 *
 * Returns `{ entitlements: null }` for anonymous users or when the DB binding
 * is unavailable (e.g. during a partial build). The entitlement check is
 * local-table-only and therefore works even if the Autumn API is unreachable.
 *
 * This load does NOT hard-redirect: anonymous users are allowed through so
 * individual pages can decide how to gate (the marketing/home redirect for
 * unauthenticated app traffic is handled elsewhere). Use the `guards.ts`
 * helpers for pages that must hard-enforce a plan.
 *
 * Note: `+layout.server.ts` cannot export `actions` in SvelteKit (only
 * `+page.server.ts` can). Checkout lives in the API endpoint
 * `POST /api/billing/checkout`; the layout CTA calls it via fetch.
 */
export const load: LayoutServerLoad = async (event) => {
	const parent = await event.parent();
	return { entitlements: parent.entitlements };
};

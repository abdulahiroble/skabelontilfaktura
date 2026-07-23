import type { LayoutServerLoad } from './$types';
import { getDb } from '$lib/server/db/client';
import { getEntitlements, serializeEntitlements } from '$lib/server/entitlements';

/**
 * App layout load: resolve the signed-in user's entitlements once per request
 * so every page under `(app)` can gate UI without re-querying.
 *
 * Returns `{ entitlements: null }` for anonymous users or when the DB binding
 * is unavailable (e.g. during a partial build). The entitlement check is
 * local-table-only and therefore works even if the Autumn API is unreachable.
 *
 * This load does NOT hard-redirect: anonymous users are allowed through so
 * individual pages can decide how to gate (the marketing/home redirect for
 * unauthenticated app traffic is handled elsewhere). Use the `guards.ts`
 * helpers for pages that must hard-enforce a plan.
 */
export const load: LayoutServerLoad = async (event) => {
	const user = event.locals.user;
	if (!user) return { entitlements: null };

	const databaseUrl = event.platform?.env?.DATABASE_URL;
	if (!databaseUrl) return { entitlements: null };

	const db = getDb(databaseUrl);
	const ctx = await getEntitlements(db, user.id);
	return { entitlements: serializeEntitlements(ctx) };
};

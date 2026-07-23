import { redirect, error } from '@sveltejs/kit';
import type { ServerLoadEvent } from '@sveltejs/kit';
import { getDb } from '$lib/server/db/client';
import {
	getEntitlements,
	hasFeature,
	isProOrHigher,
	type EntitlementContext,
	type FeatureId
} from './entitlements';

/**
 * SvelteKit guard helpers for route protection.
 *
 * Each helper enforces a progressively stricter condition and returns the
 * authenticated user (and, where relevant, the resolved entitlement context)
 * so load functions can branch on plan/feature without re-querying.
 *
 * - {@link requireAuth} — must be signed in.
 * - {@link requirePro} — signed in AND on any paid plan.
 * - {@link requireFeature} — signed in, paid plan, AND a specific feature.
 *
 * On failure the helpers `throw` (redirect to /login/ or /pris/, or a 500 for
 * a missing DB binding), which is the idiomatic SvelteKit load-control flow.
 *
 * All DB access uses a fresh `getDb()` per request, consistent with the rest
 * of the app. Do not put these checks in `hooks.server.ts`; they belong in
 * page/layout loaders so they can return data alongside the gate.
 */

/** Authenticated user shape (mirrors `App.Locals['user']`). */
export type AuthUser = { id: string; email: string; name?: string };

/**
 * Resolve the per-request Drizzle client, or throw a 500 when the binding is
 * missing. Guard helpers depend on a DB to verify entitlements.
 */
function requireDb(event: ServerLoadEvent) {
	const databaseUrl = event.platform?.env?.DATABASE_URL;
	if (!databaseUrl) {
		throw error(500, 'Database ikke konfigureret');
	}
	return getDb(databaseUrl);
}

/**
 * Require an authenticated user; otherwise redirect to the login page.
 * Returns the signed-in user.
 */
export async function requireAuth(event: ServerLoadEvent): Promise<AuthUser> {
	const user = event.locals.user;
	if (!user) {
		throw redirect(302, '/login/');
	}
	return user;
}

/**
 * Require an authenticated user on any paid plan (pro / business /
 * lifetime_pro); otherwise redirect to the pricing page. Returns the user and
 * resolved entitlement context.
 */
export async function requirePro(
	event: ServerLoadEvent
): Promise<{ user: AuthUser; ctx: EntitlementContext }> {
	const user = await requireAuth(event);
	const db = requireDb(event);
	const ctx = await getEntitlements(db, user.id);
	if (!isProOrHigher(ctx)) {
		throw redirect(302, '/pris/');
	}
	return { user, ctx };
}

/**
 * Require an authenticated, paid user with a specific feature enabled;
 * otherwise redirect to the pricing page. Returns the user and context.
 */
export async function requireFeature(
	event: ServerLoadEvent,
	featureId: FeatureId
): Promise<{ user: AuthUser; ctx: EntitlementContext }> {
	const { user, ctx } = await requirePro(event);
	if (!hasFeature(ctx, featureId)) {
		throw redirect(302, '/pris/');
	}
	return { user, ctx };
}

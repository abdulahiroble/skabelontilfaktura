import type { LayoutServerLoad } from './$types';
import { getDb } from '$lib/server/db/client';
import { getEntitlements, serializeEntitlements } from '$lib/server/entitlements';

export const load: LayoutServerLoad = async ({ locals, platform, url }) => {
	let entitlements = null;
	if (locals.user && platform?.env?.DATABASE_URL) {
		try {
			const db = getDb(platform.env.DATABASE_URL);
			entitlements = serializeEntitlements(await getEntitlements(db, locals.user.id));
		} catch {
			console.error('[layout] Entitlement decoration failed');
		}
	}

	return {
		// Reset links are bearer capabilities, never analytics page locations.
		gaMeasurementId: url.pathname.startsWith('/adgang') ? '' : 'G-9K8CQ4KZ1F',
		user: locals.user,
		entitlements
	};
};

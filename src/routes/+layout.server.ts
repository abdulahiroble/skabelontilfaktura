import type { LayoutServerLoad } from './$types';
import { getDb } from '$lib/server/db/client';
import { getEntitlements, serializeEntitlements } from '$lib/server/entitlements';

export const load: LayoutServerLoad = async ({ locals, platform }) => {
	let entitlements = null;
	if (locals.user && platform?.env?.DATABASE_URL) {
		try {
			const db = getDb(platform.env.DATABASE_URL);
			entitlements = serializeEntitlements(await getEntitlements(db, locals.user.id));
		} catch (error) {
			console.error('[layout] Entitlement decoration failed', {
				userId: locals.user.id,
				message: error instanceof Error ? error.message.slice(0, 300) : String(error).slice(0, 300)
			});
		}
	}

	return {
		gaMeasurementId: 'G-9K8CQ4KZ1F',
		user: locals.user,
		entitlements
	};
};

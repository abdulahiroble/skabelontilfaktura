import type { PageServerLoad } from './$types';
import { getDb } from '$lib/server/db/client';
import { getEntitlements, serializeEntitlements } from '$lib/server/entitlements';
import { businessToSeller, getBusinessByUserId, getClients } from '$lib/server/queries';

export const load: PageServerLoad = async ({ locals, platform }) => {
	if (!locals.user || !platform?.env?.DATABASE_URL) {
		return { user: locals.user, entitlements: null, business: null, clients: [] };
	}

	const db = getDb(platform.env.DATABASE_URL);
	const [ctx, business] = await Promise.all([
		getEntitlements(db, locals.user.id),
		getBusinessByUserId(db, locals.user.id)
	]);

	const clients = business ? await getClients(db, business.id) : [];
	return {
		user: locals.user,
		entitlements: serializeEntitlements(ctx),
		business: business
			? {
					id: business.id,
					seller: businessToSeller(business),
					regNr: business.regNr,
					kontonr: business.kontonr,
					mobilepay: business.mobilepay,
					brandColor: business.brandColor
				}
			: null,
		clients: clients.map((client) => ({
			id: client.id,
			name: client.name,
			cvr: client.cvr,
			address: client.address,
			email: client.email
		}))
	};
};

import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getDb } from '$lib/server/db/client';
import { getEntitlements, serializeEntitlements } from '$lib/server/entitlements';
import { readKitPurchase, reconcileKit } from '$lib/server/payments/kit-entitlements';

export const load: PageServerLoad = async ({ locals, platform, url, setHeaders }) => {
	setHeaders({ 'Cache-Control': 'private, no-store' });
	if (!locals.user) throw redirect(303, '/login/?next=%2Fkonto%2F');
	const env = platform?.env;
	if (!env?.DATABASE_URL)
		return { kit: null, entitlements: null, checkoutReturned: false, unavailable: true };
	try {
		const db = getDb(env.DATABASE_URL);
		const [kit, entitlements] = await Promise.all([
			readKitPurchase(db, env, locals.user.id),
			getEntitlements(db, locals.user.id)
		]);
		return {
			kit,
			entitlements: serializeEntitlements(entitlements),
			checkoutReturned: url.searchParams.get('checkout') === 'success',
			unavailable: false
		};
	} catch {
		console.error('[account] Purchase read unavailable');
		return { kit: null, entitlements: null, checkoutReturned: false, unavailable: true };
	}
};

export const actions: Actions = {
	recover: async ({ locals, platform }) => {
		if (!locals.user) throw redirect(303, '/login/?next=%2Fkonto%2F');
		const env = platform?.env;
		if (!env?.DATABASE_URL)
			return fail(503, { message: 'Købet kan ikke kontrolleres lige nu. Prøv senere.' });
		try {
			const kit = await reconcileKit(getDb(env.DATABASE_URL), env, locals.user.id);
			return {
				message: kit.owned
					? 'Dit køb er bekræftet. Du kan hente pakken.'
					: kit.status === 'refunded'
						? 'Købet er refunderet.'
						: 'Ingen afsluttet betaling fundet endnu. Vent lidt og prøv igen; køb ikke igen.'
			};
		} catch {
			console.error('[account] Recovery unavailable');
			return fail(503, {
				message: 'Betalingen kan ikke kontrolleres lige nu. Prøv senere; køb ikke igen.'
			});
		}
	}
};

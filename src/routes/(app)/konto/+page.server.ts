import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getDb } from '$lib/server/db/client';
import { getEntitlements, hasFeature, serializeEntitlements } from '$lib/server/entitlements';
import { getBusinessByUserId, getInvoices } from '$lib/server/queries';

export const load: PageServerLoad = async ({ locals, platform }) => {
	if (!locals.user) throw redirect(302, '/login/?next=/konto/');
	if (!platform?.env?.DATABASE_URL) {
		return {
			entitlements: null,
			business: null,
			invoiceCount: 0,
			invoices: []
		};
	}

	const db = getDb(platform.env.DATABASE_URL);
	const entitlements = await getEntitlements(db, locals.user.id);
	const business = await getBusinessByUserId(db, locals.user.id);
	const invoices =
		business && hasFeature(entitlements, 'cloud_storage') ? await getInvoices(db, business.id) : [];

	return {
		entitlements: serializeEntitlements(entitlements),
		business: business
			? {
					name: business.name,
					cvr: business.cvr,
					hasPaymentDetails: Boolean((business.regNr && business.kontonr) || business.mobilepay)
				}
			: null,
		invoiceCount: invoices.length,
		invoices: invoices.slice(0, 5)
	};
};

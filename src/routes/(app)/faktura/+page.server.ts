import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getDb } from '$lib/server/db/client';
import { requireFeature } from '$lib/server/guards';
import { getBusinessByUserId, getInvoices } from '$lib/server/queries';

export const load: PageServerLoad = async (event) => {
	const { user } = await requireFeature(event, 'cloud_storage');
	const db = getDb(event.platform!.env.DATABASE_URL);
	const business = await getBusinessByUserId(db, user.id);
	if (!business) throw redirect(302, '/indstillinger/');

	return { invoices: await getInvoices(db, business.id) };
};

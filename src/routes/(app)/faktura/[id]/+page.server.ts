import { error, redirect, type RequestEvent } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { InvoiceStatusSchema } from '$lib/invoice/schema';
import type { InvoiceData } from '$lib/invoice/types';
import { getDb } from '$lib/server/db/client';
import { requireFeature } from '$lib/server/guards';
import {
	deleteInvoice,
	getBusinessByUserId,
	getInvoiceForBusiness,
	updateInvoiceStatus
} from '$lib/server/queries';
import { deleteFromR2 } from '$lib/server/storage';
import { isUuid } from '$lib/utils';

async function getContext(event: RequestEvent<{ id: string }>) {
	const { user } = await requireFeature(event, 'cloud_storage');
	if (!isUuid(event.params.id)) throw error(404, 'Fakturaen blev ikke fundet');

	const db = getDb(event.platform!.env.DATABASE_URL);
	const business = await getBusinessByUserId(db, user.id);
	if (!business) throw redirect(302, '/indstillinger/');
	const row = await getInvoiceForBusiness(db, event.params.id, business.id);
	if (!row) throw error(404, 'Fakturaen blev ikke fundet');
	return { db, business, row };
}

export const load: PageServerLoad = async (event) => {
	const { row } = await getContext(event);
	return { invoice: row, snapshot: row.data as InvoiceData | null };
};

export const actions: Actions = {
	status: async (event) => {
		const { db, business } = await getContext(event);
		const formData = await event.request.formData();
		const parsed = InvoiceStatusSchema.safeParse(formData.get('status'));
		if (!parsed.success) throw error(400, 'Ugyldig status');
		await updateInvoiceStatus(db, event.params.id, business.id, parsed.data);
		return { success: true };
	},
	delete: async (event) => {
		const { db, business, row } = await getContext(event);
		if (row.pdfR2Key && event.platform?.env?.INVOICES_BUCKET) {
			await deleteFromR2(event.platform.env.INVOICES_BUCKET, row.pdfR2Key);
		}
		await deleteInvoice(db, event.params.id, business.id);
		throw redirect(303, '/faktura/');
	}
};

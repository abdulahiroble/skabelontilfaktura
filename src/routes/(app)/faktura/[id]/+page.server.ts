import { error, redirect, type RequestEvent } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { InvoiceStatusSchema } from '$lib/invoice/schema';
import type { InvoiceData } from '$lib/invoice/types';
import { getDb } from '$lib/server/db/client';
import { requireFeature } from '$lib/server/guards';
import {
	deleteInvoice,
	getBusinessByUserId,
	getInvoiceForBusiness,
	getInvoiceReminderLogs,
	updateInvoiceStatus
} from '$lib/server/queries';
import { deleteFromR2 } from '$lib/server/storage';
import { getNextReminderTemplate, sendReminderIfDue } from '$lib/server/reminders/scheduler';
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
	const { db, row } = await getContext(event);
	const reminderLogs = await getInvoiceReminderLogs(db, row.id);
	return { invoice: row, snapshot: row.data as InvoiceData | null, reminderLogs };
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
	reminder: async (event) => {
		await requireFeature(event, 'reminder_emails');
		const { db, row } = await getContext(event);
		const template = await getNextReminderTemplate(db, row.id, row.dueAt);
		if (!template) {
			return fail(400, {
				reminderError:
					'Næste rykker er ikke klar endnu. Første trin kræver 3 dages overskridelse, og senere trin kræver 10 dages mellemrum.'
			});
		}
		const sent = await sendReminderIfDue(db, row.id, template, event.platform?.env);
		if (!sent) {
			return fail(502, {
				reminderError: 'Rykkeren kunne ikke sendes. Kontrollér kundens e-mailadresse og prøv igen.'
			});
		}
		return { reminderSent: true };
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

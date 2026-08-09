import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { InvoiceDataSchema } from '$lib/invoice/schema';
import { renderInvoicePdf } from '$lib/pdf/renderer';
import { getDb } from '$lib/server/db/client';
import { getEntitlements, hasFeature } from '$lib/server/entitlements';
import {
	createInvoice,
	deleteInvoice,
	getBusinessByUserId,
	getClientForBusiness,
	setInvoicePdfKey
} from '$lib/server/queries';
import { deleteFromR2, generateInvoiceKey, uploadToR2 } from '$lib/server/storage';

export const POST: RequestHandler = async ({ request, locals, platform }) => {
	if (!locals.user) throw error(401, 'Log ind for at gemme fakturaer');
	if (!platform?.env?.DATABASE_URL) throw error(500, 'Database ikke konfigureret');
	if (!platform.env.INVOICES_BUCKET) throw error(500, 'Cloud-lagring ikke konfigureret');

	const db = getDb(platform.env.DATABASE_URL);
	const entitlements = await getEntitlements(db, locals.user.id);
	if (!hasFeature(entitlements, 'cloud_storage')) {
		throw error(403, 'Cloud-lagring kræver Pro');
	}

	let body: { invoice?: unknown; clientId?: unknown };
	try {
		body = (await request.json()) as typeof body;
	} catch {
		throw error(400, 'Ugyldig JSON');
	}

	const parsed = InvoiceDataSchema.safeParse(body.invoice);
	if (!parsed.success) {
		return json(
			{ error: 'Fakturaen mangler påkrævede oplysninger', issues: parsed.error.issues },
			{ status: 400 }
		);
	}

	const business = await getBusinessByUserId(db, locals.user.id);
	if (!business) {
		return json(
			{ error: 'Opret din virksomhedsprofil først', code: 'BUSINESS_PROFILE_REQUIRED' },
			{ status: 409 }
		);
	}

	const clientId = typeof body.clientId === 'string' && body.clientId ? body.clientId : null;
	if (clientId && !(await getClientForBusiness(db, clientId, business.id))) {
		throw error(400, 'Den valgte klient findes ikke');
	}

	const created = await createInvoice(db, business.id, parsed.data, clientId);
	const key = generateInvoiceKey(business.id, created.data.invoiceNumber);
	let uploaded = false;

	try {
		const bytes = await renderInvoicePdf(created.data, { useObjectStreams: true });
		const buffer = new ArrayBuffer(bytes.byteLength);
		new Uint8Array(buffer).set(bytes);
		await uploadToR2(platform.env.INVOICES_BUCKET, key, buffer, {
			contentType: 'application/pdf',
			customMetadata: {
				businessId: business.id,
				invoiceId: created.row.id,
				invoiceNumber: created.data.invoiceNumber
			}
		});
		uploaded = true;
		await setInvoicePdfKey(db, created.row.id, business.id, key);
	} catch (cause) {
		console.error('[invoice create] Kunne ikke gemme PDF:', cause);
		if (uploaded) {
			try {
				await deleteFromR2(platform.env.INVOICES_BUCKET, key);
			} catch (cleanupError) {
				console.error('[invoice create] Kunne ikke rydde forældreløs PDF:', cleanupError);
			}
		}
		await deleteInvoice(db, created.row.id, business.id);
		throw error(502, 'Fakturaen kunne ikke gemmes i cloud-lageret');
	}

	return json(
		{
			id: created.row.id,
			invoiceNumber: created.data.invoiceNumber,
			status: created.row.status
		},
		{ status: 201 }
	);
};

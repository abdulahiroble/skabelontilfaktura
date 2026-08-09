import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db/client';
import { getEntitlements, hasFeature } from '$lib/server/entitlements';
import { getBusinessByUserId, getInvoiceForBusiness } from '$lib/server/queries';
import { getFromR2 } from '$lib/server/storage';
import { isUuid } from '$lib/utils';

export const GET: RequestHandler = async ({ params, locals, platform }) => {
	if (!locals.user) throw error(401, 'Log ind for at hente fakturaen');
	if (!isUuid(params.id)) throw error(404, 'Fakturaen blev ikke fundet');
	if (!platform?.env?.DATABASE_URL || !platform.env.INVOICES_BUCKET) {
		throw error(500, 'Cloud-lagring ikke konfigureret');
	}

	const db = getDb(platform.env.DATABASE_URL);
	const ctx = await getEntitlements(db, locals.user.id);
	if (!hasFeature(ctx, 'cloud_storage')) throw error(403, 'Cloud-lagring kræver Pro');

	const business = await getBusinessByUserId(db, locals.user.id);
	if (!business) throw error(404, 'Virksomhedsprofil blev ikke fundet');
	const invoice = await getInvoiceForBusiness(db, params.id, business.id);
	if (!invoice?.pdfR2Key) throw error(404, 'PDF-filen blev ikke fundet');

	const object = await getFromR2(platform.env.INVOICES_BUCKET, invoice.pdfR2Key);
	if (!object) throw error(404, 'PDF-filen blev ikke fundet');

	return new Response(object.body, {
		headers: {
			'Content-Type': object.httpMetadata?.contentType ?? 'application/pdf',
			'Content-Disposition': `attachment; filename="${invoice.invoiceNumber.replace(/[^a-zA-Z0-9._-]+/g, '-')}.pdf"`,
			'Cache-Control': 'private, no-store',
			ETag: object.httpEtag
		}
	});
};

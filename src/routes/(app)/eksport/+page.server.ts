import { and, eq, gte, inArray, lte } from 'drizzle-orm';
import { redirect, error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getDb } from '$lib/server/db/client';
import { client, invoice, subscription } from '$lib/server/db/schema';
import { getBusinessByUserId } from '$lib/server/queries';
import { buildSaftXml, buildSaftCsv, type InvoiceRow, type SaftPeriod } from '$lib/server/saft';

/**
 * Export page (Pro-tier): SAF-T 2.0 XML + standardkontoplanen CSV downloads.
 *
 * - `load`: authenticates the user, verifies an active Pro subscription, loads
 *   the business, and provides a sensible default date range (current calendar
 *   year).
 * - `saft_xml` action: builds the SAF-T 2.0 XML for the chosen period and
 *   returns it as action data; the client triggers a Blob download.
 * - `csv` action: builds the standardkontoplanen CSV likewise.
 *
 * All DB access uses a fresh `getDb()` per request.
 */

/** Plans that grant access to the export feature. */
const PRO_PLANS = new Set(['pro', 'business', 'lifetime_pro']);

/**
 * Return `true` when the user has an active paid plan.
 *
 * `lifetime_pro` is treated as always active (status may be null). Other plans
 * require `status = 'active'`.
 */
async function hasProAccess(db: ReturnType<typeof getDb>, userId: string): Promise<boolean> {
	const rows = await db
		.select({ plan: subscription.plan, status: subscription.status })
		.from(subscription)
		.where(eq(subscription.userId, userId));

	return rows.some(
		(row) => PRO_PLANS.has(row.plan) && (row.plan === 'lifetime_pro' || row.status === 'active')
	);
}

/** Format a `Date` as YYYY-MM-DD. */
function toIsoDate(value: Date): string {
	return value.toISOString().slice(0, 10);
}

/** Parse a `YYYY-MM-DD` form value into a `Date` at local midnight, or `null`. */
function parseFormDate(value: FormDataEntryValue | null): Date | null {
	const text = String(value ?? '').trim();
	if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return null;
	const [y, m, d] = text.split('-').map(Number);
	if (!y || !m || !d) return null;
	const date = new Date(y, m - 1, d);
	return Number.isNaN(date.getTime()) ? null : date;
}

/** Default period: the current calendar year. */
function defaultPeriod(): { from: string; to: string } {
	const now = new Date();
	return {
		from: `${now.getFullYear()}-01-01`,
		to: `${now.getFullYear()}-12-31`
	};
}

/** Build a filesystem-safe filename slug from a business name. */
function slugify(value: string): string {
	return (
		value
			.toLowerCase()
			.replace(/[^\p{L}\p{N}]+/gu, '-')
			.replace(/^-+|-+$/g, '')
			.slice(0, 60) || 'virksomhed'
	);
}

export const load: PageServerLoad = async (event) => {
	const user = event.locals.user;
	if (!user) {
		throw redirect(302, '/login/');
	}

	const databaseUrl = event.platform?.env?.DATABASE_URL;
	if (!databaseUrl) {
		throw error(500, 'Database ikke konfigureret');
	}

	const db = getDb(databaseUrl);

	const isPro = await hasProAccess(db, user.id);
	if (!isPro) {
		throw error(403, 'SAF-T-eksport kræver et Pro-abonnement');
	}

	const businessRow = await getBusinessByUserId(db, user.id);
	if (!businessRow) {
		throw error(404, 'Ingen virksomhed fundet for denne bruger');
	}

	return {
		businessName: businessRow.name,
		defaultRange: defaultPeriod()
	};
};

export const actions: Actions = {
	saft_xml: async (event) => {
		return generateExport(event, 'xml');
	},
	csv: async (event) => {
		return generateExport(event, 'csv');
	}
};

/**
 * Shared handler for both export actions.
 *
 * Validates auth + Pro + period, generates the requested format, and returns
 * `{ ok, content, filename, mime }` for the client to download as a Blob.
 */
async function generateExport(
	event: Parameters<NonNullable<Actions['saft_xml']>>[0],
	format: 'xml' | 'csv'
) {
	const user = event.locals.user;
	if (!user) {
		throw redirect(302, '/login/');
	}

	const databaseUrl = event.platform?.env?.DATABASE_URL;
	if (!databaseUrl) {
		throw error(500, 'Database ikke konfigureret');
	}

	const db = getDb(databaseUrl);

	const isPro = await hasProAccess(db, user.id);
	if (!isPro) {
		throw error(403, 'SAF-T-eksport kræver et Pro-abonnement');
	}

	const formData = await event.request.formData();
	const from = parseFormDate(formData.get('from'));
	const to = parseFormDate(formData.get('to'));
	if (!from || !to) {
		return fail(400, { errors: { periode: 'Angiv en gyldig fra- og til-dato.' } });
	}
	if (from.getTime() > to.getTime()) {
		return fail(400, { errors: { periode: 'Fra-dato skal være før til-dato.' } });
	}

	const businessRow = await getBusinessByUserId(db, user.id);
	if (!businessRow) {
		throw error(404, 'Ingen virksomhed fundet for denne bruger');
	}

	const period: SaftPeriod = { from, to };
	const slug = slugify(businessRow.name);
	const fromStr = toIsoDate(from);
	const toStr = toIsoDate(to);

	try {
		if (format === 'xml') {
			const content = await buildSaftXml(db, businessRow.id, period);
			return {
				ok: true as const,
				content,
				filename: `saft-${slug}-${fromStr}-${toStr}.xml`,
				mime: 'application/xml'
			};
		}

		const invoiceRows = await fetchInvoiceRows(db, businessRow.id, period);
		const content = buildSaftCsv(invoiceRows);
		return {
			ok: true as const,
			content,
			filename: `kontoplan-${slug}-${fromStr}-${toStr}.csv`,
			mime: 'text/csv'
		};
	} catch (err) {
		console.error(`[eksport ${format}] Kunne ikke generere eksport:`, err);
		return fail(500, { errors: { form: 'Kunne ikke generere eksporten. Prøv igen.' } });
	}
}

/** Fetch finalized invoices in the period and project them to `InvoiceRow`s. */
async function fetchInvoiceRows(
	db: ReturnType<typeof getDb>,
	businessId: string,
	period: SaftPeriod
): Promise<InvoiceRow[]> {
	const invoices = await db
		.select()
		.from(invoice)
		.where(
			and(
				eq(invoice.businessId, businessId),
				gte(invoice.issuedAt, period.from),
				lte(invoice.issuedAt, period.to)
			)
		);

	const EXPORTABLE = new Set(['sent', 'paid', 'overdue']);

	// Resolve client names (single query, kept out of the hot path).
	const clientIds = invoices.map((row) => row.clientId).filter((id): id is string => id !== null);
	const clientNames = new Map<string, string>();
	if (clientIds.length > 0) {
		const clients = await db
			.select({ id: client.id, name: client.name })
			.from(client)
			.where(inArray(client.id, clientIds));
		for (const c of clients) clientNames.set(c.id, c.name);
	}

	return invoices
		.filter((inv) => EXPORTABLE.has(inv.status))
		.map((inv) => ({
			invoiceNumber: inv.invoiceNumber,
			issuedAt: inv.issuedAt,
			clientName: inv.clientId ? (clientNames.get(inv.clientId) ?? null) : null,
			subtotal: inv.subtotal,
			vatAmount: inv.vatAmount ?? '0',
			total: inv.total ?? '0',
			currency: inv.currency
		}));
}

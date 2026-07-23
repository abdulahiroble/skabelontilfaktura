import { and, eq } from 'drizzle-orm';
import { invoice } from '$lib/server/db/schema';
import { padSeriesNumber } from '$lib/invoice/numbering';
import type { Database } from '$lib/server/db/client';

/**
 * Server-side sequential invoice numbering.
 *
 * Pro-tier invoices are numbered centrally in the database so that a user gets
 * consistent numbers across devices (unlike the localStorage-backed
 * `nextInvoiceNumber` which is per-browser).
 *
 * The allocation reads the highest numeric suffix already issued for the
 * given `(businessId, series)` and increments it. The read happens inside a
 * transaction for a consistent snapshot. The ultimate guarantee against
 * duplicate numbers is the
 * `unique(businessId, series, invoiceNumber)` constraint on the `invoice`
 * table — callers must INSERT the returned number and, on a unique-violation,
 * retry allocation. (This keeps the allocator stateless and lock-free.)
 *
 * Format mirrors the client-side module: `${series}-${4-digit-padded}`, e.g.
 * `'2026-0001'`.
 */

/** Parse the trailing numeric portion of an invoice number (e.g. '2026-0042' -> 42). */
function parseSuffix(invoiceNumber: string): number {
	// Match the last run of digits so future prefixes (e.g. 'PRO-2026-0042')
	// still parse correctly.
	const match = invoiceNumber.match(/(\d+)\s*$/);
	return match ? parseInt(match[1], 10) : 0;
}

/**
 * Allocate the next invoice number for `series` within `businessId`.
 *
 * Returns a formatted string; does NOT insert anything. The caller is expected
 * to create the invoice row with this number immediately.
 */
export async function generateNextInvoiceNumber(
	db: Database,
	businessId: string,
	series: string
): Promise<string> {
	return db.transaction(async (tx) => {
		const rows = await tx
			.select({ invoiceNumber: invoice.invoiceNumber })
			.from(invoice)
			.where(and(eq(invoice.businessId, businessId), eq(invoice.series, series)));

		let maxPosition = 0;
		for (const row of rows) {
			const position = parseSuffix(row.invoiceNumber);
			if (position > maxPosition) maxPosition = position;
		}

		const next = maxPosition + 1;
		return `${series}-${padSeriesNumber(next)}`;
	});
}

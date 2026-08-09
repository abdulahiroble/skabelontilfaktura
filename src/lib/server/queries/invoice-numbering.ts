import { sql } from 'drizzle-orm';
import { invoiceCounter } from '$lib/server/db/schema';
import { padSeriesNumber } from '$lib/invoice/numbering';
import type { Database, DatabaseTransaction } from '$lib/server/db/client';

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

/**
 * Allocate the next invoice number for `series` within `businessId`.
 *
 * Uses an atomic Postgres upsert so concurrent devices cannot receive the same
 * sequence value. Call this from the same transaction that inserts the invoice.
 */
export async function generateNextInvoiceNumber(
	db: Database | DatabaseTransaction,
	businessId: string,
	series: string
): Promise<string> {
	const [counter] = await db
		.insert(invoiceCounter)
		.values({ businessId, series, nextValue: 1 })
		.onConflictDoUpdate({
			target: [invoiceCounter.businessId, invoiceCounter.series],
			set: { nextValue: sql`${invoiceCounter.nextValue} + 1` }
		})
		.returning({ value: invoiceCounter.nextValue });

	return `${series}-${padSeriesNumber(counter.value)}`;
}

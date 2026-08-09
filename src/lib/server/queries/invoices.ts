import { and, desc, eq } from 'drizzle-orm';
import { invoice, invoiceItem } from '$lib/server/db/schema';
import type { Database } from '$lib/server/db/client';
import type { InvoiceData, InvoiceStatus } from '$lib/invoice/types';
import { calculateTotals } from '$lib/invoice/moms';
import { generateNextInvoiceNumber } from './invoice-numbering';

export type StoredInvoice = typeof invoice.$inferSelect;

function parseDate(value: string): Date {
	return new Date(`${value}T12:00:00.000Z`);
}

function money(value: number): string {
	return value.toFixed(2);
}

/** List all invoices owned by a business, newest first. */
export async function getInvoices(db: Database, businessId: string) {
	return db
		.select({
			id: invoice.id,
			invoiceNumber: invoice.invoiceNumber,
			status: invoice.status,
			currency: invoice.currency,
			total: invoice.total,
			buyerName: invoice.buyerName,
			issuedAt: invoice.issuedAt,
			pdfR2Key: invoice.pdfR2Key,
			createdAt: invoice.createdAt
		})
		.from(invoice)
		.where(eq(invoice.businessId, businessId))
		.orderBy(desc(invoice.createdAt));
}

/** Return one invoice, strictly scoped to its owning business. */
export async function getInvoiceForBusiness(db: Database, id: string, businessId: string) {
	const rows = await db
		.select()
		.from(invoice)
		.where(and(eq(invoice.id, id), eq(invoice.businessId, businessId)))
		.limit(1);
	return rows[0] ?? null;
}

/**
 * Persist a complete invoice snapshot and its normalized line items.
 *
 * Number allocation and insertion happen in one transaction. The unique
 * `(business_id, series, invoice_number)` constraint remains the final
 * concurrency guard.
 */
export async function createInvoice(
	db: Database,
	businessId: string,
	data: InvoiceData,
	clientId?: string | null
) {
	return db.transaction(async (tx) => {
		const invoiceNumber = await generateNextInvoiceNumber(tx, businessId, data.series);
		const snapshot: InvoiceData = { ...data, invoiceNumber };
		const totals = calculateTotals(snapshot.items, snapshot.vatMode);

		const [created] = await tx
			.insert(invoice)
			.values({
				businessId,
				clientId: clientId || null,
				invoiceNumber,
				series: snapshot.series,
				status: 'draft',
				currency: snapshot.currency,
				subtotal: money(totals.subtotal),
				vatRate: money(totals.vatRate),
				vatAmount: money(totals.vatAmount),
				total: money(totals.total),
				items: snapshot.items,
				data: snapshot,
				buyerName: snapshot.buyer.name,
				buyerEmail: snapshot.buyer.email || null,
				issuedAt: parseDate(snapshot.issueDate),
				dueAt: parseDate(snapshot.dueDate)
			})
			.returning();

		if (snapshot.items.length > 0) {
			await tx.insert(invoiceItem).values(
				snapshot.items.map((item, index) => ({
					invoiceId: created.id,
					description: item.description,
					quantity: String(item.quantity),
					unitPrice: money(item.unitPrice),
					vatRate: money(item.vatRate),
					sortOrder: index
				}))
			);
		}

		return { row: created, data: snapshot };
	});
}

/** Attach the generated PDF object key after a successful R2 upload. */
export async function setInvoicePdfKey(db: Database, id: string, businessId: string, key: string) {
	const [updated] = await db
		.update(invoice)
		.set({ pdfR2Key: key, updatedAt: new Date() })
		.where(and(eq(invoice.id, id), eq(invoice.businessId, businessId)))
		.returning();
	return updated ?? null;
}

/** Update workflow status, including paid timestamp bookkeeping. */
export async function updateInvoiceStatus(
	db: Database,
	id: string,
	businessId: string,
	status: InvoiceStatus
) {
	const [updated] = await db
		.update(invoice)
		.set({
			status,
			paidAt: status === 'paid' ? new Date() : null,
			updatedAt: new Date()
		})
		.where(and(eq(invoice.id, id), eq(invoice.businessId, businessId)))
		.returning();
	return updated ?? null;
}

/** Delete an invoice and cascade its line items and reminder logs. */
export async function deleteInvoice(db: Database, id: string, businessId: string) {
	const [deleted] = await db
		.delete(invoice)
		.where(and(eq(invoice.id, id), eq(invoice.businessId, businessId)))
		.returning();
	return deleted ?? null;
}

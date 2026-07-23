import { and, eq, gte, inArray, lte } from 'drizzle-orm';
import { business, client, invoice, invoiceItem } from '$lib/server/db/schema';
import type { Database } from '$lib/server/db/client';

/**
 * SAF-T (Standard Audit File - Tax) 2.0 XML builder for Danish accounting
 * compliance (Erhvervsstyrelsen "SAF-T Financial Data v2.0").
 *
 * This module is **server-side only**. It reads invoice data through a
 * per-request `Database` instance (see `getDb`) and returns a pretty-printed
 * UTF-8 XML string conforming to the simplified SAF-T structure documented in
 * the product spec.
 *
 * Design notes:
 * - No external XML library is used; the document is assembled with string
 *   concatenation. All text content is escaped to keep the document
 *   well-formed.
 * - Drizzle returns `numeric` columns as strings, so every amount is parsed to
 *   a number before formatting.
 * - Only finalized invoices (`sent`, `paid`, `overdue`) are exported. Drafts
 *   and voided invoices are excluded.
 * - The `invoice` table currently has no dedicated credit-note flag, so all
 *   exported invoices are emitted as positive sales. When a credit-note
 *   column is added, those invoices should be emitted with negated amounts.
 */

export interface SaftPeriod {
	from: Date;
	to: Date;
}

/** A normalized invoice line used internally by the builder. */
interface SaftLine {
	description: string;
	quantity: number;
	unitPrice: number;
	vatRate: number; // decimal fraction, e.g. 0.25 for 25%
}

/** Software identification embedded in the SAF-T header. */
const SOFTWARE_NAME = 'skabelontilfaktura.dk';
const SOFTWARE_VERSION = '1.0';
const SAF_VERSION = '2.0';
const SAF_COUNTRY = 'Danmark';

/** Invoice statuses considered "finalized" and therefore exportable. */
const EXPORTABLE_STATUSES = new Set(['sent', 'paid', 'overdue']);

/**
 * Escape the five XML special characters in text content so the document stays
 * well-formed regardless of user-provided data.
 */
function escapeXml(value: unknown): string {
	return String(value ?? '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

/** Format a numeric value with exactly 2 decimals, dot as decimal separator. */
function formatAmount(value: string | number | null | undefined): string {
	const n = typeof value === 'number' ? value : value ? parseFloat(value) : 0;
	return (Number.isFinite(n) ? n : 0).toFixed(2);
}

/** Format a decimal VAT rate (e.g. 0.25) as a percentage (e.g. "25.00"). */
function formatRate(decimalRate: string | number | null | undefined): string {
	const raw =
		typeof decimalRate === 'number' ? decimalRate : decimalRate ? parseFloat(decimalRate) : 0;
	const pct = (Number.isFinite(raw) ? raw : 0) * 100;
	return pct.toFixed(2);
}

/** Format a quantity preserving up to 3 decimals (matches the DB scale). */
function formatQuantity(value: string | number | null | undefined): string {
	const n = typeof value === 'number' ? value : value ? parseFloat(value) : 0;
	return (Number.isFinite(n) ? n : 0).toString();
}

/** Format a `Date`-mode column as an ISO 8601 calendar date (YYYY-MM-DD). */
function formatDate(value: Date | null | undefined): string {
	if (!value) return '';
	return value.toISOString().slice(0, 10);
}

/**
 * Assign a stable SAF-T `TaxCode` for a decimal VAT rate.
 *
 * Follows the Danish convention in the spec: 25% standard → "1", 0% exempt →
 * "0". Other rates receive incrementing codes in descending-rate order so the
 * output is deterministic.
 */
function buildTaxCodeMap(rates: number[]): Map<number, string> {
	const distinct = Array.from(new Set(rates.filter((r) => Number.isFinite(r)))).sort(
		(a, b) => b - a
	);
	const map = new Map<number, string>();
	let next = 2; // "0" and "1" are reserved.
	for (const rate of distinct) {
		if (rate === 0) map.set(rate, '0');
		else if (rate >= 0.25) map.set(rate, '1');
		else {
			map.set(rate, String(next));
			next += 1;
		}
	}
	return map;
}

/**
 * Load all data required to assemble the SAF-T file:
 * the business, its clients, its finalized invoices in the period, and the
 * matching line items.
 */
async function loadSaftData(db: Database, businessId: string, period: SaftPeriod) {
	const [businessRow] = await db
		.select()
		.from(business)
		.where(eq(business.id, businessId))
		.limit(1);

	const clients = await db.select().from(client).where(eq(client.businessId, businessId));

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

	const invoiceIds = invoices.map((row) => row.id);
	const itemRows =
		invoiceIds.length === 0
			? []
			: await db.select().from(invoiceItem).where(inArray(invoiceItem.invoiceId, invoiceIds));

	return { businessRow: businessRow ?? null, clients, invoices, itemRows };
}

/**
 * Resolve the line items for a single invoice.
 *
 * Prefers the normalized `invoiceItem` table. When no rows exist there, falls
 * back to the `items` jsonb column (which stores the client-side
 * `InvoiceItem[]`). As a last resort, synthesizes a single summary line from
 * the invoice subtotal so the SAF-T file always balances to the invoice total.
 */
function resolveLines(
	inv: typeof invoice.$inferSelect,
	itemRows: (typeof invoiceItem.$inferSelect)[]
): SaftLine[] {
	const rows = itemRows
		.filter((row) => row.invoiceId === inv.id)
		.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

	if (rows.length > 0) {
		return rows.map((row) => ({
			description: row.description,
			quantity: num(row.quantity),
			unitPrice: num(row.unitPrice),
			vatRate: num(row.vatRate)
		}));
	}

	const jsonbItems = Array.isArray(inv.items) ? (inv.items as unknown[]) : null;
	if (jsonbItems && jsonbItems.length > 0) {
		return jsonbItems.map((raw) => {
			const item = (raw ?? {}) as Record<string, unknown>;
			return {
				description: String(item.description ?? 'Linje'),
				quantity: num(item.quantity ?? 1),
				unitPrice: num(item.unitPrice ?? 0),
				vatRate: num(item.vatRate ?? inv.vatRate ?? 0)
			};
		});
	}

	// Fallback: a single summary line derived from the invoice totals.
	return [
		{
			description: 'Salg',
			quantity: 1,
			unitPrice: num(inv.subtotal),
			vatRate: num(inv.vatRate)
		}
	];
}

/** Coerce a Drizzle numeric/string/number value to a JS number. */
function num(value: unknown): number {
	if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
	if (typeof value === 'string' && value.length > 0) {
		const parsed = parseFloat(value);
		return Number.isFinite(parsed) ? parsed : 0;
	}
	return 0;
}

/**
 * Build a SAF-T 2.0 XML document for the given business and period.
 *
 * Returns a pretty-printed XML string (UTF-8, 2-space indentation). Throws if
 * the business does not exist.
 */
export async function buildSaftXml(
	db: Database,
	businessId: string,
	period: SaftPeriod
): Promise<string> {
	const { businessRow, clients, invoices, itemRows } = await loadSaftData(db, businessId, period);
	if (!businessRow) {
		throw new Error(`SAF-T: business ${businessId} not found`);
	}

	// Index clients by id for fast invoice lookups.
	const clientById = new Map(clients.map((c) => [c.id, c]));

	// Collect every VAT rate present (invoice + line level) to build the tax table.
	const allRates: number[] = [];
	for (const inv of invoices) {
		allRates.push(num(inv.vatRate));
		for (const line of resolveLines(inv, itemRows)) {
			allRates.push(line.vatRate);
		}
	}
	const taxCodes = buildTaxCodeMap(allRates);

	// Aggregate the tax base per rate for the <TaxTableEntry><TaxBase> values.
	const baseByRate = new Map<number, number>();
	for (const inv of invoices) {
		for (const line of resolveLines(inv, itemRows)) {
			const base = line.quantity * line.unitPrice;
			baseByRate.set(line.vatRate, (baseByRate.get(line.vatRate) ?? 0) + base);
		}
	}

	const finalized = invoices.filter((inv) => EXPORTABLE_STATUSES.has(inv.status));

	const lines: string[] = [];
	const push = (depth: number, tag: string, text?: unknown) => {
		const indent = '  '.repeat(depth);
		if (text === undefined || text === null) {
			lines.push(`${indent}<${tag}></${tag}>`);
		} else {
			lines.push(`${indent}<${tag}>${escapeXml(text)}</${tag}>`);
		}
	};
	const open = (depth: number, tag: string, attrs?: string) => {
		lines.push(`${'  '.repeat(depth)}<${tag}${attrs ? ` ${attrs}` : ''}>`);
	};
	const close = (depth: number, tag: string) => {
		lines.push(`${'  '.repeat(depth)}</${tag}>`);
	};

	lines.push('<?xml version="1.0" encoding="UTF-8"?>');
	open(0, 'AuditFile', 'xmlns="urn:dk:skat:saf:2.0"');

	// -- Header -------------------------------------------------------------
	open(1, 'Header');
	push(2, 'AuditFileVersion', SAF_VERSION);
	push(2, 'AuditFileCountry', SAF_COUNTRY);
	push(2, 'CompanyName', businessRow.name);
	push(2, 'CompanyCVR', businessRow.cvr ?? '');
	push(2, 'CurrencyCode', 'DKK');
	push(2, 'PeriodStart', formatDate(period.from));
	push(2, 'PeriodEnd', formatDate(period.to));
	push(2, 'Software', SOFTWARE_NAME);
	push(2, 'SoftwareVersion', SOFTWARE_VERSION);
	push(2, 'DateCreated', formatDate(new Date()));
	close(1, 'Header');

	// -- MasterFiles --------------------------------------------------------
	open(1, 'MasterFiles');

	// Customers
	open(2, 'Customers');
	for (const c of clients) {
		open(3, 'Customer');
		push(4, 'RegistrationNumber', c.cvr ?? c.id);
		push(4, 'Name', c.name);
		push(4, 'Address', c.address ?? '');
		if (c.email) push(4, 'Email', c.email);
		if (c.peppolId) push(4, 'PeppolId', c.peppolId);
		close(3, 'Customer');
	}
	if (clients.length === 0) {
		// Empty element keeps the document well-formed when there are no customers.
		push(3, 'Customer', '');
	}
	close(2, 'Customers');

	// Tax table (sorted by code ascending for deterministic output).
	open(2, 'TaxTable');
	const sortedRates = Array.from(taxCodes.entries()).sort(
		(a, b) => Number(taxCodes.get(a[0])) - Number(taxCodes.get(b[0]))
	);
	for (const [rate, code] of sortedRates) {
		open(3, 'TaxTableEntry');
		push(4, 'TaxCode', code);
		push(4, 'TaxRate', formatRate(rate));
		push(4, 'TaxBase', formatAmount(baseByRate.get(rate) ?? 0));
		close(3, 'TaxTableEntry');
	}
	if (sortedRates.length === 0) {
		push(3, 'TaxTableEntry', '');
	}
	close(2, 'TaxTable');

	close(1, 'MasterFiles');

	// -- SourceDocuments ----------------------------------------------------
	open(1, 'SourceDocuments');
	open(2, 'SalesInvoices');
	for (const inv of finalized) {
		const cli = inv.clientId ? (clientById.get(inv.clientId) ?? null) : null;
		open(3, 'Invoice');
		push(4, 'InvoiceNumber', inv.invoiceNumber);
		push(4, 'InvoiceDate', formatDate(inv.issuedAt));
		push(4, 'CustomerID', cli ? (cli.cvr ?? cli.id) : '');
		push(4, 'Currency', inv.currency ?? 'DKK');
		const lineItems = resolveLines(inv, itemRows);
		lineItems.forEach((line, index) => {
			open(4, 'InvoiceLine');
			push(5, 'LineNumber', index + 1);
			push(5, 'Description', line.description);
			push(5, 'Quantity', formatQuantity(line.quantity));
			push(5, 'UnitPrice', formatAmount(line.unitPrice));
			push(5, 'TaxBase', formatAmount(line.quantity * line.unitPrice));
			push(5, 'TaxCode', taxCodes.get(line.vatRate) ?? '0');
			close(4, 'InvoiceLine');
		});
		// Document totals mirror the OECD SAF-T `DocumentTotals` block.
		open(4, 'DocumentTotals');
		push(5, 'NetAmount', formatAmount(inv.subtotal));
		push(5, 'TaxAmount', formatAmount(inv.vatAmount));
		push(5, 'GrossAmount', formatAmount(inv.total));
		close(4, 'DocumentTotals');
		close(3, 'Invoice');
	}
	close(2, 'SalesInvoices');
	close(1, 'SourceDocuments');

	close(0, 'AuditFile');

	return lines.join('\n') + '\n';
}

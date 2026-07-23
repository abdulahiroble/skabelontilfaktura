/**
 * CSV export to the Danish standard chart of accounts (standardkontoplanen).
 *
 * The output uses a semicolon separator and comma decimal separator so it
 * opens correctly in Danish Excel (`;` is the default list separator on a
 * Danish locale). Each finalized invoice is expanded into balanced double-entry
 * rows:
 *
 *   Debet  1300 Tilgodehavender / Bank   = invoice total (incl. VAT)
 *   Kredit 1000 Salg                     = invoice net subtotal
 *   Kredit 1400 Moms udgående            = invoice VAT amount
 *
 * Invoices with a zero net subtotal are skipped to avoid empty postings.
 */

/** A single finalized invoice projected into posting rows. */
export interface InvoiceRow {
	invoiceNumber: string;
	issuedAt: Date | null;
	clientName: string | null;
	subtotal: string | number;
	vatAmount: string | number;
	total: string | number;
	currency?: string | null;
}

/** Standardkontoplanen account codes used for sales postings. */
export const ACCOUNT_RECEIVABLE = '1300'; // Tilgodehavender fra salg / Bank (debet)
export const ACCOUNT_SALES = '1000'; // Salg af varer/ydelser (kredit)
export const ACCOUNT_VAT = '1400'; // Moms udgående (kredit)

/** Coerce a Drizzle numeric/string/number value to a JS number. */
function num(value: string | number | null | undefined): number {
	if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
	if (typeof value === 'string' && value.length > 0) {
		const parsed = parseFloat(value);
		return Number.isFinite(parsed) ? parsed : 0;
	}
	return 0;
}

/** Format an amount as a Danish-style decimal string ("1.234,56"). */
function formatDk(value: number): string {
	// Two decimals, comma separator, dot thousands separator (Danish convention).
	return value
		.toFixed(2)
		.replace('.', ',')
		.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/** Format a `Date` as YYYY-MM-DD, or empty string when missing. */
function formatDate(value: Date | null | undefined): string {
	if (!value) return '';
	return value.toISOString().slice(0, 10);
}

/**
 * Quote a CSV field when it contains the separator, a quote, or a newline.
 * Internal double quotes are doubled per RFC 4180.
 */
function csvField(value: unknown): string {
	const text = value === null || value === undefined ? '' : String(value);
	if (/[";\n\r]/.test(text)) {
		return `"${text.replace(/"/g, '""')}"`;
	}
	return text;
}

/** A single posting row in the CSV. */
interface Posting {
	account: string;
	date: string;
	voucher: string;
	text: string;
	debit: number;
	credit: number;
}

/** Expand one invoice into its balanced double-entry postings. */
function postingsForInvoice(inv: InvoiceRow): Posting[] {
	const net = num(inv.subtotal);
	const vat = num(inv.vatAmount);
	const gross = num(inv.total) || net + vat;
	const date = formatDate(inv.issuedAt);
	const voucher = inv.invoiceNumber;
	const label =
		inv.clientName && inv.clientName.trim().length > 0 ? `Salg ${inv.clientName.trim()}` : 'Salg';

	const rows: Posting[] = [];
	if (gross !== 0) {
		rows.push({
			account: ACCOUNT_RECEIVABLE,
			date,
			voucher,
			text: label,
			debit: gross,
			credit: 0
		});
	}
	if (net !== 0) {
		rows.push({
			account: ACCOUNT_SALES,
			date,
			voucher,
			text: label,
			debit: 0,
			credit: net
		});
	}
	if (vat !== 0) {
		rows.push({
			account: ACCOUNT_VAT,
			date,
			voucher,
			text: `${label} - moms`,
			debit: 0,
			credit: vat
		});
	}
	return rows;
}

/**
 * Build a standardkontoplanen CSV string from finalized invoices.
 *
 * Columns: `Kontonummer;Dato;Bilag;Tekst;Debet;Kredit`.
 * Returns the CSV with a trailing newline.
 */
export function buildSaftCsv(invoices: InvoiceRow[]): string {
	const header = ['Kontonummer', 'Dato', 'Bilag', 'Tekst', 'Debet', 'Kredit']
		.map(csvField)
		.join(';');

	const rows: string[] = [header];
	for (const inv of invoices) {
		// Skip invoices with no net amount — nothing meaningful to post.
		if (num(inv.subtotal) === 0) continue;
		for (const posting of postingsForInvoice(inv)) {
			rows.push(
				[
					posting.account,
					posting.date,
					posting.voucher,
					posting.text,
					posting.debit !== 0 ? formatDk(posting.debit) : '',
					posting.credit !== 0 ? formatDk(posting.credit) : ''
				]
					.map(csvField)
					.join(';')
			);
		}
	}

	return rows.join('\n') + '\n';
}

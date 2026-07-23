/**
 * Danish VAT (moms) calculation engine.
 *
 * Every function in this module is **pure**: no side effects, no Svelte
 * reactivity, no I/O. The same inputs always produce the same outputs. This
 * makes them safe to reuse from UI components, PDF generation, server endpoints,
 * and tests alike.
 *
 * Number policy: calculations use regular JS numbers (float64) at full precision.
 * Rounding to 2 decimal places happens **only** at display time (see
 * `formatTotals` / `formatCurrency`). This avoids compounding rounding errors
 * across aggregation steps.
 */
import type { Currency, InvoiceItem, InvoiceLanguage, VatMode } from './types';
import { formatCurrency } from './validation';

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Aggregated monetary totals for an invoice.
 *
 * - `subtotal` is always the sum of line items (quantity x unitPrice, after any
 *   line-level discount), excluding VAT.
 * - `vatRate` is the statutory rate expressed as a fraction (0.25 = 25%). For
 *   special modes it reflects the rate actually applied (0 for exempt/reverse,
 *   0.25 for kunstnermoms where 25% is charged on the taxable 20%).
 * - `taxableBase` / `exemptBase` are only populated for kunstnermoms, where part
 *   of the gross is subject to VAT and part is VAT-free.
 */
export interface InvoiceTotals {
	subtotal: number; // sum of line items (quantity x unitPrice), excluding VAT
	vatRate: number; // e.g., 0.25 for 25%
	vatAmount: number; // VAT to charge
	total: number; // subtotal + vatAmount
	taxableBase?: number; // for kunstnermoms: the portion subject to VAT
	exemptBase?: number; // for kunstnermoms: the portion not subject to VAT
	label?: string; // human-readable label for special modes
}

/**
 * Display-ready (localized, formatted) version of {@link InvoiceTotals}.
 * Every monetary field is a pre-formatted string ready to render in the UI or
 * PDF. `vatRate` is rendered as a percentage string (e.g. "25%").
 */
export interface FormattedTotals {
	subtotal: string;
	vatRate: string;
	vatAmount: string;
	total: string;
	taxableBase?: string;
	exemptBase?: string;
	label?: string;
}

/* -------------------------------------------------------------------------- */
/* Internal helpers                                                           */
/* -------------------------------------------------------------------------- */

/** Statutory Danish VAT rate. */
const STANDARD_VAT_RATE = 0.25;

/**
 * For kunstnermoms (the special VAT scheme for visual artists selling their own
 * works, momslovens § 13 stk. 5), 20% of the gross is treated as taxable base
 * and 80% is VAT-free. VAT is then charged at the standard 25% on that 20%.
 */
const KUNSTNERMOMS_TAXABLE_FRACTION = 0.2;
const KUNSTNERMOMS_EXEMPT_FRACTION = 0.8;

/* -------------------------------------------------------------------------- */
/* Line / subtotal calculations                                               */
/* -------------------------------------------------------------------------- */

/**
 * Compute the net total for a single line item: quantity x unitPrice, reduced
 * by an optional percentage discount (0-100). The discount is clamped to the
 * valid range so malformed inputs cannot produce negative or inflated totals.
 *
 * Per-item `vatRate` on {@link InvoiceItem} is intentionally ignored here — VAT
 * is computed at the invoice level by the mode-specific functions below.
 */
export function calcLineTotal(item: InvoiceItem): number {
	const gross = item.quantity * item.unitPrice;
	if (!item.discount || item.discount <= 0) return gross;
	const clamped = Math.max(0, Math.min(100, item.discount));
	return gross * (1 - clamped / 100);
}

/**
 * Sum of all line totals (net, excluding VAT). Returns 0 for an empty list.
 */
export function calcSubtotal(items: InvoiceItem[]): number {
	return items.reduce((sum, item) => sum + calcLineTotal(item), 0);
}

/* -------------------------------------------------------------------------- */
/* Mode-specific calculations                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Standard Danish VAT. Charges `vatRate` (default 25%) on the full subtotal.
 */
export function calcStandard(items: InvoiceItem[], vatRate = STANDARD_VAT_RATE): InvoiceTotals {
	const subtotal = calcSubtotal(items);
	const vatAmount = subtotal * vatRate;
	return {
		subtotal,
		vatRate,
		vatAmount,
		total: subtotal + vatAmount
	};
}

/**
 * Kunstnermoms — special VAT scheme for visual artists (momslovens § 13 stk. 5).
 *
 * The full gross counts as the base. 20% of it is taxable (at 25% VAT) and the
 * remaining 80% is VAT-free. The invoice total is therefore gross + the VAT on
 * the taxable 20%.
 *
 * Example: 1.000 kr. gross -> 200 kr. taxable, 800 kr. exempt, 50 kr. VAT,
 * total 1.050 kr.
 */
export function calcKunstnermoms(items: InvoiceItem[]): InvoiceTotals {
	const gross = calcSubtotal(items);
	const taxableBase = gross * KUNSTNERMOMS_TAXABLE_FRACTION;
	const exemptBase = gross * KUNSTNERMOMS_EXEMPT_FRACTION;
	const vatAmount = taxableBase * STANDARD_VAT_RATE;
	return {
		subtotal: gross,
		vatRate: STANDARD_VAT_RATE,
		vatAmount,
		total: gross + vatAmount,
		taxableBase,
		exemptBase,
		label: 'Kunstnermoms: 20% momspligtig, 80% momsfri'
	};
}

/**
 * VAT-exempt supply (momslovens § 13). No VAT is charged; the total equals the
 * subtotal.
 */
export function calcMomsfritaget(items: InvoiceItem[]): InvoiceTotals {
	const subtotal = calcSubtotal(items);
	return {
		subtotal,
		vatRate: 0,
		vatAmount: 0,
		total: subtotal,
		label: 'Momsfritaget efter momslovens § 13'
	};
}

/**
 * Reverse charge — applies to B2B cross-border / VAT-registered buyers where the
 * buyer accounts for the VAT. No VAT is charged on the invoice; the total equals
 * the subtotal.
 */
export function calcReverseCharge(items: InvoiceItem[]): InvoiceTotals {
	const subtotal = calcSubtotal(items);
	return {
		subtotal,
		vatRate: 0,
		vatAmount: 0,
		total: subtotal,
		label: 'Moms omvendt betalingspligt (reverse charge)'
	};
}

/* -------------------------------------------------------------------------- */
/* Dispatcher                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Calculate invoice totals for the given VAT mode. This is the main entry point
 * used by the UI and PDF generator.
 *
 * - `standard`: uses `vatRate` (defaults to 25%).
 * - `kunstnermoms` / `momsfritaget` / `reverse`: `vatRate` is ignored; the
 *   statutory rules for each mode apply.
 */
export function calculateTotals(
	items: InvoiceItem[],
	mode: VatMode,
	vatRate?: number
): InvoiceTotals {
	switch (mode) {
		case 'standard':
			return calcStandard(items, vatRate);
		case 'kunstnermoms':
			return calcKunstnermoms(items);
		case 'momsfritaget':
			return calcMomsfritaget(items);
		case 'reverse':
			return calcReverseCharge(items);
	}
}

/* -------------------------------------------------------------------------- */
/* Formatting                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Format a VAT rate fraction as a localized percentage string.
 * `0.25` -> "25%", `0` -> "0%".
 */
function formatVatRate(vatRate: number): string {
	return `${Math.round(vatRate * 100)}%`;
}

/**
 * Produce a display-ready version of {@link InvoiceTotals}, formatting every
 * monetary amount via {@link formatCurrency} and the VAT rate as a percentage.
 *
 * Rounding to 2 decimal places happens here (inside `formatCurrency`); the
 * numeric inputs are kept at full precision.
 */
export function formatTotals(
	totals: InvoiceTotals,
	currency: Currency,
	language: InvoiceLanguage
): FormattedTotals {
	const formatted: FormattedTotals = {
		subtotal: formatCurrency(totals.subtotal, currency, language),
		vatRate: formatVatRate(totals.vatRate),
		vatAmount: formatCurrency(totals.vatAmount, currency, language),
		total: formatCurrency(totals.total, currency, language)
	};
	if (totals.taxableBase !== undefined) {
		formatted.taxableBase = formatCurrency(totals.taxableBase, currency, language);
	}
	if (totals.exemptBase !== undefined) {
		formatted.exemptBase = formatCurrency(totals.exemptBase, currency, language);
	}
	if (totals.label !== undefined) {
		formatted.label = totals.label;
	}
	return formatted;
}

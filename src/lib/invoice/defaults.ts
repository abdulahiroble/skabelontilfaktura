/**
 * Default-value factories for the invoice form.
 *
 * These helpers are intentionally kept in a plain `.ts` module (rather than
 * `store.svelte.ts`) because they perform one-shot Date arithmetic for
 * initial state. Keeping them out of the runes module avoids tripping the
 * `svelte/prefer-svelte-reactivity` lint rule, which flags mutable `Date`
 * instances inside `.svelte.*` files even when they are not reactive.
 */
import type { InvoiceData, InvoiceItem } from './types';
import { getCurrentSeries, padSeriesNumber, peekNextInvoiceNumber } from './numbering';
import { getStoredLocale } from '$lib/i18n';

/**
 * Build a sensible default invoice: Danish locale, DKK currency, standard
 * VAT, current-year series, one empty line item, and an invoice number
 * pre-allocated from the numbering module. Dates default to today and today
 * +8 days (the conventional Danish "Netto 8 dage" terms).
 */
export function createDefaultInvoice(): InvoiceData {
	const series = getCurrentSeries();
	const today = new Date();
	const due = new Date(today.getTime() + 8 * 24 * 60 * 60 * 1000);
	return {
		invoiceNumber: peekNextInvoiceNumber(series),
		series,
		issueDate: toIsoDate(today),
		dueDate: toIsoDate(due),
		deliveryDate: toIsoDate(today),
		seller: emptyParty(),
		buyer: emptyParty(),
		items: [createEmptyItem()],
		currency: 'DKK',
		vatMode: 'standard',
		paymentTerms: 'Netto 8 dage',
		regNr: '',
		kontonr: '',
		mobilepay: '',
		language: getStoredLocale(),
		notes: '',
		logoDataUrl: '',
		brandColor: '',
		template: 'minimalist',
		isProforma: false,
		isCreditNote: false,
		creditNoteRef: ''
	};
}

/** Construct an empty line item with a stable id. */
export function createEmptyItem(): InvoiceItem {
	return {
		id: cryptoRandomId(),
		description: '',
		quantity: 1,
		unit: 'stk',
		unitPrice: 0,
		vatRate: 0.25,
		discount: 0
	};
}

/** Construct an empty party object with all fields initialized to ''. */
function emptyParty() {
	return {
		name: '',
		address: '',
		postalCode: '',
		city: '',
		cvr: '',
		email: '',
		phone: '',
		ean: ''
	};
}

/** Format a Date as an ISO YYYY-MM-DD string in local time. */
export function toIsoDate(date: Date): string {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, '0');
	const d = String(date.getDate()).padStart(2, '0');
	return `${y}-${m}-${d}`;
}

/** Generate a short, collision-resistant id for new line items. */
export function cryptoRandomId(): string {
	if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
		return crypto.randomUUID();
	}
	return `item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Merge a partial persisted draft onto a fresh defaults object so newly added
 * schema fields always have a value. Arrays and nested objects are taken
 * verbatim from the persisted draft when present.
 */
export function mergeWithDefaults(partial: Partial<InvoiceData>): InvoiceData {
	const base = createDefaultInvoice();
	const merged: InvoiceData = { ...base, ...partial };
	merged.seller = { ...base.seller, ...(partial.seller ?? {}) };
	merged.buyer = { ...base.buyer, ...(partial.buyer ?? {}) };
	if (!Array.isArray(partial.items) || partial.items.length === 0) {
		merged.items = base.items;
	} else {
		merged.items = partial.items.map((item) => ({ ...createEmptyItem(), ...item }));
	}
	// Re-pad invoice number in case the user is on a fresh device — we never
	// want to overwrite a stored series counter, but the displayed number
	// should at least be in the right shape.
	if (!merged.invoiceNumber) {
		merged.invoiceNumber = `${merged.series}-${padSeriesNumber(1)}`;
	}
	return merged;
}

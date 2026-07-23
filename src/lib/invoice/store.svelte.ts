/**
 * Reactive invoice form store built on Svelte 5 runes.
 *
 * `createInvoiceStore()` returns a small object that owns the editable
 * `InvoiceData` (a `$state` deep-proxy), a derived Zod validation result, and
 * a handful of methods for loading/saving/resetting. The store is intentionally
 * framework-light: it exposes plain functions and a reactive `data` field that
 * components can `$bind` to.
 *
 * Persistence strategy:
 * - `localStorage` is the only backend (no server calls in the free tier).
 * - Writes are debounced (300ms) so that typing does not hammer the storage API.
 * - Reads happen lazily on first access inside `loadFromStorage()`.
 *
 * The store is created per-mount inside the generator page; nothing here is a
 * module-level singleton, so SSR stays stateless.
 *
 * Plain (non-runes) helpers live in `defaults.ts` so this module only contains
 * runes-aware logic — that keeps the `svelte/prefer-svelte-reactivity` rule
 * happy and the two concerns cleanly separated.
 */
import { InvoiceDataSchema } from './schema';
import type { Currency, InvoiceData, InvoiceLanguage, VatMode } from './types';
import { nextInvoiceNumber } from './numbering';
import { createDefaultInvoice, createEmptyItem, mergeWithDefaults } from './defaults';
import { setStoredLocale } from '$lib/i18n';
import type { ZodSafeParseResult } from 'zod';

/** localStorage key under which the working invoice draft is persisted. */
const DRAFT_STORAGE_KEY = 'faktura:invoice-draft';

/** Debounce window (ms) for autosave writes. */
const SAVE_DEBOUNCE_MS = 300;

// Re-export the factories so callers can import everything from the store.
export { createDefaultInvoice, createEmptyItem, mergeWithDefaults };

/** Public surface returned by `createInvoiceStore`. */
export interface InvoiceStore {
	/** Deeply reactive draft. Mutate fields directly to update. */
	readonly data: InvoiceData;
	/** Zod validation result, recomputed whenever `data` changes. */
	readonly validation: ZodSafeParseResult<InvoiceData>;
	/** Convenience flag: true when the draft passes validation. */
	readonly isValid: boolean;
	/** Whether a draft has been loaded from localStorage. */
	readonly hydrated: boolean;
	/** Replace the entire draft (e.g. when loading a saved template). */
	setData(next: InvoiceData): void;
	/** Append a new empty line item and return its id. */
	addItem(): string;
	/** Remove a line item by id. No-op when it is the last remaining item. */
	removeItem(id: string): void;
	/** Allocate and persist the next sequential invoice number for the current series. */
	assignNextInvoiceNumber(): string;
	/** Force a write to localStorage right now (bypasses debounce). */
	saveToStorage(): void;
	/** Load the draft from localStorage, falling back to defaults. */
	loadFromStorage(): void;
	/** Reset the draft to defaults and clear the persisted copy. */
	resetForm(): void;
	/** Update the active UI locale and persist the preference. */
	setLanguage(locale: InvoiceLanguage): void;
	/** Convenience setters for the settings bar. */
	setCurrency(currency: Currency): void;
	setVatMode(mode: VatMode): void;
}

/**
 * Create a new invoice store. Pass `false` to `autoHydrate` to skip the
 * initial localStorage read (useful in tests).
 */
export function createInvoiceStore(autoHydrate = true): InvoiceStore {
	let data = $state<InvoiceData>(createDefaultInvoice());
	let hydrated = $state(false);

	// Recompute validation every time the draft changes. SafeParse means UI
	// never throws on partial input.
	const validation = $derived(InvoiceDataSchema.safeParse(data));
	const isValid = $derived(validation.success);

	// Debounced autosave. We keep the timer in a closure so each store has its
	// own pending write.
	let saveTimer: ReturnType<typeof setTimeout> | null = null;

	function scheduleSave(): void {
		if (typeof localStorage === 'undefined') return;
		if (saveTimer) clearTimeout(saveTimer);
		saveTimer = setTimeout(() => {
			saveTimer = null;
			persist();
		}, SAVE_DEBOUNCE_MS);
	}

	function persist(): void {
		if (typeof localStorage === 'undefined') return;
		try {
			localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(data));
		} catch {
			// Quota or serialization failure — silently ignore; nothing is lost
			// from the in-memory draft.
		}
	}

	// Re-run scheduleSave whenever any deep field of `data` changes.
	$effect.root(() => {
		$effect(() => {
			// Touch the serialised form so any nested mutation is observed.
			void JSON.stringify(data);
			if (hydrated) scheduleSave();
		});
	});

	function loadFromStorage(): void {
		if (typeof localStorage === 'undefined') {
			hydrated = true;
			return;
		}
		try {
			const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
			if (raw) {
				const parsed = JSON.parse(raw) as Partial<InvoiceData>;
				data = mergeWithDefaults(parsed);
			}
		} catch {
			// Corrupt JSON — fall back to defaults.
		}
		hydrated = true;
	}

	function saveToStorage(): void {
		if (saveTimer) {
			clearTimeout(saveTimer);
			saveTimer = null;
		}
		persist();
	}

	function resetForm(): void {
		if (saveTimer) {
			clearTimeout(saveTimer);
			saveTimer = null;
		}
		data = createDefaultInvoice();
		if (typeof localStorage !== 'undefined') {
			try {
				localStorage.removeItem(DRAFT_STORAGE_KEY);
			} catch {
				// ignore
			}
		}
	}

	function setData(next: InvoiceData): void {
		data = mergeWithDefaults(next);
	}

	function addItem(): string {
		const item = createEmptyItem();
		data.items.push(item);
		return item.id ?? '';
	}

	function removeItem(id: string): void {
		if (data.items.length <= 1) return;
		data.items = data.items.filter((item) => item.id !== id);
	}

	function assignNextInvoiceNumber(): string {
		const number = nextInvoiceNumber(data.series);
		data.invoiceNumber = number;
		return number;
	}

	function setLanguage(locale: InvoiceLanguage): void {
		data.language = locale;
		setStoredLocale(locale);
	}

	function setCurrency(currency: Currency): void {
		data.currency = currency;
	}

	function setVatMode(mode: VatMode): void {
		data.vatMode = mode;
	}

	if (autoHydrate) loadFromStorage();

	return {
		get data() {
			return data;
		},
		get validation() {
			return validation;
		},
		get isValid() {
			return isValid;
		},
		get hydrated() {
			return hydrated;
		},
		setData,
		addItem,
		removeItem,
		assignNextInvoiceNumber,
		saveToStorage,
		loadFromStorage,
		resetForm,
		setLanguage,
		setCurrency,
		setVatMode
	};
}

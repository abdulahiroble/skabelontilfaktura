/**
 * Sequential invoice numbering backed by localStorage.
 *
 * Numbers are grouped into named "series" (by default the current year, e.g.
 * '2026'). Each series maintains its own monotonically increasing counter that
 * starts at 1 and is padded to 4 digits. Multiple parallel series are
 * supported — for example one per currency or per business unit.
 *
 * All operations are synchronous and client-side only. The persistence layer
 * is intentionally tiny so it can be swapped out later without touching the
 * formatting logic.
 */

/** localStorage key under which the series map is stored. */
const SERIES_STORAGE_KEY = 'faktura:invoice-series';

/**
 * Read the persisted series counters as a plain record.
 *
 * Returns an empty object when storage is unavailable (SSR, privacy mode, or
 * first-time use). Never throws.
 */
export function getSeriesMap(): Record<string, number> {
	if (typeof localStorage === 'undefined') return {};
	try {
		const raw = localStorage.getItem(SERIES_STORAGE_KEY);
		if (!raw) return {};
		const parsed: unknown = JSON.parse(raw);
		if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
		const result: Record<string, number> = {};
		for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
			const n = Number(value);
			if (Number.isFinite(n) && n >= 0) result[key] = Math.floor(n);
		}
		return result;
	} catch {
		return {};
	}
}

/** Persist the series counter map. Silently no-ops on SSR or quota errors. */
function writeSeriesMap(map: Record<string, number>): void {
	if (typeof localStorage === 'undefined') return;
	try {
		localStorage.setItem(SERIES_STORAGE_KEY, JSON.stringify(map));
	} catch {
		// Ignore quota / private-mode failures — numbering still works in-memory.
	}
}

/**
 * Returns the current year series identifier (e.g. '2026').
 *
 * The series resets on January 1st because `getCurrentSeries()` always reflects
 * the user's local calendar year. Callers that need a stable identifier for a
 * single invoice should capture the value at creation time.
 */
export function getCurrentSeries(): string {
	return String(new Date().getFullYear());
}

/**
 * Format a numeric position inside a series as a 4-digit padded string.
 *
 * Example: padSeriesNumber(1) -> '0001', padSeriesNumber(12345) -> '12345'.
 */
export function padSeriesNumber(position: number): string {
	if (!Number.isFinite(position) || position < 0) return '0000';
	const rounded = Math.floor(position);
	const digits = String(rounded);
	return digits.padStart(4, '0');
}

/**
 * Allocate and return the next invoice number for the given series.
 *
 * The counter is incremented and persisted atomically. The returned string is
 * always `${series}-${padded}`, e.g. '2026-0001'.
 *
 * If the series does not yet exist it is created and the first issued number
 * is `${series}-0001`.
 */
export function nextInvoiceNumber(series: string): string {
	if (!series) throw new Error('Series identifier must be a non-empty string');
	const map = getSeriesMap();
	const next = (map[series] ?? 0) + 1;
	map[series] = next;
	writeSeriesMap(map);
	return `${series}-${padSeriesNumber(next)}`;
}

/**
 * Peek at the next number that *would* be allocated without incrementing.
 *
 * Useful for previews ("Næste fakturanummer: 2026-0042") before the user has
 * committed to creating a draft.
 */
export function peekNextInvoiceNumber(series: string): string {
	const map = getSeriesMap();
	const next = (map[series] ?? 0) + 1;
	return `${series}-${padSeriesNumber(next)}`;
}

/**
 * Reset a single series back to zero. Primarily intended for tests and an
 * eventual "reset numbering" admin control. Returns true on success.
 */
export function resetSeries(series: string): boolean {
	const map = getSeriesMap();
	if (!(series in map)) return false;
	delete map[series];
	writeSeriesMap(map);
	return true;
}

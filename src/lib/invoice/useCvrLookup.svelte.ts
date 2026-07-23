/**
 * Reactive CVR-lookup composable (Svelte 5 runes).
 *
 * `createCvrLookup()` owns the loading/result/error state for a single CVR
 * lookup and exposes a `lookup()` action that calls the server-side
 * `/api/cvr/lookup` endpoint. The server endpoint proxies cvrapi.dk (which
 * cannot be called directly from the browser due to CORS) and applies
 * rate-limiting.
 *
 * The `CvrResult` type is re-declared locally (rather than imported from the
 * server module) because `$lib/server/*` is server-only and must never be
 * bundled into client code.
 */
import { validateCvr } from './validation';

/** Client-side mirror of the server `CvrResult` shape. */
export interface CvrLookupResult {
	name: string;
	address: string;
	zipcode: string;
	city: string;
	phone?: string;
	email?: string;
	cvr: string;
}

/** Public surface returned by `createCvrLookup`. */
export interface CvrLookup {
	readonly loading: boolean;
	readonly result: CvrLookupResult | null;
	readonly error: string | null;
	/** Look up a company by CVR. Returns the result (or null) for convenience. */
	lookup(cvr: string): Promise<CvrLookupResult | null>;
	/** Clear the current result and error. */
	reset(): void;
}

/**
 * Create a new CVR lookup state container. Create one per component instance —
 * nothing here is a module-level singleton.
 */
export function createCvrLookup(): CvrLookup {
	let loading = $state(false);
	let result = $state<CvrLookupResult | null>(null);
	let error = $state<string | null>(null);

	async function lookup(cvr: string): Promise<CvrLookupResult | null> {
		// Validate the format locally so we never waste a network round-trip.
		if (!validateCvr(cvr)) {
			error = 'CVR skal være 8 cifre';
			result = null;
			return null;
		}

		loading = true;
		error = null;

		try {
			const response = await fetch('/api/cvr/lookup', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ cvr })
			});

			if (!response.ok) {
				const payload = (await response.json().catch(() => null)) as { error?: string } | null;
				// 404 → not found; 429 → rate limited; 400 → bad input; 5xx → upstream.
				error =
					payload?.error ??
					(response.status === 404
						? 'Ingen virksomhed fundet'
						: 'CVR-opslag mislykkedes. Indtast manuelt.');
				result = null;
				return null;
			}

			const data = (await response.json()) as CvrLookupResult;
			result = data;
			return data;
		} catch {
			// Network failure — encourage manual entry.
			error = 'Netværksfejl. Indtast virksomheden manuelt.';
			result = null;
			return null;
		} finally {
			loading = false;
		}
	}

	function reset(): void {
		result = null;
		error = null;
	}

	return {
		get loading() {
			return loading;
		},
		get result() {
			return result;
		},
		get error() {
			return error;
		},
		lookup,
		reset
	};
}

/**
 * Reactive VIES VAT-validation composable (Svelte 5 runes).
 *
 * `createViesValidation()` owns the loading/result/error state for a single EU
 * VAT-number validation and exposes a `validate()` action that calls the
 * server-side `/api/vies/validate` endpoint. The server endpoint proxies the EU
 * VIES REST API and applies rate-limiting.
 *
 * The `ViesResult` type is re-declared locally (rather than imported from the
 * server module) because `$lib/server/*` is server-only and must never be
 * bundled into client code.
 */

/** Client-side mirror of the server `ViesResult` shape. */
export interface ViesValidationResult {
	valid: boolean;
	name?: string;
	address?: string;
	countryCode: string;
	vatNumber: string;
}

/** Public surface returned by `createViesValidation`. */
export interface ViesValidation {
	readonly loading: boolean;
	readonly result: ViesValidationResult | null;
	readonly error: string | null;
	/** Validate a VAT number against VIES. Returns the result (or null). */
	validate(countryCode: string, vatNumber: string): Promise<ViesValidationResult | null>;
	/** Clear the current result and error. */
	reset(): void;
}

/**
 * Create a new VIES validation state container. Create one per component
 * instance — nothing here is a module-level singleton.
 */
export function createViesValidation(): ViesValidation {
	let loading = $state(false);
	let result = $state<ViesValidationResult | null>(null);
	let error = $state<string | null>(null);

	async function validate(
		countryCode: string,
		vatNumber: string
	): Promise<ViesValidationResult | null> {
		const country = countryCode.trim().toUpperCase();

		// Basic client-side guard before spending a network round-trip.
		if (!/^[A-Za-z]{2}$/.test(country)) {
			error = 'Angiv en gyldig landekode (2 bogstaver)';
			result = null;
			return null;
		}
		if (!vatNumber.trim()) {
			error = 'Angiv et momsnummer';
			result = null;
			return null;
		}

		loading = true;
		error = null;

		try {
			const response = await fetch('/api/vies/validate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ countryCode: country, vatNumber })
			});

			if (!response.ok) {
				const payload = (await response.json().catch(() => null)) as { error?: string } | null;
				// 502 → VIES unreachable; 429 → rate limited; 400 → bad input.
				error =
					payload?.error ??
					(response.status === 502 ? 'VIES kunne ikke kontaktes' : 'VIES-validering mislykkedes.');
				result = null;
				return null;
			}

			const data = (await response.json()) as ViesValidationResult;
			result = data;
			return data;
		} catch {
			// Network failure — surface a clear message.
			error = 'Netværksfejl under VIES-validering.';
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
		validate,
		reset
	};
}

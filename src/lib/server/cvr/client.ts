/**
 * Server-side client for the Danish CVR register via the cvrapi.dk community
 * API.
 *
 * Lookup happens server-side for two reasons:
 *  1. cvrapi.dk blocks browser CORS requests from unauthenticated origins.
 *  2. It lets us add caching and rate-limiting centrally rather than per client.
 *
 * The free community endpoint is rate limited (no published hard cap, but the
 * service asks for sensible usage). We never throw on network/API failures —
 * callers receive `null` and can fall back to manual entry.
 *
 * @see https://cvrapi.dk
 */
import { validateCvr } from '$lib/invoice/validation';

/** Normalised result of a successful CVR lookup. */
export interface CvrResult {
	name: string;
	address: string;
	zipcode: string;
	city: string;
	phone?: string;
	email?: string;
	cvr: string;
}

/** Shape of the cvrapi.dk JSON response (subset of fields we consume). */
interface CvrApiResponse {
	name?: string;
	address?: string;
	zipcode?: string;
	city?: string;
	phone?: string;
	email?: string;
	vat?: string;
	/** cvrapi.dk returns an `error` field when the lookup fails. */
	error?: string;
}

/** Base URL for the free community endpoint. */
const CVRAPI_BASE = 'https://cvrapi.dk/api';

/** Request timeout (ms). cvrapi.dk is normally fast; bail out early on stalls. */
const REQUEST_TIMEOUT_MS = 8000;

/**
 * Look up a Danish company by CVR number.
 *
 * @param cvr     8-digit Danish CVR number.
 * @param fetchFn Optional fetch implementation. Defaults to the global `fetch`
 *                (which on Cloudflare Workers is the runtime fetch). Accepting
 *                an injection point keeps the function trivially testable.
 * @returns A `CvrResult` when found, or `null` on any failure (bad input, not
 *          found, network error, non-200 response). Never throws.
 */
export async function lookupCvr(
	cvr: string,
	fetchFn: typeof fetch = fetch
): Promise<CvrResult | null> {
	// Validate the format up front so we never hit the network with junk.
	if (!validateCvr(cvr)) {
		return null;
	}

	const url = `${CVRAPI_BASE}?search=${encodeURIComponent(cvr)}&country=dk&format=json`;

	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

	try {
		// cvrapi.dk rejects requests that look like a plain browser (empty or
		// default User-Agent). Send a descriptive UA identifying the app.
		const response = await fetchFn(url, {
			signal: controller.signal,
			headers: {
				Accept: 'application/json',
				'User-Agent': 'Faktura/1.0 (https://github.com/faktura)'
			}
		});

		if (!response.ok) {
			// 404 / 429 / 5xx — treat uniformly as "not available right now".
			return null;
		}

		const data = (await response.json()) as CvrApiResponse;

		// cvrapi.dk signals lookup failure with an `error` field rather than a
		// non-200 status.
		if (data.error || !data.name) {
			return null;
		}

		return {
			name: data.name,
			address: data.address ?? '',
			zipcode: data.zipcode ?? '',
			city: data.city ?? '',
			phone: data.phone || undefined,
			email: data.email || undefined,
			// Prefer the VAT/CVR echoed back by the API; fall back to the input.
			cvr: data.vat ?? cvr
		};
	} catch {
		// Network error, abort (timeout), or JSON parse failure — never crash.
		return null;
	} finally {
		clearTimeout(timeout);
	}
}

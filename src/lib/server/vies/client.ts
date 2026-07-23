/**
 * Server-side client for EU VIES (VAT Information Exchange System) validation.
 *
 * VIES lets us verify that a given EU VAT number is registered and active.
 * Validation runs server-side so the request originates from a stable origin
 * (VIES is occasionally picky about browser-like traffic) and so we can add
 * caching/rate-limiting centrally.
 *
 * We use the VIES REST endpoint (`/rest-api/ms/{country}/vat/{number}`) which
 * returns JSON and is simpler to consume than the SOAP service. As with the CVR
 * client, network/API errors resolve to `null` rather than throwing so callers
 * can fall back gracefully.
 *
 * @see https://ec.europa.eu/taxation_customs/vies
 */
/** Normalised result of a VIES VAT-number validation. */
export interface ViesResult {
	/** Whether the VAT number is currently valid/registered. */
	valid: boolean;
	/** Registered company name (VIES often masks this with "---"). */
	name?: string;
	/** Registered address (VIES often masks this with "---"). */
	address?: string;
	countryCode: string;
	vatNumber: string;
}

/** Shape of the VIES REST JSON response (subset of fields we consume). */
interface ViesApiResponse {
	isValid?: boolean;
	name?: string;
	address?: string;
	vatNumber?: string;
	countryCode?: string;
	/** VIES surfaces failures via `userError` / `actionSucceed` rather than HTTP. */
	userError?: string;
	actionSucceed?: boolean;
}

/** Base URL for the VIES REST API. */
const VIES_REST_BASE = 'https://ec.europa.eu/taxation_customs/vies/rest-api/ms';

/** Request timeout (ms). VIES can be slow; allow a generous window. */
const REQUEST_TIMEOUT_MS = 12000;

/** Supported EU country codes (2-letter ISO). Used to guard input. */
const EU_COUNTRY_CODES = new Set([
	'AT',
	'BE',
	'BG',
	'HR',
	'CY',
	'CZ',
	'DK',
	'EE',
	'FI',
	'FR',
	'DE',
	'EL',
	'HU',
	'IE',
	'IT',
	'LV',
	'LT',
	'LU',
	'MT',
	'NL',
	'PL',
	'PT',
	'RO',
	'SK',
	'SI',
	'ES',
	'SE',
	'GB',
	'XI'
]);

/**
 * Strip whitespace, dashes, dots and a leading country prefix from a VAT number
 * so only the bare numeric/alphanumeric payload remains.
 *
 * e.g. "DK 12 34 56 78" -> "12345678", "IE-1234567X" -> "1234567X"
 */
export function normalizeVatNumber(vatNumber: string, countryCode: string): string {
	let normalized = vatNumber.trim().toUpperCase();
	// Remove any explicit country prefix (e.g. "DK12345678" or "DK 12345678").
	const prefix = countryCode.toUpperCase();
	if (normalized.startsWith(prefix)) {
		normalized = normalized.slice(prefix.length);
	}
	// Strip structural separators and whitespace.
	return normalized.replace(/[\s.-]/g, '');
}

/**
 * Validate an EU VAT number against VIES.
 *
 * @param countryCode ISO 3166-1 alpha-2 country code (e.g. "DK", "DE").
 * @param vatNumber   VAT number, with or without the country prefix / spaces.
 * @returns A `ViesResult` when the VIES call completed (valid or invalid), or
 *          `null` on a network/parse failure. Never throws.
 */
export async function validateVies(
	countryCode: string,
	vatNumber: string
): Promise<ViesResult | null> {
	const country = countryCode.trim().toUpperCase();

	// Guard the input so we never call VIES with obviously malformed data.
	if (!EU_COUNTRY_CODES.has(country)) {
		return null;
	}

	const number = normalizeVatNumber(vatNumber, country);
	if (!number) {
		return null;
	}

	const url = `${VIES_REST_BASE}/${country}/vat/${encodeURIComponent(number)}`;

	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

	try {
		const response = await fetch(url, {
			signal: controller.signal,
			method: 'GET',
			headers: {
				Accept: 'application/json'
			}
		});

		if (!response.ok) {
			return null;
		}

		const data = (await response.json()) as ViesApiResponse;

		// VIES sometimes reports failure via `actionSucceed` while still 200 OK.
		if (data.actionSucceed === false) {
			return null;
		}

		const valid = data.isValid === true;

		// VIES masks name/address with "---" when it does not disclose them; treat
		// that sentinel as "not available".
		const cleanField = (value?: string): string | undefined =>
			value && value.trim() !== '---' ? value.trim() || undefined : undefined;

		return {
			valid,
			name: cleanField(data.name),
			address: cleanField(data.address),
			countryCode: country,
			vatNumber: number
		};
	} catch {
		// Network error, abort (timeout), or JSON parse failure — never crash.
		return null;
	} finally {
		clearTimeout(timeout);
	}
}

/**
 * POST /api/vies/validate
 *
 * Server-side proxy for EU VIES VAT-number validation. Running it on the server
 * keeps requests to a stable origin and lets us rate-limit centrally.
 *
 * Request body: `{ "countryCode": "DK", "vatNumber": "12345678" }`
 * Responses:
 *   200 — `{ ...ViesResult }` (note: `valid` may be `false`; that is a real
 *          validation result, distinct from a network failure)
 *   400 — malformed request body / missing fields
 *   502 — VIES could not be reached (network/parse failure)
 *   429 — rate limit exceeded (max 10 requests/minute per IP)
 *
 * Rate limiting uses a simple per-isolate in-memory counter. On Cloudflare
 * Workers this is per-isolate best-effort (not globally shared).
 */
import { json, type RequestHandler } from '@sveltejs/kit';
import { validateVies, type ViesResult } from '$lib/server/vies/client';

/** Maximum validations allowed per IP within the rolling window. */
const RATE_LIMIT_MAX = 10;
/** Rolling window length (ms). */
const RATE_LIMIT_WINDOW_MS = 60_000;

interface RateBucket {
	count: number;
	resetAt: number;
}

// Per-isolate rate-limit state. Keys are client IP addresses.
const buckets = new Map<string, RateBucket>();

/**
 * Returns `true` when the request is within the rate limit, `false` when it
 * should be rejected (429). Buckets reset automatically once the window elapses.
 */
function allowRequest(ip: string): boolean {
	const now = Date.now();
	let bucket = buckets.get(ip);
	if (!bucket || now > bucket.resetAt) {
		bucket = { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
		buckets.set(ip, bucket);
	}
	bucket.count += 1;
	return bucket.count <= RATE_LIMIT_MAX;
}

/** Best-effort client IP extraction (Cloudflare `cf-connecting-ip` preferred). */
function getClientIp(request: Request): string {
	return (
		request.headers.get('cf-connecting-ip') ||
		request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
		'unknown'
	);
}

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	const ip = getClientAddress?.() ?? getClientIp(request);

	if (!allowRequest(ip)) {
		return json({ error: 'Too many requests. Prøv igen om et minut.' }, { status: 429 });
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Ugyldig JSON-body' }, { status: 400 });
	}

	const { countryCode, vatNumber } = body as { countryCode?: unknown; vatNumber?: unknown };
	if (
		typeof countryCode !== 'string' ||
		!/^[A-Za-z]{2}$/.test(countryCode) ||
		typeof vatNumber !== 'string' ||
		vatNumber.trim() === ''
	) {
		return json({ error: 'Landekode (2 bogstaver) og momsnummer skal angives' }, { status: 400 });
	}

	const result: ViesResult | null = await validateVies(countryCode, vatNumber);

	if (!result) {
		// A `null` result means VIES could not be reached (not that the number is
		// invalid). Surface this as a gateway error so the UI can retry/fallback.
		return json({ error: 'VIES kunne ikke kontaktes lige nu' }, { status: 502 });
	}

	return json(result);
};

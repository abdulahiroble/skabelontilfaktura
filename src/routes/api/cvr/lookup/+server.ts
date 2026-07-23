/**
 * POST /api/cvr/lookup
 *
 * Server-side proxy for the Danish CVR register (cvrapi.dk). Keeping the lookup
 * on the server avoids browser CORS restrictions and lets us rate-limit centrally.
 *
 * Request body: `{ "cvr": "12345678" }`
 * Responses:
 *   200 — `{ ...CvrResult }`
 *   400 — malformed request body / invalid CVR format
 *   404 — no company found for that CVR
 *   429 — rate limit exceeded (max 10 requests/minute per IP)
 *
 * Rate limiting uses a simple per-isolate in-memory counter. On Cloudflare
 * Workers this is per-isolate best-effort (not globally shared), which is
 * adequate for protecting the upstream community API from accidental abuse.
 */
import { json, type RequestHandler } from '@sveltejs/kit';
import { lookupCvr, type CvrResult } from '$lib/server/cvr/client';

/** Maximum lookups allowed per IP within the rolling window. */
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

	const cvr = (body as { cvr?: unknown })?.cvr;
	if (typeof cvr !== 'string' || !/^\d{8}$/.test(cvr)) {
		return json({ error: 'CVR skal være 8 cifre' }, { status: 400 });
	}

	const result: CvrResult | null = await lookupCvr(cvr);

	if (!result) {
		// Either not found or the upstream API was unavailable — in both cases the
		// UI should fall back to manual entry.
		return json({ error: 'Ingen virksomhed fundet for dette CVR' }, { status: 404 });
	}

	return json(result);
};

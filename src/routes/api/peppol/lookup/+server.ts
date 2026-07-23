/**
 * POST /api/peppol/lookup
 *
 * Checks whether a buyer is reachable via the Peppol e-invoicing network.
 *
 * Request body: `{ "easCode": "0184", "identifier": "12345678" }`
 * Responses:
 *   200 — `{ reachable: boolean, participant: { easCode, identifier }, accessPoint?: string }`
 *   400 — malformed request body / invalid EAS code or identifier
 *   401 — not authenticated
 *   429 — rate limit exceeded (max 10 requests/minute per IP)
 *
 * The lookup is provider-agnostic: today it always returns `reachable: false`
 * because no Access Point is configured yet. Once a real adapter is wired up in
 * `createPeppolAdapter`, this endpoint will reflect the live Peppol directory
 * without any route-level changes.
 *
 * Rate limiting mirrors the CVR / VIES endpoints: a per-isolate in-memory
 * counter, adequate for protecting the upstream Access Point API.
 */
import { json, error, type RequestHandler } from '@sveltejs/kit';
import { createPeppolAdapter } from '$lib/server/peppol/adapter';

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

/** EAS codes accepted by this endpoint (Peppol EAS registry subset). */
const ACCEPTED_EAS_CODES = new Set(['0184', '9901', '0007', '9908', '9930', '0106']);

export const POST: RequestHandler = async ({ request, locals, getClientAddress }) => {
	// Authentication gate — lookup is reserved for signed-in users so we do not
	// expose the (future) Access Point API to anonymous traffic.
	if (!locals.user) {
		throw error(401, 'Log ind for at slå en Peppol-modtager op');
	}

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

	const { easCode, identifier } = body as { easCode?: unknown; identifier?: unknown };
	if (typeof easCode !== 'string' || !ACCEPTED_EAS_CODES.has(easCode)) {
		return json({ error: 'Ugyldig EAS-kode' }, { status: 400 });
	}
	if (typeof identifier !== 'string' || identifier.trim() === '') {
		return json({ error: 'Identifikator skal angives' }, { status: 400 });
	}

	const adapter = createPeppolAdapter();
	const result = await adapter.lookupParticipant({
		easCode,
		identifier: identifier.trim()
	});

	return json({
		reachable: result.reachable,
		participant: {
			easCode: result.participant.easCode,
			identifier: result.participant.identifier
		},
		accessPoint: result.accessPoint
	});
};

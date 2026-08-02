/**
 * Autumn webhook signature verification + payload helpers.
 *
 * Autumn delivers webhooks via Svix. Every request carries the standard
 * `svix-id`, `svix-timestamp` and `svix-signature` headers, and the signing
 * secret is the `AUTUMN_WEBHOOK_SECRET` env var (dashboard → Developer →
 * Webhooks → endpoint signing secret, a `whsec_...` value).
 *
 * Verification is implemented with the Web Crypto API so it works on
 * Cloudflare Workers without the `svix` npm dependency:
 *  1. Reject timestamps older than 5 minutes (replay protection).
 *  2. Rebuild the signed payload as `<svix-id>.<timestamp>.<raw-body>`.
 *  3. HMAC-SHA256 it with the secret key (base64-decoded).
 *  4. Accept if any `v1,` signature in the header matches, constant-time.
 *
 * @see https://docs.svix.com/receiving/verifying-payloads/how
 */

/** Parsed, verified Autumn webhook envelope (Svix message). */
export interface AutumnWebhookEnvelope {
	/** Top-level discriminator (Svix envelope may put the event type here). */
	type?: string;
	id?: string;
	occurred_at?: number;
	data: {
		/** Autumn event type, e.g. `billing.updated` (Autumn nests this here). */
		object?: string;
		customer_id: string;
		entity_id?: string | null;
		plan_changes?: Array<{
			action: 'activated' | 'scheduled' | 'updated' | 'expired';
			subscription?: {
				plan_id: string;
				status: 'active' | 'scheduled' | 'expired';
				past_due: boolean;
				started_at: number | null;
				canceled_at: number | null;
				expires_at: number | null;
				trial_ends_at: number | null;
				current_period_start: number | null;
				current_period_end: number | null;
			};
			purchase?: {
				plan_id: string;
				status: 'active' | 'scheduled' | 'expired';
				expires_at: number | null;
			};
		}>;
		tags?: string[];
		[key: string]: unknown;
	};
	[key: string]: unknown;
}

/** 5-minute replay-protection window, matching Svix's default tolerance. */
const TIMESTAMP_TOLERANCE_MS = 5 * 60 * 1000;

/** UTF-8 byte helper. */
const encoder = new TextEncoder();

/**
 * Base64-decode a Svix signing secret into raw bytes.
 *
 * Svix secrets are `whsec_<base64>`; the base64 part after the `whsec_`
 * prefix is the actual key material. Failing to strip the prefix produces a
 * different HMAC key and signature verification always fails.
 */
function base64Decode(value: string): Uint8Array {
	const base64 = value.startsWith('whsec_') ? value.slice('whsec_'.length) : value;
	const binary = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
	return bytes;
}

/** Constant-time string comparison to avoid timing side channels. */
function timingSafeEqual(a: string, b: string): boolean {
	if (a.length !== b.length) return false;
	let diff = 0;
	for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
	return diff === 0;
}

/** `true` when the message timestamp is within the tolerance window. */
export function isTimestampFresh(timestamp: string, now = Date.now()): boolean {
	const value = Number(timestamp);
	if (!Number.isFinite(value)) return false;
	return Math.abs(now - value * 1000) <= TIMESTAMP_TOLERANCE_MS;
}

/** Compute the expected `v1` signature for a Svix message. */
export async function computeSignature(
	secret: string,
	id: string,
	timestamp: string,
	rawBody: string
): Promise<string> {
	const key = base64Decode(secret);
	// Copy into a fresh ArrayBuffer so `importKey` gets a proper BufferSource
	// (base64Decode may return a Uint8Array backed by a SharedArrayBuffer pool
	// in some runtimes, which the Web Crypto types reject).
	const keyBuffer = new Uint8Array(key).buffer as ArrayBuffer;
	const data = encoder.encode(`${id}.${timestamp}.${rawBody}`);
	const cryptoKey = await crypto.subtle.importKey(
		'raw',
		keyBuffer,
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign']
	);
	const signature = await crypto.subtle.sign('HMAC', cryptoKey, data);
	const bytes = new Uint8Array(signature);
	// Svix signatures are Base64-encoded (RFC 4648, with padding), NOT hex.
	// `.digest('base64')` is what the Svix SDK/docs use, so the wire format is
	// `v1,<base64>` — e.g. `v1,g0hM9SsE+OTPJTGt/tmIKtSyZlE3uFJELVlNIOLJ1OE=`.
	// Returning hex here made `timingSafeEqual` always fail (44 vs 64 chars).
	let binary = '';
	for (const byte of bytes) binary += String.fromCharCode(byte);
	return btoa(binary);
}

/**
 * Verify the Svix signature on a raw webhook request.
 *
 * @returns the raw body string on success, or `null` when verification fails
 *   (missing secret/headers, stale timestamp, or no matching signature).
 */
export async function verifyWebhook(
	rawBody: string,
	headers: Headers,
	secret: string | undefined
): Promise<string | null> {
	if (!secret) {
		console.error('[autumn webhook] AUTUMN_WEBHOOK_SECRET is not configured');
		return null;
	}

	const id = headers.get('svix-id');
	const timestamp = headers.get('svix-timestamp');
	const signatureHeader = headers.get('svix-signature');
	if (!id || !timestamp || !signatureHeader) {
		console.error('[autumn webhook] Missing Svix headers');
		return null;
	}

	if (!isTimestampFresh(timestamp)) {
		console.error('[autumn webhook] Timestamp outside tolerance window', { timestamp });
		return null;
	}

	const expected = await computeSignature(secret, id, timestamp, rawBody);
	const provided = signatureHeader
		.split(' ')
		.filter((part) => part.startsWith('v1,'))
		.map((part) => part.slice('v1,'.length));

	if (provided.length === 0 || !provided.some((sig) => timingSafeEqual(sig, expected))) {
		console.error('[autumn webhook] Signature mismatch');
		return null;
	}

	return rawBody;
}

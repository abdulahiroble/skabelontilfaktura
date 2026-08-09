import { Autumn } from 'autumn-js';

/**
 * Create a per-request Autumn client.
 *
 * Autumn (useautumn.com) is the billing/entitlements layer that sits between
 * this app and Stripe. It manages subscription state, entitlements, feature
 * gating and usage metering. Stripe processes the underlying payments, but
 * the app never talks to Stripe directly — only to Autumn.
 *
 * The secret key is read from the Cloudflare Workers environment
 * (`AUTUMN_SECRET_KEY`) and must never be cached at module scope, mirroring the
 * same per-request rule used by `getDb()`.
 *
 * @see https://docs.useautumn.com
 */
export function getAutumnSecret(env: Env): string {
	const secretKey = env.AUTUMN_SECRET_KEY?.trim();
	if (!secretKey || /^["']|["']$/.test(secretKey)) {
		throw new Error('AUTUMN_SECRET_KEY is missing or incorrectly formatted');
	}
	if (
		secretKey.startsWith('am_sk_test_') &&
		env.PUBLIC_APP_URL?.startsWith('https://skabelontilfaktura.dk')
	) {
		console.warn('[billing] Sandbox Autumn key is configured on the production application URL');
	}
	return secretKey;
}

export function createAutumnClient(env: Env): Autumn {
	return new Autumn({
		secretKey: getAutumnSecret(env),
		xApiVersion: '2.3.0'
	});
}

export type { Autumn };

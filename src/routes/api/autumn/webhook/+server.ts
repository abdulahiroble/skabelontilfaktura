import { json, type RequestHandler } from '@sveltejs/kit';

/**
 * Autumn webhook endpoint.
 *
 * Webhooks are OPTIONAL with Autumn — the app is intended to query Autumn for
 * billing state (`/check`, `/attach`, `/track`) rather than rely on webhooks to
 * stay in sync. This endpoint exists as a stub so it can be wired up later for
 * proactive updates if desired.
 *
 * When implemented, signature verification should be done with Svix using the
 * `AUTUMN_WEBHOOK_SECRET` env var, e.g.:
 *
 * ```ts
 * import { Webhook } from 'svix';
 * const wh = new Webhook(env.AUTUMN_WEBHOOK_SECRET);
 * const payload = wh.verify(await request.text(), {
 *   'svix-id': request.headers.get('svix-id')!,
 *   'svix-timestamp': request.headers.get('svix-timestamp')!,
 *   'svix-signature': request.headers.get('svix-signature')!
 * });
 * ```
 *
 * Events worth handling once wired up:
 *  - `billing.updated`  — subscription state changed (active/canceled/past_due)
 *  - `balances.usage_alert_triggered` — a usage threshold was crossed
 *
 * @see https://docs.useautumn.com
 */
export const POST: RequestHandler = async ({ request }) => {
	// TODO: verify Svix signature with AUTUMN_WEBHOOK_SECRET, then dispatch on
	// the event type. Returning 200 now so Autumn registers the endpoint as
	// reachable.
	void request;
	return json({ received: true });
};

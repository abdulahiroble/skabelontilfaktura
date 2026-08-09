import { json, error, type RequestHandler } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { getDb } from '$lib/server/db/client';
import { subscription } from '$lib/server/db/schema';
import { verifyWebhook, type AutumnWebhookEnvelope } from '$lib/server/payments/webhook';

/**
 * POST /api/autumn/webhook
 *
 * Receives Autumn billing events (delivered via Svix) and mirrors the
 * subscription state into the local `subscription` table, which drives
 * entitlements (`getEntitlements`).
 *
 * Security: the Svix signature IS the auth. This route must NOT require a
 * session cookie. `verifyWebhook` checks the `AUTUMN_WEBHOOK_SECRET` signing
 * secret plus a 5-minute timestamp window. Verification failures return 401
 * so Autumn/Svix retries are not mistakenly acked.
 *
 * Handled events:
 *   - `billing.updated` — plan activated / scheduled / updated / expired.
 *     For each `plan_changes` entry we upsert the subscription row keyed by
 *     `(user_id, plan_id)`:
 *       - `activated` → plan = plan_id, status = 'active', current_period_end
 *         = current_period_end (if any).
 *       - `expired` → status = 'expired' (so entitlements resolve to free).
 *       - `scheduled` / `updated` → mirror the subscription snapshot's status.
 *   - Unknown event types are acked (200) without side effects.
 *
 * Idempotency: re-delivered events simply re-apply the same upsert, which is
 * idempotent per (user, plan). (A `payments.autumn_event_id` UNIQUE column
 * can be added later if heavier side effects are introduced.)
 *
 * The customer ID used by Autumn is the Better Auth user ID (1:1), so
 * `data.customer_id` maps directly to `subscription.user_id`. Customer rows
 * are looked up via `subscription.autumn_customer_id` when present, falling
 * back to the user ID itself (matching the checkout endpoint, which passes
 * `customerId: user.id`).
 */
export const POST: RequestHandler = async ({ request, platform }) => {
	const env = platform?.env;
	if (!env?.DATABASE_URL) {
		throw error(500, 'Database ikke konfigureret');
	}

	const rawBody = await request.text();
	const verified = await verifyWebhook(rawBody, request.headers, env.AUTUMN_WEBHOOK_SECRET);
	if (!verified) {
		throw error(401, 'Ugyldig webhook-signatur');
	}

	let payload: AutumnWebhookEnvelope;
	try {
		payload = JSON.parse(verified) as AutumnWebhookEnvelope;
	} catch {
		throw error(400, 'Ugyldig JSON');
	}

	// Autumn nests the event type under `data.object` (confirmed by real
	// deliveries and docs.useautumn.com/api-reference/webhooks/billingUpdated).
	// Accept `data.object` and the top-level `type` for forward compatibility.
	const eventType = payload.data?.object ?? payload.type;
	if (eventType !== 'billing.updated' || !payload.data?.plan_changes?.length) {
		// Unknown events are acked so Svix stops retrying.
		return json({ received: true });
	}

	const db = getDb(env.DATABASE_URL);
	// Autumn nests `customer_id` under `data` (confirmed by the captured body:
	// `{"data":{"customer_id":"...","object":"billing.updated",...}}`).
	const customerId = payload.data.customer_id;
	const eventAt = payload.occurred_at
		? new Date(
				payload.occurred_at < 10_000_000_000 ? payload.occurred_at * 1000 : payload.occurred_at
			)
		: new Date();

	for (const change of payload.data.plan_changes) {
		const subscriptionSnapshot = change.subscription;
		const purchaseSnapshot = change.purchase;
		const planId = subscriptionSnapshot?.plan_id ?? purchaseSnapshot?.plan_id;
		if (!planId) continue;

		// `current_period_end` only exists on recurring subscription snapshots;
		// one-off purchases (lifetime_pro / add-ons) have no billing period.
		const currentPeriodEnd = subscriptionSnapshot?.current_period_end
			? new Date(subscriptionSnapshot.current_period_end)
			: null;
		// Resolve the local user row: prefer an existing subscription row that
		// references this Autumn customer, else treat the customer ID as the
		// user ID (1:1 mapping).
		const existing = await db
			.select({ userId: subscription.userId })
			.from(subscription)
			.where(eq(subscription.autumnCustomerId, customerId))
			.limit(1);
		const userId = existing[0]?.userId ?? customerId;
		const current = await db
			.select({ autumnEventAt: subscription.autumnEventAt })
			.from(subscription)
			.where(and(eq(subscription.userId, userId), eq(subscription.plan, planId)))
			.limit(1);
		if (current[0]?.autumnEventAt && current[0].autumnEventAt >= eventAt) continue;

		const status =
			change.action === 'activated'
				? 'active'
				: change.action === 'expired'
					? 'expired'
					: (subscriptionSnapshot?.status ?? purchaseSnapshot?.status ?? 'active');

		await db
			.insert(subscription)
			.values({
				userId,
				autumnCustomerId: customerId,
				plan: planId,
				status,
				currentPeriodEnd,
				autumnEventAt: eventAt
			})
			.onConflictDoUpdate({
				target: [subscription.userId, subscription.plan],
				set: {
					autumnCustomerId: customerId,
					status,
					currentPeriodEnd,
					autumnEventAt: eventAt,
					updatedAt: new Date()
				}
			});
	}

	return json({ received: true });
};

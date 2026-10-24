import { json, error, type RequestHandler } from '@sveltejs/kit';
import { and, eq, sql } from 'drizzle-orm';
import { KIT } from '$lib/billing/kit';
import { getDb } from '$lib/server/db/client';
import { billingEvent, subscription, user } from '$lib/server/db/schema';
import { getAutumnSecret } from '$lib/server/payments/autumn';
import { verifyWebhook, type AutumnWebhookEnvelope } from '$lib/server/payments/webhook';
import { billingEnvironment, kitEventIdentity } from '$lib/server/payments/kit-policy';
import { fetchKitProofs, persistKitProofs } from '$lib/server/payments/kit-entitlements';

const LEGACY_PLANS = new Set(['pro', 'pro_annual', 'business', 'lifetime_pro']);

export const POST: RequestHandler = async ({ request, platform }) => {
	const env = platform?.env;
	if (!env?.DATABASE_URL) throw error(503, 'Database unavailable');
	if (Number(request.headers.get('content-length') ?? 0) > 256_000) throw error(413);
	const raw = await request.text();
	if (raw.length > 256_000) throw error(413);
	let verified;
	try {
		verified = await verifyWebhook(raw, request.headers, env.AUTUMN_WEBHOOK_SECRET);
	} catch {
		throw error(401, 'Invalid signature configuration');
	}
	if (!verified) throw error(401, 'Invalid signature');
	let payload: AutumnWebhookEnvelope;
	let identity;
	try {
		payload = JSON.parse(verified);
		identity = kitEventIdentity(payload);
	} catch {
		throw error(400, 'Invalid event identity');
	}
	if (!identity) return json({ received: true });
	const messageId = request.headers.get('svix-id')!;
	const environment = billingEnvironment(getAutumnSecret(env));
	const db = getDb(env.DATABASE_URL);
	const seen = await db
		.select({ messageId: billingEvent.messageId })
		.from(billingEvent)
		.where(and(eq(billingEvent.environment, environment), eq(billingEvent.messageId, messageId)))
		.limit(1);
	if (seen.length) return json({ received: true });
	// Customer identity is the authenticated app user ID established at checkout.
	// Never create accounts, match by email, or grant from an event's balance.
	const owner = await db
		.select({ id: user.id })
		.from(user)
		.where(eq(user.id, identity.customerId))
		.limit(1);
	if (!owner.length) return json({ received: true });
	try {
		const result = await fetchKitProofs(env, identity.customerId);
		const changes = Array.isArray(payload.data.plan_changes) ? payload.data.plan_changes : [];
		const expectsKitPayment = changes.some(
			(change) =>
				change.action === 'activated' &&
				(change.purchase?.plan_id ?? change.subscription?.plan_id) === KIT.id
		);
		if (expectsKitPayment && !result.proofs.length) {
			// Activation and invoice ingestion may race. Let Svix retry naturally.
			return json(
				{ error: 'Payment verification pending' },
				{ status: 503, headers: { 'Retry-After': '15' } }
			);
		}
		await db.transaction(async (tx) => {
			const claimed = await tx
				.insert(billingEvent)
				.values({
					environment,
					messageId,
					eventType: identity.type
				})
				.onConflictDoNothing()
				.returning({ messageId: billingEvent.messageId });
			if (!claimed.length) return;
			await persistKitProofs(tx, identity.customerId, result);
			// Preserve legacy rights, but the kit never enters the subscription table.
			if (identity.type !== 'billing.updated') return;
			const eventValue =
				payload.occurred_at ?? Number(request.headers.get('svix-timestamp')) * 1000;
			const eventAt = new Date(eventValue < 10_000_000_000 ? eventValue * 1000 : eventValue);
			if (!Number.isFinite(eventAt.getTime())) throw new Error('Invalid event timestamp');
			for (const change of changes) {
				const snapshot = change.subscription ?? change.purchase;
				if (!snapshot || !LEGACY_PLANS.has(snapshot.plan_id)) continue;
				const period = change.subscription?.current_period_end;
				const currentPeriodEnd = period
					? new Date(period < 10_000_000_000 ? period * 1000 : period)
					: null;
				const status =
					change.action === 'expired'
						? 'expired'
						: change.action === 'activated'
							? 'active'
							: snapshot.status;
				await tx
					.insert(subscription)
					.values({
						userId: identity.customerId,
						autumnCustomerId: identity.customerId,
						plan: snapshot.plan_id,
						status,
						currentPeriodEnd,
						autumnEventAt: eventAt
					})
					.onConflictDoUpdate({
						target: [subscription.userId, subscription.plan],
						set: { status, currentPeriodEnd, autumnEventAt: eventAt, updatedAt: new Date() },
						setWhere: sql`${subscription.autumnEventAt} is null or ${subscription.autumnEventAt} < ${eventAt}`
					});
			}
		});
		return json({ received: true });
	} catch {
		console.error('[kit webhook] Canonical reconciliation failed');
		return json(
			{ error: 'Verification unavailable' },
			{ status: 503, headers: { 'Retry-After': '15' } }
		);
	}
};

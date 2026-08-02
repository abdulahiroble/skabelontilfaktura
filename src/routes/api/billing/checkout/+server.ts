import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createCheckoutSession } from '$lib/server/payments/checkout';

/**
 * POST /api/billing/checkout
 *
 * Create a Stripe-hosted checkout session for the authenticated user.
 *
 * This is the single purchase entry point used by the pricing page and any
 * in-app upgrade CTA. It:
 *  1. Requires a session (401 when anonymous).
 *  2. Delegates to `createCheckoutSession`, which ensures the Autumn customer
 *     exists (idempotent) and attaches the plan, returning a `paymentUrl`
 *     (Stripe Checkout in sandbox; one-click confirmation for subsequent
 *     charges).
 *  3. Returns `{ paymentUrl }` — the client redirects the user there.
 *
 * Features are unlocked asynchronously: once payment succeeds, Autumn sends a
 * `billing.updated` webhook (`/api/autumn/webhook`) which upserts the local
 * `subscription` row that drives entitlements.
 *
 * Request body: `{ planId: string }` — one of the plan ids in
 * `autumn.config.ts` (`pro`, `pro_annual`, `business`, `lifetime_pro`,
 * `template_pack`, `branch_bundle`).
 *
 * Note: the user's DB row is not required here — Autumn's customer ID is the
 * Better Auth user ID (1:1), so checkout works even before a business row
 * exists.
 */
export const POST: RequestHandler = async ({ request, platform, locals }) => {
	const user = locals.user;
	if (!user) {
		throw error(401, 'Log ind for at opgradere');
	}

	const env = platform?.env;
	if (!env?.AUTUMN_SECRET_KEY) {
		throw error(500, 'Autumn er ikke konfigureret');
	}

	let body: { planId?: unknown };
	try {
		body = (await request.json()) as { planId?: unknown };
	} catch {
		throw error(400, 'Ugyldig anmodning');
	}

	const planId = body.planId;
	if (typeof planId !== 'string' || planId.length === 0) {
		throw error(400, 'planId er påkrævet');
	}

	const result = await createCheckoutSession(env, user, planId);
	if ('error' in result) {
		throw error(502, result.error);
	}

	return json({ paymentUrl: result.paymentUrl });
};

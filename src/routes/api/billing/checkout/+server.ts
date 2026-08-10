import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createCheckoutSession, isCheckoutPlanId } from '$lib/server/payments/checkout';

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
 * `autumn.config.ts` (`pro`, `pro_annual`). Other catalog
 * products are intentionally not exposed until their workflows exist.
 *
 * Note: the user's DB row is not required here — Autumn's customer ID is the
 * Better Auth user ID (1:1), so checkout works even before a business row
 * exists.
 */
export const POST: RequestHandler = async ({ request, platform, locals }) => {
	const user = locals.user;
	if (!user) {
		return json({ error: 'Log ind for at opgradere.', code: 'AUTH_REQUIRED' }, { status: 401 });
	}

	const env = platform?.env;
	if (!env?.AUTUMN_SECRET_KEY) {
		return json(
			{ error: 'Betaling er ikke konfigureret.', code: 'BILLING_NOT_CONFIGURED' },
			{ status: 503 }
		);
	}

	let body: { planId?: unknown };
	try {
		body = (await request.json()) as { planId?: unknown };
	} catch {
		return json({ error: 'Ugyldig anmodning.', code: 'INVALID_REQUEST' }, { status: 400 });
	}

	const planId = body.planId;
	if (typeof planId !== 'string' || !isCheckoutPlanId(planId)) {
		return json({ error: 'Ugyldig betalingsplan.', code: 'INVALID_PLAN' }, { status: 400 });
	}

	const result = await createCheckoutSession(env, user, planId);
	if ('error' in result) {
		return json(
			{
				error: result.error,
				code: result.code
			},
			{ status: result.status }
		);
	}

	return json({ paymentUrl: result.paymentUrl });
};

/**
 * Shared server-side billing helpers.
 *
 * Exposes the authenticated checkout flow to route handlers. The client calls
 * `POST /api/billing/checkout`; this module does the actual Autumn work so the
 * same logic is reusable (e.g. from an upgrade CTA or a billing page action).
 */
import { createAutumnClient, type Autumn } from './autumn';

/** Plans offered on the pricing page, mirroring `autumn.config.ts` ids. */
export const CHECKOUT_PLANS = ['pro', 'pro_annual', 'business', 'lifetime_pro'] as const;
export type CheckoutPlanId = (typeof CHECKOUT_PLANS)[number];

export function isCheckoutPlanId(value: string): value is CheckoutPlanId {
	return CHECKOUT_PLANS.includes(value as CheckoutPlanId);
}

function isAutumnLocked(error: unknown): boolean {
	if (!error || typeof error !== 'object') return false;
	const candidate = error as {
		statusCode?: number;
		status?: number;
		response?: { status?: number };
	};
	return (
		candidate.statusCode === 429 || candidate.status === 429 || candidate.response?.status === 429
	);
}

/**
 * Create a Stripe checkout session for the given plan.
 *
 * Ensures the Autumn customer exists (idempotent), then attaches the plan with
 * `redirectMode: 'always'` so a payment URL is always returned.
 *
 * @returns the payment URL to redirect the browser to, or `null` if Autumn
 *   reported no payment action required.
 */
export async function createCheckoutSession(
	env: Env,
	user: { id: string; name?: string; email: string },
	planId: CheckoutPlanId
): Promise<{ paymentUrl: string } | { error: string; status?: number }> {
	const autumn: Autumn = createAutumnClient(env);

	try {
		await autumn.customers.getOrCreate({
			customerId: user.id,
			name: user.name ?? user.email,
			email: user.email
		});
	} catch (err) {
		console.error('[billing] Kunne ikke oprette Autumn-kunde:', err);
		return { error: 'Betalingsudbyder utilgængelig' };
	}

	try {
		const response = await autumn.billing.attach({
			customerId: user.id,
			planId,
			redirectMode: 'always',
			successUrl: `${env.PUBLIC_APP_URL ?? ''}/indstillinger/?checkout=success`
		});
		if (!response.paymentUrl) {
			return { error: 'Ingen betalings-URL returneret' };
		}
		return { paymentUrl: response.paymentUrl };
	} catch (err) {
		console.error('[billing] Attach fejlede:', err);
		if (isAutumnLocked(err)) {
			return {
				error: 'En betaling behandles allerede. Vent et øjeblik og prøv igen.',
				status: 429
			};
		}
		return { error: 'Kunne ikke oprette betalingssession' };
	}
}

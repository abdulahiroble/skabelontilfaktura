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
	planId: string
): Promise<{ paymentUrl: string } | { error: string }> {
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
			// Landing page after a successful (sandbox/live) payment. `/eksport/`
			// is the flagship Pro feature this checkout unlocks.
			successUrl: `${env.PUBLIC_APP_URL ?? ''}/eksport/?checkout=success`
		});
		if (!response.paymentUrl) {
			return { error: 'Ingen betalings-URL returneret' };
		}
		return { paymentUrl: response.paymentUrl };
	} catch (err) {
		console.error('[billing] Attach fejlede:', err);
		return { error: 'Kunne ikke oprette betalingssession' };
	}
}

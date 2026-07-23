import type { Autumn } from './autumn';
import type { AttachResponse, CheckResponse, TrackResponse } from 'autumn-js';

/**
 * Result of an entitlement check or attach/track call.
 *
 * Autumn's SDK resolves the response data directly (it does not return a
 * `{ data, error }` envelope). Errors surface as thrown exceptions, so these
 * helpers wrap each call in try/catch and normalize the outcome into a
 * discriminated result so callers can handle both branches uniformly.
 */
export type AutumnResult<T> = { data: T; error: null } | { data: null; error: unknown };

/**
 * Check whether a customer is allowed to use a feature.
 *
 * @example
 * ```typescript
 * const { data, error } = await checkEntitlement(autumn, customerId, 'cloud_storage');
 * if (error) { /* network / API error *\/ }
 * const allowed = data?.allowed ?? false;
 * ```
 *
 * @see https://docs.useautumn.com (the `/check` function)
 */
export async function checkEntitlement(
	autumn: Autumn,
	customerId: string,
	featureId: string
): Promise<AutumnResult<CheckResponse>> {
	try {
		const data = await autumn.check({ customerId, featureId });
		return { data, error: null };
	} catch (error) {
		return { data: null, error };
	}
}

/**
 * Attach (subscribe/checkout) a plan to a customer.
 *
 * This is the single entry point for all purchase flows: new subscriptions,
 * upgrades and downgrades. For paid plans Autumn typically returns a Stripe
 * Checkout URL the customer must be redirected to; the caller is responsible
 * for performing the redirect.
 *
 * @see https://docs.useautumn.com (the `/attach` function)
 */
export async function attachPlan(
	autumn: Autumn,
	customerId: string,
	planId: string
): Promise<AutumnResult<AttachResponse>> {
	try {
		const data = await autumn.billing.attach({ customerId, planId });
		return { data, error: null };
	} catch (error) {
		return { data: null, error };
	}
}

/**
 * Record a metered usage event for a customer feature.
 *
 * Call this after a metered action happens (e.g. sending a reminder email) to
 * decrement the customer's balance. Use a negative `value` to credit balance
 * back. Only relevant for `metered` features — boolean features need no
 * tracking.
 *
 * @see https://docs.useautumn.com (the `/track` function)
 */
export async function trackUsage(
	autumn: Autumn,
	customerId: string,
	featureId: string,
	value = 1
): Promise<AutumnResult<TrackResponse>> {
	try {
		const data = await autumn.track({ customerId, featureId, value });
		return { data, error: null };
	} catch (error) {
		return { data: null, error };
	}
}

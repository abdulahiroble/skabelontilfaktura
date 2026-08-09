/**
 * Shared server-side billing helpers.
 *
 * Exposes the authenticated checkout flow to route handlers. The client calls
 * `POST /api/billing/checkout`; this module does the actual Autumn work so the
 * same logic is reusable (e.g. from an upgrade CTA or a billing page action).
 */
import { createAutumnClient, getAutumnSecret, type Autumn } from './autumn';

const AUTUMN_API_BASE = 'https://api.useautumn.com/v1';
const CHECKOUT_TIMEOUT_MS = 15_000;

/** Plans currently sold by the product, mirroring `autumn.config.ts` ids. */
export const CHECKOUT_PLANS = ['pro', 'pro_annual', 'lifetime_pro'] as const;
export type CheckoutPlanId = (typeof CHECKOUT_PLANS)[number];

export function isCheckoutPlanId(value: string): value is CheckoutPlanId {
	return CHECKOUT_PLANS.includes(value as CheckoutPlanId);
}

export type CheckoutErrorCode =
	| 'BILLING_LOCKED'
	| 'BILLING_NOT_CONFIGURED'
	| 'BILLING_PERMISSION'
	| 'BILLING_UNAVAILABLE'
	| 'CHECKOUT_FAILED';

interface CheckoutFailure {
	error: string;
	code: CheckoutErrorCode;
	status: number;
}

function errorText(error: unknown): string {
	if (error instanceof Error) return error.message;
	try {
		return JSON.stringify(error);
	} catch {
		return String(error);
	}
}

function autumnStatus(error: unknown): number | undefined {
	if (!error || typeof error !== 'object') return undefined;
	const candidate = error as {
		statusCode?: number;
		status?: number;
		response?: { status?: number };
	};
	return candidate.statusCode ?? candidate.status ?? candidate.response?.status;
}

function checkoutFailure(error: unknown, stage: 'customer' | 'checkout'): CheckoutFailure {
	const status = autumnStatus(error);
	const message = errorText(error);
	console.error('[billing] Checkout failed', {
		stage,
		status: status ?? null,
		code: /insufficient_scopes/i.test(message) ? 'insufficient_scopes' : null,
		message: message.slice(0, 500)
	});

	if (status === 429 || /\b429\b/.test(message)) {
		return {
			error: 'En betaling behandles allerede. Vent et øjeblik og prøv igen.',
			code: 'BILLING_LOCKED',
			status: 429
		};
	}
	if (status === 401 || status === 403 || /insufficient_scopes|billing:write/i.test(message)) {
		return {
			error: 'Betaling er midlertidigt utilgængelig. Vi er blevet informeret om fejlen.',
			code: 'BILLING_PERMISSION',
			status: 503
		};
	}
	if (/timeout|abort/i.test(message)) {
		return {
			error: 'Betalingsudbyderen svarer ikke. Prøv igen om et øjeblik.',
			code: 'BILLING_UNAVAILABLE',
			status: 504
		};
	}
	return {
		error:
			stage === 'customer'
				? 'Betalingsudbyderen kunne ikke klargøre din konto. Prøv igen.'
				: 'Kunne ikke oprette betalingssessionen. Prøv igen.',
		code: stage === 'customer' ? 'BILLING_UNAVAILABLE' : 'CHECKOUT_FAILED',
		status: 502
	};
}

function getAppUrl(env: Env): string {
	try {
		if (!env.PUBLIC_APP_URL) throw new Error('Missing URL');
		const url = new URL(env.PUBLIC_APP_URL);
		if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Invalid protocol');
		return url.origin;
	} catch {
		throw new Error('PUBLIC_APP_URL must be an absolute HTTP(S) URL');
	}
}

async function createOneOffCheckout(
	env: Env,
	customerId: string,
	planId: 'lifetime_pro'
): Promise<string> {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), CHECKOUT_TIMEOUT_MS);
	try {
		const response = await fetch(`${AUTUMN_API_BASE}/checkout`, {
			method: 'POST',
			signal: controller.signal,
			headers: {
				Authorization: `Bearer ${getAutumnSecret(env)}`,
				'Content-Type': 'application/json',
				'x-api-version': '2.3.0'
			},
			body: JSON.stringify({
				customer_id: customerId,
				product_id: planId,
				success_url: new URL('/konto/?checkout=success', getAppUrl(env)).toString()
			})
		});
		const payload = (await response.json().catch(() => null)) as {
			url?: string;
			message?: string;
			code?: string;
		} | null;
		if (!response.ok) {
			const error = new Error(payload?.message ?? `Autumn checkout failed (${response.status})`);
			Object.assign(error, { statusCode: response.status, code: payload?.code });
			throw error;
		}
		if (!payload?.url) throw new Error('Autumn returned no one-off checkout URL');
		return payload.url;
	} finally {
		clearTimeout(timeout);
	}
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
): Promise<{ paymentUrl: string } | CheckoutFailure> {
	let autumn: Autumn;
	try {
		getAutumnSecret(env);
		autumn = createAutumnClient(env);
	} catch (error) {
		console.error('[billing] Invalid Autumn configuration', error);
		return {
			error: 'Betaling er ikke konfigureret korrekt.',
			code: 'BILLING_NOT_CONFIGURED',
			status: 503
		};
	}

	try {
		await autumn.customers.getOrCreate(
			{
				customerId: user.id,
				name: user.name ?? user.email,
				email: user.email
			},
			{ timeoutMs: CHECKOUT_TIMEOUT_MS }
		);
	} catch (err) {
		return checkoutFailure(err, 'customer');
	}

	try {
		if (planId === 'lifetime_pro') {
			return { paymentUrl: await createOneOffCheckout(env, user.id, planId) };
		}

		const response = await autumn.billing.attach(
			{
				customerId: user.id,
				planId,
				redirectMode: 'always',
				successUrl: new URL('/konto/?checkout=success', getAppUrl(env)).toString()
			},
			{ timeoutMs: CHECKOUT_TIMEOUT_MS }
		);
		if (!response.paymentUrl) throw new Error('Autumn returned no payment URL');
		return { paymentUrl: response.paymentUrl };
	} catch (err) {
		return checkoutFailure(err, 'checkout');
	}
}

import { and, eq, lt } from 'drizzle-orm';
import { KIT } from '$lib/billing/kit';
import { getDb } from '$lib/server/db/client';
import { kitCheckout } from '$lib/server/db/schema';
import { createAutumnClient, getAutumnSecret } from './autumn';
import {
	billingEnvironment,
	kitCheckoutParams,
	verifyMappedKitPrice,
	checkoutProviderFailure,
	CHECKOUT_SESSION_TTL_SECONDS,
	CHECKOUT_LEASE_TTL_MS
} from './kit-policy';
import { reconcileKit } from './kit-entitlements';

/** Legacy product IDs stay in the catalog, but are no longer sold. */
export const CHECKOUT_PLANS = [KIT.id] as const;
export type CheckoutPlanId = (typeof CHECKOUT_PLANS)[number];
export function isCheckoutPlanId(value: string): value is CheckoutPlanId {
	return value === KIT.id;
}

interface CheckoutFailure {
	error: string;
	code: string;
	status: number;
}

export async function createCheckoutSession(
	env: Env,
	user: { id: string; name?: string; email: string },
	planId: CheckoutPlanId,
	{ operatorPreflight = false }: { operatorPreflight?: boolean } = {}
): Promise<{ paymentUrl: string } | CheckoutFailure> {
	if (planId !== KIT.id) return { error: 'Ugyldigt produkt.', code: 'INVALID_PLAN', status: 400 };
	if (
		(env.KIT_CHECKOUT_ENABLED !== 'true' && !operatorPreflight) ||
		!env.DATABASE_URL ||
		!env.KIT_VAT_RATE_ID
	) {
		return {
			error: 'Betaling åbner snart. Der er ikke trukket penge.',
			code: 'BILLING_NOT_CONFIGURED',
			status: 503
		};
	}
	let stage = 'configuration';
	try {
		const secret = getAutumnSecret(env);
		const environment = billingEnvironment(secret);
		const autumn = createAutumnClient(env);
		const origin = new URL(env.PUBLIC_APP_URL ?? '').origin;
		if (
			operatorPreflight &&
			(environment !== 'live' ||
				origin !== 'https://skabelontilfaktura.dk' ||
				env.KIT_PREFLIGHT_ENABLED !== 'true')
		) {
			throw new Error('Operator preflight environment mismatch');
		}
		if (operatorPreflight) {
			// Verify the DEPLOYED credential's actual account/defaults before any
			// customer mutation. A live prefix alone does not prove account identity.
			const read = async <T>(path: string, body?: object): Promise<T> => {
				const response = await fetch(`https://api.useautumn.com/v1/${path}`, {
					method: body ? 'POST' : 'GET',
					redirect: 'manual',
					headers: {
						Authorization: `Bearer ${secret}`,
						'Content-Type': 'application/json',
						'x-api-version': '2.3.0'
					},
					...(body ? { body: JSON.stringify(body) } : {}),
					signal: AbortSignal.timeout(10_000)
				});
				if (!response.ok) throw new Error('Operator account read unavailable');
				return (await response.json()) as T;
			};
			const [account, defaults] = await Promise.all([
				read<{ id?: string }>('organization/stripe'),
				read<{
					list?: { auto_enable?: boolean; archived?: boolean }[];
					next_cursor?: string | null;
				}>('plans.list', {})
			]);
			if (
				account.id !== 'acct_1U2t6I73kDsvqEWH' ||
				!Array.isArray(defaults.list) ||
				defaults.list.length >= 100 ||
				defaults.next_cursor ||
				defaults.list.some(
					(p: { auto_enable?: boolean; archived?: boolean }) =>
						typeof p.auto_enable !== 'boolean' || (p.auto_enable && !p.archived)
				)
			) {
				throw new Error('Operator account or automatic plans mismatch');
			}
		}
		if (!origin.startsWith('https://') && !origin.startsWith('http://localhost:')) {
			throw new Error('Invalid application origin');
		}
		const db = getDb(env.DATABASE_URL);
		stage = 'recovery';
		// Never charge again to recover an existing purchase.
		const ownership = await reconcileKit(db, env, user.id);
		if (ownership.owned) return { paymentUrl: new URL(KIT.accountUrl, origin).toString() };
		if (ownership.status === 'review') {
			return {
				error: 'Dit køb kræver hjælp. Kontakt os før et nyt køb.',
				code: 'PURCHASE_REVIEW',
				status: 409
			};
		}
		stage = 'catalog';
		// SDK 1.2.44 drops processor mappings from plans.get. Read only these two
		// pinned REST contracts; customer/invoice operations retain the safe SDK.
		const headers = {
			Authorization: `Bearer ${secret}`,
			'Content-Type': 'application/json',
			'x-api-version': '2.3.0'
		};
		const [planResponse, orgResponse] = await Promise.all([
			fetch('https://api.useautumn.com/v1/plans.get', {
				method: 'POST',
				headers,
				redirect: 'manual',
				signal: AbortSignal.timeout(10_000),
				body: JSON.stringify({ plan_id: KIT.id })
			}),
			fetch('https://api.useautumn.com/v1/organization', {
				headers,
				redirect: 'manual',
				signal: AbortSignal.timeout(10_000)
			})
		]);
		if (!planResponse.ok || !orgResponse.ok) throw new Error('Catalog verification unavailable');
		const plan = (await planResponse.json()) as {
			id: string;
			env: string;
			archived: boolean;
			price?: { amount: number; interval: string; processors?: { stripe?: { price_id?: string } } };
		};
		const org = (await orgResponse.json()) as {
			default_currency?: string;
			config?: { automatic_tax?: boolean };
		};
		if (
			plan.id !== KIT.id ||
			plan.env !== environment ||
			plan.archived ||
			plan.price?.amount !== KIT.price ||
			plan.price.interval !== 'one_off' ||
			org.default_currency?.toUpperCase() !== KIT.currency ||
			org.config?.automatic_tax !== false
		) {
			throw new Error('Kit catalog economics mismatch');
		}
		// The exact mapped price and inclusive rate require an unpaid-session
		// gross/net/tax check before KIT_CHECKOUT_ENABLED is approved.
		const checkoutParams = kitCheckoutParams(
			env.KIT_VAT_RATE_ID,
			plan.price.processors?.stripe?.price_id ?? ''
		);
		const priceId = checkoutParams.line_items[0].price;
		const stripePriceResponse = await fetch(
			`https://api.useautumn.com/v1/organization/stripe/prices/search?search=${encodeURIComponent(priceId)}&limit=5`,
			{ headers, redirect: 'manual', signal: AbortSignal.timeout(10_000) }
		);
		if (!stripePriceResponse.ok) throw new Error('Actual Stripe price verification unavailable');
		const stripePrices = (await stripePriceResponse.json()) as {
			stripe_connected: boolean;
			stripe_prices: Parameters<typeof verifyMappedKitPrice>[0][];
		};
		const mapped = stripePrices.stripe_prices.find((price) => price.id === priceId);
		if (!stripePrices.stripe_connected || !mapped) throw new Error('Stripe mapping unavailable');
		verifyMappedKitPrice(mapped, priceId);
		const attemptId = crypto.randomUUID();
		const where = and(
			eq(kitCheckout.userId, user.id),
			eq(kitCheckout.environment, environment),
			eq(kitCheckout.sku, KIT.id)
		);
		const expiresAt = new Date(Date.now() + CHECKOUT_LEASE_TTL_MS);
		const insertion = db.insert(kitCheckout).values({
			userId: user.id,
			environment,
			sku: KIT.id,
			attemptId,
			expiresAt
		});
		// An operator fixture's lease is NEVER renewed, even after expiry.
		// Ambiguous failures consume the sole attempt rather than minting another session.
		const lease = await (
			operatorPreflight
				? insertion.onConflictDoNothing({
						target: [kitCheckout.userId, kitCheckout.environment, kitCheckout.sku]
					})
				: insertion.onConflictDoUpdate({
						target: [kitCheckout.userId, kitCheckout.environment, kitCheckout.sku],
						set: { attemptId, paymentUrl: null, expiresAt },
						setWhere: lt(kitCheckout.expiresAt, new Date())
					})
		).returning({ attemptId: kitCheckout.attemptId });
		if (!lease.length) {
			const existing = await db.select().from(kitCheckout).where(where).limit(1);
			if (existing[0]?.paymentUrl) return { paymentUrl: existing[0].paymentUrl };
			return {
				error: 'En ordre behandles allerede. Vent lidt og se Min konto.',
				code: 'BILLING_LOCKED',
				status: 429
			};
		}
		stage = 'customer';
		const customer = await autumn.customers.getOrCreate(
			{
				customerId: user.id,
				name: user.name ?? user.email,
				email: user.email,
				...(operatorPreflight ? { sendEmailReceipts: false } : {})
			},
			{ timeoutMs: 15_000 }
		);
		if (
			customer.id !== user.id ||
			customer.env !== environment ||
			customer.email?.toLowerCase() !== user.email.toLowerCase()
		) {
			throw new Error('Provider customer identity mismatch');
		}
		stage = 'checkout';
		// API 2.3.0 legacy fixed one-off contract. SDK billing.attach is NOT used.
		// No quantity options: this is one fixed digital good, not a prepaid pack.
		const response = await fetch('https://api.useautumn.com/v1/checkout', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${secret}`,
				'Content-Type': 'application/json',
				'x-api-version': '2.3.0'
			},
			signal: AbortSignal.timeout(15_000),
			redirect: 'manual',
			body: JSON.stringify({
				customer_id: user.id,
				product_id: KIT.id,
				success_url: new URL('/konto/?checkout=success', origin).toString(),
				checkout_session_params: {
					...checkoutParams,
					...(operatorPreflight ? { after_expiration: { recovery: { enabled: false } } } : {}),
					expires_at: Math.floor(Date.now() / 1000) + CHECKOUT_SESSION_TTL_SECONDS,
					cancel_url: new URL('/pris/?checkout=cancelled', origin).toString(),
					metadata: { kit_sku: KIT.id, kit_attempt_id: attemptId }
				}
			})
		});
		if (!response.ok) {
			const payload: unknown = await response.json().catch(() => null);
			throw Object.assign(new Error('Provider checkout rejected'), {
				statusCode: response.status,
				...checkoutProviderFailure(payload)
			});
		}
		const body = (await response.json()) as { url?: string };
		const url = new URL(body.url ?? '');
		const expectedSession = environment === 'live' ? 'cs_live_' : 'cs_test_';
		if (
			url.protocol !== 'https:' ||
			url.hostname !== 'checkout.stripe.com' ||
			!url.pathname.includes(expectedSession)
		) {
			throw new Error('Unexpected checkout environment or origin');
		}
		await db
			.update(kitCheckout)
			.set({ paymentUrl: url.toString() })
			.where(and(where, eq(kitCheckout.attemptId, attemptId)));
		return { paymentUrl: url.toString() };
	} catch (error) {
		const status =
			error && typeof error === 'object'
				? (error as { statusCode?: number }).statusCode
				: undefined;
		// No provider payloads, checkout URLs, emails or tokens in operational logs.
		const diagnostic =
			error && typeof error === 'object'
				? (error as { providerCode?: string; failureReason?: string })
				: {};
		console.error('[kit checkout] Failed', {
			stage,
			status: status ?? null,
			providerCode: diagnostic.providerCode ?? null,
			failureReason: diagnostic.failureReason ?? null
		});
		if (status === 429 || /\b429\b/.test(error instanceof Error ? error.message : '')) {
			return {
				error: 'En ordre behandles allerede. Vent lidt og se Min konto.',
				code: 'BILLING_LOCKED',
				status: 429
			};
		}
		// Keep the lease on ambiguous failures: don't issue a second payable session.
		return {
			error:
				'Betalingen kunne ikke åbnes. Se Min konto før du prøver igen. Der er ikke bekræftet et køb.',
			code: 'BILLING_UNAVAILABLE',
			status: 503
		};
	}
}

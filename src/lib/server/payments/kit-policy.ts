import { KIT } from '../../billing/kit';

export type BillingEnvironment = 'live' | 'sandbox';

// Stripe checks its own clock on session creation. Exactly +30m can already
// be too short after the app -> Autumn -> Stripe network hops.
export const CHECKOUT_SESSION_TTL_SECONDS = 35 * 60;
export const CHECKOUT_LEASE_TTL_MS = 36 * 60_000;

/** Only fixed diagnostic categories leave this function, never provider text/PII. */
export function checkoutProviderFailure(payload: unknown) {
	const data =
		payload && typeof payload === 'object'
			? (payload as {
					code?: unknown;
					message?: unknown;
					error?: { code?: unknown; message?: unknown };
				})
			: {};
	const rawCode = data.code ?? data.error?.code;
	const allowed = new Set([
		'stripe_error',
		'invalid_inputs',
		'invalid_request_error',
		'customer_not_found',
		'product_not_found',
		'insufficient_scopes',
		'unauthorized',
		'no_auth_header'
	]);
	const providerCode =
		typeof rawCode === 'string' && allowed.has(rawCode.toLowerCase())
			? rawCode.toLowerCase()
			: 'unclassified';
	const message = String(data.message ?? data.error?.message ?? '').slice(0, 4000);
	const failureReason = /expires_at/i.test(message)
		? 'CHECKOUT_EXPIRY_INVALID'
		: /capabilit|charges.*enabled|activate.*account|account.*activat|account.*cannot.*charg/i.test(
					message
			  )
			? 'STRIPE_ACCOUNT_NOT_READY'
			: /tax.rate|tax_rate/i.test(message)
				? 'VAT_RATE_REJECTED'
				: /line_items/i.test(message)
					? 'CHECKOUT_LINE_ITEMS_REJECTED'
					: providerCode === 'insufficient_scopes'
						? 'BILLING_PERMISSION'
						: 'PROVIDER_REJECTED';
	return { providerCode, failureReason };
}

export function billingEnvironment(key: string): BillingEnvironment {
	if (key.startsWith('am_sk_live_')) return 'live';
	if (key.startsWith('am_sk_test_')) return 'sandbox';
	throw new Error('Invalid Autumn key environment');
}

/** Verified GET organization/stripe/prices/search contract, not a display label. */
export function verifyMappedKitPrice(
	price: {
		id: string;
		unit_amount: number | null;
		currency: string;
		active: boolean;
		interval: string | null;
	},
	expectedId: string
) {
	if (
		price.id !== expectedId ||
		price.unit_amount !== KIT.priceMinor ||
		price.currency.toUpperCase() !== KIT.currency ||
		price.active !== true ||
		price.interval !== null
	)
		throw new Error('Actual Stripe kit price economics mismatch');
}

/** Canonical Autumn invoices.list (SDK 1.2.44, API 2.3.0), major currency units. */
export interface CanonicalKitInvoice {
	id: string;
	stripeId: string;
	customerId: string | null;
	entityId: string | null;
	planIds: string[];
	processorType: string;
	status: string;
	total: number;
	amountPaid: number | null;
	refundedAmount: number;
	currency: string;
	createdAt: number;
}

function minor(value: number): number {
	const scaled = Math.round(value * 100);
	if (!Number.isFinite(value) || Math.abs(value * 100 - scaled) > 0.00001) {
		throw new Error('Invalid canonical invoice amount');
	}
	return scaled;
}

export function verifyKitInvoice(invoice: CanonicalKitInvoice, customerId: string) {
	if (!invoice.planIds.includes(KIT.id)) return null;
	if (
		invoice.customerId !== customerId ||
		invoice.entityId !== null ||
		invoice.planIds.length !== 1 ||
		invoice.processorType !== 'stripe' ||
		!invoice.id ||
		!/^in_[a-zA-Z0-9]+$/.test(invoice.stripeId) ||
		invoice.currency.toUpperCase() !== KIT.currency ||
		minor(invoice.total) !== KIT.priceMinor ||
		!Number.isFinite(invoice.createdAt) ||
		invoice.createdAt < 1_000_000_000_000
	)
		throw new Error('Canonical kit invoice identity/economics mismatch');
	if (invoice.status !== 'paid') return null;
	if (invoice.amountPaid === null || minor(invoice.amountPaid) !== KIT.priceMinor) {
		throw new Error('Canonical kit payment not proven');
	}
	const refundedMinor = minor(invoice.refundedAmount);
	if (refundedMinor < 0 || refundedMinor > KIT.priceMinor) {
		throw new Error('Invalid canonical refund amount');
	}
	return {
		providerInvoiceId: invoice.id,
		stripeInvoiceId: invoice.stripeId,
		totalMinor: KIT.priceMinor,
		paidMinor: KIT.priceMinor,
		refundedMinor,
		status: refundedMinor === KIT.priceMinor ? 'refunded' : refundedMinor > 0 ? 'review' : 'paid',
		purchasedAt: new Date(invoice.createdAt)
	};
}

const RECONCILE_EVENTS = new Set([
	'billing.updated',
	'customer.products.updated',
	'invoice.finalized',
	'invoice.paid',
	'invoice.updated',
	'invoice.refunded',
	'refund.created',
	'refund.updated',
	'billing.refunded'
]);

/** Resource labels must not mask the supported envelope event discriminator. */
export function kitEventIdentity(payload: unknown): { type: string; customerId: string } | null {
	if (!payload || typeof payload !== 'object') throw new Error('Invalid webhook envelope');
	const p = payload as { type?: unknown; data?: Record<string, unknown> };
	if (!p.data || typeof p.data !== 'object') throw new Error('Missing webhook data');
	const type = [p.data.object, p.type].find(
		(value): value is string => typeof value === 'string' && RECONCILE_EVENTS.has(value)
	);
	if (!type) return null;
	const nested = p.data.customer as { id?: unknown } | undefined;
	const direct = p.data.customer_id;
	if (direct !== undefined && nested?.id !== undefined && direct !== nested.id) {
		throw new Error('Conflicting webhook customer identities');
	}
	const customerId = direct ?? nested?.id;
	if (typeof customerId !== 'string' || !customerId || customerId.length > 256) {
		throw new Error('Missing webhook customer identity');
	}
	return { type, customerId };
}

/**
 * Gross DKK 99, including 25% VAT, not DKK 99 + VAT. The rate must be verified
 * inclusive before activation. No arbitrary client tax/price/session overrides.
 */
export function kitCheckoutParams(vatRateId: string, stripePriceId: string) {
	if (!/^txr_[a-zA-Z0-9]+$/.test(vatRateId)) throw new Error('Inclusive VAT rate not configured');
	if (!/^price_[a-zA-Z0-9]+$/.test(stripePriceId))
		throw new Error('Mapped Stripe price not configured');
	return {
		locale: 'da',
		mode: 'payment',
		automatic_tax: { enabled: false },
		allow_promotion_codes: false,
		billing_address_collection: 'required',
		invoice_creation: { enabled: true },
		line_items: [
			{
				quantity: 1,
				tax_rates: [vatRateId],
				// Keep Autumn's mapped price. A new inline product loses invoice plan
				// attribution and could make a paid buyer impossible to fulfill.
				price: stripePriceId
			}
		]
	};
}

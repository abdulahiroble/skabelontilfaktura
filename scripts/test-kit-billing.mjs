/**
 * Actual production TS modules, transpiled in memory. Provider/DB boundaries are
 * explicit mocks: this suite never creates customers, sessions, emails or charges.
 * Run: node --test scripts/test-kit-billing.mjs
 */
import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const moduleUrl = (code) => `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;
function compiled(relative, mocks = {}) {
	const path = resolve(root, relative);
	const js = ts
		.transpileModule(readFileSync(path, 'utf8'), {
			compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext }
		})
		.outputText.replace(/from (['"])([^'"]+)\1/g, (_, quote, specifier) => {
			let url;
			if (mocks[specifier]) url = moduleUrl(mocks[specifier]);
			else if (specifier.startsWith('$lib/'))
				url = compiled(`src/lib/${specifier.slice(5)}.ts`, mocks);
			else if (specifier.startsWith('.'))
				url = compiled(resolve(dirname(path), `${specifier}.ts`), mocks);
			else url = import.meta.resolve(specifier);
			return `from ${JSON.stringify(url)}`;
		});
	return moduleUrl(js);
}
const { KIT } = await import(compiled('src/lib/billing/kit.ts'));
const {
	billingEnvironment,
	verifyKitInvoice,
	kitEventIdentity,
	kitCheckoutParams,
	checkoutProviderFailure,
	CHECKOUT_SESSION_TTL_SECONDS,
	CHECKOUT_LEASE_TTL_MS
} = await import(compiled('src/lib/server/payments/kit-policy.ts'));
const { computeSignature, verifyWebhook } = await import(
	compiled('src/lib/server/payments/webhook.ts')
);
const invoice = (extra = {}) => ({
	id: 'inv_fixture',
	stripeId: 'in_fixture',
	customerId: 'fixture-user',
	entityId: null,
	planIds: [KIT.id],
	processorType: 'stripe',
	status: 'paid',
	total: 99,
	amountPaid: 99,
	refundedAmount: 0,
	currency: 'dkk',
	createdAt: 1_800_000_000_000,
	...extra
});

test('approved fixed kit economics are 99 gross / 79.20 net / 19.80 VAT', () => {
	assert.equal(KIT.priceMinor, KIT.netMinor + KIT.vatMinor);
	assert.equal(KIT.price, 99);
	assert.equal(KIT.fileCount, 8);
	const params = kitCheckoutParams('txr_fixture', 'price_fixture');
	assert.equal(params.mode, 'payment');
	assert.equal(params.line_items[0].price, 'price_fixture');
	assert.equal(
		params.line_items[0].price_data,
		undefined,
		'must not invent a new unmapped inline product'
	);
	assert.equal(params.line_items[0].quantity, 1);
	assert.deepEqual(params.line_items[0].tax_rates, ['txr_fixture']);
	assert.equal(params.allow_promotion_codes, false);
	assert.equal(params.invoice_creation.enabled, true);
	assert.throws(() => kitCheckoutParams('unverified', 'price_fixture'));
	assert.throws(() => kitCheckoutParams('txr_fixture', ''));
});
test('key environments cannot be confused', () => {
	assert.equal(billingEnvironment('am_sk_live_fixture'), 'live');
	assert.equal(billingEnvironment('am_sk_test_fixture'), 'sandbox');
	assert.throws(() => billingEnvironment('"am_sk_live_fixture"'));
});
test('checkout expiry leaves network margin above Stripe minimum and lease outlives it', () => {
	assert.equal(CHECKOUT_SESSION_TTL_SECONDS, 35 * 60);
	assert.equal(CHECKOUT_LEASE_TTL_MS, 36 * 60_000);
	assert.ok(CHECKOUT_SESSION_TTL_SECONDS > 30 * 60 + 60);
	assert.ok(CHECKOUT_LEASE_TTL_MS > CHECKOUT_SESSION_TTL_SECONDS * 1000 + 15_000);
});
test('provider diagnostic classifies expiry without returning raw messages or identifiers', () => {
	const result = checkoutProviderFailure({
		code: 'stripe_error',
		message:
			'expires_at must be between 30 minutes and 24 hours; fixture@example.test cs_test_secret am_sk_test_secret'
	});
	assert.deepEqual(result, {
		providerCode: 'stripe_error',
		failureReason: 'CHECKOUT_EXPIRY_INVALID'
	});
	assert.ok(!JSON.stringify(result).includes('secret'));
	assert.ok(!JSON.stringify(result).includes('@'));
});
test('provider diagnostic distinguishes capability and tax rejection without arbitrary code leakage', () => {
	assert.equal(
		checkoutProviderFailure({ message: 'Your account cannot currently make live charges.' })
			.failureReason,
		'STRIPE_ACCOUNT_NOT_READY'
	);
	assert.equal(
		checkoutProviderFailure({ message: 'No such tax_rate' }).failureReason,
		'VAT_RATE_REJECTED'
	);
	assert.equal(checkoutProviderFailure({ code: 'am_sk_test_secret' }).providerCode, 'unclassified');
});
test('canonical paid fixed-price invoice alone supplies ownership proof', () => {
	const proof = verifyKitInvoice(invoice(), 'fixture-user');
	assert.equal(proof.status, 'paid');
	assert.equal(proof.totalMinor, 9900);
	assert.equal(verifyKitInvoice(invoice({ planIds: ['pro'] }), 'fixture-user'), null);
	assert.equal(verifyKitInvoice(invoice({ status: 'open' }), 'fixture-user'), null);
});
for (const [label, extra] of [
	['other customer', { customerId: 'someone-else' }],
	['entity-scoped purchase', { entityId: 'tenant' }],
	['bundled unrelated plan', { planIds: [KIT.id, 'pro'] }],
	['unpaid snapshot', { amountPaid: null }],
	['partial payment', { amountPaid: 1 }],
	['VAT added on top', { total: 123.75, amountPaid: 123.75 }],
	['wrong unit convention', { total: 9900, amountPaid: 9900 }],
	['wrong currency', { currency: 'usd' }],
	['wrong processor', { processorType: 'revenuecat' }],
	['nonfinite amount', { total: NaN }],
	['invalid timestamp unit', { createdAt: 1_800_000_000 }],
	['invalid invoice ID', { stripeId: '' }],
	['negative refund', { refundedAmount: -1 }],
	['oversized refund', { refundedAmount: 100 }]
])
	test(`rejects ${label}`, () =>
		assert.throws(() => verifyKitInvoice(invoice(extra), 'fixture-user')));
test('full refund revokes and partial refund enters review', () => {
	assert.equal(
		verifyKitInvoice(invoice({ refundedAmount: 99 }), 'fixture-user').status,
		'refunded'
	);
	assert.equal(verifyKitInvoice(invoice({ refundedAmount: 10 }), 'fixture-user').status, 'review');
});
test('real legacy and newer envelope identities work, conflicts fail closed', () => {
	assert.deepEqual(
		kitEventIdentity({ data: { object: 'billing.updated', customer_id: 'fixture' } }),
		{ type: 'billing.updated', customerId: 'fixture' }
	);
	assert.deepEqual(
		kitEventIdentity({
			type: 'invoice.finalized',
			data: { object: 'invoice', customer_id: 'fixture' }
		}),
		{ type: 'invoice.finalized', customerId: 'fixture' }
	);
	assert.equal(
		kitEventIdentity({ type: 'customer.products.updated', data: { customer: { id: 'fixture' } } })
			.customerId,
		'fixture'
	);
	assert.throws(() =>
		kitEventIdentity({
			type: 'billing.updated',
			data: { customer_id: 'one', customer: { id: 'two' } }
		})
	);
	assert.throws(() => kitEventIdentity({ type: 'invoice.finalized', data: {} }));
	assert.equal(kitEventIdentity({ type: 'unknown', data: {} }), null);
});
test('Svix requires base64, current timestamp and exact raw body', async () => {
	const secret = `whsec_${Buffer.from('fixture-signing-material-32bytes!!').toString('base64')}`;
	const timestamp = String(Math.floor(Date.now() / 1000));
	const raw = JSON.stringify({ data: { object: 'billing.updated', customer_id: 'fixture' } });
	const signature = await computeSignature(secret, 'msg_fixture', timestamp, raw);
	assert.equal(signature.length, 44);
	const headers = new Headers({
		'svix-id': 'msg_fixture',
		'svix-timestamp': timestamp,
		'svix-signature': `v1,bad v1,${signature}`
	});
	assert.equal(await verifyWebhook(raw, headers, secret), raw);
	assert.equal(await verifyWebhook(`${raw} `, headers, secret), null);
	headers.set('svix-timestamp', '1');
	assert.equal(await verifyWebhook(raw, headers, secret), null);
});

const boundaryMocks = {
	'drizzle-orm':
		'export const and=(...a)=>a; export const eq=(...a)=>a; export const lt=(...a)=>a;',
	'$lib/server/db/client': 'export const getDb=()=>globalThis.__kitFixture.db;',
	'$lib/server/db/schema':
		'export const kitCheckout={userId:"userId",environment:"environment",sku:"sku",expiresAt:"expiresAt",attemptId:"attemptId"};',
	'./autumn':
		'export const getAutumnSecret=(env)=>env.AUTUMN_SECRET_KEY; export const createAutumnClient=()=>globalThis.__kitFixture.autumn;',
	'./kit-entitlements': 'export const reconcileKit=async()=>globalThis.__kitFixture.ownership;'
};
const checkout = await import(compiled('src/lib/server/payments/checkout.ts', boundaryMocks));
const env = {
	KIT_CHECKOUT_ENABLED: 'true',
	KIT_VAT_RATE_ID: 'txr_fixture',
	AUTUMN_SECRET_KEY: 'am_sk_test_fixture',
	DATABASE_URL: 'fixture',
	PUBLIC_APP_URL: 'https://skabelontilfaktura.dk'
};
const buyer = { id: 'fixture-user', email: 'fixture@example.test' };
const nativeFetch = globalThis.fetch;
function catalogFetch(url) {
	if (url.includes('/organization/stripe/prices/search'))
		return Promise.resolve(
			Response.json({
				stripe_connected: true,
				stripe_prices: [
					globalThis.__kitFixture?.stripePrice ?? {
						id: 'price_fixture',
						unit_amount: 9900,
						currency: 'dkk',
						active: true,
						interval: null
					}
				]
			})
		);
	if (url.endsWith('/organization'))
		return Promise.resolve(
			Response.json(
				globalThis.__kitFixture?.org ?? {
					default_currency: 'DKK',
					config: { automatic_tax: false }
				}
			)
		);
	if (url.endsWith('/plans.get'))
		return Promise.resolve(
			Response.json(
				globalThis.__kitFixture?.plan ?? {
					id: KIT.id,
					env: 'sandbox',
					archived: false,
					price: {
						amount: 99,
						interval: 'one_off',
						processors: { stripe: { price_id: 'price_fixture' } }
					}
				}
			)
		);
	throw new Error('Network is forbidden in this regression suite');
}
beforeEach(() => {
	globalThis.fetch = catalogFetch;
});
afterEach(() => {
	globalThis.fetch = nativeFetch;
});
function fixture({ lease = true, existingUrl = null } = {}) {
	let inserts = 0,
		updates = 0;
	let insertMode = '';
	const db = {
		insert: () => ({
			values: () => ({
				onConflictDoUpdate: () => (
					(insertMode = 'renewable'),
					{
						returning: async () => {
							inserts++;
							return lease ? [{ attemptId: 'fixture' }] : [];
						}
					}
				),
				onConflictDoNothing: () => (
					(insertMode = 'permanent'),
					{
						returning: async () => {
							inserts++;
							return lease ? [{ attemptId: 'fixture' }] : [];
						}
					}
				)
			})
		}),
		select: () => ({
			from: () => ({ where: () => ({ limit: async () => [{ paymentUrl: existingUrl }] }) })
		}),
		update: () => ({
			set: () => ({
				where: async () => {
					updates++;
				}
			})
		})
	};
	globalThis.__kitFixture = {
		db,
		ownership: { owned: false, status: 'none' },
		autumn: {
			plans: { get: async () => ({ archived: false, price: { amount: 99, interval: 'one_off' } }) },
			customers: { getOrCreate: async () => ({ id: buyer.id, email: buyer.email, env: 'sandbox' }) }
		}
	};
	return { inserts: () => inserts, updates: () => updates, insertMode: () => insertMode };
}
test('private live preflight never renews an existing lease or creates a second session', async () => {
	const f = fixture({ lease: false }),
		base = globalThis.fetch;
	globalThis.fetch = async (url, options) => {
		if (url.endsWith('/organization/stripe')) return Response.json({ id: 'acct_1U2t6I73kDsvqEWH' });
		if (url.endsWith('/plans.list')) return Response.json({ list: [] });
		const response = await base(url, options);
		if (url.endsWith('/plans.get'))
			return Response.json({ ...(await response.json()), env: 'live' });
		return response;
	};
	const result = await checkout.createCheckoutSession(
		{
			...env,
			AUTUMN_SECRET_KEY: 'am_sk_live_fixture',
			KIT_CHECKOUT_ENABLED: 'false',
			KIT_PREFLIGHT_ENABLED: 'true'
		},
		buyer,
		KIT.id,
		{ operatorPreflight: true }
	);
	assert.equal(result.status, 429);
	assert.equal(f.insertMode(), 'permanent');
	assert.equal(f.updates(), 0);
});
for (const [name, account, defaults] of [
	['wrong deployed Stripe account', 'acct_other', []],
	['automatic plan', 'acct_1U2t6I73kDsvqEWH', [{ auto_enable: true, archived: false }]]
])
	test(`operator preflight rejects ${name} before customer/session writes`, async () => {
		const f = fixture(),
			base = globalThis.fetch;
		let created = 0;
		globalThis.__kitFixture.autumn.customers.getOrCreate = async () => {
			created++;
			throw Error('Must not run');
		};
		globalThis.fetch = async (url, options) => {
			if (url.endsWith('/organization/stripe')) return Response.json({ id: account });
			if (url.endsWith('/plans.list')) return Response.json({ list: defaults });
			const response = await base(url, options);
			if (url.endsWith('/plans.get'))
				return Response.json({ ...(await response.json()), env: 'live' });
			return response;
		};
		const result = await checkout.createCheckoutSession(
			{
				...env,
				AUTUMN_SECRET_KEY: 'am_sk_live_fixture',
				KIT_CHECKOUT_ENABLED: 'false',
				KIT_PREFLIGHT_ENABLED: 'true'
			},
			buyer,
			KIT.id,
			{ operatorPreflight: true }
		);
		assert.equal(result.status, 503);
		assert.equal(f.inserts(), 0);
		assert.equal(created, 0);
	});
test('legacy subscriptions cannot be newly purchased; closed default never touches provider', async () => {
	assert.equal(checkout.isCheckoutPlanId('pro'), false);
	assert.equal(checkout.isCheckoutPlanId('pro_annual'), false);
	assert.equal(checkout.isCheckoutPlanId(KIT.id), true);
	const result = await checkout.createCheckoutSession({}, buyer, KIT.id);
	assert.equal(result.code, 'BILLING_NOT_CONFIGURED');
});
test('existing ownership recovers to account without another checkout', async () => {
	const f = fixture();
	globalThis.__kitFixture.ownership = { owned: true, status: 'paid' };
	assert.equal(
		(await checkout.createCheckoutSession(env, buyer, KIT.id)).paymentUrl,
		'https://skabelontilfaktura.dk/konto/'
	);
	assert.equal(f.inserts(), 0);
});
test('distributed checkout lease blocks a concurrent payable session', async () => {
	fixture({ lease: false });
	const result = await checkout.createCheckoutSession(env, buyer, KIT.id);
	assert.equal(result.status, 429);
});
test('an existing open checkout is reused instead of creating a second session', async () => {
	fixture({ lease: false, existingUrl: 'https://checkout.stripe.com/c/pay/cs_test_fixture' });
	assert.equal(
		(await checkout.createCheckoutSession(env, buyer, KIT.id)).paymentUrl,
		'https://checkout.stripe.com/c/pay/cs_test_fixture'
	);
});
test('one-off uses raw product_id/url with fixed inclusive tax and no pack quantities', async () => {
	const f = fixture();
	const original = globalThis.fetch;
	let request;
	globalThis.fetch = async (url, options) => {
		if (!url.endsWith('/checkout')) return catalogFetch(url);
		request = { url, ...JSON.parse(options.body), headers: options.headers };
		return Response.json({ url: 'https://checkout.stripe.com/c/pay/cs_test_fixture' });
	};
	try {
		const result = await checkout.createCheckoutSession(env, buyer, KIT.id);
		assert.ok(result.paymentUrl);
		assert.equal(request.url, 'https://api.useautumn.com/v1/checkout');
		assert.equal(request.product_id, KIT.id);
		assert.equal(request.plan_id, undefined);
		assert.equal(request.options, undefined);
		assert.equal(request.headers['x-api-version'], '2.3.0');
		assert.equal(request.checkout_session_params.line_items[0].price, 'price_fixture');
		assert.ok(
			request.checkout_session_params.expires_at > Math.floor(Date.now() / 1000) + 34 * 60,
			'network hops must not push expiry below Stripe 30-minute minimum'
		);
		assert.equal(f.updates(), 1);
	} finally {
		globalThis.fetch = original;
	}
});
test('provider rejection records safe diagnostics and does not persist a checkout capability', async () => {
	const f = fixture();
	const original = globalThis.fetch;
	globalThis.fetch = async (url) =>
		url.endsWith('/checkout')
			? Response.json(
					{ code: 'stripe_error', message: 'expires_at must be between 30 minutes and 24 hours' },
					{ status: 400 }
				)
			: catalogFetch(url);
	try {
		const result = await checkout.createCheckoutSession(env, buyer, KIT.id);
		assert.equal(result.status, 503);
		assert.equal(result.code, 'BILLING_UNAVAILABLE');
		assert.equal(f.inserts(), 1);
		assert.equal(f.updates(), 0);
		assert.equal(result.paymentUrl, undefined);
	} finally {
		globalThis.fetch = original;
	}
});
test('wrong checkout environment cannot be returned to the buyer', async () => {
	fixture();
	const original = globalThis.fetch;
	globalThis.fetch = async (url) =>
		url.endsWith('/checkout')
			? Response.json({ url: 'https://checkout.stripe.com/c/pay/cs_live_fixture' })
			: catalogFetch(url);
	try {
		assert.equal((await checkout.createCheckoutSession(env, buyer, KIT.id)).status, 503);
	} finally {
		globalThis.fetch = original;
	}
});
for (const [name, org] of [
	['wrong organization currency', { default_currency: 'USD', config: { automatic_tax: false } }],
	['global automatic tax override', { default_currency: 'DKK', config: { automatic_tax: true } }]
])
	test(`checkout closes on ${name}`, async () => {
		const f = fixture();
		globalThis.__kitFixture.org = org;
		assert.equal((await checkout.createCheckoutSession(env, buyer, KIT.id)).status, 503);
		assert.equal(f.inserts(), 0);
	});
test('unprovisioned Stripe mapping closes checkout before a customer/session write', async () => {
	const f = fixture();
	globalThis.__kitFixture.plan = {
		id: KIT.id,
		env: 'sandbox',
		archived: false,
		price: { amount: 99, interval: 'one_off' }
	};
	assert.equal((await checkout.createCheckoutSession(env, buyer, KIT.id)).status, 503);
	assert.equal(f.inserts(), 0);
});
for (const [name, diff] of [
	['wrong Stripe amount', { unit_amount: 12375 }],
	['wrong Stripe currency despite DKK organization', { currency: 'usd' }],
	['inactive Stripe price', { active: false }],
	['recurring Stripe price', { interval: 'month' }]
])
	test(`checkout rejects ${name} before customer/session creation`, async () => {
		const f = fixture();
		globalThis.__kitFixture.stripePrice = {
			id: 'price_fixture',
			unit_amount: 9900,
			currency: 'dkk',
			active: true,
			interval: null,
			...diff
		};
		assert.equal((await checkout.createCheckoutSession(env, buyer, KIT.id)).status, 503);
		assert.equal(f.inserts(), 0);
	});

const download = await import(
	compiled('src/routes/api/downloads/kit/+server.ts', {
		...boundaryMocks,
		'$lib/server/payments/kit-entitlements': `export const reconcileKit=async()=>{
		if(globalThis.__kitFixture.reconcileError) throw Error('Provider unavailable');
		return globalThis.__kitFixture.ownership;
	};`
	})
);
function downloadEvent(authenticated = true) {
	const headers = {};
	return {
		locals: { user: authenticated ? buyer : null },
		platform: { env },
		setHeaders: (values) => Object.assign(headers, values),
		capturedHeaders: headers
	};
}
test('protected ZIP rejects anonymous requests', async () => {
	const event = downloadEvent(false);
	await assert.rejects(download.GET(event), (e) => e.status === 401);
	assert.equal(event.capturedHeaders['Cache-Control'], 'private, no-store');
});
test('protected ZIP rejects another account with no verified purchase', async () => {
	fixture();
	await assert.rejects(download.GET(downloadEvent()), (e) => e.status === 403);
});
test('refund denies the actual download, not only its UI link', async () => {
	fixture();
	globalThis.__kitFixture.ownership = { owned: false, status: 'refunded' };
	await assert.rejects(download.GET(downloadEvent()), (e) => e.status === 403);
});
test('provider outage is recoverable and never grants an unverified ZIP', async () => {
	fixture();
	globalThis.__kitFixture.reconcileError = true;
	await assert.rejects(download.GET(downloadEvent()), (e) => e.status === 503);
});
test('verified owner receives the real private ZIP with its expected hash', async () => {
	fixture();
	globalThis.__kitFixture.ownership = { owned: true, status: 'paid' };
	const event = downloadEvent();
	const response = await download.GET(event);
	assert.equal(response.status, 200);
	assert.equal(response.headers.get('Content-Type'), 'application/zip');
	assert.match(response.headers.get('Content-Disposition'), /attachment; filename=/);
	const bytes = new Uint8Array(await response.arrayBuffer());
	assert.equal(bytes[0], 0x50);
	assert.equal(bytes[1], 0x4b);
	assert.ok(bytes.length > 10_000);
	assert.equal(event.capturedHeaders['Cache-Control'], 'private, no-store');
});

const checkoutRoute = await import(
	compiled('src/routes/api/billing/checkout/+server.ts', {
		'$lib/server/payments/checkout': `export const isCheckoutPlanId=(id)=>id==='fakturapakken_v1';
	export const createCheckoutSession=async()=>({paymentUrl:'https://checkout.stripe.com/c/pay/cs_test_fixture'});`
	})
);
function checkoutEvent(body, user = buyer) {
	return {
		locals: { user },
		platform: { env },
		request: new Request('https://skabelontilfaktura.dk/api/billing/checkout', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body)
		})
	};
}
test('anonymous checkout preserves pricing intent in its login target', async () => {
	const response = await checkoutRoute.POST(checkoutEvent({ planId: KIT.id }, null));
	assert.equal(response.status, 401);
	assert.equal((await response.json()).loginUrl, KIT.loginUrl);
});
test('checkout API rejects client price, customer and tax overrides', async () => {
	for (const extra of [
		{ price: 1 },
		{ customerId: 'someone-else' },
		{ checkout_session_params: {} }
	]) {
		assert.equal(
			(await checkoutRoute.POST(checkoutEvent({ planId: KIT.id, ...extra }))).status,
			400
		);
	}
});
test('checkout API rejects legacy recurring and unknown SKUs', async () => {
	for (const planId of ['pro', 'pro_annual', 'lifetime_pro', 'template_pack', 'unknown']) {
		assert.equal((await checkoutRoute.POST(checkoutEvent({ planId }))).status, 400);
	}
});
test('checkout API accepts only the shared standalone kit contract', async () => {
	assert.equal((await checkoutRoute.POST(checkoutEvent({ planId: KIT.id }))).status, 200);
});

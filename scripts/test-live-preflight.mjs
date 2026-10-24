import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { validateStripeAudit } from './live-preflight-policy.mjs';

const js = ts.transpileModule(
	readFileSync(new URL('../src/lib/server/payments/live-preflight.ts', import.meta.url), 'utf8'),
	{
		compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext }
	}
).outputText;
const { authorizeLivePreflight } = await import(
	'data:text/javascript;base64,' + Buffer.from(js).toString('base64')
);
const email = 'faktura-live-preflight-00000000-0000-4000-8000-000000000001@example.test',
	secret = 'a'.repeat(64);
const hash = Buffer.from(
	await crypto.subtle.digest('SHA-256', new TextEncoder().encode(email))
).toString('hex');
const env = {
	KIT_PREFLIGHT_ENABLED: 'true',
	KIT_CHECKOUT_ENABLED: 'false',
	PUBLIC_APP_URL: 'https://skabelontilfaktura.dk',
	AUTUMN_SECRET_KEY: 'am_sk_live_fixture',
	KIT_VAT_RATE_ID: 'txr_1UTp9G73kDsvqEWHqIpPEtOr',
	KIT_PREFLIGHT_SECRET: secret,
	KIT_PREFLIGHT_EMAIL_SHA256: hash,
	KIT_PREFLIGHT_DEADLINE: String(Date.now() + 600000)
};
test('only the exact authenticated synthetic identity and private capability bypass closed sales', async () => {
	assert.equal(await authorizeLivePreflight(env, email, secret), true);
	assert.equal(await authorizeLivePreflight(env, email, null), false);
	assert.equal(await authorizeLivePreflight(env, email, 'b'.repeat(64)), false);
	assert.equal(await authorizeLivePreflight(env, 'owner@example.com', secret), false);
});
for (const [name, patch] of [
	['sandbox', { AUTUMN_SECRET_KEY: 'am_sk_test_fixture' }],
	['expired', { KIT_PREFLIGHT_DEADLINE: '0' }],
	['unbounded deadline', { KIT_PREFLIGHT_DEADLINE: String(Date.now() + 86400000) }],
	['public sales open', { KIT_CHECKOUT_ENABLED: 'true' }],
	['wrong origin', { PUBLIC_APP_URL: 'https://other.example' }],
	['wrong VAT', { KIT_VAT_RATE_ID: 'txr_other' }],
	['disabled', { KIT_PREFLIGHT_ENABLED: 'false' }]
])
	test(`operator gate rejects ${name}`, async () =>
		assert.equal(await authorizeLivePreflight({ ...env, ...patch }, email, secret), false));
const expected = {
	accountId: 'acct_fixture',
	customerId: 'cus_fixture',
	email,
	notBefore: Date.now() - 10000,
	customerCreatedAfter: Date.now() - 10000,
	sessionId: 'cs_live_fixture',
	attemptId: 'attempt-fixture'
};
function audit(stage = 'before') {
	const paths = {
		sessions: '/v1/checkout/sessions',
		invoices: '/v1/invoices',
		paymentIntents: '/v1/payment_intents',
		charges: '/v1/charges',
		subscriptions: '/v1/subscriptions',
		paymentMethods: '/v1/payment_methods',
		balanceTransactions: '/v1/customers/cus_fixture/balance_transactions'
	};
	const collections = Object.fromEntries(
		Object.entries(paths).map(([n, path]) => [
			n,
			[
				{
					request: {
						method: 'GET',
						path,
						customer: 'cus_fixture',
						limit: 100,
						starting_after: '',
						...(n === 'subscriptions' ? { status: 'all' } : {})
					},
					data: [],
					has_more: false
				}
			]
		])
	);
	if (stage !== 'before')
		collections.sessions[0].data = [
			{
				id: 'cs_live_fixture',
				customer: 'cus_fixture',
				livemode: true,
				mode: 'payment',
				status: stage === 'expired' ? 'expired' : 'open',
				payment_status: 'unpaid',
				currency: 'dkk',
				amount_total: 9900,
				total_details: { amount_tax: 1980 },
				metadata: { kit_attempt_id: 'attempt-fixture' },
				payment_intent: null
			}
		];
	return {
		source: 'parent-Stripe-Workbench-API-readback',
		accountId: 'acct_fixture',
		livemode: true,
		capturedAt: new Date().toISOString(),
		customerRequest: { method: 'GET', path: '/v1/customers/cus_fixture' },
		customerHttpStatus: 200,
		customer: {
			id: 'cus_fixture',
			livemode: true,
			email,
			created: Math.floor(Date.now() / 1000),
			balance: 0,
			default_source: null,
			invoice_settings: { default_payment_method: null }
		},
		collections,
		checkoutVisible: {
			sellerMatches: true,
			grossDkk: 99,
			inclusiveVatDkk: 19.8,
			noPaymentDetailsEntered: true
		}
	};
}
test('complete empty before-state is accepted', () =>
	assert.equal(validateStripeAudit(audit(), expected, 'before').zeroFinancialEffects, true));
test('the exact single open unpaid session and visible VAT are required', () => {
	assert.equal(validateStripeAudit(audit('opened'), expected, 'opened').sessions, 1);
	const a = audit('opened');
	a.checkoutVisible.inclusiveVatDkk = 0;
	assert.throws(() => validateStripeAudit(a, expected, 'opened'));
});
test('expiration proof does not accept an open session', () => {
	assert.equal(validateStripeAudit(audit('expired'), expected, 'expired').sessions, 1);
	assert.throws(() => validateStripeAudit(audit('opened'), expected, 'expired'));
});
test('any charge blocks cleanup even if described as refunded', () => {
	const a = audit();
	a.collections.charges[0].data = [{ id: 'ch_fixture', customer: 'cus_fixture', refunded: true }];
	assert.throws(() => validateStripeAudit(a, expected, 'before'));
});
test('incomplete pagination and foreign-account readbacks are rejected', () => {
	const a = audit();
	a.collections.invoices[0].has_more = true;
	assert.throws(() => validateStripeAudit(a, expected, 'before'));
	const b = audit();
	b.accountId = 'other';
	assert.throws(() => validateStripeAudit(b, expected, 'before'));
});
test('independent exact-customer GET tombstone is mandatory', () => {
	const a = audit();
	a.customer = { id: 'cus_fixture', deleted: true };
	assert.equal(validateStripeAudit(a, expected, 'deleted').deleted, true);
	a.customer.id = 'other';
	assert.throws(() => validateStripeAudit(a, expected, 'deleted'));
});
test('credential-bearing raw responses cannot become evidence artifacts', () => {
	const a = audit();
	a.client_secret = 'fixture-never-real';
	assert.throws(() => validateStripeAudit(a, expected, 'before'));
});
test('subscription pagination must include all statuses, not only active records', () => {
	const a = audit();
	delete a.collections.subscriptions[0].request.status;
	assert.throws(() => validateStripeAudit(a, expected, 'before'));
});
test('an unsettled payment intent blocks expiration cleanup', () => {
	const a = audit('expired');
	a.collections.sessions[0].data[0].payment_intent = 'pi_fixture';
	a.collections.paymentIntents[0].data = [
		{
			id: 'pi_fixture',
			customer: 'cus_fixture',
			livemode: true,
			status: 'processing',
			amount_received: 0,
			amount_capturable: 0,
			latest_charge: null
		}
	];
	assert.throws(() => validateStripeAudit(a, expected, 'expired'));
});

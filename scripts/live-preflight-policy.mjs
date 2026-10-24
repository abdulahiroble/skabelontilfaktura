/** Validate canonical, customer-scoped Stripe API readbacks supplied by the UI owner. */
const paths = {
	sessions: '/v1/checkout/sessions',
	invoices: '/v1/invoices',
	paymentIntents: '/v1/payment_intents',
	charges: '/v1/charges',
	subscriptions: '/v1/subscriptions',
	paymentMethods: '/v1/payment_methods'
};
function requireProof(ok) {
	if (!ok) throw new Error('Incomplete or unsafe live Stripe evidence');
}
export function validateStripeAudit(a, expected, stage) {
	// Readbacks are financial-field projections, never raw credential-bearing
	// responses/headers. Keep client secrets and capability URLs out of artifacts.
	function safeProjection(value) {
		if (!value || typeof value !== 'object') return;
		for (const [key, child] of Object.entries(value)) {
			requireProof(
				!/(?:secret|authorization|cookie|password|api_key|access_token|receipt_url|hosted_invoice_url|invoice_pdf)/i.test(
					key
				) && key !== 'url'
			);
			safeProjection(child);
		}
	}
	safeProjection(a);
	requireProof(
		a?.source === 'parent-Stripe-Workbench-API-readback' &&
			a.accountId === expected.accountId &&
			a.livemode === true &&
			Number.isFinite(Date.parse(a.capturedAt)) &&
			Date.parse(a.capturedAt) >= expected.notBefore &&
			Date.parse(a.capturedAt) <= Date.now() + 30_000
	);
	requireProof(a.customer?.id === expected.customerId);
	requireProof(
		a.customerRequest?.method === 'GET' &&
			a.customerRequest.path === '/v1/customers/' + expected.customerId &&
			a.customerHttpStatus === 200
	);
	if (stage === 'deleted') {
		requireProof(
			a.customerRequest?.method === 'GET' &&
				a.customerRequest.path === '/v1/customers/' + expected.customerId &&
				a.customerHttpStatus === 200 &&
				a.customer.deleted === true
		);
		return { capturedAt: a.capturedAt, deleted: true };
	}
	requireProof(
		a.customer.deleted !== true &&
			a.customer.livemode === true &&
			a.customer.email?.toLowerCase() === expected.email.toLowerCase() &&
			a.customer.created * 1000 >= expected.customerCreatedAfter &&
			a.customer.balance === 0 &&
			a.customer.default_source === null &&
			a.customer.invoice_settings?.default_payment_method === null
	);
	const records = {};
	for (const [name, apiPath] of Object.entries({
		...paths,
		balanceTransactions: '/v1/customers/' + expected.customerId + '/balance_transactions'
	})) {
		const pages = a.collections?.[name];
		requireProof(Array.isArray(pages) && pages.length > 0 && pages.length <= 5);
		const all = [],
			ids = new Set();
		let cursor = '';
		for (let i = 0; i < pages.length; i++) {
			const p = pages[i];
			requireProof(
				p.request?.method === 'GET' &&
					p.request.path === apiPath &&
					(name === 'balanceTransactions' || p.request.customer === expected.customerId) &&
					(name !== 'subscriptions' || p.request.status === 'all') &&
					(p.request.starting_after ?? '') === cursor &&
					p.request.limit === 100 &&
					Array.isArray(p.data) &&
					p.data.length <= 100 &&
					p.has_more === i < pages.length - 1
			);
			for (const item of p.data) {
				requireProof(
					typeof item.id === 'string' &&
						!ids.has(item.id) &&
						(item.customer?.id ?? item.customer) === expected.customerId
				);
				ids.add(item.id);
				all.push(item);
			}
			if (p.has_more) requireProof(p.data.length > 0);
			cursor = p.data.at(-1)?.id ?? '';
		}
		records[name] = all;
	}
	for (const n of ['invoices', 'charges', 'subscriptions', 'paymentMethods', 'balanceTransactions'])
		requireProof(records[n].length === 0);
	for (const pi of records.paymentIntents)
		requireProof(
			pi.livemode === true &&
				['requires_payment_method', 'canceled'].includes(pi.status) &&
				pi.amount_received === 0 &&
				pi.amount_capturable === 0 &&
				pi.latest_charge === null
		);
	requireProof(records.sessions.length === (stage === 'before' ? 0 : 1));
	if (stage !== 'before') {
		const c = records.sessions[0];
		requireProof(
			c.id === expected.sessionId &&
				c.livemode === true &&
				c.mode === 'payment' &&
				c.status === (stage === 'expired' ? 'expired' : 'open') &&
				c.payment_status === 'unpaid' &&
				c.currency === 'dkk' &&
				c.amount_total === 9900 &&
				c.total_details?.amount_tax === 1980 &&
				c.metadata?.kit_attempt_id === expected.attemptId &&
				!c.after_expiration?.recovery?.enabled &&
				(c.payment_intent == null ||
					records.paymentIntents.some((p) => p.id === (c.payment_intent?.id ?? c.payment_intent)))
		);
		requireProof(
			records.paymentIntents.every(
				(p) =>
					p.id === (c.payment_intent?.id ?? c.payment_intent) &&
					(stage !== 'expired' || p.status === 'canceled')
			)
		);
		if (stage === 'opened')
			requireProof(
				a.checkoutVisible?.sellerMatches === true &&
					a.checkoutVisible.grossDkk === 99 &&
					a.checkoutVisible.inclusiveVatDkk === 19.8 &&
					a.checkoutVisible.noPaymentDetailsEntered === true
			);
	} else requireProof(records.paymentIntents.length === 0);
	return {
		capturedAt: a.capturedAt,
		sessions: records.sessions.length,
		charges: 0,
		invoices: 0,
		subscriptions: 0,
		paymentMethods: 0,
		balanceTransactions: 0,
		paymentIntents: records.paymentIntents.length,
		zeroFinancialEffects: true,
		stage
	};
}

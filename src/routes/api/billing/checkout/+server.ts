import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createCheckoutSession, isCheckoutPlanId } from '$lib/server/payments/checkout';
import { authorizeLivePreflight } from '$lib/server/payments/live-preflight';

/** Only the standalone kit can be bought. Verified paid invoices grant downloads, not cloud. */
export const POST: RequestHandler = async ({ request, platform, locals }) => {
	const user = locals.user;
	if (!user) {
		return json(
			{
				error: 'Log ind for at købe Fakturapakken.',
				code: 'AUTH_REQUIRED',
				loginUrl: '/login/?next=%2Fpris%2F'
			},
			{ status: 401 }
		);
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
		if (Number(request.headers.get('content-length') ?? 0) > 1024) throw new Error();
		const raw = await request.text();
		if (raw.length > 1024) throw new Error();
		body = JSON.parse(raw) as { planId?: unknown };
		if (!body || typeof body !== 'object' || Object.keys(body).some((key) => key !== 'planId'))
			throw new Error();
	} catch {
		return json({ error: 'Ugyldig anmodning.', code: 'INVALID_REQUEST' }, { status: 400 });
	}

	const planId = body.planId;
	if (typeof planId !== 'string' || !isCheckoutPlanId(planId)) {
		return json({ error: 'Ugyldig betalingsplan.', code: 'INVALID_PLAN' }, { status: 400 });
	}

	const operatorPreflight = await authorizeLivePreflight(
		env,
		user.email,
		request.headers.get('x-faktura-live-preflight')
	);
	const result = await createCheckoutSession(env, user, planId, { operatorPreflight });
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

import { json, type RequestHandler } from '@sveltejs/kit';
import { createAutumnClient } from '$lib/server/payments/autumn';

export const POST: RequestHandler = async ({ locals, platform }) => {
	if (!locals.user) {
		return json({ error: 'Log ind for at administrere abonnementet.' }, { status: 401 });
	}
	const env = platform?.env;
	if (!env?.AUTUMN_SECRET_KEY) {
		return json({ error: 'Betaling er ikke konfigureret.' }, { status: 503 });
	}

	try {
		const returnUrl = new URL('/konto/', env.PUBLIC_APP_URL).toString();
		const response = await createAutumnClient(env).billing.openCustomerPortal(
			{
				customerId: locals.user.id,
				returnUrl
			},
			{ timeoutMs: 15_000 }
		);
		if (!response.url) {
			return json({ error: 'Abonnementssiden kunne ikke åbnes.' }, { status: 502 });
		}
		return json({ url: response.url });
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		const status =
			error && typeof error === 'object'
				? ((error as { statusCode?: number; status?: number }).statusCode ??
					(error as { status?: number }).status)
				: undefined;
		console.error('[billing] Customer portal failed', {
			status: status ?? null,
			code: /insufficient_scopes/i.test(message) ? 'insufficient_scopes' : null,
			message: message.slice(0, 500)
		});
		if (status === 429) {
			return json(
				{ error: 'Abonnementet behandles allerede. Vent et øjeblik og prøv igen.' },
				{ status: 429 }
			);
		}
		if (status === 401 || status === 403 || /insufficient_scopes|billing:write/i.test(message)) {
			return json({ error: 'Abonnementssiden er midlertidigt utilgængelig.' }, { status: 503 });
		}
		if (/timeout|abort/i.test(message)) {
			return json(
				{ error: 'Betalingsudbyderen svarer ikke. Prøv igen om et øjeblik.' },
				{ status: 504 }
			);
		}
		return json(
			{ error: 'Abonnementssiden er midlertidigt utilgængelig. Prøv igen senere.' },
			{ status: 502 }
		);
	}
};

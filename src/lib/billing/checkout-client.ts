export interface CheckoutErrorPayload {
	error?: string;
	code?: string;
}

let checkoutInFlight = false;

export async function startCheckout(planId: string): Promise<
	| { paymentUrl: string }
	| {
			error: string;
			status: number;
			code?: string;
	  }
> {
	if (checkoutInFlight) {
		return {
			error: 'En betaling er allerede ved at blive åbnet.',
			status: 429,
			code: 'BILLING_LOCKED'
		};
	}
	checkoutInFlight = true;
	try {
		const response = await fetch('/api/billing/checkout', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ planId })
		});
		const payload = (await response.json().catch(() => null)) as
			({ paymentUrl?: string } & CheckoutErrorPayload) | null;

		if (!response.ok || !payload?.paymentUrl) {
			return {
				error:
					payload?.error ??
					(response.status === 401
						? 'Log ind for at fortsætte til betaling.'
						: 'Kunne ikke oprette betalingssessionen. Prøv igen.'),
				status: response.status,
				code: payload?.code
			};
		}

		return { paymentUrl: payload.paymentUrl };
	} catch {
		return {
			error: 'Forbindelsen til betalingsudbyderen fejlede. Kontrollér forbindelsen og prøv igen.',
			status: 0
		};
	} finally {
		checkoutInFlight = false;
	}
}

import type { Actions } from './$types';
import { redirect, error, fail } from '@sveltejs/kit';
import { getDb } from '$lib/server/db/client';
import { createClient, getBusinessByUserId } from '$lib/server/queries';

/**
 * Create-client form action.
 *
 * Validates input, ensures the user has a business, and inserts the client
 * scoped to that business. Returns `fail(400, { errors, values })` on
 * validation problems so the form can re-render with the entered values.
 */

/** Minimal, dependency-free validation for the client form. */
function validate(formData: FormData): {
	values: Record<string, string>;
	errors: Record<string, string>;
} {
	const values: Record<string, string> = {
		name: String(formData.get('name') ?? '').trim(),
		cvr: String(formData.get('cvr') ?? '').trim(),
		address: String(formData.get('address') ?? '').trim(),
		email: String(formData.get('email') ?? '').trim(),
		peppolId: String(formData.get('peppolId') ?? '').trim()
	};

	const errors: Record<string, string> = {};
	if (!values.name) errors.name = 'Navn er påkrævet';
	if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
		errors.email = 'Ugyldig e-mailadresse';
	}
	if (values.cvr && !/^\d{8}$/.test(values.cvr)) {
		errors.cvr = 'CVR skal være 8 cifre';
	}
	return { values, errors };
}

export const actions: Actions = {
	default: async (event) => {
		const user = event.locals.user;
		if (!user) {
			throw redirect(302, '/login/');
		}

		const databaseUrl = event.platform?.env?.DATABASE_URL;
		if (!databaseUrl) {
			throw error(500, 'Database ikke konfigureret');
		}

		const { values, errors } = validate(await event.request.formData());
		if (Object.keys(errors).length > 0) {
			return fail(400, { values, errors });
		}

		const db = getDb(databaseUrl);
		const business = await getBusinessByUserId(db, user.id);
		if (!business) {
			return fail(404, { values, errors: { form: 'Ingen virksomhed fundet for denne bruger' } });
		}

		try {
			await createClient(db, {
				businessId: business.id,
				name: values.name,
				cvr: values.cvr || undefined,
				address: values.address || undefined,
				email: values.email || undefined,
				peppolId: values.peppolId || undefined
			});
		} catch (err) {
			console.error('[kunder/ny] Kunne ikke oprette klient:', err);
			return fail(500, {
				values,
				errors: { form: 'Kunne ikke oprette klienten. Prøv igen.' }
			});
		}

		throw redirect(303, '/kunder/');
	}
};

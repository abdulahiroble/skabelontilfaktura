import type { Actions, PageServerLoad } from './$types';
import { redirect, error, fail } from '@sveltejs/kit';
import { getDb } from '$lib/server/db/client';
import {
	getClientForBusiness,
	updateClient,
	deleteClient,
	getBusinessByUserId
} from '$lib/server/queries';

/**
 * Edit-client route.
 *
 * - `load`: fetch the client, scoped to the user's business (404 if it belongs
 *   to another business or does not exist).
 * - `update` action: validate + patch.
 * - `delete` action: remove the client.
 */

/** Minimal, dependency-free validation shared with the create action. */
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

export const load: PageServerLoad = async (event) => {
	const user = event.locals.user;
	if (!user) {
		throw redirect(302, '/login/');
	}

	const databaseUrl = event.platform?.env?.DATABASE_URL;
	if (!databaseUrl) {
		throw error(500, 'Database ikke konfigureret');
	}

	const db = getDb(databaseUrl);

	try {
		const business = await getBusinessByUserId(db, user.id);
		if (!business) {
			throw error(404, 'Ingen virksomhed fundet for denne bruger');
		}

		const clientRow = await getClientForBusiness(db, event.params.id, business.id);
		if (!clientRow) {
			throw error(404, 'Klient ikke fundet');
		}

		return { client: clientRow };
	} catch (err) {
		if (typeof err === 'object' && err !== null && 'status' in err) {
			throw err;
		}
		console.error('[kunder/rediger load] Kunne ikke hente klient:', err);
		throw error(500, 'Kunne ikke hente klient');
	}
};

export const actions: Actions = {
	update: async (event) => {
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

		// Ensure the client belongs to this business before mutating.
		const existing = await getClientForBusiness(db, event.params.id, business.id);
		if (!existing) {
			throw error(404, 'Klient ikke fundet');
		}

		try {
			await updateClient(db, event.params.id, {
				name: values.name,
				cvr: values.cvr || undefined,
				address: values.address || undefined,
				email: values.email || undefined,
				peppolId: values.peppolId || undefined
			});
		} catch (err) {
			console.error('[kunder/rediger update] Kunne ikke opdatere klient:', err);
			return fail(500, {
				values,
				errors: { form: 'Kunne ikke gemme ændringerne. Prøv igen.' }
			});
		}

		throw redirect(303, '/kunder/');
	},

	delete: async (event) => {
		const user = event.locals.user;
		if (!user) {
			throw redirect(302, '/login/');
		}

		const databaseUrl = event.platform?.env?.DATABASE_URL;
		if (!databaseUrl) {
			throw error(500, 'Database ikke konfigureret');
		}

		const db = getDb(databaseUrl);
		const business = await getBusinessByUserId(db, user.id);
		if (!business) {
			throw error(404, 'Ingen virksomhed fundet for denne bruger');
		}

		const existing = await getClientForBusiness(db, event.params.id, business.id);
		if (!existing) {
			throw error(404, 'Klient ikke fundet');
		}

		try {
			await deleteClient(db, event.params.id);
		} catch (err) {
			console.error('[kunder/rediger delete] Kunne ikke slette klient:', err);
			return fail(500, { errors: { form: 'Kunne ikke slette klienten. Prøv igen.' } });
		}

		throw redirect(303, '/kunder/');
	}
};

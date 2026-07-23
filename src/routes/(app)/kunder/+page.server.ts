import type { PageServerLoad } from './$types';
import { redirect, error } from '@sveltejs/kit';
import { getDb } from '$lib/server/db/client';
import { getClients, getBusinessByUserId } from '$lib/server/queries';

/**
 * Load the authenticated user's clients.
 *
 * - 401 redirect to login when there is no session.
 * - 404 when the user has no business yet (Pro onboarding not complete).
 * - Fresh `getDb()` per request (porsager-on-Workers rule).
 */
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
			// No business row means Pro onboarding hasn't created one yet.
			throw error(404, 'Ingen virksomhed fundet for denne bruger');
		}

		const clients = await getClients(db, business.id);

		return { clients };
	} catch (err) {
		// Re-throw SvelteKit errors as-is so they render the right status page.
		if (typeof err === 'object' && err !== null && 'status' in err) {
			throw err;
		}
		console.error('[kunder load] Kunne ikke hente klienter:', err);
		throw error(500, 'Kunne ikke hente klienter');
	}
};

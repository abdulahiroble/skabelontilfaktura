import type { Handle } from '@sveltejs/kit';
import { getDb } from '$lib/server/db/client';
import { createAuth } from '$lib/server/auth';

/**
 * Per-request server hook.
 *
 * - Builds a fresh `getDb()` instance for every request (porsager connections
 *   cannot be reused across Workers request contexts).
 * - Validates the Better Auth session and populates `event.locals.user`.
 *
 * Session-validation error handling deliberately distinguishes a *confirmed
 * invalid* session (query succeeded, no match → `locals.user` stays `null`)
 * from a *transient* failure (DB query threw). On a transient failure we only
 * log and leave the cookie untouched so the user is not signed out by a
 * momentary database hiccup.
 */
export const handle: Handle = async ({ event, resolve }) => {
	// Default to no authenticated user for this request.
	event.locals.user = null;

	const env = event.platform?.env;
	if (!env?.DATABASE_URL) {
		return resolve(event);
	}

	const db = getDb(env.DATABASE_URL);
	const auth = createAuth(db, env);

	try {
		const session = await auth.api.getSession({ headers: event.request.headers });

		// `session` is `null` when there is no valid session (confirmed invalid).
		if (session) {
			event.locals.user = {
				id: session.user.id,
				email: session.user.email,
				name: session.user.name ?? undefined
			};
		}
	} catch (error) {
		// Transient error (e.g. DB unavailable): do NOT clear the session cookie.
		console.error('[hooks.server] Session validation failed:', error);
	}

	return resolve(event);
};

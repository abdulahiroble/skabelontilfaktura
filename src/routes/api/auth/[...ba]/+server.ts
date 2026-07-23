import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db/client';
import { createAuth } from '$lib/server/auth';

/**
 * Shared handler for all Better Auth API routes (`/api/auth/*`).
 *
 * A fresh Drizzle + Better Auth instance is built per request because the
 * porsager `postgres` connection cannot be reused across Workers request
 * contexts.
 */
async function handle(request: Request, platform: App.Platform | undefined): Promise<Response> {
	const databaseUrl = platform?.env?.DATABASE_URL;
	if (!databaseUrl) {
		return new Response('Database not configured', { status: 500 });
	}

	const db = getDb(databaseUrl);
	const auth = createAuth(db, platform.env);
	return auth.handler(request);
}

export const GET: RequestHandler = ({ request, platform }) => handle(request, platform);

export const POST: RequestHandler = ({ request, platform }) => handle(request, platform);

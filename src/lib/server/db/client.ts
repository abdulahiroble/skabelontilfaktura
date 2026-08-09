import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

/**
 * Create a per-request Drizzle + porsager `postgres` instance.
 *
 * IMPORTANT: On Cloudflare Workers, do NOT cache the pool at module level.
 * Reusing a connection created in a different request context throws
 * "Cannot perform I/O on behalf of a different request". Always call
 * `getDb()` inside the request handler (e.g. in `hooks.server.ts` or a
 * `+server.ts`/`+page.server.ts` load/action) using the platform env.
 *
 * Options rationale:
 * - `ssl: 'require'` — enforce TLS to the Postgres host.
 * - `prepare: false` — prepared statements are not supported in the Workers runtime.
 * - `max: 1` — single connection per request.
 * - `idle_timeout: 5` — close idle connections quickly.
 */
export function getDb(databaseUrl: string) {
	const client = postgres(databaseUrl, {
		ssl: 'require',
		prepare: false,
		max: 1,
		idle_timeout: 5,
		// Fail fast instead of hanging the request if the DB is unreachable
		// (a Workers request is otherwise canceled after ~15s with no error).
		connect_timeout: 10
	});
	return drizzle(client, { schema });
}

export type Database = ReturnType<typeof getDb>;
export type DatabaseTransaction = Parameters<Parameters<Database['transaction']>[0]>[0];

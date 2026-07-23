import { defineConfig } from 'drizzle-kit';

/**
 * Drizzle Kit configuration.
 *
 * `dbCredentials.url` is read from the `DATABASE_URL` env var. It is only
 * required for `drizzle-kit push`, `migrate`, and the Studio introspection
 * flows. `drizzle-kit generate` works without a live connection.
 */
export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	out: './drizzle',
	dialect: 'postgresql',
	dbCredentials: {
		url: process.env.DATABASE_URL ?? ''
	},
	verbose: true,
	strict: true
});

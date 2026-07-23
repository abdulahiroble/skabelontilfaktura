import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import type { Database } from '$lib/server/db/client';

/**
 * Stub email sender reserved for the Cloudflare Email Service.
 *
 * CF Email Service requires the Workers Paid plan, so this is a no-op stub
 * for now. Once the plan is enabled, replace the `console.log` with a call to
 * the Workers Email binding (e.g. `env.EMAIL.send({ ... })`) to deliver magic
 * link / verification emails.
 *
 * @param param0.email - recipient email address
 * @param param0.url   - magic link / verification URL to deliver
 */
export async function sendEmail({ email, url }: { email: string; url: string }) {
	// TODO: wire to Cloudflare Email Service once on the Workers Paid plan.
	console.log(`[auth email stub] To: ${email} — Magic link: ${url}`);
}

/**
 * Build a per-request Better Auth instance backed by the Drizzle adapter.
 *
 * The Drizzle schema (`user`, `session`, `account`, `verification`) already
 * defines the exact table and field names Better Auth expects by default, so
 * no manual schema mapping is required. The `db` instance carries its schema
 * via `db._.fullSchema`, which the adapter auto-detects.
 *
 * @param db  - per-request Drizzle instance (see `getDb`)
 * @param env - Cloudflare Worker environment bindings
 */
export function createAuth(db: Database, env: Env) {
	return betterAuth({
		database: drizzleAdapter(db, {
			provider: 'pg'
		}),
		baseURL: env.PUBLIC_APP_URL || 'http://localhost:5173',
		secret: env.BETTER_AUTH_SECRET,
		basePath: '/api/auth',
		emailAndPassword: {
			enabled: true
		},
		emailVerification: {
			sendVerificationEmail: async ({ user, url }) => {
				await sendEmail({ email: user.email, url });
			}
		}
		// socialProviders: {} — add Google OAuth once credentials are available.
	});
}

export type Auth = ReturnType<typeof createAuth>;

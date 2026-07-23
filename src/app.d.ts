import type { Database } from '$lib/server/db/client';

declare global {
	namespace App {
		interface Platform {
			env: Env;
			ctx: ExecutionContext;
			caches: CacheStorage;
			cf?: IncomingRequestCfProperties;
		}

		interface Locals {
			db?: Database;
			user: { id: string; email: string; name?: string } | null;
		}
	}

	/**
	 * Application environment bindings.
	 *
	 * `ASSETS` (static assets) comes from the Wrangler-generated
	 * `worker-configuration.d.ts` via declaration merging. `INVOICES_BUCKET`
	 * (Cloudflare R2 bucket for invoice PDFs and logos, bound in
	 * `wrangler.jsonc`) is declared here explicitly so the app type-checks even
	 * before wrangler types are regenerated; the global `R2Bucket` type itself
	 * comes from `worker-configuration.d.ts`.
	 *
	 * These secrets/vars are declared here so the app type-checks before the
	 * Cloudflare bindings are created. In production set them with
	 * `wrangler secret put` (DATABASE_URL, BETTER_AUTH_SECRET) and `vars`
	 * (PUBLIC_APP_URL); locally put them in `.dev.vars`.
	 */
	interface Env {
		DATABASE_URL: string;
		BETTER_AUTH_SECRET: string;
		PUBLIC_APP_URL?: string;
		INVOICES_BUCKET: R2Bucket;
	}

	/**
	 * Plausible Analytics (self-hosted, cookieless) custom-event API.
	 *
	 * The script is injected via `plausibleScriptTag()` in
	 * `src/lib/analytics/plausible.ts`. `window.plausible` is only available
	 * in the browser, so it is declared optional.
	 */
	interface Window {
		plausible?: (
			event: string,
			options?: {
				props?: Record<string, string>;
				revenue?: number;
				callback?: () => void;
			}
		) => void;
	}
}

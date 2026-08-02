/**
 * Augments the wrangler-generated global `Env` interface
 * (see `worker-configuration.d.ts`) with Cloudflare Worker secrets that are
 * set via `wrangler secret put` and therefore not captured by `wrangler types`.
 *
 * Keep this in sync with `.env.example`.
 */
declare global {
	interface Env {
		/** GA4 measurement ID, exposed to the browser. */
		PUBLIC_GA_MEASUREMENT_ID?: string;
		/** Autumn (useautumn.com) secret API key. */
		AUTUMN_SECRET_KEY: string;
		/** Optional: Svix webhook signing secret for /api/autumn/webhook. */
		AUTUMN_WEBHOOK_SECRET?: string;
		/** Secret token required to invoke the /api/jobs/reminders cron route. */
		CRON_SECRET: string;
		/** Maileroo API key for transactional email delivery. */
		MAILEROO_API_KEY: string;
		/** "From" address for outgoing transactional email (payment reminders). */
		EMAIL_FROM?: string;
	}
}

export {};

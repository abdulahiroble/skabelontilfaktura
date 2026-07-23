/**
 * GET /api/jobs/reminders
 *
 * Cron-driven payment reminder job. Triggered daily at 09:00 UTC by the
 * Cloudflare Workers Cron trigger declared in `wrangler.jsonc`. It can also be
 * invoked manually by hitting this URL with the correct `CRON_SECRET` token.
 *
 * Authorization: the request MUST supply `?token=<CRON_SECRET>` matching the
 * `CRON_SECRET` env var. Without it the endpoint responds 401. This keeps the
 * route from being abused when the worker URL is publicly reachable.
 *
 * Idempotency: each reminder stage is only sent once per invoice — see
 * `sendReminderIfDue` in `$lib/server/reminders/scheduler.ts`, which checks
 * `reminderLog` before sending. Re-running the job on the same day is safe.
 */
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db/client';
import { findOverdueInvoices, sendReminderIfDue } from '$lib/server/reminders/scheduler';

export const GET: RequestHandler = async ({ platform, url }) => {
	// Authorization — constant-time-ish comparison would be ideal, but the token
	// is a static secret, not user-supplied sensitive input.
	const token = url.searchParams.get('token');
	if (!platform?.env?.CRON_SECRET || token !== platform.env.CRON_SECRET) {
		return new Response('Unauthorized', { status: 401 });
	}

	if (!platform.env.DATABASE_URL) {
		return new Response('DB not configured', { status: 500 });
	}

	const db = getDb(platform.env.DATABASE_URL);
	const overdue = await findOverdueInvoices(db);

	let sent = 0;
	for (const inv of overdue) {
		const wasSent = await sendReminderIfDue(db, inv.id, 'first', platform.env);
		if (wasSent) sent++;
	}

	return new Response(JSON.stringify({ checked: overdue.length, sent }), {
		headers: { 'Content-Type': 'application/json' }
	});
};

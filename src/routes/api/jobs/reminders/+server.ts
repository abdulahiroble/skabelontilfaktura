/**
 * GET /api/jobs/reminders
 *
 * Optional payment reminder batch job. It can be invoked by an external
 * scheduler with the correct `CRON_SECRET` token. The customer-facing workflow
 * also supports one-click reminders directly from an invoice.
 *
 * Authorization: the request MUST supply `Authorization: Bearer <CRON_SECRET>`
 * (or the legacy `?token=` query parameter) matching the configured secret.
 *
 * Idempotency: each reminder stage is only sent once per invoice — see
 * `sendReminderIfDue` in `$lib/server/reminders/scheduler.ts`, which checks
 * `reminderLog` before sending. Re-running the job on the same day is safe.
 */
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db/client';
import { getEntitlements, hasFeature } from '$lib/server/entitlements';
import {
	findOverdueInvoices,
	getNextReminderTemplate,
	sendReminderIfDue
} from '$lib/server/reminders/scheduler';

export const GET: RequestHandler = async ({ platform, request, url }) => {
	// Authorization — constant-time-ish comparison would be ideal, but the token
	// is a static secret, not user-supplied sensitive input.
	const authorization = request.headers.get('authorization');
	const token = authorization?.startsWith('Bearer ')
		? authorization.slice('Bearer '.length)
		: url.searchParams.get('token');
	if (!platform?.env?.CRON_SECRET || token !== platform.env.CRON_SECRET) {
		return new Response('Unauthorized', { status: 401 });
	}

	if (!platform.env.DATABASE_URL) {
		return new Response('DB not configured', { status: 500 });
	}

	const db = getDb(platform.env.DATABASE_URL);
	const overdue = await findOverdueInvoices(db);
	const entitlementCache = new Map<string, Awaited<ReturnType<typeof getEntitlements>>>();

	let sent = 0;
	for (const inv of overdue) {
		let entitlements = entitlementCache.get(inv.userId);
		if (!entitlements) {
			entitlements = await getEntitlements(db, inv.userId);
			entitlementCache.set(inv.userId, entitlements);
		}
		if (!hasFeature(entitlements, 'reminder_emails')) continue;

		const template = await getNextReminderTemplate(db, inv.id, inv.dueAt);
		if (!template) continue;
		const wasSent = await sendReminderIfDue(db, inv.id, template, platform.env);
		if (wasSent) sent++;
	}

	return new Response(JSON.stringify({ checked: overdue.length, sent }), {
		headers: { 'Content-Type': 'application/json' }
	});
};

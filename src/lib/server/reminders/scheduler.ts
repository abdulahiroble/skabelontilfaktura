/**
 * Payment reminder scheduling logic.
 *
 * Pure data/IO layer invoked by the cron route
 * (`src/routes/api/jobs/reminders/+server.ts`). All DB access uses a per-request
 * `getDb()` instance passed in by the caller — no module-level connection state.
 *
 * Reminder sending is **idempotent**: before sending we check `reminderLog` for
 * the same `(invoiceId, template)` pair and skip if a row already exists.
 */
import { and, asc, eq, lt, sql } from 'drizzle-orm';

import type { Database } from '$lib/server/db/client';
import { business, client, invoice, reminderLog } from '$lib/server/db/schema';
import { sendEmail } from '$lib/server/email/client';
import {
	reminderTemplate,
	type ReminderLanguage,
	type ReminderTemplateName
} from '$lib/server/email/templates';

/**
 * Default "from" address if `EMAIL_FROM` is not configured. Override in
 * production via the `EMAIL_FROM` env var.
 */
const DEFAULT_EMAIL_FROM = 'noreply@skabelontilfaktura.dk';

/** Default reminder language (Danish), since the invoice table has no locale. */
const DEFAULT_LANGUAGE: ReminderLanguage = 'da';

/**
 * Return a bounded batch of invoices that are `sent` (not yet paid/voided)
 * and past their due date. These are candidates for reminder escalation.
 */
export async function findOverdueInvoices(db: Database) {
	const now = new Date();
	return db
		.select({
			id: invoice.id,
			dueAt: invoice.dueAt,
			userId: business.userId
		})
		.from(invoice)
		.innerJoin(business, eq(invoice.businessId, business.id))
		.where(and(eq(invoice.status, 'sent'), lt(invoice.dueAt, now)))
		.limit(100);
}

const FIRST_REMINDER_DELAY_DAYS = 3;
const ESCALATION_INTERVAL_DAYS = 10;
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Select the next legal escalation stage. The first polite reminder waits
 * three days after the due date; later reminders wait at least ten days after
 * the preceding message. This prevents a long-overdue invoice from receiving
 * all three stages on consecutive cron runs.
 */
export async function getNextReminderTemplate(
	db: Database,
	invoiceId: string,
	dueAt: Date | null,
	now = new Date()
): Promise<ReminderTemplateName | null> {
	if (!dueAt || now.getTime() - dueAt.getTime() < FIRST_REMINDER_DELAY_DAYS * DAY_MS) {
		return null;
	}

	const logs = await db
		.select({ template: reminderLog.template, sentAt: reminderLog.sentAt })
		.from(reminderLog)
		.where(eq(reminderLog.invoiceId, invoiceId))
		.orderBy(asc(reminderLog.sentAt));

	const first = logs.find((entry) => entry.template === 'first');
	if (!first) return 'first';

	const second = logs.find((entry) => entry.template === 'second');
	if (!second) {
		return now.getTime() - first.sentAt.getTime() >= ESCALATION_INTERVAL_DAYS * DAY_MS
			? 'second'
			: null;
	}

	const final = logs.find((entry) => entry.template === 'final');
	if (final) return null;
	return now.getTime() - second.sentAt.getTime() >= ESCALATION_INTERVAL_DAYS * DAY_MS
		? 'final'
		: null;
}

/** Formats a `Date`-mode column as a YYYY-MM-DD string, or '' when null. */
function formatDate(value: Date | null | undefined): string {
	if (!value) return '';
	return value.toISOString().slice(0, 10);
}

/**
 * Send a reminder for a single invoice if it has not already been sent.
 *
 * Steps:
 *  1. Idempotency check against `reminderLog`.
 *  2. Load invoice + joined client + business.
 *  3. Skip silently if the client has no email address.
 *  4. Render the template, send the email, and on success insert a `reminderLog`
 *     row so the same reminder is never sent twice.
 *
 * @returns `true` if a reminder was sent, `false` if it was skipped.
 */
export async function sendReminderIfDue(
	db: Database,
	invoiceId: string,
	template: ReminderTemplateName,
	env?: Env
): Promise<boolean> {
	return db.transaction(async (tx) => {
		// Serialize this invoice+stage across Worker instances without writing a
		// false delivery record before the email provider has accepted the send.
		await tx.execute(
			sql`select pg_advisory_xact_lock(hashtext(${invoiceId}), hashtext(${template}))`
		);

		const existing = await tx
			.select({ id: reminderLog.id })
			.from(reminderLog)
			.where(and(eq(reminderLog.invoiceId, invoiceId), eq(reminderLog.template, template)))
			.limit(1);
		if (existing[0]) return false;

		const rows = await tx
			.select({
				invoice: invoice,
				client: client,
				business: business
			})
			.from(invoice)
			.leftJoin(client, eq(invoice.clientId, client.id))
			.innerJoin(business, eq(invoice.businessId, business.id))
			.where(eq(invoice.id, invoiceId))
			.limit(1);

		const row = rows[0];
		if (
			!row ||
			row.invoice.status !== 'sent' ||
			!row.invoice.dueAt ||
			row.invoice.dueAt >= new Date()
		) {
			return false;
		}

		const to = row.client?.email ?? row.invoice.buyerEmail;
		if (!to) return false;

		const { subject, html, text } = reminderTemplate(template, {
			invoiceNumber: row.invoice.invoiceNumber,
			clientName: row.client?.name ?? row.invoice.buyerName ?? '',
			amount: `${row.invoice.total ?? '0'} ${row.invoice.currency}`,
			dueDate: formatDate(row.invoice.dueAt),
			businessName: row.business.name,
			language: DEFAULT_LANGUAGE
		});

		const from = env?.EMAIL_FROM ?? DEFAULT_EMAIL_FROM;
		try {
			const accepted = await sendEmail({ to, from, subject, html, text }, env);
			if (!accepted) return false;
		} catch (error) {
			console.error('[reminders] Email send failed', {
				invoiceId: row.invoice.id,
				template,
				error
			});
			return false;
		}

		await tx.insert(reminderLog).values({ invoiceId: row.invoice.id, template });
		return true;
	});
}

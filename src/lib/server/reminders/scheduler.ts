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
import { and, eq, lt } from 'drizzle-orm';

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
 * Return all invoices that are `sent` (not yet paid/voided) and past their
 * due date. These are candidates for reminder escalation.
 */
export async function findOverdueInvoices(db: Database) {
	const now = new Date();
	return db
		.select()
		.from(invoice)
		.where(and(eq(invoice.status, 'sent'), lt(invoice.dueAt, now)));
}

/**
 * Returns `true` if a reminder of the given `template` has already been logged
 * for `invoiceId`. Used to keep the send loop idempotent.
 */
export async function hasReminderBeenSent(
	db: Database,
	invoiceId: string,
	template: string
): Promise<boolean> {
	const result = await db
		.select({ id: reminderLog.id })
		.from(reminderLog)
		.where(and(eq(reminderLog.invoiceId, invoiceId), eq(reminderLog.template, template)))
		.limit(1);
	return result.length > 0;
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
	// 1. Idempotency — never double-send the same reminder stage.
	if (await hasReminderBeenSent(db, invoiceId, template)) {
		return false;
	}

	// 2. Load invoice with its client and business.
	const rows = await db
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
	if (!row) {
		return false;
	}

	// 3. Without a client email there is nowhere to send.
	const to = row.client?.email;
	if (!to) {
		return false;
	}

	// 4. Render + send + log.
	const { subject, html, text } = reminderTemplate(template, {
		invoiceNumber: row.invoice.invoiceNumber,
		clientName: row.client?.name ?? '',
		amount: `${row.invoice.total ?? '0'} ${row.invoice.currency}`,
		dueDate: formatDate(row.invoice.dueAt),
		businessName: row.business.name,
		language: DEFAULT_LANGUAGE
	});

	const from = env?.EMAIL_FROM ?? DEFAULT_EMAIL_FROM;
	const accepted = await sendEmail({ to, from, subject, html, text }, env);
	if (!accepted) {
		return false;
	}

	await db.insert(reminderLog).values({
		invoiceId: row.invoice.id,
		template
	});

	return true;
}

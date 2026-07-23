/**
 * Email sending abstraction.
 *
 * This is the single integration point for outbound transactional email. The
 * production target is the Cloudflare Email Service (`send_email` Worker
 * binding / Mail API), which requires a Workers Paid plan. Until that is
 * activated this module is a stub that logs to the console so the reminder
 * automation can be developed and tested end-to-end.
 *
 * When wiring up the real provider, replace the body of `sendEmail` with a
 * call that resolves the `send_email` binding from `env` (or posts to the Mail
 * API) and returns `true` on success / `false` on failure. The `EmailParams`
 * contract and the call sites in `reminders/scheduler.ts` should not change.
 */

export interface EmailParams {
	/** Recipient email address. */
	to: string;
	/** Sender email address (typically from `EMAIL_FROM`). */
	from: string;
	/** Email subject line. */
	subject: string;
	/** HTML body. */
	html: string;
	/** Optional plain-text body (good deliverability practice). */
	text?: string;
}

/**
 * Send a transactional email.
 *
 * @param params Message contents and recipients.
 * @param env    Optional Cloudflare env bindings — used once the real provider
 *               is wired up to resolve the `send_email` binding.
 * @returns `true` if the message was accepted for delivery, `false` otherwise.
 *
 * TODO: Wire to Cloudflare Email Service when Workers Paid is active.
 */
export async function sendEmail(params: EmailParams, env?: Env): Promise<boolean> {
	// Binding will be resolved from `env` once the real provider is wired up.
	void env;

	// Stub: log for local development.
	console.log('[EMAIL]', {
		to: params.to,
		from: params.from,
		subject: params.subject
	});

	return true;
}

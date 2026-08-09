/**
 * Payment reminder ("rykker") email templates.
 *
 * Three escalation stages are supported, each rendered in Danish (default) and
 * English. Every template function returns `{ subject, html, text }` so the
 * caller can pass them straight to `sendEmail`.
 *
 * The Danish copy follows the tone expected by Danish SMB invoicing:
 *  - `first`:  polite nudge
 *  - `second`: firmer, mentions a reminder fee (rykkergebyr)
 *  - `final`:  urgent, mentions debt collection (inkasso)
 */

export type ReminderLanguage = 'da' | 'en';

/** Template names that can be persisted to `reminderLog.template`. */
export type ReminderTemplateName = 'first' | 'second' | 'final';

export interface ReminderTemplateInput {
	invoiceNumber: string;
	clientName: string;
	/** Pre-formatted amount string, e.g. "1.250,00 DKK". */
	amount: string;
	/** ISO date string (YYYY-MM-DD) the invoice was due. */
	dueDate: string;
	businessName: string;
	language: ReminderLanguage;
}

export interface ReminderTemplateOutput {
	subject: string;
	html: string;
	text: string;
}

function escapeHtml(value: string): string {
	return value.replace(
		/[&<>"']/g,
		(character) =>
			(
				({
					'&': '&amp;',
					'<': '&lt;',
					'>': '&gt;',
					'"': '&quot;',
					"'": '&#39;'
				}) as Record<string, string>
			)[character]
	);
}

function paragraphsToText(paragraphs: string[]): string {
	return paragraphs
		.map((paragraph) =>
			paragraph
				.replace(/<\/?strong>/g, '')
				.replace(/&lt;/g, '<')
				.replace(/&gt;/g, '>')
				.replace(/&quot;/g, '"')
				.replace(/&#39;/g, "'")
				.replace(/&amp;/g, '&')
		)
		.join('\n\n');
}

/**
 * Minimal inline-styled HTML wrapper. Kept dependency-free and consistent
 * across templates so reminders render well in webmail + Outlook.
 */
function wrapHtml(heading: string, paragraphs: string[], signatureBusiness: string): string {
	const body = paragraphs.map((p) => `      <p style="margin:0 0 12px;">${p}</p>`).join('\n');
	return `<!DOCTYPE html>
<html lang="en">
  <body style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#111827;font-size:15px;line-height:1.6;max-width:560px;margin:0 auto;padding:24px;">
    <h2 style="margin:0 0 16px;font-size:18px;">${heading}</h2>
${body}
    <p style="margin:24px 0 0;color:#6b7280;font-size:14px;">
      Venlig hilsen / Kind regards,<br />
      <strong>${escapeHtml(signatureBusiness)}</strong>
    </p>
  </body>
</html>`;
}

/**
 * 1st reminder — polite nudge. "Vi har endnu ikke modtaget betaling..."
 */
export function firstReminderTemplate(opts: ReminderTemplateInput): ReminderTemplateOutput {
	const { invoiceNumber, clientName, amount, dueDate, businessName, language } = opts;
	const safeClientName = escapeHtml(clientName || (language === 'en' ? 'customer' : 'kunde'));
	const safeInvoiceNumber = escapeHtml(invoiceNumber);
	const safeAmount = escapeHtml(amount);
	const safeDueDate = escapeHtml(dueDate);

	if (language === 'en') {
		const subject = `Payment reminder — invoice ${invoiceNumber}`;
		const paragraphs = [
			`Dear ${safeClientName},`,
			`We have not yet received payment for invoice <strong>${safeInvoiceNumber}</strong> in the amount of <strong>${safeAmount}</strong>, which was due on <strong>${safeDueDate}</strong>.`,
			`If you have already paid, please disregard this reminder. Otherwise, we kindly ask you to settle the invoice as soon as possible.`
		];
		const text = paragraphsToText(paragraphs);
		return { subject, html: wrapHtml(subject, paragraphs, businessName), text };
	}

	const subject = `Betalingspåmindelse — faktura ${invoiceNumber}`;
	const paragraphs = [
		`Kære ${safeClientName},`,
		`Vi har endnu ikke modtaget betaling for faktura <strong>${safeInvoiceNumber}</strong> på <strong>${safeAmount}</strong>, som havde forfaldsdato <strong>${safeDueDate}</strong>.`,
		`Hvis du allerede har betalt, kan du se bort fra denne påmindelse. Ellers vil vi bede dig betale fakturaen hurtigst muligt.`
	];
	const text = paragraphsToText(paragraphs);
	return { subject, html: wrapHtml(subject, paragraphs, businessName), text };
}

/**
 * 2nd reminder — firmer, mentions a reminder fee (rykkergebyr).
 */
export function secondReminderTemplate(opts: ReminderTemplateInput): ReminderTemplateOutput {
	const { invoiceNumber, clientName, amount, dueDate, businessName, language } = opts;
	const safeClientName = escapeHtml(clientName || (language === 'en' ? 'customer' : 'kunde'));
	const safeInvoiceNumber = escapeHtml(invoiceNumber);
	const safeAmount = escapeHtml(amount);
	const safeDueDate = escapeHtml(dueDate);

	if (language === 'en') {
		const subject = `Second reminder — invoice ${invoiceNumber}`;
		const paragraphs = [
			`Dear ${safeClientName},`,
			`The invoice <strong>${safeInvoiceNumber}</strong> for <strong>${safeAmount}</strong> (due ${safeDueDate}) is still unpaid despite our previous reminder.`,
			`Please settle the amount promptly. In accordance with our terms, a reminder fee may be added to outstanding balances that remain unpaid.`
		];
		const text = paragraphsToText(paragraphs);
		return { subject, html: wrapHtml(subject, paragraphs, businessName), text };
	}

	const subject = `2. rykker — faktura ${invoiceNumber}`;
	const paragraphs = [
		`Kære ${safeClientName},`,
		`Faktura <strong>${safeInvoiceNumber}</strong> på <strong>${safeAmount}</strong> (forfald ${safeDueDate}) er stadig ubetalt på trods af vores forrige påmindelse.`,
		`Vi beder dig betale beløbet hurtigst muligt. I henhold til vores betingelser kan der pålægges et rykkergebyr for restancer, der forbliver ubetalte.`
	];
	const text = paragraphsToText(paragraphs);
	return { subject, html: wrapHtml(subject, paragraphs, businessName), text };
}

/**
 * Final notice — urgent, mentions debt collection (inkasso).
 */
export function finalNoticeTemplate(opts: ReminderTemplateInput): ReminderTemplateOutput {
	const { invoiceNumber, clientName, amount, dueDate, businessName, language } = opts;
	const safeClientName = escapeHtml(clientName || (language === 'en' ? 'customer' : 'kunde'));
	const safeInvoiceNumber = escapeHtml(invoiceNumber);
	const safeAmount = escapeHtml(amount);
	const safeDueDate = escapeHtml(dueDate);

	if (language === 'en') {
		const subject = `Final notice before debt collection — invoice ${invoiceNumber}`;
		const paragraphs = [
			`Dear ${safeClientName},`,
			`This is our final notice regarding invoice <strong>${safeInvoiceNumber}</strong> for <strong>${safeAmount}</strong> (due ${safeDueDate}), which remains unpaid.`,
			`If the amount is not received within 10 days, the case may be handed over to debt collection, which may incur additional fees and interest.`
		];
		const text = paragraphsToText(paragraphs);
		return { subject, html: wrapHtml(subject, paragraphs, businessName), text };
	}

	const subject = `Inkassovarsel — faktura ${invoiceNumber}`;
	const paragraphs = [
		`Kære ${safeClientName},`,
		`Dette er vores sidste indkaldelse vedrørende faktura <strong>${safeInvoiceNumber}</strong> på <strong>${safeAmount}</strong> (forfald ${safeDueDate}), som fortsat er ubetalt.`,
		`Hvis beløbet ikke modtages inden 10 dage, kan sagen blive overdraget til inkasso, hvilket kan medføre yderligere gebyrer og renter.`
	];
	const text = paragraphsToText(paragraphs);
	return { subject, html: wrapHtml(subject, paragraphs, businessName), text };
}

/**
 * Dispatch helper — select a template by name.
 */
export function reminderTemplate(
	name: ReminderTemplateName,
	opts: ReminderTemplateInput
): ReminderTemplateOutput {
	switch (name) {
		case 'first':
			return firstReminderTemplate(opts);
		case 'second':
			return secondReminderTemplate(opts);
		case 'final':
			return finalNoticeTemplate(opts);
	}
}

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
      <strong>${signatureBusiness}</strong>
    </p>
  </body>
</html>`;
}

/**
 * 1st reminder — polite nudge. "Vi har endnu ikke modtaget betaling..."
 */
export function firstReminderTemplate(opts: ReminderTemplateInput): ReminderTemplateOutput {
	const { invoiceNumber, clientName, amount, dueDate, businessName, language } = opts;

	if (language === 'en') {
		const subject = `Payment reminder — invoice ${invoiceNumber}`;
		const paragraphs = [
			`Dear ${clientName || 'customer'},`,
			`We have not yet received payment for invoice <strong>${invoiceNumber}</strong> in the amount of <strong>${amount}</strong>, which was due on <strong>${dueDate}</strong>.`,
			`If you have already paid, please disregard this reminder. Otherwise, we kindly ask you to settle the invoice as soon as possible.`
		];
		const text = paragraphs.map((p) => p.replace(/<\/?strong>/g, '')).join('\n\n');
		return { subject, html: wrapHtml(subject, paragraphs, businessName), text };
	}

	const subject = `Betalingspåmindelse — faktura ${invoiceNumber}`;
	const paragraphs = [
		`Kære ${clientName || 'kunde'},`,
		`Vi har endnu ikke modtaget betaling for faktura <strong>${invoiceNumber}</strong> på <strong>${amount}</strong>, som havde forfaldsdato <strong>${dueDate}</strong>.`,
		`Hvis du allerede har betalt, kan du se bort fra denne påmindelse. Ellers vil vi bede dig betale fakturaen hurtigst muligt.`
	];
	const text = paragraphs.map((p) => p.replace(/<\/?strong>/g, '')).join('\n\n');
	return { subject, html: wrapHtml(subject, paragraphs, businessName), text };
}

/**
 * 2nd reminder — firmer, mentions a reminder fee (rykkergebyr).
 */
export function secondReminderTemplate(opts: ReminderTemplateInput): ReminderTemplateOutput {
	const { invoiceNumber, clientName, amount, dueDate, businessName, language } = opts;

	if (language === 'en') {
		const subject = `Second reminder — invoice ${invoiceNumber}`;
		const paragraphs = [
			`Dear ${clientName || 'customer'},`,
			`The invoice <strong>${invoiceNumber}</strong> for <strong>${amount}</strong> (due ${dueDate}) is still unpaid despite our previous reminder.`,
			`Please settle the amount promptly. In accordance with our terms, a reminder fee may be added to outstanding balances that remain unpaid.`
		];
		const text = paragraphs.map((p) => p.replace(/<\/?strong>/g, '')).join('\n\n');
		return { subject, html: wrapHtml(subject, paragraphs, businessName), text };
	}

	const subject = `2. rykker — faktura ${invoiceNumber}`;
	const paragraphs = [
		`Kære ${clientName || 'kunde'},`,
		`Faktura <strong>${invoiceNumber}</strong> på <strong>${amount}</strong> (forfald ${dueDate}) er stadig ubetalt på trods af vores forrige påmindelse.`,
		`Vi beder dig betale beløbet hurtigst muligt. I henhold til vores betingelser kan der pålægges et rykkergebyr for restancer, der forbliver ubetalte.`
	];
	const text = paragraphs.map((p) => p.replace(/<\/?strong>/g, '')).join('\n\n');
	return { subject, html: wrapHtml(subject, paragraphs, businessName), text };
}

/**
 * Final notice — urgent, mentions debt collection (inkasso).
 */
export function finalNoticeTemplate(opts: ReminderTemplateInput): ReminderTemplateOutput {
	const { invoiceNumber, clientName, amount, dueDate, businessName, language } = opts;

	if (language === 'en') {
		const subject = `Final notice before debt collection — invoice ${invoiceNumber}`;
		const paragraphs = [
			`Dear ${clientName || 'customer'},`,
			`This is our final notice regarding invoice <strong>${invoiceNumber}</strong> for <strong>${amount}</strong> (due ${dueDate}), which remains unpaid.`,
			`If the amount is not received within 7 days, the case will be handed over to debt collection, which may incur additional fees and interest.`
		];
		const text = paragraphs.map((p) => p.replace(/<\/?strong>/g, '')).join('\n\n');
		return { subject, html: wrapHtml(subject, paragraphs, businessName), text };
	}

	const subject = `Sidste indkaldelse før inkasso — faktura ${invoiceNumber}`;
	const paragraphs = [
		`Kære ${clientName || 'kunde'},`,
		`Dette er vores sidste indkaldelse vedrørende faktura <strong>${invoiceNumber}</strong> på <strong>${amount}</strong> (forfald ${dueDate}), som fortsat er ubetalt.`,
		`Hvis beløbet ikke modtages inden 7 dage, vil sagen blive overdraget til inkasso, hvilket kan medføre yderligere gebyrer og renter.`
	];
	const text = paragraphs.map((p) => p.replace(/<\/?strong>/g, '')).join('\n\n');
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

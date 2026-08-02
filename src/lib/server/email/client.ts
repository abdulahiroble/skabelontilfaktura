const MAILEROO_SEND_URL = 'https://smtp.maileroo.com/api/v2/emails';

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

export async function sendEmail(params: EmailParams, env?: Env): Promise<boolean> {
	const apiKey = env?.MAILEROO_API_KEY;
	if (!apiKey) {
		console.error('[email] MAILEROO_API_KEY is not configured');
		return false;
	}

	try {
		const response = await fetch(MAILEROO_SEND_URL, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${apiKey}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				from: { address: params.from, display_name: 'skabelontilfaktura.dk' },
				to: [{ address: params.to }],
				subject: params.subject,
				html: params.html,
				plain: params.text ?? '',
				tracking: false
			})
		});

		if (!response.ok) {
			console.error('[email] Maileroo rejected message', {
				status: response.status,
				statusText: response.statusText
			});
			return false;
		}

		const result = (await response.json()) as { success?: boolean };
		return result.success === true;
	} catch (error) {
		console.error('[email] Maileroo request failed', error);
		return false;
	}
}

import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import type { Database } from '$lib/server/db/client';
import { sendEmail } from '$lib/server/email/client';

function escapeHtml(value: string) {
	return value.replace(
		/[&<>"']/g,
		(c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!
	);
}

async function deliverAuthLink(env: Env, email: string, url: string, reset: boolean) {
	// Do not log URLs/tokens or recipient PII, including on provider failure.
	const subject = reset ? 'Nulstil din adgangskode' : 'Bekræft din e-mailadresse';
	const sent = await sendEmail(
		{
			to: email,
			from: env.EMAIL_FROM || 'noreply@skabelontilfaktura.dk',
			subject,
			html: `<p>${subject} til skabelontilfaktura.dk:</p><p><a href="${escapeHtml(url)}">${subject}</a></p><p>Har du ikke bedt om dette, kan du ignorere denne e-mail.</p>`,
			text: `${subject} til skabelontilfaktura.dk:\n${url}\n\nHar du ikke bedt om dette, kan du ignorere e-mailen.`
		},
		env
	);
	if (!sent) throw new Error('Authentication email delivery unavailable');
}

/** Per-request instance; provider callbacks are awaited, never detached. */
export function createAuth(db: Database, env: Env) {
	return betterAuth({
		database: drizzleAdapter(db, { provider: 'pg' }),
		baseURL: env.PUBLIC_APP_URL || 'http://localhost:5173',
		secret: env.BETTER_AUTH_SECRET,
		basePath: '/api/auth',
		logger: { disabled: true },
		rateLimit: {
			enabled: true,
			customRules: {
				'/request-password-reset': { window: 60, max: 3 },
				'/reset-password': { window: 60, max: 5 },
				'/send-verification-email': { window: 60, max: 3 }
			}
		},
		emailAndPassword: {
			enabled: true,
			revokeSessionsOnPasswordReset: true,
			sendResetPassword: async ({ user, url }) => deliverAuthLink(env, user.email, url, true)
		},
		emailVerification: {
			// Preserve existing signup behavior; recovery is sent only on request.
			sendOnSignUp: false,
			sendVerificationEmail: async ({ user, url }) => deliverAuthLink(env, user.email, url, false)
		}
	});
}

export type Auth = ReturnType<typeof createAuth>;

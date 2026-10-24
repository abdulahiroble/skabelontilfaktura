/** Closed-public, short-lived operator capability; never exposed to the client bundle. */
export async function authorizeLivePreflight(
	env: Env,
	email: string,
	presented: string | null,
	now = Date.now()
) {
	if (
		env.KIT_PREFLIGHT_ENABLED !== 'true' ||
		env.KIT_CHECKOUT_ENABLED === 'true' ||
		env.PUBLIC_APP_URL !== 'https://skabelontilfaktura.dk' ||
		!env.AUTUMN_SECRET_KEY?.startsWith('am_sk_live_') ||
		env.KIT_VAT_RATE_ID !== 'txr_1UTp9G73kDsvqEWHqIpPEtOr' ||
		!/^faktura-live-preflight-[a-f0-9-]{36}@example\.test$/.test(email.toLowerCase()) ||
		!/^[a-f0-9]{64}$/.test(env.KIT_PREFLIGHT_SECRET ?? '') ||
		!/^[a-f0-9]{64}$/.test(env.KIT_PREFLIGHT_EMAIL_SHA256 ?? '') ||
		presented?.length !== 64
	)
		return false;
	const deadline = Number(env.KIT_PREFLIGHT_DEADLINE);
	if (!Number.isFinite(deadline) || deadline <= now || deadline > now + 2 * 60 * 60_000)
		return false;
	let difference = 0;
	for (let i = 0; i < 64; i++)
		difference |= presented.charCodeAt(i) ^ env.KIT_PREFLIGHT_SECRET!.charCodeAt(i);
	if (difference) return false;
	const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(email.toLowerCase()));
	const actual = [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('');
	return actual === env.KIT_PREFLIGHT_EMAIL_SHA256;
}

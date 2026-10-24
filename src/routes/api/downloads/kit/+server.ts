import { error, type RequestHandler } from '@sveltejs/kit';
import { getDb } from '$lib/server/db/client';
import { reconcileKit } from '$lib/server/payments/kit-entitlements';
import {
	packageBase64,
	packageFilename,
	packageSha256
} from '$lib/server/products/fakturapakke-asset';

export const GET: RequestHandler = async ({ locals, platform, setHeaders }) => {
	setHeaders({ 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow' });
	if (!locals.user) throw error(401, 'Log ind for at hente dit køb.');
	const env = platform?.env;
	if (!env?.DATABASE_URL)
		throw error(503, 'Download er midlertidigt utilgængelig. Dit køb er gemt.');
	let ownership;
	try {
		// Canonical read also catches refunds even if their webhook was missed.
		ownership = await reconcileKit(getDb(env.DATABASE_URL), env, locals.user.id);
	} catch {
		console.error('[kit download] Canonical verification unavailable');
		throw error(503, 'Købet kunne ikke bekræftes lige nu. Prøv igen senere; køb ikke igen.');
	}
	if (!ownership.owned)
		throw error(
			403,
			ownership.status === 'refunded'
				? 'Købet er refunderet.'
				: 'Et bekræftet køb er nødvendigt. Se Min konto.'
		);
	const binary = atob(packageBase64);
	const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
	const hash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)))
		.map((byte) => byte.toString(16).padStart(2, '0'))
		.join('');
	if (hash !== packageSha256 || bytes[0] !== 0x50 || bytes[1] !== 0x4b) {
		throw error(503, 'Pakken kunne ikke læses. Kontakt os; køb ikke igen.');
	}
	return new Response(bytes, {
		headers: {
			'Content-Type': 'application/zip',
			'Content-Disposition': `attachment; filename="${packageFilename.replace(/[^a-zA-Z0-9._-]/g, '-')}"`,
			'Content-Length': String(bytes.length),
			'X-Content-Type-Options': 'nosniff'
		}
	});
};

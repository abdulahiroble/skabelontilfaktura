import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db/client';
import {
	postgresReconcileQueue,
	runKitReconciliation
} from '$lib/server/payments/kit-reconciliation';

export const POST: RequestHandler = async ({ locals, platform }) => {
	// Only our generated Worker's in-process scheduled handler sets this local.
	// Headers, bodies, query parameters and authenticated users cannot set it.
	if (!locals.kitScheduled) return new Response(null, { status: 404 });
	const env = platform?.env;
	if (env?.KIT_RECONCILIATION_ENABLED !== 'true') return new Response(null, { status: 204 });
	if (!env.DATABASE_URL) return new Response(null, { status: 503 });
	const db = getDb(env.DATABASE_URL);
	try {
		const result = await runKitReconciliation(
			env,
			postgresReconcileQueue(db),
			new Date(locals.kitScheduled.scheduledTime)
		);
		// Aggregate-only logs: never customer/invoice IDs, payloads, secrets or errors.
		console.log('[kit reconciliation]', {
			scheduledTime: locals.kitScheduled.scheduledTime,
			...result
		});
		return json(result, { status: result.failed ? 503 : 200 });
	} catch {
		console.error('[kit reconciliation] Run unavailable');
		return new Response(null, { status: 503 });
	} finally {
		await db.$client.end({ timeout: 5 });
	}
};

import { sql } from 'drizzle-orm';
import { KIT } from '$lib/billing/kit';
import type { Database } from '$lib/server/db/client';
import { billingEnvironment, type BillingEnvironment } from './kit-policy';
import { getAutumnSecret } from './autumn';
import { fetchKitProofs } from './kit-entitlements';

export const RECONCILE_BATCH = 10;
export const RECONCILE_CONCURRENCY = 2;
type Proof = Awaited<ReturnType<typeof fetchKitProofs>>['proofs'][number];
export type ReconcileRow = {
	id: string;
	environment: BillingEnvironment;
	userId: string;
	providerInvoiceId: string;
	stripeInvoiceId: string;
};
export interface ReconcileQueue {
	claim(environment: BillingEnvironment, token: string): Promise<ReconcileRow[]>;
	complete(row: ReconcileRow, token: string, proof: Proof, scheduledAt: Date): Promise<boolean>;
	release(row: ReconcileRow, token: string): Promise<void>;
	due(environment: BillingEnvironment): Promise<number>;
}

export function postgresReconcileQueue(db: Database): ReconcileQueue {
	// LOCAL avoids leaking settings through transaction-pooled PgBouncer.
	async function query<T extends Record<string, unknown>>(statement: ReturnType<typeof sql>) {
		return db.transaction(async (tx) => {
			await tx.execute(sql`set local statement_timeout = '10000'`);
			return tx.execute<T>(statement);
		});
	}
	return {
		async claim(environment, token) {
			// One atomic claim. SKIP LOCKED allows overlapping cron invocations.
			// Attempt time advances BEFORE provider I/O, including failed attempts.
			// FIFO due timestamps (not NULLS FIRST or invoice-ID cursors) mean
			// permanent failures and new arrivals cannot starve older records.
			const rows = await query<ReconcileRow>(sql`
				with candidates as (
					select id from kit_purchase
					where environment = ${environment} and sku = ${KIT.id}
						and status in ('paid', 'review')
						and reconcile_after <= (now() at time zone 'UTC')
						and (reconcile_lease_until is null or reconcile_lease_until <= (now() at time zone 'UTC'))
					order by reconcile_after, id limit ${RECONCILE_BATCH}
					for update skip locked
				)
				update kit_purchase p set
					reconcile_after = (now() at time zone 'UTC') + interval '5 minutes',
					reconcile_lease_until = (now() at time zone 'UTC') + interval '10 minutes',
					reconcile_token = ${token}::uuid
				from candidates c where p.id = c.id
				returning p.id, p.environment, p.user_id as "userId", p.provider_invoice_id as "providerInvoiceId",
					p.stripe_invoice_id as "stripeInvoiceId"`);
			return [...rows];
		},
		async complete(row, token, proof, scheduledAt) {
			// Only update an EXISTING exact invoice. Never insert or grant a plan.
			// Token fencing and monotonic refunds defeat stale reads/expired leases.
			const rows = await query(sql`
				update kit_purchase set
					refunded_minor = greatest(refunded_minor, ${proof.refundedMinor}),
					status = case
						when greatest(refunded_minor, ${proof.refundedMinor}) >= ${KIT.priceMinor} then 'refunded'
						when greatest(refunded_minor, ${proof.refundedMinor}) > 0 then 'review'
						else 'paid' end,
					verified_at = (now() at time zone 'UTC'),
					reconcile_checked_at = ${scheduledAt.toISOString()}::timestamp,
					reconcile_refunded_at = case when ${proof.refundedMinor} >= ${KIT.priceMinor}
						then (now() at time zone 'UTC') else reconcile_refunded_at end,
					reconcile_run_id = ${token}::uuid,
					reconcile_token = null, reconcile_lease_until = null
				where id = ${row.id}::uuid and reconcile_token = ${token}::uuid
					and environment = ${row.environment}
					and user_id = ${row.userId} and provider_invoice_id = ${proof.providerInvoiceId}
					and stripe_invoice_id = ${proof.stripeInvoiceId} and sku = ${KIT.id}
					and status in ('paid', 'review')
				returning id`);
			return rows.length === 1;
		},
		async release(row, token) {
			await query(sql`update kit_purchase set reconcile_token = null, reconcile_lease_until = null
				where id = ${row.id}::uuid and reconcile_token = ${token}::uuid
					and environment = ${row.environment} and sku = ${KIT.id}`);
		},
		async due(environment) {
			const rows = await query<{
				count: number;
			}>(sql`select count(*)::int as count from kit_purchase
				where environment = ${environment} and sku = ${KIT.id} and status in ('paid', 'review')
				and reconcile_after <= (now() at time zone 'UTC')`);
			return rows[0].count;
		}
	};
}

/** Read-only provider operations; no checkout, charges or new ownership rows. */
export async function runKitReconciliation(
	env: Env,
	queue: ReconcileQueue,
	scheduledAt: Date,
	readProofs: typeof fetchKitProofs = fetchKitProofs
) {
	const environment = billingEnvironment(getAutumnSecret(env));
	const token = crypto.randomUUID();
	const rows = await queue.claim(environment, token);
	if (rows.length > RECONCILE_BATCH) throw new Error('Reconciliation batch exceeded bound');
	const result = {
		claimed: rows.length,
		verified: 0,
		refunded: 0,
		failed: 0,
		stale: 0,
		dueRemaining: 0
	};
	let next = 0;
	await Promise.all(
		Array.from({ length: RECONCILE_CONCURRENCY }, async () => {
			while (next < rows.length) {
				const row = rows[next++];
				try {
					if (row.environment !== environment) throw new Error('Wrong queued environment');
					const canonical = await readProofs(env, row.userId);
					if (canonical.environment !== environment) throw new Error('Wrong canonical environment');
					const proof = canonical.proofs.find(
						(p) =>
							p.providerInvoiceId === row.providerInvoiceId &&
							p.stripeInvoiceId === row.stripeInvoiceId
					);
					if (!proof) throw new Error('Missing exact canonical invoice');
					if (await queue.complete(row, token, proof, scheduledAt)) {
						result.verified++;
						if (proof.status === 'refunded') result.refunded++;
					} else result.stale++;
				} catch {
					// No entitlement write on provider outage, missing invoice or
					// ownership mismatch. The public download verifier remains fail-closed.
					result.failed++;
				} finally {
					try {
						await queue.release(row, token);
					} catch {
						result.failed++;
					}
				}
			}
		})
	);
	result.dueRemaining = await queue.due(environment);
	return result;
}

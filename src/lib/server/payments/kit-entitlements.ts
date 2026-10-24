import { and, eq, sql } from 'drizzle-orm';
import { KIT } from '$lib/billing/kit';
import { kitPurchase } from '$lib/server/db/schema';
import type { Database, DatabaseTransaction } from '$lib/server/db/client';
import { packageSha256 } from '$lib/server/products/fakturapakke-asset';
import { createAutumnClient, getAutumnSecret } from './autumn';
import { billingEnvironment, verifyKitInvoice } from './kit-policy';

export async function readKitPurchase(
	db: Database,
	env: Env,
	userId: string,
	canonicalPaid?: Set<string>
) {
	const environment = billingEnvironment(getAutumnSecret(env));
	const rows = await db
		.select()
		.from(kitPurchase)
		.where(
			and(
				eq(kitPurchase.userId, userId),
				eq(kitPurchase.environment, environment),
				eq(kitPurchase.sku, KIT.id)
			)
		);
	const active = rows.find(
		(row) =>
			row.status === 'paid' &&
			row.refundedMinor === 0 &&
			row.assetSha256 === packageSha256 &&
			(!canonicalPaid || canonicalPaid.has(row.providerInvoiceId))
	);
	return {
		owned: !!active,
		status: active
			? 'paid'
			: rows.some((row) => row.status === 'refunded')
				? 'refunded'
				: rows.length
					? 'review'
					: 'none'
	};
}

/**
 * Read-only provider recovery; never attaches plans or creates another charge.
 * Complete bounded pagination before writing anything. A missing provider
 * invoice never silently deletes an existing financial entitlement.
 */
export async function fetchKitProofs(env: Env, userId: string) {
	const autumn = createAutumnClient(env);
	const environment = billingEnvironment(getAutumnSecret(env));
	let customer;
	try {
		customer = await autumn.customers.get(
			{ customerId: userId },
			{ timeoutMs: 10_000, retries: { strategy: 'none' }, redirect: 'manual' }
		);
	} catch (error) {
		const status =
			error && typeof error === 'object'
				? (error as { statusCode?: number }).statusCode
				: undefined;
		if (status === 404) return { environment, proofs: [] };
		// Preserve the cause for diagnostics; callers intentionally never log it.
		throw new Error('Provider customer read unavailable', { cause: error });
	}
	if (customer.id !== userId || customer.env !== environment) {
		throw new Error('Provider customer/environment mismatch');
	}
	const proofs: NonNullable<ReturnType<typeof verifyKitInvoice>>[] = [];
	let cursor = '';
	for (let page = 0; page < 3; page++) {
		const response = await autumn.invoices.list(
			{ customerId: userId, limit: 100, startCursor: cursor },
			{ timeoutMs: 10_000, retries: { strategy: 'none' }, redirect: 'manual' }
		);
		for (const invoice of response.list) {
			const proof = verifyKitInvoice(invoice, userId);
			if (proof) proofs.push(proof);
		}
		if (!response.nextCursor) return { environment, proofs };
		cursor = response.nextCursor;
	}
	throw new Error('Provider invoice pagination exceeded safe bound');
}

export async function persistKitProofs(
	db: DatabaseTransaction,
	userId: string,
	result: Awaited<ReturnType<typeof fetchKitProofs>>
) {
	for (const proof of result.proofs) {
		const saved = await db
			.insert(kitPurchase)
			.values({
				...proof,
				userId,
				environment: result.environment,
				sku: KIT.id,
				assetSha256: packageSha256
			})
			.onConflictDoUpdate({
				target: [kitPurchase.environment, kitPurchase.providerInvoiceId],
				// Refunds are monotonic: an older in-flight read cannot reinstate access.
				set: {
					refundedMinor: sql`greatest(${kitPurchase.refundedMinor}, ${proof.refundedMinor})`,
					status: sql`case
					when ${kitPurchase.status} = 'blocked' then 'blocked'
					when greatest(${kitPurchase.refundedMinor}, ${proof.refundedMinor}) >= ${KIT.priceMinor} then 'refunded'
					when greatest(${kitPurchase.refundedMinor}, ${proof.refundedMinor}) > 0 then 'review'
					else ${proof.status} end`,
					verifiedAt: new Date()
				},
				setWhere: and(
					eq(kitPurchase.userId, userId),
					eq(kitPurchase.stripeInvoiceId, proof.stripeInvoiceId)
				)
			})
			.returning({ id: kitPurchase.id });
		if (!saved.length) throw new Error('Conflicting canonical invoice ownership');
	}
}

export async function reconcileKit(db: Database, env: Env, userId: string) {
	const result = await fetchKitProofs(env, userId);
	await db.transaction(async (tx) => persistKitProofs(tx, userId, result));
	return readKitPurchase(
		db,
		env,
		userId,
		new Set(
			result.proofs
				.filter((proof) => proof.status === 'paid')
				.map((proof) => proof.providerInvoiceId)
		)
	);
}

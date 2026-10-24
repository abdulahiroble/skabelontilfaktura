/** Real production modules, mocked boundaries only; no fixture or network I/O. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { PgDialect } from 'drizzle-orm/pg-core';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const url = (s) => `data:text/javascript;base64,${Buffer.from(s).toString('base64')}`;
function compiled(file, mocks = {}) {
	const full = resolve(root, file);
	return url(
		ts
			.transpileModule(readFileSync(full, 'utf8'), {
				compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext }
			})
			.outputText.replace(/from (['"])([^'"]+)\1/g, (_, q, spec) => {
				const target = mocks[spec]
					? url(mocks[spec])
					: spec.startsWith('$lib/')
						? compiled(`src/lib/${spec.slice(5)}.ts`, mocks)
						: spec.startsWith('.')
							? compiled(resolve(dirname(full), `${spec}.ts`), mocks)
							: import.meta.resolve(spec);
				return `from ${JSON.stringify(target)}`;
			})
	);
}
const mocks = {
	'./autumn': 'export const getAutumnSecret=env=>env.AUTUMN_SECRET_KEY;',
	'./kit-entitlements': 'export const fetchKitProofs=()=>{throw Error("Network forbidden")}'
};
const { runKitReconciliation, postgresReconcileQueue } = await import(
	compiled('src/lib/server/payments/kit-reconciliation.ts', mocks)
);
const env = { AUTUMN_SECRET_KEY: 'am_sk_test_fixture' };
const row = (n = 0) => ({
	id: `${n}`,
	userId: `user-${n}`,
	environment: 'sandbox',
	providerInvoiceId: `inv-${n}`,
	stripeInvoiceId: `in-${n}`
});
const proof = (r, status = 'refunded') => ({
	providerInvoiceId: r.providerInvoiceId,
	stripeInvoiceId: r.stripeInvoiceId,
	status,
	refundedMinor: status === 'refunded' ? 9900 : 0
});
const read = async (_, id) => {
	const r = row(Number(id.split('-')[1]));
	return { environment: 'sandbox', proofs: [proof(r)] };
};
function queue(rows) {
	const completed = [],
		released = [];
	return {
		completed,
		released,
		claim: async () => rows,
		complete: async (r) => {
			completed.push(r);
			return true;
		},
		release: async (r) => {
			released.push(r);
		},
		due: async () => 0
	};
}
test('canonical full refund updates existing row without an ownership insert', async () => {
	const q = queue([row()]);
	const r = await runKitReconciliation(env, q, new Date(), read);
	assert.equal(r.refunded, 1);
	assert.equal(q.completed.length, 1);
	assert.equal(q.released.length, 1);
});
for (const [name, reader] of [
	[
		'provider outage',
		async () => {
			throw Error('private provider text');
		}
	],
	['missing invoice', async () => ({ environment: 'sandbox', proofs: [] })],
	[
		'wrong Stripe invoice',
		async () => ({
			environment: 'sandbox',
			proofs: [{ ...proof(row()), stripeInvoiceId: 'other' }]
		})
	],
	['wrong environment', async () => ({ environment: 'live', proofs: [proof(row())] })]
])
	test(`${name} never grants or writes verification`, async () => {
		const q = queue([row()]);
		const r = await runKitReconciliation(env, q, new Date(), reader);
		assert.equal(r.failed, 1);
		assert.equal(q.completed.length, 0);
		assert.equal(q.released.length, 1);
	});
test('bounded parallelism and an expired-token loser do not count as verified', async () => {
	const q = queue(Array.from({ length: 10 }, (_, n) => row(n)));
	q.complete = async () => false;
	let active = 0,
		max = 0;
	const r = await runKitReconciliation(env, q, new Date(), async (...args) => {
		active++;
		max = Math.max(max, active);
		await new Promise((r) => setImmediate(r));
		active--;
		return read(...args);
	});
	assert.equal(max, 2);
	assert.equal(r.stale, 10);
	assert.equal(r.verified, 0);
});
test('overlapping runs claim disjoint bounded batches', async () => {
	const remaining = Array.from({ length: 17 }, (_, n) => row(n)),
		seen = new Set();
	const q = queue([]);
	q.claim = async () => remaining.splice(0, 10);
	q.complete = async (r) => {
		assert.ok(!seen.has(r.id));
		seen.add(r.id);
		return true;
	};
	await Promise.all([
		runKitReconciliation(env, q, new Date(), read),
		runKitReconciliation(env, q, new Date(), read)
	]);
	assert.equal(seen.size, 17);
});
test('permanent failures rotate behind old backlog instead of monopolizing each batch', async () => {
	const pending = Array.from({ length: 23 }, (_, n) => ({ ...row(n), due: 0 }));
	let clock = 1;
	const q = queue([]),
		seen = new Set();
	q.claim = async () => {
		const batch = [...pending]
			.sort((a, b) => a.due - b.due || Number(a.id) - Number(b.id))
			.slice(0, 10);
		for (const r of batch) r.due = clock++;
		return batch;
	};
	const fail = async (_, id) => {
		seen.add(id);
		throw Error('Permanent provider failure');
	};
	for (let n = 0; n < 3; n++) await runKitReconciliation(env, q, new Date(), fail);
	assert.equal(seen.size, 23);
	assert.equal(q.completed.length, 0);
});
test('Postgres queue uses FIFO due dates, SKIP LOCKED, expiring leases, token fencing and monotonic refunds', async () => {
	const statements = [];
	const db = {
		transaction: async (fn) =>
			fn({
				execute: async (s) => {
					statements.push(new PgDialect().sqlToQuery(s));
					return [];
				}
			})
	};
	const q = postgresReconcileQueue(db);
	await q.claim('sandbox', '00000000-0000-0000-0000-000000000001');
	await q.complete(row(), '00000000-0000-0000-0000-000000000001', proof(row()), new Date());
	await q.release(row(), '00000000-0000-0000-0000-000000000001');
	const sql = statements.map((s) => s.sql).join('\n');
	assert.match(sql, /order by reconcile_after, id limit/i);
	assert.match(sql, /for update skip locked/i);
	assert.match(sql, /interval '5 minutes'/);
	assert.match(sql, /interval '10 minutes'/);
	assert.match(sql, /reconcile_lease_until <=/);
	assert.match(sql, /reconcile_token = \$\d+::uuid/);
	assert.match(sql, /greatest\(refunded_minor/);
	assert.match(sql, /environment =/);
	assert.doesNotMatch(sql, /\binsert\b/i);
	assert.equal(statements.filter((s) => /statement_timeout/.test(s.sql)).length, 3);
});
test('HTTP callers cannot invoke reconciliation, even with a session or forged body', async () => {
	const { POST } = await import(
		compiled('src/routes/api/internal/billing/reconcile/+server.ts', {
			'$lib/server/db/client': 'export function getDb(){throw Error("Must not touch DB")}',
			'$lib/server/payments/kit-reconciliation':
				'export const runKitReconciliation=()=>{};export const postgresReconcileQueue=()=>{};'
		})
	);
	const res = await POST({
		locals: { user: { id: 'operator' } },
		platform: { env: { KIT_RECONCILIATION_ENABLED: 'true' } },
		request: new Request('https://example.test/api/internal/billing/reconcile', {
			method: 'POST',
			body: JSON.stringify({ kitScheduled: { scheduledTime: Date.now() } })
		})
	});
	assert.equal(res.status, 404);
});
test('generated Worker preserves fetch and dispatches real scheduled context in-process', async () => {
	let called = 0;
	const pending = [];
	const template = readFileSync(resolve(root, 'scripts/cloudflare-worker.js.template'), 'utf8')
		.replace(/^import app .*$/m, '')
		.replace(/^import \{ POST \} .*$/m, '')
		.replace('export default', 'return');
	const worker = new Function('app', 'POST', template)(
		{ fetch: async () => new Response('app') },
		async (event) => {
			called++;
			assert.equal(event.locals.kitScheduled.scheduledTime, 123);
			return new Response();
		}
	);
	assert.equal(await (await worker.fetch()).text(), 'app');
	await worker.scheduled(
		{ cron: '* * * * *', scheduledTime: 123, noRetry() {} },
		{},
		{ waitUntil: (p) => pending.push(p) }
	);
	await Promise.all(pending);
	assert.equal(called, 1);
});

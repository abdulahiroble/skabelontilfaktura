import assert from 'node:assert/strict';
import { createServer } from 'vite';

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
try {
	const { validateVies, normalizeVatNumber } = await server.ssrLoadModule(
		'/src/lib/server/vies/client.ts'
	);
	const { lookupCvr, CvrUnavailableError } = await server.ssrLoadModule(
		'/src/lib/server/cvr/client.ts'
	);
	const reply =
		(data, status = 200) =>
		async () =>
			new Response(JSON.stringify(data), { status });
	assert.equal(normalizeVatNumber('DK 46 29 52 18', 'DK'), '46295218');
	assert.equal(
		(
			await validateVies(
				'DK',
				'46295218',
				reply({ isValid: true, userError: 'VALID', name: 'Ace Solutions' })
			)
		).valid,
		true
	);
	assert.equal(
		(await validateVies('DK', '00000000', reply({ isValid: false, userError: 'INVALID' }))).valid,
		false
	);
	for (const payload of [
		null,
		{},
		{ isValid: false, userError: 'MS_UNAVAILABLE' },
		{ isValid: false, userError: 'MS_MAX_CONCURRENT_REQ' },
		{ isValid: false, actionSucceed: false },
		{ isValid: 'false' }
	]) {
		assert.equal(
			await validateVies('DK', '46295218', reply(payload)),
			null,
			JSON.stringify(payload)
		);
	}
	assert.equal(
		await validateVies('DK', '46295218', async () => {
			throw new Error('network');
		}),
		null
	);
	assert.equal(await validateVies('DK', '46295218', reply({}, 503)), null);
	assert.equal(
		await validateVies('GB', '123456789', async () => {
			throw new Error('must not fetch');
		}),
		null
	);
	let calls = 0;
	const fallback = await lookupCvr('46295218', async () => {
		calls++;
		return calls === 1
			? new Response('unavailable', { status: 503 })
			: new Response(
					JSON.stringify({
						vat: 46295218,
						name: 'Ace Solutions',
						address: 'Avedøreholmen 96C',
						zipcode: 2650,
						city: 'Hvidovre'
					})
				);
	});
	assert.equal(calls, 2);
	assert.equal(fallback.name, 'Ace Solutions');
	assert.equal(fallback.zipcode, '2650');
	assert.equal(await lookupCvr('00000000', reply({ error: 'NOT_FOUND' }, 404)), null);
	await assert.rejects(lookupCvr('46295218', reply({}, 503)), CvrUnavailableError);
	assert.equal(await lookupCvr('46295218', reply({ vat: 12345678, name: 'Wrong company' })), null);
	assert.equal(
		await lookupCvr('bad', async () => {
			throw new Error('must not fetch');
		}),
		null
	);
	console.log(
		'PASS: VIES valid/invalid/outage/malformed responses; country/number normalization; CVR fallback/not-found/outage/identity checks.'
	);
} finally {
	await server.close();
}

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
	parseWranglerJson,
	latestWranglerRecord,
	fullyDeployedVersion
} from './wrangler-version-policy.mjs';

const old = {
	id: 'old',
	created_on: '2026-10-23T12:40:00.700445Z',
	versions: [{ version_id: 'old-code', percentage: 100 }]
};
const current = {
	id: 'current',
	created_on: '2026-10-23T23:25:41.260475Z',
	versions: [{ version_id: 'parent-code', percentage: 100 }]
};
test('empty CLI output has a precise safe failure instead of an unclassified JSON exception', () => {
	assert.throws(
		() => parseWranglerJson(''),
		(e) => e.safeCode === 'WRANGLER_JSON_EMPTY'
	);
	assert.throws(
		() => parseWranglerJson('not-json'),
		(e) => e.safeCode === 'WRANGLER_JSON_INVALID'
	);
});
test('latest deployment is selected by timestamp in either list ordering', () => {
	assert.equal(fullyDeployedVersion([old, current]), 'parent-code');
	assert.equal(fullyDeployedVersion([current, old]), 'parent-code');
	assert.equal(fullyDeployedVersion({ deployments: [old, current] }), 'parent-code');
});
test('version timestamps come from metadata.created_on, including ascending CLI output', () => {
	const first = { id: 'first', metadata: { created_on: old.created_on } };
	const last = { id: 'last', metadata: { created_on: current.created_on } };
	assert.equal(latestWranglerRecord({ items: [first, last] }).id, 'last');
});
test('split traffic, missing timestamps and timestamp ambiguity fail closed', () => {
	assert.throws(() =>
		fullyDeployedVersion([
			{
				...current,
				versions: [
					{ version_id: 'a', percentage: 50 },
					{ version_id: 'b', percentage: 50 }
				]
			}
		])
	);
	assert.throws(() => latestWranglerRecord([{ id: 'unknown' }]));
	assert.throws(() => latestWranglerRecord([current, { ...current, id: 'ambiguous' }]));
});

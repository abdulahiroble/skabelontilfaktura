/** Wrangler's list output is chronological, not guaranteed newest-first. */
function stop(safeCode) {
	throw Object.assign(new Error('Wrangler metadata cannot be verified'), { safeCode });
}
export function parseWranglerJson(stdout) {
	if (typeof stdout !== 'string' || !stdout.trim()) stop('WRANGLER_JSON_EMPTY');
	try {
		return JSON.parse(stdout);
	} catch {
		stop('WRANGLER_JSON_INVALID');
	}
}
export function latestWranglerRecord(value) {
	const rows = Array.isArray(value) ? value : (value?.items ?? value?.deployments);
	if (!Array.isArray(rows) || !rows.length) stop('WRANGLER_METADATA_EMPTY');
	const dated = rows
		.map((row) => {
			const at = Date.parse(row.created_on ?? row.metadata?.created_on);
			if (!Number.isFinite(at) || typeof row.id !== 'string') stop('WRANGLER_METADATA_INVALID');
			return { row, at };
		})
		.sort((a, b) => b.at - a.at);
	if (dated.length > 1 && dated[0].at === dated[1].at && dated[0].row.id !== dated[1].row.id)
		stop('WRANGLER_LATEST_AMBIGUOUS');
	return dated[0].row;
}
export function fullyDeployedVersion(value) {
	const deployment = latestWranglerRecord(value);
	if (
		deployment.versions?.length !== 1 ||
		deployment.versions[0].percentage !== 100 ||
		typeof deployment.versions[0].version_id !== 'string'
	)
		stop('SINGLE_FULLY_DEPLOYED_VERSION_REQUIRED');
	return deployment.versions[0].version_id;
}

import cloudflare from '@sveltejs/adapter-cloudflare';
import { appendFileSync, copyFileSync, existsSync, renameSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * adapter-cloudflare 7 generates a fetch-only entry, overwriting Wrangler main.
 * Wrap its finished output, not the source entry that the adapter overwrites.
 * Fail the build if SvelteKit changes its compiled endpoint contract.
 */
export default function scheduledCloudflare() {
	const delegate = cloudflare();
	return {
		...delegate,
		async adapt(builder) {
			await delegate.adapt(builder);
			const dir = builder.getBuildDirectory('cloudflare');
			const endpoint = resolve(
				builder.getServerDirectory(),
				'entries/endpoints/api/internal/billing/reconcile/_server.ts.js'
			);
			if (!existsSync(endpoint)) throw new Error('Scheduled billing entry missing from build');
			renameSync(`${dir}/_worker.js`, `${dir}/_sveltekit-worker.js`);
			copyFileSync('scripts/cloudflare-worker.js.template', `${dir}/_worker.js`);
			appendFileSync(`${dir}/.assetsignore`, '\n_sveltekit-worker.js\n');
		}
	};
}

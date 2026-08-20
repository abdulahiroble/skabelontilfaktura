import { getBranch, BRANCHES } from '$lib/branches';
import type { PageLoad } from './$types';

// The site is fully prerendered; emit one static page per branch.
export const entries = async () => BRANCHES.map((branch) => ({ slug: branch.slug }));

export const load: PageLoad = async ({ params }) => {
	const branch = getBranch(params.slug);
	if (!branch) {
		// Unknown slugs were never emitted as pages, so this is unreachable in
		// a prerendered build; fall back to a 404 at runtime.
		return { branch: undefined };
	}
	return { branch };
};

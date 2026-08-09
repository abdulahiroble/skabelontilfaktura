import { createAuthClient } from 'better-auth/svelte';

/**
 * Browser-side Better Auth client.
 *
 * `baseURL` is set to the current origin ONLY in the browser. During SSR /
 * prerender (`typeof window === 'undefined'`) better-auth would try to resolve
 * a relative `baseURL: '/'` against an undefined `window.location` and throw
 * ("Invalid base URL"), which breaks prerendering of any page that imports
 * this module. The client is only ever used client-side (inside `onMount`),
 * so leaving baseURL unset during SSR is safe — it falls back to `/api/auth`.
 *
 * NOTE: this lives under `$lib/auth/` (NOT `$lib/server/`) because it is a
 * browser-only module — importing it from `$lib/server/` trips the
 * vite-plugin-sveltekit-guard "Cannot import $lib/server into browser code"
 * check. It contains no secrets: the client uses the public `/api/auth`
 * endpoints with credentials (cookies).
 */
export const authClient = createAuthClient({
	baseURL: typeof window !== 'undefined' ? window.location.origin : undefined
});

export const { signIn, signOut, signUp, useSession } = authClient;

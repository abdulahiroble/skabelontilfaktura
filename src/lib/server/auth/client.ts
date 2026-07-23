import { createAuthClient } from 'better-auth/svelte';

/**
 * Browser-side Better Auth client.
 *
 * `baseURL: '/'` keeps requests relative to the current origin, so the client
 * targets `/api/auth/*` (matching the server `basePath`).
 */
export const authClient = createAuthClient({
	baseURL: '/'
});

export const { signIn, signOut, signUp, useSession } = authClient;

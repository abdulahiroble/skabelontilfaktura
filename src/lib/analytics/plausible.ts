/**
 * Plausible analytics integration (self-hosted, cookieless).
 *
 * Plausible does not use cookies and is GDPR-compliant by design, so the
 * script can be loaded immediately without waiting for consent.
 */

/** Domain tracked by the self-hosted Plausible instance. */
export const PLAUSIBLE_DOMAIN = 'skabelontilfaktura.dk';

/** Fully-qualified URL of the Plausible script on the self-hosted instance. */
export const PLAUSIBLE_SCRIPT_SRC = 'https://plausible.skabelontilfaktura.dk/js/script.js';

/**
 * Build the `<script>` tag HTML for Plausible.
 *
 * Rendered inside `<svelte:head>` via `{@html ...}` so the attributes
 * (`defer`, `data-domain`, `src`) are preserved exactly.
 */
export function plausibleScriptTag(): string {
	return `<script defer data-domain="${PLAUSIBLE_DOMAIN}" src="${PLAUSIBLE_SCRIPT_SRC}"></script>`;
}

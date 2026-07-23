/**
 * Google Consent Mode v2 defaults and helpers.
 *
 * The consent defaults are emitted as an inline script at the very top of
 * `<svelte:head>` so they run before any other tag. All advertising and
 * analytics signals start in the `denied` state; only functionality and
 * security storage (required for the app to work) are granted by default.
 */

/** Consent Mode v2 default values (all denied except essential storage). */
export const CONSENT_DEFAULTS = {
	ad_storage: 'denied',
	analytics_storage: 'denied',
	functionality_storage: 'granted',
	security_storage: 'granted',
	personalization_storage: 'denied',
	ad_user_data: 'denied',
	ad_personalization: 'denied'
} as const;

/** Consent values when the user accepts all categories. */
export const CONSENT_GRANTED = {
	ad_storage: 'granted',
	analytics_storage: 'granted',
	functionality_storage: 'granted',
	security_storage: 'granted',
	personalization_storage: 'granted',
	ad_user_data: 'granted',
	ad_personalization: 'granted'
} as const;

/** localStorage key under which the consent choice is persisted. */
export const CONSENT_STORAGE_KEY = 'faktura_consent_v1';

/** The values persisted to localStorage. */
export type ConsentChoice = 'accepted' | 'rejected';

declare global {
	interface Window {
		dataLayer?: unknown[];
		gtag?: (...args: unknown[]) => void;
	}
}

/**
 * gtag shim. Forwards arguments to the `window.dataLayer` queue, creating
 * it if necessary. Mirrors the snippet Google recommends loading before the
 * GTM/gtag.js script.
 */
export function gtag(...args: unknown[]): void {
	if (typeof window === 'undefined') return;
	window.dataLayer = window.dataLayer || [];
	window.dataLayer.push(args);
}

/**
 * Update Consent Mode v2 signals. Call this after the user makes (or
 * rehydrates) a consent choice.
 */
export function updateConsent(values: Record<string, string>): void {
	gtag('consent', 'update', values);
}

/**
 * Build the `<script>` tag HTML that seeds Consent Mode v2 defaults.
 *
 * This must be the FIRST script in `<head>` so all signals start in the
 * `denied` state before any advertising/analytics tag loads. The HTML is
 * injected via `{@html ...}` from `AnalyticsScripts.svelte`.
 */
export function consentDefaultScriptTag(): string {
	return (
		'<script>' +
		'window.dataLayer=window.dataLayer||[];' +
		'function gtag(){dataLayer.push(arguments);}' +
		`gtag('consent','default',${JSON.stringify(CONSENT_DEFAULTS)});` +
		'</script>'
	);
}

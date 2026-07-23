<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import AnalyticsScripts from '$lib/components/AnalyticsScripts.svelte';
	import ConsentBanner from '$lib/components/ConsentBanner.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="sitemap" href="/sitemap.xml" />

	<!--
		Consent Mode v2 defaults — MUST be the first script in <head> so every
		advertising/analytics signal starts denied. Values mirror the
		`CONSENT_DEFAULTS` constant in `$lib/analytics/consent.ts`; keep them in
		sync. Plausible is cookieless and may load without consent.
	-->
	<script>
		window.dataLayer = window.dataLayer || [];
		function gtag() {
			dataLayer.push(arguments);
		}
		gtag('consent', 'default', {
			ad_storage: 'denied',
			analytics_storage: 'denied',
			functionality_storage: 'granted',
			security_storage: 'granted',
			personalization_storage: 'denied',
			ad_user_data: 'denied',
			ad_personalization: 'denied'
		});
	</script>

	<!-- Plausible (cookieless, loads immediately) + Sentry placeholder -->
	<AnalyticsScripts />
</svelte:head>

{@render children()}

<!-- Cookie consent banner (renders only when no choice has been made) -->
<ConsentBanner />

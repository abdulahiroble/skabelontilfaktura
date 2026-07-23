<script lang="ts">
	import { PLAUSIBLE_DOMAIN, PLAUSIBLE_SCRIPT_SRC } from '$lib/analytics';
</script>

<svelte:head>
	<!-- Plausible Analytics (cookieless, GDPR-compliant, loads immediately) -->
	<script defer data-domain={PLAUSIBLE_DOMAIN} src={PLAUSIBLE_SCRIPT_SRC}></script>

	<!-- Sentry placeholder: a real init script will be wired here once a DSN is provisioned. -->
</svelte:head>

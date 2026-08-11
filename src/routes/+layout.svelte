<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import AnalyticsScripts from '$lib/components/AnalyticsScripts.svelte';
	import ConsentBanner from '$lib/components/ConsentBanner.svelte';
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';

	let { children, data }: { children: Snippet; data: LayoutData } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="apple-touch-icon" href={favicon} />
	<link rel="sitemap" href="/sitemap.xml" />
	<meta name="theme-color" content="#BD8A2E" />
</svelte:head>

<AnalyticsScripts measurementId={data.gaMeasurementId} />

{@render children()}

<ConsentBanner />

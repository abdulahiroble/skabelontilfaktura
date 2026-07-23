<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import ConsentBanner from '$lib/components/ConsentBanner.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="sitemap" href="/sitemap.xml" />
</svelte:head>

{@render children()}

<ConsentBanner />

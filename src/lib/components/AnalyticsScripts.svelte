<script lang="ts">
	import { googleAnalyticsScriptTags } from '$lib/analytics';

	let { measurementId }: { measurementId?: string } = $props();
</script>

<svelte:head>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html googleAnalyticsScriptTags(measurementId)}
</svelte:head>

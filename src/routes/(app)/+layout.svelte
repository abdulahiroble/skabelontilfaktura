<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';
	import UpgradePrompt from '$lib/components/UpgradePrompt.svelte';

	/**
	 * App shell. Reads the entitlement context resolved by
	 * `+layout.server.ts` to gate nav items per plan and to surface the
	 * upgrade prompt for free users.
	 *
	 * The serializable entitlements (`{ plan, features[] }` or `null`) are
	 * inspected directly here rather than importing the server-only
	 * entitlements module, keeping server code out of the client bundle.
	 */
	let { data, children }: { data: LayoutData; children: Snippet } = $props();

	type FeatureId =
		| 'cloud_storage'
		| 'client_database'
		| 'saft_export'
		| 'reminder_emails'
		| 'cross_device_numbering'
		| 'peppol_send'
		| 'multi_user'
		| 'api_access'
		| 'white_label';

	// Plan-derived flags. `null` entitlements (anonymous / no DB) are treated
	// as the free tier: core nav stays visible, paid items are hidden.
	const features = $derived(new Set<FeatureId>(data.entitlements?.features ?? []));
	const isProOrHigher = $derived(data.entitlements?.plan !== 'free' && !!data.entitlements);
	const canExport = $derived(features.has('saft_export'));
</script>

<div class="flex min-h-screen flex-col">
	<header class="border-border border-b">
		<div class="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
			<a href="/" class="font-semibold">skabelontilfaktura.dk</a>
			<nav class="flex items-center gap-4 text-sm">
				<a href="/faktura/" class="text-muted-foreground hover:text-foreground">Fakturaer</a>
				<a href="/kunder/" class="text-muted-foreground hover:text-foreground">Klienter</a>
				{#if canExport}
					<a href="/eksport/" class="text-muted-foreground hover:text-foreground">Eksport</a>
				{/if}
				<a href="/indstillinger/" class="text-muted-foreground hover:text-foreground"
					>Indstillinger</a
				>
			</nav>
		</div>
	</header>
	<main class="flex-1">
		<div class="mx-auto max-w-6xl px-4 py-4">
			{#if !isProOrHigher}
				<UpgradePrompt />
			{/if}
		</div>
		{@render children()}
	</main>
</div>

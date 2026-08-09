<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';
	import { authClient } from '$lib/auth/client';
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

	// Better Auth Svelte store — read with `$session` (auto-subscribes in the
	// browser; safe during SSR/prerender because the store starts inert).
	const session = authClient.useSession();

	async function logout() {
		await authClient.signOut();
		window.location.href = '/';
	}

	type FeatureId =
		| 'cloud_storage'
		| 'client_database'
		| 'saft_export'
		| 'reminder_emails'
		| 'cross_device_numbering'
		| 'multi_user'
		| 'api_access'
		| 'white_label';

	// Plan-derived flags. `null` entitlements (anonymous / no DB) are treated
	// as the free tier: core nav stays visible, paid items are hidden.
	const features = $derived(new Set<FeatureId>(data.entitlements?.features ?? []));
	const isProOrHigher = $derived(data.entitlements?.plan !== 'free' && !!data.entitlements);
	const canExport = $derived(features.has('saft_export'));
	const canStoreInvoices = $derived(features.has('cloud_storage'));
	const canManageClients = $derived(features.has('client_database'));
</script>

<div class="flex min-h-screen flex-col">
	<header class="border-border bg-background/95 sticky top-0 z-50 border-b backdrop-blur">
		<div class="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
			<a href="/" class="font-semibold">skabelontilfaktura.dk</a>
			<nav class="hidden items-center gap-5 text-sm md:flex">
				<a href="/konto/" class="text-muted-foreground hover:text-foreground">Overblik</a>
				<a href="/generator/" class="text-muted-foreground hover:text-foreground">Ny faktura</a>
				{#if canStoreInvoices}
					<a href="/faktura/" class="text-muted-foreground hover:text-foreground">Fakturaer</a>
				{/if}
				{#if canManageClients}
					<a href="/kunder/" class="text-muted-foreground hover:text-foreground">Klienter</a>
				{/if}
				{#if canExport}
					<a href="/eksport/" class="text-muted-foreground hover:text-foreground">Eksport</a>
				{/if}
				<a href="/indstillinger/" class="text-muted-foreground hover:text-foreground"
					>Indstillinger</a
				>
				{#if $session.data}
					<span class="text-muted-foreground hidden max-w-[12rem] truncate text-sm sm:inline"
						>{$session.data.user.email}</span
					>
					<button
						type="button"
						class="text-muted-foreground hover:text-foreground text-sm"
						onclick={logout}
					>
						Log ud
					</button>
				{/if}
			</nav>
			<a href="/konto/" class="text-primary text-sm font-medium md:hidden">Min konto</a>
		</div>
		<nav
			class="border-border flex gap-4 overflow-x-auto border-t px-4 py-2 text-sm md:hidden"
			aria-label="Kontoværktøjer"
		>
			<a href="/konto/" class="text-muted-foreground whitespace-nowrap">Overblik</a>
			<a href="/generator/" class="text-muted-foreground whitespace-nowrap">Ny faktura</a>
			{#if canStoreInvoices}
				<a href="/faktura/" class="text-muted-foreground whitespace-nowrap">Fakturaer</a>
			{/if}
			{#if canManageClients}
				<a href="/kunder/" class="text-muted-foreground whitespace-nowrap">Klienter</a>
			{/if}
			{#if canExport}
				<a href="/eksport/" class="text-muted-foreground whitespace-nowrap">Eksport</a>
			{/if}
			<a href="/indstillinger/" class="text-muted-foreground whitespace-nowrap">Indstillinger</a>
		</nav>
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

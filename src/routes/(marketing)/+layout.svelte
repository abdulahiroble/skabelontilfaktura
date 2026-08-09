<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { authClient } from '$lib/auth/client';
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';

	let { children, data }: { children: Snippet; data: LayoutData } = $props();

	// Better Auth Svelte store — read with `$session` (auto-subscribes in the
	// browser; safe during SSR/prerender because the store starts inert).
	const session = authClient.useSession();

	async function logout() {
		await authClient.signOut();
		window.location.href = '/';
	}

	const navLinks = [
		{ href: '/generator/', label: 'Fakturagenerator' },
		{ href: '/pris/', label: 'Priser' },
		{ href: '/blog/', label: 'Guides' }
	];

	const isPaid = $derived(data.entitlements?.plan !== 'free' && !!data.entitlements);
	const accountLinks = $derived(
		isPaid
			? [
					{ href: '/konto/', label: 'Overblik' },
					{ href: '/faktura/', label: 'Fakturaer' },
					{ href: '/kunder/', label: 'Klienter' },
					{ href: '/eksport/', label: 'Eksport' }
				]
			: [{ href: '/konto/', label: 'Min konto' }]
	);
</script>

<div class="flex min-h-screen flex-col">
	<header class="border-border/60 bg-background/90 sticky top-0 z-50 border-b backdrop-blur-md">
		<div class="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
			<a href="/" class="flex items-baseline gap-2">
				<span class="text-xl font-semibold tracking-tight" style="font-family: var(--font-display)">
					skabelontilfaktura
				</span>
				<span class="text-accent text-sm">.dk</span>
			</a>
			<nav class="hidden items-center gap-7 sm:flex">
				{#each navLinks as link (link.href)}
					<a
						href={link.href}
						class="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
					>
						{link.label}
					</a>
				{/each}
				{#if data.user}
					<span class="bg-border h-4 w-px"></span>
					{#each accountLinks as link (link.href)}
						<a
							href={link.href}
							class="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
						>
							{link.label}
						</a>
					{/each}
				{/if}
			</nav>
			<div class="flex items-center gap-3">
				{#if $session.isPending}
					<span class="text-muted-foreground text-sm">…</span>
				{:else if $session.data}
					<a
						href="/konto/"
						class="text-muted-foreground hover:text-foreground hidden text-sm font-medium transition-colors sm:inline"
					>
						Min konto
					</a>
					<button
						type="button"
						class="text-muted-foreground hover:text-foreground hidden text-sm font-medium transition-colors sm:inline"
						onclick={logout}
					>
						Log ud
					</button>
				{:else}
					<a
						href="/login/"
						class="text-muted-foreground hover:text-foreground hidden text-sm font-medium transition-colors sm:inline"
					>
						Log ind
					</a>
				{/if}
				<Button size="sm" href={data.user ? '/konto/' : '/generator/'}>
					{data.user ? 'Åbn konto' : 'Lav faktura'}
				</Button>
			</div>
		</div>
		{#if data.user}
			<nav
				class="border-border bg-background flex gap-4 overflow-x-auto border-t px-4 py-2 text-sm sm:hidden"
				aria-label="Kontoværktøjer"
			>
				{#each accountLinks as link (link.href)}
					<a href={link.href} class="text-muted-foreground hover:text-foreground whitespace-nowrap">
						{link.label}
					</a>
				{/each}
				<a href="/generator/" class="text-muted-foreground hover:text-foreground whitespace-nowrap">
					Ny faktura
				</a>
			</nav>
		{/if}
	</header>

	<main class="flex-1">
		{@render children()}
	</main>

	<footer class="border-border bg-secondary/30 border-t">
		<div class="mx-auto max-w-6xl px-6 py-14">
			<div class="grid gap-10 md:grid-cols-[2fr_1fr_1fr_1fr]">
				<div class="space-y-3">
					<p class="text-lg font-semibold" style="font-family: var(--font-display)">
						skabelontilfaktura.dk
					</p>
					<p class="text-muted-foreground max-w-xs text-sm leading-relaxed">
						Danmarks nemmeste fakturaskabelon. Gratis, lovlig, og klar på 60 sekunder.
					</p>
				</div>
				<div class="space-y-2.5">
					<p class="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
						Værktøj
					</p>
					<a
						href="/generator/"
						class="text-muted-foreground hover:text-foreground block text-sm transition-colors"
						>Fakturagenerator</a
					>
					<a
						href="/pris/"
						class="text-muted-foreground hover:text-foreground block text-sm transition-colors"
						>Priser</a
					>
				</div>
				<div class="space-y-2.5">
					<p class="text-muted-foreground text-xs font-semibold tracking-wider uppercase">Viden</p>
					<a
						href="/blog/"
						class="text-muted-foreground hover:text-foreground block text-sm transition-colors"
						>Guides</a
					>
				</div>
				<div class="space-y-2.5">
					<p class="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
						Juridisk
					</p>
					<a
						href="/privatlivspolitik/"
						class="text-muted-foreground hover:text-foreground block text-sm transition-colors"
						>Privatlivspolitik</a
					>
					<a
						href="/cookiepolitik/"
						class="text-muted-foreground hover:text-foreground block text-sm transition-colors"
						>Cookiepolitik</a
					>
				</div>
			</div>
			<div class="border-border mt-10 border-t pt-6">
				<p class="text-muted-foreground/80 max-w-3xl text-xs leading-relaxed">
					Skabelontilfaktura.dk er et værktøj til at generere fakturaer og udgør ikke juridisk
					rådgivning. Brugeren er selv ansvarlig for overholdelse af gældende lovgivning. Ved
					komplekse situationer anbefales konsultation af revisor.
				</p>
			</div>
		</div>
	</footer>
</div>

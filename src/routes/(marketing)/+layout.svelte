<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

	const navLinks = [
		{ href: '/', label: 'Fakturagenerator' },
		{ href: '/pris/', label: 'Priser' },
		{ href: '/blog/', label: 'Guides' }
	];
</script>

<div class="flex min-h-screen flex-col">
	<header class="border-border bg-background/95 sticky top-0 z-50 border-b backdrop-blur">
		<div class="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
			<a href="/" class="flex items-center gap-2 font-semibold">
				<span class="text-lg">skabelontilfaktura.dk</span>
			</a>
			<nav class="hidden items-center gap-6 sm:flex">
				{#each navLinks as link (link.href)}
					<a
						href={link.href}
						class="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
					>
						{link.label}
					</a>
				{/each}
			</nav>
			<div class="flex items-center gap-2">
				<Button variant="ghost" size="sm" href="/login/">Log ind</Button>
				<Button size="sm" href="/generator/">Lav faktura</Button>
			</div>
		</div>
	</header>

	<main class="flex-1">
		{@render children()}
	</main>

	<footer class="border-border border-t">
		<div class="mx-auto max-w-6xl px-4 py-12">
			<div class="grid gap-8 md:grid-cols-4">
				<div class="space-y-3">
					<p class="font-semibold">skabelontilfaktura.dk</p>
					<p class="text-muted-foreground text-sm">
						Danmarks nemmeste fakturaskabelon. Lav en faktura på 60 sekunder - gratis og lovlig.
					</p>
				</div>
				<div class="space-y-2">
					<p class="text-sm font-medium">Værktøj</p>
					<a href="/generator/" class="text-muted-foreground hover:text-foreground block text-sm"
						>Fakturagenerator</a
					>
					<a href="/pris/" class="text-muted-foreground hover:text-foreground block text-sm"
						>Priser</a
					>
				</div>
				<div class="space-y-2">
					<p class="text-sm font-medium">Viden</p>
					<a href="/blog/" class="text-muted-foreground hover:text-foreground block text-sm"
						>Guides</a
					>
				</div>
				<div class="space-y-2">
					<p class="text-sm font-medium">Juridisk</p>
					<a
						href="/privatlivspolitik/"
						class="text-muted-foreground hover:text-foreground block text-sm">Privatlivspolitik</a
					>
					<a
						href="/cookiepolitik/"
						class="text-muted-foreground hover:text-foreground block text-sm">Cookiepolitik</a
					>
				</div>
			</div>
			<div class="border-border mt-8 border-t pt-6">
				<p class="text-muted-foreground text-xs">
					Skabelontilfaktura.dk er et værktøj til at generere fakturaer og udgør ikke juridisk
					rådgivning. Brugeren er selv ansvarlig for overholdelse af gældende lovgivning. Ved
					komplekse situationer anbefales konsultation af revisor.
				</p>
			</div>
		</div>
	</footer>
</div>

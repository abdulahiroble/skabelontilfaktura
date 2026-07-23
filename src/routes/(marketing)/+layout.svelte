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
	<header class="border-border/60 bg-background/90 sticky top-0 z-50 border-b backdrop-blur-md">
		<div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
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
			</nav>
			<div class="flex items-center gap-3">
				<a
					href="/login/"
					class="text-muted-foreground hover:text-foreground hidden text-sm font-medium transition-colors sm:inline"
				>
					Log ind
				</a>
				<Button size="sm" href="/generator/">Lav faktura</Button>
			</div>
		</div>
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

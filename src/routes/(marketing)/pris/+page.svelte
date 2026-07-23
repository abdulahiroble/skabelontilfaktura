<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import AffiliateCta from '$lib/components/AffiliateCta.svelte';

	// Editorial pricing data — feature copy kept in Danish, rendered inline
	// with accent dots rather than as card bullet lists.
	const proFeatures = [
		'Cloud-lagring (5 år)',
		'Klientdatabase',
		'SAF-T 2.0 eksport',
		'Rykkermails',
		'Nummerering på tværs af enheder'
	];

	const businessFeatures = ['Peppol e-faktura', '2–5 brugere', 'API-adgang', 'White-label PDF’er'];

	const gratisFeatures = [
		'Ubegrænsede fakturaer',
		'PDF uden vandmærke',
		'CVR-opslag',
		'Automatisk moms',
		'Dansk og engelsk'
	];
</script>

<svelte:head>
	<title>Priser - Pro og Business | skabelontilfaktura.dk</title>
	<meta
		name="description"
		content="Pro fra 49 DKK/måned. Cloud-lagring, klientdatabase, SAF-T 2.0 eksport og rykkermails. Business med Peppol e-faktura."
	/>
</svelte:head>

<!-- Hero: left-aligned, editorial -->
<section class="mx-auto max-w-6xl px-6 pt-20 pb-12 lg:pt-28">
	<p class="text-primary mb-5 text-sm font-medium tracking-wide">Enkelt og gennemsigtigt</p>
	<h1 class="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">Priser</h1>
	<p class="text-muted-foreground mt-6 max-w-md text-lg leading-relaxed">
		Begynd gratis. Betal kun, når du har brug for mere. Ingen skjulte gebyrer, ingen binding.
	</p>
</section>

<!-- Baseline: Gratis as a footnote, not a card -->
<section class="mx-auto max-w-6xl px-6">
	<div class="border-border border-b pb-6">
		<p class="text-muted-foreground text-sm leading-relaxed">
			<span class="text-foreground font-medium" style="font-family: var(--font-display)"
				>Ellers gratis — som altid.</span
			>
			Ubegrænsede fakturaer, PDF uden vandmærke, CVR-opslag og automatisk moms.
		</p>
		<div class="text-muted-foreground mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs">
			{#each gratisFeatures as feature (feature)}
				<span class="flex items-center gap-1.5">
					<span class="bg-accent h-1 w-1 rounded-full"></span>
					{feature}
				</span>
			{/each}
		</div>
	</div>
</section>

<!-- Pricing spread: Pro as hero, Business as secondary -->
<section class="mx-auto max-w-6xl px-6 py-16">
	<div class="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
		<!-- Pro: hero tier, accent color -->
		<div>
			<p class="text-accent text-sm font-medium tracking-wide">Pro</p>
			<div class="mt-3 flex items-baseline gap-2">
				<span
					class="text-6xl font-semibold tracking-tight sm:text-7xl"
					style="font-family: var(--font-display)">49</span
				>
				<span class="text-muted-foreground text-lg">DKK /måned</span>
			</div>
			<p class="text-muted-foreground mt-5 max-w-md text-base leading-relaxed">
				For selvstændige, der vil have mere. Cloud-sikkerhedskopi, klientdatabase og
				regnskabseksport — alt i ét.
			</p>

			<!-- Inline feature list with accent dots -->
			<div class="mt-7 flex flex-wrap gap-x-6 gap-y-2.5 text-sm">
				{#each proFeatures as feature (feature)}
					<span class="flex items-center gap-2">
						<span class="bg-accent h-1.5 w-1.5 rounded-full"></span>
						{feature}
					</span>
				{/each}
			</div>

			<div class="mt-9 flex flex-wrap items-center gap-4">
				<Button size="lg" href="/generator/" class="px-7">Opgrader til Pro</Button>
				<span class="text-muted-foreground text-xs">Inkluderer alt fra Gratis</span>
			</div>
		</div>

		<!-- Business: secondary, divided by a vertical rule on large screens -->
		<div class="border-border lg:border-l lg:pl-16">
			<p class="text-muted-foreground text-sm font-medium tracking-wide">Business</p>
			<div class="mt-3 flex items-baseline gap-2">
				<span
					class="text-4xl font-semibold tracking-tight sm:text-5xl"
					style="font-family: var(--font-display)">149</span
				>
				<span class="text-muted-foreground text-sm">DKK /måned</span>
			</div>
			<p class="text-muted-foreground mt-5 max-w-sm text-sm leading-relaxed">
				Til små teams, der skal sende e-faktura via Peppol og dele adgang.
			</p>

			<div class="mt-7 flex flex-wrap gap-x-6 gap-y-2.5 text-sm">
				{#each businessFeatures as feature (feature)}
					<span class="flex items-center gap-2">
						<span class="bg-muted-foreground h-1.5 w-1.5 rounded-full"></span>
						{feature}
					</span>
				{/each}
			</div>

			<div class="mt-9">
				<Button variant="outline" href="/generator/">Vælg Business</Button>
			</div>
		</div>
	</div>
</section>

<!-- Lifetime Pro callout: separate, calm -->
<section class="border-border bg-secondary/30 border-y">
	<div class="mx-auto max-w-6xl px-6 py-12">
		<div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
			<div>
				<h2 class="text-2xl leading-tight">Livstids-Pro</h2>
				<p class="text-muted-foreground mt-2 max-w-md text-sm leading-relaxed">
					Betal én gang, brug for evigt. Alt fra Pro — uden månedlig regning.
				</p>
			</div>
			<div class="flex items-center gap-5">
				<div class="flex items-baseline gap-2">
					<span class="text-3xl font-semibold" style="font-family: var(--font-display)"
						>999 DKK</span
					>
					<span class="text-muted-foreground text-sm">én gang</span>
				</div>
				<Button variant="outline" href="/generator/">Vælg livstids-Pro</Button>
			</div>
		</div>
	</div>
</section>

<!-- Affiliate CTAs: kept exactly as before -->
<section class="mx-auto max-w-6xl space-y-8 px-6 py-16">
	<!-- Brug for et fuldt regnskabsprogram? Affiliate CTA after the pricing tiers. -->
	<AffiliateCta partner="dinero" variant="card" />
	<!-- Revisor matchmaking CTA at the bottom of the page. -->
	<AffiliateCta partner="revisor" variant="card" />
</section>

<!-- Final CTA: clean, consistent with homepage -->
<section class="border-border border-t">
	<div class="mx-auto max-w-6xl px-6 py-20">
		<div class="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
			<div>
				<h2 class="text-3xl leading-tight">
					Klar til din første <span class="text-primary italic">faktura?</span>
				</h2>
				<p class="text-muted-foreground mt-2">
					Det tager under et minut. Ingen konto, ingen kreditkort.
				</p>
			</div>
			<Button size="lg" href="/generator/" class="px-8 py-3 text-base">Start gratis</Button>
		</div>
	</div>
</section>

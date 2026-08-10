<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import AffiliateCta from '$lib/components/AffiliateCta.svelte';
	import { startCheckout } from '$lib/billing/checkout-client';

	let purchasingPlan = $state<string | null>(null);
	let checkoutError = $state('');

	/**
	 * Purchase handler for the pricing buttons.
	 *
	 * POSTs to `/api/billing/checkout` with the chosen plan id and redirects
	 * to the returned Stripe checkout URL. The server responds 401 when the
	 * visitor is not signed in, in which case we route to the login page
	 * (Better Auth has no login UI yet — the marketing layout shows a "Log
	 * ind" nav link to `/login/`).
	 */
	async function purchase(planId: string) {
		if (purchasingPlan) return;
		purchasingPlan = planId;
		checkoutError = '';
		try {
			const result = await startCheckout(planId);
			if ('error' in result) {
				if (result.status === 401) {
					window.location.href = `/login/?next=${encodeURIComponent('/pris/')}`;
					return;
				}
				checkoutError = result.error;
				return;
			}
			window.location.href = result.paymentUrl;
		} finally {
			purchasingPlan = null;
		}
	}

	// Editorial pricing data — feature copy kept in Danish, rendered inline
	// with accent dots rather than as card bullet lists.
	const proFeatures = [
		'Cloud-arkiv og fakturahistorik',
		'Klientdatabase med autofyld',
		'Automatisk fakturanummerering',
		'Betalingsstatus og rykkerflow',
		'Regnskabseksport (CSV og SAF-T)'
	];

	const gratisFeatures = [
		'Ubegrænsede fakturaer',
		'PDF uden vandmærke',
		'CVR-opslag',
		'Automatisk moms',
		'Dansk og engelsk'
	];
</script>

<svelte:head>
	<title>Priser - Gratis og Pro | skabelontilfaktura.dk</title>
	<meta
		name="description"
		content="Lav fakturaer gratis. Pro koster 49 DKK/måned og giver cloud-arkiv, klientdatabase, automatisk nummerering, rykkerflow og regnskabseksport."
	/>
</svelte:head>

<!-- Hero: left-aligned, editorial -->
<section class="mx-auto max-w-6xl px-6 pt-20 pb-12 lg:pt-28">
	<p class="text-primary mb-5 text-sm font-medium tracking-wide">Enkelt og gennemsigtigt</p>
	<h1 class="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">Priser</h1>
	<p class="text-muted-foreground mt-6 max-w-xl text-lg leading-relaxed">
		Lav fakturaer gratis. Opgrader, når du vil gemme dem og holde styr på betalingerne.
	</p>
</section>

<!-- Baseline: Gratis as a footnote, not a card -->
<section class="mx-auto max-w-6xl px-6">
	<div class="border-border border-b pb-6">
		<p class="text-muted-foreground text-sm leading-relaxed">
			<span class="text-foreground font-medium" style="font-family: var(--font-display)"
				>Gratis til den hurtige faktura.</span
			>
			Lav og download ubegrænsede fakturaer uden konto eller kreditkort.
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

<!-- Pricing spread: Pro as hero, with a discoverable product tour. -->
<section class="mx-auto max-w-6xl px-6 py-16">
	{#if checkoutError}
		<div
			class="border-destructive/30 bg-destructive/10 text-destructive mb-8 rounded-lg border px-4 py-3 text-sm"
			role="alert"
			aria-live="assertive"
		>
			<p class="font-medium">Betalingen kunne ikke åbnes</p>
			<p class="mt-1">{checkoutError}</p>
		</div>
	{/if}

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
				For selvstændige, der vil have styr på kunder, fakturaer og betalinger uden at skifte til et
				fuldt regnskabsprogram.
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
				<Button
					size="lg"
					class="px-7"
					onclick={() => purchase('pro')}
					disabled={purchasingPlan !== null}
				>
					{purchasingPlan === 'pro' ? 'Åbner betaling…' : 'Start Pro'}
				</Button>
				<Button
					variant="outline"
					onclick={() => purchase('pro_annual')}
					disabled={purchasingPlan !== null}
				>
					{purchasingPlan === 'pro_annual' ? 'Åbner betaling…' : '490 DKK / år'}
				</Button>
				<span class="text-muted-foreground text-xs">To måneder gratis med årsbetaling</span>
			</div>
		</div>

		<!-- Product tour: make every paid feature discoverable before purchase. -->
		<div class="border-border lg:border-l lg:pl-16">
			<p class="text-muted-foreground text-sm font-medium tracking-wide">Sådan bruges Pro</p>
			<h2 class="mt-3 text-3xl leading-tight">Få styr på hele fakturaforløbet</h2>
			<div class="mt-6 space-y-5 text-sm">
				<div>
					<p class="font-semibold">Fakturaer</p>
					<p class="text-muted-foreground mt-1">
						Gem PDF og fakturadata i cloud, find tidligere fakturaer og skift status.
					</p>
				</div>
				<div>
					<p class="font-semibold">Klienter</p>
					<p class="text-muted-foreground mt-1">
						Gem kundedata én gang og vælg klienten direkte i generatoren.
					</p>
				</div>
				<div>
					<p class="font-semibold">Eksport</p>
					<p class="text-muted-foreground mt-1">
						Hent SAF-T XML eller CSV for en valgt regnskabsperiode.
					</p>
				</div>
				<div>
					<p class="font-semibold">Rykkere og nummerering</p>
					<p class="text-muted-foreground mt-1">
						Cloud-fakturaer nummereres automatisk. På fakturasiden kan du sende næste lovlige
						rykkertrin.
					</p>
				</div>
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

<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import AffiliateCta from '$lib/components/AffiliateCta.svelte';
</script>

<svelte:head>
	<title>Priser - Pro og Business | skabelontilfaktura.dk</title>
	<meta
		name="description"
		content="Pro fra 49 DKK/måned. Cloud-lagring, klientdatabase, SAF-T 2.0 eksport og rykkermails. Business med Peppol e-faktura."
	/>
</svelte:head>

<section class="mx-auto max-w-5xl px-4 py-16">
	<h1 class="text-center text-4xl font-bold">Priser</h1>
	<p class="text-muted-foreground mt-3 text-center">Start gratis. Opgrader når du er klar.</p>

	<div class="mt-12 grid gap-6 md:grid-cols-3">
		<div class="border-border rounded-xl border p-6">
			<h2 class="text-lg font-semibold">Gratis</h2>
			<p class="text-muted-foreground mt-1 text-sm">For enkelte fakturaer</p>
			<p class="mt-4 text-4xl font-bold">0 DKK</p>
			<ul class="text-muted-foreground mt-6 space-y-2 text-sm">
				<li>✓ Ubegrænsede fakturaer</li>
				<li>✓ PDF-download uden vandmærke</li>
				<li>✓ CVR-opslag</li>
				<li>✓ Automatisk moms</li>
				<li>✓ Dansk og engelsk</li>
			</ul>
			<Button variant="outline" class="mt-6 w-full" href="/generator/">Start gratis</Button>
		</div>

		<div class="border-primary rounded-xl border-2 p-6">
			<div class="flex items-center justify-between">
				<h2 class="text-lg font-semibold">Pro</h2>
				<span class="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs"
					>Populær</span
				>
			</div>
			<p class="text-muted-foreground mt-1 text-sm">For selvstændige</p>
			<p class="mt-4 text-4xl font-bold">
				49 DKK<span class="text-muted-foreground text-base font-normal">/måned</span>
			</p>
			<ul class="text-muted-foreground mt-6 space-y-2 text-sm">
				<li>Alt fra Gratis</li>
				<li>✓ Cloud-lagring (5 år)</li>
				<li>✓ Klientdatabase</li>
				<li>✓ SAF-T 2.0 eksport</li>
				<li>✓ Rykkermails</li>
				<li>✓ Nummerering på tværs af enheder</li>
			</ul>
			<Button class="mt-6 w-full">Opgrader til Pro</Button>
		</div>

		<div class="border-border rounded-xl border p-6">
			<h2 class="text-lg font-semibold">Business</h2>
			<p class="text-muted-foreground mt-1 text-sm">For små teams</p>
			<p class="mt-4 text-4xl font-bold">
				149 DKK<span class="text-muted-foreground text-base font-normal">/måned</span>
			</p>
			<ul class="text-muted-foreground mt-6 space-y-2 text-sm">
				<li>Alt fra Pro</li>
				<li>✓ Peppol e-faktura</li>
				<li>✓ 2-5 brugere</li>
				<li>✓ API-adgang</li>
				<li>✓ White-label PDF'er</li>
			</ul>
			<Button variant="outline" class="mt-6 w-full">Kontakt os</Button>
		</div>
	</div>

	<div class="bg-muted/30 mt-12 rounded-xl p-6 text-center">
		<h3 class="font-semibold">Livstids-Pro</h3>
		<p class="text-muted-foreground mt-1 text-sm">Betal én gang, brug for evigt. 999 DKK.</p>
	</div>

	<!-- Brug for et fuldt regnskabsprogram? Affiliate CTA after the pricing tiers. -->
	<div class="mt-12">
		<AffiliateCta partner="dinero" variant="card" />
	</div>

	<!-- Revisor matchmaking CTA at the bottom of the page. -->
	<div class="mt-8">
		<AffiliateCta partner="revisor" variant="card" />
	</div>
</section>

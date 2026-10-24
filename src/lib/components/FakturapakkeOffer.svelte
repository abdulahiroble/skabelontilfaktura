<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { trackEvent } from '$lib/analytics';

	let { source = 'page' }: { source?: string } = $props();
</script>

<section
	class="border-border mx-auto max-w-6xl border-y px-6 py-12 sm:py-16"
	aria-label="Fakturapakken"
>
	<div class="grid items-start gap-8 md:grid-cols-[1.4fr_0.6fr] md:gap-16">
		<div>
			<p class="text-accent text-sm font-medium">Fakturapakken · Word og Excel</p>
			<h2 class="mt-3 text-3xl leading-tight">Fra første tilbud til sidste faktura.</h2>
			<p class="text-muted-foreground mt-4 max-w-xl leading-relaxed">
				Få fire redigerbare dokumentskabeloner, et Excel-ark med beregninger og en kort guide. Gem
				filerne på din computer, og genbrug dem til næste kundeopgave.
			</p>
			<p class="text-muted-foreground mt-3 text-sm">
				Den gratis generator er stadig gratis. Pakken er til dig, der foretrækker egne filer.
			</p>
		</div>
		<div class="md:border-border md:border-l md:pl-8">
			<p class="text-4xl font-semibold" style="font-family: var(--font-display)">99 kr.</p>
			<p class="text-muted-foreground mt-2 text-sm">Inkl. moms · Betal én gang</p>
			<Button
				class="mt-5"
				href="/pris/"
				onclick={() => trackEvent('kit_offer_clicked', { source })}
			>
				Se hvad du får
			</Button>
			<p class="text-muted-foreground mt-3 text-xs">Ingen abonnement. Ingen cloud-arkiv.</p>
		</div>
	</div>
</section>

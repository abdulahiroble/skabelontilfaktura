<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { startCheckout } from '$lib/billing/checkout-client';
	import { trackEvent } from '$lib/analytics';
	import { buildMeta } from '$lib/seo';
	import { KIT } from '$lib/billing/kit';

	const meta = buildMeta({
		title: 'Fakturapakken – Word og Excel til 99 kr.',
		description:
			'Køb faktura, tilbud og kreditnota i Word samt Excel med momsberegning. Guide og betalingspåmindelse medfølger. 99 kr. inkl. moms, én betaling.',
		canonical: '/pris/'
	});
	let purchasing = $state(false);
	let checkoutError = $state('');
	let availability = $state<'checking' | 'open' | 'closed'>('checking');
	const contents = [
		['Faktura med og uden moms', 'To Word-skabeloner. Vælg den, der passer til dit salg.'],
		['Tilbud og kreditnota', 'To matchende Word-skabeloner til før og efter fakturaen.'],
		[
			'Excel med beregninger',
			'Fire dokumentark og et udfyldt regneeksempel. Moms og total beregnes med formler.'
		],
		[
			'Guide og betalingspåmindelse',
			'Kom godt i gang, tjek oplysningerne, og send en venlig påmindelse uden gebyrer.'
		]
	];
	onMount(() => {
		trackEvent('kit_viewed', { item_id: KIT.id, currency: KIT.currency, value: KIT.price });
		const controller = new AbortController();
		fetch('/api/billing/availability', { signal: controller.signal })
			.then(async (response) => {
				const result = (await response.json()) as { available?: unknown };
				availability = response.ok && result.available === true ? 'open' : 'closed';
			})
			.catch(() => {
				if (!controller.signal.aborted) availability = 'closed';
			});
		return () => controller.abort();
	});

	async function purchase() {
		if (purchasing || availability !== 'open') return;
		purchasing = true;
		checkoutError = '';
		trackEvent('kit_checkout_requested', {
			item_id: KIT.id,
			currency: KIT.currency,
			value: KIT.price
		});
		try {
			const result = await startCheckout(KIT.id);
			if ('error' in result) {
				if (result.status === 401) {
					window.location.href = '/login/?next=%2Fpris%2F';
					return;
				}
				checkoutError = result.error;
				trackEvent('kit_checkout_failed', { code: result.code ?? 'UNKNOWN' });
				return;
			}
			trackEvent('begin_checkout', { item_id: KIT.id, currency: KIT.currency, value: KIT.price });
			window.location.href = result.paymentUrl;
		} finally {
			purchasing = false;
		}
	}
</script>

<svelte:head>
	<title>{meta.title}</title>
	<meta name="description" content={meta.description} />
	<link rel="canonical" href={meta.canonical} />
	<meta property="og:title" content={meta.title} />
	<meta property="og:description" content={meta.description} />
	<meta property="og:url" content={meta.canonical} />
	<meta property="og:type" content="website" />
</svelte:head>

<div class="mx-auto max-w-6xl px-6 py-14 sm:py-20">
	<header class="max-w-3xl">
		<p class="text-accent text-sm font-medium tracking-wide">FAKTURAPAKKEN · VERSION 1.0</p>
		<h1 class="mt-5 text-4xl leading-tight font-semibold tracking-tight sm:text-6xl">
			Dine dokumenter.<br /><span class="text-primary italic">Ikke endnu et abonnement.</span>
		</h1>
		<p class="text-muted-foreground mt-6 max-w-2xl text-lg leading-relaxed">
			Faktura, tilbud og kreditnota i et samlet sæt til Word og Excel. Download filerne, tilpas dem,
			og gem en ny kopi til hver kundeopgave.
		</p>
	</header>

	<div class="mt-12 grid gap-12 lg:grid-cols-[1.25fr_0.75fr] lg:gap-20">
		<section aria-labelledby="contents">
			<h2 id="contents" class="text-2xl">Det får du i pakken</h2>
			<dl class="mt-6">
				{#each contents as [title, description] (title)}
					<div class="border-border border-t py-5">
						<dt class="font-semibold">{title}</dt>
						<dd class="text-muted-foreground mt-2 text-sm leading-relaxed">{description}</dd>
					</div>
				{/each}
			</dl>
			<p class="text-muted-foreground text-sm">
				8 filer i én ZIP: 6 Word-filer, 1 Excel-fil med 5 ark og en læs-mig-fil. Ingen makroer.
				Word-beløb udfyldes manuelt; Excel indeholder formler.
			</p>
		</section>

		<aside
			class="border-border border-y py-7 lg:border-y-0 lg:border-l lg:py-0 lg:pl-10"
			aria-label="Køb Fakturapakken"
		>
			<p class="text-6xl font-semibold tracking-tight" style="font-family: var(--font-display)">
				99 kr.
			</p>
			<p class="text-muted-foreground mt-3">Inklusive 25% moms. Én betaling.</p>
			<p class="text-muted-foreground mt-5 text-sm leading-relaxed">
				Du køber de færdige filer i version 1.0 til brug i din egen virksomhed. Ingen binding,
				cloud-arkiv eller automatisk fornyelse.
			</p>
			<Button
				size="lg"
				class="mt-7 w-full"
				onclick={purchase}
				disabled={purchasing || availability !== 'open'}
			>
				{purchasing
					? 'Åbner betaling…'
					: availability === 'checking'
						? 'Tjekker betaling…'
						: availability === 'closed'
							? 'Salget åbner snart'
							: 'Køb og download · 99 kr.'}
			</Button>
			{#if availability === 'closed'}
				<p class="text-muted-foreground mt-3 text-sm" role="status">
					Vi færdiggør betalingen og leveringen. Der kan ikke købes endnu. Den gratis generator kan
					bruges som normalt.
				</p>
			{/if}
			<p class="text-muted-foreground mt-3 text-xs leading-relaxed">
				Log ind eller opret en konto før betaling. Efter bekræftet betaling finder du filerne under
				Mine køb.
			</p>
			<p class="text-muted-foreground mt-3 text-xs leading-relaxed">
				Betaling via Stripe. Læs <a class="text-primary underline" href="/handelsbetingelser/"
					>handelsbetingelserne</a
				>. Som forbruger har du 14 dages fortrydelsesret.
			</p>
			{#if checkoutError}
				<p class="text-destructive mt-5 text-sm" role="alert">{checkoutError}</p>
			{/if}
		</aside>
	</div>

	<section class="border-border mt-14 border-t pt-10" aria-labelledby="preview">
		<h2 id="preview" class="text-2xl">Samme oplysninger. Tre forskellige dokumenter.</h2>
		<p class="text-muted-foreground mt-3 max-w-2xl">
			Eksempel på regnegangen i Excel. Alle beløb her er illustrative, ikke en faktura.
		</p>
		<div class="mt-6 grid gap-5 sm:grid-cols-3">
			{#each ['TILBUD', 'FAKTURA', 'KREDITNOTA'] as title (title)}
				<div class="border-border bg-card border p-6">
					<p class="text-accent text-xs font-semibold tracking-wider">{title}</p>
					<p class="mt-5 text-sm">Rådgivning · 2 timer à 750 kr.</p>
					<dl class="text-muted-foreground mt-4 space-y-2 text-sm">
						<div class="flex justify-between gap-2">
							<dt>Ekskl. moms</dt>
							<dd>{title === 'KREDITNOTA' ? '−' : ''}1.500 kr.</dd>
						</div>
						<div class="flex justify-between gap-2">
							<dt>Moms 25%</dt>
							<dd>{title === 'KREDITNOTA' ? '−' : ''}375 kr.</dd>
						</div>
						<div
							class="border-border text-foreground flex justify-between gap-2 border-t pt-3 font-semibold"
						>
							<dt>I alt</dt>
							<dd>{title === 'KREDITNOTA' ? '−' : ''}1.875 kr.</dd>
						</div>
					</dl>
				</div>
			{/each}
		</div>
	</section>

	<section class="mt-14 grid gap-8 md:grid-cols-2" aria-label="Spørgsmål om pakken">
		<div>
			<h2 class="text-xl">Skal jeg købe pakken for at lave en faktura?</h2>
			<p class="text-muted-foreground mt-3 leading-relaxed">
				Nej. <a href="/generator/" class="text-primary underline">Generatoren</a> og vores enkle gratis
				skabeloner er stadig gratis. Pakken er et tilvalg til dig, der vil genbruge et samlet sæt filer.
			</p>
		</div>
		<div>
			<h2 class="text-xl">Hvilke programmer skal jeg bruge?</h2>
			<p class="text-muted-foreground mt-3 leading-relaxed">
				Word eller et program, der kan åbne .docx, og Excel eller et program, der kan åbne .xlsx.
				Layout og formler kan variere i andre programmer. Softwarelicenser er ikke inkluderet.
			</p>
		</div>
		<div>
			<h2 class="text-xl">Er dette et bogføringssystem?</h2>
			<p class="text-muted-foreground mt-3 leading-relaxed">
				Nej. Du står selv for bogføring, korrekt nummerering og opbevaring. Pakken erstatter ikke
				eventuelle krav om digital bogføring og er ikke personlig skatte- eller juridisk rådgivning.
			</p>
		</div>
		<div>
			<h2 class="text-xl">Hvor længe kan jeg bruge filerne?</h2>
			<p class="text-muted-foreground mt-3 leading-relaxed">
				De downloadede filer kan du beholde og genbruge. Købet omfatter version 1.0, ikke løbende
				opdateringer eller en garanti om fremtidig adgang til hjemmesiden. Tag selv backup.
			</p>
		</div>
	</section>
</div>

<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { buildMeta, softwareApplicationSchema, organizationSchema } from '$lib/seo';

	const meta = buildMeta({
		title: 'Skabelon til faktura - Lav en faktura på 60 sekunder',
		description:
			'Lav en gratis og lovlig dansk faktura på 60 sekunder. CVR-opslag, automatisk moms, MobilePay og PDF-download. Ingen tilmelding nødvendig.',
		canonical: '/',
		ogType: 'website'
	});

	const organization = organizationSchema({
		name: 'skabelontilfaktura.dk',
		url: 'https://skabelontilfaktura.dk',
		description:
			'Danmarks nemmeste fakturaskabelon. Lav en gratis og lovlig faktura på 60 sekunder.'
	});

	const softwareApplication = softwareApplicationSchema({
		name: 'skabelontilfaktura.dk',
		description:
			'Gratis og lovlig dansk fakturaskabelon med automatisk moms, CVR-opslag og PDF-download.',
		applicationCategory: 'BusinessApplication',
		operatingSystem: 'Web',
		offers: {
			price: 0,
			priceCurrency: 'DKK'
		}
	});

	const jsonLd = [organization, softwareApplication];
	// Avoid emitting a literal `<script` token in source so the Svelte/prettier
	// parsers don't mistake the JSON-LD string for a real inline script block.
	// Content is built from trusted schema.org objects (no user input).
	const lt = String.fromCharCode(60);
	const jsonLdScript = `${lt}script type="application/ld+json">${JSON.stringify(jsonLd)}${lt}/script>`;
</script>

<svelte:head>
	<title>{meta.title}</title>
	<meta name="description" content={meta.description} />
	<link rel="canonical" href={meta.canonical} />
	<meta name="robots" content={meta.robots} />
	<meta property="og:type" content={meta.ogType} />
	<meta property="og:title" content={meta.title} />
	<meta property="og:description" content={meta.description} />
	<meta property="og:url" content={meta.canonical} />
	<meta property="og:site_name" content="skabelontilfaktura.dk" />
	<meta property="og:locale" content="da_DK" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={meta.title} />
	<meta name="twitter:description" content={meta.description} />
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- content is built from trusted schema.org objects, no user input -->
	{@html jsonLdScript}
</svelte:head>

<!-- Hero: asymmetric, left-aligned, with invoice mockup -->
<section
	class="mx-auto grid max-w-6xl gap-12 px-6 pt-20 pb-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8 lg:pt-28"
>
	<div class="flex flex-col justify-center">
		<p class="text-primary mb-5 text-sm font-medium tracking-wide">Gratis og lovlig faktura</p>
		<h1 class="text-4xl leading-[1.05] font-semibold tracking-tight sm:text-5xl lg:text-6xl">
			Lav en faktura
			<span class="text-muted-foreground italic">på 60 sekunder</span>
		</h1>
		<p class="text-muted-foreground mt-6 max-w-md text-lg leading-relaxed">
			Danmarks nemmeste fakturaskabelon. Automatisk moms, CVR-opslag og PDF-download. Ingen
			tilmelding, ingen vandmærke.
		</p>
		<div class="mt-8 flex flex-wrap items-center gap-4">
			<Button size="lg" href="/generator/" class="px-7">Lav min faktura</Button>
			<a
				href="/pris/"
				class="text-muted-foreground decoration-accent hover:text-foreground text-sm font-medium underline decoration-2 underline-offset-4 transition-colors"
			>
				Se priser og funktioner
			</a>
		</div>
	</div>

	<!-- Invoice mockup -->
	<div class="relative hidden justify-center lg:flex">
		<div
			class="border-border bg-card shadow-primary/5 relative w-full max-w-sm rotate-[2deg] rounded-lg border p-8 shadow-xl"
		>
			<div class="border-border mb-6 flex items-start justify-between border-b pb-4">
				<div>
					<p class="text-muted-foreground text-xs tracking-wider uppercase">Faktura</p>
					<p class="mt-1 text-lg" style="font-family: var(--font-display)">2026-0042</p>
				</div>
				<div class="text-right">
					<p class="text-muted-foreground text-xs">Dato</p>
					<p class="text-sm font-medium">23. jul 2026</p>
				</div>
			</div>
			<div class="mb-6 space-y-1">
				<p class="text-muted-foreground text-xs tracking-wider uppercase">Fra</p>
				<p class="text-sm font-medium">Ahir Design Studio ApS</p>
				<p class="text-muted-foreground text-xs">CVR 42833716</p>
			</div>
			<div class="mb-6 space-y-2">
				<div class="border-border flex justify-between border-b pb-2 text-sm">
					<span class="text-muted-foreground">Webdesign - landingsside</span>
					<span class="font-medium">8.000,00</span>
				</div>
				<div class="border-border flex justify-between border-b pb-2 text-sm">
					<span class="text-muted-foreground">Konsultation (4 timer)</span>
					<span class="font-medium">2.400,00</span>
				</div>
			</div>
			<div class="space-y-1.5 text-sm">
				<div class="text-muted-foreground flex justify-between">
					<span>Subtotal ekskl. moms</span>
					<span>10.400,00 kr.</span>
				</div>
				<div class="text-muted-foreground flex justify-between">
					<span>Moms (25%)</span>
					<span>2.600,00 kr.</span>
				</div>
				<div class="border-border mt-2 flex justify-between border-t pt-2 text-base font-semibold">
					<span>Total</span>
					<span>13.000,00 kr.</span>
				</div>
			</div>
			<div
				class="bg-accent text-accent-foreground absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold"
			>
				✓
			</div>
		</div>
	</div>
</section>

<!-- Trust band: single horizontal line, not a card grid -->
<section class="border-border bg-secondary/40 border-y">
	<div class="mx-auto max-w-6xl px-6 py-5">
		<div
			class="text-muted-foreground flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm"
		>
			<span class="flex items-center gap-2">
				<span class="bg-accent h-1.5 w-1.5 rounded-full"></span>
				Automatisk moms-beregning (25%)
			</span>
			<span class="flex items-center gap-2">
				<span class="bg-accent h-1.5 w-1.5 rounded-full"></span>
				CVR-opslag fra Erhvervsstyrelsen
			</span>
			<span class="flex items-center gap-2">
				<span class="bg-accent h-1.5 w-1.5 rounded-full"></span>
				Overholder Momsloven § 52a
			</span>
			<span class="flex items-center gap-2">
				<span class="bg-accent h-1.5 w-1.5 rounded-full"></span>
				Uden vandmærke
			</span>
		</div>
	</div>
</section>

<!-- Feature: editorial alternating layout -->
<section class="mx-auto max-w-6xl px-6 py-20">
	<div class="grid gap-12 lg:grid-cols-3 lg:gap-8">
		<div class="lg:col-span-1">
			<p class="text-accent mb-2 text-sm font-medium">01</p>
			<h2 class="text-2xl leading-tight">Alt hvad loven kræver, automatisk</h2>
			<p class="text-muted-foreground mt-4 text-sm leading-relaxed">
				Fakturanummer, momsbeløb, forfaldsdato, CVR. Vi kender reglerne i Momsloven, så du ikke
				behøver.
			</p>
		</div>
		<div class="lg:col-span-1">
			<p class="text-accent mb-2 text-sm font-medium">02</p>
			<h2 class="text-2xl leading-tight">Skriv dit CVR, vi udfylder resten</h2>
			<p class="text-muted-foreground mt-4 text-sm leading-relaxed">
				Indtast et CVR-nummer og vi henter firmanavn, adresse og postnummer direkte fra det
				offentlige register.
			</p>
		</div>
		<div class="lg:col-span-1">
			<p class="text-accent mb-2 text-sm font-medium">03</p>
			<h2 class="text-2xl leading-tight">Download som PDF, send med det samme</h2>
			<p class="text-muted-foreground mt-4 text-sm leading-relaxed">
				Professionelt udseende PDF uden vandmærke. Klar til at sende til din kunde på sekunder.
			</p>
		</div>
	</div>
</section>

<!-- CTA -->
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

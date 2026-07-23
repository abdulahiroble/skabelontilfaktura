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

	<!-- Open Graph -->
	<meta property="og:type" content={meta.ogType} />
	<meta property="og:title" content={meta.title} />
	<meta property="og:description" content={meta.description} />
	<meta property="og:url" content={meta.canonical} />
	<meta property="og:site_name" content="skabelontilfaktura.dk" />
	<meta property="og:locale" content="da_DK" />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={meta.title} />
	<meta name="twitter:description" content={meta.description} />

	<!-- JSON-LD structured data -->
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- content is built from trusted schema.org objects, no user input -->
	{@html jsonLdScript}
</svelte:head>

<section class="mx-auto max-w-6xl px-4 py-20 text-center">
	<h1 class="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
		Lav en faktura på 60 sekunder
	</h1>
	<p class="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg">
		Gratis og lovlig fakturaskabelon med automatisk moms, CVR-opslag og PDF-download. Ingen
		tilmelding nødvendig.
	</p>
	<div class="mt-8 flex items-center justify-center gap-3">
		<Button size="lg" href="/generator/">Start gratis faktura</Button>
		<Button size="lg" variant="outline" href="/pris/">Se priser</Button>
	</div>
</section>

<section class="border-border bg-muted/30 border-t py-16">
	<div class="mx-auto grid max-w-5xl gap-8 px-4 md:grid-cols-3">
		<div class="text-center">
			<div
				class="bg-primary text-primary-foreground mx-auto flex h-12 w-12 items-center justify-center rounded-lg"
			>
				⚡
			</div>
			<h3 class="mt-4 font-semibold">Hurtig og nem</h3>
			<p class="text-muted-foreground mt-1 text-sm">
				Udfyld felterne og download din faktura som PDF med det samme.
			</p>
		</div>
		<div class="text-center">
			<div
				class="bg-primary text-primary-foreground mx-auto flex h-12 w-12 items-center justify-center rounded-lg"
			>
				✓
			</div>
			<h3 class="mt-4 font-semibold">Overholder lovgivning</h3>
			<p class="text-muted-foreground mt-1 text-sm">
				Alle obligatoriske felter per Momsloven § 52a er inkluderet.
			</p>
		</div>
		<div class="text-center">
			<div
				class="bg-primary text-primary-foreground mx-auto flex h-12 w-12 items-center justify-center rounded-lg"
			>
				Gratis
			</div>
			<h3 class="mt-4 font-semibold">Helt gratis</h3>
			<p class="text-muted-foreground mt-1 text-sm">
				Ingen vandmærke, ingen tilmelding. Bare en god faktura.
			</p>
		</div>
	</div>
</section>

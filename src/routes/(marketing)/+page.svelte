<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { buildMeta, softwareApplicationSchema, organizationSchema } from '$lib/seo';
	import { BRANCHES } from '$lib/branches';

	const branchCount = BRANCHES.length;

	const meta = buildMeta({
		title: 'Gratis fakturaskabelon på 60 sekunder',
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
				CVR-opslag fra CVR-registret
			</span>
			<span class="flex items-center gap-2">
				<span class="bg-accent h-1.5 w-1.5 rounded-full"></span>
				Understøtter Momsloven § 52a
			</span>
			<span class="flex items-center gap-2">
				<span class="bg-accent h-1.5 w-1.5 rounded-full"></span>
				Uden vandmærke
			</span>
		</div>
	</div>
</section>

<!-- Free template downloads -->
<section class="mx-auto max-w-6xl px-6 py-16">
	<div class="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
		<div class="flex flex-col justify-center">
			<h2 class="text-3xl leading-tight font-semibold tracking-tight">
				Hent en gratis <span class="text-primary italic">fakturaskabelon</span>
			</h2>
			<p class="text-muted-foreground mt-4 max-w-md leading-relaxed">
				Foretrækker du selv at udfylde? Download vores skabelon i Word, Excel eller PDF - med alle
				lovpligtige felter: fakturanummer, CVR, moms m.m. Ingen tilmelding.
			</p>
			<p class="text-muted-foreground mt-3 text-sm">
				Excel-versionen beregner moms og total automatisk med formler.
			</p>
		</div>
		<div class="grid content-center gap-3 sm:grid-cols-3">
			<a
				href="/templates/faktura-skabelon.docx"
				download
				class="border-border bg-card hover:border-accent group flex flex-col rounded-lg border p-5 transition-colors"
			>
				<span class="text-2xl font-semibold">Word</span>
				<span class="text-muted-foreground mt-1 text-xs">.docx - redigerbar</span>
				<span class="text-primary mt-3 text-sm font-medium">Download &rarr;</span>
			</a>
			<a
				href="/templates/faktura-skabelon.xlsx"
				download
				class="border-border bg-card hover:border-accent group flex flex-col rounded-lg border p-5 transition-colors"
			>
				<span class="text-2xl font-semibold">Excel</span>
				<span class="text-muted-foreground mt-1 text-xs">.xlsx - med momsformler</span>
				<span class="text-primary mt-3 text-sm font-medium">Download &rarr;</span>
			</a>
			<a
				href="/templates/faktura-skabelon.pdf"
				download
				class="border-border bg-card hover:border-accent group flex flex-col rounded-lg border p-5 transition-colors"
			>
				<span class="text-2xl font-semibold">PDF</span>
				<span class="text-muted-foreground mt-1 text-xs">.pdf - printklar</span>
				<span class="text-primary mt-3 text-sm font-medium">Download &rarr;</span>
			</a>
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
				Indtast et CVR-nummer og vi henter firmanavn, adresse og postnummer automatisk via
				CVR-registret.
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

<!-- Internal links: templates by trade + guides -->
<section class="border-border bg-secondary/40 border-y">
	<div class="mx-auto max-w-6xl px-6 py-16">
		<div class="grid gap-10 lg:grid-cols-2 lg:gap-16">
			<div>
				<h2 class="text-xl font-semibold tracking-tight">Skabelon til dit erhverv</h2>
				<p class="text-muted-foreground mt-2 text-sm leading-relaxed">
					Fakturaskabelon med typiske poster og priser for dit fag - fra elektriker og tømrer til
					fotograf og DJ.
				</p>
				<ul class="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
					<li>
						<a
							href="/skabeloner/elektriker/"
							class="hover:text-primary decoration-border hover:decoration-accent underline underline-offset-4"
							>Elektriker</a
						>
					</li>
					<li>
						<a
							href="/skabeloner/toemrer/"
							class="hover:text-primary decoration-border hover:decoration-accent underline underline-offset-4"
							>Tømrer</a
						>
					</li>
					<li>
						<a
							href="/skabeloner/maler/"
							class="hover:text-primary decoration-border hover:decoration-accent underline underline-offset-4"
							>Maler</a
						>
					</li>
					<li>
						<a
							href="/skabeloner/vvs/"
							class="hover:text-primary decoration-border hover:decoration-accent underline underline-offset-4"
							>VVS</a
						>
					</li>
					<li>
						<a
							href="/skabeloner/fotograf/"
							class="hover:text-primary decoration-border hover:decoration-accent underline underline-offset-4"
							>Fotograf</a
						>
					</li>
					<li>
						<a
							href="/skabeloner/it-konsulent/"
							class="hover:text-primary decoration-border hover:decoration-accent underline underline-offset-4"
							>IT-konsulent</a
						>
					</li>
				</ul>
				<a
					href="/skabeloner/"
					class="text-primary decoration-accent mt-4 inline-block text-sm font-medium underline decoration-2 underline-offset-4"
				>
					Se alle {branchCount} erhverv &rarr;
				</a>
			</div>
			<div>
				<h2 class="text-xl font-semibold tracking-tight">Guides om fakturering</h2>
				<p class="text-muted-foreground mt-2 text-sm leading-relaxed">
					Alt om reglerne, formaterne og hverdagen med fakturaer - skrevet på dansk.
				</p>
				<ul class="mt-4 space-y-1.5 text-sm">
					<li>
						<a
							href="/blog/krav-til-faktura/"
							class="hover:text-primary decoration-border hover:decoration-accent underline underline-offset-4"
							>Hvad skal en faktura indeholde? (lovkrav)</a
						>
					</li>
					<li>
						<a
							href="/blog/faktura-skabelon-excel/"
							class="hover:text-primary decoration-border hover:decoration-accent underline underline-offset-4"
							>Faktura skabelon til Excel</a
						>
					</li>
					<li>
						<a
							href="/blog/faktura-skabelon-word/"
							class="hover:text-primary decoration-border hover:decoration-accent underline underline-offset-4"
							>Faktura skabelon til Word</a
						>
					</li>
					<li>
						<a
							href="/blog/faktura-skabelon-pdf/"
							class="hover:text-primary decoration-border hover:decoration-accent underline underline-offset-4"
							>Faktura skabelon som PDF</a
						>
					</li>
					<li>
						<a
							href="/blog/faktura-uden-cvr/"
							class="hover:text-primary decoration-border hover:decoration-accent underline underline-offset-4"
							>Faktura uden CVR-nummer</a
						>
					</li>
					<li>
						<a
							href="/blog/faktura-skabelon-faq/"
							class="hover:text-primary decoration-border hover:decoration-accent underline underline-offset-4"
							>Ofte stillede spørgsmål</a
						>
					</li>
				</ul>
				<a
					href="/blog/"
					class="text-primary decoration-accent mt-4 inline-block text-sm font-medium underline decoration-2 underline-offset-4"
				>
					Se alle guides &rarr;
				</a>
			</div>
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

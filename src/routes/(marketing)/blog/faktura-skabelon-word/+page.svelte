<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import ArticleLayout from '$lib/components/ArticleLayout.svelte';
	import {
		ARTICLE_AUTHOR,
		ARTICLE_DATES,
		blogPostingSchema,
		buildMeta,
		howToSchema,
		breadcrumbSchema,
		type HowToStep,
		type BreadcrumbItem
	} from '$lib/seo';

	const articleDates = ARTICLE_DATES.word;

	const meta = buildMeta({
		title: 'Faktura skabelon Word – gratis download',
		description:
			'Download en gratis faktura skabelon til Word uden tilmelding. Hent .docx, se hvilke felter du skal udfylde, eller vælg et samlet dokumentkit.',
		canonical: '/blog/faktura-skabelon-word/',
		ogType: 'article'
	});

	const howToSteps: HowToStep[] = [
		{
			name: 'Åbn Microsoft Word og vælg en skabelon',
			text: 'Åbn Word, klik på "Filer" > "Ny" og søg efter "faktura" i skabelon-biblioteket. Vælg en skabelon, der passer til din virksomhed, eller start med et blankt dokument.'
		},
		{
			name: 'Tilføj afsenderoplysninger',
			text: 'Indsæt dit firmanavn, adresse, CVR-nummer, telefon og e-mail øverst på siden. Disse oplysninger er obligatoriske efter bogføringsloven og momsloven § 52a.'
		},
		{
			name: 'Indsæt kundens oplysninger',
			text: 'Tilføj modtagerens navn, virksomhed (hvis relevant), adresse og CVR-nummer. Disse skal fremgå tydeligt, så fakturaen kan matches mod kundens bogføring.'
		},
		{
			name: 'Opret en tabel til fakturalinjer',
			text: 'Indsæt en tabel med kolonner for: dato, beskrivelse, antal, enhedspris og beløb. Dette gør fakturaen overskuelig og lettere at læse for kunden.'
		},
		{
			name: 'Tilføj moms og totalbeløb',
			text: 'Beregner moms manuelt (typisk 25%) og tilføj som en separat linje under subtotalen. Husk at angive momssatsen tydeligt på fakturaen.'
		},
		{
			name: 'Indsæt betalingsoplysninger og betingelser',
			text: 'Tilføj regnummer og kontonummer (eller MobilePay), betalingsfrist og fakturanummer. Gem dokumentet som skabelon (.dotx), så du kan genbruge det næste gang.'
		}
	];

	const breadcrumbs: BreadcrumbItem[] = [
		{ name: 'Forside', url: 'https://skabelontilfaktura.dk/' },
		{ name: 'Guides', url: 'https://skabelontilfaktura.dk/blog/' },
		{
			name: 'Faktura skabelon Word',
			url: 'https://skabelontilfaktura.dk/blog/faktura-skabelon-word/'
		}
	];

	const howTo = howToSchema(howToSteps, {
		name: 'Sådan laver du en faktura i Word',
		description:
			'Trin-for-trin guide til at oprette en professionel fakturaskabelon i Microsoft Word.'
	});
	const breadcrumb = breadcrumbSchema(breadcrumbs);
	const article = blogPostingSchema({
		headline: 'Faktura skabelon Word: Sådan laver du en i Microsoft Word (2026)',
		description: meta.description,
		url: meta.canonical,
		datePublished: articleDates.published,
		dateModified: articleDates.modified,
		authorName: ARTICLE_AUTHOR
	});
	const jsonLd = [article, howTo, breadcrumb];

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

	<!-- JSON-LD structured data -->
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- content is built from trusted schema.org objects, no user input -->
	{@html jsonLdScript}
</svelte:head>

<ArticleLayout
	title="Faktura skabelon Word: Gratis download og guide"
	subtitle="Hent en redigerbar .docx-fil uden tilmelding. Udfyld den i Word, og gem din færdige faktura som PDF."
	category="Skabeloner"
	datePublished={articleDates.published}
	dateModified={articleDates.modified}
	dateLabel={articleDates.modifiedLabel}
	author={ARTICLE_AUTHOR}
	readingTime="6 min læsning"
>
	<nav class="not-prose text-muted-foreground mb-10 text-sm" aria-label="Brødkrummer">
		<a href="/" class="hover:text-foreground">Forside</a>
		<span class="mx-2">/</span>
		<a href="/blog/" class="hover:text-foreground">Guides</a>
		<span class="mx-2">/</span>
		<span class="text-foreground">Faktura skabelon Word</span>
	</nav>

	<div class="space-y-8 leading-relaxed">
		<section class="not-prose border-border bg-muted/30 rounded-xl border p-6">
			<h2 class="text-lg font-semibold">Hent den enkle Word-skabelon gratis</h2>
			<p class="text-muted-foreground mt-2 text-sm">
				Redigerbare felter til afsender, kunde, fakturalinjer og betaling. Beløb og moms udfyldes
				manuelt.
			</p>
			<div class="mt-4 flex flex-wrap gap-3">
				<Button href="/templates/faktura-skabelon.docx" download>Download gratis .docx</Button>
				<Button href="/pris/" variant="outline">Se det samlede dokumentkit · 99 kr.</Button>
			</div>
		</section>
		<section>
			<p class="mb-4">
				At lave en faktura i Word giver dig en redigerbar fil, som du kan genbruge. Du skal selv
				have et program, der kan åbne .docx, og kontrollere beløb, moms og nummerering.
			</p>
			<p>
				I denne guide viser vi dig begge veje: Hvordan du selv bygger en fakturaskabelon i Word - og
				hvorfor en gratis online generator ofte er et bedre valg.
			</p>
		</section>

		<section>
			<h2 class="text-2xl font-bold tracking-tight">Sådan laver du en faktura i Word</h2>
			<p class="mb-4">Følg disse trin for at bygge en fungerende fakturaskabelon fra bunden:</p>
			<ol class="list-decimal space-y-3 pl-6">
				<li>
					<strong>Vælg en skabelon eller start fra bunden:</strong> Åbn Word og vælg "Filer" > "Ny" >
					søg "faktura". Vælg en skabelon, eller start med et blankt dokument.
				</li>
				<li>
					<strong>Tilføj firmanavn og logo:</strong> Indsæt din virksomheds logo, navn, adresse, CVR-nummer,
					telefon og e-mail i toppen af dokumentet. CVR-nummer er obligatorisk efter momsloven § 52a.
				</li>
				<li>
					<strong>Indsæt kundeoplysninger:</strong> Modtagerens navn, adresse og CVR-nummer (hvis virksomhed)
					skal fremgå tydeligt.
				</li>
				<li>
					<strong>Opret en tabel til linjer:</strong> Brug "Indsæt" > "Tabel" med kolonner for
					<strong>Beskrivelse, Antal, Enhedspris</strong> og <strong>Beløb</strong>.
				</li>
				<li>
					<strong>Beregn subtotal, moms og total:</strong> Brug formler (eller regn manuelt) og angiv
					momssatsen tydeligt, f.eks. "Moms (25%): 250,00 DKK".
				</li>
				<li>
					<strong>Tilføj betalingsoplysninger:</strong> Bankens regnummer, kontonummer, MobilePay-nummer
					og betalingsfrist (typisk 8, 15 eller 30 dage).
				</li>
				<li>
					<strong>Indsæt fakturanummer og dato:</strong> Hver faktura skal have et unikt fakturanummer
					og en fakturadato - det er lovkrav.
				</li>
				<li>
					<strong>Gem som skabelon:</strong> Vælg "Filer" > "Gem som" > format "Word-skabelon (.dotx)".
					Nu kan du genbruge den næste gang.
				</li>
			</ol>
		</section>

		<section>
			<h2 class="text-2xl font-bold tracking-tight">Ulemper ved Word-skabeloner</h2>
			<p class="mb-4">
				Word-skabeloner er populære, men de har væsentlige ulemper, især når din virksomhed vokser
				eller når bogføringsloven 2026 træder fuldt i kraft:
			</p>
			<ul class="list-disc space-y-2 pl-6">
				<li>
					<strong>Manuel beregning af moms</strong> - du skal selv huske momssatsen og regne beløbene
					ud. Fejl kan gøre fakturaen ulovlig.
				</li>
				<li>
					<strong>Ingen automatisk CVR-opslag</strong> - du skal selv slå modtagerens CVR op og indtaste
					det korrekt.
				</li>
				<li>
					<strong>Ingen nummerering</strong> - du skal selv holde styr på fakturanumre, hvilket let går
					galt på tværs af flere enheder.
				</li>
				<li>
					<strong>Ingen overholdelse af bogføringsloven 2026</strong> - Word kan ikke eksportere SAF-T
					2.0, og du mangler automatisk opbevaring i 5 år.
				</li>
				<li>
					<strong>Ingen integration med regnskab</strong> - du skal dobbeltbogføre i dit regnskabssystem.
				</li>
				<li>
					<strong>Risiko for sletning og versioner</strong> - filer på din computer kan let forsvinde
					eller blive overskrevet.
				</li>
			</ul>
		</section>

		<section>
			<h2 class="text-2xl font-bold tracking-tight">Bedre alternativ: Online generator</h2>
			<p class="mb-4">
				Vil du hellere arbejde direkte i browseren, kan du bruge vores gratis generator. Hos
				skabelontilfaktura.dk får du:
			</p>
			<ul class="list-disc space-y-2 pl-6">
				<li>
					<strong>Automatisk CVR-opslag</strong> - indtast bare CVR-nummeret, så udfylder vi navn og adresse
					automatisk fra Det Centrale Virksomhedsregister.
				</li>
				<li>
					<strong>Automatisk moms</strong> - vælg momssats (0%, 25%), så beregnes beløbene for dig.
				</li>
				<li>
					<strong>Lokal nummerserie</strong> - kontrollér altid nummeret mod din bogføring. Nummerserien
					deles ikke mellem browsere eller enheder.
				</li>
				<li>
					<strong>PDF-download uden vandmærke</strong> - din faktura ser professionel ud og er klar til
					at sende direkte til kunden.
				</li>
				<li>
					<strong>Gratis kladde i browseren</strong> - gem selv PDF og backup, når du er færdig.
				</li>
				<li>
					<strong>Fakturapakken som tilvalg</strong> - et samlet sæt filer til Word og Excel for 99 kr.
					inkl. moms, betalt én gang.
				</li>
			</ul>
			<p class="mt-4">
				Bedst af alt: Den grundlæggende version er <strong>helt gratis</strong> - ingen tilmelding, ingen
				vandmærke, ingen kreditkort.
			</p>
		</section>

		<section>
			<p class="mb-4">
				Uanset om du bliver i Word eller skifter til onlineværktøjet, betaler det sig at have
				skabelonen klar, før den første kunde venter. Det hurtigste er at
				<a href="/generator/">lave fakturaen online gratis</a> - men vil du blive ved kontorprogrammerne,
				følger du bare trinene ovenfor.
			</p>
			<p>
				Skal skabelonen derimod matche netop dit fag, finder du
				<a href="/skabeloner/">skabeloner efter erhverv</a> med de felter, din branche typisk bruger.
			</p>
		</section>

		<section class="border-border bg-muted/30 rounded-xl border p-8 text-center">
			<h2 class="text-2xl font-bold">Prøv den nemme vej</h2>
			<p class="text-muted-foreground mt-2">
				Lav din faktura online på 60 sekunder - ingen Word, ingen frustrationer.
			</p>
			<div class="mt-6 flex flex-wrap items-center justify-center gap-3">
				<Button size="lg" href="/generator/">Lav faktura gratis</Button>
				<Button size="lg" variant="outline" href="/pris/">Se Fakturapakken · 99 kr.</Button>
			</div>
		</section>

		<section class="text-muted-foreground border-border border-t pt-6 text-sm">
			<p>
				<strong>Ansvarsfraskrivelse:</strong> Denne artikel er generel information og ikke juridisk rådgivning.
				For konkret vejledning om din virksomheds situation anbefaler vi at kontakte en revisor.
			</p>
		</section>
	</div>
</ArticleLayout>

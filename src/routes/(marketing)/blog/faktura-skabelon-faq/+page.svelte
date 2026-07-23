<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import ArticleLayout from '$lib/components/ArticleLayout.svelte';
	import { buildMeta, faqPageSchema, breadcrumbSchema } from '$lib/seo';

	const faqQuestions = [
		{
			question: 'Hvad skal en faktura indeholde?',
			answer:
				'En lovlig dansk faktura skal ifølge Momsloven § 52a indeholde: et unikt fakturanummer, udstedelsesdato, forfaldsdato, sælgers navn og adresse, sælgers CVR-nummer, købers navn og adresse, en beskrivelse af varer eller ydelser med mængde og pris, momsgrundlaget, den anvendte momssats (normalt 25%) og det samlede momsbeløb samt det samlede beløb inkl. moms. Vores fakturaskabelon inkluderer automatisk alle disse obligatoriske felter.'
		},
		{
			question: 'Hvordan laver man en faktura skabelon i Word?',
			answer:
				'Du kan sagtens oprette en simpel faktura skabelon i Word ved at opsætte tabeller og felter selv, men det kræver, at du manuelt husker alle lovpligtige felter og selv beregner moms. Vi anbefaler i stedet at bruge en dedikeret fakturagenerator som skabelontilfaktura.dk, som automatisk beregner moms, slår CVR-numre op og leverer PDF-fakturaer, der overholder Momsloven. Prøv vores gratis fakturagenerator på /generator/.'
		},
		{
			question: 'Kan man sende faktura uden CVR?',
			answer:
				'Ja, hvis din årlige omsætning er under 50.000 DKK, behøver du ikke at være momsregistreret og kan sende fakturaer uden CVR-nummer. I stedet anvender du de første seks cifre af dit CPR-nummer (din fødselsdato, f.eks. 010175). Vær opmærksom på, at der fra januar 2026 stilles krav om digital bogføring for virksomheder med en omsætning på over 300.000 DKK.'
		},
		{
			question: 'Hvor finder man en gratis faktura skabelon?',
			answer:
				'Du finder en helt gratis faktura skabelon hos skabelontilfaktura.dk. Vores generator kræver hverken tilmelding eller betaling, der er ingen vandmærke på den færdige PDF, og moms beregnes automatisk. Du kan oprette din første gratis faktura på få minutter på /generator/.'
		},
		{
			question: 'Hvad er forskellen på faktura og proformafaktura?',
			answer:
				'En faktura er en juridisk bindende regning, der udløser betalingsforpligtelse og momspligt hos sælger. En proformafaktura er derimod et foreløbigt dokument, der viser, hvordan den endelige faktura kommer til at se ud, og den skal markeres tydeligt med "Proformafaktura - ikke en regning". En proformafaktura udløser ikke moms og bruges typisk ved forsendelser, tilbud eller eksport.'
		},
		{
			question: 'Hvor længe skal man gemme sine fakturaer?',
			answer:
				'Bogføringsloven kræver, at du opbevarer dine fakturaer og regnskabsmateriale i 5 år. Fra januar 2026 stilles der desuden krav om digital bogføring for virksomheder med en omsætning på over 300.000 DKK, hvilket betyder, at fakturaer skal opbevares digitalt i et godkendt bogføringssystem sammen med bilag. Vores Pro-abonnement tilbyder cloud-lagring i 5 år, så du altid er dækket.'
		},
		{
			question: 'Hvordan beregner man moms på en faktura?',
			answer:
				'Standardmomsen i Danmark er 25%. Hvis dine priser er eksklusiv moms, beregner du momsbeløbet som beløb × 0,25. Hvis dine priser er inklusiv moms, udgør momsandelen beløb × (0,25 / 1,25) = beløb × 0,20. Eksempel: Ved et beløb på 1.000 DKK ekskl. moms bliver moms 250 DKK og total 1.250 DKK. Vores generator beregner alt dette automatisk.'
		},
		{
			question: 'Hvad er et fakturanummer?',
			answer:
				'Et fakturanummer er et unikt, fortløbende nummer, der identificerer hver enkelt faktura. Nummereringen skal følge en ubrudt serie uden huller og kan både være numerisk og alfanumerisk, fx FAKT-2026-001. Kravet stammer fra EU’s momsdirektiv og sikrer, at myndigheder kan kontrollere, at ingen fakturaer mangler. Vores fakturagenerator tildeler automatisk korrekte fakturanumre i rækkefølge.'
		}
	];

	const faqSchema = faqPageSchema(faqQuestions);

	const breadcrumbs = breadcrumbSchema([
		{ name: 'Forside', url: 'https://skabelontilfaktura.dk/' },
		{ name: 'Guides', url: 'https://skabelontilfaktura.dk/blog/' },
		{
			name: 'Faktura skabelon FAQ',
			url: 'https://skabelontilfaktura.dk/blog/faktura-skabelon-faq/'
		}
	]);

	const meta = buildMeta({
		title: 'Faktura skabelon FAQ - alt du skal vide (2026)',
		description:
			'Få svar på alle spørgsmål om fakturaskabeloner i Danmark: Hvad skal en faktura indeholde? Kan man sende faktura uden CVR? Hvordan beregner man moms?',
		canonical: '/blog/faktura-skabelon-faq/',
		ogType: 'article'
	});

	const jsonLd = [faqSchema, breadcrumbs];
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

<ArticleLayout
	title="Faktura skabelon FAQ - alt du skal vide (2026)"
	category="FAQ"
	date="Opdateret juli 2026"
	readingTime="7 min læsning"
>
	<nav class="not-prose text-muted-foreground mb-10 text-sm" aria-label="Brødkrummer">
		<a href="/" class="hover:text-foreground">Forside</a>
		<span class="mx-2">/</span>
		<a href="/blog/" class="hover:text-foreground">Guides</a>
		<span class="mx-2">/</span>
		<span class="text-foreground">Faktura skabelon FAQ</span>
	</nav>

	<p class="lead">
		At finde den rette <strong>skabelon til faktura</strong> kan være en udfordring, når reglerne faktisk
		ændrer sig markant i 2026. Uanset om du er selvstændig, freelancer eller driver en lille virksomhed,
		skal dine fakturaer overholde Momsloven og de nye krav om digital bogføring. På denne side samler
		vi de mest almindelige spørgsmål om fakturaskabeloner, så du kan oprette en gratis og lovlig faktura
		uden tvivl. Vi gennemgår alt fra obligatoriske felter og momsberegning til opbevaringskrav og forskellen
		på faktura og proformafaktura.
	</p>

	<!-- CTA box -->
	<div class="not-prose bg-primary text-primary-foreground mt-8 rounded-xl p-6 text-center">
		<h2 class="text-xl font-semibold">Brug vores gratis fakturagenerator</h2>
		<p class="mt-2 text-sm opacity-90">
			Opret en lovlig dansk faktura på under et minut. Ingen tilmelding, ingen vandmærke.
		</p>
		<Button variant="secondary" class="mt-4" href="/generator/">Lav min faktura nu</Button>
	</div>

	<div class="mt-12 space-y-8">
		{#each faqQuestions as item, i (item.question)}
			<section>
				<h2 class="text-2xl font-semibold">{i + 1}. {item.question}</h2>
				<p class="text-muted-foreground mt-3 leading-relaxed">{item.answer}</p>
				{#if i === 1 || i === 3}
					<p class="mt-3 text-sm">
						<a class="text-primary font-medium hover:underline" href="/generator/"
							>Start din gratis faktura her &rarr;</a
						>
					</p>
				{/if}
			</section>
		{/each}
	</div>

	<!-- Decision CTA -->
	<div class="not-prose border-border bg-muted/30 mt-16 rounded-xl border p-6">
		<h2 class="text-2xl font-semibold">Klar til at sende din første faktura?</h2>
		<p class="text-muted-foreground mt-3">
			Vores fakturaskabelon er gratis at bruge og overholder alle danske regler - inklusiv
			automatisk momsberegning, CVR-opslag og PDF-download. Se også vores
			<a href="/pris/" class="text-primary font-medium hover:underline">priser</a>
			for Pro og Business, hvis du har brug for cloud-lagring og klientdatabase.
		</p>
		<div class="mt-4 flex flex-wrap gap-3">
			<Button href="/generator/">Lav en gratis faktura</Button>
			<Button variant="outline" href="/pris/">Se priser</Button>
		</div>
	</div>

	<!-- Related reading -->
	<div class="not-prose border-border mt-12 border-t pt-8">
		<h2 class="text-lg font-semibold">Læs også</h2>
		<ul class="text-muted-foreground mt-3 space-y-2 text-sm">
			<li>
				<a href="/blog/faktura-skabelon-sammenligning/" class="text-primary hover:underline"
					>De 5 bedste faktura skabeloner i Danmark (2026)</a
				>
			</li>
			<li>
				<a href="/pris/" class="text-primary hover:underline">Priser på Pro og Business</a>
			</li>
		</ul>
	</div>
</ArticleLayout>

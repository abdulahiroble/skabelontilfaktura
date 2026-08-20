<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import ArticleLayout from '$lib/components/ArticleLayout.svelte';
	import {
		ARTICLE_AUTHOR,
		ARTICLE_DATES,
		blogPostingSchema,
		buildMeta,
		breadcrumbSchema,
		faqPageSchema
	} from '$lib/seo';

	const articleDates = ARTICLE_DATES.requirements;

	const meta = buildMeta({
		title: 'Krav til faktura: Hvad skal en faktura indeholde? (2026)',
		description:
			'Komplet oversigt over lovkravene til fakturaer i Danmark: obligatoriske felter, moms, fakturanumre, opbevaring og særlige regler for offentlige kunder.',
		canonical: '/blog/krav-til-faktura/',
		ogType: 'article'
	});

	const breadcrumbs = [
		{ name: 'Forside', url: 'https://skabelontilfaktura.dk/' },
		{ name: 'Guides', url: 'https://skabelontilfaktura.dk/blog/' },
		{ name: 'Krav til faktura', url: 'https://skabelontilfaktura.dk/blog/krav-til-faktura/' }
	];

	const faq = [
		{
			question: 'Hvad skal en faktura indeholde?',
			answer:
				'En faktura skal som minimum indeholde: fakturadato, et fortløbende fakturanummer, sælgers CVR-nummer samt navn og adresse, købers navn og adresse, en beskrivelse af varerne eller ydelserne med antal, leveringsdato (hvis den afviger fra fakturadatoen), momsgrundlag, momssats og momsbeløb. Kravene følger af momsloven § 52a.'
		},
		{
			question: 'Hvad sker der, hvis min faktura ikke overholder lovkravene?',
			answer:
				'En faktura, der ikke opfylder kravene i momsloven, er ikke en gyldig faktura. Det kan betyde, at køberen ikke kan trække momsen fra, og at du som sælger kan få problemer med skattemyndighederne og i værste fald risikerer bøder. Fejl skal rettes med en kreditnota efterfulgt af en ny, korrekt faktura.'
		},
		{
			question: 'Må jeg sende en faktura uden moms?',
			answer:
				'Ja, hvis din virksomhed er momsfritaget (omsætning under 50.000 kr. årligt), sender du fakturaer uden moms. Er du momsregistreret, skal moms som udgangspunkt altid med. Ved salg til udenlandske virksomheder i EU kan der anvendes omvendt momsæftelse, hvor momsen angives som 0 og teksten "omvendt momsæftelse" tilføjes.'
		},
		{
			question: 'Hvem skal sende e-faktura til det offentlige?',
			answer:
				'Virksomheder, der sælger til stat, regioner og kommuner, skal som udgangspunkt sende fakturaer elektronisk via EAN-fakturering (OIOUBL-format). Modtagerens EAN-nummer skal bruges i stedet for almindelige betalingsoplysninger.'
		},
		{
			question: 'Hvor længe skal jeg opbevare fakturaer?',
			answer:
				'Fakturaer og andet regnskabsmateriale skal opbevares i 5 år efter udgangen af det regnskabsår, de tilhører, ifølge bogføringsloven. Fra bogføringsloven 2026 stilles der desuden krav om digitalt format (SAF-T 2.0 og NemHandel).'
		}
	];

	const article = blogPostingSchema({
		headline: 'Krav til faktura: Hvad skal en faktura indeholde? (2026)',
		description: meta.description,
		url: meta.canonical,
		datePublished: articleDates.published,
		dateModified: articleDates.modified,
		authorName: ARTICLE_AUTHOR
	});
	const faqSchema = faqPageSchema(faq);
	const breadcrumb = breadcrumbSchema(breadcrumbs);
	const jsonLd = [article, faqSchema, breadcrumb];

	// Avoid emitting a literal `<script` token in source so the Svelte/prettier
	// parsers don't mistake the JSON-LD string for a real inline script block.
	// Content is built from trusted schema.org objects (no user input).
	const lt = String.fromCharCode(60);
	const jsonLdScript = `${lt}script type="application/ld+json">${JSON.stringify(jsonLd)}${lt}/script`;
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

<ArticleLayout
	title="Krav til faktura: Hvad skal en faktura indeholde? (2026)"
	subtitle="Alle lovkrav til danske fakturaer samlet ét sted - obligatoriske felter, momsregler, EAN-fakturering og opbevaringskrav."
	category="Lovgivning"
	datePublished={articleDates.published}
	dateModified={articleDates.modified}
	dateLabel={articleDates.modifiedLabel}
	author={ARTICLE_AUTHOR}
	readingTime="8 min læsning"
>
	<nav class="not-prose text-muted-foreground mb-10 text-sm" aria-label="Brødkrummer">
		<a href="/" class="hover:text-foreground">Forside</a>
		<span class="mx-2">/</span>
		<a href="/blog/" class="hover:text-foreground">Guides</a>
		<span class="mx-2">/</span>
		<span class="text-foreground">Krav til faktura</span>
	</nav>

	<div class="space-y-8 leading-relaxed">
		<section>
			<p class="mb-4">
				En faktura er ikke bare et betalingskrav - den er et juridisk dokument, der er reguleret af
				momsloven og bogføringsloven. Mangler blot ét af de obligatoriske felter, er fakturaen
				teknisk set ikke gyldig, og det kan skabe problemer for både dig og din kunde.
			</p>
			<p>
				I denne guide gennemgår vi alle kravene til fakturaer i Danmark: de obligatoriske felter,
				reglerne om moms og fakturanumre, særlige situationer som faktura uden CVR og
				EAN-fakturering til det offentlige - og kravene til opbevaring.
			</p>
		</section>

		<section>
			<h2 class="text-2xl font-bold tracking-tight">De 11 obligatoriske felter på en faktura</h2>
			<p class="mb-4">
				Følgende oplysninger <strong>skal</strong> fremgå af enhver faktura efter momsloven § 52a:
			</p>
			<ol class="list-decimal space-y-2 pl-6">
				<li><strong>Fakturadato</strong> - datoen for udstedelsen.</li>
				<li>
					<strong>Fakturanummer</strong> - et fortløbende nummer, der identificerer fakturaen. Hvert nummer
					må kun bruges én gang.
				</li>
				<li><strong>Sælgers CVR-nummer</strong> - eller SE-nummer for udenlandske sælgere.</li>
				<li><strong>Sælgers navn og adresse</strong> - virksomhedens officielle oplysninger.</li>
				<li><strong>Købers navn og adresse</strong>.</li>
				<li>
					<strong>Mængde og art af varerne</strong> - eller omfanget og arten af de leverede ydelser.
				</li>
				<li><strong>Leveringsdato</strong> - hvis den afviger fra fakturadatoen.</li>
				<li>
					<strong>Momsgrundlaget</strong> - beløbet uden moms, inkl. pris pr. enhed og eventuelle rabatter.
				</li>
				<li><strong>Momssatsen</strong> - normalt 25% i Danmark.</li>
				<li><strong>Momsbeløbet</strong> - det konkrete momsbeløb i kroner.</li>
				<li><strong>Totalbeløbet inkl. moms</strong>.</li>
			</ol>
			<p class="mt-4">
				Ud over de lovpligtige felter er det god skik at medtage betalingsoplysninger (regnummer og
				kontonummer, MobilePay), betalingsfrist og kontaktinformation.
			</p>
		</section>

		<section class="border-border bg-muted/30 rounded-xl border p-6">
			<h2 class="text-xl font-bold">Tjekliste: Er din faktura lovlig?</h2>
			<ul class="mt-3 space-y-2">
				<li>✓ Fortløbende, unikt fakturanummer</li>
				<li>✓ Dato for udstedelse (og levering, hvis forskellig)</li>
				<li>✓ CVR-nummer på sælger</li>
				<li>✓ Navne og adresser på både sælger og køber</li>
				<li>✓ Tydelig beskrivelse af varen eller ydelsen</li>
				<li>✓ Momsgrundlag, momssats og momsbeløb</li>
				<li>✓ Totalbeløb inkl. moms</li>
			</ul>
			<p class="mt-4 text-sm">
				<a href="/generator/" class="text-primary underline underline-offset-4">
					Vores generator udfylder automatisk alle felterne
				</a> - så du er sikker på at overholde loven.
			</p>
		</section>

		<section>
			<h2 class="text-2xl font-bold tracking-tight">Reglerne om moms på fakturaer</h2>
			<h3 class="text-xl font-semibold">Standardmomssatsen er 25%</h3>
			<p>
				Er din virksomhed momsregistreret, skal du som udgangspunkt tilføje 25% moms på alle salg af
				varer og ydelser. Momssatsen og momsbeløbet skal hver især fremgå særskilt på fakturaen -
				det er ikke nok blot at skrive et totalbeløb.
			</p>

			<h3 class="mt-6 text-xl font-semibold">Faktura uden moms (momsfritagelse)</h3>
			<p>
				Omsætter din virksomhed for under 50.000 kr. om året, kan du vælge at være momsfritaget. I
				så fald sender du fakturaer uden moms - men det skal fremgå tydeligt, at der ikke er moms på
				fakturaen, f.eks. med teksten "Moms: 0 kr. (momsfritaget)". Læs mere i vores guide om
				<a href="/blog/faktura-uden-cvr/">faktura uden CVR-nummer</a>.
			</p>

			<h3 class="mt-6 text-xl font-semibold">Omvendt momsæftelse (reverse charge)</h3>
			<p>
				Sælger du varer eller ydelser til en momsregistreret virksomhed i et andet EU-land, kan der
				anvendes omvendt momsæftelse: Momssatsen angives som 0, og fakturaen skal bære teksten
				"Omvendt momsæftelse" samt købers udenlandske momsregistreringsnummer. Køberen beregner og
				betaler selv momsen i sit eget land.
			</p>
		</section>

		<section>
			<h2 class="text-2xl font-bold tracking-tight">Fakturanumre: reglerne i praksis</h2>
			<p class="mb-4">
				Kravet om et fortløbende nummer betyder ikke, at du skal starte ved 1 og tælle opad med ét
				ad gangen - men rækkefølgen skal være logisk og uden huller, der kan vække tvivl om,
				hvorvidt fakturaer mangler. Gode regler:
			</p>
			<ul class="list-disc space-y-2 pl-6">
				<li>Brug ét samlet nummersystem for hele virksomheden.</li>
				<li>
					Nummeret skal være unikt - genbrug aldrig et nummer, heller ikke efter kreditnotaer.
				</li>
				<li>Kreditnotaer får deres eget nummer og henviser til den oprindelige faktura.</li>
				<li>
					Flere serier er tilladt (f.eks. pr. afdeling), så længe hver faktura kan identificeres
					entydigt.
				</li>
			</ul>
		</section>

		<section>
			<h2 class="text-2xl font-bold tracking-tight">
				E-faktura og EAN-fakturering til det offentlige
			</h2>
			<p>
				Sælger du til stat, regioner, kommuner eller offentlige institutioner, skal fakturaen som
				udgangspunkt sendes elektronisk som en såkaldt EAN-faktura i OIOUBL-formatet. I stedet for
				almindelige betalingsoplysninger bruger du modtagerens EAN-nummer - et 13-cifret nummer, der
				identificerer den offentlige enhed. Du kan finde EAN-numre i NemHandelsregistret.
			</p>
			<p class="mt-3">
				Private virksomheder, der er registreret i NemHandelsregistret, kan desuden vælge at modtage
				EAN-fakturaer - men for det offentlige er det et krav, ikke et valg.
			</p>
		</section>

		<section>
			<h2 class="text-2xl font-bold tracking-tight">Særlige fakturatyper</h2>
			<h3 class="text-xl font-semibold">Proformafaktura</h3>
			<p>
				En proformafaktura er et "fakturautkast", der viser, hvad en kommende leverance vil koste.
				Den er ikke et reelt betalingskrav og skal være markeret tydeligt som proforma. Den kan ikke
				bogføres som gæld eller tilgodehavende.
			</p>

			<h3 class="mt-6 text-xl font-semibold">Kreditnota</h3>
			<p>
				En kreditnota tilbagekalder eller retter en tidligere faktura - f.eks. ved fejl, rabatter
				efter fakturadatoen eller returnering. Kreditnotaen skal indeholde de samme oplysninger som
				fakturaen samt en henvisning til den oprindelige faktura.
			</p>

			<h3 class="mt-6 text-xl font-semibold">Delfaktura og acontofaktura</h3>
			<p>
				Ved større opgaver kan du fakturere i flere omgange (delfakturaer) eller kræve betaling
				forud (acontofaktura). Hver faktura får sit eget nummer, og momsen skal med på hver enkelt
				delbetaling - ikke først samlet ved slutregningen.
			</p>
		</section>

		<section>
			<h2 class="text-2xl font-bold tracking-tight">Opbevaringskrav og bogføringsloven 2026</h2>
			<p>
				Begge parter skal opbevare fakturaer i <strong>5 år</strong> efter udgangen af det
				regnskabsår, fakturaen tilhører. Med den nye bogføringslov, der træder fuldt i kraft i 2026,
				stilles der yderligere krav om digital bogføring, SAF-T 2.0-eksport og
				NemHandel-integration. Det betyder i praksis, at papirfakturaer og løse Excel-ark bliver
				stadig dårligere opbevaring. Læs mere i vores
				<a href="/blog/bogforingslov-2026-guide/">komplette guide til bogføringsloven 2026</a>.
			</p>
		</section>

		<section>
			<h2 class="text-2xl font-bold tracking-tight">Ofte stillede spørgsmål</h2>
			<div class="space-y-6">
				{#each faq as item (item.question)}
					<div>
						<h3 class="text-lg font-semibold">{item.question}</h3>
						<p class="mt-2">{item.answer}</p>
					</div>
				{/each}
			</div>
		</section>

		<section class="border-border bg-muted/30 rounded-xl border p-8 text-center">
			<h2 class="text-2xl font-bold">Lav en lovlig faktura på 60 sekunder</h2>
			<p class="text-muted-foreground mt-2">
				Alle lovpligtige felter er inkluderet automatisk - CVR-opslag, moms og fortløbende numre.
			</p>
			<div class="mt-6 flex flex-wrap items-center justify-center gap-3">
				<Button size="lg" href="/generator/">Lav faktura gratis</Button>
				<Button size="lg" variant="outline" href="/skabeloner/">Se erhvervsskabeloner</Button>
			</div>
		</section>

		<section class="text-muted-foreground border-border border-t pt-6 text-sm">
			<p>
				<strong>Ansvarsfraskrivelse:</strong> Denne artikel er generel information og ikke juridisk rådgivning.
				Reglerne kan ændre sig, og din situation kan afvige. For konkret vejledning anbefaler vi at kontakte
				en revisor eller Skattestyrelsen.
			</p>
		</section>
	</div>
</ArticleLayout>

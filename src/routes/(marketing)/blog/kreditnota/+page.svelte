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

	const articleDates = ARTICLE_DATES.creditNote;

	const meta = buildMeta({
		title: 'Kreditnota: sådan opretter du en korrekt kreditnota (2026)',
		description:
			'Sådan opretter du en korrekt kreditnota: hvornår den skal sendes, hvilke felter den kræver, og hvordan den retter din bogføring og moms. Guide + skabelon.',
		canonical: '/blog/kreditnota/',
		ogType: 'article'
	});

	const faq = [
		{
			question: 'Hvad er en kreditnota?',
			answer:
				'En kreditnota er et dokument, der tilbagekalder eller retter en tidligere faktura - helt eller delvist. Den opfattes omvendt af en faktura: Beløbene føres med minustegn, momsen korrigeres, og kunden skylder dig nu mindre (eller får penge tilbage). Kreditnotaen skal indeholde de samme oplysninger som fakturaen samt en henvisning til den oprindelige faktura.'
		},
		{
			question: 'Skal en kreditnota have sit eget nummer?',
			answer:
				'Ja. Kreditnotaer nummereres fortløbende, enten i samme serie som fakturaerne eller i en separat serie. Et nummer må aldrig genbruges - heller ikke når kreditnotaen annullerer en faktura helt. Nummereringen skal kunne dokumentere, at ingen dokumenter mangler.'
		},
		{
			question: 'Hvordan påvirker en kreditnota min momsindberetning?',
			answer:
				'Momsen på kreditnotaen trækkes fra i den momsperiode, hvor kreditnotaen udstedes - ikke i den periode, hvor den oprindelige faktura hørte hjemme. Har du f.eks. faktureret 15.000 kr. inkl. moms i maj og krediteret i september, indberetter du et salg på minus 12.000 kr. (ekskl. moms) i september-perioden.'
		},
		{
			question: 'Må jeg i stedet slette eller ændre den oprindelige faktura?',
			answer:
				'Nej. En udsendt faktura må aldrig slettes, ændres eller "genbruges" med et nyt nummer. Fejl rettes altid med en kreditnota - og skal kunden stadig have varen eller ydelsen, efterfølges kreditnotaen af en ny, korrekt faktura. Sådan sikres sporbarheden i dit bogholderi.'
		}
	];

	const breadcrumbs = [
		{ name: 'Forside', url: 'https://skabelontilfaktura.dk/' },
		{ name: 'Guides', url: 'https://skabelontilfaktura.dk/blog/' },
		{ name: 'Kreditnota', url: 'https://skabelontilfaktura.dk/blog/kreditnota/' }
	];

	const article = blogPostingSchema({
		headline: 'Kreditnota: sådan opretter du en korrekt kreditnota (2026)',
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
	title="Kreditnota: sådan opretter du en korrekt kreditnota (2026)"
	subtitle="Ret fejl, returneringer og rabatter korrekt: hvornår kreditnotaen skal sendes, hvilke felter den kræver, og hvad den betyder for din moms."
	category="Bogføring"
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
		<span class="text-foreground">Kreditnota</span>
	</nav>

	<div class="space-y-8 leading-relaxed">
		<section>
			<p class="mb-4">
				Det sker for alle: Du har faktureret forkert beløb, kunden returnerer en vare, eller der er
				blevet aftalt en rabat, efter fakturaen er sendt. I de situationer er svaret en
				<strong>kreditnota</strong> - et dokument, der tilbagekalder eller retter den oprindelige faktura.
			</p>
			<p>
				Du må nemlig aldrig slette eller ændre en udsendt faktura. I stedet krediterer du den med en
				kreditnota og sender - hvis købet stadig står på - en ny, korrekt faktura. Her får du den
				komplette guide til, hvornår kreditnotaen bruges, hvilke felter den skal indeholde, og
				hvordan den påvirker din bogføring og moms.
			</p>
		</section>

		<section>
			<h2 class="text-2xl font-bold tracking-tight">Hvornår skal du sende en kreditnota?</h2>
			<p class="mb-4">De mest typiske situationer i dansk erhvervsliv:</p>
			<ul class="list-disc space-y-2 pl-6">
				<li>
					<strong>Fejl på fakturaen.</strong> Forkert beløb, antal, enhedspris eller moms - eller faktureret
					til den forkerte kunde.
				</li>
				<li>
					<strong>Returnerede varer.</strong> Kunden sender varerne tilbage, og handlen skal annulleres
					helt eller delvist.
				</li>
				<li>
					<strong>Rabat efter fakturering.</strong> I har aftalt en efterfølgende rabat eller mængderabat,
					efter at fakturaen er udsendt.
				</li>
				<li>
					<strong>Annulleret leverance.</strong> Opgaven bliver aflyst, eller ydelsen bliver aldrig leveret.
				</li>
				<li>
					<strong>Kunden kan ikke betale.</strong> I sidste ende kan udestående beløb krediteres, hvis
					kunden f.eks. er gået konkurs - tal med din revisor om behandlingen.
				</li>
			</ul>
		</section>

		<section>
			<h2 class="text-2xl font-bold tracking-tight">Hvad skal en kreditnota indeholde?</h2>
			<p class="mb-4">
				En kreditnota skal indeholde <strong
					>de samme oplysninger som den oprindelige faktura</strong
				>
				- fakturadato, unikt nummer, CVR og navne/adresser på begge parter, beskrivelse af varer eller
				ydelser samt momsgrundlag, momssats og momsbeløb. Derudover gælder tre særlige krav:
			</p>
			<ol class="list-decimal space-y-2 pl-6">
				<li>
					<strong>Reference til den oprindelige faktura.</strong> Skriv f.eks. "Kreditnota vedrører faktura
					2026-042 af 14. september 2026", så det er tydeligt, hvilken faktura der rettes.
				</li>
				<li>
					<strong>Negative beløb.</strong> Beløbene føres med minustegn, fordi kreditnotaen modsat fakturaen
					mindsker dit salg.
				</li>
				<li>
					<strong>Moms-korrektion.</strong> Momssatsen (normalt 25%) og det negative momsbeløb skal fremgå
					særskilt, ligesom på en faktura - også her gælder kravene i momsloven.
				</li>
			</ol>
			<p class="mt-4">
				Brug guiden som en kreditnota-skabelon: overskriften, henvisningen til originalen og de
				negative beløb er det, der adskiller kreditnotaen fra en almindelig faktura. Alle andre
				felter følger de almindelige <a href="/blog/krav-til-faktura/">krav til faktura</a>.
			</p>
		</section>

		<section>
			<h2 class="text-2xl font-bold tracking-tight">Eksempel på en kreditnota</h2>
			<p class="mb-4">
				Her krediterer Malerfirma Hansen ApS hele faktura 2026-042, fordi kunden returnerede
				opgaven:
			</p>
			<div class="border-border bg-muted/30 rounded-xl border p-6">
				<div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
					<div>
						<p class="text-xl font-bold tracking-tight">KREDITNOTA</p>
						<p class="text-muted-foreground mt-1 text-sm">Nr. 2026-013</p>
						<p class="text-muted-foreground text-sm">Dato: 2. oktober 2026</p>
					</div>
					<div class="text-muted-foreground text-sm sm:text-right">
						<p><strong class="text-foreground">Kreditnota vedrører faktura:</strong></p>
						<p>2026-042 af 14. september 2026</p>
					</div>
				</div>
				<div class="text-muted-foreground mt-4 text-sm">
					<p>
						<strong class="text-foreground">Fra:</strong> Malerfirma Hansen ApS, CVR 12 34 56 78
					</p>
					<p><strong class="text-foreground">Til:</strong> Café Nørrebro ApS, CVR 87 65 43 21</p>
				</div>
				<div class="border-border mt-4 w-full max-w-sm space-y-1.5 border-t pt-4 text-sm">
					<div class="flex justify-between">
						<span>Maling af facade inkl. grunding + arbejdsløn</span>
						<span>-12.000,00 kr.</span>
					</div>
					<div class="text-muted-foreground flex justify-between">
						<span>Moms 25%</span>
						<span>-3.000,00 kr.</span>
					</div>
					<div class="border-border flex justify-between border-t pt-2 font-bold">
						<span>Til kredit</span>
						<span>-15.000,00 kr.</span>
					</div>
				</div>
				<p class="text-muted-foreground mt-4 text-sm">
					Beløbet tilbagebetales via bankoverførsel inden for 8 dage. Tilbagebetaling sker til: reg.
					1555 - konto 0012345678.
				</p>
			</div>
		</section>

		<section>
			<h2 class="text-2xl font-bold tracking-tight">
				Kreditnotaens effekt på bogføring og momsindberetning
			</h2>
			<p class="mb-4">
				En kreditnota bogføres som en omvendt post i forhold til den oprindelige faktura:
			</p>
			<ul class="list-disc space-y-2 pl-6">
				<li>
					<strong>Salget mindskes.</strong> Omsætningen reduceres med kreditnotaens beløb ekskl. moms
					i den periode, hvor kreditnotaen udstedes.
				</li>
				<li>
					<strong>Momsen rettes i den aktuelle periode.</strong> Den moms, du tidligere har indberettet
					på den oprindelige faktura, trækker du nu fra i den momsperiode, hvor kreditnotaen er dateret
					- ikke i originalens periode.
				</li>
				<li>
					<strong>Tilgodehavenden justeres.</strong> Har kunden ikke betalt, nedsættes kravet. Har kunden
					allerede betalt, skylder du tilbagebetalingen.
				</li>
				<li>
					<strong>Opbevaring i 5 år.</strong> Kreditnotaer er regnskabsmateriale og opbevares ligesom
					fakturaer i 5 år efter udgangen af regnskabsåret i henhold til bogføringsloven.
				</li>
			</ul>
			<p class="mt-4">
				De negative beløb i din momsindberetning er helt normale, når de skyldes kreditnotaer - men
				gem dokumentationen, så du kan begrunde dem over for Skattestyrelsen. Flere praktiske svar
				finder du i vores <a href="/blog/faktura-skabelon-faq/">fakturaskabelon-FAQ</a>.
			</p>
		</section>

		<section>
			<p>
				Fejl opstår oftest, når fakturaerne skrives i hånden. <a href="/generator/"
					>Lav dine fakturaer online gratis</a
				>, og brug generatoren til kreditnotaer med reference til originalen, når noget alligevel
				skal rettes.
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
			<h2 class="text-2xl font-bold">Opret faktura og kreditnota gratis</h2>
			<p class="text-muted-foreground mt-2">
				Generatoren laver både almindelige fakturaer og kreditnotaer med reference til originalen,
				negative beløb og korrekt moms.
			</p>
			<div class="mt-6 flex flex-wrap items-center justify-center gap-3">
				<Button size="lg" href="/generator/">Opret faktura gratis</Button>
				<Button size="lg" variant="outline" href="/blog/faktura-skabelon-faq/"
					>Læs faktura-FAQ</Button
				>
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

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

	const articleDates = ARTICLE_DATES.excel;

	const meta = buildMeta({
		title: 'Faktura skabelon Excel (gratis download, 2026)',
		description:
			'Gratis fakturaskabelon til Excel med automatisk momsformel - eller følg guiden og byg din egen. Download .xlsx-filen her.',
		canonical: '/blog/faktura-skabelon-excel/',
		ogType: 'article'
	});

	const howToSteps: HowToStep[] = [
		{
			name: 'Åbn et tomt regneark og opret headeren',
			text: 'Skriv "FAKTURA" i celle A1, og tilføj felterne fakturanummer, fakturadato og forfaldsdato i toppen af arket.'
		},
		{
			name: 'Opret afsnit til sælger og køber',
			text: 'Brug to kolonner med virksomhedsoplysninger: navn, adresse, CVR-nummer - for begge parter. CVR er obligatorisk for sælger efter momsloven § 52a.'
		},
		{
			name: 'Byg linjetabellen',
			text: 'Opret kolonnerne Beskrivelse, Antal, Enhed, Enhedspris og Beløb. Beløb beregnes med formlen =B12*D12 (antal gange pris).'
		},
		{
			name: 'Tilføj momsformler',
			text: 'Subtotal: =SUM(E12:E13). Moms: =E14*25%. Total: =E14+E15. Formater cellerne som valuta med to decimaler.'
		},
		{
			name: 'Tilføj betalingsoplysninger og gem som skabelon',
			text: 'Regnummer, kontonummer, MobilePay og betalingsfrist skal stå tydeligt. Gem filen som skabelon (Filer > Gem som > Excel-skabelon), så numre og formler genbruges.'
		}
	];

	const breadcrumbs: BreadcrumbItem[] = [
		{ name: 'Forside', url: 'https://skabelontilfaktura.dk/' },
		{ name: 'Guides', url: 'https://skabelontilfaktura.dk/blog/' },
		{
			name: 'Faktura skabelon Excel',
			url: 'https://skabelontilfaktura.dk/blog/faktura-skabelon-excel/'
		}
	];

	const howTo = howToSchema(howToSteps, {
		name: 'Sådan laver du en faktura i Excel',
		description: 'Trin-for-trin guide til at oprette en fakturaskabelon i Excel med momsformler.'
	});
	const breadcrumb = breadcrumbSchema(breadcrumbs);
	const article = blogPostingSchema({
		headline: 'Faktura skabelon Excel: Gratis download og guide (2026)',
		description: meta.description,
		url: meta.canonical,
		datePublished: articleDates.published,
		dateModified: articleDates.modified,
		authorName: ARTICLE_AUTHOR
	});
	const jsonLd = [article, howTo, breadcrumb];

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

<ArticleLayout
	title="Faktura skabelon Excel: Gratis download og guide (2026)"
	subtitle="Download vores gratis Excel-skabelon med momsformler - eller følg guiden og byg din egen fra bunden."
	category="Skabeloner"
	datePublished={articleDates.published}
	dateModified={articleDates.modified}
	dateLabel={articleDates.modifiedLabel}
	author={ARTICLE_AUTHOR}
	readingTime="5 min læsning"
>
	<nav class="not-prose text-muted-foreground mb-10 text-sm" aria-label="Brødkrummer">
		<a href="/" class="hover:text-foreground">Forside</a>
		<span class="mx-2">/</span>
		<a href="/blog/" class="hover:text-foreground">Guides</a>
		<span class="mx-2">/</span>
		<span class="text-foreground">Faktura skabelon Excel</span>
	</nav>

	<div class="space-y-8 leading-relaxed">
		<section class="not-prose border-border bg-muted/30 rounded-xl border p-6">
			<h2 class="text-lg font-semibold">Gratis Excel-skabelon med momsformler</h2>
			<p class="text-muted-foreground mt-1 text-sm">
				Færdig opsat med linjetabel, momsformler (25%) og alle lovpligtige felter. Ingen tilmelding.
			</p>
			<div class="mt-4 flex flex-wrap gap-3">
				<Button href="/templates/faktura-skabelon.xlsx" download>Download .xlsx</Button>
				<Button variant="outline" href="/skabeloner/">Se skabeloner efter erhverv</Button>
			</div>
		</section>

		<section>
			<p class="mb-4">
				Excel er et af de mest populære programmer til at lave fakturaer i Danmark - måske fordi
				næsten alle har det installeret, og fordi formler kan tage sig af momsberegningen. Men en
				Excel-faktura kræver stadig, at du selv husker fakturanumre, datoer og lovkrav.
			</p>
			<p>
				I denne guide kan du enten downloade vores færdige skabelon ovenfor eller bygge din egen fra
				bunden. Til sidst gennemgår vi fordelene ved at bruge en online generator i stedet.
			</p>
		</section>

		<section>
			<h2 class="text-2xl font-bold tracking-tight">Sådan laver du en faktura i Excel</h2>
			<p class="mb-4">Følg disse trin for at bygge en fungerende fakturaskabelon:</p>
			<ol class="list-decimal space-y-3 pl-6">
				<li>
					<strong>Opsæt headeren:</strong> Skriv "FAKTURA" i A1 og tilføj felter til fakturanummer, fakturadato
					og forfaldsdato i cellerne ved siden af.
				</li>
				<li>
					<strong>Tilføj sælger- og køberoplysninger:</strong> Lav to blokke med firmanavn, adresse og
					CVR-nummer. CVR for sælger er et lovkrav.
				</li>
				<li>
					<strong>Byg linjetabellen:</strong> Opret kolonnerne
					<strong>Beskrivelse, Antal, Enhed, Enhedspris</strong>
					og <strong>Beløb</strong>. I Beløb-kolonnen bruger du formlen
					<code>=Antal*Enhedspris</code> for hver linje.
				</li>
				<li>
					<strong>Beregn moms med formler:</strong> Subtotal med <code>=SUM()</code> over
					beløbskolonnen, moms med <code>=Subtotal*25%</code> og total med
					<code>=Subtotal+Moms</code>.
				</li>
				<li>
					<strong>Tilføj betalingsoplysninger:</strong> Regnummer, kontonummer, MobilePay-nummer og betalingsfrist.
				</li>
				<li>
					<strong>Gem som skabelon:</strong> Vælg "Filer" > "Gem som" > filformat "Excel-skabelon (.xltx)".
					Nu genbruger du filen og indtaster kun nye data.
				</li>
			</ol>
		</section>

		<section>
			<h2 class="text-2xl font-bold tracking-tight">Fordele og ulemper ved Excel-fakturaer</h2>
			<ul class="list-disc space-y-2 pl-6">
				<li><strong>+</strong> Alle kender Excel, og filen kan tilpasses præcis som du vil.</li>
				<li><strong>+</strong> Formler beregner moms og total automatisk.</li>
				<li>
					<strong>−</strong> Du skal selv holde styr på fortløbende fakturanumre på tværs af filer.
				</li>
				<li>
					<strong>−</strong> Ingen automatisk CVR-opslag - fejl i CVR-numre er en klassisk kilde til ugyldige
					fakturaer.
				</li>
				<li>
					<strong>−</strong> Excel opfylder ikke bogføringsloven 2026's krav til digital bogføring og
					SAF-T 2.0-eksport.
				</li>
				<li>
					<strong>−</strong> Filen lever på din computer: risiko for versionsforvirring og tab.
				</li>
			</ul>
			<p class="mt-4">
				Læs mere om, hvad loven kræver af din faktura i vores guide
				<a href="/blog/krav-til-faktura/">Krav til faktura: hvad skal en faktura indeholde?</a>
			</p>
		</section>

		<section>
			<h2 class="text-2xl font-bold tracking-tight">Alternativet: online generator</h2>
			<p class="mb-4">
				En online fakturagenerator som skabelontilfaktura.dk løser de problemer, Excel ikke kan:
			</p>
			<ul class="list-disc space-y-2 pl-6">
				<li>
					<strong>Automatisk CVR-opslag</strong> - firmanavn og adresse hentes fra CVR-registret.
				</li>
				<li><strong>Automatisk moms</strong> - vælg sats, resten regnes selv.</li>
				<li><strong>Fortløbende numre</strong> - tildelt automatisk, uden risiko for dubletter.</li>
				<li>
					<strong>PDF-output</strong> - professionel faktura klar til at sende, uden vandmærke.
				</li>
			</ul>
			<p class="mt-4">
				Og den grundlæggende version er gratis - ligesom din Excel-fil, bare uden regnearkets
				begrænsninger.
			</p>
		</section>

		<section class="border-border bg-muted/30 rounded-xl border p-8 text-center">
			<h2 class="text-2xl font-bold">Spring Excel-filen over</h2>
			<p class="text-muted-foreground mt-2">
				Lav din faktura online på 60 sekunder - med CVR-opslag og automatisk moms.
			</p>
			<div class="mt-6 flex flex-wrap items-center justify-center gap-3">
				<Button size="lg" href="/generator/">Lav faktura gratis</Button>
				<Button size="lg" variant="outline" href="/blog/faktura-skabelon-word/"
					>Se Word-versionen</Button
				>
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

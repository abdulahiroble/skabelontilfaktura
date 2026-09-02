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

	const articleDates = ARTICLE_DATES.proforma;

	const meta = buildMeta({
		title: 'Proformafaktura: hvad er det, og hvornår bruger man den? (2026)',
		description:
			'Hvad er en proforma faktura? Få definitionen, forskellen på proforma, almindelig faktura og tilbud, typiske anvendelser og reglerne for bogføring.',
		canonical: '/blog/proforma-faktura/',
		ogType: 'article'
	});

	const faq = [
		{
			question: 'Er en proformafaktura juridisk bindende?',
			answer:
				'Nej. En proformafaktura er et foreløbigt dokument, der viser, hvad en kommende leverance forventes at koste. Den er ikke et betalingskrav, udløser ikke moms og kan ikke bogføres som gæld eller tilgodehavende. Først når du udsteder en almindelig faktura, opstår der en reel betalingsforpligtelse.'
		},
		{
			question: 'Kan kunden betale på baggrund af en proformafaktura?',
			answer:
				'Det sker i praksis, men så skal du udstede en rigtig faktura med fakturanummer og moms, så snart betalingen modtages. Beløbet må først bogføres som salg og momspligtig omsætning, når den korrekte faktura foreligger - proformaen erstatter aldrig fakturaen.'
		},
		{
			question: 'Skal der moms på en proformafaktura?',
			answer:
				'Nej, en proformafaktura udløser ikke moms. Du kan angive momsen vejledende, så modtageren kan se det samlede beløb, men der er først momspligt, når salget faktureres på en almindelig faktura.'
		},
		{
			question: 'Hvordan markerer jeg et dokument som proforma?',
			answer:
				'Skriv tydeligt "Proformafaktura - ikke en regning" i overskriften, og brug en separat nummerserie (f.eks. PF-2026-001), så dokumentet ikke kan forveksles med dine fortløbende fakturanumre. Uden den tydelige markering risikerer modtageren at behandle dokumentet som en reel faktura.'
		}
	];

	const breadcrumbs = [
		{ name: 'Forside', url: 'https://skabelontilfaktura.dk/' },
		{ name: 'Guides', url: 'https://skabelontilfaktura.dk/blog/' },
		{ name: 'Proformafaktura', url: 'https://skabelontilfaktura.dk/blog/proforma-faktura/' }
	];

	const article = blogPostingSchema({
		headline: 'Proformafaktura: hvad er det, og hvornår bruger man den? (2026)',
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
	title="Proformafaktura: hvad er det, og hvornår bruger man den? (2026)"
	subtitle="Lær forskellen på proformafaktura, almindelig faktura og tilbud - og hvordan en proforma skal behandles i din bogføring."
	category="Fakturatyper"
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
		<span class="text-foreground">Proformafaktura</span>
	</nav>

	<div class="space-y-8 leading-relaxed">
		<section>
			<p class="mb-4">
				En proformafaktura er et "fakturautkast": et foreløbigt dokument, der viser, hvad en
				kommende leverance forventes at koste. Den ligner en almindelig faktura med afsender,
				modtager, linjer og beløb - men den er <strong>ikke en reel regning</strong> og skal altid være
				markeret tydeligt som proforma.
			</p>
			<p>
				I denne guide får du definitionen, en sammenligning med almindelige fakturaer og tilbud, de
				typiske brugssituationer i Danmark - og svaret på, hvordan en proformafaktura behandles i
				bogføringen og ved momsen.
			</p>
		</section>

		<section>
			<h2 class="text-2xl font-bold tracking-tight">
				Forskellen på proformafaktura, almindelig faktura og tilbud
			</h2>
			<p class="mb-4">
				De tre dokumenter ligner hinanden, men deres juridiske status er helt forskellig:
			</p>
			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead>
						<tr class="border-border border-b text-left">
							<th class="py-2 pr-3 font-semibold">Egenskab</th>
							<th class="py-2 pr-3 font-semibold">Proformafaktura</th>
							<th class="py-2 pr-3 font-semibold">Almindelig faktura</th>
							<th class="py-2 font-semibold">Tilbud</th>
						</tr>
					</thead>
					<tbody class="text-muted-foreground">
						<tr class="border-border border-b">
							<td class="text-foreground py-2 pr-3 font-medium">Formål</td>
							<td class="py-2 pr-3">Viser pris for en kommende leverance</td>
							<td class="py-2 pr-3">Kræver betaling for leveret vare eller ydelse</td>
							<td class="py-2">Beskriver vilkår for en mulig aftale</td>
						</tr>
						<tr class="border-border border-b">
							<td class="text-foreground py-2 pr-3 font-medium">Betalingskrav</td>
							<td class="py-2 pr-3">Nej</td>
							<td class="py-2 pr-3">Ja</td>
							<td class="py-2">Nej</td>
						</tr>
						<tr class="border-border border-b">
							<td class="text-foreground py-2 pr-3 font-medium">Udløser moms</td>
							<td class="py-2 pr-3">Nej</td>
							<td class="py-2 pr-3">Ja - moms på 25% skal på som udgangspunkt</td>
							<td class="py-2">Nej</td>
						</tr>
						<tr class="border-border border-b">
							<td class="text-foreground py-2 pr-3 font-medium">Bogføres som salg</td>
							<td class="py-2 pr-3">Nej - erstattes af en rigtig faktura</td>
							<td class="py-2 pr-3">Ja, som salgsbilag</td>
							<td class="py-2">Nej (gem ved accept)</td>
						</tr>
						<tr class="border-border">
							<td class="text-foreground py-2 pr-3 font-medium">Nummerering</td>
							<td class="py-2 pr-3">Frivillig, separat serie (f.eks. PF-2026-001)</td>
							<td class="py-2 pr-3">Fortløbende og unikt nummer - et lovkrav</td>
							<td class="py-2">Ingen krav</td>
						</tr>
					</tbody>
				</table>
			</div>
			<p class="mt-4">
				Kravene til den almindelige faktura følger af momsloven § 52a - du kan se alle felterne i
				vores guide om <a href="/blog/krav-til-faktura/">krav til faktura</a>. En proformafaktura er
				ikke omfattet af kravene, men indeholder i praksis de samme oplysninger: afsender og
				modtager med CVR, dato, beskrivelse af varer eller ydelser samt vejledende beløb og moms.
			</p>
		</section>

		<section>
			<h2 class="text-2xl font-bold tracking-tight">Hvornår bruger man en proformafaktura?</h2>
			<h3 class="text-xl font-semibold">1. Forsendelse og told</h3>
			<p>
				Ved eksport og internationale forsendelser beder fragtmænd og toldmyndigheder ofte om et
				dokument, der angiver varens værdi og indhold, før den endelige faktura findes. Her bruges
				proformafakturaen som erklæring om leverancens omtrentlige værdi - typisk med oplysninger om
				afsender, modtager, varebeskrivelse, antal, vægt og oprindelsesland.
			</p>

			<h3 class="mt-6 text-xl font-semibold">2. Tilbud og godkendelse</h3>
			<p>
				Skal kunden eller en ledelse godkende et beløb, før arbejdet går i gang, fungerer
				proformafakturaen som et konkret prisudkast. Kunden ser præcis, hvordan den endelige faktura
				vil se ud - og der opstår ingen misforståelser om, hvad der faktureres for.
			</p>

			<h3 class="mt-6 text-xl font-semibold">3. Forudbetaling og depositum</h3>
			<p>
				Kræver du betaling forud - f.eks. et depositum - kan proformafakturaen vise, hvad kunden
				skal betale, og hvorfor. Men bemærk: Så snart kunden betaler, skal du udstede en
				<strong>almindelig faktura</strong> for beløbet. Betaling på en proforma skal aldrig blive stående
				ubogført.
			</p>

			<h3 class="mt-6 text-xl font-semibold">4. Levering uden endelig pris</h3>
			<p>
				Ved leverancer, hvor den endelige pris først beregnes efter afslutning (f.eks. timeforbrug
				eller vægt), kan proformaen give modtageren et forkalkuleret beløb at budgettere efter.
			</p>
		</section>

		<section>
			<h2 class="text-2xl font-bold tracking-tight">
				Proformafaktura og bogføring: sådan behandles den
			</h2>
			<p class="mb-4">
				Det vigtigste at forstå: <strong
					>En proformafaktura er ikke et bogføringsmæssigt dokument.</strong
				> Den kan ikke bogføres som gæld eller tilgodehavende, den udløser ikke momspligt, og den opfylder
				ikke kravene i momsloven til en faktura.
			</p>
			<ul class="list-disc space-y-2 pl-6">
				<li>
					<strong>Salget bogføres først ved den rigtige faktura.</strong> Proformaen er kun et vedlæggende
					dokument - når leverancen faktureres, gælder de almindelige regler om bogføring og momsindberetning.
				</li>
				<li>
					<strong>Betaling på proforma skal faktureres.</strong> Modtager kunden betaling på baggrund
					af en proforma, udsteder du straks en almindelig faktura med fakturanummer og moms.
				</li>
				<li>
					<strong>Brug ikke dine fakturanumre.</strong> Giv proformaer deres egen nummerserie, så de fortløbende
					fakturanumre forbliver uden huller.
				</li>
				<li>
					<strong>Marker dokumentet tydeligt.</strong> Overskriften skal lyde "Proformafaktura - ikke
					en regning", så modtageren ikke bogfører dokumentet som en reel faktura.
				</li>
				<li>
					<strong>Opbevaring.</strong> Selvom proformaen ikke er et bogføringsbilag, er det god skik at
					gemme den sammen med den tilhørende faktura, så sammenligningen mellem udkast og endeligt beløb
					kan dokumenteres.
				</li>
			</ul>
			<p class="mt-4">
				Rettelser efter fakturering klareres derimod ikke med en proforma, men med en kreditnota
				efterfulgt af en ny, korrekt faktura. Reglerne er gennemgået i vores guide om
				<a href="/blog/krav-til-faktura/">krav til faktura</a>.
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
			<h2 class="text-2xl font-bold">Opret proforma- og almindelige fakturaer gratis</h2>
			<p class="text-muted-foreground mt-2">
				Generatoren klarer begge dele: proformafaktura med tydelig markering - og den rigtige
				faktura med moms og fortløbende numre, når leverancen skal faktureres.
			</p>
			<div class="mt-6 flex flex-wrap items-center justify-center gap-3">
				<Button size="lg" href="/generator/">Opret faktura gratis</Button>
				<Button size="lg" variant="outline" href="/blog/krav-til-faktura/">Se lovkravene</Button>
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

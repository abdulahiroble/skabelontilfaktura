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

	const articleDates = ARTICLE_DATES.example;

	const meta = buildMeta({
		title: 'Eksempel på faktura: sådan ser en korrekt faktura ud (2026)',
		description:
			'Se et eksempel på faktura med alle lovpligtige felter forklaret: CVR, fakturanummer, moms 25 %, total, betalingsbetingelser - og de typiske fejl.',
		canonical: '/blog/eksempel-paa-faktura/',
		ogType: 'article'
	});

	const faq = [
		{
			question: 'Hvad skal der minimum stå på en faktura?',
			answer:
				'En faktura skal som minimum indeholde: fakturadato, et fortløbende og unikt fakturanummer, sælgers CVR-nummer samt navn og adresse, købers navn og adresse, en beskrivelse af varer eller ydelser med antal, leveringsdato (hvis den afviger fra fakturadatoen), momsgrundlag, momssats og momsbeløb samt totalbeløbet inkl. moms.'
		},
		{
			question: 'Hvordan beregner jeg momsen på 25%?',
			answer:
				'Har du et beløb uden moms, ganger du med 0,25 for at finde momsen: 12.000 kr. x 0,25 = 3.000 kr. Er beløbet derimod opgivet inkl. moms, finder du momsen ved at gange med 0,20 (fordi 25 ud af 125 svarer til 20%): 15.000 kr. x 0,20 = 3.000 kr.'
		},
		{
			question: 'Må jeg bruge et eksempel på faktura som skabelon?',
			answer:
				'Ja, det er en god idé at udgangspunkt. Bare sørg for, at alle felter er udfyldt med dine egne oplysninger, og at fakturaen lever op til kravene i momsloven § 52a. Vores gratis generator klarer det automatisk for dig.'
		},
		{
			question: 'Hvor finder jeg de fulde lovkrav til fakturaer?',
			answer:
				'De fulde krav følger af momsloven § 52a og er samlet i vores guide til krav til faktura, hvor alle 11 obligatoriske felter, momsregler og opbevaringskrav er gennemgået i detaljer.'
		}
	];

	const breadcrumbs = [
		{ name: 'Forside', url: 'https://skabelontilfaktura.dk/' },
		{ name: 'Guides', url: 'https://skabelontilfaktura.dk/blog/' },
		{ name: 'Eksempel på faktura', url: 'https://skabelontilfaktura.dk/blog/eksempel-paa-faktura/' }
	];

	const article = blogPostingSchema({
		headline: 'Eksempel på faktura: sådan ser en korrekt faktura ud (2026)',
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
	title="Eksempel på faktura: sådan ser en korrekt faktura ud (2026)"
	subtitle="Et gennemarbejdet eksempel på faktura, hvor alle lovpligtige felter er markeret og forklaret - plus de fejl, du skal undgå."
	category="Eksempler"
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
		<span class="text-foreground">Eksempel på faktura</span>
	</nav>

	<div class="space-y-8 leading-relaxed">
		<section>
			<p class="mb-4">
				Hvad skal der egentlig stå på en faktura - og hvordan ser det ud i praksis? Nedenfor finder
				du et komplet eksempel på faktura, hvor alle de lovpligtige felter er markeret med tal
				(1)-(11). Tallene henviser til gennemgangen lige under eksemplet, så du kan tjekke din egen
				faktura felt for felt.
			</p>
			<p>
				Eksemplet følger kravene i momsloven § 52a. Læser du hellere reglerne først, kan du starte i
				vores guide om <a href="/blog/krav-til-faktura/">krav til faktura</a>.
			</p>
		</section>

		<section>
			<h2 class="text-2xl font-bold tracking-tight">
				Eksempel på faktura med alle lovpligtige felter
			</h2>
			<p class="mb-4">
				Her er en korrekt udfyldt faktura fra det fiktive <em>Malerfirma Hansen ApS</em>, der har
				malet facaden for <em>Café Nørrebro ApS</em>:
			</p>

			<div class="border-border bg-background overflow-hidden rounded-xl border shadow-sm">
				<div
					class="border-border bg-muted/30 flex flex-col gap-4 border-b p-6 sm:flex-row sm:items-start sm:justify-between"
				>
					<div>
						<p class="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
							Afsender
						</p>
						<p class="mt-1 font-semibold">
							Malerfirma Hansen ApS
							<span class="text-primary text-xs font-bold" aria-hidden="true">(4)</span>
						</p>
						<p class="text-muted-foreground text-sm">Vesterbrogade 12, 1. tv.</p>
						<p class="text-muted-foreground text-sm">1620 København V</p>
						<p class="text-muted-foreground text-sm">
							CVR: 12 34 56 78
							<span class="text-primary text-xs font-bold" aria-hidden="true">(3)</span>
						</p>
					</div>
					<div class="sm:text-right">
						<p class="text-xl font-bold tracking-tight">FAKTURA</p>
						<p class="text-muted-foreground mt-1 text-sm">
							Nr. 2026-042
							<span class="text-primary text-xs font-bold" aria-hidden="true">(2)</span>
						</p>
						<p class="text-muted-foreground text-sm">
							Fakturadato: 14. september 2026
							<span class="text-primary text-xs font-bold" aria-hidden="true">(1)</span>
						</p>
					</div>
				</div>

				<div class="grid gap-6 p-6 sm:grid-cols-2">
					<div>
						<p class="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
							Modtager
						</p>
						<p class="mt-1 font-semibold">Café Nørrebro ApS</p>
						<p class="text-muted-foreground text-sm">Jagtvej 100</p>
						<p class="text-muted-foreground text-sm">
							2200 København N
							<span class="text-primary text-xs font-bold" aria-hidden="true">(5)</span>
						</p>
					</div>
					<div class="sm:text-right">
						<p class="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
							Leveringsdato
						</p>
						<p class="text-muted-foreground mt-1 text-sm">
							2. september 2026
							<span class="text-primary text-xs font-bold" aria-hidden="true">(7)</span>
						</p>
					</div>
				</div>

				<div class="overflow-x-auto px-6">
					<table class="w-full text-sm">
						<thead>
							<tr class="border-border text-muted-foreground border-b text-left">
								<th class="py-2 pr-3 font-medium">Beskrivelse</th>
								<th class="py-2 pr-3 text-right font-medium">Antal</th>
								<th class="py-2 pr-3 text-right font-medium">Pris</th>
								<th class="py-2 text-right font-medium">Beløb</th>
							</tr>
						</thead>
						<tbody>
							<tr class="border-border border-b">
								<td class="py-2 pr-3">
									Maling af facade, inkl. grunding
									<span class="text-primary text-xs font-bold" aria-hidden="true">(6)</span>
								</td>
								<td class="py-2 pr-3 text-right whitespace-nowrap">1 stk.</td>
								<td class="py-2 pr-3 text-right whitespace-nowrap">8.000,00 kr.</td>
								<td class="py-2 text-right whitespace-nowrap">8.000,00 kr.</td>
							</tr>
							<tr class="border-border border-b">
								<td class="py-2 pr-3">Arbejdsløn, maler</td>
								<td class="py-2 pr-3 text-right whitespace-nowrap">32 timer</td>
								<td class="py-2 pr-3 text-right whitespace-nowrap">125,00 kr.</td>
								<td class="py-2 text-right whitespace-nowrap">4.000,00 kr.</td>
							</tr>
						</tbody>
					</table>
				</div>

				<div class="p-6 pb-2">
					<div
						class="border-border bg-muted/30 ml-auto w-full max-w-xs space-y-1.5 rounded-lg p-4 text-sm sm:w-72"
					>
						<div class="text-muted-foreground flex justify-between">
							<span>
								Momsgrundlag
								<span class="text-primary text-xs font-bold" aria-hidden="true">(8)</span>
							</span>
							<span>12.000,00 kr.</span>
						</div>
						<div class="text-muted-foreground flex justify-between">
							<span>
								Moms 25%
								<span class="text-primary text-xs font-bold" aria-hidden="true">(9) (10)</span>
							</span>
							<span>3.000,00 kr.</span>
						</div>
						<div class="border-border flex justify-between border-t pt-2 text-base font-bold">
							<span>
								At betale
								<span class="text-primary text-xs font-bold" aria-hidden="true">(11)</span>
							</span>
							<span>15.000,00 kr.</span>
						</div>
					</div>
				</div>

				<div class="border-border bg-muted/30 border-t p-6">
					<div class="grid gap-4 text-sm sm:grid-cols-2">
						<div>
							<p class="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
								Betalingsbetingelser
							</p>
							<p class="text-muted-foreground mt-1">
								Betaling senest 14 dage efter fakturadato, dvs. 28. september 2026.
							</p>
						</div>
						<div class="sm:text-right">
							<p class="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
								Betalingsoplysninger
							</p>
							<p class="text-muted-foreground mt-1">Reg. 1555 - Konto 0012345678</p>
							<p class="text-muted-foreground">MobilePay: 12 34 56 78</p>
						</div>
					</div>
				</div>
			</div>
			<p class="text-muted-foreground mt-3 text-sm">
				Tallene (1)-(11) markerer de lovpligtige felter. Betalingsbetingelser og
				bank-/MobilePay-oplysninger er ikke lovpligtige, men god skik.
			</p>
		</section>

		<section>
			<h2 class="text-2xl font-bold tracking-tight">
				Gennemgang: hvert felt i eksemplet forklaret
			</h2>
			<ol class="list-decimal space-y-3 pl-6">
				<li>
					<strong>Fakturadato</strong> - datoen for udstedelsen, her 14. september 2026. Datoen bruges
					bl.a. til at afgøre, hvilken momsperiode salget hører hjemme i.
				</li>
				<li>
					<strong>Fakturanummer</strong> - et fortløbende, unikt nummer (2026-042). Hvert nummer må kun
					bruges én gang, også efter kreditnotaer.
				</li>
				<li>
					<strong>Sælgers CVR-nummer</strong> - Malerfirmaets CVR 12 34 56 78. Udenlandske sælgere bruger
					i stedet deres SE-nummer.
				</li>
				<li>
					<strong>Sælgers navn og adresse</strong> - virksomhedens officielle oplysninger, så modtageren
					ved præcis, hvem regningen kommer fra.
				</li>
				<li>
					<strong>Købers navn og adresse</strong> - kundens fulde navn og adresse. Er kunden en virksomhed,
					bør også kundens CVR-nummer fremgå.
				</li>
				<li>
					<strong>Mængde og art af varer eller ydelser</strong> - en tydelig beskrivelse med antal og
					pris pr. enhed. "Ydelse" alene er ikke nok.
				</li>
				<li>
					<strong>Leveringsdato</strong> - skal med, hvis den afviger fra fakturadatoen. Her blev arbejdet
					leveret 2. september, men fakturaen først sendt 14. september.
				</li>
				<li>
					<strong>Momsgrundlaget</strong> - det samlede beløb uden moms (12.000 kr.), inkl. pris pr. enhed
					og eventuelle rabatter.
				</li>
				<li>
					<strong>Momssatsen</strong> - normalt 25% i Danmark. Satsen skal fremgå særskilt.
				</li>
				<li>
					<strong>Momsbeløbet</strong> - det konkrete momsbeløb i kroner: 12.000 kr. x 25% = 3.000 kr.
				</li>
				<li>
					<strong>Totalbeløbet inkl. moms</strong> - 15.000 kr. Det er det beløb, kunden skal betale.
				</li>
			</ol>
			<p class="mt-4">
				Alle felter automatisk udfyldt? Vores <a
					href="/generator/"
					class="text-primary hover:underline">gratis fakturagenerator</a
				> sørger for nummerering, moms og CVR-opslag, så du ikke skal huske dem selv.
			</p>
		</section>

		<section class="border-border bg-muted/30 rounded-xl border p-6">
			<h2 class="text-xl font-bold">Tjekliste: sammenlign din faktura med eksemplet</h2>
			<ul class="mt-3 space-y-2">
				<li>✓ Fortløbende, unikt fakturanummer</li>
				<li>✓ Fakturadato - og leveringsdato, hvis den afviger</li>
				<li>✓ CVR-nummer og navn/adresse på sælger</li>
				<li>✓ Navn og adresse på køber</li>
				<li>✓ Tydelig beskrivelse med antal og pris pr. enhed</li>
				<li>✓ Momsgrundlag, momssats (25%) og momsbeløb hver for sig</li>
				<li>✓ Totalbeløb inkl. moms</li>
				<li>✓ Betalingsbetingelser og bank-/MobilePay-oplysninger</li>
			</ul>
		</section>

		<section>
			<h2 class="text-2xl font-bold tracking-tight">Typiske fejl på fakturaer</h2>
			<p class="mb-4">
				Det er de mest almindelige fejl, vi ser på fakturaer lavet i Word og Excel:
			</p>
			<ul class="list-disc space-y-2 pl-6">
				<li>
					<strong>Manglende eller genbrugt fakturanummer.</strong> Nummeret skal være unikt - laver du
					en ny faktura baseret på en gammel, skal nummeret altid være nyt.
				</li>
				<li>
					<strong>Kun "inkl. moms" i totalen.</strong> Det er ikke nok. Momsgrundlag, momssats og momsbeløb
					skal alle fremgå særskilt.
				</li>
				<li>
					<strong>Ufuldstændige adresse- og CVR-oplysninger.</strong> Både din egen og kundens oplysninger
					skal være komplette.
				</li>
				<li>
					<strong>Vage beskrivelser.</strong> "Konsulentydelse" uden art og omfang opfylder ikke kravene
					- beskriv, hvad der er leveret, hvornår og hvor meget.
				</li>
				<li>
					<strong>Manglende leveringsdato.</strong> Afviger leveringen fra fakturadatoen, skal leveringsdatoen
					med - ellers risikerer kunden at bogføre i forkert periode.
				</li>
				<li>
					<strong>Fejl i momsberegningen.</strong> Tjek altid, at momsen er 25% af momsgrundlaget - og
					ikke af et beløb, der allerede indeholder moms.
				</li>
			</ul>
			<p class="mt-4">
				Er der først gået fejl i en sendt faktura, rettes den med en
				<a href="/blog/kreditnota/">kreditnota</a> efterfulgt af en ny, korrekt faktura - du må ikke
				slette eller overskrive den oprindelige. Flere svar finder du i vores
				<a href="/blog/faktura-skabelon-faq/">fakturaskabelon-FAQ</a>.
			</p>
		</section>

		<section>
			<p>
				Eksemplet her er med vilje generisk - dine kunder møder dig dog i et konkret fag. Vælg et
				udgangspunkt, der passer til din branche, blandt vores
				<a href="/skabeloner/">skabeloner efter erhverv</a>, eller
				<a href="/generator/">lav din faktura online gratis</a> med nøjagtig de samme felter som i eksemplet
				ovenfor.
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
			<h2 class="text-2xl font-bold">Lav din egen faktura ud fra eksemplet</h2>
			<p class="text-muted-foreground mt-2">
				Generatoren følger samme struktur som eksemplet ovenfor - med alle lovpligtige felter, moms
				og CVR-opslag indbygget.
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

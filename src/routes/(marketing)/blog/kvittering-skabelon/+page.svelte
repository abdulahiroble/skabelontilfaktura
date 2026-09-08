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

	const articleDates = ARTICLE_DATES.receipt;

	const meta = buildMeta({
		title: 'Kvitteringsskabelon – gratis og nem skabelon til kvitteringer (2026)',
		description:
			'Gratis kvittering skabelon med eksempel: forskellen på kvittering og faktura, hvad den skal indeholde, og hvornår en kvittering er nok i Danmark.',
		canonical: '/blog/kvittering-skabelon/',
		ogType: 'article'
	});

	const faq = [
		{
			question: 'Er en kvittering det samme som en faktura?',
			answer:
				'Nej. En kvittering dokumenterer, at der er betalt - en faktura er et betalingskrav, der skal udstedes, før betalingen sker. Fakturaen skal desuden opfylde de lovpligtige krav i momsloven § 52a med bl.a. fakturanummer, CVR-nummer og særskilt moms, hvilket der ikke er formelle krav til ved en kvittering.'
		},
		{
			question: 'Hvornår kan jeg nøjes med en kvittering?',
			answer:
				'Ved små salg uden momspligt - f.eks. hvis din omsætning er under 50.000 kr. årligt og du ikke er momsregistreret - er en kvittering normalt nok. Det samme gælder detailhandel, hvor kassebonen fungerer som kvittering. Er du derimod momsregistreret, eller forlanger kunden en faktura, skal du udstede en rigtig faktura.'
		},
		{
			question: 'Skal der moms på en kvittering?',
			answer:
				'Kun hvis din virksomhed er momsregistreret - enten ordinært eller via FrivilligRegistreringsordningen. I så fald skal momsgrundlag, momssats og momsbeløb fremgå af kvitteringen. Er du ikke momsregistreret, må du ikke opkræve moms, og det bør fremgå af kvitteringen med f.eks. teksten "Ikke momsregistreret".'
		},
		{
			question: 'Kan jeg bruge en kvitteringsskabelon som faktura?',
			answer:
				'Nej. En faktura skal opfylde momslovens krav om bl.a. fortløbende fakturanummer, CVR-nummer, momsgrundlag, momssats og momsbeløb. Brug i stedet vores eksempel på faktura eller gratis fakturagenerator, når dokumentet skal fungere som en reel faktura.'
		}
	];

	const breadcrumbs = [
		{ name: 'Forside', url: 'https://skabelontilfaktura.dk/' },
		{ name: 'Guides', url: 'https://skabelontilfaktura.dk/blog/' },
		{ name: 'Kvitteringsskabelon', url: 'https://skabelontilfaktura.dk/blog/kvittering-skabelon/' }
	];

	const article = blogPostingSchema({
		headline: 'Kvitteringsskabelon – gratis og nem skabelon til kvitteringer (2026)',
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
	title="Kvitteringsskabelon – gratis og nem skabelon til kvitteringer (2026)"
	subtitle="Forskellen på kvittering og faktura, hvad kvitteringen skal indeholde - og et eksempel, du kan kopiere direkte."
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
		<span class="text-foreground">Kvitteringsskabelon</span>
	</nav>

	<div class="space-y-8 leading-relaxed">
		<section>
			<p class="mb-4">
				En kvittering er det enkleste salgsdokument, du kan udstede: den bekræfter, at der er
				betalt. Men hvornår er en kvittering nok - og hvornår kræves der en rigtig faktura? I denne
				guide får du forskellen forklaret, en liste over, hvad kvitteringen skal indeholde, og en
				kvitteringsskabelon med et konkret eksempel, du kan kopiere.
			</p>
		</section>

		<section>
			<h2 class="text-2xl font-bold tracking-tight">Kvittering vs. faktura: forskellen</h2>
			<p class="mb-4">De to dokumenter forveksles ofte, men tjener to forskellige formål:</p>
			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead>
						<tr class="border-border border-b text-left">
							<th class="py-2 pr-3 font-semibold">Egenskab</th>
							<th class="py-2 pr-3 font-semibold">Kvittering</th>
							<th class="py-2 font-semibold">Faktura</th>
						</tr>
					</thead>
					<tbody class="text-muted-foreground">
						<tr class="border-border border-b">
							<td class="text-foreground py-2 pr-3 font-medium">Formål</td>
							<td class="py-2 pr-3">Dokumenterer, at betaling er sket</td>
							<td class="py-2">Betalingskrav for leveret vare eller ydelse</td>
						</tr>
						<tr class="border-border border-b">
							<td class="text-foreground py-2 pr-3 font-medium">Tidspunkt</td>
							<td class="py-2 pr-3">Udstedes i forbindelse med betalingen</td>
							<td class="py-2">Udstedes før betalingen (typisk 8-30 dages frist)</td>
						</tr>
						<tr class="border-border border-b">
							<td class="text-foreground py-2 pr-3 font-medium">Lovpligtige felter</td>
							<td class="py-2 pr-3">Ingen formelle krav som ved fakturaer</td>
							<td class="py-2">11 obligatoriske felter efter momsloven § 52a</td>
						</tr>
						<tr class="border-border">
							<td class="text-foreground py-2 pr-3 font-medium">Giver momsfradrag</td>
							<td class="py-2 pr-3">Normalt nej</td>
							<td class="py-2">Ja, for momsregistrerede købere</td>
						</tr>
					</tbody>
				</table>
			</div>
			<p class="mt-4">
				Skal dokumentet fungere som et betalingskrav, skal det opfylde alle lovkravene - se vores
				<a href="/blog/eksempel-paa-faktura/">eksempel på faktura</a>, hvor hvert felt er markeret
				og forklaret.
			</p>
		</section>

		<section>
			<h2 class="text-2xl font-bold tracking-tight">Hvornår er en kvittering nok?</h2>
			<p class="mb-4">En kvittering er normalt nok i disse situationer:</p>
			<ul class="list-disc space-y-2 pl-6">
				<li>
					<strong>Små salg uden momspligt.</strong> Har du en årlig omsætning under 50.000 kr. og ingen
					momsregistrering, må du ikke opkræve moms - og kunden kan typisk heller ikke trække moms fra.
					En kvittering dokumenterer handlen fint.
				</li>
				<li>
					<strong>Detailhandel og korthandel.</strong> I butikker og ved standsalg udstedes kassebonen
					automatisk fra kassasystemet eller kortterminalen - det er en kvittering.
				</li>
				<li>
					<strong>Når kunden ikke forlanger en faktura.</strong> Kunden kan dog altid forlange en faktura
					- og for momsregistrerede købere er den ofte nødvendig for at trække momsen fra.
				</li>
			</ul>
			<p class="mt-4">
				<strong>FrivilligRegistreringsordningen (FRO):</strong> Er din omsætning under 50.000 kr., men
				du vil gerne opkræve og trække moms fra - f.eks. fordi dine kunder er virksomheder - kan du melde
				dig frivilligt til moms. Bliver du registreret via FRO, skal kvitteringer ved momspligtige salg
				vise momsen særskilt, og kunden kan forlange en rigtig faktura.
			</p>
		</section>

		<section>
			<h2 class="text-2xl font-bold tracking-tight">Hvad skal en kvittering indeholde?</h2>
			<p class="mb-4">
				Der er ikke lovkrav til kvitteringer på samme måde som til fakturaer, men en god kvittering
				indeholder:
			</p>
			<ul class="list-disc space-y-2 pl-6">
				<li>Dit virksomhedsnavn og adresse - og CVR-nummer, hvis du har et</li>
				<li>Dato og tidspunkt for salget</li>
				<li>Beskrivelse af varen eller ydelsen med antal og pris</li>
				<li>Det samlede beløb - med momsgrundlag og momsbeløb, hvis du er momsregistreret</li>
				<li>Betalingsform (kontant, kort, MobilePay)</li>
				<li>Teksten "Ikke momsregistreret", hvis du ikke opkræver moms</li>
			</ul>
			<p class="mt-4">
				Gem kvitteringen som kopi - bilag skal opbevares i 5 år i henhold til bogføringsloven, også
				små kvitteringer.
			</p>
		</section>

		<section>
			<h2 class="text-2xl font-bold tracking-tight">Eksempel på kvittering</h2>
			<p class="mb-4">
				Her er en kvittering fra den fiktive blomsterbutik <em>Blomsterhuset ApS</em>, der er
				momsregistreret:
			</p>
			<div class="border-border bg-background mx-auto max-w-sm rounded-xl border shadow-sm">
				<div class="border-border border-b p-6 text-center">
					<p class="text-lg font-bold tracking-widest">KVITTERING</p>
					<p class="text-muted-foreground mt-2 text-sm">Blomsterhuset ApS</p>
					<p class="text-muted-foreground text-sm">Blomstervej 8, 8000 Aarhus C</p>
					<p class="text-muted-foreground text-sm">CVR: 23 45 67 89</p>
				</div>
				<div class="text-muted-foreground px-6 py-4 text-sm">
					<p>Dato: 4. september 2026, kl. 14:32</p>
				</div>
				<div class="px-6">
					<table class="w-full text-sm">
						<tbody>
							<tr class="border-border border-b">
								<td class="py-2 pr-2">1 x Buket i årstidens farver</td>
								<td class="py-2 text-right whitespace-nowrap">249,00 kr.</td>
							</tr>
							<tr>
								<td class="text-muted-foreground py-2 pr-2 text-xs">
									Heraf momsgrundlag 199,20 kr. + moms 25% 49,80 kr.
								</td>
								<td></td>
							</tr>
						</tbody>
					</table>
				</div>
				<div class="border-border space-y-1.5 border-t px-6 py-4 text-sm">
					<div class="flex justify-between font-bold">
						<span>Betalt</span>
						<span>249,00 kr.</span>
					</div>
					<div class="text-muted-foreground flex justify-between">
						<span>Betalingsform</span>
						<span>MobilePay</span>
					</div>
				</div>
				<div class="border-border bg-muted/30 border-t p-4 text-center">
					<p class="text-muted-foreground text-xs">Tak for din handel!</p>
				</div>
			</div>
			<p class="text-muted-foreground mt-3 text-sm">
				Er butikken ikke momsregistreret, udelades momslinjen, og der tilføjes teksten "Ikke
				momsregistreret".
			</p>
		</section>

		<section>
			<p>
				Skal handlen derimod faktureres, skal der en rigtig faktura til:
				<a href="/generator/">lav faktura online gratis</a> i generatoren, og brug kvitteringen dér, hvor
				den er nok.
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
			<h2 class="text-2xl font-bold">Skal handlen faktureres?</h2>
			<p class="text-muted-foreground mt-2">
				Brug vores gratis fakturagenerator, når kunden skal have en rigtig faktura - med alle
				lovpligtige felter, moms og CVR-opslag.
			</p>
			<div class="mt-6 flex flex-wrap items-center justify-center gap-3">
				<Button size="lg" href="/generator/">Lav faktura gratis</Button>
				<Button size="lg" variant="outline" href="/blog/eksempel-paa-faktura/">
					Se eksempel på faktura
				</Button>
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

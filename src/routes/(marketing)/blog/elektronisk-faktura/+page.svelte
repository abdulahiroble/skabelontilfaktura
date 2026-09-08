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

	const articleDates = ARTICLE_DATES.electronicInvoice;

	const meta = buildMeta({
		title: 'Elektronisk faktura: hvad er det, og hvordan sender du en e-faktura?',
		description:
			'Hvad er en elektronisk faktura? Lær forskellen på PDF og ægte e-faktura, hvornår den kræves, og hvordan du sender den via NemHandel.',
		canonical: '/blog/elektronisk-faktura/',
		ogType: 'article'
	});

	const faq = [
		{
			question: 'Hvad er en elektronisk faktura?',
			answer:
				'En elektronisk faktura (e-faktura) er en faktura, der udstedes, sendes, modtages og behandles i et struktureret digitalt format, så den kan læses automatisk af modtagerens bogholderisystem - uden manuel indtastning. I Danmark bruges typisk formaterne OIOUBL og PEPPOL BIS Billing 3.0, og fakturaen sendes via NemHandel-infrastrukturen.'
		},
		{
			question: 'Hvordan sender jeg en elektronisk faktura?',
			answer:
				'Det nemmeste er at bruge et bogholderisystem med indbygget NemHandel-adgang: Udfyld fakturaen som normalt, og vælg e-faktura som afsendelsesmetode. Du kan også tilkoble din virksomhed NemHandel via virk.dk eller lade din bogholder eller revisor stå for afsendelsen. Skal du først sende til offentlige kunder, kræves der en tilknytning til NemHandel.'
		},
		{
			question: 'Er en PDF en elektronisk faktura?',
			answer:
				'Nej, ikke i formel forstand. En PDF er et digitalt dokument, men det indeholder ikke strukturerede data, som et system kan aflæse automatisk - modtageren skal nøjes med at læse den eller taste tallene ind manuelt. En ægte e-faktura består derimod af strukturerede felter (beløb, moms, CVR-numre, varelinjer), der sendes system-til-system.'
		},
		{
			question: 'Skal jeg bruge elektronisk faktura til mine kunder?',
			answer:
				'Sælger du til det offentlige (stat, regioner og kommuner), ja: Der skal dine fakturaer sendes elektronisk via NemHandel. Mellem private virksomheder (B2B) er e-fakturering i Danmark frivillig - der er ingen generel pligt, og en almindelig faktura eller PDF er fortsat tilladt. Er du i tvivl om din konkrete situation, så kontakt din revisor.'
		},
		{
			question: 'Hvad er NemHandel?',
			answer:
				'NemHandel er statens infrastruktur for udveksling af elektroniske erhvervsdokumenter i Danmark, primært e-fakturaer til det offentlige. Offentlige enheder modtager deres fakturaer via NemHandel, og virksomheder tilkobles gennem deres bogholderisystem eller via virk.dk. Systemet moderniseres løbende og bygger i stigende grad på det europæiske Peppol-netværk.'
		}
	];

	const breadcrumbs = [
		{ name: 'Forside', url: 'https://skabelontilfaktura.dk/' },
		{ name: 'Guides', url: 'https://skabelontilfaktura.dk/blog/' },
		{ name: 'Elektronisk faktura', url: 'https://skabelontilfaktura.dk/blog/elektronisk-faktura/' }
	];

	const article = blogPostingSchema({
		headline: 'Elektronisk faktura: hvad er det, og hvordan sender du en e-faktura?',
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
	title="Elektronisk faktura: hvad er det, og hvordan sender du en e-faktura?"
	subtitle="PDF og e-mail er ikke det samme som en ægte e-faktura. Lær, hvad en elektronisk faktura er, hvornår den kræves, og hvordan du sender den via NemHandel."
	category="Bogføring"
	datePublished={articleDates.published}
	dateModified={articleDates.modified}
	dateLabel={articleDates.modifiedLabel}
	author={ARTICLE_AUTHOR}
	readingTime="7 min læsning"
>
	<nav class="not-prose text-muted-foreground mb-10 text-sm" aria-label="Brødkrummer">
		<a href="/" class="hover:text-foreground">Forside</a>
		<span class="mx-2">/</span>
		<a href="/blog/" class="hover:text-foreground">Guides</a>
		<span class="mx-2">/</span>
		<span class="text-foreground">Elektronisk faktura</span>
	</nav>

	<div class="space-y-8 leading-relaxed">
		<section>
			<p class="mb-4">
				De fleste danske virksomheder sender deres fakturaer som PDF-filer via e-mail. Det føles
				digitalt - men i bogholderimæssig forstand er det det ikke. En ægte
				<strong>elektronisk faktura</strong> (e-faktura) er nemlig ikke et dokument, man åbner og læser.
				Det er strukturerede data, der sendes direkte fra dit bogholderisystem til modtagerens - så tallene
				lander automatisk det rigtige sted, uden at nogen skal taste dem ind.
			</p>
			<p>
				Sælger du til det offentlige, er e-faktura allerede et krav. Og selv når den er frivillig,
				kan den spare dig for tid og fejl. Her får du svar på, hvad en elektronisk faktura er,
				hvornår du skal bruge den, og hvordan du sender en i praksis.
			</p>
		</section>

		<section>
			<h2 class="text-2xl font-bold tracking-tight">Hvad er en elektronisk faktura?</h2>
			<p class="mb-4">
				En elektronisk faktura er en faktura, der <strong
					>udstedes, sendes, modtages og behandles i et struktureret digitalt format</strong
				>. I stedet for et synligt layout med tabeller og logoer består den af definerede felter:
				beløb, momssats, CVR-numre, fakturanummer og varelinjer. Modtagerens system kan derfor
				aflæse indholdet automatisk og føre fakturaen direkte videre i bogholderiet.
			</p>
			<p class="mb-4">I Danmark er de mest udbredte formater:</p>
			<ul class="list-disc space-y-2 pl-6">
				<li>
					<strong>OIOUBL.</strong> Den danske nationalstandard til e-fakturering, som har været brugt
					til det offentlige via NemHandel i en årrække.
				</li>
				<li>
					<strong>PEPPOL BIS Billing 3.0.</strong> Den europæiske standard, der bruges i Peppol-netværket
					og i stigende grad også i Danmark, efterhånden som NemHandel moderniseres.
				</li>
			</ul>
			<p>
				Fælles for begge er, at fakturaen sendes via <strong>NemHandel</strong> - statens infrastruktur
				for udveksling af elektroniske erhvervsdokumenter. Det betyder, at afsender og modtager ikke behøver
				at bruge det samme system; infrastrukturen sørger for, at fakturaen når frem i det rigtige format.
			</p>
		</section>

		<section>
			<h2 class="text-2xl font-bold tracking-tight">Hvornår kræves elektronisk faktura?</h2>
			<p class="mb-4">
				Hovedreglen i Danmark er enkel: <strong
					>e-faktura er et krav, når du sælger til det offentlige</strong
				>.
			</p>
			<ul class="list-disc space-y-2 pl-6">
				<li>
					<strong>B2G - offentlige kunder (krav).</strong> Sælger du varer eller ydelser til stat, regioner
					og kommuner, skal dine fakturaer sendes elektronisk via NemHandel. Det gælder, uanset om kunden
					er et ministerium eller en kommunal institution.
				</li>
				<li>
					<strong>B2B - private virksomheder (frivilligt).</strong> Mellem private virksomheder er der
					i Danmark ingen generel pligt til at sende e-faktura. En almindelig faktura - også som PDF -
					er fortsat tilladt. Flere virksomheder vælger det alligevel, fordi det gør bogholderiet hurtigere
					og mere fejlfrit.
				</li>
				<li>
					<strong>B2C - privatkunder (frivilligt).</strong> Til privatkunder sender man typisk en almindelig
					faktura eller et betalingslink; e-faktura i NemHandel-format er slet ikke beregnet til den type
					kunder.
				</li>
			</ul>
			<p class="mt-4">
				Reglerne om digital bogføring ændres løbende - bl.a. gennem kravene i den nye bogføringslov.
				Få det fulde overblik i vores <a href="/blog/bogforingslov-2026-guide/"
					>guide til bogføringsloven 2026</a
				>, eller kontakt din revisor, hvis du er i tvivl om, hvad der gælder for netop din
				virksomhed.
			</p>
		</section>

		<section>
			<h2 class="text-2xl font-bold tracking-tight">Sådan sender du en elektronisk faktura</h2>
			<p class="mb-4">
				For at sende en e-faktura skal din virksomhed være tilknyttet NemHandel. I praksis er der
				tre gængse veje ind:
			</p>
			<ol class="list-decimal space-y-2 pl-6">
				<li>
					<strong>Via dit bogholderisystem.</strong> De fleste digitale bogholderisystemer har NemHandel-adgang
					indbygget. Du opretter fakturaen som normalt og vælger e-faktura som afsendelsesmetode - systemet
					klarer formatet (OIOUBL eller PEPPOL) og afsendelsen.
				</li>
				<li>
					<strong>Via virk.dk.</strong> Du kan selv tilkoble din virksomhed NemHandel via statens
					serviceside
					<a href="https://virk.dk" target="_blank" rel="noopener noreferrer">virk.dk</a>. Det
					kræver lidt opsætning, men giver dig direkte adgang til at sende til offentlige modtagere.
				</li>
				<li>
					<strong>Via din bogholder eller revisor.</strong> Mange lader bogholderiet stå for faktureringen.
					Spørg, om de kan sende e-faktura på dine vegne - det er ofte den nemmeste løsning, hvis du kun
					fakturerer det offentlige sjældent.
				</li>
			</ol>
			<p class="mt-4">
				Hvis modtageren derimod er en privatkunde eller en lille virksomhed, er en almindelig
				faktura ofte nok. Du kan lave en gratis i vores <a href="/generator/">fakturagenerator</a>
				- den indeholder alle de lovpligtige felter, og du kan downloade den som PDF og sende den på e-mail.
				Husk uanset format at følge de almindelige
				<a href="/blog/krav-til-faktura/">krav til faktura</a>: fakturanummer, dato, CVR, moms og
				betalingsbetingelser.
			</p>
		</section>

		<section>
			<h2 class="text-2xl font-bold tracking-tight">Hvad koster det, og hvad får du ud af det?</h2>
			<p class="mb-4">
				Omkostningerne afhænger af, hvordan du vælger at komme på: De fleste bogholderisystemer har
				NemHandel-afsendelse med i abonnementet, mens selvstændige løsninger og bogholderhjælp
				koster ekstra. Undersøg, hvad din nuværende løsning indeholder, før du køber noget nyt.
			</p>
			<p class="mb-4">Til gengæld er fordelene ganske konkrete:</p>
			<ul class="list-disc space-y-2 pl-6">
				<li>
					<strong>Hurtigere behandling.</strong> Fakturaen lander direkte i modtagerens system og betales
					typisk hurtigere end en PDF, der skal åbnes, læses og tastes ind.
				</li>
				<li>
					<strong>Færre fejl.</strong> Strukturerede data udfyldes og valideres automatisk - der kommer
					ingen tastefejl undervejs.
				</li>
				<li>
					<strong>Sporbarhed.</strong> Hver faktura har et spor gennem infrastrukturen, så du kan dokumentere,
					hvornår den blev sendt og leveret.
				</li>
				<li>
					<strong>Lette rettelser.</strong> Skal du rette en fejl, sendes en
					<a href="/blog/kreditnota/">kreditnota</a> på samme strukturerede måde, så modtagerens bogholderi
					korrigeres automatisk.
				</li>
			</ul>
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
			<h2 class="text-2xl font-bold">Skal du sende til en privatkunde?</h2>
			<p class="text-muted-foreground mt-2">
				Vores generator laver korrekte fakturaer med alle lovpligtige felter - klar til download og
				afsendelse på under et minut.
			</p>
			<div class="mt-6 flex flex-wrap items-center justify-center gap-3">
				<Button size="lg" href="/generator/">Opret faktura gratis</Button>
				<Button size="lg" variant="outline" href="/blog/krav-til-faktura/"
					>Se kravene til fakturaer</Button
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

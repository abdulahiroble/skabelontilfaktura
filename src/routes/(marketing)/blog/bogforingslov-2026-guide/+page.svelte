<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		buildMeta,
		faqPageSchema,
		breadcrumbSchema,
		type FaqQuestion,
		type BreadcrumbItem
	} from '$lib/seo';

	const meta = buildMeta({
		title: 'Ny bogføringslov 2026: Komplet guide for selvstændige',
		description:
			'Alt om den nye bogføringslov fra 2026: Hvem berøres? Hvad kræves der? SAF-T 2.0, NemHandel og digitale bogføringssystemer forklaret simpelt.',
		canonical: '/blog/bogforingslov-2026-guide/',
		ogType: 'article'
	});

	const faqQuestions: FaqQuestion[] = [
		{
			question: 'Hvem berøres af bogføringsloven fra 2026?',
			answer:
				'Fra 1. januar 2026 skal enkeltmandsvirksomheder og personligt drevne virksomheder med en omsætning på over 300.000 DKK om året anvende et digitalt bogføringssystem. ApS, A/S og andre kapitalselskaber har allerede skulle bruge digitale systemer siden 1. januar 2024.'
		},
		{
			question: 'Hvad er SAF-T 2.0 og hvornår gælder det?',
			answer:
				'SAF-T (Standard Audit File for Tax) er en international XML-standard, som Erhvervsstyrelsen bruger til at udtrække regnskabsdata. Fra 1. januar 2027 skal alle, der er omfattet af bogføringsloven, kunne eksportere deres regnskab som SAF-T 2.0 XML-fil til SKAT og revisor.'
		},
		{
			question: 'Hvad sker der hvis jeg ikke overholder bogføringsloven?',
			answer:
				'Manglende overholdelse kan medføre bøder fra Erhvervsstyrelsen, og i alvorlige tilfælde kan virksomheden blive tvangsopløst. Derudover risikerer du at få afvist dine fradrag hos SKAT, hvilket kan medføre ekstra skat plus renter.'
		},
		{
			question: 'Skal jeg stadig opbevare bilag i 5 år?',
			answer:
				'Ja, bogføringsloven kræver fortsat opbevaring af bilag i 5 år efter regnskabsårets udløb. Fra 2026 skal opbevaringen ske digitalt og i et format, der kan læses af offentlige myndigheder. Papirbilag er ikke længere nok alene.'
		}
	];

	const breadcrumbs: BreadcrumbItem[] = [
		{ name: 'Forside', url: 'https://skabelontilfaktura.dk/' },
		{ name: 'Guides', url: 'https://skabelontilfaktura.dk/blog/' },
		{
			name: 'Bogføringslov 2026 guide',
			url: 'https://skabelontilfaktura.dk/blog/bogforingslov-2026-guide/'
		}
	];

	const faq = faqPageSchema(faqQuestions);
	const breadcrumb = breadcrumbSchema(breadcrumbs);
	const jsonLd = [faq, breadcrumb];

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

<article class="mx-auto max-w-3xl px-4 py-12">
	<nav class="text-muted-foreground mb-8 text-sm" aria-label="Brødkrummer">
		<a href="/" class="hover:text-foreground">Forside</a>
		<span class="mx-2">/</span>
		<a href="/blog/" class="hover:text-foreground">Guides</a>
		<span class="mx-2">/</span>
		<span class="text-foreground">Bogføringslov 2026</span>
	</nav>

	<header class="mb-10">
		<p class="text-primary text-sm font-medium tracking-wide uppercase">Lovgivning</p>
		<h1 class="mt-2 text-4xl font-bold tracking-tight">
			Ny bogføringslov 2026: Komplet guide for selvstændige
		</h1>
		<p class="text-muted-foreground mt-3 text-lg">
			Alt om overgangen til digital bogføring, SAF-T 2.0 og NemHandel - forklaret simpelt uden
			juridisk volapyk.
		</p>
		<p class="text-muted-foreground mt-2 text-xs">Opdateret juli 2026</p>
	</header>

	<div class="space-y-8 leading-relaxed">
		<section>
			<p class="mb-4">
				Den <strong>bogføringslov</strong>, som Erhvervsstyrelsen fremsatte i 2022 og som trådte i
				kraft fra 1. januar 2024, er den største ændring af dansk bogføringspraksis i årtier. Loven
				udrulleres gradvist frem mod 2027 og vil påvirke stort set alle erhvervsdrivende i Danmark -
				fra den lille enkeltmandsvirksomhed til store aktieselskaber. Hvis du driver selvstændig
				virksomhed, er det afgørende, at du forstår, hvornår reglerne rammer dig, og hvad du konkret
				skal gøre for at være klar.
			</p>
			<p class="mb-4">
				Formålet med loven er at modernisere bogføringen, bekæmpe sort arbejde og gøre det lettere
				for såvel SKAT som revisorer at gennemgå regnskaber. Samtidig åbner digitaliseringen for
				større effektivitet: Med de rette systemer kan du slippe for manuel indtastning, undgå
				regnefejl og få et meget bedre overblik over din økonomi i realtid.
			</p>
			<p>
				I denne guide gennemgår vi tidslinjen, hvem der berøres, de konkrete krav, og hvordan du
				bedst forbereder dig - uanset om du er freelancer, enkeltmandsvirksomhed eller et lille ApS.
			</p>
		</section>

		<section>
			<h2 class="text-2xl font-bold tracking-tight">Tidslinje: Hvornår træder reglerne i kraft?</h2>
			<p class="mb-4">
				Bogføringsloven er designet som en rullemning over flere år. Her er de vigtigste milepæle,
				du skal kende:
			</p>
			<ol class="border-border space-y-4 border-l-2 pl-6">
				<li>
					<h3 class="font-semibold">1. januar 2024 - ApS og A/S</h3>
					<p class="text-muted-foreground text-sm">
						Alle kapitalselskaber (ApS, A/S, IVS) og foreninger med pligt til revisorårligt regnskab
						skal anvende et digitalt bogføringssystem. Manuelt Excel-regnskab er ikke længere
						tilladt.
					</p>
				</li>
				<li>
					<h3 class="font-semibold">1. januar 2026 - Enkeltmandsvirksomheder over 300.000 DKK</h3>
					<p class="text-muted-foreground text-sm">
						Personligt drevne virksomheder (enkeltmandsvirksomhed, I/S, G/S) med en årlig omsætning
						på over 300.000 DKK skal nu også bruge et digitalt system.
					</p>
				</li>
				<li>
					<h3 class="font-semibold">1. juli 2026 - NemHandel bliver standard</h3>
					<p class="text-muted-foreground text-sm">
						NemHandel overgår til Peppol-netværket som standard for e-fakturering til det
						offentlige. OIOUBL-formatet udfases gradvist og erstattes af Peppol BIS 4.0.
					</p>
				</li>
				<li>
					<h3 class="font-semibold">1. januar 2027 - SAF-T 2.0 eksport påkrævet</h3>
					<p class="text-muted-foreground text-sm">
						Alle, der er omfattet af bogføringsloven, skal kunne eksportere deres fulde regnskab som
						en SAF-T 2.0 XML-fil på forlangende af SKAT eller revisor.
					</p>
				</li>
			</ol>
		</section>

		<section>
			<h2 class="text-2xl font-bold tracking-tight">Hvem berøres af bogføringsloven?</h2>
			<p class="mb-4">
				Loven gælder alle, der har <strong>bogføringspligt</strong> efter årsregnskabsloven. Det omfatter
				langt de fleste erhvervsdrivende - men tærsklerne for hvornår du rent faktisk skal handle, afhænger
				af din virksomhedsform og omsætning.
			</p>
			<ul class="list-disc space-y-2 pl-6">
				<li>
					<strong>Kapitalselskaber (ApS, A/S, IVS):</strong> Skal altid bruge et digitalt bogføringssystem.
					Reglen gælder allerede fra 1. januar 2024, uanset omsætning.
				</li>
				<li>
					<strong>Enkeltmandsvirksomheder:</strong> Skal bruge digitalt system fra 1. januar 2026, hvis
					omsætningen overstiger 300.000 DKK om året.
				</li>
				<li>
					<strong>I/S, G/S og andre personligt drevne selskaber:</strong> Samme regler som enkeltmandsvirksomheder.
				</li>
				<li>
					<strong>Foreninger og fonde:</strong> Skal bruge digitalt system, hvis de har regnskabspligt.
				</li>
				<li>
					<strong>Små virksomheder under 300.000 DKK:</strong> Undtaget fra kravet om digitalt system
					- men skal stadig overholde almindelig bogføringspligt efter bogføringsloven.
				</li>
			</ul>
			<p class="mt-4">
				Er du i tvivl om, hvorvidt din virksomhed er omfattet? En god tommelfingerregel er, at du
				har bogføringspligt, hvis du driver selvstændig erhvervsvirksomhed med det formål at tjene
				penge - uanset om du er momsregistreret eller ej.
			</p>
		</section>

		<section>
			<h2 class="text-2xl font-bold tracking-tight">Hvad kræves der konkret?</h2>
			<p class="mb-4">
				Bogføringsloven stiller tre hovedkrav, som dit bogføringssystem skal opfylde:
			</p>
			<div class="grid gap-4 sm:grid-cols-3">
				<div class="border-border rounded-lg border p-4">
					<div class="text-primary text-2xl font-bold">1</div>
					<h3 class="mt-2 font-semibold">Registrering</h3>
					<p class="text-muted-foreground mt-1 text-sm">
						Systemet skal være et godkendt digitalt bogføringssystem med løbende, kronologisk
						registrering af alle bilag og posteringer.
					</p>
				</div>
				<div class="border-border rounded-lg border p-4">
					<div class="text-primary text-2xl font-bold">2</div>
					<h3 class="mt-2 font-semibold">Opbevaring</h3>
					<p class="text-muted-foreground mt-1 text-sm">
						Bilag skal opbevares digitalt i 5 år efter regnskabsårets udløb, i et format der kan
						læses af offentlige myndigheder.
					</p>
				</div>
				<div class="border-border rounded-lg border p-4">
					<div class="text-primary text-2xl font-bold">3</div>
					<h3 class="mt-2 font-semibold">Automatisering</h3>
					<p class="text-muted-foreground mt-1 text-sm">
						Systemet skal understøtte elektronisk fakturering (NemHandel/Peppol) og kunne eksportere
						data i SAF-T 2.0 format.
					</p>
				</div>
			</div>
		</section>

		<section>
			<h2 class="text-2xl font-bold tracking-tight">
				SAF-T 2.0: Hvad er det, og hvornår skal du bruge det?
			</h2>
			<p class="mb-4">
				<strong>SAF-T</strong> står for <em>Standard Audit File for Tax</em> og er en international XML-standard
				udviklet af OECD. SAF-T 2.0 er den danske tilpasning, som Erhvervsstyrelsen og SKAT bruger til
				elektronisk at udtrække regnskabsdata.
			</p>
			<p class="mb-4">
				Fra <strong>1. januar 2027</strong> skal alle bogføringspligtige virksomheder kunne eksportere
				hele deres regnskab som en SAF-T 2.0 XML-fil. Det betyder i praksis:
			</p>
			<ul class="list-disc space-y-2 pl-6">
				<li>SKAT kan anmode om filen ved en eventuel kontrol.</li>
				<li>Din revisor kan bruge filen som grundlag for årsregnskabet.</li>
				<li>Du slipper for at sende papirbilag eller PDF-udskrifter frem og tilbage.</li>
			</ul>
			<p class="mt-4">
				For at være klar skal dit bogføringssystem understøtte SAF-T 2.0 eksport. Det gør de fleste
				moderne cloud-baserede systemer, men hvis du stadig kører med desktop-software eller Excel,
				er det tid til at skifte.
			</p>
		</section>

		<section>
			<h2 class="text-2xl font-bold tracking-tight">NemHandel og Peppol: E-fakturering fremover</h2>
			<p class="mb-4">
				<strong>NemHandel</strong> er det danske system for elektronisk fakturering til det
				offentlige. Siden 2005 har det været obligatorisk for virksomheder at sende e-fakturaer til
				stat, regioner og kommuner. Men systemet er nu ved at blive moderniseret og integreret i det
				europæiske <strong>Peppol-netværk</strong>.
			</p>
			<p class="mb-4">
				Fra <strong>1. juli 2026</strong> bliver Peppol standarden for e-fakturering i Danmark. Det betyder
				konkrete ændringer:
			</p>
			<ul class="list-disc space-y-2 pl-6">
				<li>
					<strong>OIOUBL udfases:</strong> Det gamle danske XML-format ophører med at være understøttet
					og erstattes af Peppol BIS 4.0.
				</li>
				<li>
					<strong>Peppol BIS 4.0:</strong> Det nye fælles europæiske format, som alle e-fakturaer til
					det offentlige skal følge.
				</li>
				<li>
					<strong>Tvungen e-fakturering udvides:</strong> Flere B2B-transaktioner forventes at blive omfattet
					i de kommende år, i tråd med EU-direktivet om tvungen digital fakturering.
				</li>
			</ul>
			<p class="mt-4">
				For at kunne sende Peppol-fakturaer skal dit faktureringssystem være tilsluttet en Peppol
				Access Point-udbyder. Det er typisk en funktion, der indgår i moderne cloudbaserede
				regnskabssystemer.
			</p>
		</section>

		<section>
			<h2 class="text-2xl font-bold tracking-tight">Hvordan hjælper skabelontilfaktura.dk?</h2>
			<p class="mb-4">
				Hos skabelontilfaktura.dk har vi opdateret vores <strong>Pro-abonnement</strong>, så du er
				helt dækket ind i forhold til bogføringsloven 2026. Vores Pro-tier inkluderer:
			</p>
			<ul class="list-disc space-y-2 pl-6">
				<li>
					<strong>SAF-T 2.0 eksport</strong> - Hent hele dit regnskab som gyldig XML med ét klik.
				</li>
				<li>
					<strong>5 års cloud-opbevaring</strong> af alle fakturaer og bilag - som loven kræver.
				</li>
				<li>
					<strong>Klientdatabase</strong> - hold styr på alle dine kunder på tværs af enheder.
				</li>
				<li>
					<strong>Automatisk nummerering</strong> - fakturanumre, der følger bogføringslovens krav.
				</li>
				<li>
					<strong>Rykkermails</strong> - send automatisk rykker og inkassovarsel efter reglerne.
				</li>
			</ul>
			<p class="mt-4">
				Til kun <strong>49 DKK om måneden</strong> får du et fuldt lovformligt system, der fjerner bekymringen
				om compliance, så du kan koncentrere dig om at drive din virksomhed.
			</p>
		</section>

		<section>
			<h2 class="text-2xl font-bold tracking-tight">Ofte stillede spørgsmål</h2>
			<div class="space-y-6">
				{#each faqQuestions as item (item.question)}
					<div>
						<h3 class="font-semibold">{item.question}</h3>
						<p class="text-muted-foreground mt-1 text-sm">{item.answer}</p>
					</div>
				{/each}
			</div>
		</section>

		<section class="border-border bg-muted/30 rounded-xl border p-8 text-center">
			<h2 class="text-2xl font-bold">Klar til at overholde bogføringsloven?</h2>
			<p class="text-muted-foreground mt-2">
				Opgrader til Pro og få SAF-T 2.0 eksport, 5 års cloud-opbevaring og rykkermails. Fra kun 49
				DKK/måned.
			</p>
			<div class="mt-6 flex flex-wrap items-center justify-center gap-3">
				<Button size="lg" href="/pris/">Se Pro-prisen</Button>
				<Button size="lg" variant="outline" href="/generator/">Lav en faktura gratis</Button>
			</div>
		</section>

		<section class="text-muted-foreground border-border border-t pt-6 text-sm">
			<p>
				<strong>Ansvarsfraskrivelse:</strong> Denne artikel er generel information og ikke juridisk
				rådgivning. For konkret vejledning om din virksomheds situation anbefaler vi at kontakte en
				revisor eller Erhvervsstyrelsen. Læs mere om gældende regler på
				<a href="https://erst.dk" class="text-primary hover:underline" rel="noopener">erst.dk</a>.
			</p>
		</section>
	</div>
</article>

<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import ArticleLayout from '$lib/components/ArticleLayout.svelte';
	import {
		buildMeta,
		faqPageSchema,
		howToSchema,
		breadcrumbSchema,
		type FaqQuestion,
		type HowToStep,
		type BreadcrumbItem
	} from '$lib/seo';

	const meta = buildMeta({
		title: 'Faktura uden CVR: Sådan fakturerer du som privatperson (2026)',
		description:
			'Lær hvordan du sender faktura uden CVR-nummer i Danmark. Regler for under 50.000 DKK, CPR første 6 cifre, og hvornår du skal registrere dig.',
		canonical: '/blog/faktura-uden-cvr/',
		ogType: 'article'
	});

	const howToSteps: HowToStep[] = [
		{
			name: 'Tjek om du er undtaget fra CVR-registrering',
			text: 'Du kan fakturere uden CVR-nummer, hvis din samlede årlige omsætning fra salg af varer og tjenesteydelser er under 50.000 DKK (ekskl. moms). Husk at lægge alle indtægter sammen.'
		},
		{
			name: 'Brug CPR-nummerets første 6 cifre',
			text: 'I stedet for CVR-nummer skal du angive dit CPR-nummers første 6 cifre (fødselsdatoen) på fakturaen. Dette er SKATs krav for at kunne identificere dig.'
		},
		{
			name: 'Udfyld de obligatoriske felter',
			text: 'Fakturaen skal indeholde: dit navn og adresse, kundens navn og adresse, fakturadato, unikt fakturanummer, beskrivelse af ydelsen, beløb og betalingsbetingelser.'
		},
		{
			name: 'Vælg om fakturaen skal indeholde moms',
			text: 'Er du ikke momsregistreret, må fakturaen ikke indeholde moms. Skriv tydeligt "Ikke momsregistreret" på fakturaen, så kunden ved, hvorfor der ikke er moms.'
		},
		{
			name: 'Send fakturaen og gem kopi',
			text: 'Send fakturaen som PDF pr. e-mail eller e-faktura. Husk at gemme en kopi i mindst 5 år til SKAT, selvom du ikke har CVR-nummer.'
		}
	];

	const faqQuestions: FaqQuestion[] = [
		{
			question: 'Kan man sende faktura uden CVR-nummer?',
			answer:
				'Ja, hvis din samlede årlige omsætning er under 50.000 DKK, kan du sende fakturaer uden CVR-nummer. I stedet skal du bruge CPR-nummerets første 6 cifre (fødselsdato). Det er vigtigt, at du overholder grænsen - overskrider du den, skal du registrere dig som virksomhed.'
		},
		{
			question: 'Hvor meget må jeg tjene uden at have CVR?',
			answer:
				'Du må have en samlet omsætning på op til 50.000 DKK om året (eksklusive moms) fra erhvervsmæssig aktivitet, før du er forpligtet til at registrere dig hos Erhvervsstyrelsen. Beløbet gælder for hele kalenderåret og lægges sammen på tværs af alle aktiviteter.'
		},
		{
			question: 'Skal jeg betale skat af indtægter uden CVR?',
			answer:
				'Ja, alle indtægter skal opgives på selvangivelsen som B-indkomst, selvom du ikke har CVR-nummer. SKAT opkræver normalt beskæftigelsesbidrag (8%) og AM-bidrag via forskudsopgørelsen. Du får dog ikke automatisk et skattekort, så husk at oplyse indtægten.'
		},
		{
			question: 'Hvad sker der hvis jeg overskrider 50.000 DKK grænsen?',
			answer:
				'Så snart din omsætning overstiger 50.000 DKK i et kalenderår, skal du registrere dig som virksomhed hos Erhvervsstyrelsen og få et CVR-nummer. Du skal typisk også momsregistreres, hvis omsætningen forventes at overstige 50.000 DKK årligt. Sker det ikke rettidigt, kan det medføre bøder.'
		}
	];

	const breadcrumbs: BreadcrumbItem[] = [
		{ name: 'Forside', url: 'https://skabelontilfaktura.dk/' },
		{ name: 'Guides', url: 'https://skabelontilfaktura.dk/blog/' },
		{ name: 'Faktura uden CVR', url: 'https://skabelontilfaktura.dk/blog/faktura-uden-cvr/' }
	];

	const howTo = howToSchema(howToSteps, {
		name: 'Sådan laver du en faktura uden CVR-nummer',
		description:
			'Trin-for-trin guide til at sende en lovlig faktura som privatperson uden CVR-nummer i Danmark.'
	});
	const faq = faqPageSchema(faqQuestions);
	const breadcrumb = breadcrumbSchema(breadcrumbs);
	const jsonLd = [howTo, faq, breadcrumb];

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
	title="Faktura uden CVR: Sådan fakturerer du som privatperson (2026)"
	subtitle="Skal du sende en faktura uden at have et CVR-nummer? Her er reglerne, trin-for-trin og hvornår du skal registrere dig."
	category="Privatpersoner"
	date="Opdateret juli 2026"
	readingTime="6 min læsning"
>
	<nav class="not-prose text-muted-foreground mb-10 text-sm" aria-label="Brødkrummer">
		<a href="/" class="hover:text-foreground">Forside</a>
		<span class="mx-2">/</span>
		<a href="/blog/" class="hover:text-foreground">Guides</a>
		<span class="mx-2">/</span>
		<span class="text-foreground">Faktura uden CVR</span>
	</nav>

	<div class="space-y-8 leading-relaxed">
		<section>
			<p class="mb-4">
				Mange danskere tjener lidt ekstra ved at sælge varer eller ydelser - måske du har solgt et
				håndværk, holdt et kursus eller lavet freelancearbejde i små mængder. Spørgsmålet er ofte:
				<strong>kan jeg sende en faktura uden at have et CVR-nummer?</strong> Svaret er ja - men kun under
				bestemte betingelser.
			</p>
			<p>
				Ifølge Erhvervsstyrelsen kan du fakturere uden CVR-nummer, hvis din samlede årlige omsætning
				fra erhvervsmæssig aktivitet er under <strong>50.000 DKK eksklusiv moms</strong>. Det er
				vigtigt, at du kender reglerne - ellers risikerer du bøder, og i værste fald at SKAT afviser
				dine fradrag.
			</p>
		</section>

		<section>
			<h2 class="text-2xl font-bold tracking-tight">Reglerne for faktura uden CVR</h2>
			<p class="mb-4">
				For at sende en faktura uden CVR-nummer, skal følgende betingelser være opfyldt:
			</p>
			<ul class="list-disc space-y-2 pl-6">
				<li>
					Din samlede årlige omsætning fra salg af varer og tjenesteydelser skal være under
					<strong>50.000 DKK ekskl. moms</strong>.
				</li>
				<li>
					Forbruget af varer til videresalg skal være under <strong>50.000 DKK</strong>.
				</li>
				<li>Du må ikke være momsregistreret eller have et CVR-nummer.</li>
				<li>
					Aktiviteten skal være af <em>erhvervsmæssig karakter</em> - altså ikke bare et engangs-salg
					af brugte privatejendele.
				</li>
			</ul>
			<p class="mt-4">
				Når disse betingelser er opfyldt, kan du legitimere dig over for kunden med
				<strong>CPR-nummerets første 6 cifre</strong> (altså fødselsdatoen DDMMÅÅ). Du skal altså
				<strong>ikke</strong> oplyse hele dit CPR-nummer.
			</p>
		</section>

		<section>
			<h2 class="text-2xl font-bold tracking-tight">Sådan udfylder du fakturaen - trin for trin</h2>
			<p class="mb-4">
				En faktura uden CVR-nummer skal indeholde mange af de samme oplysninger som en almindelig
				virksomhedsfaktura. Her er hvad der skal med:
			</p>
			<ol class="list-decimal space-y-3 pl-6">
				<li>
					<strong>Afsender:</strong> Dit fulde navn, adresse og CPR-nummerets første 6 cifre (fødselsdato).
				</li>
				<li>
					<strong>Modtager:</strong> Kundens navn og adresse (eller CVR, hvis kunden er en virksomhed).
				</li>
				<li>
					<strong>Fakturadato og fakturanummer:</strong> Brug et unikt nummer for hver faktura (f.eks.
					2026-001, 2026-002).
				</li>
				<li>
					<strong>Beskrivelse af ydelse:</strong> Hvad har du solgt? Antal, enhedspris og evt. dato for
					levering.
				</li>
				<li>
					<strong>Beløb:</strong> Samlet beløb uden moms. Skriv tydeligt
					<em>"Ikke momsregistreret - moms ikke pålagt"</em>.
				</li>
				<li>
					<strong>Betalingsbetingelser:</strong> Betalingsfrist (f.eks. 8 dage), bankkonto eller MobilePay-nummer.
				</li>
			</ol>
			<p class="mt-4">
				Vil du spare tid? Vores <a href="/generator/" class="text-primary hover:underline"
					>gratis fakturagenerator</a
				> laver automatisk en korrekt formateret PDF for dig - uden at du skal tænke på regler og felter.
			</p>
		</section>

		<section>
			<h2 class="text-2xl font-bold tracking-tight">Hvornår skal du have CVR-nummer?</h2>
			<p class="mb-4">
				Grænsen på 50.000 DKK gælder for hele kalenderåret. Det betyder, at hvis du forventer at
				overskride beløbet - eller allerede har overskredet det - skal du:
			</p>
			<ol class="list-decimal space-y-2 pl-6">
				<li>Registrere dig som virksomhed hos Erhvervsstyrelsen via virk.dk.</li>
				<li>Få tildelt et CVR-nummer.</li>
				<li>Vurdere, om du skal momsregistreres (obligatorisk hvis omsætningen > 50.000 DKK).</li>
				<li>Fremover udstede fakturaer med CVR-nummer og - hvis momsregistreret - moms.</li>
			</ol>
			<p class="mt-4">
				<strong>Vigtigt:</strong> Grænsen gælder alene erhvervsmæssig omsætning. Sælger du private ting
				på DBA eller Den Blå Avis (uden avance), tæller det ikke med. Salg af brugte privatejdelser er
				normalt ikke omfattet af momsregistreringspligten.
			</p>
		</section>

		<section>
			<h2 class="text-2xl font-bold tracking-tight">Skat og bogføring uden CVR</h2>
			<p class="mb-4">
				Selvom du ikke har CVR-nummer, har du stadig pligt til at opgive indtægterne på
				selvangivelsen. Indtægter fra erhvervsmæssig aktivitet opgives som <strong
					>B-indkomst</strong
				>
				og medfører typisk:
			</p>
			<ul class="list-disc space-y-2 pl-6">
				<li>Beskæftigelsesbidrag på 8%</li>
				<li>AM-bidrag på 8% (ud over beskæftigelsesbidraget)</li>
				<li>Personlig indkomstskat afhængigt af din skatteprocent</li>
			</ul>
			<p class="mt-4">
				Husk også at gemme alle bilag og fakturaer i mindst <strong>5 år</strong> - også selvom du ikke
				er registreret. SKAT kan kræve at se dokumentation ved en eventuel kontrol.
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
			<h2 class="text-2xl font-bold">Lav din faktura gratis</h2>
			<p class="text-muted-foreground mt-2">
				Brug vores gratis fakturagenerator - lavet specielt til private og små sælgere. Ingen
				tilmelding, ingen CVR påkrævet.
			</p>
			<div class="mt-6 flex flex-wrap items-center justify-center gap-3">
				<Button size="lg" href="/generator/">Lav faktura gratis</Button>
				<Button size="lg" variant="outline" href="/blog/faktura-skabelon-word/"
					>Se Word-guide</Button
				>
			</div>
		</section>

		<section class="text-muted-foreground border-border border-t pt-6 text-sm">
			<p>
				<strong>Ansvarsfraskrivelse:</strong> Denne artikel er generel information og ikke juridisk
				eller skattemæssig rådgivning. For konkret vejledning om din situation anbefaler vi at
				kontakte SKAT eller en revisor. Læs mere på
				<a href="https://skat.dk" class="text-primary hover:underline" rel="noopener">skat.dk</a>.
			</p>
		</section>
	</div>
</ArticleLayout>

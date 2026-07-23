<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { buildMeta, breadcrumbSchema, type BreadcrumbItem } from '$lib/seo';

	const meta = buildMeta({
		title: 'Faktura for freelancere: Den komplette guide (2026)',
		description:
			'Alt hvad freelancere skal vide om fakturering i Danmark: CVR, moms, F-skattenummer, betalingsbetingelser og skat.',
		canonical: '/blog/faktura-freelancer/',
		ogType: 'article'
	});

	const breadcrumbs: BreadcrumbItem[] = [
		{ name: 'Forside', url: 'https://skabelontilfaktura.dk/' },
		{ name: 'Guides', url: 'https://skabelontilfaktura.dk/blog/' },
		{
			name: 'Faktura for freelancere',
			url: 'https://skabelontilfaktura.dk/blog/faktura-freelancer/'
		}
	];

	const breadcrumb = breadcrumbSchema(breadcrumbs);
	const jsonLd = [breadcrumb];

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
		<span class="text-foreground">Faktura for freelancere</span>
	</nav>

	<header class="mb-10">
		<p class="text-primary text-sm font-medium tracking-wide uppercase">Freelancere</p>
		<h1 class="mt-2 text-4xl font-bold tracking-tight">
			Faktura for freelancere: Den komplette guide (2026)
		</h1>
		<p class="text-muted-foreground mt-3 text-lg">
			Alt hvad freelancere skal vide om fakturering i Danmark: CVR, moms, F-skattenummer,
			betalingsbetingelser og skat.
		</p>
		<p class="text-muted-foreground mt-2 text-xs">Opdateret juli 2026</p>
	</header>

	<div class="space-y-8 leading-relaxed">
		<section>
			<p class="mb-4">
				Som freelancer er din faktura ikke bare et stykke papir - den er et juridisk dokument, der
				skal overholde strenge danske regler for moms, bogføring og skat. En fejlagtig faktura kan
				betyde afviste fradrag, bøder eller manglende betaling fra kunden.
			</p>
			<p>
				I denne komplette guide gennemgår vi alt, hvad du som freelancer skal vide om fakturering:
				Fra registrering af CVR og F-skatte til moms, betalingsbetingelser og selvangivelse. Vi
				giver dig også konkrete tips til, hvordan du gør processen nemmere med de rette værktøjer.
			</p>
		</section>

		<section>
			<h2 class="text-2xl font-bold tracking-tight">Før du sender din første faktura</h2>
			<p class="mb-4">
				Inden du kan sende en professionel og lovlig faktura, skal du have styr på tre ting:
			</p>
			<ol class="list-decimal space-y-3 pl-6">
				<li>
					<strong>CVR-registrering:</strong> Hvis din årlige omsætning forventes at overstige 50.000 DKK,
					skal du registreres hos Erhvervsstyrelsen via virk.dk og få et CVR-nummer. Er du under grænsen,
					kan du stadig frivilligt registrere dig - det giver et mere professionelt udtryk og åbner for
					flere fradrag.
				</li>
				<li>
					<strong>F-skattekort:</strong> Som freelancer skal du have et F-skattekort (forskudsskattekort
					for selvstændige). Det bestiller du via SKATs e-TastSelv. Kunden trækker automatisk skatten,
					når de betaler dig - så undgår du en stor efterskat.
				</li>
				<li>
					<strong>Momsregistrering:</strong> Er din årlige omsætning over 50.000 DKK, skal du momsregistreres.
					Du får et SE-nummer og skal herefter afregne moms (typisk kvartalsvis) via SKATs digitale momsangivelse.
				</li>
			</ol>
		</section>

		<section>
			<h2 class="text-2xl font-bold tracking-tight">Hvad skal være på en freelancer-faktura?</h2>
			<p class="mb-4">
				Efter momsloven § 52a skal en faktura indeholde følgende obligatoriske oplysninger:
			</p>
			<ul class="list-disc space-y-2 pl-6">
				<li>Fakturanummer (unik og løbende nummerering)</li>
				<li>Fakturadato (dato for udstedelse)</li>
				<li>Leveringsdato (hvis forskellig fra fakturadato)</li>
				<li>Sælgers CVR-nummer og navn/adresse</li>
				<li>Købers CVR-nummer og navn/adresse (hvis virksomhed)</li>
				<li>Beskrivelse af solgte varer eller tjenesteydelser</li>
				<li>Antal og enhedspris (ekskl. moms)</li>
				<li>Momsgrundlag, momssats og momsbeløb</li>
				<li>Samlet beløb inkl. moms</li>
			</ul>
			<p class="mt-4">
				Udover de lovpligtige felter anbefaler vi at inkludere <strong
					>betalingsbetingelser, betalingsmiddel (bankkonto/MobilePay)</strong
				>
				og evt. <strong>referencenummer</strong>
				(PO-nummer), som mange større kunder kræver.
			</p>
		</section>

		<section>
			<h2 class="text-2xl font-bold tracking-tight">Moms for freelancere</h2>
			<p class="mb-4">
				Standardmomssatsen i Danmark er <strong>25%</strong>. Det betyder, at du lægger 25% oveni
				dit salgspris, og dette beløb indbetales til SKAT via momsangivelsen. Som udgangspunkt er
				alle tjenesteydelser og varer momspligtige - men der findes vigtige undtagelser:
			</p>
			<ul class="list-disc space-y-2 pl-6">
				<li>
					<strong>Momsfritaget omsætning:</strong> Visse erhverv er momsfritaget - f.eks. sundhedsvirksomhed,
					undervisning, finansiel virksomhed og forsikring. Du må ikke beregne moms, men må heller ikke
					trække moms fra egne indkøb.
				</li>
				<li>
					<strong>Lille momspligtig virksomhed:</strong> Er omsætningen under 50.000 DKK om året, kan
					du undlade at momsregistrere. Du må så ikke vise moms på fakturaen, men slipper også for at
					afregne moms.
				</li>
				<li>
					<strong>Udenlandsk salg:</strong> Salg til kunder i andre EU-lande eller tredjelande kan være
					omfattet af særlige regler - f.eks. omvendt betalingspligt (reverse charge) for B2B-services.
				</li>
			</ul>
			<p class="mt-4">
				Er du i tvivl om, hvorvidt din ydelse er momspligtig, kan du kontakte SKAT eller læse mere
				på skat.dk.
			</p>
		</section>

		<section>
			<h2 class="text-2xl font-bold tracking-tight">Betalingsbetingelser og rykkerprocedurer</h2>
			<p class="mb-4">
				Som freelancer er det afgørende at have klare betalingsbetingelser og en fast procedure for
				rykkere. Standard betalingsfrister i Danmark er:
			</p>
			<ul class="list-disc space-y-2 pl-6">
				<li><strong>Netto 8 dage:</strong> Almindelig for private kunder og små jobs.</li>
				<li><strong>Netto 15 dage:</strong> Standard for mange B2B-opgaver.</li>
				<li>
					<strong>Netto 30 dage:</strong> Typisk for større virksomheder og offentlige kunder.
				</li>
			</ul>
			<p class="mt-4">Er betalingen forsinket, anbefaler vi følgende rykkerproces:</p>
			<ol class="list-decimal space-y-2 pl-6">
				<li>
					<strong>Rykker 1 (efter betalingsfrist +3-5 dage):</strong> Venlig påmindelse pr. e-mail uden
					gebyr.
				</li>
				<li>
					<strong>Rykker 2 (efter +14 dage):</strong> Formel rykker med rykkergebyr (typisk 100 DKK).
				</li>
				<li>
					<strong>Inkassovarsel (efter +30 dage):</strong> Endeligt varsel om inkasso.
				</li>
				<li>
					<strong>Inkasso:</strong> Overdrag sag til inkassobureau eller advokat. Der kan pålægges renter
					og inkassosalær.
				</li>
			</ol>
			<p class="mt-4">
				Du kan sætte renter på forsinket betaling. Den lovbestemte rente er for tiden
				<strong>rentelovens morarente + 8 procentpoint</strong> pr. år.
			</p>
		</section>

		<section>
			<h2 class="text-2xl font-bold tracking-tight">Skat og selvangivelse for freelancere</h2>
			<p class="mb-4">
				Som freelancer skal du årligt opgive dine indtægter og udgifter på selvangivelsen. Det gøres
				via SKATs erhvervsindkomstopgørelse. Vigtigste punkter:
			</p>
			<ul class="list-disc space-y-2 pl-6">
				<li>
					<strong>Omsætning:</strong> Samlede fakturerede beløb (ekskl. moms).
				</li>
				<li>
					<strong>Fradrag:</strong> Alle erhvervsmæssige udgifter (udstyr, software, transport, kontor,
					kurser osv.).
				</li>
				<li>
					<strong>Personlig indkomst:</strong> Overskuddet (omsætning - fradrag) overføres til din personlige
					indkomst og beskattes med almindelig indkomstskat.
				</li>
				<li>
					<strong>Beskæftigelsesbidrag (8%):</strong> Bælægges af overskuddet fra selvstændig virksomhed
					(med fradrag for visse ydelser).
				</li>
			</ul>
			<p class="mt-4">
				Anbefaling: Brug et bogføringssystem fra start, så du ikke står med et rod af fakturaer og
				kvitteringer til selvangivelsen. Det sparer dig for mange timer og stress i foråret.
			</p>
		</section>

		<section>
			<h2 class="text-2xl font-bold tracking-tight">Værktøjer til freelancer-fakturering</h2>
			<p class="mb-4">
				Hos skabelontilfaktura.dk tilbyder vi værktøjer, der er skræddersyet til freelancere:
			</p>
			<ul class="list-disc space-y-2 pl-6">
				<li>
					<strong>Gratis fakturagenerator</strong> - lav ubegrænsede fakturaer uden vandmærke.
				</li>
				<li>
					<strong>Pro-tier (49 DKK/måned)</strong> - cloud-lagring i 5 år, klientdatabase, SAF-T 2.0 eksport
					og rykkermails.
				</li>
				<li>
					<strong>Automatisk CVR-opslag</strong> - slip for at indtaste kundedata manuelt.
				</li>
			</ul>
		</section>

		<section class="border-border bg-muted/30 rounded-xl border p-8 text-center">
			<h2 class="text-2xl font-bold">Klar til at fakturere som freelancer?</h2>
			<p class="text-muted-foreground mt-2">
				Lav din første faktura på under 60 sekunder - gratis og uden tilmelding.
			</p>
			<div class="mt-6 flex flex-wrap items-center justify-center gap-3">
				<Button size="lg" href="/generator/">Lav faktura gratis</Button>
				<Button size="lg" variant="outline" href="/pris/">Se Pro-fordele</Button>
			</div>
		</section>

		<section class="text-muted-foreground border-border border-t pt-6 text-sm">
			<p>
				<strong>Ansvarsfraskrivelse:</strong> Denne artikel er generel information og ikke juridisk
				eller skattemæssig rådgivning. For konkret vejledning om din virksomheds situation anbefaler
				vi at kontakte en revisor eller SKAT. Læs mere på
				<a href="https://skat.dk" class="text-primary hover:underline" rel="noopener">skat.dk</a>.
			</p>
		</section>
	</div>
</article>

<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { buildMeta, breadcrumbSchema, softwareApplicationSchema } from '$lib/seo';

	const tools = [
		{
			name: 'skabelontilfaktura.dk',
			url: '/generator/',
			price: 'Gratis',
			isFree: '✓',
			cvrLookup: '✓',
			autoVat: '✓',
			pdf: '✓',
			compliance: '✓',
			highlight: true,
			note: 'Nemmeste valg for selvstændige og freelancere.'
		},
		{
			name: 'Dinero',
			url: 'https://dinero.dk',
			price: 'Fra 99 DKK/måned',
			isFree: 'Begrænset',
			cvrLookup: '✓',
			autoVat: '✓',
			pdf: '✓',
			compliance: '✓',
			highlight: false,
			note: 'Fuld bogføring og regnskab til små virksomheder.'
		},
		{
			name: 'Billy',
			url: 'https://billy.dk',
			price: 'Fra 89 DKK/måned',
			isFree: 'Nej',
			cvrLookup: '✓',
			autoVat: '✓',
			pdf: '✓',
			compliance: '✓',
			highlight: false,
			note: 'Brugervenligt regnskabsprogram til selvstændige.'
		},
		{
			name: 'e-conomic',
			url: 'https://e-conomic.dk',
			price: 'Fra 199 DKK/måned',
			isFree: 'Nej',
			cvrLookup: '✓',
			autoVat: '✓',
			pdf: '✓',
			compliance: '✓',
			highlight: false,
			note: 'Professionelt økonomisystem til voksende virksomheder.'
		},
		{
			name: 'hurtigfaktura.dk',
			url: 'https://hurtigfaktura.dk',
			price: 'Gratis (begrænset)',
			isFree: 'Begrænset',
			cvrLookup: '—',
			autoVat: '✓',
			pdf: '✓',
			compliance: 'Delvist',
			highlight: false,
			note: 'Hurtig løsning til enkelte fakturaer.'
		}
	];

	const breadcrumbs = breadcrumbSchema([
		{ name: 'Forside', url: 'https://skabelontilfaktura.dk/' },
		{ name: 'Guides', url: 'https://skabelontilfaktura.dk/blog/' },
		{
			name: 'Sammenligning af faktura skabeloner',
			url: 'https://skabelontilfaktura.dk/blog/faktura-skabelon-sammenligning/'
		}
	]);

	const softwareApplication = softwareApplicationSchema({
		name: 'skabelontilfaktura.dk',
		description:
			'Gratis dansk fakturaskabelon med automatisk moms, CVR-opslag, PDF-download og overholdelse af Bogføringsloven 2026.',
		applicationCategory: 'BusinessApplication',
		operatingSystem: 'Web',
		offers: {
			price: 0,
			priceCurrency: 'DKK'
		}
	});

	const meta = buildMeta({
		title: 'De 5 bedste faktura skabeloner i Danmark (2026) - gratis og betalte',
		description:
			'Sammenlign de bedste danske fakturaskabeloner: skabelontilfaktura.dk, Dinero, Billy, e-conomic og hurtigfaktura. Priser, funktioner og anbefalinger.',
		canonical: '/blog/faktura-skabelon-sammenligning/',
		ogType: 'article'
	});

	const lt = String.fromCharCode(60);
	const jsonLdScript = `${lt}script type="application/ld+json">${JSON.stringify([breadcrumbs, softwareApplication])}${lt}/script>`;
</script>

<svelte:head>
	<title>{meta.title}</title>
	<meta name="description" content={meta.description} />
	<link rel="canonical" href={meta.canonical} />
	<meta name="robots" content={meta.robots} />

	<!-- Open Graph -->
	<meta property="og:type" content={meta.ogType} />
	<meta property="og:title" content={meta.title} />
	<meta property="og:description" content={meta.description} />
	<meta property="og:url" content={meta.canonical} />
	<meta property="og:site_name" content="skabelontilfaktura.dk" />
	<meta property="og:locale" content="da_DK" />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={meta.title} />
	<meta name="twitter:description" content={meta.description} />

	<!-- JSON-LD structured data -->
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- content is built from trusted schema.org objects, no user input -->
	{@html jsonLdScript}
</svelte:head>

<article class="mx-auto max-w-4xl px-4 py-16">
	<nav class="text-muted-foreground mb-6 text-sm" aria-label="Brødkrummer">
		<a href="/" class="hover:text-foreground">Forside</a>
		<span class="mx-2">/</span>
		<a href="/blog/" class="hover:text-foreground">Guides</a>
		<span class="mx-2">/</span>
		<span class="text-foreground">Sammenligning af faktura skabeloner</span>
	</nav>

	<h1 class="text-4xl font-bold">De 5 bedste faktura skabeloner i Danmark (2026)</h1>
	<p class="text-muted-foreground mt-3 text-lg">Gratis og betalte løsninger sammenlignet</p>

	<p class="mt-6 text-lg leading-relaxed">
		En god <strong>faktura skabelon</strong> er afgørende for at få betaling til tiden og samtidig overholde
		dansk lovgivning. Med de nye krav om digital bogføring fra januar 2026 bliver valget af faktureringsværktøj
		endnu vigtigere - især hvis din årlige omsætning overstiger 300.000 DKK. Når du vælger en skabelon
		til faktura, bør du især kigge efter tre ting: om den automatisk beregner moms, om den slår CVR-numre
		op, og om den kan levere en PDF, der lever op til Bogføringsloven. Herunder sammenligner vi de fem
		mest populære danske fakturaskabeloner, så du kan vælge den løsning, der passer bedst til din virksomhed.
	</p>

	<!-- Comparison table -->
	<div class="mt-10 overflow-x-auto">
		<table class="w-full border-collapse text-sm">
			<thead>
				<tr class="border-border border-b text-left">
					<th class="py-3 pr-4 font-semibold">Værktøj</th>
					<th class="py-3 pr-4 font-semibold">Pris</th>
					<th class="py-3 pr-4 font-semibold">Gratis?</th>
					<th class="py-3 pr-4 font-semibold">CVR-opslag</th>
					<th class="py-3 pr-4 font-semibold">Auto-moms</th>
					<th class="py-3 pr-4 font-semibold">PDF-download</th>
					<th class="py-3 font-semibold">Bogføringslov 2026</th>
				</tr>
			</thead>
			<tbody>
				{#each tools as tool (tool.name)}
					<tr class={`border-border border-b${tool.highlight ? ' bg-muted/30' : ''}`}>
						<td class="py-3 pr-4 font-medium">
							{#if tool.highlight}
								⭐ {tool.name}
							{:else}
								{tool.name}
							{/if}
						</td>
						<td class="py-3 pr-4">{tool.price}</td>
						<td class="py-3 pr-4">{tool.isFree}</td>
						<td class="py-3 pr-4">{tool.cvrLookup}</td>
						<td class="py-3 pr-4">{tool.autoVat}</td>
						<td class="py-3 pr-4">{tool.pdf}</td>
						<td class="py-3">{tool.compliance}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	<p class="text-muted-foreground mt-2 text-xs">
		Priser og funktioner er indsamlet i juli 2026 og kan være ændret. Se udbydernes egne sider for
		aktuelle oplysninger.
	</p>

	<!-- Tool descriptions -->
	<section class="mt-12 space-y-6">
		{#each tools as tool (tool.name)}
			<div
				class={`border-border rounded-xl border p-5${tool.highlight ? ' border-primary bg-muted/30 border-2' : ''}`}
			>
				<h2 class="text-xl font-semibold">
					{#if tool.highlight}⭐
					{/if}{tool.name}
				</h2>
				<p class="text-muted-foreground mt-2 text-sm leading-relaxed">{tool.note}</p>
				<p class="mt-3 text-sm">
					{#if tool.highlight}
						<a href={tool.url} class="text-primary font-medium hover:underline"
							>Brug gratis på /generator/ &rarr;</a
						>
					{:else}
						<a
							href={tool.url}
							target="_blank"
							rel="noopener noreferrer"
							class="text-primary font-medium hover:underline">Besøg {tool.name} &rarr;</a
						>
					{/if}
				</p>
			</div>
		{/each}
	</section>

	<!-- Decision section -->
	<section class="mt-16">
		<h2 class="text-3xl font-bold">Hvilken skabelon passer til dig?</h2>
		<p class="text-muted-foreground mt-3">
			Det rette valg afhænger af din virksomheds størrelse, behov og budget. Her er vores
			anbefalinger baseret på typiske scenarier.
		</p>

		<div class="mt-6 grid gap-4 md:grid-cols-2">
			<div class="border-border rounded-xl border p-5">
				<h3 class="font-semibold">"Jeg er freelancer og sender få fakturaer om året"</h3>
				<p class="text-muted-foreground mt-2 text-sm">
					Vælg <a href="/generator/" class="text-primary font-medium hover:underline"
						>skabelontilfaktura.dk</a
					>. Det er gratis, kræver ingen tilmelding, og du får en lovlig PDF på under et minut.
					Perfekt til selvstændige uden behov for fuldt regnskab.
				</p>
			</div>

			<div class="border-border rounded-xl border p-5">
				<h3 class="font-semibold">"Min virksomhed har omsætning over 300.000 DKK"</h3>
				<p class="text-muted-foreground mt-2 text-sm">
					Fra 2026 kræver loven digital bogføring. Her bør du overveje
					<a href="/pris/" class="text-primary font-medium hover:underline"
						>skabelontilfaktura.dk Pro</a
					>
					med cloud-lagring og SAF-T 2.0 eksport, eller et fuldt system som Dinero eller e-conomic.
				</p>
			</div>

			<div class="border-border rounded-xl border p-5">
				<h3 class="font-semibold">"Jeg har brug for fuldt regnskabsprogram"</h3>
				<p class="text-muted-foreground mt-2 text-sm">
					Hvis du også skal bogføre, afstemme bank og indberette moms i samme system, er Dinero,
					Billy eller e-conomic gode valg. De koster fra 89-199 DKK/måned og dækker hele
					økonomistyringen.
				</p>
			</div>

			<div class="border-border rounded-xl border p-5">
				<h3 class="font-semibold">"Jeg sender fakturaer til udlandet"</h3>
				<p class="text-muted-foreground mt-2 text-sm">
					Brug et værktøj, der understøtter Peppol e-faktura og udenlandsk momshåndtering.
					<a href="/pris/" class="text-primary font-medium hover:underline"
						>skabelontilfaktura.dk Business</a
					>
					inkluderer Peppol, og både Dinero og e-conomic har stærk international understøttelse.
				</p>
			</div>
		</div>
	</section>

	<!-- CTA -->
	<div class="bg-primary text-primary-foreground mt-16 rounded-xl p-8 text-center">
		<h2 class="text-2xl font-semibold">Start gratis i dag</h2>
		<p class="mt-3 opacity-90">
			Opret din første faktura med skabelontilfaktura.dk - gratis, lovlig og klar på 60 sekunder.
		</p>
		<Button variant="secondary" class="mt-5" href="/generator/">Lav min faktura nu</Button>
	</div>

	<!-- Related reading -->
	<div class="mt-12 border-t pt-8">
		<h2 class="text-lg font-semibold">Læs også</h2>
		<ul class="text-muted-foreground mt-3 space-y-2 text-sm">
			<li>
				<a href="/blog/faktura-skabelon-faq/" class="text-primary hover:underline"
					>Faktura skabelon FAQ - alt du skal vide (2026)</a
				>
			</li>
			<li>
				<a href="/pris/" class="text-primary hover:underline">Priser på Pro og Business</a>
			</li>
		</ul>
	</div>
</article>

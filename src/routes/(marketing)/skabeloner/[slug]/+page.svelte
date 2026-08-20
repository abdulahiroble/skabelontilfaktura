<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { buildMeta, breadcrumbSchema } from '$lib/seo';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const branch = $derived(data.branch);

	const meta = $derived(
		branch
			? buildMeta({
					title: `Faktura skabelon til ${branch.tradePlural}`,
					description: branch.description,
					canonical: `/skabeloner/${branch.slug}/`,
					ogType: 'website'
				})
			: buildMeta({
					title: 'Faktura skabelon',
					description: 'Faktura skabelon',
					canonical: '/skabeloner/',
					noindex: true
				})
	);

	const breadcrumb = $derived(
		branch
			? breadcrumbSchema([
					{ name: 'Forside', url: 'https://skabelontilfaktura.dk/' },
					{ name: 'Skabeloner efter erhverv', url: 'https://skabelontilfaktura.dk/skabeloner/' },
					{
						name: `Faktura skabelon ${branch.trade}`,
						url: `https://skabelontilfaktura.dk/skabeloner/${branch.slug}/`
					}
				])
			: null
	);

	const lt = String.fromCharCode(60);
	const jsonLdScript = $derived(
		breadcrumb
			? `${lt}script type="application/ld+json">${JSON.stringify([breadcrumb])}${lt}/script>`
			: ''
	);

	const templates = [
		{
			href: '/templates/faktura-skabelon.docx',
			label: 'Word',
			hint: '.docx'
		},
		{
			href: '/templates/faktura-skabelon.xlsx',
			label: 'Excel',
			hint: '.xlsx — med momsformler'
		},
		{
			href: '/templates/faktura-skabelon.pdf',
			label: 'PDF',
			hint: '.pdf — klar til print'
		}
	];
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
	{#if jsonLdScript}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- content is built from trusted schema.org objects, no user input -->
		{@html jsonLdScript}
	{/if}
</svelte:head>

{#if branch}
	<article class="mx-auto max-w-3xl px-6 py-12 lg:py-16">
		<nav class="text-muted-foreground mb-10 text-sm" aria-label="Brødkrummer">
			<a href="/" class="hover:text-foreground">Forside</a>
			<span class="mx-2">/</span>
			<a href="/skabeloner/" class="hover:text-foreground">Skabeloner efter erhverv</a>
			<span class="mx-2">/</span>
			<span class="text-foreground">{branch.trade}</span>
		</nav>

		<header class="border-border mb-10 border-b pb-8">
			<p class="text-accent mb-3 text-sm font-medium tracking-wide uppercase">Erhvervsskabelon</p>
			<h1 class="text-3xl leading-tight font-semibold sm:text-4xl lg:text-5xl">
				Faktura skabelon til {branch.tradePlural}
			</h1>
		</header>

		<div
			class="prose prose-neutral prose-headings:font-serif prose-headings:font-semibold prose-headings:tracking-tight prose-h2:mt-10 prose-h2:text-2xl prose-h3:text-xl prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground max-w-none"
		>
			<section class="space-y-4 leading-relaxed">
				{#each branch.intro as paragraph (paragraph)}
					<p>{paragraph}</p>
				{/each}
			</section>

			<section class="not-prose border-border bg-muted/30 mt-10 rounded-xl border p-6">
				<h2 class="text-lg font-semibold">Download skabelonen gratis</h2>
				<p class="text-muted-foreground mt-1 text-sm">
					Alle lovpligtige felter er inkluderet. Ingen tilmelding.
				</p>
				<div class="mt-4 flex flex-wrap gap-3">
					{#each templates as template (template.href)}
						<a
							href={template.href}
							download
							class="bg-background border-border hover:border-accent flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors"
						>
							{template.label}
							<span class="text-muted-foreground text-xs">{template.hint}</span>
						</a>
					{/each}
				</div>
			</section>

			<section>
				<h2>Typiske fakturaposter for {branch.tradePlural}</h2>
				<p>
					Her er, hvordan en faktura fra en {branch.trade} typisk ser ud — med de mest almindelige poster,
					enheder og prisniveauer:
				</p>
				<div class="overflow-x-auto">
					<table class="w-full text-left text-sm">
						<thead>
							<tr class="border-border border-b">
								<th class="py-2 pr-4 font-semibold">Beskrivelse</th>
								<th class="py-2 pr-4 font-semibold">Antal</th>
								<th class="py-2 pr-4 font-semibold">Enhed</th>
								<th class="py-2 text-right font-semibold">Stk.-pris (kr.)</th>
							</tr>
						</thead>
						<tbody>
							{#each branch.lineItems as item (item.description)}
								<tr class="border-border border-b">
									<td class="py-2 pr-4">{item.description}</td>
									<td class="py-2 pr-4">{item.quantity}</td>
									<td class="py-2 pr-4">{item.unit}</td>
									<td class="py-2 text-right">{item.unitPrice}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
				<p>{branch.rateNote}</p>
			</section>

			<section>
				<h2>Gode råd til fakturering som {branch.trade}</h2>
				<ul class="list-disc space-y-2 pl-6">
					{#each branch.tips as tip (tip)}
						<li>{tip}</li>
					{/each}
				</ul>
				{#if branch.momsNote}
					<p><strong>Moms:</strong> {branch.momsNote}</p>
				{/if}
				<p>
					Læs alle de lovpligtige krav i vores guide
					<a href="/blog/krav-til-faktura/">Krav til faktura: hvad skal en faktura indeholde?</a>
				</p>
			</section>

			<section>
				<h2>Nemmere end en skabelon</h2>
				<p>
					En Word- eller Excel-skabelon skal udfyldes manuelt — og du skal selv holde styr på
					fakturanumre og moms. Med vores gratis generator får du CVR-opslag, automatisk
					momsberegning og PDF-download uden vandmærke:
				</p>
				<ul class="list-disc space-y-2 pl-6">
					<li>Automatisk CVR-opslag fra Det Centrale Virksomhedsregister</li>
					<li>Automatisk moms (25% eller momsfritaget)</li>
					<li>Fortløbende fakturanumre</li>
					<li>PDF-download klar til at sende til kunden</li>
				</ul>
			</section>
		</div>

		<section class="border-border bg-muted/30 mt-12 rounded-xl border p-8 text-center">
			<h2 class="text-2xl font-bold">Lav din {branch.trade}-faktura på 60 sekunder</h2>
			<p class="text-muted-foreground mt-2">
				Generatoren er gratis — ingen tilmelding, ingen vandmærke.
			</p>
			<div class="mt-6 flex flex-wrap items-center justify-center gap-3">
				<Button size="lg" href="/generator/">Lav faktura gratis</Button>
				<Button size="lg" variant="outline" href="/skabeloner/">Se alle erhverv</Button>
			</div>
		</section>
	</article>
{/if}

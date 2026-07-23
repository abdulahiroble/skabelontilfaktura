<script lang="ts">
	import { buildMeta } from '$lib/seo';

	const meta = buildMeta({
		title: 'Guides og artikler om fakturering',
		description:
			'Gratis danske guides om fakturering, bogføringsloven 2026, moms, freelancer-økonomi og meget mere. Skrevet af skabelontilfaktura.dk.',
		canonical: '/blog/',
		ogType: 'website'
	});

	interface Article {
		slug: string;
		title: string;
		excerpt: string;
		category: string;
	}

	const articles: Article[] = [
		{
			slug: 'bogforingslov-2026-guide',
			title: 'Ny bogføringslov 2026: Komplet guide for selvstændige',
			excerpt:
				'Alt om overgangen til digital bogføring, SAF-T 2.0 og NemHandel - forklaret simpelt uden juridisk volapyk.',
			category: 'Lovgivning'
		},
		{
			slug: 'faktura-uden-cvr',
			title: 'Faktura uden CVR: Sådan fakturerer du som privatperson (2026)',
			excerpt:
				'Regler for fakturering uden CVR-nummer, grænsen på 50.000 DKK og hvornår du skal registrere dig.',
			category: 'Privatpersoner'
		},
		{
			slug: 'faktura-skabelon-word',
			title: 'Faktura skabelon Word: Sådan laver du en i Microsoft Word (2026)',
			excerpt:
				'Trin-for-trin guide til at bygge en fakturaskabelon i Word - og et nemmere online alternativ.',
			category: 'Skabeloner'
		},
		{
			slug: 'faktura-freelancer',
			title: 'Faktura for freelancere: Den komplette guide (2026)',
			excerpt:
				'Alt hvad freelancere skal vide: CVR, moms, F-skattenummer, betalingsbetingelser og selvangivelse.',
			category: 'Freelancere'
		},
		{
			slug: 'faktura-skabelon-faq',
			title: 'Faktura skabelon FAQ - alt du skal vide (2026)',
			excerpt:
				'Svar på de mest almindelige spørgsmål om fakturaskabeloner: obligatoriske felter, moms, CVR og opbevaring.',
			category: 'FAQ'
		},
		{
			slug: 'faktura-skabelon-sammenligning',
			title: 'De 5 bedste faktura skabeloner i Danmark (2026)',
			excerpt:
				'Sammenligning af gratis og betalte fakturaskabeloner - funktioner, priser og hvilken der passer til dig.',
			category: 'Sammenligning'
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
</svelte:head>

<div class="mx-auto max-w-4xl px-4 py-12">
	<header class="mb-10">
		<h1 class="text-3xl font-bold tracking-tight sm:text-4xl">Guides og artikler</h1>
		<p class="text-muted-foreground mt-3 text-lg">
			Danske guides om fakturering, bogføring, moms og skat - skrevet så alle kan være med.
		</p>
	</header>

	<div class="grid gap-6 sm:grid-cols-2">
		{#each articles as article (article.slug)}
			<a
				href={`/blog/${article.slug}/`}
				class="border-border hover:border-primary rounded-xl border p-6 transition-colors"
			>
				<p class="text-primary text-xs font-medium tracking-wide uppercase">{article.category}</p>
				<h2 class="mt-2 text-lg font-semibold">{article.title}</h2>
				<p class="text-muted-foreground mt-2 text-sm">{article.excerpt}</p>
				<p class="text-primary mt-4 text-sm font-medium">Læs mere →</p>
			</a>
		{/each}
	</div>
</div>

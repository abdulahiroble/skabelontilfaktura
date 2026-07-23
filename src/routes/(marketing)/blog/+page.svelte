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
		date: string;
		readingTime: string;
	}

	const articles: Article[] = [
		{
			slug: 'bogforingslov-2026-guide',
			title: 'Ny bogføringslov 2026: Komplet guide for selvstændige',
			excerpt:
				'Alt om overgangen til digital bogføring, SAF-T 2.0 og NemHandel - forklaret simpelt uden juridisk volapyk.',
			category: 'Lovgivning',
			date: 'Opdateret juli 2026',
			readingTime: '10 min læsning'
		},
		{
			slug: 'faktura-uden-cvr',
			title: 'Faktura uden CVR: Sådan fakturerer du som privatperson (2026)',
			excerpt:
				'Regler for fakturering uden CVR-nummer, grænsen på 50.000 DKK og hvornår du skal registrere dig.',
			category: 'Privatpersoner',
			date: 'Opdateret juli 2026',
			readingTime: '6 min læsning'
		},
		{
			slug: 'faktura-skabelon-word',
			title: 'Faktura skabelon Word: Sådan laver du en i Microsoft Word (2026)',
			excerpt:
				'Trin-for-trin guide til at bygge en fakturaskabelon i Word - og et nemmere online alternativ.',
			category: 'Skabeloner',
			date: 'Opdateret juli 2026',
			readingTime: '6 min læsning'
		},
		{
			slug: 'faktura-freelancer',
			title: 'Faktura for freelancere: Den komplette guide (2026)',
			excerpt:
				'Alt hvad freelancere skal vide: CVR, moms, F-skattenummer, betalingsbetingelser og selvangivelse.',
			category: 'Freelancere',
			date: 'Opdateret juli 2026',
			readingTime: '9 min læsning'
		},
		{
			slug: 'faktura-skabelon-faq',
			title: 'Faktura skabelon FAQ - alt du skal vide (2026)',
			excerpt:
				'Svar på de mest almindelige spørgsmål om fakturaskabeloner: obligatoriske felter, moms, CVR og opbevaring.',
			category: 'FAQ',
			date: 'Opdateret juli 2026',
			readingTime: '7 min læsning'
		},
		{
			slug: 'faktura-skabelon-sammenligning',
			title: 'De 5 bedste faktura skabeloner i Danmark (2026)',
			excerpt:
				'Sammenligning af gratis og betalte fakturaskabeloner - funktioner, priser og hvilken der passer til dig.',
			category: 'Sammenligning',
			date: 'Opdateret juli 2026',
			readingTime: '8 min læsning'
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

<div class="mx-auto max-w-5xl px-6 py-16 lg:py-24">
	<header class="mb-14 max-w-3xl">
		<p class="text-accent mb-4 text-sm font-medium tracking-wide uppercase">Guides & viden</p>
		<h1 class="text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">
			Danske guides om fakturering
		</h1>
		<p class="text-muted-foreground mt-5 text-lg leading-relaxed">
			Gratis artikler om fakturering, bogføring, moms og skat - skrevet så alle kan være med.
			Opdateret med de nyeste regler for 2026.
		</p>
	</header>

	<div class="border-border bg-border grid gap-px overflow-hidden rounded-xl border sm:grid-cols-2">
		{#each articles as article (article.slug)}
			<a
				href={`/blog/${article.slug}/`}
				class="group bg-background hover:bg-muted/40 flex flex-col p-7 transition-colors lg:p-8"
			>
				<div class="flex items-center justify-between gap-4">
					<p class="text-accent text-xs font-semibold tracking-wider uppercase">
						{article.category}
					</p>
					<span class="text-muted-foreground/70 text-xs">{article.readingTime}</span>
				</div>
				<h2 class="mt-3 text-xl leading-snug font-semibold tracking-tight">
					<span class="decoration-accent/40 underline-offset-4 group-hover:underline">
						{article.title}
					</span>
				</h2>
				<p class="text-muted-foreground mt-3 flex-1 text-sm leading-relaxed">
					{article.excerpt}
				</p>
				<div class="text-muted-foreground/80 mt-5 flex items-center gap-2 text-xs">
					<time>{article.date}</time>
				</div>
			</a>
		{/each}
	</div>
</div>

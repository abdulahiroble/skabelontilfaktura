<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import ArticleLayout from '$lib/components/ArticleLayout.svelte';
	import {
		ARTICLE_AUTHOR,
		ARTICLE_DATES,
		blogPostingSchema,
		buildMeta,
		howToSchema,
		breadcrumbSchema,
		type HowToStep,
		type BreadcrumbItem
	} from '$lib/seo';

	const articleDates = ARTICLE_DATES.googleDocs;

	const meta = buildMeta({
		title: 'Faktura skabelon Google Docs (gratis, 2026)',
		description:
			'Sådan laver du en gratis fakturaskabelon i Google Docs - trin for trin. Eller brug vores Word-skabelon og upload den til Google Drive.',
		canonical: '/blog/faktura-skabelon-google-docs/',
		ogType: 'article'
	});

	const howToSteps: HowToStep[] = [
		{
			name: 'Start fra vores Word-skabelon',
			text: 'Download vores gratis Word-skabelon og upload den til Google Drive - Docs åbner den automatisk og konverterer formatet.'
		},
		{
			name: 'Gem en kopi som din masterskabelon',
			text: 'Vælg "Filer" > "Opret en kopi" og kald den "Faktura-skabelon". Arbejd altid på en kopi, så masterskabelonen forbliver tom.'
		},
		{
			name: 'Tilpas med tabeller',
			text: 'Brug "Indsæt" > "Tabel" til fakturalinjerne med kolonner for beskrivelse, antal, enhed, pris og beløb.'
		},
		{
			name: 'Brug formler i tilknyttet regneark',
			text: 'Google Docs kan ikke selv beregne moms. Link et Google Sheet til beregningerne, eller brug en tabel i Docs og reg manuelt.'
		},
		{
			name: 'Eksporter til PDF når fakturaen er klar',
			text: 'Vælg "Filer" > "Download" > "PDF-dokument (.pdf)". PDF er det format, du bør sende til kunden.'
		}
	];

	const breadcrumbs: BreadcrumbItem[] = [
		{ name: 'Forside', url: 'https://skabelontilfaktura.dk/' },
		{ name: 'Guides', url: 'https://skabelontilfaktura.dk/blog/' },
		{
			name: 'Faktura skabelon Google Docs',
			url: 'https://skabelontilfaktura.dk/blog/faktura-skabelon-google-docs/'
		}
	];

	const howTo = howToSchema(howToSteps, {
		name: 'Sådan laver du en faktura i Google Docs',
		description: 'Trin-for-trin guide til at oprette en gratis fakturaskabelon i Google Docs.'
	});
	const breadcrumb = breadcrumbSchema(breadcrumbs);
	const article = blogPostingSchema({
		headline: 'Faktura skabelon Google Docs: Gratis guide (2026)',
		description: meta.description,
		url: meta.canonical,
		datePublished: articleDates.published,
		dateModified: articleDates.modified,
		authorName: ARTICLE_AUTHOR
	});
	const jsonLd = [article, howTo, breadcrumb];

	const lt = String.fromCharCode(60);
	const jsonLdScript = `${lt}script type="application/ld+json">${JSON.stringify(jsonLd)}${lt}/script`;
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

	<!-- eslint-disable-next-line svelte/no-at-html-tags -- content is built from trusted schema.org objects, no user input -->
	{@html jsonLdScript}
</svelte:head>

<ArticleLayout
	title="Faktura skabelon Google Docs: Gratis guide (2026)"
	subtitle="Sådan bygger du en fakturaskabelon i Google Docs - gratis, online og med automatisk sky-backup."
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
		<span class="text-foreground">Faktura skabelon Google Docs</span>
	</nav>

	<div class="space-y-8 leading-relaxed">
		<section>
			<p class="mb-4">
				Google Docs er et gratis tekstbehandlingsprogram i skyen - og derfor et oplagt valg for nye
				selvstændige, der ikke vil betale for Microsoft Office. Din fakturaskabelon ligger online,
				er tilgængelig overalt og bliver automatisk sikkerhedskopieret.
			</p>
			<p>
				Der er dog vigtige begrænsninger, du skal kende, før du vælger Docs som dit fakturaværktøj -
				især omkring momsberegning.
			</p>
		</section>

		<section>
			<h2 class="text-2xl font-bold tracking-tight">Sådan laver du en faktura i Google Docs</h2>
			<p class="mb-4">Den nemmeste vej er at starte fra en færdig skabelon:</p>
			<ol class="list-decimal space-y-3 pl-6">
				<li>
					<strong>Download vores Word-skabelon</strong> fra
					<a href="/blog/faktura-skabelon-word/">guiden til Word-skabeloner</a> - den kan åbnes direkte
					i Google Docs.
				</li>
				<li>
					<strong>Upload til Google Drive</strong> og højreklik > "Åbn med" > "Google Docs". Formatet
					konverteres automatisk.
				</li>
				<li>
					<strong>Opret en kopi</strong> ("Filer" > "Opret en kopi") og brug kopien som din masterskabelon,
					så originalen forbliver tom.
				</li>
				<li>
					<strong>Tilpas layoutet</strong> med tabeller til fakturalinjer (Indsæt > Tabel) og dit eget
					logo.
				</li>
				<li>
					<strong>Eksporter som PDF</strong> ("Filer" > "Download" > "PDF-dokument"), når fakturaen er
					klar til at sende.
				</li>
			</ol>
		</section>

		<section>
			<h2 class="text-2xl font-bold tracking-tight">Det kan Google Docs ikke</h2>
			<ul class="list-disc space-y-2 pl-6">
				<li>
					<strong>Ingen momsberegning:</strong> Docs er et tekstprogram - du skal selv regne subtotal,
					moms og total, eller koble et Google Sheet på.
				</li>
				<li>
					<strong>Ingen CVR-opslag:</strong> Virksomhedsoplysninger skal indtastes manuelt, linje for
					linje.
				</li>
				<li>
					<strong>Ingen fakturanumre:</strong> Du skal selv holde styr på nummerserien på tværs af kopier.
				</li>
				<li>
					<strong>Ingen bogføringslov-overholdelse:</strong> Dokumenter i Drive opfylder ikke i sig
					selv bogføringsloven 2026's krav om digital bogføring og SAF-T 2.0 - læs mere i
					<a href="/blog/bogforingslov-2026-guide/">guiden til bogføringsloven</a>.
				</li>
			</ul>
		</section>

		<section>
			<h2 class="text-2xl font-bold tracking-tight">Google Docs + Sheets: et ægte alternativ?</h2>
			<p>
				Mange kombinerer Google Docs (til layoutet) med Google Sheets (til beregningerne). Det
				fungerer, men du skal kopiere beløbene mellem to filer - og hver manuel overførsel er en
				mulighed for fejl. En fejl i momsbeløbet kan gøre fakturaen ugyldig, se
				<a href="/blog/krav-til-faktura/">Krav til faktura</a>.
			</p>
		</section>

		<section class="border-border bg-muted/30 rounded-xl border p-8 text-center">
			<h2 class="text-2xl font-bold">Ét sted, alle funktioner</h2>
			<p class="text-muted-foreground mt-2">
				Vores generator forener det bedste fra begge verdener: online som Docs, med formler som
				Sheets - plus CVR-opslag og PDF-output.
			</p>
			<div class="mt-6 flex flex-wrap items-center justify-center gap-3">
				<Button size="lg" href="/generator/">Lav faktura gratis</Button>
				<Button size="lg" variant="outline" href="/skabeloner/">Se erhvervsskabeloner</Button>
			</div>
		</section>

		<section class="text-muted-foreground border-border border-t pt-6 text-sm">
			<p>
				<strong>Ansvarsfraskrivelse:</strong> Denne artikel er generel information og ikke juridisk rådgivning.
				For konkret vejledning om din virksomheds situation anbefaler vi at kontakte en revisor.
			</p>
		</section>
	</div>
</ArticleLayout>

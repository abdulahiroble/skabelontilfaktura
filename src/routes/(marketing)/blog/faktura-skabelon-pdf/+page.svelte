<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import ArticleLayout from '$lib/components/ArticleLayout.svelte';
	import {
		ARTICLE_AUTHOR,
		ARTICLE_DATES,
		blogPostingSchema,
		buildMeta,
		breadcrumbSchema,
		type BreadcrumbItem
	} from '$lib/seo';

	const articleDates = ARTICLE_DATES.pdfTemplate;

	const meta = buildMeta({
		title: 'Faktura skabelon PDF (gratis download, 2026)',
		description:
			'Gratis fakturaskabelon i PDF-format, klar til print og udfyldelse. Alle lovpligtige felter inkluderet - download her uden tilmelding.',
		canonical: '/blog/faktura-skabelon-pdf/',
		ogType: 'article'
	});

	const breadcrumbs: BreadcrumbItem[] = [
		{ name: 'Forside', url: 'https://skabelontilfaktura.dk/' },
		{ name: 'Guides', url: 'https://skabelontilfaktura.dk/blog/' },
		{
			name: 'Faktura skabelon PDF',
			url: 'https://skabelontilfaktura.dk/blog/faktura-skabelon-pdf/'
		}
	];

	const breadcrumb = breadcrumbSchema(breadcrumbs);
	const article = blogPostingSchema({
		headline: 'Faktura skabelon PDF: Gratis download (2026)',
		description: meta.description,
		url: meta.canonical,
		datePublished: articleDates.published,
		dateModified: articleDates.modified,
		authorName: ARTICLE_AUTHOR
	});
	const jsonLd = [article, breadcrumb];

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
	title="Faktura skabelon PDF: Gratis download (2026)"
	subtitle="Printklar PDF-skabelon med alle lovpligtige felter - klar til at udfylde med pen eller redigeringsprogram."
	category="Skabeloner"
	datePublished={articleDates.published}
	dateModified={articleDates.modified}
	dateLabel={articleDates.modifiedLabel}
	author={ARTICLE_AUTHOR}
	readingTime="4 min læsning"
>
	<nav class="not-prose text-muted-foreground mb-10 text-sm" aria-label="Brødkrummer">
		<a href="/" class="hover:text-foreground">Forside</a>
		<span class="mx-2">/</span>
		<a href="/blog/" class="hover:text-foreground">Guides</a>
		<span class="mx-2">/</span>
		<span class="text-foreground">Faktura skabelon PDF</span>
	</nav>

	<div class="space-y-8 leading-relaxed">
		<section class="not-prose border-border bg-muted/30 rounded-xl border p-6">
			<h2 class="text-lg font-semibold">Gratis PDF-skabelon</h2>
			<p class="text-muted-foreground mt-1 text-sm">
				A4-format, printklar, med alle lovpligtige felter: fakturanummer, CVR, moms m.m.
			</p>
			<div class="mt-4 flex flex-wrap gap-3">
				<Button href="/templates/faktura-skabelon.pdf" download>Download .pdf</Button>
				<Button variant="outline" href="/templates/faktura-skabelon.docx" download>
					Word-version
				</Button>
				<Button variant="outline" href="/templates/faktura-skabelon.xlsx" download>
					Excel-version
				</Button>
			</div>
		</section>

		<section>
			<p class="mb-4">
				En PDF-faktura har én afgørende fordel: den ser ens ud overalt. I modsætning til Word- og
				Excel-filer, hvor layout kan forskubbe sig afhængigt af program, version og skrifttyper, er
				PDF-formatet låst - det, du ser, er det, kunden ser.
			</p>
			<p>
				Derfor er PDF også formatet, de fleste vælger, når fakturaen skal sendes: det ser
				professionelt ud, det kan læses på alle enheder, og det kan ikke redigeres ved en fejl af
				modtageren.
			</p>
		</section>

		<section>
			<h2 class="text-2xl font-bold tracking-tight">Sådan bruger du PDF-skabelonen</h2>
			<ol class="list-decimal space-y-3 pl-6">
				<li>
					<strong>Download filen</strong> og print den - eller udfyld den digitalt i et PDF-program, der
					tillader tekstregistrering.
				</li>
				<li>
					<strong>Udfyld felterne:</strong> Virksomhedsoplysninger, CVR, fakturanummer og -dato, kundeoplysninger
					samt fakturalinjerne med antal, enhedspris og beløb.
				</li>
				<li>
					<strong>Beregn moms:</strong> Er du momsregistreret, lægges 25% oveni subtotalen. Er du momsfritaget,
					skrives "Moms: 0 kr. (momsfritaget)".
				</li>
				<li>
					<strong>Tjek mod kravene:</strong> Sammenlign med tjeklisten i vores guide
					<a href="/blog/krav-til-faktura/">Krav til faktura</a>, før du sender.
				</li>
			</ol>
		</section>

		<section>
			<h2 class="text-2xl font-bold tracking-tight">Hvornår passer PDF-skabelonen?</h2>
			<ul class="list-disc space-y-2 pl-6">
				<li>Ved få fakturaer om året, hvor et regneark er overkill.</li>
				<li>Når du vil skrive fakturaen i hånden på et print med kursiv læselig skrift.</li>
				<li>Når du skal have et ensartet layout, der ikke kan forskubbe sig.</li>
			</ul>
			<p class="mt-4">
				Ulempen er indlysende: PDF-formatet kan ikke regne. Moms, subtotaler og numre skal håndteres
				manuelt - og der er ingen liste over, hvilke fakturanumre du allerede har brugt. Til gengæld
				genererer vores
				<a href="/generator/">online generator</a> PDF-fakturaer automatisk med korrekt moms og fortløbende
				numre.
			</p>
		</section>

		<section class="border-border bg-muted/30 rounded-xl border p-8 text-center">
			<h2 class="text-2xl font-bold">Lad PDF-en regne for dig</h2>
			<p class="text-muted-foreground mt-2">
				Generatoren laver PDF-fakturaer med automatisk moms og CVR-opslag - gratis.
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

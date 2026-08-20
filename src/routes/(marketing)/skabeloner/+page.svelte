<script lang="ts">
	import { buildMeta, breadcrumbSchema } from '$lib/seo';
	import { BRANCHES } from '$lib/branches';

	const meta = buildMeta({
		title: 'Faktura skabeloner til erhverv',
		description:
			'Gratis faktura skabeloner til dit erhverv: elektriker, tømrer, maler, VVS, fotograf, DJ og mange flere. Typiske fakturaposter og priser for hvert fag.',
		canonical: '/skabeloner/',
		ogType: 'website'
	});

	const breadcrumb = breadcrumbSchema([
		{ name: 'Forside', url: 'https://skabelontilfaktura.dk/' },
		{ name: 'Skabeloner efter erhverv', url: 'https://skabelontilfaktura.dk/skabeloner/' }
	]);

	const lt = String.fromCharCode(60);
	const jsonLdScript = `${lt}script type="application/ld+json">${JSON.stringify([breadcrumb])}${lt}/script`;
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
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- content is built from trusted schema.org objects, no user input -->
	{@html jsonLdScript}
</svelte:head>

<div class="mx-auto max-w-5xl px-6 py-16 lg:py-24">
	<header class="mb-12 max-w-3xl">
		<p class="text-accent mb-4 text-sm font-medium tracking-wide uppercase">
			Skabeloner efter erhverv
		</p>
		<h1 class="text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">
			Faktura skabelon til dit erhverv
		</h1>
		<p class="text-muted-foreground mt-5 text-lg leading-relaxed">
			Vælg dit fag og se en fakturaskabelon med de typiske poster, enheder og prisniveauer — klar
			til download som Word, Excel eller PDF.
		</p>
	</header>

	<div class="flex flex-wrap gap-2.5">
		{#each BRANCHES as branch (branch.slug)}
			<a
				href="/skabeloner/{branch.slug}/"
				class="bg-background border-border hover:border-accent hover:bg-muted/40 rounded-full border px-4 py-2 text-sm font-medium transition-colors"
			>
				{branch.trade}
			</a>
		{/each}
	</div>

	<section class="border-border mt-16 border-t pt-10">
		<h2 class="text-2xl font-semibold tracking-tight">Alle fællesskabeloner</h2>
		<p class="text-muted-foreground mt-3 text-sm leading-relaxed">
			Brugerne af vores
			<a href="/generator/" class="text-primary underline-offset-4 hover:underline"
				>gratis generator</a
			>
			kan selv sammensætte fakturaen med egne poster — eller starte fra en af erhvervsskabelonerne ovenfor.
			Alle skabeloner overholder de danske lovkrav om fakturaindhold. Læs mere om kravene i vores guide:
			<a href="/blog/krav-til-faktura/" class="text-primary underline-offset-4 hover:underline">
				hvad skal en faktura indeholde?
			</a>
		</p>
	</section>
</div>

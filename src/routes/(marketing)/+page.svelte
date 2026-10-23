<script lang="ts">
	import { ArrowRight, FileText, Search, Download, Pencil } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import { buildMeta, softwareApplicationSchema, organizationSchema } from '$lib/seo';
	import { BRANCHES } from '$lib/branches';

	const branchCount = BRANCHES.length;

	const meta = buildMeta({
		title: 'Gratis fakturaskabelon på 60 sekunder',
		description:
			'Lav en gratis faktura på 60 sekunder med Danmarks nemmeste fakturaskabelon. Hent også en faktura skabelon til Word, Excel og PDF — automatisk moms.',
		canonical: '/',
		ogType: 'website'
	});

	const organization = organizationSchema({
		name: 'skabelontilfaktura.dk',
		url: 'https://skabelontilfaktura.dk',
		description:
			'Danmarks nemmeste fakturaskabelon. Lav en gratis og lovlig faktura på 60 sekunder.'
	});

	const softwareApplication = softwareApplicationSchema({
		name: 'skabelontilfaktura.dk',
		description:
			'Gratis og lovlig dansk fakturaskabelon med automatisk moms, CVR-opslag og PDF-download.',
		applicationCategory: 'BusinessApplication',
		operatingSystem: 'Web',
		offers: {
			price: 0,
			priceCurrency: 'DKK'
		}
	});

	const jsonLd = [organization, softwareApplication];
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
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- content is built from trusted schema.org objects, no user input -->
	{@html jsonLdScript}
</svelte:head>

<section class="home-hero">
	<div class="hero-copy">
		<p class="eyebrow">GRATIS FAKTURASKABELON · UDEN TILMELDING</p>
		<h1>En faktura. Færdig.</h1>
		<p class="hero-description">Skriv, tjek og hent din PDF. Gratis og uden tilmelding.</p>
		<div class="hero-buttons">
			<Button href="/generator/" size="lg">Lav min faktura <ArrowRight size={18} /></Button><a
				href="#skabeloner">Se skabeloner</a
			>
		</div>
	</div>
	<div class="document-stage">
		<p class="stage-note note-left">Rediger direkte<br />i skabelonen <Pencil size={20} /></p>
		<a
			class="sample-invoice"
			href="/generator/"
			aria-label="Lav din egen faktura med denne skabelon"
		>
			<div class="sample-top">
				<div>
					<strong>Nordlys Studio</strong>
					<p>Frederiksgade 12<br />8000 Aarhus C<br />CVR 12345678</p>
				</div>
				<div class="sample-meta">
					<h2>FAKTURA</h2>
					<dl>
						<dt>Fakturanr.</dt>
						<dd>2026-0042</dd>
						<dt>Fakturadato</dt>
						<dd>23.10.2026</dd>
						<dt>Forfaldsdato</dt>
						<dd>31.10.2026</dd>
					</dl>
				</div>
			</div>
			<div class="sample-customer">
				<span>KØBER (MODTAGER)</span><strong>Klar Media ApS</strong>
				<p>Ryesgade 10<br />2200 København N</p>
			</div>
			<div class="sample-table">
				<div class="sample-table-head">
					<span>Beskrivelse</span><span>Antal</span><span>Enhedspris</span><span>Beløb</span>
				</div>
				<div class="sample-row highlighted">
					<span>Grafisk design <Pencil size={13} /></span><span>4 timer</span><span>750,00 kr.</span
					><span>3.000,00 kr.</span>
				</div>
				<div class="sample-row">
					<span>Rådgivning</span><span>2 timer</span><span>600,00 kr.</span><span>1.200,00 kr.</span
					>
				</div>
			</div>
			<div class="sample-totals">
				<p><span>Subtotal (ekskl. moms)</span><span>4.200,00 kr.</span></p>
				<p><span>Moms (25%)</span><span>1.050,00 kr.</span></p>
				<p class="sample-total"><strong>Total</strong><strong>5.250,00 kr.</strong></p>
			</div>
			<span class="sample-caption">Eksempel på en faktura</span>
		</a>
		<p class="stage-note note-right">
			Download som PDF,<br />klar til din kunde <Download size={20} />
		</p>
	</div>
	<div class="benefit-strip">
		<span><FileText size={21} /> Automatisk momsberegning</span><span
			><Search size={21} /> CVR-opslag fra registret</span
		><span><Download size={21} /> PDF uden vandmærke</span>
	</div>
</section>

<!-- Free template downloads -->
<section id="skabeloner" class="mx-auto max-w-6xl px-6 py-16">
	<div class="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
		<div class="flex flex-col justify-center">
			<h2 class="text-3xl leading-tight font-semibold tracking-tight">
				Hent en gratis <span class="text-primary italic">fakturaskabelon</span>
			</h2>
			<p class="text-muted-foreground mt-4 max-w-md leading-relaxed">
				Foretrækker du selv at udfylde? Download vores skabelon i Word, Excel eller PDF - med alle
				lovpligtige felter: fakturanummer, CVR, moms m.m. Ingen tilmelding.
			</p>
			<p class="text-muted-foreground mt-3 text-sm">
				Excel-versionen beregner moms og total automatisk med formler.
			</p>
		</div>
		<div class="grid content-center gap-3 sm:grid-cols-3">
			<a
				href="/templates/faktura-skabelon.docx"
				download
				class="border-border bg-card hover:border-accent group flex flex-col rounded-lg border p-5 transition-colors"
			>
				<span class="text-2xl font-semibold">Word</span>
				<span class="text-muted-foreground mt-1 text-xs">.docx - redigerbar</span>
				<span class="text-primary mt-3 text-sm font-medium">Download &rarr;</span>
			</a>
			<a
				href="/templates/faktura-skabelon.xlsx"
				download
				class="border-border bg-card hover:border-accent group flex flex-col rounded-lg border p-5 transition-colors"
			>
				<span class="text-2xl font-semibold">Excel</span>
				<span class="text-muted-foreground mt-1 text-xs">.xlsx - med momsformler</span>
				<span class="text-primary mt-3 text-sm font-medium">Download &rarr;</span>
			</a>
			<a
				href="/templates/faktura-skabelon.pdf"
				download
				class="border-border bg-card hover:border-accent group flex flex-col rounded-lg border p-5 transition-colors"
			>
				<span class="text-2xl font-semibold">PDF</span>
				<span class="text-muted-foreground mt-1 text-xs">.pdf - printklar</span>
				<span class="text-primary mt-3 text-sm font-medium">Download &rarr;</span>
			</a>
		</div>
	</div>
</section>

<!-- Feature: editorial alternating layout -->
<section class="mx-auto max-w-6xl px-6 py-20">
	<div class="grid gap-12 lg:grid-cols-3 lg:gap-8">
		<div class="lg:col-span-1">
			<p class="text-accent mb-2 text-sm font-medium">01</p>
			<h2 class="text-2xl leading-tight">Alt hvad loven kræver, automatisk</h2>
			<p class="text-muted-foreground mt-4 text-sm leading-relaxed">
				Fakturanummer, momsbeløb, forfaldsdato, CVR. Vi kender reglerne i Momsloven, så du ikke
				behøver.
			</p>
		</div>
		<div class="lg:col-span-1">
			<p class="text-accent mb-2 text-sm font-medium">02</p>
			<h2 class="text-2xl leading-tight">Skriv dit CVR, vi udfylder resten</h2>
			<p class="text-muted-foreground mt-4 text-sm leading-relaxed">
				Indtast et CVR-nummer og vi henter firmanavn, adresse og postnummer automatisk via
				CVR-registret.
			</p>
		</div>
		<div class="lg:col-span-1">
			<p class="text-accent mb-2 text-sm font-medium">03</p>
			<h2 class="text-2xl leading-tight">Download som PDF, send med det samme</h2>
			<p class="text-muted-foreground mt-4 text-sm leading-relaxed">
				Professionelt udseende PDF uden vandmærke. Klar til at sende til din kunde på sekunder.
			</p>
		</div>
	</div>
</section>

<!-- Internal links: templates by trade + guides -->
<section class="border-border bg-secondary/40 border-y">
	<div class="mx-auto max-w-6xl px-6 py-16">
		<div class="grid gap-10 lg:grid-cols-2 lg:gap-16">
			<div>
				<h2 class="text-xl font-semibold tracking-tight">Skabelon til dit erhverv</h2>
				<p class="text-muted-foreground mt-2 text-sm leading-relaxed">
					Fakturaskabelon med typiske poster og priser for dit fag - fra elektriker og tømrer til
					fotograf og DJ.
				</p>
				<ul class="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
					<li>
						<a
							href="/skabeloner/elektriker/"
							class="hover:text-primary decoration-border hover:decoration-accent underline underline-offset-4"
							>Elektriker</a
						>
					</li>
					<li>
						<a
							href="/skabeloner/toemrer/"
							class="hover:text-primary decoration-border hover:decoration-accent underline underline-offset-4"
							>Tømrer</a
						>
					</li>
					<li>
						<a
							href="/skabeloner/maler/"
							class="hover:text-primary decoration-border hover:decoration-accent underline underline-offset-4"
							>Maler</a
						>
					</li>
					<li>
						<a
							href="/skabeloner/vvs/"
							class="hover:text-primary decoration-border hover:decoration-accent underline underline-offset-4"
							>VVS</a
						>
					</li>
					<li>
						<a
							href="/skabeloner/fotograf/"
							class="hover:text-primary decoration-border hover:decoration-accent underline underline-offset-4"
							>Fotograf</a
						>
					</li>
					<li>
						<a
							href="/skabeloner/it-konsulent/"
							class="hover:text-primary decoration-border hover:decoration-accent underline underline-offset-4"
							>IT-konsulent</a
						>
					</li>
					<li>
						<a
							href="/skabeloner/bogholder/"
							class="hover:text-primary decoration-border hover:decoration-accent underline underline-offset-4"
							>Bogholder</a
						>
					</li>
					<li>
						<a
							href="/skabeloner/rengoering/"
							class="hover:text-primary decoration-border hover:decoration-accent underline underline-offset-4"
							>Rengøring</a
						>
					</li>
				</ul>
				<a
					href="/skabeloner/"
					class="text-primary decoration-accent mt-4 inline-block text-sm font-medium underline decoration-2 underline-offset-4"
				>
					Se alle {branchCount} erhverv &rarr;
				</a>
			</div>
			<div>
				<h2 class="text-xl font-semibold tracking-tight">Guides om fakturering</h2>
				<p class="text-muted-foreground mt-2 text-sm leading-relaxed">
					Alt om reglerne, formaterne og hverdagen med fakturaer - skrevet på dansk.
				</p>
				<ul class="mt-4 space-y-1.5 text-sm">
					<li>
						<a
							href="/blog/krav-til-faktura/"
							class="hover:text-primary decoration-border hover:decoration-accent underline underline-offset-4"
							>Hvad skal en faktura indeholde? (lovkrav)</a
						>
					</li>
					<li>
						<a
							href="/blog/eksempel-paa-faktura/"
							class="hover:text-primary decoration-border hover:decoration-accent underline underline-offset-4"
							>Eksempel på faktura – sådan ser en korrekt faktura ud</a
						>
					</li>
					<li>
						<a
							href="/blog/proforma-faktura/"
							class="hover:text-primary decoration-border hover:decoration-accent underline underline-offset-4"
							>Proformafaktura – hvad er det, og hvornår bruges den?</a
						>
					</li>
					<li>
						<a
							href="/blog/bogforingslov-2026-guide/"
							class="hover:text-primary decoration-border hover:decoration-accent underline underline-offset-4"
							>Ny bogføringslov 2026 - guide for selvstændige</a
						>
					</li>
					<li>
						<a
							href="/blog/faktura-skabelon-excel/"
							class="hover:text-primary decoration-border hover:decoration-accent underline underline-offset-4"
							>Faktura skabelon til Excel</a
						>
					</li>
					<li>
						<a
							href="/blog/faktura-skabelon-word/"
							class="hover:text-primary decoration-border hover:decoration-accent underline underline-offset-4"
							>Faktura skabelon til Word</a
						>
					</li>
					<li>
						<a
							href="/blog/faktura-skabelon-pdf/"
							class="hover:text-primary decoration-border hover:decoration-accent underline underline-offset-4"
							>Faktura skabelon som PDF</a
						>
					</li>
					<li>
						<a
							href="/blog/faktura-skabelon-google-docs/"
							class="hover:text-primary decoration-border hover:decoration-accent underline underline-offset-4"
							>Faktura skabelon til Google Docs</a
						>
					</li>
					<li>
						<a
							href="/blog/faktura-freelancer/"
							class="hover:text-primary decoration-border hover:decoration-accent underline underline-offset-4"
							>Faktura for freelancere</a
						>
					</li>
					<li>
						<a
							href="/blog/faktura-uden-cvr/"
							class="hover:text-primary decoration-border hover:decoration-accent underline underline-offset-4"
							>Faktura uden CVR-nummer</a
						>
					</li>
					<li>
						<a
							href="/blog/faktura-skabelon-sammenligning/"
							class="hover:text-primary decoration-border hover:decoration-accent underline underline-offset-4"
							>De 5 bedste faktura skabeloner i Danmark</a
						>
					</li>
					<li>
						<a
							href="/blog/kreditnota/"
							class="hover:text-primary decoration-border hover:decoration-accent underline underline-offset-4"
							>Kreditnota – sådan opretter du en korrekt kreditnota</a
						>
					</li>
					<li>
						<a
							href="/blog/kvittering-skabelon/"
							class="hover:text-primary decoration-border hover:decoration-accent underline underline-offset-4"
							>Kvitteringsskabelon – gratis skabelon til kvitteringer</a
						>
					</li>
					<li>
						<a
							href="/blog/faktura-skabelon-faq/"
							class="hover:text-primary decoration-border hover:decoration-accent underline underline-offset-4"
							>Ofte stillede spørgsmål</a
						>
					</li>
				</ul>
				<a
					href="/blog/"
					class="text-primary decoration-accent mt-4 inline-block text-sm font-medium underline decoration-2 underline-offset-4"
				>
					Se alle guides &rarr;
				</a>
			</div>
		</div>
	</div>
</section>

<!-- CTA -->
<section class="border-border border-t">
	<div class="mx-auto max-w-6xl px-6 py-20">
		<div class="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
			<div>
				<h2 class="text-3xl leading-tight">
					Klar til din første <span class="text-primary italic">faktura?</span>
				</h2>
				<p class="text-muted-foreground mt-2">
					Det tager under et minut. Ingen konto, ingen kreditkort.
				</p>
			</div>
			<Button size="lg" href="/generator/" class="px-8 py-3 text-base">Start gratis</Button>
		</div>
	</div>
</section>

<style>
	.home-hero {
		overflow: hidden;
	}
	.hero-copy {
		text-align: center;
		padding: 32px 24px 24px;
	}
	.eyebrow {
		font-size: 11px;
		letter-spacing: 0.13em;
		color: #777;
		margin-bottom: 18px;
	}
	h1 {
		font-size: clamp(46px, 6.3vw, 84px);
		line-height: 1.06;
		font-weight: 750;
		letter-spacing: -0.055em;
	}
	.hero-description {
		margin-top: 22px;
		color: #606060;
		font-size: clamp(17px, 2vw, 23px);
	}
	.hero-buttons {
		display: flex;
		gap: 32px;
		align-items: center;
		justify-content: center;
		margin-top: 32px;
	}
	.hero-buttons :global(a:first-child) {
		min-height: 50px;
		padding: 0 30px;
		border-radius: 4px;
		background: #f45112;
		color: #171717;
	}
	.hero-buttons > a {
		font-size: 14px;
		font-weight: 600;
		text-underline-offset: 5px;
		text-decoration: underline;
	}
	.document-stage {
		display: flex;
		justify-content: center;
		position: relative;
		padding: 18px 24px 0;
		background: #f2f2f0;
		margin-top: 20px;
	}
	.sample-invoice {
		display: block;
		background: white;
		width: 710px;
		padding: 32px 48px 18px;
		box-shadow: 0 8px 40px #00000012;
		color: #242424;
		font-size: 12px;
		border-radius: 4px 4px 0 0;
		position: relative;
	}
	.sample-top {
		display: flex;
		justify-content: space-between;
		gap: 20px;
	}
	.sample-top p,
	.sample-customer p {
		line-height: 1.6;
	}
	.sample-meta h2 {
		font-size: 30px;
		letter-spacing: 0.13em;
		font-weight: 600;
		text-align: right;
		margin-bottom: 16px;
	}
	.sample-meta dl {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 5px 26px;
		font-size: 11px;
	}
	.sample-meta dd {
		text-align: right;
	}
	.sample-customer {
		margin-top: 18px;
	}
	.sample-customer > span {
		display: block;
		font-size: 10px;
		margin-bottom: 6px;
	}
	.sample-customer strong {
		display: block;
	}
	.sample-table {
		margin-top: 30px;
	}
	.sample-table-head,
	.sample-row {
		display: grid;
		grid-template-columns: 2fr 0.8fr 1fr 1.1fr;
		gap: 12px;
		align-items: center;
		padding: 12px 8px;
	}
	.sample-table-head {
		background: #f4f4f2;
		text-transform: uppercase;
		font-size: 9px;
		font-weight: 600;
	}
	.sample-row {
		border-bottom: 1px solid #eee;
	}
	.sample-row > span:not(:first-child),
	.sample-table-head > span:not(:first-child) {
		text-align: right;
		white-space: nowrap;
	}
	.highlighted {
		outline: 1px solid #e64900;
		outline-offset: -1px;
	}
	.highlighted > span:first-child {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.highlighted :global(svg) {
		color: #c43c00;
	}
	.sample-totals {
		margin: 22px 0 0 auto;
		width: 52%;
	}
	.sample-totals p {
		display: flex;
		justify-content: space-between;
		gap: 14px;
		margin: 8px 0;
	}
	.sample-total {
		border-top: 1px solid #ddd;
		padding-top: 12px;
		font-size: 14px;
	}
	.sample-caption {
		display: block;
		color: #888;
		font-size: 10px;
		margin-top: 20px;
	}
	.stage-note {
		position: absolute;
		top: 48%;
		color: #666;
		font-size: 15px;
		line-height: 1.6;
	}
	.stage-note :global(svg) {
		margin-top: 16px;
		color: #c43c00;
	}
	.note-left {
		right: calc(50% + 390px);
	}
	.note-right {
		left: calc(50% + 390px);
	}
	.benefit-strip {
		display: flex;
		justify-content: center;
		padding: 26px 24px;
		border-block: 1px solid #e4e4e0;
		gap: 60px;
		font-size: 13px;
	}
	.benefit-strip span {
		display: flex;
		gap: 16px;
		align-items: center;
	}
	@media (max-width: 1100px) {
		.stage-note {
			display: none;
		}
	}
	@media (max-width: 600px) {
		.hero-copy {
			padding-top: 44px;
		}
		.eyebrow {
			font-size: 9px;
		}
		.hero-buttons {
			gap: 24px;
		}
		.document-stage {
			padding: 16px 14px 0;
		}
		.sample-invoice {
			padding: 24px 18px 16px;
			font-size: 10px;
		}
		.sample-meta h2 {
			font-size: 23px;
		}
		.sample-meta dl {
			font-size: 9px;
			gap: 4px 10px;
		}
		.sample-table-head,
		.sample-row {
			gap: 7px;
			padding-inline: 4px;
		}
		.sample-table-head {
			font-size: 8px;
		}
		.sample-totals {
			width: 68%;
		}
		.benefit-strip {
			flex-direction: column;
			gap: 16px;
			padding: 22px 28px;
		}
	}
</style>

<script lang="ts">
	import {
		ArrowLeft,
		Eye,
		Pencil,
		Download,
		Printer,
		LoaderCircle,
		FileDown
	} from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import InvoicePreview from '$lib/components/invoice/InvoicePreview.svelte';
	import InvoiceForm from '$lib/components/invoice/InvoiceForm.svelte';
	import { createInvoiceStore } from '$lib/invoice/store.svelte';
	import { buildMeta, faqPageSchema, howToSchema } from '$lib/seo';
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import { trackEvent } from '$lib/analytics';
	import FakturapakkeOffer from '$lib/components/FakturapakkeOffer.svelte';

	let { data }: { data: PageData } = $props();

	interface FaqItem {
		question: string;
		answer: string;
		/** Optional "read more" link rendered below the visible answer. */
		link?: string;
		linkLabel?: string;
	}

	/**
	 * FAQ rendered below the generator and emitted as FAQPage structured data
	 * alongside the HowTo schema. Links point to the matching blog guides.
	 */
	const faq: FaqItem[] = [
		{
			question: 'Kan jeg selv lave en faktura?',
			answer:
				'Ja, det må du gerne. En faktura skal blandt andet indeholde fakturadato, et unikt fakturanummer, dit firmanavn, adresse og CVR-nummer, kundens navn og adresse samt en beskrivelse af varerne eller ydelsen med antal og pris — og til sidst momsgrundlag, momssats og momsbeløb. Udfyld felterne her, og brug knappen Slå op ved CVR-nummeret til at hente virksomhedens oplysninger.',
			link: '/blog/krav-til-faktura/',
			linkLabel: 'Se den fulde liste over krav til en faktura'
		},
		{
			question: 'Hvilket program kan jeg bruge til at lave fakturaer?',
			answer:
				'Det afhænger af, hvor mange fakturaer du sender. Skal du hurtigt have lavet en enkelt faktura, er en online generator som denne det hurtigste valg — udfyld felterne og download PDF’en med det samme. Sender du kun få fakturaer om måneden, kan en skabelon til Excel eller Word også gøre jobbet, mens virksomheder med mange kunder typisk vælger et bogholderisystem.',
			link: '/blog/faktura-skabelon-excel/',
			linkLabel: 'Sammenlign faktura skabeloner til Excel og Word'
		},
		{
			question: 'Hvordan laver jeg en faktura til en privatperson?',
			answer:
				'Det er helt i orden at sende en faktura til en privatperson. I stedet for virksomhedens CVR-nummer opgiver du blot kundens navn og adresse. Skal du selv sende en faktura uden CVR-nummer, kan du enten opgive dine korrekte personlige oplysninger på fakturaen eller bruge en fakturatjeneste, der står som afsender. Husk, at der stadig beregnes 25% moms, hvis dit salg er momspligtigt.',
			link: '/blog/faktura-uden-cvr/',
			linkLabel: 'Læs om at lave en faktura uden CVR'
		},
		{
			question: 'Er der forskel på regning og faktura?',
			answer:
				'Nej, i praksis er det to ord for det samme dokument: et krav om betaling for leverede varer eller udført arbejde. Uanset hvilket ord der står på dokumentet, skal det opfylde de samme formkrav, så det kan bruges i begge parters bogholderi.',
			link: '/blog/krav-til-faktura/',
			linkLabel: 'Se hvilke oplysninger dokumentet skal indeholde'
		},
		{
			question: 'Er fakturaen fra generatoren gratis?',
			answer:
				'Ja. Du kan lave og downloade fakturaer gratis — uden tilmelding og uden vandmærke på PDF’en. Din kladde gemmes automatisk i din browser, så du kan vende tilbage og rette i fakturaen senere.'
		}
	];

	const meta = buildMeta({
		title: 'Lav faktura online gratis – hurtig faktura på 60 sekunder',
		description:
			'Lav en faktura online gratis uden tilmelding. Hurtig faktura med automatisk momsberegning, CVR-opslag og PDF-download — brug vores faktura skabelon direkte i browseren.',
		canonical: '/generator/',
		ogType: 'website',
		jsonLd: [
			howToSchema(
				[
					{
						name: 'Udfyld sælger og modtager',
						text: 'Indtast dit firmanavn og CVR-nummer — oplysningerne slås automatisk op i CVR-registret — og udfyld kundens navn og adresse.'
					},
					{
						name: 'Tilføj fakturalinjer',
						text: 'Beskriv dit arbejde eller dine varer med antal, enhed og stykpris. Momsen (25% eller momsfri) beregnes automatisk.'
					},
					{
						name: 'Tjek det live preview',
						text: 'Se fakturaen opdateres i forhåndsvisningen i realtid, mens du skriver.'
					},
					{
						name: 'Download og send',
						text: 'Download fakturaen som PDF uden vandmærke, eller udskriv den direkte, og send den til kunden.'
					}
				],
				{
					name: 'Sådan laver du en faktura online',
					description:
						'Lav en gratis dansk faktura online på 60 sekunder med skabelontilfaktura.dk.'
				}
			),
			faqPageSchema(faq)
		]
	});

	// Avoid emitting a literal `<script` token in source so the Svelte/prettier
	// parsers don't mistake the JSON-LD string for a real inline script block.
	// Content is built from trusted schema.org objects (no user input).
	const lt = String.fromCharCode(60);
	const jsonLdScript = `${lt}script type="application/ld+json">${JSON.stringify(meta.jsonLd)}${lt}/script>`;

	/**
	 * Shared store. Auto-hydrates from localStorage on creation and is passed
	 * down to `InvoiceForm` so the live preview reacts to every keystroke in the
	 * same reactive draft.
	 */
	const store = createInvoiceStore();

	let loading = $state(false);
	let compressedLoading = $state(false);
	let cloudLoading = $state(false);
	let cloudError = $state('');
	let printError = $state('');
	let selectedClientId = $state('');
	const canSaveToCloud = $derived(data.entitlements?.features.includes('cloud_storage') === true);

	$effect(() => {
		if (!store.hydrated || !data.business || store.data.seller.name) return;
		store.data.seller = { ...data.business.seller };
		store.data.regNr = data.business.regNr ?? '';
		store.data.kontonr = data.business.kontonr ?? '';
		store.data.mobilepay = data.business.mobilepay ?? '';
		store.data.brandColor = data.business.brandColor ?? '#000000';
	});

	$effect(() => {
		if (!selectedClientId) return;
		const client = data.clients.find((entry) => entry.id === selectedClientId);
		if (!client) return;
		const addressParts = (client.address ?? '').split(/\r?\n/).map((part) => part.trim());
		const cityLine = addressParts.slice(1).join(' ');
		const cityMatch = /^(\d{4})\s+(.+)$/.exec(cityLine);
		store.data.buyer = {
			name: client.name,
			cvr: client.cvr ?? '',
			email: client.email ?? '',
			address: addressParts[0] ?? '',
			postalCode: cityMatch?.[1] ?? '',
			city: cityMatch?.[2] ?? cityLine
		};
	});

	let mobileView = $state<'editor' | 'preview'>('editor');
	let downloadError = $state('');
	let moreActions = $state(false);
	let hasDownloaded = $state(false);
	onMount(() => trackEvent('generator_viewed'));

	/* ----------------------------------------------------------------------- */
	/* Download actions                                                        */
	/* ----------------------------------------------------------------------- */

	/**
	 * Trigger a browser download of the PDF. `compressed` toggles pdf-lib's
	 * object-stream optimisation for a smaller file.
	 */
	async function downloadPdf(compressed = false) {
		if (!store.isValid || loading || compressedLoading) return;
		downloadError = '';

		if (compressed) {
			compressedLoading = true;
		} else {
			loading = true;
		}
		try {
			const { renderInvoicePdf } = await import('$lib/pdf/renderer');
			const pdfBytes = await renderInvoicePdf(store.data, {
				useObjectStreams: compressed
			});
			// Copy into a fresh ArrayBuffer-backed view so the bytes satisfy the
			// strict DOM BlobPart typing.
			const buffer = new ArrayBuffer(pdfBytes.byteLength);
			new Uint8Array(buffer).set(pdfBytes);
			const blob = new Blob([buffer], { type: 'application/pdf' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `${store.data.invoiceNumber}.pdf`;
			a.click();
			hasDownloaded = true;
			trackEvent('invoice_pdf_downloaded', { compressed: compressed ? 1 : 0 });
			window.setTimeout(() => URL.revokeObjectURL(url), 1000);
		} catch {
			downloadError =
				'PDF’en kunne ikke genereres. Kontrollér felterne, og prøv igen. Brug almindelige bogstaver i stedet for emoji og specialtegn.';
		} finally {
			if (compressed) {
				compressedLoading = false;
			} else {
				loading = false;
			}
		}
	}

	async function handlePrint() {
		if (!store.isValid || loading || compressedLoading) return;
		printError = '';

		// Open synchronously to avoid popup blockers, then navigate the tab to
		// the PDF itself. Printing the generator page around a PDF/preview can
		// add an empty first page in Chromium and Safari.
		const printWindow = window.open('', '_blank');
		if (!printWindow) {
			printError = 'Browseren blokerede printvinduet. Tillad pop op-vinduer og prøv igen.';
			return;
		}

		loading = true;
		try {
			const { renderInvoicePdf } = await import('$lib/pdf/renderer');
			const pdfBytes = await renderInvoicePdf(store.data);
			const buffer = new ArrayBuffer(pdfBytes.byteLength);
			new Uint8Array(buffer).set(pdfBytes);
			const url = URL.createObjectURL(new Blob([buffer], { type: 'application/pdf' }));
			printWindow.location.replace(url);
			window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
		} catch {
			printWindow.close();
			printError = 'PDF’en kunne ikke klargøres til udskrift. Prøv igen.';
		} finally {
			loading = false;
		}
	}

	async function saveToCloud() {
		if (!store.isValid || cloudLoading) return;
		cloudError = '';
		cloudLoading = true;
		try {
			const response = await fetch('/api/invoices', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					invoice: store.data,
					clientId: selectedClientId || null
				})
			});
			const result = (await response.json()) as {
				id?: string;
				error?: string;
				code?: string;
			};
			if (response.status === 401) {
				window.location.href = '/login/?next=/generator/';
				return;
			}
			if (result.code === 'BUSINESS_PROFILE_REQUIRED') {
				window.location.href = '/indstillinger/';
				return;
			}
			if (!response.ok || !result.id) {
				cloudError = result.error ?? 'Fakturaen kunne ikke gemmes. Prøv igen.';
				return;
			}
			store.resetForm();
			window.location.href = `/faktura/${result.id}/`;
		} catch {
			cloudError = 'Fakturaen kunne ikke gemmes. Kontrollér forbindelsen og prøv igen.';
		} finally {
			cloudLoading = false;
		}
	}
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

<div class="generator-shell">
	<!-- Sticky action bar (hidden when printing) -->
	<div
		style:top={data.user ? '64px' : '0px'}
		class="generator-actions bg-background border-border no-print sticky top-16 z-30 flex flex-wrap items-center justify-between gap-3 border-b px-6 py-3"
	>
		<div class="flex min-w-0 flex-wrap items-center gap-3">
			<a href="/" class="back-link" aria-label="Tilbage til forsiden"
				><ArrowLeft size={16} /><span>Tilbage</span></a
			>
			<a href="/" class="editor-brand">skabelontilfaktura<span>.dk</span></a>
			<strong class="invoice-title">Faktura {store.data.invoiceNumber}</strong>
			<p class="text-muted-foreground inline-flex items-center gap-2 text-xs sm:text-sm">
				<span class="bg-accent h-1.5 w-1.5 rounded-full"></span>
				<span role="status"
					>{store.storageStatus === 'error'
						? 'Kladden kan ikke gemmes. Hold siden åben.'
						: store.storageStatus === 'saving'
							? 'Gemmer kladde…'
							: 'Kladde gemt i denne browser'}</span
				>
			</p>
			{#if canSaveToCloud && data.clients.length > 0}
				<select
					bind:value={selectedClientId}
					class="border-input bg-background h-8 max-w-48 rounded-md border px-2 text-xs"
					aria-label="Vælg gemt klient"
				>
					<option value="">Vælg gemt klient</option>
					{#each data.clients as client (client.id)}
						<option value={client.id}>{client.name}</option>
					{/each}
				</select>
			{/if}
		</div>
		<div
			class="action-buttons flex flex-wrap items-center gap-2"
			class:extra-actions-open={moreActions}
		>
			<Button
				class="secondary-action"
				variant="ghost"
				size="sm"
				onclick={handlePrint}
				disabled={!store.isValid || loading || compressedLoading}
			>
				<Printer size={15} />
				Udskriv
			</Button>
			<Button
				class="secondary-action"
				variant="outline"
				size="sm"
				onclick={() => downloadPdf(true)}
				disabled={!store.isValid || loading || compressedLoading}
			>
				{#if compressedLoading}
					<LoaderCircle size={15} class="animate-spin" />
					Komprimerer…
				{:else}
					<FileDown size={15} />
					Komprimeret
				{/if}
			</Button>
			<Button
				class="primary-download order-first lg:order-none"
				size="sm"
				onclick={() => downloadPdf(false)}
				disabled={!store.isValid || loading || compressedLoading}
			>
				{#if loading}
					<LoaderCircle size={15} class="animate-spin" />
					Genererer…
				{:else}
					<Download size={15} />
					Download PDF
				{/if}
			</Button>
			<button
				type="button"
				class="border-border order-first min-h-11 rounded-md border px-3 text-sm font-medium lg:hidden"
				aria-expanded={moreActions}
				onclick={() => (moreActions = !moreActions)}
				>{moreActions ? 'Færre valg' : 'Flere valg'}</button
			>
			{#if canSaveToCloud}
				<Button
					size="sm"
					onclick={saveToCloud}
					disabled={!store.isValid || loading || compressedLoading || cloudLoading}
				>
					{#if cloudLoading}
						<LoaderCircle size={15} class="animate-spin" />
						Gemmer…
					{:else}
						Gem i cloud
					{/if}
				</Button>
			{/if}
		</div>
	</div>

	{#if cloudError || printError || downloadError}
		<div
			class="bg-destructive/10 text-destructive no-print mb-6 rounded-md p-3 text-sm"
			role="alert"
		>
			{cloudError || printError || downloadError}
		</div>
	{/if}

	{#if canSaveToCloud && !data.business}
		<div class="border-accent/40 bg-accent/10 no-print mb-6 rounded-lg border p-4 text-sm">
			<strong>Opret din virksomhedsprofil før første cloud-faktura.</strong>
			<a href="/indstillinger/" class="text-primary ml-2 font-medium underline">Åbn indstillinger</a
			>
		</div>
	{/if}

	<div
		class="mobile-switch border-border bg-secondary/40 grid grid-cols-2 border-b p-1"
		aria-label="Visning"
	>
		<button
			type="button"
			aria-pressed={mobileView === 'editor'}
			onclick={() => (mobileView = 'editor')}><Pencil size={14} /> Rediger faktura</button
		>
		<button
			type="button"
			aria-pressed={mobileView === 'preview'}
			onclick={() => (mobileView = 'preview')}><Eye size={14} /> Se forhåndsvisning</button
		>
	</div>
	<!-- Document editor and synchronized preview share the same draft. -->
	<div class="invoice-views">
		<!-- Editor column (hidden when printing) -->
		<div class="editor-column no-print" class:view-hidden={mobileView !== 'editor'}>
			<InvoiceForm {store} />
		</div>

		<!-- Preserve the existing invoice preview and PDF template rendering. -->
		<aside
			class="preview-column mx-auto max-w-3xl px-4 py-8"
			class:view-hidden={mobileView !== 'preview'}
			aria-label="Forhåndsvisning af faktura"
		>
			<div class="mb-3 flex items-center justify-between">
				<span class="text-sm font-semibold">Din faktura</span>
				<span class="text-muted-foreground inline-flex items-center gap-1.5 text-xs"
					><span class="bg-primary h-1.5 w-1.5 rounded-full"></span> Opdateres, mens du skriver</span
				>
			</div>
			<div class="border-border bg-secondary/40 rounded-xl border p-3 sm:p-5">
				<InvoicePreview invoice={store.data} />
			</div>
			<p class="text-muted-foreground mt-3 text-center text-xs">
				Kladdevisning. Download PDF for det endelige layout.
			</p>
			{#if !store.isValid}
				<p class="text-muted-foreground mt-2 text-center text-xs">
					Udfyld de påkrævede felter for at downloade.
				</p>
			{/if}
		</aside>
	</div>

	<!-- FAQ and related guides: SEO content below the invoice app -->
	{#if hasDownloaded}
		<div class="no-print">
			<p role="status" class="text-primary mx-auto max-w-6xl px-6 pt-8 text-sm">
				Din PDF er klar. Gem den og en backup et sikkert sted.
			</p>
			<FakturapakkeOffer source="pdf_download" />
		</div>
	{/if}
	<div class="mx-auto my-16 max-w-3xl px-6 sm:my-20">
		<p class="text-muted-foreground mb-8 text-sm leading-relaxed">
			Kladden gemmes kun i denne browser, ikke i et cloud-arkiv. Rydder du browserdata eller skifter
			enhed, kan den gå tabt. Gem selv dine færdige fakturaer. Generatoren er ikke et
			bogføringssystem.
		</p>
		<section>
			<h2 class="text-2xl font-bold tracking-tight">
				Ofte stillede spørgsmål om at lave en faktura
			</h2>
			<div class="mt-6 space-y-6">
				{#each faq as item (item.question)}
					<div>
						<h3 class="text-lg font-semibold">{item.question}</h3>
						<p class="text-muted-foreground mt-2 leading-relaxed">{item.answer}</p>
						{#if item.link}
							<p class="mt-2">
								<a
									href={item.link}
									class="text-primary text-sm font-medium no-underline hover:underline"
								>
									{item.linkLabel}
								</a>
							</p>
						{/if}
					</div>
				{/each}
			</div>
		</section>

		<section class="border-border bg-muted/30 mt-12 rounded-xl border p-6">
			<h2 class="text-lg font-semibold tracking-tight">Relaterede guider</h2>
			<ul class="text-muted-foreground mt-3 list-disc space-y-2 pl-5 text-sm">
				<li>
					<a
						href="/blog/faktura-skabelon-faq/"
						class="text-primary font-medium no-underline hover:underline"
					>
						Faktura skabelon – ofte stillede spørgsmål
					</a>
				</li>
				<li>
					<a
						href="/blog/krav-til-faktura/"
						class="text-primary font-medium no-underline hover:underline"
					>
						Krav til en faktura
					</a>
				</li>
				<li>
					<a href="/skabeloner/" class="text-primary font-medium no-underline hover:underline">
						Faktura skabeloner til erhverv
					</a>
				</li>
			</ul>
		</section>
	</div>
</div>

<style>
	.editor-brand {
		font-size: 17px;
		font-weight: 700;
		letter-spacing: -0.6px;
		margin-right: 12px;
	}
	.editor-brand span {
		color: #c43c00;
	}
	.generator-actions {
		top: 0;
	}
	@media (max-width: 600px) {
		.editor-brand {
			display: none;
		}
	}
	.generator-shell {
		max-width: 1480px;
		margin: auto;
	}
	.view-hidden {
		display: none;
	}
	.back-link {
		display: flex;
		gap: 8px;
		align-items: center;
		font-size: 12px;
		color: #666;
	}
	.invoice-title {
		font-size: 14px;
		margin-right: 18px;
	}
	.mobile-switch {
		display: flex;
		gap: 6px;
		justify-content: center;
		background: #f9f9f7;
	}
	.mobile-switch button {
		display: flex;
		gap: 8px;
		align-items: center;
		justify-content: center;
		padding: 0 18px;
	}
	.generator-shell :global(.primary-download) {
		background: #f45112;
		color: #171717;
		border-radius: 4px;
	}

	.generator-shell :global(input:not([type='file'])),
	.generator-shell :global(select) {
		min-height: 44px;
	}
	.generator-shell :global(button) {
		min-height: 44px;
	}
	.generator-shell :global(button:focus-visible),
	.generator-shell :global(a:focus-visible) {
		outline: 2px solid var(--ring);
		outline-offset: 4px;
	}
	.mobile-switch button {
		min-height: 44px;
		font-size: 14px;
		font-weight: 600;
		border-radius: 6px;
	}
	.mobile-switch button[aria-pressed='true'] {
		background: var(--card);
		box-shadow: 0 1px 3px #26334a12;
	}
	@media (max-width: 1023px) {
		.generator-actions {
			position: static;
		}
		.action-buttons {
			width: 100%;
		}
		.action-buttons :global(.primary-download) {
			flex: 1;
		}
		.action-buttons :global(.secondary-action) {
			display: none;
		}
		.extra-actions-open :global(.secondary-action) {
			display: inline-flex;
		}
	}
	@media (max-width: 479px) {
		.generator-actions {
			gap: 0.5rem;
		}
		.action-buttons {
			margin-left: auto;
		}
		.generator-shell :global(input),
		.generator-shell :global(select) {
			font-size: 16px;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.generator-shell :global(*) {
			animation: none !important;
			transition: none !important;
		}
	}
</style>

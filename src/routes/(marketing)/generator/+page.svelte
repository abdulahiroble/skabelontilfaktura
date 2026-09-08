<script lang="ts">
	/**
	 * Generator route.
	 *
	 * Renders the `InvoiceForm` component in a two-column layout: the editable
	 * form on the left and a **live PDF preview** on the right. The preview is
	 * regenerated from the shared reactive invoice store, debounced at 500 ms so
	 * typing does not thrash the pdf-lib renderer. The resulting bytes are turned
	 * into a Blob URL and displayed in an `<iframe>`; old URLs are revoked to
	 * avoid memory leaks.
	 *
	 * The sticky action bar offers three actions:
	 *  - **Print** — opens the generated PDF itself in a new tab for reliable
	 *    browser printing without an extra blank page.
	 *  - **Download PDF** — standard (maximally compatible) download.
	 *  - **Download (komprimeret)** — same PDF saved with pdf-lib object streams
	 *    for a smaller file size.
	 *
	 * PDF rendering is fully client-side via pdf-lib. The shared store lives in
	 * localStorage and is hydrated once on mount, so the preview always matches
	 * the persisted draft.
	 */
	import { onDestroy } from 'svelte';
	import { Download, Printer, LoaderCircle, FileDown, FileText } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import InvoiceForm from '$lib/components/invoice/InvoiceForm.svelte';
	import { createInvoiceStore } from '$lib/invoice/store.svelte';
	import { buildMeta, faqPageSchema, howToSchema } from '$lib/seo';
	import type { PageData } from './$types';

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
				'Ja, det må du gerne. En faktura skal blandt andet indeholde fakturadato, et unikt fakturanummer, dit firmanavn, adresse og CVR-nummer, kundens navn og adresse samt en beskrivelse af varerne eller ydelsen med antal og pris — og til sidst momsgrundlag, momssats og momsbeløb. Generatoren her udfylder alle felterne for dig, og CVR-opslaget henter automatisk virksomhedens oplysninger, mens du skriver.',
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

	/* ----------------------------------------------------------------------- */
	/* Live preview                                                            */
	/* ----------------------------------------------------------------------- */

	/** Object URL of the most recently rendered preview PDF (or null). */
	let previewUrl = $state<string | null>(null);
	/** True while a debounced regeneration is pending/in-flight. */
	let previewLoading = $state(false);
	/** Pending debounce timer handle (cleared on re-run / teardown). */
	let previewTimeout: ReturnType<typeof setTimeout> | null = null;
	let previewGeneration = 0;

	/**
	 * Regenerate the preview whenever the reactive draft changes. The deep
	 * serialisation touch ensures any nested mutation (line items, party fields,
	 * settings) re-triggers the effect. Each run clears the previous pending
	 * timer, giving us a 500 ms debounce.
	 */
	$effect(() => {
		// Touch the full serialised form so every nested field is observed.
		const data = store.data;
		void JSON.stringify(data);
		const generation = ++previewGeneration;

		if (previewTimeout) clearTimeout(previewTimeout);
		if (!store.isValid) {
			if (previewUrl) URL.revokeObjectURL(previewUrl);
			previewUrl = null;
			previewLoading = false;
			return;
		}
		previewLoading = true;

		previewTimeout = setTimeout(async () => {
			previewTimeout = null;
			try {
				const { renderInvoicePdf } = await import('$lib/pdf/renderer');
				const bytes = await renderInvoicePdf(data);
				// Copy into a fresh ArrayBuffer-backed view so the bytes satisfy the
				// strict DOM BlobPart typing (pdf-lib returns Uint8Array<ArrayBufferLike>).
				const buffer = new ArrayBuffer(bytes.byteLength);
				new Uint8Array(buffer).set(bytes);
				const blob = new Blob([buffer], { type: 'application/pdf' });
				if (generation !== previewGeneration) return;
				// Revoke the previous URL before creating a new one to avoid leaks.
				if (previewUrl) URL.revokeObjectURL(previewUrl);
				previewUrl = URL.createObjectURL(blob);
			} catch {
				if (generation !== previewGeneration) return;
				if (previewUrl) URL.revokeObjectURL(previewUrl);
				previewUrl = null;
			} finally {
				if (generation === previewGeneration) previewLoading = false;
			}
		}, 500);

		// Cleanup runs on every re-run AND on component teardown.
		return () => {
			if (previewTimeout) {
				clearTimeout(previewTimeout);
				previewTimeout = null;
			}
		};
	});

	/** Revoke the final preview URL when the component is destroyed. */
	onDestroy(() => {
		if (previewUrl) {
			URL.revokeObjectURL(previewUrl);
			previewUrl = null;
		}
	});

	/* ----------------------------------------------------------------------- */
	/* Download actions                                                        */
	/* ----------------------------------------------------------------------- */

	/**
	 * Trigger a browser download of the PDF. `compressed` toggles pdf-lib's
	 * object-stream optimisation for a smaller file.
	 */
	async function downloadPdf(compressed = false) {
		if (!store.isValid) return;

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
			URL.revokeObjectURL(url);
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

<div class="mx-auto max-w-7xl px-4 py-10 sm:py-14">
	<!-- Sticky action bar (hidden when printing) -->
	<div
		class="bg-background/95 border-border supports-[backdrop-filter]:bg-background/70 no-print sticky top-14 z-30 -mx-4 mb-10 flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 backdrop-blur sm:mb-14"
	>
		<div class="flex min-w-0 flex-wrap items-center gap-3">
			<p class="text-muted-foreground inline-flex items-center gap-2 text-xs sm:text-sm">
				<span class="bg-accent h-1.5 w-1.5 rounded-full"></span>
				<span class="hidden sm:inline">Din kladde gemmes automatisk i din browser.</span>
				<span class="sm:hidden">Kladde gemmes</span>
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
		<div class="ml-auto flex flex-wrap items-center gap-2">
			<Button
				variant="ghost"
				size="sm"
				onclick={handlePrint}
				disabled={!store.isValid || loading || compressedLoading}
			>
				<Printer size={15} />
				Udskriv
			</Button>
			<Button
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

	{#if cloudError || printError}
		<div
			class="bg-destructive/10 text-destructive no-print mb-6 rounded-md p-3 text-sm"
			role="alert"
		>
			{cloudError || printError}
		</div>
	{/if}

	{#if canSaveToCloud && !data.business}
		<div class="border-accent/40 bg-accent/10 no-print mb-6 rounded-lg border p-4 text-sm">
			<strong>Opret din virksomhedsprofil før første cloud-faktura.</strong>
			<a href="/indstillinger/" class="text-primary ml-2 font-medium underline">Åbn indstillinger</a
			>
		</div>
	{/if}

	<!-- Two-column layout: editor (left) + live preview (right) -->
	<div class="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12">
		<!-- Editor column (hidden when printing) -->
		<div class="no-print">
			<InvoiceForm {store} />
		</div>

		<!-- Live preview column (the only thing visible when printing) -->
		<aside class="preview-column lg:sticky lg:top-24 lg:self-start">
			<div
				class="border-border bg-card relative flex min-h-[420px] flex-col overflow-hidden rounded-lg border shadow-sm sm:min-h-[600px]"
			>
				<!-- Preview header (hidden when printing) -->
				<div class="border-border no-print flex items-center justify-between border-b px-4 py-2.5">
					<span class="text-muted-foreground text-xs font-medium tracking-wider uppercase">
						Live preview
					</span>
					{#if !store.isValid}
						<span class="text-muted-foreground text-xs">Udfyld de påkrævede felter</span>
					{:else if previewLoading}
						<span class="text-muted-foreground flex items-center gap-1.5 text-xs">
							<LoaderCircle size={12} class="animate-spin" />
							Opdaterer…
						</span>
					{:else}
						<span
							class="text-foreground text-sm tabular-nums"
							style="font-family: var(--font-display)">{store.data.invoiceNumber}</span
						>
					{/if}
				</div>

				<!-- PDF iframe or loading placeholder -->
				{#if !store.isValid}
					<div
						class="text-muted-foreground flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center"
						aria-live="polite"
					>
						<div
							class="bg-secondary text-foreground flex h-12 w-12 items-center justify-center rounded-full"
						>
							<FileText size={22} />
						</div>
						<div class="space-y-1">
							<p class="text-foreground text-sm font-medium">Din faktura vises her</p>
							<p class="max-w-xs text-sm">
								Udfyld sælger, modtager og mindst én fakturalinje for at se forhåndsvisningen.
							</p>
						</div>
					</div>
				{:else if previewUrl}
					<iframe
						title="Faktura preview"
						src={previewUrl}
						class="preview-frame h-[600px] w-full flex-1 lg:h-[750px]"
					></iframe>
				{:else}
					<div
						class="text-muted-foreground flex flex-1 flex-col items-center justify-center gap-3 p-6"
						aria-live="polite"
					>
						<LoaderCircle size={24} class="animate-spin" />
						<p class="text-sm">Genererer forhåndsvisning…</p>
					</div>
				{/if}
			</div>
		</aside>
	</div>

	<!-- FAQ and related guides: SEO content below the invoice app -->
	<div class="mx-auto mt-16 max-w-3xl sm:mt-20">
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

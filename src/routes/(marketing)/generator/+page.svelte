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
	 *  - **Print** — opens the browser print dialog. Print-specific CSS hides
	 *    everything except the preview iframe so the printed output is the
	 *    invoice itself.
	 *  - **Download PDF** — standard (maximally compatible) download.
	 *  - **Download (komprimeret)** — same PDF saved with pdf-lib object streams
	 *    for a smaller file size.
	 *
	 * PDF rendering is fully client-side via pdf-lib. The shared store lives in
	 * localStorage and is hydrated once on mount, so the preview always matches
	 * the persisted draft.
	 */
	import { onDestroy } from 'svelte';
	import { Download, Printer, LoaderCircle, FileDown } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import InvoiceForm from '$lib/components/invoice/InvoiceForm.svelte';
	import { createInvoiceStore } from '$lib/invoice/store.svelte';
	import { buildMeta } from '$lib/seo';

	const meta = buildMeta({
		title: 'Fakturagenerator - Lav en gratis faktura | skabelontilfaktura.dk',
		description:
			'Lav en gratis og lovlig dansk faktura på 60 sekunder. CVR-felter, automatisk momstilning, MobilePay og PDF-download. Ingen tilmelding nødvendig.',
		canonical: '/generator/',
		ogType: 'website'
	});

	/**
	 * Shared store. Auto-hydrates from localStorage on creation and is passed
	 * down to `InvoiceForm` so the live preview reacts to every keystroke in the
	 * same reactive draft.
	 */
	const store = createInvoiceStore();

	let loading = $state(false);
	let compressedLoading = $state(false);

	/* ----------------------------------------------------------------------- */
	/* Live preview                                                            */
	/* ----------------------------------------------------------------------- */

	/** Object URL of the most recently rendered preview PDF (or null). */
	let previewUrl = $state<string | null>(null);
	/** True while a debounced regeneration is pending/in-flight. */
	let previewLoading = $state(false);
	/** Pending debounce timer handle (cleared on re-run / teardown). */
	let previewTimeout: ReturnType<typeof setTimeout> | null = null;

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

		if (previewTimeout) clearTimeout(previewTimeout);
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
				// Revoke the previous URL before creating a new one to avoid leaks.
				if (previewUrl) URL.revokeObjectURL(previewUrl);
				previewUrl = URL.createObjectURL(blob);
			} catch {
				// Renderer failure is non-fatal for the preview — keep the last good URL.
			} finally {
				previewLoading = false;
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

	function handlePrint() {
		// Opens the browser print dialog. Print-specific CSS (below) hides the
		// form, action bar and site chrome so only the invoice prints.
		window.print();
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
</svelte:head>

<div class="mx-auto max-w-7xl px-4 py-8">
	<!-- Sticky action bar (hidden when printing) -->
	<div
		class="bg-background/95 border-border supports-[backdrop-filter]:bg-background/60 no-print sticky top-14 z-30 -mx-4 mb-6 flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3 backdrop-blur"
	>
		<p class="text-muted-foreground hidden text-sm sm:block">
			Din faktura gemmes automatisk i din browser.
		</p>
		<div class="ml-auto flex flex-wrap items-center gap-2">
			<Button variant="outline" onclick={handlePrint} disabled={loading || compressedLoading}>
				<Printer size={16} />
				Udskriv
			</Button>
			<Button
				variant="outline"
				onclick={() => downloadPdf(true)}
				disabled={loading || compressedLoading}
			>
				{#if compressedLoading}
					<LoaderCircle size={16} class="animate-spin" />
					Komprimerer…
				{:else}
					<FileDown size={16} />
					Download (komprimeret)
				{/if}
			</Button>
			<Button onclick={() => downloadPdf(false)} disabled={loading || compressedLoading}>
				{#if loading}
					<LoaderCircle size={16} class="animate-spin" />
					Genererer…
				{:else}
					<Download size={16} />
					Download PDF
				{/if}
			</Button>
		</div>
	</div>

	<!-- Two-column layout: editor (left) + live preview (right) -->
	<div class="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
		<!-- Editor column (hidden when printing) -->
		<div class="no-print">
			<InvoiceForm {store} />
		</div>

		<!-- Live preview column (the only thing visible when printing) -->
		<aside class="preview-column lg:sticky lg:top-20 lg:self-start">
			<div
				class="border-border bg-card relative flex min-h-[600px] flex-col overflow-hidden rounded-lg border shadow-sm"
			>
				<!-- Preview header (hidden when printing) -->
				<div class="border-border no-print flex items-center justify-between border-b px-4 py-2">
					<span class="text-foreground text-sm font-medium">Live preview</span>
					{#if previewLoading}
						<span class="text-muted-foreground flex items-center gap-1.5 text-xs">
							<LoaderCircle size={12} class="animate-spin" />
							Opdaterer…
						</span>
					{:else}
						<span class="text-muted-foreground text-xs">{store.data.invoiceNumber}</span>
					{/if}
				</div>

				<!-- PDF iframe or loading placeholder -->
				{#if previewUrl}
					<iframe
						title="Faktura preview"
						src={previewUrl}
						class="preview-frame h-[600px] w-full flex-1 lg:h-[750px]"
					></iframe>
				{:else}
					<div
						class="text-muted-foreground flex flex-1 flex-col items-center justify-center gap-3 p-6"
					>
						<LoaderCircle size={24} class="animate-spin" />
						<p class="text-sm">Genererer forhåndsvisning…</p>
					</div>
				{/if}
			</div>
		</aside>
	</div>
</div>

<style>
	/* ----------------------------------------------------------------------- */
	/* Print styles                                                            */
	/* ----------------------------------------------------------------------- */
	/*
	 * When the user prints (via the "Udskriv" button → window.print()), hide
	 * the form, the action bar, and all site chrome (header / footer live in the
	 * marketing layout). Only the live preview PDF should be visible, expanded to
	 * fill the page so the printed output is the invoice itself.
	 *
	 * The `.no-print` utility is applied to the editor column, the action bar,
	 * and the preview header strip. The marketing layout's <header> and <footer>
	 * are hidden via element selectors scoped to print media.
	 */
	@media print {
		:global(body) {
			margin: 0;
			padding: 0;
			background: white;
		}

		/* Hide site navigation, footer and consent banner from the marketing layout. */
		:global(header),
		:global(footer) {
			display: none !important;
		}

		/* Remove the page-level padding/max-width so the preview fills the sheet. */
		.preview-column {
			position: static !important;
			top: auto !important;
			align-self: auto !important;
		}

		/* Hide everything tagged .no-print (form, action bar, preview header). */
		:global(.no-print) {
			display: none !important;
		}

		/* Make the preview card borderless and let the iframe fill the page. */
		.preview-column :global(.border-border) {
			border: none !important;
			box-shadow: none !important;
			min-height: auto !important;
		}

		/* Expand the PDF iframe to fill the printable area. */
		.preview-frame {
			width: 100% !important;
			height: 100vh !important;
			min-height: 100vh !important;
			border: none !important;
		}
	}
</style>

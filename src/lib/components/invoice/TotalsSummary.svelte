<script lang="ts">
	/**
	 * Live totals summary for the invoice form.
	 *
	 * A pure, derived view of the line items + VAT mode: it calls the moms
	 * engine (`calculateTotals`) and the formatter (`formatTotals`) on every
	 * change to its props and renders the subtotal / VAT / total rows. Special
	 * VAT modes surface their statutory label (reverse charge, kunstnermoms,
	 * momsfritaget) so the user understands why a number is zero.
	 *
	 * Inline warnings:
	 *   - Empty line-items list → "Tilføj mindst én linje".
	 *   - Standard mode where line items carry mixed VAT rates that don't
	 *     match the invoice-level rate (engine ignores per-line rates) → a
	 *     soft hint that totals are computed from the invoice VAT mode.
	 *
	 * Everything is derived from props; the store is never touched.
	 */
	import { TriangleAlert } from '@lucide/svelte';
	import type { Currency, InvoiceItem, InvoiceLanguage, VatMode } from '$lib/invoice/types';
	import { calculateTotals, formatTotals } from '$lib/invoice/moms';
	import { createTranslator } from '$lib/i18n';

	type Props = {
		items: InvoiceItem[];
		vatMode: VatMode;
		/** Invoice-level VAT rate (fraction). Used only for `standard` mode. */
		vatRate?: number;
		currency: Currency;
		language: InvoiceLanguage;
	};

	let { items, vatMode, vatRate = 0.25, currency, language }: Props = $props();

	const t = $derived(createTranslator(language));

	const totals = $derived(calculateTotals(items, vatMode, vatRate));
	const formatted = $derived(formatTotals(totals, currency, language));

	const hasItems = $derived(items.length > 0);

	/**
	 * In standard mode the moms engine ignores per-line `vatRate` and applies
	 * the invoice-level rate to the whole subtotal. When the user has given
	 * individual lines rates that differ, the displayed VAT won't match the
	 * "intuitive" per-line sum — surface a hint so this isn't surprising.
	 */
	const hasMixedLineRates = $derived(checkMixedLineRates(items, vatRate));

	function checkMixedLineRates(list: InvoiceItem[], invoiceRate: number): boolean {
		if (list.length === 0) return false;
		// Any line whose rate differs (beyond rounding noise) from the
		// invoice-level rate counts as "mixed".
		return list.some((item) => Math.abs((item.vatRate ?? 0) - invoiceRate) > 1e-9);
	}

	/**
	 * Display label for the VAT row. For non-standard modes the engine emits a
	 * statutory label (e.g. "Moms omvendt betalingspligt") that we show
	 * verbatim; for standard mode we render a localized "Moms" plus the rate.
	 */
	const vatLabel = $derived(buildVatLabel(vatMode, formatted.vatRate, t));

	function buildVatLabel(
		mode: VatMode,
		ratePercent: string,
		translate: (key: string) => string
	): string {
		switch (mode) {
			case 'momsfritaget':
				return 'Momsfritaget efter momslovens § 13';
			case 'reverse':
				return 'Moms omvendt betalingspligt';
			case 'kunstnermoms':
				return 'Kunstnermoms: 20% momspligtig, 80% momsfri';
			case 'standard':
			default:
				return `${translate('totals.vat')} (${ratePercent})`;
		}
	}
</script>

<section class="border-border bg-card rounded-lg border p-4 sm:p-6" aria-label={t('totals.total')}>
	{#if !hasItems}
		<p class="text-muted-foreground inline-flex items-center gap-1.5 text-sm">
			<TriangleAlert size={14} />
			{t('totals.empty')}
		</p>
	{:else}
		<dl class="ml-auto flex w-full max-w-sm flex-col gap-2 text-sm">
			<div class="flex items-baseline justify-between gap-4">
				<dt class="text-muted-foreground">{t('totals.subtotal')}</dt>
				<dd class="text-foreground tabular-nums">{formatted.subtotal}</dd>
			</div>

			{#if vatMode === 'kunstnermoms' && formatted.taxableBase && formatted.exemptBase}
				<div class="flex items-baseline justify-between gap-4">
					<dt class="text-muted-foreground">{t('totals.taxableBase')}</dt>
					<dd class="text-foreground tabular-nums">{formatted.taxableBase}</dd>
				</div>
				<div class="flex items-baseline justify-between gap-4">
					<dt class="text-muted-foreground">{t('totals.exemptBase')}</dt>
					<dd class="text-foreground tabular-nums">{formatted.exemptBase}</dd>
				</div>
			{/if}

			<div class="flex items-baseline justify-between gap-4">
				<dt class="text-muted-foreground">{vatLabel}</dt>
				<dd class="text-foreground tabular-nums">{formatted.vatAmount}</dd>
			</div>

			<div
				class="border-border mt-1 flex items-baseline justify-between gap-4 border-t pt-2 text-base font-semibold"
			>
				<dt class="text-foreground">{t('totals.total')}</dt>
				<dd class="text-foreground tabular-nums">{formatted.total}</dd>
			</div>
		</dl>

		{#if hasMixedLineRates && vatMode === 'standard'}
			<p
				class="border-border text-muted-foreground mt-3 inline-flex items-center gap-1.5 border-t pt-3 text-xs"
			>
				<TriangleAlert size={12} />
				{t('totals.vatMismatch')}
			</p>
		{/if}
	{/if}
</section>

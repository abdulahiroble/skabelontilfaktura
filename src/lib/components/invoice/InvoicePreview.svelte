<script lang="ts">
	import type { InvoiceData } from '$lib/invoice/types';
	import { calculateTotals, calcLineTotal } from '$lib/invoice/moms';
	import { formatCurrency } from '$lib/invoice/validation';
	import { createTranslator } from '$lib/i18n';

	let { invoice }: { invoice: InvoiceData } = $props();
	const t = $derived(createTranslator(invoice.language));
	const items = $derived(
		invoice.items.map((item) => ({
			...item,
			quantity: Number.isFinite(item.quantity) ? item.quantity : 0,
			unitPrice: Number.isFinite(item.unitPrice) ? item.unitPrice : 0
		}))
	);
	const totals = $derived(calculateTotals(items, invoice.vatMode));
	const displayDate = (value: string) =>
		/^\d{4}-\d{2}-\d{2}$/.test(value) ? value.split('-').reverse().join('.') : value;
	const money = (value: number) => formatCurrency(value, invoice.currency, invoice.language);
</script>

<div class="invoice-paper" class:modern={invoice.template === 'modern'}>
	<header class="paper-header">
		<div>
			{#if invoice.logoDataUrl}
				<img
					src={invoice.logoDataUrl}
					alt={t('branding.logoPreview')}
					class="mb-4 max-h-12 max-w-32 object-contain"
				/>
			{/if}
			<p class="font-semibold">
				{invoice.seller.name || (invoice.language === 'da' ? 'Din virksomhed' : 'Your business')}
			</p>
			<p>{invoice.seller.address || t('party.address')}</p>
			<p>{[invoice.seller.postalCode, invoice.seller.city].filter(Boolean).join(' ')}</p>
			{#if invoice.seller.cvr}<p>{t('party.cvr')}: {invoice.seller.cvr}</p>{/if}
		</div>
		<div class="text-right">
			<h2>{invoice.language === 'da' ? 'FAKTURA' : 'INVOICE'}</h2>
			<p>{invoice.invoiceNumber}</p>
			<p>
				{t('payment.issueDate')}:
				<span class="whitespace-nowrap">{displayDate(invoice.issueDate)}</span>
			</p>
			<p>
				{t('payment.dueDate')}:
				<span class="whitespace-nowrap">{displayDate(invoice.dueDate)}</span>
			</p>
		</div>
	</header>
	<div class="paper-buyer">
		<p class="mb-2 text-xs tracking-widest uppercase">{t('section.buyer')}</p>
		<p class="font-semibold">
			{invoice.buyer.name || (invoice.language === 'da' ? 'Kundens navn' : 'Customer name')}
		</p>
		<p>{invoice.buyer.address || t('party.address')}</p>
		<p>{[invoice.buyer.postalCode, invoice.buyer.city].filter(Boolean).join(' ')}</p>
		{#if invoice.buyer.cvr}<p>{t('party.cvr')}: {invoice.buyer.cvr}</p>{/if}
	</div>
	<table>
		<thead
			><tr
				><th>{t('items.description')}</th><th>{t('items.quantity')}</th><th
					>{t('items.lineTotal')}</th
				></tr
			></thead
		>
		<tbody>
			{#each items as item, index (index)}
				<tr>
					<td
						>{item.description ||
							(invoice.language === 'da' ? 'Din vare eller ydelse' : 'Your product or service')}</td
					>
					<td>{item.quantity} {item.unit}</td>
					<td>{money(calcLineTotal(item))}</td>
				</tr>
			{/each}
		</tbody>
	</table>
	<dl class="paper-totals">
		<div>
			<dt>{t('totals.subtotal')}</dt>
			<dd>{money(totals.subtotal)}</dd>
		</div>
		{#if invoice.vatMode !== 'ikke_momsregistreret'}
			<div>
				<dt>{t('totals.vat')} ({totals.vatRate * 100}%)</dt>
				<dd>{money(totals.vatAmount)}</dd>
			</div>
		{/if}
		<div class="paper-total">
			<dt>{t('totals.total')}</dt>
			<dd>{money(totals.total)}</dd>
		</div>
	</dl>
	<footer>
		<p>{invoice.paymentTerms}</p>
		{#if invoice.bankName}<p>{invoice.bankName}</p>{/if}
		{#if invoice.regNr || invoice.kontonr}<p>
				{t('payment.regNr')}: {invoice.regNr} · {t('payment.kontonr')}: {invoice.kontonr}
			</p>{/if}
		{#if invoice.mobilepay}<p>MobilePay: {invoice.mobilepay}</p>{/if}
	</footer>
</div>

<style>
	.invoice-paper {
		background: #fffefa;
		color: #28303b;
		padding: clamp(1.25rem, 4vw, 2.5rem);
		min-height: 640px;
		font-size: 12px;
		line-height: 1.7;
		box-shadow: 0 6px 24px #26334a0a;
		overflow-wrap: anywhere;
	}
	.modern {
		border-top: 6px solid var(--primary);
	}
	.paper-header {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}
	h2 {
		font-family: var(--font-body);
		font-size: clamp(1.2rem, 2vw, 1.65rem);
		letter-spacing: 0.08em;
		font-weight: 600;
		margin-bottom: 0.5rem;
	}
	.paper-buyer {
		margin: 2.5rem 0;
	}
	table {
		width: 100%;
		border-collapse: collapse;
		table-layout: fixed;
	}
	th {
		font-size: 10px;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		background: #f0f1ef;
	}
	th,
	td {
		padding: 0.65rem 0.35rem;
		text-align: right;
		vertical-align: top;
		border-bottom: 1px solid #e1e3df;
	}
	th:first-child,
	td:first-child {
		text-align: left;
		width: 48%;
	}
	.paper-totals {
		margin: 1.5rem 0 3rem auto;
		max-width: 290px;
	}
	.paper-totals div {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.35rem 0;
	}
	dd {
		white-space: nowrap;
		font-variant-numeric: tabular-nums;
	}
	.paper-total {
		margin-top: 0.75rem;
		border-top: 1px solid #bfc5ca;
		font-weight: 600;
		font-size: 14px;
	}
	footer {
		border-top: 1px solid #e1e3df;
		padding-top: 1rem;
	}
</style>

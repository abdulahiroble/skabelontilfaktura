<script lang="ts">
	/** Editable invoice document and settings inspector. Existing invoice
	 * components retain CVR/VIES lookup, validation, VAT, logo and payment
	 * behavior; the parent's store also drives preview and PDF export. */
	import { createInvoiceStore, type InvoiceStore } from '$lib/invoice/store.svelte';
	import { createTranslator } from '$lib/i18n';
	import PartySection from './PartySection.svelte';
	import ItemTable from './ItemTable.svelte';
	import LogoUpload from './LogoUpload.svelte';
	import PaymentSection from './PaymentSection.svelte';
	import SettingsBar from './SettingsBar.svelte';
	import TotalsSummary from './TotalsSummary.svelte';
	import ValidationWarnings from './ValidationWarnings.svelte';

	let { store = createInvoiceStore() }: { store?: InvoiceStore } = $props();
	let confirmingReset = $state(false);
	const t = $derived(createTranslator(store.data.language));
</script>

<div class="document-workspace">
	<div class="paper-wrap">
		<p class="editing-hint">
			{store.data.language === 'da'
				? 'Klik på et felt for at redigere · Felter med * skal udfyldes'
				: 'Click a field to edit · Fields marked * are required'}
		</p>
		<div class="invoice-paper">
			<div class="document-heading">
				<div>
					{#if store.data.logoDataUrl}<img
							src={store.data.logoDataUrl}
							alt="Logo"
							class="document-logo"
						/>{/if}<span>{store.data.language === 'da' ? 'DIN FAKTURA' : 'YOUR INVOICE'}</span>
				</div>
			</div>
			<div class="document-parties">
				<PartySection
					bind:party={store.data.seller}
					{t}
					role="seller"
					compact
					requiresCvr={store.data.vatMode === 'standard'}
					>{#snippet title()}{t('section.seller')}{/snippet}</PartySection
				>
				<div class="document-meta">
					<h1>
						{store.data.isCreditNote
							? store.data.language === 'da'
								? 'KREDITNOTA'
								: 'CREDIT NOTE'
							: store.data.isProforma
								? 'PROFORMA'
								: store.data.language === 'da'
									? 'FAKTURA'
									: 'INVOICE'}
					</h1>
					<strong>{store.data.invoiceNumber}</strong>
					<p>{t('payment.issueDate')}: {store.data.issueDate}</p>
					<p>{t('payment.dueDate')}: {store.data.dueDate}</p>
					<a href="#payment-settings"
						>{store.data.language === 'da'
							? 'Rediger datoer og betaling'
							: 'Edit dates and payment'}</a
					>
				</div>
				<PartySection bind:party={store.data.buyer} {t} role="buyer" compact
					>{#snippet title()}{t('section.buyer')}{/snippet}</PartySection
				>
			</div>
			<div class="document-items">
				<ItemTable items={store.data.items} {t} onAdd={store.addItem} onRemove={store.removeItem} />
			</div>
			<div class="document-total">
				<TotalsSummary
					items={store.data.items}
					vatMode={store.data.vatMode}
					vatRate={0.25}
					currency={store.data.currency}
					language={store.data.language}
				/>
			</div>
			<div class="document-footer">
				<strong>{t('section.payment')}</strong>
				<p>{store.data.paymentTerms}</p>
				{#if store.data.bankName}<p>
						{store.data.bankName}
					</p>{/if}{#if store.data.regNr || store.data.kontonr}<p>
						{t('payment.regNr')}: {store.data.regNr} · {t('payment.kontonr')}: {store.data.kontonr}
					</p>{/if}{#if store.data.mobilepay}<p>MobilePay: {store.data.mobilepay}</p>{/if}
			</div>
		</div>
		<div class="document-validation">
			<ValidationWarnings validation={store.validation} {t} locale={store.data.language} />
		</div>
	</div>
	<aside
		class="invoice-inspector"
		aria-label={store.data.language === 'da' ? 'Fakturaindstillinger' : 'Invoice settings'}
	>
		<h2>{store.data.language === 'da' ? 'Fakturaindstillinger' : 'Invoice settings'}</h2>
		<SettingsBar
			invoice={store.data}
			{t}
			onLanguageChange={store.setLanguage}
			onCurrencyChange={store.setCurrency}
			onVatModeChange={store.setVatMode}
		/>
		<section id="payment-settings"><PaymentSection invoice={store.data} {t} /></section>
		<details class="logo-settings">
			<summary>{store.data.language === 'da' ? 'Logo' : 'Logo'}</summary><LogoUpload
				invoice={store.data}
				{t}
			/>
		</details>
		<div class="border-border flex flex-wrap items-center justify-end gap-3 border-t pt-6">
			{#if confirmingReset}
				<p class="text-sm">
					{store.data.language === 'da'
						? 'Slet kladden? Det kan ikke fortrydes.'
						: 'Delete this draft? This cannot be undone.'}
				</p>
				<button
					type="button"
					class="min-h-11 px-3 text-sm underline"
					onclick={() => (confirmingReset = false)}
					>{store.data.language === 'da' ? 'Annuller' : 'Cancel'}</button
				>
			{/if}
			<button
				type="button"
				class="text-muted-foreground hover:text-destructive min-h-11 px-3 text-sm font-medium underline-offset-4 hover:underline"
				onclick={() => {
					if (confirmingReset) {
						store.resetForm();
						confirmingReset = false;
					} else {
						confirmingReset = true;
					}
				}}
			>
				{t('button.reset')}
			</button>
		</div>
	</aside>
</div>

<style>
	.document-heading {
		display: none !important;
	}
	.document-heading:has(img) {
		display: block !important;
	}
	.document-meta h1 {
		font-size: 30px;
		letter-spacing: 0.12em;
		font-weight: 600;
		line-height: 1.2;
		margin-bottom: 24px;
	}
	.document-total :global(section) {
		background: none;
		border: 0;
		border-radius: 0;
		padding: 0;
	}

	.document-workspace {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 290px;
		align-items: start;
		background: #f2f2f0;
	}
	.paper-wrap {
		padding: 22px 36px 48px;
		min-width: 0;
	}
	.editing-hint {
		color: #686868;
		font-size: 12px;
		text-align: center;
		margin-bottom: 18px;
	}
	.invoice-paper {
		background: #fff;
		max-width: 860px;
		margin: auto;
		padding: 32px;
		box-shadow: 0 4px 24px #00000009;
	}
	.document-heading {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 16px;
		margin-bottom: 28px;
	}
	.document-heading span {
		font-size: 10px;
		letter-spacing: 0.1em;
		color: #777;
	}
	.document-logo {
		max-width: 120px;
		max-height: 56px;
		object-fit: contain;
		margin-bottom: 12px;
	}
	.document-parties {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 0.85fr);
		gap: 12px 48px;
	}
	.document-meta {
		font-size: 12px;
		line-height: 1.9;
		text-align: right;
		padding-top: 0;
	}
	.document-meta a {
		text-decoration: underline;
		text-underline-offset: 4px;
		color: #737373;
		display: inline-block;
		margin-top: 8px;
	}
	.document-items {
		margin-top: 20px;
		border-top: 1px solid #ddd;
		padding-top: 12px;
	}
	.document-items :global(section > h2) {
		font-size: 12px;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
	.document-items :global(input) {
		border-style: dashed;
		border-radius: 2px;
		padding-inline: 7px;
		background: white;
	}
	.document-items :global(input:hover),
	.document-items :global(input:focus) {
		border-style: solid;
		border-color: var(--ring);
	}
	.document-total {
		width: 55%;
		margin: 20px 0 24px auto;
	}
	.document-footer {
		border-top: 1px solid #ddd;
		padding-top: 12px;
		font-size: 12px;
		line-height: 1.8;
	}
	.document-validation {
		max-width: 860px;
		margin: 20px auto 0;
	}
	.invoice-inspector {
		padding: 28px 22px;
		background: white;
		border-left: 1px solid #e1e1dd;
	}
	.invoice-inspector > h2 {
		font-size: 15px;
		font-weight: 650;
		margin-bottom: 26px;
	}
	.invoice-inspector :global(.settings-shell) {
		border: 0;
		padding: 0;
		background: none;
	}
	.invoice-inspector :global(.settings-grid),
	.invoice-inspector :global(#payment-settings section > div) {
		display: grid;
		grid-template-columns: 1fr;
		gap: 18px;
	}
	.invoice-inspector :global(label) {
		font-size: 12px;
		text-transform: none;
		letter-spacing: 0;
		font-weight: 400;
	}
	.invoice-inspector :global(input),
	.invoice-inspector :global(select) {
		border-radius: 3px;
		font-size: 13px;
		box-shadow: none;
	}
	#payment-settings {
		border-top: 1px solid #e3e3df;
		padding-top: 24px;
		margin-top: 28px;
		scroll-margin-top: 150px;
	}
	.logo-settings {
		padding-block: 22px;
		margin-top: 24px;
		border-top: 1px solid #e3e3df;
	}
	.logo-settings summary {
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
	}
	@media (min-width: 1250px) {
		.document-items :global(.item-row) {
			grid-template-columns: 2fr 0.6fr 0.65fr 0.9fr 0.7fr 1fr;
			border: 0;
			border-bottom: 1px solid #e3e3df;
			border-radius: 0;
			padding: 0 0 12px;
			gap: 8px;
		}
		.document-items :global(.item-row > label:first-child) {
			grid-column: auto;
		}
	}
	@media (max-width: 1100px) {
		.paper-wrap {
			padding-inline: 20px;
		}
		.invoice-paper {
			padding: 28px;
		}
		.document-parties {
			column-gap: 20px;
		}
	}
	@media (max-width: 800px) {
		.document-workspace {
			grid-template-columns: 1fr;
		}
		.invoice-inspector {
			border-left: 0;
			border-top: 1px solid #ddd;
		}
		.invoice-inspector :global(.settings-grid),
		.invoice-inspector :global(#payment-settings section > div) {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
		.paper-wrap {
			padding: 18px 12px 24px;
		}
		.invoice-paper {
			padding: 24px 18px;
		}
	}
	@media (max-width: 520px) {
		.document-parties {
			grid-template-columns: 1fr;
			gap: 24px;
		}
		.document-meta {
			text-align: left;
			padding: 0;
			grid-row: 1;
		}
		.document-meta h1 {
			font-size: 24px;
		}
		.document-total {
			width: 100%;
		}
		.invoice-inspector :global(#payment-settings section > div) {
			grid-template-columns: 1fr;
		}
	}
</style>

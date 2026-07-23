<script lang="ts">
	/**
	 * Main invoice editor container.
	 *
	 * Owns the reactive `InvoiceStore` (or accepts one from the parent page so
	 * the live PDF preview can share the same reactive draft), builds a
	 * translator from the current locale, and renders the sub-components.
	 *
	 * The two-column grid layout and the live preview are owned by the parent
	 * generator page; this component renders only the editor column.
	 *
	 * CVR lookup, VIES validation, and the VAT calculation engine are wired
	 * through their respective child components (`PartySection`,
	 * `TotalsSummary`); the store stays the single source of truth for the
	 * draft.
	 */
	import { createInvoiceStore, type InvoiceStore } from '$lib/invoice/store.svelte';
	import { createTranslator } from '$lib/i18n';
	import PartySection from './PartySection.svelte';
	import ItemTable from './ItemTable.svelte';
	import PaymentSection from './PaymentSection.svelte';
	import SettingsBar from './SettingsBar.svelte';
	import TotalsSummary from './TotalsSummary.svelte';
	import ValidationWarnings from './ValidationWarnings.svelte';

	let { store = createInvoiceStore() }: { store?: InvoiceStore } = $props();
	const t = $derived(createTranslator(store.data.language));
</script>

<div class="space-y-6">
	<header class="space-y-1">
		<h1 class="text-foreground text-2xl font-bold">{t('app.title')}</h1>
		<p class="text-muted-foreground text-sm">{t('app.subtitle')}</p>
	</header>

	<SettingsBar
		invoice={store.data}
		{t}
		onLanguageChange={store.setLanguage}
		onCurrencyChange={store.setCurrency}
		onVatModeChange={store.setVatMode}
	/>

	<ValidationWarnings validation={store.validation} {t} locale={store.data.language} />

	<PartySection party={store.data.seller} {t} role="seller">
		{#snippet title()}
			{t('section.seller')}
		{/snippet}
	</PartySection>

	<PartySection party={store.data.buyer} {t} role="buyer">
		{#snippet title()}
			{t('section.buyer')}
		{/snippet}
	</PartySection>

	<ItemTable items={store.data.items} {t} onAdd={store.addItem} onRemove={store.removeItem} />

	<TotalsSummary
		items={store.data.items}
		vatMode={store.data.vatMode}
		vatRate={0.25}
		currency={store.data.currency}
		language={store.data.language}
	/>

	<PaymentSection invoice={store.data} {t} />

	<div class="flex justify-end">
		<button
			type="button"
			class="text-muted-foreground hover:text-destructive text-sm font-medium underline-offset-4 hover:underline"
			onclick={store.resetForm}
		>
			{t('button.reset')}
		</button>
	</div>
</div>

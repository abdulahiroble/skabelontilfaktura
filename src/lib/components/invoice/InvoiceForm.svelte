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

<div class="space-y-10 sm:space-y-12">
	<header class="space-y-3">
		<p class="text-accent text-xs font-medium tracking-wider uppercase sm:text-sm">
			Gratis og lovlig
		</p>
		<h1 class="text-foreground text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
			{t('app.title')}
		</h1>
		<p class="text-muted-foreground text-sm sm:text-base">{t('app.subtitle')}</p>
	</header>

	<SettingsBar
		invoice={store.data}
		{t}
		onLanguageChange={store.setLanguage}
		onCurrencyChange={store.setCurrency}
		onVatModeChange={store.setVatMode}
	/>

	<ValidationWarnings validation={store.validation} {t} locale={store.data.language} />

	<!-- 01 — Sælger -->
	<section class="border-border border-t pt-8 sm:pt-10">
		<p class="text-accent mb-4 text-xs font-medium tracking-wider uppercase">01 — Indhold</p>
		<PartySection party={store.data.seller} {t} role="seller">
			{#snippet title()}
				{t('section.seller')}
			{/snippet}
		</PartySection>
	</section>

	<!-- 02 — Køber -->
	<section class="border-border border-t pt-8 sm:pt-10">
		<p class="text-accent mb-4 text-xs font-medium tracking-wider uppercase">02 — Modtager</p>
		<PartySection party={store.data.buyer} {t} role="buyer">
			{#snippet title()}
				{t('section.buyer')}
			{/snippet}
		</PartySection>
	</section>

	<!-- 03 — Linjer -->
	<section class="border-border border-t pt-8 sm:pt-10">
		<p class="text-accent mb-4 text-xs font-medium tracking-wider uppercase">03 — Linjer</p>
		<ItemTable items={store.data.items} {t} onAdd={store.addItem} onRemove={store.removeItem} />
	</section>

	<!-- 04 — Total -->
	<section class="border-border border-t pt-8 sm:pt-10">
		<p class="text-accent mb-4 text-xs font-medium tracking-wider uppercase">04 — Total</p>
		<TotalsSummary
			items={store.data.items}
			vatMode={store.data.vatMode}
			vatRate={0.25}
			currency={store.data.currency}
			language={store.data.language}
		/>
	</section>

	<!-- 05 — Betaling -->
	<section class="border-border border-t pt-8 sm:pt-10">
		<p class="text-accent mb-4 text-xs font-medium tracking-wider uppercase">05 — Betaling</p>
		<PaymentSection invoice={store.data} {t} />
	</section>

	<div class="border-border flex justify-end border-t pt-8 sm:pt-10">
		<button
			type="button"
			class="text-muted-foreground hover:text-destructive text-sm font-medium underline-offset-4 hover:underline"
			onclick={store.resetForm}
		>
			{t('button.reset')}
		</button>
	</div>
</div>

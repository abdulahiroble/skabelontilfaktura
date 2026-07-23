<script lang="ts">
	/**
	 * Top-of-form settings bar.
	 *
	 * Lets the user switch UI language, invoice currency, VAT mode, and
	 * template. All selections mutate the reactive draft directly. Changing
	 * the language also persists the preference via the store's
	 * `setLanguage` method so it survives reloads.
	 */
	import type { Currency, InvoiceData, InvoiceLanguage, VatMode } from '$lib/invoice/types';

	type Props = {
		/** Reactive draft — settings fields are mutated in place. */
		invoice: InvoiceData;
		/** Translation function from the i18n layer. */
		t: (key: string) => string;
		/** Locale setter (also persists the preference). */
		onLanguageChange: (locale: InvoiceLanguage) => void;
		/** Currency setter. */
		onCurrencyChange: (currency: Currency) => void;
		/** VAT mode setter. */
		onVatModeChange: (mode: VatMode) => void;
	};

	let { invoice, t, onLanguageChange, onCurrencyChange, onVatModeChange }: Props = $props();

	const currencies: Currency[] = ['DKK', 'EUR', 'USD'];
	const vatModes: VatMode[] = ['standard', 'momsfritaget', 'reverse', 'kunstnermoms'];
	const languages: InvoiceLanguage[] = ['da', 'en'];

	function handleLanguage(event: Event) {
		const value = (event.currentTarget as HTMLSelectElement).value as InvoiceLanguage;
		onLanguageChange(value);
	}

	function handleCurrency(event: Event) {
		onCurrencyChange((event.currentTarget as HTMLSelectElement).value as Currency);
	}

	function handleVatMode(event: Event) {
		onVatModeChange((event.currentTarget as HTMLSelectElement).value as VatMode);
	}

	function handleTemplate(event: Event) {
		invoice.template = (event.currentTarget as HTMLSelectElement).value as 'minimalist' | 'modern';
	}
</script>

<section
	class="border-border bg-secondary/30 grid grid-cols-2 gap-x-4 gap-y-3 rounded-lg border p-4 sm:grid-cols-4 sm:p-5"
>
	<div class="flex flex-col gap-1">
		<label
			class="text-muted-foreground text-[0.65rem] font-medium tracking-wider uppercase"
			for="setting-language"
		>
			{t('settings.language')}
		</label>
		<select
			id="setting-language"
			class="border-border bg-background focus:border-ring focus:ring-ring text-foreground h-8 w-full rounded-md border px-2 text-sm outline-none focus:ring-1"
			value={invoice.language}
			onchange={handleLanguage}
		>
			{#each languages as lang (lang)}
				<option value={lang}>{lang === 'da' ? 'Dansk' : 'English'}</option>
			{/each}
		</select>
	</div>

	<div class="flex flex-col gap-1">
		<label
			class="text-muted-foreground text-[0.65rem] font-medium tracking-wider uppercase"
			for="setting-currency"
		>
			{t('settings.currency')}
		</label>
		<select
			id="setting-currency"
			class="border-border bg-background focus:border-ring focus:ring-ring text-foreground h-8 w-full rounded-md border px-2 text-sm outline-none focus:ring-1"
			value={invoice.currency}
			onchange={handleCurrency}
		>
			{#each currencies as currency (currency)}
				<option value={currency}>{currency}</option>
			{/each}
		</select>
	</div>

	<div class="flex flex-col gap-1">
		<label
			class="text-muted-foreground text-[0.65rem] font-medium tracking-wider uppercase"
			for="setting-vat-mode"
		>
			{t('settings.vatMode')}
		</label>
		<select
			id="setting-vat-mode"
			class="border-border bg-background focus:border-ring focus:ring-ring text-foreground h-8 w-full rounded-md border px-2 text-sm outline-none focus:ring-1"
			value={invoice.vatMode}
			onchange={handleVatMode}
		>
			{#each vatModes as mode (mode)}
				<option value={mode}>{t(`vat.${mode}`)}</option>
			{/each}
		</select>
	</div>

	<div class="flex flex-col gap-1">
		<label
			class="text-muted-foreground text-[0.65rem] font-medium tracking-wider uppercase"
			for="setting-template"
		>
			{t('settings.template')}
		</label>
		<select
			id="setting-template"
			class="border-border bg-background focus:border-ring focus:ring-ring text-foreground h-8 w-full rounded-md border px-2 text-sm outline-none focus:ring-1"
			value={invoice.template ?? 'minimalist'}
			onchange={handleTemplate}
		>
			<option value="minimalist">{t('template.minimalist')}</option>
			<option value="modern">{t('template.modern')}</option>
		</select>
	</div>
</section>

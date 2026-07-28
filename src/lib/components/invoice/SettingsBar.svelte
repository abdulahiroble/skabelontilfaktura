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
	const vatModes: VatMode[] = [
		'standard',
		'ikke_momsregistreret',
		'momsfritaget',
		'reverse',
		'kunstnermoms'
	];
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

<section class="settings-shell border-border bg-secondary/20 rounded-lg border p-4 sm:p-5">
	<div class="settings-grid grid grid-cols-1 gap-4">
		<div class="min-w-0">
			<label
				class="text-muted-foreground mb-1.5 block text-xs font-semibold tracking-wide uppercase"
				for="setting-language"
			>
				{t('settings.language')}
			</label>
			<select
				id="setting-language"
				class="border-border bg-background focus:border-ring focus:ring-ring text-foreground h-11 w-full min-w-0 rounded-md border px-3 text-base font-medium outline-none focus:ring-2 focus:ring-offset-2"
				value={invoice.language}
				onchange={handleLanguage}
			>
				{#each languages as lang (lang)}
					<option value={lang}>{lang === 'da' ? 'Dansk' : 'English'}</option>
				{/each}
			</select>
		</div>

		<div class="min-w-0">
			<label
				class="text-muted-foreground mb-1.5 block text-xs font-semibold tracking-wide uppercase"
				for="setting-currency"
			>
				{t('settings.currency')}
			</label>
			<select
				id="setting-currency"
				class="border-border bg-background focus:border-ring focus:ring-ring text-foreground h-11 w-full min-w-0 rounded-md border px-3 text-base font-medium outline-none focus:ring-2 focus:ring-offset-2"
				value={invoice.currency}
				onchange={handleCurrency}
			>
				{#each currencies as currency (currency)}
					<option value={currency}>{currency}</option>
				{/each}
			</select>
		</div>

		<div class="min-w-0">
			<label
				class="text-muted-foreground mb-1.5 block text-xs font-semibold tracking-wide uppercase"
				for="setting-vat-mode"
			>
				{t('settings.vatMode')}
			</label>
			<select
				id="setting-vat-mode"
				class="border-border bg-background focus:border-ring focus:ring-ring text-foreground h-11 w-full min-w-0 rounded-md border px-3 text-base font-medium outline-none focus:ring-2 focus:ring-offset-2"
				value={invoice.vatMode}
				onchange={handleVatMode}
			>
				{#each vatModes as mode (mode)}
					<option value={mode}>{t(`vat.${mode}`)}</option>
				{/each}
			</select>
		</div>

		<div class="min-w-0">
			<label
				class="text-muted-foreground mb-1.5 block text-xs font-semibold tracking-wide uppercase"
				for="setting-template"
			>
				{t('settings.template')}
			</label>
			<select
				id="setting-template"
				class="border-border bg-background focus:border-ring focus:ring-ring text-foreground h-11 w-full min-w-0 rounded-md border px-3 text-base font-medium outline-none focus:ring-2 focus:ring-offset-2"
				value={invoice.template ?? 'minimalist'}
				onchange={handleTemplate}
			>
				<option value="minimalist">{t('template.minimalist')}</option>
				<option value="modern">{t('template.modern')}</option>
			</select>
		</div>
	</div>
</section>

<style>
	.settings-shell {
		container-type: inline-size;
	}

	@container (min-width: 28rem) {
		.settings-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
</style>

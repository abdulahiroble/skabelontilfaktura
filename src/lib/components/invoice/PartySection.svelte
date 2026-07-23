<script lang="ts">
	/**
	 * Reusable section for an invoice party (seller or buyer).
	 *
	 * The component is purely presentational: it binds to a single
	 * `InvoiceParty` object via the `party` prop and mutates fields directly.
	 * Because Svelte 5 deep proxies `$state`, mutations propagate up to the
	 * parent store automatically.
	 *
	 * CVR lookup and VIES validation are wired here. The CVR lookup auto-fills
	 * name/address/postal code/city when a Danish 8-digit CVR is entered. The
	 * VIES validation is shown only for the buyer when a non-DK EU VAT number
	 * is present (typical reverse-charge scenario).
	 */
	import type { Snippet } from 'svelte';
	import { Search, LoaderCircle, Check, X } from '@lucide/svelte';
	import type { InvoiceParty } from '$lib/invoice/types';
	import { createCvrLookup } from '$lib/invoice/useCvrLookup.svelte';
	import { createViesValidation } from '$lib/invoice/useViesValidation.svelte';
	import { validateCvr } from '$lib/invoice/validation';

	type Props = {
		/** Reactive party object — fields are mutated in place. */
		party: InvoiceParty;
		/** Section heading snippet (so the parent can localize it). */
		title: Snippet;
		/** Translation function from the i18n layer. */
		t: (key: string) => string;
		/**
		 * Role of this party. Only the buyer gets the VIES validation control,
		 * since reverse charge only applies on the buyer side in practice.
		 */
		role?: 'seller' | 'buyer';
	};

	let { party, title, t, role = 'seller' }: Props = $props();

	// One lookup/validation container per component instance — never shared.
	const cvrLookup = createCvrLookup();
	const vies = createViesValidation();

	/**
	 * Parse a value like "SE1234567890" or "DE 12345678" into a normalized
	 * `{ countryCode, vatNumber }` pair. Returns `null` for anything that
	 * doesn't look like a non-DK EU VAT number (so the UI can decide whether
	 * to offer VIES validation).
	 */
	function parseForeignVat(value: string): { countryCode: string; vatNumber: string } | null {
		const trimmed = value.trim();
		// Require a leading 2-letter country code that isn't DK.
		const match = /^([A-Za-z]{2})\s*([A-Za-z0-9].*)$/.exec(trimmed);
		if (!match) return null;
		const countryCode = match[1].toUpperCase();
		if (countryCode === 'DK') return null;
		const vatNumber = match[2].replace(/[\s.-]/g, '');
		if (!vatNumber) return null;
		return { countryCode, vatNumber };
	}

	/** True when the CVR field currently holds a valid 8-digit Danish CVR. */
	const isDanishCvr = $derived(validateCvr(party.cvr ?? ''));

	/**
	 * Parse a non-DK EU VAT number into a country code + number pair.
	 * Returns `null` when the value doesn't start with a 2-letter country code
	 * that isn't DK, or when the rest is empty.
	 */
	const foreignVat = $derived(parseForeignVat(party.cvr ?? ''));

	/** True when this section should show the VIES control. */
	const showVies = $derived(role === 'buyer' && foreignVat !== null);

	async function handleCvrLookup() {
		const result = await cvrLookup.lookup(party.cvr ?? '');
		if (result) {
			// Auto-fill the party fields from the registry result. We avoid
			// overwriting fields the user has deliberately cleared (empty
			// strings from the API are still written — that matches "registry
			// had nothing" semantics).
			party.name = result.name;
			party.address = result.address;
			party.postalCode = result.zipcode;
			party.city = result.city;
			if (result.phone) party.phone = result.phone;
			if (result.email) party.email = result.email;
		}
	}

	async function handleViesValidate() {
		if (!foreignVat) return;
		await vies.validate(foreignVat.countryCode, foreignVat.vatNumber);
	}
</script>

<section class="border-border bg-card rounded-lg border p-4 sm:p-6">
	<h2 class="text-foreground mb-4 text-base font-semibold">
		{@render title()}
	</h2>

	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
		<div class="sm:col-span-2">
			<label class="text-foreground mb-1 block text-sm font-medium" for="party-name-{party.name}">
				{t('party.name')} <span class="text-destructive">*</span>
			</label>
			<input
				id="party-name-{party.name}"
				type="text"
				class="border-border bg-background focus:border-ring focus:ring-ring text-foreground placeholder:text-muted-foreground w-full rounded-md border px-3 py-2 text-sm shadow-sm outline-none focus:ring-1"
				bind:value={party.name}
				placeholder={t('party.name')}
				autocomplete="organization"
			/>
		</div>

		<div class="sm:col-span-2">
			<label
				class="text-foreground mb-1 block text-sm font-medium"
				for="party-address-{party.name}"
			>
				{t('party.address')}
			</label>
			<input
				id="party-address-{party.name}"
				type="text"
				class="border-border bg-background focus:border-ring focus:ring-ring text-foreground placeholder:text-muted-foreground w-full rounded-md border px-3 py-2 text-sm shadow-sm outline-none focus:ring-1"
				bind:value={party.address}
				placeholder={t('party.address')}
				autocomplete="street-address"
			/>
		</div>

		<div>
			<label class="text-foreground mb-1 block text-sm font-medium" for="party-postal-{party.name}">
				{t('party.postalCode')}
			</label>
			<input
				id="party-postal-{party.name}"
				type="text"
				inputmode="numeric"
				class="border-border bg-background focus:border-ring focus:ring-ring text-foreground placeholder:text-muted-foreground w-full rounded-md border px-3 py-2 text-sm shadow-sm outline-none focus:ring-1"
				bind:value={party.postalCode}
				placeholder={t('party.postalCode')}
				autocomplete="postal-code"
			/>
		</div>

		<div>
			<label class="text-foreground mb-1 block text-sm font-medium" for="party-city-{party.name}">
				{t('party.city')}
			</label>
			<input
				id="party-city-{party.name}"
				type="text"
				class="border-border bg-background focus:border-ring focus:ring-ring text-foreground placeholder:text-muted-foreground w-full rounded-md border px-3 py-2 text-sm shadow-sm outline-none focus:ring-1"
				bind:value={party.city}
				placeholder={t('party.city')}
				autocomplete="address-level2"
			/>
		</div>

		<div class="sm:col-span-2">
			<label class="text-foreground mb-1 block text-sm font-medium" for="party-cvr-{party.name}">
				{t('party.cvr')}
			</label>
			<div class="flex flex-wrap items-center gap-2">
				<input
					id="party-cvr-{party.name}"
					type="text"
					inputmode="numeric"
					maxlength="14"
					class="border-border bg-background focus:border-ring focus:ring-ring text-foreground placeholder:text-muted-foreground min-w-[10rem] flex-1 rounded-md border px-3 py-2 text-sm shadow-sm outline-none focus:ring-1"
					bind:value={party.cvr}
					placeholder="12345678"
				/>

				{#if isDanishCvr}
					<button
						type="button"
						class="border-border text-foreground hover:bg-accent inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
						onclick={handleCvrLookup}
						disabled={cvrLookup.loading}
						aria-label={t('party.cvrLookup')}
					>
						{#if cvrLookup.loading}
							<LoaderCircle size={14} class="animate-spin" />
							{t('party.cvrLooking')}
						{:else}
							<Search size={14} />
							{t('party.cvrLookup')}
						{/if}
					</button>
				{/if}

				{#if showVies}
					<button
						type="button"
						class="border-border text-foreground hover:bg-accent inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
						onclick={handleViesValidate}
						disabled={vies.loading}
						aria-label={t('party.viesValidate')}
					>
						{#if vies.loading}
							<LoaderCircle size={14} class="animate-spin" />
							{t('party.viesValidating')}
						{:else}
							<Search size={14} />
							{t('party.viesValidate')}
						{/if}
					</button>
				{/if}
			</div>

			<!-- CVR lookup feedback -->
			{#if cvrLookup.error}
				<p class="text-destructive mt-1.5 text-xs">{cvrLookup.error}</p>
			{:else if cvrLookup.result}
				<p class="text-muted-foreground mt-1.5 inline-flex items-center gap-1 text-xs">
					<Check size={12} />
					{t('party.cvrLookupSuccess')}
				</p>
			{/if}

			<!-- VIES validation feedback -->
			{#if vies.error}
				<p class="text-destructive mt-1.5 text-xs">{vies.error}</p>
			{:else if vies.result}
				{#if vies.result.valid}
					<p
						class="mt-1.5 inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400"
					>
						<Check size={12} />
						{t('party.viesValid')}
					</p>
				{:else}
					<p class="text-destructive mt-1.5 inline-flex items-center gap-1 text-xs">
						<X size={12} />
						{t('party.viesInvalid')}
					</p>
				{/if}
			{:else if showVies && !vies.result && !vies.loading}
				<p class="text-muted-foreground mt-1.5 text-xs">{t('party.viesHint')}</p>
			{/if}
		</div>

		<div>
			<label class="text-foreground mb-1 block text-sm font-medium" for="party-email-{party.name}">
				{t('party.email')}
			</label>
			<input
				id="party-email-{party.name}"
				type="email"
				class="border-border bg-background focus:border-ring focus:ring-ring text-foreground placeholder:text-muted-foreground w-full rounded-md border px-3 py-2 text-sm shadow-sm outline-none focus:ring-1"
				bind:value={party.email}
				placeholder="navn@firma.dk"
				autocomplete="email"
			/>
		</div>

		<div>
			<label class="text-foreground mb-1 block text-sm font-medium" for="party-phone-{party.name}">
				{t('party.phone')}
			</label>
			<input
				id="party-phone-{party.name}"
				type="tel"
				class="border-border bg-background focus:border-ring focus:ring-ring text-foreground placeholder:text-muted-foreground w-full rounded-md border px-3 py-2 text-sm shadow-sm outline-none focus:ring-1"
				bind:value={party.phone}
				placeholder="+45 12 34 56 78"
				autocomplete="tel"
			/>
		</div>

		<div>
			<label class="text-foreground mb-1 block text-sm font-medium" for="party-ean-{party.name}">
				{t('party.ean')}
			</label>
			<input
				id="party-ean-{party.name}"
				type="text"
				inputmode="numeric"
				maxlength="13"
				class="border-border bg-background focus:border-ring focus:ring-ring text-foreground placeholder:text-muted-foreground w-full rounded-md border px-3 py-2 text-sm shadow-sm outline-none focus:ring-1"
				bind:value={party.ean}
				placeholder="5790000000000"
			/>
		</div>
	</div>
</section>

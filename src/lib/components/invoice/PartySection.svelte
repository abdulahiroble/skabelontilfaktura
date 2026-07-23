<script lang="ts">
	/**
	 * Reusable section for an invoice party (seller or buyer).
	 *
	 * The component is purely presentational: it binds to a single
	 * `InvoiceParty` object via the `party` prop and mutates fields directly.
	 * Because Svelte 5 deep proxies `$state`, mutations propagate up to the
	 * parent store automatically.
	 */
	import type { Snippet } from 'svelte';
	import type { InvoiceParty } from '$lib/invoice/types';

	type Props = {
		/** Reactive party object — fields are mutated in place. */
		party: InvoiceParty;
		/** Section heading snippet (so the parent can localize it). */
		title: Snippet;
		/** Translation function from the i18n layer. */
		t: (key: string) => string;
	};

	let { party, title, t }: Props = $props();
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

		<div>
			<label class="text-foreground mb-1 block text-sm font-medium" for="party-cvr-{party.name}">
				{t('party.cvr')}
			</label>
			<input
				id="party-cvr-{party.name}"
				type="text"
				inputmode="numeric"
				maxlength="8"
				class="border-border bg-background focus:border-ring focus:ring-ring text-foreground placeholder:text-muted-foreground w-full rounded-md border px-3 py-2 text-sm shadow-sm outline-none focus:ring-1"
				bind:value={party.cvr}
				placeholder="12345678"
			/>
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

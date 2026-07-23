<script lang="ts">
	/**
	 * Payment details and date section.
	 *
	 * Binds to fields on the reactive draft: bank reg.nr + kontonr, MobilePay,
	 * free-text payment terms, and the issue / due / delivery dates. The VAT
	 * calculation engine is intentionally NOT implemented here — this component
	 * only collects the inputs that the engine will later consume.
	 */
	import type { InvoiceData } from '$lib/invoice/types';

	type Props = {
		/** Reactive draft — fields are mutated in place. */
		invoice: InvoiceData;
		/** Translation function from the i18n layer. */
		t: (key: string) => string;
	};

	let { invoice, t }: Props = $props();
</script>

<section class="border-border bg-card rounded-lg border p-4 sm:p-6">
	<h2 class="text-foreground mb-4 text-base font-semibold">{t('section.payment')}</h2>

	<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
		<div>
			<label class="text-foreground mb-1 block text-sm font-medium" for="inv-number">
				{t('payment.invoiceNumber')}
			</label>
			<input
				id="inv-number"
				type="text"
				class="border-border bg-background focus:border-ring focus:ring-ring text-foreground placeholder:text-muted-foreground w-full rounded-md border px-3 py-2 text-sm shadow-sm outline-none focus:ring-1"
				bind:value={invoice.invoiceNumber}
			/>
		</div>

		<div>
			<label class="text-foreground mb-1 block text-sm font-medium" for="inv-series">
				{t('payment.series')}
			</label>
			<input
				id="inv-series"
				type="text"
				class="border-border bg-background focus:border-ring focus:ring-ring text-foreground placeholder:text-muted-foreground w-full rounded-md border px-3 py-2 text-sm shadow-sm outline-none focus:ring-1"
				bind:value={invoice.series}
			/>
		</div>

		<div>
			<label class="text-foreground mb-1 block text-sm font-medium" for="inv-terms">
				{t('payment.terms')}
			</label>
			<input
				id="inv-terms"
				type="text"
				class="border-border bg-background focus:border-ring focus:ring-ring text-foreground placeholder:text-muted-foreground w-full rounded-md border px-3 py-2 text-sm shadow-sm outline-none focus:ring-1"
				bind:value={invoice.paymentTerms}
				placeholder={t('payment.terms')}
			/>
		</div>

		<div>
			<label class="text-foreground mb-1 block text-sm font-medium" for="inv-issue-date">
				{t('payment.issueDate')}
			</label>
			<input
				id="inv-issue-date"
				type="date"
				class="border-border bg-background focus:border-ring focus:ring-ring text-foreground w-full rounded-md border px-3 py-2 text-sm shadow-sm outline-none focus:ring-1"
				bind:value={invoice.issueDate}
			/>
		</div>

		<div>
			<label class="text-foreground mb-1 block text-sm font-medium" for="inv-due-date">
				{t('payment.dueDate')}
			</label>
			<input
				id="inv-due-date"
				type="date"
				class="border-border bg-background focus:border-ring focus:ring-ring text-foreground w-full rounded-md border px-3 py-2 text-sm shadow-sm outline-none focus:ring-1"
				bind:value={invoice.dueDate}
			/>
		</div>

		<div>
			<label class="text-foreground mb-1 block text-sm font-medium" for="inv-delivery-date">
				{t('payment.deliveryDate')}
			</label>
			<input
				id="inv-delivery-date"
				type="date"
				class="border-border bg-background focus:border-ring focus:ring-ring text-foreground w-full rounded-md border px-3 py-2 text-sm shadow-sm outline-none focus:ring-1"
				bind:value={invoice.deliveryDate}
			/>
		</div>

		<div>
			<label class="text-foreground mb-1 block text-sm font-medium" for="inv-regnr">
				{t('payment.regNr')}
			</label>
			<input
				id="inv-regnr"
				type="text"
				inputmode="numeric"
				maxlength="4"
				class="border-border bg-background focus:border-ring focus:ring-ring text-foreground placeholder:text-muted-foreground w-full rounded-md border px-3 py-2 text-sm shadow-sm outline-none focus:ring-1"
				bind:value={invoice.regNr}
				placeholder="1234"
			/>
		</div>

		<div>
			<label class="text-foreground mb-1 block text-sm font-medium" for="inv-kontonr">
				{t('payment.kontonr')}
			</label>
			<input
				id="inv-kontonr"
				type="text"
				inputmode="numeric"
				class="border-border bg-background focus:border-ring focus:ring-ring text-foreground placeholder:text-muted-foreground w-full rounded-md border px-3 py-2 text-sm shadow-sm outline-none focus:ring-1"
				bind:value={invoice.kontonr}
				placeholder="1234567890"
			/>
		</div>

		<div>
			<label class="text-foreground mb-1 block text-sm font-medium" for="inv-mobilepay">
				{t('payment.mobilepay')}
			</label>
			<input
				id="inv-mobilepay"
				type="tel"
				class="border-border bg-background focus:border-ring focus:ring-ring text-foreground placeholder:text-muted-foreground w-full rounded-md border px-3 py-2 text-sm shadow-sm outline-none focus:ring-1"
				bind:value={invoice.mobilepay}
				placeholder="12345678"
			/>
		</div>
	</div>
</section>

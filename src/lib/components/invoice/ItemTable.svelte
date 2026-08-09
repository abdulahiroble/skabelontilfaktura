<script lang="ts">
	/**
	 * Editable line-item table for the invoice.
	 *
	 * Each row binds directly to a reactive `InvoiceItem` from the parent
	 * store, so typing into a field updates the draft and triggers the
	 * debounced autosave automatically. Rows can be added and removed; the
	 * "remove" control is disabled when only one row remains so the array
	 * invariant of the Zod schema (`min(1)`) can never be violated by the UI.
	 *
	 * The line total is computed locally with the same formula the future VAT
	 * engine will use — kept here only for display. The calculation engine
	 * itself is intentionally not implemented (separate task).
	 */
	import { Plus, Trash2 } from '@lucide/svelte';
	import type { InvoiceItem } from '$lib/invoice/types';

	type Props = {
		items: InvoiceItem[];
		/** Translation function from the i18n layer. */
		t: (key: string) => string;
		/** Append a new line item. Parent owns id allocation. */
		onAdd: () => void;
		/** Remove a line item by id. Parent enforces the min-1 invariant. */
		onRemove: (id: string) => void;
	};

	let { items, t, onAdd, onRemove }: Props = $props();

	function lineTotal(item: InvoiceItem): number {
		const gross = item.quantity * item.unitPrice;
		const discount = gross * ((item.discount ?? 0) / 100);
		return Math.max(0, gross - discount);
	}

	function vatPercent(rate: number): string {
		return `${(rate * 100).toFixed(0)}%`;
	}
</script>

<section class="border-border bg-card rounded-lg border p-4 sm:p-6">
	<h2 class="text-foreground mb-4 text-base font-semibold">{t('section.items')}</h2>

	<div class="grid gap-3">
		{#each items as item, index (item.id)}
			<div class="border-border grid grid-cols-2 gap-3 rounded-lg border p-3 sm:grid-cols-3">
				<label class="col-span-2 sm:col-span-3">
					<span class="text-muted-foreground mb-1 block text-xs font-medium">
						{t('items.description')} *
					</span>
					<input
						type="text"
						class="border-border bg-background focus:border-ring focus:ring-ring text-foreground placeholder:text-muted-foreground h-11 w-full rounded-md border px-3 text-sm outline-none focus:ring-1"
						bind:value={item.description}
						placeholder={t('items.description')}
					/>
				</label>
				<label>
					<span class="text-muted-foreground mb-1 block text-xs font-medium">
						{t('items.quantity')} *
					</span>
					<input
						type="number"
						min="0"
						step="any"
						class="border-border bg-background focus:border-ring focus:ring-ring text-foreground h-11 w-full rounded-md border px-3 text-sm outline-none focus:ring-1"
						bind:value={item.quantity}
					/>
				</label>
				<label>
					<span class="text-muted-foreground mb-1 block text-xs font-medium">
						{t('items.unit')} *
					</span>
					<input
						type="text"
						class="border-border bg-background focus:border-ring focus:ring-ring text-foreground h-11 w-full rounded-md border px-3 text-sm outline-none focus:ring-1"
						bind:value={item.unit}
					/>
				</label>
				<label>
					<span class="text-muted-foreground mb-1 block text-xs font-medium">
						{t('items.unitPrice')} *
					</span>
					<input
						type="number"
						min="0"
						step="any"
						class="border-border bg-background focus:border-ring focus:ring-ring text-foreground h-11 w-full rounded-md border px-3 text-right text-sm outline-none focus:ring-1"
						bind:value={item.unitPrice}
					/>
				</label>
				<label>
					<span class="text-muted-foreground mb-1 block text-xs font-medium">
						{t('items.vatRate')} *
					</span>
					<select
						class="border-border bg-background focus:border-ring focus:ring-ring text-foreground h-11 w-full rounded-md border px-3 text-sm outline-none focus:ring-1"
						bind:value={item.vatRate}
					>
						<option value={0.25}>{vatPercent(0.25)}</option>
						<option value={0}>{vatPercent(0)}</option>
						<option value={0.05}>{vatPercent(0.05)}</option>
						<option value={0.12}>{vatPercent(0.12)}</option>
					</select>
				</label>
				<label>
					<span class="text-muted-foreground mb-1 block text-xs font-medium">
						{t('items.discount')} ({t('common.optional')})
					</span>
					<div class="relative">
						<input
							type="number"
							min="0"
							max="100"
							step="any"
							class="border-border bg-background focus:border-ring focus:ring-ring text-foreground h-11 w-full rounded-md border px-3 pr-7 text-right text-sm outline-none focus:ring-1"
							bind:value={item.discount}
						/>
						<span
							class="text-muted-foreground pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-xs"
							>%</span
						>
					</div>
				</label>
				<div>
					<span class="text-muted-foreground mb-1 block text-xs font-medium">
						{t('items.lineTotal')}
					</span>
					<div class="flex h-11 items-center justify-between gap-2">
						<span class="text-foreground text-sm font-medium tabular-nums">
							{lineTotal(item).toFixed(2)}
						</span>
						<button
							type="button"
							class="text-muted-foreground hover:text-destructive hover:bg-accent/50 inline-flex h-10 w-10 items-center justify-center rounded-md transition-colors disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
							onclick={() => onRemove(item.id ?? '')}
							disabled={items.length <= 1}
							aria-label={`${t('common.remove')} ${index + 1}`}
							title={t('common.remove')}
						>
							<Trash2 size={16} />
						</button>
					</div>
				</div>
			</div>
		{/each}
	</div>

	<button
		type="button"
		class="text-muted-foreground hover:text-foreground hover:bg-accent/50 mt-3 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors"
		onclick={onAdd}
	>
		<Plus size={15} />
		{t('button.addLine')}
	</button>
</section>

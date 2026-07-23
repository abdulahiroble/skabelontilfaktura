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

	<div class="overflow-x-auto">
		<table class="w-full border-collapse text-sm">
			<thead>
				<tr class="text-muted-foreground border-border border-b text-left text-xs uppercase">
					<th class="py-2 pr-2 font-medium">{t('items.description')}</th>
					<th class="w-20 px-2 py-2 font-medium">{t('items.quantity')}</th>
					<th class="w-20 px-2 py-2 font-medium">{t('items.unit')}</th>
					<th class="w-28 px-2 py-2 font-medium">{t('items.unitPrice')}</th>
					<th class="w-20 px-2 py-2 font-medium">{t('items.vatRate')}</th>
					<th class="w-24 px-2 py-2 font-medium">{t('items.discount')}</th>
					<th class="w-28 px-2 py-2 text-right font-medium">{t('items.lineTotal')}</th>
					<th class="w-10 px-2 py-2"></th>
				</tr>
			</thead>
			<tbody>
				{#each items as item (item.id)}
					<tr class="border-border border-b last:border-b-0">
						<td class="py-2 pr-2 align-top">
							<input
								type="text"
								class="border-border bg-background focus:border-ring focus:ring-ring text-foreground placeholder:text-muted-foreground w-full rounded-md border px-2 py-1.5 text-sm outline-none focus:ring-1"
								bind:value={item.description}
								placeholder={t('items.description')}
								aria-label={t('items.description')}
							/>
						</td>
						<td class="px-2 py-2 align-top">
							<input
								type="number"
								min="0"
								step="any"
								class="border-border bg-background focus:border-ring focus:ring-ring text-foreground w-full rounded-md border px-2 py-1.5 text-sm outline-none focus:ring-1"
								bind:value={item.quantity}
								aria-label={t('items.quantity')}
							/>
						</td>
						<td class="px-2 py-2 align-top">
							<input
								type="text"
								class="border-border bg-background focus:border-ring focus:ring-ring text-foreground w-full rounded-md border px-2 py-1.5 text-sm outline-none focus:ring-1"
								bind:value={item.unit}
								aria-label={t('items.unit')}
							/>
						</td>
						<td class="px-2 py-2 align-top">
							<input
								type="number"
								min="0"
								step="any"
								class="border-border bg-background focus:border-ring focus:ring-ring text-foreground w-full rounded-md border px-2 py-1.5 text-sm outline-none focus:ring-1"
								bind:value={item.unitPrice}
								aria-label={t('items.unitPrice')}
							/>
						</td>
						<td class="px-2 py-2 align-top">
							<select
								class="border-border bg-background focus:border-ring focus:ring-ring text-foreground w-full rounded-md border px-2 py-1.5 text-sm outline-none focus:ring-1"
								bind:value={item.vatRate}
								aria-label={t('items.vatRate')}
							>
								<option value={0.25}>{vatPercent(0.25)}</option>
								<option value={0}>{vatPercent(0)}</option>
								<option value={0.05}>{vatPercent(0.05)}</option>
								<option value={0.12}>{vatPercent(0.12)}</option>
							</select>
						</td>
						<td class="px-2 py-2 align-top">
							<input
								type="number"
								min="0"
								max="100"
								step="any"
								class="border-border bg-background focus:border-ring focus:ring-ring text-foreground w-full rounded-md border px-2 py-1.5 text-sm outline-none focus:ring-1"
								bind:value={item.discount}
								aria-label={t('items.discount')}
							/>
						</td>
						<td class="text-foreground px-2 py-2 text-right align-top tabular-nums">
							{lineTotal(item).toFixed(2)}
						</td>
						<td class="px-2 py-2 align-top">
							<button
								type="button"
								class="text-muted-foreground hover:text-destructive inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors disabled:cursor-not-allowed disabled:opacity-30"
								onclick={() => onRemove(item.id ?? '')}
								disabled={items.length <= 1}
								aria-label={t('common.remove')}
								title={t('common.remove')}
							>
								<Trash2 size={16} />
							</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<button
		type="button"
		class="border-border text-foreground hover:bg-accent mt-3 inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors"
		onclick={onAdd}
	>
		<Plus size={16} />
		{t('button.addLine')}
	</button>
</section>

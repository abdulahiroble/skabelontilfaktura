<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Download, Plus } from '@lucide/svelte';
	import { INVOICE_STATUS_OPTIONS, type InvoiceStatus } from '$lib/invoice/types';
	import { formatDanishDate, formatMoney } from '$lib/utils';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const statusLabels = new Map(
		INVOICE_STATUS_OPTIONS.map((option) => [option.value, option.label])
	);
</script>

<svelte:head>
	<title>Fakturaer | skabelontilfaktura.dk</title>
</svelte:head>

<div class="mx-auto max-w-6xl px-4 py-8">
	<header class="mb-7 flex flex-wrap items-end justify-between gap-4">
		<div>
			<p class="text-accent text-sm font-medium">Cloud-arkiv</p>
			<h1 class="mt-1 text-3xl font-semibold">Fakturaer</h1>
			<p class="text-muted-foreground mt-2 text-sm">
				Alle fakturaer gemmes på tværs af enheder og er klar til eksport.
			</p>
		</div>
		<Button href="/generator/">
			<Plus size={16} />
			Ny faktura
		</Button>
	</header>

	{#if data.invoices.length === 0}
		<div class="border-border rounded-lg border border-dashed p-12 text-center">
			<h2 class="font-semibold">Ingen cloud-fakturaer endnu</h2>
			<p class="text-muted-foreground mt-2 text-sm">
				Opret din første faktura og vælg “Gem i cloud”.
			</p>
			<Button href="/generator/" class="mt-5">Opret faktura</Button>
		</div>
	{:else}
		<div class="border-border overflow-x-auto rounded-lg border">
			<table class="w-full min-w-[760px] text-sm">
				<thead class="bg-muted/40 text-muted-foreground border-border border-b text-left">
					<tr>
						<th class="px-4 py-3 font-medium">Faktura</th>
						<th class="px-4 py-3 font-medium">Kunde</th>
						<th class="px-4 py-3 font-medium">Dato</th>
						<th class="px-4 py-3 font-medium">Status</th>
						<th class="px-4 py-3 text-right font-medium">Total</th>
						<th class="px-4 py-3 text-right font-medium">Handling</th>
					</tr>
				</thead>
				<tbody class="divide-border divide-y">
					{#each data.invoices as invoice (invoice.id)}
						<tr class="hover:bg-muted/20">
							<td class="px-4 py-3 font-medium">
								<a href={`/faktura/${invoice.id}/`} class="hover:underline">
									{invoice.invoiceNumber}
								</a>
							</td>
							<td class="text-muted-foreground px-4 py-3">{invoice.buyerName ?? '—'}</td>
							<td class="text-muted-foreground px-4 py-3">
								{formatDanishDate(invoice.issuedAt)}
							</td>
							<td class="px-4 py-3">
								<span class="bg-secondary rounded-full px-2.5 py-1 text-xs font-medium">
									{statusLabels.get(invoice.status as InvoiceStatus) ?? invoice.status}
								</span>
							</td>
							<td class="px-4 py-3 text-right font-medium">
								{formatMoney(invoice.total, invoice.currency)}
							</td>
							<td class="px-4 py-3 text-right">
								{#if invoice.pdfR2Key}
									<Button variant="ghost" size="sm" href={`/api/invoices/${invoice.id}/pdf`}>
										<Download size={14} />
										PDF
									</Button>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

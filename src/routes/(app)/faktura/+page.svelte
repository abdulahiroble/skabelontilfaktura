<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Download, Plus, Search } from '@lucide/svelte';
	import { INVOICE_STATUS_OPTIONS, type InvoiceStatus } from '$lib/invoice/types';
	import { formatDanishDate, formatMoney } from '$lib/utils';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const statusLabels = new Map(
		INVOICE_STATUS_OPTIONS.map((option) => [option.value, option.label])
	);
	let query = $state('');
	let status = $state<'all' | InvoiceStatus>('all');
	const filteredInvoices = $derived(
		data.invoices.filter((invoice) => {
			const search = query.trim().toLocaleLowerCase('da');
			const matchesQuery =
				!search ||
				invoice.invoiceNumber.toLocaleLowerCase('da').includes(search) ||
				(invoice.buyerName ?? '').toLocaleLowerCase('da').includes(search);
			return matchesQuery && (status === 'all' || invoice.status === status);
		})
	);

	function statusClass(value: string): string {
		switch (value) {
			case 'paid':
				return 'bg-green-100 text-green-800';
			case 'sent':
				return 'bg-blue-100 text-blue-800';
			case 'overdue':
				return 'bg-amber-100 text-amber-900';
			case 'void':
				return 'bg-muted text-muted-foreground';
			default:
				return 'bg-secondary text-secondary-foreground';
		}
	}
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
				Cloud-gemte fakturaer er tilgængelige på tværs af enheder. Sendte og afsluttede fakturaer
				kan eksporteres.
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
		<div class="mb-4 grid gap-3 sm:grid-cols-[1fr_180px]">
			<label class="relative">
				<Search
					size={16}
					class="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
				/>
				<span class="sr-only">Søg i fakturaer</span>
				<input
					type="search"
					bind:value={query}
					placeholder="Søg på fakturanummer eller kunde"
					class="border-input bg-background h-11 w-full rounded-md border pr-3 pl-9 text-sm"
				/>
			</label>
			<label>
				<span class="sr-only">Filtrer efter status</span>
				<select
					bind:value={status}
					class="border-input bg-background h-11 w-full rounded-md border px-3 text-sm"
				>
					<option value="all">Alle statusser</option>
					{#each INVOICE_STATUS_OPTIONS as option (option.value)}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
			</label>
		</div>

		{#if filteredInvoices.length === 0}
			<div class="border-border rounded-lg border border-dashed p-8 text-center">
				<p class="font-medium">Ingen fakturaer matcher søgningen</p>
				<button
					type="button"
					class="text-primary mt-2 text-sm hover:underline"
					onclick={() => {
						query = '';
						status = 'all';
					}}>Nulstil filtre</button
				>
			</div>
		{/if}

		<div class="border-border hidden overflow-x-auto rounded-lg border sm:block">
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
					{#each filteredInvoices as invoice (invoice.id)}
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
								<span
									class={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(invoice.status)}`}
								>
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

		<div class="grid gap-3 sm:hidden">
			{#each filteredInvoices as invoice (invoice.id)}
				<a href={`/faktura/${invoice.id}/`} class="border-border bg-card rounded-lg border p-4">
					<div class="flex items-start justify-between gap-3">
						<div class="min-w-0">
							<p class="font-semibold">{invoice.invoiceNumber}</p>
							<p class="text-muted-foreground mt-1 truncate text-sm">
								{invoice.buyerName ?? 'Ingen kunde'}
							</p>
						</div>
						<span
							class={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(invoice.status)}`}
						>
							{statusLabels.get(invoice.status as InvoiceStatus) ?? invoice.status}
						</span>
					</div>
					<div class="border-border mt-4 flex items-end justify-between border-t pt-3">
						<p class="text-muted-foreground text-xs">{formatDanishDate(invoice.issuedAt)}</p>
						<p class="font-medium">{formatMoney(invoice.total, invoice.currency)}</p>
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>

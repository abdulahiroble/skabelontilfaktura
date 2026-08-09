<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Bell, Check, Download, Trash2 } from '@lucide/svelte';
	import { INVOICE_STATUS_OPTIONS } from '$lib/invoice/types';
	import { formatDanishDate, formatMoney } from '$lib/utils';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const reminderLabels: Record<string, string> = {
		first: 'Betalingspåmindelse',
		second: '2. rykker',
		final: 'Inkassovarsel'
	};
</script>

<svelte:head>
	<title>{data.invoice.invoiceNumber} | skabelontilfaktura.dk</title>
</svelte:head>

<div class="mx-auto max-w-4xl px-4 py-8">
	<header class="mb-8 flex flex-wrap items-start justify-between gap-4">
		<div>
			<a href="/faktura/" class="text-muted-foreground text-sm hover:underline">← Fakturaer</a>
			<h1 class="mt-2 text-3xl font-semibold">{data.invoice.invoiceNumber}</h1>
			<p class="text-muted-foreground mt-2 text-sm">
				Oprettet {formatDanishDate(data.invoice.createdAt)}
			</p>
		</div>
		{#if data.invoice.pdfR2Key}
			<Button href={`/api/invoices/${data.invoice.id}/pdf`}>
				<Download size={16} />
				Download PDF
			</Button>
		{/if}
	</header>

	<div class="grid gap-6 md:grid-cols-[1fr_280px]">
		<section class="border-border space-y-6 rounded-lg border p-6">
			<div class="grid gap-5 sm:grid-cols-2">
				<div>
					<p class="text-muted-foreground text-xs font-medium tracking-wide uppercase">Kunde</p>
					<p class="mt-1 font-medium">
						{data.invoice.buyerName ?? data.snapshot?.buyer.name ?? '—'}
					</p>
					{#if data.invoice.buyerEmail}
						<p class="text-muted-foreground mt-1 text-sm">{data.invoice.buyerEmail}</p>
					{/if}
				</div>
				<div>
					<p class="text-muted-foreground text-xs font-medium tracking-wide uppercase">Periode</p>
					<p class="mt-1 text-sm">Dato: {formatDanishDate(data.invoice.issuedAt)}</p>
					<p class="text-muted-foreground mt-1 text-sm">
						Forfalder: {formatDanishDate(data.invoice.dueAt)}
					</p>
				</div>
			</div>

			<div class="border-border border-t pt-5">
				<div class="text-muted-foreground flex justify-between text-sm">
					<span>Subtotal</span>
					<span>{formatMoney(data.invoice.subtotal, data.invoice.currency)}</span>
				</div>
				<div class="text-muted-foreground mt-2 flex justify-between text-sm">
					<span>Moms</span>
					<span>{formatMoney(data.invoice.vatAmount, data.invoice.currency)}</span>
				</div>
				<div class="border-border mt-4 flex justify-between border-t pt-4 text-lg font-semibold">
					<span>Total</span>
					<span>{formatMoney(data.invoice.total, data.invoice.currency)}</span>
				</div>
			</div>

			{#if data.snapshot?.items?.length}
				<div class="border-border border-t pt-5">
					<h2 class="font-semibold">Fakturalinjer</h2>
					<div class="mt-3 divide-y">
						{#each data.snapshot.items as item, index (`${item.id ?? index}`)}
							<div class="flex justify-between gap-4 py-3 text-sm">
								<div>
									<p class="font-medium">{item.description}</p>
									<p class="text-muted-foreground">{item.quantity} {item.unit}</p>
								</div>
								<p>{formatMoney(item.quantity * item.unitPrice, data.invoice.currency)}</p>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</section>

		<aside class="space-y-5">
			<form method="POST" action="?/status" class="border-border space-y-4 rounded-lg border p-5">
				<div>
					<h2 class="font-semibold">Status</h2>
					<p class="text-muted-foreground mt-1 text-xs">
						Rykkere kræver status Sendt og en e-mailadresse på kunden.
					</p>
				</div>
				<select
					name="status"
					value={data.invoice.status}
					class="border-input bg-background h-10 w-full rounded-md border px-3 text-sm"
				>
					{#each INVOICE_STATUS_OPTIONS as option (option.value)}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
				<Button type="submit" variant="outline" class="w-full">Gem status</Button>
			</form>

			<section class="border-border rounded-lg border p-5">
				<div class="flex items-start gap-3">
					<Bell size={18} class="text-primary mt-0.5 shrink-0" />
					<div>
						<h2 class="font-semibold">Rykkere</h2>
						<p class="text-muted-foreground mt-1 text-xs leading-relaxed">
							Første påmindelse sendes 3 dage efter forfald. Senere trin venter mindst 10 dage.
						</p>
					</div>
				</div>
				{#if data.reminderLogs.length === 0}
					<p class="text-muted-foreground mt-4 text-sm">Ingen rykkere sendt endnu.</p>
				{:else}
					<div class="border-border mt-4 space-y-3 border-t pt-4">
						{#each data.reminderLogs as log (log.id)}
							<div class="flex gap-2 text-sm">
								<Check size={15} class="text-primary mt-0.5 shrink-0" />
								<div>
									<p class="font-medium">{reminderLabels[log.template ?? ''] ?? 'Rykker'}</p>
									<p class="text-muted-foreground text-xs">{formatDanishDate(log.sentAt)}</p>
								</div>
							</div>
						{/each}
					</div>
				{/if}
				{#if form?.reminderSent}
					<p class="mt-4 text-sm font-medium text-green-700" role="status">Rykkeren er sendt.</p>
				{/if}
				{#if form?.reminderError}
					<p class="text-destructive mt-4 text-sm" role="alert">{form.reminderError}</p>
				{/if}
				<form method="POST" action="?/reminder" class="mt-4">
					<Button
						type="submit"
						variant="outline"
						class="w-full"
						disabled={data.invoice.status !== 'sent'}
					>
						Send næste rykker
					</Button>
				</form>
				{#if data.invoice.status !== 'sent'}
					<p class="text-muted-foreground mt-2 text-xs">
						Skift status til Sendt for at aktivere rykkerflowet.
					</p>
				{/if}
			</section>

			<form
				method="POST"
				action="?/delete"
				onsubmit={(event) => {
					if (!confirm('Vil du permanent slette fakturaen og PDF-filen?')) {
						event.preventDefault();
					}
				}}
			>
				<Button type="submit" variant="outline" class="text-destructive w-full">
					<Trash2 size={16} />
					Slet faktura
				</Button>
			</form>
		</aside>
	</div>
</div>

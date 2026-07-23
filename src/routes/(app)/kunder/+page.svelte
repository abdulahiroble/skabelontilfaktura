<script lang="ts">
	/**
	 * Client list (Pro-tier "klientdatabase").
	 *
	 * Renders a table of the user's clients with add/edit/delete controls.
	 * Edit/delete each link into the `[id]/rediger/` route; the delete itself
	 * is a POST form action on that route so this page stays read-only.
	 */
	import { Button } from '$lib/components/ui/button';
	import { Plus, Pencil } from '@lucide/svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Klienter | skabelontilfaktura.dk</title>
</svelte:head>

<div class="mx-auto max-w-5xl px-4 py-8">
	<header class="mb-6 flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold">Klienter</h1>
			<p class="text-muted-foreground text-sm">Din klientdatabase på tværs af enheder.</p>
		</div>
		<Button href="/kunder/ny/">
			<Plus size={16} />
			Ny klient
		</Button>
	</header>

	{#if data.clients.length === 0}
		<div
			class="border-border text-muted-foreground rounded-lg border border-dashed p-12 text-center"
		>
			<p class="text-sm font-medium">Ingen klienter endnu.</p>
			<p class="mt-1 text-sm">Tilføj din første klient for at komme i gang.</p>
			<Button class="mt-4" href="/kunder/ny/">
				<Plus size={16} />
				Ny klient
			</Button>
		</div>
	{:else}
		<div class="border-border overflow-x-auto rounded-lg border">
			<table class="w-full text-sm">
				<thead class="bg-muted/40 text-muted-foreground border-border border-b text-left">
					<tr>
						<th class="px-4 py-2.5 font-medium">Navn</th>
						<th class="px-4 py-2.5 font-medium">CVR</th>
						<th class="px-4 py-2.5 font-medium">E-mail</th>
						<th class="px-4 py-2.5 font-medium">EAN / Peppol</th>
						<th class="px-4 py-2.5 text-right font-medium">Handlinger</th>
					</tr>
				</thead>
				<tbody class="divide-border divide-y">
					{#each data.clients as c (c.id)}
						<tr class="hover:bg-muted/20">
							<td class="px-4 py-2.5 font-medium">{c.name}</td>
							<td class="text-muted-foreground px-4 py-2.5">{c.cvr ?? '—'}</td>
							<td class="text-muted-foreground px-4 py-2.5">{c.email ?? '—'}</td>
							<td class="text-muted-foreground px-4 py-2.5">{c.peppolId ?? '—'}</td>
							<td class="px-4 py-2.5 text-right">
								<Button variant="ghost" size="sm" href={`/kunder/${c.id}/rediger/`}>
									<Pencil size={14} />
									Rediger
								</Button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

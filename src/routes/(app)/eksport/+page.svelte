<script lang="ts">
	/**
	 * Export page (Pro-tier). Date range picker + CSV download action. When the
	 * action returns file content, a `$effect` builds a Blob and triggers a
	 * browser download.
	 */
	import { Button } from '$lib/components/ui/button';
	import { Download, FileSpreadsheet } from '@lucide/svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const errors = $derived((form?.errors ?? {}) as Record<string, string>);

	let from = $state('');
	let to = $state('');
	let initialized = $state(false);

	$effect(() => {
		if (initialized) return;
		from = data.defaultRange.from;
		to = data.defaultRange.to;
		initialized = true;
	});

	/**
	 * Whenever a successful action result arrives, materialize it as a download.
	 * Runs only when `form?.ok` flips true and carries content.
	 */
	$effect(() => {
		if (form?.ok && form.content && form.filename) {
			const blob = new Blob([form.content], { type: form.mime ?? 'application/octet-stream' });
			const url = URL.createObjectURL(blob);
			const anchor = document.createElement('a');
			anchor.href = url;
			anchor.download = form.filename;
			document.body.appendChild(anchor);
			anchor.click();
			anchor.remove();
			// Revoke on the next tick so the browser has time to start the download.
			setTimeout(() => URL.revokeObjectURL(url), 0);
		}
	});
</script>

<svelte:head>
	<title>Eksport | skabelontilfaktura.dk</title>
</svelte:head>

<div class="mx-auto max-w-3xl px-4 py-8">
	<header class="mb-6">
		<h1 class="text-2xl font-bold">Eksport</h1>
		<p class="text-muted-foreground text-sm">
			Eksporter dine fakturaposteringer til din revisor eller dit regnskabssystem.
		</p>
	</header>

	{#if errors.form}
		<div class="bg-destructive/10 text-destructive mb-6 rounded-md p-3 text-sm">
			{errors.form}
		</div>
	{/if}
	{#if errors.periode}
		<div class="bg-destructive/10 text-destructive mb-6 rounded-md p-3 text-sm">
			{errors.periode}
		</div>
	{/if}

	<section class="border-border mb-6 rounded-lg border p-5">
		<h2 class="mb-3 text-sm font-semibold">Periode</h2>
		<div class="flex flex-wrap items-end gap-4">
			<label class="flex flex-col gap-1 text-sm">
				<span class="text-muted-foreground">Fra</span>
				<input
					type="date"
					name="from"
					bind:value={from}
					class="border-border bg-background h-9 rounded-md border px-3 text-sm"
					required
				/>
			</label>
			<label class="flex flex-col gap-1 text-sm">
				<span class="text-muted-foreground">Til</span>
				<input
					type="date"
					name="to"
					bind:value={to}
					class="border-border bg-background h-9 rounded-md border px-3 text-sm"
					required
				/>
			</label>
		</div>
	</section>

	<section class="max-w-xl">
		<form
			method="POST"
			action="?/csv"
			class="border-border flex flex-col gap-4 rounded-lg border p-5"
		>
			<input type="hidden" name="from" value={from} />
			<input type="hidden" name="to" value={to} />

			<div class="flex items-center gap-3">
				<FileSpreadsheet size={20} />
				<div>
					<h2 class="text-sm font-semibold">CSV (standardkontoplanen)</h2>
					<p class="text-muted-foreground text-xs">
						Bogføringsklart til dit regnskabssystem. Semikolon-separeret.
					</p>
				</div>
			</div>

			<p class="text-muted-foreground text-sm">
				Indeholder kontonummer, dato, bilag, tekst, debet og kredit for fakturaerne i den valgte
				periode.
			</p>

			<Button type="submit" class="mt-auto w-full">
				<Download size={16} />
				Download CSV
			</Button>
		</form>
	</section>
</div>

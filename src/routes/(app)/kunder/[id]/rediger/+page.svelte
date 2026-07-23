<script lang="ts">
	/**
	 * Edit-client page. Renders the shared `ClientForm` posting to the
	 * `?/update` named action, plus a separate delete form posting to
	 * `?/delete`. On a validation failure the action returns the entered
	 * values and we prefer those over the stored values so the user doesn't
	 * lose their edits.
	 */
	import ClientForm from '$lib/components/clients/ClientForm.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Trash2 } from '@lucide/svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	// Prefer action-returned values (preserves in-progress edits on error),
	// otherwise fall back to the loaded client. Access is narrowed because the
	// `delete` action's failure shape does not include `values`.
	const actionValues = $derived(form && 'values' in form ? form.values : undefined);
	const values = $derived(
		actionValues ?? {
			name: data.client.name ?? '',
			cvr: data.client.cvr ?? '',
			address: data.client.address ?? '',
			email: data.client.email ?? '',
			peppolId: data.client.peppolId ?? ''
		}
	);
	const errors = $derived(form && 'errors' in form ? form.errors : {});
</script>

<svelte:head>
	<title>Rediger klient | skabelontilfaktura.dk</title>
</svelte:head>

<div class="mx-auto max-w-xl px-4 py-8">
	<header class="mb-6">
		<h1 class="text-2xl font-bold">Rediger klient</h1>
		<p class="text-muted-foreground text-sm">Opdater oplysningerne for {data.client.name}.</p>
	</header>

	<ClientForm
		action="?/update"
		submitLabel="Gem ændringer"
		cancelHref="/kunder/"
		{values}
		{errors}
	/>

	<div class="border-border mt-8 border-t pt-6">
		<form
			method="POST"
			action="?/delete"
			onsubmit={(e) => {
				if (!confirm('Slet denne klient permanent?')) e.preventDefault();
			}}
		>
			{#if errors.form}
				<p class="text-destructive mb-2 text-sm font-medium" role="alert">{errors.form}</p>
			{/if}
			<Button variant="destructive" type="submit">
				<Trash2 size={16} />
				Slet klient
			</Button>
		</form>
	</div>
</div>

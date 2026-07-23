<script lang="ts">
	/**
	 * New-client page. Renders the shared `ClientForm` posting to the default
	 * action of this route. Validation errors are mirrored back via the
	 * `form` prop (SvelteKit action result).
	 */
	import ClientForm from '$lib/components/clients/ClientForm.svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	// Derived so the form stays in sync if the action data changes.
	const values = $derived(form?.values ?? {});
	const errors = $derived(form?.errors ?? {});
</script>

<svelte:head>
	<title>Ny klient | skabelontilfaktura.dk</title>
</svelte:head>

<div class="mx-auto max-w-xl px-4 py-8">
	<header class="mb-6">
		<h1 class="text-2xl font-bold">Ny klient</h1>
		<p class="text-muted-foreground text-sm">Tilføj en klient til din klientdatabase.</p>
	</header>

	<ClientForm action="" submitLabel="Opret klient" cancelHref="/kunder/" {values} {errors} />
</div>

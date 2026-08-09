<script lang="ts">
	/**
	 * Reusable client form for create/edit.
	 *
	 * Renders a native `<form method="POST">` so it works without JavaScript
	 * (progressive enhancement). The parent decides the target action and
	 * submit label; validation errors coming back from the form action are
	 * rendered inline.
	 *
	 * Fields: name (required), CVR, address, email.
	 */
	import { Button } from '$lib/components/ui/button';
	import { Check, LoaderCircle, Search } from '@lucide/svelte';
	import { createCvrLookup } from '$lib/invoice/useCvrLookup.svelte';
	import { validateCvr } from '$lib/invoice/validation';

	type ClientFields = {
		name?: string;
		cvr?: string;
		address?: string;
		email?: string;
	};

	type Props = {
		/** Form action attribute. Use '' for the default action or '?/update' etc. */
		action?: string;
		submitLabel?: string;
		cancelHref?: string;
		/** Initial values (edit mode). Empty in create mode. */
		values?: ClientFields;
		/** Validation errors keyed by field name, plus optional `form`-level message. */
		errors?: Record<string, string | undefined> & { form?: string };
	};

	let { action = '', submitLabel = 'Gem', cancelHref, values = {}, errors = {} }: Props = $props();

	function initialValues(): ClientFields {
		return { ...values };
	}

	let formValues = $state<ClientFields>(initialValues());
	const cvrLookup = createCvrLookup();

	async function lookupClient() {
		const result = await cvrLookup.lookup(formValues.cvr ?? '');
		if (!result) return;
		formValues.name = result.name;
		formValues.address = [result.address, result.zipcode, result.city].filter(Boolean).join(', ');
	}

	const fields: {
		name: keyof ClientFields;
		label: string;
		type: string;
		required?: boolean;
		placeholder?: string;
		autocomplete?: 'off' | 'organization' | 'street-address' | 'email';
	}[] = [
		{
			name: 'name',
			label: 'Navn',
			type: 'text',
			required: true,
			placeholder: 'Acme ApS',
			autocomplete: 'organization'
		},
		{ name: 'cvr', label: 'CVR-nummer', type: 'text', placeholder: '12345678' },
		{
			name: 'address',
			label: 'Adresse',
			type: 'text',
			placeholder: 'Vejnavn 1, 1234 By',
			autocomplete: 'street-address'
		},
		{
			name: 'email',
			label: 'E-mail',
			type: 'email',
			placeholder: 'faktura@acme.dk',
			autocomplete: 'email'
		}
	];
</script>

<form method="POST" {action} class="space-y-5">
	{#if errors.form}
		<p class="text-destructive text-sm font-medium" role="alert">{errors.form}</p>
	{/if}

	{#each fields as field (field.name)}
		<label class="block space-y-1.5">
			<span class="text-foreground text-sm font-medium">
				{field.label}
				{#if field.required}<span class="text-destructive">*</span>{/if}
			</span>
			<div class="flex gap-2">
				<input
					type={field.type}
					name={field.name}
					bind:value={formValues[field.name]}
					placeholder={field.placeholder}
					autocomplete={field.autocomplete ?? 'off'}
					inputmode={field.name === 'cvr' ? 'numeric' : undefined}
					class="border-border bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 min-w-0 flex-1 rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
				/>
				{#if field.name === 'cvr'}
					<Button
						type="button"
						variant="outline"
						onclick={lookupClient}
						disabled={cvrLookup.loading || !validateCvr(formValues.cvr ?? '')}
					>
						{#if cvrLookup.loading}
							<LoaderCircle size={15} class="animate-spin" />
						{:else}
							<Search size={15} />
						{/if}
						Slå op
					</Button>
				{/if}
			</div>
			{#if errors[field.name]}
				<span class="text-destructive text-xs">{errors[field.name]}</span>
			{/if}
			{#if field.name === 'cvr' && cvrLookup.error}
				<span class="text-destructive text-xs">{cvrLookup.error}</span>
			{:else if field.name === 'cvr' && cvrLookup.result}
				<span class="text-muted-foreground inline-flex items-center gap-1 text-xs">
					<Check size={12} /> Udfyldt fra CVR-registret
				</span>
			{/if}
		</label>
	{/each}

	<div class="flex items-center gap-2 pt-2">
		<Button type="submit">{submitLabel}</Button>
		{#if cancelHref}
			<Button variant="ghost" href={cancelHref}>Annuller</Button>
		{/if}
	</div>
</form>

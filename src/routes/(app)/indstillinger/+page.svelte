<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Check, LoaderCircle, Search } from '@lucide/svelte';
	import { createCvrLookup } from '$lib/invoice/useCvrLookup.svelte';
	import { validateCvr } from '$lib/invoice/validation';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	function initialValues() {
		return {
			name: form?.values?.name ?? data.profile?.name ?? '',
			cvr: form?.values?.cvr ?? data.profile?.cvr ?? '',
			address: form?.values?.address ?? data.profile?.address ?? '',
			regNr: form?.values?.regNr ?? data.profile?.regNr ?? '',
			kontonr: form?.values?.kontonr ?? data.profile?.kontonr ?? '',
			mobilepay: form?.values?.mobilepay ?? data.profile?.mobilepay ?? '',
			brandColor: form?.values?.brandColor ?? data.profile?.brandColor ?? '#000000'
		};
	}

	let values = $state(initialValues());
	const errors = $derived((form?.errors ?? {}) as Record<string, string>);
	const cvrLookup = createCvrLookup();

	async function lookupBusiness() {
		const result = await cvrLookup.lookup(values.cvr);
		if (!result) return;
		values.name = result.name;
		values.address = [result.address, [result.zipcode, result.city].filter(Boolean).join(' ')]
			.filter(Boolean)
			.join('\n');
	}
</script>

<svelte:head>
	<title>Virksomhedsindstillinger | skabelontilfaktura.dk</title>
</svelte:head>

<div class="mx-auto max-w-2xl px-4 py-8">
	<header class="mb-8">
		<p class="text-accent text-sm font-medium">Virksomhedsprofil</p>
		<h1 class="mt-1 text-3xl font-semibold">Indstillinger</h1>
		<p class="text-muted-foreground mt-2 text-sm">
			Oplysningerne bruges som sælger på nye fakturaer og i din regnskabseksport.
		</p>
	</header>

	{#if form?.success}
		<div class="bg-accent/15 text-foreground mb-6 rounded-md px-4 py-3 text-sm" role="status">
			Dine virksomhedsoplysninger er gemt.
		</div>
	{/if}

	<form method="POST" class="space-y-8">
		<section class="border-border space-y-5 rounded-lg border p-5">
			<div>
				<h2 class="font-semibold">Virksomhed</h2>
				<p class="text-muted-foreground text-sm">De lovpligtige sælgeroplysninger.</p>
			</div>

			<label class="block space-y-1.5">
				<span class="text-sm font-medium">Virksomhedsnavn *</span>
				<input
					name="name"
					required
					bind:value={values.name}
					class="border-input bg-background h-10 w-full rounded-md border px-3 text-sm"
				/>
				{#if errors.name}<span class="text-destructive text-xs">{errors.name}</span>{/if}
			</label>

			<div class="grid gap-4 sm:grid-cols-2">
				<div class="block space-y-1.5">
					<span class="text-sm font-medium">CVR</span>
					<div class="flex gap-2">
						<input
							name="cvr"
							inputmode="numeric"
							bind:value={values.cvr}
							class="border-input bg-background h-10 min-w-0 flex-1 rounded-md border px-3 text-sm"
						/>
						<Button
							type="button"
							variant="outline"
							onclick={lookupBusiness}
							disabled={cvrLookup.loading || !validateCvr(values.cvr)}
						>
							{#if cvrLookup.loading}
								<LoaderCircle size={15} class="animate-spin" />
							{:else}
								<Search size={15} />
							{/if}
							Slå op
						</Button>
					</div>
					{#if errors.cvr}<span class="text-destructive text-xs">{errors.cvr}</span>{/if}
					{#if cvrLookup.error}
						<span class="text-destructive text-xs">{cvrLookup.error}</span>
					{:else if cvrLookup.result}
						<span class="text-muted-foreground inline-flex items-center gap-1 text-xs">
							<Check size={12} /> Udfyldt fra CVR-registret
						</span>
					{/if}
				</div>

				<label class="block space-y-1.5">
					<span class="text-sm font-medium">Brandfarve</span>
					<div class="flex items-center gap-2">
						<input
							name="brandColor"
							type="color"
							bind:value={values.brandColor}
							class="border-input bg-background h-10 w-14 rounded-md border p-1"
						/>
						<span class="text-muted-foreground text-sm">{values.brandColor}</span>
					</div>
					{#if errors.brandColor}
						<span class="text-destructive text-xs">{errors.brandColor}</span>
					{/if}
				</label>
			</div>

			<label class="block space-y-1.5">
				<span class="text-sm font-medium">Adresse</span>
				<textarea
					name="address"
					rows="3"
					bind:value={values.address}
					class="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
					placeholder="Gade 1&#10;1000 København K"></textarea>
			</label>
		</section>

		<section class="border-border space-y-5 rounded-lg border p-5">
			<div>
				<h2 class="font-semibold">Betaling</h2>
				<p class="text-muted-foreground text-sm">Vises på fakturaens betalingsafsnit.</p>
			</div>

			<div class="grid gap-4 sm:grid-cols-2">
				<label class="block space-y-1.5">
					<span class="text-sm font-medium">Reg.nr.</span>
					<input
						name="regNr"
						inputmode="numeric"
						bind:value={values.regNr}
						class="border-input bg-background h-10 w-full rounded-md border px-3 text-sm"
					/>
					{#if errors.regNr}<span class="text-destructive text-xs">{errors.regNr}</span>{/if}
				</label>

				<label class="block space-y-1.5">
					<span class="text-sm font-medium">Kontonr.</span>
					<input
						name="kontonr"
						inputmode="numeric"
						bind:value={values.kontonr}
						class="border-input bg-background h-10 w-full rounded-md border px-3 text-sm"
					/>
					{#if errors.kontonr}
						<span class="text-destructive text-xs">{errors.kontonr}</span>
					{/if}
				</label>
			</div>

			<label class="block space-y-1.5">
				<span class="text-sm font-medium">MobilePay</span>
				<input
					name="mobilepay"
					inputmode="tel"
					bind:value={values.mobilepay}
					class="border-input bg-background h-10 w-full rounded-md border px-3 text-sm"
				/>
				{#if errors.mobilepay}
					<span class="text-destructive text-xs">{errors.mobilepay}</span>
				{/if}
			</label>
		</section>

		<div class="flex items-center justify-between gap-4">
			<Button variant="outline" href="/generator/">Tilbage til generator</Button>
			<Button type="submit">Gem indstillinger</Button>
		</div>
	</form>
</div>

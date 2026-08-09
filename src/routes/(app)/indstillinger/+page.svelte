<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const values = $derived({
		name: form?.values?.name ?? data.profile?.name ?? '',
		cvr: form?.values?.cvr ?? data.profile?.cvr ?? '',
		address: form?.values?.address ?? data.profile?.address ?? '',
		regNr: form?.values?.regNr ?? data.profile?.regNr ?? '',
		kontonr: form?.values?.kontonr ?? data.profile?.kontonr ?? '',
		mobilepay: form?.values?.mobilepay ?? data.profile?.mobilepay ?? '',
		brandColor: form?.values?.brandColor ?? data.profile?.brandColor ?? '#000000'
	});
	const errors = $derived((form?.errors ?? {}) as Record<string, string>);
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
					value={values.name}
					class="border-input bg-background h-10 w-full rounded-md border px-3 text-sm"
				/>
				{#if errors.name}<span class="text-destructive text-xs">{errors.name}</span>{/if}
			</label>

			<div class="grid gap-4 sm:grid-cols-2">
				<label class="block space-y-1.5">
					<span class="text-sm font-medium">CVR</span>
					<input
						name="cvr"
						inputmode="numeric"
						value={values.cvr}
						class="border-input bg-background h-10 w-full rounded-md border px-3 text-sm"
					/>
					{#if errors.cvr}<span class="text-destructive text-xs">{errors.cvr}</span>{/if}
				</label>

				<label class="block space-y-1.5">
					<span class="text-sm font-medium">Brandfarve</span>
					<div class="flex items-center gap-2">
						<input
							name="brandColor"
							type="color"
							value={values.brandColor}
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
					class="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
					placeholder="Gade 1&#10;1000 København K">{values.address}</textarea
				>
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
						value={values.regNr}
						class="border-input bg-background h-10 w-full rounded-md border px-3 text-sm"
					/>
					{#if errors.regNr}<span class="text-destructive text-xs">{errors.regNr}</span>{/if}
				</label>

				<label class="block space-y-1.5">
					<span class="text-sm font-medium">Kontonr.</span>
					<input
						name="kontonr"
						inputmode="numeric"
						value={values.kontonr}
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
					value={values.mobilepay}
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

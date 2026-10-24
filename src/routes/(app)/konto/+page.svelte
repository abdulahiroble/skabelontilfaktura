<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { KIT } from '$lib/billing/kit';
	import type { PageData, ActionData } from './$types';
	let { data, form }: { data: PageData; form: ActionData } = $props();
	let portalError = $state('');
	let portalLoading = $state(false);
	const legacy = $derived(!!data.entitlements && data.entitlements.plan !== 'free');
	async function openPortal() {
		portalLoading = true;
		portalError = '';
		try {
			const response = await fetch('/api/billing/portal', { method: 'POST' });
			const result = (await response.json()) as { url?: string };
			if (!response.ok || !result.url) throw new Error();
			window.location.href = result.url;
		} catch {
			portalError = 'Abonnementssiden kunne ikke åbnes. Prøv igen senere.';
		} finally {
			portalLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Mine downloads | skabelontilfaktura.dk</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="mx-auto max-w-3xl space-y-8 px-4 py-12 sm:px-6">
	<header class="space-y-3">
		<p class="text-muted-foreground text-sm">Min konto</p>
		<h1 class="text-3xl font-semibold">Dine downloads</h1>
		<p>Din gratis fakturagenerator kræver ikke et køb. Her finder du din købte Fakturapakke.</p>
	</header>
	<section class="border-border bg-card space-y-4 rounded-xl border p-6">
		<h2 class="text-2xl font-semibold">{KIT.name}</h2>
		<p>{KIT.fileCount} filer til download. Engangskøb — intet abonnement eller cloud-arkiv.</p>
		{#if data.unavailable}
			<p role="alert">Dine køb kan ikke vises lige nu. Prøv igen senere; køb ikke pakken igen.</p>
		{:else if data.kit?.owned}
			<p>Købet er bekræftet. Du kan hente pakken igen fra denne konto.</p>
			<Button href={KIT.downloadUrl}>Hent Fakturapakken (.zip)</Button>
		{:else if data.kit?.status === 'refunded'}
			<p>Købet er refunderet. Downloadadgangen er lukket.</p>
		{:else if data.kit?.status === 'review'}
			<p role="alert">Købet kræver kontrol. Kontakt {KIT.supportEmail}; køb ikke igen.</p>
		{:else if data.checkoutReturned}
			<p role="status">
				Vi afventer betalingsbekræftelsen. En retur fra betalingssiden er ikke i sig selv en
				kvittering.
			</p>
		{:else}
			<p>Ingen bekræftet Fakturapakke på denne konto.</p>
			<a class="underline" href="/pris/">Se Fakturapakken — 99 kr. inkl. moms</a>
		{/if}
		<form method="POST" action="?/recover">
			<Button type="submit" variant="outline">Kontrollér betaling / gendan download</Button>
		</form>
		{#if form?.message}<p role="status">{form.message}</p>{/if}
		<p class="text-muted-foreground text-sm">
			Har du betalt uden at få adgang? Kontrollér betalingen her. Der oprettes ikke et nyt køb. Brug
			samme e-mail og konto som ved købet.
		</p>
	</section>
	{#if legacy}
		<section class="border-border space-y-4 rounded-xl border p-6">
			<h2 class="text-xl font-semibold">Din eksisterende cloud-adgang</h2>
			<p>Eksisterende rettigheder er bevaret. Fakturapakken ændrer ikke din tidligere aftale.</p>
			<nav class="flex flex-wrap gap-4">
				<a class="underline" href="/faktura/">Fakturaer</a>
				<a class="underline" href="/kunder/">Kunder</a>
				<a class="underline" href="/eksport/">Eksport</a>
				<a class="underline" href="/indstillinger/">Indstillinger</a>
			</nav>
			{#if data.entitlements?.plan !== 'lifetime_pro'}
				<Button variant="outline" onclick={openPortal} disabled={portalLoading}
					>Administrer eksisterende abonnement</Button
				>
			{/if}
			{#if portalError}<p role="alert">{portalError}</p>{/if}
		</section>
	{/if}
	<p>
		<a class="underline" href="/generator/">Til gratis generator</a> ·
		<a class="underline" href="/adgang/">Glemt adgangskode?</a>
	</p>
</div>

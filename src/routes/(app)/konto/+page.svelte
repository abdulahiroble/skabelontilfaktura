<script lang="ts">
	import {
		Archive,
		ArrowRight,
		BookOpen,
		Building2,
		Download,
		FilePlus2,
		FolderClock,
		ReceiptText,
		Users
	} from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import { formatDanishDate, formatMoney } from '$lib/utils';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let portalLoading = $state(false);
	let portalError = $state('');

	const isPaid = $derived(data.entitlements?.plan !== 'free' && !!data.entitlements);
	const planLabel = $derived(
		data.entitlements?.plan === 'business'
			? 'Business'
			: data.entitlements?.plan === 'pro_annual'
				? 'Pro årlig'
				: data.entitlements?.plan === 'lifetime_pro'
					? 'Livstids-Pro'
					: data.entitlements?.plan === 'pro'
						? 'Pro'
						: 'Gratis'
	);

	async function openBillingPortal() {
		if (portalLoading) return;
		portalLoading = true;
		portalError = '';
		try {
			const response = await fetch('/api/billing/portal', { method: 'POST' });
			const payload = (await response.json().catch(() => null)) as {
				url?: string;
				error?: string;
			} | null;
			if (!response.ok || !payload?.url) {
				portalError = payload?.error ?? 'Abonnementssiden kunne ikke åbnes.';
				return;
			}
			window.location.href = payload.url;
		} catch {
			portalError =
				'Forbindelsen til abonnementssiden fejlede. Kontrollér forbindelsen og prøv igen.';
		} finally {
			portalLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Min konto | skabelontilfaktura.dk</title>
</svelte:head>

<div class="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
	<header class="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
		<div>
			<p class="text-accent text-sm font-medium">Min konto</p>
			<h1 class="mt-1 text-3xl font-semibold sm:text-4xl">Dit fakturaoverblik</h1>
			<p class="text-muted-foreground mt-2 max-w-2xl text-sm sm:text-base">
				Her finder du tidligere fakturaer, klienter, eksport, rykkere og virksomhedsoplysninger.
			</p>
		</div>
		<Button href="/generator/">
			<FilePlus2 size={16} />
			Opret ny faktura
		</Button>
	</header>

	<section class="mt-8 grid gap-4 sm:grid-cols-3">
		<div class="border-border bg-card rounded-xl border p-5">
			<p class="text-muted-foreground text-xs font-medium tracking-wide uppercase">Abonnement</p>
			<p class="mt-2 text-2xl font-semibold">{planLabel}</p>
			{#if isPaid && data.entitlements?.plan !== 'lifetime_pro'}
				<button
					type="button"
					class="text-primary mt-3 text-sm font-medium hover:underline"
					onclick={openBillingPortal}
					disabled={portalLoading}
				>
					{portalLoading ? 'Åbner…' : 'Administrer abonnement'}
				</button>
			{:else if !isPaid}
				<a href="/pris/" class="text-primary mt-3 inline-block text-sm font-medium hover:underline">
					Se Pro
				</a>
			{/if}
		</div>
		<div class="border-border bg-card rounded-xl border p-5">
			<p class="text-muted-foreground text-xs font-medium tracking-wide uppercase">
				Cloud-fakturaer
			</p>
			<p class="mt-2 text-2xl font-semibold">{data.invoiceCount}</p>
			<p class="text-muted-foreground mt-2 text-sm">
				{isPaid ? 'Seneste fakturaer vises nedenfor.' : 'Aktivér Pro for cloud-arkiv.'}
			</p>
		</div>
		<div class="border-border bg-card rounded-xl border p-5">
			<p class="text-muted-foreground text-xs font-medium tracking-wide uppercase">Virksomhed</p>
			<p class="mt-2 truncate text-lg font-semibold">{data.business?.name ?? 'Ikke opsat'}</p>
			<a
				href="/indstillinger/"
				class="text-primary mt-3 inline-block text-sm font-medium hover:underline"
			>
				{data.business ? 'Rediger oplysninger' : 'Opret virksomhedsprofil'}
			</a>
		</div>
	</section>

	{#if portalError}
		<p
			class="border-destructive/30 bg-destructive/10 text-destructive mt-5 rounded-lg border px-4 py-3 text-sm"
			role="alert"
		>
			{portalError}
		</p>
	{/if}

	<section class="mt-8">
		<div class="mb-4 flex items-end justify-between gap-4">
			<div>
				<h2 class="text-2xl font-semibold">Værktøjer</h2>
				<p class="text-muted-foreground mt-1 text-sm">
					Hvert Pro-værktøj har en fast plads, så du altid kan finde det igen.
				</p>
			</div>
		</div>
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			<a
				href={isPaid ? '/faktura/' : '/pris/'}
				class="border-border bg-card hover:border-primary/40 group rounded-xl border p-5 transition-colors"
			>
				<Archive size={20} class="text-primary" />
				<h3 class="mt-4 font-semibold">Fakturahistorik</h3>
				<p class="text-muted-foreground mt-1 text-sm">
					Find cloud-gemte fakturaer, PDF’er, beløb og betalingsstatus.
				</p>
			</a>
			<a
				href={isPaid ? '/kunder/' : '/pris/'}
				class="border-border bg-card hover:border-primary/40 rounded-xl border p-5 transition-colors"
			>
				<Users size={20} class="text-primary" />
				<h3 class="mt-4 font-semibold">Klientdatabase</h3>
				<p class="text-muted-foreground mt-1 text-sm">
					Gem kunder og vælg dem direkte i fakturageneratoren.
				</p>
			</a>
			<a
				href={isPaid ? '/eksport/' : '/pris/'}
				class="border-border bg-card hover:border-primary/40 rounded-xl border p-5 transition-colors"
			>
				<Download size={20} class="text-primary" />
				<h3 class="mt-4 font-semibold">SAF-T og CSV</h3>
				<p class="text-muted-foreground mt-1 text-sm">
					Eksporter sendte og betalte fakturaer for den valgte periode.
				</p>
			</a>
			<a
				href={isPaid ? '/faktura/' : '/pris/'}
				class="border-border bg-card hover:border-primary/40 rounded-xl border p-5 transition-colors"
			>
				<FolderClock size={20} class="text-primary" />
				<h3 class="mt-4 font-semibold">Rykkermails</h3>
				<p class="text-muted-foreground mt-1 text-sm">
					Sæt fakturaen til Sendt. Efter forfald kan næste rykkertrin sendes fra fakturasiden.
				</p>
			</a>
			<a
				href="/generator/"
				class="border-border bg-card hover:border-primary/40 rounded-xl border p-5 transition-colors"
			>
				<ReceiptText size={20} class="text-primary" />
				<h3 class="mt-4 font-semibold">Automatisk nummerering</h3>
				<p class="text-muted-foreground mt-1 text-sm">
					Nummeret reserveres på tværs af enheder, når du vælger Gem i cloud.
				</p>
			</a>
			<a
				href="/indstillinger/"
				class="border-border bg-card hover:border-primary/40 rounded-xl border p-5 transition-colors"
			>
				<Building2 size={20} class="text-primary" />
				<h3 class="mt-4 font-semibold">Virksomhedsprofil</h3>
				<p class="text-muted-foreground mt-1 text-sm">
					Gem CVR, adresse, bankoplysninger, MobilePay og brandfarve.
				</p>
			</a>
		</div>
	</section>

	<section class="border-border bg-card mt-8 rounded-xl border">
		<div class="flex items-center justify-between border-b px-5 py-4">
			<div>
				<h2 class="font-semibold">Seneste fakturaer</h2>
				<p class="text-muted-foreground text-sm">
					{isPaid ? 'De fem seneste cloud-fakturaer.' : 'Kræver Pro.'}
				</p>
			</div>
			{#if isPaid}
				<a href="/faktura/" class="text-primary inline-flex items-center gap-1 text-sm font-medium">
					Se alle <ArrowRight size={14} />
				</a>
			{/if}
		</div>
		{#if !isPaid}
			<div class="p-6 text-center">
				<BookOpen size={24} class="text-muted-foreground mx-auto" />
				<p class="mt-3 font-medium">Fakturahistorik er en Pro-funktion</p>
				<Button href="/pris/" class="mt-4">Se priser</Button>
			</div>
		{:else if data.invoices.length === 0}
			<div class="p-6 text-center">
				<p class="font-medium">Ingen cloud-fakturaer endnu</p>
				<p class="text-muted-foreground mt-1 text-sm">Opret en faktura og vælg Gem i cloud.</p>
			</div>
		{:else}
			<div class="divide-border divide-y">
				{#each data.invoices as invoice (invoice.id)}
					<a
						href={`/faktura/${invoice.id}/`}
						class="hover:bg-muted/40 flex items-center justify-between gap-4 px-5 py-4 transition-colors"
					>
						<div class="min-w-0">
							<p class="font-medium">{invoice.invoiceNumber}</p>
							<p class="text-muted-foreground truncate text-sm">
								{invoice.buyerName ?? 'Ingen kunde'} · {formatDanishDate(invoice.issuedAt)}
							</p>
						</div>
						<p class="shrink-0 font-medium">
							{formatMoney(invoice.total, invoice.currency)}
						</p>
					</a>
				{/each}
			</div>
		{/if}
	</section>
</div>

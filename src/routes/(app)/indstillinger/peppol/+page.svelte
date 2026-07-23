<script lang="ts">
	/**
	 * Peppol settings page (Business-tier).
	 *
	 * Informational page describing the Peppol e-invoicing integration status.
	 * Until an Access Point partner is configured the integration is inactive —
	 * the page surfaces this clearly and lists the available partners plus the
	 * official EAS code reference.
	 *
	 * Actual Business-tier entitlement gating is enforced by the entitlement
	 * system (separate task); this page renders the same content for any signed
	 * in user that reaches it.
	 */
	import { Button } from '$lib/components/ui/button';
	import { CheckCircle2, AlertCircle, Building2, Zap, Settings } from '@lucide/svelte';

	// Integration is not yet wired to a real Access Point — see createPeppolAdapter.
	const configured = false;

	// Certified Peppol Access Point partners we plan to support. Order is the
	// order they appear in the UI; the first one (Storecove) is the default
	// recommendation for Danish SMBs.
	const accessPoints = [
		{
			name: 'Storecove',
			description: 'API-først Access Point. God til integrationer og automatisering.',
			url: 'https://storecove.com'
		},
		{
			name: 'Pagero',
			description: 'Stort nordisk netværk med mange store virksomheder og det offentlige.',
			url: 'https://pagero.com'
		},
		{
			name: 'Tradeshift',
			description: 'Cloud-platform med stærk tilstedeværelse i Danmark (NemHandel).',
			url: 'https://tradeshift.com'
		}
	];

	// Peppol EAS (Electronic Address Scheme) code reference. Subset of the
	// official OpenPeppol registry covering our launch markets.
	const easCodes = [
		{
			code: '0184',
			scheme: 'DK CVR',
			example: '12345678',
			note: 'Det Centrale Virksomhedsregister'
		},
		{
			code: '9901',
			scheme: 'DK EAN/GLN',
			example: '5790000000001',
			note: 'Offentlige institutioner'
		},
		{
			code: '0007',
			scheme: 'SE org.nr.',
			example: '5565774403',
			note: 'Svensk organisationsnummer'
		},
		{ code: '9908', scheme: 'NO org.nr.', example: '923609016', note: 'Norsk organisationsnummer' },
		{ code: '9930', scheme: 'DE VAT', example: 'DE123456789', note: 'Tysk momsnummer' },
		{ code: '0106', scheme: 'NL VAT', example: 'NL123456789B01', note: 'Hollandsk momsnummer' }
	];
</script>

<svelte:head>
	<title>Peppol | skabelontilfaktura.dk</title>
</svelte:head>

<div class="mx-auto max-w-3xl px-4 py-8">
	<header class="mb-6">
		<h1 class="text-2xl font-bold">Peppol</h1>
		<p class="text-muted-foreground text-sm">
			Send fakturaer elektronisk via Peppol-netværket — standarden for e-fakturering i Danmark
			(NemHandel) og resten af EU.
		</p>
	</header>

	<!-- Status -->
	<section class="border-border mb-6 rounded-lg border p-5">
		<div class="flex items-start gap-3">
			{#if configured}
				<CheckCircle2 class="mt-0.5 text-green-600" size={20} />
			{:else}
				<AlertCircle class="mt-0.5 text-amber-600" size={20} />
			{/if}
			<div class="flex-1">
				<h2 class="text-sm font-semibold">Integrationsstatus</h2>
				{#if configured}
					<p class="text-muted-foreground text-sm">
						Peppol er aktivt. Fakturaer kan sendes direkte til modtagerens Access Point.
					</p>
				{:else}
					<p class="text-muted-foreground text-sm">
						Ikke konfigureret. Vælg en Access Point-partner herunder for at aktivere elektronisk
						afsendelse.
					</p>
				{/if}
			</div>
		</div>
	</section>

	<!-- Access Point partners -->
	<section class="mb-6">
		<div class="mb-3 flex items-center gap-2">
			<Building2 size={18} />
			<h2 class="text-sm font-semibold">Access Point-partnere</h2>
		</div>
		<p class="text-muted-foreground mb-4 text-sm">
			Peppol fakturaer sendes via en certificeret Access Point. Vælg den partner der passer bedst
			til din virksomhed.
		</p>

		<div class="grid gap-4">
			{#each accessPoints as ap (ap.name)}
				<div class="border-border flex items-start justify-between gap-4 rounded-lg border p-4">
					<div class="min-w-0">
						<div class="flex items-center gap-2">
							<h3 class="text-sm font-semibold">{ap.name}</h3>
							{#if ap.name === 'Storecove'}
								<span
									class="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[11px] font-medium"
								>
									Anbefalet
								</span>
							{/if}
						</div>
						<p class="text-muted-foreground mt-1 text-sm">{ap.description}</p>
						<a
							href={ap.url}
							target="_blank"
							rel="noopener noreferrer"
							class="text-primary mt-2 inline-block text-xs underline-offset-2 hover:underline"
						>
							{ap.url}
						</a>
					</div>
					<Button variant="outline" size="sm" disabled={!configured}>
						<Settings size={14} />
						Konfigurer
					</Button>
				</div>
			{/each}
		</div>
	</section>

	<!-- EAS code reference -->
	<section class="border-border mb-6 rounded-lg border p-5">
		<div class="mb-3 flex items-center gap-2">
			<Zap size={18} />
			<h2 class="text-sm font-semibold">EAS-koder (modtageridentifikation)</h2>
		</div>
		<p class="text-muted-foreground mb-4 text-sm">
			En Peppol-modtager identificeres via en EAS-kode og et tilhørende nummer. Tabellen viser de
			koder, vi understøtter.
		</p>

		<div class="overflow-x-auto">
			<table class="w-full text-left text-sm">
				<thead>
					<tr class="text-muted-foreground border-b text-xs">
						<th class="py-2 pr-4 font-medium">Kode</th>
						<th class="py-2 pr-4 font-medium">Skema</th>
						<th class="py-2 pr-4 font-medium">Eksempel</th>
						<th class="py-2 font-medium">Beskrivelse</th>
					</tr>
				</thead>
				<tbody>
					{#each easCodes as entry (entry.code)}
						<tr class="border-border border-b last:border-0">
							<td class="py-2 pr-4 font-mono">{entry.code}</td>
							<td class="py-2 pr-4">{entry.scheme}</td>
							<td class="text-muted-foreground py-2 pr-4 font-mono">{entry.example}</td>
							<td class="text-muted-foreground py-2">{entry.note}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>

	<p class="text-muted-foreground text-xs">
		Peppol-integrationen er pt. en stub. Når en Access Point-partner er valgt og konfigureret, vil
		opslag og afsendelse ske direkte herfra — uden ændringer i dine fakturaer.
	</p>
</div>

<script lang="ts">
	import { Button } from '$lib/components/ui/button';

	/**
	 * Affiliate call-to-action component.
	 *
	 * Renders one of three variants (`card`, `inline`, `banner`) promoting a
	 * partner product or service. Every variant includes the affiliate
	 * disclosure so compliance is guaranteed at the call-site regardless of
	 * which variant is chosen.
	 */

	type Partner = 'dinero' | 'billy' | 'econmic' | 'revisor' | 'insurance';
	type Variant = 'card' | 'inline' | 'banner';

	interface PartnerConfig {
		name: string;
		/** Destination URL. External (http) links open in a new tab. */
		url: string;
		cta: string;
		defaultTitle: string;
		defaultDesc: string;
		/** Emoji glyph shown in the card variant. */
		icon: string;
	}

	interface Props {
		partner: Partner;
		variant?: Variant;
		title?: string;
		description?: string;
	}

	let { partner, variant = 'card', title, description }: Props = $props();

	const partnerConfig: Record<Partner, PartnerConfig> = {
		dinero: {
			name: 'Dinero',
			// Replace with actual affiliate link
			url: 'https://dinero.dk',
			cta: 'Gå til Dinero',
			defaultTitle: 'Brug for et rigtigt regnskabsprogram?',
			defaultDesc: 'Dinero er Danmarks mest populære regnskabsprogram til små virksomheder.',
			icon: '📊'
		},
		billy: {
			name: 'Billy',
			url: 'https://billy.dk',
			cta: 'Gå til Billy',
			defaultTitle: 'Klar til fuldt regnskab?',
			defaultDesc: 'Billy giver dig bogføring, fakturering og momsindberetning i ét system.',
			icon: '📘'
		},
		econmic: {
			name: 'e-conomic',
			url: 'https://e-conomic.dk',
			cta: 'Gå til e-conomic',
			defaultTitle: 'Større virksomhed?',
			defaultDesc: 'e-conomic er markedsførende inden for online regnskab til vækstvirksomheder.',
			icon: '📈'
		},
		revisor: {
			name: 'Få en revisor',
			url: '/revisor',
			cta: 'Find en revisor',
			defaultTitle: 'Brug for hjælp fra en revisor?',
			defaultDesc: 'Vi kan sætte dig i kontakt med kvalificerede revisorer i dit område.',
			icon: '👤'
		},
		insurance: {
			name: 'Erhvervsansvarsforsikring',
			url: '/forsikring',
			cta: 'Læs mere',
			defaultTitle: 'Beskyt din virksomhed',
			defaultDesc: 'Erhvervsansvarsforsikring til selvstændige fra 150 DKK/måned.',
			icon: '🛡️'
		}
	};

	const config = $derived(partnerConfig[partner]);
	const resolvedTitle = $derived(title ?? config.defaultTitle);
	const resolvedDesc = $derived(description ?? config.defaultDesc);
	const isExternal = $derived(/^https?:\/\//i.test(config.url));

	const DISCLOSURE = 'Vi kan modtage provision hvis du klikker på disse links.';

	function trackClick() {
		// Track via Plausible custom event
		if (typeof window !== 'undefined' && typeof window.plausible === 'function') {
			window.plausible('Affiliate Click', { props: { partner } });
		}
	}
</script>

{#if variant === 'card'}
	<div class="border-border bg-card rounded-xl border p-6">
		<div class="flex items-start gap-4">
			<div
				class="bg-primary/10 text-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-xl"
			>
				<span aria-hidden="true">{config.icon}</span>
			</div>
			<div class="flex-1">
				<h3 class="font-semibold">{resolvedTitle}</h3>
				<p class="text-muted-foreground mt-1 text-sm">{resolvedDesc}</p>
			</div>
		</div>
		<div class="mt-4">
			<Button
				href={config.url}
				{...isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {}}
				onclick={trackClick}>{config.cta}</Button
			>
		</div>
		<p class="text-muted-foreground mt-3 text-xs">{DISCLOSURE}</p>
	</div>
{:else if variant === 'inline'}
	<div class="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
		<span aria-hidden="true">{config.icon}</span>
		<span class="text-foreground font-medium">{resolvedTitle}</span>
		<Button
			variant="link"
			class="h-auto px-1"
			href={config.url}
			{...isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {}}
			onclick={trackClick}>{config.cta}</Button
		>
		<span class="text-xs">· {DISCLOSURE}</span>
	</div>
{:else}
	<!-- variant === 'banner' -->
	<div
		class="bg-primary text-primary-foreground flex flex-col items-start justify-between gap-4 rounded-xl p-6 sm:flex-row sm:items-center"
	>
		<div class="flex-1">
			<h3 class="font-semibold">{resolvedTitle}</h3>
			<p class="mt-1 text-sm opacity-90">{resolvedDesc}</p>
			<p class="mt-2 text-xs opacity-75">{DISCLOSURE}</p>
		</div>
		<Button
			variant="secondary"
			href={config.url}
			{...isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {}}
			onclick={trackClick}>{config.cta}</Button
		>
	</div>
{/if}

<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		CONSENT_GRANTED,
		CONSENT_STORAGE_KEY,
		type ConsentChoice,
		updateConsent
	} from '$lib/analytics';
	import { cn } from '$lib/utils';

	let { class: className }: { class?: string } = $props();

	let visible = $state(false);
	let showPreferences = $state(false);

	/** Re-hydrate Consent Mode from a persisted choice on mount. */
	$effect(() => {
		if (typeof window === 'undefined') return;
		try {
			const stored = window.localStorage.getItem(CONSENT_STORAGE_KEY);
			if (stored === 'accepted') {
				updateConsent({ ...CONSENT_GRANTED });
			} else if (stored === 'rejected') {
				// Defaults already denied — nothing to update.
			} else {
				visible = true;
			}
		} catch {
			// localStorage unavailable (e.g. privacy mode) — show the banner.
			visible = true;
		}
	});

	function persist(choice: ConsentChoice): void {
		try {
			window.localStorage.setItem(CONSENT_STORAGE_KEY, choice);
		} catch {
			// Ignore write failures (private mode, quota, etc.).
		}
		if (choice === 'accepted') {
			updateConsent({ ...CONSENT_GRANTED });
		}
		// On reject the default-denied values stay in place.
		visible = false;
		showPreferences = false;
	}

	function acceptAll(): void {
		persist('accepted');
	}

	function rejectAll(): void {
		persist('rejected');
	}

	function togglePreferences(): void {
		showPreferences = !showPreferences;
	}
</script>

{#if visible}
	<div
		class={cn(
			'bg-background border-border fixed inset-x-0 bottom-0 z-[60] border-t shadow-lg',
			className
		)}
		role="dialog"
		aria-modal="false"
		aria-label="Samtykke til cookies"
	>
		<div class="mx-auto max-w-6xl px-4 py-4">
			<div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
				<div class="space-y-1 text-sm">
					<p class="text-foreground font-medium">Vi respekterer dit privatliv</p>
					<p class="text-muted-foreground">
						Vi bruger Plausible Analytics, som er cookie-frit og ikke sporer dig på tværs af sider.
						Læs mere i vores
						<a href="/privatlivspolitik/" class="text-primary underline-offset-2 hover:underline"
							>privatlivspolitik</a
						>.
					</p>
				</div>
				<div class="flex flex-wrap items-center gap-2">
					<Button variant="ghost" size="sm" onclick={togglePreferences}>
						{showPreferences ? 'Skjul valgmuligheder' : 'Tilpas'}
					</Button>
					<Button variant="outline" size="sm" onclick={rejectAll}>Afvis alle</Button>
					<Button size="sm" onclick={acceptAll}>Accepter alle</Button>
				</div>
			</div>

			{#if showPreferences}
				<div class="border-border text-muted-foreground mt-3 border-t pt-3 text-xs">
					<p>
						Plausible Analytics er cookie-frit og GDPR-kompliant som standard, så det indlæses
						uanset dit valg. Markedsførings- og personaliseringskategorier forbliver afvist, med
						mindre du klikker &laquo;Accepter alle&raquo;.
					</p>
				</div>
			{/if}
		</div>
	</div>
{/if}

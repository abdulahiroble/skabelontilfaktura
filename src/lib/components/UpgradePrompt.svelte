<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { X, Sparkles } from '@lucide/svelte';

	/**
	 * Reusable upgrade prompt for free-tier users hitting usage limits.
	 *
	 * Renders a dismissible banner that links to the pricing page. Dismissal is
	 * persisted in `localStorage` under a configurable key (default
	 * `upgrade-prompt-dismissed`) so a user who has already seen it is not
	 * nagged again on every render.
	 *
	 * Uses the shadcn-style theme tokens (bg-card, text-muted-foreground,
	 * border-border, primary) so it matches the rest of the app without custom
	 * colors. Svelte 5 runes throughout (`$props`, `$state`, `$effect`).
	 */

	interface Props {
		/** localStorage key used to remember dismissal. */
		storageKey?: string;
		/** Override the default heading copy. */
		title?: string;
		/** Override the default body copy. */
		description?: string;
		/** CTA label. */
		cta?: string;
		/** Destination for the CTA button. */
		href?: string;
	}

	let {
		storageKey = 'upgrade-prompt-dismissed',
		title = 'Opgrader til Pro',
		description = 'Vil du gemme dine fakturaer automatisk og overholde bogføringslovens opbevaringskrav?',
		cta = 'Se priser',
		href = '/pris/'
	}: Props = $props();

	/**
	 * Whether the prompt should be visible. Initialized false to avoid a
	 * hydration flash; a `$effect` reads `localStorage` on the client and
	 * reveals it unless previously dismissed.
	 */
	let visible = $state(false);

	$effect(() => {
		// Guard for SSR — localStorage is browser-only.
		if (typeof window === 'undefined') return;
		try {
			const dismissed = window.localStorage.getItem(storageKey) === '1';
			visible = !dismissed;
		} catch {
			// localStorage may be unavailable (private mode, etc.) — default to show.
			visible = true;
		}
	});

	function dismiss() {
		visible = false;
		try {
			window.localStorage.setItem(storageKey, '1');
		} catch {
			// Ignore persistence failure; the prompt stays hidden for this session.
		}
		if (typeof window !== 'undefined' && typeof window.plausible === 'function') {
			window.plausible('Upgrade Prompt Dismissed');
		}
	}

	function trackCta() {
		if (typeof window !== 'undefined' && typeof window.plausible === 'function') {
			window.plausible('Upgrade Prompt Clicked');
		}
	}
</script>

{#if visible}
	<div class="border-border bg-card relative rounded-lg border p-4 sm:p-5">
		<button
			type="button"
			onclick={dismiss}
			class="text-muted-foreground hover:text-foreground absolute top-3 right-3 rounded-md p-1 transition-colors"
			aria-label="Luk"
		>
			<X size={16} />
		</button>
		<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
			<div class="flex items-start gap-3 pr-6">
				<div
					class="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-md"
				>
					<Sparkles size={18} />
				</div>
				<div class="min-w-0">
					<h3 class="text-sm font-semibold">{title}</h3>
					<p class="text-muted-foreground mt-0.5 text-sm">{description}</p>
				</div>
			</div>
			<div class="shrink-0">
				<Button {href} onclick={trackCta} size="sm">{cta}</Button>
			</div>
		</div>
	</div>
{/if}

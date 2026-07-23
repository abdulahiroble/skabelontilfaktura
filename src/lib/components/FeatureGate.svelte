<script lang="ts">
	import type { Snippet } from 'svelte';

	/**
	 * Conditionally render children based on feature access.
	 *
	 * Pass a boolean `hasAccess` (typically derived from the page/layout load
	 * data via {@link deserializeEntitlements} + `hasFeature`) and the
	 * corresponding `feature` id for readability/inspector purposes. When
	 * access is granted the default `children` snippet renders; otherwise the
	 * optional `fallback` snippet renders (or nothing).
	 *
	 * The gating decision is made by the caller (server load), so this
	 * component is purely presentational — it does not re-query entitlements.
	 *
	 * @example
	 * ```svelte
	 * <FeatureGate feature="saft_export" hasAccess={canExport}>
	 *   {@render children()}
	 *   {#snippet fallback()}
	 *     <UpgradePrompt />
	 *   {/snippet}
	 * </FeatureGate>
	 * ```
	 */
	interface Props {
		/** Feature id being gated (informational; does not drive the check). */
		feature: string;
		/** Resolved access flag from the server. */
		hasAccess: boolean;
		/** Content shown when access is granted. */
		children: Snippet;
		/** Optional content shown when access is denied. */
		fallback?: Snippet;
	}

	let {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		feature,
		hasAccess,
		children,
		fallback
	}: Props = $props();

	// `feature` is accepted for API clarity and potential future auditing; the
	// gating decision itself is driven by `hasAccess` (resolved on the server).
</script>

{#if hasAccess}
	{@render children()}
{:else if fallback}
	{@render fallback()}
{/if}

<script lang="ts">
	/**
	 * Inline validation summary.
	 *
	 * Walks the Zod issues returned by the store and maps each issue's path to
	 * a translated message. Issues are flattened to a single string array so
	 * the rendering stays simple. The component renders nothing when the draft
	 * is valid.
	 */
	import { TriangleAlert } from '@lucide/svelte';
	import type { ZodSafeParseResult, ZodIssue } from 'zod';
	import type { InvoiceLanguage } from '$lib/invoice/types';

	type Props = {
		/** Result of `InvoiceDataSchema.safeParse(draft)`. */
		validation: ZodSafeParseResult<unknown>;
		/** Translation function from the i18n layer. */
		t: (key: string) => string;
		/** Current UI locale, used to choose which issue messages to surface. */
		locale: InvoiceLanguage;
	};

	let { validation, t, locale }: Props = $props();

	/**
	 * Translate Zod issue codes into localized strings. When an issue already
	 * carries a Danish/English message from the schema (the schema's messages
	 * are written in Danish), we re-derive a locale-appropriate string from
	 * the path so the warnings match the selected UI language.
	 */
	function localize(issue: ZodIssue): string {
		// Path-based translation takes precedence so the UI language wins over
		// the schema's embedded Danish messages.
		const leaf = issue.path[issue.path.length - 1];
		switch (leaf) {
			case 'name':
				return t('validation.nameRequired');
			case 'description':
				return t('validation.descriptionRequired');
			case 'quantity':
				return t('validation.quantityPositive');
			case 'unitPrice':
				return t('validation.unitPriceNonNegative');
			case 'cvr':
				return t('validation.cvrFormat');
			case 'ean':
				return t('validation.eanFormat');
			case 'email':
				return t('validation.emailFormat');
			case 'regNr':
				return t('validation.regNrFormat');
			case 'kontonr':
				return t('validation.kontonrFormat');
			case 'mobilepay':
				return t('validation.mobilepayFormat');
			case 'dueDate':
				return t('validation.dueDateAfterIssue');
			case 'issueDate':
				return t('validation.dateRequired');
			case 'items':
				return t('validation.atLeastOneItem');
			default:
				// Fall back to the schema-supplied message. This is already in
				// Danish; for English we drop the message rather than showing
				// a translation we don't have.
				if (locale === 'da' && issue.message) return issue.message;
				return String(issue.code ?? 'invalid');
		}
	}

	const messages = $derived(
		validation.success ? [] : validation.error.issues.map((issue) => localize(issue))
	);
</script>

{#if messages.length > 0}
	<section class="border-destructive/30 bg-destructive/5 rounded-lg border p-4" aria-live="polite">
		<div class="flex items-center gap-2">
			<TriangleAlert class="text-destructive" size={16} />
			<p class="text-foreground text-sm font-medium">{t('validation.title')}</p>
		</div>
		<ul class="text-destructive mt-2 list-inside list-disc space-y-1 text-sm">
			{#each messages as message (message)}
				<li>{message}</li>
			{/each}
		</ul>
	</section>
{:else if validation.success}
	<section
		class="border-border bg-muted/30 text-muted-foreground rounded-lg border p-3 text-sm"
		aria-live="polite"
	>
		✓ {t('app.title')} — OK
	</section>
{/if}

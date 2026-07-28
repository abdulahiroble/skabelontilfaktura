<script lang="ts">
	import type { InvoiceData } from '$lib/invoice/types';

	type Props = {
		invoice: InvoiceData;
		t: (key: string) => string;
	};

	const MAX_LOGO_BYTES = 1024 * 1024;

	let { invoice, t }: Props = $props();
	let error = $state('');

	function handleLogoChange(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		error = '';

		if (!file) return;
		if (!['image/png', 'image/jpeg'].includes(file.type)) {
			error = t('branding.invalidLogo');
			input.value = '';
			return;
		}
		if (file.size > MAX_LOGO_BYTES) {
			error = t('branding.logoTooLarge');
			input.value = '';
			return;
		}

		const reader = new FileReader();
		reader.onload = () => {
			if (typeof reader.result === 'string') invoice.logoDataUrl = reader.result;
		};
		reader.readAsDataURL(file);
	}

	function removeLogo() {
		invoice.logoDataUrl = '';
		error = '';
	}
</script>

<div class="border-border bg-card mt-4 rounded-lg border p-4">
	<label class="text-foreground block text-sm font-medium" for="seller-logo">
		{t('branding.logo')}
	</label>
	<p class="text-muted-foreground mt-1 text-xs">{t('branding.logoHint')}</p>

	<div class="mt-3 flex flex-wrap items-center gap-3">
		<input
			id="seller-logo"
			type="file"
			accept="image/png,image/jpeg"
			class="text-foreground file:border-border file:bg-background file:text-foreground hover:file:bg-accent w-full text-sm file:mr-3 file:rounded-md file:border file:px-3 file:py-1.5 file:text-sm file:font-medium"
			onchange={handleLogoChange}
		/>
		{#if invoice.logoDataUrl}
			<img
				src={invoice.logoDataUrl}
				alt={t('branding.logoPreview')}
				class="max-h-12 max-w-36 object-contain"
			/>
			<button
				type="button"
				class="text-muted-foreground hover:text-destructive text-sm font-medium underline-offset-4 hover:underline"
				onclick={removeLogo}
			>
				{t('branding.removeLogo')}
			</button>
		{/if}
	</div>

	{#if error}
		<p class="text-destructive mt-2 text-xs" role="alert">{error}</p>
	{/if}
</div>

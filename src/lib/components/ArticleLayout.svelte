<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Button } from '$lib/components/ui/button';

	interface Props {
		title: string;
		subtitle?: string;
		category?: string;
		date?: string;
		readingTime?: string;
		ctaText?: string;
		ctaHref?: string;
		children: Snippet;
	}

	let {
		title,
		subtitle,
		category,
		date,
		readingTime,
		ctaText = 'Start gratis faktura',
		ctaHref = '/generator/',
		children
	}: Props = $props();
</script>

<article class="mx-auto max-w-3xl px-6 py-12 lg:py-16">
	<header class="border-border mb-10 border-b pb-8">
		{#if category}
			<p class="text-accent mb-3 text-sm font-medium tracking-wide uppercase">{category}</p>
		{/if}
		<h1 class="text-3xl leading-tight font-semibold sm:text-4xl lg:text-5xl">{title}</h1>
		{#if subtitle}
			<p class="text-muted-foreground mt-4 text-lg leading-relaxed">{subtitle}</p>
		{/if}
		{#if date || readingTime}
			<div class="text-muted-foreground mt-5 flex items-center gap-3 text-sm">
				{#if date}<time>{date}</time>{/if}
				{#if date && readingTime}<span aria-hidden="true">·</span>{/if}
				{#if readingTime}<span>{readingTime}</span>{/if}
			</div>
		{/if}
	</header>

	<div
		class="prose prose-neutral prose-headings:font-serif prose-headings:font-semibold prose-headings:tracking-tight prose-h2:mt-10 prose-h2:text-2xl prose-h3:text-xl prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-blockquote:border-accent max-w-none"
	>
		{@render children()}
	</div>

	<div class="border-border mt-14 border-t pt-8">
		<div class="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div>
				<h2 class="text-xl font-semibold">Klar til din faktura?</h2>
				<p class="text-muted-foreground mt-1 text-sm">Det tager under et minut.</p>
			</div>
			<Button href={ctaHref}>{ctaText}</Button>
		</div>
	</div>

	<p class="text-muted-foreground/70 mt-8 max-w-2xl text-xs leading-relaxed">
		Skabelontilfaktura.dk er et værktøj til at generere fakturaer og udgør ikke juridisk rådgivning.
		Brugeren er selv ansvarlig for overholdelse af gældende lovgivning.
	</p>
</article>

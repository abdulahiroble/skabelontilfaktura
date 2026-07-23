<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { buildMeta } from '$lib/seo';

	const meta = buildMeta({
		title: 'Find en revisor - Gratis formidling | skabelontilfaktura.dk',
		description:
			'Bliv sat i kontakt med kvalificerede revisorer i dit område. Udfyld formularen og vi vender tilbage med 3 relevante tilbud. Gratis og uforpligtende.',
		canonical: '/revisor',
		ogType: 'website'
	});

	interface RevisorForm {
		name: string;
		email: string;
		phone: string;
		businessType: string;
		city: string;
		description: string;
	}

	let form = $state<RevisorForm>({
		name: '',
		email: '',
		phone: '',
		businessType: '',
		city: '',
		description: ''
	});

	let submitted = $state(false);

	const businessTypes = [
		'Selvstændig (enkeltmandsvirksomhed)',
		'ApS',
		'A/S',
		'IVS',
		'I/S',
		'Forening / fond',
		'Andet'
	];

	function handleSubmit(event: Event) {
		event.preventDefault();
		// Actual routing to a revisor partner happens in a later iteration.
		// For now we just acknowledge the submission client-side.
		if (typeof window !== 'undefined' && typeof window.plausible === 'function') {
			window.plausible('Revisor Lead', {
				props: { businessType: form.businessType || 'udfyldt' }
			});
		}
		submitted = true;
	}
</script>

<svelte:head>
	<title>{meta.title}</title>
	<meta name="description" content={meta.description} />
	<link rel="canonical" href={meta.canonical} />
	<meta name="robots" content={meta.robots} />

	<!-- Open Graph -->
	<meta property="og:type" content={meta.ogType} />
	<meta property="og:title" content={meta.title} />
	<meta property="og:description" content={meta.description} />
	<meta property="og:url" content={meta.canonical} />
	<meta property="og:site_name" content="skabelontilfaktura.dk" />
	<meta property="og:locale" content="da_DK" />
</svelte:head>

<section class="mx-auto max-w-2xl px-4 py-16">
	<div class="text-center">
		<h1 class="text-4xl font-bold">Find den rette revisor</h1>
		<p class="text-muted-foreground mt-3 text-lg">
			Udfyld formularen, så sætter vi dig i kontakt med kvalificerede revisorer i dit område. Gratis
			og uforpligtende.
		</p>
	</div>

	{#if submitted}
		<div class="border-border bg-muted/30 mt-10 rounded-xl border p-8 text-center">
			<div class="text-4xl">✓</div>
			<h2 class="mt-4 text-xl font-semibold">
				Mange tak, {form.name || 'vi har modtaget din henvendelse'}!
			</h2>
			<p class="text-muted-foreground mt-2 text-sm">
				Vi har modtaget din anmodning og vender tilbage inden for 1-2 hverdage med 3 relevante
				tilbud fra revisorer i dit område.
			</p>
			<Button class="mt-6" href="/">Tilbage til forsiden</Button>
		</div>
	{:else}
		<form class="border-border mt-10 rounded-xl border p-6" onsubmit={handleSubmit}>
			<div class="grid gap-4 sm:grid-cols-2">
				<div class="space-y-2">
					<label for="name" class="text-sm font-medium">Navn *</label>
					<input
						id="name"
						type="text"
						required
						bind:value={form.name}
						class="border-input bg-background focus-visible:ring-ring h-9 w-full rounded-md border px-3 text-sm focus-visible:ring-1 focus-visible:outline-none"
						placeholder="Dit fulde navn"
					/>
				</div>

				<div class="space-y-2">
					<label for="phone" class="text-sm font-medium">Telefon *</label>
					<input
						id="phone"
						type="tel"
						required
						bind:value={form.phone}
						class="border-input bg-background focus-visible:ring-ring h-9 w-full rounded-md border px-3 text-sm focus-visible:ring-1 focus-visible:outline-none"
						placeholder="12 34 56 78"
					/>
				</div>

				<div class="space-y-2">
					<label for="email" class="text-sm font-medium">E-mail *</label>
					<input
						id="email"
						type="email"
						required
						bind:value={form.email}
						class="border-input bg-background focus-visible:ring-ring h-9 w-full rounded-md border px-3 text-sm focus-visible:ring-1 focus-visible:outline-none"
						placeholder="dig@email.dk"
					/>
				</div>

				<div class="space-y-2">
					<label for="city" class="text-sm font-medium">By *</label>
					<input
						id="city"
						type="text"
						required
						bind:value={form.city}
						class="border-input bg-background focus-visible:ring-ring h-9 w-full rounded-md border px-3 text-sm focus-visible:ring-1 focus-visible:outline-none"
						placeholder="F.eks. København"
					/>
				</div>

				<div class="space-y-2 sm:col-span-2">
					<label for="businessType" class="text-sm font-medium">Virksomhedstype *</label>
					<select
						id="businessType"
						required
						bind:value={form.businessType}
						class="border-input bg-background focus-visible:ring-ring h-9 w-full rounded-md border px-3 text-sm focus-visible:ring-1 focus-visible:outline-none"
					>
						<option value="" disabled>Vælg virksomhedstype</option>
						{#each businessTypes as type (type)}
							<option value={type}>{type}</option>
						{/each}
					</select>
				</div>

				<div class="space-y-2 sm:col-span-2">
					<label for="description" class="text-sm font-medium">Kort beskrivelse</label>
					<textarea
						id="description"
						bind:value={form.description}
						rows="4"
						class="border-input bg-background focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-1 focus-visible:outline-none"
						placeholder="Beskriv kort hvad du har brug for hjælp til (f.eks. årsregnskab, bogføring, skat, rådgivning)."
					></textarea>
				</div>
			</div>

			<Button type="submit" class="mt-6 w-full">Send anmodning</Button>

			<p class="text-muted-foreground mt-4 text-xs">
				Ved at indsende accepterer du, at vi kontakter dig vedrørende din anmodning. Vi videregiver
				ikke dine oplysninger til tredjeparter uden dit samtykke.
			</p>
			<p class="text-muted-foreground mt-2 text-xs">
				Vi kan modtage provision hvis du klikker på disse links.
			</p>
		</form>
	{/if}
</section>

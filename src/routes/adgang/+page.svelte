<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	let email = $state('');
	let password = $state('');
	let busy = $state(false);
	let message = $state('');
	let success = $state(false);
	const token = $derived(page.url.searchParams.get('token'));
	async function submit() {
		if (busy) return;
		busy = true;
		message = '';
		try {
			const response = await fetch(
				token ? '/api/auth/reset-password' : '/api/auth/request-password-reset',
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(
						token
							? { token, newPassword: password }
							: { email, redirectTo: new URL('/adgang/', window.location.origin).toString() }
					)
				}
			);
			if (!response.ok) {
				message =
					response.status === 429
						? 'For mange forsøg. Vent et minut og prøv igen.'
						: 'Det lykkedes ikke. Prøv igen eller bed om et nyt link.';
				return;
			}
			success = true;
			password = '';
			message = token
				? 'Adgangskoden er ændret. Du kan logge ind og hente dit køb igen.'
				: 'Hvis der findes en konto med adressen, modtager du et link til at nulstille adgangskoden. Tjek også spam.';
		} catch {
			message = 'Forbindelsen fejlede. Prøv igen senere.';
		} finally {
			busy = false;
		}
	}
</script>

<svelte:head>
	<title>Gendan adgang | skabelontilfaktura.dk</title>
	<meta name="robots" content="noindex, nofollow" />
	<meta name="referrer" content="no-referrer" />
</svelte:head>
<section class="mx-auto max-w-md space-y-6 px-4 py-16">
	<h1 class="text-3xl font-semibold">
		{token ? 'Vælg ny adgangskode' : 'Gendan adgang til dit køb'}
	</h1>
	<p>Brug samme konto som ved købet. Du skal ikke betale igen.</p>
	{#if !success}
		<form
			class="space-y-4"
			onsubmit={(event) => {
				event.preventDefault();
				submit();
			}}
		>
			{#if token}
				<label class="block" for="new-password">Ny adgangskode (mindst 8 tegn)</label>
				<input
					class="border-input h-12 w-full rounded-md border px-3"
					id="new-password"
					type="password"
					autocomplete="new-password"
					minlength="8"
					required
					bind:value={password}
				/>
			{:else}
				<label class="block" for="recovery-email">Din e-mailadresse</label>
				<input
					class="border-input h-12 w-full rounded-md border px-3"
					id="recovery-email"
					type="email"
					autocomplete="email"
					required
					bind:value={email}
				/>
			{/if}
			<Button type="submit" disabled={busy}
				>{busy ? 'Vent…' : token ? 'Gem adgangskode' : 'Send gendannelseslink'}</Button
			>
		</form>
	{/if}
	{#if message}<p role="status">{message}</p>{/if}
	<a class="underline" href="/login/?next=%2Fkonto%2F">Til login</a>
</section>

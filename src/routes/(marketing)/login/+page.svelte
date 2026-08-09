<script lang="ts">
	import { signIn, signUp } from '$lib/auth/client';
	import { Button } from '$lib/components/ui/button';

	/**
	 * Login / signup page.
	 *
	 * Email + password via Better Auth:
	 *  - POST /api/auth/sign-in/email  ({ email, password })
	 *  - POST /api/auth/sign-up/email  ({ name, email, password })
	 *
	 * Toggle between the two forms; on success redirect to `?next=` (safe
	 * relative path only) or fall back to the generator.
	 */

	type Mode = 'login' | 'signup';

	let mode: Mode = $state('login');
	let name = $state('');
	let email = $state('');
	let password = $state('');
	let submitting = $state(false);
	let error = $state('');

	// Read the redirect target once (client-side only, SSR-safe).
	let next = '';
	if (typeof window !== 'undefined') {
		const raw = new URLSearchParams(window.location.search).get('next');
		next = raw && raw.startsWith('/') && !raw.startsWith('//') ? raw : '';
	}

	async function submit() {
		error = '';
		submitting = true;
		try {
			let result;
			if (mode === 'signup') {
				result = await signUp.email({ name, email, password });
			} else {
				result = await signIn.email({ email, password });
			}

			if (result.error) {
				error = translateError(result.error.message ?? result.error.code ?? 'unknown');
				return;
			}
			window.location.href = next || '/generator/';
		} catch (e) {
			console.error('[login] auth request failed', e);
			error = 'Der gik noget galt. Prøv igen om lidt.';
		} finally {
			submitting = false;
		}
	}

	function translateError(message: string): string {
		const lower = message.toLowerCase();
		if (lower.includes('invalid email') || lower.includes('email not found')) {
			return 'Vi kender ikke denne e-mailadresse.';
		}
		if (lower.includes('invalid password') || lower.includes('incorrect')) {
			return 'Forkert adgangskode.';
		}
		if (lower.includes('user already exists')) {
			return 'Der findes allerede en bruger med denne e-mail.';
		}
		if (lower.includes('password')) {
			return 'Adgangskoden er ikke gyldig (mindst 8 tegn).';
		}
		return 'Kunne ikke logge ind. Tjek dine oplysninger og prøv igen.';
	}

	function switchMode(m: Mode) {
		mode = m;
		error = '';
		password = '';
	}
</script>

<svelte:head>
	<title>{mode === 'login' ? 'Log ind' : 'Opret bruger'} | skabelontilfaktura.dk</title>
</svelte:head>

<div class="mx-auto w-full max-w-sm px-4 py-16">
	<div class="space-y-6">
		<div class="space-y-2">
			<h1 class="text-2xl font-bold">{mode === 'login' ? 'Log ind' : 'Opret bruger'}</h1>
			<p class="text-muted-foreground text-sm">
				{mode === 'login'
					? 'Velkommen tilbage. Log ind for at få adgang til dine fakturaer og indstillinger.'
					: 'Opret en gratis bruger for at gemme dine fakturaer på tværs af enheder.'}
			</p>
		</div>

		<form
			class="space-y-4"
			onsubmit={(e) => {
				e.preventDefault();
				submit();
			}}
		>
			{#if mode === 'signup'}
				<div class="space-y-1.5">
					<label for="name" class="text-sm font-medium">Navn</label>
					<input
						id="name"
						type="text"
						autocomplete="name"
						required
						bind:value={name}
						class="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring h-9 w-full rounded-md border px-3 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none"
						placeholder="Dit fulde navn"
					/>
				</div>
			{/if}

			<div class="space-y-1.5">
				<label for="email" class="text-sm font-medium">E-mail</label>
				<input
					id="email"
					type="email"
					autocomplete="email"
					required
					bind:value={email}
					class="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring h-9 w-full rounded-md border px-3 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none"
					placeholder="navn@eksempel.dk"
				/>
			</div>

			<div class="space-y-1.5">
				<label for="password" class="text-sm font-medium">Adgangskode</label>
				<input
					id="password"
					type="password"
					autocomplete={mode === 'login' ? 'current-password' : 'new-password'}
					required
					minlength={mode === 'signup' ? 8 : undefined}
					bind:value={password}
					class="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring h-9 w-full rounded-md border px-3 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none"
					placeholder="••••••••"
				/>
			</div>

			{#if error}
				<p class="text-destructive text-sm" role="alert">{error}</p>
			{/if}

			<Button type="submit" class="w-full" disabled={submitting}>
				{submitting ? 'Et øjeblik…' : mode === 'login' ? 'Log ind' : 'Opret bruger'}
			</Button>
		</form>

		<div class="text-muted-foreground text-center text-sm">
			{#if mode === 'login'}
				<span>Har du ingen konto? </span>
				<button
					type="button"
					class="text-primary hover:underline"
					onclick={() => switchMode('signup')}
				>
					Opret en gratis bruger
				</button>
			{:else}
				<span>Har du allerede en konto? </span>
				<button
					type="button"
					class="text-primary hover:underline"
					onclick={() => switchMode('login')}
				>
					Log ind i stedet
				</button>
			{/if}
		</div>
	</div>
</div>

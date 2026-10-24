<script lang="ts">
	import { CONSENT_STORAGE_KEY, CONSENT_DEFAULTS, updateConsent } from '$lib/analytics';
	let resetError = $state('');
	function resetConsent() {
		try {
			window.localStorage.removeItem(CONSENT_STORAGE_KEY);
			updateConsent({ ...CONSENT_DEFAULTS });
			window.location.reload();
		} catch {
			resetError =
				'Browseren tillod ikke ændringen. Du kan ændre website-lager i browserens indstillinger.';
		}
	}
</script>

<svelte:head>
	<title>Cookiepolitik | skabelontilfaktura.dk</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<article class="prose prose-neutral prose-headings:font-serif mx-auto max-w-3xl px-6 py-14">
	<h1>Cookiepolitik</h1>
	<p>Opdateret 23. oktober 2026.</p>
	<h2>Nødvendigt lager</h2>
	<p>
		Vi bruger sessionscookies til login og sikkerhed. Browserens lokale lager husker dit cookievalg
		(faktura_consent_v1), din fakturakladde, den lokale nummerserie og eventuelt sprogvalg. Dette er
		funktionalitet, du bruger direkte, ikke reklamesporing.
	</p>
	<h2>Valgfri analyse</h2>
	<p>
		Google Analytics bruges til statistik, hvis du accepterer analyse. Statistikken hjælper os fx
		med at se, om generatoren bruges, og om købsforløbet virker. Den omfatter ikke fakturaernes
		indhold. Du kan afvise analyse uden at miste adgangen til generatoren eller købte filer.
	</p>
	<h2>Ændr dit valg</h2>
	<p>
		Åbn cookievalget igen med knappen nedenfor. Den nulstiller kun dit samtykke, ikke din kladde
		eller nummerserie.
	</p>
	<button
		type="button"
		class="border-border bg-background rounded border px-4 py-2 text-sm font-medium"
		onclick={resetConsent}>Ændr mit cookievalg</button
	>
	{#if resetError}<p role="alert">{resetError}</p>{/if}
	<p>
		Dataansvarlig er Ace Solutions, CVR 46295218. Kontakt <a
			href="mailto:kontakt@skabelontilfaktura.dk">kontakt@skabelontilfaktura.dk</a
		>. Se også <a href="/privatlivspolitik/">privatlivspolitikken</a>.
	</p>
</article>

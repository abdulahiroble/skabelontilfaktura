<script lang="ts">
	import { CONSENT_STORAGE_KEY, gtag } from '$lib/analytics';

	let { measurementId }: { measurementId?: string } = $props();

	$effect(() => {
		const id = measurementId;
		if (!id || !/^G-[A-Z0-9]+$/.test(id)) return;
		function loadIfAccepted() {
			try {
				if (window.localStorage.getItem(CONSENT_STORAGE_KEY) !== 'accepted') return;
			} catch {
				return;
			}
			if (document.getElementById('faktura-google-analytics')) return;
			const script = document.createElement('script');
			script.id = 'faktura-google-analytics';
			script.async = true;
			script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
			gtag('js', new Date());
			gtag('config', id, { anonymize_ip: true });
			document.head.appendChild(script);
		}
		loadIfAccepted();
		window.addEventListener('faktura:consent-changed', loadIfAccepted);
		return () => window.removeEventListener('faktura:consent-changed', loadIfAccepted);
	});
</script>

<script lang="ts">
	import { onMount } from 'svelte';

	let deferredPrompt = $state<any>(null);
	let canInstall = $state(false);

	onMount(() => {
		const handler = (e: Event) => {
			deferredPrompt = e;
			canInstall = true;
		};

		window.addEventListener('beforeinstallprompt', handler);

		return () => {
			window.removeEventListener('beforeinstallprompt', handler);
		};
	});

	async function installApp() {
		if (!deferredPrompt) return;

		deferredPrompt.prompt();
		const { outcome } = await deferredPrompt.userChoice;

		if (outcome === 'accepted') {
			console.log('User accepted the install prompt');
		}

		deferredPrompt = null;
		canInstall = false;
	}
</script>


{#if canInstall}
	<button
		aria-label="install the apps"
		onclick={installApp}
		class="btn btn-primary btn-sm normal-case mr-2"
	>
		<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
			<path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
		</svg>
		Install
	</button>
{/if}

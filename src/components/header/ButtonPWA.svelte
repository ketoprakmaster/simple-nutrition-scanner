<script lang="ts">
	import { onMount } from 'svelte';
	import { Download } from '@lucide/svelte'

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
		<Download/>
		Install
	</button>
{/if}

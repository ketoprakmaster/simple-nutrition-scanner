<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { ScannerManager } from '$lib/camera/scanner.svelte';
    import ScannerOverlay from '$components/Scanner/ScannerOverlay.svelte';
    import Alert from "$components/alert.svelte";

    let scannerContainer: HTMLDivElement;
    const scanner = new ScannerManager();

    onMount(() => scanner.start(scannerContainer));
    onDestroy(() => scanner.stop());
</script>

<Alert />

<div class="relative w-full h-dvh overflow-hidden bg-black">
    <div bind:this={scannerContainer} class="absolute inset-0 z-0 scanner-container"></div>

    <ScannerOverlay {scanner} />
</div>

<style>
    .scanner-container :global(video) {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
</style>

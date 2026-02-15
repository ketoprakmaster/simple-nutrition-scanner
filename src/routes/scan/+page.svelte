<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { goto } from '$app/navigation';
    import { resolve } from '$app/paths';
    import Quagga from '@ericblade/quagga2';
    import { scannerConfig } from '$lib/config/scanner';
    import { getProduct } from '$lib/api.svelte';
    import { ui } from "$lib/alert.svelte";
    import Alert from "$components/alert.svelte";
    import { get } from 'svelte/store';

    let scannerContainer: HTMLDivElement;
    let isLocked = $state(false);

    onMount(() => {
        initScanner();
    });

    onDestroy(() => {
        stopScanner()
    });

    function stopScanner() {
        Quagga.offDetected(handleDetected);
        Quagga.stop()
    }

    function initScanner() {
        if (!scannerContainer) return;
        scannerConfig.inputStream!.target = scannerContainer;

        Quagga.init(scannerConfig, (err) => {
            if (err) {
                ui.show("Camera Error", "error", 5000);
                return;
            }
            Quagga.start();
        });

        Quagga.onDetected(handleDetected);
    }

    async function handleDetected(data: any) {
        const code = data.codeResult?.code;

        if (!code || isLocked) return;

        isLocked = true;
        stopScanner()

        try {
            // throw new Error("mock test")
            await getProduct(code)
        } catch (err) {
            ui.show(err instanceof Error ? err.message : "error in handle detected", "error");
        } finally {
            isLocked = false;
            initScanner();
        }
    }
</script>

<Alert/>

<div class="relative w-full h-dvh overflow-hidden bg-black">
		<!-- scanner container -->
    <div
        bind:this={scannerContainer}
        class="absolute inset-0 z-0 scanner-container transition-all duration-500"
        class:blur-xl={isLocked}
        class:opacity-50={isLocked}
    ></div>

    <!-- loading -->
    {#if isLocked}
        <div class="absolute inset-0 z-15 flex flex-col items-center justify-center bg-black/20 backdrop-blur-sm">
            <span class="loading loading-ring loading-lg text-primary"></span>
            <p class="text-white mt-4 font-medium tracking-wide">Fetching product data...</p>
        </div>
    {/if}

    <!-- scanner overlay -->
    <div class="relative z-10 flex h-full flex-col justify-between p-6 pointer-events-none">
        <header class="flex justify-between items-center pointer-events-auto">
            <button onclick={() => goto(resolve('/'))} aria-label="close scanner, goto home" class="btn btn-circle btn-ghost bg-black/40 text-white border-none">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            <h1 class="text-white font-bold text-lg">Scan Barcode</h1>
            <div class="w-12"></div>
        </header>

        <div class="flex-1 py-20 px-10">
	        <div class="relative h-full border-2 border-primary/50 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]">
	            {#if !isLocked}
	                <div class="absolute inset-x-0 top-0 h-1 bg-primary shadow-[0_0_15px_#570df8] animate-scan-move"></div>
	            {/if}
	        </div>
        </div>

        <div class="text-center pb-12 pointer-events-auto">
            <p class="text-white/90 text-sm bg-black/60 backdrop-blur-md py-2 px-6 rounded-full inline-block border border-white/10">
                {isLocked ? 'Processing...' : 'Center the barcode within the box'}
            </p>
        </div>
    </div>
</div>

<style>
    .scanner-container :global(video) {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    @keyframes scan-move {
        0% { top: 0%; }
        100% { top: 100%; }
    }
    .animate-scan-move {
        animation: scan-move 2s linear infinite;
    }
</style>

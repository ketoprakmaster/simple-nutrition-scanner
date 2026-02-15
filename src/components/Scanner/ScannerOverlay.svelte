<script lang="ts">
    import { goto } from "$app/navigation";
    import { resolve } from "$app/paths";
    import type { ScannerManager } from "$lib/scanner.svelte";

    let { scanner }: { scanner: ScannerManager } = $props();

    function handleFileChange(e: Event) {
        const input = e.target as HTMLInputElement;
        if (input.files?.length) {
            scanner.processImage(input.files[0]);
        }
    }
</script>

{#if scanner.isLocked}
    <div class="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
        <span class="loading loading-ring loading-lg text-primary"></span>
        <p class="text-white mt-4 font-medium tracking-wide">Processing...</p>
    </div>
{/if}

<div class="relative flex h-full flex-col justify-between p-10 gap-10 pointer-events-none">
    <header class="flex justify-between items-center pointer-events-auto">
        <button onclick={() => goto(resolve('/'))} class="btn btn-ghost btn-circle text-white" aria-label='back, go to home'>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <h1 class="text-white font-bold text-lg">Scan Barcode</h1>
        <div class="w-12"></div>
    </header>

    <div class="flex-1 z-10">
        <div class="relative h-full border-2 border-primary/50 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]">
            {#if !scanner.isLocked}
                <div class="absolute inset-x-0 top-0 h-1 bg-primary shadow-[0_0_15px_#570df8] animate-scan-move"></div>
            {/if}
        </div>
    </div>

    <div class="flex flex-col items-center gap-6 pointer-events-auto z-10">
        <p class="text-white text-sm backdrop-blur-md py-2 px-6 rounded-full border border-white/10">
            {scanner.isLocked ? 'Please wait...' : 'Center the barcode or upload a photo'}
        </p>

        <label class="btn btn-circle btn-primary btn-lg shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <input type="file" accept="image/*" class="hidden" onchange={handleFileChange} disabled={scanner.isLocked} />
        </label>
    </div>
</div>

<style>
    @keyframes scan-move {
        0% { top: 0%; }
        100% { top: 100%; }
    }
    .animate-scan-move {
        animation: scan-move 2s linear infinite;
    }
</style>

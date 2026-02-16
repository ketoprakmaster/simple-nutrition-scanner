<script lang="ts">
    import { goto } from "$app/navigation";
    import { resolve } from "$app/paths";

    let { loading = false } = $props();
</script>

<div class="flex justify-between items-center pointer-events-auto ">
  <button onclick={() => goto(resolve('/'))} class="btn btn-ghost btn-circle text-white z-50" aria-label='back, go to home'>
    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
  </button>
  <h1 class="text-white font-bold text-lg z-20">Scan Barcode</h1>
  <div class="w-12"></div>
</div>

<div class="flex-1 z-5">
  <div class="relative h-full border-2 border-primary/50 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]">
    {#if !loading}
      <div class="absolute inset-x-0 top-0 h-1 bg-primary shadow-[0_0_15px_#570df8] animate-scan-move"></div>
    {/if}
  </div>
</div>

<p class="text-white text-sm backdrop-blur-md p-3 rounded-md w-full text-center border border-white/10 z-20">
    Center the barcode or upload a photo
</p>

<style>
    @keyframes scan-move {
        0% { top: 0%; }
        100% { top: 100%; }
    }
    .animate-scan-move {
        animation: scan-move 2s linear infinite;
    }
</style>

<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { goto } from '$app/navigation';
    import Quagga from '@ericblade/quagga2';
    import { getProduct } from '$lib/api.svelte';
    import { resolve } from '$app/paths';
    import { ui } from "$lib/alert.svelte";
    import Alert from "$components/alert.svelte"

    let scannerContainer: HTMLDivElement;
    let scanning = $state(false);

    onMount(() => {
        startScanner();
    });

    onDestroy(() => {
        Quagga.stop();
    });

    function startScanner() {
        Quagga.init({
            inputStream: {
                type  : "LiveStream",
                target: scannerContainer,
                constraints: {
                    facingMode: "environment" // Use rear camera
                },
            },
            decoder: {
                readers: ["ean_reader", "ean_8_reader", "upc_reader"] // Common food barcodes
            }
        }, (err) => {
            if (err) {
                ui.show("Camera Error: Please grant permissions", "error", 5000);
                return;
            }
            Quagga.start();
            scanning = true;
        });

        Quagga.onDetected(async (data) => {
            const code = data.codeResult.code;

            if (code) {
                Quagga.stop();
                await getProduct(code);
            }
        });
    }
</script>

<Alert/>

<div class="relative w-full h-dvh overflow-hidden bg-black">
  <!-- Camera layer -->
  <div
      bind:this={scannerContainer}
      class="absolute inset-0 z-0 scanner-container"
  ></div>

  <!-- UI overlay -->
  <div class="relative z-10 flex h-full flex-col justify-between p-6 pointer-events-none">
    <header class="flex justify-between items-center pointer-events-auto">
      <button onclick={() => goto(resolve('/'))} class="text-white bg-black/50 p-3 cursor-pointer rounded-full hover:bg-black/70 transition-colors" aria-label="go to main page">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
      </button>
      <h1 class="text-white font-bold text-lg">Scan Barcode</h1>
      <div class="w-12"></div>
    </header>

    <div class="w-64 h-64 mx-auto border-2 border-green-500 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"></div>

    <div class="text-center pb-8 pointer-events-auto">
      <p class="text-white text-sm bg-black/60 backdrop-blur-md py-2 px-6 rounded-full inline-block border border-white/10">
          Center the barcode within the box
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
</style>

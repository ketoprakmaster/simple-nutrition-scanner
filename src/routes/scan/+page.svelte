<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { Scanner } from '$lib/camera/scanner.svelte';
    import Alert from "$components/alert.svelte";
    import ScanOverlay from '$components/Scanner/ScanOverlay.svelte';
    import ButtonFileScan from '$components/Scanner/ButtonFileScan.svelte';
    import ButtonToggleTorch from '$components/Scanner/ButtonToggleTorch.svelte';

    let scannerContainer: HTMLDivElement;

    onMount(() => Scanner.start(scannerContainer));
    onDestroy(() => Scanner.stop());
</script>

<Alert />

<div class="relative h-dvh overflow-hidden bg-black">
  <div bind:this={scannerContainer} class="absolute inset-0 z-0 scanner-container"></div>

  {#if Scanner.isLocked}
      <div class="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/20 backdrop-blur-sm">
          <span class="loading loading-ring loading-xl text-primary"></span>
          <p class="text-white mt-4 font-medium tracking-wide">Processing...</p>
      </div>
  {/if}


  <div class="relative flex h-dvh flex-col justify-between py-10 p-5 gap-5 max-w-2xl mx-auto">
  	<!-- overlay -->
   	<ScanOverlay loading={Scanner.isLocked}/>

    <!-- actions button -->
    <div class="grid grid-flow-col grid-cols-4 gap-2">
    	<ButtonFileScan/>
     	<ButtonToggleTorch/>
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

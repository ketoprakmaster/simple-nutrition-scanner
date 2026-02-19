<script lang="ts">
    import { Scanner } from "$lib/ui/scanner.svelte";

    function handleFileChange(e: Event) {
        const input = e.target as HTMLInputElement;
        if (input.files?.length) {
            Scanner.processImage(input.files[0]);
        }
    }
</script>

<!-- scan button -->
<label class="btn btn-lg btn-primary rounded-md shadow-md col-span-3 z-20">
 	<p>Scan Image</p>
  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
  <input type="file" accept="image/*" class="hidden" onchange={handleFileChange} disabled={Scanner.isProcessing} />
</label>

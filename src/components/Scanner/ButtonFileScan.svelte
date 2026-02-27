<script lang="ts">
    import { Scanner } from "$lib/ui/scanner.svelte";
    import { Image } from "@lucide/svelte";

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
 	<Image/>

  <input type="file" accept="image/*" class="hidden" onchange={handleFileChange} disabled={Scanner.isProcessing} />
</label>

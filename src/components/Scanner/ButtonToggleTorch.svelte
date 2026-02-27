<script lang="ts">
	import {Flashlight} from '@lucide/svelte';

  import { Torch } from "$lib/ui/torch.svelte";
</script>

<!-- torch button -->
<button
	class="btn rounded-md h-full z-20 border-white/10 backdrop-blur-md {Torch.torchEnabled ? 'btn-warning' : 'btn-ghost'}"
  aria-label="toggle torch"
  onclick={() => Torch.toggle()}
>
	<Flashlight/>
</button>

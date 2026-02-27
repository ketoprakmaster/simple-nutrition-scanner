<script lang="ts">
    import { ProductAnalysis } from "$lib/models/productAnalysis";
    import CircleCheck from "@lucide/svelte/icons/circle-check";

    let { analysis } : {analysis: ProductAnalysis} = $props()
</script>


{#if analysis.nutrients.length}
	<div class="bg-base-100 rounded-3xl p-5 shadow-sm">
	    <h3 class="font-bold mb-4 flex items-center gap-2">
					<CircleCheck class='text-primary'/>
	        Analysis (per 100g)
	    </h3>

	    <div class="grid grid-cols-2 gap-3">
		    {#each analysis.nutrients as point}
		        <div class="bg-base-200/50 rounded-2xl p-3 grid grid-cols-2 items-center text-center ">
								<div class="flex flex-col">
			            <span class="text-2xl mb-1">{point.icon}</span>
			            <span class="text-xs opacity-60 uppercase font-bold tracking-tighter">{point.label}</span>
								</div>
								<div class='flex flex-col items-center'>
										<div class='flex flex-row gap-2'>
			                <span class="font-black">{point.displayValue} g </span>
											<div class=" rounded-full w-2 h-2 my-auto {point.levelColor}"></div>
										</div>
						        <span class="text-xs uppercase opacity-75">{point.levelLabel}</span>
								</div>
		        </div>
		    {/each}
			</div>
	</div>
{/if}

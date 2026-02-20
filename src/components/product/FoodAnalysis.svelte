<script lang="ts">
    import { ProductAnalysis } from "$lib/models/productAnalysis";

    let { analysis } : {analysis: ProductAnalysis} = $props()
</script>


{#if analysis.nutrients.length}
	<div class="bg-base-100 rounded-3xl p-5 shadow-sm">
	    <h3 class="font-bold mb-4 flex items-center gap-2">
	        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
	        Analysis (per 100g)
	    </h3>

	    <div class="space-y-4">
	        {#each analysis?.nutrients as point}
	            {#if point.level}
	            <div class="flex items-center justify-between">
	                <div class="flex items-center gap-3">
	                    <div class="p-1 rounded-full bg-base-200 flex items-center justify-center text-2xl">
	                        {point.icon}
	                    </div>
	                    <div>
	                        <div class="font-medium">{point.label}</div>
	                        <div class="text-xs opacity-60">
	                            {point.displayValue || 0}{point.unit}
	                        </div>
	                    </div>
	                </div>
	                <div class="flex items-center gap-2">
	                    <span class="text-sm font-semibold capitalize">{point.levelLabel}</span>
	                    <div class="w-4 h-4 rounded-full {point.levelColor}"></div>
	                </div>
	            </div>
	            {/if}
	        {/each}
	    </div>
	</div>
{/if}

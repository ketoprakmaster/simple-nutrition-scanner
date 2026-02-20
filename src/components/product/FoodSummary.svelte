<script lang="ts">
    import type { Product } from "$lib/types/product";
    import { labelIcons } from "$lib/utils/helpers/labels";
    import {ProductAnalysis} from "$lib/models/productAnalysis";

    type Props = {item: Product, analysis: ProductAnalysis};

    let { item, analysis } : Props = $props()
</script>


<!-- product image section -->
<div class="bg-base-100 p-5 pb-12 rounded-b-3xl shadow-sm relative overflow-hidden">
    <div class="flex flex-col items-center max-w-md mx-auto">
        <div class="relative w-48 h-48 mb-6 group">
           {#if item.product.image_url}
            <img
                src={item.product.image_url}
                alt={item.product.product_name}
                class="w-full h-full object-contain rounded-2xl bg-base-content/10 shadow-lg transition-transform duration-300 group-hover:scale-105"
                crossorigin="anonymous"
            />
            {:else}
            <div class="w-full h-full rounded-2xl bg-base-300 flex items-center justify-center text-4xl">
                🛒
            </div>
            {/if}
        </div>

        <h1 class="text-2xl font-bold text-center px-4 leading-tight mb-1">{item.product.product_name}</h1>
        <p class="text-base-content/60 text-center mb-4">{item.product.brands || 'Unknown Brand'}</p>

        <!-- food labels -->
        {#if item.product.labels_tags && item.product.labels_tags.length > 0}
        <div class="flex flex-wrap justify-center gap-2 mb-6">
            {#each item.product.labels_tags.slice(0, 5) as label}
                <div class="badge bg-base-300 text-xs font-bold py-3">
                    <span class="mr-1 ">{labelIcons[label] || '🏷️'}</span>
                    {label.replace('en:', '').replace(/-/g, ' ')}
                </div>
            {/each}
        </div>
        {/if}

        <!-- score circle -->
        <div class="flex flex-col items-center gap-2 ">
            <div class="flex items-center gap-4">
                <div class="radial-progress border-8 border-base-300 {analysis?.colorClass}" style="--value:{analysis?.scoreValue}; --size:6rem; --thickness: 0.5rem;" role="progressbar">
                    <span class="text-4xl font-black text-base-content">{analysis?.scoreValue}</span>
                </div>
                <div class="flex flex-col">
                    <span class="text-2xl font-bold {analysis?.colorClass}">{analysis?.scoreLabel}</span>
                    <span class="text-md opacity-50 uppercase tracking-widest font-bold">Nutri-Score : {analysis.grade === "unknown" ? '?' : analysis.grade}</span>
                </div>
            </div>
        </div>
    </div>
</div>

<script lang="ts">
    import type { Product } from "$lib/types/product";
    import { ProductAnalysis } from "$lib/models/productAnalysis";
    import additivesMap from '$lib/data/additives-min.json';

    type Props = { item: Product; analysis: ProductAnalysis };
    let { item, analysis }: Props = $props();

    // Helper to get risk info for a specific additive tag
    const getRisk = (tag: string) => {
        return (additivesMap as Record<string, {r: number, n: string}>)[tag] || { r: 0, n: tag.replace('en:', '') };
    };

    const riskColors = {
        3: 'bg-red-100 text-red-700 border-red-200',
        2: 'bg-orange-100 text-orange-700 border-orange-200',
        1: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        0: 'bg-base-200 text-base-500 border-transparent'
    };
</script>


 <div class="bg-base-100 rounded-3xl p-5 shadow-sm">
     <h3 class="font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider opacity-60">
         <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
         Composition
     </h3>

     <div class="space-y-4">
         {#if analysis.nova.group}
         <div class="flex items-center justify-between text-sm">
             <div class="flex items-center gap-3">
                 <div class="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center text-sm font-bold text-yellow-700">
                     {analysis.nova.group}
                 </div>
                 <span class="font-medium">Processing (NOVA)</span>
             </div>
             <div class="text-xs opacity-50 max-w-37.5 text-right">
                 {analysis.nova.label}
             </div>
         </div>
         {/if}

         {#if item.product.ecoscore_grade}
         <div class="flex items-center justify-between text-sm">
             <div class="flex items-center gap-3">
                 <div class="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-sm font-bold text-green-700 uppercase">
                     {item.product.ecoscore_grade.toLowerCase() === 'unknown' ? "?" : item.product.ecoscore_grade}
                 </div>
                 <span class="font-medium">Eco-Score</span>
             </div>
             <span class="text-xs opacity-50 uppercase">{item.product.ecoscore_grade === 'a' ? 'Very low impact' : 'Environmental impact'}</span>
         </div>
         {/if}

         <div class="divider my-1"></div>

         <div class="text-sm">
         {#if item.product.additives_tags && item.product.additives_tags.length > 0}
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg {analysis.scoreValue < 50 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'} flex items-center justify-center text-sm font-bold">
                    !
                </div>
                <span class="font-medium">Additives ({item.product.additives_tags.length})</span>
              </div>
            </div>

            <div class="flex flex-wrap gap-2">
              {#each item.product.additives_tags as tag}
                {@const info = getRisk(tag)}
                <div class="group relative">
                  <span class="badge badge-sm border {riskColors[info.r as keyof typeof riskColors]} text-[10px] font-bold py-3 uppercase">
                    {info.n || tag.replace('en:', '')}
                  </span>
                  <div class="absolute bottom-full mb-2 hidden group-hover:block z-10 bg-gray-800 text-white p-2 rounded text-[10px] whitespace-nowrap">
                  </div>
                </div>
              {/each}
            </div>
          {:else}
                 <div class="flex items-center justify-between">
                     <div class="flex items-center gap-3">
                         <div class="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-700">
                             ✓
                         </div>
                         <span class="font-medium">No additives found</span>
                     </div>
                 </div>
             {/if}
         </div>
     </div>
 </div>

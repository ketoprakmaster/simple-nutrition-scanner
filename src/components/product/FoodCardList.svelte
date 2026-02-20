<script lang="ts">
    import type {Product } from '$lib/types/product'
    import { productStore } from '$lib/ui/product.svelte';
    import { resolve } from "$app/paths";
    import { ProductAnalysis } from '$lib/models/productAnalysis';

    type Props = {
      items: Product[];
      toggleDelete?: boolean;
      messageEmpty?: string;
    }

    let {
      items,
      toggleDelete = false,
      messageEmpty = "Nothing Here..."
    }: Props  = $props();

    function removeItem(e: Event, item: Product) {
        e.preventDefault();
        e.stopPropagation();
        productStore.remove(item.code);
    }
</script>

{#if items.length === 0}
  <div class="flex flex-col items-center justify-center p-12 bg-base-100 rounded-3xl shadow-sm border border-base-200">
    <div class="text-4xl mb-4 opacity-20">🔍</div>
    <p class="text-sm font-medium text-base-content/40">{messageEmpty}</p>
  </div>
{:else}
  <div class="flex flex-col gap-4">
    {#each items as item (item.code)}
    {@const info = new ProductAnalysis(item)}
      <a
        href={resolve(`/history/${item.code}`)}
        class="group relative flex items-center bg-base-200/50 rounded-xl p-4 shadow-sm border border-base-300 active:scale-[0.98] transition-all hover:border-primary/25 hover:shadow-md"
      >
        <div class="relative h-16 w-16 min-w-16 overflow-hidden rounded-xl bg-base-content/10 flex items-center justify-center shadow-inner">
          {#if item.product.image_url}
            <img src={item.product.image_url} alt={item.product.product_name} class="h-full w-full object-cover" crossorigin="anonymous"/>
          {:else}
            <span class="text-2xl">🛒</span>
          {/if}
        </div>

        <div class="flex-1 px-4 overflow-hidden text-left">
          <h3 class="font-bold text-sm text-base-content line-clamp-1 leading-snug">
            {item.product.product_name}
          </h3>
          <p class="text-xs font-medium opacity-50 truncate">
            {item.product.brands || 'No Brand'}
          </p>
          <div class="flex items-center gap-1 mt-1">
             <div class="w-2 h-2 rounded-full {info.BgClass}"></div>
             <span class="text-[10px] font-bold uppercase opacity-60 tracking-wider">Score: {info.scoreLabel }</span>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <div class="radial-progress border-4 border-base-300 {info.colorClass}" style="--value:{info.scoreValue}; --size:2.5rem; --thickness: 4px;" role="progressbar">
            <span class="text-[10px] font-black text-base-content">{info.scoreValue}</span>
          </div>

          {#if toggleDelete}
            <button
              type="button"
              onclick={(e) => removeItem(e,item)}
              class="btn btn-circle btn-ghost btn-xs text-error/40 hover:text-error hover:bg-error/10"
              aria-label="Delete item"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          {/if}
        </div>
      </a>
    {/each}
  </div>
{/if}

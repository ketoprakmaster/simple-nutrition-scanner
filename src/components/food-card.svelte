<script lang="ts">
    import { gradeColors } from "$lib/helper.svelte";
    import { history } from "$lib/state.svelte";
    import { resolve } from "$app/paths";
    import { goto } from "$app/navigation";

    let { items, toggleDelete = false, messageEmpty = 'Nothing Here...' } = $props();
</script>

{#if items.length === 0}
  <div class="flex flex-col items-center justify-center p-12 border-2 border-dashed border-base-300 rounded-3xl opacity-40">
    <p class="text-sm italic font-medium">{messageEmpty}</p>
  </div>
{:else}
  <div class="flex flex-col gap-3">
    {#each items as item (item.id)}
      <a
        href={resolve(`/history/[code]`,{code: item.code})}
        class="group relative flex items-center bg-base-200 rounded-md p-3 shadow-sm border border-base-200 active:scale-[0.98] transition-all hover:border-primary/30"
      >
        <div class="relative h-20 w-20 min-w-20 overflow-hidden rounded-md bg-slate-50 flex items-center justify-center">
          <img src={item.product.image_url} alt={item.product.product_name} class="h-full w-full object-cover mix-blend-multiply" />
        </div>

        <div class="flex-1 px-4 overflow-hidden text-left">
          <h3 class="font-bold text-sm text-base-content line-clamp-1 leading-snug">
            {item.product.product_name}
          </h3>
          <p class="text-xs font-medium opacity-50 uppercase tracking-tight">
            {item.product.brands || 'No Brand'}
          </p>
        </div>

        <div class="flex items-center gap-3">
          <div class="{gradeColors[item.product.nutriscore_grade]} w-10 h-10 flex items-center justify-center rounded-lg shadow-inner overflow-hidden">
            <span class="text-xl font-black text-white">{item.product.nutriscore_grade?.toUpperCase() || '?'}</span>
          </div>

          {#if toggleDelete}
            <button
              type="button"
              onclick={(e) => {
                  e.preventDefault(); // Prevents the <a> from navigating
                  e.stopPropagation(); // Prevents the click from bubbling to the <a>
                  history.remove(item.product.id);
              }}
              class="btn btn-ghost btn-circle btn-sm bg-error/10 text-error"
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

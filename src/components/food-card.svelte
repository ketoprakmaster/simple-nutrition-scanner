<script>
	import { gradeColors } from "$lib/helper.svelte";
	import { history } from "$lib/state.svelte";

	let {items, toggleDelete = false , messageEmpty = 'Nothing Here...'} = $props()
</script>


{#if items.length === 0}
<div class="card bg-base-200 dashed border-2 border-base-300 py-10 text-center">
  <p class="text-sm opacity-50 italic"> {messageEmpty} </p>
</div>
{:else}
<div class="grid gap-3">
  {#each items as item (item.code)}
  <a class="card card-side bg-base-200 min-h-[96px] shadow-sm border border-base-200 overflow-hidden" href="/history/{item.code}">
		<!-- image figure -->
    <figure class="w-20 bg-white">
      <img src={item.product.image_url} alt={item.product.product_name} class="object-cover" />
    </figure>

		<!-- item details -->
    <div class="card-body p-3 justify-between">
			<div>
        <h3 class="card-title text-sm line-clamp-1">{item.product.product_name}</h3>
        <p class="text-xs opacity-60">{item.product.brands}</p>
       </div>
    </div>

		<!-- nutriscore -->
    <div class="flex flex-row gap-5 p-5 justify-center items-center">
      <div class="{gradeColors[item.product.nutriscore_grade]} text-white w-15 h-15 text-3xl overflow-hidden rounded-lg font-bold shadow-lg flex items-center justify-center p-2">
        <span>{item.product.nutriscore_grade.toUpperCase()}</span>
      </div>

			{#if toggleDelete}
				<button
	        onclick={() => history.remove(item.code)}
	        class="btn btn-ghost btn-circle btn-sm text-error" aria-label="remove item"
	      >
	          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
	      </button>
			{/if}
    </div>
  </a>
  {/each}
</div>
{/if}

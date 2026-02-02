<script lang='ts'>
    import { gradeColors } from '$lib/helper.svelte';
    import { history } from '$lib/state.svelte';

    let searchTerm = $state("");

    let filteredHistory = $derived(
        history.items.filter(item =>
            item.product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.product.brands.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );
</script>

<div class=" mx-auto min-h-screen pb-24 p-5">
    <h1 class="text-2xl font-bold mb-6 ">Your History</h1>

    <div class="form-control mb-6 ">
        <label class="input input-bordered join-item w-full focus:input-primary">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-4 w-4 opacity-70"><path fill-rule="evenodd" d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" clip-rule="evenodd" /></svg>
            <input type="text" class="grow" placeholder="Search your scans..." bind:value={searchTerm} />
        </label>
    </div>

    {#if filteredHistory.length === 0}
      <div class="alert bg-base-200 border-none py-8 flex flex-col gap-2 py-20">
        <span class="text-base-content/50">Nothing Here...</span>
      </div>
      {:else}
	  <div class="grid gap-3">
			{#each filteredHistory as item (item.code)}
	    <a class="card card-side bg-base-100 min-h-[96px] shadow-sm border border-base-200 overflow-hidden" href="/history/{item.code}">
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
					<button
	          onclick={() => history.remove(item.code)}
	          class="btn btn-ghost btn-circle btn-sm text-error" aria-label="remove item"
	        >
	            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
	        </button>
	      </div>
	    </a>
			{/each}
	  </div>
      {/if}
</div>

<script lang='ts'>
  import { history } from '$lib/state.svelte';
  import { getProduct } from '$lib/api.svelte';
  import { gradeColors } from '$lib/helper.svelte';
  import Header from '$components/header.svelte';
  import BottomNav from '$components/bottom-nav.svelte';

  let barcodeInput = $state("");
</script>

<Header />

{#if history.error}
  <div class="alert alert-error mb-2 py-2 text-sm italic">{history.error}</div>
{/if}

<section class="form-control p-5">
  <div class="join w-full shadow-sm">
    <input
      bind:value={barcodeInput}
      placeholder="Enter barcode..."
      class="input input-bordered join-item w-full"
      onkeydown={(e) => e.key === 'Enter' && getProduct(barcodeInput)}
    />
    <button
      onclick={() => getProduct(barcodeInput)}
      class="btn btn-primary join-item"
      disabled={history.loading}
    >
      {#if history.loading}
        <span class="loading loading-spinner loading-xs"></span>
      {/if}
      Add
    </button>
  </div>
</section>


<section class="p-5">
  <h2 class="text-lg font-bold mb-4 flex items-center gap-2">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    Recent Scans
  </h2>

  {#if history.items.length === 0}
    <div class="alert bg-base-200 border-none py-8 flex flex-col gap-2 py-20">
      <span class="text-base-content/50">No scans yet. Try a barcode!</span>
    </div>
  {:else}
	  <div class="grid gap-3">
			{#each history.items.slice(0,5) as item (item.code)}
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
	      </div>
	    </a>
			{/each}
	  </div>
  {/if}
</section>

<BottomNav/>

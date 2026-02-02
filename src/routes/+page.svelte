<script lang='ts'>
  import { history } from '$lib/state.svelte';
  import { getProduct } from '$lib/api.svelte';
  import { gradeColors } from '$lib/helper.svelte';

  let barcodeInput = $state("");
</script>

<div class="navbar bg-base-100 shadow-md sticky top-0 z-20 p-5">
  <div class="flex-1 flex flex-col items-start">
    <a href="/" class="text-xl font-bold text-primary leading-none">EatWise</a>
    <span class="text-[10px] uppercase tracking-widest opacity-60">Nutrition Scanner</span>
  </div>
</div>

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
	      </div>
	    </a>
			{/each}
	  </div>
  {/if}
</section>


<nav class="fixed bottom-0 left-0 right-0 bg-base-100 border-t-2 border-base-300 z-50 pb-safe">
  <div class="grid grid-cols-3 h-16 items-center justify-items-center">

    <a href="/history" class="btn btn-ghost btn-sm flex flex-col gap-0 h-full w-full rounded-none normal-case font-medium" aria-label="go to history">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span class="text-[10px]">History</span>
    </a>

    <div class="relative">
      <a href="/scan" class="btn btn-primary btn-circle btn-lg absolute -top-12 left-1/2 -translate-x-1/2 shadow-lg border-4 border-base-100 h-16 w-16" aria-label="open camera">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </a>
    </div>

    <a class="btn btn-ghost btn-sm flex flex-col gap-0 h-full w-full rounded-none normal-case font-medium text-base-content/50" aria-label="go to settings" href="/">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      </svg>
      <span class="text-[10px]">Settings</span>
    </a>
  </div>
</nav>

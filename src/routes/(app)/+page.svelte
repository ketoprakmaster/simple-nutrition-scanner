<script lang='ts'>
  import { history } from '$lib/api/state.svelte';
  import { FoodApi } from '$lib/api/api.svelte';
  import { goto } from '$app/navigation';
  import FoodCard from '$components/product/FoodCardList.svelte';
  import { resolve } from '$app/paths';
  import { settings } from '$lib/global.svelte';

  let barcodeInput = $state("");

  // Derived stats to make the landing page feel more personal
  const stats = $derived({
    total: history.items.length,
    healthy: history.items.filter(i => ['a', 'b'].includes(i.product.nutriscore_grade)).length,
    recent: history.items.slice(0, 3)
  });
</script>

<header class="bg-linear-65 from-purple-500 to-blue-700 text-primary-content px-5 pt-8 pb-12 rounded-b-[3rem] shadow-lg">
  <h1 class="text-3xl font-black mb-2">{ settings.landingTitle }</h1>
  <p class="opacity-90 text-sm mb-6 font-medium">{ settings.landingSubtitle }</p>

  <div class="join w-full shadow-2xl overflow-hidden">
    <input
      bind:value={barcodeInput}
      placeholder="Type barcode..."
      class="input input-bordered join-item w-full text-base-content focus:outline-none"
      onkeydown={(e) => e.key === 'Enter' && FoodApi.getProduct(barcodeInput)}
    />
    <button
      onclick={() => FoodApi.getProduct(barcodeInput)}
      class="btn btn-secondary join-item px-6"
      disabled={FoodApi.loading}
    >
      {#if FoodApi.loading}
        <span class="loading loading-spinner loading-xs"></span>
      {:else}
        Check
      {/if}
    </button>
  </div>
</header>

<main class="p-5 -mt-8 pb-24 space-y-6">
  <div class="grid grid-cols-2 gap-4">
    <div class="stat bg-base-200 shadow-sm rounded-md border border-base-200 p-4">
      <div class="stat-title text-xs uppercase font-bold">Total Scans</div>
      <div class="stat-value text-2xl">{stats.total}</div>
    </div>
    <div class="stat bg-base-200 shadow-sm rounded-md border border-base-200 p-4">
      <div class="stat-title text-xs uppercase font-bold">Grade A/B</div>
      <div class="stat-value text-2xl text-success font-bold">{stats.healthy}</div>
    </div>
  </div>

  <section>
    <div class="flex justify-between items-end mb-4 px-1">
      <h2 class="text-lg font-bold">Latest Discoveries</h2>
      <button onclick={() => goto(resolve('/history'))} class="text-sm text-primary font-bold hover:underline cursor-pointer">
      <h3>View all</h3></button>
    </div>

    <FoodCard items={stats.recent}/>
  </section>
</main>

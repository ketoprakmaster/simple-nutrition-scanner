<script lang="ts">
    import { page } from '$app/state';
    import { history } from '$lib/state.svelte';
    import { getProduct } from '$lib/api.svelte';
    import { gradeColors } from '$lib/helper.svelte';

    // Reactive find: if history updates, item updates
    let item = $derived(history.getById(page.params.id));

    // Fallback: If user hits this URL directly and it's not in history, fetch it.
    $effect(() => {
        if (!item && !history.loading) {
            getProduct(page.params.id);
        }
    });
</script>

{#if item}

{:else if history.loading}
  <div class="flex justify-center p-20"><span class="loading loading-lg"></span></div>
{:else}
  <div class="p-10 text-center">Product not found.</div>
{/if}

<div class="max-w-md mx-auto min-h-screen bg-base-100 p-6 pb-24">
    <a href="/history" class="btn btn-ghost btn-sm gap-2 mb-6 px-0">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Back to History
    </a>

    <div class="card bg-white shadow-xl p-4 mb-6">
        <img src={item.product.image_url} alt={item.product.product_name} class="w-full h-56 object-contain" />
    </div>

    <h1 class="text-2xl font-black">{item.product.product_name}</h1>
    <p class="badge badge-outline opacity-70 mb-6">{item.product.brands}</p>

    <div class="stats shadow w-full bg-base-200 mb-8">
      <div class="stat">
        <div class="stat-title font-bold text-base-content">Nutri-Score</div>
        <div class="stat-actions">
           <img
              src="https://static.openfoodfacts.org/images/attributes/dist/nutriscore-{item.product.nutriscore_grade}.svg"
              alt="Nutri-Score"
              class="h-12"
          />
        </div>
      </div>
    </div>

    <h2 class="font-bold text-lg mb-4">Nutrition Facts (per 100g)</h2>
    <div class="overflow-x-auto">
      <table class="table table-zebra w-full shadow-sm rounded-box overflow-hidden">
        <tbody>
          {#each Object.entries(item.product.nutriments) as [key, value]}
              {#if key.includes('_100g') && typeof value === 'number'}
                  <tr>
                      <td class="capitalize opacity-70">{key.replace('_100g', '').replace('_', ' ')}</td>
                      <td class="font-bold text-right">{value.toFixed(1)}</td>
                  </tr>
              {/if}
          {/each}
        </tbody>
      </table>
    </div>
</div>

<script lang="ts">
    import { page } from '$app/state';
    import { history } from '$lib/state.svelte';
    import { getProduct } from '$lib/api.svelte';

    // 1. Create a reactive state for the item
    let item = $state<any>(null);
    let isNotFound = $state(false);

    // 2. Reactively fetch when the ID in the URL changes
    $effect(() => {
        const loadProduct = async () => {
            // Check cache/DB
            const data = await history.getById(page.params.id);

            if (data) {
                item = data;
            } else {
                // If not in DB, try to fetch it from API
                await getProduct(page.params.id);
                // Try getting it one more time after API call
                item = await history.getById(page.params.id);
                if (!item) isNotFound = true;
            }
        };

        loadProduct();
    });
</script>

<div class="max-w-md mx-auto min-h-screen bg-base-100 p-6 pb-24">
    <a href="/history" class="btn btn-ghost btn-sm gap-2 mb-6 px-0">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Back to History
    </a>

    {#if item}
    		<!-- product image -->
        <img src={item.product.image_url} alt={item.product.product_name} class="w-full h-full object-cover card mb-5" />

        <!-- product details -->
        <h1 class="text-2xl font-bold mb-2">{item.product.product_name}</h1>
        <p class="badge badge-outline opacity-70 mb-5">{item.product.brands}</p>

        <!-- product nutriscore -->
        <div class="stats shadow w-full bg-base-200 mb-5">
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

        <!-- product nutrition fact -->
        <h2 class="font-bold text-lg mb-5">Nutrition Facts (per 100g)</h2>
        <div class="overflow-x-auto">
          <table class="table table-zebra w-full shadow-sm rounded-box overflow-hidden">
            <tbody>
              {#each Object.entries(item.product.nutriments || {}) as [key, value]}
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

    {:else if isNotFound}
        <div class="alert alert-error">Product not found in history or registry.</div>
    {:else}
        <div class="flex flex-col items-center justify-center pt-20 gap-4">
            <span class="loading loading-ring loading-lg text-primary"></span>
            <p class="text-sm opacity-50">Fetching product details...</p>
        </div>
    {/if}
</div>

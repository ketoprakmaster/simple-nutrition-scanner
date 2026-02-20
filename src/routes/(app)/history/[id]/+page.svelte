<script lang="ts">
    import { page } from '$app/state';
    import { productStore } from '$lib/ui/product.svelte';
    import { ProductAnalysis } from '$lib/models/productAnalysis';
    import { goto } from '$app/navigation';
    import { resolve } from '$app/paths';
    import FoodSummary from '$components/product/FoodSummary.svelte';
    import FoodAnalysis from '$components/product/FoodAnalysis.svelte';
    import FoodDetails from '$components/product/FoodDetails.svelte';
    import FoodIngredient from '$components/product/FoodIngredient.svelte';
    $effect(() => {
        const id = page.params.id;
        if (id) productStore.ensure(id);
    });

    const item = $derived(productStore.current);
    // Single derived object containing everything we need
    const analysis = $derived(new ProductAnalysis(item));
</script>

<div class="mx-auto min-h-screen bg-base-300 pb-24">
    <!-- header with back button -->
    <a class="sticky top-0 z-10 bg-base-100/80 backdrop-blur-md px-4 py-2 flex items-center hover:bg-base-300/50" href="{resolve('/history')}">
        <div class="btn btn-ghost btn-circle btn-md" aria-label="go to history">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
        </div>
        <span class="ml-2 font-semibold truncate max-w-md">{item?.product.product_name || 'Product Detail'}</span>
    </a>

    {#if item}
		<FoodSummary {item} {analysis}/>

    <div class="p-4 space-y-4 max-w-lg mx-auto">
        <!-- Impact Summary -->
        <FoodAnalysis {analysis}/>

        <!-- Other Details -->
        <FoodDetails {item} {analysis}/>

        <!-- food ingredients -->
        <FoodIngredient {item}/>
    </div>

    {:else if productStore.loading}
        <div class="flex flex-col items-center justify-center pt-20 gap-4">
            <span class="loading loading-ring loading-lg text-primary"></span>
            <p class="text-sm opacity-50 font-medium">Analyzing product...</p>
        </div>
    {:else }
        <div class="p-10 text-center">
            <div class="bg-error/10 text-error p-6 rounded-3xl mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <p class="font-bold">Product not found</p>
            </div>
            <button onclick={() => goto(resolve('/history'))} class="btn btn-primary rounded-full px-8">Return to History</button>
        </div>
    {/if}
</div>

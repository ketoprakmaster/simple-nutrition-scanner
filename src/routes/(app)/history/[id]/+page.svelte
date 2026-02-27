<script lang="ts">
    import { page } from '$app/state';
    import { productStore } from '$lib/ui/product.svelte';
    import { ProductAnalysis } from '$lib/models/productAnalysis';
    import { goto } from '$app/navigation';
    import { resolve } from '$app/paths';

    // Components
    import FoodSummary from '$components/product/FoodSummary.svelte';
    import FoodAnalysis from '$components/product/FoodAnalysis.svelte';
    import FoodDetails from '$components/product/FoodDetails.svelte';
    import FoodIngredient from '$components/product/FoodIngredient.svelte';

    // Icons
    import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
    import CircleArrowLeft from '@lucide/svelte/icons/circle-arrow-left';

    $effect(() => {
        const id = page.params.id;
        if (id) productStore.ensure(id);
    });

    const item = $derived(productStore.current);
    const analysis = $derived(new ProductAnalysis(item));
</script>

<div class="mx-auto min-h-screen bg-base-300 pb-24">
    <!-- header with back button -->
    <a class="sticky top-0 z-10 bg-base-100/80 backdrop-blur-md px-4 py-2 flex items-center hover:bg-base-300/50" href="{resolve('/history')}">
        <div class="btn btn-ghost btn-circle btn-md" aria-label="go to history">
            <CircleArrowLeft/>
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
            <div class="bg-error/10 text-error p-6 rounded-xl mb-4">
                <TriangleAlert class="h-12 w-12 mx-auto mb-2"/>
                <p class="font-bold">Product not found</p>
            </div>
            <button onclick={() => goto(resolve('/history'))} class="btn btn-primary rounded-full px-8">Return to History</button>
        </div>
    {/if}
</div>

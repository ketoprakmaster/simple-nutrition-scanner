<script lang="ts">
    import { page } from '$app/state';
    import { productStore } from '$lib/ui/product.svelte';
    import { goto } from '$app/navigation';
    import { resolve } from '$app/paths';
    import { labelIcons } from '$lib/utils/helpers/labels';
    import {
        gradeColors,
        gradeBgColors,
        getScoreLabel,
        getScoreValue,
        getNutrientLevelLabel,
        getNutrientLevelBg,
    } from '$lib/utils/helpers/product';

    $effect(() => {
        const id = page.params.id;
        if (id) productStore.ensure(id);
    });

    const item = $derived(productStore.current);

    const scoreLabel = $derived(getScoreLabel(item?.product.nutriscore_grade));
    const scoreValue = $derived(getScoreValue(item?.product.nutriscore_grade));
    const gradeColor = $derived(gradeColors[item?.product.nutriscore_grade as keyof typeof gradeColors] || gradeColors.unknown);
    const gradeBgColor = $derived(gradeBgColors[item?.product.nutriscore_grade as keyof typeof gradeBgColors] || gradeBgColors.unknown);

    const nutrientLevels = $derived(item?.product.nutrient_levels || {});

    const points = $derived([
        {
            label: 'Sugar',
            level: nutrientLevels.sugars,
            value: item?.product.nutriments?.sugars_100g,
            unit: 'g',
            icon: '🍭'
        },
        {
            label: 'Salt',
            level: nutrientLevels.salt,
            value: item?.product.nutriments?.salt_100g,
            unit: 'g',
            icon: '🧂'
        },
        {
            label: 'Saturated Fat',
            level: nutrientLevels['saturated-fat'],
            value: item?.product.nutriments?.['saturated-fat_100g'],
            unit: 'g',
            icon: '🥓'
        },
        {
            label: 'Fat',
            level: nutrientLevels.fat,
            value: item?.product.nutriments?.fat_100g,
            unit: 'g',
            icon: '🛢️'
        }
    ]);

</script>

<div class="mx-auto min-h-screen bg-base-200 pb-24">
    <!-- header with back button -->
    <div class="sticky top-0 z-10 bg-base-100/80 backdrop-blur-md px-4 py-2 flex items-center">
        <button onclick={() => goto(resolve('/history'))} class="btn btn-ghost btn-circle btn-sm" aria-label="go to history">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <span class="ml-2 font-semibold truncate max-w-md">{item?.product.product_name || 'Product Detail'}</span>
    </div>

    {#if item}
        <!-- product image section -->
        <div class="bg-base-100 p-5 pb-12 rounded-b-3xl shadow-sm relative overflow-hidden">
            <div class="flex flex-col items-center max-w-md mx-auto">
                <div class="relative w-48 h-48 mb-6 group">
                   {#if item.product.image_url}
                    <img
                        src={item.product.image_url}
                        alt={item.product.product_name}
                        class="w-full h-full object-contain rounded-2xl bg-white shadow-lg transition-transform duration-300 group-hover:scale-105"
                        crossorigin="anonymous"
                    />
                    {:else}
                    <div class="w-full h-full rounded-2xl bg-base-300 flex items-center justify-center text-4xl">
                        🛒
                    </div>
                    {/if}
                </div>

                <h1 class="text-2xl font-bold text-center px-4 leading-tight mb-1">{item.product.product_name}</h1>
                <p class="text-base-content/60 text-center mb-4">{item.product.brands || 'Unknown Brand'}</p>

                <!-- food labels -->
                {#if item.product.labels_tags && item.product.labels_tags.length > 0}
                <div class="flex flex-wrap justify-center gap-2 mb-6">
                    {#each item.product.labels_tags.slice(0, 5) as label}
                        <div class="badge  bg-base-300 text-xs font-bold py-3">
                            <span class="mr-1">{labelIcons[label] || '🏷️'}</span>
                            {label.replace('en:', '').replace(/-/g, ' ')}
                        </div>
                    {/each}
                </div>
                {/if}

                <!-- score circle -->
                <div class="flex flex-col items-center gap-2">
                    <div class="flex items-center gap-4">
                        <div class="radial-progress border-8 border-base-200 {gradeColor}" style="--value:{scoreValue}; --size:6rem; --thickness: 0.5rem;" role="progressbar">
                            <span class="text-4xl font-black text-base-content">{scoreValue}</span>
                        </div>
                        <div class="flex flex-col">
                            <span class="text-2xl font-bold {gradeColor}">{scoreLabel}</span>
                            <span class="text-md opacity-50 uppercase tracking-widest font-bold">Nutri-Score {item.product.nutriscore_grade?.toUpperCase()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="p-4 space-y-4">
            <!-- Impact Summary -->
            <div class="bg-base-100 rounded-3xl p-5 shadow-sm">
                <h3 class="font-bold mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Analysis (per 100g)
                </h3>

                <div class="space-y-4">
                    {#each points as point}
                        {#if point.level}
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-full bg-base-200 flex items-center justify-center text-xl">
                                    {point.icon}
                                </div>
                                <div>
                                    <div class="font-medium">{point.label}</div>
                                    <div class="text-xs opacity-60">
                                        {parseInt(point.value?).toFixed(1) || 0}{point.unit}
                                    </div>
                                </div>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="text-sm font-semibold capitalize">{getNutrientLevelLabel(point.level)}</span>
                                <div class="w-3 h-3 rounded-full {getNutrientLevelBg(point.level)}"></div>
                            </div>
                        </div>
                        {/if}
                    {/each}
                </div>
            </div>

            <!-- Other Details -->
            <div class="bg-base-100 rounded-3xl p-5 shadow-sm">
                <h3 class="font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider opacity-60">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Composition
                </h3>

                <div class="space-y-4">
                    {#if item.product.nova_group}
                    <div class="flex items-center justify-between text-sm">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center text-sm font-bold text-yellow-700">
                                {item.product.nova_group}
                            </div>
                            <span class="font-medium">Processing (NOVA)</span>
                        </div>
                        <div class="text-xs opacity-50 max-w-37.5 text-right">
                            {item.product.nova_group === 1 ? 'Unprocessed or minimally processed' :
                             item.product.nova_group === 2 ? 'Processed culinary ingredients' :
                             item.product.nova_group === 3 ? 'Processed foods' : 'Ultra-processed food'}
                        </div>
                    </div>
                    {/if}

                    {#if item.product.ecoscore_grade}
                    <div class="flex items-center justify-between text-sm">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-sm font-bold text-green-700 uppercase">
                                {item.product.ecoscore_grade.toLowerCase() === 'unknown' ? "?" : item.product.ecoscore_grade}
                            </div>
                            <span class="font-medium">Eco-Score</span>
                        </div>
                        <span class="text-xs opacity-50 uppercase">{item.product.ecoscore_grade === 'a' ? 'Very low impact' : 'Environmental impact'}</span>
                    </div>
                    {/if}

                    <div class="divider my-1"></div>

                    <div class="text-sm">
                        {#if item.product.additives_tags && item.product.additives_tags.length > 0}
                            <div class="flex items-center justify-between mb-3">
                                <div class="flex items-center gap-3">
                                    <div class="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-sm font-bold text-red-700">
                                        !
                                    </div>
                                    <span class="font-medium">Additives ({item.product.additives_tags.length})</span>
                                </div>
                            </div>
                            <div class="flex flex-wrap gap-2">
                                {#each item.product.additives_tags as additive}
                                    <span class="badge badge-sm border-none bg-base-200 text-[10px] font-bold py-3 uppercase">{additive.replace('en:', '')}</span>
                                {/each}
                            </div>
                        {:else}
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-3">
                                    <div class="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-700">
                                        ✓
                                    </div>
                                    <span class="font-medium">No additives found</span>
                                </div>
                            </div>
                        {/if}
                    </div>
                </div>
            </div>

            {#if item.product.ingredients_text}
            <div class="bg-base-100 rounded-3xl p-5 shadow-sm">
                <h3 class="font-bold mb-2">Ingredients</h3>
                <p class="text-sm opacity-70 leading-relaxed italic">
                    {item.product.ingredients_text}
                </p>
            </div>
            {/if}
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

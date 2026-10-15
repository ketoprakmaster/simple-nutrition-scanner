<script lang="ts">
    import type { ProductAnalysis, ScoreReason } from "$lib/models/productAnalysis";
    import type { AdditiveRisk } from "$lib/services/additiveService";
    import CircleCheck from "@lucide/svelte/icons/circle-check";
    import FlaskConical from "@lucide/svelte/icons/flask-conical";

    let { analysis }: { analysis: ProductAnalysis } = $props();

    const riskStyles: Record<AdditiveRisk, string> = {
        0: "bg-base-200 text-base-content/70",
        1: "bg-yellow-100 text-yellow-800",
        2: "bg-orange-100 text-orange-800",
        3: "bg-red-100 text-red-700"
    };

    const isPenalty = (reason: ScoreReason) => reason.points < 0;
</script>

<!-- score breakdown: makes the rating explainable instead of a black box -->
<div class="bg-base-100 rounded-3xl p-5 shadow-sm">
    <h3 class="font-bold mb-4">Why this score?</h3>

    <ul class="space-y-2">
        {#each analysis.scoreReasons as reason (reason.id)}
            <li class="flex items-center justify-between text-sm">
                <span class="opacity-70">{reason.label}</span>
                <span class="font-bold {isPenalty(reason) ? 'text-error' : 'text-success'}">
                    {isPenalty(reason) ? '' : '+'}{reason.points}
                </span>
            </li>
        {/each}
    </ul>
</div>

{#if analysis.additives.length}
    <div class="bg-base-100 rounded-3xl p-5 shadow-sm">
        <h3 class="font-bold mb-4 flex items-center gap-2">
            <FlaskConical class="text-primary" />
            Additives ({analysis.additives.length})
        </h3>

        <div class="flex flex-wrap gap-2">
            {#each analysis.additives as additive (additive.tag)}
                <span
                    class="badge badge-sm border-0 py-3 text-[10px] font-bold uppercase {riskStyles[additive.risk]}"
                    title={additive.tag}
                >
                    {additive.name}
                </span>
            {/each}
        </div>
    </div>
{/if}

{#if analysis.nutrients.length}
    <div class="bg-base-100 rounded-3xl p-5 shadow-sm">
        <h3 class="font-bold mb-4 flex items-center gap-2">
            <CircleCheck class="text-primary" />
            Analysis (per 100g)
        </h3>

        <div class="grid grid-cols-2 gap-3">
            {#each analysis.nutrients as point (point.id)}
                <div class="bg-base-200 rounded-2xl p-3 grid grid-cols-2 items-center text-center">
                    <div class="flex flex-col">
                        <span class="text-2xl mb-1">{point.icon}</span>
                        <span class="text-xs opacity-60 uppercase font-bold tracking-tighter">{point.label}</span>
                    </div>
                    <div class="flex flex-col items-center">
                        <div class="flex flex-row gap-2">
                            <span class="font-black uppercase">{point.value} {point.unit}</span>
                            <div class="rounded-full w-2 h-2 my-auto {point.color}"></div>
                        </div>
                        <span class="text-xs uppercase opacity-75">{point.level}</span>
                    </div>
                </div>
            {/each}
        </div>
    </div>
{/if}

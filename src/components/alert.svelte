<script lang="ts">
    import { ui } from '$lib/ui/alert.svelte';
    import { fly } from 'svelte/transition';
    import { flip } from 'svelte/animate';
    import { Ban, TriangleAlert, Info, Check, CircleX, type Icon as IconType } from '@lucide/svelte'

    const icons: Record<string, typeof IconType> = {
        success: Check,
        error: Ban,
        warning: TriangleAlert,
        info: Info
    };

    const themes = {
        success: 'alert-success border-success/20 shadow-success/10',
        error: 'alert-error border-error/20 shadow-error/10',
        warning: 'alert-warning border-warning/20 shadow-warning/10',
        info: 'alert-info border-info/20 shadow-info/10'
    };
</script>

<div class="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 space-y-2 pointer-events-none">
    {#each ui.items as alert (alert.id)}
    {@const Icons = icons[alert.type]}
        <div
            animate:flip={{ duration: 300 }}
            in:fly={{ y: -20, opacity: 0 }}
            out:fly={{ x: 100, opacity: 0 }}
            class="alert shadow-2xl border backdrop-blur-md pointer-events-auto {themes[alert.type]}"
        >
            <Icons/>
            <span class="text-sm font-bold tracking-tight">{alert.message}</span>
            <button
                class="ml-auto opacity-60 hover:opacity-100"
                on:click={() => ui.dismiss(alert.id)}
            >
                <CircleX/>
            </button>
        </div>
    {/each}
</div>

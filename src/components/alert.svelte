<script lang="ts">
    import { ui } from '$lib/global.svelte';
    import { fly } from 'svelte/transition';
    import { flip } from 'svelte/animate';

    const icons = {
        success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
        error: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
        warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
        info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    };

    const themes = {
        success: 'alert-success border-success/20 shadow-success/10',
        error: 'alert-error border-error/20 shadow-error/10',
        warning: 'alert-warning border-warning/20 shadow-warning/10',
        info: 'alert-info border-info/20 shadow-info/10'
    };
</script>

<div class="fixed top-4 left-1/2 -translate-x-1/2 z-20 w-full max-w-sm px-4 space-y-2 pointer-events-none">
    {#each ui.items as alert (alert.id)}
        <div
            animate:flip={{ duration: 300 }}
            in:fly={{ y: -20, opacity: 0 }}
            out:fly={{ x: 100, opacity: 0 }}
            class="alert shadow-2xl border backdrop-blur-md pointer-events-auto {themes[alert.type]}"
        >
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={icons[alert.type]} />
            </svg>
            <span class="text-sm font-bold tracking-tight">{alert.message}</span>
        </div>
    {/each}
</div>

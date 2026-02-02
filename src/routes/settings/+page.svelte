<script lang="ts">
    import { history } from '$lib/state.svelte';
    import { goto } from '$app/navigation';

    let showConfirm = $state(false);

    async function handleClearAll() {
        await history.clearAll();
        showConfirm = false;
        // Optional: show a toast or redirect
    }
</script>

<div class="navbar bg-base-100 shadow-md sticky top-0 z-20 p-5">
    <div class="flex-1 flex flex-col items-start">
        <a href="/" class="text-xl font-bold text-primary leading-none">EatWise</a>
        <span class="text-[10px] uppercase tracking-widest opacity-60">Settings</span>
    </div>
</div>

<main class="p-5 pb-24 max-w-md mx-auto">
    <section class="mb-8">
        <h2 class="text-sm font-semibold uppercase tracking-wider opacity-50 mb-4">Data Management</h2>

        <div class="bg-base-200 rounded-box overflow-hidden border border-base-300">
            <button
                onclick={() => showConfirm = true}
                class="flex items-center justify-between w-full p-4 hover:bg-base-300 transition-colors text-error"
            >
                <div class="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span class="font-medium">Clear Scan History</span>
                </div>
                <span class="text-xs opacity-50">{history.items.length} items</span>
            </button>
        </div>
    </section>

    <section class="mb-8">
        <h2 class="text-sm font-semibold uppercase tracking-wider opacity-50 mb-4">About</h2>
        <div class="bg-base-200 rounded-box p-4 border border-base-300 space-y-3">
            <div class="flex justify-between text-sm">
                <span class="opacity-70">Version</span>
                <span class="font-mono">1.0.0-pwa</span>
            </div>
            <div class="flex justify-between text-sm">
                <span class="opacity-70">Database</span>
                <span class="font-mono text-success">IndexedDB (Active)</span>
            </div>
            <div class="divider my-1"></div>
            <p class="text-xs opacity-50 leading-relaxed">
                EatWise uses the Open Food Facts API to provide nutritional information. Data is stored locally on your device.
            </p>
        </div>
    </section>
</main>

{#if showConfirm}
    <div class="modal modal-open modal-bottom sm:modal-middle">
        <div class="modal-box">
            <h3 class="font-bold text-lg text-error">Delete all history?</h3>
            <p class="py-4">This action cannot be undone. All your scanned products will be removed from local storage.</p>
            <div class="modal-action">
                <button class="btn btn-ghost" onclick={() => showConfirm = false}>Cancel</button>
                <button class="btn btn-error" onclick={handleClearAll}>Yes, Delete All</button>
            </div>
        </div>
        <button class="modal-backdrop" onclick={() => showConfirm = false}>close</button>
    </div>
{/if}

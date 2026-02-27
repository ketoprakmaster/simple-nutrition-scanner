<script lang="ts">
    import { productStore } from '$lib/ui/product.svelte';
    import { settings} from '$lib/core/settings.svelte';
    import { APP_ID , APP_NAME, APP_VERSION, DEV_CONTACT } from '$lib/core/appInfo';
    import { copyToClip } from '$lib/utils/helpers/clipboard';
    import { logger } from '$lib/ui/logger.svelte';
    import { Trash2 } from '@lucide/svelte';

    let showConfirm = $state(false);
    let showConsole = $state(false)

    async function handleClearAll() {
        await productStore.clear();
        showConfirm = false;
        // Optional: show a toast or redirect
    }
</script>

<main class="p-5 pb-24 max-w-md mx-auto">
    <section class="mb-8">
        <h2 class="text-sm font-semibold uppercase tracking-wider opacity-50 mb-4">Data Management</h2>

        <div class="bg-base-200 rounded-box overflow-hidden border border-base-300">
            <button
                onclick={() => showConfirm = true}
                class="flex items-center justify-between w-full p-4 hover:bg-base-300 transition-colors text-error cursor-pointer"
            >
                <div class="flex items-center gap-3">
                    <Trash2/>
                    <span class="font-medium">Clear Scan History</span>
                </div>
                <span class="text-xs opacity-50">{productStore.items.length} items</span>
            </button>
        </div>
    </section>

    <section class="mb-8">
        <h2 class="text-sm font-semibold uppercase tracking-wider opacity-50 mb-4">Scoring Methodology</h2>
        <div class="bg-base-200 rounded-box border border-base-300 p-5">
            <p class="text-xs opacity-60 mb-4 leading-relaxed">
                Choose how products are rated. <b>Nutri-Score</b> is the government standard, while <b>App Analysis</b> factors in additives and organic status.
            </p>

            <div class="join w-full">
                <button
                    class="join-item btn btn-sm flex-1 {settings.useCustomScore === 'nutriscore' ? 'btn-accent' : ''}"
                    onclick={() => settings.useCustomScore = 'nutriscore'}
                >
                    Nutri-Score
                </button>
                <button
                    class="join-item btn btn-sm flex-1 {settings.useCustomScore === 'appscore' ? 'btn-accent' : ''}"
                    onclick={() => settings.useCustomScore = 'appscore'}
                >
                    App Analysis
                </button>
            </div>

            {#if settings.useCustomScore === 'appscore'}
                <div class="mt-4 p-3 bg-base-300/50 rounded-lg border border-white/5">
                    <ul class="text-[11px] space-y-1 opacity-70">
                        <li class="flex items-center gap-2">✓ Nutri-Score (60%)</li>
                        <li class="flex items-center gap-2">✓ Additive Risk (30%)</li>
                        <li class="flex items-center gap-2">✓ Organic Status (10%)</li>
                    </ul>
                </div>
            {/if}
        </div>
    </section>

    <section class='mb-8 '>
      <h2 class="text-sm font-semibold uppercase tracking-wider opacity-50 mb-4">Personalization</h2>

      <div class="bg-base-200 rounded-box border border-base-300 p-5">

	      <div class="form-control w-full">
	        <label class="label pt-0" for="app-name">
	          <span class="label-text font-medium mb-2">App Display Name</span>
	        </label>
	        <input
	          id="app-name"
	          type="text"
	          placeholder="e.g. Leeka"
	          class="input input-bordered w-full"
	          bind:value={settings.appName}
	        />
	      </div>

				<div class="divider"></div>

        <div class="space-y-2">
        	<label class="label pt-0" for="landing-page">
	          <span class="label-text font-medium mb-2">Landing Page Content</span>
	        </label>

          <label class="input input-sm flex items-center gap-2 h-11 w-full">
            <span class="text-xs font-bold opacity-50 w-12 text-success">Title</span>
            <input type="text" class="grow font-medium" bind:value={settings.landingTitle} placeholder="Hello!" />
          </label>

          <label class="input input-sm flex items-center gap-2 h-11 w-full">
            <span class="text-xs font-bold opacity-50 w-12 text-success">Text</span>
            <input type="text" class="grow font-medium" bind:value={settings.landingSubtitle} placeholder="Ready to scan?" />
          </label>
        </div>
      </div>
    </section>

    <section class="mb-8">
      <h2 class="text-sm font-semibold uppercase tracking-wider opacity-50 mb-4">Log Console</h2>
      <div class="bg-base-200 rounded-box border border-base-300 overflow-hidden">
	     	<label class="label text-sm p-5 justify-between flex border-b-2 border-accent">
          <span>Show Console</span>
          <input type="checkbox" class="toggle toggle-accent" bind:checked={showConsole}/>
        </label>

        <!-- show console if toggled -->
        {#if showConsole}
	        <div class="h-48 overflow-y-auto p-3 font-mono text-[10px] bg-black text-green-400">
	          {#each logger.logs as log}
	              <div class="border-b border-white/10 py-1">{log}</div>
	          {/each}
	          {#if logger.logs.length === 0}
	              <span class="opacity-30">No logs yet...</span>
	          {/if}
	        </div>
        {/if}

        <div class="flex divide-x divide-base-300">
          <button
            onclick={() => logger.copyToClipboard()}
            class="flex-1 p-3 py-5 cursor-pointer text-xs font-bold hover:bg-base-300 transition-colors">
            COPY TO CLIPBOARD
          </button>
          <button
            onclick={() => logger.clear()}
            class="flex-1 p-3 py-5 cursor-pointer text-xs font-bold text-error hover:bg-base-300 transition-colors">
            CLEAR
          </button>
        </div>
      </div>
    </section>

    <section class="mb-8">
        <h2 class="text-sm font-semibold uppercase tracking-wider opacity-50 mb-4">About</h2>
        <div class="bg-base-200 rounded-box p-5 border border-base-300 space-y-3">
            <div class="flex justify-between text-sm">
                <span class="opacity-70">Version</span>
                <span class="font-mono">{ APP_VERSION }</span>
            </div>
            <div class="flex justify-between text-sm">
                <span class="opacity-70">Database</span>
                <span class="font-mono text-success">IndexedDB (Active)</span>
            </div>
            <div class="flex justify-between text-sm">
                <span class="opacity-70 flex-none">App ID</span>
                <button class="text-xs btn btn-xs btn-accent font-mono font-light opacity-70" onclick={() => copyToClip(APP_ID)}>click to copy</button>
            </div>
            <div class="divider"></div>
            <p class="text-xs opacity-50 leading-relaxed">
                { settings.appName } <i>({ APP_NAME })</i> uses the Open Food Facts API to provide nutritional information. Data is stored locally on your device.
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

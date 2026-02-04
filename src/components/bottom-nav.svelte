<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { checkActive } from '$lib/helper.svelte';

  const navItems = [
    { label: 'History', path: '/history', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Scan', path: '/scan', isCenter: true },
    { label: 'Settings', path: '/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }
  ];

  // Derived index for the sliding logic
  const activeIndex = $derived(navItems.findIndex(item => checkActive(item.path)));
</script>

<nav class="fixed bottom-0 left-0 right-0 bg-base-200/80 backdrop-blur-xl border-t-2 border-base-300 z-50 pb-safe">
  <div class="grid grid-cols-3 h-16 items-center relative">

    {#if activeIndex !== -1 && !navItems[activeIndex].isCenter}
      <div
        class="absolute bottom-0 h-1 bg-primary transition-all duration-300 ease-out rounded-t-full"
        style="width: 33.33%; left: {activeIndex * 33.33}%;"
      >
        <div class="mx-auto w-12 h-full bg-primary shadow-[0_0_12px_rgba(var(--p),0.5)]"></div>
      </div>
    {/if}

    {#each navItems as item}
      {#if item.isCenter}
        <div class="relative flex justify-center h-full">
          <button
            onclick={() => goto(resolve(item.path))}
            class="btn btn-primary btn-circle btn-xl -top-2 absolute shadow-lg border-4 border-base-200 hover:scale-110 active:scale-95 transition-all"
            aria-label="open camera"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      {:else}
        <button
          onclick={() => goto(resolve(item.path))}
          class="btn btn-ghost h-full rounded-none flex flex-col gap-1 no-animation {checkActive(item.path) ? 'text-primary' : 'text-base-content/40'}"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 transition-transform duration-300 {checkActive(item.path) ? 'scale-110' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={item.icon} />
          </svg>
          <span class="text-[10px] font-bold tracking-tight">{item.label}</span>
        </button>
      {/if}
    {/each}
  </div>
</nav>

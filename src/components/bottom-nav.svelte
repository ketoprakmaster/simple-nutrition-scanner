<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { checkActive } from '$lib/utils/helpers/navigation';
  import { Camera, History, Settings, type Icon as IconType } from '@lucide/svelte';

  type NavItems = {
      label: string,
      path: "/settings" | "/history/[code]" | string,
      isCenter?: boolean
      icon?: typeof IconType
  }

  const navItems : NavItems[] = [
    { label: 'History', path: '/history', icon: History },
    { label: 'Scan', path: '/scan', isCenter: true },
    { label: 'Settings', path: '/settings', icon: Settings  }
  ] as const;

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
            onclick={() => goto(resolve("/scan"))}
            class="btn btn-primary btn-circle btn-xl -top-2 absolute shadow-lg border-4 border-base-200 hover:scale-110 active:scale-95 transition-all"
            aria-label="open camera"
          >
          	<Camera/>
          </button>
        </div>
      {:else}
      {@const Icon = item.icon}
        <button
          onclick={() => goto(resolve(item.path))}
          class="btn btn-ghost h-full rounded-none flex flex-col gap-1 no-animation {checkActive(item.path) ? 'text-primary' : 'text-base-content/60'}"
        >
        	<Icon/>
          <span class="text-[10px] font-bold tracking-tight">{item.label}</span>
        </button>
      {/if}
    {/each}
  </div>
</nav>

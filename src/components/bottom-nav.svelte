<script lang="ts">
    import {goto} from '$app/navigation'
    import { resolve } from '$app/paths';
</script>


<nav class="fixed bottom-0 left-0 right-0 bg-base-100 border-t-2 border-base-300 z-50 pb-safe bg-base-200">
  <div class="grid grid-cols-3 h-16 items-center justify-items-center">

    <button onclick={() => goto(resolve('/history'))} class="btn btn-ghost btn-sm flex flex-col gap-0 h-full w-full rounded-none normal-case font-medium" aria-label="go to history">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span class="text-[10px]">History</span>
    </button>

    <div class="relative">
      <button onclick={() => goto(resolve('/scan'))} class="btn btn-primary btn-circle btn-lg absolute -top-12 left-1/2 -translate-x-1/2 shadow-lg border-4 border-base-100 h-16 w-16" aria-label="open camera">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
    </div>

    <button class="btn btn-ghost btn-sm flex flex-col gap-0 h-full w-full rounded-none normal-case font-medium text-base-content/50" aria-label="go to settings" onclick={() => goto(resolve('/settings'))}>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      </svg>
      <span class="text-[10px]">Settings</span>
    </button>
  </div>
</nav>

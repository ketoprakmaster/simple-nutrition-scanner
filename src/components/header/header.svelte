<script lang="ts">
    import { goto } from '$app/navigation';
    import { resolve } from '$app/paths';
    import { settings } from '$lib/global.svelte';
    import ButtonPWA from '$components/header/ButtonPWA.svelte';
    import ButtonTheme from '$components/header/ButtonTheme.svelte';
</script>

<div class="navbar bg-base-200 shadow-md fixed z-20 px-5 py-4 justify-between border-b-2 border-base-300">
	<button class="flex-1 flex flex-col items-start cursor-pointer" onclick={() => goto(resolve('/'))}>
		<span class="text-xl font-bold text-primary leading-none">{settings.appName}</span>
		<span class="text-[10px] uppercase tracking-widest opacity-60">Simple Nutrition Scanner</span>
	</button>

	<div class="flex items-center gap-5">
		<ButtonPWA/>
		<ButtonTheme/>
	</div>
</div>

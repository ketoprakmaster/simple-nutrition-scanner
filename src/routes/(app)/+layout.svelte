<script lang="ts">
	import Header from '$components/header/header.svelte';
	import BottomNav from '$components/bottom-nav.svelte';
	import Alert from '$components/alert.svelte'
	import { page } from '$app/state';
	import { fly } from 'svelte/transition';

	const { children } = $props();
</script>

<div class="flex flex-col h-dvh overflow-hidden">
    <Header />

    <Alert />

    <div class="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
        {#key page.url.pathname}
            <main
                in:fly={{ x: 200, duration: 100, delay: 300 }}
                out:fly={{ x: -200, duration: 100 }}
            >
                {@render children()}
            </main>
        {/key}
    </div>

    <BottomNav />
</div>

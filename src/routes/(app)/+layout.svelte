<script lang="ts">
	import Header from '$components/header/header.svelte';
	import BottomNav from '$components/bottom-nav.svelte';
	import Alert from '$components/alert.svelte'
	import { page } from '$app/state';
	import { fly } from 'svelte/transition';

	const { children } = $props();
</script>

<Header />

<Alert/>

<div class="page-container">
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

<style>
	.page-container {
		display: grid;
		grid-template-columns: 1fr;
		/* Use overflow-x-hidden to prevent scrollbars during the slide */
		overflow-x: hidden;
		position: relative;
		width: 100%;
	}

	main {
		/* This forces both 'in' and 'out' pages to occupy the exact same grid cell */
		grid-column: 1;
		grid-row: 1;
		width: 100%;
		min-height: calc(100dvh - 80px - 64px); /* Account for Header + Nav height */
	}
</style>

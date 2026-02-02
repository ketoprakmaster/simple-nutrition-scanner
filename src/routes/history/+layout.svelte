<script lang="ts">
  import Header from '$components/header.svelte';
  import BottomNav from '$components/bottom-nav.svelte';

	const { children } = $props();
</script>

<Header/>

{@render children()}

<BottomNav/>

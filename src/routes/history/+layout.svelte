<script lang="ts">
	const { children } = $props()
</script>

<div class="navbar bg-base-100 shadow-md sticky top-0 z-20 p-5">
  <div class="flex-1 flex flex-col items-start">
    <a href="/" class="text-xl font-bold text-primary leading-none">EatWise</a>
    <span class="text-[10px] uppercase tracking-widest opacity-60">Nutrition Scanner</span>
  </div>
</div>

{@render children()}

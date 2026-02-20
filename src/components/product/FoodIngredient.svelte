<script lang="ts">
    import type { Product } from "$lib/types/product";

    let { item } : { item : Product} = $props()
</script>



{#if item.product.ingredients_text_en}
  <div class="bg-base-100 rounded-3xl p-5 shadow-sm">
      <h3 class="font-bold mb-2">Ingredients</h3>
      <p class="text-sm opacity-70 leading-relaxed italic">
          {item.product.ingredients_text_en}
      </p>
  </div>
{:else if item.product.ingredients_text}
  <div class="bg-base-100 rounded-3xl p-5 shadow-sm">
      <h3 class="font-bold mb-2">Ingredients  <i class="font-light">(Non-English)</i></h3>
      <p class="text-sm opacity-70 leading-relaxed italic">
          {item.product.ingredients_text}
      </p>
  </div>

{/if}

<script lang='ts'>
    import FoodCard from '$components/product/FoodCardList.svelte';
    import { productStore } from '$lib/ui/product.svelte';

    let searchTerm = $state("");

    let filteredHistory = $derived(
        productStore.items.filter(item =>
            item.product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.product.brands.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );
</script>

<div class=" mx-auto min-h-screen pb-24 p-5">
    <h1 class="text-2xl font-bold mb-6 ">Your History</h1>

    <div class="form-control mb-6 ">
        <label class="input input-bordered join-item w-full focus:input-primary">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-4 w-4 opacity-70"><path fill-rule="evenodd" d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" clip-rule="evenodd" /></svg>
            <input type="text" class="grow" placeholder="Search your scans..." bind:value={searchTerm} />
        </label>
    </div>

  <FoodCard items={filteredHistory} toggleDelete={true}/>
</div>

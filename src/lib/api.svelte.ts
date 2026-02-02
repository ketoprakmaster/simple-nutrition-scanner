import { goto } from "$app/navigation";
import { history } from "./state.svelte";

export async function getProduct(code: string | number) {
    const stringCode = String(code);

    // 1. Check Cache
    const cached = history.getById(stringCode);
    if (cached) {
        return goto(`/history/${stringCode}`);
    }

    // 2. Fetch New
    history.loading = true;
    history.error = null;

    try {
        const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${stringCode}`);
        if (!res.ok) throw new Error("Network response was not ok");

        const data = await res.json();

        if (data.status === 1) {
            history.add(data);
            goto(`/history/${stringCode}`);
        } else {
            history.error = "Product not found!";
        }

    } catch (err) {
        history.error = err instanceof Error ? err.message : "An error occurred";
        console.error(err);

    } finally {
        history.loading = false;
    }
}

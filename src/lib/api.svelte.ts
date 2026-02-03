import { ui } from "$lib/global.svelte.ts"
import { goto } from "$app/navigation";
import { resolve } from "$app/paths";
import { history } from "./state.svelte";

export async function getProduct(code: string | number) {
    const stringCode = String(code);

    // Check IndexedDB
    const cached = await history.getById(stringCode);
    if (cached) {
        ui.show("Loaded from cache", "info")
        return goto(resolve(`/history/${stringCode}`));
    }

    history.loading = true;
    history.error = null;

    try {
        console.log(`fetching (${stringCode})`)
        const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${stringCode}`);
        if (!res.ok) throw new Error("Network response was not ok");

        const data = await res.json();
        if (data.status === 1) {
            ui.show("Product found!", "success");
            await history.add(data); // Saves to IndexedDB
            goto(resolve(`/history/${stringCode}`));
        } else {
            ui.show("Product not found", "warning");
        }
    } catch (err) {
        ui.show(`Error: ${err}`, "error");
    } finally {
        history.loading = false;
    }
}
